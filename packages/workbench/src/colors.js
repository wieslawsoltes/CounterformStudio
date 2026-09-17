import { FOREGROUND, parseColor, validateColorSource } from '@wieslawsoltes/counterform-color';
import {el,button,dialog,field} from './ui.js';

/** All edits are transactional; references are stable glyph IDs, never display names. */
export function showColorEditor(app) {
    const gid = app.editor.glyphId;
    const d = dialog('Color layers & palettes', {wide:true,subtitle:'COLRv0 fallback layers · CPALv0/v1 palettes · editable RGBA colors and names'});
    const hint = el('p','cf-muted','Layers are painted back-to-front. Choose Foreground to follow the text color. Edit a referenced glyph to change its outline.');
    d.body.append(hint,button('Color paint graph…',()=>{d.close();app.showPaints();}));
    const stack = el('div','cf-color-stack'), paletteHost = el('div','cf-color-palettes');
    const mutate = (label,action) => app.safe(() => {
        try { app.history.execute(label,() => {action();validateColorSource(app.doc.data);}); }
        finally { render(); }
    });
    function render() {
        const glyph = app.doc.glyph(gid);
        if (!glyph) { d.close(); return; }
        stack.replaceChildren(el('h3','',`${glyph.name} · ${glyph.colorLayers?.length || 0} layers`));
        const layers = glyph.colorLayers || [];
        layers.forEach((layer,index) => {
            const row = el('div','cf-color-row');
            const glyphField = field(`Layer ${index+1} glyph`,layer.glyphId,{options:app.doc.data.glyphs.filter(g=>g.export!==false).map(g=>({value:g.id,label:g.name}))});
            const paletteField = field(`Layer ${index+1} color`,layer.paletteIndex,{options:[...app.doc.data.palettes[0].map((color,i)=>({value:String(i),label:`${i} · ${color}`})),{value:String(FOREGROUND),label:'Foreground'}]});
            glyphField.input.addEventListener('change',()=>mutate('Change color layer glyph',()=>layer.glyphId=glyphField.input.value));
            paletteField.input.addEventListener('change',()=>mutate('Change color layer palette index',()=>layer.paletteIndex=Number(paletteField.input.value)));
            const up=button('↑',()=>mutate('Move color layer backward',()=>[layers[index-1],layers[index]]=[layers[index],layers[index-1]]),{title:`Move layer ${index+1} backward`});
            const down=button('↓',()=>mutate('Move color layer forward',()=>[layers[index+1],layers[index]]=[layers[index],layers[index+1]]),{title:`Move layer ${index+1} forward`});
            up.disabled=index===0;down.disabled=index===layers.length-1;
            row.append(glyphField.element,paletteField.element,up,down,button('Remove',()=>mutate('Remove color layer',()=>layers.splice(index,1)),{title:`Remove color layer ${index+1}`}));stack.append(row);
        });
        stack.append(button('+ Color layer',()=>mutate('Add color layer',()=>{(glyph.colorLayers??=[]).push({glyphId:gid,paletteIndex:Math.min(layers.length,app.doc.data.palettes[0].length-1)});})),el('p','cf-muted','Changes update the compiled live proof. The monochrome base outline remains editable and is used by renderers without color support.'));
        paletteHost.replaceChildren(el('h3','','Palettes'));
        app.doc.data.palettes.forEach((palette,p) => {
            const card=el('section','cf-palette-card');card.append(el('strong','',`Palette ${p}`));
            const name=field(`Palette ${p} name`,app.doc.data.paletteLabels?.[p]||'');
            name.input.addEventListener('change',()=>mutate('Name color palette',()=>{(app.doc.data.paletteLabels??=app.doc.data.palettes.map(()=>''))[p]=name.input.value;}));
            const type=field(`Palette ${p} background`,String(app.doc.data.paletteTypes?.[p]||0),{options:[{value:'0',label:'Any background'},{value:'1',label:'Light background'},{value:'2',label:'Dark background'},{value:'3',label:'Light and dark'}]});
            type.input.addEventListener('change',()=>mutate('Set palette usage',()=>{(app.doc.data.paletteTypes??=app.doc.data.palettes.map(()=>0))[p]=Number(type.input.value);}));
            card.append(name.element,type.element);
            palette.forEach((color,c) => {
                const row=el('div','cf-color-row'), swatch=field(`Palette ${p} entry ${c} picker`,color.slice(0,7),{type:'color'}), text=field(`Palette ${p} entry ${c} RGBA`,color);
                swatch.input.addEventListener('change',()=>mutate('Change palette color',()=>palette[c]=swatch.input.value+(color.length===9?color.slice(7):'')));
                text.input.addEventListener('change',()=>mutate('Change palette RGBA',()=>{parseColor(text.input.value);palette[c]=text.input.value;}));
                row.append(swatch.element,text.element);
                if(p===0){const label=field(`Entry ${c} name`,app.doc.data.paletteEntryLabels?.[c]||'');label.input.addEventListener('change',()=>mutate('Name palette entry',()=>{(app.doc.data.paletteEntryLabels??=palette.map(()=>''))[c]=label.input.value;}));row.append(label.element);}
                card.append(row);
            });
            const remove=button(`Remove palette ${p}`,()=>mutate('Remove palette',()=>{app.doc.data.palettes.splice(p,1);app.doc.data.paletteLabels?.splice(p,1);app.doc.data.paletteTypes?.splice(p,1);}));remove.disabled=app.doc.data.palettes.length===1;card.append(remove);paletteHost.append(card);
        });
        paletteHost.append(button('+ Palette',()=>mutate('Add palette',()=>{app.doc.data.palettes.push([...app.doc.data.palettes[0]]);app.doc.data.paletteLabels?.push('');app.doc.data.paletteTypes?.push(0);})),button('+ Color entry',()=>mutate('Add palette entry',()=>{app.doc.data.palettes.forEach(p=>p.push('#568ee8'));app.doc.data.paletteEntryLabels?.push('');})));
    }
    d.body.append(stack,paletteHost);
    d.footer.append(button('Undo',()=>{app.history.undo();render();}),button('Close',()=>d.close(),{className:'primary'}));
    const off=app.doc.changed.subscribe(render);d.element.addEventListener('close',off,{once:true});render(); return d;
}
