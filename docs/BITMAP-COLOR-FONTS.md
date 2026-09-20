# Bitmap color fonts — source, binary and editor contracts

## Authoring

Open **Font → Bitmap color strikes**, or the Bitmap color strikes action in the
OpenType ribbon Color group. This uses the existing shared command registry and
original artwork icon. It is distinct from **Artwork references and masks**:
reference images remain source-only, whereas bitmap strikes are embedded in the
compiled font.

Add a strike (PPEM and PPI), then **Import PNG bitmap**, **Rasterize outline**, or
**Use reference pixels**. Rasterization uses the existing SkiaSharpWeb surface,
path, antialiased paint, snapshot and PNG encoder APIs; no vendor extension or API
change was needed. It rasterizes the current evaluated source outline, including
components and modifiers, at the chosen PPEM. Changing the rasterization color or
source geometry does not silently overwrite an existing bitmap: rasterize again.
The reference-pixel action copies PNG pixels, not the reference's affine placement
or opacity. Choose bitmap offsets explicitly.

Select **Apple sbix**, **OpenType CBDT / CBLC**, or **Both bitmap table families**.
Edit strike sizes, raw pixel offsets, an optional CBDT advance override, and optional
vertical metrics. CBDT range limits are enforced, not truncated. sbix-only fonts
can request outline overlay; actual overlay support is consumer-dependent. A
populated strike cannot be silently removed font-wide: remove its glyph bitmaps
first. Strikes are font-level; images are glyph-level and not interpolated between
outline masters. Empty CBDT strikes have no encoded records and are omitted.

The listbox supports Up/Down and Home/End. Every action has a text label; modal
focus and Escape use the shared owned-dialog implementation. All changes remain a
private draft until **Apply bitmap strikes**, which commits one full-font undo
transaction. Cancel leaves source unchanged. Editing the document, changing glyph
or master, or locking the current source before Apply invalidates the draft.
Asynchronous imports cannot apply to a different selected strike.

## Compiled preview and export

**Compile bitmap proof** compiles the chosen PNG strike into a real TTF with the
selected bitmap table family. It loads those bytes as a new FontFace and shows the
actual glyph. The private proof clears competing COLR artwork, feature source and
uses a temporary PUA mapping; those changes never enter the document. Preview
scale magnifies the selected native-size strike rather than selecting a different
strike. It is not a substitute raster image presented as a compiled font.

The dialog owns its compiler key, AbortSignal and FontFace. New edits invalidate
the old proof; closing cancels pending work and removes installed preview faces.
Completion guards reject stale compile/decode results. The main editor caches the
compiled bitmap font for the exact source document/revision/master, like COLRv1,
with source nodes retained as overlays. Existing interpolation previews remain
outline previews; compiled variable fonts carry **static** bitmap strikes.

The common table assembly integrates bitmaps into TTF, CFF, CFF2, variable TTF/CFF2,
WOFF and WOFF2 exports. Both families may coexist; native consumers choose their
own precedence if COLR is also present. Bitmap-only font construction, bitmap
variation and a pixel-paint canvas are not claimed.

## Import and preservation

The native importer builds a private outline-only face before requesting glyph paths
and widths: bitmap-backed Skia faces can otherwise return null paths. The untouched
input table set still supplies strike reconstruction and the original archive.

The TrueType importer and Skia-backed native importer reconstruct supported sbix
and CBDT/CBLC tables using final glyph IDs. A format family is installed only after
complete bounded decoding. Unsupported records and distinct competing families
are reported through `importInfo.notReconstructed` and warnings; the existing
original-file archive can retain untouched bytes. Default-outline reconstruction
still does not reconstruct arbitrary hints, layout or variations.

Counterform JSON, revision history and its custom UFO source metadata preserve
bitmap settings and image data. These fields are structural for original-font
preservation: changing them disallows metadata-only reuse. The ordinary compiler
is not claimed to be byte-identical to arbitrary imported bitmap fonts. PNG
metadata can be normalized to the constrained CBDT chunk set; no color profile is
silently discarded.

## Binary API and verification

See the standalone [bitmap package](../packages/bitmap/README.md) for numeric ranges,
budgets, unsupported formats and examples. The data-only package depends on the
existing binary and artwork packages, not on the UI or model. The model depends on
its source validator, avoiding dependency cycles.

Headless tests exercise missing/duplicate source IDs, source/range validation,
PNG metadata, exact duplicate records, corrupted and truncated offsets, cyclic
references, all five CBLC index formats and PNG17/18/19, history and real Node
workers. Independent Python tests decode nine export variants with fontTools,
inspect metrics and PNGs with Pillow, and send independently recompiled fontTools
sbix/CBLC fixtures back through the JavaScript decoder. Browser tests require
actual red/blue FontFace pixels from each format, as well as native rasterization,
transactional apply, input ownership and cleanup. Source and built distribution
are both tested; isolated local runs use inline compilation, while CI uses real
browser workers. Software rendering is not physical GPU or Apple platform
certification.

References (OpenType):
- https://learn.microsoft.com/en-us/typography/opentype/spec/sbix
- https://learn.microsoft.com/en-us/typography/opentype/spec/cbdt
- https://learn.microsoft.com/en-us/typography/opentype/spec/cblc
- https://learn.microsoft.com/en-us/typography/opentype/spec/eblc
