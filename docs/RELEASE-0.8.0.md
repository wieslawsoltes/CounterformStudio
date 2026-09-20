# Counterform Studio 0.8.0 — Unicode and vector interchange

This release adds cmap format-14 Unicode variation-sequence authoring, a staged encoding editor with compiled proofs, source/import/export/metrics integration, and a standalone SVG vector-extraction engine. The shared geometry parser now accepts every SVG path command including elliptical arcs. All ten pinned vendors remain unchanged; the workspace contains 32 standalone npm packages, 152 commands, 24 pointer tools and 73 original vector icons. SkiaSharpWeb APIs remain unchanged.

The existing queued-close modal ownership race is corrected across authoring dialogs. Owned compiler requests, fonts and subscriptions are released synchronously and exactly once, without synthesizing a second native close event or breaking canceled Escape behavior.

See [contracts and usage](UNICODE-SVG-INTERCHANGE.md) for numeric/resource limits, geometry versus appearance boundaries, source revision guards and independent verification. The current commit-associated Actions run is authoritative for remote delivery. Local isolated-browser passes do not establish worker, secure-storage or hardware qualification, and packing does not publish packages to the registry.

This is an implemented parity increment, **not completion of FontLab parity**. Hint authoring/debugging, variable COLRv1 and bitmap/SVG color fonts, arbitrary artwork layers, full proprietary source interchange, broader FEA grammar/device anchors, native specialized tools/gestures and exhaustive shortcuts remain tracked in the capability ledger.
