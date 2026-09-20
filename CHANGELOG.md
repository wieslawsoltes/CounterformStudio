# Changelog

## 0.8.0 — Unicode and vector interchange

Added cmap14 UVS authoring, binary/source roundtrips, compiled encoding proofs, source metrics resolution, complete SVG path commands, bounded transformed-document vector extraction and a standalone SVG package. Corrected synchronous modal resource ownership while preserving native cancellation/events. Added codec, fontTools/HarfBuzz and browser regression gates.

## 0.7.0 — conditional layout, collections and metrics

Real GSUB/GPOS FeatureVariations with avar-aware conditions and static-instance selection; TTC/OTC codecs, table sharing and face chooser; standalone metrics-string/formula engine and transactional UI. Added source/distribution browser gates and independent fontTools/HarfBuzz oracles. Thirty-one packages, 151 commands; pinned vendors and SkiaSharpWeb APIs unchanged. See `docs/RELEASE-0.7.0.md` for qualified subsets and remaining gaps.

## 0.6.0 — attachment layout, axis mapping and curve analysis

Explicit GPOS3/4/5/6 FEA attachments, named anchors, mark classes, mark filtering and attachment flags; shared GDEF variable store preservation; source-aware validation and compiled proof editor. avar 1.0 map codec, source/preview/export integration and staged map UI. Analytic contour moments/inflections, bounded arc-length analysis and curvature comb. Added 24 core tests, 23 independent font/layout checks and 11 browser workflow gates on source/distribution; retained all previous suites. Thirty 0.6.0 packages, 148 commands, 24 pointer tools, 73 icons; no vendor changes. Full FontLab parity remains outstanding; see the release contract.


## 0.5.1 — desktop workspace

Compact neutral chrome, paper-first light/dark editing, full Font window, retained table inventory, collapsible palettes, contour selection, direct metrics, adjacent glyphs, panel rail, Focus/Reset, ordered device preferences, stable virtual-grid keyboard focus, and typed presentation controls. All ten vendors, 30 packages and original font engines are retained. Five new vector icons bring the total to 73; eight new workspace commands bring the total to 145. Added headless preference tests and 15 browser UX gates.


## 0.5.0 — 2026-09-17

Add the thirtieth standalone package, `colrv1`: all 18 static paint formats, 28 composite modes, bounded graph reconstruction and static clip boxes. Add CPALv1 named palettes/entries and usability flags with collision-free name allocation, including CFF2 variable exports. Integrate the transactional paint-tree/property/JSON editor, gradients and transforms, compiled FontFace proof and exact-revision native Skia color rendering. Retain optional COLRv0 fallbacks and editable source contours. Add the paint-graph ribbon icon and command (68 icons, 137 commands).

Fix cross-glyph paint validation in scoped undo transactions, self references when duplicating color glyphs, range-input initialization, and nested-dialog disposal. Add Node, independent fontTools colorLib, typed-consumer, packaged-worker and browser pixel/interaction tests. Retire the already-applied contextual delivery workflow. See `docs/RELEASE-0.5.0.md` for measured qualification and remaining gaps. The complete implementation is committed on `main`; see `docs/DELIVERY-STATUS.md` for publication and verification status.

## 0.4.0 contextual continuation

Compile supported contextual/chaining, multiple, alternate and reverse OpenType substitutions and contextual positioning; named lookups, ordered ignores, extensions and script/language selection. Fourteen procedural fontTools/HarfBuzz oracle scenarios. Committed baseline `a24fdc3bdc0a321d6504fd4a387180b296e1104c` passed remote CI, Pages and live HTTPS checks in run `35249506480`.

## 0.4.0

CFF2/WOFF2 export; HVAR/MVAR; variable kerning and anchors; non-destructive outline stacks; integrity-checked recovery journal; guarded original/metadata-only font preservation. See docs/RELEASE-0.4.0.md.


## 0.3.0

Add three standalone construction/icon/menu packages, 24 pointer tools, nine menus covering 130 commands, classic ribbon SVG icons and quick access. Add cubic-preserving knife/scissors, freehand/pressure drawing, interactive transforms, guide/anchor editing, source locks, tool options and contour surgery. Fix Escape/Undo cancellation, unrelated pointer gating and optional command parameter declaration. Expand source/distribution UI checks and independent package consumer verification. See docs/RELEASE-0.3.0.md for explicit parity limits.

## 0.2.0 — 2026-09-17 (local patch delivery)

Added two standalone packages: `color` (COLRv0/CPALv0) and `compiler` (worker service). Color layer/palette authoring is integrated with history, Inspector, Ribbon, Skia rendering, TTF/CFF/variable/WOFF output and supported TrueType import. RGBA input errors roll back without unhandled exceptions. Palette and layer expansion budgets protect binary decoders.

Compilation, proof generation, validation and table inspection use immutable snapshot jobs with transfer results, a bounded priority queue, key replacement, active cancellation, timeout and deterministic disposal. Offline bootstrap/build generates the static browser worker graph without relying on HTML import maps. Browser proof rejects stale FontFace completion.

Fixed autosave flush completion, trailing writes, reentrancy, late database open and source snapshot timing. New-font creation no longer unconditionally claims that a failed recovery write succeeded. Replaced fixed-time glyph-inventory assertions with state/visibility waits and failure diagnostics. Source/distribution CI reports are retained separately. Packing removes obsolete archives before creating the 20 versioned packages.

Local qualification: 60 core tests, 11 independent fontTools checks, 27 passing browser checks and one explicit IndexedDB skip on each of source and distribution, 20 extracted package consumers, and typed APIs. Actual Node workers are tested; local browser uses explicit inline compilation/native Skia raster. Real HTTPS browser worker startup, IndexedDB and hardware WebGPU remain unqualified locally. Remote main has not been updated by this patch delivery.

## 0.1.0 — 2026-09-16

Initial working Counterform Studio release: 18 modular packages and all ten requested upstream component integrations. Real font outlines and source history; native Skia geometry; TTF/CFF/WOFF/variable font compilation; kerning and restricted layout features; UFO/GLIF interchange; compiled live proof; command mapping; declarative recipes and independent numerical compute service.

Fixed in qualification: Ribbon groups use their actual `items` contract; kerning call argument order matches the font engine; document shortcuts run ahead of docking shortcuts; UFO import respects edited GLIF source rather than blindly restoring embedded metadata; collinear Bézier flattening preserves overshoot; invalid source mutations roll back before commit. Added bounded source validation, standalone package metadata and explicit platform qualification reports.

This release is not complete FontLab parity; see the capability ledger.
