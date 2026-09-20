import {FontDocument} from '@wieslawsoltes/counterform-model';
import {modelForDocument} from '@wieslawsoltes/counterform-variations';
import {normalizeAxisMap,encodeAvar} from '@wieslawsoltes/counterform-varstore';
import {analyzeContours,segmentProperties,segments,toSVG,uid} from '@wieslawsoltes/counterform-geometry';
import {parseFeatures} from '@wieslawsoltes/counterform-opentype';
import {download} from '@wieslawsoltes/counterform-storage';
import {el,button,dialog,field} from './ui.js';

const svgNS='http://www.w3.org/2000/svg';
const svg=(tag,attrs={})=>{const n=document.createElementNS(svgNS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const errorBox=()=>{const e=el('p','cf-advanced-status');e.setAttribute('role','status');e.setAttribute('aria-live','polite');return e;};
const numeric=(f,min=-32768,max=32767)=>{const text=f.input.value.trim(),n=Number(text);if(!text||!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${f.input.getAttribute('aria-label')} requires an integer in ${min}…${max}`);return n;};

/** Modal work owns one cancellation lifetime and an optimistic source-revision guard. */
function session(app,d) {
    const doc=app.doc,id=doc.data.id,revision=doc.revision,masterId=app.editor.masterId,draft=app.featureText.value,abort=new AbortController(),key=uid('authoring');
    const dispose=()=>{if(d.element.open)d.close();abort.abort();app.compiler.cancelKey(key);};app.disposables.push(dispose);
    d.element.addEventListener('close',()=>{abort.abort();app.compiler.cancelKey(key);const i=app.disposables.indexOf(dispose);if(i>=0)app.disposables.splice(i,1);},{once:true});
    return {doc,id,revision,masterId,draft,key,signal:abort.signal,alive:()=>!abort.signal.aborted&&d.element.open&&d.element.isConnected,
        check(){if(abort.signal.aborted||!d.element.open||!d.element.isConnected)throw new DOMException('Editor closed','AbortError');if(app.doc!==doc||doc.data.id!==id||doc.revision!==revision||app.editor.masterId!==masterId||app.editor.readOnly||app.featureText.value!==draft)throw new Error('Source, master or feature draft changed. Reopen this editor before applying.');}};
}
function action(status,run) {return async()=>{try{status.dataset.error='false';await run();}catch(e){if(e.name==='AbortError')return;status.dataset.error='true';status.textContent=e.message;}};}
export function registerAdvancedCommands(app) {
    const add=(id,label,execute,enabled)=>app.commands.register({id,label,execute,enabled,keys:[],repeat:false});
    add('features.attachments','OpenType attachment editor',()=>showAttachmentEditor(app),()=>!app.editor.readOnly);
    add('axis.map','Axis mapping',()=>showAxisMapping(app),()=>!app.editor.readOnly&&app.doc.data.axes.length>0);
    add('outline.analyze','Outline measurements & curvature',()=>showOutlineAnalysis(app),()=>!!app.editor.layer);
}

/** Author static anchor lookups as ordinary editable FEA, then verify actual compiler bytes. */
export function showAttachmentEditor(app) {
    const d=dialog('OpenType attachment editor',{wide:true,className:'cf-advanced-dialog',subtitle:'Cursive, base, ligature and mark-to-mark lookups. Templates append editable FEA; coordinates are static font units.'}),s=session(app,d);
    const layout=el('div','cf-advanced-layout'),form=el('div','cf-advanced-fields'),source=el('div','cf-advanced-source'),status=errorBox();
    const names=s.doc.data.glyphs.filter(g=>g.export!==false&&/^[\w.$][\w.$-]*$/.test(g.name)).map(g=>g.name);
    const targetName=names.includes(app.editor.glyph.name)?app.editor.glyph.name:names[0];
    const type=field('Attachment type','base',{options:[{value:'base',label:'Mark to base'},{value:'ligature',label:'Mark to ligature'},{value:'mark',label:'Mark to mark'},{value:'cursive',label:'Cursive joining'}]}),target=field('Target glyph',targetName,{options:names}),mark=field('Mark / next glyph',names.find(n=>n.includes('comb'))||names.find(n=>n!==targetName)||names[0],{options:names});
    const targetX=field('Target anchor X',320,{type:'number',step:1}),targetY=field('Target anchor Y',700,{type:'number',step:1}),markX=field('Mark / entry X',0,{type:'number',step:1}),markY=field('Mark / entry Y',0,{type:'number',step:1}),components=field('Ligature components',2,{type:'number',min:1,max:64,step:1}),step=field('Component advance',300,{type:'number',step:1}),rtl=field('Cursive direction','ltr',{options:[{value:'ltr',label:'Left to right'},{value:'rtl',label:'Right to left'}]});
    for(const f of [type,target,mark,targetX,targetY,markX,markY,components,step,rtl])form.append(f.element);
    const textarea=el('textarea','cf-advanced-code');textarea.setAttribute('aria-label','Attachment feature source');textarea.spellcheck=false;textarea.value=s.draft;
    source.append(el('h3','','Complete feature source'),textarea,el('p','cf-muted','Existing feature text is retained. Named lookups may be called from contextual rules. Use a distinct mark glyph; the compiler infers GDEF classes.'));
    const sample=field('Attachment preview text','AV'),proof=el('div','cf-attachment-proof');proof.setAttribute('aria-label','Compiled attachment proof');proof.setAttribute('role','img');proof.hidden=true;const family='CF_attach_'+s.key.replace(/[^a-zA-Z0-9]/g,'');let previewFace=null;
    proof.style.fontFamily=`"${family}"`;sample.input.addEventListener('input',()=>proof.textContent=sample.input.value,{signal:s.signal});source.append(sample.element,proof);
    d.element.addEventListener('close',()=>{if(previewFace)document.fonts.delete(previewFace);previewFace=null;},{once:true});
    const update=()=>{components.element.hidden=step.element.hidden=type.input.value!=='ligature';rtl.element.hidden=type.input.value!=='cursive';};type.input.addEventListener('change',update,{signal:s.signal});update();
    function insert(){
        s.check();const t=target.input.value,m=mark.input.value;if(!t||!m||t===m)throw new Error('Choose distinct target and mark / next glyphs');
        const x=numeric(targetX),y=numeric(targetY),mx=numeric(markX),my=numeric(markY);const g=n=>'\\'+n;
        let index=1;while(textarea.value.includes(`@CF_attach_${index}`)||textarea.value.includes(`CF_Cursive_${index}`))index++;
        const cls=`@CF_attach_${index}`;let text='\n# Counterform attachment lookup\n';
        if(type.input.value==='cursive'){
            text+=`lookup CF_Cursive_${index} {\n  lookupflag ${rtl.input.value==='rtl'?'RightToLeft':'0'};\n  pos cursive ${g(t)} <anchor NULL> <anchor ${x} ${y}>;\n  pos cursive ${g(m)} <anchor ${mx} ${my}> <anchor NULL>;\n} CF_Cursive_${index};\nfeature curs { lookup CF_Cursive_${index}; } curs;\n`;
        }else{
            text+=`markClass ${g(m)} <anchor ${mx} ${my}> ${cls};\n`;const tag=type.input.value==='mark'?'mkmk':'mark';
            text+=`feature ${tag} {\n  pos ${type.input.value} ${g(t)}`;
            const n=type.input.value==='ligature'?numeric(components,1,64):1,advance=n>1?numeric(step):0;
            for(let i=0;i<n;i++){const tx=x+i*advance;if(tx < -32768 || tx >32767)throw new RangeError('Component anchor exceeds int16 range');text+=`${i?' ligComponent':''}\n    <anchor ${tx} ${y}> mark ${cls}`;}
            text+=`;\n} ${tag};\n`;
        }
        textarea.value+=text;const chars=[t,m].map(n=>s.doc.glyph(n)?.unicodes?.[0]);if(chars.every(Number.isInteger))sample.input.value=String.fromCodePoint(...chars);proof.hidden=true;status.textContent='Template appended. Edit the source, then Validate or Apply.';
    }
    form.append(button('Append attachment',action(status,insert)));
    let busy=false;
    const validate=async(apply)=>{
        if(busy)return;busy=true;applyButton.disabled=validateButton.disabled=true;textarea.readOnly=true;
        const candidateText=textarea.value;
        try{
            s.check();parseFeatures(candidateText,new Set(s.doc.data.glyphs.map(g=>g.name)));
            const data=structuredClone(s.doc.data);data.features=candidateText;new FontDocument(data);
            status.textContent='Compiling attachment tables…';const result=await app.compiler.compile(data,{format:'ttf',masterId:s.masterId},{signal:s.signal,key:s.key,priority:5,timeout:60000});s.check();
            const face=await new FontFace(family,result.bytes).load();s.check();
            if(textarea.value!==candidateText)throw new Error('Feature source changed while compiling; validate again');
            if(apply){app.history.execute('Edit OpenType attachments',()=>app.doc.data.features=candidateText);app.featureText.value=candidateText;d.close();app.activate('features');}
            else {if(previewFace)document.fonts.delete(previewFace);previewFace=face;document.fonts.add(face);proof.textContent=sample.input.value;proof.hidden=false;status.textContent=`Validated ${(result.bytes.length/1024).toFixed(1)} KiB TrueType font using ${app.compiler.backend}. Source is unchanged.`;}
        }finally{busy=false;if(s.alive()){applyButton.disabled=validateButton.disabled=false;textarea.readOnly=false;}}
    };
    const validateButton=button('Validate compiled font',action(status,()=>validate(false))),applyButton=button('Apply attachments',action(status,()=>validate(true)),{className:'primary'});
    textarea.addEventListener('input',()=>{proof.hidden=true;status.textContent='Source changed; validate the new draft to refresh the proof.';},{signal:s.signal});
    textarea.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();e.stopPropagation();action(status,()=>validate(true))();}},{signal:s.signal});
    layout.append(form,source);d.body.append(layout,status);d.footer.append(button('Cancel',d.close),validateButton,applyButton);return d;
}

/** Source axis maps use normalized coordinates; both preview and exported avar share quantization. */
export function showAxisMapping(app) {
    if(!app.doc.data.axes.length)throw new Error('Add a variation axis first');
    const d=dialog('Axis mapping',{wide:true,className:'cf-advanced-dialog',subtitle:'Map normalized input to interpolation space. −1, 0 and 1 stay fixed. Saved values use OpenType F2DOT14 precision.'}),s=session(app,d);
    const data=structuredClone(s.doc.data),layout=el('div','cf-advanced-layout'),left=el('div','cf-advanced-fields'),right=el('div','cf-axis-map-preview'),status=errorBox();
    const axis=field('Mapping axis',data.axes[0].tag,{options:data.axes.map(a=>({value:a.tag,label:`${a.name} · ${a.tag}`}))}),table=el('table','cf-axis-map-table'),chart=svg('svg',{viewBox:'0 0 320 320',role:'img','aria-label':'Axis interpolation mapping'});
    const read=()=>normalizeAxisMap([...table.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll('input')].map(i=>{if(!i.value.trim())throw new Error('Mapping coordinates cannot be blank');return Number(i.value);})));const current=()=>data.axes.find(a=>a.tag===axis.input.value);let selected=axis.input.value;
    function draw(points){chart.replaceChildren(svg('rect',{x:20,y:20,width:280,height:280,fill:'none',stroke:'currentColor',opacity:.3}),svg('path',{d:'M20 160H300M160 20V300M20 300L300 20',fill:'none',stroke:'currentColor',opacity:.25}));
        chart.append(svg('polyline',{points:points.map(([x,y])=>`${160+140*x},${160-140*y}`).join(' '),fill:'none',stroke:'#357bf5','stroke-width':3}));
        points.forEach(([x,y])=>chart.append(svg('circle',{cx:160+140*x,cy:160-140*y,r:4,fill:'#357bf5'})));
    }
    function render(points){
        table.replaceChildren();const head=el('thead'),tr=el('tr');for(const text of ['Input','Output',''])tr.append(el('th','',text));head.append(tr);const body=el('tbody');table.append(head,body);
        points.forEach(([from,to],i)=>{const row=el('tr');const required=[-1,0,1].includes(from);for(const [label,value]of [['Input',from],['Output',to]]){const td=el('td'),f=field(`${label} mapping ${i+1}`,value,{type:'number',min:-1,max:1,step:1/16384});f.input.readOnly=required;td.append(f.element);row.append(td);}
            const td=el('td'),remove=button('Remove',action(status,()=>{const p=read();p.splice(i,1);current().map=p;render(p);}));remove.disabled=required;td.append(remove);row.append(td);body.append(row);});draw(points);
    }
    const validate=()=>{const map=read();current().map=map;modelForDocument(new FontDocument(data));draw(map);status.dataset.error='false';status.textContent=`${map.length} points · ${encodeAvar(data.axes)?.length||0} avar bytes · monotonic mapping valid`;return map;};
    table.addEventListener('change',action(status,validate),{signal:s.signal});
    axis.input.addEventListener('change',action(status,()=>{const next=axis.input.value;axis.input.value=selected;try{validate();}catch(e){throw e;}axis.input.value=selected=next;render(normalizeAxisMap(current().map));}),{signal:s.signal});
    const add=()=>{const points=read();if(points.length>=256)throw new RangeError('The interactive editor supports at most 256 points (headless codec: 4096)');let index=0;for(let i=1;i<points.length-1;i++)if(points[i+1][0]-points[i][0]>points[index+1][0]-points[index][0])index=i;const a=points[index],b=points[index+1];points.splice(index+1,0,[(a[0]+b[0])/2,(a[1]+b[1])/2]);current().map=normalizeAxisMap(points);render(current().map);};
    left.append(axis.element,table,button('Add mapping point',action(status,add)),button('Identity mapping',()=>{current().map=normalizeAxisMap();render(current().map);status.textContent='Identity mapping staged; Apply to save.';}),button('Slow lower half',()=>{current().map=[[-1,-1],[-.5,-.75],[0,0],[.5,.25],[1,1]];render(current().map);status.textContent='Non-linear progression staged; Apply to save.';}));
    right.append(chart,el('p','cf-muted','Input → output. Master locations remain in user coordinates and are mapped with the same function as the instance. Flat intervals are legal unless they collapse distinct masters.'));
    layout.append(left,right);d.body.append(layout,status);
    const apply=()=>{s.check();validate();app.history.execute('Edit variation axis mapping',()=>app.doc.data.axes=structuredClone(data.axes));app.featureText.value=s.draft;d.close();};
    d.footer.append(button('Cancel',d.close),button('Validate mapping',action(status,validate)),button('Apply mapping',action(status,apply),{className:'primary'}));render(normalizeAxisMap(current().map));return d;
}

/** Read-only source/result measurements, including a signed curvature comb. */
export function showOutlineAnalysis(app) {
    const glyphName=app.editor.glyph.name,contours=structuredClone(app.renderer.scene.contours),result=analyzeContours(contours),d=dialog('Outline measurements & curvature',{wide:true,className:'cf-advanced-dialog',subtitle:`${app.editor.glyph.name} · current evaluated outline snapshot · no changes to source or selection`});
    const report=el('div','cf-analysis-summary'),fmt=n=>n===null?'—':Number(n.toFixed(5)).toLocaleString('en-US');
    for(const [key,value]of [['Contours',result.contours.length],['Segments',result.segmentCount],['Length (u)',result.length],['Length error bound (u)',result.lengthErrorBound],['Signed area (u²)',result.signedArea],['Centroid X',result.centroid?.x??null],['Centroid Y',result.centroid?.y??null]]){const row=el('div');row.append(el('span','cf-muted',key),el('strong','cf-mono',fmt(value)));report.append(row);}
    const list=el('select');list.setAttribute('aria-label','Analysis contour');contours.forEach((c,i)=>{const option=el('option','',`Contour ${i+1} · ${result.contours[i].orientation} · ${c.nodes.length} nodes`);option.value=String(i);list.append(option);});
    const chart=svg('svg',{viewBox:'0 0 720 420',role:'img','aria-label':'Signed curvature comb'}),detail=el('p','cf-muted');
    function render(){
        chart.replaceChildren();const index=Number(list.value),c=contours[index],row=result.contours[index];if(!c)return;
        const b=row.bounds,scale=Math.min(580/Math.max(1,b.width),300/Math.max(1,b.height)),x=70-b.minX*scale,y=350+b.minY*scale;
        const group=svg('g',{transform:`translate(${x} ${y}) scale(${scale} ${-scale})`});group.append(svg('path',{d:toSVG([c]),fill:'none',stroke:'currentColor','stroke-width':1.4/scale}));
        for(const edge of segments(c)){
            for(let i=0;i<=24;i++){const p=segmentProperties(edge,i/24);if(p.tangent&&p.curvature!==null){const length=Math.max(-50/scale,Math.min(50/scale,p.curvature*1500/(scale*scale)));group.append(svg('line',{x1:p.position.x,y1:p.position.y,x2:p.position.x-p.tangent.y*length,y2:p.position.y+p.tangent.x*length,stroke:'#357bf5','stroke-width':.7/scale}));}}
            for(const t of row.segments[edge.index].inflections){const p=segmentProperties(edge,t).position;group.append(svg('circle',{cx:p.x,cy:p.y,r:4/scale,fill:'#d79053'}));}
        }
        chart.append(group);detail.textContent=`Length ${fmt(row.length)} u · area ${fmt(row.signedArea)} u² · ${row.segments.reduce((n,s)=>n+s.inflections.length,0)} analytic inflections. Comb lengths are visualization-clamped; measurements are not.`;
    }
    list.addEventListener('change',render);d.body.append(report,list,chart,detail,el('p','cf-muted','Signed area is the algebraic Green integral, not Boolean-unioned ink area. Open contours have no enclosed area. Arc length uses chord/control-polygon bounds, not flatness sampling. '+(result.converged?'Requested length tolerance met.':'Subdivision budget reached; consult the reported error bound.')));
    const dispose=()=>d.close();app.disposables.push(dispose);d.element.addEventListener('close',()=>{const i=app.disposables.indexOf(dispose);if(i>=0)app.disposables.splice(i,1);},{once:true});
    d.footer.append(button('Export measurements',()=>download(JSON.stringify(result,null,2),glyphName+'-measurements.json','application/json')),button('Done',d.close,{className:'primary'}));render();return d;
}
