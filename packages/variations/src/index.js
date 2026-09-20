import {mapAxisCoordinate,encodeAvar} from '@wieslawsoltes/counterform-varstore';
import {compileLayout} from '@wieslawsoltes/counterform-opentype';
import { compileMetricVariations, masterInfo, metricTags } from './metrics.js';
export { compileMetricVariations, masterInfo } from './metrics.js';
import { clamp, segments, splitCubic, mix, distance } from '@wieslawsoltes/counterform-geometry';
import { Writer } from '@wieslawsoltes/counterform-binary';
import { FontDocument } from '@wieslawsoltes/counterform-model';
import { compileTrueType, exportGlyphOrder } from '@wieslawsoltes/counterform-font-io';
export function normalizeLocation(location, axes) { const out = {}; for (const a of axes) {
    const v = clamp(location[a.tag] ?? a.default, a.min, a.max), d = v - a.default;
    out[a.tag] = mapAxisCoordinate(d === 0 ? 0 : d / (d < 0 ? a.default - a.min : a.max - a.default),a.map);
} return out; }
export function supportScalar(location, support) { let scalar = 1; for (const [axis, [lo, peak, hi]] of Object.entries(support)) {
    if (!peak)
        continue;
    const v = location[axis] || 0;
    if (v === peak)
        continue;
    if (v <= lo || v >= hi)
        return 0;
    scalar *= v < peak ? (v - lo) / (peak - lo) : (hi - v) / (hi - peak);
} return scalar; }
const lex = (a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const v = Array.isArray(a[i]) ? lex(a[i], b[i]) : a[i] < b[i] ? -1 : a[i] > b[i] ? 1 : 0;
    if (v)
        return v;
} return a.length - b.length; };
/** Sparse-master support regions following fontTools' open-source VariationModel algorithm.
 * See THIRD_PARTY_NOTICES.md for the algorithm reference and BSD license attribution.
 */
export class VariationModel {
    constructor(locations, axisOrder = []) {
        this.original = locations.map(l => Object.fromEntries(Object.entries(l).filter(([, v]) => v !== 0)));
        const identity = l => JSON.stringify(Object.entries(l).sort(([a], [b]) => a < b ? -1 : 1));
        if (new Set(this.original.map(identity)).size !== locations.length)
            throw new Error('Master locations must be unique');
        if (!this.original.some(l => !Object.keys(l).length))
            throw new Error('A master at the default location is required');
        const axisPoints = {};
        for (const l of this.original) {
            const keys = Object.keys(l);
            if (keys.length === 1) {
                const a = keys[0];
                (axisPoints[a] ??= new Set([0])).add(l[a]);
            }
        }
        const key = l => { const names = Object.keys(l), ordered = [...axisOrder.filter(a => a in l), ...names.filter(a => !axisOrder.includes(a)).sort()]; return [names.length, -names.filter(a => axisPoints[a]?.has(l[a])).length, ordered.map(a => axisOrder.includes(a) ? axisOrder.indexOf(a) : 65536), ordered, ordered.map(a => Math.sign(l[a])), ordered.map(a => Math.abs(l[a]))]; };
        this.order = this.original.map((location, index) => ({ location, index })).sort((a, b) => lex(key(a.location), key(b.location)));
        this.locations = this.order.map(o => o.location);
        this.supports = [];
        this.deltaWeights = [];
        for (let i = 0; i < this.locations.length; i++) {
            const loc = this.locations[i], region = Object.fromEntries(Object.entries(loc).map(([a, v]) => [a, v > 0 ? [0, v, 1] : [-1, v, 0]])), axes = Object.keys(region);
            for (const prev of this.supports) {
                if (Object.keys(prev).length !== axes.length || axes.some(a => !prev[a]))
                    continue;
                if (axes.some(a => { const [lo, peak, hi] = region[a], v = prev[a][1]; return v !== peak && !(lo < v && v < hi); }))
                    continue;
                let best = -1, cuts = [];
                for (const a of axes) {
                    const [lo, peak, hi] = region[a], v = prev[a][1];
                    if (v === peak)
                        continue;
                    const ratio = v < peak ? (v - peak) / (lo - peak) : (v - peak) / (hi - peak);
                    if (ratio > best) {
                        best = ratio;
                        cuts = [];
                    }
                    if (ratio === best)
                        cuts.push([a, v < peak ? [v, peak, hi] : [lo, peak, v]]);
                }
                for (const [a, t] of cuts)
                    region[a] = t;
            }
            this.supports.push(region);
            this.deltaWeights.push(this.supports.slice(0, i).map((s, j) => [j, supportScalar(loc, s)]).filter(([, v]) => v !== 0));
        }
    }
    deltas(values) { if (values.length !== this.order.length)
        throw new Error('Master value count mismatch'); const ds = []; for (let i = 0; i < this.order.length; i++) {
        let value = values[this.order[i].index];
        for (const [j, w] of this.deltaWeights[i])
            value -= ds[j] * w;
        ds.push(value);
    } return ds; }
    scalars(location) { return this.supports.map(s => supportScalar(location, s)); }
    weights(location) { const s = this.scalars(location); for (let i = s.length - 1; i >= 0; i--)
        for (const [j, w] of this.deltaWeights[i])
            s[j] -= s[i] * w; const out = new Array(s.length).fill(0); this.order.forEach((m, i) => out[m.index] = s[i]); return out; }
    interpolate(location, values) { return this.weights(location).reduce((sum, w, i) => sum + w * values[i], 0); }
}
export function compatibility(layers) { if (!layers.length)
    return ['No master layers']; const first = layers[0], errors = []; layers.slice(1).forEach((l, i) => { if (l.contours.length !== first.contours.length)
    errors.push(`Master ${i + 2}: contour count differs`);
else
    l.contours.forEach((c, j) => { const a = first.contours[j]; if (c.closed !== a.closed || c.nodes.length !== a.nodes.length)
        errors.push(`Master ${i + 2}, contour ${j + 1}: topology differs`);
    else
        c.nodes.forEach((n, k) => { if (!!n.in !== !!a.nodes[k].in || !!n.out !== !!a.nodes[k].out)
            errors.push(`Master ${i + 2}, contour ${j + 1}, point ${k + 1}: handle topology differs`); }); }); if (l.anchors.length !== first.anchors.length || l.anchors.some((a, j) => a.name !== first.anchors[j]?.name))
    errors.push(`Master ${i + 2}: anchors differ`); if (l.components.length !== first.components.length || l.components.some((c, j) => (c.glyphId || c.glyphName) !== (first.components[j]?.glyphId || first.components[j]?.glyphName)))
    errors.push(`Master ${i + 2}: component graph differs`); }); return errors; }
