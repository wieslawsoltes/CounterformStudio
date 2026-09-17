import {VariationStoreBuilder,variationIndex} from '@wieslawsoltes/counterform-varstore';
import { Writer, Reader } from '@wieslawsoltes/counterform-binary';
export const pairKey = (left, right) => JSON.stringify([left, right]);
export function parsePairKey(key) {
    if (key.startsWith('[')) {
        const pair = JSON.parse(key);
        if (!Array.isArray(pair) || pair.length !== 2 || pair.some(x => typeof x !== 'string'))
            throw new Error('Invalid kerning pair');
        return pair;
    }
    const i = key.indexOf('/');
    if (i < 0)
        throw new Error(`Invalid kerning key ${key}`);
    return [key.slice(0, i), key.slice(i + 1)];
}
export function kerningValue(data, masterId, left, right) {
    const table = data.kerning[masterId] || {};
    for (const key of [pairKey(left, right), `${left}/${right}`])
        if (Object.hasOwn(table, key))
            return table[key];
    const groups = Object.entries(data.groups || {}), lg = groups.filter(([, a]) => a.includes(left)).map(([k]) => k), rg = groups.filter(([, a]) => a.includes(right)).map(([k]) => k);
    for (const [l, r] of [...lg.map(l => [l, right]), ...rg.map(r => [left, r]), ...lg.flatMap(l => rg.map(r => [l, r]))])
        for (const key of [pairKey(l, r), `${l}/${r}`])
            if (Object.hasOwn(table, key))
                return table[key];
    return 0;
}
export function expandKerning(data, masterId, glyphs) {
    const ids = new Map(glyphs.map((g, i) => [g.name, i])), result = new Map(), table = data.kerning[masterId] || {}, entries = Object.entries(table);
    // Least-specific first; explicit pairs are stable overrides regardless of object insertion order.
    entries.sort(([a], [b]) => parsePairKey(b).filter(n => data.groups[n]).length - parsePairKey(a).filter(n => data.groups[n]).length);
    for (const [key, value] of entries) {
        if (!Number.isFinite(value) || value < -32768 || value > 32767)
            throw new RangeError(`Invalid kerning value for ${key}`);
        const [left, right] = parsePairKey(key), ls = data.groups[left] || [left], rs = data.groups[right] || [right];
        if (ls.length * rs.length > 500000)
            throw new RangeError('Kerning class expansion exceeds pair budget');
        for (const l of ls)
            for (const r of rs)
                if (ids.has(l) && ids.has(r))
                    result.set(`${ids.get(l)},${ids.get(r)}`, { left: ids.get(l), right: ids.get(r), value: Math.round(value) });
    }
    return [...result.values()];
}
/** Deliberately strict Adobe FEA subset. Unsupported syntax is an error, never silently ignored. */
export function parseFeatures(source, glyphNames = []) {
    if (source.length > 2000000)
        throw new RangeError('Feature source budget exceeded');
    const clean = source.replace(/#[^\n]*/g, m => ' '.repeat(m.length));
    const tokens = [...clean.matchAll(/@[A-Za-z_][\w.]*|[A-Za-z_.$][\w.$-]*|-?\d+|[{}\[\];=]|\S/g)].map(m => ({ value: m[0], offset: m.index }));
    const classes = new Map(), features = [];
    let i = 0;
    const names = new Set(glyphNames);
    const error = (message, t = tokens[i]) => { const offset = t?.offset ?? source.length, line = source.slice(0, offset).split('\n').length; const e = new SyntaxError(`${message} (line ${line})`); e.line = line; e.offset = offset; throw e; };
    const peek = () => tokens[i]?.value, take = () => tokens[i++]?.value, expect = s => { if (take() !== s)
        error(`Expected '${s}'`, tokens[i - 1]); };
    const glyph = t => { if (names.size && !names.has(t))
        error(`Unknown glyph '${t}'`, tokens[i - 1]); return t; };
    const group = () => { const t = take(); if (!t)
        error('Expected glyph'); if (t.startsWith('@')) {
        if (!classes.has(t))
            error(`Unknown class ${t}`);
        return classes.get(t);
    } if (t === '[') {
        const a = [];
        while (peek() !== ']') {
            if (!peek())
                error('Unclosed glyph class');
            a.push(glyph(take()));
        }
        expect(']');
        return a;
    } return [glyph(t)]; };
    while (i < tokens.length) {
        const t = take();
        if (t.startsWith('@')) {
            expect('=');
            const a = group();
            expect(';');
            if (classes.has(t))
                error(`Duplicate class ${t}`);
            classes.set(t, a);
        }
        else if (t === 'languagesystem') {
            const script = take(), lang = take();
            expect(';');
            if (!['DFLT', 'latn'].includes(script) || lang !== 'dflt')
                error('Only DFLT/latn dflt language declarations are currently compiled');
        }
        else if (t === 'feature') {
            const tag = take();
            if (!/^[\x20-\x7e]{4}$/.test(tag || ''))
                error('Feature tags require four ASCII characters');
            expect('{');
            const rules = [];
            while (peek() !== '}') {
                if (!peek())
                    error('Unclosed feature block');
                const op = take();
                if (op === 'sub' || op === 'substitute') {
                    const input = [];
                    while (peek() !== 'by') {
                        if ([';', '}', undefined].includes(peek()))
                            error("Expected 'by' in substitution");
                        input.push(group());
                    }
                    expect('by');
                    const output = group();
                    expect(';');
                    if (input.length === 1) {
                        if (output.length !== 1 && output.length !== input[0].length)
                            error('Substitution classes must have equal length');
                        input[0].forEach((g, k) => rules.push({ type: 'single', from: g, to: output.length === 1 ? output[0] : output[k] }));
                    }
                    else {
                        if (output.length !== 1)
                            error('Ligature substitution needs one output glyph');
                        let sequences = [[]];
                        for (const a of input) {
                            if (sequences.length * a.length > 4096)
                                error('Ligature class expansion budget exceeded');
                            sequences = sequences.flatMap(s => a.map(g => [...s, g]));
                        }
                        for (const sequence of sequences)
                            rules.push({ type: 'ligature', input: sequence, output: output[0] });
                    }
                }
                else if (op === 'pos' || op === 'position') {
                    const left = group(), right = group(), value = Number(take());
                    if (!Number.isInteger(value) || value < -32768 || value > 32767)
                        error('Position must be an int16 xAdvance');
                    expect(';');
                    if (left.length * right.length > 500000)
                        error('Position class expansion budget exceeded');
                    for (const l of left)
                        for (const r of right)
                            rules.push({ type: 'pair', left: l, right: r, value });
                }
                else
                    error(`Unsupported feature statement '${op}'`, tokens[i - 1]);
            }
            expect('}');
            expect(tag);
            expect(';');
            features.push({ tag, rules });
        }
        else
            error(`Unsupported feature syntax '${t}'`, tokens[i - 1]);
    }
    return { classes: Object.fromEntries(classes), features };
}
const bytes = w => w.finish(), tagSort = (a, b) => a < b ? -1 : a > b ? 1 : 0;
function offset16(w, p, n) { if (n > 65535)
    throw new RangeError('OpenType layout offset exceeds 16 bits; split the lookup'); w.patch16(p, n); }
function coverage(ids) { return bytes(new Writer().u16(1).u16(ids.length).raw(Uint8Array.from(ids.flatMap(i => [i >> 8, i & 255])))); }
function singleLookup(rules, ids) { const map = new Map(); for (const r of rules)
    map.set(ids.get(r.from), ids.get(r.to)); const entries = [...map].sort((a, b) => a[0] - b[0]), w = new Writer().u16(2).u16(6 + entries.length * 2).u16(entries.length); for (const [, id] of entries)
    w.u16(id); w.raw(coverage(entries.map(([id]) => id))); return w.finish(); }
function ligatureLookup(rules, ids) {
    const groups = new Map();
    for (const r of rules) {
        const key = ids.get(r.input[0]);
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push({ glyph: ids.get(r.output), components: r.input.slice(1).map(n => ids.get(n)) });
    }
    const entries = [...groups].sort((a, b) => a[0] - b[0]), w = new Writer().u16(1).u16(0).u16(entries.length);
    for (const _of of entries)
        w.u16(0);
    entries.forEach(([, rs], i) => { offset16(w, 6 + i * 2, w.pos); const start = w.pos; rs.sort((a, b) => b.components.length - a.components.length); w.u16(rs.length); for (const r of rs)
        w.u16(0); rs.forEach((r, j) => { offset16(w, start + 2 + j * 2, w.pos - start); w.u16(r.glyph).u16(r.components.length + 1); for (const c of r.components)
        w.u16(c); }); });
    offset16(w, 2, w.pos);
    return w.raw(coverage(entries.map(([g]) => g))).finish();
}
function pairLookup(pairs) {
    const groups = new Map(), variable=pairs.some(p=>p.variation);
    for(const p of pairs){if(!groups.has(p.left))groups.set(p.left,new Map());groups.get(p.left).set(p.right,p);}
    const entries=[...groups].sort((a,b)=>a[0]-b[0]),w=new Writer().u16(1).u16(0).u16(variable?0x44:4).u16(0).u16(entries.length).zeros(entries.length*2);
    entries.forEach(([,values],i)=>{
        offset16(w,10+i*2,w.pos);const pairStart=w.pos,devices=[];
        const records=[...values].sort((a,b)=>a[0]-b[0]);w.u16(records.length);
        for(const [gid,p] of records){w.u16(gid).i16(p.value);if(variable){const at=w.pos;w.u16(0);if(p.variation)devices.push({at,index:p.variation});}}
        // Device/VariationIndex offsets in format 1 are relative to PairSet, NOT PairPos.
        for(const d of devices){offset16(w,d.at,w.pos-pairStart);w.raw(variationIndex(d.index));}
    });
    offset16(w,2,w.pos);return w.raw(coverage(entries.map(([g])=>g))).finish();
}
function anchor(w,a,variation=null){
    const x=Math.round(a.x),y=Math.round(a.y);if(![x,y].every(v=>Number.isInteger(v)&&v>=-32768&&v<=32767))throw new RangeError('Anchor outside int16 coordinates');
    const vx=variation?.x,vy=variation?.y,start=w.pos;
    if(!vx&&!vy){w.u16(1).i16(x).i16(y);return;}
    w.u16(3).i16(x).i16(y).u16(0).u16(0);
    if(vx){offset16(w,start+6,w.pos-start);w.raw(variationIndex(vx));}
    if(vy){offset16(w,start+8,w.pos-start);w.raw(variationIndex(vy));}
}
function markBaseLookup(glyphs, masterId, anchorVariation=()=>null) {
    const marks = [], bases = [], classes = new Map();
    for (let i = 0; i < glyphs.length; i++) {
        const l = glyphs[i].layers.find(l => l.masterId === masterId);
        for (const a of l?.anchors || [])
            if (a.name.startsWith('_')) {
                const name = a.name.slice(1);
                if (!classes.has(name))
                    classes.set(name, classes.size);
                marks.push({ id: i, a, class: classes.get(name) });
                break;
            }
    }
    if (!marks.length)
        return null;
    for (let i = 0; i < glyphs.length; i++) {
        if (marks.some(m => m.id === i))
            continue;
        const as = glyphs[i].layers.find(l => l.masterId === masterId)?.anchors || [], relevant = as.filter(a => classes.has(a.name));
        if (relevant.length)
            bases.push({ id: i, anchors: relevant });
    }
    if (!bases.length)
        return null;
    const w = new Writer().u16(1).u16(0).u16(0).u16(classes.size).u16(0).u16(0);
    offset16(w, 2, w.pos);
    w.raw(coverage(marks.map(m => m.id)));
    offset16(w, 4, w.pos);
    w.raw(coverage(bases.map(b => b.id)));
    offset16(w, 8, w.pos);
    const ms = w.pos;
    w.u16(marks.length);
    for (const m of marks)
        w.u16(m.class).u16(0);
    marks.forEach((m, i) => { offset16(w, ms + 4 + i * 4, w.pos - ms); anchor(w, m.a, anchorVariation(m.id,m.a.name)); });
    offset16(w, 10, w.pos);
    const bs = w.pos;
    w.u16(bases.length).zeros(bases.length * classes.size * 2);
    bases.forEach((b, i) => { for (const a of b.anchors) {
        const c = classes.get(a.name);
        offset16(w, bs + 2 + (i * classes.size + c) * 2, w.pos - bs);
        anchor(w, a, anchorVariation(b.id,a.name));
    } });
    return w.finish();
}
export function layoutTable(features, lookups) {
    if (!lookups.length)
        return null;
    const fs = [...features].sort(([a], [b]) => tagSort(a, b)), w = new Writer().u32(0x10000).u16(10).u16(0).u16(0), scriptStart = w.pos;
    // DFLT and latn share default feature selection. No implicit script-specific shaping claim.
    w.u16(2).tag('DFLT').u16(14).tag('latn').u16(14);
    w.u16(4).u16(0).u16(0).u16(0xffff).u16(fs.length);
    for (let i = 0; i < fs.length; i++)
        w.u16(i);
    offset16(w, 6, w.pos);
    const featureStart = w.pos;
    w.u16(fs.length);
    for (const [tag] of fs)
        w.tag(tag).u16(0);
    fs.forEach(([, ls], i) => { offset16(w, featureStart + 2 + i * 6 + 4, w.pos - featureStart); w.u16(0).u16(ls.length); for (const li of ls)
        w.u16(li); });
    offset16(w, 8, w.pos);
    const lookupStart = w.pos;
    w.u16(lookups.length).zeros(lookups.length * 2);
    lookups.forEach((l, i) => { offset16(w, lookupStart + 2 + i * 2, w.pos - lookupStart); w.u16(l.type).u16(0).u16(1).u16(8).raw(l.bytes); });
    return w.finish();
}
export function compileLayout(data, glyphs, masterId, variationModel=null) {
    const parsed = parseFeatures(data.features || '', glyphs.map(g => g.name)), ids = new Map(glyphs.map((g, i) => [g.name, i])), sub = [], pos = [], sf = new Map(), pf = new Map();
    const add = (list, fs, tag, type, b) => { if (!b)
        return; const index = list.push({ type, bytes: b }) - 1; if (!fs.has(tag))
        fs.set(tag, []); fs.get(tag).push(index); };
    for (const f of parsed.features) {
        const single = f.rules.filter(r => r.type === 'single'), lig = f.rules.filter(r => r.type === 'ligature'), pairs = f.rules.filter(r => r.type === 'pair');
        if (single.length)
            add(sub, sf, f.tag, 1, singleLookup(single, ids));
        if (lig.length)
            add(sub, sf, f.tag, 4, ligatureLookup(lig, ids));
        if (pairs.length)
            add(pos, pf, f.tag, 2, pairLookup(pairs.map(p => ({ left: ids.get(p.left), right: ids.get(p.right), value: p.value }))));
    }
    let kern = expandKerning(data, masterId, glyphs);
    const store=variationModel?new VariationStoreBuilder(data.axes,variationModel.supports.slice(1)):null;
    const deltaIndex=values=>store.add(variationModel.deltas(values.map(Math.round)).slice(1));
    if(store){
        const sets=data.masters.map(m=>new Map(expandKerning(data,m.id,glyphs).map(p=>[`${p.left},${p.right}`,p]))),keys=new Set(sets.flatMap(m=>[...m.keys()]));
        if(keys.size>500000)throw new RangeError('Variable kerning expansion exceeds pair budget');
        const base=data.masters.findIndex(m=>m.id===masterId);
        kern=[...keys].map(key=>{const p=sets.find(m=>m.has(key)).get(key);return {left:p.left,right:p.right,value:sets[base].get(key)?.value||0,variation:deltaIndex(sets.map(m=>m.get(key)?.value||0))};});
        for(const g of glyphs){const baseNames=g.layers.find(l=>l.masterId===masterId)?.anchors.map(a=>a.name).sort()||[];
            for(const m of data.masters){const names=g.layers.find(l=>l.masterId===m.id)?.anchors.map(a=>a.name).sort()||[];if(JSON.stringify(names)!==JSON.stringify(baseNames))throw new Error(`${g.name}: incompatible variable anchors`);}}
    }
    const anchorVariation=(gid,name)=>!store?null:Object.fromEntries(['x','y'].map(dim=>[dim,deltaIndex(data.masters.map(m=>glyphs[gid].layers.find(l=>l.masterId===m.id).anchors.find(a=>a.name===name)[dim]))]));
    if (kern.length)
        add(pos, pf, 'kern', 2, pairLookup(kern));
    add(pos, pf, 'mark', 4, markBaseLookup(glyphs, masterId, anchorVariation));
    const result = new Map(), gsub = layoutTable(sf, sub), gpos = layoutTable(pf, pos);
    if (gsub)
        result.set('GSUB', gsub);
    if (gpos)
        result.set('GPOS', gpos);
    const classes = glyphs.map((g, i) => ({ i, class: g.category === 'Mark' ? 3 : g.category === 'Ligature' ? 2 : 1 }));
    const definition=new Writer().u16(2).u16(classes.length);
    for(const c of classes)definition.u16(c.i).u16(c.i).u16(c.class);
    const gdef=store?.rows.length?new Writer().u32(0x10003).u16(18).u16(0).u16(0).u16(0).u16(0).u32(18+definition.pos).raw(definition.finish()).raw(store.encode()):new Writer().u32(0x10000).u16(12).u16(0).u16(0).u16(0).raw(definition.finish());
    result.set('GDEF',gdef.finish());
    return { tables: result, parsed, kern };
}
/** Legacy kern is emitted alongside GPOS for consumers that do not implement layout. */
export function compileKern(pairs) { if (!pairs.length)
    return null; if (pairs.length > 10920)
    return null; const ps = [...pairs].sort((a, b) => a.left - b.left || a.right - b.right), n = ps.length, p = 2 ** Math.floor(Math.log2(n)), w = new Writer().u16(0).u16(1).u16(0).u16(14 + n * 6).u16(1).u16(n).u16(p * 6).u16(Math.log2(p)).u16(n * 6 - p * 6); for (const q of ps)
    w.u16(q.left).u16(q.right).i16(q.value); return w.finish(); }
export function readKern(bytes) { const r = new Reader(bytes), result = []; if (r.u16() !== 0)
    return result; const n = r.u16(); for (let i = 0; i < n; i++) {
    const start = r.pos;
    r.u16();
    const length = r.u16(), cov = r.u16();
    if (length < 6)
        throw new Error('Invalid kern subtable');
    if ((cov >> 8) === 0 && (cov & 1) && !(cov & 6)) {
        const count = r.u16();
        r.skip(6);
        for (let j = 0; j < count; j++)
            result.push({ left: r.u16(), right: r.u16(), value: r.i16() });
    }
    r.seek(start + length);
} return result; }

