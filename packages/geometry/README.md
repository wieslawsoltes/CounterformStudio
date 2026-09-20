# @wieslawsoltes/counterform-geometry

Double-precision Bézier outlines, analytical bounds, winding, splitting and compatible quadratic conversion.

Version **0.6.0**. ES modules with TypeScript declarations. No application-global singleton is required by the pure authoring engines. The renderer/editor/workbench packages require a browser DOM.

## Install

```sh
npm install ./wieslawsoltes-counterform-geometry-0.6.0.tgz
```

Install the companion Counterform tarballs together when using unpublished packages. Package manifests declare the exact source dependencies; no implementation is hidden in the application entry point. `npm run bootstrap` links the supplied workspace and vendor snapshots for offline development.

## API

The public module is `src/index.js`; declarations are in `types/index.d.ts`. Read the root `docs/ARCHITECTURE.md`, `docs/API.md` and `docs/CAPABILITIES.md` for coordinate conventions, ownership and implementation boundaries. Do not infer complete FontLab or OpenType specification coverage from a package name.

## Licensing

MIT for Counterform code. Dependencies retain their licenses; see `THIRD_PARTY_NOTICES.md`.

`analyzeContours` and `segmentProperties` provide polynomial area/centroid, analytic inflections, bounded arc lengths and signed curvature. See docs/ADVANCED-AUTHORING.md for equations, error bounds and budgets.
