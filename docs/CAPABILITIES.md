# Capability contract and parity ledger

Version 0.4.0, reviewed 2026-09-17. The comparison target is the FontLab **8.4 family**; the reference snapshot on 2026-09-16 listed 8.4.2.8950 first. This ledger is not an exhaustive verification of every undocumented native behavior. Sources: https://www.fontlab.com/ and https://help.fontlab.com/fontlab/8/ .

**Working** means implemented and exercised within the documented subset. **Partial** means a narrower implementation exists. **Missing** means no implementation is claimed. An attractive dialog, data field or shader source alone is not counted as feature parity.

| Area | Status | Delivered contract / boundary |
|---|---|---|
| Docked workbench, light/dark, command ribbon | Working | Actual Dockyard/RibbonWeb; six classic ribbon tabs, SVG icons, nine menus covering all 136 current commands; not every native FontLab command |
| Glyph library and font inventory | Working | Virtual tiles; reactive keyed projection; TreeDataGrid editable widths/export flags |
| Unicode mapping | Working | Scalar values including supplementary planes; no UVS/cmap14 authoring |
| Pen and outline selection | Working | Endpoints, absolute cubic handles, drag construction, marquee/lasso, insertion, deletion |
| Shape tools | Working | Rectangle, ellipse, open line, polygon, star and rounded rectangle; constrained drawing and bounded options |
| Pencil and pressure brush | Partial | Simplified freehand polyline; pressure-sensitive filled outline with bounded miter joins/flat caps; no fitted Rapid curves or editable brush skeleton |
| Knife and Scissors | Partial | Cubic-preserving opening/splitting; Knife requires exactly two transverse crossings, rejects ambiguous geometry |
| Contour surgery | Working | Open/join endpoints, start point, line/cubic conversion, coincident line-node removal and distribution |
| Anchors and guides | Working | Pointer editing, per-master numerical guide editor, undo and locked-layer gating |
| Smooth/corner, extrema, winding | Working | Geometry operations with undo; no proprietary Genius/Tunni semantics |
| Measurement and coordinates | Partial | Font-unit rulers, metrics, point inspector, drag distance; no curvature/area comparison panels |
| Snapping and keyboard nudges | Working | Grid/metric snapping, 1/10/0.1 units, shift constraint, Alt handle release |
| Boolean paths / overlap removal | Working | Native Skia; removal, union, difference, intersection, XOR |
| Stroke expansion | Working | Native Skia outlined stroke; separate polyline pressure brush; no variable-width stroke skeleton |
| Affine transforms | Working | Numeric and pointer scale/rotate/slant/translate/mirror; destructive source transform with gesture undo |
| Non-destructive outline filters | Partial | Ordered translate, scale, rotate, slant, matrix, round, reverse and repeat; live evaluated outlines, retained editable source, undoable baking; not proprietary Delta/Power Brush semantics |
| Reusable components | Working | Live source references, affine transforms, decomposition, cycle rejection |
| Smart / variable components | Partial | Per-master component transforms interpolate; no parameterized glyph replacement or independent component-axis locations |
| Skin / Glue / Power Brush / autotrace | Missing | No equivalents claimed |
| Masks, images and background references | Missing | Source layers are master layers, not a complete arbitrary artwork-layer system |
| Master editing | Working | Clone master, axis/location editing, topology checks, static interpolation |
| Sparse multidimensional interpolation | Working | Support-region model verified against fontTools |
| Variable TrueType export | Partial | fvar/gvar/STAT, HVAR advance and sidebearings, five MVAR metrics, GDEF/GPOS variable kerning and mark-to-base anchors; no avar/FeatureVariations |
| CFF2 static and variable fonts | Working | Cubic blend programs, sparse regions, topology validation, HVAR/MVAR and variable GPOS; no CFF2 hint authoring |
| Spacing and kerning | Partial | Advance/sidebearings, pairs, group exceptions, fixed common-pair matrix; no optical autokerning, full metrics-text editing, sidebearing expressions or all native gestures |
| Pair kerning compilation | Working | GPOS PairPos format1 plus legacy kern0; classes expanded to pairs with budget limits |
| OpenType feature editor | Partial | Strict FEA subset; supported syntax is listed below |
| Single substitution / ligatures | Working | GSUB type1 format2 and type4 format1 |
| Mark-to-base attachment | Working | Matching named anchors → GPOS4 and GDEF glyph classes |
| Full complex-script shaping authoring | Missing | No complete contextual/chaining/multiple/alternate/reverse substitution or mark-to-mark/cursive/RTL script workflow |
| TrueType bytecode editing / hint debugger | Missing | No instruction editor, interpreter, CVT/fpgm/prep production workflow |
| PS hints / autohinting | Missing | Output unhinted; imported programs not reconstructed |
| Color fonts | Partial | COLRv0/CPALv0 layer and RGBA palette authoring, Skia/canvas preview, TTF/CFF/variable/WOFF export and bounded TrueType table reconstruction; no COLRv1, CPALv1, gradients, SVG, bitmap tables or palette labels |
| TTF import | Partial | Default-instance outlines/metrics/cmap/names/basic kern; simple/composite glyf; supported COLRv0/CPALv0 reconstructed; other advanced tables are not reconstructed |
| CFF / WOFF2 import via Skia | Partial | Actual decoded default-instance outlines; no source hint/layout/color roundtrip |
| TTF / CFF OTF / WOFF1 export | Working | Actual sfnt binaries accepted by independent fontTools and browser FontFace |
| WOFF2 export | Working | Single-face null-transform containers; portable stored Brotli blocks, injected compressor or Node compressed subpath; canonical tags, DSIG removal and head normalization |
| TTC authoring | Missing | Collections are not authored |
| UFO3 / GLIF import/export | Partial | ZIP, source contours/anchors/components/master layers; custom Counterform metadata retains master locations; GLIF edits authoritative; not complete UFO lib semantics |
| SVG outline import/export | Partial | Basic supported paths/shapes; arcs, transforms and arbitrary SVG documents are rejected |
| FontLab VFC / VFB / VFJ | Missing | No proprietary source-format compatibility claimed |
| Glyphs / SFD / designspace file support | Missing | No full interchange parsers |
| Live text proof | Working | Browser shaping of the actual compiled font; kern/liga toggles, waterfall, variable coordinates |
| Production QA | Partial | Structural/geometry/encoding/component/master checks; not OTS or FontBakery certification |
| Python macro API | Missing | Bounded JSON recipes and JS package APIs only; no FontLab Python compatibility |
| File persistence | Partial | Counterform files, immutable IndexedDB autosave, full-snapshot revision journal with SHA-256 chain, atomic CAS writes, corruption-prefix recovery and restore-as-copy UI; no incremental delta journal, native file watch or git-aware project |
| Full keyboard parity | Partial | 136-command registry, 24 tools, menu/toolbar keyboard navigation and core shortcut remapping; not a verified exhaustive FontLab key map |
| Worker compilation and validation | Working; physical hardware unqualified | Bounded queue, keyed proof replacement, transferable results, hard cancellation and timeout; real Node workers plus the generated relative-URL browser graph exercised in a fresh Node worker host; local isolated browser suite explicitly uses inline mode; source/distribution/Pages CI exercises real browser workers |
| WebGPU renderer | Unqualified here | Real Skia automatic backend request; local isolated tests exercise native raster; CI also tests WebGL through SwiftShader, not physical GPUs |
| WebGPU compute | Implemented, GPU unqualified | Independent WGSL interpolation service; CPU numerical path verified |
| Mobile and accessibility certification | Unqualified | Pointer events, keyboard/input semantics and native controls exist; full touch/VoiceOver audits outstanding |

