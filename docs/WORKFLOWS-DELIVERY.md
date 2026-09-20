# Production workflows delivery — 0.7.0

The complete editable source, declarations, tests and documentation were committed directly to `main` at `5e45b74efa9e4133b269f7031b43fc514451e628`. Fresh application screenshots were committed at `9b6d8d433752137fd6dc892a4a6b3619df128aea`. All ten pinned vendor trees and the SkiaSharpWeb API are unchanged. The application contains 31 standalone Counterform packages, 151 registered commands, 24 pointer tools, nine menus and 73 original SVG icons.

The source-delivery run `35498193565` checked the delivery SHA-256 and every before/after Git blob, materialized all 73 records, and passed core tests, TypeScript consumers, independent font checks and the new browser workflow suite before capturing screenshots. The one-shot materialization workflow has been retired. Editable source directories are authoritative; archived delivery fragments are provenance and must not overwrite subsequent development.

The normal `Verify and publish Counterform Studio` workflow now permanently tests conditional features, font collections and metrics editing on both source and built distribution, alongside all previous editor, advanced-authoring, workspace, input/lifetime, readiness, font and package-consumer gates. Its `deploy` and `live-pages` jobs establish publication and qualification of the exact HTTPS build; this document is not a substitute for their run status.

Local evidence: 190 core tests, 78 independent font/layout scenarios, strict TypeScript consumers and 31 extracted npm-package consumers passed. Isolated local browser tests passed with explicit secure-API skips in the existing editor/workspace suites; the new 12-check workflow suite passed without skips on source and distribution. Remote tests run actual browser compiler workers, native Skia software rendering and secure-origin storage. Physical WebGPU, Safari/Firefox and assistive-technology certification remain separate acceptance gates.

## Delivered workflows

- GSUB/GPOS FeatureVariations with design-space conditions, avar mapping, script/language isolation, ordered alternatives, static-instance selection, FEA source editing and real compiled preview.
- TTC/OTC versions 1 and 2 with mixed outline formats, identical table sharing, bounded validation/extraction, collection building and explicit face selection on import.
- Source-order metrics strings, safe arithmetic and glyph-reference formulas, dependency-ordered atomic batch spacing, explicit zero kerning overrides and undo/redo in a dedicated editor.

See [release notes](RELEASE-0.7.0.md), [usage and algorithm details](VARIABLE-FEATURES-COLLECTIONS-METRICS.md) and the [capability ledger](CAPABILITIES.md). These are implemented increments, not exhaustive FontLab parity. Persistent linked metrics, optical kerning, full hinting/debugging, additional color formats, arbitrary lossless editable reconstruction and specialized native workflows remain outside this release. npm archives are packed and consumer-tested, not automatically published to the registry.
