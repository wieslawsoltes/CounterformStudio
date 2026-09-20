import {compileBitmapTables,readBitmapTables} from '@wieslawsoltes/counterform-bitmap';
import { compileColorTables, readColorTables, createPaletteNamePlan } from '@wieslawsoltes/counterform-color';
import { encodeUVS, readCmapUVS, Reader, Writer, sfnt, readDirectory, checksum, utf16be, decodeUTF16BE } from '@wieslawsoltes/counterform-binary';
import { FontDocument, createFont, createGlyph, validateVariationSequences } from '@wieslawsoltes/counterform-model';
import { bounds, contoursToQuadraticPoints, quadraticPointsToContour, fromSVG, transformContours, segments, uid } from '@wieslawsoltes/counterform-geometry';
import { compileLayout, compileKern, readKern, pairKey } from '@wieslawsoltes/counterform-opentype';
const round = Math.round;
const int16 = n => { n = round(n); if (!Number.isFinite(n) || n < -32768 || n > 32767)
    throw new RangeError(`Font coordinate ${n} does not fit int16`); return n; };
const uint16 = n => { n = round(n); if (!Number.isFinite(n) || n < 0 || n > 65535)
    throw new RangeError(`Font metric ${n} does not fit uint16`); return n; };
const safeName = s => s.replace(/[^A-Za-z0-9_.-]/g, c => `uni${c.codePointAt(0).toString(16).toUpperCase()}`).slice(0, 63) || 'Untitled';
export function readNames(bytes) { const r = new Reader(bytes), format = r.u16(), n = r.u16(), start = r.u16(), names = new Map(); if (format > 1 || n > 32768)
    throw new Error('Invalid name table'); for (let i = 0; i < n; i++) {
    const platform = r.u16(), encoding = r.u16(), language = r.u16(), id = r.u16(), length = r.u16(), offset = r.u16();
    const b = r.slice(start + offset, length).bytes;
    const value = platform === 0 || platform === 3 ? decodeUTF16BE(b) : new TextDecoder('macintosh').decode(b);
    if (!names.has(id) || platform === 3 && language === 0x409)
        names.set(id, value);
} return names; }
export function readCmap(bytes) {
    const r = new Reader(bytes);
    if (r.u16() !== 0)
        throw new Error('Invalid cmap version');
    const n = r.u16();
    if (n > 256)
        throw new Error('Too many cmap subtables');
    const records = [];
    for (let i = 0; i < n; i++)
        records.push({ platform: r.u16(), encoding: r.u16(), offset: r.u32() });
    const mappings = new Map();
    for (const entry of records.filter(e => e.platform === 0 || e.platform === 3).sort((a, b) => a.encoding - b.encoding)) {
        const s = r.slice(entry.offset, r.bytes.length - entry.offset), format = s.u16();
        if (format === 12 || format === 13) {
            s.u16();
            const len = s.u32();
            s.u32();
            const count = s.u32();
            if (count > 0x110000 || len > s.bytes.length)
                throw new RangeError('Invalid cmap groups');
            for (let j = 0; j < count; j++) {
                const first = s.u32(), last = s.u32(), gid = s.u32();
                if (last < first || last > 0x10ffff)
                    throw new RangeError('Invalid Unicode range');
                for (let cp = first; cp <= last; cp++) {
                    const id = format === 13 ? gid : gid + cp - first;
                    if (id && cp < 0xd800 || id && cp > 0xdfff)
                        mappings.set(cp, id);
                }
            }
        }
        else if (format === 4) {
            const len = s.u16();
            s.u16();
            const count = s.u16() / 2;
            s.skip(6);
            if (count > 32767 || len > s.bytes.length || count < 1)
                throw new Error('Invalid cmap segment count');
            const end = Array.from({ length: count }, () => s.u16());
            s.u16();
            const start = Array.from({ length: count }, () => s.u16()), delta = Array.from({ length: count }, () => s.i16()), rangeStart = s.pos, range = Array.from({ length: count }, () => s.u16());
            for (let j = 0; j < count; j++) {
                if (end[j] < start[j])
                    throw new Error('Invalid cmap segment');
                for (let cp = start[j]; cp <= end[j] && cp < 0xffff; cp++) {
                    let g;
                    if (range[j]) {
                        const p = rangeStart + j * 2 + range[j] + (cp - start[j]) * 2;
                        if (p + 2 > len)
                            throw new Error('Invalid cmap glyph offset');
                        g = s.slice(p, 2).u16();
                        if (g)
                            g = (g + delta[j]) & 65535;
                    }
                    else
                        g = (cp + delta[j]) & 65535;
                    if (g && !(cp >= 0xd800 && cp <= 0xdfff))
                        mappings.set(cp, g);
                }
            }
        }
    }
    return mappings;
}
function cmapTable(glyphs, sequences = []) {
    const map = new Map();
    glyphs.forEach((g, i) => g.unicodes.forEach(cp => { if (map.has(cp))
        throw new Error(`Duplicate Unicode U+${cp.toString(16)}`); map.set(cp, i); }));
    const entries = [...map].sort((a, b) => a[0] - b[0]), bmp = entries.filter(([cp]) => cp < 0xffff), groups = [];
    for (const [cp, gid] of entries) {
        const last = groups.at(-1);
        if (last && cp === last.end + 1 && gid === last.gid + cp - last.start)
            last.end = cp;
        else
            groups.push({ start: cp, end: cp, gid });
    }
    const f12 = new Writer().u16(12).u16(0).u32(16 + groups.length * 12).u32(0).u32(groups.length);
    for (const g of groups)
        f12.u32(g.start).u32(g.end).u32(g.gid);
    // Compress BMP into idDelta ranges. The format-12 map remains authoritative for very large repertoires.
    const ranges = [];
    for (const [cp, gid] of bmp) {
        const delta = (gid - cp) & 65535, last = ranges.at(-1);
        if (last && last.end + 1 === cp && last.delta === delta)
            last.end = cp;
        else
            ranges.push({ start: cp, end: cp, delta });
    }
    ranges.push({ start: 65535, end: 65535, delta: 1 });
    let f4 = null;
    if (ranges.length <= 8188) {
        const n = ranges.length, p = 2 ** Math.floor(Math.log2(n)), w = new Writer().u16(4).u16(16 + n * 8).u16(0).u16(n * 2).u16(p * 2).u16(Math.log2(p)).u16(n * 2 - p * 2);
        for (const g of ranges)
            w.u16(g.end);
        w.u16(0);
        for (const g of ranges)
            w.u16(g.start);
        for (const g of ranges)
            w.u16(g.delta);
        w.zeros(n * 2);
        f4 = w.finish();
    }
    const index = new Map(glyphs.map((g,i)=>[g.id,i]));
    const f14 = sequences.length ? encodeUVS(sequences.map(r=>({unicode:r.unicode,selector:r.selector,glyphIndex:r.glyphId===null?null:index.get(r.glyphId)}))) : null;
    const parts = [...(f4 ? [f4] : []),f12.finish(),...(f14 ? [f14] : [])];
    const records = [{platform:0,encoding:4,part:f4?1:0}];
    if(f14)records.push({platform:0,encoding:5,part:parts.length-1});
    if(f4)records.push({platform:3,encoding:1,part:0});
    records.push({platform:3,encoding:10,part:f4?1:0});
    const w=new Writer().u16(0).u16(records.length),offsets=[];let offset=4+records.length*8;
    for(const b of parts){offsets.push(offset);offset+=b.length;}
    for(const record of records)w.u16(record.platform).u16(record.encoding).u32(offsets[record.part]);
    for(const b of parts)w.raw(b);
    return w.finish();
}
export function nameTable(info, extra = []) {
    const family = info.familyName || 'Untitled', style = info.styleName || 'Regular', full = family + ' ' + style, ps = safeName(family) + '-' + safeName(style), values = new Map([[0, info.copyright || ''], [1, family], [2, style], [3, `${info.versionMajor || 1}.${info.versionMinor || 0};CFST;${ps}`], [4, full], [5, `Version ${info.versionMajor || 1}.${String(info.versionMinor || 0).padStart(3, '0')}`], [6, ps], [8, info.manufacturer || ''], [9, info.designer || ''], [13, info.license || ''], [16, family], [17, style], ...extra]);
    const rows = [...values].filter(([, s]) => s !== ''), w = new Writer().u16(0).u16(rows.length).u16(6 + rows.length * 12), text = new Writer();
    for (const [id, s] of rows) {
        const data = utf16be(s);
        if (data.length > 65535 || text.pos > 65535)
            throw new RangeError('Name table string budget exceeded');
        w.u16(3).u16(1).u16(0x409).u16(id).u16(data.length).u16(text.pos);
        text.raw(data);
    }
    return w.raw(text.finish()).finish();
}
function postTable(info, glyphs) { const w = new Writer().u32(0x20000).fixed(info.italicAngle || 0).i16(-100).i16(50).u32(0).zeros(16).u16(glyphs.length), names = [], map = new Map(); glyphs.forEach((g, i) => { if (i === 0)
    w.u16(0);
else {
    const name = safeName(g.name);
    if (!map.has(name)) {
        map.set(name, names.length + 258);
        names.push(name);
    }
    w.u16(map.get(name));
} }); for (const name of names) {
    const b = new TextEncoder().encode(name);
    w.u8(b.length).raw(b);
} return w.finish(); }
function os2Table(info, glyphs, metrics) {
    const cp = glyphs.flatMap(g => g.unicodes), avg = round(metrics.reduce((s, m) => s + m.width, 0) / metrics.length), bold = (info.weightClass || 400) >= 700, italic = !!info.italicAngle, selection = (italic ? 1 : 0) | (bold ? 32 : 0) | (!bold && !italic ? 64 : 0) | 128;
    const w = new Writer().u16(4).i16(int16(avg)).u16(uint16(info.weightClass || 400)).u16(uint16(info.widthClass || 5)).u16(0);
    [650, 600, 0, 75, 650, 600, 0, 350, 50, 300, 0].forEach(n => w.i16(n));
    w.zeros(10);
    // Conservative Unicode/code-page ranges: Basic Latin, Latin-1 and supplementary when encoded.
    w.u32((cp.some(x => x < 128) ? 1 : 0) | (cp.some(x => x >= 128 && x < 256) ? 2 : 0)).u32(cp.some(x => x > 65535) ? 1 << 25 : 0).u32(0).u32(0).tag('CFST').u16(selection).u16(cp.length ? Math.min(65535, ...cp) : 0).u16(cp.length ? Math.min(65535, Math.max(...cp)) : 0);
    w.i16(int16(info.ascender)).i16(int16(info.descender)).i16(int16(info.lineGap || 0)).u16(uint16(Math.max(0, info.ascender, ...metrics.map(m => m.yMax)))).u16(uint16(Math.max(0, -info.descender, ...metrics.map(m => -m.yMin))));
    w.u32(cp.some(x => x < 128) ? 1 : 0).u32(0).i16(int16(info.xHeight || 0)).i16(int16(info.capHeight || 0)).u16(0).u16(32).u16(2);
    return w.finish();
}
function baseTables(doc, glyphs, metrics, outlineFormat, masterId, extraNames = []) {
    const info = doc.info, all = metrics.filter(m => m.points || m.contours), b = all.length ? { xMin: Math.min(...all.map(m => m.xMin)), yMin: Math.min(...all.map(m => m.yMin)), xMax: Math.max(...all.map(m => m.xMax)), yMax: Math.max(...all.map(m => m.yMax)) } : { xMin: 0, yMin: 0, xMax: 0, yMax: 0 }, time = 3850070400;
    const head = new Writer().fixed(1).fixed((info.versionMajor || 1) + (info.versionMinor || 0) / 1000).u32(0).u32(0x5f0f3cf5).u16(3).u16(info.unitsPerEm).u32(0).u32(time).u32(0).u32(time);
    for (const v of Object.values(b))
        head.i16(int16(v));
    head.u16(((info.weightClass || 400) >= 700 ? 1 : 0) | (info.italicAngle ? 2 : 0)).u16(8).i16(2).i16(outlineFormat === 'ttf' ? 1 : 0).i16(0);
    const hhea = new Writer().fixed(1).i16(int16(info.ascender)).i16(int16(info.descender)).i16(int16(info.lineGap || 0)).u16(Math.max(...metrics.map(m => m.width))).i16(Math.min(...metrics.map(m => m.xMin))).i16(Math.min(...metrics.map(m => m.width - m.xMax))).i16(Math.max(...metrics.map(m => m.xMax))).i16(1).i16(0).i16(0).zeros(8).i16(0).u16(glyphs.length);
    const hm = new Writer();
    for (const m of metrics)
        hm.u16(m.width).i16(m.xMin);
    const maxp = new Writer().u32(outlineFormat === 'ttf' ? 0x10000 : 0x5000).u16(glyphs.length);
    if (outlineFormat === 'ttf')
        maxp.u16(Math.max(...metrics.map(m => m.points || 0))).u16(Math.max(...metrics.map(m => m.contours || 0))).u16(0).u16(0).u16(2).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0);
    validateVariationSequences(doc.data, glyphs);
    const colorNames=createPaletteNamePlan(doc.data,extraNames);
    const tables = new Map([['head', head.finish()], ['hhea', hhea.finish()], ['hmtx', hm.finish()], ['maxp', maxp.finish()], ['cmap', cmapTable(glyphs,doc.data.variationSequences)], ['name', nameTable(info, [...extraNames,...colorNames.names])], ['OS/2', os2Table(info, glyphs, metrics)], ['post', postTable(info, glyphs)]]);
    if (outlineFormat === 'ttf')
        tables.set('gasp', new Writer().u16(1).u16(1).u16(65535).u16(10).finish());
    const layout = compileLayout(doc.data, glyphs, masterId);
    if (outlineFormat !== 'ttf' && layout.parsed.hasContourPoints) throw new Error('Contour-point attachment anchors require TrueType outlines');
    if (layout.parsed.pointReferences?.length) {
        const points=new Map(glyphs.map((g,i)=>[g.name,metrics[i].points||0]));
        for(const r of layout.parsed.pointReferences)if(r.point>= (points.get(r.glyph)||0))throw new RangeError(`Attachment point ${r.point} is outside the compiled outline of '${r.glyph}'`);
    }
    for (const [k, v] of layout.tables)
        tables.set(k, v);
    const kern = compileKern(layout.kern);
    if (kern)
        tables.set('kern', kern);
    for (const [tag, bytes] of compileColorTables(doc.data, glyphs,{namePlan:colorNames})) tables.set(tag, bytes);
    for (const [tag, bytes] of compileBitmapTables(doc.data,glyphs,metrics.map(m=>m.width))) tables.set(tag,bytes);
    return tables;
}
export function exportGlyphOrder(doc) { let glyphs = doc.data.glyphs.filter(g => g.export !== false); const notdef = glyphs.find(g => g.name === '.notdef'); if (notdef)
    glyphs = [notdef, ...glyphs.filter(g => g !== notdef)];
else {
    const g = createGlyph('.notdef', null, doc.data.masters);
    glyphs = [g, ...glyphs];
} if (glyphs.length > 65535)
    throw new RangeError('OpenType supports at most 65535 glyphs'); return glyphs; }
