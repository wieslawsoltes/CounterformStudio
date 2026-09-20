"""Real compiled-font authoring and measurement UI gates; no installed fonts used."""
from pathlib import Path
import argparse,json,os,socket,subprocess,time,traceback,mimetypes
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright,expect
from browser_ready import wait_for_native_workspace
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root',type=Path,default=ROOT)
parser.add_argument('--out-dir',type=Path,default=ROOT/'test-results/advanced-source')
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
    def attachment():
        command('features.attachments');d=page.get_by_role('dialog');expect(d).to_be_visible()
        d.get_by_role('combobox',name='Target glyph',exact=True).select_option('A')
        d.get_by_role('combobox',name='Mark / next glyph').select_option('V')
        return d
    try:
        if a.isolated:
            assets=a.root.resolve()
            def route(r):
                path=(assets/unquote(urlsplit(r.request.url).path).lstrip('/')).resolve()
                if not path.is_relative_to(assets) or not path.is_file():r.fulfill(status=404,body='Not found');return
                body=path.read_bytes()
                if path==assets/'app/main.js':body=body.replace(b'compilerOptions:{workerURL:',b'compilerOptions:{inline:true,workerURL:')
                r.fulfill(status=200,body=body,headers={'Content-Type':'text/javascript' if path.suffix in ['.js','.mjs'] else mimetypes.guess_type(path)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'})
            page.context.route('http://127.0.0.1:4182/**',route)
            page.set_content((assets/'index.html').read_text().replace('<head>','<head><base href="http://127.0.0.1:4182/">'),wait_until='load')
        else:
            server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'4182','CF_ROOT':str(a.root.resolve())},stdout=subprocess.DEVNULL)
            deadline=time.monotonic()+10
            while True:
                try:
                    with socket.create_connection(('127.0.0.1',4182),timeout=.2):break
                except OSError:
                    if time.monotonic()>deadline:raise
                    time.sleep(.1)
            page.goto('http://127.0.0.1:4182/?demo',wait_until='load')
        wait_for_native_workspace(page)
        report['mode']='isolated-inline' if a.isolated else 'http-worker'
        report['environment']=js('({secure:isSecureContext,compiler:counterform.compiler.backend,renderer:counterform.renderer.backend})')
        js('window.initialSource=JSON.stringify(counterform.doc.data)')
        def reachability():
            condition("counterform.commands.commands.size===156&&counterform.menuDefinitions.length===9")
            condition("['axis.map','features.attachments','outline.analyze'].every(id=>counterform.menuDefinitions.some(m=>m.items.includes(id)))")
            condition("[...counterform.commands.commands.keys()].every(id=>counterform.menuDefinitions.some(m=>m.items.includes(id)))")
        check('all 156 commands remain reachable; three authoring tools join existing menus',reachability)
        def validate_only():
            d=attachment();d.get_by_role('button',name='Append attachment',exact=True).click()
            d.get_by_role('button',name='Validate compiled font').click()
            expect(d.get_by_role('status')).to_contain_text('Validated',timeout=60000)
            expect(d.get_by_role('img',name='Compiled attachment proof')).to_be_visible()
            condition('JSON.stringify(counterform.doc.data)===initialSource&&counterform.history.undoStack.length===0')
            page.screenshot(path=str(a.out_dir/'attachment-editor.png'));close()
        check('attachment template compiles through the configured compiler without changing source on Validate/Cancel',validate_only)
        def apply():
            d=attachment();d.get_by_role('button',name='Append attachment',exact=True).click();d.get_by_role('button',name='Apply attachments').click()
            expect(d).not_to_be_visible(timeout=60000)
            condition("counterform.doc.data.features.includes('pos base')&&counterform.history.undoStack.length===1")
            undo();condition('JSON.stringify(counterform.doc.data)===initialSource');js('counterform.history.redo()');condition("counterform.doc.data.features.includes('pos base')");undo()
        check('compiled attachments commit once, undo and redo losslessly',apply)
        def types():
            for kind in ['ligature','mark','cursive']:
                d=attachment();d.get_by_role('combobox',name='Attachment type').select_option(kind)
                d.get_by_role('button',name='Append attachment',exact=True).click();d.get_by_role('button',name='Validate compiled font').click()
                expect(d.get_by_role('status')).to_contain_text('Validated',timeout=60000);close()
            condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('ligature, mark stacking and cursive templates all produce valid native fonts',types)
        def invalid():
            d=attachment();d.get_by_role('textbox',name='Attachment feature source').fill('feature mark { pos base absent <anchor 1 2> mark @missing; } mark;')
            d.get_by_role('button',name='Apply attachments').click();expect(d.get_by_role('status')).to_have_attribute('data-error','true')
            expect(d).to_be_visible();condition('JSON.stringify(counterform.doc.data)===initialSource');close()
        check('invalid attachment source leaves font and undo untouched with visible diagnostics',invalid)
        def late_source():
            d=attachment();js("counterform.history.execute('External edit',()=>counterform.doc.data.info.familyName+=' edited')")
            d.get_by_role('button',name='Apply attachments').click();expect(d.get_by_role('status')).to_contain_text('changed');close();undo()
            condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('stale document revisions cannot be overwritten by an open source editor',late_source)
        def cancel_compile():
            d=attachment();d.get_by_role('button',name='Append attachment',exact=True).click()
            js('''() => {window.realCompile=counterform.compiler.compile.bind(counterform.compiler);counterform.compiler.compile=(...args)=>args[2]?.key?.startsWith('authoring-')?new Promise(resolve=>{window.releaseCompile=()=>resolve({bytes:new Uint8Array(1000)});}):realCompile(...args);}''')
            d.get_by_role('button',name='Apply attachments').click();expect(d.get_by_role('status')).to_contain_text('Compiling');close();js('()=>{releaseCompile();counterform.compiler.compile=realCompile;}');page.wait_for_timeout(50)
            condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('closing a modal during compilation prevents late source mutation',cancel_compile)
        def maps():
            js("counterform.featureText.value+='\\n# unsaved feature draft'")
            command('axis.map');d=page.get_by_role('dialog');d.get_by_role('button',name='Slow lower half').click();d.get_by_role('button',name='Validate mapping').click()
            expect(d.get_by_role('status')).to_contain_text('monotonic mapping valid');page.screenshot(path=str(a.out_dir/'axis-mapping.png'))
            d.get_by_role('button',name='Apply mapping').click();expect(d).not_to_be_visible()
            condition('counterform.doc.data.axes[0].map[3][1]===.25&&counterform.history.undoStack.length===1')
            condition("counterform.featureText.value.includes('# unsaved feature draft')")
            # Both native variable outline flavors must embed the map as actual avar bytes.
            result=js('''async()=>{const {readDirectory}=await import('@wieslawsoltes/counterform-binary');return Promise.all(['variable','variable-cff2'].map(async format=>{const {bytes}=await counterform.compiler.compile(counterform.doc,{format});return readDirectory(bytes).tables.has('avar')}));}''')
            assert result==[True,True];undo();condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('axis map applies transactionally, retains feature drafts and exports in both variable formats',maps)
        def bad_map():
            command('axis.map');d=page.get_by_role('dialog');d.get_by_role('button',name='Slow lower half').click()
            d.get_by_role('spinbutton',name='Output mapping 2').fill('.5');d.get_by_role('button',name='Apply mapping').click()
            expect(d.get_by_role('status')).to_have_attribute('data-error','true');condition('JSON.stringify(counterform.doc.data)===initialSource')
            d.get_by_role('button',name='Identity mapping').click();d.get_by_role('button',name='Add mapping point').click();d.get_by_role('button',name='Validate mapping').click();expect(d.get_by_role('status')).to_contain_text('4 points');close()
        check('invalid and editable axis points are validated without corrupting master data',bad_map)
        def analysis():
            js("counterform.selectGlyph(counterform.doc.glyph('O').id)");command('view.glyph');command('outline.analyze');d=page.get_by_role('dialog');expect(d.get_by_role('img',name='Signed curvature comb')).to_be_visible()
            condition("document.querySelector('.cf-analysis-summary').textContent.includes('Signed area')")
            page.screenshot(path=str(a.out_dir/'outline-analysis.png'))
            with page.expect_download() as event:d.get_by_role('button',name='Export measurements').click()
            measurement=event.value;measurement.save_as(a.out_dir/'measurements.json');result=json.loads((a.out_dir/'measurements.json').read_text())
            assert result['segmentCount']>0 and result['converged']
            d.get_by_role('button',name='Done',exact=True).click();condition('JSON.stringify(counterform.doc.data)===initialSource&&counterform.history.undoStack.length===0')
        check('outline analysis renders actual geometry and exports measured JSON without font changes',analysis)
        def lifecycle():
            before=js('counterform.disposables.length');faces=js("[...document.fonts].filter(f=>f.family.startsWith('CF_attach_')).length")
            for _ in range(3):
                for cmd in ['features.attachments','axis.map','outline.analyze']:
                    command(cmd);page.get_by_role('dialog').get_by_role('button',name='Close dialog').click()
            page.wait_for_function('(n)=>counterform.disposables.length===n',arg=before)
            condition(f"[...document.fonts].filter(f=>f.family.startsWith('CF_attach_')).length==={faces}")
            command('features.attachments');js('counterform.dispose()');expect(page.get_by_role('dialog')).not_to_be_visible();assert not report['pageErrors']
        check('all new dialogs release owned work on close and workspace disposal',lifecycle)
    except Exception:
        report['failure']=traceback.format_exc();print(report['failure'],flush=True)
        try:page.screenshot(path=str(a.out_dir/'failure.png'))
        except Exception:pass
    finally:
        (a.out_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n');browser.close()
        if server:server.terminate();server.wait(timeout=5)
if report.get('failure') or report['pageErrors']:raise SystemExit(1)
