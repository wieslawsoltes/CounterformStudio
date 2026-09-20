# Contextual OpenType authoring

The JavaScript compiler now supports single, multiple, alternate, ligature,
chaining-context and reverse chaining substitution; single and pair adjustments
with four-field value records; chaining contextual positioning; named lookups;
ordered exceptions; script/language selection and language-required features.
Source errors carry line, column and byte-string offset. Includes, anonymous code,
unsupported flags and unsupported grammar fail explicitly. No external compiler
or network service is required by the application.

```fea
languagesystem latn dflt;
languagesystem latn TRK;
lookup Alternate { sub V by W; } Alternate;
feature calt {
    ignore sub A V' X;
    sub A V' lookup Alternate;
} calt;
feature kern { pos A V' <0 0 -25 0> W; } kern;
feature locl {
    script latn;
    sub A by V;
    language TRK exclude_dflt;
    sub A by W;
} locl;
```

Contiguous rules of the same lookup kind/scope/flags are one lookup with ordered
subtables. Ignore rules emit zero-action context records, preventing the following
context alternatives in that lookup. Nested lookup calls are table-checked and
cycle-checked. Payloads over the conservative uint16 budget are emitted through
GSUB 7 / GPOS 9 extension wrappers; remaining uint16 structure overflows are errors.

The old source's unsupported-context test now uses genuinely unsupported include
syntax. New tests explicitly assert successful context behavior rather than just
removing the negative test. Fourteen procedural scenarios are independently
compiled with fontTools FEA and shaped with the platform HarfBuzz library. Glyph
IDs, clusters, both advances and both offsets are compared, including en/tr
language selection. No installed fonts are read or redistributed.

Version 0.6.0 additionally implements anchorDef/markClass, explicit cursive,
mark-to-base, mark-to-ligature and mark-to-mark statements, NULL anchors,
MarkAttachmentType and UseMarkFilteringSet. See [advanced authoring](ADVANCED-AUTHORING.md).
Still outside this grammar: class ranges, feature parameters/variation conditions,
full numeric lookup flags, variable/device-anchor values, includes and table blocks.
Automatic variable mark-to-base and kerning remain supported through the source model.

Primary specifications consulted on 2026-09-17:
- https://adobe-type-tools.github.io/afdko/OpenTypeFeatureFileSpecification.html
- https://learn.microsoft.com/en-us/typography/opentype/spec/gsub
- https://learn.microsoft.com/en-us/typography/opentype/spec/gpos
