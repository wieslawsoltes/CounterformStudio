"""Qualify the deployed repository subpath in a fresh HTTPS browser context.

No account data or installed fonts are accessed. The demo project is confined to
this ephemeral browser profile. This checks software rendering, not GPU hardware.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import time
import traceback
from playwright.sync_api import sync_playwright, expect
from browser_ready import wait_for_native_workspace


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='https://wieslawsoltes.github.io/CounterformStudio/')
    parser.add_argument('--commit', default=os.environ.get('GITHUB_SHA', ''))
    parser.add_argument('--out-dir', type=Path, default=root/'test-results/live-pages')
    args = parser.parse_args()
    if args.url != 'https://wieslawsoltes.github.io/CounterformStudio/':
        parser.error('Only the authorized Counterform Studio Pages origin is accepted')
    if args.commit and not re.fullmatch(r'[0-9a-f]{40}', args.commit):
        parser.error('--commit must be a full lowercase Git SHA')
    version = json.loads((root/'package.json').read_text())['version']
    out = args.out_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)
    report = {'url': args.url, 'expectedVersion': version, 'expectedCommit': args.commit,
              'tests': [], 'pageErrors': [], 'qualification': 'HTTPS software-rendered Chromium'}
    error = None
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        context = browser.new_context(viewport={'width':1600, 'height':1000})
        page = context.new_page()
        page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
        def check(name, condition=True):
            if not condition:
                raise AssertionError(name)
            report['tests'].append({'name':name, 'passed':True})
            print('PASS', name, flush=True)
        try:
            # Require this exact CI build, not an old healthy CDN response.
            for attempt in range(12):
                response = context.request.get(args.url+'asset-manifest.json', params={'qualification':f'{args.commit}-{attempt}'}, timeout=30000)
                manifest = response.json() if response.ok else {}
                if manifest.get('version') == version and (not args.commit or manifest.get('sourceCommit') == args.commit):
                    break
                if attempt == 11:
                    raise AssertionError(f'Expected build not visible: {manifest.get("version")}, {manifest.get("sourceCommit")}')
                time.sleep(5)
            check('live asset manifest matches the requested version and commit')
            page.goto(args.url+'?demo&qualification='+args.commit, wait_until='load', timeout=60000)
            wait_for_native_workspace(page)
            environment = page.evaluate("({secure:isSecureContext,compiler:counterform.compiler.backend,renderer:counterform.renderer.backend,skia:!!counterform.S,commands:counterform.commands.commands.size,tools:counterform.toolRail.querySelectorAll('[data-tool]').length,menus:counterform.menuDefinitions.length,userAgent:navigator.userAgent})")
            report['environment'] = environment
            check('HTTPS startup uses the actual compiler worker and Skia', environment['secure'] and environment['compiler']=='worker' and environment['skia'])
            check('deployed authoring surface contains 24 tools, nine menus and 145 commands', environment['tools']==24 and environment['menus']==9 and environment['commands']==145)
            page.wait_for_function("(()=>{const images=[...counterform.ribbon.shadowRoot.querySelectorAll('img')];return images.length>10&&images.every(i=>i.complete&&i.naturalWidth>0)})()", timeout=30000)
            check('ribbon vector icon assets load from the repository subpath')
            page.keyboard.press('F10')
            page.keyboard.press('ArrowDown')
            expect(page.locator('.cf-command-menu')).to_be_visible()
            page.keyboard.press('Escape')
            check('live keyboard menu opens and closes')
            stored = page.evaluate("async()=>{await counterform.store.save(counterform.doc);const d=await counterform.store.load(counterform.doc.data.id);return d.glyphs.length;}")
            check('live-origin IndexedDB saves and loads the demo source', stored==102)
            page.screenshot(path=str(out/'live-workspace.png'))
            page.evaluate('counterform.dispose()')
            page.wait_for_timeout(100)
            check('workspace disposes without unhandled page exceptions', not report['pageErrors'])
        except Exception as exc:
            error = exc
            report['failure'] = traceback.format_exc()
            print(report['failure'], flush=True)
            try:
                page.screenshot(path=str(out/'failure.png'))
            except Exception:
                pass
        finally:
            (out/'report.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
            context.close()
            browser.close()
    if error is not None:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
