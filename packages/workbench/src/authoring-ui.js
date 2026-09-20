import {CommandMenus} from '@wieslawsoltes/counterform-menus';
import {createIcon,commandIcon} from '@wieslawsoltes/counterform-icons';
import {tools} from '@wieslawsoltes/counterform-editor';
import {formatBinding} from '@wieslawsoltes/counterform-commands';
import {uid} from '@wieslawsoltes/counterform-geometry';
import {el,button,dialog,field,formDialog,toast} from './ui.js';

export const ribbonTabs=[
 {id:'draw',label:'Draw',groups:[{id:'select',label:'Selection',commands:['tool.select','tool.lasso','tool.move']},{id:'draw',label:'Drawing',commands:['tool.pen','tool.pencil','tool.brush','tool.line']},{id:'shapes',label:'Shapes',commands:['tool.rectangle','tool.ellipse','tool.rounded','tool.polygon','tool.star']},{id:'cuts',label:'Surgery',commands:['tool.insert','tool.knife','tool.scissors','tool.eraser']},{id:'options',label:'Construction',commands:['tool.anchor','tool.guide','tool.options']}]},
 {id:'design',label:'Design',groups:[{id:'nodes',label:'Nodes',commands:['node.smooth','node.corner','outline.extrema','node.start']},{id:'paths',label:'Contours',commands:['outline.overlap','outline.join','outline.open','outline.close','outline.clean']},{id:'curves',label:'Segments',commands:['outline.lines','outline.curves','outline.reverse','outline.winding','outline.analyze']},{id:'transform',label:'Transform',commands:['tool.rotate','tool.scale','tool.slant','outline.transform','outline.mirrorX','outline.round']}]},
 {id:'spacing',label:'Spacing',groups:[{id:'metrics',label:'Metrics',commands:['font.info','glyph.center','metrics.editor','kern.pair']},{id:'align',label:'Align & distribute',commands:['node.alignX','node.alignY','node.distributeX','node.distributeY']},{id:'kern',label:'Kerning',commands:['view.kerning','kern.groups']}]},
 {id:'masters',label:'Masters',groups:[{id:'masters',label:'Design space',commands:['view.masters','master.add','axis.add','axis.map','master.compatibility','master.instance','master.metrics']},{id:'components',label:'Components',commands:['glyph.component','glyph.decompose','outline.modifiers','outline.bake']}]},
 {id:'opentype',label:'OpenType',groups:[{id:'compile',label:'Compilation',commands:['view.features','features.apply','glyph.variations','font.validate','font.tables']},{id:'color',label:'Color & attachment',commands:['color.paint','color.edit','features.attachments','features.variations','glyph.anchor','glyph.guides']},{id:'export',label:'Production',commands:['file.export','font.collection','file.metadataExport','glyph.svg']}]},
 {id:'workspace',label:'Workspace',groups:[{id:'view',label:'Canvas',commands:['view.fit','view.grid','view.fill','view.preview','view.snap']},{id:'layout',label:'Layout',commands:['layout.undo','layout.redo','view.theme','view.fullscreen','view.ribbon','workspace.focus','workspace.preferences']},{id:'tools',label:'Tools',commands:['commands.palette','commands.bindings','automation.recipe','app.toolHelp','app.about']}]}];
