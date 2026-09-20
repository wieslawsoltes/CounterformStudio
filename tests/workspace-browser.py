"""Desktop-workspace UX gates. Isolated mode only qualifies local presentation, not storage/HTTPS."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
from playwright.sync_api import sync_playwright, expect
from browser_ready import wait_for_native_workspace
import argparse, json, mimetypes, os, subprocess, time, traceback

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root',type=Path,default=ROOT)
parser.add_argument('--out-dir',type=Path,default=ROOT/'test-results/workspace')
parser.add_argument('--isolated',action='store_true')
args=parser.parse_args();assets=args.root.resolve();out=args.out_dir.resolve();out.mkdir(parents=True,exist_ok=True)
origin='http://127.0.0.1:4178';server=None
report={'mode':'isolated-local-assets' if args.isolated else 'localhost','tests':[],'pageErrors':[]}
with sync_playwright() as p:
    executable=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
    browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':1600,'height':1000})
    page.on('pageerror',lambda error:report['pageErrors'].append(str(error)))
    def js(code):return page.evaluate(code)
    def check(name,run):
        try:
            run();report['tests'].append({'name':name,'passed':True});print('PASS',name,flush=True)
        except Exception as e:
            report['tests'].append({'name':name,'passed':False,'error':str(e)});raise
    def condition(code):assert js(code),code
    def command(id):js(f"counterform.commands.run('{id}')");page.wait_for_timeout(90)
    def glyph():js("counterform.activate('glyph');counterform.renderer.overlay.focus()")
    def idle():page.wait_for_timeout(120)
    try:
        if args.isolated:
            def route(r):
                path=(assets/unquote(urlsplit(r.request.url).path).lstrip('/')).resolve()
                if not path.is_relative_to(assets) or not path.is_file():r.fulfill(status=404,body='Not found');return
                body=path.read_bytes()
                if path==assets/'app/main.js':body=body.replace(b'compilerOptions:{workerURL:',b'compilerOptions:{inline:true,workerURL:')
                r.fulfill(status=200,body=body,headers={'Content-Type':'text/javascript' if path.suffix in ['.js','.mjs'] else mimetypes.guess_type(path)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'})
            page.context.route(origin+'/**',route)
            page.set_content((assets/'index.html').read_text().replace('<head>',f'<head><base href="{origin}/">'),wait_until='load')
        else:
            server=subprocess.Popen(['node',str(ROOT/'scripts/serve.mjs')],cwd=ROOT,env={**os.environ,'PORT':'4178','CF_ROOT':str(assets)},stdout=subprocess.DEVNULL)
            time.sleep(.8);page.goto(origin+'/?demo',wait_until='load')
        wait_for_native_workspace(page);idle()
        report['environment']=js("({secure:isSecureContext,renderer:counterform.renderer.backend,compiler:counterform.compiler.backend})")
        js("window.uiOriginal=JSON.stringify(counterform.doc.data);window.inspectorOriginal=counterform.inspectorFields.advanceWidth")
        def density():
            condition("counterform.header.clientHeight<=32 && counterform.toolRail.clientWidth===65 && counterform.canvasHost.clientWidth>1050")
            condition("counterform.workspaceUI.preferences.ribbon==='compact' && counterform.ribbon.layout==='simplified' && !counterform.workspaceUI.visible('library')")
            condition("!counterform.renderer.dark && counterform.renderer.dimFill")
            report['initialCanvas']=js("({width:counterform.canvasHost.clientWidth,height:counterform.canvasHost.clientHeight})")
            page.screenshot(path=str(out/'desktop-workspace.png'))
        check('compact desktop chrome prioritizes a paper-first glyph canvas',density)
        def libraries():
            condition("counterform.commands.commands.size===152 && counterform.menuDefinitions.length===9 && counterform.toolRail.querySelectorAll('[data-tool]').length===24")
            condition("!!counterform.dock && !!counterform.table.source && !!counterform.kerning.workbook && !!counterform.notes.element.Document && !!counterform.S && !!counterform.editor.index && counterform.workspaceUI.fontTiles.state===counterform.state && !!counterform.state.glyphs")
            condition("[...counterform.commands.commands.keys()].every(id=>counterform.menuDefinitions.some(m=>m.items.includes(id)))")
            condition("counterform.workspaceUI.controls.every(({id})=>counterform.commands.commands.has(id))")
        check('all existing library-backed editors and every command remain reachable',libraries)
        def font_window():
            glyph();page.keyboard.press('Control+Alt+1');idle()
            expect(page.locator('[data-ad-content=font]')).to_be_visible()
            search=page.get_by_role('searchbox',name='Search font window');search.fill('U+004F');idle()
            condition("counterform.workspaceUI.fontTiles.rows.length===1")
            grid=page.get_by_role('grid',name='Font window glyphs');grid.focus();js('counterform.zoom(.1)');grid.press('Enter');idle()
            expect(page.locator('[data-ad-content=glyph]')).to_be_visible();condition("counterform.editor.glyph.name==='O' && counterform.renderer.camera.scale>.1")
            condition("JSON.stringify(counterform.doc.data)===uiOriginal && counterform.history.undoStack.length===0")
        check('Font window search and Enter open the real glyph without modifying source',font_window)
        def font_grid():
            command('view.font');page.get_by_role('searchbox',name='Search font window').fill('');page.locator('[data-font-category=all]').click();idle()
            condition("counterform.workspaceUI.fontTiles.rows.length===102")
            slider=page.get_by_role('slider',name='Glyph cell size');slider.fill('96');idle()
            grid=page.get_by_role('grid',name='Font window glyphs');grid.focus();grid.press('Home');grid.press('PageDown');idle()
            condition("document.activeElement===counterform.workspaceUI.fontTiles.scroll && !!document.getElementById(counterform.workspaceUI.fontTiles.scroll.getAttribute('aria-activedescendant'))")
            grid.press('End');idle();condition("counterform.editor.glyphId===counterform.workspaceUI.fontTiles.rows.at(-1).id")
            condition("counterform.workspaceUI.fontTiles.content.querySelectorAll('[role=row]').length>0 && [...counterform.workspaceUI.fontTiles.content.querySelectorAll('button')].every(b=>b.tabIndex===-1)")
            grid.press('Home');idle();page.screenshot(path=str(out/'font-window.png'))
            page.locator('[data-font-category=uppercase]').click();js("counterform.selectGlyph(counterform.doc.glyph('A').id)");glyph();idle()
        check('virtualized Font grid has stable focus, page navigation, selection and scalable cells',font_grid)
        def metrics():
            before=js('counterform.editor.layer.advanceWidth');input=page.get_by_role('spinbutton',name='Glyph advance width',exact=True)
            input.fill(str(before+29));input.press('Tab');idle();condition(f'counterform.editor.layer.advanceWidth==={before+29} && counterform.history.undoStack.length===1')
            js('counterform.history.undo()');idle();expect(input).to_have_value(str(before))
            input.fill('-1');input.press('Tab');idle();condition(f'counterform.editor.layer.advanceWidth==={before} && counterform.history.undoStack.length===0');expect(input).to_have_value(str(before))
            input.fill('');input.press('Tab');idle();expect(input).to_have_value(str(before))
            condition("counterform.inspectorFields.advanceWidth===inspectorOriginal")
        check('property-bar metrics share validation and a single undo transaction with the original inspector',metrics)
        def palettes():
            heading=page.locator('[data-palette=metrics] .cf-palette-heading');heading.focus();heading.press('Space');idle()
            expect(page.locator('[data-palette=metrics] .cf-palette-body')).to_be_hidden();expect(heading).to_have_attribute('aria-expanded','false')
            heading.press('Space');idle();expect(page.locator('[data-palette=metrics] .cf-palette-body')).to_be_visible()
            page.get_by_role('option',name='Contour 1',exact=False).click();idle()
            condition('counterform.editor.selection.size===counterform.editor.layer.contours[0].nodes.length')
            page.get_by_role('textbox',name='Name',exact=True).focus();page.keyboard.press('Escape');condition('document.activeElement===counterform.renderer.overlay')
            first=page.locator('.cf-elements-list [role=option]').first;first.focus();first.press('End');condition("document.activeElement===counterform.workspaceUI.elements.querySelector('[role=option]:last-child')")
            page.keyboard.press('Enter');condition('document.activeElement===counterform.renderer.overlay')
            condition('counterform.history.undoStack.length===0')
        check('collapsible palettes and Elements selection preserve original controls and canvas focus',palettes)
        def zoom():
            spin=page.get_by_role('spinbutton',name='Canvas zoom percent');spin.fill('125');spin.press('Tab');idle();condition('Math.abs(counterform.renderer.camera.scale-1.25)<1e-8')
            page.locator('.cf-status-controls [data-command="view.zoomIn"]').click();idle();condition('Math.abs(counterform.renderer.camera.scale-1.5625)<1e-8')
            spin.fill('0');spin.press('Tab');idle();expect(spin).to_have_value('156.3')
            command('view.fit');condition('counterform.history.undoStack.length===0')
        check('status controls implement numeric zoom, bounded rollback and Fit without source edits',zoom)
        def ribbon():
            small=js('counterform.ribbon.clientHeight');command('view.ribbon');page.wait_for_function("counterform.ribbon.layout==='classic'");idle()
            assert js('counterform.ribbon.clientHeight')>small
            condition("[...counterform.ribbon.shadowRoot.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)")
            js('counterform.ribbon.requestRender()');idle();condition('counterform.ribbon.shadowRoot.adoptedStyleSheets.length>0')
            page.screenshot(path=str(out/'expanded-ribbon.png'));command('view.ribbon');condition("counterform.ribbon.layout==='simplified'")
        check('expanded RibbonWeb remains available and its theme survives component rerenders',ribbon)
        def panels():
            rail=page.get_by_role('toolbar',name='Panels list');first=rail.locator('button').first;first.focus();first.press('ArrowDown');condition("document.activeElement.getAttribute('aria-label')==='Glyph window'")
            command('view.library');expect(page.get_by_role('textbox',name='Search glyphs')).to_be_visible();command('view.library');expect(page.get_by_role('textbox',name='Search glyphs')).to_be_hidden()
            command('view.inspector');command('view.inspector');condition("!counterform.workspaceUI.visible('inspector')")
            command('view.inspector');condition("counterform.workspaceUI.visible('inspector')")
        check('panel rail supports keyboard navigation and reversible native Dockyard visibility',panels)
        def focus():
            glyph();width=js('counterform.canvasHost.clientWidth');command('workspace.focus');idle()
            condition("counterform.workspaceUI.focused && ['library','inspector','masters','proof','code'].every(id=>!counterform.workspaceUI.visible(id))")
            assert js('counterform.canvasHost.clientWidth')>width+200
            command('workspace.focus');idle();condition('!counterform.workspaceUI.focused && document.contains(inspectorOriginal)')
            for i in range(3):command('workspace.reset')
            condition("counterform.workspaceUI.visible('inspector') && counterform.workspaceUI.visible('proof') && counterform.history.undoStack.length===0 && JSON.stringify(counterform.doc.data)===uiOriginal")
            condition("document.querySelectorAll('.cf-font-window').length===1 && counterform.workspaceUI.controls.every(({b})=>b.isConnected)")
        check('Focus and repeated Reset restore the original Dockyard contents without source mutation or duplicate UI',focus)
        def adjacent():
            js("counterform.selectGlyph(counterform.doc.glyph('A').id)");idle()
            b=page.locator('.cf-glyph-strip [data-strip-glyph]').filter(has=page.locator('span',has_text='B')).first;b.click();idle()
            condition("counterform.editor.glyph.name==='B' && document.activeElement===counterform.renderer.overlay && counterform.dock.Find('glyph').Title==='B · Glyph'")
        check('adjacent-glyph strip selects real outlines and updates the document tab',adjacent)
        def preferences():
            command('workspace.preferences');d=page.get_by_role('dialog');expect(d).to_be_visible()
            d.get_by_role('combobox',name='Interface theme').select_option('dark');idle();condition("counterform.theme==='dark' && !counterform.renderer.dark")
            d.get_by_role('combobox',name='Glyph canvas').select_option('theme');idle();condition('counterform.renderer.dark')
            d.get_by_role('combobox',name='Glyph canvas').select_option('paper');d.get_by_role('combobox',name='Outline shading').select_option('true');idle();condition('!counterform.renderer.dimFill')
            d.get_by_role('combobox',name='Outline shading').select_option('dim');d.get_by_role('button',name='Done',exact=True).click();idle()
            js("counterform.selectGlyph(counterform.doc.glyph('O').id);counterform.renderer.fit();document.querySelector('.cf-toasts')?.replaceChildren()");idle();page.screenshot(path=str(out/'desktop-dark.png'))
            condition("getComputedStyle(counterform.dockHost.querySelector('.ad-pane-title')).backgroundColor==='rgb(51, 52, 54)'")
            condition('JSON.stringify(counterform.doc.data)===uiOriginal')
            command('view.theme')
        check('theme, paper canvas and true fill are independently configurable without touching font source',preferences)
        def storage():
            if args.isolated:
                report['preferencePersistence']='not qualified: isolated opaque origin';return
            result=js("async()=>{await counterform.workspaceUI.write;return await counterform.store.preference('counterform.workspace.v1')}")
            assert result['theme']=='light' and result['cellSize']==96 and result['canvas']=='paper'
            report['preferencePersistence']='ordered IndexedDB writes read back successfully'
        if args.isolated:report['tests'].append({'name':'appearance preference persistence','passed':None,'skipped':True,'reason':'opaque origin'})
        else:check('appearance preference persistence',storage)
        def responsive():
            for width,height in [(1280,800),(1024,768),(768,768)]:
                page.set_viewport_size({'width':width,'height':height});command('workspace.reset');idle()
                condition(f'document.documentElement.scrollWidth<={width+1} && counterform.canvasHost.clientWidth>250 && counterform.canvasHost.clientHeight>250')
                condition('counterform.menuHost.querySelectorAll("[role=menuitem]").length===9')
                page.screenshot(path=str(out/f'workspace-{width}.png'))
            page.set_viewport_size({'width':1600,'height':1000});command('workspace.reset')
        check('laptop and tablet-width layouts retain menus, panels and a usable editing viewport',responsive)
        def dispose():
            condition('!document.querySelector("dialog[open]")');condition('counterform.history.undoStack.length===0')
            js('counterform.dispose()');idle();condition('counterform.workspaceUI.disposed && counterform.workspaceUI.signal.aborted && !document.querySelector(".cf-font-window")')
            assert not report['pageErrors'],report['pageErrors']
        check('complete workspace disposal removes new presentation lifetimes without page exceptions',dispose)
    except Exception:
        report['failure']=traceback.format_exc();print(report['failure'],flush=True)
        try:page.screenshot(path=str(out/'failure.png'))
        except Exception:pass
    finally:
        (out/'report.json').write_text(json.dumps(report,indent=2)+'\n');browser.close()
        if server:server.terminate();server.wait(timeout=5)
if report.get('failure') or report['pageErrors']:raise SystemExit(1)
