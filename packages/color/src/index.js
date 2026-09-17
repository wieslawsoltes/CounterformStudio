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
    const colored = source.glyphs.some(g => g.colorLayers?.length);
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
    return source;
}
/** Independent compiler: glyphOrder must be the exact order used by glyf/CFF and cmap. */
export function compileColorTables(source, glyphOrder) {
    validateColorSource(source);
    const ids = new Map(glyphOrder.map((g, i) => [g.id, i]));
    const bases = glyphOrder.map((g, id) => ({g, id})).filter(({g}) => g.colorLayers?.length);
    if (!bases.length) return new Map();
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
    const cpal = new Writer().u16(0).u16(count).u16(palettes.length).u16(count * palettes.length).u32(12 + palettes.length * 2);
    palettes.forEach((_, i) => cpal.u16(i * count));
    for (const palette of palettes) for (const color of palette) {
        const [red, green, blue, alpha] = parseColor(color);
        cpal.u8(blue).u8(green).u8(red).u8(alpha);
    }
    return new Map([['COLR', colr.finish()], ['CPAL', cpal.finish()]]);
}
/** Decode COLRv0 and CPAL v0 only. Other versions are rejected, never claimed as reconstructed. */
export function readColorTables(colrBytes, cpalBytes, glyphOrder) {
    const cpal = new Reader(cpalBytes), colr = new Reader(colrBytes);
    if (cpal.u16() !== 0 || colr.u16() !== 0) fail('only COLRv0 and CPAL v0 are reconstructed');
    const entries = cpal.u16(), paletteCount = cpal.u16(), colorCount = cpal.u16(), colorOffset = cpal.u32();
    if (!entries || !paletteCount || entries * paletteCount > 65535 || colorOffset < 12 + paletteCount * 2) fail('invalid CPAL header or expanded palette budget');
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
    const baseCount = colr.u16(), baseOffset = colr.u32(), layerOffset = colr.u32(), layerCount = colr.u16();
    if ((baseCount && baseOffset < 14) || (layerCount && layerOffset < 14)) fail('invalid COLR offsets');
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
    return {palettes, colorLayers};
}
