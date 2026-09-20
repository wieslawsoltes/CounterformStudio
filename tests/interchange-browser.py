"""Real compiled-font authoring and measurement UI gates; no installed fonts used."""
from pathlib import Path
import argparse,json,os,socket,subprocess,time,traceback,mimetypes
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright,expect
from browser_ready import wait_for_native_workspace
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root',type=Path,default=ROOT)
parser.add_argument('--out-dir',type=Path,default=ROOT/'test-results/interchange-source')
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
            page.context.route('http://127.0.0.1:4184/**',route)
            page.set_content((assets/'index.html').read_text().replace('<head>','<head><base href="http://127.0.0.1:4184/">'),wait_until='load')
        else:
            server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'4184','CF_ROOT':str(a.root.resolve())},stdout=subprocess.DEVNULL)
            deadline=time.monotonic()+10
            while True:
                try:
                    with socket.create_connection(('127.0.0.1',4184),timeout=.2):break
                except OSError:
                    if time.monotonic()>deadline:raise
                    time.sleep(.1)
            page.goto('http://127.0.0.1:4184/?demo',wait_until='load')
        wait_for_native_workspace(page)
        report['mode']='isolated-inline' if a.isolated else 'http-worker'
        report['environment']=js('({secure:isSecureContext,compiler:counterform.compiler.backend,renderer:counterform.renderer.backend})')
        js('window.initialSource=JSON.stringify(counterform.doc.data)')
        def editor():
            command('glyph.variations');d=page.get_by_role('dialog');expect(d).to_be_visible();return d
        def add_variant(d):
            d.get_by_role('textbox',name='Base character',exact=True).fill('U+0041')
            d.get_by_role('textbox',name='Variation selector',exact=True).fill('U+FE0F')
            d.get_by_role('combobox',name='Variation glyph',exact=True).select_option(js("counterform.doc.glyph('I').id"))
            d.get_by_role('button',name='Add / replace mapping',exact=True).click()
        def draft_proof():
            d=editor();add_variant(d);d.get_by_role('button',name='Validate UVS proof').click()
            expect(d.get_by_role('status')).to_contain_text('Validated 1',timeout=60000)
            expect(d.get_by_role('img',name='Compiled variation sequence proof')).to_be_visible()
            condition('JSON.stringify(counterform.doc.data)===initialSource')
            pixels=js("""() => {const p=document.querySelector('[aria-label="Compiled variation sequence proof"]'),canvas=document.createElement('canvas');canvas.width=140;canvas.height=120;const c=canvas.getContext('2d');c.font='100px '+p.style.fontFamily;const render=t=>{c.clearRect(0,0,140,120);c.fillText(t,5,100);return c.getImageData(0,0,140,120).data;};const a=render('A'),i=render('I'),v=render('A\uFE0F');return [i.every((n,k)=>n===v[k]),a.some((n,k)=>n!==v[k])];} """)
            assert pixels==[True,True],pixels
            page.screenshot(path=str(a.out_dir/'unicode-variation-editor.png'));close()
            condition("![...document.fonts].some(f=>f.family.startsWith('CF_uvs_'))")
        check('staged UVS preview renders the alternate glyph from compiled bytes without source mutation',draft_proof)
        def apply_undo():
            d=editor();add_variant(d);d.get_by_role('button',name='Apply mappings').click();expect(d).not_to_be_visible(timeout=60000)
            condition("counterform.doc.variation(65,65039).name==='I'&&counterform.history.undoStack.length===1")
            undo();condition('JSON.stringify(counterform.doc.data)===initialSource');js('counterform.history.redo()');condition("counterform.doc.variation(65,65039).name==='I'");undo()
        check('UVS Apply is one validated undo transaction, with redo rebuilding lookup indexes',apply_undo)
        def invalid():
            d=editor();d.get_by_role('textbox',name='Variation selector',exact=True).fill('U+0042');d.get_by_role('button',name='Add / replace mapping').click()
            expect(d.get_by_role('status')).to_have_attribute('data-error','true');condition('JSON.stringify(counterform.doc.data)===initialSource')
            d.get_by_role('button',name='Copy draft to JSON').click();d.get_by_role('textbox',name='Variation sequences JSON').fill('[{"unicode":65,"selector":65039,"glyphId":"absent"}]')
            d.get_by_role('button',name='Load draft JSON').click();expect(d.get_by_role('status')).to_contain_text('missing');close()
        check('invalid selectors and missing JSON references cannot corrupt encoding',invalid)
        def stale():
            d=editor();add_variant(d);js("counterform.history.execute('Other edit',()=>counterform.doc.data.info.familyName+=' changed')")
            d.get_by_role('button',name='Apply mappings').click();expect(d.get_by_role('status')).to_contain_text('changed');close();undo();condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('optimistic source revision guard rejects stale encoding drafts',stale)
        def exported():
            result=js("""async()=>{const source=structuredClone(counterform.doc.data);source.variationSequences=[{unicode:65,selector:65039,glyphId:counterform.doc.glyph('I').id}];const {importWithSkia,parseTrueType}=await import('@wieslawsoltes/counterform-font-io');const {FontDocument}=await import('@wieslawsoltes/counterform-model');const out=[];for(const format of ['ttf','otf','cff2','variable','variable-cff2','woff','woff2']){const {bytes}=await counterform.compiler.compile(source,{format});const f=await new FontFace('CF_export_uvs',bytes).load();out.push(f.status==='loaded');if(format==='otf'){const data=await importWithSkia(bytes,counterform.S);const d=data;out.push(d.variation(65,65039).id===d.char(73).id);}}return out;}""")
            assert result==[True]*8,result
        check('all seven export flavors load in Chromium and CFF native import reconstructs cmap14',exported)
        def late_close():
            d=editor();add_variant(d)
            js("""()=>{window.realCompile=counterform.compiler.compile.bind(counterform.compiler);counterform.compiler.compile=(...args)=>args[2]?.key?.startsWith('encoding-')?new Promise(resolve=>{window.releaseUVS=()=>resolve({bytes:new Uint8Array(1)});}):realCompile(...args);}""")
            d.get_by_role('button',name='Apply mappings').click();expect(d.get_by_role('status')).to_contain_text('Compiling');close();js('()=>{releaseUVS();counterform.compiler.compile=realCompile;}');page.wait_for_timeout(50)
            condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('closing the encoding modal cancels ownership before a delayed result arrives',late_close)
        def svg_import():
            # SVG is imported as editable outlines through the real File/Open route.
            js("counterform.selectGlyph(counterform.doc.glyph('A').id);counterform.activate('glyph')")
            result=js("""async()=>{const before=counterform.editor.layer.contours.length;await counterform.openFile(new File(['<svg viewBox="0 0 100 100"><g transform="translate(10,5) scale(.8)"><path d="M0 0A50 50 0 0 1 100 0L100 100H0Z"/></g></svg>'],'outline.svg'));return counterform.editor.layer.contours.length-before;}""")
            assert result==1,result;page.screenshot(path=str(a.out_dir/'svg-outline-import.png'));undo();condition('JSON.stringify(counterform.doc.data)===initialSource')
            result=js("""async()=>{try{await counterform.openFile(new File(['<svg><script/></svg>'],'invalid.svg'));return false;}catch{return JSON.stringify(counterform.doc.data)===initialSource;}}""");assert result
        check('SVG arcs and group transforms import as undoable source while executable SVG is rejected',svg_import)
        def arc_oracle():
            result=js("""async()=>{const {fromSVG,toSVG}=await import('@wieslawsoltes/counterform-geometry');const samples=['M0 0A40 25 30 1 1 70 20','M0 0A1 1 0 0 1 100 0','M10 10a30 20 60 0 0 30 20'];return samples.map(d=>{const a=document.createElementNS('http://www.w3.org/2000/svg','path'),b=a.cloneNode();a.setAttribute('d',d);b.setAttribute('d',toSVG(fromSVG(d)));const la=a.getTotalLength(),lb=b.getTotalLength();let max=0;for(let i=0;i<=100;i++){const p=a.getPointAtLength(i*la/100),q=b.getPointAtLength(i*lb/100);max=Math.max(max,Math.hypot(p.x-q.x,p.y-q.y));}return {length:Math.abs(la-lb),max};});}""")
            assert all(r['length']<.05 and r['max']<.05 for r in result),result
            report['svgBrowserOracle']=result
        check('elliptical arc cubics agree with Chromium native SVG lengths and sampled positions',arc_oracle)
        def modal_ordering():
            result=js("""async()=>{const {dialog}=await import(new URL('packages/workbench/src/ui.js',document.baseURI));let count=0;const a=dialog('Outer'),b=dialog('Inner');a.onClose(()=>{count++;b.close();});b.onClose(()=>count++);window.nativeCloses=0;a.element.addEventListener('close',()=>nativeCloses++);a.element.close('accepted');const immediate=count===2&&!a.element.isConnected&&!b.element.isConnected&&a.element.returnValue==='accepted';a.close();a.onClose(()=>count++);return immediate&&count===3;}""")
            assert result;page.wait_for_function('nativeCloses===1')
        check('nested modal ownership releases synchronously and preserves a single native close event',modal_ordering)
        def escape_cancel():
            js("""async()=>{const {dialog}=await import(new URL('packages/workbench/src/ui.js',document.baseURI));window.cancelled=dialog('Cancelable');window.closedCount=0;cancelled.onClose(()=>closedCount++);window.preventCancel=e=>e.preventDefault();cancelled.element.addEventListener('cancel',preventCancel);}""")
            page.keyboard.press('Escape');condition('cancelled.element.open&&closedCount===0');js("cancelled.element.removeEventListener('cancel',preventCancel)");page.keyboard.press('Escape');page.wait_for_function('closedCount===1&&!cancelled.element.isConnected')
        check('prevented Escape does not dispose an open dialog; accepted Escape disposes exactly once',escape_cancel)
        def lifetime():
            n=js('counterform.disposables.length')
            for _ in range(5):editor();close();condition(f'counterform.disposables.length==={n}')
            editor();js('counterform.dispose()');expect(page.get_by_role('dialog')).not_to_be_visible();condition("![...document.fonts].some(f=>f.family.startsWith('CF_uvs_'))")
        check('encoding dialogs release worker keys, fonts and subscribers on close and workspace disposal',lifetime)
    except Exception:
        report['failure']=traceback.format_exc();print(report['failure'],flush=True)
        try:page.screenshot(path=str(a.out_dir/'failure.png'))
        except Exception:pass
    finally:
        (a.out_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n');browser.close()
        if server:server.terminate();server.wait(timeout=5)
if report.get('failure') or report['pageErrors']:raise SystemExit(1)
