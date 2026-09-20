# Counterform Studio 0.10.0 — bitmap color font authoring

This increment adds PNG sbix and CBDT/CBLC color-font authoring, not just background
reference images. All ten pinned upstream libraries and their compatible APIs are
retained. The workspace has **35 standalone packages, 157 registered commands,
24 pointer tools and 76 original SVG icons**. Package tarballs are consumer-tested;
packing is not registry publication.

## Delivered

- Standalone bitmap table compiler/decoder and TypeScript API: sbix PNG and safe
  duplicate records, CBDT PNG17/18 output, PNG17/18/19 and CBLC1–5 reconstruction,
  multiple strikes, sparse glyphs, bounded source/offset/image validation.
- Staged Font/ribbon bitmap editor with PNG import, native outline rasterization,
  reference-pixel reuse, strike settings, pixel bearings, advances and vertical
  metrics, native keyboard list navigation, export, cancel and one-step undo.
- Owned compiled FontFace preview for either bitmap format, independent of source
  image presentation and competing COLR artwork; native main-canvas font caching.
- All existing static/variable sfnt and web-font compiler routes and supported
  TrueType/Skia import reconstruction include bitmap data. JSON and custom UFO
  source metadata preserve it; changed bitmaps invalidate metadata-only reuse.

## Evidence and boundaries

`tests/bitmap.test.mjs`, `tests/bitmap-fonttools.py`, `tests/bitmap-browser.py` and
strict/fresh package consumers are permanent gates. The bitmap fontTools suite
has 16 scenarios: nine compiled export variants and seven independent table
reconstruction comparisons. Browser pixel checks distinguish actual bitmap fonts
from monochrome fallbacks. Current CI logs, not this release document, establish
remote success and Pages deployment for the specific commit.

See [full API and workflow contracts](BITMAP-COLOR-FONTS.md). Supported source uses
PNG square strikes; CBDT horizontal strikes require signed-byte bearings and
byte-sized advances/dimensions. sbix PPI/outline overlay interpretation is native
consumer-dependent. Variable bitmap content, pixel painting, JPEG/TIFF sbix,
OpenType-SVG and variable COLRv1 paints remain outside this increment. Broader
FontLab hinting/debugging, source formats, specialized editing and exhaustive
shortcut parity remain outstanding; see [the ledger](CAPABILITIES.md).
