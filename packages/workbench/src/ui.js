import { escapeHTML } from '@wieslawsoltes/counterform-integrations';
export const el = (tag, cls = '', text = '') => { const e = document.createElement(tag); if (cls)
    e.className = cls; if (text)
    e.textContent = text; return e; };
export function button(label, action, { className = '', title = label } = {}) { const b = el('button', className, label); b.type = 'button'; b.title = title; b.addEventListener('click', () => Promise.resolve().then(action).catch(e => toast(e.message, 'error'))); return b; }
export function toast(message, kind = 'info') { let host = document.querySelector('.cf-toasts'); if (!host) {
    host = el('div', 'cf-toasts');
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
} const box = el('div', `cf-toast ${kind}`, message); host.append(box); setTimeout(() => box.remove(), kind === 'error' ? 10000 : 4500); }
let dialogSequence = 0;
/** One-shot modal. Owned resources are released before close() returns; native
 * close events remain native and are not synthesized or dispatched twice. */
export function dialog(title, { subtitle = '', className = '', wide = false } = {}) {
    const d = el('dialog', 'cf-dialog ' + className + (wide ? ' wide' : ''));
    const header = el('header', 'cf-dialog-header'), titleBox = el('div');
    const heading = el('h2', '', title);
    heading.id = `cf-dialog-title-${++dialogSequence}`;
    d.setAttribute('aria-labelledby', heading.id);
    titleBox.append(heading);
    if (subtitle) titleBox.append(el('p', 'cf-muted', subtitle));
    const callbacks = new Set();
    let closed = false;
    const finish = () => {
        if (closed) return;
        closed = true;
        // Snapshot before invoking callbacks: a disposer may close another modal.
        const pending = [...callbacks]; callbacks.clear();
        for (const callback of pending) {
            try { callback(); } catch (error) { console.error('Dialog cleanup failed', error); }
        }
        d.remove();
    };
    const nativeClose = d.close.bind(d);
    d.close = (...args) => { nativeClose(...args); if (!d.open) finish(); };
    d.addEventListener('close', finish, { once: true });
    // Escape/form submission can invoke the platform algorithm without calling
    // the instance method. Preserve cancellation semantics and clean up promptly.
    d.addEventListener('cancel', () => queueMicrotask(() => { if (!d.open) finish(); }));
    const closeButton = button('×', () => d.close(), { className: 'cf-close', title: 'Close dialog' });
    closeButton.setAttribute('aria-label', 'Close dialog');
    header.append(titleBox, closeButton);
    const body = el('div', 'cf-dialog-body'), footer = el('footer', 'cf-dialog-footer');
    d.append(header, body, footer); document.body.append(d);
    d.addEventListener('click', e => {
        if (e.target !== d) return;
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
    d.showModal();
    return { element: d, body, footer, close: () => d.close(),
        onClose(callback) {
            if (typeof callback !== 'function') throw new TypeError('A cleanup callback is required');
            if (closed) callback(); else callbacks.add(callback);
            return () => callbacks.delete(callback);
        }
    };
}
export function field(label, value, { type = 'text', min, max, step, placeholder = '', options = null } = {}) { const wrapper = el('label', 'cf-field'), caption = el('span', '', label); let input; if (options) {
    input = el('select');
    for (const option of options) {
        const o = el('option', '', option.label ?? option);
        o.value = option.value ?? option;
        input.append(o);
    }
    input.value = value;
}
else {
    input = el('input');
    input.type = type;
    input.placeholder = placeholder;
    if (min !== undefined)
        input.min = min;
    if (max !== undefined)
        input.max = max;
    if (step !== undefined)
        input.step = step;
    input.value = value ?? '';
} input.setAttribute('aria-label', label); wrapper.append(caption, input); return { element: wrapper, input }; }
export function section(title, { extra = null } = {}) { const block = el('section', 'cf-inspector-section'), head = el('div', 'cf-section-heading'); head.append(el('h3', '', title)); if (extra)
    head.append(extra); block.append(head); return { element: block, head }; }
export function setValue(input, value) { if (document.activeElement !== input)
    input.value = value ?? ''; }
export async function formDialog(title, fields, { subtitle = '', submit = 'Apply', onSubmit = () => { }, wide = false } = {}) { const d = dialog(title, { subtitle, wide }), form = el('form', 'cf-form-grid'), map = {}; for (const [key, label, value, options] of fields) {
    const f = field(label, value, options);
    map[key] = f.input;
    form.append(f.element);
} d.body.append(form); const apply = async () => { const data = Object.fromEntries(Object.entries(map).map(([k, input]) => [k, input.type === 'number' || input.type === 'range' ? Number(input.value) : input.value])); if (Object.values(data).some(v => typeof v === 'number' && !Number.isFinite(v)))
    throw new Error('Enter finite numeric values'); await onSubmit(data); d.close(); }; form.addEventListener('submit', e => { e.preventDefault(); apply().catch(e => toast(e.message, 'error')); }); d.footer.append(button('Cancel', () => d.close()), button(submit, apply, { className: 'primary' })); return d; }
export function renderCommandButtons(host, registry, ids) { for (const id of ids) {
    const c = registry.commands.get(id);
    if (!c)
        continue;
    const b = button(c.label, () => registry.run(id), { title: c.description || c.label });
    b.dataset.command = id;
    host.append(b);
} }
export { escapeHTML };

