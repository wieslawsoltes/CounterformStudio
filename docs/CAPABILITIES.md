# Capability contract and parity ledger

Version 0.1.0, reviewed 2026-09-16. The comparison target is the FontLab **8.4 family**; the official help index currently lists 8.4.2.8950 first. This ledger is not an exhaustive verification of every undocumented native behavior. Sources: https://www.fontlab.com/ and https://help.fontlab.com/fontlab/8/ .

**Working** means implemented and exercised within the documented subset. **Partial** means a narrower implementation exists. **Missing** means no implementation is claimed. An attractive dialog, data field or shader source alone is not counted as feature parity.

| Area | Status | Delivered contract / boundary |
|---|---|---|
| Docked workbench, light/dark, command ribbon | Working | Actual Dockyard and RibbonWeb components; desktop browser layout |
| Glyph library and font inventory | Working | Virtual tiles; reactive keyed projection; TreeDataGrid editable widths/export flags |
| Unicode mapping | Working | Scalar values including supplementary planes; no UVS/cmap14 authoring |
| Pen and outline selection | Working | Endpoints, absolute cubic handles, drag construction, marquee, insertion, deletion |
| Rectangle / ellipse | Working | Real contours; constrained drawing |
| Smooth/corner, extrema, winding | Working | Geometry operations with undo; no proprietary Genius/Tunni semantics |
| Measurement and coordinates | Partial | Font-unit rulers, metrics, point inspector, drag distance; no curvature/area comparison panels |
| Snapping and keyboard nudges | Working | Grid/metric snapping, 1/10/0.1 units, shift constraint, Alt handle release |
| Boolean paths / overlap removal | Working | Native Skia; removal, union, difference, intersection, XOR |
| Stroke expansion | Working | Native Skia outlined stroke; no pressure brush or variable-width stroke skeleton |
| Affine transforms | Working | Scale/rotate/slant/translate/mirror; destructive source transform with undo |
| Non-destructive Delta filters | Missing | No modifier/filter evaluation stack |
| Reusable components | Working | Live source references, affine transforms, decomposition, cycle rejection |
| Smart / variable components | Partial | Per-master component transforms interpolate; no parameterized glyph replacement or independent component-axis locations |
| Skin / Glue / Power Brush / autotrace | Missing | No equivalents claimed |
| Masks, images and background references | Missing | Source layers are master layers, not a complete arbitrary artwork-layer system |
| Master editing | Working | Clone master, axis/location editing, topology checks, static interpolation |
| Sparse multidimensional interpolation | Working | Support-region model verified against fontTools |
| Variable TrueType export | Partial | fvar/gvar/STAT; full-point deltas, phantom points; no HVAR/MVAR/variable GPOS/avar/FeatureVariations |
| CFF2 variable fonts | Missing | CFF1 static export only |
| Spacing and kerning | Partial | Advance/sidebearings, pairs, group exceptions, fixed common-pair matrix; no optical autokerning, full metrics-text editing, sidebearing expressions or all native gestures |
| Pair kerning compilation | Working | GPOS PairPos format1 plus legacy kern0; classes expanded to pairs with budget limits |
| OpenType feature editor | Partial | Strict FEA subset; supported syntax is listed below |
| Single substitution / ligatures | Working | GSUB type1 format2 and type4 format1 |
| Mark-to-base attachment | Working | Matching named anchors → GPOS4 and GDEF glyph classes |
| Full complex-script shaping authoring | Missing | No complete contextual/chaining/multiple/alternate/reverse substitution or mark-to-mark/cursive/RTL script workflow |
| TrueType bytecode editing / hint debugger | Missing | No instruction editor, interpreter, CVT/fpgm/prep production workflow |
| PS hints / autohinting | Missing | Output unhinted; imported programs not reconstructed |
| Color fonts | Missing | No COLRv0/v1 paint graph, gradients, SVG-in-OT, CBDT/sbix authoring/export |
| TTF import | Partial | Default-instance outlines/metrics/cmap/names/basic kern; simple/composite glyf; advanced tables are not reconstructed |
| CFF / WOFF2 import via Skia | Partial | Actual decoded default-instance outlines; no source hint/layout/color roundtrip |
| TTF / CFF OTF / WOFF1 export | Working | Actual sfnt binaries accepted by independent fontTools and browser FontFace |
| WOFF2 export / TTC authoring | Missing | Not offered as export formats |
| UFO3 / GLIF import/export | Partial | ZIP, source contours/anchors/components/master layers; custom Counterform metadata retains master locations; GLIF edits authoritative; not complete UFO lib semantics |
| SVG outline import/export | Partial | Basic supported paths/shapes; arcs, transforms and arbitrary SVG documents are rejected |
| FontLab VFC / VFB / VFJ | Missing | No proprietary source-format compatibility claimed |
| Glyphs / SFD / designspace file support | Missing | No full interchange parsers |
| Live text proof | Working | Browser shaping of the actual compiled font; kern/liga toggles, waterfall, variable coordinates |
| Production QA | Partial | Structural/geometry/encoding/component/master checks; not OTS or FontBakery certification |
| Python macro API | Missing | Bounded JSON recipes and JS package APIs only; no FontLab Python compatibility |
| File persistence | Partial | Counterform files and IndexedDB autosave; no crash WAL, native file watch or git-aware source project |
| Full keyboard parity | Partial | 99 command registry, core shortcuts/remapping; not a verified exhaustive FontLab key map |
| WebGPU renderer | Unqualified here | Real Skia automatic backend request; delivered tests exercised native raster only |
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

Counterform source files preserve its own source schema, including every master. Imported production fonts are **not losslessly roundtripped**. TrueType instructions, existing GSUB/GPOS programs, variation tables, color tables and specialized vendor tables are not reconstructed merely because Skia can render them. Import reports expose unreconstructed tables; the Export dialog repeats this warning. Retain the original binary and compare exported tables and shaping before distribution.

Open contours are editable source artwork but are excluded from font compilation. Metadata limits, glyph bounds and feature failures can block export. Components are flattened for binary compilation; source files preserve references. The original geometric demonstration intentionally contains unfinished letter construction and is not a commercial typeface.

## Next acceptance gates

1. Loss-aware source adapters with full layout-table preservation, explicit modified-table ownership and golden roundtrips.
2. Worker-based compiler/validation; CJK corpus, million-point stress, leak/device-loss and long-session history benchmarks.
3. Full feature AST and layout compiler, variable GPOS/HVAR/MVAR, CFF2, WOFF2 and differential shaping fixtures.
4. Hinting, color-font authoring, richer construction tools and non-destructive transforms as separate npm engines.
5. Verified native shortcut matrix; secure-origin storage, real WebGPU hardware, Firefox/Safari, mobile and accessibility qualification.

These are outstanding engineering tasks, not features claimed to be present in 0.1.0.
