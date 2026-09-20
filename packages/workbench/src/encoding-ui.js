import {FontDocument,validateVariationSequences} from '@wieslawsoltes/counterform-model';
import {download} from '@wieslawsoltes/counterform-storage';
import {uid} from '@wieslawsoltes/counterform-geometry';
import {el,button,dialog,field} from './ui.js';
const hex=n=>'U+'+n.toString(16).toUpperCase().padStart(4,'0');
function code(input){const text=input.value.trim().replace(/^U\+/i,'');if(!/^[\da-fA-F]{1,6}$/.test(text))throw new Error('Enter a Unicode value in hexadecimal, for example U+0041');return parseInt(text,16);}
export function registerEncodingCommands(app){app.commands.register({id:'glyph.variations',label:'Unicode variation sequences',keys:[],repeat:false,enabled:()=>!app.editor.readOnly,execute:()=>showVariationSequences(app)});}
/** Staged source editing. Validation and proof compilation never mutate the font. */
export function showVariationSequences(app){
    const d=dialog('Unicode variation sequences',{wide:true,className:'cf-workflow-dialog',subtitle:'Map a base character plus a Unicode variation selector to a glyph. Default records use the normal Unicode mapping; alternate records may use an unencoded base character.'});
    const doc=app.doc,documentId=doc.data.id,revision=doc.revision,masterId=app.editor.masterId,features=app.featureText.value,key=uid('encoding'),abort=new AbortController();
    const status=el('p','cf-workflow-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const run=fn=>async()=>{try{status.dataset.error='false';await fn();}catch(error){if(error.name!=='AbortError'&&!abort.signal.aborted){status.dataset.error='true';status.textContent=error.message;}}};
    function check(){if(abort.signal.aborted||!d.element.open)throw new DOMException('Editor closed','AbortError');if(app.doc!==doc||doc.data.id!==documentId||doc.revision!==revision||app.editor.masterId!==masterId||app.editor.readOnly||app.featureText.value!==features)throw new Error('Source, master or feature draft changed. Reopen this editor before applying.');}
    let entries=structuredClone(doc.data.variationSequences||[]),page=0,selected=-1,generation=0,face=null,busy=false;
    const family='CF_uvs_'+key.replace(/[^a-zA-Z0-9]/g,''),proof=el('div','cf-attachment-proof');proof.setAttribute('role','img');proof.setAttribute('aria-label','Compiled variation sequence proof');proof.hidden=true;proof.style.fontFamily=`"${family}"`;
    const layout=el('div','cf-workflow-columns'),main=el('div','cf-workflow-main'),form=el('div','cf-workflow-properties');
    const base=field('Base character',hex(app.editor.glyph.unicodes[0]??65)),selector=field('Variation selector','U+FE0F');
    const glyph=field('Variation glyph',app.editor.glyph.id,{options:[{value:'',label:'Default Unicode glyph'},...doc.data.glyphs.filter(g=>g.export!==false).map(g=>({value:g.id,label:g.name}))]});
    const filter=field('Find sequence',''),summary=el('p','cf-mono'),table=el('table','cf-table');table.setAttribute('aria-label','Unicode variation mappings');
    const json=el('textarea','cf-advanced-code');json.setAttribute('aria-label','Variation sequences JSON');json.spellcheck=false;json.rows=5;
    const details=el('details');details.append(el('summary','','JSON interchange'),json,button('Load draft JSON',run(()=>{if(json.value.length>16*1024*1024)throw new RangeError('Mapping JSON exceeds 16 MiB');const candidate=JSON.parse(json.value);validateVariationSequences({...doc.data,variationSequences:candidate});entries=structuredClone(candidate);selected=-1;page=0;changed();})));
    function release(){if(face)document.fonts.delete(face);face=null;proof.hidden=true;delete proof.dataset.ready;}
    function invalidate(){generation++;app.compiler.cancelKey(key);release();}
    const dispose=()=>{if(d.element.open)d.close();};app.disposables.push(dispose);
    const off=doc.changed.subscribe(()=>{if(doc.data.id!==documentId)dispose();});
    d.onClose(()=>{abort.abort();off();invalidate();const i=app.disposables.indexOf(dispose);if(i>=0)app.disposables.splice(i,1);});
    const candidate=()=>{check();const data=structuredClone(doc.data);data.variationSequences=structuredClone(entries);data.features=features;new FontDocument(data);return data;};
    function changed(){invalidate();render();status.textContent='Draft updated. Validate a compiled proof or Apply to commit all mappings in one undo transaction.';}
    function add(){check();const row={unicode:code(base.input),selector:code(selector.input),glyphId:glyph.input.value||null},next=entries.filter(e=>e.unicode!==row.unicode||e.selector!==row.selector);next.push(row);validateVariationSequences({...doc.data,variationSequences:next});entries=next.sort((a,b)=>a.selector-b.selector||a.unicode-b.unicode);selected=entries.indexOf(row);changed();}
    function select(i){selected=i;const e=entries[i];base.input.value=hex(e.unicode);selector.input.value=hex(e.selector);glyph.input.value=e.glyphId??'';invalidate();render();}
    const previous=button('Previous page',()=>{page--;render();}),next=button('Next page',()=>{page++;render();}),paging=el('div','cf-workflow-toolbar');paging.append(previous,summary,next);
    function render(){const query=filter.input.value.toLowerCase(),matches=[];for(let i=0;i<entries.length;i++){const e=entries[i],label=`${hex(e.unicode)} ${hex(e.selector)} ${e.glyphId?doc.glyph(e.glyphId)?.name:'Default Unicode glyph'}`;if(!query||label.toLowerCase().includes(query))matches.push({i,e,label});}
        page=Math.max(0,Math.min(page,Math.ceil(matches.length/100)-1));table.replaceChildren();const head=el('thead'),hr=el('tr');for(const title of ['Base + selector','Glyph','Actions'])hr.append(el('th','',title));head.append(hr);const body=el('tbody');
        for(const {i,e}of matches.slice(page*100,page*100+100)){const row=el('tr');row.classList.toggle('selected',selected===i);const text=el('td'),target=el('td','',e.glyphId?doc.glyph(e.glyphId)?.name:'Default Unicode glyph'),actions=el('td');const choose=button(`${hex(e.unicode)} ${hex(e.selector)}`,()=>select(i));choose.dataset.uvsIndex=String(i);choose.setAttribute('aria-pressed',String(selected===i));text.append(choose);const remove=button('Remove',run(()=>{check();entries.splice(i,1);selected=-1;changed();}));remove.setAttribute('aria-label',`Remove ${hex(e.unicode)} ${hex(e.selector)}`);remove.disabled=busy;actions.append(remove);row.append(text,target,actions);body.append(row);}
        table.append(head,body);summary.textContent=`${matches.length} mappings · page ${page+1} / ${Math.max(1,Math.ceil(matches.length/100))}`;previous.disabled=page===0;next.disabled=(page+1)*100>=matches.length;
        // Large drafts stay paged; JSON is generated explicitly rather than on each edit.
    }
    async function compile(apply){if(busy)return;const data=candidate();invalidate();const n=generation;busy=true;applyButton.disabled=validateButton.disabled=true;
        try{status.textContent='Compiling Unicode variation mappings…';const result=await app.compiler.compile(data,{format:'ttf',masterId,validate:true},{key,signal:abort.signal,priority:5,timeout:60000});check();if(generation!==n)throw new Error('Draft changed during compilation; validate again.');
            const loaded=await new FontFace(family,result.bytes).load();check();if(generation!==n)throw new Error('Draft changed while loading the proof; validate again.');
            if(apply){app.history.execute('Edit Unicode variation sequences',()=>{doc.data.variationSequences=structuredClone(entries);});d.close();}
            else{face=loaded;document.fonts.add(face);const record=entries[selected]??entries[0];proof.textContent=record?String.fromCodePoint(record.unicode)+'  '+String.fromCodePoint(record.unicode,record.selector):'No variation mappings';proof.hidden=false;proof.dataset.ready='true';status.textContent=`Validated ${entries.length} mappings in a compiled TrueType font. Left: base alone; right: base + selector. Source unchanged.`;}
        }finally{busy=false;if(!abort.signal.aborted){applyButton.disabled=validateButton.disabled=false;render();}}}
    const validateButton=button('Validate UVS proof',run(()=>compile(false))),applyButton=button('Apply mappings',run(()=>compile(true)),{className:'primary'});
    form.append(base.element,selector.element,glyph.element,button('Add / replace mapping',run(add)),el('p','cf-muted','Selectors: FE00–FE0F, E0100–E01EF, and Mongolian 180B–180D / 180F. These encode glyph selection, not variable-font axis coordinates. No standardized registration is implied. Script-specific shaping may process selectors through layout rather than cmap14; glyph zero remains a missing-glyph record.'),button('Copy draft to JSON',()=>{json.value=JSON.stringify(entries,null,2);details.open=true;}),button('Export mappings JSON',run(()=>download(JSON.stringify(entries,null,2),'variation-sequences.json','application/json'))));
    d.element.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();event.stopPropagation();run(()=>compile(true))();}},{signal:abort.signal});
    table.addEventListener('keydown',event=>{const choices=[...table.querySelectorAll('[data-uvs-index]')],index=choices.indexOf(document.activeElement);if(index<0||!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const target=event.key==='Home'?0:event.key==='End'?choices.length-1:Math.max(0,Math.min(choices.length-1,index+(event.key==='ArrowDown'?1:-1))),id=choices[target].dataset.uvsIndex;select(Number(id));table.querySelector(`[data-uvs-index="${id}"]`).focus();},{signal:abort.signal});
    filter.input.addEventListener('input',()=>{page=0;render();},{signal:abort.signal});
    main.append(filter.element,table,paging,proof,details);layout.append(form,main);d.body.append(layout,status);d.footer.append(button('Cancel',d.close),validateButton,applyButton);render();status.textContent='Mappings are staged locally until Apply.';return d;
}
