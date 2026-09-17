import { Writer } from '@wieslawsoltes/counterform-binary';

const integer = (value, min, max, label) => {
    if (!Number.isInteger(value) || value < min || value > max) throw new RangeError(`${label} outside ${min}…${max}`);
    return value;
};
/** Encode independent delta sets against shared F2DOT14 support regions.
 * Every items[row][column] corresponds to regionIndexes[column], never source master order.
 */
export function encodeItemVariationStore(axes, supports, dataSets = [{items:[]}]) {
    integer(axes.length, 1, 16, 'Axis count'); integer(supports.length, 0, 65535, 'Region count');
    integer(dataSets.length, 1, 65535, 'Data set count');
    const regions = new Writer().u16(axes.length).u16(supports.length);
    for (const support of supports) for (const axis of axes) {
        const triple = support[typeof axis === 'string' ? axis : axis.tag] || [0, 0, 0];
        if (triple.length !== 3 || triple.some(v => !Number.isFinite(v) || v < -1 || v > 1)
            || triple[0] > triple[1] || triple[1] > triple[2]
            || (triple[1] !== 0 && triple[0] < 0 && triple[2] > 0)) throw new RangeError('Invalid variation support');
        for (const v of triple) regions.f2dot14(v);
    }
    const blocks = dataSets.map(({items, regionIndexes = supports.map((_,i)=>i)}) => {
        integer(items.length, 0, 65535, 'Item count'); integer(regionIndexes.length, 0, 32767, 'Region index count');
        regionIndexes.forEach(i => integer(i, 0, supports.length - 1, 'Region index'));
        let long = false;
        for (const row of items) {
            if (!Array.isArray(row) || row.length !== regionIndexes.length) throw new Error('Delta row size differs from region indexes');
            for (const v of row) { integer(v,-2147483648,2147483647,'Delta'); if (v < -32768 || v > 32767) long = true; }
        }
        const w = new Writer().u16(items.length)
            .u16(items.length ? regionIndexes.length | (long ? 0x8000 : 0) : 0).u16(regionIndexes.length);
        regionIndexes.forEach(i => w.u16(i));
        for (const row of items) for (const v of row) long ? w.i32(v) : w.i16(v);
        return w.finish();
    });
    const regionOffset = 8 + 4 * blocks.length;
    const out = new Writer().u16(1).u32(regionOffset).u16(blocks.length);
    let offset = regionOffset + regions.pos;
    for (const block of blocks) { out.u32(offset); offset += block.length; }
    out.raw(regions.finish()); blocks.forEach(b => out.raw(b));
    return out.finish();
}
/** Explicit three-byte mappings: sixteen inner-index bits and eight outer-index bits. */
export function encodeDeltaSetIndexMap(count, outerIndex = 0) {
    integer(count,0,65535,'Map count'); integer(outerIndex,0,255,'Outer index');
    const w = new Writer().u8(0).u8(0x2f).u16(count);
    for (let i=0;i<count;i++) w.u8(outerIndex).u16(i);
    return w.finish();
}
/** Deduplicates rounded delta rows used by variable positioning records. */
export class VariationStoreBuilder {
    constructor(axes,supports) { this.axes=axes; this.supports=supports; this.rows=[]; this.index=new Map(); }
    add(deltas) {
        if (deltas.length!==this.supports.length || deltas.some(v=>!Number.isFinite(v))) throw new TypeError('Invalid delta vector');
        const row=deltas.map(Math.round), key=row.join(',');
        if (!row.some(Boolean)) return null;
        if (this.index.has(key)) return this.index.get(key);
        integer(this.rows.length,0,65534,'Variation row');
        const index={outer:0,inner:this.rows.length}; this.rows.push(row); this.index.set(key,index); return index;
    }
    encode() { return encodeItemVariationStore(this.axes,this.supports,[{items:this.rows}]); }
}
export function variationIndex({outer,inner}) {
    return new Writer().u16(integer(outer,0,65535,'Outer index')).u16(integer(inner,0,65535,'Inner index')).u16(0x8000).finish();
}
