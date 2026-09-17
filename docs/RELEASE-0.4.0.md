# Counterform Studio 0.4.0 — variable export and recoverable source editing

## Font production

The worker and Export dialog compile static/variable CFF2 and three WOFF2 variants in addition to the prior outputs. CFF2 uses uint32 INDEX structures, FontDICT/PrivateDICT, strict topology checks and sparse cubic blend deltas. TrueType and CFF2 variable exports include HVAR advance/sidebearing stores, MVAR ascender/descender/lineGap/capHeight/xHeight overrides, and a deduplicated GDEF 1.3 store for variable pair kerning and mark-to-base anchors. Nonzero variation offsets use the correct PairSet or Anchor origin. Missing master anchors fail explicitly. Seven independent fontTools instances exercise outlines, widths, vertical metrics, kerning and an actual combining-mark anchor fixture.

Browser WOFF2 uses portable, valid Brotli stored blocks; this is not size compression. The Node subpath performs Brotli font-mode compression; hosts can inject another synchronous encoder. Known tags use canonical flag indexes, DSIG is removed, head.flags bit 11 is set, and final-block padding enables the reference browser decoder. All five new export formats are loaded through Chromium FontFace in browser tests, not merely decompiled by fontTools.

## Non-destructive outlines

The new modifier engine evaluates ordered translate, scale, rotate, slant, matrix, round, reverse and repeat steps on cloned geometry with coordinate/node budgets. Identity suffixes are deterministic. Inspector, Contour menu and ribbon open an editor with enable/bypass, parameter editing, duplication, reorder and removal. Baking is a single undoable source mutation. Components resolve before a glyph's stack; variable interpolation uses evaluated per-master geometry. On-canvas editing controls remain in source coordinates; anchors and advances are explicitly not transformed. Proprietary Delta filters, live Boolean/stroke skeletons and arbitrary bitmap effects are not claimed.

## Recovery journal

A standalone journal writes full-source snapshots through atomic IndexedDB compare-and-swap transactions. SHA-256 links revisions in order; a damaged tail returns only the verified prefix. Retention is bounded by bytes and count; queued payloads also have count and byte limits. Stale tabs cannot overwrite an acknowledged newer head. Hashing occurs outside IndexedDB transactions through Web Crypto. The Recovery dialog inspects verified revisions and downloads snapshots or opens a separate project, retaining the original history. Startup can restore a newer committed revision than the ordinary autosave checkpoint.

This is application crash recovery after an acknowledged IndexedDB transaction, not a guarantee against OS/device loss or browser storage eviction. Edits not yet committed can be lost. Full-snapshot writes trade simplicity for write amplification; large-font incremental WAL and worker-clone optimization remain outstanding. The storage chain detects accidental corruption, not malicious rewriting by an origin with the same access.

## Original-font preservation

Imported bytes can be archived with integrity hashes and downloaded unchanged even after later source edits. Metadata-only export preserves original glyph/layout/hint/variation/unknown tables, edits supported naming/version records, retains language tags, regenerates checksums and drops invalidated signatures with a warning. A structural fingerprint refuses this path after outline, encoding, metrics, feature, master or color changes. It is not universal lossless edited-font reconstruction. Original containers up to 32 MiB are supported; metadata rewriting requires an original sfnt face. Archived bytes increase project/journal size.

## Packaging and qualification

29 independently packed packages; six new engines compared with 0.3.0: varstore, cff2, woff2, modifiers, journal and preservation. All release dependency versions align at 0.4.0. SkiaSharpWeb APIs are unchanged. No font binaries are shipped. No npm registry publishing is claimed.

Core, typed-consumer, fontTools, fresh-package and browser tests are run. Isolated local mode explicitly skips secure-origin preservation/journal tests; CI exercises those APIs on real localhost/HTTPS origins. Exact counts/results are in CI artifacts. Hardware WebGPU, platform-native shortcut parity and full FontLab parity are not inferred from software-rendered browser checks. See CAPABILITIES.md for outstanding feature families.
