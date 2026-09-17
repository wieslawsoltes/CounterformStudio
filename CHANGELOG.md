# Changelog

## 0.2.0 — 2026-09-17 (local patch delivery)

Added two standalone packages: `color` (COLRv0/CPALv0) and `compiler` (worker service). Color layer/palette authoring is integrated with history, Inspector, Ribbon, Skia rendering, TTF/CFF/variable/WOFF output and supported TrueType import. RGBA input errors roll back without unhandled exceptions. Palette and layer expansion budgets protect binary decoders.

Compilation, proof generation, validation and table inspection use immutable snapshot jobs with transfer results, a bounded priority queue, key replacement, active cancellation, timeout and deterministic disposal. Offline bootstrap/build generates the static browser worker graph without relying on HTML import maps. Browser proof rejects stale FontFace completion.

Fixed autosave flush completion, trailing writes, reentrancy, late database open and source snapshot timing. New-font creation no longer unconditionally claims that a failed recovery write succeeded. Replaced fixed-time glyph-inventory assertions with state/visibility waits and failure diagnostics. Source/distribution CI reports are retained separately. Packing removes obsolete archives before creating the 20 versioned packages.

Local qualification: 60 core tests, 11 independent fontTools checks, 27 passing browser checks and one explicit IndexedDB skip on each of source and distribution, 20 extracted package consumers, and typed APIs. Actual Node workers are tested; local browser uses explicit inline compilation/native Skia raster. Real HTTPS browser worker startup, IndexedDB and hardware WebGPU remain unqualified locally. Remote main has not been updated by this patch delivery.

## 0.1.0 — 2026-09-16

Initial working Counterform Studio release: 18 modular packages and all ten requested upstream component integrations. Real font outlines and source history; native Skia geometry; TTF/CFF/WOFF/variable font compilation; kerning and restricted layout features; UFO/GLIF interchange; compiled live proof; command mapping; declarative recipes and independent numerical compute service.

Fixed in qualification: Ribbon groups use their actual `items` contract; kerning call argument order matches the font engine; document shortcuts run ahead of docking shortcuts; UFO import respects edited GLIF source rather than blindly restoring embedded metadata; collinear Bézier flattening preserves overshoot; invalid source mutations roll back before commit. Added bounded source validation, standalone package metadata and explicit platform qualification reports.

This release is not complete FontLab parity; see the capability ledger.
