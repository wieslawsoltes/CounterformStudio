# Desktop workspace delivery — 0.5.1

The complete editable redesign and three freshly generated Chromium screenshots were committed directly to `main` at `d9fb1f8df7be853c453e78e70b7fb2e097d6f362`. The implementation retains all ten pinned vendor libraries and all 30 Counterform packages, with 145 command-backed actions, 24 pointer tools and 73 original SVG icons.

The source-materialization run `35274869329` verified the source SHA-256 and each before/after Git blob, passed 132 core tests and all 15 workspace browser checks, then committed the readable source and screenshots. Two documentation records were rebased explicitly onto the already-confirmed 0.5.0 publication notices; existing release history was preserved. The source codec/build/worker and original editor regression suites are still required by the normal CI gate.

The temporary materialization workflow has been retired. The normal `Verify and publish Counterform Studio` workflow now tests both the original 60-check editor suite and the 15-check workspace suite on source and distribution before deployment. Its subsequent `deploy` and `live-pages` jobs establish publication and qualification of the exact HTTPS build; this document does not substitute for their run status.

Local evidence: 132 core tests; 40 independent font/layout checks; strict TypeScript consumers; 30 extracted npm consumers; source/distribution original browser suites at 57 checks plus three explicit opaque-origin skips, and workspace suites at 14 checks plus one preference-persistence skip. The successful remote workspace run exercised actual browser workers, Skia WebGL software rendering and IndexedDB preferences. Software-rendered Chromium is not physical GPU, Firefox/Safari, native-font-editor pixel parity or assistive-technology certification.

See [design and usage](WORKSPACE-DESIGN.md), [release notes](RELEASE-0.5.1.md) and [the capability ledger](CAPABILITIES.md). Packed npm artifacts are generated and consumer-tested, not automatically published to the registry. Editable source directories are authoritative; `.delivery` archives retain provenance and must not overwrite subsequent development.
