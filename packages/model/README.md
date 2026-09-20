# @wieslawsoltes/counterform-model

Serializable font documents, glyphs, masters, layers, components, anchors and source validation.

Version **0.8.0**. ES modules with TypeScript declarations. No application-global singleton is required by the pure authoring engines. The renderer/editor/workbench packages require a browser DOM.

## Install

```sh
npm install ./wieslawsoltes-counterform-model-0.8.0.tgz
```

Install the companion Counterform tarballs together when using unpublished packages. Package manifests declare the exact source dependencies; no implementation is hidden in the application entry point. `npm run bootstrap` links the supplied workspace and vendor snapshots for offline development.

## API

The public module is `src/index.js`; declarations are in `types/index.d.ts`. Read the root `docs/ARCHITECTURE.md`, `docs/API.md` and `docs/CAPABILITIES.md` for coordinate conventions, ownership and implementation boundaries. Do not infer complete FontLab or OpenType specification coverage from a package name.

## Licensing

MIT for Counterform code. Dependencies retain their licenses; see `THIRD_PARTY_NOTICES.md`.

## 0.8.0 interchange

Stable source variationSequences and FontDocument.variation with validation and indexed lookup. See `docs/UNICODE-SVG-INTERCHANGE.md` in the repository for limits and verification.
