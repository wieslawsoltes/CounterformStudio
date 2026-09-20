import {createBitmapGlyph,validateBitmapSource,BITMAP_LIMITS} from '@wieslawsoltes/counterform-bitmap';
import {bytesFromBase64,inspectPNG} from '@wieslawsoltes/counterform-artwork';
import {makePath} from '@wieslawsoltes/counterform-renderer';
import {bounds,uid} from '@wieslawsoltes/counterform-geometry';
import {chooseFile,download} from '@wieslawsoltes/counterform-storage';
import {el,button,dialog,field} from './ui.js';

export function registerBitmapCommands(app){
    app.commands.register({id:'color.bitmap',label:'Bitmap color strikes',keys:[],repeat:false,
        enabled:()=>app.editor.canEdit&&!!app.S,execute:()=>showBitmapStrikes(app)});
}
/** Font-level strike settings and per-glyph images are staged together. No preview
 * mapping, native resource or asynchronously loaded font escapes this dialog. */
export function showBitmapStrikes(app){
    if(!app.S||!app.editor.canEdit)throw new Error('An editable source master and Skia are required');
    const doc=app.doc,gid=app.editor.glyphId,mid=app.editor.masterId,revision=doc.revision;
    let draft=structuredClone(doc.data),selected=draft.bitmapFont?.strikes[0]?.id,generation=0,face=null,busy=false;
    draft.bitmapFont??={format:'sbix',overlay:false,strikes:[]};
    const key=uid('bitmap-proof'),abort=new AbortController();
    const d=dialog('Bitmap color strikes',{wide:true,className:'cf-bitmap-dialog',subtitle:'PNG artwork embedded in the exported font. Strike pixels stay fixed; outline masters remain editable. Apply commits the complete bitmap draft in one undo step.'});
    const layout=el('div','cf-bitmap-layout'),sidebar=el('section','cf-bitmap-sidebar'),properties=el('section','cf-bitmap-properties'),preview=el('section','cf-bitmap-preview');
    const list=el('div','cf-bitmap-list'),status=el('p','cf-workflow-status');
    list.setAttribute('role','listbox');list.setAttribute('aria-label','Bitmap strikes');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const proof=el('div','cf-bitmap-proof',String.fromCodePoint(0xf0000));proof.setAttribute('aria-label','Compiled bitmap glyph');proof.dataset.ready='false';
    const image=el('img','cf-bitmap-source');image.alt='Selected source PNG';image.hidden=true;
    const proofNote=el('p','cf-muted','Compile to preview the actual exported glyph. No fallback font is presented as a successful bitmap preview.');
    const proofFormat=field('Preview format','sbix',{options:[{value:'sbix',label:'sbix (PNG)'},{value:'cbdt',label:'CBDT / CBLC (PNG)'}]});
    const zoom=field('Preview scale','2',{options:['1','2','4']});
    const assert=()=>{
        if(abort.signal.aborted||!d.element.open)throw new DOMException('Bitmap editor closed','AbortError');
        if(app.disposed||app.doc!==doc||doc.revision!==revision||app.editor.glyphId!==gid||app.editor.masterId!==mid||!app.editor.canEdit)throw new Error('Source, glyph or master changed. Reopen Bitmap color strikes.');
    };
    const run=fn=>async()=>{try{assert();status.dataset.error='false';await fn();}catch(error){if(error.name!=='AbortError'&&!abort.signal.aborted){status.dataset.error='true';status.textContent=error.message;}}};
    const close=()=>d.close();app.disposables.push(close);
    function clearProof(){generation++;app.compiler.cancelKey(key);if(face){document.fonts.delete(face);face=null;}proof.style.fontFamily='';proof.style.visibility='hidden';proof.dataset.ready='false';}
    d.onClose(()=>{abort.abort();clearProof();const i=app.disposables.indexOf(close);if(i>=0)app.disposables.splice(i,1);draft=null;image.removeAttribute('src');});
    const glyph=()=>draft.glyphs.find(g=>g.id===gid),strike=()=>draft.bitmapFont.strikes.find(s=>s.id===selected),entry=()=>glyph().bitmaps?.find(e=>e.strikeId===selected);
    function summary(){const v=validateBitmapSource(draft);status.textContent=`${draft.bitmapFont.strikes.length} strikes · ${v.entries} font-wide bitmaps · ${(v.bytes/1024).toFixed(1)} KiB PNG data · draft only`;}
    function edit(fn){assert();if(busy)throw new Error('An image import is pending');const before=structuredClone(draft),oldSelected=selected;try{fn();validateBitmapSource(draft);}catch(error){draft=before;selected=oldSelected;render();throw error;}clearProof();render();summary();}
    function setImage(bytes,options={}){edit(()=>{const s=strike();if(!s)throw new Error('Add a strike first');const e=createBitmapGlyph(s.id,bytes,options);const g=glyph();g.bitmaps=(g.bitmaps||[]).filter(x=>x.strikeId!==s.id);g.bitmaps.push(e);});}
    async function importPNG(){
        if(busy)return;const targetStrike=selected;busy=true;
        try{const file=await chooseFile({accept:'.png'});assert();if(!file)return;if(file.size>16*1024*1024)throw new RangeError('PNG exceeds 16 MiB');const bytes=new Uint8Array(await file.arrayBuffer());assert();
            const native=app.S.SKImage.FromEncodedData(bytes);if(!native)throw new Error('Skia rejected this PNG');native.Dispose();if(selected!==targetStrike)throw new Error('Selected strike changed during PNG import. Import again.');busy=false;setImage(bytes);
        }finally{busy=false;}
    }
    function rasterize(){
        const s=strike();if(!s)throw new Error('Add a strike first');
        const cs=doc.resolve(gid,mid),b=bounds(cs);if(b.empty)throw new Error('This glyph has no outline geometry to rasterize');
        const scale=s.ppem/doc.info.unitsPerEm,left=Math.floor(b.minX*scale)-1,top=Math.ceil(b.maxY*scale)+1,right=Math.ceil(b.maxX*scale)+1,bottom=Math.floor(b.minY*scale)-1;
        const width=right-left,height=top-bottom;
        if(width<1||height<1||width*height>16*1024*1024||width>4096||height>4096)throw new RangeError('Rasterization dimensions exceed the image budget');
        const S=app.S,surface=S.SKSurface.Create(new S.SKImageInfo(width,height));if(!surface)throw new Error('Skia could not allocate the bitmap surface');
        let path,paint,snapshot,encoded;
        try{const c=surface.Canvas;c.Clear(S.SKColors.Transparent);c.Translate(-left,top);c.Scale(scale,-scale);path=makePath(S,cs);paint=new S.SKPaint();paint.IsAntialias=true;paint.Color=S.SKColor.Parse(ink.input.value);paint.Style=S.SKPaintStyle.Fill;c.DrawPath(path,paint);snapshot=surface.Snapshot();encoded=snapshot.Encode('Png',100);if(!encoded)throw new Error('PNG encoding failed');setImage(encoded.ToArray(),{x:left,y:bottom});}
        finally{encoded?.Dispose();snapshot?.Dispose();paint?.Dispose();path?.Dispose();surface.Dispose();}
    }
    const ink=field('Rasterization color','#357bf5',{type:'color'});
    function input(label,value,options,change,parent=properties){const f=field(label,value,options);f.input.addEventListener('change',run(()=>edit(()=>change(f.input.type==='number'?f.input.valueAsNumber:f.input.value))),{signal:abort.signal});parent.append(f.element);return f;}
    const format=field('Export tables',draft.bitmapFont.format,{options:[{value:'sbix',label:'Apple sbix'},{value:'cbdt',label:'OpenType CBDT / CBLC'},{value:'both',label:'Both bitmap table families'}]});
    format.input.addEventListener('change',run(()=>edit(()=>{draft.bitmapFont.format=format.input.value;if(format.input.value!=='sbix')draft.bitmapFont.overlay=false;})),{signal:abort.signal});
    const addPpem=field('New strike PPEM',64,{type:'number',min:1,max:65535,step:1}),addPpi=field('New strike PPI',72,{type:'number',min:1,max:65535,step:1});
    sidebar.append(el('h3','','Font strikes'),format.element,list,addPpem.element,addPpi.element,button('Add strike',run(()=>edit(()=>{
        if(draft.bitmapFont.strikes.length>=BITMAP_LIMITS.strikes)throw new RangeError('Strike limit reached');
        const s={id:uid('strike'),ppem:addPpem.input.valueAsNumber,ppi:addPpi.input.valueAsNumber};draft.bitmapFont.strikes.push(s);selected=s.id;
    }))));
    async function compileProof(){
        assert();if(busy)throw new Error('An image import is pending');const s=strike();if(!s||!entry())throw new Error('Add a PNG for the selected glyph and strike');
        clearProof();const ticket=generation,data=structuredClone(draft),family=`CFBitmap-${key}-${ticket}`;
        data.bitmapFont.format=proofFormat.input.value;data.bitmapFont.overlay=false;
        // Compile precisely the selected strike. Competing color formats and the
        // private PUA character cannot mask a bitmap decoder failure.
        data.bitmapFont.strikes=[structuredClone(s)];
        for(const g of data.glyphs){g.bitmaps=(g.bitmaps||[]).filter(e=>e.strikeId===s.id);g.unicodes=g.unicodes.filter(cp=>cp!==0xf0000);delete g.colorPaint;delete g.colorClip;g.colorLayers=[];}
        data.glyphs.find(g=>g.id===gid).unicodes=[0xf0000];data.features='';data.featureVariations=[];
        validateBitmapSource(data);status.textContent=`Compiling ${proofFormat.input.value} through ${app.compiler.backend}…`;
        const {bytes}=await app.compiler.compile(data,{format:'ttf',masterId:mid},{key,signal:abort.signal,priority:5});
        if(abort.signal.aborted||ticket!==generation)return;assert();
        const next=await new FontFace(family,bytes).load();
        if(abort.signal.aborted||ticket!==generation)return;assert();
        face=next;document.fonts.add(next);proof.style.fontFamily=`"${family}"`;proof.style.fontSize=`${s.ppem}px`;proof.style.transform=`scale(${zoom.input.value})`;proof.style.visibility='visible';proof.dataset.ready='true';proof.dataset.format=data.bitmapFont.format;
        proofNote.textContent=`Actual ${data.bitmapFont.format} font · ${s.ppem} PPEM × ${zoom.input.value} preview scale · ${bytes.byteLength.toLocaleString()} bytes`;
        summary();
    }
    proofFormat.input.addEventListener('change',clearProof,{signal:abort.signal});
    zoom.input.addEventListener('change',()=>{proof.style.transform=`scale(${zoom.input.value})`;if(face)proofNote.textContent=`Actual ${proof.dataset.format} font · ${strike().ppem} PPEM × ${zoom.input.value} preview scale`;},{signal:abort.signal});
    function render(){
        format.input.value=draft.bitmapFont.format;list.replaceChildren();
        const ordered=[...draft.bitmapFont.strikes].sort((a,b)=>a.ppem-b.ppem||a.ppi-b.ppi);
        for(const s of ordered){const count=draft.glyphs.filter(g=>g.bitmaps?.some(e=>e.strikeId===s.id)).length,b=button(`${s.ppem} px · ${s.ppi} ppi · ${count} glyphs`,run(()=>{if(busy)throw new Error('An image import is pending');selected=s.id;clearProof();render();}));b.setAttribute('role','option');b.setAttribute('aria-selected',String(s.id===selected));b.tabIndex=s.id===selected?0:-1;b.dataset.strikeId=s.id;list.append(b);}
        properties.replaceChildren(el('h3','',`${glyph().name} · bitmap properties`));const s=strike(),e=entry();
        image.hidden=!e;if(e){const bytes=bytesFromBase64(e.png),info=inspectPNG(bytes);image.src='data:image/png;base64,'+e.png;image.width=info.width;image.height=info.height;properties.append(el('p','cf-muted',`${info.width} × ${info.height} pixels · ${(bytes.length/1024).toFixed(1)} KiB`));}else image.removeAttribute('src');
        if(!s){properties.append(el('p','cf-muted','Add a font strike, then import or rasterize this glyph.'));return;}
        input('Strike PPEM',s.ppem,{type:'number',min:1,max:draft.bitmapFont.format==='sbix'?65535:255,step:1},v=>strike().ppem=v);
        input('Strike PPI',s.ppi,{type:'number',min:1,max:65535,step:1},v=>strike().ppi=v);
        if(draft.bitmapFont.format==='sbix')input('Outline overlay',draft.bitmapFont.overlay?'on':'off',{options:[{value:'off',label:'Bitmap replaces outline'},{value:'on',label:'Overlay outlines (consumer dependent)'}]},v=>draft.bitmapFont.overlay=v==='on');
        if(e){
            input('Bitmap X (pixels)',e.x,{type:'number',min:-32768,max:32767,step:1},v=>entry().x=v);
            input('Bitmap Y (pixels)',e.y,{type:'number',min:-32768,max:32767,step:1},v=>entry().y=v);
            const advance=field('CBDT advance (blank = automatic)',e.advance??'',{type:'number',min:0,max:255,step:1});advance.input.addEventListener('change',run(()=>edit(()=>{if(advance.input.value==='')delete entry().advance;else entry().advance=advance.input.valueAsNumber;})),{signal:abort.signal});properties.append(advance.element);
            if(e.vertical)for(const [name,key]of [['Vertical bearing X','x'],['Vertical bearing Y','y'],['Vertical advance','advance']])input(name,e.vertical[key],{type:'number',min:key==='advance'?0:-128,max:key==='advance'?255:127,step:1},v=>entry().vertical[key]=v);
            properties.append(button(e.vertical?'Remove vertical metrics':'Add vertical metrics',run(()=>edit(()=>{if(entry().vertical)delete entry().vertical;else entry().vertical={x:0,y:0,advance:s.ppem>255?255:s.ppem};}))),button('Remove glyph bitmap',run(()=>edit(()=>{glyph().bitmaps=glyph().bitmaps.filter(e=>e.strikeId!==selected);}))),button('Download strike PNG',run(()=>download(bytesFromBase64(e.png),`${glyph().name}-${s.ppem}.png`,'image/png'))));
        }
        properties.append(button('Remove empty strike',run(()=>edit(()=>{if(draft.glyphs.some(g=>g.bitmaps?.some(e=>e.strikeId===selected)))throw new Error('Remove the bitmaps in this strike before deleting it');draft.bitmapFont.strikes=draft.bitmapFont.strikes.filter(s=>s.id!==selected);selected=draft.bitmapFont.strikes[0]?.id;}))));
    }
    list.addEventListener('keydown',e=>{if(busy)return;const items=[...list.children],i=items.findIndex(x=>x.dataset.strikeId===selected),n=e.key==='Home'?0:e.key==='End'?items.length-1:e.key==='ArrowDown'?Math.min(i+1,items.length-1):e.key==='ArrowUp'?Math.max(0,i-1):-1;if(n>=0&&items[n]){e.preventDefault();e.stopPropagation();selected=items[n].dataset.strikeId;clearProof();render();list.querySelector('[aria-selected="true"]')?.focus();}},{signal:abort.signal});
    const toolbar=el('div','cf-workflow-toolbar');
    toolbar.append(button('Import PNG bitmap',run(importPNG)),ink.element,button('Rasterize outline',run(rasterize)));
    const references=doc.layer(gid,mid).artwork?.filter(r=>r.kind==='bitmap')||[];
    if(references.length){const f=field('PNG reference',references[0].id,{options:references.map(r=>({value:r.id,label:r.name}))});toolbar.append(f.element,button('Use reference pixels',run(()=>setImage(bytesFromBase64(references.find(r=>r.id===f.input.value).png)))));}
    const proofControls=el('div','cf-workflow-toolbar');proofControls.append(proofFormat.element,zoom.element,button('Compile bitmap proof',run(compileProof)));
    const proofBox=el('div','cf-bitmap-proof-box');proofBox.append(proof);preview.append(el('h3','','Source pixels'),image,toolbar,el('h3','','Compiled font proof'),proofControls,proofBox,proofNote);
    layout.append(sidebar,preview,properties);d.body.append(layout,status);
    d.footer.append(button('Cancel',d.close),button('Apply bitmap strikes',run(()=>{assert();if(busy)throw new Error('An image import is pending');validateBitmapSource(draft);const settings=structuredClone(draft.bitmapFont),entries=new Map(draft.glyphs.map(g=>[g.id,structuredClone(g.bitmaps||[])]));
        app.history.execute('Apply bitmap color strikes',()=>{if(settings.strikes.length)doc.data.bitmapFont=settings;else delete doc.data.bitmapFont;for(const g of doc.data.glyphs){const e=entries.get(g.id);if(e?.length)g.bitmaps=e;else delete g.bitmaps;}});d.close();
    }),{className:'primary'}));
    clearProof();render();summary();return d;
}
