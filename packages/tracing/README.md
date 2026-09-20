# @wieslawsoltes/counterform-tracing

Dependency-free RGBA autotracing and conservatively bounded cubic fitting for browser and Node.js authoring tools. Pure JavaScript, JSON contour output, no DOM, native decoder, network, installed fonts or executable source input. TypeScript declarations included. MIT licensed.

```js
import {traceBitmap, fitPolyline} from '@wieslawsoltes/counterform-tracing';

const result = traceBitmap({width, height, pixels}, {
  threshold: null,            // Otsu histogram threshold; or integer 0..255.
  invert: false,              // Dark ink by default.
  minComponentPixels: 2,     // Remove small four-connected ink components.
  curves: true,
  tolerance: 0.35,           // Error against pixel-cell boundaries, in pixels.
  idPrefix: 'my-trace'
});
console.log(result.contours, result.holes, result.errorBound, result.warnings);

const fitted = fitPolyline(points, {closed: false, tolerance: 1, idPrefix: 'pencil'});
console.log(fitted.contour, fitted.errorBound);
```

`pixels` is exactly `width * height * 4` unpremultiplied RGBA8 bytes (`Uint8Array` or `Uint8ClampedArray`). A caller decoding another color space must first convert to sRGB. Alpha is composited over white. Classification uses a documented weighted sRGB-channel gray approximation, not linear-light photometric luminance. Dark mode includes the threshold; inverted mode is its complement. Transparent white therefore becomes ink in inverted mode; choose/crop reference imagery accordingly.

## Exact mode

`thresholdRaster` returns a binary mask. `traceMask` walks oriented pixel-cell boundary edges with ink on the right. Four-connected ink remains disconnected at diagonal saddles; background has complementary eight-connectivity. Outer contours have positive algebraic area in y-down image coordinates, holes negative. Only exactly collinear edge vertices are removed. `areas`, `holes`, `edgeCount`, `inkPixels` and `removedPixels` describe the exact classified/despeckled mask, including when fitted output is requested.

Exact output reproduces pixel-cell geometry, not an inferred antialiased/optical outline. No OCR or glyph recognition is performed.

## Fitted mode

For each span, endpoint tangents and chord-length parameters define a constrained least-squares cubic candidate. The candidate is subdivided at every polyline edge's parameter interval. The maximum norm of the four cubic difference control points bounds the continuous curve-to-line correspondence by the convex-hull property. This also bounds two-sided Hausdorff distance for the covered sets. Failed candidates are split iteratively until accepted or reduced to exact straight edges. Closed contours begin with separated spans so endpoint coincidence does not degenerate the fit.

`errorBound` is the largest accepted span bound in input coordinates. Computation uses ordinary double-precision arithmetic, **not interval-arithmetic certification**. Fitting is conservative and can retain more nodes than sample-only methods. It does not guarantee smoothness at every join, self-intersection freedom, topology preservation between near-touching boundaries, proprietary FontLab fitting behavior or an optimal minimum-node result. The UI warns about these distinctions and offers the exact-boundary mode.

## Limits and workers

Default raster limit: 4,194,304 pixels, dimension at most 4096. Up to 500,000 boundary edges, 10,000 contours, 250,000 output nodes and eight million fitting edge evaluations are permitted. Supplied limits cannot exceed the hard caps. Standalone fitting defaults to 100,000 input points and eight million edge evaluations; its configurable hard maxima are one million points and 50 million evaluations. Invalid buffers, numbers, dimensions and excessive work fail explicitly without returning partial outlines.

Use `CompilerClient.trace(image, options, {signal, key, priority})` from `@wieslawsoltes/counterform-compiler` for hard-cancelable execution in the existing browser/Node worker. It snapshots only the validated pixel view before enqueue, transfers the owned snapshot to the worker and enforces a 64 MiB active-plus-queued raster-input cap. Caller storage is not detached. Explicit inline mode is synchronous and not preemptible; it is never silently chosen as fallback.

Tests exhaust every 3×3 binary mask, independently rasterize output, verify algebraic areas and counters, exercise malformed/budgeted input, sample the fitting bound independently and compare real Node-worker results. No fonts or image fixtures are required by the package.
