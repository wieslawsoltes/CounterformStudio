"""Shared COLRv1 interaction and compiled-pixel checks for source/distribution CI."""
def qualify_color(page,js,expect,check,out,report):
    from playwright.sync_api import expect as visible
    def modal():return page.locator('dialog.cf-paint-dialog[open]')
    def wait_preview():page.wait_for_function("document.querySelector('.cf-paint-preview')?.dataset.ready==='true' && Number(document.querySelector('.cf-paint-preview').dataset.revision)===counterform.doc.revision")
    def set_number(name,value):
        f=modal().get_by_role('spinbutton',name=name,exact=True);f.fill(str(value));f.press('Tab')
    def source():return js("JSON.stringify(counterform.doc.glyph('A').colorPaint)")
    def start():
        js("counterform.selectGlyph(counterform.doc.glyph('A').id);window.paintUndo=counterform.history.undoStack.length;window.paintOutline=JSON.stringify(counterform.editor.layer.contours);counterform.history.execute('Proof palette',()=>counterform.doc.data.palettes[0]=['#ff0000','#0000ff','#00cc44']);counterform.commands.run('color.paint')")
        modal().get_by_role('button',name='Create linear gradient',exact=True).click();wait_preview()
        expect("counterform.doc.glyph('A').colorPaint.paint.type==='linear' && JSON.stringify(counterform.editor.layer.contours)===paintOutline")
        result=js("""()=>{
            const text=document.querySelector('.cf-paint-proof'),canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;const c=canvas.getContext('2d');c.font='400px '+text.style.fontFamily;c.fillText(String.fromCodePoint(0xf0000),40,350);
            const b=c.getImageData(0,0,400,400).data;let red=0,blue=0,mixed=0;
            for(let i=0;i<b.length;i+=4)if(b[i+3]>240){if(b[i]>150&&b[i+2]<100)red++;if(b[i+2]>150&&b[i]<100)blue++;if(b[i]>80&&b[i+2]>80)mixed++;}
            return {red,blue,mixed};}""")
        assert min(result.values())>100,result
        report['colrv1Pixels']=result;page.screenshot(path=str(out/'color-paint-graph.png'))
    check('COLRv1 graph editor creates real compiled red-to-blue gradient pixels without changing outlines',start)
    def native():
        page.wait_for_function("!!counterform.renderer.currentColorFont()",timeout=20000)
        result=js("""()=>{const r=counterform.renderer,S=counterform.S,w=r.host.clientWidth,h=r.host.clientHeight,s=S.SKSurface.Create(new S.SKImageInfo(w,h));let image;try{r.paintNative({Canvas:s.Canvas,Info:{Width:w},Surface:s});image=s.Snapshot();const b=image.ReadPixels(new S.SKImageInfo(w,h,S.SKColorType.Rgba8888,S.SKAlphaType.Unpremul));let red=0,blue=0,mixed=0;for(let i=0;i<b.length;i+=4)if(b[i+3]>240){if(b[i]>150&&b[i+2]<100)red++;if(b[i+2]>150&&b[i]<100)blue++;if(b[i]>80&&b[i+2]>80&&b[i+1]<20)mixed++;}return {red,blue,mixed};}finally{image?.Dispose();s.Dispose();}}""")
        assert min(result.values())>100,result
        report['colrv1NativePixels']=result
        expect("counterform.renderer.native.dataset.colorPaint==='compiled'")
    check('editor native Skia DrawGlyphs renders actual COLRv1 artwork, not only the HTML proof',native)
    def stop_edits():
        before=source();set_number('Stop 1 alpha','.5');expect("counterform.doc.glyph('A').colorPaint.paint.stops[0].alpha===.5")
        modal().get_by_role('button',name='Undo',exact=True).click();assert source()==before
        modal().get_by_role('button',name='Redo',exact=True).click();expect("counterform.doc.glyph('A').colorPaint.paint.stops[0].alpha===.5")
        before=source();set_number('Stop 1 alpha','5');assert source()==before
        visible(modal().get_by_role('alert')).to_contain_text('alpha must')
        modal().get_by_role('button',name='Add gradient stop',exact=True).click()
        expect("counterform.doc.glyph('A').colorPaint.paint.stops.length===3")
        modal().get_by_role('button',name='Sort stops',exact=True).click();expect("counterform.doc.glyph('A').colorPaint.paint.stops[1].offset===.5")
        modal().get_by_title('Remove stop 2',exact=True).click();expect("counterform.doc.glyph('A').colorPaint.paint.stops.length===2")
    check('gradient stop insertion, sorting, removal, alpha editing and invalid-input rollback are undoable',stop_edits)
    def tree_and_transform():
        tree=modal().get_by_role('tree',name='Color paint nodes');tree.locator('[aria-selected=true]').focus();page.keyboard.press('Home');page.keyboard.press('ArrowRight')
        expect("document.activeElement.dataset.path==='[\"paint\"]'")
        page.keyboard.press('ArrowLeft');expect("document.activeElement.dataset.path==='[]'")
        modal().get_by_role('combobox',name='New paint type').select_option('translate');modal().get_by_role('button',name='Wrap selected',exact=True).click()
        set_number('Dx',48);expect("counterform.doc.glyph('A').colorPaint.type==='translate' && counterform.doc.glyph('A').colorPaint.dx===48")
        tree.locator('[aria-selected=true]').focus();page.keyboard.press('ArrowRight');page.keyboard.press('ArrowLeft');page.keyboard.press('ArrowLeft');expect("document.activeElement.dataset.path==='[]'")
        modal().get_by_role('combobox',name='New paint type').select_option('composite');modal().get_by_role('button',name='Wrap selected',exact=True).click()
        modal().get_by_role('combobox',name='Composite mode').select_option('multiply');expect("counterform.doc.glyph('A').colorPaint.mode==='multiply'")
        wait_preview();page.screenshot(path=str(out/'color-paint-composite.png'))
    check('paint tree keyboard navigation, transform wrapping and composite mode editing update compiled source',tree_and_transform)
    def gradients():
        modal().get_by_role('button',name='Graph JSON…',exact=True).click()
        json_dialog=page.locator('dialog[open]').last
        gid=js("counterform.doc.glyph('A').id")
        import json
        graph={'type':'glyph','glyphId':gid,'paint':{'type':'linear','x0':0,'y0':0,'x1':600,'y1':0,'x2':0,'y2':700,'stops':[{'offset':0,'paletteIndex':0},{'offset':1,'paletteIndex':1}]}}
        json_dialog.get_by_role('textbox',name='Paint graph JSON').fill(json.dumps(graph));json_dialog.get_by_role('button',name='Apply graph',exact=True).click()
        tree=modal().get_by_role('tree');tree.locator('[aria-selected=true]').focus();page.keyboard.press('ArrowRight')
        for kind in ['radial','sweep']:
            modal().get_by_role('combobox',name='New paint type').select_option(kind);modal().get_by_role('button',name='Replace selected',exact=True).click();wait_preview()
            expect(f"counterform.doc.glyph('A').colorPaint.paint.type==='{kind}'")
        modal().get_by_role('combobox',name='Gradient extension').select_option('reflect');wait_preview()
        page.screenshot(path=str(out/'color-paint-sweep.png'))
        # JSON validation is not eval; invalid cyclic glyph reference rolls back visibly.
        before=source();modal().get_by_role('button',name='Graph JSON…',exact=True).click();jd=page.locator('dialog[open]').last
        jd.get_by_role('textbox',name='Paint graph JSON').fill(json.dumps({'type':'colrGlyph','glyphId':gid}));jd.get_by_role('button',name='Apply graph',exact=True).click()
        visible(jd.get_by_role('alert')).to_contain_text('cyclic');assert source()==before;jd.get_by_role('button',name='Cancel',exact=True).click()
    check('linear, radial and sweep paint replacement, extension modes and graph-JSON validation work through UI',gradients)
    def metadata():
        modal().get_by_role('button',name='Palettes…',exact=True).click();d=page.locator('dialog[open]').last
        d.get_by_role('textbox',name='Palette 0 name',exact=True).fill('Day');d.get_by_role('textbox',name='Palette 0 name',exact=True).press('Tab')
        d.get_by_role('textbox',name='Entry 0 name',exact=True).fill('Warm');d.get_by_role('textbox',name='Entry 0 name',exact=True).press('Tab')
        d.get_by_role('combobox',name='Palette 0 background',exact=True).select_option('1')
        d.get_by_role('button',name='+ Palette',exact=True).click();d.get_by_role('button',name='+ Color entry',exact=True).click()
        expect("counterform.doc.data.paletteLabels.length===2 && counterform.doc.data.paletteTypes.length===2 && counterform.doc.data.paletteEntryLabels.length===4")
        d.get_by_role('button',name='Remove palette 1',exact=True).click();expect("counterform.doc.data.paletteLabels.length===1 && counterform.doc.data.paletteTypes[0]===1 && counterform.doc.data.paletteEntryLabels[0]==='Warm'")
        d.get_by_role('button',name='Close',exact=True).click();wait_preview()
        result=js("""async()=>{const results=[];for(const format of ['ttf','otf','variable','cff2','variable-cff2','woff2','variable-woff2','cff2-woff2']){const {bytes}=await counterform.compiler.compile(counterform.doc,{format});const f=await new FontFace('CFColorExport',bytes).load();results.push({format,status:f.status});}return results;}""")
        assert all(r['status']=='loaded' for r in result),result
        report['colrv1Exports']=result
    check('CPALv1 metadata survives palette structure changes and eight exports load through the browser sanitizer',metadata)
    def lifecycle():
        for i in range(3):
            modal().get_by_role('button',name='Done',exact=True).click()
            page.wait_for_function("[...document.fonts].every(f=>!f.family.startsWith('CounterformPaint'))")
            js("counterform.showPaints()")
        modal().get_by_role('button',name='Done',exact=True).click()
        js("while(counterform.history.undoStack.length>paintUndo)counterform.history.undo()")
        expect("!counterform.doc.glyph('A').colorPaint && !counterform.doc.data.paletteLabels && JSON.stringify(counterform.editor.layer.contours)===paintOutline")
        page.wait_for_function("!counterform.renderer.colorFont",timeout=20000)
    check('closing paint editors cancels jobs, removes FontFaces and complete undo restores exact source',lifecycle)
