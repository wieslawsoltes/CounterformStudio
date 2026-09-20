/** Bounded, big-endian sfnt primitives. Every read validates its range. */
export class Reader {
    constructor(data, offset = 0, length) { const b = data instanceof Uint8Array ? data : new Uint8Array(data); length ??= b.length - offset; if (offset < 0 || length < 0 || offset + length > b.length)
        throw new RangeError('Invalid binary view'); this.bytes = b.subarray(offset, offset + length); this.view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength); this.pos = 0; }
    need(n, p = this.pos) { if (!Number.isInteger(n) || !Number.isInteger(p) || p < 0 || n < 0 || p + n > this.bytes.length)
        throw new RangeError(`Truncated font data at ${p} (+${n}, length ${this.bytes.length})`); }
    seek(p) { this.need(0, p); this.pos = p; return this; }
    skip(n) { return this.seek(this.pos + n); }
    u8() { this.need(1); return this.view.getUint8(this.pos++); }
    i8() { const x = this.u8(); return x > 127 ? x - 256 : x; }
    u16() { this.need(2); const x = this.view.getUint16(this.pos); this.pos += 2; return x; }
    i16() { this.need(2); const x = this.view.getInt16(this.pos); this.pos += 2; return x; }
    u32() { this.need(4); const x = this.view.getUint32(this.pos); this.pos += 4; return x; }
    i32() { this.need(4); const x = this.view.getInt32(this.pos); this.pos += 4; return x; }
    fixed() { return this.i32() / 65536; }
    f2dot14() { return this.i16() / 16384; }
    tag() { return String.fromCharCode(this.u8(), this.u8(), this.u8(), this.u8()); }
    slice(offset, length) { return new Reader(this.bytes, offset, length); }
    take(n) { this.need(n); const b = this.bytes.slice(this.pos, this.pos + n); this.pos += n; return b; }
}
export class Writer {
    constructor(capacity = 1024) { this.bytes = new Uint8Array(capacity); this.view = new DataView(this.bytes.buffer); this.pos = 0; }
    reserve(n) { if (this.pos + n > this.bytes.length) {
        const b = new Uint8Array(Math.max(this.pos + n, this.bytes.length * 2, 64));
        b.set(this.bytes);
        this.bytes = b;
        this.view = new DataView(b.buffer);
    } return this; }
    u8(n) { this.reserve(1); this.view.setUint8(this.pos++, n); return this; }
    i8(n) { return this.u8(n); }
    u16(n) { this.reserve(2); this.view.setUint16(this.pos, n); this.pos += 2; return this; }
    i16(n) { this.reserve(2); this.view.setInt16(this.pos, n); this.pos += 2; return this; }
    u32(n) { this.reserve(4); this.view.setUint32(this.pos, n); this.pos += 4; return this; }
    i32(n) { this.reserve(4); this.view.setInt32(this.pos, n); this.pos += 4; return this; }
    fixed(n) { return this.i32(Math.round(n * 65536)); }
    f2dot14(n) { return this.i16(Math.round(n * 16384)); }
    tag(t) { if (t.length !== 4)
        throw new Error('sfnt tags have four characters'); for (const c of t)
        this.u8(c.charCodeAt(0)); return this; }
    raw(b) { this.reserve(b.length); this.bytes.set(b, this.pos); this.pos += b.length; return this; }
    zeros(n) { this.reserve(n); this.bytes.fill(0, this.pos, this.pos + n); this.pos += n; return this; }
    align(n = 4) { while (this.pos % n)
        this.u8(0); return this; }
    patch16(p, n) { if (p < 0 || p + 2 > this.pos)
        throw new RangeError('Invalid patch'); this.view.setUint16(p, n); return this; }
    patch32(p, n) { if (p < 0 || p + 4 > this.pos)
        throw new RangeError('Invalid patch'); this.view.setUint32(p, n); return this; }
    finish() { return this.bytes.slice(0, this.pos); }
}
export function checksum(bytes) { let sum = 0; for (let i = 0; i < bytes.length; i += 4)
    sum = (sum + (((bytes[i] || 0) * 0x1000000) + (bytes[i + 1] || 0) * 0x10000 + (bytes[i + 2] || 0) * 0x100 + (bytes[i + 3] || 0))) >>> 0; return sum; }
export function sfnt(tables, flavor = 0x00010000) {
    const entries = [...tables].map(([tag, bytes]) => {
        if(typeof tag!=='string'||!/^[ -~]{4}$/.test(tag)||!(bytes instanceof Uint8Array))throw new TypeError('Invalid sfnt table');
        if(tag!=='head')return [tag,bytes];
        if(bytes.length<12)throw new RangeError('Truncated head table');
        const normalized=bytes.slice();normalized.fill(0,8,12);return [tag,normalized];
    }).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0), n = entries.length, w = new Writer(), power = 2 ** Math.floor(Math.log2(n));
    if(!n||n>4095||new Set(entries.map(([tag])=>tag)).size!==n)throw new RangeError('Invalid sfnt table count or duplicate tag');
    w.u32(flavor).u16(n).u16(power * 16).u16(Math.log2(power)).u16(n * 16 - power * 16);
    const offsets = [];
    let offset = 12 + n * 16;
    for (const [tag, bytes] of entries) {
        w.tag(tag).u32(checksum(bytes)).u32(offset).u32(bytes.length);
        offsets.push(offset);
        offset += (bytes.length + 3) & ~3;
    }
    for (const [, b] of entries)
        w.raw(b).align();
    const head = entries.findIndex(([t]) => t === 'head');
    if (head >= 0)
        w.patch32(offsets[head] + 8, (0xb1b0afba - checksum(w.finish())) >>> 0);
    return w.finish();
}
export function readDirectory(bytes, index = 0) { let r = new Reader(bytes), base = 0, tag = r.tag(); if (tag === 'ttcf') {
    r.u32();
    const n = r.u32();
    if (index < 0 || index >= n || n > 256)
        throw new RangeError('Invalid collection index');
    r.skip(index * 4);
    base = r.u32();
    r = new Reader(bytes).seek(base);
    tag = r.tag();
} if (tag !== 'OTTO' && tag !== 'true' && tag !== String.fromCharCode(0, 1, 0, 0))
    throw new Error('Expected a TrueType/OpenType sfnt'); const n = r.u16(); r.skip(6); if (n > 4096)
    throw new RangeError('Too many font tables'); const map = new Map(); for (let i = 0; i < n; i++) {
    const name = r.tag(), sum = r.u32(), offset = r.u32(), length = r.u32();
    r.need(length, offset);
    if (map.has(name))
        throw new Error('Duplicate sfnt table');
    map.set(name, { tag: name, checksum: sum, offset, length, bytes: r.bytes.subarray(offset, offset + length) });
} return { tables: map, flavor: tag === 'OTTO' ? 0x4f54544f : 0x10000, base }; }
export const utf16be = s => { const w = new Writer(); for (let i = 0; i < s.length; i++)
    w.u16(s.charCodeAt(i)); return w.finish(); };
export function decodeUTF16BE(b) { const r = new Reader(b); let s = ''; while (r.pos + 1 < b.length)
    s += String.fromCharCode(r.u16()); return s; }
export function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) {
    c ^= b;
    for (let k = 0; k < 8; k++)
        c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
} return (c ^ 0xffffffff) >>> 0; }


export {encodeCollection,readCollection,extractCollectionFace,extractCollectionFaces} from "./collections.js";
export {isVariationSelector,encodeUVS,decodeUVS,readCmapUVS} from './uvs.js';