export function menuDefinitions(registry){
 const definitions=[
  {label:'File',items:['file.new','file.open','file.recent',null,'file.save','font.collection','file.export','file.original','file.metadataExport','file.recovery','glyph.svg',null,'file.demo']},
  {label:'Edit',items:['edit.undo','edit.redo',null,'edit.cut','edit.copy','edit.paste','edit.delete',null,'edit.selectAll','edit.deselect','edit.invert',null,...[...registry.commands.keys()].filter(id=>id.startsWith('nudge.'))]},
  {label:'View',items:['view.font','view.glyph','view.catalog','view.kerning','view.features','view.notes',null,'view.fit','view.zoomIn','view.zoomOut',null,'view.grid','view.fill','view.nodes','view.guides','view.preview','view.snap',null,'view.theme','view.fullscreen']},
  {label:'Font',items:['font.info','glyph.new','master.add','axis.add','axis.map','master.instance','master.compatibility','master.metrics',null,'metrics.editor','kern.pair','kern.groups','color.paint','color.edit','features.apply','features.attachments','features.variations',null,'font.validate','font.tables']},
  {label:'Glyph',items:['glyph.new','glyph.duplicate','glyph.delete','glyph.previous','glyph.next','glyph.variations',null,'glyph.center','glyph.anchor','glyph.guides','glyph.clearGuides','glyph.lock',null,'glyph.component','glyph.decompose']},
  {label:'Contour',items:['node.smooth','node.corner','node.start','outline.extrema',null,'outline.join','outline.open','outline.close','outline.reverse','outline.winding',null,'outline.lines','outline.curves','outline.clean','outline.round','outline.analyze','outline.modifiers','outline.bake',null,'outline.overlap','outline.union','outline.difference','outline.intersect','outline.xor','outline.stroke',null,'outline.transform','outline.mirrorX','outline.mirrorY','node.alignX','node.alignY','node.distributeX','node.distributeY']},
  {label:'Tools',items:[...tools.map(t=>'tool.'+t.id),null,'tool.options','automation.recipe','compute.verify']},
  {label:'Window',items:['view.library','view.inspector','view.masters','view.proof','view.output',null,'layout.undo','layout.redo',null,'view.ribbon','view.paper','view.trueFill','workspace.focus','workspace.reset','workspace.preferences']},
  {label:'Help',items:['commands.palette','commands.bindings','app.toolHelp','app.about']}
 ];
 return definitions;
}
export function createStudioMenus(app){
 const definitions=menuDefinitions(app.commands);
 const menu=new CommandMenus(app.menuHost,app.commands,definitions,{icon:(id,d)=>createIcon(commandIcon(id),d),formatKey:k=>formatBinding(k,app.commands.isMac),onError:e=>toast(e.message,'error')});
 app.menus=menu;app.menuDefinitions=definitions;app.disposables.push(()=>menu.dispose());
 const ac=new AbortController();app.disposables.push(()=>ac.abort());
 app.renderer.overlay.addEventListener('contextmenu',e=>{e.preventDefault();menu.openContext(['edit.undo','edit.redo',null,'edit.copy','edit.paste','edit.delete',null,'node.smooth','node.corner','node.start','outline.join','outline.open',null,'outline.overlap','outline.transform','glyph.anchor','glyph.guides','tool.options'],e.clientX,e.clientY,app.renderer.overlay);},{signal:ac.signal});
 app.disposables.push(app.history.subscribe(()=>menu.refresh()));
}
export function createToolRail(app){
 app.toolRail.setAttribute('role','toolbar');app.toolRail.setAttribute('aria-label','Glyph editing tools');app.toolRail.setAttribute('aria-orientation','vertical');
 for(const tool of tools){const b=button('',()=>app.commands.run('tool.'+tool.id),{className:'cf-tool',title:`${tool.label} · ${formatBinding(tool.key,app.commands.isMac)}`});
  b.append(createIcon(tool.id));b.dataset.tool=tool.id;b.setAttribute('aria-label',tool.label);b.setAttribute('aria-pressed',String(tool.id===app.editor.tool));b.classList.toggle('active',tool.id===app.editor.tool);app.toolRail.append(b);}
 for(const [id,label] of [['tool.options','Tool options'],['view.fill','Toggle fill'],['view.grid','Toggle grid'],['app.toolHelp','Tool guide']]){
  const b=button('',()=>app.commands.run(id),{className:'cf-tool cf-utility-tool',title:label});b.append(createIcon(commandIcon(id)));b.setAttribute('aria-label',label);app.toolRail.append(b);
 }
 const all=[...app.toolRail.querySelectorAll('button')];all.forEach((b,i)=>b.tabIndex=i? -1:0);
 const ac=new AbortController();app.disposables.push(()=>ac.abort());app.toolRail.addEventListener('keydown',e=>{let i=all.indexOf(document.activeElement);if(i<0)return;
  const columns=getComputedStyle(app.toolRail).gridTemplateColumns.split(' ').length;
  const offsets={ArrowRight:1,ArrowLeft:-1,ArrowDown:columns,ArrowUp:-columns};let next=e.key==='Home'?0:e.key==='End'?all.length-1:Object.hasOwn(offsets,e.key)?(i+offsets[e.key]+all.length)%all.length:null;
  if(next!==null){e.preventDefault();all.forEach((b,j)=>b.tabIndex=j===next?0:-1);all[next].focus();}},{signal:ac.signal});
 const info=button('Tool options',()=>showToolOptions(app),{className:'cf-active-tool',title:'Configure the active drawing tool'});info.prepend(createIcon('settings'));app.contextbar.insertBefore(info,app.contextbar.children[2]);
 app.disposables.push(app.editor.changed.subscribe(e=>{if(e.kind==='tool')info.lastChild.textContent=tools.find(t=>t.id===e.tool).label;}));
}
export function registerAuthoringCommands(app){
 const edit={scope:'editor',enabled:()=>app.editor.canEdit},r=(id,label,execute,keys=[],extra={})=>app.commands.register({id,label,execute,keys,repeat:false,...extra});
 r('edit.invert','Invert node selection',()=>app.editor.invertSelection(),['Mod+Shift+A'],edit);
 r('node.distributeX','Distribute horizontally',()=>app.editor.distribute('x'),[],{...edit,enabled:()=>app.editor.canEdit&&app.editor.selection.size>=3});
 r('node.distributeY','Distribute vertically',()=>app.editor.distribute('y'),[],{...edit,enabled:()=>app.editor.canEdit&&app.editor.selection.size>=3});
 r('node.start','Set contour start point',()=>app.editor.setStart(),[],{...edit,enabled:()=>app.editor.canEdit&&app.editor.selection.size===1&&!!app.editor.findNode([...app.editor.selection][0])?.contour.closed});
 r('outline.join','Join selected endpoints',()=>app.editor.joinSelected(),['Mod+J'],{...edit,enabled:()=>app.editor.canEdit&&app.editor.selection.size===2});
 r('outline.open','Open contours at selection',()=>app.editor.openContours(),[],edit);
 r('outline.lines','Convert segments to lines',()=>app.editor.convertEdges(false),[],edit);
 r('outline.curves','Convert segments to cubic',()=>app.editor.convertEdges(true),[],edit);
 r('outline.clean','Remove duplicate line nodes',()=>app.editor.cleanContours(),[],edit);
 r('glyph.guides','Edit glyph guides',()=>showGuides(app));
 r('glyph.clearGuides','Clear glyph guides',()=>app.editor.transaction('Clear guides',()=>app.editor.layer.guides=[]),[],{...edit,enabled:()=>app.editor.canEdit&&app.editor.layer.guides.length>0});
 r('glyph.lock','Lock source layer',()=>app.history.execute('Toggle layer lock',()=>app.editor.layer.locked=!app.editor.layer.locked,app.editor.glyphId),[],{enabled:()=>!app.editor.readOnly,checked:()=>!!app.editor.layer.locked});
 r('tool.options','Drawing tool options',()=>showToolOptions(app),['Shift+Enter'],{scope:'editor'});
 r('app.toolHelp','Tool reference & gestures',()=>showToolHelp(app),['Shift+F1'],{allowInText:true});
 for(const [id,prop] of [['view.grid','showGrid'],['view.fill','showFill'],['view.nodes','showNodes'],['view.guides','showGuides'],['view.preview','preview']])app.commands.commands.get(id).checked=()=>!!app.renderer[prop];
 app.commands.commands.get('view.snap').checked=()=>app.editor.snap;
 for(const tool of tools)app.commands.commands.get('tool.'+tool.id).checked=()=>app.editor.tool===tool.id;
}
export function showToolOptions(app){const o=app.editor.toolOptions;return formDialog('Drawing tool options',[
 ['sides','Polygon / star points',o.sides,{type:'number',min:3,max:128,step:1}],['innerRatio','Star inner radius ratio',o.innerRatio,{type:'number',min:.05,max:.95,step:.05}],['cornerRadius','Corner radius (font units)',o.cornerRadius,{type:'number',min:0,max:10000}],['brushWidth','Brush width (font units)',o.brushWidth,{type:'number',min:.1,max:10000}],['pencilTolerance','Pencil simplification tolerance',o.pencilTolerance,{type:'number',min:.01,max:100,step:.1}]],{subtitle:'Shift constrains shapes and transforms. Pen pressure modulates brush width. Preferences do not alter existing contours.',onSubmit:values=>app.editor.setToolOptions(values)});}