export function encodeGlyf(contours, width) {
    if (contours.length > 32767)
        throw new RangeError('Too many contours');
    const pts = contours.flat().map(p => ({ x: int16(p.x), y: int16(p.y), on: p.on }));
    if (pts.length > 65535)
        throw new RangeError('Too many points in one glyph');
    const m = { width: uint16(width), xMin: pts.length ? Math.min(...pts.map(p => p.x)) : 0, yMin: pts.length ? Math.min(...pts.map(p => p.y)) : 0, xMax: pts.length ? Math.max(...pts.map(p => p.x)) : 0, yMax: pts.length ? Math.max(...pts.map(p => p.y)) : 0, points: pts.length, contours: contours.length };
    if (!pts.length)
        return { bytes: new Uint8Array(), metrics: m };
    const w = new Writer().i16(contours.length).i16(m.xMin).i16(m.yMin).i16(m.xMax).i16(m.yMax);
    let end = -1;
    for (const c of contours) {
        end += c.length;
        w.u16(end);
    }
    w.u16(0); // No hinting bytecode: explicitly unhinted output.
    for (const p of pts)
        w.u8(p.on ? 1 : 0);
    let x = 0, y = 0;
    for (const p of pts) {
        w.i16(int16(p.x - x));
        x = p.x;
    }
    for (const p of pts) {
        w.i16(int16(p.y - y));
        y = p.y;
    }
    w.align(2);
    return { bytes: w.finish(), metrics: m };
}
export function compileTrueType(doc, { masterId = doc.data.masters[0].id, tolerance = .25, quadraticContours = null, extraTables = null, extraNames = [] } = {}) { const glyphs = exportGlyphOrder(doc), glyf = new Writer(), loca = new Writer(), metrics = []; glyphs.forEach((g, i) => { loca.u32(glyf.pos); const layer = g.layers.find(l => l.masterId === masterId), cs = quadraticContours?.[i] ?? contoursToQuadraticPoints(doc.glyph(g.id) ? doc.resolve(g.id, masterId) : [], tolerance); const encoded = encodeGlyf(cs, layer?.advanceWidth || 0); metrics.push(encoded.metrics); glyf.raw(encoded.bytes); }); loca.u32(glyf.pos); const tables = baseTables(doc, glyphs, metrics, 'ttf', masterId, extraNames); tables.set('glyf', glyf.finish()); tables.set('loca', loca.finish()); if (extraTables)
    for (const [tag, b] of extraTables)
        tables.set(tag, b); return sfnt(tables); }
