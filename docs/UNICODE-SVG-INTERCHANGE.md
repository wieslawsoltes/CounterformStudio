# Unicode and SVG interchange — 0.8.0

## Unicode variation sequences

`FontSource.variationSequences` is an optional array of `{unicode, selector, glyphId}` records. Unicode values are integer scalar values, not UTF-16 code units. The selector must be in FE00–FE0F, E0100–E01EF or Mongolian 180B–180D / 180F. A null `glyphId` explicitly declares a default sequence and requires a normally encoded base. A stable source glyph ID declares a non-default mapping; its base need not be in the ordinary cmap. Duplicate base/selector keys and missing targets are rejected. Encoding a sequence is not a claim of Unicode or IVD registration.

`FontDocument.variation(base, selector)` distinguishes an absent mapping from a supported default sequence. Normal model mutation must still go through history/touch/replace, which rebuilds the indexes. Source-order metrics strings consume a selector with its preceding character and resolve the variant before metrics and kerning. Unsupported sequences use the ordinary base mapping in that source view; this is not a replacement for complex-script shaping.

The binary package exports `encodeUVS`, `decodeUVS`, `readCmapUVS` and `isVariationSelector`. Format-14 records are sorted, default ranges are compressed in runs of at most 256 scalars, and default/nondefault partitions must not overlap. Decoding checks counts, offsets, region overlap, sorted values, scalar validity, glyph counts and expanded budgets. Identical shared same-kind subtables are allowed. Limits are one million expanded mappings, 260 selectors and 256 enclosing cmap encoding records. Glyph ID zero is retained in the binary table and is distinct from null/default; it remains a missing-glyph mapping to shaping engines.

All compilers using the common sfnt tables emit the Unicode 0/5 format-14 supplemental subtable alongside existing format-4/12 coverage. Source IDs are resolved against the actual exported glyph order; a disabled target blocks compilation. TrueType and native Skia imports reconstruct the mappings using imported stable IDs. Native import still does not reconstruct all other layout/color/variation source. Counterform JSON and Counterform's UFO metadata preserve the source fields. General third-party UFO UVS lib conventions are not claimed. Changing a UVS mapping invalidates metadata-only opaque-font reuse.

### Editing

Use **Glyph → Unicode variation sequences**, the OpenType ribbon or command palette. Add or replace hexadecimal base/selector keys, choose the default mapping or an explicit glyph, filter and page the table, navigate rows with arrows/Home/End, remove mappings, or edit/export JSON. At most 100 rows are mounted at once. JSON ingestion has a 16 MiB text limit.

Validation compiles a private source snapshot and loads an owned FontFace. The proof displays the base alone and base-plus-selector. Apply commits one undo transaction; Ctrl/Cmd+Enter invokes Apply. Closing aborts worker work and disposes preview fonts/listeners. Revision, master, document and unsaved-feature guards reject stale drafts. Script-specific shaping may handle selectors through GSUB instead of cmap14 (notably Mongolian), so table support does not imply every native shaping workflow.

## Editable SVG vector extraction

The new `@wieslawsoltes/counterform-svg` package has no DOM or network dependencies. `readSVGOutlines` returns `{contours,warnings,nodeCount}` in SVG coordinates. `parseSVGTransform` and `svgViewportTransform` are independently reusable. The application File/Open action fits the resulting geometry to its existing cap-height import convention and flips y into font space in one undo transaction, with source-revision and editability guards across file reads.

Supported geometry includes all SVG path commands (M/L/H/V/C/S/Q/T/A/Z and relative forms), group transforms, matrix/translation/scaling/rotation/skew lists, basic shapes including rounded rectangles, viewBox and preserveAspectRatio, nested viewports, px/pt/pc/in/cm/mm lengths and percentages, and local `use`/`symbol` references. Elliptical arcs implement radius correction, axis rotation, sweep and large-arc flags and degenerate cases. Conversion uses cubic spans of at most 45 degrees: elliptical geometry is approximated, not represented exactly. Existing straight/quadratic/cubic geometry remains exact apart from floating-point arithmetic.

The scanner rejects malformed commands/numbers/flags instead of ignoring characters. The document reader rejects DTD/entities, scripts/events, external references, text, images, stylesheets, filters, masks and clip paths. Local reference cycles, XML depth, expanded element/point counts, transform lists and coordinate magnitudes are bounded. It never executes or fetches document content and never returns a partially converted document after failure.

This is **geometry extraction, not an SVG appearance renderer or OpenType-SVG color-font implementation**. Unsupported stroke expansion, even-odd fill conversion, opacity/colors and viewport clipping are surfaced as warnings; masks and clipping paths are rejected rather than ignored. CSS sheets and general SVG artwork are not reconstructed. Expanded strokes still use the existing native Skia command.

## Dialog ownership correction

The previous CI failure arose because native `close` events are queued: a caller could capture a new resource baseline before the previously closed dialog's listeners ran. Dialogs now offer a synchronous, exactly-once `onClose` ownership hook. Native `close()` executes first (preserving returnValue and normal platform behavior), owned resources are then released and the element removed before return. Native close/cancel paths converge on the same idempotent cleanup. Preventing Escape cancellation retains the open dialog. Native events are not synthesized. Existing authoring, paint, workflow, recovery and import dialogs use the ownership hook.

## Verification references

`tests/interchange.test.mjs` exercises bounds, malformed input, stable IDs, compilation/reconstruction, source/history/preservation and SVG geometry. `tests/interchange-fonttools.py` compares format-14 bytes to fontTools' own builder, probes HarfBuzz variant glyph lookup, compares shaping against independent tables, and checks seven export flavors plus mixed TTC. Script-specific and glyph-zero behavior is compared against the oracle rather than asserted to be generic cmap substitution.

`tests/interchange-browser.py` exercises compiled proof pixels, source immutability, undo/redo, malformed/stale drafts, all seven FontFace formats, native CFF reconstruction, delayed cancellation, actual SVG File/Open, native SVG curve comparisons, native close-event semantics, Escape prevention and disposal. Its `--isolated` mode uses inline compilation because the local test host blocks localhost browsing. Normal CI uses real workers and secure local origin; post-deployment checks run separately. These tests do not certify physical GPU, native FontLab pixel parity, every script or assistive technology.

Primary specifications: https://learn.microsoft.com/en-us/typography/opentype/spec/cmap ; https://www.w3.org/TR/SVG/paths.html ; https://www.w3.org/TR/SVG/implnote.html ; https://harfbuzz.github.io/harfbuzz-hb-font.html .
