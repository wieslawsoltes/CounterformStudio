import { Writer, Reader, crc32 } from '@wieslawsoltes/counterform-binary';
import { createFont, createGlyph, createLayer, FontDocument, validateDocumentShape } from '@wieslawsoltes/counterform-model';
import { contour, node, point, mix, quadraticPointsToContour } from '@wieslawsoltes/counterform-geometry';
import { parsePairKey } from '@wieslawsoltes/counterform-opentype';
const enc = new TextEncoder(), dec = new TextDecoder(), xmlEscape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
export function encodePlist(value) { const visit = v => Array.isArray(v) ? `<array>${v.map(visit).join('')}</array>` : v && typeof v === 'object' ? `<dict>${Object.entries(v).map(([k, x]) => `<key>${xmlEscape(k)}</key>${visit(x)}`).join('')}</dict>` : typeof v === 'number' ? `<${Number.isInteger(v) ? 'integer' : 'real'}>${v}</${Number.isInteger(v) ? 'integer' : 'real'}>` : typeof v === 'boolean' ? `<${v ? 'true' : 'false'}/>` : `<string>${xmlEscape(v ?? '')}</string>`; return `<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0">${visit(value)}</plist>`; }
/** Small bounded XML reader for plist/GLIF, deliberately rejects DTDs and external entities. */
export function parseXML(text) { if (text.length > 64 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(text))
    throw new Error('DTD/entity declarations are not accepted'); const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, x) => x[0] === '#' ? String.fromCodePoint(x[1].toLowerCase() === 'x' ? parseInt(x.slice(2), 16) : Number(x.slice(1))) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[x.toLowerCase()]); const root = { name: 'root', children: [], text: '', attrs: {} }, stack = [root]; let count = 0; for (const token of text.matchAll(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<[^>]+>|[^<]+/g)) {
    const t = token[0];
    if (t.startsWith('<?') || t.startsWith('<!--'))
        continue;
    if (t.startsWith('</')) {
        const name = t.slice(2, -1).trim();
        if (stack.length <= 1 || stack.pop().name !== name)
            throw new Error('Malformed XML nesting');
    }
    else if (t[0] === '<') {
        const name = /^<([\w.:-]+)/.exec(t)?.[1];
        if (!name)
            throw new Error('Unsupported XML declaration');
        const attrs = {};
        for (const m of t.matchAll(/([\w.:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))
            attrs[m[1]] = decode(m[2] ?? m[3]);
        const n = { name, attrs, children: [], text: '' };
        stack.at(-1).children.push(n);
        if (++count > 2000000 || stack.length > 128)
            throw new Error('XML complexity limit');
        if (!t.endsWith('/>'))
            stack.push(n);
    }
    else
        stack.at(-1).text += decode(t);
} if (stack.length !== 1)
    throw new Error('Unclosed XML element'); return root.children[0]; }
export function decodePlist(text) { const tree = parseXML(text); const visit = n => { if (n.name === 'dict') {
    const out = Object.create(null);
    if (n.children.length % 2)
        throw new Error('Malformed plist dictionary');
    for (let i = 0; i < n.children.length; i += 2) {
        if (n.children[i].name !== 'key')
            throw new Error('Missing plist key');
        out[n.children[i].text] = visit(n.children[i + 1]);
    }
    return out;
} if (n.name === 'array')
    return n.children.map(visit); if (n.name === 'integer' || n.name === 'real') {
    const v = Number(n.text);
    if (!Number.isFinite(v))
        throw new Error('Invalid plist number');
    return v;
} if (n.name === 'true')
    return true; if (n.name === 'false')
    return false; if (n.name === 'string')
    return n.text; throw new Error(`Unsupported plist type ${n.name}`); }; if (tree?.name !== 'plist' || tree.children.length !== 1)
    throw new Error('Malformed plist'); return visit(tree.children[0]); }
export function glyphToGLIF(g, l, doc) { const f = x => Number(x.toFixed(6)), lines = [`<?xml version="1.0" encoding="UTF-8"?>`, `<glyph name="${xmlEscape(g.name)}" format="2">`, `<advance width="${f(l.advanceWidth)}"/>`, ...g.unicodes.map(cp => `<unicode hex="${cp.toString(16).toUpperCase().padStart(4, '0')}"/>`), g.note ? `<note>${xmlEscape(g.note)}</note>` : '', ...l.anchors.map(a => `<anchor name="${xmlEscape(a.name)}" x="${f(a.x)}" y="${f(a.y)}"/>`), ...l.guides.map(a => `<guideline x="${f(a.x || 0)}" y="${f(a.y || 0)}" angle="${f(a.angle || 0)}"/>`), '<outline>']; const p = (n, type = '', smooth = false) => `<point x="${f(n.x)}" y="${f(n.y)}"${type ? ` type="${type}"` : ''}${smooth ? ' smooth="yes"' : ''}/>`; for (const c of l.contours) {
    lines.push('<contour>');
    for (let i = 0; i < c.nodes.length; i++) {
        const n = c.nodes[i], prev = c.nodes[(i - 1 + c.nodes.length) % c.nodes.length];
        if (i === 0 && !c.closed)
            lines.push(p(n, 'move'));
        else if (n.in || prev.out) {
            lines.push(p(prev.out || prev), p(n.in || n), p(n, 'curve', n.smooth));
        }
        else
            lines.push(p(n, 'line', n.smooth));
    }
    lines.push('</contour>');
} for (const c of l.components) {
    const name = doc.glyph(c.glyphId)?.name || c.glyphName, m = c.transform || [1, 0, 0, 1, 0, 0];
    lines.push(`<component base="${xmlEscape(name)}" ${['xScale', 'xyScale', 'yxScale', 'yScale', 'xOffset', 'yOffset'].map((a, i) => `${a}="${f(m[i])}"`).join(' ')}/>`);
} lines.push('</outline>', '</glyph>'); return lines.filter(Boolean).join('\n'); }
export function glifToGlyph(text, masterId) { const tree = parseXML(text); if (tree.name !== 'glyph')
    throw new Error('Not GLIF'); const children = name => tree.children.filter(c => c.name === name), g = createGlyph(tree.attrs.name, null, [masterId]), l = g.layers[0]; g.unicodes = children('unicode').map(n => parseInt(n.attrs.hex, 16)); l.advanceWidth = Number(children('advance')[0]?.attrs.width ?? 0); g.note = children('note')[0]?.text || ''; l.anchors = children('anchor').map(n => ({ name: n.attrs.name || '', x: Number(n.attrs.x), y: Number(n.attrs.y) })); l.guides = children('guideline').map(n => ({ x: Number(n.attrs.x || 0), y: Number(n.attrs.y || 0), angle: Number(n.attrs.angle || 0) })); for (const x of children('outline')[0]?.children || []) {
    if (x.name === 'component') {
        l.components.push({ glyphName: x.attrs.base, transform: ['xScale', 'xyScale', 'yxScale', 'yScale', 'xOffset', 'yOffset'].map((k, i) => Number(x.attrs[k] ?? ([0, 3].includes(i) ? 1 : 0))) });
        continue;
    }
    if (x.name !== 'contour')
        continue;
    const ps = x.children.filter(p => p.name === 'point').map(p => ({ x: Number(p.attrs.x), y: Number(p.attrs.y), type: p.attrs.type || 'offcurve', smooth: p.attrs.smooth === 'yes' }));
    if (!ps.length)
        continue;
    if (ps.every(p => p.type === 'offcurve')) {
        l.contours.push(quadraticPointsToContour(ps.map(p => ({ ...p, on: false }))));
        continue;
    }
    const first = ps.findIndex(p => p.type !== 'offcurve'), ordered = [...ps.slice(first), ...ps.slice(0, first)], closed = ordered[0].type !== 'move', c = contour([node(ordered[0].x, ordered[0].y, { smooth: ordered[0].smooth })], closed);
    let controls = [];
    for (const p of [...ordered.slice(1), ...(closed ? [ordered[0]] : [])]) {
        if (p.type === 'offcurve') {
            controls.push(p);
            continue;
        }
        const isLast = p === ordered[0], n = isLast ? c.nodes[0] : node(p.x, p.y, { smooth: p.smooth }), a = c.nodes.at(-1);
        if (p.type === 'curve') {
            if (controls.length !== 2)
                throw new Error('Cubic GLIF segment needs two controls');
            a.out = point(controls[0].x, controls[0].y);
            n.in = point(controls[1].x, controls[1].y);
        }
        else if (p.type === 'qcurve') {
            let previous = a;
            for (let i = 0; i < controls.length; i++) {
                const end = i === controls.length - 1 ? n : node((controls[i].x + controls[i + 1].x) / 2, (controls[i].y + controls[i + 1].y) / 2), q = controls[i];
                previous.out = mix(previous, q, 2 / 3);
                end.in = mix(end, q, 2 / 3);
                if (end !== n)
                    c.nodes.push(end);
                previous = end;
            }
        }
        else if (p.type !== 'line' && p.type !== 'move')
            throw new Error(`Unsupported GLIF point ${p.type}`);
        if (!isLast)
            c.nodes.push(n);
        controls = [];
    }
    l.contours.push(c);
} return g; }
/** Deterministic stored ZIP, UTF-8 names, CRC-32 and bounded reader. */
export function encodeZip(files) { const out = new Writer(), records = []; for (const [name, input] of Object.entries(files)) {
    if (name.includes('..') || name.startsWith('/'))
        throw new Error('Unsafe archive name');
    const data = typeof input === 'string' ? enc.encode(input) : input, n = enc.encode(name), crc = crc32(data), offset = out.pos;
    const w = (v, n = 2) => { for (let i = 0; i < n; i++)
        out.u8(v >>> 8 * i & 255); };
    w(0x04034b50, 4);
    w(20);
    w(0x800);
    w(0);
    w(0);
    w(33);
    w(crc, 4);
    w(data.length, 4);
    w(data.length, 4);
    w(n.length);
    w(0);
    out.raw(n);
    out.raw(data);
    records.push({ n, crc, len: data.length, offset });
} const start = out.pos, w = (v, n = 2) => { for (let i = 0; i < n; i++)
    out.u8(v >>> 8 * i & 255); }; for (const r of records) {
    w(0x02014b50, 4);
    w(20);
    w(20);
    w(0x800);
    w(0);
    w(0);
    w(33);
    w(r.crc, 4);
    w(r.len, 4);
    w(r.len, 4);
    w(r.n.length);
    w(0);
    w(0);
    w(0);
    w(0);
    w(0, 4);
    w(r.offset, 4);
    out.raw(r.n);
} const length = out.pos - start; w(0x06054b50, 4); w(0); w(0); w(records.length); w(records.length); w(length, 4); w(start, 4); w(0); return out.finish(); }
export async function decodeZip(input) { const bytes = input instanceof Uint8Array ? input : new Uint8Array(input), v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), u16 = p => v.getUint16(p, true), u32 = p => v.getUint32(p, true); if (bytes.length > 128 * 1024 * 1024)
    throw new Error('Archive too large'); let end = bytes.length - 22; while (end >= Math.max(0, bytes.length - 65557) && u32(end) !== 0x06054b50)
    end--; if (end < 0 || u32(end) !== 0x06054b50)
    throw new Error('ZIP end record missing'); if (u16(end + 4) || u16(end + 6))
    throw new Error('Multi-disk ZIP not supported'); const count = u16(end + 10); if (count > 65500)
    throw new Error('Too many ZIP entries'); let p = u32(end + 16), total = 0; const files = {}; for (let i = 0; i < count; i++) {
    if (u32(p) !== 0x02014b50)
        throw new Error('Bad central directory');
    const flags = u16(p + 8), method = u16(p + 10), crc = u32(p + 16), compressed = u32(p + 20), size = u32(p + 24), n = u16(p + 28), extra = u16(p + 30), comment = u16(p + 32), offset = u32(p + 42), name = dec.decode(bytes.subarray(p + 46, p + 46 + n));
    p += 46 + n + extra + comment;
    if (name.endsWith('/'))
        continue;
    if (name.startsWith('/') || name.split('/').includes('..') || name.includes('\\') || name in files)
        throw new Error('Unsafe/duplicate archive path');
    total += size;
    if (total > 128 * 1024 * 1024 || size > 64 * 1024 * 1024 || flags & 1)
        throw new Error('Archive budget exceeded or encrypted');
    if (u32(offset) !== 0x04034b50)
        throw new Error('Bad local ZIP entry');
    const start = offset + 30 + u16(offset + 26) + u16(offset + 28);
    if (start + compressed > bytes.length)
        throw new Error('Truncated archive');
    let data = bytes.slice(start, start + compressed);
    if (method === 8) {
        if (!globalThis.DecompressionStream)
            throw new Error('Deflate is unavailable');
        const reader = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(), parts = [];
        let actual = 0;
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done)
                    break;
                actual += value.length;
                if (actual > size) {
                    await reader.cancel();
                    throw new Error('Inflation budget exceeded');
                }
                parts.push(value);
            }
        }
        finally {
            reader.releaseLock();
        }
        data = new Uint8Array(actual);
        let pos = 0;
        for (const part of parts) {
            data.set(part, pos);
            pos += part.length;
        }
    }
    else if (method !== 0)
        throw new Error(`ZIP compression method ${method} unsupported`);
    if (data.length !== size || crc32(data) !== crc)
        throw new Error('ZIP size or checksum mismatch');
    files[name] = data;
} return files; }
export function exportUFO(doc, { masterId = doc.data.masters[0].id, allMasters = true } = {}) { const masters = allMasters ? [...doc.data.masters.filter(m => m.id === masterId), ...doc.data.masters.filter(m => m.id !== masterId)] : doc.data.masters.filter(m => m.id === masterId), base = doc.data.info.familyName.replace(/[^a-zA-Z0-9_-]/g, '') || 'Untitled', root = base + '.ufo/', files = {}, layerContents = []; files[root + 'metainfo.plist'] = encodePlist({ creator: 'com.counterform.studio', formatVersion: 3 }); files[root + 'fontinfo.plist'] = encodePlist({ ...doc.info, familyName: doc.info.familyName, styleName: doc.data.masters.find(m => m.id === masterId)?.name || doc.info.styleName, openTypeOS2WeightClass: doc.info.weightClass, openTypeOS2WidthClass: doc.info.widthClass }); files[root + 'groups.plist'] = encodePlist(doc.data.groups || {}); const kern = {}; for (const [key, v] of Object.entries(doc.data.kerning[masterId] || {})) {
    const [left, right] = parsePairKey(key);
    (kern[left] ??= {})[right] = v;
} files[root + 'kerning.plist'] = encodePlist(kern); files[root + 'features.fea'] = doc.data.features || ''; masters.forEach((m, mi) => { const folder = mi === 0 ? 'glyphs' : `glyphs.master${mi}`, name = mi === 0 ? 'public.default' : m.name; layerContents.push([name, folder]); const contents = {}; doc.data.glyphs.forEach((g, gi) => { const l = g.layers.find(l => l.masterId === m.id); if (!l)
    return; const filename = `glyph${gi.toString().padStart(5, '0')}.glif`; contents[g.name] = filename; files[root + folder + '/' + filename] = glyphToGLIF(g, l, doc); }); files[root + folder + '/contents.plist'] = encodePlist(contents); }); files[root + 'layercontents.plist'] = encodePlist(layerContents); files[root + 'lib.plist'] = encodePlist({ 'public.glyphOrder': doc.data.glyphs.map(g => g.name), 'com.counterform.source': JSON.stringify(doc.data), 'com.counterform.layerMasters': Object.fromEntries(masters.map((m, i) => [i === 0 ? 'public.default' : m.name, m.id])) }); return encodeZip(files); }
