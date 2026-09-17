# Desktop workspace delivery — 0.5.1

The complete editable redesign and three generated Chromium screenshots were committed directly to `main` at `d9fb1f8df7be853c453e78e70b7fb2e097d6f362`. The implementation retains all ten pinned vendor libraries and all 30 Counterform packages, with 145 command-backed actions, 24 pointer tools and 73 original SVG icons.

The source-materialization run `35274869329` verified source SHA-256 and each before/after Git blob, passed 132 core tests and all 15 workspace browser checks, then committed the readable source and screenshots. Two documentation records were rebased explicitly onto the already-confirmed 0.5.0 publication notices; existing release history was preserved. The temporary workspace-materialization workflow has been retired.

The normal CI workflow runs both the original 60-check editor suite and the 15-check workspace suite on source and distribution before deployment. Its subsequent `deploy` and `live-pages` jobs establish publication and qualification of the exact HTTPS build; this document does not substitute for their run status.

## Independent rendering readiness

Run `35275130257` passed core, typed, font and package gates plus all 60 source-browser checks using real compiler workers and Skia WebGL. The distribution browser exposed a test-startup race: a compiled FontFace could be ready before the independently initialized native drawing surface. No editing assertion was relaxed. The shared `tests/browser_ready.py` now requires both a proof and a completed native paint, rejects fallback/error/disposed states, and reports diagnostics on a bounded timeout. Five isolated readiness-gate unit tests exercise those states; they do not simulate font rendering qualification. Source, distribution, workspace and live-site suites use the same gate before capturing backend evidence or screenshots.

Local evidence includes 132 core tests, 40 independent font/layout checks, strict TypeScript consumers and 30 extracted npm consumers. Opaque-origin local tests use explicit inline compilation and cannot certify secure storage. Actual browser workers and IndexedDB are exercised remotely. Software-rendered Chromium is not physical GPU, Firefox/Safari, native-font-editor pixel parity or assistive-technology certification.

See [design and usage](WORKSPACE-DESIGN.md), [release notes](RELEASE-0.5.1.md) and [the capability ledger](CAPABILITIES.md). Packed npm artifacts are generated and consumer-tested, not automatically published to the registry. Editable source directories are authoritative; `.delivery` archives retain provenance and must not overwrite subsequent development.
