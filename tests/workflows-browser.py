"""Real compiled-font authoring and measurement UI gates; no installed fonts used."""
from pathlib import Path
import argparse,json,os,socket,subprocess,time,traceback,mimetypes
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright,expect
from browser_ready import wait_for_native_workspace
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root',type=Path,default=ROOT)
parser.add_argument('--out-dir',type=Path,default=ROOT/'test-results/workflows-source')
parser.add_argument('--isolated',action='store_true')
a=parser.parse_args();a.out_dir.mkdir(parents=True,exist_ok=True)
report={'tests':[],'pageErrors':[]};server=None
with sync_playwright() as pw:
    executable=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
    browser=pw.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':1600,'height':1000})
    page.set_default_timeout(10000)
    page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
    def js(code):return page.evaluate(code)
    def condition(code):assert js(code),code
    def command(id):page.evaluate('(id)=>counterform.commands.run(id)',id)
    def check(name,fn):
        try:fn();report['tests'].append({'name':name,'passed':True});print('PASS',name,flush=True)
        except Exception as e:report['tests'].append({'name':name,'passed':False,'error':str(e)});raise
    def close():page.get_by_role('dialog').get_by_role('button',name='Cancel',exact=True).click()
    def undo():js('counterform.history.undo()')
    try:
        if a.isolated:
            assets=a.root.resolve()
            def route(r):
                path=(assets/unquote(urlsplit(r.request.url).path).lstrip('/')).resolve()
                if not path.is_relative_to(assets) or not path.is_file():r.fulfill(status=404,body='Not found');return
                body=path.read_bytes()
                if path==assets/'app/main.js':body=body.replace(b'compilerOptions:{workerURL:',b'compilerOptions:{inline:true,workerURL:')
                r.fulfill(status=200,body=body,headers={'Content-Type':'text/javascript' if path.suffix in ['.js','.mjs'] else mimetypes.guess_type(path)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'})
            page.context.route('http://127.0.0.1:4186/**',route)
            page.set_content((assets/'index.html').read_text().replace('<head>','<head><base href="http://127.0.0.1:4186/">'),wait_until='load')
        else:
            server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'4186','CF_ROOT':str(a.root.resolve())},stdout=subprocess.DEVNULL)
            deadline=time.monotonic()+10
            while True:
                try:
                    with socket.create_connection(('127.0.0.1',4186),timeout=.2):break
                except OSError:
                    if time.monotonic()>deadline:raise
                    time.sleep(.1)
            page.goto('http://127.0.0.1:4186/?demo',wait_until='load')
        wait_for_native_workspace(page)
        report['mode']='isolated-inline' if a.isolated else 'http-worker'
        report['environment']=js('({secure:isSecureContext,compiler:counterform.compiler.backend,renderer:counterform.renderer.backend})')
        js('window.initialSource=JSON.stringify(counterform.doc.data)')
        def reachability():
            condition("counterform.commands.commands.size===151&&counterform.menuDefinitions.length===9")
            condition("['metrics.editor','features.variations','font.collection'].every(id=>counterform.menuDefinitions.some(m=>m.items.includes(id)))")
            condition("[...counterform.commands.commands.keys()].every(id=>counterform.menuDefinitions.some(m=>m.items.includes(id)))")
        check('151 command-backed actions include all three production workflow editors',reachability)
        def metrics():
            command('metrics.editor');d=page.get_by_role('dialog');expect(d.get_by_role('img',name='Source outline metrics strip')).to_be_visible()
            d.get_by_role('button',name='A at position 6',exact=True).click()
            d.get_by_role('textbox',name='Left sidebearing expression').fill('70')
            d.get_by_role('textbox',name='Right sidebearing expression').fill('80')
            d.get_by_role('button',name='Apply metrics',exact=True).click()
            expect(d.get_by_role('status',name='Workflow status')).to_contain_text('Updated 1')
            condition("counterform.doc.metrics('A',counterform.editor.masterId).lsb===70&&counterform.doc.metrics('A',counterform.editor.masterId).rsb===80")
            page.screenshot(path=str(a.out_dir/'metrics-editor.png'))
            d.get_by_role('button',name='Undo',exact=True).click();condition('JSON.stringify(counterform.doc.data)===initialSource')
            d.get_by_role('button',name='Redo',exact=True).click();condition("counterform.doc.metrics('A',counterform.editor.masterId).lsb===70")
            d.get_by_role('button',name='Undo',exact=True).click()
        check('metrics sidebearings update real outlines and remain one undoable source operation',metrics)
        def formulas():
            d=page.get_by_role('dialog');d.get_by_role('textbox',name='Metrics text',exact=True).fill('/A/V')
            d.get_by_role('combobox',name='Apply metrics to').select_option('string')
            d.get_by_role('textbox',name='Left sidebearing expression').fill('lsb("H") + 10')
            d.get_by_role('textbox',name='Right sidebearing expression').fill('=|H')
            d.get_by_role('button',name='Apply metrics',exact=True).click();expect(d.get_by_role('status',name='Workflow status')).to_contain_text('Updated 2')
            condition("counterform.doc.metrics('A',counterform.editor.masterId).lsb===counterform.doc.metrics('H',counterform.editor.masterId).lsb+10")
            condition("counterform.doc.metrics('V',counterform.editor.masterId).rsb===counterform.doc.metrics('H',counterform.editor.masterId).lsb")
            d.get_by_role('button',name='Undo',exact=True).click();condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('slash glyph notation and batch arithmetic sidebearing formulas apply atomically',formulas)
        def invalid_metrics():
            d=page.get_by_role('dialog');d.get_by_role('textbox',name='Left sidebearing expression').fill('lsb("A")')
            d.get_by_role('button',name='Apply metrics',exact=True).click();expect(d.get_by_role('status',name='Workflow status')).to_contain_text('Cyclic')
            condition('JSON.stringify(counterform.doc.data)===initialSource')
            d.get_by_role('textbox',name='Left sidebearing expression').fill('1/0');d.get_by_role('button',name='Apply metrics',exact=True).click()
            expect(d.get_by_role('status',name='Workflow status')).to_contain_text('Division by zero');condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('invalid and cyclic metric formulas cannot partially update a batch',invalid_metrics)
        def kerning():
            d=page.get_by_role('dialog');d.get_by_role('button',name='A at position 1',exact=True).focus();page.keyboard.press('ArrowRight')
            expect(d.get_by_role('button',name='V at position 2',exact=True)).to_be_focused()
            d.get_by_role('spinbutton',name='Pair kerning value').fill('0');d.get_by_role('button',name='Set pair exception',exact=True).click()
            condition("Object.values(counterform.doc.data.kerning[counterform.editor.masterId]).includes(0)")
            d.get_by_role('button',name='Remove pair exception',exact=True).click();expect(d.get_by_text('Inherited group kerning, or zero',exact=True)).to_be_visible()
            d.get_by_role('button',name='Undo',exact=True).click();d.get_by_role('button',name='Undo',exact=True).click();condition('JSON.stringify(counterform.doc.data)===initialSource')
            d.get_by_role('button',name='Done',exact=True).click()
        check('keyboard pair selection and explicit zero kerning preserve inheritance and undo',kerning)
        def collection():
            command('font.collection');d=page.get_by_role('dialog');d.get_by_role('button',name='Build collection',exact=True).click()
            expect(d.get_by_role('status',name='Workflow status')).to_contain_text('Collection built',timeout=60000)
            with page.expect_download() as event:d.get_by_role('button',name='Download collection',exact=True).click()
            downloaded=event.value
            from fontTools.ttLib import TTCollection
            c=TTCollection(downloaded.path());assert len(c.fonts)==js('counterform.doc.data.masters.length');[f.ensureDecompiled() for f in c.fonts]
            page.screenshot(path=str(a.out_dir/'collection-builder.png'))
            condition('JSON.stringify(counterform.doc.data)===initialSource')
            # Imported collection expands to actual standalone faces, not just metadata rows.
            import_bytes=Path(downloaded.path()).read_bytes()
            d.get_by_label('Add local fonts / collection').set_input_files({'name':'test.ttc','mimeType':'font/collection','buffer':import_bytes})
            expect(d.get_by_role('status',name='Workflow status')).to_contain_text('verified faces',timeout=60000)
            with page.expect_download() as event:d.get_by_role('button',name='Extract selected face',exact=True).click()
            from fontTools.ttLib import TTFont
            f=TTFont(event.value.path());f.ensureDecompiled();assert f['maxp'].numGlyphs==102
            d.get_by_role('button',name='Close',exact=True).click()
        check('source masters compile into a TTC, import again, and extract independently readable faces',collection)
        def invalid_collection():
            command('font.collection');d=page.get_by_role('dialog')
            d.get_by_label('Add local fonts / collection').set_input_files({'name':'invalid.ttc','mimeType':'font/collection','buffer':b'ttcf'+b'\0'*20})
            expect(d.get_by_role('status',name='Workflow status')).to_have_attribute('data-error','true')
            condition('JSON.stringify(counterform.doc.data)===initialSource')
            for item in d.get_by_role('checkbox').all():item.uncheck()
            d.get_by_role('button',name='Build collection',exact=True).click();expect(d.get_by_role('status',name='Workflow status')).to_contain_text('Select at least one')
            d.get_by_role('button',name='Close',exact=True).click()
        check('malformed collections and empty face lists are rejected without changing the source',invalid_collection)
        def feature_proof():
            command('features.variations');d=page.get_by_role('dialog');bounds=js('counterform.doc.data.axes[0]')
            d.get_by_role('spinbutton',name='Condition minimum',exact=True).fill(str((bounds['default']+bounds['max'])/2))
            d.get_by_role('button',name='Append conditional rule',exact=True).click()
            d.get_by_role('textbox',name='Conditional proof text').fill('A')
            d.get_by_role('button',name='Compile conditional proof',exact=True).click()
            proof=d.get_by_role('img',name='Compiled conditional proof');expect(proof).to_have_attribute('data-ready','true',timeout=60000)
            low=proof.screenshot();slider=d.get_by_role('slider').first
            slider.evaluate('(e,v)=>{e.value=String(v);e.dispatchEvent(new Event("input",{bubbles:true}));}',bounds['max'])
            high=proof.screenshot();assert low!=high,'compiled variable-font preview must respond to actual coordinates'
            page.screenshot(path=str(a.out_dir/'conditional-features.png'))
            condition('JSON.stringify(counterform.doc.data)===initialSource')
            d.get_by_role('button',name='Cancel',exact=True).click()
        check('conditional FEA compiles to a real variable FontFace and responds to axis controls',feature_proof)
        def feature_apply():
            command('features.variations');d=page.get_by_role('dialog');d.get_by_role('button',name='Append conditional rule',exact=True).click()
            d.get_by_role('button',name='Apply feature source',exact=True).click();expect(d).not_to_be_visible(timeout=60000)
            condition("counterform.doc.data.features.includes('conditionset Heavy')&&counterform.featureText.value===counterform.doc.data.features")
            undo();condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('validated conditional feature source applies transactionally and undoes without damage',feature_apply)
        def feature_invalid():
            command('features.variations');d=page.get_by_role('dialog');d.get_by_role('textbox',name='Conditional feature source').fill('variation calt Missing {sub A by V;} calt;')
            d.get_by_role('button',name='Apply feature source',exact=True).click();expect(d.get_by_role('status',name='Workflow status')).to_have_attribute('data-error','true',timeout=60000)
            condition('JSON.stringify(counterform.doc.data)===initialSource');d.get_by_role('button',name='Cancel',exact=True).click()
        check('unknown condition labels produce diagnostics without committing source',feature_invalid)
        def lifetime_test():
            page.wait_for_function('document.querySelectorAll(".cf-workflow-dialog").length===0')
            baseline=js("({n:counterform.disposables.length,fonts:[...document.fonts].filter(f=>f.family.startsWith('CF_condition_')).map(f=>f.family).sort()})")
            for id in ['metrics.editor','font.collection','features.variations']:
                command(id);d=page.get_by_role('dialog');d.get_by_role('button',name='Close dialog',exact=True).click()
                page.wait_for_function('document.querySelectorAll(".cf-workflow-dialog").length===0')
            assert js("({n:counterform.disposables.length,fonts:[...document.fonts].filter(f=>f.family.startsWith('CF_condition_')).map(f=>f.family).sort()})")==baseline, (baseline,js("({n:counterform.disposables.length,fonts:[...document.fonts].map(f=>f.family)})"))
            command('features.variations');d=page.get_by_role('dialog');js("counterform.history.execute('Concurrent source edit',()=>counterform.doc.data.info.familyName+=' changed')")
            d.get_by_role('button',name='Apply feature source',exact=True).click();expect(d.get_by_role('status',name='Workflow status')).to_contain_text('changed')
            d.get_by_role('button',name='Cancel',exact=True).click();undo();condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('modal lifetimes clean up and stale source editors cannot overwrite concurrent edits',lifetime_test)
        js('counterform.dispose()');page.wait_for_timeout(100)
        check('all new workflows dispose without unhandled page exceptions',lambda: condition('true') if not report['pageErrors'] else (_ for _ in ()).throw(AssertionError(report['pageErrors'])))
    except Exception:
        report['failure']=traceback.format_exc();print(report['failure'],flush=True)
        try:page.screenshot(path=str(a.out_dir/'failure.png'))
        except Exception:pass
    finally:
        (a.out_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n')
        browser.close()
        if server:server.terminate();server.wait(timeout=10)
if 'failure' in report:raise SystemExit(1)
