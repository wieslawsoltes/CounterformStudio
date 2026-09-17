# Completed-frame notifications

The 0.5.1 workspace consumes `GlyphRenderer.frame` to display the selected drawing backend. Native Skia surface invalidation is asynchronous and may coalesce several requests; a compiled proof can also become ready independently. Emitting a frame immediately after requesting invalidation could therefore leave the status bar displaying `initializing` until another edit.

The renderer now emits `frame` after successful `paintNative` drawing and paint/canvas cleanup, including native resize-triggered paints. `drawCount` counts completed paints, not queued requests; `ms` measures the completed paint callback. The synchronous Canvas 2D fallback continues to notify after drawing. Failed or disposed drawing does not publish a successful frame, and rejected invalidations after disposal do not emit into dead subscribers. SkiaSharpWeb APIs and pinned vendor files are unchanged.

Five headless tests in `tests/renderer-frame.test.mjs` exercise actual renderer methods with minimal surface doubles, checking event order, backend transitions, coalescing, failures and disposal. These test notification semantics, not GPU execution. Source/distribution editor and workspace browser suites continue to exercise real Skia rendering; `tests/browser_ready.py` additionally requires both the compiled proof and a completed native paint before recording startup evidence.
