# Artwork references, bitmap autotrace and cubic fitting — 0.9.0

## User workflows

**Glyph → Artwork references and masks** opens a staged three-column workspace: ordered reference list, native Skia preview, and editable properties. Import a PNG or an SVG outline mask; PNG files opened through the main File/Open action enter the same staged workflow. No reference is added to the font source until **Apply artwork**. **Cancel** discards the entire draft.

Select references using the list or Arrow Up/Down, Home and End. Set name, opacity, visibility and the six affine coefficients; lock a reference to prevent geometry/property changes while allowing visibility toggles and unlocking. Duplicate, remove or reorder references. Preview supports pointer panning, wheel/plus/minus zoom, Home and a Fit preview button. These camera gestures never edit the font.

**Snapshot foreground** creates a source-only vector mask. **Insert mask outlines** clones/rekeys its transformed geometry into the draft foreground. **Exchange with foreground** swaps the mask and draft foreground, baking the mask's transform into the inserted outlines and resetting the stored mask to identity. Reusable glyph components are not decomposed by these operations. The separate **Glyph → Snapshot outlines to mask** command records a snapshot directly as one ordinary undo transaction.

Select a PNG and choose **Autotrace selected**, or use **Glyph → Autotrace bitmap**. Set automatic/manual threshold, ink polarity, minimum connected component size, exact pixel boundaries versus fitted cubics, and the fitting tolerance. **Preview trace** runs through the existing owned authoring-worker queue and displays the actual traced paths over the native bitmap. **Use traced outlines** returns an append/replacement operation to the parent draft; it still does not edit the live font. Only the parent's Apply commits references and foreground together. All normal source/export/topology limits still apply to the resulting geometry.

**Contour → Fit polylines to Bézier curves** fits selected straight-segment contours (or all when no nodes are selected). The tolerance is in font units rather than pixels. Existing cubic contours are rejected, not silently flattened and refitted. This is available for pencil/imported polygon data and is an ordinary single undo transaction, not an undocumented replacement of the Pencil tool's gesture behavior.

## Data and coordinates

The optional `Layer.artwork` array holds `BitmapReference | VectorReference` records. Every reference has stable identity, a name, visibility, lock, opacity and affine transform `[a,b,c,d,tx,ty]`:

```text
x' = a*x + c*y + tx
y' = b*x + d*y + ty
```

PNG pixel coordinates are y-down. Default GUI placement scales to the source cap height and flips y into the font's y-up coordinate system. SVG masks are extracted using the existing safe SVG geometry reader, with its existing explicit appearance warnings. A vector snapshot is already in font coordinates and starts with an identity transform. The .NET-shaped `SKMatrix` passed to Skia is row-major `[a,c,tx,b,d,ty,0,0,1]`; reference data is not transposed in storage.

Reference bitmaps contain canonical base64 of the original PNG bytes, plus validated width and height. Original PNG download retains those bytes. Native decode converts pixels into unpremultiplied RGBA8 sRGB before tracing. Source records do not contain native objects, object URLs or filesystem handles.

## Exact raster tracing

Raster classification composites alpha over white and computes a weighted sRGB-channel gray value:

```text
gray = round(alpha*(0.2126*r + 0.7152*g + 0.0722*b) + 255*(1-alpha))
```

This is a channel-space grayscale approximation, not linear-light photometric luminance. Automatic thresholding maximizes between-class variance over the 256-bin histogram, choosing the midpoint of a tied plateau. Dark ink includes values at the threshold; inverted ink is the complement. Since transparent pixels composite to white, they become ink under inverted polarity. The UI offers explicit threshold/polarity rather than claiming to infer the original drawing intent.

Connected-component removal uses a bounded four-neighbor queue. Each surviving ink pixel emits only the edges bordering background or the image exterior. Directed boundary edges keep ink on the right. At diagonal saddles the right-turn selection preserves four-connected ink and complementary eight-connected background. Following these edge cycles yields closed outer contours and holes; only exactly collinear pixel-boundary vertices are removed. In image y-down coordinates, outer signed areas are positive and hole signed areas are negative. Flipping to font coordinates changes both orientations consistently.

`areas`, `holes`, `edgeCount`, `inkPixels` and `removedPixels` describe the classified, despeckled pixel-cell mask, even when a fitted output is requested. The implementation performs no OCR, text recognition, color-layer quantization, thresholded-image semantic reconstruction or proprietary FontLab tracing.

## Continuous cubic-error bound

For a polyline span, let its chord-length parameter breaks be `u_i`. Endpoint tangents constrain the two cubic handles. A two-variable least-squares system proposes their non-negative lengths, with a chord-based fallback for singular or extreme solutions.

The candidate cubic is subdivided at every `u_i` using de Casteljau. On interval `i`, its four controls are `Q_0..Q_3`. The corresponding straight polyline edge is represented as cubic controls `L_0..L_3`. Both have the same local Bernstein basis, so:

