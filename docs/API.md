# Standalone package API examples

The package scope is `@wieslawsoltes/counterform-`. The following examples run after workspace bootstrap or after installing the corresponding tarballs/dependencies.

## Create, edit, undo and compile a font without the UI

```js
import { FontDocument, createFont, createGlyph } from '@wieslawsoltes/counterform-model';
import { rectangle, ellipse, reverseContour } from '@wieslawsoltes/counterform-geometry';
import { History } from '@wieslawsoltes/counterform-history';
import { compileTrueType } from '@wieslawsoltes/counterform-font-io';

const doc = new FontDocument(createFont('Counterform Example'));
const history = new History(doc);
history.execute('Create glyphs', () => {
  doc.addGlyph(createGlyph('.notdef', null, doc.data.masters));
  const glyph = createGlyph('O', 0x004f, doc.data.masters);
  glyph.layers[0].contours = [ellipse(300,350,250,350), reverseContour(ellipse(300,350,170,270))];
  glyph.layers[0].advanceWidth = 600;
  doc.addGlyph(glyph);
});
const bytes = compileTrueType(doc); // Uint8Array; no browser, GPU or server required
history.undo();
history.redo();
```

`examples/compile.mjs` writes an original generated font to a path you explicitly provide. There are no fixture font files in the repository.

## Mount only the editing surface

```js
import { initializeSkia, GlyphRenderer } from '@wieslawsoltes/counterform-renderer';
import { GlyphEditor } from '@wieslawsoltes/counterform-editor';

const S = await initializeSkia();
const renderer = new GlyphRenderer(document.querySelector('#surface'), { S });
const editor = new GlyphEditor(doc, history, renderer);
editor.setGlyph(doc.glyph('O').id);
renderer.fit();
// At unmount, dispose editor before renderer.
editor.dispose();
renderer.dispose();
```

The renderer consumes unmodified SkiaSharpWeb APIs. Its native WASM asset directory must remain deployable according to the upstream package's asset-copy rules. The source workspace's import map already resolves these paths.

## Mount the complete workspace

```js
import { mountStudio } from '@wieslawsoltes/counterform-workbench';
import '@wieslawsoltes/counterform-workbench/styles.css';
import '@wieslawsoltes/dockyard/styles.css';
import '@wieslawsoltes/treedatagridweb/styles.css';

const studio = await mountStudio(document.querySelector('#app'), {
  document: doc, restore: false,
  compilerOptions: { workerURL: new URL('./app/workers/compiler.js', location.href) }
});
await studio.commands.run('view.kerning');
// Later:
studio.dispose();
```

Use the supplied root HTML/import map as the no-bundler reference. The app loads RichTextWeb's standalone global runtime and a narrow ESM bridge to avoid unresolved peer dependencies without modifying upstream code. In a normal npm/bundler application, install RichTextWeb's declared dependencies and consume its ESM exports directly. The public stylesheet exports above are required alongside the workbench stylesheet.

## Variable geometry and binary export

```js
import { createDemoFont } from '@wieslawsoltes/counterform-model';
import { instanceDocument, compileVariableTrueType } from '@wieslawsoltes/counterform-variations';
const family = createDemoFont();
const semibold = instanceDocument(family, { wght: 600 }, { name: 'Semibold' });
const variableBytes = compileVariableTrueType(family);
```

Topology must match across masters. Do not approximate each master independently before generating gvar; use the shared subdivision implementation. No variable-kerning, CFF2 or hinting output is implied by this API.

## Optional WebGPU compute

```js
import { CoordinateCompute } from '@wieslawsoltes/counterform-compute';
const compute = new CoordinateCompute();
await compute.initialize(); // false when WebGPU is unavailable
const coordinates = await compute.interpolate(
  [new Float64Array([0, 10, 20]), new Float64Array([100, 110, 120])],
  [0.25, 0.75]
);
console.log(compute.backend, coordinates); // [75, 85, 95]
compute.dispose();
```

CPU fallback is Float64; GPU output is Float32. Source coordinates are not replaced by GPU results. Compilation remains deterministic CPU code.

## Worker compilation without a workspace

```js
import { CompilerClient } from '@wieslawsoltes/counterform-compiler';
const compiler = new CompilerClient({
  workerURL: new URL('./compiler.worker.js', import.meta.url),
  maxQueue: 16,
  timeout: 60000
});
const controller = new AbortController();
try {
  const result = await compiler.compile(doc, {format:'variable'}, {
    signal: controller.signal, key:'preview', priority:10
  });
  console.log(result.bytes.byteLength, result.mime);
} finally { compiler.dispose(); }
```

A standalone consumer bundles `@wieslawsoltes/counterform-compiler/worker` to that URL. Counterform's own build instead generates a relative-import graph with no runtime bundler/CDN. Do not assume the page's import map works inside a worker. For Node:

```js
import {Worker} from 'node:worker_threads';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
const compiler = new CompilerClient({
  workerFactory: () => new Worker(new URL(import.meta.resolve(
    '@wieslawsoltes/counterform-compiler/node-worker'
  )))
});
try { console.log((await compiler.compile(doc)).bytes.byteLength); }
finally { compiler.dispose(); }
```

