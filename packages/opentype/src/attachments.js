import { Writer } from '@wieslawsoltes/counterform-binary';

const TYPES = { cursivePos: 3, basePos: 4, ligaturePos: 5, markPos: 6 };
export const isAttachment = type => Object.hasOwn(TYPES, type);

/** FEA attachment declarations share the host parser's token stream and diagnostics. */
export function attachmentParser({ peek, take, expect, number, readGroup, fail, classes }) {
    const anchors = new Map(), markClasses = new Map(), used = new Set(), glyphClasses = new Map();
    let count = 0, hasContourPoints = false;
    const pointReferences=[];
    const references=(glyphs, values)=>{for(const value of values)if(value?.point!==undefined)for(const glyph of glyphs){if(pointReferences.length>=100000)fail('Contour-point reference budget exceeded');pointReferences.push({glyph,point:value.point});}};
    const classify = (glyphs, value) => {
        for (const glyph of glyphs) {
            const before = glyphClasses.get(glyph);
            if (before !== undefined && before !== value) fail(`Conflicting attachment class for '${glyph}'`);
            glyphClasses.set(glyph, value);
        }
    };
    const point = () => {
        const text = take(), n = Number(text);
        if (!/^\d+$/.test(text || '') || n > 65535) fail('Expected uint16 contour point');
        hasContourPoints = true; return n;
    };
    function anchor() {
        expect('<'); expect('anchor');
        if (peek() === 'NULL') { take(); expect('>'); return null; }
        if (anchors.has(peek())) { const result = structuredClone(anchors.get(take())); expect('>'); return result; }
        const result = { x: number(), y: number() };
        if (peek() === 'contourpoint') { take(); result.point = point(); }
        expect('>'); return result;
    }
    function declaration(op) {
        if (op === 'anchorDef') {
            const value = { x: number(), y: number() };
            if (peek() === 'contourpoint') { take(); value.point = point(); }
            const name = take();
            if (!/^[A-Za-z_][\w.]*$/.test(name || '') || anchors.has(name)) fail('Duplicate or invalid anchor definition');
            expect(';'); anchors.set(name, value); return true;
        }
        if (op !== 'markClass') return false;
        const group = readGroup(), value = anchor(), name = take(); expect(';');
        if (!value) fail('A markClass requires a non-null attachment anchor');
        if (!/^@[\w.]+$/.test(name || '')) fail('Expected named mark class');
        if (used.has(name)) fail(`Cannot extend mark class '${name}' after use`);
        if (classes.has(name) && !markClasses.has(name)) fail(`Glyph class '${name}' is not a mark class`);
        const records = markClasses.get(name) || [];
        const existing = new Set(records.map(r => r.glyph));
        for (const glyph of group.glyphs) {
            if (existing.has(glyph)) fail(`Duplicate glyph '${glyph}' in mark class '${name}'`);
            if (++count > 100000) fail('Mark class expansion budget exceeded');
            records.push({ glyph, anchor: structuredClone(value) });
        }
        markClasses.set(name, records);
        classes.set(name, { glyphs: records.map(r => r.glyph), class: true });
        references(group.glyphs,[value]);classify(group.glyphs, 3); return true;
    }
    function pairs() {
        const result = [], seen = new Set();
        if (peek() !== '<') fail('Expected an attachment anchor (use <anchor NULL> for an empty component)');
        while (peek() === '<') {
            const value = anchor();
            if (peek() !== 'mark') {
                if (value !== null || result.length) fail('Expected mark class after anchor');
                return result; // <anchor NULL> is an empty ligature component.
            }
            take(); const name = take();
            if (!markClasses.has(name)) fail(`Unknown mark class '${name}'`);
            if (seen.has(name)) fail(`Duplicate attachment anchor for '${name}'`);
            seen.add(name); used.add(name); result.push({ name, anchor: value });
        }
        return result;
    }
    function positioning() {
        const op = peek();
        if (!['cursive', 'base', 'ligature', 'mark'].includes(op)) return null;
        take(); const glyphs = readGroup().glyphs;
        if (op === 'cursive') {
            const entry = anchor(), exit = anchor(); expect(';');references(glyphs,[entry,exit]);
            return { type: 'cursivePos', glyphs, entry, exit };
        }
        const components = [pairs()];
        if (op === 'ligature') while (peek() === 'ligComponent') {
            take(); if (components.length >= 64) fail('Ligature component budget exceeded');
            components.push(pairs());
        }
        expect(';');
        if (!components.some(c => c.length)) fail('Attachment rule needs at least one mark class');
        references(glyphs,components.flatMap(c=>c.map(a=>a.anchor)));
        classify(glyphs, op === 'mark' ? 3 : op === 'ligature' ? 2 : 1);
        return { type: op === 'base' ? 'basePos' : op === 'mark' ? 'markPos' : 'ligaturePos', glyphs, components };
    }
    return { declaration, positioning, result: () => ({ markClasses: Object.fromEntries(markClasses), anchorDefinitions: Object.fromEntries(anchors), glyphClasses: Object.fromEntries(glyphClasses), hasContourPoints,pointReferences }) };
}

