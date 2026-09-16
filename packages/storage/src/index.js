import { validateDocumentShape } from '@wieslawsoltes/counterform-model';
const request = r => new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
const completion = tx => new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(tx.error || new Error('Storage transaction aborted')); });
export class ProjectStore {
    constructor({ name = 'counterform-studio-v1' } = {}) { this.name = name; this.db = null; }
    async open() { if (this.db)
        return this.db; if (!globalThis.indexedDB)
        throw new Error('IndexedDB is not available'); const r = indexedDB.open(this.name, 1); r.onupgradeneeded = () => { const db = r.result; db.createObjectStore('projects', { keyPath: 'id' }); db.createObjectStore('preferences'); }; this.db = await request(r); this.db.onversionchange = () => this.close(); return this.db; }
    async save(document) { const db = await this.open(), data = structuredClone(document.data ?? document); validateDocumentShape(data); const tx = db.transaction('projects', 'readwrite'), done = completion(tx); tx.objectStore('projects').put({ id: data.id, name: data.info.familyName, modified: Date.now(), data }); await done; return data.id; }
    async list() { const db = await this.open(), rows = await request(db.transaction('projects').objectStore('projects').getAll()); return rows.sort((a, b) => b.modified - a.modified).map(({ data, ...meta }) => meta); }
    async load(id) { const db = await this.open(), row = await request(db.transaction('projects').objectStore('projects').get(id)); return row ? validateDocumentShape(row.data) : null; }
    async remove(id) { const db = await this.open(), tx = db.transaction('projects', 'readwrite'), done = completion(tx); tx.objectStore('projects').delete(id); await done; }
    async preference(key, value) { const db = await this.open(); if (arguments.length === 1)
        return request(db.transaction('preferences').objectStore('preferences').get(key)); const tx = db.transaction('preferences', 'readwrite'), done = completion(tx); tx.objectStore('preferences').put(value, key); await done; }
    close() { this.db?.close(); this.db = null; }
}
export class Autosave {
    constructor(document, store, { delay = 800, onStatus = () => { } } = {}) { this.document = document; this.store = store; this.delay = delay; this.status = onStatus; this.timer = 0; this.closed = false; this.pending = false; this.off = document.changed.subscribe(e => { if (e.kind !== 'saved') {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), delay);
    } }); }
    async flush() { clearTimeout(this.timer); if (this.closed)
        return; if (this.pending) {
        this.again = true;
        return;
    } this.pending = true; this.status('saving'); try {
        await this.store.save(this.document);
        this.status('saved');
    }
    catch (error) {
        this.status('error', error);
    }
    finally {
        this.pending = false;
        if (this.again && !this.closed) {
            this.again = false;
            this.flush();
        }
    } }
    dispose() { this.closed = true; clearTimeout(this.timer); this.off(); }
}
export function download(data, name, type = 'application/octet-stream') { const blob = data instanceof Blob ? data : new Blob([data], { type }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
export function parseProject(text) { if (text.length > 128 * 1024 * 1024)
    throw new RangeError('Project exceeds 128 MiB'); return validateDocumentShape(JSON.parse(text)); }
export async function chooseFile({ accept = '.counterform,.json,.ttf,.otf,.woff,.woff2,.ufoz,.svg' } = {}) { return new Promise(resolve => { const input = document.createElement('input'); input.type = 'file'; input.accept = accept; input.onchange = () => resolve(input.files[0] || null); input.oncancel = () => resolve(null); input.click(); }); }

