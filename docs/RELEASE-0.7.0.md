# Counterform Studio 0.7.0

Three integrated production workflows: conditional OpenType features, TTC/OTC collections, and source-order metrics strings. All ten pinned upstream libraries are retained, with 31 independently packable Counterform packages. No SkiaSharpWeb API or vendor file is changed. There are 151 registered commands, nine menus, 24 pointer tools and 73 vector icons.

## Conditional OpenType features

The FEA compiler now accepts bounded `conditionset` and `variation` blocks, including decimal design-space coordinates, multi-axis AND conditions, a `NULL` universal fallback, and named/contextual lookup bodies. GSUB and GPOS use version 1.1 with real FeatureVariations tables. Conditions normalize through the axis's avar 1.0 map, quantize to F2DOT14, and match inclusively. The first relevant matching condition-set record wins per table. Overlapping sets do not implicitly combine; authors must explicitly create a combined region when needed.

The default feature's lookups remain in the selected feature and variation lookups are added. LookupList execution order follows FEA block order. Script/language-specific alternatives have distinct Feature records even when their defaults are identical. Static master exports select the applicable lookup set without retaining a FeatureVariations table. Generated static instances retain a validated `featureInstance` coordinate context so re-export selects the same rules after outline interpolation has removed variable axes.

**Font → Conditional OpenType features**, also in the OpenType ribbon, opens a complete private FEA draft, template fields, a worker-compiled FontFace proof and axis sliders. Compilation alone never changes the source. Apply validates the actual variable font before a history transaction. Revision, document identity, master identity, feature-draft guards, keyed cancellation and owned FontFace cleanup prevent stale modal work from replacing live state.

This is the fontTools-style FEA condition extension, not a claim that every Adobe/FontLab syntax extension is supported. Condition format 1 is implemented; newer condition-table formats and arbitrary FeatureVariations import reconstruction are not.

## Collections

**File → Font collection builder**, also in the OpenType production ribbon, combines selected masters or local sfnt fonts. It can reorder/remove/include faces, choose TrueType/CFF/CFF2 compilation, create version 1 or 2 collections, report table sharing, download TTC/OTC output, unpack imported collections, extract a standalone face or open it in the existing importer. File → Open routes `.ttc`/`.otc` through this chooser instead of silently selecting face zero.

The reusable binary package supports mixed outline flavors; it shares identical same-tag table bytes only after a byte-for-byte comparison, does not renumber glyphs, and preserves opaque tables. Head checksum adjustments are normalized; obsolete per-face or collection digital signatures are not reused. Extraction rebuilds standalone checksums. This preserves table payloads, not original whole-file padding or signatures.

Limits: 256 faces, 4095 tables per face, 65536 table records per parsed collection, 256 MiB encoded and aggregate input/expanded output budgets. Structural overlaps are rejected before checksum work; shared ranges are verified once. Bulk extraction avoids revalidating the whole collection for every face. The UI additionally limits selected input files to 64 MiB total and expanded/compiled faces to 128 MiB. Collection packaging is bounded synchronous work; source-font compilation uses the existing compiler worker.

## Metrics

**Font → Metrics string editor**, also in the Spacing ribbon, has a scalable source-outline strip, glyph-position selection, keyboard navigation, numeric metric table, sidebearing/advance expressions, batch scope, explicit kerning exceptions, inherited-pair feedback and Undo/Redo. `/A.alt/V` selects glyphs by name; `//` selects a literal slash. A space after a slash-name is a separator; use `/space` for an explicit space glyph.

The new `@wieslawsoltes/counterform-metrics` library supplies a bounded arithmetic parser, source-order layout, dependency planning and atomic application. Examples: `lsb("H") + 10`, `rsb("O")`, `advance("space")`, `width("A")`, `=H` (same side), `=|H` (opposite side). No JavaScript evaluation occurs. Dependencies include referenced glyphs and components. Batch evaluation uses an isolated source snapshot, detects cycles, rejects locked/missing layers and contradictory/out-of-range metrics, validates all layers before applying, and rejects stale plans. Existing anchors/components/modifiers follow the source model's sidebearing behavior. Explicit zero kerning remains distinguishable from deleting an exception.

Formulas are one-shot recalculations, not persistent auto-updating metric links. Source-order metrics are not a replacement for shaped complex-script text; the existing compiled proof remains the shaping view. The engine accepts 2048 positions/edits and 2048-character expressions; the interactive strip is bounded at 256 positions.

## Verification and remaining scope

Local core, TypeScript, independent fontTools/HarfBuzz, package-consumer, and isolated browser checks are recorded separately from the commit-associated GitHub Actions run. Isolated local browser tests use explicit inline compilation; real browser workers and secure-origin storage require the normal remote gates. Generated font fixtures are temporary and no installed font files are used or redistributed.

The new independent layout checks cross-compile both variable TrueType and CFF2 and compare glyph IDs, clusters, advances and offsets across ten weights and two languages. A two-axis case checks 25 coordinate pairs. Static instances, mixed collections and final hmtx metrics are independently decoded. The oracle explicitly handles two fontTools 4.63 behavior differences: it uses an equivalent named empty set for NULL and separately compiles unaffected-language defaults to prevent a per-tag variation from leaking into another language in the reference.

Full FontLab parity is not claimed: hint authoring/debugging, variable/SVG/bitmap color authoring, proprietary source adapters, lossless reconstruction after arbitrary edits, persistent linked metrics, optical kerning, every native drawing workflow, and exhaustive native shortcuts remain tracked in the capability ledger. Physical GPU, Safari/Firefox and assistive-technology qualification are separate from software-rendered Chromium.
