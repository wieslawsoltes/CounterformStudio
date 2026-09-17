import { compileCOLRv1, readCOLRv1, validatePaintSource } from '@wieslawsoltes/counterform-colrv1';
import { Reader, Writer } from '@wieslawsoltes/counterform-binary';

/** CPAL foreground sentinel. Layer glyphs always use their monochrome outlines (no recursion). */
export const FOREGROUND = 0xffff;
const fail = message => { throw new Error(`Color font: ${message}`); };
export function parseColor(value) {
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value))
        fail('colors must be #RRGGBB or #RRGGBBAA');
    return [1, 3, 5, 7].map((offset, i) => i === 3 && value.length === 7 ? 255 : parseInt(value.slice(offset, offset + 2), 16));
}
export function validateColorSource(source) {
    if (!source || !Array.isArray(source.glyphs)) fail('glyphs must be an array');
    for (const glyph of source.glyphs) {
        if (!glyph || glyph.colorLayers !== undefined && !Array.isArray(glyph.colorLayers))
            fail('colorLayers must be an array');
    }
    const colored = source.glyphs.some(g => g.colorLayers?.length || g.colorPaint);
    if (!colored && source.palettes === undefined) return source;
    const palettes = source.palettes;
    if (!Array.isArray(palettes) || !palettes.length || palettes.length > 65535) fail('at least one palette is required');
    const count = palettes[0]?.length;
    if (!Number.isInteger(count) || count < 1 || count > 65535 || count * palettes.length > 65535)
        fail('palette entry budget exceeded');
    for (const palette of palettes) {
        if (!Array.isArray(palette) || palette.length !== count) fail('all palettes must have the same number of entries');
        for (const color of palette) parseColor(color);
    }
    const ids = new Map(source.glyphs.map(g => [g.id, g]));
    let layers = 0;
    for (const glyph of source.glyphs) {
        if (glyph.colorLayers === undefined) continue;
        if (!Array.isArray(glyph.colorLayers)) fail('colorLayers must be an array');
        if ((layers += glyph.colorLayers.length) > 65535) fail('layer budget exceeded');
        for (const layer of glyph.colorLayers) {
            if (!layer || !ids.has(layer.glyphId)) fail(`missing layer glyph in ${glyph.name}`);
            if (!Number.isInteger(layer.paletteIndex) || layer.paletteIndex < 0 ||
                (layer.paletteIndex !== FOREGROUND && layer.paletteIndex >= count)) fail('invalid palette index');
            if (glyph.export !== false && ids.get(layer.glyphId).export === false) fail(`layer glyph in ${glyph.name} is excluded from export`);
        }
    }
    for (const [key,length] of [['paletteLabels',palettes.length],['paletteEntryLabels',count],['paletteTypes',palettes.length]]) {
        const a=source[key];if(a===undefined)continue;
        if(!Array.isArray(a)||a.length!==length)fail(key+' length mismatch');
        for(const v of a)if(key==='paletteTypes'?(!Number.isInteger(v)||v<0||v>3):(typeof v!=='string'||v.length>255))fail('invalid '+key);
    }
    validatePaintSource(source);
    return source;
}
/** Independent compiler: glyphOrder must be the exact order used by glyf/CFF and cmap. */
export function compileColorTables(source, glyphOrder, {namePlan=createPaletteNamePlan(source)} = {}) {
    validateColorSource(source);
    const ids = new Map(glyphOrder.map((g, i) => [g.id, i]));
    const bases = glyphOrder.map((g, id) => ({g, id})).filter(({g}) => g.colorLayers?.length);
    if (!bases.length && !glyphOrder.some(g=>g.colorPaint)) return new Map();
    if (glyphOrder.length > 65535 || ids.size !== glyphOrder.length) fail('invalid export glyph order');
    const layers = [], records = [];
    for (const {g, id} of bases) {
        records.push({id, first: layers.length, count: g.colorLayers.length});
        for (const layer of g.colorLayers) {
            const gid = ids.get(layer.glyphId);
            if (gid === undefined) fail('a layer glyph is absent from the export order');
            layers.push({gid, index: layer.paletteIndex});
        }
    }
    const colr = new Writer().u16(0).u16(records.length).u32(14).u32(14 + records.length * 6).u16(layers.length);
    for (const record of records) colr.u16(record.id).u16(record.first).u16(record.count);
    for (const layer of layers) colr.u16(layer.gid).u16(layer.index);
    const palettes = source.palettes, count = palettes[0].length;
    const v1=!!(source.paletteTypes||source.paletteLabels||source.paletteEntryLabels);
    const cpal = new Writer().u16(v1?1:0).u16(count).u16(palettes.length).u16(count * palettes.length).u32(12 + palettes.length * 2+(v1?12:0));
    palettes.forEach((_, i) => cpal.u16(i * count));
    const metadataAt=cpal.pos;if(v1)cpal.zeros(12);
    for (const palette of palettes) for (const color of palette) {
        const [red, green, blue, alpha] = parseColor(color);
        cpal.u8(blue).u8(green).u8(red).u8(alpha);
    }
    if(v1)for(const [i,key,values]of [[0,'paletteTypes',source.paletteTypes],[1,'paletteLabels',namePlan.paletteLabels],[2,'paletteEntryLabels',namePlan.paletteEntryLabels]]){
        if(!source[key])continue;cpal.patch32(metadataAt+i*4,cpal.pos);for(const v of values)i===0?cpal.u32(v):cpal.u16(v);
    }
    return new Map([['COLR', compileCOLRv1(source,glyphOrder,{legacyCOLR:colr.finish()})], ['CPAL', cpal.finish()]]);
}
/** Allocate labels after supplied variation names; callers merge names into the sfnt name table. */
export function createPaletteNamePlan(source,extraNames=[]) {
    let next=extraNames.reduce((n,[id])=>{if(!Number.isInteger(id)||id<0||id>32767)fail('invalid extra name ID');return Math.max(n,id);},255)+1;const names=[];
    const allocate=values=>values?.map(label=>{if(!label)return 65535;if(next>32767)fail('palette name ID budget');const id=next++;names.push([id,label]);return id;});
    return {names,paletteLabels:allocate(source.paletteLabels),paletteEntryLabels:allocate(source.paletteEntryLabels)};
}

