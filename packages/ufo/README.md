# @wieslawsoltes/counterform-ufo

UFO3/GLIF source interchange, plist XML and bounded ZIP archives.

Version **0.5.1**. ES modules with TypeScript declarations. No application-global singleton is required by the pure authoring engines. The renderer/editor/workbench packages require a browser DOM.

## Install

```sh
npm install ./wieslawsoltes-counterform-ufo-0.5.1.tgz
```

Install the companion Counterform tarballs together when using unpublished packages. Package manifests declare the exact source dependencies; no implementation is hidden in the application entry point. `npm run bootstrap` links the supplied workspace and vendor snapshots for offline development.

## API

The public module is `src/index.js`; declarations are in `types/index.d.ts`. Read the root `docs/ARCHITECTURE.md`, `docs/API.md` and `docs/CAPABILITIES.md` for coordinate conventions, ownership and implementation boundaries. Do not infer complete FontLab or OpenType specification coverage from a package name.

## Licensing

MIT for Counterform code. Dependencies retain their licenses; see `THIRD_PARTY_NOTICES.md`.