function cffIndex(items) { const w = new Writer().u16(items.length); if (!items.length)
    return w.finish(); const total = items.reduce((n, b) => n + b.length, 1), size = total <= 255 ? 1 : total <= 65535 ? 2 : total <= 0xffffff ? 3 : 4; w.u8(size); let offset = 1; const write = n => { for (let s = size - 1; s >= 0; s--)
    w.u8(n / 2 ** (8 * s) & 255); }; write(offset); for (const b of items) {
    offset += b.length;
    write(offset);
} for (const b of items)
    w.raw(b); return w.finish(); }
function cffInt(w, n) { n = round(n); if (n >= -107 && n <= 107)
    w.u8(n + 139);
else if (n >= 108 && n <= 1131)
    w.u8((n - 108 >> 8) + 247).u8(n - 108 & 255);
else if (n <= -108 && n >= -1131) {
    n = -n;
    w.u8((n - 108 >> 8) + 251).u8(n - 108 & 255);
}
else if (n >= -32768 && n <= 32767)
    w.u8(28).i16(n);
else
    throw new RangeError('CFF Type 2 relative operand exceeds int16'); }
function dictInt(w, n) { w.u8(29).i32(n); }
function dictReal(w, n) { const map = { '.': 10, 'E': 11, '-': 14 }, text = String(n).replace('e-', 'X').replace('e+', 'E').replace('e', 'E'), nibs = []; for (const c of text)
    nibs.push(c === 'X' ? 12 : map[c] ?? Number(c)); nibs.push(15); if (nibs.length % 2)
    nibs.push(15); w.u8(30); for (let i = 0; i < nibs.length; i += 2)
    w.u8(nibs[i] * 16 + nibs[i + 1]); }
