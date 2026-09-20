"""Native artwork, tracing and staged source-authoring gates; no font files used."""
from pathlib import Path
import argparse,json,os,socket,subprocess,time,traceback,mimetypes
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright,expect
from browser_ready import wait_for_native_workspace
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Artwork and tracing browser tests')
parser.add_argument('--root',type=Path,default=ROOT)
parser.add_argument('--out-dir',type=Path,default=ROOT/'test-results/artwork-source')
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
            page.context.route('http://127.0.0.1:4185/**',route)
            page.set_content((assets/'index.html').read_text().replace('<head>','<head><base href="http://127.0.0.1:4185/">'),wait_until='load')
        else:
            server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'4185','CF_ROOT':str(a.root.resolve())},stdout=subprocess.DEVNULL)
            deadline=time.monotonic()+10
            while True:
                try:
                    with socket.create_connection(('127.0.0.1',4185),timeout=.2):break
                except OSError:
                    if time.monotonic()>deadline:raise
                    time.sleep(.1)
            page.goto('http://127.0.0.1:4185/?demo',wait_until='load')
        wait_for_native_workspace(page)
        report['mode']='isolated-inline' if a.isolated else 'http-worker'
        report['environment']=js('({secure:isSecureContext,compiler:counterform.compiler.backend,renderer:counterform.renderer.backend})')
        if not a.isolated:assert report['environment']['compiler']=='worker' and report['environment']['secure']
        js('window.initialSource=JSON.stringify(counterform.doc.data)')
        fixture=subprocess.check_output(['node','--input-type=module','-e',"import {makePNG} from './tests/artwork-fixture.mjs';process.stdout.write(Buffer.from(makePNG(128,128,(x,y)=>((x-64)**2+(y-60)**2<45**2&&(x-64)**2+(y-60)**2>24**2)||(x>=90&&x<100&&y>=94&&y<114)).bytes).toString('base64'));"],cwd=ROOT,text=True)
        import base64
        png=base64.b64decode(fixture)
        def editor():
            command('glyph.artwork');d=page.get_by_role('dialog',name='Artwork references and masks');expect(d).to_be_visible();return d
        def add_png(d):
            with page.expect_file_chooser() as chooser:d.get_by_role('button',name='Import PNG reference',exact=True).click()
            chooser.value.set_files({'name':'Original Ring.png','mimeType':'image/png','buffer':png})
            expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option')).to_have_count(1)
            return d
        def cancel(d):d.get_by_role('button',name='Cancel',exact=True).click();expect(d).not_to_be_visible()
        def load_and_preview():
            d=add_png(editor());condition('JSON.stringify(counterform.doc.data)===initialSource')
            page.wait_for_function('document.querySelector(".cf-artwork-preview skia-canvas")?.dataset.artworkCount==="1"')
            d.get_by_role('spinbutton',name='Position X',exact=True).fill('80');d.get_by_role('spinbutton',name='Position X',exact=True).press('Tab')
            expect(d.get_by_role('spinbutton',name='Position X',exact=True)).to_have_value('80')
            d.get_by_role('spinbutton',name='Opacity',exact=True).fill('.7');d.get_by_role('spinbutton',name='Opacity',exact=True).press('Tab')
            page.screenshot(path=str(a.out_dir/'artwork-reference.png'));cancel(d);condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('PNG file import and native Skia reference preview remain private and cancel without source changes',load_and_preview)
        def file_open_and_readback():
            page.evaluate("async(data)=>{const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));await counterform.openFile(new File([bytes],'Direct.png',{type:'image/png'}));}",fixture)
            d=page.get_by_role('dialog',name='Artwork references and masks');expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option')).to_have_count(1)
            actual=page.evaluate("""(data)=>{const S=counterform.S,im=S.SKImage.FromEncodedData(Uint8Array.from(atob(data),c=>c.charCodeAt(0)));try{const cs=S.SKColorSpace.CreateSrgb();try{const bytes=im.ReadPixels(new S.SKImageInfo(128,128,S.SKColorType.Rgba8888,S.SKAlphaType.Unpremul,cs));let good=true;for(let y=0;y<128;y++)for(let x=0;x<128;x++){const ink=((x-64)**2+(y-60)**2<45**2&&(x-64)**2+(y-60)**2>24**2)||(x>=90&&x<100&&y>=94&&y<114);const i=(y*128+x)*4;good&&=bytes[i]===(ink?0:255)&&bytes[i+1]===bytes[i]&&bytes[i+2]===bytes[i]&&bytes[i+3]===255;}return good;}finally{cs.Dispose();}}finally{im.Dispose();}}""",fixture)
            assert actual,'Native unpremultiplied readback must equal every original RGBA byte'
            canvas=d.get_by_role('application',name='Artwork preview.',exact=False);canvas.focus();page.keyboard.press('+');page.keyboard.press('Home')
            box=canvas.bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2+40,box['y']+box['height']/2+20,steps=3);page.mouse.up()
            d.get_by_role('button',name='Fit preview').click();condition('JSON.stringify(counterform.doc.data)===initialSource');cancel(d)
        check('File/Open PNG is staged and native RGBA readback exactly matches the original pixels; preview gestures do not edit source',file_open_and_readback)
        def transaction():
            d=add_png(editor());d.get_by_role('button',name='Apply artwork',exact=True).click();expect(d).not_to_be_visible()
            condition('counterform.editor.layer.artwork.length===1&&counterform.history.undoStack.length===1')
            page.wait_for_function('counterform.renderer.native.dataset.artworkCount==="1"')
            js('counterform.history.undo()');condition('JSON.stringify(counterform.doc.data)===initialSource');js('counterform.history.redo()');condition('counterform.editor.layer.artwork.length===1');js('counterform.history.undo()')
        check('artwork applies once, renders in the main Skia canvas and undoes/redoes exact per-master source',transaction)
        def locks_and_reorder():
            d=add_png(editor());d.get_by_role('combobox',name='Editing lock',exact=True).select_option('on')
            expect(d.get_by_role('spinbutton',name='Position X',exact=True)).to_be_disabled();expect(d.get_by_role('button',name='Remove artwork')).to_be_disabled()
            d.get_by_role('combobox',name='Visibility',exact=True).select_option('off');page.wait_for_function('document.querySelector(".cf-artwork-preview skia-canvas")?.dataset.artworkCount==="0"')
            d.get_by_role('combobox',name='Editing lock',exact=True).select_option('off');d.get_by_role('button',name='Duplicate artwork').click();expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option')).to_have_count(2)
            d.get_by_role('button',name='Move backward').click();expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option').first).to_have_attribute('aria-selected','true')
            d.get_by_role('listbox',name='Artwork layers').get_by_role('option').first.focus();page.keyboard.press('End');expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option').last).to_be_focused()
            d.get_by_role('button',name='Remove artwork').click();expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option')).to_have_count(1);cancel(d)
        check('reference lock, visibility, duplication, ordering and keyboard list navigation work in the draft',locks_and_reorder)
        def trace():
            d=add_png(editor());d.get_by_role('button',name='Autotrace selected',exact=True).click();t=page.get_by_role('dialog',name='Autotrace bitmap',exact=True);expect(t).to_be_visible()
            t.get_by_role('button',name='Preview trace').click();expect(t.get_by_role('status')).to_contain_text('1 holes',timeout=60000)
            page.screenshot(path=str(a.out_dir/'autotrace-preview.png'))
            t.get_by_role('combobox',name='Outline mode').select_option('curves');expect(t.get_by_role('button',name='Use traced outlines')).to_be_disabled()
            t.get_by_role('button',name='Preview trace').click();expect(t.get_by_role('status')).to_contain_text('continuous error',timeout=60000)
            t.get_by_role('combobox',name='Foreground operation').select_option('replace');t.get_by_role('button',name='Use traced outlines').click();expect(t).not_to_be_visible()
            condition('JSON.stringify(counterform.doc.data)===initialSource');d.get_by_role('button',name='Apply artwork').click();expect(d).not_to_be_visible()
            condition('counterform.editor.layer.contours.length>=2&&counterform.editor.layer.contours.some(c=>c.nodes.some(n=>n.in||n.out))')
            fonts=js("""async()=>{let bytes;for(const format of ['ttf','otf','variable','cff2','woff','woff2']){if(format==='variable')continue;({bytes}=await counterform.compiler.compile(counterform.doc,{format}));const f=new FontFace('trace_'+format,bytes);await f.load();}return true;}""")
            assert fonts
            js('counterform.history.undo()');condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('configured authoring service tracing preserves the counter, fits bounded curves and compiles the applied outlines into five font formats',trace)
        def svg_mask():
            d=editor()
            with page.expect_file_chooser() as chooser:d.get_by_role('button',name='Import SVG mask',exact=True).click()
            chooser.value.set_files({'name':'Mask.svg','mimeType':'image/svg+xml','buffer':b'<svg viewBox="0 0 50 50"><path d="M0 0H50V50H0Z"/></svg>'})
            expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option')).to_have_count(1);d.get_by_role('button',name='Exchange with foreground').click();d.get_by_role('button',name='Apply artwork').click();expect(d).not_to_be_visible()
            condition('counterform.editor.layer.contours.length===1&&counterform.editor.layer.artwork[0].kind==="vector"')
            js('counterform.history.undo()');condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('SVG vectors import into a reference mask and exchange with foreground in a single undo transaction',svg_mask)
        def validation():
            d=add_png(editor());d.get_by_role('spinbutton',name='Scale X',exact=True).fill('0');d.get_by_role('spinbutton',name='Scale X',exact=True).press('Tab');expect(d.get_by_role('status')).to_contain_text('invertible');condition('JSON.stringify(counterform.doc.data)===initialSource')
            js('counterform.doc.touch("geometry")');d.get_by_role('button',name='Apply artwork').click();expect(d.get_by_role('status')).to_contain_text('Source, glyph or master changed');cancel(d)
        check('singular transforms roll back and stale artwork drafts cannot overwrite a newer source revision',validation)
        def invalid_png():
            d=editor()
            with page.expect_file_chooser() as chooser:d.get_by_role('button',name='Import PNG reference',exact=True).click()
            chooser.value.set_files({'name':'broken.png','mimeType':'image/png','buffer':png[:-8]})
            expect(d.get_by_role('status')).to_have_attribute('data-error','true');expect(d.get_by_role('listbox',name='Artwork layers').get_by_role('option')).to_have_count(0);cancel(d)
        check('truncated PNG inputs fail visibly before native allocation or source mutation',invalid_png)
        def fit_command():
            command('glyph.mask');condition('counterform.editor.layer.artwork[0].kind==="vector"');js('counterform.history.undo()');condition('JSON.stringify(counterform.doc.data)===initialSource')
            command('outline.fit');d=page.get_by_role('dialog',name='Fit polylines to Bézier curves');expect(d).to_be_visible();d.get_by_role('button',name='Apply',exact=True).click();expect(d).not_to_be_visible()
            js('counterform.history.undo()');condition('JSON.stringify(counterform.doc.data)===initialSource')
        check('mask snapshot and polyline fitting commands retain undo and existing editing behavior',fit_command)
        def owned_lifetime():
            baseline=js('counterform.disposables.length');d=add_png(editor());d.get_by_role('button',name='Autotrace selected').click();t=page.get_by_role('dialog',name='Autotrace bitmap',exact=True);t.get_by_role('button',name='Preview trace').click();cancel(t);cancel(d)
            condition(f'counterform.disposables.length==={baseline}')
            d=add_png(editor());d.get_by_role('button',name='Autotrace selected').click();js('counterform.dispose()');expect(page.get_by_role('dialog')).to_have_count(0)
            condition('!document.querySelector("skia-canvas")')
        check('nested tracing cancels owned worker tasks and all reference surfaces dispose with the workspace',owned_lifetime)
    except Exception:
        report['failure']=traceback.format_exc();print(report['failure'],flush=True)
        try:page.screenshot(path=str(a.out_dir/'failure.png'))
        except Exception:pass
    finally:
        (a.out_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n');browser.close()
        if server:server.terminate();server.wait(timeout=5)
if report.get('failure') or report['pageErrors']:raise SystemExit(1)
