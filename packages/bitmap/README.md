# @wieslawsoltes/counterform-bitmap

Static PNG bitmap-color font tables, independent of the DOM, renderer, document
classes and compiler workers. MIT. All APIs have TypeScript declarations.

```js
import {createBitmapGlyph, compileBitmapTables, readBitmapTables}
  from '@wieslawsoltes/counterform-bitmap';

const source = {
  info: {unitsPerEm: 1000},
  bitmapFont: {
    format: 'both',       // 'sbix', 'cbdt', or 'both'
    overlay: false,      // sbix-only outline overlay flag
    strikes: [{id: 'screen-64', ppem: 64, ppi: 72}]
  },
  glyphs: [
    {id: 'notdef'},
    {id: 'A', bitmaps: [createBitmapGlyph('screen-64', pngBytes, {x: 2, y: -3})]}
  ]
};
const tables = compileBitmapTables(source, source.glyphs, [640, 640]);
const decoded = readBitmapTables(tables, source.glyphs.map(g => g.id));
// decoded.bitmapFont; decoded.bitmaps: Map<glyphId, BitmapGlyph[]>
// decoded.supported and decoded.warnings distinguish unsupported reconstruction.
```

`compileBitmapTables` emits sbix version 1 with sorted strikes and PNG/dupe records,
and/or CBDT/CBLC version 3.0. CBDT uses PNG17 (small metrics) or PNG18 (big metrics),
with sparse contiguous runs and uint32 index-format-1 offsets. Encoders return no
tables when the font has no bitmap artwork. Glyphs and advance widths must already
be in the caller's final binary glyph order.

The decoder understands PNG17/18/19 and CBLC index formats 1–5, including shared
big metrics and zero-padding. sbix PNG and duplicate chains are reconstructed.
Unsupported image formats, non-square CBDT strikes, vertical-only strike flags,
invalid offsets, cycles and excessive expansion are rejected. The high-level
reader reports those errors without installing a partial source result. If both
table families contain different artwork, it prefers sbix and reports that CBDT
was not reconstructed. Preserve the original font separately for lossless bytes.

## Coordinates and limits

`x` and `y` are integer lower-left bitmap offsets in strike pixels; sbix writes
raw `originOffsetX/Y`. CBDT writes the corresponding horizontal bearings `(x,
y + imageHeight)`. Font engines may apply sbix glyph-bound placement and outline
overlay differently. This API preserves the format's numeric values, not universal
cross-platform optical alignment. Changing outline masters does not regenerate
pixel artwork. `ppi` is sbix metadata; CBDT has no corresponding field and requires
72 in this shared source model. CBDT uses square PPEM 1–255 and PNG dimensions
1–255. Its bearings must fit signed bytes; advances fit unsigned bytes. An omitted
advance is derived from the supplied source advance and UPM at compilation. Optional
vertical metrics select PNG18 and are retained on import; the strike is horizontal.

Source budgets: 32 strikes, 131,072 populated glyph/strike entries, 64 MiB aggregate
PNG bytes and 64 million aggregate decoded pixels. Table and dupe expansion limits
are checked separately. Existing artwork PNG preflight checks framing, CRCs and
dimensions; native decoders still validate the compressed pixels. No PNG decoder
or browser is embedded in this package. A small bounded cache avoids repeatedly
checking identical source PNG framing during edits.

`prepareBitmapPNG`/`createBitmapGlyph` retain IHDR, PLTE, tRNS, sRGB, IDAT and IEND,
and remove non-rendering metadata. Explicit color-transform chunks (including ICC,
gamma and chromaticities) are rejected: convert to sRGB with a color-managed tool
first. No silent profile stripping or appearance-preservation claim is made.

No bitmap interpolation, pixel-paint brush, SVG-in-OpenType, variable COLRv1 paints,
JPEG/TIFF sbix decoding or universal source-font roundtrip is claimed.

Specifications: [sbix](https://learn.microsoft.com/en-us/typography/opentype/spec/sbix),
[CBDT](https://learn.microsoft.com/en-us/typography/opentype/spec/cbdt),
[CBLC](https://learn.microsoft.com/en-us/typography/opentype/spec/cblc),
[EBLC index formats](https://learn.microsoft.com/en-us/typography/opentype/spec/eblc).