function type2(cs, width) {
    const w = new Writer();
    cffInt(w, width);
    let x = 0, y = 0;
    for (const c of cs) {
        if (!c.closed || !c.nodes.length)
            continue;
        const start = c.nodes[0];
        cffInt(w, start.x - x);
        cffInt(w, start.y - y);
        w.u8(21);
        x = round(start.x);
        y = round(start.y);
        for (const s of segments(c)) {
            if (s.curve) {
                const p1 = { x: round(s.p1.x), y: round(s.p1.y) }, p2 = { x: round(s.p2.x), y: round(s.p2.y) }, p3 = { x: round(s.p3.x), y: round(s.p3.y) };
                for (const v of [p1.x - x, p1.y - y, p2.x - p1.x, p2.y - p1.y, p3.x - p2.x, p3.y - p2.y])
                    cffInt(w, v);
                w.u8(8);
                x = p3.x;
                y = p3.y;
            }
            else {
                const nx = round(s.b.x), ny = round(s.b.y);
                cffInt(w, nx - x);
                cffInt(w, ny - y);
                w.u8(5);
                x = nx;
                y = ny;
            }
        }
    }
    w.u8(14);
    return w.finish();
}
export function compileOpenTypeCFF(doc, { masterId = doc.data.masters[0].id } = {}) {
    const glyphs = exportGlyphOrder(doc), metrics = [], outlines = glyphs.map(g => doc.glyph(g.id) ? doc.resolve(g.id, masterId).filter(c => c.closed && c.nodes.length >= 2) : []), charStrings = cffIndex(glyphs.map((g, i) => { const width = uint16(g.layers.find(l => l.masterId === masterId)?.advanceWidth || 0), b = bounds(outlines[i]); metrics.push({ width, xMin: int16(Math.floor(b.minX)), yMin: int16(Math.floor(b.minY)), xMax: int16(Math.ceil(b.maxX)), yMax: int16(Math.ceil(b.maxY)), contours: outlines[i].length }); return type2(outlines[i], width); }));
    const encoder = new TextEncoder(), name = cffIndex([encoder.encode(safeName(doc.info.familyName) + '-' + safeName(doc.info.styleName))]), strings = cffIndex(glyphs.slice(1).map(g => encoder.encode(safeName(g.name)))), globalSubs = cffIndex([]), charset = new Writer().u8(0);
    for (let i = 1; i < glyphs.length; i++)
        charset.u16(390 + i);
    const top = (co, cs) => { const w = new Writer(); dictInt(w, co); w.u8(15); dictInt(w, cs); w.u8(17); dictInt(w, 0); dictInt(w, cs + charStrings.length); w.u8(18); [1 / doc.info.unitsPerEm, 0, 0, 1 / doc.info.unitsPerEm, 0, 0].forEach(n => dictReal(w, n)); w.u8(12).u8(7); [Math.min(...metrics.map(m => m.xMin)), Math.min(...metrics.map(m => m.yMin)), Math.max(...metrics.map(m => m.xMax)), Math.max(...metrics.map(m => m.yMax))].forEach(n => dictInt(w, n)); w.u8(5); return cffIndex([w.finish()]); };
    const top0 = top(0, 0), charsetOffset = 4 + name.length + top0.length + strings.length + globalSubs.length, charsOffset = charsetOffset + charset.pos, cff = new Writer().u8(1).u8(0).u8(4).u8(4).raw(name).raw(top(charsetOffset, charsOffset)).raw(strings).raw(globalSubs).raw(charset.finish()).raw(charStrings).finish(), tables = baseTables(doc, glyphs, metrics, 'cff', masterId);
    tables.set('CFF ', cff);
    return sfnt(tables, 0x4f54544f);
}
/** Convert sfnt to an uncompressed WOFF1 container. Deterministic, lossless table wrapping. */
export function encodeWOFF(bytes) { const { tables, flavor } = readDirectory(bytes), entries = [...tables.values()], w = new Writer().tag('wOFF').u32(flavor).u32(0).u16(entries.length).u16(0).u32(bytes.length).u16(1).u16(0).zeros(20); let offset = 44 + entries.length * 20; for (const t of entries) {
    w.tag(t.tag).u32(offset).u32(t.length).u32(t.length).u32(t.checksum);
    offset += (t.length + 3) & ~3;
} for (const t of entries)
    w.raw(t.bytes).align(); w.patch32(8, w.pos); return w.finish(); }
