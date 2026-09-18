import {GlyphTiles} from '@wieslawsoltes/counterform-integrations';
import {createIcon, commandIcon} from '@wieslawsoltes/counterform-icons';
import {toSVG, bounds} from '@wieslawsoltes/counterform-geometry';
import {formatBinding} from '@wieslawsoltes/counterform-commands';
import {el, button, field, section, dialog, setValue} from './ui.js';
import {preferenceKey, normalizeWorkspacePreferences, resolvedTheme} from './workspace-preferences.js';
import {styleRibbon} from './ribbon-theme.js';
import {WorkspaceFocus} from './workspace-focus.js';

export function registerWorkspaceCommands(app) {
    const r = (id, label, execute, keys = [], extra = {}) => app.commands.register({id, label, execute, keys, repeat:false, ...extra});
    r('view.font', 'Font window', () => app.activate('font'), ['Mod+Alt+1']);
    r('view.library', 'Glyph navigator', () => app.workspaceUI.togglePanel('library'), [], {checked:() => app.workspaceUI?.visible('library')});
    r('view.ribbon', 'Expanded ribbon', () => app.workspaceUI.setPreference('ribbon', app.workspaceUI.preferences.ribbon === 'compact' ? 'expanded' : 'compact'), [], {checked:() => app.workspaceUI?.preferences.ribbon === 'expanded'});
    r('view.paper', 'White glyph canvas', () => app.workspaceUI.setPreference('canvas', app.workspaceUI.preferences.canvas === 'paper' ? 'theme' : 'paper'), [], {checked:() => app.workspaceUI?.preferences.canvas === 'paper'});
    r('view.trueFill', 'True outline fill', () => app.workspaceUI.setPreference('dimFill', !app.workspaceUI.preferences.dimFill), [], {checked:() => !app.workspaceUI?.preferences.dimFill});
    r('workspace.focus', 'Focus workspace', () => app.workspaceUI.toggleFocus(), ['Mod+Shift+Backslash'], {checked:() => !!app.workspaceUI?.focused});
    r('workspace.reset', 'Reset workspace layout', () => app.workspaceUI.resetLayout());
    r('workspace.preferences', 'Workspace preferences', () => app.workspaceUI.showPreferences(), ['Mod+Comma']);
}