export function showGuides(app){
 const d=dialog('Glyph guides',{subtitle:'Per-master font-unit coordinates and angles. Every edit is undoable.',wide:true});const list=el('div','cf-guide-list');d.body.append(list);
 const render=()=>{list.replaceChildren();if(!app.editor.layer.guides.length)list.append(el('p','cf-muted','No guides on this source layer. Drag with the Guides tool or add a horizontal guide.'));
 app.editor.layer.guides.forEach((g,i)=>{const row=el('div','cf-guide-row');row.append(el('strong','',`Guide ${i+1}`));for(const key of ['x','y','angle']){const f=field(`${key.toUpperCase()} ${i+1}`,g[key]||0,{type:'number',step:1});f.input.disabled=!app.editor.canEdit;f.input.addEventListener('change',()=>app.safe(()=>{const v=Number(f.input.value);if(!Number.isFinite(v)||Math.abs(v)>1e6)throw new RangeError('Enter finite coordinates within ±1,000,000');app.editor.transaction('Edit guide',()=>app.editor.layer.guides[i][key]=v);}));row.append(f.element);}
 const remove=button('Remove',()=>app.editor.transaction('Remove guide',()=>app.editor.layer.guides.splice(i,1)));remove.disabled=!app.editor.canEdit;row.append(remove);list.append(row);});};
 const off=app.doc.changed.subscribe(render);d.onClose(off);render();
 const add=button('Add horizontal guide',()=>app.editor.transaction('Add guide',()=>app.editor.layer.guides.push({id:uid('guide'),x:0,y:app.doc.info.xHeight,angle:0})));add.disabled=!app.editor.canEdit;d.footer.append(add,button('Done',d.close));return d;
}
const gestures={select:'Click nodes or handles; Shift extends selection. Drag empty space for a marquee. Double-click a contour to select it.',pen:'Click for corners, drag for paired Bézier handles. Click the first point to close. Escape ends construction.',rectangle:'Drag to draw; Shift makes a square.',ellipse:'Drag to draw; Shift makes a circle.',insert:'Click a curve to insert a node without changing its shape.',eraser:'Click a node to delete it.',measure:'Drag for a font-unit distance measurement.',pan:'Drag to pan. Space temporarily activates the Hand tool.',line:'Drag an open line. Shift constrains its angle to 15° increments.',polygon:'Drag an elliptical bounding box. Point count is set in Drawing tool options.',star:'Drag to create alternating outer and inner vertices. Point count and inner ratio are configurable.',rounded:'Drag a rounded rectangle with cubic corner arcs. Radius is configured in font units.',lasso:'Draw a freehand region to select nodes. Shift adds to the selection.',pencil:'Drag an open polyline; release to simplify with a bounded geometric tolerance.',brush:'Draw a filled outline. Pen pressure controls width; mouse uses constant width. Miter joins and flat caps.',knife:'Drag a finite line through a closed contour twice. Cubics are split exactly. Tangencies, node hits and more than two crossings are rejected.',scissors:'Click a curve to open a closed contour or divide an open contour, preserving its Bézier edges.',move:'Drag selected nodes, or all contours when nothing is selected. Shift constrains to an axis.',rotate:'Drag around the selection’s center. Shift snaps to 15° increments.',scale:'Drag to scale around the selection center. Shift uses uniform scale. Positive scale only; use Mirror to reflect.',slant:'Drag horizontally to shear around the selection center. Shift snaps the slant angle.',anchor:'Click to add a named anchor; drag an existing anchor to move it. Alt-click an anchor to remove it.',guide:'Click for a horizontal guide, drag to set its angle. Shift snaps to 15°. Alt-click the guide origin to delete.',zoom:'Click to zoom in; Alt-click to zoom out. Drag a rectangle to fit a region.'};
export function showToolHelp(app){const d=dialog('Tool reference & gestures',{subtitle:'24 working tools. Escape cancels an active gesture. This is Counterform’s documented subset, not a claim of complete native FontLab parity.',wide:true});
 const grid=el('div','cf-tool-reference');for(const t of tools){const row=el('div','cf-tool-description');row.append(createIcon(t.id),el('strong','',t.label),el('kbd','',formatBinding(t.key,app.commands.isMac)),el('p','',gestures[t.id]));grid.append(row);}d.body.append(grid);d.footer.append(button('Keyboard bindings',()=>{d.close();app.showBindings();}),button('Done',d.close));return d;}
