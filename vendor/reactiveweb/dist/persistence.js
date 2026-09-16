import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, catchError, concatMap, debounceTime, defer, EMPTY, from, isObservable, map, merge, of, tap } from 'rxjs';
import { Disposable } from './disposables.js';
import { ActOnEveryObject } from './collections.js';
function observableResult(action) {
    return defer(() => { const value = action(); return isObservable(value) ? value : value && typeof value.then === 'function' ? from(value) : of(value); });
}
function clone(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
export class InMemorySuspensionDriver {
    state = null;
    LoadState() { return this.state === null ? null : clone(this.state); }
    SaveState(state) { this.state = clone(state); }
    InvalidateState() { this.state = null; }
}
export class LocalStorageSuspensionDriver {
    options;
    storage;
    constructor(options = {}) {
        this.options = typeof options === 'string' ? { key: options } : options;
        const storage = this.options.storage ?? globalThis.localStorage;
        if (!storage)
            throw new Error('localStorage is unavailable; supply a StorageLike implementation');
        this.storage = storage;
    }
    get Key() { return this.options.key ?? 'reactiveweb.state'; }
    LoadState() {
        const text = this.storage.getItem(this.Key);
        if (text === null)
            return null;
        const json = JSON.parse(text);
        return this.options.deserialize ? this.options.deserialize(json) : json;
    }
    SaveState(state) {
        const text = JSON.stringify(this.options.serialize ? this.options.serialize(state) : state);
        if (text === undefined)
            throw new TypeError('State is not JSON serializable');
        this.storage.setItem(this.Key, text);
    }
    InvalidateState() { this.storage.removeItem(this.Key); }
}
export { LocalStorageSuspensionDriver as BrowserSuspensionDriver };
/** Coordinates launch/resume/persist lifecycle streams with a pluggable state driver. */
export class SuspensionHost {
    IsLaunchingNew = new Subject();
    IsResuming = new Subject();
    IsUnpausing = new Subject();
    ShouldPersistState = new Subject();
    ShouldInvalidateState = new Subject();
    ThrownExceptions = new Subject();
    CreateNewAppState;
    state = new BehaviorSubject(null);
    setup;
    disposed = false;
    constructor(createNewAppState = () => { throw new Error('CreateNewAppState must be configured'); }) { this.CreateNewAppState = createNewAppState; }
    get AppState() { return this.state.value; }
    set AppState(value) { if (this.disposed)
        throw new Error('Suspension host is disposed'); this.state.next(value); }
    get AppStateChanged() { return this.state.asObservable(); }
    SetupDefaultSuspendResume(driver) {
        if (this.disposed)
            throw new Error('Suspension host is disposed');
        this.setup?.Dispose();
        const subscriptions = new Subscription();
        const report = (error) => { this.ThrownExceptions.next(error); return EMPTY; };
        subscriptions.add(this.IsLaunchingNew.subscribe(() => { try {
            this.AppState = this.CreateNewAppState();
        }
        catch (error) {
            report(error);
        } }));
        subscriptions.add(this.IsResuming.pipe(concatMap(() => observableResult(() => driver.LoadState()).pipe(catchError(error => { report(error); return of(null); })))).subscribe(state => { try {
            this.AppState = state ?? this.CreateNewAppState();
        }
        catch (error) {
            report(error);
        } }));
        const pendingLeases = new Set();
        const persistRequests = this.ShouldPersistState.pipe(map(lease => ({ kind: 'persist', lease })));
        const invalidateRequests = this.ShouldInvalidateState.pipe(map(() => ({ kind: 'invalidate' })));
        subscriptions.add(merge(persistRequests, invalidateRequests).pipe(tap(request => { if (request.kind === 'persist' && request.lease)
            pendingLeases.add(request.lease); }), concatMap(request => {
            if (request.kind === 'invalidate')
                return observableResult(() => driver.InvalidateState()).pipe(tap(() => { this.AppState = null; }), catchError(report));
            return new Observable(subscriber => {
                const state = this.AppState;
                const saving = (state === null ? of(undefined) : observableResult(() => driver.SaveState(state))).subscribe({
                    error: error => { report(error); subscriber.complete(); }, complete: () => subscriber.complete(),
                });
                return () => { saving.unsubscribe(); if (request.lease) {
                    pendingLeases.delete(request.lease);
                    request.lease.Dispose();
                } };
            });
        })).subscribe());
        subscriptions.add(() => { for (const lease of pendingLeases) {
            try {
                lease.Dispose();
            }
            catch (error) {
                report(error);
            }
        } pendingLeases.clear(); });
        const setup = Disposable.Create(() => subscriptions.unsubscribe());
        this.setup = setup;
        return setup;
    }
    GetAppState() { return this.AppState; }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.setup?.Dispose();
        this.IsLaunchingNew.complete();
        this.IsResuming.complete();
        this.IsUnpausing.complete();
        this.ShouldPersistState.complete();
        this.ShouldInvalidateState.complete();
        this.ThrownExceptions.complete();
        this.state.complete();
    }
    unsubscribe() { this.Dispose(); }
}
export function SetupDefaultSuspendResume(host, driver) { return host.SetupDefaultSuspendResume(driver); }
/** Debounced, serialized persistence. Flush surfaces failures; later changes retry normally. */
export function AutoPersist(item, persist, options = {}) {
    const source = options.changes ?? item?.Changed;
    if (!source || typeof source.subscribe !== 'function')
        throw new TypeError('AutoPersist requires a Changed observable or options.changes');
    if (options.throttleMs !== undefined && (!Number.isFinite(options.throttleMs) || options.throttleMs < 0))
        throw new RangeError('throttleMs must be a finite nonnegative number');
    const subscriptions = new Subscription(), requests = new Subject(), errors = new Subject();
    let disposed = false, revision = 0, requestedRevision = 0;
    let queue = Promise.resolve();
    const report = (error) => { errors.next(error); options.onError?.(error); };
    const flush = () => {
        if (disposed || revision === requestedRevision)
            return queue;
        requestedRevision = revision;
        const job = queue.catch(() => undefined).then(async () => {
            if (disposed)
                return;
            try {
                await new Promise((resolve, reject) => {
                    const savingScope = new Subscription(() => resolve());
                    subscriptions.add(savingScope);
                    savingScope.add(observableResult(() => persist(item)).subscribe({
                        error: error => { reject(error); savingScope.unsubscribe(); subscriptions.remove(savingScope); },
                        complete: () => { resolve(); savingScope.unsubscribe(); subscriptions.remove(savingScope); },
                    }));
                });
            }
            catch (error) {
                if (!disposed)
                    report(error);
                throw error;
            }
        });
        // Keep the failure observable to explicit Flush callers while avoiding unhandled timer rejections.
        queue = job;
        void job.catch(() => undefined);
        return job;
    };
    const trigger = () => { if (!disposed) {
        revision++;
        requests.next();
    } };
    subscriptions.add(requests.pipe(debounceTime(options.throttleMs ?? 1000, options.scheduler)).subscribe(() => { void flush().catch(() => undefined); }));
    subscriptions.add(source.subscribe({ next: trigger, error: report }));
    if (options.initial)
        trigger();
    return {
        Errors: errors.asObservable(), Flush: flush, Trigger: trigger,
        Dispose() { if (disposed)
            return; disposed = true; subscriptions.unsubscribe(); requests.complete(); errors.complete(); },
        unsubscribe() { this.Dispose(); },
    };
}
/** Browser attachment reports lifecycle only; browsers do not await arbitrary asynchronous unload saves. */
export function AttachBrowserLifecycle(host, target = window) {
    const onPageHide = () => host.ShouldPersistState.next();
    const onVisibility = () => { if (target.document.visibilityState === 'hidden')
        host.ShouldPersistState.next();
    else
        host.IsUnpausing.next(); };
    const onPageShow = (event) => { if (event.persisted)
        host.IsUnpausing.next(); };
    target.addEventListener('pagehide', onPageHide);
    target.addEventListener('pageshow', onPageShow);
    target.document.addEventListener('visibilitychange', onVisibility);
    return Disposable.Create(() => { target.removeEventListener('pagehide', onPageHide); target.removeEventListener('pageshow', onPageShow); target.document.removeEventListener('visibilitychange', onVisibility); });
}
/** Persists each live object independently, and releases its observer when it leaves the collection. */
export function AutoPersistCollection(collection, persist, options = {}) {
    const handles = new Map(), errors = new ReplaySubject(1);
    let disposed = false, lifecycleError;
    const observer = ActOnEveryObject(collection, item => {
        const handle = AutoPersist(item, persist, options);
        handles.set(item, handle);
        const errorsSubscription = handle.Errors.subscribe(error => errors.next(error));
        return Disposable.Create(() => { errorsSubscription.unsubscribe(); handle.Dispose(); handles.delete(item); });
    });
    const lifecycleErrors = observer.Errors.subscribe(error => { lifecycleError = error; errors.next(error); options.onError?.(error); });
    return {
        Errors: errors.asObservable(),
        async Flush() { if (!disposed) {
            await Promise.all([...handles.values()].map(handle => handle.Flush()));
            if (lifecycleError !== undefined)
                throw lifecycleError;
        } },
        Trigger() { if (!disposed)
            for (const handle of handles.values())
                handle.Trigger(); },
        Dispose() { if (disposed)
            return; disposed = true; try {
            observer.Dispose();
        }
        finally {
            lifecycleErrors.unsubscribe();
            errors.complete();
        } },
        unsubscribe() { this.Dispose(); },
    };
}
//# sourceMappingURL=persistence.js.map