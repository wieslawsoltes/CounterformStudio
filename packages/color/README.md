# @wieslawsoltes/counterform-color

Independent COLRv0/CPAL v0 source validator, compiler, and bounded decoder. No DOM,
Skia, or font-io dependency. Uses the caller's final exported glyph order.

```js
import {compileColorTables} from '@wieslawsoltes/counterform-color';
const tables = compileColorTables(source, exportedGlyphs); // COLR + CPAL
```

`glyph.colorLayers` stores ordered `{glyphId, paletteIndex}` records. Layers reference
monochrome glyph outlines, not recursively evaluated color glyphs. `65535` is the
foreground color. Palettes are equal-length arrays of `#RRGGBB` or `#RRGGBBAA`.
Order is back-to-front. Duplicate layer references and self references are valid.
Glyph deletion/export filtering must not invalidate references. Binary counts are
bounded to 16-bit limits. Unsupported table versions are rejected on reconstruction.

This is **not COLRv1**: no paint DAGs, gradients, SVG, bitmap tables, or palette labels.
References: Microsoft OpenType COLR and CPAL specifications.
