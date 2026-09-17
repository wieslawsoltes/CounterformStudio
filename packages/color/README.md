# @wieslawsoltes/counterform-color

Standalone COLRv0/1 and CPALv0/1 source validation, table compilation and bounded decoding. No DOM, Skia or font-io dependency. Uses bounded binary primitives and the standalone `counterform-colrv1` codec. The caller supplies the exact exported glyph order.

```js
import { compileColorTables, createPaletteNamePlan } from '@wieslawsoltes/counterform-color';
const namePlan = createPaletteNamePlan(source, extraNames);
const tables = compileColorTables(source, exportedGlyphs, {namePlan});
// Add namePlan.names to the font name table using their allocated IDs.
```

Normal Counterform font compilers coordinate the name plan automatically, including CFF2 variation/instance naming. `glyph.colorLayers` stores back-to-front `{glyphId, paletteIndex}` monochrome outlines. `glyph.colorPaint` stores a static COLRv1 graph; both can coexist as a v1 paint and a v0 fallback. Palette index 65535 means foreground color. Equal-length RGBA palettes use `#RRGGBB` or `#RRGGBBAA`. Optional `paletteLabels`, `paletteEntryLabels` and `paletteTypes` produce CPALv1 and named metadata.

`readColorTables(COLR, CPAL, glyphs, {names})` reconstructs supported static color sources; `names` is a map of name ID to decoded text. Without name text, returned numeric label IDs still identify metadata. Unsupported paint variations, variable clips or malformed/beyond-budget records fail explicitly. Semantic reconstruction is not byte-identical original-table preservation.

For all 18 static paint kinds, compositing modes, numeric conventions and graph budgets see the companion codec's README. SVG/bitmap tables and animated/variable paint parameters are not included. Specifications: Microsoft OpenType COLR and CPAL.
