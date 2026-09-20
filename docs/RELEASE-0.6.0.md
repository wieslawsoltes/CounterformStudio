# Counterform Studio 0.6.0 — attachment positioning, axis mapping and curve analysis

This increment builds on the verified 0.5.1 desktop workspace. All ten pinned upstream libraries, thirty independently packable components, twenty-four pointer tools and seventy-three original SVG icons are retained. There are now 148 command-backed actions. No SkiaSharpWeb API or vendor source was changed. The new functionality is real compiled layout/variation data and measured source geometry, not placeholder panels.

## Attachment layout

The FEA parser and binary compiler now implement explicit cursive (GPOS3), mark-to-base (GPOS4), mark-to-ligature (GPOS5), and mark-to-mark (GPOS6) positioning. Named anchors, NULL entry/exit anchors, repeated disjoint mark-class definitions, empty ligature components and named contextual lookup calls are supported. `subtable` splits stay inside the same lookup. Cursive records are grouped into one subtable so joining can find both glyphs.

`UseMarkFilteringSet` produces GDEF MarkGlyphSetsDef data and the lookup's extra filtering-set index. `MarkAttachmentType` produces the separate GDEF mark-attachment ClassDef and high-byte flags. Explicit anchor rules infer mark/base/ligature classes; ambiguous class assignments and overlapping classes in one lookup are rejected, including across explicit subtable boundaries. The original shared variable positioning store is retained; GDEF 1.0, 1.2 or 1.3 is selected according to the required structures.

Font → **OpenType attachment editor**, also accessible in the OpenType ribbon and feature toolbar, provides four template kinds, target/mark selection, numerical anchors, component count/advance and cursive direction. It appends ordinary editable FEA to the entire existing feature draft. Validate compiles a real TrueType font through CompilerClient, loads that font with FontFace and displays a separately owned proof with configurable sample text. Editing the source invalidates that preview. Apply is one undoable source transaction; Cancel changes nothing. Ctrl/Cmd+Enter applies from the source field.

Source identity, revision, selected master and the existing feature draft are checked before and after asynchronous work. A result arriving after dialog closure cannot apply, even before the queued close event runs. Jobs and proof FontFaces belong to the dialog's lifetime. Repeated opening/closing and full workspace disposal are tested. All application dialogs now have explicit accessible names and a labeled close control.

### Boundaries

Explicit FEA anchor coordinates in this release are static. Named source anchors in the existing automatic mark-to-base workflow still support variable positioning; that is not equivalent to variable-value FEA syntax. Device tables, full numeric lookup flags other than zero, table blocks, includes, class ranges, feature conditions and other unsupported FEA syntax remain rejected. `contourpoint` writes AnchorFormat2 only for TrueType; CFF/CFF2 export rejects it. Point numbers refer to compiled TrueType points, not the editor's cubic endpoint IDs. Native script-editing UI and every FontLab OpenType workflow are not claimed.

## Axis mapping

The varstore package exposes `normalizeAxisMap`, `mapAxisCoordinate`, `encodeAvar` and `decodeAvar`. Source axes can carry a normalized `map: [number, number][]`. Inputs are strictly increasing after F2DOT14 quantization; outputs are nondecreasing. Required −1→−1, 0→0 and 1→1 anchors are checked. Flat intervals are legal; mappings that collapse distinct source masters are rejected by the variation model.

Both source-master locations and instance queries are normalized and mapped through the same function. Variable TrueType and CFF2 emit avar 1.0 in fvar axis order, including identity records for other axes. HVAR/MVAR, gvar/CFF2 deltas and GDEF/GPOS region supports all use the mapped design space. WOFF2 preserves these tables. An all-identity map needs no avar table.

Font → **Axis mapping**, the Masters ribbon and the Masters palette open a staged editor with editable coordinate pairs, an interpolation graph, add/remove points and identity/nonlinear presets. Switching axes first validates the previous draft. Validate checks binary precision and the complete source-master model. Apply changes the source once and preserves any uncommitted feature text. The existing history restores the complete prior map. This modal does not mutate source while adjusting its fields.

### Boundaries

