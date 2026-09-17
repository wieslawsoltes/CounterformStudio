# @wieslawsoltes/counterform-construction

Double-precision font-outline construction, independent of DOM, canvas, Skia and the workbench. MIT; ESM plus TypeScript declarations.

```js
import { polygon, roundedRectangle, knifeContour, cutContourAt,
         simplifyPolyline, strokePolyline } from '@wieslawsoltes/counterform-construction';
const star = polygon(300, 350, 240, 300, 5, .45);
const rounded = roundedRectangle(40, 0, 560, 700, 60);
const halves = knifeContour(rounded, {x:0,y:350}, {x:640,y:350});
const opened = cutContourAt(rounded, 1, .5);
const brush = strokePolyline([{x:40,y:0,pressure:.25},{x:80,y:200,pressure:.5}], 40);
```

Shape/cut functions return new source geometry with stable, unique node identities; input contours are not mutated. `distributeNodes` intentionally edits supplied contours for use inside a history transaction. Handles use absolute font coordinates, y upwards. Knife uses cubic polynomial intersections and de Casteljau subdivision, not flattened polygon replacement. Exactly two transverse cuts are supported; ambiguous vertex/tangent/collinear/multiple-crossing cases fail explicitly. Polyline input is limited to 8192 samples. The pressure brush produces bounded miter joins and flat caps; complex self-overlapping brush paths may need a Boolean cleanup by the consumer.
