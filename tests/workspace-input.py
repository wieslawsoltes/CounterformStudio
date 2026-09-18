"""Real workspace input regressions. --isolated excludes HTTP workers and storage."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json
import mimetypes
import os
import socket
import subprocess
import time
import traceback
from playwright.sync_api import sync_playwright, expect
from browser_ready import wait_for_native_workspace

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root', type=Path, default=ROOT)
parser.add_argument('--out-dir', type=Path, default=ROOT/'test-results/workspace-input')
parser.add_argument('--isolated', action='store_true')
args = parser.parse_args()
assets, out = args.root.resolve(), args.out_dir.resolve()
out.mkdir(parents=True, exist_ok=True)
origin, server = 'http://127.0.0.1:4180', None
report = {'mode': 'isolated-local-assets' if args.isolated else 'localhost', 'tests': [], 'pageErrors': []}

with sync_playwright() as playwright:
    executable = os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
    browser = playwright.chromium.launch(executable_path=executable, headless=True,
        args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width': 1600, 'height': 1000})
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    def js(code): return page.evaluate(code)
    def settle():
        js('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))))')
    def command(name):
        page.evaluate('(id) => counterform.commands.run(id)', name)
        settle()
    def check(name, run):
        try:
            run()
            report['tests'].append({'name': name, 'passed': True})
            print('PASS', name, flush=True)
        except Exception as error:
            report['tests'].append({'name': name, 'passed': False, 'error': str(error)})
            raise
    def assert_state(code): assert js(code), code
    try:
        if args.isolated:
            def route(request):
                path = (assets/unquote(urlsplit(request.request.url).path).lstrip('/')).resolve()
                if not path.is_relative_to(assets) or not path.is_file():
                    request.fulfill(status=404, body='Not found')
                    return
                body = path.read_bytes()
                if path == assets/'app/main.js':
                    body = body.replace(b'compilerOptions:{workerURL:', b'compilerOptions:{inline:true,workerURL:')
                request.fulfill(status=200, body=body, headers={
                    'Content-Type': 'text/javascript' if path.suffix in ['.js', '.mjs'] else mimetypes.guess_type(path)[0] or 'application/octet-stream',
                    'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin'})
            page.context.route(origin+'/**', route)
            page.set_content((assets/'index.html').read_text().replace('<head>', f'<head><base href="{origin}/">'), wait_until='load')
        else:
            server = subprocess.Popen(['node', str(ROOT/'scripts/serve.mjs')], cwd=ROOT,
                env={**os.environ, 'PORT': '4180', 'CF_ROOT': str(assets)}, stdout=subprocess.DEVNULL)
            deadline = time.monotonic()+10
            while True:
                try:
                    with socket.create_connection(('127.0.0.1', 4180), timeout=.2): break
                except OSError:
                    if server.poll() is not None or time.monotonic() > deadline: raise RuntimeError('Local test server did not start')
                    time.sleep(.05)
            page.goto(origin+'/?demo', wait_until='load')
        wait_for_native_workspace(page)
        settle()
        report['environment'] = js('({secure:isSecureContext,renderer:counterform.renderer.backend,compiler:counterform.compiler.backend})')
        js('''() => {
            window.inputSource = JSON.stringify(counterform.doc.data);
            window.focusTrace = [];
            document.addEventListener('focusin', event => {
                focusTrace.push({tag:event.target.tagName,label:event.target.getAttribute('aria-label'),time:performance.now()});
                if(focusTrace.length>100)focusTrace.shift();
            }, true);
        }''')
        def adjacent():
            for _ in range(3): command('workspace.reset')
            for index in range(24):
                name = 'B' if index % 2 == 0 else 'A'
                page.get_by_role('button', name='Edit '+name, exact=True).click()
                page.wait_for_function('(name) => counterform.editor.glyph.name===name && counterform.dock.Find("glyph").Title===name+" · Glyph"', arg=name)
                settle()
                assert_state('document.activeElement===counterform.renderer.overlay')
            assert_state('counterform.history.undoStack.length===0 && JSON.stringify(counterform.doc.data)===inputSource')
        check('24 adjacent-glyph clicks preserve canvas focus and source after repeated layout resets', adjacent)
        def stable_targets():
            js('''() => {
                const ui=counterform.workspaceUI;
                window.retainedButton=ui.strip.querySelector('[aria-label="Edit B"]');
                retainedButton.focus();
                counterform.editor.transaction('Input target regression',()=>counterform.editor.layer.advanceWidth+=1);
                ui.update();
            }''')
            settle()
            assert_state('retainedButton.isConnected && document.activeElement===retainedButton && retainedButton.tabIndex===0')
            assert_state('[...counterform.workspaceUI.strip.querySelectorAll("button")].filter(b=>b.tabIndex===0).length===1')
            js('counterform.history.undo()')
            settle()
            assert_state('document.activeElement===retainedButton')
        check('glyph-strip source refresh retains keyed DOM targets and one keyboard tab stop', stable_targets)
        def held_pointer():
            target = page.get_by_role('button', name='Edit B', exact=True)
            target.hover()
            page.mouse.down()
            js("counterform.editor.transaction('Refresh while pressed',()=>counterform.editor.layer.advanceWidth+=1)")
            settle()
            page.mouse.up()
            settle()
            assert_state("counterform.editor.glyph.name==='B' && document.activeElement===counterform.renderer.overlay")
            js('counterform.history.undo()')
            settle()
            assert_state('JSON.stringify(counterform.doc.data)===inputSource')
        check('an actual held pointer survives a source revision and releases on the intended glyph', held_pointer)
        def output():
            command('view.output')
            expect(page.locator('[data-ad-content=output]')).to_be_visible()
            assert_state("counterform.dock.Find('output').IsActive")
            command('view.output')
            assert_state("counterform.dock.Find('output').IsHidden")
            command('view.output')
            expect(page.locator('[data-ad-content=output]')).to_be_visible()
            command('workspace.focus')
            assert_state("['library','inspector','masters','proof','output'].every(id=>counterform.dock.Find(id).IsHidden)")
            command('workspace.focus')
            expect(page.locator('[data-ad-content=output]')).to_be_visible()
            command('workspace.reset')
        check('Output toggles its actual Dockyard pane and Focus hides and restores every auxiliary pane', output)
        def later_focus():
            js('''() => {
                window.fitCalls=0;const fit=counterform.renderer.fit.bind(counterform.renderer);
                counterform.renderer.fit=()=>{fitCalls++;return fit();};
                counterform.workspaceUI.openGlyph(counterform.doc.glyph('O').id);
                counterform.proofPane.querySelector('input').focus();
            }''')
            settle()
            assert_state('document.activeElement===counterform.proofPane.querySelector("input") && fitCalls===0')
        check('a newer field focus cancels pending canvas focus and automatic fit', later_focus)
        def dialog_focus():
            js("counterform.workspaceUI.openGlyph(counterform.doc.glyph('A').id);counterform.workspaceUI.showPreferences()")
            settle()
            assert_state('!!document.activeElement.closest("dialog[open]") && fitCalls===0')
            page.get_by_role('button', name='Done', exact=True).click()
            settle()
        check('a modal opened during a handoff keeps focus and cancels delayed fitting', dialog_focus)
        def superseded():
            js("counterform.workspaceUI.openGlyph(counterform.doc.glyph('O').id);counterform.activate('font')")
            settle()
            expect(page.locator('[data-ad-content=font]')).to_be_visible()
            assert_state('fitCalls===0 && document.activeElement!==counterform.renderer.overlay')
            js("counterform.workspaceUI.openGlyph(counterform.doc.glyph('A').id);counterform.selectGlyph(counterform.doc.glyph('B').id)")
            settle()
            assert_state("counterform.editor.glyph.name==='B' && fitCalls===0")
        check('switching document tabs or glyph identity invalidates stale focus/fit requests', superseded)
        def screenshots():
            command('workspace.reset')
            assert_state('counterform.statusBackend===counterform.renderer.backend')
            page.screenshot(path=str(out/'desktop-workspace.png'))
            command('view.font')
            page.screenshot(path=str(out/'font-window.png'))
            command('view.glyph')
            command('view.theme')
            settle()
            page.screenshot(path=str(out/'desktop-dark.png'))
            command('view.theme')
            assert_state('JSON.stringify(counterform.doc.data)===inputSource')
        check('light, dark and Font-window captures retain the live native-renderer status', screenshots)
        def disposal():
            js("counterform.workspaceUI.openGlyph(counterform.doc.glyph('O').id);window.oldFocus=counterform.workspaceUI.focusRequest;counterform.dispose()")
            settle()
            assert_state('oldFocus.disposed && oldFocus.pending===null && counterform.workspaceUI.stripItems.size===0')
            assert not report['pageErrors'], report['pageErrors']
        check('pending input handoffs and keyed glyph controls dispose without late callbacks or page exceptions', disposal)
    except Exception:
        report['failure'] = traceback.format_exc()
        print(report['failure'], flush=True)
        try:
            report['focusDiagnostics'] = js('({trace:globalThis.focusTrace,active:document.activeElement.outerHTML.slice(0,800),glyph:counterform.editor.glyph.name,title:counterform.dock.Find("glyph").Title})')
            page.screenshot(path=str(out/'failure.png'))
        except Exception: pass
    finally:
        (out/'report.json').write_text(json.dumps(report, indent=2)+'\n')
        browser.close()
        if server:
            server.terminate()
            server.wait(timeout=5)
if report.get('failure') or report['pageErrors']: raise SystemExit(1)
