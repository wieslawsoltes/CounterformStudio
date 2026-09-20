import {Reader, Writer} from './index.js';
const LIMIT = 1_000_000;
const scalar = cp => Number.isInteger(cp) && cp >= 0 && cp <= 0x10ffff && (cp < 0xd800 || cp > 0xdfff);
export const isVariationSelector = cp => Number.isInteger(cp) && (
    cp >= 0xfe00 && cp <= 0xfe0f || cp >= 0xe0100 && cp <= 0xe01ef ||
    cp >= 0x180b && cp <= 0x180d || cp === 0x180f);
const base = cp => { if (!scalar(cp) || isVariationSelector(cp)) throw new RangeError('Invalid UVS base character'); return cp; };
const selector = cp => { if (!isVariationSelector(cp)) throw new RangeError('Invalid Unicode variation selector'); return cp; };
const u24 = r => r.u8() * 65536 + r.u16();
const put24 = (w, n) => w.u8(n >>> 16).u16(n & 65535);
function options({maxEntries = LIMIT, glyphCount = 65536} = {}) {
    if (!Number.isInteger(maxEntries) || maxEntries < 0 || maxEntries > LIMIT ||
        !Number.isInteger(glyphCount) || glyphCount < 1 || glyphCount > 65536) throw new RangeError('Invalid UVS decoder budget');
    return {maxEntries, glyphCount};
}
/** Deterministic cmap format 14. null is a default UVS, not glyph zero. */
export function encodeUVS(records) {
    if (!Array.isArray(records) || records.length > LIMIT) throw new RangeError('UVS entry budget exceeded');
    const sorted = records.map(r => {
        base(r?.unicode); selector(r?.selector);
        if (r.glyphIndex !== null && (!Number.isInteger(r.glyphIndex) || r.glyphIndex < 0 || r.glyphIndex > 65535)) throw new RangeError('Invalid UVS glyph index');
        return r;
    }).sort((a,b) => a.selector - b.selector || a.unicode - b.unicode);
    const groups = [];
    let previous;
    for (const r of sorted) {
        if (previous?.selector === r.selector && previous.unicode === r.unicode) throw new Error('Duplicate Unicode variation sequence');
        let g = groups.at(-1);
        if (!g || g.selector !== r.selector) groups.push(g = {selector:r.selector, defaults:[], nondefaults:[]});
        if (r.glyphIndex === null) {
            const range = g.defaults.at(-1);
            if (range && range.start + range.count + 1 === r.unicode && range.count < 255) range.count++;
            else g.defaults.push({start:r.unicode, count:0});
        } else g.nondefaults.push(r);
        previous = r;
    }
    const w = new Writer().u16(14).u32(0).u32(groups.length);
    for (const g of groups) put24(w,g.selector).u32(0).u32(0);
    groups.forEach((g,i) => {
        if (g.defaults.length) {
            w.patch32(10 + i*11 + 3,w.pos).u32(g.defaults.length);
            for (const r of g.defaults) put24(w,r.start).u8(r.count);
        }
        if (g.nondefaults.length) {
            w.patch32(10 + i*11 + 7,w.pos).u32(g.nondefaults.length);
            for (const r of g.nondefaults) put24(w,r.unicode).u16(r.glyphIndex);
        }
    });
    return w.patch32(2,w.pos).finish();
}
/** Bounded format-14 decoder. Validates sorted partitions and byte regions
 * before expanding ranges; shared identical subtables are allowed. */
export function decodeUVS(input, limits = {}) {
    const {maxEntries,glyphCount} = options(limits);
    const r = new Reader(input);
    if (r.u16() !== 14) throw new Error('Expected cmap format 14');
    const length = r.u32(), count = r.u32(), header = 10 + count*11;
    if (length > r.bytes.length || length < header || count > 260) throw new RangeError('Invalid UVS table header');
    const bytes = r.bytes.subarray(0,length), records = [], regions = [];
    let lastSelector = -1, total = 0;
    function subtable(offset, stride, kind) {
        if (offset < header) throw new RangeError('UVS offset overlaps header');
        const s = new Reader(bytes).seek(offset), n = s.u32(); s.need(n*stride);
        if (n > maxEntries) throw new RangeError('UVS entry budget exceeded');
        regions.push({offset,end:offset+4+n*stride,kind});
        return {s,n};
    }
    for (let i=0; i<count; i++) {
        const vs = selector(u24(r)), defaults = r.u32(), nondefaults = r.u32();
        if (vs <= lastSelector) throw new Error('Unsorted or duplicate variation selectors'); lastSelector=vs;
        const ranges = [], mapped = [];
        if (defaults) {
            const {s,n}=subtable(defaults,4,'default'); let end=-1;
            for(let j=0;j<n;j++) {
                const first=base(u24(s)), last=base(first+s.u8());
                if(first<=end || first<=0xdfff&&last>=0xd800 ||
                    [0x180b,0x180f,0xfe00,0xe0100].some(v=>first<=v&&last>=v)) throw new Error('Invalid or overlapping default UVS ranges');
                total+=last-first+1; if(total>maxEntries)throw new RangeError('Expanded UVS entry budget exceeded');
                ranges.push({first,last});end=last;
            }
        }
        if (nondefaults) {
            const {s,n}=subtable(nondefaults,5,'nondefault');let last=-1;
            total+=n;if(total>maxEntries)throw new RangeError('Expanded UVS entry budget exceeded');
            for(let j=0;j<n;j++) {
                const unicode=base(u24(s)),glyphIndex=s.u16();
                if(unicode<=last || glyphIndex>=glyphCount)throw new Error('Invalid or duplicate non-default UVS mapping');
                mapped.push({unicode,selector:vs,glyphIndex});last=unicode;
            }
        }
        let k=0;
        for(const item of mapped) {
            while(k<ranges.length&&ranges[k].last<item.unicode)k++;
            if(k<ranges.length&&ranges[k].first<=item.unicode)throw new Error('Default and non-default UVS sets overlap');
        }
        records.push({selector:vs,ranges,mapped});
    }
    regions.sort((a,b)=>a.offset-b.offset||a.end-b.end);
    let previous;
    for(const region of regions) {
        if(previous&&region.offset<previous.end&&!(region.offset===previous.offset&&region.end===previous.end&&region.kind===previous.kind))throw new Error('Overlapping UVS byte regions');
        previous=region;
    }
    const result=[];
    for(const item of records) {
        for(const range of item.ranges)for(let unicode=range.first;unicode<=range.last;unicode++)result.push({unicode,selector:item.selector,glyphIndex:null});
        for(const mapping of item.mapped)result.push(mapping);
    }
    return result.sort((a,b)=>a.selector-b.selector||a.unicode-b.unicode);
}
/** Extract only the Unicode platform/encoding 0/5 supplemental map. */
export function readCmapUVS(input, limits = {}) {
    options(limits);
    const r=new Reader(input);
    if(r.u16()!==0)throw new Error('Invalid cmap version');
    const count=r.u16(),header=4+8*count;
    if(count>256)throw new RangeError('Too many cmap records');r.need(8*count);
    let offset=null;
    for(let i=0;i<count;i++){
        const platform=r.u16(),encoding=r.u16(),at=r.u32();
        if(platform===0&&encoding===5){if(offset!==null||at<header)throw new Error('Duplicate or invalid cmap variation record');offset=at;}
    }
    if(offset===null)return [];
    return decodeUVS(r.slice(offset,r.bytes.length-offset).bytes,limits);
}
