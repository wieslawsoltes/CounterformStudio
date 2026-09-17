import {restoreOriginal,exportMetadataOnly,preservationStatus} from '@wieslawsoltes/counterform-preservation';
import {modifierKinds,validateModifiers} from '@wieslawsoltes/counterform-modifiers';
import {RevisionJournal} from '@wieslawsoltes/counterform-journal';
import {FontDocument} from '@wieslawsoltes/counterform-model';
import {uid} from '@wieslawsoltes/counterform-geometry';
import {download} from '@wieslawsoltes/counterform-storage';
import {el,button,dialog,field,formDialog,toast} from './ui.js';
export {RevisionJournal};
const defaults={translate:{x:20,y:0},scale:{x:1.1,y:1.1},rotate:{angle:10},slant:{angle:12},matrix:{matrix:[1,0,0,1,0,0]},round:{grid:1},reverse:{},repeat:{count:2,x:100,y:0}};
export function registerProductionCommands(app){
 const register=(id,label,execute,extra={})=>app.commands.register({id,label,execute,keys:[],...extra});
 register('outline.modifiers','Non-destructive modifiers',()=>showModifiers(app),{enabled:()=>!!app.editor.layer&&!app.editor.readOnly});
 register('outline.bake','Bake outline modifiers',()=>bakeModifiers(app),{enabled:()=>app.editor.canEdit&&!!app.editor.layer.modifiers?.length});
 register('file.original','Download untouched original',async()=>{const a=app.doc.data.originalFont;download(await restoreOriginal(a),a.filename);},{enabled:()=>!!app.doc.data.originalFont});
 register('file.metadataExport','Lossless metadata-only export',()=>showPreservedExport(app),{enabled:()=>!!app.doc.data.originalFont});
 register('file.recovery','Recovery journal',()=>showRecovery(app));
 register('master.metrics','Master vertical metrics',()=>showMasterMetrics(app),{enabled:()=>!app.editor.readOnly});
}
export function attachJournal(app){
 let stopped=false;
 const record=()=>app.journal.append(app.doc.data,{label:app.history.undoStack.at(-1)?.label||'Snapshot'}).then(seq=>{if(!stopped)app.saveLabel.title=`Recovery journal revision ${seq} committed`;},error=>{if(!stopped)app.record('Recovery journal',error.message);});
 const off=app.doc.changed.subscribe(e=>{if(e.kind!=='saved'&&!app.history.active)record();});record();
 const visibility=()=>{if(document.visibilityState==='hidden')app.autosave?.flush();};document.addEventListener('visibilitychange',visibility);
 app.disposables.push(()=>{stopped=true;off();document.removeEventListener('visibilitychange',visibility);app.journal.close().catch(()=>{});});
}
export function bakeModifiers(app){
 if(!app.editor.canEdit)throw new Error('Choose an unlocked source master');
 app.editor.transaction('Bake outline modifiers',()=>{const l=app.editor.layer,result=app.doc.resolve(app.editor.glyphId,app.editor.masterId);l.contours=result;l.components=[];l.modifiers=[];});
}
export function showModifiers(app){
 const d=dialog('Non-destructive modifiers',{subtitle:'Result outlines update immediately. Nodes remain in source coordinates; anchors and advance widths are not transformed. Bake to edit the evaluated result.',wide:true});
 const list=el('div','cf-modifier-list'),type=field('Add modifier','translate',{options:modifierKinds});d.body.append(list);
 const change=(label,fn)=>{if(!app.editor.canEdit)throw new Error('Source layer is locked');app.editor.transaction(label,()=>{const l=app.editor.layer;l.modifiers??=[];fn(l.modifiers);validateModifiers(l.modifiers);app.doc.resolve(app.editor.glyphId,app.editor.masterId);});};
 const edit=(i)=>{const m=app.editor.layer.modifiers[i],fields=Object.entries(m).filter(([k])=>!['type','enabled','origin'].includes(k)).map(([k,v])=>[k,k,Array.isArray(v)?v.join(', '):v,{type:Array.isArray(v)?'text':'number',step:'any'}]);
  if(['scale','rotate','slant'].includes(m.type))fields.push(['originX','Origin X',m.origin?.x??0,{type:'number',step:'any'}],['originY','Origin Y',m.origin?.y??0,{type:'number',step:'any'}]);
  return formDialog('Edit '+m.type,fields,{onSubmit:values=>change('Edit modifier',stack=>{const next={...stack[i],...values};if(typeof next.matrix==='string')next.matrix=next.matrix.split(',').map(Number);if('originX'in next){next.origin={x:next.originX,y:next.originY};delete next.originX;delete next.originY;}stack[i]=next;})});};
 const render=()=>{list.replaceChildren();const stack=app.editor.layer.modifiers||[];if(!stack.length)list.append(el('p','cf-muted','No modifiers. Add a step to preserve the original outline while changing the result.'));
  stack.forEach((m,i)=>{const row=el('section','cf-inspector-section'),head=el('div','cf-button-row');head.append(el('strong','',`${i+1}. ${m.type}`));
   const enabled=button(m.enabled===false?'Enable':'Bypass',()=>change('Toggle modifier',s=>s[i].enabled=s[i].enabled===false));enabled.setAttribute('aria-pressed',String(m.enabled!==false));
   head.append(enabled,button('Edit',()=>edit(i)),button('Duplicate',()=>change('Duplicate modifier',s=>s.splice(i+1,0,structuredClone(s[i])))),button('Remove',()=>change('Remove modifier',s=>s.splice(i,1))));
   const up=button('Move up',()=>change('Reorder modifier',s=>[s[i-1],s[i]]=[s[i],s[i-1]])),down=button('Move down',()=>change('Reorder modifier',s=>[s[i+1],s[i]]=[s[i],s[i+1]]));up.disabled=i===0;down.disabled=i===stack.length-1;head.append(up,down);row.append(head,el('code','cf-muted',JSON.stringify(m)));if(!app.editor.canEdit)row.querySelectorAll('button').forEach(b=>b.disabled=true);list.append(row);});};
 const off=app.doc.changed.subscribe(render);d.element.addEventListener('close',off,{once:true});render();
 d.footer.append(type.element,button('Add step',()=>change('Add modifier',s=>s.push({type:type.input.value,enabled:true,...structuredClone(defaults[type.input.value])}))),button('Bake result',()=>{bakeModifiers(app);}),button('Done',d.close));return d;
}
export async function showRecovery(app){
 const d=dialog('Recovery journal',{subtitle:'Each revision is an integrity-checked source snapshot. Recovery always opens a new project; the original history is retained.',wide:true});
 const host=el('div','cf-recovery-list');d.body.append(host);d.footer.append(button('Done',d.close));
 try{const projects=await app.journal.list();if(!d.element.isConnected)return;
  if(!projects.length)host.append(el('p','cf-muted','No committed recovery revisions yet.'));
  for(const p of projects){const row=el('section','cf-inspector-section');row.append(el('strong','',p.id),el('p','cf-muted',`${p.count} revisions · ${new Date(p.time).toLocaleString()} · ${(p.bytes/1048576).toFixed(1)} MiB`));
   row.append(button('Inspect revisions',async()=>{const recovery=await app.journal.recover(p.id);if(!d.element.isConnected)return;host.replaceChildren();
    if(recovery.issue)host.append(el('p','cf-error',recovery.issue+' — only the valid prefix is shown.'));
    for(const rev of recovery.snapshots.toReversed()){const item=el('section','cf-inspector-section');item.append(el('strong','',`${rev.sequence} · ${rev.label}`),el('p','cf-muted',new Date(rev.time).toLocaleString()));
     item.append(button('Recover as new project',()=>{if(app.doc.dirty&&!confirm('Open this recovered revision as a new project? Save your current work first if needed.'))return;const data=structuredClone(rev.data);data.id=uid('font');app.replaceDocument(new FontDocument(data));d.close();toast('Recovered revision '+rev.sequence+' as a separate project');}),button('Download snapshot',()=>download(JSON.stringify(rev.data),`recovery-${rev.sequence}.counterform`,'application/json')));host.append(item);}
   }));host.append(row);}
 }catch(e){host.append(el('p','cf-error',e.message));}return d;
}
export function showMasterMetrics(app){const master=app.doc.data.masters.find(m=>m.id===app.editor.masterId),keys=['ascender','descender','lineGap','capHeight','xHeight'];
 return formDialog('Master vertical metrics',keys.map(k=>[k,k,master.metrics?.[k]??app.doc.info[k],{type:'number',min:-32767,max:32767,step:1}]),{subtitle:'Overrides for this source master. Variable exports encode differences in MVAR; static instances interpolate these metrics.',onSubmit:v=>app.history.execute('Edit master metrics',()=>{for(const k of keys)if(!Number.isFinite(v[k])||Math.abs(v[k])>32767)throw new RangeError('Master metrics must be within ±32767');const current=app.doc.data.masters.find(m=>m.id===master.id);if(!current)throw new Error('Source master no longer exists');current.metrics=v;})});}

export async function showPreservedExport(app){const d=dialog('Lossless metadata-only export',{subtitle:'Preserves original glyph programs, layout, variation and unknown tables. Refuses structural edits. This is not arbitrary lossless outline reconstruction.',wide:true});const result=el('p','cf-muted','Checking source against the archived import…');d.body.append(result);d.footer.append(button('Cancel',d.close));try{const status=await preservationStatus(app.doc.data.originalFont,app.doc.data);if(!d.element.isConnected)return;result.textContent=status.unchanged?'Source is unchanged: output will be byte-identical.':status.metadataOnly?'Only supported name/version metadata changed; original font tables will be retained.':'Source structure changed. Use the regular compiler, or download the untouched original.';if(status.metadataOnly)d.footer.append(button('Export preserved font',async()=>{const a=app.doc.data.originalFont,r=await exportMetadataOnly(a,app.doc.data);download(r.bytes,a.filename);for(const w of r.warnings)toast(w);d.close();},{className:'primary'}));}catch(e){result.textContent=e.message;}return d;}
