# Counterform Studio

### Make every curve count.

**A working, modular browser font editor built with HTML, JavaScript and SkiaSharpWeb, with an optional WebGPU compute package.** Version 0.1.0.

This is an original implementation targeting the FontLab 8.4 workflow. **It is not a feature-complete FontLab replacement.** The implemented subset includes real outline editing, masters, kerning, OpenType compilation, source interchange and live proofing—not simulated export buttons. Read [the capability contract](docs/CAPABILITIES.md) before editing production fonts. Unreconstructed font tables can be lost on re-export; keep originals.

![Counterform outline editor](test-results/outline-editor.png)

## Run offline from the source archive

Node.js 22 or newer:

```sh
cd CounterformStudio
npm run bootstrap
npm start
```

Open `http://127.0.0.1:4173`. The initial run does not require `npm install`, a CDN, an API key, cloud storage, or a downloaded font. The complete original demo font is generated from JavaScript outline data. Do not open `index.html` using `file://`.

The source archive includes pinned vendor runtime packages. Bootstrap only creates local package links (junctions on Windows); it runs no dependency install scripts. `?demo` bypasses recent-project restoration.

## What works

The workspace uses real Dockyard docking, a RibbonWeb command ribbon, a virtual glyph library, a TreeDataGridWeb font inventory, a GridWeb kerning matrix and RichTextWeb notes. ReactiveWeb and DynamicDataWeb project the document state. Native Skia paths draw the font; RBushWeb accelerates node/handle picking, and QuikGraphWeb checks component dependency graphs.

Draw and edit Bézier contours, move handles, insert points, add rectangles/ellipses, measure, zoom and pan. Use snapping, 1/10/0.1-unit keyboard nudges, undo/redo, copy/paste, affine transforms, sidebearings, anchors, reusable components, overlap removal, Boolean operations and stroke expansion. Edit compatible masters and inspect read-only interpolated instances. Proof text uses a newly compiled `FontFace`, not a substitute preview typeface.

Export real **TTF, CFF OTF, WOFF1, variable TTF, UFO3 archives and Counterform source**. Supported layout compilation includes single substitutions, ligatures, pair kerning, mark-to-base attachment and GDEF classes. Variable export writes `fvar`, `gvar` and `STAT`; it does not emit variable kerning, CFF2, hinting or color-font paint graphs.

## Repository structure

```text
app/                   Application bootstrap; native browser import map
packages/              18 independently packable @wieslawsoltes/counterform-* packages
vendor/                Pinned upstream source/runtime inputs
scripts/               Offline bootstrap, server, static build, npm packing, archiving
examples/              Headless font compiler example
tests/                Node, browser, TypeScript and independent fontTools tests
docs/                  Architecture, APIs, keyboard map, capability and security contracts
test-results/          Reproducible reports and actual application screenshots
vendor-lock.json       Source provenance and artifact SHA-256 identifiers
```

## Verification

```sh
npm test
npm run test:types
npm run test:fonts
npm run test:browser
npm run build
npm run pack:all
```

Python tests require `python -m pip install -r tests/requirements.txt`. Browser tests require Playwright Chromium (`python -m playwright install chromium`) or `CHROMIUM_PATH`. Type checking requires TypeScript (`tsc`). The app itself needs neither Python nor TypeScript.

Recorded qualification: **36 Node tests**, **7 independent fontTools checks**, **25 browser checks**, plus TypeScript consumer compilation. The delivered browser run used Chromium's actual native-Skia **canvas/raster backend** in an opaque local-content context. It verifies input, drawing, compilation and integration, but **does not qualify WebGPU, hardware acceleration, Safari/Firefox, IndexedDB or mobile device behavior**. The separate WGSL interpolation implementation was exercised through its numerical CPU fallback. Normal localhost CI is configured to test the browser-selected backend and IndexedDB save/load.

## Modular npm packages

`npm run pack:all` emits 18 `.tgz` packages into `artifacts/npm`, each with source, declarations, license and declared dependencies. They are **packaged, not published to npm**. Root-workspace use is offline; installing a standalone package normally resolves its declared dependencies through your configured registry. Install the Counterform tarballs together while they are unpublished.

See [API examples](docs/API.md), [architecture](docs/ARCHITECTURE.md), [keyboard map](docs/KEYBOARD.md), and [production gaps](docs/CAPABILITIES.md).

## GitHub and static hosting

The supplied `dist` build is a static site with relative asset URLs and no server application. It can be placed under a repository subpath. GitHub Pages requires enabling Pages with GitHub Actions and manually running the included Pages workflow. Other hosts can consume the included `_headers` file for cross-origin isolation; GitHub Pages does not apply that file.

A destination repository was not supplied and no remote commit/deployment was made. To create the proposed repository from your own authenticated shell:

```sh
./scripts/publish-github.sh wieslawsoltes/CounterformStudio
```

The helper refuses an existing remote that points somewhere else. It does not silently rewrite your Git remotes.

## Licensing

MIT for Counterform's original code. Upstream licenses are retained, including QuikGraphWeb's MS-PL and the fontTools algorithm's BSD-style license. See [third-party notices](THIRD_PARTY_NOTICES.md). No font binaries are bundled in the deliverable.