export async function decodeWOFF(bytes, maxBytes = 64 * 1024 * 1024) {
    const r = new Reader(bytes);
    if (r.tag() !== 'wOFF')
        throw new Error('Expected WOFF1');
    const flavor = r.u32(), length = r.u32(), n = r.u16();
    r.u16();
    const total = r.u32();
    if (length !== bytes.length || n > 4096 || total > maxBytes)
        throw new RangeError('Invalid WOFF size');
    r.seek(44);
    const entries = [];
    for (let i = 0; i < n; i++)
        entries.push({ tag: r.tag(), offset: r.u32(), compressed: r.u32(), length: r.u32(), checksum: r.u32() });
    const tables = new Map();
    let sum = 0;
    for (const t of entries) {
        if ((sum += t.length) > maxBytes || t.compressed > t.length)
            throw new RangeError('WOFF table budget exceeded');
        let b = r.slice(t.offset, t.compressed).bytes;
        if (t.length !== t.compressed) {
            if (typeof DecompressionStream === 'undefined')
                throw new Error('This environment cannot inflate compressed WOFF');
            const reader = new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate')).getReader(), chunks = [];
            let size = 0;
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    size += value.length;
                    if (size > t.length)
                        throw new RangeError('Inflated WOFF table exceeds declared size');
                    chunks.push(value);
                }
            }
            finally {
                await reader.cancel();
            }
            b = new Uint8Array(size);
            let p = 0;
            for (const c of chunks) {
                b.set(c, p);
                p += c.length;
            }
        }
        if (b.length !== t.length)
            throw new Error('WOFF length mismatch');
        tables.set(t.tag, b);
    }
    const head = tables.get('head');
    if (head)
        new DataView(head.buffer, head.byteOffset, head.byteLength).setUint32(8, 0);
    return sfnt(tables, flavor);
}
export function inspectFont(bytes) { const { tables, flavor } = readDirectory(bytes); return { format: flavor === 0x4f54544f ? 'OpenType CFF' : 'TrueType', tables: [...tables.values()].map(t => ({ tag: t.tag, length: t.length, checksum: t.checksum, validChecksum: t.tag === 'head' ? true : checksum(t.bytes) === t.checksum })), names: tables.has('name') ? Object.fromEntries(readNames(tables.get('name').bytes)) : {} }; }
function importMetadata(tables) { const get = tag => tables.get(tag)?.bytes, names = get('name') ? readNames(get('name')) : new Map(), data = createFont(names.get(16) || names.get(1) || 'Imported', names.get(17) || names.get(2) || 'Regular'); if (!get('head') || !get('hhea') || !get('maxp'))
    throw new Error('Missing required font tables'); const head = new Reader(get('head')).seek(18), h = new Reader(get('hhea')).seek(4); data.info.unitsPerEm = head.u16(); data.info.ascender = h.i16(); data.info.descender = h.i16(); data.info.lineGap = h.i16(); data.info.designer = names.get(9) || ''; data.info.copyright = names.get(0) || ''; data.info.license = names.get(13) || ''; data.info.manufacturer = names.get(8) || ''; if (get('OS/2')) {
    const r = new Reader(get('OS/2'));
    const version = r.u16();
    r.skip(2);
    data.info.weightClass = r.u16();
    data.info.widthClass = r.u16();
    if (version >= 2 && r.bytes.length >= 90) {
        r.seek(86);
        data.info.xHeight = r.i16();
        data.info.capHeight = r.i16();
    }
} if (get('post'))
    data.info.italicAngle = new Reader(get('post')).seek(4).fixed(); return data; }
