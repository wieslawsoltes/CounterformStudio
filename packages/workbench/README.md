# @wieslawsoltes/counterform-workbench

Counterform Studio dockable font-authoring workspace and application composition.

Version **0.8.0**. ES modules with TypeScript declarations. No application-global singleton is required by the pure authoring engines. The renderer/editor/workbench packages require a browser DOM.

## Install

```sh
npm install ./wieslawsoltes-counterform-workbench-0.8.0.tgz
```

Install the companion Counterform tarballs together when using unpublished packages. Package manifests declare the exact source dependencies; no implementation is hidden in the application entry point. `npm run bootstrap` links the supplied workspace and vendor snapshots for offline development.

## API

The public module is `src/index.js`; declarations are in `types/index.d.ts`. Read the root `docs/ARCHITECTURE.md`, `docs/API.md` and `docs/CAPABILITIES.md` for coordinate conventions, ownership and implementation boundaries. Do not infer complete FontLab or OpenType specification coverage from a package name.

## Licensing

MIT for Counterform code. Dependencies retain their licenses; see `THIRD_PARTY_NOTICES.md`.

## Desktop presentation

The default is a compact, neutral workspace with a white glyph canvas and subdued outline fill. The full labeled RibbonWeb ribbon remains available through Window → Expanded ribbon. Dockyard retains ownership of every editor and palette. Window → Workspace preferences changes device-local appearance without modifying font source. See `docs/WORKSPACE-DESIGN.md` in the source repository.

```js
import {mountStudio} from '@wieslawsoltes/counterform-workbench';
import {normalizeWorkspacePreferences} from '@wieslawsoltes/counterform-workbench/preferences';
const studio = await mountStudio(document.querySelector('#studio'), {restore:false});
studio.workspaceUI.setPreference('ribbon', 'expanded');
studio.workspaceUI.setPreference('canvas', 'paper');
// Keep this lifetime and call studio.dispose() on unmount.
```

The preference normalizer is headless. Workbench mounting requires a browser DOM. Import `@wieslawsoltes/counterform-workbench/styles.css` through your bundler, or include the supplied CSS from the pinned source layout.

The `./advanced` subpath exports attachment, axis-map and outline-analysis dialogs. They use the existing document, compiler service, command registry and history. Compiled proof resources and requests are canceled on close; source edits are revision-guarded.

## 0.8.0 interchange

Glyph → Unicode variation sequences provides staged mapping edits and owned compiled proofs; File/Open accepts the supported transformed SVG geometry subset. See `docs/UNICODE-SVG-INTERCHANGE.md` in the repository for limits and verification.
