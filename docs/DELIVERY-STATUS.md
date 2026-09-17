# Delivery status

## Confirmed remote baseline

`a24fdc3bdc0a321d6504fd4a387180b296e1104c` is the last confirmed remote `main` revision, containing the 0.4.0 production engines and contextual layout compiler. GitHub Actions run `35249506480` completed verification, Pages deployment and live HTTPS checks successfully. Its source archive was retrieved through the connected GitHub artifact API and verified against artifact SHA-256 `aba54791d71eae7e336fb9689485fd2f4db1ac8ae4c2ab7408e262d3fdeb891e` before development.

## Local 0.5.0 increment

The static COLRv1/CPALv1 increment is committed locally on that exact baseline and delivered as an apply-ready Git patch and complete source. The active connector exposes repository reads but no commit/ref-write actions, and command-line Git cannot resolve the GitHub host in this execution environment. No new remote push, CI run or Pages deployment is claimed. Apply the patch to a clean checkout, push, and use the resulting CI run as the publication gate.

The local release manifest records actual core, independent font, type, package-consumer and source/distribution browser results. The browser environment requires explicit isolated-assets mode: inline compiler, native Skia raster, no secure context. Browser workers and IndexedDB passed on the prior remote baseline, not as new secure-origin qualification of 0.5.0. Fresh packaged Node workers are tested separately.

## Source authority

Editable `app`, `packages`, `scripts`, `tests` and documentation are authoritative. `.delivery` and `.recovery` archives retain historical provenance; their already-applied source-import workflows are retired. Do not rerun an archived importer over new development. Ordinary pushes run tests before Pages deployment; pull requests test without deploying. The post-deployment test requires the exact asset-manifest commit and verifies the HTTPS subpath, compiler workers, icons, keyboard menus, IndexedDB and disposal.