export function modelForDocument(doc) { const axes = doc.data.axes; return new VariationModel(doc.data.masters.map(m => normalizeLocation(m.location || {}, axes)), axes.map(a => a.tag)); }
export function interpolateLayer(layers, weights) { const errors = compatibility(layers); if (errors.length)
    throw new Error(errors[0]); const out = structuredClone(layers[0]), sum = get => weights.reduce((s, w, i) => s + w * get(layers[i]), 0); out.advanceWidth = sum(l => l.advanceWidth); out.contours.forEach((c, ci) => c.nodes.forEach((n, ni) => { n.x = sum(l => l.contours[ci].nodes[ni].x); n.y = sum(l => l.contours[ci].nodes[ni].y); for (const h of ['in', 'out'])
    if (n[h])
        for (const dim of ['x', 'y'])
            n[h][dim] = sum(l => l.contours[ci].nodes[ni][h][dim]); })); out.anchors.forEach((a, j) => { a.x = sum(l => l.anchors[j].x); a.y = sum(l => l.anchors[j].y); }); out.components.forEach((c, j) => c.transform = c.transform.map((_, k) => sum(l => l.components[j].transform[k]))); return out; }
export function instanceDocument(doc, location, { name = 'Instance' } = {}) { if (!doc.data.axes.length)
    return new FontDocument(structuredClone(doc.data)); const model = modelForDocument(doc), weights = model.weights(normalizeLocation(location, doc.data.axes)), data = structuredClone(doc.data), masters = doc.data.masters; data.glyphs = doc.data.glyphs.map(g => { const layers = masters.map(m => g.layers.find(l => l.masterId === m.id)); if (layers.some(l => !l))
    throw new Error(`${g.name}: missing master layer`); const evaluated=doc.data.glyphs.some(g=>g.layers.some(l=>l.modifiers?.some(m=>m.enabled!==false))); const sources=evaluated?layers.map((l,i)=>({...l,contours:doc.resolve(g.id,masters[i].id),components:[],modifiers:[]})):layers; const layer = interpolateLayer(sources, weights); layer.masterId = 'instance'; return { ...structuredClone(g), layers: [layer] }; }); const keys = new Set(masters.flatMap(m => Object.keys(doc.data.kerning[m.id] || {}))), kern = {}; for (const k of keys)
    kern[k] = weights.reduce((s, w, i) => s + w * (doc.data.kerning[masters[i].id]?.[k] || 0), 0); data.kerning = { instance: kern }; data.masters = [{ id: 'instance', name, location: {} }]; data.axes = []; data.instances = []; for (const key of Object.keys(metricTags)) data.info[key] = model.interpolate(normalizeLocation(location, doc.data.axes), masters.map(m => masterInfo(doc,m)[key])); data.info.styleName = name; if (location.wght !== undefined)
    data.info.weightClass = Math.round(location.wght); return new FontDocument(data); }
