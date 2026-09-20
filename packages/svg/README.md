# @wieslawsoltes/counterform-svg

Version **0.8.0**. DOM-free, bounded SVG vector extraction for editable font outlines. Uses the standalone Counterform geometry package; no network, XML entity resolution, canvas or application singleton.

```js
import {readSVGOutlines} from '@wieslawsoltes/counterform-svg';
const {contours,warnings} = readSVGOutlines(svgText, {maxNodes:250000,maxElements:100000});
```

Supports every SVG path command, affine transform lists, nested groups/viewports, viewBox alignment, basic vector shapes, physical lengths at 96 dpi, percentages, local `use` and `symbol` references. Coordinates stay SVG y-down; the application alone performs font-space fitting. Straight, quadratic and cubic segments preserve their geometry. Elliptical arcs use at most 45-degree cubic spans and are approximations, not rational curves.

This is geometry extraction, **not SVG appearance rendering or OpenType-SVG color fonts**. Stroke centerlines, fill colors, even-odd winding, opacity and viewport clipping produce explicit warnings when not baked. Script, external references, DTD/entities, filters, masks, clipping paths, text and stylesheets are rejected. Inline presentation attributes are restricted. Cycles, excessive XML depth, expanded references, points and coordinates are bounded. No partial result is returned on invalid input. XML metadata is not reconstructed.

Exports: `readSVGOutlines`, `parseSVGTransform`, `svgViewportTransform`, with declarations in `types/index.d.ts`. See the repository's `docs/UNICODE-SVG-INTERCHANGE.md` and independent/browser tests for exact evidence.

MIT licensed; see LICENSE. Dependencies have their own notices. Packing is not registry publication.
