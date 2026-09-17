import { validateDocumentShape } from '@wieslawsoltes/counterform-model';
/** Undo journal with glyph-scoped snapshots; a drag is one atomic command. */
export class History {
    constructor(doc, { limit = 150, byteLimit = 48 * 1024 * 1024 } = {}) { this.doc = doc; this.limit = limit; this.byteLimit = byteLimit; this.undoStack = []; this.redoStack = []; this.active = null; this.listeners = new Set(); }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    notify() { for (const fn of this.listeners)
        fn(this); }
    begin(label, glyphId = null) { if (this.active)
        throw new Error('Nested history transaction'); if (glyphId && !this.doc.glyph(glyphId))
        throw new Error('Unknown glyph transaction'); const before = structuredClone(glyphId ? this.doc.glyph(glyphId) : this.doc.data); this.active = { label, glyphId, before, revision: this.doc.revision }; return this.active; }
    commit() { const a = this.active; if (!a)
        return false; // Snapshot scope is not reference-validation scope: color graphs can reference other glyphs.
        validateDocumentShape(this.doc.data); this.active = null; const after = structuredClone(a.glyphId ? this.doc.glyph(a.glyphId) : this.doc.data), b = JSON.stringify(a.before), n = JSON.stringify(after); if (b === n) {
        this.notify();
        return false;
    } this.undoStack.push({ ...a, after, bytes: (b.length + n.length) * 2 }); this.redoStack = []; while (this.undoStack.length > this.limit || this.undoStack.reduce((n, c) => n + c.bytes, 0) > this.byteLimit && this.undoStack.length > 1)
        this.undoStack.shift(); this.doc.touch(a.glyphId ? 'glyph' : 'structure', a.glyphId); this.notify(); return true; }
    cancel() { const a = this.active; if (!a)
        return; this.active = null; this.apply(a, a.before); this.notify(); }
    execute(label, fn, glyphId = null) { if (fn.constructor?.name === 'AsyncFunction')
        throw new TypeError('History transactions must be synchronous'); this.begin(label, glyphId); try {
        const value = fn();
        if (value?.then)
            throw new TypeError('History transactions must be synchronous');
        this.commit();
        return value;
    }
    catch (e) {
        this.cancel();
        throw e;
    } }
    apply(c, data) { if (c.glyphId)
        this.doc.replaceGlyph(c.glyphId, structuredClone(data));
    else
        this.doc.replace(structuredClone(data)); }
    undo() { if (this.active)
        this.cancel(); const c = this.undoStack.pop(); if (!c)
        return false; this.apply(c, c.before); this.redoStack.push(c); this.notify(); return true; }
    redo() { if (this.active)
        this.cancel(); const c = this.redoStack.pop(); if (!c)
        return false; this.apply(c, c.after); this.undoStack.push(c); this.notify(); return true; }
    clear() { if (this.active)
        this.cancel(); this.undoStack = []; this.redoStack = []; this.notify(); }
    get canUndo() { return this.undoStack.length > 0; }
    get canRedo() { return this.redoStack.length > 0; }
}