function uniformQuadratics(curves, tolerance, depth = 0) {
    const qs = curves.map(p => ({ control: { x: (3 * p[1].x - p[0].x + 3 * p[2].x - p[3].x) / 4, y: (3 * p[1].y - p[0].y + 3 * p[2].y - p[3].y) / 4 }, end: p[3] }));
    const ok = curves.every((p, i) => Math.max(distance(mix(p[0], qs[i].control, 2 / 3), p[1]), distance(mix(p[3], qs[i].control, 2 / 3), p[2])) <= tolerance);
    if (ok || depth === 12)
        return qs.map(q => [q]);
    const split = curves.map(p => splitCubic(...p)), l = uniformQuadratics(split.map(s => s[0]), tolerance, depth + 1), r = uniformQuadratics(split.map(s => s[1]), tolerance, depth + 1);
    return l.map((a, i) => [...a, ...r[i]]);
}
/** All masters share subdivision decisions; independently approximating curves breaks gvar point identity. */
export function compatibleQuadratics(masterContours, tolerance = .25) {
    const fake = masterContours.map(cs => ({ contours: cs, anchors: [], components: [] })), errors = compatibility(fake);
    if (errors.length)
        throw new Error(errors[0]);
    const results = masterContours.map(() => []);
    masterContours[0].forEach((c, ci) => { if (!c.closed || c.nodes.length < 2)
        return; const pts = masterContours.map(cs => [{ x: cs[ci].nodes[0].x, y: cs[ci].nodes[0].y, on: true }]), ss = masterContours.map(cs => [...segments(cs[ci])]); ss[0].forEach((s, si) => { if (s.curve) {
        const q = uniformQuadratics(ss.map(a => { const t = a[si]; return [t.p0, t.p1, t.p2, t.p3]; }), tolerance);
        q.forEach((list, mi) => list.forEach(q => pts[mi].push({ ...q.control, on: false }, { ...q.end, on: true })));
    }
    else
        ss.forEach((a, mi) => pts[mi].push({ x: a[si].b.x, y: a[si].b.y, on: true })); }); pts.forEach((a, mi) => { a.pop(); results[mi].push(a); }); });
    return results;
}
function packedDeltas(values) { const w = new Writer(); for (let i = 0; i < values.length;) {
    const zero = values[i] === 0, wide = values[i] < -128 || values[i] > 127;
    let j = i + 1;
    while (j < values.length && j - i < 64 && (values[j] === 0) === zero && (zero || (values[j] < -128 || values[j] > 127) === wide))
        j++;
    w.u8((zero ? 128 : wide ? 64 : 0) + (j - i - 1));
    if (!zero)
        for (let k = i; k < j; k++) {
            if (values[k] < -32768 || values[k] > 32767)
                throw new RangeError('Variation delta exceeds int16');
            wide ? w.i16(values[k]) : w.i8(values[k]);
        }
    i = j;
} return w.finish(); }
function fvar(data, extraNames) { const axes = data.axes, instances = data.instances || [], w = new Writer().u16(1).u16(0).u16(16).u16(2).u16(axes.length).u16(20).u16(instances.length).u16(4 + axes.length * 4); axes.forEach((a, i) => { extraNames.push([256 + i, a.name || a.tag]); w.tag(a.tag).fixed(a.min).fixed(a.default).fixed(a.max).u16(0).u16(256 + i); }); instances.forEach((inst, i) => { extraNames.push([256 + axes.length + i, inst.name]); w.u16(256 + axes.length + i).u16(0); for (const a of axes)
    w.fixed(clamp(inst.location[a.tag] ?? a.default, a.min, a.max)); }); return w.finish(); }
