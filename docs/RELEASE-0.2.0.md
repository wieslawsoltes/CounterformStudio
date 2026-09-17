# Counterform Studio 0.2.0 qualification and handoff

Date: 2026-09-17. Base remote main: `ff279154a3156797e6352ce6f4b28699284ee3e4`.

## Delivered changes

Two new reusable packages bring the total to 20. All Counterform package versions and internal dependencies are 0.2.0. Upstream vendor source and SkiaSharpWeb APIs remain unchanged.

The color engine emits actual COLRv0 and CPALv0 tables, retains ordered glyph-layer references, checks shared-record expansion budgets, supports foreground and alpha colors, and reconstructs supported TrueType tables into stable source identities. The UI provides palette editing, RGBA validation, layer glyph/color choice, reorder/remove, and undo. Native Skia rendering and compiled browser text both show color. This is not COLRv1 or full color-format parity.

The compiler package runs compile/validate/inspect jobs with immutable input snapshots, transferable output buffers, keyed supersession, queue bounds, FIFO tie-breaking, priority, timeouts and active worker termination. Browser FontProof uses generation checks before installing a new face. Source bootstrap generates a relative-URL worker graph because page import maps are not inherited by workers. Inline mode is an explicit compatibility/testing option, not a silent fallback.

Autosave flush now waits for in-flight and trailing writes. Snapshot timing, reentrant observers, late database-open completion, shutdown and error propagation are covered by tests. This is not a crash WAL. Pane activation tests wait for both selected model state and visible content; no existing visibility assertion was removed.

## Measured verification

| Gate | Local result |
|---|---|
| Node tests | 60 pass; no failures or skips |
| fontTools oracle | 11 checks pass; decompiled COLR/CPAL, exact RGBA, foreground IDs and variable-instance preservation included |
| Browser source | 27 checks pass, 1 IndexedDB check explicitly skipped; actual pointer actions, color UI, invalid-input rollback and compiled red/blue pixels |
| Browser static distribution | 27 checks pass and 1 IndexedDB check is explicitly skipped against the built assets |
| TypeScript consumer | Pass |
| Fresh extracted npm consumer | 20 archives; real packaged Node worker, byte-identical color fonts and headless APIs |
| Static worker graph | 31 modules; fresh-directory Node-worker execution without npm/import maps passes |

Node is v22.16.0 in this environment. Browser is HeadlessChrome 144.0.0.0 with native Skia raster. The local-assets harness has an opaque origin and explicitly opts into inline compilation; it does not exercise HTTPS/localhost browser Worker startup, IndexedDB or WebGPU. The generated browser entry and graph are additionally executed under a Node host providing the message API, which is not browser-platform qualification. Normal CI retains real browser Worker and IndexedDB requirements.

Generated test fonts are produced only in temporary directories and deleted after checks. No font binaries, credentials or system fonts are included in deliverables. The source and static build contain locally bundled vendor code/WASM and required notices.

## GitHub status

The original delivery import and initial Pages deployment succeeded in workflow `35151631674`. Remote main's latest verification (`35186238517`) failed at the glyph-inventory visibility check. This patch addresses the fixed-delay assertion and has passed locally, but no updated remote CI result is claimed.

The GitHub connector exposed reads but no commit/blob/tree/ref write actions during this work. No authenticated network push was available. Therefore this version is delivered as a complete source/static/package archive and Git patch; **no new commit or deployment is claimed**. Apply the patch to a clean clone and push main normally. The workflow will validate source and distribution before deploying Pages, preserving the existing gate.

## Remaining boundaries

Full hint authoring/debugging, CFF2, WOFF2 export, variable positioning/HVAR/MVAR, full contextual/complex-script FEA, COLRv1/bitmap/SVG color workflows, lossless compiled-font roundtrips, proprietary source formats, non-destructive construction, exhaustive native keymaps, a crash journal, incremental source synchronization and representative performance/device/accessibility audits remain outstanding.

## Primary references

- Microsoft OpenType COLR: https://learn.microsoft.com/en-us/typography/opentype/spec/colr
- Microsoft OpenType CPAL: https://learn.microsoft.com/en-us/typography/opentype/spec/cpal
- MDN HTML import maps: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap
