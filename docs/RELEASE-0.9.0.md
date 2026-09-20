# Counterform Studio 0.9.0 — artwork, autotrace and curve fitting

This release adds per-master PNG references and vector masks, native Skia rendering of those references, a staged artwork editor, RGBA autotracing through the existing browser/Node worker, exact counter-preserving pixel boundaries, optional conservatively bounded cubic fits and an explicit polyline-fitting command.

All ten pinned vendor libraries remain unchanged. The release contains **34 independently packable npm packages, 156 commands, 24 pointer tools and 76 original SVG icons**. SkiaSharpWeb's .NET-compatible APIs are unchanged. New `counterform-artwork` and `counterform-tracing` packages have complete source entrypoints, type declarations, licenses and README/API documentation.

References remain separate from compiled glyph ink and survive Counterform source/history/custom UFO metadata. Artwork-only changes preserve binary output and metadata-only original-font eligibility; explicit traced/inserted foreground edits use the ordinary compiler. Native cache teardown, raster view copying, 64 MiB queue accounting, source revision guards and nested preview ownership are covered by regressions.

Read [workflow, algorithm and ownership contracts](ARTWORK-TRACING.md) and [the parity ledger](CAPABILITIES.md). The associated GitHub Actions run establishes remote verification and Pages publication. Local isolated browser passes do not establish browser-worker, secure-storage, hardware or accessibility certification. Packing packages does not publish them to npm.

This is a working parity increment, **not full FontLab parity**. TrueType/PostScript hint authoring/debugging, variable COLRv1, bitmap/SVG color-font tables, arbitrary artwork hierarchies and other image formats, proprietary source adapters, broader FEA grammar, specialized native tools and exhaustive shortcut compatibility remain outstanding. Fitted output has a continuous distance bound against thresholded pixel geometry, not a guarantee of optical quality or topology preservation at near contacts.
