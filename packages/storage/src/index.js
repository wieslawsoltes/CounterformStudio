import { validateDocumentShape } from '@wieslawsoltes/counterform-model';
const request = r => new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
const completion = tx => new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(tx.error || new Error('Storage transaction aborted')); });
export class ProjectStore {
    constructor({ name = 'counterform-studio-v1' } = {}) { this.name = name; this.db = null; this.opening = null; this.epoch = 0; }
    async open() {
        if (this.db) return this.db;
        if (this.opening) return this.opening;
        if (!globalThis.indexedDB) throw new Error('IndexedDB is not available');
        const epoch = this.epoch, r = indexedDB.open(this.name, 1);
        r.onupgradeneeded = () => {
            const db = r.result;
            if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', {keyPath:'id'});
            if (!db.objectStoreNames.contains('preferences')) db.createObjectStore('preferences');
        };
        const opening = request(r).then(db => {
            if (epoch !== this.epoch) { db.close(); throw new Error('Storage closed while opening'); }
            this.db = db; db.onversionchange = () => this.close(); return db;
        });
        this.opening = opening;
        try { return await opening; }
        finally { if (this.opening === opening) this.opening = null; }
    }
    async save(document) { const data = structuredClone(document.data ?? document); validateDocumentShape(data); const db = await this.open(); const tx = db.transaction('projects', 'readwrite'), done = completion(tx); tx.objectStore('projects').put({ id: data.id, name: data.info.familyName, modified: Date.now(), data }); await done; return data.id; }
    async list() { const db = await this.open(), rows = await request(db.transaction('projects').objectStore('projects').getAll()); return rows.sort((a, b) => b.modified - a.modified).map(({ data, ...meta }) => meta); }
    async load(id) { const db = await this.open(), row = await request(db.transaction('projects').objectStore('projects').get(id)); return row ? validateDocumentShape(row.data) : null; }
    async remove(id) { const db = await this.open(), tx = db.transaction('projects', 'readwrite'), done = completion(tx); tx.objectStore('projects').delete(id); await done; }
    async preference(key, value) { const db = await this.open(); if (arguments.length === 1)
        return request(db.transaction('preferences').objectStore('preferences').get(key)); const tx = db.transaction('preferences', 'readwrite'), done = completion(tx); tx.objectStore('preferences').put(value, key); await done; }
    close() { this.epoch++; this.db?.close(); this.db = null; this.opening = null; }
}
export class Autosave {
    constructor(document, store, {delay = 800, onStatus = () => {}} = {}) {
        this.document = document; this.store = store; this.delay = delay; this.status = onStatus;
        this.closed = false; this.pending = false; this.again = false; this.promise = null;
        this.off = document.changed.subscribe(e => {
            if (e.kind === 'saved' || this.closed) return;
            clearTimeout(this.timer);
            if (this.pending) this.again = true;
            else this.timer = setTimeout(() => this.flush(), delay);
        });
    }
    notify(status, error) { if (!this.closed) { try { this.status(status,error); } catch { /* observer cannot break durability */ } } }
    /** Resolves only after the active snapshot and any edits observed during it have drained. */
    flush() {
        clearTimeout(this.timer);
        if (this.closed) return this.promise || Promise.resolve(false);
        if (this.promise) { this.again = true; return this.promise; }
        this.pending = true;
        // Assign the shared promise before user callbacks can re-enter flush().
        this.promise = Promise.resolve().then(async () => {
            let saved = false;
            try {
                do {
                    this.again = false;
                    const snapshot = structuredClone(this.document.data ?? this.document);
                    this.notify('saving');
                    await this.store.save(snapshot);
                    saved = true;
                    // Never label an obsolete intermediate snapshot as saved.
                    if (!this.again) this.notify('saved');
                } while (this.again && !this.closed);
                return saved;
            } catch (error) { this.notify('error',error); return false; }
            finally { this.pending = false; this.promise = null; }
        });
        return this.promise;
    }
    dispose() { this.closed = true; clearTimeout(this.timer); this.off(); }
}
export function download(data, name, type = 'application/octet-stream') { const blob = data instanceof Blob ? data : new Blob([data], { type }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
export function parseProject(text) { if (text.length > 128 * 1024 * 1024)
    throw new RangeError('Project exceeds 128 MiB'); return validateDocumentShape(JSON.parse(text)); }
export async function chooseFile({ accept = '.counterform,.json,.ttf,.otf,.woff,.woff2,.ufoz,.svg' } = {}) { return new Promise(resolve => { const input = document.createElement('input'); input.type = 'file'; input.accept = accept; input.onchange = () => resolve(input.files[0] || null); input.oncancel = () => resolve(null); input.click(); }); }