```text
Q(t) - L(t) = sum(B_j^3(t) * (Q_j - L_j))
||Q(t) - L(t)|| <= max_j ||Q_j - L_j||, 0 <= t <= 1.
```

Taking the maximum over all intervals therefore bounds a continuous correspondence, not only distances at sampled vertices. Since both parameterizations cover their respective sets, it also bounds their two-sided Hausdorff distance. Only candidates whose bound is no greater than the tolerance are accepted; otherwise the span is split using an iterative bounded work list. A single edge becomes an exact line. Closed fitting starts from separated portions to avoid coincident endpoints degenerating the fit.

This is a conservative algorithm using double-precision arithmetic, **not an interval-certified numerical proof**. The bound is measured in the input coordinate system: pixels for bitmap tracing and font units for polyline fitting. Under a later affine transform, its operator norm bounds the corresponding scaled error. The fitter does not guarantee minimal nodes, uniform smoothness, preservation of self-intersections, or topology between boundaries closer than the tolerance. Exact mode preserves pixel geometry; fitted mode displays a topology warning and requires review.

## Source, persistence and export

References are source-only. They do not participate in `resolve()` foreground geometry, native Boolean operations, binary glyph compilation or variable interpolation. The source-master canvas renders the active master's references beneath the editable glyph; clean preview and the read-only interpolated-instance canvas hide them. Adding/editing only references leaves TTF and CFF bytes unchanged in the tests.

Counterform JSON, history and the existing custom UFO metadata retain reference records. The original archive structural fingerprint excludes reference artwork because it cannot change compiled font semantics. This does not extend metadata-only export to new foreground edits: applying traced/mask outlines changes the ordinary structural fingerprint and requires recompilation. Third-party UFO image conventions, linked image files, arbitrary layer hierarchies and proprietary source files are not implemented.

Source limits are enforced before native allocation: PNG signatures/chunks/CRCs, legal header dimensions/depth, IDAT continuity, palette ordering and IEND are checked. Animated PNG and unknown critical chunks fail. The envelope parser does not decompress IDAT or validate every ancillary metadata semantic; native Skia must still accept the actual image. The implementation does not claim a general-purpose image sanitizer. Individual image limits are 4096 per dimension, 4,194,304 pixels and 16 MiB encoded bytes. A layer permits 64 references, 250,000 vector points and 16,777,216 referenced pixels. Across a document, the additional caps are 64 MiB encoded PNG data, two million vector-reference points and 67,108,864 referenced pixels.

## Resource ownership and cancellation

Each preview owns its `GlyphRenderer`. Its `ArtworkRenderer` owns the actual `SKImage`/`SKPath` cache, drawing through unchanged SkiaSharpWeb APIs. Hidden/removed/kind-changed references, source-master changes and renderer disposal release inactive native resources. Replacing vector content invalidates its path. A failed allocation does not retain a partial resource. PNG metadata caching is separately bounded; it does not retain decoded pixels.

Trace jobs snapshot only the validated typed-array **view** into a new contiguous buffer, ignoring unrelated properties and oversized backing buffers. The owned buffer is transferred to the worker, never the caller's original buffer. The queue enforces 64 MiB active-plus-pending raster inputs in addition to the existing job count. Work is bounded by raster/edge/contour/output limits and by the fitting evaluation budget. Abort, close, source replacement, keyed supersession and timeout use the existing hard worker-cancellation path. Explicit inline mode remains synchronous and is never silently substituted for a worker.

Artwork and trace dialogs capture document identity, source revision, glyph and master. A stale source, locked/read-only layer, closed parent, or changed active master cannot receive results. A child trace updates only its parent draft; closing the parent closes the child. Native fonts, decoded pixels, preview surfaces, subscriptions and keyed worker jobs are released exactly once. Decode failure also releases the already-created preview owner.

## Verification

Headless checks independently rasterize every one of the 512 three-by-three binary masks and compare all cells plus signed area. Additional masks cover counters, diagonal contacts, speckles and limit failures. Dense independent samples test the fitter's advertised bound; source/history/UFO tests verify preservation and font-byte invariance. Minimal native doubles test cache ownership and cleanup order, not GPU functionality.

Browser tests exercise original programmatically generated PNG imagery, compare every native RGBA readback byte, inspect actual Skia rendering, trace counters into editable curves, load five exported font formats through Chromium, test locks, numerical rollback, PNG File/Open, SVG mask exchange, preview gestures, undo and teardown. No installed font or external image fixture is needed. Source and built distribution use the same suite. Local `--isolated` mode explicitly uses inline compilation due to sandbox HTTP restrictions; normal CI requires real browser workers and a secure origin. Hardware WebGPU, Firefox/Safari, mobile gestures and assistive-technology certification remain separate acceptance gates.

Primary reference material: FontLab 8 manual, bitmap preparation/tracing tutorials at https://help.fontlab.com/fontlab/8/ ; W3C PNG specification at https://www.w3.org/TR/png-3/ . The tracing and fitter implementations here are original and are not copies of FontLab's algorithms or source.