The new map is avar **1.0**, not cross-axis avar 2.0 or FeatureVariations. The public decoder rejects unsupported versions and malformed/truncated frames. The UI's editable maps are normalized values; it is not an importer for every application's user/design-space map format. General imported variable-font source reconstruction remains incomplete.

## Outline measurements and curvature

Contour → **Outline measurements & curvature** and the Design ribbon analyze the current evaluated glyph snapshot, including an interpolated result when displayed. The geometry package supplies the same headless `analyzeContours` and `segmentProperties` APIs.

Area and first moments are computed by polynomial Green integrals, with local-coordinate translation to reduce cancellation. Cubic inflection candidates are solved analytically. Arc length is bounded by recursively subdivided chord/control-polygon lengths, with an explicit tolerance, subdivision budget, depth budget, reported interval and convergence flag. Position, normalized tangent, signed curvature and radius are available at arbitrary segment parameters. A cusp reports undefined tangent/curvature instead of a fabricated value.

The dialog contains contour selection, statistics, a signed curvature comb and JSON export. It does not alter source, selection or font history. Comb lengths are visually clamped; numerical curvature and length results are not. The export uses the snapshot glyph's name even if a subsequent programmatic selection changes.

### Boundaries

Signed area is algebraic/winding-weighted, not the area of a Boolean union or a rasterized nonzero/even-odd fill. Open paths are not implicitly closed. Geometric bounds are subject to floating-point roundoff; this is not interval arithmetic certification. Curvature-comb visualization is sampled while the reported inflection parameters and area integrals are analytic. Genius/Tunni/Matchmaker tools and complete native measurement workflows remain separate work.

## Verification

The new core coverage adds 24 tests to the 143-test baseline (167 total). Fourteen procedural attachment scenarios are compiled independently with fontTools FEA and compared with native HarfBuzz shaping for both TrueType and CFF2: glyph IDs, clusters, x/y advances and x/y offsets. Nine mapped-export checks cover static/variable CFF2, variable TrueType, stored and compressed WOFF2; variable instances are sampled at fifteen weights and compare outlines, metrics, kerning and anchors. Together with the existing forty font checks, there are sixty-three independent font/layout checks.

Typed consumers use the new APIs. Fresh extracted package consumers compile attachments and mapped variable CFF2 in a real Node worker. Eleven additional browser checks run on source and distribution, exercising templates, actual FontFace proofs, validation errors, undo/redo, cancellation, stale source, axis tables, exported avar data, measurement JSON and dialog lifetimes. Existing editor, workspace and input suites remain enabled; their exact command inventory advances from 145 to 148 without removing prior assertions.

Local Chromium disallows HTTP navigation in this environment. Isolated local browser testing explicitly uses inline compilation/native raster rendering; it does not qualify HTTPS workers or IndexedDB. The normal GitHub workflow runs the same new UI checks over HTTP with actual workers, followed by all retained regression gates, Pages deployment and the exact-commit HTTPS smoke test. Consult the commit-associated run/artifacts for that execution's result. No physical WebGPU, Safari/Firefox, mobile or assistive-technology certification is implied.

## Remaining parity work

This is not full FontLab parity. Hint authoring/debugging, variable color/SVG/bitmap fonts, expanded source-format adapters, general lossless reconstruction, FeatureVariations, full FEA grammar, specialized construction/metrics/kerning workflows and exhaustive native shortcuts remain outstanding. The capability ledger records these separately from the implemented features above. npm archives are packed and tested, not automatically published to the registry.

## Primary specifications

- Adobe OpenType Feature File Specification: https://adobe-type-tools.github.io/afdko/OpenTypeFeatureFileSpecification.html
- OpenType GPOS: https://learn.microsoft.com/en-us/typography/opentype/spec/gpos
- OpenType GDEF: https://learn.microsoft.com/en-us/typography/opentype/spec/gdef
- OpenType avar: https://learn.microsoft.com/en-us/typography/opentype/spec/avar

Reviewed 2026-09-20. The APIs above are Counterform APIs and do not modify the .NET-compatible SkiaSharpWeb surface.
