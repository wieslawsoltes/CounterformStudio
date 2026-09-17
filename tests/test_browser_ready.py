"""Readiness-gate unit tests; synthetic states do not qualify the font renderer."""
import os
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright
from browser_ready import wait_for_native_workspace


class NativeWorkspaceReadinessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        executable = os.environ.get('CHROMIUM_PATH') or (
            '/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
        cls.browser = cls.playwright.chromium.launch(
            executable_path=executable, headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page()
        self.page.set_content('<main>Isolated readiness test</main>')
        self.page.evaluate("""() => {
            document.documentElement.dataset.ready = 'true';
            globalThis.counterform = {
                S: {}, proof: {face: {}}, compiler: {backend: 'test'},
                renderer: {S: {}, backend: 'initializing', drawCount: 1, disposed: false}
            };
        }""")

    def tearDown(self):
        self.page.close()

    def test_ready_proof_does_not_hide_uninitialized_surface(self):
        with self.assertRaisesRegex(AssertionError, 'initializing'):
            wait_for_native_workspace(self.page, timeout_ms=100)

    def test_ready_surface_does_not_hide_missing_proof(self):
        self.page.evaluate("counterform.renderer.backend='canvas';counterform.proof.face=null")
        with self.assertRaisesRegex(AssertionError, "'proofReady': False"):
            wait_for_native_workspace(self.page, timeout_ms=100)

    def test_failed_fallback_or_disposed_surface_is_not_native_success(self):
        for backend in ['Skia error', 'Canvas 2D fallback', 'device lost — recovering']:
            with self.subTest(backend=backend):
                self.page.evaluate('(value) => counterform.renderer.backend=value', backend)
                with self.assertRaises(AssertionError):
                    wait_for_native_workspace(self.page, timeout_ms=100)
        self.page.evaluate("counterform.renderer.backend='canvas';counterform.renderer.disposed=true")
        with self.assertRaises(AssertionError):
            wait_for_native_workspace(self.page, timeout_ms=100)

    def test_each_native_backend_is_accepted_after_independent_startup(self):
        for backend in ['webgpu', 'webgl', 'canvas', 'Skia']:
            with self.subTest(backend=backend):
                self.page.evaluate('(value) => counterform.renderer.backend=value', backend)
                wait_for_native_workspace(self.page)
        self.page.evaluate("counterform.renderer.backend='initializing';setTimeout(()=>counterform.renderer.backend='canvas', 30)")
        wait_for_native_workspace(self.page)

    def test_invalid_wait_budgets_are_rejected(self):
        for value in [0, -1, True, 1.5, '100']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                wait_for_native_workspace(self.page, timeout_ms=value)


if __name__ == '__main__':
    unittest.main()
