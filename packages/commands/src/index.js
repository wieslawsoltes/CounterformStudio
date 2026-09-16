import { Signal } from '@wieslawsoltes/counterform-model';
const aliases = { cmd: 'Meta', command: 'Meta', meta: 'Meta', ctrl: 'Control', control: 'Control', option: 'Alt', alt: 'Alt', shift: 'Shift', mod: 'Mod', space: 'Space', esc: 'Escape', delete: 'Delete', backspace: 'Backspace', enter: 'Enter', return: 'Enter', left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', '=': 'Equal', '-': 'Minus', '[': 'BracketLeft', ']': 'BracketRight' };
const keyCode = key => aliases[key.toLowerCase()] || (/^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : /^\d$/.test(key) ? `Digit${key}` : key);
export function normalizeBinding(value) { if (typeof value !== 'string')
    throw new TypeError('Key binding must be a string'); const parts = value.split('+').map(s => keyCode(s.trim())), code = parts.pop(); if (!code || ['Alt', 'Control', 'Meta', 'Mod', 'Shift'].includes(code) || parts.some(p => !['Alt', 'Control', 'Meta', 'Mod', 'Shift'].includes(p)))
    throw new Error(`Invalid key binding '${value}'`); const mods = ['Mod', 'Control', 'Meta', 'Alt', 'Shift'].filter(m => parts.includes(m)); return [...mods, code].join('+'); }
export function matchesBinding(event, binding, isMac = false) { const parts = normalizeBinding(binding).split('+'), code = parts.pop(), mods = new Set(parts); if (mods.delete('Mod'))
    mods.add(isMac ? 'Meta' : 'Control'); return (event.code === code || keyCode(event.key) === code) && event.ctrlKey === mods.has('Control') && event.metaKey === mods.has('Meta') && event.altKey === mods.has('Alt') && event.shiftKey === mods.has('Shift'); }
export function formatBinding(binding, isMac = false) { const parts = normalizeBinding(binding).split('+').map(x => x === 'Mod' ? isMac ? '⌘' : 'Ctrl' : x === 'Meta' ? '⌘' : x === 'Control' ? 'Ctrl' : x === 'Alt' ? isMac ? '⌥' : 'Alt' : x === 'Shift' ? isMac ? '⇧' : 'Shift' : x.replace(/^Key|^Digit/, '').replace('Equal', '+').replace('Minus', '−').replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓')); return parts.join(isMac ? '' : ' + '); }
export function editableEvent(event) { return (event.composedPath?.() || [event.target]).some(e => e?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e?.tagName) || e?.getAttribute?.('role') === 'textbox'); }
export class CommandRegistry {
    commands = new Map();
    bindings = new Map();
    changed = new Signal();
    executed = new Signal();
    errors = new Signal();
    busy = new Set();
    constructor({ isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform), context = () => 'global' } = {}) { this.isMac = isMac; this.context = context; }
    register(command) { if (!command.id || typeof command.execute !== 'function')
        throw new TypeError('Command requires id and execute'); if (this.commands.has(command.id))
        throw new Error(`Duplicate command ${command.id}`); const c = { label: command.id, category: 'General', scope: 'global', ...command }; this.commands.set(c.id, c); this.bindings.set(c.id, (c.keys || []).map(normalizeBinding)); this.changed.emit(c); return () => { this.commands.delete(c.id); this.bindings.delete(c.id); }; }
    canExecute(id) { const c = this.commands.get(id); return !!c && !this.busy.has(id) && (c.enabled?.() ?? true); }
    async run(id, parameter) { const c = this.commands.get(id); if (!c)
        throw new Error(`Unknown command: ${id}`); if (!this.canExecute(id))
        return false; try {
        if (!c.parallel)
            this.busy.add(id);
        await c.execute(parameter);
        this.executed.emit({ id, parameter });
        return true;
    }
    catch (error) {
        this.errors.emit({ id, error });
        throw error;
    }
    finally {
        this.busy.delete(id);
        this.changed.emit(c);
    } }
    attach(target, { capture = false } = {}) { const handler = e => { if (e.defaultPrevented || e.isComposing || e.key === 'Process')
        return; const editable = editableEvent(e), scope = this.context(); for (const [id, keys] of this.bindings) {
        const c = this.commands.get(id);
        if (!c || editable && !c.allowInText || c.scope !== 'global' && c.scope !== scope || e.repeat && c.repeat === false)
            continue;
        if (keys.some(k => matchesBinding(e, k, this.isMac)) && this.canExecute(id)) {
            e.preventDefault();
            e.stopPropagation();
            this.run(id).catch(() => { });
            return;
        }
    } }; target.addEventListener('keydown', handler, { capture }); return () => target.removeEventListener('keydown', handler, { capture }); }
    conflicts(id, keys) { const c = this.commands.get(id), normalized = keys.map(normalizeBinding), result = []; for (const [other, bs] of this.bindings) {
        if (other === id)
            continue;
        const oc = this.commands.get(other);
        if (c?.scope !== 'global' && oc?.scope !== 'global' && c?.scope !== oc?.scope)
            continue;
        for (const k of normalized)
            if (bs.includes(k))
                result.push({ id: other, binding: k });
    } return result; }
    rebind(id, keys, { allowConflicts = false } = {}) { if (!this.commands.has(id))
        throw new Error(`Unknown command ${id}`); const normalized = keys.map(normalizeBinding), conflicts = this.conflicts(id, normalized); if (conflicts.length && !allowConflicts)
        throw new Error(`Shortcut conflicts with ${conflicts.map(c => c.id).join(', ')}`); this.bindings.set(id, normalized); this.changed.emit(this.commands.get(id)); }
    exportBindings() { return { format: 'counterform-keymap', version: 1, bindings: Object.fromEntries(this.bindings) }; }
    importBindings(data) { if (data?.format !== 'counterform-keymap' || data.version !== 1 || typeof data.bindings !== 'object')
        throw new Error('Invalid keymap'); const next = new Map(this.bindings); for (const [id, keys] of Object.entries(data.bindings)) {
        if (!this.commands.has(id))
            continue;
        if (!Array.isArray(keys) || keys.length > 8)
            throw new Error('Invalid key list');
        next.set(id, keys.map(normalizeBinding));
    } this.bindings = next; this.changed.emit({ kind: 'keymap' }); }
    search(query = '') { const words = query.toLowerCase().split(/\s+/).filter(Boolean); return [...this.commands.values()].map(c => ({ command: c, score: words.reduce((s, w) => s + (c.label.toLowerCase().startsWith(w) ? 5 : c.label.toLowerCase().includes(w) ? 3 : (c.id + ' ' + c.category + ' ' + (c.description || '')).toLowerCase().includes(w) ? 1 : -100), 0) })).filter(x => x.score >= 0).sort((a, b) => b.score - a.score || a.command.label.localeCompare(b.command.label)).map(x => x.command); }
    dispose() { this.changed.clear(); this.executed.clear(); this.errors.clear(); this.commands.clear(); this.bindings.clear(); }
}

