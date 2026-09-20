"""Native artwork, tracing and staged source-authoring gates; no font files used."""
from pathlib import Path
import argparse,json,os,socket,subprocess,time,traceback,mimetypes
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright,expect
from browser_ready import wait_for_native_workspace
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Bitmap color font browser tests')
parser.add_argument('--root',type=Path,default=ROOT)
parser.add_argument('--out-dir',type=Path,default=ROOT/'test-results/bitmap-source')
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
        if not a.isolated:assert report['environment']['compiler']=='worker' and report['environment']['secure']
        js('window.initialSource=JSON.stringify(counterform.doc.data)')
        fixture=subprocess.check_output(['node','--input-type=module','-e',"import {colorPNG} from './tests/bitmap-fixture.mjs';process.stdout.write(Buffer.from(colorPNG()).toString('base64'));"],cwd=ROOT,text=True)
        import base64
        png=base64.b64decode(fixture)
        def editor():
            command('color.bitmap');d=page.get_by_role('dialog',name='Bitmap color strikes');expect(d).to_be_visible();return d
        def add_strike(d,ppem=64):
            d.get_by_label('New strike PPEM',exact=True).fill(str(ppem));d.get_by_role('button',name='Add strike',exact=True).click()
            expect(d.get_by_label('Strike PPEM',exact=True)).to_have_value(str(ppem))
        def add_image(d):
            with page.expect_file_chooser() as chooser:d.get_by_role('button',name='Import PNG bitmap',exact=True).click()
            chooser.value.set_files({'name':'Color ring.png','mimeType':'image/png','buffer':png})
            expect(d.locator('.cf-bitmap-source')).to_be_visible()
        def cancel(d):d.get_by_role('button',name='Cancel',exact=True).click();expect(d).not_to_be_visible()
        def assert_clean():condition('JSON.stringify(counterform.doc.data)===initialSource')
        def staged():
            d=editor();add_strike(d);add_image(d);assert_clean();cancel(d);assert_clean()
        check('PNG import and strike settings are private until Apply; Cancel preserves source',staged)
        def validation():
            d=editor();add_strike(d);d.get_by_role('button',name='Add strike',exact=True).click();expect(d.get_by_role('status')).to_contain_text('Duplicate')
            expect(d.get_by_role('listbox',name='Bitmap strikes').get_by_role('option')).to_have_count(1)
            add_image(d);d.get_by_label('Export tables',exact=True).select_option('both')
            d.get_by_label('Bitmap X (pixels)',exact=True).fill('128');d.get_by_label('Bitmap X (pixels)',exact=True).press('Tab')
            expect(d.get_by_role('status')).to_contain_text('CBDT bearing X');expect(d.get_by_label('Bitmap X (pixels)',exact=True)).to_have_value('0');cancel(d)
        check('duplicate strikes and unrepresentable CBDT bearings are rejected and rolled back',validation)
        def sample_bitmap():
            return js("""()=>{const p=document.querySelector('.cf-bitmap-proof'),c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');x.font=`64px ${p.style.fontFamily}`;x.fillText(String.fromCodePoint(0xf0000),50,160);const bytes=x.getImageData(0,0,256,256).data;let red=0,blue=0;for(let i=0;i<bytes.length;i+=4){if(bytes[i+3]>150&&bytes[i]>170&&bytes[i+1]<90)red++;if(bytes[i+3]>150&&bytes[i+2]>170&&bytes[i]<90)blue++;}return {red,blue};}""")
        def proofs():
            d=editor();add_strike(d);add_image(d)
            for format in ['sbix','cbdt']:
                d.get_by_label('Preview format',exact=True).select_option(format);d.get_by_role('button',name='Compile bitmap proof',exact=True).click()
                expect(d.locator('.cf-bitmap-proof')).to_have_attribute('data-ready','true',timeout=60000)
                counts=sample_bitmap();assert counts['red']>20 and counts['blue']>20,(format,counts)
                report.setdefault('colorSamples',{})[format]=counts
            d.get_by_label('Preview scale',exact=True).select_option('4')
            page.screenshot(path=str(a.out_dir/'bitmap-strikes.png'))
            cancel(d);condition("![...document.fonts].some(f=>f.family.startsWith('CFBitmap-'))")
        check('both sbix and CBDT compiled FontFaces paint actual red and blue bitmap pixels',proofs)
        def multiple():
            d=editor();add_strike(d);add_image(d);add_strike(d,96);add_image(d)
            options=d.get_by_role('listbox',name='Bitmap strikes');options.get_by_role('option').nth(1).focus();page.keyboard.press('Home')
            expect(d.get_by_label('Strike PPEM',exact=True)).to_have_value('64')
            d.get_by_role('button',name='Remove empty strike',exact=True).click();expect(d.get_by_role('status')).to_contain_text('Remove the bitmaps')
            d.get_by_label('Export tables',exact=True).select_option('both')
            d.get_by_label('Bitmap Y (pixels)',exact=True).fill('3');d.get_by_label('Bitmap Y (pixels)',exact=True).press('Tab')
            d.get_by_role('button',name='Apply bitmap strikes',exact=True).click();expect(d).not_to_be_visible()
            condition("counterform.doc.data.bitmapFont.format==='both'&&counterform.editor.glyph.bitmaps.length===2")
            js('window.bitmapApplied=JSON.stringify(counterform.doc.data)');undo();assert_clean();js('counterform.history.redo()');condition('JSON.stringify(counterform.doc.data)===bitmapApplied')
            page.wait_for_function("counterform.renderer.native.dataset.colorPaint==='compiled'",timeout=60000)
            undo();assert_clean()
        check('multiple strikes, keyboard selection, table selection and one-step undo reach the native color cache',multiple)
        def raster():
            d=editor();add_strike(d);d.get_by_role('button',name='Rasterize outline',exact=True).click()
            expect(d.locator('.cf-bitmap-source')).to_be_visible(timeout=30000)
            expect(d.get_by_role('status')).not_to_have_attribute('data-error','true')
            d.get_by_label('Preview format',exact=True).select_option('cbdt');d.get_by_role('button',name='Compile bitmap proof',exact=True).click()
            expect(d.locator('.cf-bitmap-proof')).to_have_attribute('data-ready','true',timeout=60000)
            cancel(d);assert_clean()
        check('native Skia rasterizes the editable outline into an embedded, compiled PNG strike',raster)
        def native_imports():
            results=js("""async()=>{
                const {importFont}=await import('@wieslawsoltes/counterform-font-io');
                const {createBitmapGlyph}=await import('@wieslawsoltes/counterform-bitmap');
                const {bytesFromBase64}=await import('@wieslawsoltes/counterform-artwork');
                const data=structuredClone(counterform.doc.data),g=data.glyphs.find(g=>g.name==='A');
                data.bitmapFont={format:'both',overlay:false,strikes:[{id:'s',ppem:64,ppi:72}]};
                g.bitmaps=[createBitmapGlyph('s',bytesFromBase64(window.testBitmapPNG))];
                const results=[];
                for(const format of ['ttf','otf','cff2','woff','woff2']){
                    const {bytes}=await counterform.compiler.compile(data,{format});
                    const d=await importFont(bytes,{skia:counterform.S});
                    const a=d.char(65);results.push({format,tables:d.data.bitmapFont?.format,png:a.bitmaps?.[0]?.png===g.bitmaps[0].png,outline:d.resolve(a.id).length});d.dispose();
                }
                return results;
            }""")
            assert all(r['tables']=='both' and r['png'] and r['outline']>0 for r in results),results
            report['nativeImports']=results
        page.evaluate('(png)=>window.testBitmapPNG=png',fixture)
        check('TTF, CFF, CFF2 and webfont import reconstructs bitmap pixels alongside default outlines',native_imports)
        def stale():
            d=editor();add_strike(d);add_image(d);js("counterform.doc.touch('edit')")
            d.get_by_role('button',name='Apply bitmap strikes',exact=True).click();expect(d.get_by_role('status')).to_contain_text('Source, glyph or master changed');assert_clean();cancel(d)
        check('an external source revision prevents a stale bitmap draft from being applied',stale)
        def lifetime():
            before=js('counterform.disposables.length')
            for _ in range(3):
                d=editor();add_strike(d);add_image(d);d.get_by_role('button',name='Compile bitmap proof',exact=True).click();cancel(d)
            page.wait_for_timeout(400)
            condition(f'counterform.disposables.length==={before}')
            condition("![...document.fonts].some(f=>f.family.startsWith('CFBitmap-'))")
            d=editor();js('counterform.dispose()');expect(page.get_by_role('dialog')).to_have_count(0)
            assert not report['pageErrors'],report['pageErrors']
        check('closed previews cancel pending compilation and release faces and workspace-owned listeners',lifetime)
    except Exception:
        report['failure']=traceback.format_exc();print(report['failure'],flush=True)
        try:page.screenshot(path=str(a.out_dir/'failure.png'))
        except Exception:pass
    finally:
        (a.out_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n');browser.close()
        if server:server.terminate();server.wait(timeout=5)
if report.get('failure') or report['pageErrors']:raise SystemExit(1)
