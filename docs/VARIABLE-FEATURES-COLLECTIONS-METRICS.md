# Variable features, collections and metrics APIs

## Axis-conditional layout

```fea
conditionset Heavy {
    wght 650 900;
} Heavy;
variation rvrn Heavy {
    sub A by A.alt;
} rvrn;
variation kern Heavy {
    pos A V -90;
} kern;
```

All references must name exported glyphs and defined axes. Ranges are design values, not normalized coordinates. For a two-axis region, add a second axis range inside the same condition set. Place specific condition sets before a universal fallback (`variation calt NULL { ... } calt;`). First-match precedence is per layout table; conditions associated only with GSUB do not mask a GPOS-only region. Ordinary/default rules and selected variation rules are both active. Source blocks determine global lookup order; do not rely on an unsorted Feature index list to reorder shaping.

The standalone OpenType package exports `featureCoordinate`, `normalizeFeatureConditions`, `matchFeatureCondition` and `encodeFeatureVariations`. Its parser returns condition sets and variation blocks with source ordering. The existing compiler worker includes these modules in its generated relative-URL graph. Static `instanceDocument` preserves a validated coordinate context used only for feature selection, not for a second application of outline interpolation.

## Font collections

```js
import {
  encodeCollection, readCollection,
  extractCollectionFace, extractCollectionFaces
} from '@wieslawsoltes/counterform-binary';

const bytes = encodeCollection([regularFontBytes, boldFontBytes], {
  version: 2, shareTables: true
});
const collection = readCollection(bytes); // Checks structure and checksums.
const firstFont = extractCollectionFace(bytes, 0);
const allFonts = extractCollectionFaces(bytes); // One validation pass; bounded expansion.
```

Inputs and outputs are `Uint8Array`. Parsed table buffers are non-owning views; treat them as read-only. No glyph-order transformation occurs. This is a container codec, not an independent font sanitizer or a lossless importer for every contained outline/layout table. Pass extracted faces through the existing font importer and review its warnings. Duplicate fonts may share most tables. Colliding checksums alone never cause sharing. `sfnt()` also now zeros an existing head adjustment in a private copy before computing table and whole-font checksums, making safe repackaging independent of the caller's normalization.

## Transactional metric editing

```js
import {
  planMetricEdits, applyMetricPlan, setKerningException, layoutMetrics
} from '@wieslawsoltes/counterform-metrics';

const plan = planMetricEdits(document, masterId, [
  { glyphId: 'H', lsb: 40, rsb: 60 },
  { glyphId: 'A', lsb: 'lsb("H") + 10', rsb: 'rsb("H")' }
]);
history.execute('Apply spacing', () => applyMetricPlan(document, plan));
history.execute('Zero pair override', () => {
  setKerningException(document, masterId, 'A', 'V', 0);
});
const run = layoutMetrics(document, masterId, '/A/V', { kerning: true });
```

Plans contain the exact document identity and revision. Any subsequent source change invalidates a plan. All expressions and candidate layers are validated before writing to the live source. Left-only changes preserve the right sidebearing; right-only changes preserve the left; advance-only changes preserve the left and alter the right. Two specified fields determine the third; three inconsistent values are rejected. Empty glyphs cannot have a nonzero ink left sidebearing. Editing a component's source is evaluated before spacing its dependent glyph. Self-references to mutable metrics and dependency cycles fail; `width("sameGlyph")` is allowed because sidebearing changes preserve ink width.

One undo transaction covers a whole batch. `null` in `setKerningException` removes the glyph-pair override and restores group inheritance. A zero value is not equivalent to removal. Arithmetic is bounded to 256 tokens, 32 nesting levels and finite results; it never uses eval. Persistent links and optical kerning are separate contracts.

## Source references

- OpenType shared layout and FeatureVariations formats: https://learn.microsoft.com/en-us/typography/opentype/spec/chapter2
- OpenType collection layout, sharing, and head checksum rules: https://learn.microsoft.com/en-us/typography/opentype/spec/otff
- fontTools feaLib extension and builder APIs: https://fonttools.readthedocs.io/en/latest/feaLib/index.html

Tests use generated outlines only, cross-compile with fontTools and execute native HarfBuzz. Reference discrepancies are explicit in `tests/workflow-fonttools.py`, not hidden by loosening the actual output assertions.
