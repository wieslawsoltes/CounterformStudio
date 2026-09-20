import {validateBitmapSource} from '@wieslawsoltes/counterform-bitmap';
import {validateArtwork,ARTWORK_LIMITS} from '@wieslawsoltes/counterform-artwork';
import {isVariationSelector} from '@wieslawsoltes/counterform-binary';
import {normalizeAxisMap} from '@wieslawsoltes/counterform-varstore';
import {validateModifiers,evaluateModifiers} from '@wieslawsoltes/counterform-modifiers';
import {paintChildren} from '@wieslawsoltes/counterform-colrv1';
import { validateColorSource } from '@wieslawsoltes/counterform-color';
import { uid, bounds, transformContours, rectangle, ellipse, reverseContour, node, contour } from '@wieslawsoltes/counterform-geometry';
export class Signal {
    #listeners = new Set();
    subscribe(fn) { this.#listeners.add(fn); return () => this.#listeners.delete(fn); }
    emit(value) { for (const fn of [...this.#listeners]) {
        try {
            fn(value);
        }
        catch (error) {
            console.error('Counterform observer failed', error);
        }
    } }
    clear() { this.#listeners.clear(); }
}
export function createLayer(masterId, contours = []) {
    return { id: uid('layer'), masterId, name: 'Foreground', contours, components: [], anchors: [], guides: [], color: '#111820', visible: true, locked: false, advanceWidth: 640 };
}
export function createGlyph(name, unicode = null, masters = ['regular']) {
    return { id: uid('g'), name, unicodes: unicode === null ? [] : [unicode], category: 'Letter', mark: 'none', export: true, note: '', layers: masters.map(m => createLayer(typeof m === 'string' ? m : m.id)) };
}
export function createFont(familyName = 'Untitled', styleName = 'Regular') {
    return { format: 'counterform', version: 1, id: uid('font'), info: { familyName, styleName, unitsPerEm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 520, lineGap: 0, italicAngle: 0, weightClass: 400, widthClass: 5, designer: '', manufacturer: '', copyright: '', license: '', versionMajor: 1, versionMinor: 0 }, axes: [], masters: [{ id: 'regular', name: styleName, location: {} }], instances: [], glyphs: [], kerning: { regular: {} }, groups: {}, features: '', palettes: [['#20262e', '#568ee8', '#e4a565']], notes: '', importInfo: null };
}
export class FontDocument {
    changed = new Signal();
    revision = 0;
    savedRevision = 0;
    #byId = new Map();
    #byUnicode = new Map();
    #byName = new Map();
    #bySequence = new Map();
    constructor(data = createFont()) { this.replace(data, false); }
    replace(data, notify = true) { validateDocumentShape(data); this.data = data; this.reindex(); if (notify)
        this.touch('replace'); }
    reindex() { this.#byId.clear(); this.#byUnicode.clear(); this.#byName.clear(); for (const g of this.data.glyphs) {
        this.#byId.set(g.id, g);
        this.#byName.set(g.name, g);
        for (const cp of g.unicodes)
            this.#byUnicode.set(cp, g);
    } this.#bySequence.clear();
    for (const row of this.data.variationSequences || []) this.#bySequence.set(`${row.unicode}/${row.selector}`, row.glyphId);
    }
    /** Unsupported sequences are distinct from an explicitly supported default. */
    variation(unicode, selector) {
        const key = `${unicode}/${selector}`;
        if (!this.#bySequence.has(key)) return undefined;
        const id = this.#bySequence.get(key);
        return id === null ? this.char(unicode) : this.glyph(id);
    }
    glyph(id) { return this.#byId.get(id) || this.#byName.get(id); }
    char(cp) { return this.#byUnicode.get(typeof cp === 'string' ? cp.codePointAt(0) : cp); }
    layer(gid, mid = this.data.masters[0].id) { return this.glyph(gid)?.layers.find(l => l.masterId === mid); }
    touch(kind = 'edit', glyphId = null) { this.revision++; if (['replace', 'structure', 'glyph'].includes(kind))
        this.reindex(); this.changed.emit({ kind, glyphId, revision: this.revision }); }
    replaceGlyph(id, glyph) { const index = this.data.glyphs.findIndex(g => g.id === id); if (index < 0)
        throw new Error(`Unknown glyph ${id}`); this.data.glyphs[index] = glyph; this.touch('glyph', id); }
    addGlyph(g) { if (this.glyph(g.name))
        throw new Error(`A glyph named ${g.name} already exists`); this.data.glyphs.push(g); this.touch('structure', g.id); return g; }
    markSaved() { this.savedRevision = this.revision; this.changed.emit({ kind: 'saved', revision: this.revision }); }
    get dirty() { return this.revision !== this.savedRevision; }
    get info() { return this.data.info; }
    serialize() { return JSON.stringify(this.data); }
    resolve(gid, mid = this.data.masters[0].id, visited = new Set(), depth = 0) {
        if (depth > 32 || visited.has(gid))
            throw new Error('Cyclic or excessively deep glyph component graph');
        const g = this.glyph(gid), l = g?.layers.find(l => l.masterId === mid);
        if (!l)
            return [];
        const path = new Set(visited);
        path.add(gid);
        const result = structuredClone(l.contours);
        for (const comp of l.components) {
            const target = this.glyph(comp.glyphId) || this.glyph(comp.glyphName);
            if (!target)
                throw new Error(`Missing component ${comp.glyphId || comp.glyphName}`);
            result.push(...transformContours(this.resolve(target.id, mid, path, depth + 1), comp.transform || [1, 0, 0, 1, 0, 0]));
        }
        return l.modifiers?.length ? evaluateModifiers(result,l.modifiers) : result;
    }
    metrics(gid, mid) { const l = this.layer(gid, mid); if (!l)
        return null; const b = bounds(this.resolve(gid, mid)); return { ...b, advanceWidth: l.advanceWidth, lsb: b.minX, rsb: l.advanceWidth - b.maxX }; }
    dispose() { this.changed.clear(); }
}
export function validateDocumentShape(d) {
    if (!d || d.format !== 'counterform' || d.version !== 1)
        throw new Error('Not a supported Counterform document');
    if (!d.info || !Number.isInteger(d.info.unitsPerEm) || d.info.unitsPerEm < 16 || d.info.unitsPerEm > 16384)
        throw new RangeError('Invalid unitsPerEm');
    if (!Array.isArray(d.glyphs) || d.glyphs.length > 65535 || !Array.isArray(d.masters) || d.masters.length < 1 || d.masters.length > 64)
        throw new RangeError('Invalid font size or masters');
    const finite = p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.max(Math.abs(p.x), Math.abs(p.y)) <= 1e7;
    const safeId = id => typeof id === 'string' && id.length > 0 && id.length < 256 && !['__proto__', 'constructor', 'prototype'].includes(id);
    const masterIds = new Set();
    for (const m of d.masters) {
        if (!safeId(m.id) || masterIds.has(m.id) || typeof m.name !== 'string' || !m.location || Object.values(m.location).some(v => !Number.isFinite(v)))
            throw new Error('Invalid master identity/location');
        if(m.metrics && (typeof m.metrics!=='object'||Object.entries(m.metrics).some(([k,v])=>!['ascender','descender','lineGap','capHeight','xHeight'].includes(k)||!Number.isFinite(v)||Math.abs(v)>32767)))throw new RangeError('Invalid source master metrics');
        masterIds.add(m.id);
    }
    if (!Array.isArray(d.axes) || d.axes.length > 16 || !Array.isArray(d.instances) || !d.kerning || !d.groups || typeof d.features !== 'string' || d.features.length > 4 * 1024 * 1024)
        throw new Error('Invalid font authoring data');
    const tags = new Set();
    for (const a of d.axes) {
        if (typeof a.tag !== 'string' || !/^[ -~]{4}$/.test(a.tag) || tags.has(a.tag) || ![a.min, a.default, a.max].every(Number.isFinite) || a.min > a.default || a.default > a.max || a.min === a.max)
            throw new Error('Invalid variation axis');
        normalizeAxisMap(a.map);
        tags.add(a.tag);
    }
    if(d.featureInstance!==undefined){
        const context=d.featureInstance;
        if(!context||!Array.isArray(context.axes)||context.axes.length>16||!context.location||typeof context.location!=='object'||Array.isArray(context.location))throw new Error('Invalid static feature-instance context');
        const contextTags=new Set();
        for(const a of context.axes){
            if(typeof a.tag!=='string'||!/^[ -~]{4}$/.test(a.tag)||contextTags.has(a.tag)||![a.min,a.default,a.max].every(Number.isFinite)||a.min>a.default||a.default>a.max||a.min===a.max)throw new Error('Invalid static feature-instance axis');
            normalizeAxisMap(a.map);contextTags.add(a.tag);
        }
        for(const [tag,value]of Object.entries(context.location))if(!contextTags.has(tag)||!Number.isFinite(value))throw new Error('Invalid static feature-instance location');
    }
    for (const values of Object.values(d.kerning))
        if (!values || typeof values !== 'object' || Object.values(values).some(v => !Number.isFinite(v)))
            throw new Error('Invalid kerning values');
    const ids = new Set();
    let count = 0, artworkBytes = 0, artworkPoints = 0, artworkPixels = 0;
    for (const g of d.glyphs) {
        if (!safeId(g.id) || ids.has(g.id))
            throw new Error('Duplicate/missing glyph identity');
        ids.add(g.id);
        if (typeof g.name !== 'string' || !Array.isArray(g.unicodes) || g.unicodes.some(cp => !Number.isInteger(cp) || cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)))
            throw new Error('Invalid glyph encoding');
        if (!Array.isArray(g.layers) || g.layers.length > 128)
            throw new Error('Invalid glyph layers');
        for (const l of g.layers) {
            validateModifiers(l.modifiers);
            const art = validateArtwork(l.artwork); artworkBytes += art.bytes; artworkPoints += art.points; artworkPixels += art.pixels;
            if (artworkBytes > ARTWORK_LIMITS.maxDocumentBytes || artworkPoints > 2000000 || artworkPixels > ARTWORK_LIMITS.maxPixels * 16) throw new RangeError('Document artwork budget exceeded');
            if (!masterIds.has(l.masterId) || !Array.isArray(l.guides) || !Array.isArray(l.contours) || !Array.isArray(l.components) || !Array.isArray(l.anchors) || !Number.isFinite(l.advanceWidth))
                throw new Error('Invalid layer');
            if (l.anchors.some(a => !finite(a) || typeof a.name !== 'string') || l.guides.some(a => !finite(a) || !Number.isFinite(a.angle ?? 0)))
                throw new Error('Invalid anchor/guide');
            for (const component of l.components) {
                if (!Array.isArray(component.transform) || component.transform.length !== 6 || component.transform.some(v => !Number.isFinite(v) || Math.abs(v) > 1e7))
                    throw new Error('Invalid component transform');
            }
            for (const c of l.contours) {
                if (!Array.isArray(c.nodes))
                    throw new Error('Invalid contour');
                for (const n of c.nodes) {
                    if (++count > 2000000)
                        throw new RangeError('Document point budget exceeded');
                    for (const p of [n, n.in, n.out])
                        if (p && (!Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.max(Math.abs(p.x), Math.abs(p.y)) > 1e7))
                            throw new Error('Invalid outline coordinate');
                }
            }
        }
    }
    validateVariationSequences(d);
    validateColorSource(d);
    validateBitmapSource(d);
    return d;
}
export function duplicateGlyph(g, newName) { const x = structuredClone(g); x.id = uid('g'); x.name = newName; x.unicodes = [];
    for(const layer of x.colorLayers||[])if(layer.glyphId===g.id)layer.glyphId=x.id;
    function remap(p){if(!p)return;if(p.glyphId===g.id)p.glyphId=x.id;for(const c of paintChildren(p))remap(c);}remap(x.colorPaint);
    for (const l of x.layers) {
    l.id = uid('layer');
    for(const r of l.artwork||[])r.id=uid('art');
    for (const c of l.contours) {
        c.id = uid('c');
        for (const n of c.nodes)
            n.id = uid();
    }
} return x; }
export function setSidebearing(doc, gid, mid, side, value) { const l = doc.layer(gid, mid), m = doc.metrics(gid, mid); if (!Number.isFinite(value))
    throw new TypeError('Sidebearing must be finite'); if (side === 'left') {
    const dx = value - m.lsb;
    if(l.modifiers?.some(m=>m.enabled!==false))l.modifiers.push({type:'translate',x:dx,y:0});
    else {transformContours(l.contours, [1, 0, 0, 1, dx, 0]);for(const c of l.components)c.transform[4]+=dx;}
    for (const a of l.anchors)
        a.x += dx;
    l.advanceWidth += dx;
}
else
    l.advanceWidth = m.maxX + value; doc.touch('geometry', gid); }
export function addMaster(doc, name, location, sourceId = doc.data.masters[0].id) { const id = uid('m'); doc.data.masters.push({ id, name, location }); for (const g of doc.data.glyphs) {
    const l = structuredClone(g.layers.find(l => l.masterId === sourceId));
    if (l) {
        l.id = uid('layer');
        l.masterId = id;
        g.layers.push(l);
    }
} doc.data.kerning[id] = structuredClone(doc.data.kerning[sourceId] || {}); doc.touch('structure'); return id; }
function stroke(points, width) { const out = []; for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i], dx = x1 - x0, dy = y1 - y0, length = Math.hypot(dx, dy) || 1, nx = -dy / length * width / 2, ny = dx / length * width / 2;
    out.push(contour([node(x0 + nx, y0 + ny), node(x1 + nx, y1 + ny), node(x1 - nx, y1 - ny), node(x0 - nx, y0 - ny)]));
} return out; }
function ring(cx, cy, rx, ry, w) { return [ellipse(cx, cy, rx, ry), reverseContour(ellipse(cx, cy, Math.max(1, rx - w), Math.max(1, ry - w)))]; }
/** Original geometric demonstration outlines. No third-party font files are embedded. */
export function demoOutlines(ch, w = 70) {
    const h = ch === ch.toUpperCase() ? 700 : 520, W = 540, cs = [], line = (ps) => cs.push(...stroke(ps, w)), rect = (x, y, a, b) => cs.push(rectangle(x, y, a, b)), round = (cx, cy, rx, ry) => cs.push(...ring(cx, cy, rx, ry, w));
    const cap = { A: [[70, 0], [270, 700], [470, 0]], H: [[80, 0], [80, 700]], I: [[260, 0], [260, 700]], K: [[80, 0], [80, 700]], L: [[80, 700], [80, 0], [480, 0]], M: [[70, 0], [70, 700], [270, 330], [470, 700], [470, 0]], N: [[70, 0], [70, 700], [470, 0], [470, 700]], T: [[50, 700], [490, 700]], V: [[55, 700], [270, 0], [485, 700]], W: [[45, 700], [145, 0], [270, 420], [395, 0], [495, 700]], X: [[60, 700], [480, 0]], Y: [[60, 700], [270, 350], [480, 700]], Z: [[60, 700], [480, 700], [60, 0], [480, 0]] };
    if (cap[ch]) {
        line(cap[ch]);
        if (ch === 'A')
            line([[145, 230], [395, 230]]);
        if (ch === 'H') {
            line([[460, 0], [460, 700]]);
            line([[80, 350], [460, 350]]);
        }
        if (ch === 'I') {
            line([[130, 700], [390, 700]]);
            line([[130, 0], [390, 0]]);
        }
        if (ch === 'K')
            line([[460, 700], [80, 320], [480, 0]]);
        if (ch === 'T')
            line([[270, 700], [270, 0]]);
        if (ch === 'X')
            line([[60, 0], [480, 700]]);
        if (ch === 'Y')
            line([[270, 350], [270, 0]]);
        return cs;
    }
    if ('ODQCG'.includes(ch)) {
        round(270, 350, 230, 360);
        if (ch === 'Q')
            line([[320, 120], [525, -75]]);
        if (ch === 'D')
            rect(40, 0, w, 700);
        if (ch === 'G')
            line([[300, 320], [500, 320], [500, 90]]);
        if (ch === 'C' || ch === 'G')
            return cs.map(c => c);
        return cs;
    }
    if ('BEFPR'.includes(ch)) {
        rect(60, 0, w, 700);
        if ('BPR'.includes(ch)) {
            round(265, 520, 205, 180);
            if (ch === 'B')
                round(275, 180, 215, 180);
            if (ch === 'R')
                line([[275, 350], [490, 0]]);
        }
        else {
            line([[70, 700], [490, 700]]);
            line([[70, 355], [425, 355]]);
            if (ch === 'E')
                line([[70, 0], [490, 0]]);
        }
        return cs;
    }
    if (ch === 'S' || ch === 's') {
        const hh = h;
        return [contour([node(480, hh * .85, { in: { x: 440, y: hh * 1.03 }, out: { x: 320, y: hh * 1.15 } }), node(70, hh * .72, { in: { x: 90, y: hh * 1.07 }, out: { x: 45, y: hh * .48 } }), node(410, hh * .35, { in: { x: 180, y: hh * .46 }, out: { x: 520, y: hh * .25 } }), node(100, hh * .06, { in: { x: 400, y: -hh * .15 }, out: { x: 95, y: hh * .02 } }), node(70, hh * .16, { in: null, out: { x: 200, y: -hh * .05 } }), node(475, hh * .25, { in: { x: 500, y: hh * .02 }, out: { x: 510, y: hh * .55 } }), node(155, hh * .69, { in: { x: 355, y: hh * .55 }, out: { x: 120, y: hh * .91 } }), node(435, hh * .77, { in: { x: 340, y: hh * 1.01 } })])];
    }
    if (ch === 'U' || ch === 'u') {
        round(270, h / 2, 210, h / 2);
        rect(60, h / 2, w, h / 2);
        rect(480 - w, h / 2, w, h / 2);
        return cs;
    }
    if (ch === 'J') {
        line([[80, 700], [460, 700], [460, 180], [400, 30], [230, -5], [90, 80]]);
        return cs;
    }
    if ('aobdpqegc'.includes(ch)) {
        round(270, 260, 220, 270);
        if ('abdpqg'.includes(ch))
            rect('bd'.includes(ch) ? (ch === 'b' ? 50 : 420) : 420, 'pqg'.includes(ch) ? -200 : 0, w, 'bd'.includes(ch) ? 730 : 'pqg'.includes(ch) ? 720 : 520);
        if (ch === 'e')
            rect(65, 230, 410, w);
        return cs;
    }
    if ('nhmr'.includes(ch)) {
        rect(65, 0, w, ch === 'h' ? 740 : 520);
        round(ch === 'm' ? 220 : 270, 260, ch === 'm' ? 155 : 205, 260);
        rect(ch === 'm' ? 300 : 405, 0, w, 275);
        if (ch === 'm') {
            round(490, 260, 155, 260);
            rect(610, 0, w, 275);
        }
        if (ch === 'r')
            return [rectangle(65, 0, w, 520), ...ring(230, 360, 145, 160, w)];
        return cs;
    }
    if ('ijltf'.includes(ch)) {
        rect(ch === 'f' ? 195 : 230, ch === 'j' ? -180 : 0, w, ch === 'l' ? 740 : ch === 't' || ch === 'f' ? 710 : ch === 'j' ? 700 : 520);
        if ('ij'.includes(ch))
            cs.push(ellipse(230 + w / 2, 665, w * .6, w * .6));
        if ('tf'.includes(ch))
            rect(115, 480, 315, w);
        return cs;
    }
    if ('kvwxyz'.includes(ch)) {
        const upper = demoOutlines(ch.toUpperCase(), w);
        transformContours(upper, [1, 0, 0, h / 700, 0, 0]);
        return upper;
    }
    if (/[0-9]/.test(ch)) {
        const segs = { a: [[110, 700], [430, 700]], b: [[450, 680], [450, 365]], c: [[450, 335], [450, 20]], d: [[110, 0], [430, 0]], e: [[90, 20], [90, 335]], f: [[90, 365], [90, 680]], g: [[110, 350], [430, 350]] };
        const map = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
        for (const s of map[+ch])
            line(segs[s]);
        return cs;
    }
    if (ch === ' ')
        return [];
    if ('.,:;!'.includes(ch)) {
        cs.push(ellipse(270, 35, w * .65, w * .65));
        if (':;'.includes(ch))
            cs.push(ellipse(270, 380, w * .65, w * .65));
        if (ch === '!')
            rect(270 - w / 2, 180, w, 520);
        if (',;'.includes(ch))
            line([[280, 20], [205, -100]]);
        return cs;
    }
    if ('-_=+'.includes(ch)) {
        line([[85, 270], [455, 270]]);
        if (ch === '+')
            line([[270, 80], [270, 460]]);
        if (ch === '=')
            line([[85, 410], [455, 410]]);
        if (ch === '_')
            transformContours(cs, [1, 0, 0, 1, 0, -270]);
        return cs;
    }
    if ('/\\'.includes(ch)) {
        line(ch === '/' ? [[70, 0], [470, 700]] : [[70, 700], [470, 0]]);
        return cs;
    }
    if ('()[]{}<>'.includes(ch)) {
        const left = '([{<'.includes(ch);
        line(left ? [[350, 740], [150, 350], [350, -60]] : [[190, 740], [390, 350], [190, -60]]);
        return cs;
    }
    if ('"\'`'.includes(ch)) {
        line([[210, 740], [190, 560]]);
        if (ch === '"')
            line([[350, 740], [330, 560]]);
        return cs;
    }
    if (ch === '#') {
        line([[180, 0], [250, 700]]);
        line([[330, 0], [400, 700]]);
        line([[80, 235], [485, 235]]);
        line([[90, 465], [495, 465]]);
        return cs;
    }
    if (ch === '?') {
        round(270, 520, 180, 180);
        line([[430, 460], [270, 240], [270, 175]]);
        cs.push(ellipse(270, 35, w * .65, w * .65));
        return cs;
    }
    if (ch === '@' || ch === '&') {
        round(270, 350, 235, 350);
        round(270, 310, 130, 170);
        return cs;
    }
    if (ch === '*') {
        for (let i = 0; i < 3; i++) {
            const a = i * Math.PI / 3;
            line([[270 + 180 * Math.cos(a), 410 + 180 * Math.sin(a)], [270 - 180 * Math.cos(a), 410 - 180 * Math.sin(a)]]);
        }
        return cs;
    }
    // Explicit fallback symbol for uncommon demonstration punctuation, not invented font coverage.
    return [rectangle(90, 0, 360, 700), reverseContour(rectangle(90 + w, w, 360 - 2 * w, 700 - 2 * w))];
}
export function createDemoFont() {
    const d = createFont('Counterform Grotesk');
    d.info.designer = 'Counterform Studio';
    d.info.copyright = 'Original editable demonstration outlines';
    d.axes = [{ tag: 'wght', name: 'Weight', min: 300, default: 400, max: 800 }];
    d.masters = [{ id: 'regular', name: 'Regular', location: { wght: 400 } }, { id: 'light', name: 'Light', location: { wght: 300 } }, { id: 'bold', name: 'Bold', location: { wght: 800 } }];
    d.instances = [{ name: 'Light', location: { wght: 300 } }, { name: 'Regular', location: { wght: 400 } }, { name: 'Medium', location: { wght: 500 } }, { name: 'Bold', location: { wght: 800 } }];
    const nd = createGlyph('.notdef', null, d.masters);
    for (const l of nd.layers) {
        l.contours = [rectangle(80, 0, 430, 700), reverseContour(rectangle(150, 70, 290, 560))];
        l.advanceWidth = 620;
    }
    d.glyphs.push(nd);
    for (let cp = 32; cp < 127; cp++) {
        const ch = String.fromCodePoint(cp), g = createGlyph(cp === 32 ? 'space' : ch, cp, d.masters);
        g.category = /[A-Za-z]/.test(ch) ? 'Letter' : /[0-9]/.test(ch) ? 'Number' : 'Punctuation';
        for (const l of g.layers) {
            l.contours = demoOutlines(ch, l.masterId === 'bold' ? 115 : l.masterId === 'light' ? 48 : 70);
            l.advanceWidth = ch === ' ' ? 300 : ch === 'm' ? 760 : 'ijl!.,:;'.includes(ch) ? 450 : 640;
        }
        g.mark = cp < 91 ? 'approved' : 'none';
        d.glyphs.push(g);
    }
    for (const [letter, cp] of [['á', 225], ['é', 233], ['ó', 243], ['ń', 324], ['ą', 261], ['ę', 281]]) {
        const base = { á: 'a', é: 'e', ó: 'o', ń: 'n', ą: 'a', ę: 'e' }[letter], g = createGlyph(letter, cp, d.masters);
        for (const l of g.layers) {
            l.components = [{ glyphId: d.glyphs.find(g => g.name === base).id, transform: [1, 0, 0, 1, 0, 0] }];
            l.contours = stroke('ąę'.includes(letter) ? [[440, 0], [420, -110], [510, -110]] : [[235, 610], [355, 740]], 60);
        }
        d.glyphs.push(g);
    }
    for (const master of d.masters)
        d.kerning[master.id] = { 'A/V': -85, 'A/W': -60, 'T/o': -70, 'T/a': -60, 'V/a': -55, 'W/a': -40, 'Y/o': -75, 'L/T': -35 };
    d.notes = 'Counterform Grotesk is an original geometric demonstration, not a finished commercial typeface. Open your own .ttf or .otf to work with production outlines.';
    return new FontDocument(d);
}


/** Stable source identities; no implicit variant inferred from glyph names. */
export function validateVariationSequences(data, glyphs = data.glyphs) {
    const rows = data.variationSequences;
    if (rows === undefined) return;
    if (!Array.isArray(rows) || rows.length > 1_000_000) throw new RangeError('UVS source entry budget exceeded');
    const ids = new Set(glyphs.map(g=>g.id)), cps = new Set(glyphs.flatMap(g=>g.unicodes)), seen = new Set();
    for (const r of rows) {
        if (!r || !Number.isInteger(r.unicode) || r.unicode < 0 || r.unicode > 0x10ffff ||
            r.unicode >= 0xd800 && r.unicode <= 0xdfff || isVariationSelector(r.unicode) || !isVariationSelector(r.selector)) throw new Error('Invalid Unicode variation sequence');
        const key = `${r.unicode}/${r.selector}`;
        if (seen.has(key)) throw new Error('Duplicate Unicode variation sequence');
        seen.add(key);
        if (r.glyphId === null) { if (!cps.has(r.unicode)) throw new Error('Default variation sequence needs an encoded base glyph'); }
        else if (typeof r.glyphId !== 'string' || !ids.has(r.glyphId)) throw new Error('Variation sequence references a missing or non-exported glyph');
    }
}
