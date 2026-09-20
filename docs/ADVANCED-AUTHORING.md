# Attachment, variation-map and geometry APIs

These examples run from a bootstrapped source checkout or a consumer with the matching 0.6.0 packages and declared dependencies installed. The JavaScript compilers do not depend on fontTools or HarfBuzz at runtime; those are independent test oracles.

## Static attachment source

Glyph names below must exist and be exported. Mark classes must precede use.

```fea
anchorDef 300 700 TOP;
markClass acutecomb <anchor 0 0> @TOP_MARKS;
markClass gravecomb <anchor 15 0> @TOP_MARKS;

feature mark {
  pos base A <anchor TOP> mark @TOP_MARKS;
  pos ligature f_i
    <anchor 150 700> mark @TOP_MARKS
    ligComponent <anchor 450 700> mark @TOP_MARKS;
} mark;

feature mkmk {
  lookupflag UseMarkFilteringSet @TOP_MARKS;
  pos mark acutecomb <anchor 0 150> mark @TOP_MARKS;
} mkmk;

lookup Join {
  lookupflag RightToLeft;
  pos cursive beh <anchor 0 0> <anchor 450 0>;
  pos cursive alef <anchor 0 0> <anchor NULL>;
} Join;
feature curs { lookup Join; } curs;
```

A named attachment lookup can be invoked at a marked position in a contextual `pos` rule. Backtrack/lookahead coverages and script/language selection retain the existing compiler's semantics. Anchor values are int16 and contour indices uint16. Offset overflow, missing exported glyphs, contradictory assignments, cyclic lookup calls and excessive expansion fail explicitly. Separate `subtable;` statements permit deliberate uint16 subtable splitting; cursive pairs that must join need common coverage within a subtable.

`MarkAttachmentType @CLASS` and `UseMarkFilteringSet @CLASS` are distinct flags: the former assigns disjoint attachment classes to glyphs; the latter selects a coverage set that may overlap other filtering sets. Their structures coexist with GDEF's variable-positioning store. Class definitions and inferred GDEF classifications do not change Unicode source records.

Explicit source rules are compiled before the automatic source-model positioning lookups. Avoid intentionally defining the same attachment twice through both FEA and automatic anchors unless that ordering is desired. The template editor uses the selected static coordinates, not references that track future source-anchor edits. Variable/device-anchor FEA is not yet supported.

## Axis maps

```js
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {normalizeAxisMap, decodeAvar} from '@wieslawsoltes/counterform-varstore';
import {instanceDocument, compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
import {readDirectory} from '@wieslawsoltes/counterform-binary';

const doc = createDemoFont();
doc.data.axes[0].map = normalizeAxisMap([
    [-1, -1], [-0.5, -0.75], [0, 0], [0.5, 0.25], [1, 1]
]);
const instance = instanceDocument(doc, {wght: 600});
const bytes = compileVariableTrueType(doc);
const table = readDirectory(bytes).tables.get('avar');
console.log(decodeAvar(table.bytes, doc.data.axes.length));
```

For axis minimum `a`, default `d` and maximum `b`, the pre-map normalization is `(x-d)/(d-a)` below the default and `(x-d)/(b-d)` above it, clamped to −1…1. Mapping is then piecewise-linear between quantized pairs. The exact same mapping is applied when building source-master support regions and when querying an instance. The codec permits at most sixteen axes and 4096 pairs per axis. The dialog allows adding up to 256 points; it can inspect existing longer maps through the supplied table.

## Geometry measurements

```js
import {analyzeContours, segmentProperties, segments} from '@wieslawsoltes/counterform-geometry';

const contours = doc.resolve(doc.glyph('O').id);
const report = analyzeContours(contours, {
    tolerance: 0.001, maxDepth: 22, maxSubdivisions: 100000, maxSegments: 20000
});
console.log(report.signedArea, report.centroid, report.lengthBounds, report.converged);
const edge = [...segments(contours[0])][0];
console.log(segmentProperties(edge, 0.5));
```

For a closed path, area is `1/2 ∮(x dy − y dx)`, the x first moment is `1/2 ∮x² dy`, and the y first moment is `−1/2 ∮y² dx`. Cubic Bernstein coordinates are converted to degree-three polynomials and these products are integrated coefficient-by-coefficient. Dividing first moments by signed area gives the centroid. Each contour is translated before integration to reduce cancellation; the original origin is restored afterward. Oppositely wound holes subtract area and moments. Open contours return no area or centroid; algebraically cancelling closed contours have no combined centroid.

A Bézier chord is a lower arc-length bound and its control polygon an upper bound. De Casteljau subdivision tightens both. The reported length is their midpoint and the error bound half their difference; global work/depth budgets prevent unbounded computation. If the requested tolerance is not reached, `converged` is false and the remaining interval is returned. Floating-point roundoff is not outward-rounded interval arithmetic.

Signed curvature is `cross(B′, B″)/|B′|³`. For a cubic, its numerator reduces to a quadratic whose interior roots are inflection candidates. Straight lines have zero curvature; zero-speed points report null tangent, curvature and radius. An infinite radius on a straight section is also represented by null, with zero curvature distinguishing it from a cusp. The dialog's comb is a visualization of this API, not a source deformation.

## Workbench composition

```js
import {showAttachmentEditor, showAxisMapping, showOutlineAnalysis}
  from '@wieslawsoltes/counterform-workbench/advanced';

const editor = showAxisMapping(studio); // A mounted StudioWorkbench.
// Native modal semantics, source revision guard and owned cancellation lifetime.
editor.close();
```

The workbench registers `features.attachments`, `axis.map` and `outline.analyze` in the shared command registry. Rebinding them uses the existing keyboard editor. The first two commands are unavailable while viewing a read-only interpolated instance. Geometry analysis remains available for that evaluated view. All three are present in menus and ribbon groups; no alternate UI framework was introduced.