function stat(data) { const axes = data.axes, w = new Writer().u16(1).u16(2).u16(8).u16(axes.length).u32(20).u16(0).u32(0).u16(2); axes.forEach((a, i) => w.tag(a.tag).u16(256 + i).u16(i)); return w.finish(); }
/** gvar stores full-point deltas (no IUP approximation), embedded peaks and intermediate regions. */
export function compileVariableTrueType(doc, { tolerance = .25 } = {}) {
    const axes = doc.data.axes;
    if (!axes.length || axes.length > 16)
        throw new Error('Variable export requires 1–16 axes');
    const model = modelForDocument(doc), masters = doc.data.masters, baseIndex = model.order[0].index, baseId = masters[baseIndex].id, glyphs = exportGlyphOrder(doc), baseContours = [], glyphBlocks = [];
    for (const g of glyphs) {
        const layers = masters.map(m => g.layers.find(l => l.masterId === m.id));
        if (layers.some(l => !l))
            throw new Error(`${g.name}: missing master`);
        const resolved = masters.map(m => doc.glyph(g.id) ? doc.resolve(g.id, m.id) : []), q = compatibleQuadratics(resolved, tolerance);
        baseContours.push(q[baseIndex]);
        const points = q.map((cs, mi) => { const p = cs.flat().map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })); p.push({ x: 0, y: 0 }, { x: Math.round(layers[mi].advanceWidth), y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }); return p; }), count = points[0].length, xd = [], yd = [];
        for (let p = 0; p < count; p++) {
            xd[p] = model.deltas(points.map(ps => ps[p].x)).map(Math.round);
            yd[p] = model.deltas(points.map(ps => ps[p].y)).map(Math.round);
        }
        const tuples = [];
        for (let ti = 1; ti < model.order.length; ti++) {
            const x = xd.map(ds => ds[ti]), y = yd.map(ds => ds[ti]);
            if (!x.some(Boolean) && !y.some(Boolean))
                continue;
            const dx = packedDeltas(x), dy = packedDeltas(y), payload = new Writer().u8(0).raw(dx).raw(dy).finish();
            if (payload.length > 65535)
                throw new RangeError(`${g.name}: tuple payload exceeds 64 KiB`);
            tuples.push({ support: model.supports[ti], payload });
        }
        if (!tuples.length) {
            glyphBlocks.push(new Uint8Array());
            continue;
        }
        const w = new Writer().u16(tuples.length).u16(4 + tuples.length * (4 + axes.length * 6));
        for (const t of tuples) {
            w.u16(t.payload.length).u16(0xe000);
            for (const a of axes)
                w.f2dot14(t.support[a.tag]?.[1] || 0);
            for (const a of axes)
                w.f2dot14(t.support[a.tag]?.[0] || 0);
            for (const a of axes)
                w.f2dot14(t.support[a.tag]?.[2] || 0);
        }
        for (const t of tuples)
            w.raw(t.payload);
        glyphBlocks.push(w.finish());
    }
    const headerSize = 20 + (glyphs.length + 1) * 4, w = new Writer().u16(1).u16(0).u16(axes.length).u16(0).u32(0).u16(glyphs.length).u16(1).u32(headerSize);
    let offset = 0;
    for (const b of glyphBlocks) {
        w.u32(offset);
        offset += b.length;
    }
    w.u32(offset);
    for (const b of glyphBlocks)
        w.raw(b);
    const names = [], tables = new Map([['gvar', w.finish()], ['fvar', fvar(doc.data, names)], ['STAT', stat(doc.data)]]);
    const avar=encodeAvar(doc.data.axes); if(avar) tables.set('avar',avar);
    for (const [tag, bytes] of compileMetricVariations(doc,model,glyphs)) tables.set(tag,bytes);
    for(const [tag,bytes] of compileLayout(doc.data,glyphs,baseId,model).tables)tables.set(tag,bytes);
    const compiled = new FontDocument({...doc.data,info:masterInfo(doc,masters[baseIndex])});
    try { return compileTrueType(compiled, { masterId: baseId, quadraticContours: baseContours, extraTables: tables, extraNames: names }); } finally { compiled.dispose(); }
}


export function variationMetadata(data) { const names=[],tables=new Map([['fvar',fvar(data,names)],['STAT',stat(data)]]),avar=encodeAvar(data.axes); if(avar)tables.set('avar',avar); return {tables,names}; }
