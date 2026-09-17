"""Wait for independent font-proof and native-surface startup without fixed sleeps."""
from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError


def wait_for_native_workspace(page: Page, timeout_ms: int = 60_000) -> None:
    """Require an actual Skia paint, not just a loaded module or compiled FontFace.

    The compiler worker and the native surface initialize independently. A fast
    proof therefore cannot establish rendering readiness. Backend selection is
    assigned by GlyphRenderer.paintNative only after drawing the source geometry.
    Canvas here is Skia's raster backend, not the application's Canvas2D fallback.
    """
    if type(timeout_ms) is not int or timeout_ms <= 0:
        raise ValueError('timeout_ms must be a positive integer')
    try:
        page.wait_for_function("""() => {
            const app = globalThis.counterform;
            const renderer = app?.renderer;
            return document.documentElement.dataset.ready === 'true'
                && !!app?.proof?.face && !!app?.S && !!renderer?.S
                && !renderer.disposed && renderer.drawCount > 0
                && ['webgpu', 'webgl', 'canvas', 'Skia'].includes(renderer.backend);
        }""", timeout=timeout_ms)
    except PlaywrightTimeoutError as error:
        state = 'browser diagnostics unavailable'
        try:
            state = page.evaluate("""() => ({
                ready: document.documentElement.dataset.ready,
                startupError: document.documentElement.dataset.error,
                proofReady: !!globalThis.counterform?.proof?.face,
                skiaLoaded: !!globalThis.counterform?.S,
                renderer: globalThis.counterform?.renderer?.backend,
                compiler: globalThis.counterform?.compiler?.backend,
                drawCount: globalThis.counterform?.renderer?.drawCount
            })""")
        except Exception:
            pass
        raise AssertionError(f'Native workspace did not become ready: {state}') from error