/** Presentation/lifetime adapter. Original controls, document identities, and history are retained. */
let nextWorkspace=0;
export class WorkspaceUI {
    constructor(app) {
        this.app=app;this.disposed=false;this.pending=0;this.off=[];this.controls=[];
        this.preferences=normalizeWorkspacePreferences(null);this.focused=false;
        this.abort=new AbortController();this.signal=this.abort.signal;
        this.media=matchMedia('(prefers-color-scheme: dark)');
        this.id=++nextWorkspace;this.sections=new Map();this.elementSignature='';this.stripSignature='';
        this.write=Promise.resolve();
        this.focusRequest=new WorkspaceFocus(app.host.ownerDocument,callback=>requestAnimationFrame(callback),id=>cancelAnimationFrame(id));
        this.stripItems=new Map();
    }
    prepare() {
        const a=this.app;
        a.host.dataset.workspace='desktop';
        a.fontPane=el('div','cf-font-window');
        const toolbar=el('div','cf-font-toolbar');
        this.fontName=el('strong','cf-font-name');
        const search=el('input','cf-font-search');search.type='search';search.placeholder='Search name, character or Unicode';search.setAttribute('aria-label','Search font window');
        search.addEventListener('input',()=>a.state.SetValue('query',search.value),{signal:this.signal});this.fontSearch=search;
        this.cellSlider=el('input');this.cellSlider.type='range';this.cellSlider.min=56;this.cellSlider.max=144;this.cellSlider.value=this.preferences.cellSize;
        this.cellSlider.setAttribute('aria-label','Glyph cell size');
        this.cellSlider.addEventListener('input',()=>this.setPreference('cellSize',Number(this.cellSlider.value)),{signal:this.signal});
        toolbar.append(this.fontName,el('div','cf-spacer'),search,this.cellSlider,this.commandButton('view.catalog','Table','grid'));
        const body=el('div','cf-font-body'),categories=el('nav','cf-font-categories');categories.setAttribute('aria-label','Font categories');
        categories.append(el('h3','','GLYPH SETS'));this.categories=[];
        for(const [id,label] of [['all','All glyphs'],['uppercase','Uppercase'],['lowercase','Lowercase'],['numbers','Figures'],['components','Composites'],['marks','Marks']]) {
            const b=button(label,()=>a.state.SetValue('category',id));b.dataset.fontCategory=id;b.setAttribute('aria-pressed','false');categories.append(b);this.categories.push(b);
        }
        const note=el('p','cf-muted','Original outlines\nLocal-first editing');categories.append(el('div','cf-spacer'),note);
        const grid=el('div','cf-font-grid');body.append(categories,grid);
        const footer=el('div','cf-font-footer');this.fontCount=el('span');
        footer.append(this.fontCount,el('div','cf-spacer'),this.commandButton('glyph.new','Add glyph','new'),this.commandButton('font.info','Font Info','font'));
        a.fontPane.append(toolbar,body,footer);
        this.fontTiles=new GlyphTiles(grid,a.doc,a.state,id=>a.selectGlyph(id),{cellSize:this.preferences.cellSize});
        this.fontTiles.scroll.setAttribute('aria-label','Font window glyphs');
        this.fontTiles.onOpen=id=>this.openGlyph(id);
        this.reorganizeInspector();this.buildPropertyBar();this.buildGlyphStrip();this.buildStatus();
    }
    openGlyph(id) {
        this.app.selectGlyph(id);
        this.focusGlyph({fit:true});
    }
    focusGlyph({fit=false}={}) {
        if(this.disposed)return;
        const a=this.app,docId=a.doc.data.id,glyphId=a.editor.glyphId,masterId=a.editor.masterId;
        // Publish the tab title/strip before Dockyard renders and before focus is
        // handed off. A later click, key, dialog or document switch cancels it.
        this.update();a.activate('glyph');
        this.focusRequest.request(a.renderer.overlay,{
            valid:()=>!this.disposed&&a.doc.data.id===docId&&a.editor.glyphId===glyphId
                &&a.editor.masterId===masterId&&a.dock.Find('glyph')?.IsSelected,
            ready:()=>{if(fit)a.renderer.fit();}
        });
    }
    commandButton(id, label='', icon=commandIcon(id)) {
        const b=button(label,()=>this.app.commands.run(id),{className:label?'cf-command-button':'cf-icon-button'});
        b.prepend(createIcon(icon));b.dataset.command=id;
        b.setAttribute('aria-label',label||this.app.commands.commands.get(id)?.label||id);
        this.controls.push({id,b});return b;
    }
    reorganizeInspector() {
        const a=this.app;
        const existing=new Map([...a.inspector.querySelectorAll(':scope>.cf-inspector-section')].map(e=>[e.querySelector('h3').textContent,e]));
        const font=section('Fonts');this.fontIdentity=el('button','cf-font-identity');this.fontIdentity.type='button';
        this.fontIdentity.addEventListener('click',()=>a.activate('font'),{signal:this.signal});font.element.append(this.fontIdentity);
        const elements=section('Elements');this.elements=el('div','cf-elements-list');this.elements.setAttribute('role','listbox');this.elements.setAttribute('aria-label','Glyph contours');this.elements.setAttribute('aria-multiselectable','true');elements.element.append(this.elements);
        this.elements.addEventListener('keydown',e=>{
            const buttons=[...this.elements.querySelectorAll('[role=option]')],i=buttons.indexOf(document.activeElement);
            if(i<0)return;const next=e.key==='ArrowDown'?Math.min(i+1,buttons.length-1):e.key==='ArrowUp'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;
            if(next>=0){e.preventDefault();buttons.forEach((b,j)=>b.tabIndex=j===next?0:-1);buttons[next].focus();}
        },{signal:this.signal});
        const transform=section('Transform'),actions=el('div','cf-transform-actions');
        for(const [id,icon] of [['node.alignX','alignX'],['node.alignY','alignY'],['outline.mirrorX','mirror'],['outline.mirrorY','mirror'],['outline.transform','scale'],['outline.modifiers','settings']])actions.append(this.commandButton(id,'',icon));
        transform.element.append(actions);
        const specs=[['font',font.element],['layers',existing.get('Source layers')],['glyph',existing.get('Glyph properties')],['metrics',existing.get('Metrics')],['selection',existing.get('Selection')],['elements',elements.element],['transform',transform.element],['anchors',existing.get('Anchors')],['components',existing.get('Components')],['modifiers',existing.get('Outline modifiers')],['color',existing.get('Color font')]];
        const renames={layers:'Layers & Masters',glyph:'Glyph',selection:'Node'};
        const footer=a.inspector.querySelector('.cf-inspector-actions');
        for(const [id,block] of specs) {
            if(!block)continue;
            const head=block.querySelector('.cf-section-heading'),heading=head.querySelector('h3');
            if(renames[id])heading.textContent=renames[id];
            const toggle=button('',()=>{this.preferences.sections[id]=!this.preferences.sections[id];this.applySection(id);this.persist();});
            toggle.className='cf-palette-heading';toggle.append(el('span','cf-disclosure','▾'),heading);
            const content=el('div','cf-palette-body');content.id=`cf-palette-${this.id}-${id}`;
            for(const child of [...block.children])if(child!==head)content.append(child);
            head.prepend(toggle);block.append(content);block.dataset.palette=id;
            toggle.setAttribute('aria-controls',content.id);this.sections.set(id,{block,toggle,content});
            a.inspector.append(block);this.applySection(id);
        }
        if(footer)a.inspector.append(footer);
    }
    applySection(id) {
        const section=this.sections.get(id);if(!section)return;
        const open=this.preferences.sections[id];section.content.hidden=!open;section.toggle.setAttribute('aria-expanded',String(open));
        section.block.classList.toggle('collapsed',!open);
    }
    buildPropertyBar() {
        const a=this.app,nav=el('div','cf-glyph-navigation');
        nav.append(this.commandButton('glyph.previous','','chevronLeft'),this.commandButton('glyph.next','','chevronRight'));
        a.contextbar.prepend(nav);this.metrics=new Map();
        const metrics=el('div','cf-inline-metrics');
        for(const [key,label,caption] of [['lsb','Left sidebearing','L'],['advanceWidth','Glyph advance width','↔'],['rsb','Right sidebearing','R']]) {
            const wrapper=el('label','cf-inline-field'),input=el('input');input.type='number';input.step=1;input.setAttribute('aria-label',label);
            wrapper.append(el('span','',caption),input);metrics.append(wrapper);this.metrics.set(key,input);
            // Both surfaces share the same validation and undo transaction boundary.
            input.addEventListener('change',()=>a.safe(()=>a.setGlyphMetric(key,input.value===''?NaN:input.valueAsNumber)).finally(()=>{
                if(!this.disposed)input.value=+a.doc.metrics(a.editor.glyphId,a.editor.masterId)[key].toFixed(2);
            }),{signal:this.signal});
        }
        a.contextbar.insertBefore(metrics,a.masterSelect);
    }
    buildGlyphStrip() {
        this.strip=el('div','cf-glyph-strip');this.strip.setAttribute('role','toolbar');this.strip.setAttribute('aria-label','Adjacent glyphs');
        this.app.editorPane.append(this.strip);
        this.strip.setAttribute('aria-orientation','horizontal');
        this.stripLabel=el('span','cf-strip-label','GLYPHS');this.strip.append(this.stripLabel);
        this.strip.addEventListener('click',e=>{const b=e.target.closest?.('[data-strip-glyph]');if(b&&this.strip.contains(b)){this.app.selectGlyph(b.dataset.stripGlyph);this.focusGlyph();}},{signal:this.signal});
        this.strip.addEventListener('keydown',e=>{
            const buttons=[...this.strip.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);
            if(i<0)return;const n=e.key==='ArrowRight'?Math.min(buttons.length-1,i+1):e.key==='ArrowLeft'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;
            if(n>=0){e.preventDefault();buttons.forEach((b,j)=>b.tabIndex=j===n?0:-1);buttons[n].focus();}
        },{signal:this.signal});
    }
    buildStatus() {
        const a=this.app;this.statusControls=el('div','cf-status-controls');
        this.zoomInput=el('input','cf-zoom-input');this.zoomInput.type='number';this.zoomInput.min=2.5;this.zoomInput.max=6400;this.zoomInput.step=5;this.zoomInput.setAttribute('aria-label','Canvas zoom percent');
        this.zoomInput.addEventListener('change',()=>a.safe(()=>{
            const n=this.zoomInput.valueAsNumber;if(!Number.isFinite(n)||n<2.5||n>6400){this.zoomInput.value=+(a.renderer.camera.scale*100).toFixed(1);throw new RangeError('Zoom must be between 2.5% and 6400%.');}
            a.zoom(n/(a.renderer.camera.scale*100));
        }),{signal:this.signal});
        this.statusControls.append(this.commandButton('view.snap','Snap','snap'),this.commandButton('view.grid','','grid'),this.commandButton('view.zoomOut','','minus'),this.zoomInput,el('span','','%'),this.commandButton('view.zoomIn','','plus'),this.commandButton('view.fit','Fit','fit'));
        a.statusbar.append(this.statusControls);
    }
    async install() {
        const a=this.app;
        this.defaultLayout=a.dock.SaveLayout();
        this.off.push(styleRibbon(a.ribbon));
        a.panelRail=el('aside','cf-panels-rail');a.panelRail.setAttribute('role','toolbar');a.panelRail.setAttribute('aria-label','Panels list');
        for(const [id,label,icon] of [['view.font','Font window','grid'],['view.glyph','Glyph window','pen'],['view.inspector','Properties','settings'],['view.masters','Layers and variations','layers'],['view.proof','Preview','preview'],['view.kerning','Kerning','kern'],['view.features','OpenType','code'],['color.paint','Color paint graph','palette'],['view.notes','Notes','note'],['view.output','Output','code'],['view.library','Glyph navigator','grid']]){
            const b=this.commandButton(id,'',icon);b.setAttribute('aria-label',label);a.panelRail.append(b);
        }
        a.panelRail.append(el('div','cf-spacer'),this.commandButton('workspace.focus','','fullscreen'),this.commandButton('workspace.preferences','','settings'));
        a.workHost.append(a.panelRail);this.rovingRail(a.panelRail);
        const options=this.commandButton('workspace.preferences','','settings');a.header.querySelector('.cf-top-actions').prepend(options);
        const paletteToggle=a.header.querySelector('.cf-palette-toggle');paletteToggle.replaceChildren(createIcon('search'));paletteToggle.setAttribute('aria-label','Command palette');
        for(const id of ['inspector','masters','proof','output']){
            const command=a.commands.commands.get('view.'+id);command.execute=()=>this.togglePanel(id);command.checked=()=>this.visible(id);
        }
        this.off.push(a.doc.changed.subscribe(()=>this.schedule()),a.editor.changed.subscribe(()=>this.schedule()),a.editor.selectionChanged.subscribe(()=>this.schedule()),a.commands.changed.subscribe(()=>this.schedule()),a.renderer.changed.subscribe(()=>this.updateZoom()),a.state.Changed.subscribe(()=>this.schedule()));
        this.off.push(a.dock.ActiveContentChanged.add(()=>this.schedule()),a.dock.LayoutUpdated.add(()=>{if(this.preferencesLoaded&&!this.focused&&this.preferences.navigator!==this.visible('library')){this.preferences.navigator=this.visible('library');this.persist();}this.schedule();}));
        this.media.addEventListener('change',()=>this.applyTheme(),{signal:this.signal});
        a.inspector.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();this.focusGlyph();}},{signal:this.signal});
        // Preferences load once. No source mutation and no stored code is evaluated.
        try{this.preferences=normalizeWorkspacePreferences(await a.store.preference(preferenceKey));}catch{ /* storage can be unavailable */ }
        if(this.disposed)return;
        this.applyAppearance();this.applyNavigator();this.preferencesLoaded=true;this.update();
    }
    rovingRail(rail) {
        const buttons=[...rail.querySelectorAll('button')];buttons.forEach((b,i)=>b.tabIndex=i?-1:0);
        rail.setAttribute('aria-orientation','vertical');
        rail.addEventListener('keydown',e=>{const i=buttons.indexOf(document.activeElement);if(i<0)return;
            const n=e.key==='ArrowDown'?(i+1)%buttons.length:e.key==='ArrowUp'?(i+buttons.length-1)%buttons.length:e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;
            if(n>=0){e.preventDefault();buttons.forEach((b,j)=>b.tabIndex=j===n?0:-1);buttons[n].focus();}
        },{signal:this.signal});
    }
    visible(id) {const m=this.app.dock?.Find(id);return !!m&&!m.IsHidden;}
    togglePanel(id) {
        const a=this.app,m=a.dock.Find(id);if(!m)return;
        if(id==='library'){
            this.preferences.navigator=!this.visible(id);this.applyNavigator();this.persist();
        }else if(m.IsActive&&!m.IsHidden){m.Hide();a.activate('glyph');}
        else {if(m.IsHidden)m.Show();a.dock.Activate(m);}
        this.schedule();
    }
    applyNavigator(){const m=this.app.dock.Find('library');if(this.preferences.navigator)m.Show();else m.Hide();}
    setPreference(key,value) {
        this.preferences=normalizeWorkspacePreferences({...this.preferences,[key]:value});this.applyAppearance();if(key==='navigator')this.applyNavigator();this.persist();this.schedule();
    }
    applyAppearance() {
        const a=this.app,p=this.preferences;a.host.dataset.ribbon=p.ribbon;
        a.ribbon.layout=p.ribbon==='compact'?'simplified':'classic';a.ribbon.minimized=false;
        this.fontTiles.cellSize=p.cellSize;this.fontTiles.schedule();this.cellSlider.value=p.cellSize;
        a.renderer.dimFill=p.dimFill;this.applyTheme();
        for(const key of this.sections.keys())this.applySection(key);
        a.menus?.refresh();this.refreshControls();
    }
    applyTheme() {
        const a=this.app;a.theme=resolvedTheme(this.preferences.theme,this.media.matches);
        a.host.dataset.theme=a.theme;document.documentElement.dataset.cfTheme=a.theme;
        a.dock.Theme=a.theme;a.ribbon.setAttribute('theme',a.theme);
        a.renderer.dark=this.preferences.canvas==='theme'&&a.theme==='dark';a.renderer.invalidate();
        a.table.element.setAttribute('theme',a.theme);a.kerning.element.setAttribute('theme',a.theme);
        a.host.dataset.canvas=this.preferences.canvas;
    }
    persist() {
        const snapshot=structuredClone(this.preferences);
        this.write=this.write.catch(()=>{}).then(()=>this.disposed?undefined:this.app.store.preference(preferenceKey,snapshot)).catch(()=>{});
        return this.write;
    }
    toggleFocus() {
        const a=this.app;a.editor.cancel();
        if(!this.focused){this.focusLayout=a.dock.SaveLayout();this.focused=true;for(const id of ['library','inspector','masters','proof','output'])a.dock.Find(id)?.Hide();}
        else {a.dock.LoadLayout(this.focusLayout);a.layout=a.dock.Layout;this.focused=false;}
        a.host.dataset.focus=String(this.focused);this.focusGlyph();this.schedule();
    }
    resetLayout() {
        const a=this.app;a.editor.cancel();a.dock.LoadLayout(this.defaultLayout);a.layout=a.dock.Layout;
        this.focused=false;a.host.dataset.focus='false';this.preferences.navigator=false;this.applyNavigator();a.activate('glyph');this.persist();
        this.focusGlyph({fit:true});this.schedule();
    }
    schedule() {if(this.disposed||this.pending)return;this.pending=requestAnimationFrame(()=>{this.pending=0;this.update();});}
    refreshControls(){
        const a=this.app;
        for(const {id,b} of this.controls){const c=a.commands.commands.get(id);b.disabled=!a.commands.canExecute(id);
            b.title=[c?.label,...(a.commands.bindings.get(id)||[]).map(k=>formatBinding(k,a.commands.isMac))].join(' · ');
            if(c?.checked){b.setAttribute('aria-pressed',String(!!c.checked()));b.classList.toggle('active',!!c.checked());}
        }
        for(const b of a.toolRail.querySelectorAll('[data-tool]')){const id='tool.'+b.dataset.tool;b.title=[a.commands.commands.get(id)?.label,...(a.commands.bindings.get(id)||[]).map(k=>formatBinding(k,a.commands.isMac))].join(' · ');}
    }
    updateZoom(){if(this.zoomInput)setValue(this.zoomInput,+((this.app.renderer.camera.scale)*100).toFixed(1));}
    update() {
        if(this.disposed)return;const a=this.app,g=a.editor.glyph,l=a.editor.layer;if(!g||!l)return;
        this.fontName.textContent=a.doc.info.familyName;this.fontIdentity.textContent=a.doc.info.familyName;
        this.fontIdentity.title=`${a.doc.data.glyphs.length} glyphs · ${a.doc.data.masters.length} masters — open Font window`;
        this.fontCount.textContent=`${this.fontTiles.rows.length} of ${a.doc.data.glyphs.length} glyphs · ${a.doc.info.unitsPerEm} UPM`;
        for(const b of this.categories){const active=b.dataset.fontCategory===a.state.GetValue('category');b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);}
        for(const b of a.categoryButtons){const active=b.dataset.category===a.state.GetValue('category');b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}
        setValue(this.fontSearch,a.state.GetValue('query'));setValue(a.searchInput,a.state.GetValue('query'));
        const metric=a.doc.metrics(g.id,a.editor.masterId);for(const [key,input] of this.metrics){setValue(input,+metric[key].toFixed(2));input.disabled=!a.editor.canEdit;}
        this.updateZoom();this.refreshControls();if(!a.editor.drag){this.updateElements();this.updateStrip();}
        const glyphTab=a.dock.Find('glyph'),title=`${g.name} · Glyph`;
        if(glyphTab.Title!==title)glyphTab.Title=title;
        if(glyphTab.IsModified!==a.doc.dirty)glyphTab.IsModified=a.doc.dirty;
    }
    updateElements() {
        const a=this.app,cs=a.editor.layer.contours,signature=[a.doc.data.id,a.editor.glyphId,a.editor.masterId,...cs.map(c=>`${c.id}:${c.closed}:${c.nodes.map(n=>n.id).join(',')}`)].join('|');
        if(signature!==this.elementSignature){
            this.elementSignature=signature;this.elements.replaceChildren();
            cs.forEach((c,i)=>{const b=button('',()=>{a.editor.select(c.nodes.map(n=>n.id));this.focusGlyph();},{className:'cf-element-row',title:`Select contour ${i+1}`});
                b.dataset.contour=c.id;b.tabIndex=i===0?0:-1;b.setAttribute('role','option');b.append(createIcon(c.closed?'rectangle':'line'),el('span','',`Contour ${i+1}`),el('small','',`${c.nodes.length} nodes`));this.elements.append(b);
            });
            if(!cs.length)this.elements.append(el('p','cf-empty-small','No contours on this layer.'));
        }
        for(const b of this.elements.querySelectorAll('[data-contour]')){const c=cs.find(c=>c.id===b.dataset.contour),selected=c?.nodes.length>0&&c.nodes.every(n=>a.editor.selection.has(n.id));b.setAttribute('aria-selected',String(selected));}
    }
    updateStrip() {
        const a=this.app,gs=a.doc.data.glyphs,index=gs.findIndex(g=>g.id===a.editor.glyphId);
        const lo=Math.max(0,Math.min(gs.length-9,index-4)),items=gs.slice(lo,lo+9);
        const signature=`${a.doc.data.id}:${a.doc.revision}:${a.editor.masterId}:${lo}`;
        const focused=this.strip.contains(document.activeElement)?document.activeElement:null;
        const focusedId=focused?.dataset?.stripGlyph;
        if(signature!==this.stripSignature) {
            this.stripSignature=signature;
            const keep=new Set(items.map(g=>g.id));
            // Reconcile by stable glyph ID rather than replacing the toolbar.
            // Retained pointer targets and keyboard focus survive source refresh.
            for(const [id,record] of this.stripItems)if(!keep.has(id)) {
                record.button.remove();this.stripItems.delete(id);
            }
            let previous=this.stripLabel;
            for(const g of items) {
                let record=this.stripItems.get(g.id);
                if(!record) {
                    const b=el('button','cf-strip-glyph');b.type='button';b.dataset.stripGlyph=g.id;
                    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
                    const path=document.createElementNS(svg.namespaceURI,'path'),name=el('span');
                    svg.setAttribute('aria-hidden','true');path.setAttribute('transform','scale(1,-1)');
                    svg.append(path);b.append(svg,name);record={button:b,svg,path,name};
                    this.stripItems.set(g.id,record);
                }
                const {button:b,svg,path,name}=record;
                b.title=`${g.name} · ${g.unicodes.map(c=>'U+'+c.toString(16).toUpperCase().padStart(4,'0')).join(' ')}`;
                b.setAttribute('aria-label','Edit '+g.name);name.textContent=g.name;
                let cs=[];try{cs=a.doc.resolve(g.id,a.editor.masterId);}catch{/* source diagnostics remain in the editor */}
                const box=bounds(cs),upm=a.doc.info.unitsPerEm,w=Math.max(upm,a.doc.layer(g.id,a.editor.masterId).advanceWidth,box.width);
                svg.setAttribute('viewBox',`0 ${-a.doc.info.ascender} ${w} ${upm}`);path.setAttribute('d',toSVG(cs));
                if(previous.nextSibling!==b)this.strip.insertBefore(b,previous.nextSibling);
                previous=b;
            }
        }
        const tabStop=this.stripItems.has(focusedId)?focusedId:a.editor.glyphId;
        for(const [id,{button:b}] of this.stripItems) {
            const selected=id===a.editor.glyphId;
            b.setAttribute('aria-pressed',String(selected));b.classList.toggle('active',selected);
            b.tabIndex=id===tabStop?0:-1;
        }
        // A removed/reordered toolbar item may lose browser focus. Restore only
        // focus owned by this toolbar; never take it from the canvas or a field.
        if(focused&&document.activeElement===document.body) {
            const b=this.stripItems.get(tabStop)?.button;
            if(b)b.focus({preventScroll:true});
        }
    }
    showPreferences() {
        const d=dialog('Workspace preferences',{subtitle:'Appearance and layout are stored on this device, independently of font source and undo history.',className:'cf-workspace-preferences'});
        for(const [key,label,options] of [
            ['theme','Interface theme',[{value:'light',label:'Light'},{value:'dark',label:'Dark'},{value:'system',label:'Follow system'}]],
            ['canvas','Glyph canvas',[{value:'paper',label:'White paper, in either interface theme'},{value:'theme',label:'Follow interface theme'}]],
            ['ribbon','Command ribbon',[{value:'compact',label:'Compact icon toolbar'},{value:'expanded',label:'Expanded labeled ribbon'}]]]) {
            const f=field(label,this.preferences[key],{options});f.input.addEventListener('change',()=>this.setPreference(key,f.input.value));d.body.append(f.element);
        }
        const fill=field('Outline shading',this.preferences.dimFill?'dim':'true',{options:[{value:'dim',label:'Subtle editing fill'},{value:'true',label:'True ink fill'}]});
        fill.input.addEventListener('change',()=>this.setPreference('dimFill',fill.input.value==='dim'));d.body.append(fill.element);
        d.footer.append(button('Reset panel layout',()=>this.resetLayout()),button('Done',d.close,{className:'primary'}));return d;
    }
    dispose() {if(this.disposed)return;this.disposed=true;this.abort.abort();cancelAnimationFrame(this.pending);this.focusRequest.dispose();this.stripItems.clear();for(const off of this.off)typeof off==='function'?off():off?.unsubscribe?.();this.fontTiles.dispose();this.controls.length=0;}
}