/** Decode COLRv0/v1 and CPALv0/v1. Variable paint formats are explicitly rejected. */
export function readColorTables(colrBytes, cpalBytes, glyphOrder, {names=new Map()} = {}) {
    const cpal = new Reader(cpalBytes), colr = new Reader(colrBytes);
    const cv=cpal.u16(),lv=colr.u16();if(cv>1||lv>1)fail('unsupported COLR/CPAL version');
    const entries = cpal.u16(), paletteCount = cpal.u16(), colorCount = cpal.u16(), colorOffset = cpal.u32();
    if (!entries || !paletteCount || entries * paletteCount > 65535 || colorOffset < 12 + paletteCount * 2 + (cv?12:0)) fail('invalid CPAL header or expanded palette budget');
    cpal.need(colorCount * 4, colorOffset);
    const palettes = [];
    for (let i = 0; i < paletteCount; i++) {
        const start = cpal.u16();
        if (start + entries > colorCount) fail('palette range outside CPAL');
        const colors = cpal.slice(colorOffset + start * 4, entries * 4), palette = [];
        for (let j = 0; j < entries; j++) {
            const b = colors.u8(), g = colors.u8(), r = colors.u8(), a = colors.u8();
            palette.push('#' + [r,g,b,...(a === 255 ? [] : [a])].map(v => v.toString(16).padStart(2,'0')).join(''));
        }
        palettes.push(palette);
    }
    const metadata={};
    if(cv){const offsets=[cpal.u32(),cpal.u32(),cpal.u32()];for(let i=0;i<3;i++){
        const offset=offsets[i];if(!offset)continue;const n=i===2?entries:paletteCount,size=i===0?4:2;
        if(offset<12+paletteCount*2+12)fail('invalid CPAL metadata offset');
        const a=cpal.slice(offset,n*size),values=Array.from({length:n},()=>i===0?a.u32():a.u16());
        if(i===0){if(values.some(v=>v>3))fail('unsupported palette type flags');metadata.paletteTypes=values;}
        else {if(values.some(v=>v!==65535&&(v<256||v>32767)))fail('invalid CPAL label name ID');metadata[i===1?'paletteLabelIds':'paletteEntryLabelIds']=values;metadata[i===1?'paletteLabels':'paletteEntryLabels']=values.map(id=>id===65535?'':names.get(id)||'');}
    }}
    const baseCount = colr.u16(), baseOffset = colr.u32(), layerOffset = colr.u32(), layerCount = colr.u16();
    if ((baseCount && baseOffset < (lv?34:14)) || (layerCount && layerOffset < (lv?34:14))) fail('invalid COLR offsets');
    if (baseCount && layerCount && baseOffset < layerOffset + layerCount * 4 && layerOffset < baseOffset + baseCount * 6)
        fail('overlapping COLR arrays');
    const bases = colr.slice(baseOffset, baseCount * 6), layers = colr.slice(layerOffset, layerCount * 4);
    const colorLayers = new Map(); let previous = -1, expandedLayers = 0;
    for (let i = 0; i < baseCount; i++) {
        const gid = bases.u16(), first = bases.u16(), count = bases.u16();
        if (!glyphOrder[gid] || gid <= previous || first + count > layerCount) fail('invalid COLR base glyph record');
        if ((expandedLayers += count) > 65535) fail('expanded layer budget exceeded');
        previous = gid;
        const result = [];
        for (let j = first; j < first + count; j++) {
            layers.seek(j * 4);
            const id = layers.u16(), paletteIndex = layers.u16();
            if (!glyphOrder[id] || paletteIndex !== FOREGROUND && paletteIndex >= entries) fail('invalid COLR layer record');
            result.push({glyphId: glyphOrder[id].id, paletteIndex});
        }
        colorLayers.set(glyphOrder[gid].id, result);
    }
    return {palettes, colorLayers, ...metadata, ...(lv?readCOLRv1(colrBytes,glyphOrder,{paletteEntries:entries}):{colorPaints:new Map(),colorClips:new Map()})};
}
