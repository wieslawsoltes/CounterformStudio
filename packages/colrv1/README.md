# @wieslawsoltes/counterform-colrv1

Standalone, dependency-light COLRv1 compiler, bounded decoder and source-graph validator. Pure ES modules with TypeScript declarations; works in browsers, workers and Node. Depends only on Counterform's binary reader/writer. Does not read installed fonts, call a server or alter SkiaSharp APIs.

```js
import {compileCOLRv1, readCOLRv1} from '@wieslawsoltes/counterform-colrv1';
const glyphs = [{id:'A', colorPaint:{
  type:'glyph', glyphId:'A', paint:{type:'linear',
    x0:0,y0:0,x1:600,y1:0,x2:0,y2:700,
    stops:[{offset:0,paletteIndex:0},{offset:1,paletteIndex:1}]}
}}];
const table = compileCOLRv1({glyphs,palettes:[['#ff0000','#0000ff']]},glyphs);
const decoded = readCOLRv1(table,glyphs,{paletteEntries:2});
```

Use `counterform-color.compileColorTables` to generate coordinated COLR and CPAL tables, or a Counterform font compiler to generate the complete font. Pass exactly the compiler's export glyph order. `colorClip` is an optional `[xMin,yMin,xMax,yMax]` clip box on a base glyph. Outline-reference nodes use stable source glyph IDs. A `colrGlyph` node references another **v1** base glyph, not a v0-only base.

Supports all 18 non-variable paint formats: layers, solid, linear/radial/sweep gradients, monochrome glyph clips, referenced color glyphs, affine/translate/scale/rotate/skew transforms (including centered and uniform variants), and all 28 compositing modes. Paint parameters are static; a font may still have variable outlines/metrics. No PaintVar*, variable clip boxes or variation-store reconstruction is claimed.

Angles are counterclockwise degrees; sweep start/end are encoded with OpenType's biased angle representation. F2DOT14 values and 16.16 matrices are quantized to their binary precision. Coordinates must fit the format's 16-bit range. A gradient may have zero stops (transparent) or unordered stops; renderers apply the OpenType ColorLine semantics. Alpha must be in `[0,1]`. Palette index 65535 is the foreground sentinel.

The validator rejects unsupported formats, missing/excluded glyph references, cycles, out-of-range numeric fields and unbounded base paints without a clip. Explicit render-expansion limits: 65,535 nodes, 65,535 stops, depth 64, binary size 16 MiB. Variable or unsupported input is rejected rather than converted into a misleading approximation. The decoder also checks offset bounds, sorted ranges, count multiplication and truncation. Default memory/graph budgets may be lowered via `validatePaintSource` options.

COLRv0 fallback records can coexist through `legacyCOLR`. Decoded source graphs are semantic reconstructions, not byte-identical serialization of the original table. The original-font preservation subsystem remains the separate byte-identical route.
