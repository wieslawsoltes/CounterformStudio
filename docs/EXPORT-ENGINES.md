# Export-engine expansion

This change is an independently tested addition to the 0.3.0 source, not a full FontLab-parity claim.

`counterform-cff2` compiles static and variable CFF2 cubic CharStrings with a required FontDICT/PrivateDICT pair, uint32 INDEX arrays, bounded numeric operands, topology checks and blend operators. Variable output uses the existing sparse support-region model, fvar/STAT, HVAR and optional MVAR. Widths and endchar operators are not emitted into CFF2 programs. FontTools validates all tables and instantiates seven weights against procedural source geometry and metrics.

`counterform-varstore` encodes ItemVariationStore, DeltaSetIndexMap and VariationIndex data, including 32-bit delta rows, structural bounds and deduplicated positioning delta rows. HVAR includes advance, left and right sidebearing stores. MVAR supports ascender, descender, line gap, cap height and x-height through optional per-master `metrics`. Instance documents interpolate these metrics.

`counterform-woff2` wraps one sfnt face with null transforms and portable RFC 7932 uncompressed meta-blocks. The default browser encoder creates standards-valid WOFF2 but does **not** claim size compression. Consumers can inject a synchronous Brotli encoder; the Node subpath provides real Brotli font-mode compression. Collections must be separated into individual faces first. FontTools confirms byte-for-byte table preservation for stored and compressed WOFF2, including variable CFF2.

The compiler worker and Export dialog expose all five new formats. These do not provide CFF2 hint authoring, a full Adobe feature compiler, or universal lossless imported-font editing.

Primary references:
- https://learn.microsoft.com/en-us/typography/opentype/spec/cff2
- https://learn.microsoft.com/en-us/typography/opentype/spec/otvarcommonformats
- https://learn.microsoft.com/en-us/typography/opentype/spec/hvar
- https://learn.microsoft.com/en-us/typography/opentype/spec/mvar
- https://www.w3.org/TR/WOFF2/
- https://www.rfc-editor.org/rfc/rfc7932.html

Recovery note: the files available in this continuation contained only the previously delivered 0.3.0 source and older archives. No post-0.3.0 working-tree files described in the prior interrupted answer were present. This implementation was recreated from the verified 0.3.0 baseline; previous unverified test counts are not reused.