export async function importUFO(bytes) {
    const files = await decodeZip(bytes), meta = Object.keys(files).find(p => p.endsWith('metainfo.plist'));
    if (!meta)
        throw new Error('Archive has no UFO');
    const root = meta.slice(0, -'metainfo.plist'.length), text = p => { if (!files[root + p])
        throw new Error(`Missing ${p}`); return dec.decode(files[root + p]); };
    const metadata = decodePlist(text('metainfo.plist'));
    if (![2, 3].includes(metadata.formatVersion))
        throw new Error('Only UFO 2/3 supported');
    const lib = files[root + 'lib.plist'] ? decodePlist(text('lib.plist')) : {};
    const source = lib['com.counterform.source'] ? validateDocumentShape(JSON.parse(lib['com.counterform.source'])) : null;
    const info = decodePlist(text('fontinfo.plist')), d = source ? structuredClone(source) : createFont(info.familyName || 'Imported UFO', info.styleName || 'Regular');
    Object.assign(d.info, info);
    const layers = files[root + 'layercontents.plist'] ? decodePlist(text('layercontents.plist')) : [['public.default', 'glyphs']];
    if (!Array.isArray(layers) || !layers.length || layers.length > 64)
        throw new Error('Invalid UFO layer list');
    const layerMasters = lib['com.counterform.layerMasters'] || {};
    d.masters = layers.map(([name], i) => {
        const old = source?.masters.find(m => m.id === layerMasters[name]) || source?.masters[i];
        return old ? structuredClone(old) : { id: 'master' + i, name: name === 'public.default' ? info.styleName || 'Regular' : name, location: {} };
    });
    d.glyphs = [];
    d.kerning = source ? structuredClone(source.kerning) : {};
    const byName = new Map(), sourceByName = new Map(source?.glyphs.map(g => [g.name, g]) || []);
    layers.forEach((entry, i) => {
        if (!Array.isArray(entry) || entry.length !== 2 || entry.some(x => typeof x !== 'string') || entry[1].includes('..'))
            throw new Error('Invalid UFO layer directory');
        const [, folder] = entry, contents = decodePlist(text(folder + '/contents.plist')), mid = d.masters[i].id;
        d.kerning[mid] ??= {};
        for (const [name, filename] of Object.entries(contents)) {
            if (typeof filename !== 'string' || filename.includes('..') || filename.includes('/'))
                throw new Error('Invalid GLIF filename');
            const parsed = glifToGlyph(text(folder + '/' + filename), mid), existing = byName.get(name), old = sourceByName.get(name);
            parsed.name = name;
            const prior = old?.layers.find(l => l.masterId === mid), layer = { ...prior, ...parsed.layers[0] };
            if (existing)
                existing.layers.push(layer);
            else {
                const g = { ...old, ...parsed, id: old?.id || parsed.id, layers: [layer] };
                d.glyphs.push(g);
                byName.set(name, g);
            }
        }
    });
    for (const g of d.glyphs) {
        for (const m of d.masters)
            if (!g.layers.some(l => l.masterId === m.id))
                g.layers.push(createLayer(m.id));
        for (const l of g.layers)
            for (const c of l.components)
                if (byName.has(c.glyphName))
                    c.glyphId = byName.get(c.glyphName).id;
    }
    // The public default UFO kerning file is authoritative over our metadata extension.
    d.kerning[d.masters[0].id] = {};
    if (files[root + 'kerning.plist']) {
        const k = decodePlist(text('kerning.plist'));
        for (const [left, rights] of Object.entries(k))
            for (const [right, v] of Object.entries(rights))
                d.kerning[d.masters[0].id][JSON.stringify([left, right])] = v;
    }
    d.groups = files[root + 'groups.plist'] ? decodePlist(text('groups.plist')) : {};
    d.features = files[root + 'features.fea'] ? text('features.fea') : '';
    if (Array.isArray(lib['public.glyphOrder'])) {
        const order = new Map(lib['public.glyphOrder'].map((name, i) => [name, i]));
        d.glyphs.sort((a, b) => (order.get(a.name) ?? Infinity) - (order.get(b.name) ?? Infinity));
    }
    d.importInfo = { format: 'UFO', warnings: source ? [] : ['Imported layers are represented as masters. Assign distinct design-space locations before variable export.'] };
    return new FontDocument(d);
}