## Color layers with stable source identities

```js
import {compileColorTables,FOREGROUND} from '@wieslawsoltes/counterform-color';
import {exportGlyphOrder,compileTrueType} from '@wieslawsoltes/counterform-font-io';
history.execute('Color A', () => {
  doc.data.palettes=[['#ff3300','#0066ff80'],['#33ff00','#8800ffaa']];
  doc.glyph('A').colorLayers=[
    {glyphId:doc.glyph('A').id,paletteIndex:0},
    {glyphId:doc.glyph('O').id,paletteIndex:1},
    {glyphId:doc.glyph('H').id,paletteIndex:FOREGROUND}
  ];
});
const tables=compileColorTables(doc.data,exportGlyphOrder(doc));
const font=compileTrueType(doc); // automatically includes COLR and CPAL
```

Only COLRv0/CPALv0 is reconstructed on supported TrueType imports. CFF native outline import and advanced paint tables retain their documented losses. Palette entries are CSS RGBA hex; CPAL BGRA and Skia ARGB differences are handled by their respective adapters.

## Package inventory

- `automation` — Declarative, bounded font transformation recipes without arbitrary code execution.
- `binary` — Bounded sfnt readers/writers, checksums, UTF-16BE and CRC32.
- `color` — COLRv0/CPALv0 validation, binary compilation and bounded reconstruction.
- `compiler` — Prioritized, cancellable worker compilation/validation and table inspection.
- `commands` — Scoped keyboard routing, command palette search, enablement and configurable shortcuts.
- `compute` — WebGPU weighted coordinate interpolation with a Float64 CPU fallback.
- `editor` — Pointer and keyboard Bézier editing with RBush picking and atomic undo transactions.
- `font-io` — TrueType/CFF OpenType compilation, WOFF containers and bounded font import.
- `geometry` — Double-precision Bézier outlines, analytical bounds, winding, splitting and compatible quadratic conversion.
- `history` — Atomic glyph-scoped and font-scoped undo/redo transactions with bounded history.
- `integrations` — ReactiveWeb, DynamicDataWeb, RibbonWeb, TreeDataGridWeb, GridWeb and RichTextWeb adapters.
- `model` — Serializable font documents, glyphs, masters, layers, components, anchors and source validation.
- `opentype` — Strict OpenType feature parsing and GSUB, GPOS, GDEF and kerning table compilation.
- `proofing` — Compiled-font live proofing via browser FontFace and OpenType shaping.
- `renderer` — SkiaSharpWeb outline rendering, layered rulers/overlays, camera and native Boolean paths.
- `storage` — IndexedDB font projects, debounced autosave and browser project file I/O.
- `ufo` — UFO3/GLIF source interchange, plist XML and bounded ZIP archives.
- `validation` — Font geometry, encoding, feature, topology and component graph diagnostics.
- `variations` — Sparse design-space interpolation and real fvar/gvar/STAT TrueType variable export.
- `workbench` — Counterform Studio dockable font-authoring workspace and application composition.

## Static COLRv1 paints and named palettes

```js
import { createDemoFont } from '@wieslawsoltes/counterform-model';
import { compileTrueType } from '@wieslawsoltes/counterform-font-io';
import { validatePaintSource } from '@wieslawsoltes/counterform-colrv1';

const colorDocument = createDemoFont();
const a = colorDocument.glyph('A');
colorDocument.data.palettes = [
  ['#f24a30', '#3456ed'],
  ['#ffffff', '#a8bbff']
];
colorDocument.data.paletteLabels = ['Day', 'Night'];
colorDocument.data.paletteEntryLabels = ['Start', 'End'];
colorDocument.data.paletteTypes = [1, 2]; // usable on light / dark backgrounds

a.colorPaint = {
  type: 'glyph', glyphId: a.id,
  paint: {
    type: 'linear',
    x0: 0, y0: 0, x1: 600, y1: 0, x2: 0, y2: 700,
    extend: 'pad',
    stops: [
      {offset: 0, paletteIndex: 0, alpha: 1},
      {offset: 1, paletteIndex: 1, alpha: 1}
    ]
  }
};
validatePaintSource(colorDocument.data);
const colorBytes = compileTrueType(colorDocument);
// colorBytes contains coordinated COLRv1, CPALv1 and palette name records.
```

In the workbench, make these mutations inside `studio.history.execute(...)` so observers, dirty state, undo and proof recompilation remain coherent. `studio.showPaints()` opens the graph editor. The standalone codec exports `compileCOLRv1`, `readCOLRv1`, `paintTypes`, `compositeModes`, `extendModes`, `paintChildren`, `paintReferences` and `validatePaintSource`; see its declarations for the complete discriminated paint union.

For custom native rendering, `GlyphRenderer.setCompiledColorFont(bytes, {documentId, revision, masterId, glyphOrder, unitsPerEm})` accepts a complete compiled static font; `glyphOrder` is an array of stable source IDs in binary glyph order. Pass `null` to release it. A scene must carry matching identity/revision/master information before the cache is used. Normal workbench integration supplies this automatically. It does not modify SkiaSharpWeb or its .NET-compatible public API.
