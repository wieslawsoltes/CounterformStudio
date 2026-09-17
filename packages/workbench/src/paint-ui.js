import {paintTypes,compositeModes,extendModes} from '@wieslawsoltes/counterform-colrv1';
import {validateColorSource} from '@wieslawsoltes/counterform-color';
import {el,button,dialog,field} from './ui.js';
let session=0;
const words=s=>s.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
function children(p){if(p.type==='layers')return p.layers.map((_,i)=>['layers',i]);if(p.type==='composite')return [['backdrop'],['source']];return p.paint?[['paint']]:[];}
function at(root,path){return path.reduce((p,k)=>p?.[k],root);}
function preset(type,gid,child){
 const solid={type:'solid',paletteIndex:0,alpha:1},base=child||{type:'glyph',glyphId:gid,paint:solid},stops=[{offset:0,paletteIndex:0,alpha:1},{offset:1,paletteIndex:1,alpha:1}];
 if(type==='solid')return solid;
 if(type==='linear')return {type,x0:0,y0:0,x1:600,y1:0,x2:0,y2:700,extend:'pad',stops};
 if(type==='radial')return {type,x0:220,y0:250,r0:0,x1:300,y1:350,r1:450,extend:'pad',stops};
 if(type==='sweep')return {type,centerX:300,centerY:350,startAngle:0,endAngle:360,extend:'pad',stops};
 if(type==='layers')return {type,layers:[base]};
 if(type==='glyph')return {type,glyphId:gid,paint:child||solid};
 if(type==='colrGlyph')return {type,glyphId:gid};
 if(type==='composite')return {type,source:base,mode:'src_over',backdrop:{type:'glyph',glyphId:gid,paint:{type:'solid',paletteIndex:1,alpha:.5}}};
 const values={transform:{matrix:[1,0,0,1,0,0]},translate:{dx:0,dy:0},scale:{scaleX:1,scaleY:1},scaleAroundCenter:{scaleX:1,scaleY:1,centerX:300,centerY:350},scaleUniform:{scale:1},scaleUniformAroundCenter:{scale:1,centerX:300,centerY:350},rotate:{angle:0},rotateAroundCenter:{angle:0,centerX:300,centerY:350},skew:{xSkewAngle:0,ySkewAngle:0},skewAroundCenter:{xSkewAngle:0,ySkewAngle:0,centerX:300,centerY:350}};
 return {type,...values[type],paint:base};
}
/** Native, keyboard-accessible tree and inspector. All source edits share History. */
export function showPaintEditor(app){
 const gid=app.editor.glyphId,documentId=app.doc.data.id;
 const d=dialog('Color paint graph',{wide:true,className:'cf-paint-dialog',subtitle:'COLRv1 · non-destructive color · actual compiled-font preview'});
 let path=[],closed=false,timer,generation=0,face,visible=[],masterId=app.editor.masterId,paletteIndex=0;
 const family=`CounterformPaint${++session}`,key=family,collapsed=new Set();
 const toolbar=el('div','cf-paint-toolbar'),layout=el('div','cf-paint-layout'),tree=el('div','cf-paint-tree'),inspector=el('div','cf-paint-inspector'),preview=el('div','cf-paint-preview');
 tree.setAttribute('role','tree');tree.setAttribute('aria-label','Color paint nodes');
 const previewText=el('span','cf-paint-proof',String.fromCodePoint(0xf0000)),previewStatus=el('p','cf-muted','Compiling preview…'),errors=el('div','cf-paint-error');
 errors.setAttribute('role','alert');previewText.setAttribute('aria-label','Compiled color glyph');previewText.style.fontFamily=`"${family}"`;previewText.hidden=true;
 const title=el('h3','','Compiled glyph'),previewControls=el('div','cf-paint-preview-controls');
 const master=field('Preview master',masterId,{options:app.doc.data.masters.map(m=>({value:m.id,label:m.name}))});
 master.input.addEventListener('change',()=>{masterId=master.input.value;schedule();});
 const palettes=field('Preview palette','0',{options:[]});palettes.input.addEventListener('change',()=>{paletteIndex=Number(palettes.input.value);schedule();});
 const fg=field('Foreground color','#18222e',{type:'color'});fg.input.addEventListener('input',()=>previewText.style.color=fg.input.value);
 const size=field('Color proof size',360,{type:'range',min:80,max:500,step:1});size.input.addEventListener('input',()=>previewText.style.fontSize=size.input.value+'px');
 previewControls.append(master.element,palettes.element,fg.element,size.element);preview.append(title,previewControls,previewText,previewStatus);
 const create=field('New paint type','linear',{options:paintTypes.map(value=>({value,label:words(value)}))});
 toolbar.append(create.element,button('Replace selected',()=>mutate('Replace color paint',()=>replace(make(create.input.value)))),button('Wrap selected',()=>mutate('Wrap color paint',()=>{
  const old=current();if(!old)throw new Error('Create a paint graph first');
  if(['solid','linear','radial','sweep','colrGlyph'].includes(create.input.value))throw new Error('Choose a transform, glyph clip, layer group or composite to wrap this node');
  replace(make(create.input.value,structuredClone(old)));
 })),button('Remove selected',remove),button('Palettes…',()=>app.showColors()));
 function glyph(){return app.doc.glyph(gid);}
 function current(){return at(glyph()?.colorPaint,path);}
 function make(type,child){
  let ref=gid;if(type==='colrGlyph'){const other=app.doc.data.glyphs.find(g=>g.id!==gid&&g.colorPaint&&g.export!==false);if(!other)throw new Error('Create another COLRv1 base glyph before referencing one');ref=other.id;}
  const p=preset(type,ref,child);
  if(app.doc.data.palettes[0].length===1){if(p.stops)p.stops[1].paletteIndex=0;if(p.backdrop)p.backdrop.paint.paletteIndex=0;}
  return p;
 }
 function defaultClip(){const b=app.doc.metrics(gid,masterId);return b&&!b.empty?[Math.max(-32768,Math.floor(b.minX)-64),Math.max(-32768,Math.floor(b.minY)-64),Math.min(32767,Math.ceil(b.maxX)+64),Math.min(32767,Math.ceil(b.maxY)+64)]:[0,0,700,800];}
 function replace(value){const g=glyph();if(!g)throw new Error('Glyph no longer exists');if(path.length){const parent=at(g.colorPaint,path.slice(0,-1));if(!parent)throw new Error('Selected paint no longer exists');parent[path.at(-1)]=value;}else{g.colorPaint=value;g.colorClip??=defaultClip();}}
 function mutate(label,fn){
  if(closed)return false;
  const focus=document.activeElement?.getAttribute('aria-label');errors.textContent='';
  try {app.history.execute(label,()=>{if(!glyph())throw new Error('Glyph no longer exists');fn();validateColorSource(app.doc.data);},gid);render();if(focus)for(const e of inspector.querySelectorAll('[aria-label]'))if(e.getAttribute('aria-label')===focus){e.focus();break;}return true;}
  catch(e){render();errors.textContent=e.message;return false;}
 }
 function remove(){mutate('Remove color paint',()=>{
  if(!path.length){delete glyph().colorPaint;delete glyph().colorClip;return;}
  const parent=at(glyph().colorPaint,path.slice(0,-1));
  if(Array.isArray(parent)){if(parent.length===1)throw new Error('A layer group cannot be empty. Remove or replace the group.');parent.splice(path.at(-1),1);path=path.slice(0,-2);}
  else if(current()?.paint){replace(current().paint);}
  else throw new Error('This child is required. Replace its paint or remove the containing group.');
 });}
 function input(label,value,options,update,host=inspector){const f=field(label,value,options);f.input.addEventListener('change',()=>mutate('Edit '+label,()=>update(f.input.type==='number'?f.input.valueAsNumber:f.input.value)));host.append(f.element);return f;}
 function pick(pathValue,focus=false){path=pathValue.slice();render();if(focus)tree.querySelector('[tabindex="0"]')?.focus();}
 function render(){
  const g=glyph();if(!g||app.doc.data.id!==documentId){d.close();return;}
  if(!current())path=[];
  tree.replaceChildren();visible=[];
  const root=g.colorPaint;
  function node(p,route,depth){const id=JSON.stringify(route),isSelected=JSON.stringify(path)===id,sub=children(p),b=button((sub.length?(collapsed.has(id)?'▸ ':'▾ '):'· ')+words(p.type),()=>pick(route,true));
   b.setAttribute('role','treeitem');b.setAttribute('aria-level',String(depth+1));b.setAttribute('aria-selected',String(isSelected));if(sub.length)b.setAttribute('aria-expanded',String(!collapsed.has(id)));b.tabIndex=isSelected?0:-1;b.dataset.path=id;b.style.paddingInlineStart=(12+depth*16)+'px';
   if(p.glyphId)b.append(el('small','',app.doc.glyph(p.glyphId)?.name||'Missing glyph'));tree.append(b);visible.push({p,route,id,sub});if(!collapsed.has(id))sub.forEach(keys=>node(at(p,keys),[...route,...keys],depth+1));
  }
  if(root)node(root,[],0);else{tree.append(el('p','cf-muted','No paint graph. Start with a gradient or reuse the v0 layers.'));}
  inspector.replaceChildren(el('h3','',current()?words(current().type):'Create color artwork'));
  const p=current();
  if(!p){for(const type of ['linear','radial','sweep'])inspector.append(button('Create '+type+' gradient',()=>mutate('Create '+type+' color glyph',()=>{replace({type:'glyph',glyphId:gid,paint:make(type)});path=['paint'];})));inspector.append(button('Use existing v0 layers',()=>mutate('Create paint graph from v0 layers',()=>{if(!g.colorLayers?.length)throw new Error('No v0 layers to convert');replace({type:'layers',layers:g.colorLayers.map(l=>({type:'glyph',glyphId:l.glyphId,paint:{type:'solid',paletteIndex:l.paletteIndex,alpha:1}}))});})));}
  else {
   if('glyphId'in p)input('Referenced glyph',p.glyphId,{options:app.doc.data.glyphs.filter(x=>x.export!==false&&(p.type!=='colrGlyph'||x.id!==gid&&x.colorPaint)).map(x=>({value:x.id,label:x.name}))},v=>current().glyphId=v);
   if(p.type==='solid'){
    paletteField('Palette entry',p.paletteIndex,v=>current().paletteIndex=v);
    input('Paint alpha',p.alpha??1,{type:'number',min:0,max:1,step:.05},v=>current().alpha=v);
   }
   const parameters=el('div','cf-paint-matrix');inspector.append(parameters);
   for(const [k,v]of Object.entries(p))if(typeof v==='number'&&!['alpha','paletteIndex'].includes(k))input(words(k),v,{type:'number',step:k.toLowerCase().includes('scale')?.05:k.toLowerCase().includes('angle')?.5:1},v=>current()[k]=v,parameters);
   if(p.matrix){const box=el('div','cf-paint-matrix');inspector.append(box);['XX','YX','XY','YY','DX','DY'].forEach((k,i)=>input('Matrix '+k,p.matrix[i],{type:'number',step:i<4?.05:1},v=>current().matrix[i]=v,box));}
   if(p.mode)input('Composite mode',p.mode,{options:compositeModes.map(value=>({value,label:words(value)}))},v=>current().mode=v);
   if(p.stops){
    input('Gradient extension',p.extend??'pad',{options:extendModes},v=>current().extend=v);
    inspector.append(el('h4','','Gradient stops'));
    p.stops.forEach((s,i)=>{const row=el('div','cf-paint-stop');row.dataset.stop=String(i);inspector.append(row);
     input(`Stop ${i+1} offset`,s.offset,{type:'number',min:-2,max:1.99993896484375,step:.05},v=>current().stops[i].offset=v,row);
     paletteField(`Stop ${i+1} color`,s.paletteIndex,v=>current().stops[i].paletteIndex=v,row);
     input(`Stop ${i+1} alpha`,s.alpha??1,{type:'number',min:0,max:1,step:.05},v=>current().stops[i].alpha=v,row);
     row.append(button('Remove',()=>mutate('Remove gradient stop',()=>current().stops.splice(i,1)),{title:`Remove stop ${i+1}`}));
    });
    inspector.append(button('Add gradient stop',()=>mutate('Add gradient stop',()=>current().stops.push({offset:.5,paletteIndex:0,alpha:1}))),button('Sort stops',()=>mutate('Sort gradient stops',()=>current().stops.sort((a,b)=>a.offset-b.offset))));
   }
   if(p.type==='layers')inspector.append(button('Add paint layer',()=>mutate('Add paint layer',()=>current().layers.push({type:'glyph',glyphId:gid,paint:make('solid')}))));
   if(path.length&&Array.isArray(at(root,path.slice(0,-1)))){
    const row=el('div','cf-paint-toolbar'),i=path.at(-1),get=()=>at(glyph().colorPaint,path.slice(0,-1));
    const up=button('Move backward',()=>mutate('Reorder paint layer',()=>{const a=get();[a[i-1],a[i]]=[a[i],a[i-1]];path[path.length-1]=i-1;}));up.disabled=i===0;
    const down=button('Move forward',()=>mutate('Reorder paint layer',()=>{const a=get();[a[i+1],a[i]]=[a[i],a[i+1]];path[path.length-1]=i+1;}));down.disabled=i===get().length-1;
    row.append(up,down,button('Duplicate layer',()=>mutate('Duplicate paint layer',()=>get().splice(i+1,0,structuredClone(current())))));inspector.append(row);
   }
  }
  if(root){const clip=el('section','cf-paint-clip');clip.append(el('h4','','Base glyph clip box'));inspector.append(clip);
   if(g.colorClip)['xMin','yMin','xMax','yMax'].forEach((label,i)=>input('Clip '+label,g.colorClip[i],{type:'number',min:-32768,max:32767,step:1},v=>glyph().colorClip[i]=v,clip));
   clip.append(button(g.colorClip?'Remove clip box':'Add clip box',()=>mutate('Edit color clip box',()=>{if(glyph().colorClip)delete glyph().colorClip;else glyph().colorClip=defaultClip();})));
  }
  palettes.input.replaceChildren(...app.doc.data.palettes.map((_,i)=>{const o=el('option','',app.doc.data.paletteLabels?.[i]||`Palette ${i}`);o.value=String(i);return o;}));
  paletteIndex=Math.min(paletteIndex,app.doc.data.palettes.length-1);palettes.input.value=String(paletteIndex);
 }
 function paletteField(label,value,set,host){return input(label,value,{options:[...app.doc.data.palettes[0].map((c,i)=>({value:String(i),label:`${i} · ${app.doc.data.paletteEntryLabels?.[i]||c}`})),{value:'65535',label:'Foreground'}]},v=>set(Number(v)),host);}
 tree.addEventListener('keydown',e=>{
  const index=visible.findIndex(x=>x.id===JSON.stringify(path)),entry=visible[index];if(!entry)return;
  const parent=()=>path.slice(0,path.at(-2)==='layers'?-2:-1);
  if(e.key==='ArrowDown')pick(visible[Math.min(index+1,visible.length-1)].route,true);
  else if(e.key==='ArrowUp')pick(visible[Math.max(index-1,0)].route,true);
  else if(e.key==='Home')pick([],true);
  else if(e.key==='End')pick(visible.at(-1).route,true);
  else if(e.key==='ArrowRight'&&entry.sub.length){if(collapsed.delete(entry.id)){render();tree.querySelector('[tabindex="0"]')?.focus();}else pick([...path,...entry.sub[0]],true);}
  else if(e.key==='ArrowLeft'){if(entry.sub.length&&!collapsed.has(entry.id)){collapsed.add(entry.id);render();tree.querySelector('[tabindex="0"]')?.focus();}else pick(parent(),true);}
  else if(e.key==='Delete'){remove();tree.querySelector('[tabindex="0"]')?.focus();}
  else return;e.preventDefault();e.stopPropagation();
 });
 function schedule(){if(closed)return;generation++;clearTimeout(timer);app.compiler.cancelKey(key);previewText.hidden=true;preview.dataset.ready='false';previewStatus.textContent='Compiling current source…';timer=setTimeout(compile,180);}
 async function compile(){
  const id=++generation;if(closed)return;
  try {
   const data=structuredClone(app.doc.data),g=data.glyphs.find(g=>g.id===gid);if(!g||g.export===false)throw new Error('Enable glyph export to preview compiled artwork');
   for(const x of data.glyphs)x.unicodes=x.unicodes.filter(cp=>cp!==0xf0000);g.unicodes=[0xf0000];data.features='';
   for(const k of ['palettes','paletteLabels','paletteTypes'])if(data[k])[data[k][0],data[k][paletteIndex]]=[data[k][paletteIndex],data[k][0]];
   const {bytes}=await app.compiler.compile(data,{format:'ttf',masterId},{key,priority:5});if(closed||id!==generation)return;
   const next=await new FontFace(family,bytes).load();if(closed||id!==generation)return;
   if(face)document.fonts.delete(face);face=next;document.fonts.add(face);previewText.hidden=false;
   previewStatus.textContent=`${g.name} · ${(bytes.byteLength/1024).toFixed(1)} KiB · compiled TrueType/COLR · ${app.compiler.backend}`;
   preview.dataset.ready='true';preview.dataset.revision=String(app.doc.revision);
  }catch(error){if(!closed&&id===generation&&error.name!=='AbortError'){previewStatus.textContent=error.message;preview.dataset.ready='false';}}
 }
 function editJSON(){const j=dialog('Paint graph source',{wide:true,subtitle:'Validated source, not an executable script. Applying is one undo transaction.'}),area=el('textarea','cf-paint-json');area.setAttribute('aria-label','Paint graph JSON');area.value=JSON.stringify(glyph()?.colorPaint??null,null,2);j.body.append(area);const problem=el('p','cf-paint-error');problem.setAttribute('role','alert');j.body.append(problem);
  j.footer.append(button('Cancel',j.close),button('Apply graph',()=>{try{if(area.value.length>1024*1024)throw new Error('Graph JSON exceeds 1 MiB');const value=JSON.parse(area.value);if(mutate('Replace color graph',()=>{path=[];if(value===null){delete glyph().colorPaint;delete glyph().colorClip;}else replace(value);})){j.close();}else problem.textContent=errors.textContent;}catch(e){problem.textContent=e.message;}},{className:'primary'}));}
 layout.append(tree,inspector,preview);d.body.append(toolbar,errors,layout);
 d.footer.append(el('span','cf-muted','Static paints · glyph outlines remain editable'),button('Graph JSON…',editJSON),button('Undo',()=>app.history.undo()),button('Redo',()=>app.history.redo()),button('Done',d.close,{className:'primary'}));
 const off=app.doc.changed.subscribe(e=>{if(e.kind==='saved')return;render();schedule();});const dispose=()=>d.close();app.disposables.push(dispose);
 d.element.addEventListener('close',()=>{closed=true;generation++;clearTimeout(timer);app.compiler.cancelKey(key);off();if(face)document.fonts.delete(face);const i=app.disposables.indexOf(dispose);if(i>=0)app.disposables.splice(i,1);},{once:true});
 render();schedule();return d;
}
