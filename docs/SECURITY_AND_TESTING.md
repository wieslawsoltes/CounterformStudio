# Security and verification

## Input and persistence boundaries

The app does not upload user fonts and has no API-key field, telemetry endpoint or server account. It runs from local, pinned assets. Projects download as JSON; autosave uses origin-local IndexedDB. Browser quota, private mode, origin changes and user storage deletion can remove autosaves. Explicit source file downloads are the portable backup.

Font import has a 64 MiB budget; JSON projects and expanded ZIP data are bounded to 128 MiB. Readers check byte offsets and table lengths. Source validation constrains glyph/master counts, Unicode scalars, finite outline coordinates, component matrices and point budgets. ZIP import rejects parent traversal, duplicate paths, encryption, excessive inflation and CRC mismatches. The XML reader rejects DTDs/external entities. Feature syntax is parsed rather than evaluated. Declarative recipes have operation limits and no arbitrary `eval`/Python execution.

These are application-level defenses, not a security audit or an assurance against every malicious font. Skia and other vendored native runtimes have their own attack surface; update and requalify pinned dependencies before deployment in an adversarial environment. The development server is loopback-only and rejects directory traversal/symlink escape. No remote shell, credentials or secret storage is included.

## Recorded tests

`tests/core.test.mjs`: 36 Node tests for geometry, reversible source mutation, malformed-input rejection, binary checksums, source roundtrips, variation topology, commands, recipes and numerical compute fallback.

`tests/fonttools.py`: 11 independent checks, including COLRv0/CPALv0 channels and variable color instance preservation. All exported TTF/CFF/WOFF/variable tables decompile in fontTools; cmap/names/metrics/layout checks pass; variable outlines instantiate at 300/400/500/600/800; sparse multi-axis values agree with fontTools; UFO3 layers and source metrics are accepted by its UFO reader. Fixtures are original generated data in an automatically removed temporary directory.

`tests/browser.py`: 28 behavioral checks per source/distribution run (27 pass locally; IndexedDB is explicitly skipped) including genuine pointer node and handle drags, single-transaction undo/redo, rectangle/ellipse creation, scoped key dispatch, native Skia overlap/stroke, source metrics, TreeDataGrid and GridWeb integration, feature proof recompilation, native CFF import, rich notes, variable preview, palette/dialogs, actual color font pixel sampling and disposal.

`tests/color.test.mjs`, `tests/compiler.test.mjs` and `tests/storage.test.mjs` extend the original 36 cases to 60. Actual Node workers and the generated relative-URL browser graph execute, while cancellation/priority/timeout/error states have controlled worker tests. Autosave tests use delayed stores to prove in-flight/trailing flush ordering and failure handling. These delayed stores are not an IndexedDB engine qualification.

`tests/types-smoke.ts`: strict TypeScript consumer compilation for package imports. Declaration internals use `skipLibCheck` to avoid treating upstream declaration compatibility as Counterform certification. Some low-level APIs still expose `any`; source model interfaces are explicit.

## Environment distinction

The recorded browser run uses `--isolated` because the host Chromium environment blocks URL navigation. This mode renders only supplied local files into an opaque document and does not change browser policies. It reports `isSecureContext:false`, `navigator.gpu:false` and native Skia's actual `canvas` backend. IndexedDB is explicitly recorded as unqualified, not simulated. The shader service uses its truthful `cpu-f64` fallback.

The local browser uses explicit inline compilation. It does not qualify actual browser workers. Normal CI runs without `--isolated`, requires the real compiler worker backend, starts localhost and attempts an actual IndexedDB save/load. The actual chosen GPU/render backend is recorded; a success on raster must never be relabeled a hardware-WebGPU pass. Desktop/mobile hardware, Safari/Firefox, WebGPU device-loss, long-session leaks and complete accessibility are outstanding.

## Shipping checks

`npm run build` copies pinned local runtime inputs, writes a SHA-256 asset manifest and uses relative import-map paths. `npm run pack:all` produces 20 source packages and package integrity records. `npm run release:zip` excludes font binaries, caches, symlinks and fixture files. Independent test reports and actual screenshots accompany the source.

COLR/CPAL import validates versions, record offsets, sorted base records, glyph references and palette indexes. Expanded source records are capped to avoid disproportionate shared-record allocation. Unsupported versions and beyond-budget inputs are rejected rather than silently truncated. Worker errors/cancellation are explicit; no automatic caller-thread fallback is hidden from the user. Original compile functions remain available as synchronous headless APIs.
