# @wieslawsoltes/counterform-artwork

Validated, serializable per-master bitmap references and vector masks for font-authoring hosts. Uses Counterform's binary and geometry packages; no DOM, network, image decoder, or Skia dependency in this package. MIT licensed. TypeScript declarations are included.

```js
import {
  createBitmapReference, createVectorReference, referenceContours,
  validateArtwork, referenceBounds
} from '@wieslawsoltes/counterform-artwork';

// pngBytes is caller-provided Uint8Array. Coordinates in the PNG are y-down;
// this matrix scales by two and maps its top to y = 700 font units.
const bitmap = createBitmapReference(pngBytes, {
  name: 'Sketch', transform: [2, 0, 0, -2, 40, 700], opacity: 0.35
});
const mask = createVectorReference(sourceContours, {name: 'Before refinement'});
validateArtwork([bitmap, mask]);
const bounds = referenceBounds(bitmap);
const editableCopy = referenceContours(mask); // New stable IDs, baked transform.
```

A source master layer may hold `artwork: ArtworkReference[]`. References are ordered back-to-front, independently visible, locked and translucent, and transformed using `[a,b,c,d,tx,ty]`. These are **reference artwork**, not glyph components, exported ink, or color-font bitmap strikes. Normal font compilers ignore them. Hosts must explicitly insert/trace vector geometry into `layer.contours` to export it.

Bitmap references contain canonical base64 PNG bytes plus verified dimensions. `inspectPNG` validates the signature, chunk framing and CRCs, IHDR fields, palette/data ordering, IEND and dimensions. It rejects APNG and unknown critical chunks. It does **not** decompress IDAT or certify PNG metadata semantics: a native decoder must subsequently accept the file. Native image allocation is kept out of this package. Counterform's renderer uses existing .NET-shaped `SKImage`/`SKCanvas` APIs.

Limits: 64 references per layer; 4096 maximum dimension; 4,194,304 pixels and 16 MiB encoded bytes per image; 64 MiB encoded artwork and 16,777,216 referenced pixels per validated layer; 250,000 vector points. The font model additionally enforces document-wide encoded-byte/point/pixel budgets. Repeated images count toward the source budget, even if byte-identical. Decoded images are owned by the native renderer, which releases inactive references, layer switches and disposal. Metadata caching is bounded to eight entries and 32 MiB of base64 characters.

Vector masks retain ordinary editable cubic contour data. `referenceContours` clones and rekeys before baking the affine matrix; it never changes the stored mask. `duplicateReference` gives a new reference identity while retaining image bytes/geometry and presentation. Source references survive Counterform JSON/history and Counterform's custom UFO metadata; this is not a general third-party UFO image adapter.

See `docs/ARTWORK-TRACING.md` in the repository for the UI, ownership, coordinate and verification contracts. No font files are included.