/** Bounded TrueType importer retains composite relationships and exact quadratic shapes as cubics. */
export function parseTrueType(bytes, { maxGlyphs = 65535, maxPoints = 2000000 } = {}) {
    const { tables } = readDirectory(bytes);
    if (!tables.has('glyf'))
        throw new Error('CFF and compressed font import requires the Skia adapter');
    const get = tag => tables.get(tag)?.bytes, data = importMetadata(tables), n = new Reader(get('maxp')).seek(4).u16();
    if (n > maxGlyphs)
        throw new RangeError('Font glyph budget exceeded');
    const nh = new Reader(get('hhea')).seek(34).u16();
    if (!nh || nh > n)
        throw new Error('Invalid horizontal metric count');
    const hm = new Reader(get('hmtx')), widths = [], lsbs = [];
    for (let i = 0; i < n; i++) {
        if (i < nh)
            widths[i] = hm.u16();
        else
            widths[i] = widths[i - 1];
        lsbs[i] = hm.i16();
    }
    const cmap = get('cmap') ? readCmap(get('cmap')) : new Map(), byGid = new Map();
    for (const [cp, id] of cmap) {
        if (id >= n)
            throw new Error('cmap refers to missing glyph');
        if (!byGid.has(id))
            byGid.set(id, []);
        byGid.get(id).push(cp);
    }
    const taken = new Set();
    for (let i = 0; i < n; i++) {
        const cps = byGid.get(i) || [], first = cps[0];
        let name = i === 0 ? '.notdef' : first === 32 ? 'space' : first !== undefined && first >= 33 && first < 127 ? String.fromCodePoint(first) : first !== undefined ? `uni${first.toString(16).toUpperCase().padStart(4, '0')}` : `glyph${i}`;
        if (taken.has(name))
            name += `.${i}`;
        taken.add(name);
        const g = createGlyph(name, null);
        g.unicodes = cps;
        g.layers[0].advanceWidth = widths[i];
        g.category = cps.some(cp => /\p{Mark}/u.test(String.fromCodePoint(cp))) ? 'Mark' : 'Letter';
        data.glyphs.push(g);
    }
    restoreUVS(data, get('cmap'));
    const format = new Reader(get('head')).seek(50).i16(), loc = new Reader(get('loca')), offsets = Array.from({ length: n + 1 }, () => format === 0 ? loc.u16() * 2 : loc.u32()), glyf = new Reader(get('glyf')), cache = new Map();
    let totalPoints = 0;
    const raw = (id, stack = new Set()) => {
        if (cache.has(id))
            return cache.get(id);
        if (stack.has(id) || stack.size > 32)
            throw new Error('Cyclic/deep TrueType component');
        if (id < 0 || id >= n)
            throw new Error('Invalid component glyph');
        const size = offsets[id + 1] - offsets[id];
        if (size < 0)
            throw new Error('Invalid loca offsets');
        if (!size) {
            const empty = { contours: [], components: [], points: [] };
            cache.set(id, empty);
            return empty;
        }
        const r = glyf.slice(offsets[id], size), count = r.i16();
        r.skip(8);
        let cs = [], components = [], points = [];
        if (count >= 0) {
            const ends = Array.from({ length: count }, () => r.u16()), num = count ? ends.at(-1) + 1 : 0;
            if ((totalPoints += num) > maxPoints)
                throw new RangeError('Font point budget exceeded');
            for (let j = 1; j < ends.length; j++)
                if (ends[j] <= ends[j - 1])
                    throw new Error('Non-monotonic contour endpoints');
            r.skip(r.u16());
            const flags = [];
            while (flags.length < num) {
                const flag = r.u8();
                flags.push(flag);
                if (flag & 8) {
                    const repeat = r.u8();
                    if (flags.length + repeat > num)
                        throw new Error('Invalid point flag repeat');
                    for (let k = 0; k < repeat; k++)
                        flags.push(flag);
                }
            }
            let x = 0, y = 0;
            for (const f of flags) {
                x += (f & 2) ? (f & 16 ? 1 : -1) * r.u8() : (f & 16) ? 0 : r.i16();
                points.push({ x, y: 0, on: !!(f & 1) });
            }
            flags.forEach((f, i) => { y += (f & 4) ? (f & 32 ? 1 : -1) * r.u8() : (f & 32) ? 0 : r.i16(); points[i].y = y; });
            let start = 0;
            for (const e of ends) {
                cs.push(points.slice(start, e + 1));
                start = e + 1;
            }
        }
        else {
            let flag;
            const next = new Set(stack);
            next.add(id);
            do {
                flag = r.u16();
                const target = r.u16(), xy = !!(flag & 2), a = flag & 1 ? (xy ? r.i16() : r.u16()) : (xy ? r.i8() : r.u8()), b = flag & 1 ? (xy ? r.i16() : r.u16()) : (xy ? r.i8() : r.u8());
                let xx = 1, yy = 1, yx = 0, xyv = 0;
                if (flag & 8)
                    xx = yy = r.f2dot14();
                else if (flag & 64) {
                    xx = r.f2dot14();
                    yy = r.f2dot14();
                }
                else if (flag & 128) {
                    xx = r.f2dot14();
                    yx = r.f2dot14();
                    xyv = r.f2dot14();
                    yy = r.f2dot14();
                }
                const child = raw(target, next), transform = p => ({ x: xx * p.x + xyv * p.y, y: yx * p.x + yy * p.y, on: p.on });
                let dx = xy ? a : 0, dy = xy ? b : 0;
                if (xy && (flag & 2048)) {
                    [dx, dy] = [xx * dx + xyv * dy, yx * dx + yy * dy];
                }
                if (!xy) {
                    const parentPoint = points[a], childPoint = child.points[b];
                    if (!parentPoint || !childPoint)
                        throw new Error('Invalid composite point attachment');
                    const p = transform(childPoint);
                    dx = parentPoint.x - p.x;
                    dy = parentPoint.y - p.y;
                }
                if (flag & 4) {
                    dx = round(dx);
                    dy = round(dy);
                }
                const apply = p => { const q = transform(p); q.x += dx; q.y += dy; return q; };
                cs.push(...child.contours.map(c => c.map(apply)));
                points.push(...child.points.map(apply));
                components.push({ glyphId: data.glyphs[target].id, transform: [xx, yx, xyv, yy, dx, dy] });
                if (components.length > 1024)
                    throw new RangeError('Component budget exceeded');
            } while (flag & 32);
            if (flag & 256)
                r.skip(r.u16());
        }
        const value = { contours: cs, components, points };
        cache.set(id, value);
        return value;
    };
    for (let i = 0; i < n; i++) {
        const g = data.glyphs[i], l = g.layers[0], outline = raw(i);
        if (outline.components.length)
            l.components = outline.components;
        else
            l.contours = outline.contours.map(quadraticPointsToContour);
    }
    if (get('kern'))
        for (const k of readKern(get('kern')))
            if (data.glyphs[k.left] && data.glyphs[k.right])
                data.kerning.regular[pairKey(data.glyphs[k.left].name, data.glyphs[k.right].name)] = k.value;
    const supported = new Set(['head', 'hhea', 'maxp', 'hmtx', 'cmap', 'glyf', 'loca', 'name', 'OS/2', 'post', 'kern']);
    const colorWarnings = [];
    if (get('COLR') && get('CPAL')) {
        try {
            const colors = readColorTables(get('COLR'), get('CPAL'), data.glyphs,{names:get('name')?readNames(get('name')):new Map()});
            data.palettes = colors.palettes;
            for (const g of data.glyphs) if (colors.colorLayers.has(g.id)) g.colorLayers = colors.colorLayers.get(g.id);
            for (const g of data.glyphs) {if(colors.colorPaints.has(g.id))g.colorPaint=colors.colorPaints.get(g.id);if(colors.colorClips.has(g.id))g.colorClip=colors.colorClips.get(g.id);}
            for(const key of ['paletteTypes','paletteLabels','paletteEntryLabels'])if(colors[key])data[key]=colors[key];
            supported.add('COLR'); supported.add('CPAL');
        } catch (error) { colorWarnings.push('Color reconstruction: ' + error.message); }
    }
    const bitmaps=readBitmapTables(tables,data.glyphs.map(g=>g.id));
    if(bitmaps.bitmapFont){data.bitmapFont=bitmaps.bitmapFont;for(const g of data.glyphs)if(bitmaps.bitmaps.has(g.id))g.bitmaps=bitmaps.bitmaps.get(g.id);}
    for(const tag of bitmaps.supported)supported.add(tag);colorWarnings.push(...bitmaps.warnings);
    data.importInfo = { format: 'TrueType', tableTags: [...tables.keys()], notReconstructed: [...tables.keys()].filter(t => !supported.has(t)), warnings: [...colorWarnings, 'Hinting instructions are not retained in rebuilt output.', 'Existing advanced layout and variation tables are inventoried, not decompiled into editable feature source.'] };
    return new FontDocument(data);
}
/** Native Skia import of CFF/WOFF2/other supported containers. Uses only public SK* APIs. */
export async function importWithSkia(bytes, S, { signal, onProgress = () => { } } = {}) {
    const face = S.SKTypeface.FromData(bytes);
    if (!face)
        throw new Error('Skia could not decode this font');
    let font, outlineFace;
    try {
        const tags = face.GetTableTags().map(t => typeof t === 'string' ? t : String.fromCharCode(t >>> 24, (t >>> 16) & 255, (t >>> 8) & 255, t & 255)), tables = new Map(tags.map(tag => [tag, { bytes: new Uint8Array(face.GetTableData(tag)) }]));
        const data = importMetadata(tables), mapping = tables.has('cmap') ? readCmap(tables.get('cmap').bytes) : new Map(), byId = new Map();
        for (const [cp, id] of mapping) {
            if (!byId.has(id))
                byId.set(id, []);
            byId.get(id).push(cp);
        }
        const count = face.GlyphCount;
        if (count > 65535)
            throw new RangeError('Too many glyphs');
        // Embedded strikes can make GetGlyphPath return null and GetGlyphWidths
        // use strike metrics. Rebuild an outline-only face for extraction while
        // retaining the original face/tables for bitmap source reconstruction.
        // The private table copy never replaces the untouched imported archive.
        if (tags.some(tag => ['sbix','CBDT','CBLC','EBDT','EBLC','bdat','bloc'].includes(tag)) &&
            (tables.has('glyf') || tables.has('CFF ') || tables.has('CFF2'))) {
            const strip = new Set(['sbix','CBDT','CBLC','EBDT','EBLC','EBSC','bdat','bloc','COLR','CPAL','SVG ','DSIG']);
            const outlineTables = new Map([...tables].filter(([tag]) => !strip.has(tag)).map(([tag, value]) => [tag, value.bytes.slice()]));
            outlineFace = S.SKTypeface.FromData(sfnt(outlineTables, tables.has('glyf') ? 0x10000 : 0x4f54544f));
            if (!outlineFace || outlineFace.GlyphCount !== count) throw new Error('Could not extract an outline face independently of bitmap strikes');
        }
        font = new S.SKFont(outlineFace || face, data.info.unitsPerEm);
        font.Hinting = S.SKFontHinting?.None ?? 'None';
        font.LinearMetrics = true;
        const gids = Uint16Array.from({ length: count }, (_, i) => i), widths = font.GetGlyphWidths(gids), names = new Set();
        let nodes = 0;
        for (let i = 0; i < count; i++) {
            if (signal?.aborted)
                throw signal.reason || new DOMException('Aborted', 'AbortError');
            let name = face.GetGlyphName(i) || (i === 0 ? '.notdef' : `glyph${i}`);
            if (names.has(name))
                name += `.${i}`;
            names.add(name);
            const g = createGlyph(name, null);
            g.unicodes = byId.get(i) || [];
            g.layers[0].advanceWidth = widths[i];
            const path = font.GetGlyphPath(i);
            try {
                if (path)
                    g.layers[0].contours = transformContours(fromSVG(path.ToSvgPathData()), [1, 0, 0, -1, 0, 0]);
            }
            finally {
                path?.Dispose();
            }
            nodes += g.layers[0].contours.reduce((n, c) => n + c.nodes.length, 0);
            if (nodes > 2000000)
                throw new RangeError('Decoded point budget exceeded');
            data.glyphs.push(g);
            if (i % 64 === 0) {
                onProgress(i / count);
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        restoreUVS(data, tables.get('cmap')?.bytes);
        if (tables.has('kern'))
            for (const k of readKern(tables.get('kern').bytes))
                if (data.glyphs[k.left] && data.glyphs[k.right])
                    data.kerning.regular[pairKey(data.glyphs[k.left].name, data.glyphs[k.right].name)] = k.value;
        const bitmaps=readBitmapTables(tables,data.glyphs.map(g=>g.id));
        if(bitmaps.bitmapFont){data.bitmapFont=bitmaps.bitmapFont;for(const g of data.glyphs)if(bitmaps.bitmaps.has(g.id))g.bitmaps=bitmaps.bitmaps.get(g.id);}
        data.importInfo = { format: face.FontFormat, tableTags: tags, notReconstructed: tags.filter(t => ['GSUB', 'GPOS', 'fvar', 'gvar', 'CFF2', 'COLR', 'CPAL', 'SVG ', 'MATH', 'BASE','sbix','CBDT','CBLC'].includes(t)&&!bitmaps.supported.includes(t)), warnings: [...bitmaps.warnings,'Native import extracts default-instance outlines. Components, hinting, advanced layout and variation programs are not round-tripped.'] };
        onProgress(1);
        return new FontDocument(data);
    }
    finally {
        font?.Dispose();
        outlineFace?.Dispose();
        face.Dispose();
    }
}
export async function importFont(bytes, { skia, ...options } = {}) { bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes); if (bytes.length > 64 * 1024 * 1024)
    throw new RangeError('Font exceeds the 64 MiB import budget'); const tag = new TextDecoder('latin1').decode(bytes.subarray(0, 4)); if (tag === 'wOFF')
    bytes = await decodeWOFF(bytes); if (tag === 'wOF2') {
    if (!skia)
        throw new Error('WOFF2 import requires SkiaSharpWeb');
    return importWithSkia(bytes, skia, options);
} const dir = readDirectory(bytes); if (dir.tables.has('glyf'))
    return parseTrueType(bytes, options); if (!skia)
    throw new Error('CFF import requires SkiaSharpWeb'); return importWithSkia(bytes, skia, options); }


function restoreUVS(data,cmap) {
    if (!cmap) return;
    const rows = readCmapUVS(cmap,{glyphCount:data.glyphs.length});
    if (rows.length) data.variationSequences = rows.map(r=>({unicode:r.unicode,selector:r.selector,glyphId:r.glyphIndex===null?null:data.glyphs[r.glyphIndex].id}));
}
