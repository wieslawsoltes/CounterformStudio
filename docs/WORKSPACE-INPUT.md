# Desktop workspace input completion

This continuation retains the 0.5.1 desktop design, all ten pinned upstream libraries, all 30 packages, 145 commands and 73 original vector icons. No SkiaSharpWeb API, font compiler or source model contract is changed.

## Focus and selection

`WorkspaceFocus` gives each editor handoff a cancellable lifetime. Already-visible canvases focus synchronously; one animation-frame callback settles focus after Dockyard applies layout and optionally fits a newly opened glyph. A newer pointer press, keystroke or unrelated focus wins. Document, glyph and master identities and selected-tab state are rechecked before the callback. A modal or a subsequently selected document must not lose focus to an earlier action. Disposal removes capture listeners and cancels pending callbacks; there are no polling timers or repeated focus attempts.

Glyph-strip refresh reconciles the bounded nine-item window by stable glyph ID. Existing button/SVG nodes are reused instead of replacing the entire toolbar on every source revision. Keyboard focus and the roving tab stop remain attached to the user's active item, while selected-glyph styling remains independent. A source update during a held pointer no longer removes its activation target. Toolbar orientation is declared explicitly.

The Output command previously routed to the nonexistent `code` pane. It now targets the actual `output` pane. Focus mode hides both Preview and Output and restores the saved layout, including the previously selected bottom tab.

## Regression gates

Six headless tests cover immediate/deferred focus, cancellation, supersession, stale/disconnected targets, reentrancy and disposal. Nine additional browser checks run on source and built distribution. They include 24 repeated glyph activations after three layout resets, keyed-node retention, a real held-pointer/source-update interaction, Output/Focus controls, later field/modal focus, stale tab/glyph requests, theme screenshots, native status and complete disposal. Failures preserve bounded focus diagnostics and screenshots.

The new keyed-target test was run against the preceding implementation and failed; it passes after the change. Local source and distribution input suites pass using explicitly isolated local assets, native Skia raster and inline compilation. These local results do not qualify secure-origin persistence or browser workers. The normal CI runs the new checks with real browser workers, then retains the existing full editor/workspace gates and the post-deployment HTTPS check. The exact source is now archived before verification so failed runs also retain their reproducible inputs. No failing assertion in the existing workspace suite was removed or relaxed.
