import {validateRaster} from '@wieslawsoltes/counterform-tracing';
const aborted = message => Object.assign(new Error(message || 'Compiler task cancelled'), {name:'AbortError'});

/** One reusable worker, bounded queue, transfer results, hard cancellation, deterministic ownership. */
export class CompilerClient {
    constructor({workerURL = new URL('./worker.js', import.meta.url), workerFactory = null, inline = false,
        maxQueue = 16, timeout = 60000, onProgress = () => {}} = {}) {
        if (!Number.isInteger(maxQueue) || maxQueue < 1 || maxQueue > 256) throw new RangeError('maxQueue must be 1..256');
        if (!Number.isFinite(timeout) || timeout < 1) throw new RangeError('timeout must be positive');
        this.factory = workerFactory || (() => new Worker(workerURL, {type:'module', name:'counterform-compiler'}));
        this.backend = inline ? 'inline (explicit)' : 'worker';
        this.inline = inline; this.maxQueue = maxQueue; this.timeout = timeout; this.onProgress = onProgress;
        this.queue = []; this.active = null; this.worker = null; this.sequence = 0; this.disposed = false;
    }
    run(kind, source, options = {}, {signal, key = null, priority = 0, timeout = this.timeout} = {}) {
        if (this.disposed) return Promise.reject(aborted('Compiler disposed'));
        if (signal?.aborted) return Promise.reject(aborted());
        if (!Number.isFinite(priority) || !Number.isFinite(timeout) || timeout < 1)
            return Promise.reject(new RangeError('Invalid task priority or timeout'));
        if (key !== null) this.cancelKey(key);
        if (this.queue.length + (this.active ? 1 : 0) >= this.maxQueue)
            return Promise.reject(new RangeError('Compiler queue budget exceeded'));
        let snapshot, settings, rasterBytes=0;
        try {
            if (kind === 'trace') {
                validateRaster(source);
                rasterBytes = source.pixels.byteLength;
                const retained = [...this.queue, this.active].filter(Boolean).reduce((n,j) => n + (j.rasterBytes || 0), 0);
                if (rasterBytes + retained > 64 * 1024 * 1024) throw new RangeError('Queued raster byte budget exceeded');
                // Copy only the validated view, not a potentially much larger backing buffer
                // or arbitrary properties. The caller's bytes remain attached and immutable.
                snapshot = {width:source.width, height:source.height, pixels:Uint8Array.from(source.pixels)};
            } else snapshot = structuredClone(source?.data ?? source);
            settings = structuredClone(options);
        }
        catch (error) { return Promise.reject(error); }
        return new Promise((resolve, reject) => {
            const job = {id:++this.sequence,kind,source:snapshot,rasterBytes,options:settings,key,priority,timeout,resolve,reject,signal,settled:false};
            job.abort = () => this._cancel(job);
            signal?.addEventListener('abort', job.abort, {once:true});
            this.queue.push(job);
            this.queue.sort((a,b) => a.priority-b.priority || a.id-b.id);
            // Defer dispatch so replacement, cancellation and priority changes are atomic in this task.
            queueMicrotask(() => this._pump());
        });
    }
    compile(source, options = {}, request = {}) { return this.run('compile', source, options, request); }
    validate(source, options = {}, request = {}) { return this.run('validate', source, options, request); }
    trace(image, options = {}, request = {}) { return this.run('trace', image, options, request); }
    inspect(source, options = {}, request = {}) { return this.run('inspect', source, options, request); }
    cancelKey(key) {
        for (const job of [...this.queue, this.active].filter(Boolean)) if (job.key === key) this._cancel(job);
    }
    _settle(job, error, value) {
        if (job.settled) return;
        job.settled = true; clearTimeout(job.timer);
        job.signal?.removeEventListener('abort', job.abort);
        job.source = null; job.options = null;
        if (error) job.reject(error); else job.resolve(value);
    }
    _cancel(job) {
        if (job.settled) return;
        if (this.active === job) { this.active = null; this._resetWorker(); }
        this.queue = this.queue.filter(x => x !== job);
        this._settle(job, aborted());
        queueMicrotask(() => this._pump());
    }
    _resetWorker() {
        const worker = this.worker; this.worker = null;
        if (worker) {
            this.unlisten?.(); this.unlisten = null;
            const result = worker.terminate();
            result?.catch?.(() => {});
        }
    }
    _ensureWorker() {
        if (this.worker) return this.worker;
        const worker = this.factory();
        if (!worker || typeof worker.postMessage !== 'function' || typeof worker.terminate !== 'function')
            throw new TypeError('workerFactory must return a browser Worker or Node Worker');
        const message = data => {
            if (this.worker !== worker || !this.active) return;
            const job = this.active;
            if (data?.protocol !== 1 || data.id !== job.id) return;
            if (data.type === 'progress') {
                try { this.onProgress({id:job.id,key:job.key,...data.value}); } catch { /* observer cannot strand a task */ }
                return;
            }
            if (data.type === 'result') this._finish(null, data.value);
            else if (data.type === 'error') this._finish(Object.assign(new Error(data.error?.message || 'Compiler failed'), {name:data.error?.name || 'Error'}));
            else this._finish(new Error('Malformed compiler response'));
        };
        const error = event => {
            if (this.worker !== worker) return;
            event?.preventDefault?.();
            this._resetWorker();
            this._finish(new Error(event?.message || 'Compiler worker failed to load or execute'));
        };
        this.worker = worker;
        if (typeof worker.addEventListener === 'function') {
            const receive = event => message(event.data);
            worker.addEventListener('message', receive); worker.addEventListener('error', error); worker.addEventListener('messageerror', error);
            this.unlisten = () => { worker.removeEventListener('message',receive); worker.removeEventListener('error',error); worker.removeEventListener('messageerror',error); };
        } else {
            const exit = code => error({message:`Compiler worker exited (${code})`});
            worker.on('message',message); worker.on('error',error); worker.on('messageerror',error); worker.on('exit',exit);
            this.unlisten = () => { worker.off('message',message); worker.off('error',error); worker.off('messageerror',error); worker.off('exit',exit); };
        }
        return worker;
    }
    _finish(error, value) {
        const job = this.active;
        if (!job) return;
        this.active = null; this._settle(job,error,value);
        queueMicrotask(() => this._pump());
    }
    async _pump() {
        if (this.disposed || this.active || !this.queue.length) return;
        const job = this.active = this.queue.shift();
        job.timer = setTimeout(() => {
            if (this.active !== job) return;
            this._resetWorker();
            this._finish(Object.assign(new Error('Compiler task timed out'),{name:'TimeoutError'}));
        },job.timeout);
        try {
            if (this.inline) {
                // This mode is explicitly opt-in; synchronous JS cannot be preempted or kept off the UI thread.
                const {executeTask} = await import('./tasks.js');
                if (this.active !== job || job.settled) return;
                this._finish(null,executeTask(job.kind,job.source,job.options));
            } else {
                this._ensureWorker().postMessage({protocol:1,id:job.id,kind:job.kind,source:job.source,options:job.options}, job.kind === 'trace' ? [job.source.pixels.buffer] : []);
                job.source = null; job.options = null;
            }
        } catch (error) { if (this.active === job) this._finish(error); }
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for (const job of [...this.queue, this.active].filter(Boolean)) this._settle(job,aborted('Compiler disposed'));
        this.queue = []; this.active = null; this._resetWorker();
    }
}