const offset = (w, at, base = 0) => {
    const n = w.pos - base;
    if (n < 0 || n > 65535) throw new RangeError('Attachment subtable exceeds uint16 offsets; split the lookup with subtable');
    w.patch16(at, n);
};
const cover = ids => {
    if (ids.length > 65535) throw new RangeError('Attachment coverage budget exceeded');
    const w = new Writer().u16(1).u16(ids.length);
    for (const id of ids) w.u16(id);
    return w.finish();
};
function writeAnchor(w, a) {
    if (!a || ![a.x, a.y].every(n => Number.isInteger(n) && n >= -32768 && n <= 32767)) throw new RangeError('Invalid attachment anchor coordinates');
    if (a.point !== undefined && (!Number.isInteger(a.point) || a.point < 0 || a.point > 65535)) throw new RangeError('Invalid contour point');
    w.u16(a.point === undefined ? 1 : 2).i16(a.x).i16(a.y);
    if (a.point !== undefined) w.u16(a.point);
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Compile a same-type/same-flags run as ONE subtable (essential for cursive joining). */
export function compileAttachments(rules, gid, markClasses = {}) {
    if (!rules.length || !isAttachment(rules[0].type)) throw new TypeError('Expected attachment rules');
    const type = rules[0].type, targets = new Map();let operations=0;
    const budget=()=>{if(++operations>1000000)throw new RangeError('Attachment expansion budget exceeded');};
    if (rules.some(r => r.type !== type)) throw new TypeError('Mixed attachment lookup types');
    if (type === 'cursivePos') {
        for (const r of rules) for (const name of r.glyphs) {
            budget();
            const id = gid(name), value = { entry: r.entry, exit: r.exit };
            if (targets.has(id) && !same(targets.get(id), value)) throw new Error(`Conflicting cursive anchors for '${name}'`);
            targets.set(id, value);
        }
        const ordered = [...targets].sort(([a], [b]) => a - b), w = new Writer().u16(1).u16(0).u16(ordered.length).zeros(ordered.length * 4);
        ordered.forEach(([, r], i) => {
            for (const [j, a] of [r.entry, r.exit].entries()) if (a) { offset(w, 6 + 4 * i + 2 * j); writeAnchor(w, a); }
        });
        offset(w, 2); w.raw(cover(ordered.map(([id]) => id)));
        return { type: 3, bytes: w.finish() };
    }
    const classNames = [...new Set(rules.flatMap(r => r.components.flatMap(c => c.map(a => a.name))))].sort();
    if (!classNames.length || classNames.length > 256) throw new RangeError('Invalid attachment class count');
    const classIds = new Map(classNames.map((name, i) => [name, i])), marks = new Map();
    for (const name of classNames) {
        if (!Object.hasOwn(markClasses, name)) throw new Error(`Unknown mark class '${name}'`);
        for (const mark of markClasses[name]) {
            const id = gid(mark.glyph);
            if (marks.has(id)) throw new Error(`Mark '${mark.glyph}' belongs to overlapping classes in one lookup`);
            marks.set(id, { class: classIds.get(name), anchor: mark.anchor });
        }
    }
    for (const r of rules) for (const name of r.glyphs) {
            budget();
        const id = gid(name), components = targets.get(id) || r.components.map(() => new Map());
        if (components.length !== r.components.length) throw new Error(`Conflicting ligature component counts for '${name}'`);
        r.components.forEach((anchors, component) => {
            for (const a of anchors) {
                budget();
                const key = classIds.get(a.name), previous = components[component];
                if (previous.has(key) && !same(previous.get(key), a.anchor)) throw new Error(`Conflicting attachment anchor for '${name}'`);
                previous.set(key, a.anchor);
            }
        });
        targets.set(id, components);
    }
    const sortedMarks = [...marks].sort(([a], [b]) => a - b), ordered = [...targets].sort(([a], [b]) => a - b);
    if (!sortedMarks.length || ordered.length > 65535) throw new RangeError('Invalid attachment glyph count');
    const w = new Writer().u16(1).u16(0).u16(0).u16(classNames.length).u16(0).u16(0);
    offset(w, 2); w.raw(cover(sortedMarks.map(([id]) => id)));
    offset(w, 4); w.raw(cover(ordered.map(([id]) => id)));
    offset(w, 8); const markBase = w.pos;
    w.u16(sortedMarks.length);
    for (const [, m] of sortedMarks) w.u16(m.class).u16(0);
    sortedMarks.forEach(([, m], i) => { offset(w, markBase + 4 + 4 * i, markBase); writeAnchor(w, m.anchor); });
    offset(w, 10); const base = w.pos;
    if (type === 'ligaturePos') {
        w.u16(ordered.length).zeros(ordered.length * 2);
        ordered.forEach(([, components], i) => {
            offset(w, base + 2 + 2 * i, base); const ligature = w.pos;
            w.u16(components.length).zeros(components.length * classNames.length * 2);
            components.forEach((values, ci) => { for (const [cl, a] of values) if (a) {
                offset(w, ligature + 2 + (ci * classNames.length + cl) * 2, ligature); writeAnchor(w, a);
            } });
        });
    } else {
        w.u16(ordered.length).zeros(ordered.length * classNames.length * 2);
        ordered.forEach(([, components], i) => { for (const [cl, a] of components[0]) if (a) {
            offset(w, base + 2 + (i * classNames.length + cl) * 2, base); writeAnchor(w, a);
        } });
    }
    return { type: TYPES[type], bytes: w.finish() };
}

/** GDEF flags coexist with the shared variable positioning store, never replace it. */
export function buildGDEF(glyphs, parsed, store = null) {
    const gid = new Map(glyphs.map((g, i) => [g.name, i]));
    const classDef = entries => {
        const sorted = entries.sort(([a], [b]) => a - b), ranges = [];
        for (const [id, cls] of sorted) {
            const last = ranges.at(-1);
            if (last && last[1] + 1 === id && last[2] === cls) last[1] = id;
            else ranges.push([id, id, cls]);
        }
        const w = new Writer().u16(2).u16(ranges.length);
        for (const [first, last, cls] of ranges) w.u16(first).u16(last).u16(cls);
        return w.finish();
    };
    const filtering = parsed.markFilteringSets || [], attachment = parsed.markAttachmentClasses || [];
    const variable = store?.rows.length > 0, extended = variable || filtering.length > 0;
    const w = new Writer().u32(variable ? 0x10003 : extended ? 0x10002 : 0x10000).u16(0).u16(0).u16(0).u16(0);
    if (extended) w.u16(0);
    if (variable) w.u32(0);
    offset(w, 4);
    w.raw(classDef(glyphs.map((g, i) => [i, Object.hasOwn(parsed.glyphClasses || {}, g.name) ? parsed.glyphClasses[g.name] : (g.category === 'Mark' ? 3 : g.category === 'Ligature' ? 2 : 1)])));
    if (attachment.length) {
        const entries = new Map();
        attachment.forEach((names, index) => { for (const name of names) {
            if (!gid.has(name)) throw new Error(`Unknown exported mark '${name}'`);
            if (entries.has(gid.get(name)) && entries.get(gid.get(name)) !== index + 1) throw new Error(`Overlapping MarkAttachmentType classes for '${name}'`);
            entries.set(gid.get(name), index + 1);
        } });
        offset(w, 10); w.raw(classDef([...entries]));
    }
    if (filtering.length) {
        offset(w, 12); const base = w.pos; w.u16(1).u16(filtering.length).zeros(filtering.length * 4);
        filtering.forEach((names, i) => {
            w.patch32(base + 4 + 4 * i, w.pos - base);
            const ids = [...new Set(names.map(name => { if (!gid.has(name)) throw new Error(`Unknown exported mark '${name}'`); return gid.get(name); }))].sort((a, b) => a - b);
            w.raw(cover(ids));
        });
    }
    if (variable) { w.patch32(14, w.pos); w.raw(store.encode()); }
    return w.finish();
}
