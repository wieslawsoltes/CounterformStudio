# Delivery status

## 0.5.0 is committed on main

The complete editable 0.5.0 implementation, package metadata, documentation and original local verification evidence are committed at [`12b9c3aca24d59154d79676ef8b3d6ae96f1f7ed`](https://github.com/wieslawsoltes/CounterformStudio/commit/12b9c3aca24d59154d79676ef8b3d6ae96f1f7ed). Fresh verified paint-graph, compositing and sweep-gradient screenshots are committed at [`2cd720ebf79bda203baf521fa9fb09c7f68a2b50`](https://github.com/wieslawsoltes/CounterformStudio/commit/2cd720ebf79bda203baf521fa9fb09c7f68a2b50).

All 109 delivered UTF-8 source records passed before/after Git-blob checks. The committed application, packages, scripts, tests and pinned vendor trees match the supplied release. The three documentation screenshots were regenerated in CI rather than copied from the original local raster capture.

## Fresh remote verification

[Commit verification run 35268489109](https://github.com/wieslawsoltes/CounterformStudio/actions/runs/35268489109) passed core tests, strict TypeScript compilation, independent font checks, static assembly and all 30 fresh npm-package consumers. Source and distribution browser suites each passed **60 checks, with zero skips and zero unhandled page exceptions**. They exercised the actual browser compiler worker, secure-origin persistence/recovery and Skia WebGL through SwiftShader. These results do not certify physical GPU performance, Safari/Firefox or assistive technologies.

The downloadable `counterform-v5-commit-verification` artifact has SHA-256 `9d102f418c0eb9fbe854b5af693bbaf5aecd4a98d26b5e5441d3515024db4bfd`. It contains the committed source archive, fresh test reports, screenshots and all 30 packed npm packages. Packages are packed and integrity-checked, not published to the npm registry.

The [normal verification and Pages workflow](https://github.com/wieslawsoltes/CounterformStudio/actions/workflows/ci.yml) is the publication gate. Its `verify`, `deploy` and `live-pages` jobs distinguish build verification, Pages publication and qualification of the exact deployed commit. A successful commit-import run alone is not a Pages-deployment claim.

## Historical local evidence

The initial 0.5.0 patch was based on `a24fdc3bdc0a321d6504fd4a387180b296e1104c`. Its original isolated-browser results are retained unchanged under `docs/verification/0.5.0`: 57 checks and three explicit secure-origin skips per browser suite. Those historical local skips are not the new remote results above. Older release notes describing patch-only delivery record the state at their original delivery time.

## Source authority

Editable `app`, `packages`, `scripts`, `tests` and documentation are authoritative. The one-shot source-import workflow has been retired after successful restoration. `.delivery`, `.import` and `.recovery` archives retain historical provenance and must not overwrite subsequent development. Ordinary pushes run the normal verification workflow before Pages deployment; pull requests test without deploying. The post-deployment check requires the exact asset-manifest commit and tests the HTTPS repository subpath, compiler workers, icons, keyboard menus, IndexedDB and disposal.
