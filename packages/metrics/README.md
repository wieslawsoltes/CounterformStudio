# Counterform metrics

Source-order metrics strings (`AV /A.alt/V`, `//` for a slash), numeric sidebearings and advance widths, and safe arithmetic expressions such as `lsb("H") + 10`, `=H`, `=|H`, and `(advance("space") - width("A"))/2`.

`planMetricEdits(document, masterId, edits)` evaluates the batch on a private snapshot with component/formula dependency ordering, cycle detection, locked-layer checks and OpenType metric bounds. `applyMetricPlan` rejects stale revisions and validates all candidate layers before making a single source change. Wrap application in `History.execute` for undo. Formulas are evaluated on demand; they are not persisted live links. Source-order layout is deliberately distinct from shaped OpenType text.

`setKerningException` accepts an explicit signed integer (including zero), or `null` to remove the glyph-pair override and expose inherited group kerning. Import from `@wieslawsoltes/counterform-metrics`; no browser or rendering dependency is required.

## 0.8.0 interchange

Unicode selector sequences are consumed as one source metrics token. See `docs/UNICODE-SVG-INTERCHANGE.md` in the repository for limits and verification.