## Feature-language subset

Accepted examples:

```fea
languagesystem DFLT dflt;
@Left = [A V W];
feature salt { sub A by V; } salt;
feature liga { sub f i by m; } liga;
feature kern { pos A V -85; } kern;
```

Only defined glyph names are accepted. Single substitutions, multiple-input ligatures and numeric horizontal pair positions are compiled. DFLT/latn default language declarations are supported. Unsupported contextual syntax, lookup declarations and unsupported scripts produce errors instead of being silently ignored. Named anchors are authored through the glyph model/inspector, not via arbitrary FEA anchor syntax.

## Import/export preservation

Counterform files preserve all its source fields, including masters, modifier stacks, optional original archives and rich notes. Import reconstruction is still partial. The separate original archive stores input bytes with SHA-256 integrity and always allows untouched download. Metadata-only export verifies a structural fingerprint and preserves every unrelated original table byte while changing supported naming/version fields and recalculating checksums. Invalidated DSIG signatures are removed with a warning. Metadata editing of original WOFF/WOFF2 containers is rejected, not silently decoded/rebuilt. Outline, metrics, encoding, layout, color, master or axis edits require the ordinary compiler; that path does **not** claim universal lossless reconstruction.

Open contours are editable source artwork but are excluded from font compilation. Metadata limits, glyph bounds and feature failures can block export. Components are flattened for binary compilation; source files preserve references. The original geometric demonstration intentionally contains unfinished letter construction and is not a commercial typeface.

## Remaining acceptance gates

Full feature-language AST and contextual/chaining/multiple/alternate/reverse substitutions; broader GPOS attachment and script/language controls; avar/FeatureVariations; hint authoring/debugger; COLRv1 and bitmap/SVG color fonts; richer construction and artwork layers; full original source-format adapters; specialized Element/Metrics/Kerning/Text/Magnet/Matchmaker/Fill workflows; exhaustive native shortcuts; large-font incremental journal/worker optimization; CJK stress, hardware WebGPU, Firefox/Safari, touch and assistive technology.

## Verification and delivery

See `RELEASE-0.4.0.md` and commit-associated CI artifacts. Export engines were first committed at `548d141569d511b553022da1977cd2221ae94517`, with full verification, Pages deployment and live HTTPS checks passing in run `35232300227`. Subsequent production changes require a new full run; the earlier run does not certify uncommitted source. No full-parity percentage is asserted.
