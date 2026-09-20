import {createBitmapReference,createVectorReference,duplicateReference,referenceContours,referenceBounds,validateArtwork,bytesFromBase64,inspectPNG} from '@wieslawsoltes/counterform-artwork';
import {fitPolyline} from '@wieslawsoltes/counterform-tracing';
import {readSVGOutlines} from '@wieslawsoltes/counterform-svg';
import {GlyphRenderer} from '@wieslawsoltes/counterform-renderer';
import {bounds,uid,transformContours} from '@wieslawsoltes/counterform-geometry';
import {chooseFile,download} from '@wieslawsoltes/counterform-storage';
import {el,button,dialog,field,formDialog} from './ui.js';
const clone=structuredClone;
function owner(app,d){
    const doc=app.doc,glyphId=app.editor.glyphId,masterId=app.editor.masterId,revision=doc.revision,abort=new AbortController();
    const assert=()=>{if(abort.signal.aborted||!d.element.open)throw new DOMException('Artwork editor closed','AbortError');if(app.disposed||app.doc!==doc||doc.revision!==revision||app.editor.glyphId!==glyphId||app.editor.masterId!==masterId||!app.editor.canEdit)throw new Error('Source, glyph or master changed. Reopen the artwork editor.');};
    const dispose=()=>d.close();app.disposables.push(dispose);d.onClose(()=>{abort.abort();const i=app.disposables.indexOf(dispose);if(i>=0)app.disposables.splice(i,1);});
    return {doc,glyphId,masterId,abort,assert};
}
function statusRun(status,signal,fn){return async()=>{try{status.dataset.error='false';await fn();}catch(e){if(e.name!=='AbortError'&&!signal.aborted){status.dataset.error='true';status.textContent=e.message;}}};}
function scene(doc,gid,mid,contours,artwork){return {contours,editable:[],artwork,colorLayers:[],hasColorPaint:false,advanceWidth:doc.layer(gid,mid).advanceWidth,metrics:{...doc.info,...doc.data.masters.find(m=>m.id===mid)?.metrics},anchors:[],guides:[],ghost:[]};}
function place(w,h,cap){const scale=cap/Math.max(1,h);return [scale,0,0,-scale,40,cap];}
function renderer(app,host){
    const r=new GlyphRenderer(host,{S:app.S,backend:'auto'}),ac=new AbortController();let drag=null;
    r.showNodes=false;r.showGrid=false;r.showGuides=false;r.dimFill=false;
    r.fit=()=>{
        const cs=[...r.scene.contours];for(const a of r.scene.artwork||[])if(a.visible){const b=referenceBounds(a);if(!b.empty)cs.push({closed:true,nodes:[{x:b.minX,y:b.minY},{x:b.maxX,y:b.maxY}]});}
        const rect=host.getBoundingClientRect();if(rect.width<100||rect.height<100)return;
        r.camera.fit(cs,rect.width,rect.height,r.scene.advanceWidth,r.scene.metrics.unitsPerEm);r.invalidate();
    };
    r.overlay.setAttribute('aria-label','Artwork preview. Drag to pan; wheel or plus/minus to zoom; Home to fit.');
    r.overlay.style.cursor='grab';r.overlay.addEventListener('wheel',e=>{e.preventDefault();const b=host.getBoundingClientRect();r.camera.zoomAt(Math.exp(-Math.max(-300,Math.min(300,e.deltaY))*.003),{x:e.clientX-b.left,y:e.clientY-b.top});r.invalidate();},{passive:false,signal:ac.signal});
    r.overlay.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};r.overlay.setPointerCapture(e.pointerId);r.overlay.focus();},{signal:ac.signal});
    r.overlay.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;r.camera.x+=e.clientX-drag.x;r.camera.y+=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;r.invalidate();},{signal:ac.signal});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])r.overlay.addEventListener(event,e=>{if(drag?.id===e.pointerId)drag=null;},{signal:ac.signal});
    r.overlay.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();e.stopPropagation();r.fit();}else if(['+','=','-'].includes(e.key)){e.preventDefault();e.stopPropagation();r.camera.zoomAt(e.key==='-'?.8:1.25,{x:host.clientWidth/2,y:host.clientHeight/2});r.invalidate();}},{signal:ac.signal});
    const fit=button('Fit preview',()=>r.fit(),{className:'cf-artwork-fit'});host.append(fit);
    const dispose=r.dispose.bind(r);r.dispose=()=>{ac.abort();drag=null;dispose();};return r;
}
function statusElement(){const s=el('p','cf-workflow-status');s.setAttribute('role','status');s.setAttribute('aria-live','polite');return s;}
export function registerArtworkCommands(app){
    const register=(id,label,execute,requiresSkia=true)=>app.commands.register({id,label,execute,keys:[],repeat:false,enabled:()=>app.editor.canEdit&&(!requiresSkia||!!app.S)});
    register('glyph.artwork','Artwork references and masks',()=>showArtwork(app));
    register('glyph.autotrace','Autotrace bitmap',()=>showArtwork(app,{traceFirst:true}));
    register('glyph.mask','Snapshot outlines to mask',()=>{const cs=app.editor.layer.contours;app.editor.transaction('Snapshot outlines to mask',()=>{(app.editor.layer.artwork??=[]).push(createVectorReference(cs));});},false);
    register('outline.fit','Fit polylines to Bézier curves',()=>showPolylineFit(app),false);
}
export function showPolylineFit(app){
    const doc=app.doc,gid=app.editor.glyphId,mid=app.editor.masterId,revision=doc.revision;
    const cs=app.editor.layer.contours.filter(c=>!app.editor.selection.size||c.nodes.some(n=>app.editor.selection.has(n.id)));
    if(!cs.length)throw new Error('Select one or more polyline contours');
    if(cs.some(c=>c.nodes.some(n=>n.in||n.out)))throw new Error('Fit polylines accepts straight-segment contours. Existing Bézier geometry is not silently flattened.');
    return formDialog('Fit polylines to Bézier curves',[['tolerance','Maximum error (font units)',1,{type:'number',min:0,max:100,step:.1}]],{subtitle:'Fit pencil paths or imported polygons. Every cubic is conservatively bounded against the complete original polyline, not only sample points.',onSubmit:({tolerance})=>{
        if(app.doc!==doc||doc.revision!==revision||app.editor.glyphId!==gid||app.editor.masterId!==mid||!app.editor.canEdit)throw new Error('Source changed; reopen the fitter');
        const replacements=new Map(cs.map(c=>[c.id,fitPolyline(c.nodes,{closed:c.closed,tolerance:Number(tolerance),idPrefix:uid('fit')}).contour]));
        app.editor.transaction('Fit polylines',()=>{app.editor.layer.contours=app.editor.layer.contours.map(c=>replacements.get(c.id)||c);});app.editor.clearSelection();
    }});
}
/** All previews remain private. The host font changes only through Apply. */
export function showArtwork(app,{traceFirst=false,file=null}={}){
    if(!app.S)throw new Error('Artwork requires native Skia image/path decoding');
    const d=dialog('Artwork references and masks',{wide:true,className:'cf-artwork-dialog',subtitle:'Per-master PNG images and editable vector masks. References never enter the compiled font. Changes and traced outlines apply together in one undo transaction.'});
    const o=owner(app,d),l=o.doc.layer(o.glyphId,o.masterId),draft=clone(l.artwork||[]);let selected=draft[0]?.id,foreground=clone(l.contours),busy=false,child=null;
    const layout=el('div','cf-artwork-layout'),sidebar=el('div','cf-artwork-sidebar'),list=el('div','cf-artwork-list'),properties=el('div','cf-artwork-properties'),viewport=el('div','cf-artwork-preview'),status=statusElement();
    list.setAttribute('role','listbox');list.setAttribute('aria-label','Artwork layers');const view=renderer(app,viewport);d.onClose(()=>{child?.close();view.dispose();});
    const run=fn=>statusRun(status,o.abort.signal,fn);const current=()=>draft.find(r=>r.id===selected);
    function unlocked(){o.assert();const r=current();if(!r)throw new Error('Select artwork');if(r.locked)throw new Error('Unlock this artwork first');return r;}
    function preview(){view.setScene(scene(o.doc,o.glyphId,o.masterId,foreground,draft));view.fit();}
    function summary(){status.dataset.error='false';status.textContent=`${draft.length} reference layers · ${foreground.length} foreground contours · draft only`+(traceFirst?' · Select a bitmap and choose Autotrace selected.':'');}
    function changed(){validateArtwork(draft);render();preview();summary();}
    function edit(fn){const before=clone(draft),oldForeground=clone(foreground),oldSelected=selected;try{fn();validateArtwork(draft);changed();}catch(e){draft.splice(0,draft.length,...before);foreground=oldForeground;selected=oldSelected;render();preview();throw e;}}
    function render(){
        list.replaceChildren();for(const r of draft){const b=button(`${r.kind==='bitmap'?'PNG':'Mask'} · ${r.name}`,()=>{selected=r.id;render();});b.setAttribute('role','option');b.setAttribute('aria-selected',String(r.id===selected));b.tabIndex=r.id===selected?0:-1;b.dataset.artworkId=r.id;list.append(b);}
        properties.replaceChildren();const r=current();if(!r){properties.append(el('p','cf-muted','Import a PNG or SVG, or take a snapshot of the foreground outlines.'));return;}
        const name=field('Artwork name',r.name),opacity=field('Opacity',r.opacity,{type:'number',min:0,max:1,step:.05}),visible=field('Visibility',r.visible?'on':'off',{options:[{value:'on',label:'Visible'},{value:'off',label:'Hidden'}]}),locked=field('Editing lock',r.locked?'on':'off',{options:[{value:'off',label:'Unlocked'},{value:'on',label:'Locked'}]});
        for(const [f,key,convert]of [[name,'name',v=>v],[opacity,'opacity',Number],[visible,'visible',v=>v==='on'],[locked,'locked',v=>v==='on']]){f.input.disabled=r.locked&&!['locked','visible'].includes(key);f.input.addEventListener('change',run(()=>{o.assert();edit(()=>r[key]=key==='opacity'?f.input.valueAsNumber:convert(f.input.value));}));properties.append(f.element);}
        const matrix=el('div','cf-artwork-matrix');['Scale X','Shear Y','Shear X','Scale Y','Position X','Position Y'].forEach((name,i)=>{const f=field(name,r.transform[i],{type:'number',step:i<4?.05:1});f.input.disabled=r.locked;f.input.addEventListener('change',run(()=>{unlocked();edit(()=>r.transform[i]=f.input.valueAsNumber);}));matrix.append(f.element);});properties.append(matrix);
        const action=(name,fn,enabled=true)=>{const b=button(name,run(fn));b.disabled=!enabled||busy;return b;};
        properties.append(action('Duplicate artwork',()=>edit(()=>{const copy=duplicateReference(r);copy.locked=false;draft.push(copy);selected=copy.id;})),action('Remove artwork',()=>{unlocked();edit(()=>{const i=draft.indexOf(r);draft.splice(i,1);selected=draft[Math.min(i,draft.length-1)]?.id;});},!r.locked));
        const index=draft.indexOf(r);for(const [name,offset]of [['Move backward',-1],['Move forward',1]])properties.append(action(name,()=>{unlocked();edit(()=>{draft.splice(index,1);draft.splice(index+offset,0,r);});},!r.locked&&index+offset>=0&&index+offset<draft.length));
        if(r.kind==='bitmap')properties.append(action('Autotrace selected',()=>{unlocked();child=showAutotrace(app,r,{assertParent:o.assert,onApply:(cs,replace)=>{o.assert();foreground=replace?cs:[...foreground,...cs];changed();}});},!r.locked),action('Download original PNG',()=>download(bytesFromBase64(r.png),r.name.toLowerCase().endsWith('.png')?r.name:r.name+'.png','image/png')));
        else{
            properties.append(action('Insert mask outlines',()=>{unlocked();foreground.push(...referenceContours(r));changed();},!r.locked));
            properties.append(action('Exchange with foreground',()=>{unlocked();edit(()=>{const old=foreground;foreground=referenceContours(r);r.contours=old;r.transform=[1,0,0,1,0,0];});},!r.locked));
        }
    }
    async function importReference(kind,suppliedFile=null){
        o.assert();if(busy)return;busy=true;
        try{const file=suppliedFile??await chooseFile({accept:kind==='bitmap'?'.png':'.svg'});if(!file)return;o.assert();if(file.size>16*1024*1024)throw new RangeError('Artwork file exceeds 16 MiB');let r,warnings=[];
            if(kind==='bitmap'){const bytes=new Uint8Array(await file.arrayBuffer());o.assert();const info=inspectPNG(bytes),image=app.S.SKImage.FromEncodedData(bytes);if(!image)throw new Error('Skia rejected the PNG image');image.Dispose();r=createBitmapReference(bytes,{name:file.name,transform:place(info.width,info.height,o.doc.info.capHeight)});}
            else{const result=readSVGOutlines(await file.text());o.assert();const b=bounds(result.contours),m=place(b.width,b.height,o.doc.info.capHeight);m[4]-=b.minX*m[0];m[5]+=b.minY*m[0];r=createVectorReference(result.contours,{name:file.name,transform:m});warnings=result.warnings;}
            edit(()=>{draft.push(r);selected=r.id;});if(warnings.length)status.textContent+=' · '+warnings.join(' ');if(traceFirst&&kind==='bitmap'){traceFirst=false;child=showAutotrace(app,r,{assertParent:o.assert,onApply:(cs,replace)=>{o.assert();foreground=replace?cs:[...foreground,...cs];changed();}});}
        }finally{busy=false;if(!o.abort.signal.aborted)render();}
    }
    list.addEventListener('keydown',e=>{const index=draft.findIndex(r=>r.id===selected),next=e.key==='Home'?0:e.key==='End'?draft.length-1:e.key==='ArrowDown'?Math.min(index+1,draft.length-1):e.key==='ArrowUp'?Math.max(0,index-1):-1;if(next>=0&&draft[next]){e.preventDefault();selected=draft[next].id;render();list.querySelector('[aria-selected="true"]')?.focus();}},{signal:o.abort.signal});
    const toolbar=el('div','cf-workflow-toolbar');toolbar.append(button('Import PNG reference',run(()=>importReference('bitmap'))),button('Import SVG mask',run(()=>importReference('vector'))),button('Snapshot foreground',run(()=>{o.assert();edit(()=>{const r=createVectorReference(foreground);draft.push(r);selected=r.id;});})));
    sidebar.append(toolbar,list);layout.append(sidebar,viewport,properties);d.body.append(layout,status);
    d.footer.append(button('Cancel',d.close),button('Apply artwork',run(()=>{o.assert();if(busy)throw new Error('An image import is still pending');validateArtwork(draft);app.history.execute('Apply artwork and traced outlines',()=>{const layer=o.doc.layer(o.glyphId,o.masterId);if(draft.length)layer.artwork=clone(draft);else delete layer.artwork;layer.contours=clone(foreground);},o.glyphId);app.editor.clearSelection();d.close();}),{className:'primary'}));
    changed();if(file)run(()=>importReference('bitmap',file))();if(traceFirst&&current()?.kind==='bitmap'){traceFirst=false;child=showAutotrace(app,current(),{assertParent:o.assert,onApply:(cs,replace)=>{o.assert();foreground=replace?cs:[...foreground,...cs];changed();}});}return d;
}
/** Pixel classification and curve fitting execute through the owned worker queue. */
export function showAutotrace(app,reference,{assertParent=()=>{},onApply}={}){
    validateArtwork([reference]);if(reference.kind!=='bitmap')throw new TypeError('Select a PNG bitmap to trace');
    const d=dialog('Autotrace bitmap',{wide:true,className:'cf-artwork-dialog',subtitle:'Threshold the image, remove small connected ink regions, and optionally fit Bézier curves. Preview is private; Use outlines returns to the artwork draft.'}),o=owner(app,d),key=uid('trace');
    const status=statusElement(),controls=el('div','cf-artwork-properties'),viewport=el('div','cf-artwork-preview'),layout=el('div','cf-trace-layout'),view=renderer(app,viewport);
    let generation=0,result=null,busy=false,pixels;
    d.onClose(()=>{generation++;app.compiler.cancelKey(key);pixels=null;result=null;view.dispose();});
    try {
    const image=app.S.SKImage.FromEncodedData(bytesFromBase64(reference.png));if(!image){d.close();throw new Error('Skia rejected the selected PNG');}
    try{const color=app.S.SKColorSpace.CreateSrgb();try{pixels=image.ReadPixels(new app.S.SKImageInfo(reference.width,reference.height,app.S.SKColorType.Rgba8888,app.S.SKAlphaType.Unpremul,color));}finally{color.Dispose();}}finally{image.Dispose();}
    if(!pixels)throw new Error('Skia pixel readback failed');
    } catch(error) { d.close(); throw error; }
    const threshold=field('Threshold mode','auto',{options:[{value:'auto',label:'Automatic histogram threshold'},{value:'manual',label:'Manual threshold'}]}),level=field('Threshold',127,{type:'number',min:0,max:255,step:1}),invert=field('Ink polarity','dark',{options:[{value:'dark',label:'Dark ink on white'},{value:'light',label:'Light ink on dark'}]}),specks=field('Minimum ink component (pixels)',2,{type:'number',min:0,max:100000,step:1}),curves=field('Outline mode','polygon',{options:[{value:'polygon',label:'Exact pixel boundaries'},{value:'curves',label:'Fitted Bézier curves'}]}),error=field('Maximum fitting error (pixels)',.35,{type:'number',min:0,max:8,step:.05}),target=field('Foreground operation','append',{options:[{value:'append',label:'Append traced outlines'},{value:'replace',label:'Replace foreground contours'}]});
    const overlay=clone(reference);overlay.opacity=.3;overlay.visible=true;
    function preview(){const cs=result?transformContours(clone(result.contours),reference.transform):[];view.setScene(scene(o.doc,o.glyphId,o.masterId,cs,[overlay]));view.showFill=false;view.scene.editable=cs;view.fit();}
    function invalidate(){generation++;app.compiler.cancelKey(key);result=null;use.disabled=true;delete viewport.dataset.traceReady;preview();}
    const run=fn=>statusRun(status,o.abort.signal,fn),use=button('Use traced outlines',run(()=>{o.assert();assertParent();if(!result||busy)throw new Error('Build the trace preview first');const cs=transformContours(clone(result.contours),reference.transform);onApply?.(cs,target.input.value==='replace');d.close();}),{className:'primary'});use.disabled=true;
    const build=button('Preview trace',run(async()=>{o.assert();assertParent();invalidate();const ticket=generation;busy=true;build.disabled=true;status.textContent=`Tracing through ${app.compiler.backend}…`;
        try{const r=await app.compiler.trace({width:reference.width,height:reference.height,pixels},{threshold:threshold.input.value==='auto'?null:level.input.valueAsNumber,invert:invert.input.value==='light',minComponentPixels:specks.input.valueAsNumber,curves:curves.input.value==='curves',tolerance:error.input.valueAsNumber,idPrefix:key},{key,signal:o.abort.signal,priority:1});if(ticket!==generation||o.abort.signal.aborted)return;o.assert();assertParent();result=r;preview();viewport.dataset.traceReady='true';status.textContent=`${r.contours.length} contours · ${r.holes} holes · ${r.pointCount} nodes · threshold ${r.threshold} · ${r.removedPixels} speck pixels removed · continuous error ≤ ${r.errorBound.toFixed(4)} px`+(r.warnings.length?' · '+r.warnings.join(' '):'');use.disabled=!r.contours.length;
        }finally{busy=false;if(!o.abort.signal.aborted)build.disabled=false;}
    }));
    for(const f of [threshold,level,invert,specks,curves,error]){f.input.addEventListener('change',()=>{invalidate();status.textContent='Settings changed. Rebuild the trace preview.';},{signal:o.abort.signal});controls.append(f.element);}controls.append(target.element,build);
    layout.append(viewport,controls);d.body.append(layout,status);d.footer.append(button('Cancel',d.close),use);
    preview();return d;
}
