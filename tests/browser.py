"""Behavioral qualification; --isolated renders local assets without URL navigation.
The isolated mode does NOT qualify secure-origin APIs (IndexedDB/WebGPU).
Normal CI mode serves localhost and qualifies the backend the browser actually selects.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from playwright.sync_api import sync_playwright, expect as browser_expect
import argparse, json, mimetypes, os, subprocess, time, traceback

def assert_empty(value):
    assert not value, value

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--isolated', action='store_true')
parser.add_argument('--root', type=Path, default=root)
parser.add_argument('--out-dir', type=Path, default=root/'test-results')
args = parser.parse_args()
assets = args.root.resolve()
out = args.out_dir.resolve()
out.mkdir(exist_ok=True, parents=True)
report = {'mode': 'isolated-local-assets' if args.isolated else 'localhost', 'tests': [], 'pageErrors': []}
server = None
origin = 'http://127.0.0.1:4177'

with sync_playwright() as p:
    executable = os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
    browser = p.chromium.launch(executable_path=executable, headless=True,
        args=['--no-sandbox', '--use-angle=swiftshader', '--enable-webgl', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, device_scale_factor=1)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    def check(name, run):
        start = time.perf_counter()
        try:
            run()
            report['tests'].append({'name': name, 'passed': True, 'ms': round((time.perf_counter()-start)*1000, 1)})
            print('PASS', name, flush=True)
        except Exception as e:
            report['tests'].append({'name': name, 'passed': False, 'error': str(e)})
            raise
    def js(code): return page.evaluate(code)
    def expect(code):
        assert js(code), code
    def close_dialog():
        page.locator('dialog[open] .cf-close').click()
    def activate(id):
        js(f"counterform.activate('{id}')")
        page.wait_for_function("id => counterform.dock.Find(id)?.IsSelected === true", arg=id)
        content = page.locator(f'[data-ad-content="{id}"]')
        browser_expect(content).to_be_visible(timeout=15000)
    def coords(x, y):
        return js(f"(()=>{{const e=counterform.renderer.overlay,r=e.getBoundingClientRect(),p=counterform.renderer.camera.screen({{x:{x},y:{y}}});return {{x:r.x+p.x,y:r.y+p.y}}}})()")
    try:
        if args.isolated:
            def route(request):
                path=(assets/unquote(urlsplit(request.request.url).path).lstrip('/')).resolve()
                if not path.is_relative_to(assets) or not path.is_file():
                    request.fulfill(status=404, body='Not found'); return
                mime='text/javascript' if path.suffix in ['.js','.mjs'] else mimetypes.guess_type(path)[0] or 'application/octet-stream'
                body=path.read_bytes()
                if path == assets/'app/main.js':
                    body=body.replace(b'compilerOptions:{workerURL:',b'compilerOptions:{inline:true,workerURL:')
                request.fulfill(status=200,body=body,headers={'Content-Type':mime,'Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'})
            page.context.route(origin+'/**', route)
            page.set_content((assets/'index.html').read_text().replace('<head>',f'<head><base href="{origin}/">'), wait_until='load')
        else:
            env={**os.environ,'PORT':'4177','CF_ROOT':str(assets)}
            server=subprocess.Popen(['node',str(root/'scripts/serve.mjs')],cwd=root,env=env,stdout=subprocess.DEVNULL)
            time.sleep(.8)
            page.goto(origin+'/?demo',wait_until='load')
        page.wait_for_function("document.documentElement.dataset.ready === 'true'",timeout=30000)
        page.wait_for_function('!!counterform.proof.face',timeout=15000)
        report['environment']=js("({secure:isSecureContext,webgpuExposed:!!navigator.gpu,renderer:counterform.renderer.backend,compiler:counterform.compiler.backend,skia:!!counterform.S,userAgent:navigator.userAgent})")
        check('workspace boot and real Skia surface',lambda:expect("counterform.S && counterform.renderer.backend !== 'initializing' && counterform.doc.data.glyphs.length===102"))
        check('ten upstream components and extensible commands',lambda:expect("!!counterform.dock && !!counterform.table.source && !!counterform.state.glyphs && !!counterform.ribbon.model && !!counterform.editor.index && !!counterform.kerning.workbook && !!counterform.notes.element.Document && counterform.commands.commands.size>=100"))
        check('Ribbon has executable items',lambda:expect("counterform.ribbon.shadowRoot.querySelectorAll('button').length>10 && counterform.ribbon.shadowRoot.textContent.includes('Polygon tool')"))
        page.screenshot(path=str(out/'workspace.png'))
        def drag_nodes():
            js("counterform.selectGlyph(counterform.doc.glyph('O').id);counterform.renderer.fit();counterform.editor.setTool('select')")
            page.wait_for_timeout(120)
            node=js("(()=>{const n=counterform.editor.layer.contours[0].nodes[1];window.testNode={id:n.id,x:n.x,y:n.y};return n})()")
            a=coords(node['x'],node['y']);page.mouse.move(a['x'],a['y']);page.mouse.down();page.mouse.move(a['x']+24,a['y']-12,steps=8);page.mouse.up()
            expect("counterform.editor.findNode(testNode.id).node.x !== testNode.x && counterform.history.undoStack.length===1")
            page.keyboard.press('Control+z');page.wait_for_timeout(100)
            expect("counterform.editor.findNode(testNode.id).node.x===testNode.x")
            page.keyboard.press('Control+Shift+z');page.wait_for_timeout(100)
            expect("counterform.editor.findNode(testNode.id).node.x!==testNode.x")
            js('counterform.history.undo()')
        check('real pointer node drag is one undoable transaction',drag_nodes)
        def handle_drag():
            point=js("(()=>{const n=counterform.editor.layer.contours[0].nodes[0];window.testHandle={id:n.id,x:n.out.x,y:n.out.y};return n.out;})()")
            a=coords(point['x'],point['y']);page.mouse.move(a['x'],a['y']);page.mouse.down();page.mouse.move(a['x']+13,a['y']+16,steps=5);page.mouse.up()
            expect('counterform.editor.findNode(testHandle.id).node.out.x!==testHandle.x')
            js('counterform.history.undo()')
        check('Bézier handle drag and undo',handle_drag)
        def shape(tool):
            js(f"counterform.editor.setTool('{tool}');window.beforeContours=counterform.editor.layer.contours.length")
            a=coords(130,160);b=coords(240,270)
            page.mouse.move(a['x'],a['y']);page.mouse.down();page.mouse.move(b['x'],b['y'],steps=8);page.mouse.up()
            expect('counterform.editor.layer.contours.length===beforeContours+1')
            js('counterform.history.undo()')
        check('rectangle tool writes editable source',lambda:shape('rectangle'))
        check('ellipse tool writes cubic source',lambda:shape('ellipse'))
        def nudge():
            js("counterform.editor.setTool('select');counterform.editor.select([testNode.id]);counterform.renderer.overlay.focus();window.beforeX=counterform.editor.findNode(testNode.id).node.x")
            page.keyboard.press('Shift+ArrowRight');page.wait_for_timeout(80)
            expect('counterform.editor.findNode(testNode.id).node.x===beforeX+10')
            js('counterform.history.undo()')
        check('modifier-sensitive keyboard nudge',nudge)
        def text_keys():
            page.get_by_role('textbox',name='Search glyphs').fill('O')
            page.get_by_role('textbox',name='Search glyphs').press('r')
            expect("counterform.editor.tool==='select'")
            page.get_by_role('textbox',name='Search glyphs').fill('')
        check('typing in an input never invokes outline shortcuts',text_keys)
        def boolean():
            js("counterform.selectGlyph(counterform.doc.glyph('A').id);counterform.editor.clearSelection();counterform.editor.boolean('Simplify')")
            expect('counterform.editor.layer.contours.length<3 && counterform.editor.layer.contours.length>0')
            js('counterform.history.undo()')
        check('native Skia overlap removal and undo',boolean)
        def stroke():
            js('counterform.editor.expandStroke(20)')
            expect('counterform.editor.layer.contours.length>0')
            js('counterform.history.undo()')
        check('native Skia stroke expansion',stroke)
        def compiler_service():
            result=js("async()=>{const io=await import('@wieslawsoltes/counterform-font-io');const {bytes}=await counterform.compiler.compile(counterform.doc,{format:'ttf'});const direct=io.compileTrueType(counterform.doc);return {equal:bytes.length===direct.length&&bytes.every((b,i)=>b===direct[i]),backend:counterform.compiler.backend};}")
            assert result['equal'], result
            assert result['backend'] == ('inline (explicit)' if args.isolated else 'worker'),result
            report['compiler']=result
        check('compiler service returns byte-identical actual font data on its reported backend',compiler_service)
        def color_editor():
            js("counterform.selectGlyph(counterform.doc.glyph('A').id);window.colorUndo=counterform.history.undoStack.length;counterform.showColors()")
            d=page.locator('dialog[open]')
            d.get_by_role('button',name='+ Color layer',exact=True).click()
            d.get_by_role('button',name='+ Color layer',exact=True).click()
            browser_expect(d.get_by_role('combobox',name='Layer 2 glyph',exact=True)).to_be_visible()
            d.get_by_role('combobox',name='Layer 2 glyph',exact=True).select_option(js("counterform.doc.glyph('O').id"))
            d.get_by_role('textbox',name='Palette 0 entry 0 RGBA',exact=True).fill('#ff3300')
            d.get_by_role('textbox',name='Palette 0 entry 0 RGBA',exact=True).press('Tab')
            d.get_by_role('textbox',name='Palette 0 entry 1 RGBA',exact=True).fill('#0066ff')
            d.get_by_role('textbox',name='Palette 0 entry 1 RGBA',exact=True).press('Tab')
            expect("counterform.doc.glyph('A').colorLayers[1].glyphId===counterform.doc.glyph('O').id && counterform.doc.data.palettes[0][1]==='#0066ff'")
            # Inputs reject invalid color text with a visible error, preserve the source and
            # do not surface an unhandled DOM exception.
            d.get_by_role('textbox',name='Palette 0 entry 0 RGBA',exact=True).fill('not-a-color')
            d.get_by_role('textbox',name='Palette 0 entry 0 RGBA',exact=True).press('Tab')
            browser_expect(page.locator('.cf-toast.error').filter(has_text='colors must')).to_be_visible()
            expect("counterform.doc.data.palettes[0][0]==='#ff3300'")
            js("document.querySelectorAll('.cf-toast').forEach(t=>t.remove())")
            page.screenshot(path=str(out/'color-editor.png'))
            close_dialog()
            activate('glyph')
            js("counterform.renderer.fit();window.proofBeforeColor=counterform.proof.face;counterform.proof.schedule(0)")
            page.wait_for_function('counterform.proof.face!==proofBeforeColor')
            result=js("""async()=>{
                const io=await import('@wieslawsoltes/counterform-font-io');
                const compiled=await counterform.compiler.compile(counterform.doc);
                const directory=io.inspectFont(compiled.bytes);
                const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;
                const ctx=canvas.getContext('2d');ctx.font='250px "'+counterform.proof.family+'"';ctx.fillText('A',30,245);
                let red=0,blue=0;const pixels=ctx.getImageData(0,0,320,320).data;
                for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]>240){if(pixels[i]>220&&pixels[i+1]<90&&pixels[i+2]<50)red++;if(pixels[i]<50&&pixels[i+1]>60&&pixels[i+1]<140&&pixels[i+2]>220)blue++;}}
                return {red,blue,tables:directory.tables.map(t=>t.tag),sceneLayers:counterform.renderer.scene.colorLayers.length};
            }""")
            assert result['red']>100 and result['blue']>100 and result['sceneLayers']==2,result
            assert 'COLR' in result['tables'] and 'CPAL' in result['tables'],result
            report['colorPixels']=result
            page.screenshot(path=str(out/'color-glyph.png'))
            js("while(counterform.history.undoStack.length>colorUndo)counterform.history.undo()")
            expect("!counterform.doc.glyph('A').colorLayers?.length")
        check('color layer editor, transactional RGBA validation, compiled color pixels and undo',color_editor)
        def color_structure():
            js("window.colorUndo=counterform.history.undoStack.length;counterform.showColors()")
            d=page.locator('dialog[open]')
            d.get_by_role('button',name='+ Color layer',exact=True).click()
            d.get_by_role('button',name='+ Color layer',exact=True).click()
            d.get_by_role('combobox',name='Layer 2 glyph',exact=True).select_option(js("counterform.doc.glyph('O').id"))
            d.get_by_role('combobox',name='Layer 2 color',exact=True).select_option('65535')
            d.get_by_title('Move layer 2 backward',exact=True).click()
            expect("counterform.doc.glyph('A').colorLayers[0].glyphId===counterform.doc.glyph('O').id && counterform.doc.glyph('A').colorLayers[0].paletteIndex===65535")
            d.get_by_role('button',name='+ Palette',exact=True).click()
            d.get_by_role('button',name='+ Color entry',exact=True).click()
            expect('counterform.doc.data.palettes.length===2 && counterform.doc.data.palettes.every(p=>p.length===4)')
            d.get_by_role('button',name='Remove palette 1',exact=True).click()
            d.get_by_title('Remove color layer 1',exact=True).click()
            expect("counterform.doc.data.palettes.length===1 && counterform.doc.glyph('A').colorLayers.length===1")
            close_dialog()
            js("while(counterform.history.undoStack.length>colorUndo)counterform.history.undo()")
            expect("!counterform.doc.glyph('A').colorLayers?.length && counterform.doc.data.palettes[0].length===3")
        check('palette duplication, equal-length entries, foreground, layer reorder and removal',color_structure)
        def metrics():
            page.get_by_role('spinbutton',name='Advance',exact=True).fill('712')
            page.get_by_role('spinbutton',name='Advance',exact=True).press('Tab')
            page.wait_for_timeout(100)
            expect('counterform.editor.layer.advanceWidth===712')
            js('counterform.history.undo()')
        check('inspector metric editing participates in history',metrics)
        def authoring_surfaces():
            expect("counterform.commands.commands.size===130 && counterform.menuDefinitions.length===9")
            expect("(()=>{const covered=new Set(counterform.menuDefinitions.flatMap(m=>m.items));return [...counterform.commands.commands.keys()].every(id=>covered.has(id))})()")
            browser_expect(page.locator('.cf-toolrail [data-tool]')).to_have_count(24)
            expect("[...document.querySelectorAll('.cf-toolrail [data-tool]')].every(b=>b.querySelector('svg path'))")
            page.wait_for_function("[...counterform.ribbon.shadowRoot.querySelectorAll('.ribbon-icon img, img')].length>10 && [...counterform.ribbon.shadowRoot.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)")
            report['authoring']=js("async()=>{const i=await import('@wieslawsoltes/counterform-icons');const e=await import('@wieslawsoltes/counterform-editor');return {commands:[...counterform.commands.commands.values()].map(c=>({id:c.id,label:c.label,keys:counterform.commands.bindings.get(c.id),icon:i.commandIcon(c.id)})),menus:counterform.menuDefinitions,tools:e.tools.map(t=>({id:t.id,label:t.label,key:t.key})),iconCount:i.iconNames.length};}")
            page.screenshot(path=str(out/'authoring-workspace.png'))
        check('all 130 commands are available through nine menus and 24 vector tool buttons',authoring_surfaces)
        def menu_keyboard():
            page.keyboard.press('F10')
            expect("document.activeElement.textContent==='File' && document.activeElement.getAttribute('role')==='menuitem'")
            page.keyboard.press('ArrowDown')
            browser_expect(page.locator('.cf-command-menu')).to_be_visible()
            expect("document.activeElement.dataset.command==='file.new'")
            page.keyboard.press('End')
            expect("document.activeElement.dataset.command==='file.demo'")
            page.keyboard.press('ArrowRight')
            expect("counterform.menus.activeIndex===1")
            page.keyboard.press('Escape')
            expect("!counterform.menus.popup && document.activeElement.textContent==='Edit'")
            page.locator('.cf-menubar').get_by_role('menuitem',name='View',exact=True).click()
            page.keyboard.press('t')
            expect("document.activeElement.dataset.command.startsWith('view.')")
            page.keyboard.press('Escape')
            a=coords(280,350);page.mouse.click(a['x'],a['y'],button='right')
            browser_expect(page.locator('.cf-command-menu')).to_be_visible()
            page.screenshot(path=str(out/'glyph-context-menu.png'))
            page.keyboard.press('Escape')
            expect("document.activeElement===counterform.renderer.overlay")
        check('menubar F10, arrows, Home/End, typeahead, Escape and context focus restoration',menu_keyboard)
        def tool_drag(tool,start,end,steps=8):
            js(f"counterform.editor.setTool('{tool}');counterform.renderer.fit()")
            a=coords(*start);b=coords(*end)
            page.mouse.move(a['x'],a['y']);page.mouse.down();page.mouse.move(b['x'],b['y'],steps=steps);page.mouse.up()
        def fixture(kind='rectangle'):
            activate('glyph')
            js(f"async()=>{{const g=await import('@wieslawsoltes/counterform-geometry');counterform.selectGlyph(counterform.doc.glyph('A').id);counterform.editor.layer.contours=[g.{kind}(100,100,280,300)];counterform.editor.layer.anchors=[];counterform.editor.layer.guides=[];counterform.doc.touch('glyph',counterform.editor.glyphId);counterform.editor.clearSelection();counterform.history.clear();counterform.renderer.fit();window.sourceBefore=JSON.stringify(counterform.editor.layer);}}")
            page.wait_for_timeout(60)
        def exact_undo():
            expect("counterform.history.undoStack.length===1 && !counterform.history.active")
            js('counterform.history.undo()')
            expect("JSON.stringify(counterform.editor.layer)===sourceBefore")
        def extended_shape(tool,count,closed=True):
            fixture();tool_drag(tool,(150,180),(300,350))
            expect(f"counterform.editor.layer.contours.length===2 && counterform.editor.layer.contours.at(-1).nodes.length==={count} && counterform.editor.layer.contours.at(-1).closed==={str(closed).lower()}")
            exact_undo()
        check('Line pointer tool creates an undoable open contour',lambda:extended_shape('line',2,False))
        check('Polygon pointer tool creates six real vertices',lambda:extended_shape('polygon',6))
        check('Star pointer tool creates alternating radius geometry',lambda:extended_shape('star',12))
        check('Rounded rectangle pointer tool creates eight cubic tangent nodes',lambda:extended_shape('rounded',8))
        def freehand(tool):
            fixture();js(f"counterform.editor.setTool('{tool}')")
            points=[(140,180),(170,240),(200,270),(240,245),(290,180)]
            a=coords(*points[0]);page.mouse.move(a['x'],a['y']);page.mouse.down()
            for point in points[1:]:
                b=coords(*point);page.mouse.move(b['x'],b['y'],steps=4)
            page.mouse.up()
            expect("counterform.editor.layer.contours.length===2 && counterform.editor.layer.contours.at(-1).nodes.length>3")
            expect(f"counterform.editor.layer.contours.at(-1).closed==={str(tool=='brush').lower()}")
            exact_undo()
        check('Pencil freehand gesture simplifies into editable source',lambda:freehand('pencil'))
        check('Brush gesture creates a filled source outline',lambda:freehand('brush'))
        def knife():
            fixture();tool_drag('knife',(70,250),(420,250))
            expect("counterform.editor.layer.contours.length===2 && counterform.editor.layer.contours.every(c=>c.closed)")
            exact_undo()
        check('Knife pointer tool splits actual contours and undo restores exact source',knife)
        def scissors():
            fixture();js("counterform.editor.setTool('scissors')")
            a=coords(100,250);page.mouse.click(a['x'],a['y'])
            expect("counterform.editor.layer.contours.length===1 && !counterform.editor.layer.contours[0].closed && counterform.editor.layer.contours[0].nodes.length===6")
            exact_undo()
        check('Scissors pointer tool opens an outline at a inserted edge point',scissors)
        def transform_tool(tool):
            fixture();tool_drag(tool,(340,340),(300,270))
            expect("JSON.stringify(counterform.editor.layer)!==sourceBefore")
            exact_undo()
        for transform in ['move','rotate','scale','slant']:
            check(f'{transform.capitalize()} pointer tool transforms source in one transaction',lambda t=transform:transform_tool(t))
        def anchors_guides():
            fixture();tool_drag('anchor',(200,230),(230,290));expect("counterform.editor.layer.anchors.length===1 && counterform.editor.layer.anchors[0].y===290");exact_undo()
            fixture();tool_drag('guide',(140,180),(290,330));expect("counterform.editor.layer.guides.length===1 && Math.abs(counterform.editor.layer.guides[0].angle-45)<.01");exact_undo()
        check('Anchor and Guides pointer tools create undoable attachment geometry',anchors_guides)
        def lasso_zoom():
            fixture();js("counterform.editor.setTool('lasso')")
            points=[(70,80),(125,80),(125,140),(70,140),(70,80)]
            a=coords(*points[0]);page.mouse.move(a['x'],a['y']);page.mouse.down()
            for point in points[1:]:
                b=coords(*point);page.mouse.move(b['x'],b['y'],steps=5)
            page.mouse.up();expect("counterform.editor.selection.size===1 && !counterform.history.canUndo")
            js("window.zoomBefore=counterform.renderer.camera.scale;counterform.editor.setTool('zoom')")
            a=coords(180,250);page.mouse.click(a['x'],a['y']);expect("counterform.renderer.camera.scale>zoomBefore && JSON.stringify(counterform.editor.layer)===sourceBefore")
            js('counterform.renderer.fit()')
        check('Lasso selects enclosed nodes; Zoom changes only the camera',lasso_zoom)
        def cancel_and_lock():
            fixture();js("counterform.editor.setTool('polygon')")
            a=coords(160,160);b=coords(310,300);page.mouse.move(a['x'],a['y']);page.mouse.down();page.mouse.move(b['x'],b['y'],steps=4)
            page.keyboard.press('Escape');page.mouse.up()
            expect("!counterform.history.active && !counterform.history.canUndo && JSON.stringify(counterform.editor.layer)===sourceBefore")
            js("counterform.commands.run('glyph.lock')")
            tool_drag('brush',(150,180),(320,350));expect("counterform.editor.layer.contours.length===1 && counterform.editor.layer.locked")
            js("counterform.commands.run('glyph.lock')")
            expect("!counterform.editor.layer.locked")
        check('Escape rolls back construction and source locks block mutation',cancel_and_lock)
        def undo_during_drag():
            fixture();js("counterform.editor.setTool('line')")
            a=coords(160,160);b=coords(310,300);page.mouse.move(a['x'],a['y']);page.mouse.down();page.mouse.move(b['x'],b['y'],steps=4)
            expect("!!counterform.history.active")
            js("counterform.editor.pointerDown({pointerId:9876,button:0});counterform.editor.pointerUp({pointerId:9876})")
            expect("!!counterform.history.active && !!counterform.editor.drag")
            page.keyboard.press('Control+z');page.mouse.up()
            expect("!counterform.history.active && !counterform.editor.drag && !counterform.history.canUndo && JSON.stringify(counterform.editor.layer)===sourceBefore")
        check('Undo cancels a live gesture; unrelated pointer events cannot finish it',undo_during_drag)
        def surgery_commands():
            fixture();js("counterform.editor.select([counterform.editor.layer.contours[0].nodes[2].id]);window.startId=[...counterform.editor.selection][0];counterform.commands.run('node.start')")
            expect("counterform.editor.layer.contours[0].nodes[0].id===startId");exact_undo()
            fixture();js("counterform.commands.run('outline.open')");expect("!counterform.editor.layer.contours[0].closed")
            js("counterform.editor.select([counterform.editor.layer.contours[0].nodes[0].id,counterform.editor.layer.contours[0].nodes.at(-1).id]);counterform.commands.run('outline.join')")
            expect("counterform.editor.layer.contours[0].closed")
            js("counterform.commands.run('outline.curves')");expect("!!counterform.editor.layer.contours[0].nodes[0].out")
            js("counterform.commands.run('outline.lines')");expect("counterform.editor.layer.contours.every(c=>c.nodes.every(n=>!n.in&&!n.out))")
            js("counterform.editor.selectAll();counterform.commands.run('node.distributeX')")
            expect("counterform.history.undoStack.length>=4")
        check('Start point, open/join, line/cubic conversion and distribution commands edit geometry',surgery_commands)
        def authoring_dialogs():
            js("counterform.commands.run('tool.options')")
            browser_expect(page.locator('dialog[open]')).to_be_visible()
            page.get_by_role('spinbutton',name='Polygon / star points',exact=True).fill('8')
            page.locator('dialog[open]').get_by_role('button',name='Apply',exact=True).click()
            expect("counterform.editor.toolOptions.sides===8")
            js("counterform.commands.run('glyph.guides')")
            page.get_by_role('button',name='Add horizontal guide',exact=True).click()
            page.wait_for_function('counterform.editor.layer.guides.length===1')
            page.get_by_role('spinbutton',name='Y 1',exact=True).fill('345')
            page.get_by_role('spinbutton',name='Y 1',exact=True).press('Tab')
            expect("counterform.editor.layer.guides[0].y===345")
            close_dialog();js("counterform.commands.run('app.toolHelp')")
            browser_expect(page.locator('.cf-tool-description')).to_have_count(24)
            page.screenshot(path=str(out/'tool-reference.png'));close_dialog()
        check('Tool settings, guide table and gesture reference are functional dialogs',authoring_dialogs)
        # Restore the demonstration without changing unrelated kerning or feature fixtures.
        js("async()=>{const m=await import('@wieslawsoltes/counterform-model');counterform.replaceDocument(m.createDemoFont());counterform.editor.setTool('select');counterform.renderer.fit();}")

        def table():
            activate('catalog')
            expect('counterform.table.source.Items.length===102')
            browser_expect(page.locator('tree-data-grid')).to_be_visible(timeout=15000)
            browser_expect(page.locator('tree-data-grid').get_by_role('columnheader',name='Unicode',exact=True)).to_be_visible(timeout=15000)
        check('TreeDataGrid font inventory is live',table)
        def matrix():
            activate('kerning')
            expect('counterform.kerning.workbook.ActiveWorksheet.GetCell(1,2).Value===-85')
            js('counterform.kerning.workbook.ActiveWorksheet.GetCell(1,2).Input=-123')
            page.wait_for_timeout(100)
            expect('counterform.doc.data.kerning[counterform.editor.masterId][JSON.stringify(["A","V"]) ]===-123')
            js('counterform.history.undo()')
            page.wait_for_timeout(60)
            expect('counterform.kerning.workbook.ActiveWorksheet.GetCell(1,2).Value===-85')
        check('GridWeb kerning edit synchronizes source and undo',matrix)
        def feature():
            activate('features')
            js("counterform.featureText.value='feature liga { sub f i by m; } liga;';counterform.applyFeatures()")
            page.wait_for_timeout(550)
            expect('counterform.doc.data.features.includes("sub f i by m") && !!counterform.proof.face')
            js('counterform.history.undo()')
        check('OpenType feature editing recompiles a real proof font',feature)
        def native_import():
            result=js("async()=>{const io=await import('@wieslawsoltes/counterform-font-io');const d=await io.importFont(io.compileOpenTypeCFF(counterform.doc),{skia:counterform.S});return {count:d.data.glyphs.length,contours:d.char('O').layers[0].contours.length}}")
            assert result['count']==102 and result['contours']>0,result
        check('SkiaSharp-compatible CFF import retrieves real outlines',native_import)
        def notes():
            activate('notes')
            js("counterform.notes.element.Text='A production note from the RichTextWeb editor.';counterform.notes.flush()")
            expect("counterform.doc.data.notes.includes('production note') && !!counterform.doc.data.richNotes")
            js('counterform.history.undo()')
        check('RichTextWeb notes persist editable rich-document source',notes)
        def variable():
            activate('glyph');activate('masters')
            js("counterform.location={wght:600};counterform.applyInstancePreview()")
            page.wait_for_timeout(450)
            expect('counterform.editor.readOnly && counterform.proof.variable && counterform.renderer.scene.editable.length===0')
            js("counterform.selectMaster(counterform.doc.data.masters[0].id)")
            expect('!counterform.editor.readOnly && !counterform.proof.variable')
        check('variable instance preview is read-only and reversible',variable)
        def palette():
            page.keyboard.press('Control+Shift+p');page.wait_for_timeout(100)
            assert page.locator('dialog[open]').is_visible()
            assert page.locator('dialog[open]').inner_text().find('Command')>=0
            close_dialog()
        check('command palette keyboard dispatch and focus dialog',palette)
        def dialogs():
            for method in ['showBindings','showValidation','showTables','showExport','showAbout']:
                js(f'counterform.{method}()');page.wait_for_timeout(70)
                assert page.locator('dialog[open]').is_visible(),method
                close_dialog()
        check('shortcuts, validation, tables, export and capability dialogs',dialogs)
        def compute():
            result=js('counterform.verifyCompute()')
            assert result['result']==[75,85,95,105]
            report['compute']=result
        check('compute interface verifies numeric results on selected backend',compute)
        def persist():
            if args.isolated:
                report['storage']='Not qualified: opaque-origin isolated rendering'
                return
            result=js('async()=>{await counterform.store.save(counterform.doc);const data=await counterform.store.load(counterform.doc.data.id);return data.glyphs.length;}')
            assert result==102
            report['storage']='IndexedDB save/load roundtrip passed'
        if args.isolated:
            report['storage']='Not qualified: opaque-origin isolated rendering'
            report['tests'].append({'name':'storage capability qualification','passed':None,'skipped':True,'reason':report['storage']})
            print('SKIP IndexedDB: opaque-origin local-assets mode',flush=True)
        else:
            check('storage capability qualification',persist)
        def theme():
            activate('glyph');activate('inspector')
            js('counterform.toggleTheme()');page.wait_for_timeout(120)
            assert js('counterform.theme')=='dark'
            page.screenshot(path=str(out/'workspace-dark.png'))
            js('counterform.toggleTheme()')
        check('light and dark workspace appearance',theme)
        # Restore source demonstration before the release screenshot.
        js("async()=>{const m=await import('@wieslawsoltes/counterform-model');counterform.replaceDocument(m.createDemoFont());counterform.selectGlyph(counterform.doc.glyph('O').id);counterform.renderer.fit();counterform.editor.select([counterform.editor.layer.contours[0].nodes[0].id]);}")
        page.wait_for_timeout(700)
        js("document.querySelector('.cf-toasts')?.replaceChildren()")
        page.screenshot(path=str(out/'outline-editor.png'))
        check('no unhandled page exceptions',lambda: assert_empty(report['pageErrors']))
        def dispose():
            js('counterform.dispose()')
            page.wait_for_timeout(100)
            expect('!document.querySelector("skia-canvas")')
        check('component lifetime disposes the complete workspace',dispose)
    except Exception:
        traceback.print_exc()
        report['failure']=traceback.format_exc()
        try:
            report['dock']=js("({active:counterform?.dock?.ActiveModel?.ContentId,focused:document.activeElement?.outerHTML,panes:[...document.querySelectorAll('[data-ad-content]')].map(e=>({id:e.dataset.adContent,hidden:e.hidden,width:e.clientWidth,height:e.clientHeight}))})")
            page.screenshot(path=str(out/'failure.png'))
        except Exception as diagnostic_error:
            report['diagnosticError']=str(diagnostic_error)
    finally:
        (out/'browser-report.json').write_text(json.dumps(report,indent=2))
        browser.close()
        if server: server.terminate();server.wait(timeout=5)

if report.get('failure') or report['pageErrors']: raise SystemExit(1)
print(json.dumps(report['environment'],indent=2))
