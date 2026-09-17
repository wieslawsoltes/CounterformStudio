import {node,contour,bounds,transformContours,distance,containsPoint,uid} from '@wieslawsoltes/counterform-geometry';
import {polygon,roundedRectangle,simplifyPolyline,strokePolyline,cutContourAt,knifeContour} from '@wieslawsoltes/counterform-construction';
export const extraTools = [
 {id:'line',label:'Line',key:'L'}, {id:'polygon',label:'Polygon',key:'Shift+L'}, {id:'star',label:'Star',key:'Shift+O'}, {id:'rounded',label:'Rounded rectangle',key:'Shift+R'},
 {id:'lasso',label:'Lasso',key:'Q'}, {id:'pencil',label:'Pencil',key:'D'}, {id:'brush',label:'Pressure brush',key:'B'}, {id:'knife',label:'Knife',key:'K'}, {id:'scissors',label:'Scissors',key:'C'},
 {id:'move',label:'Move',key:'V'}, {id:'rotate',label:'Rotate',key:'T'}, {id:'scale',label:'Scale',key:'S'}, {id:'slant',label:'Slant',key:'Y'},
 {id:'anchor',label:'Anchor',key:'Shift+A'}, {id:'guide',label:'Guides',key:'I'}, {id:'zoom',label:'Zoom',key:'Z'}
];
const extended=new Set(extraTools.map(t=>t.id));
export const defaultToolOptions = Object.freeze({sides:6,innerRatio:.45,cornerRadius:40,brushWidth:40,pencilTolerance:1});
export function validateToolOptions(options) {
 const o={...defaultToolOptions,...options};
 const rules={sides:[3,128],innerRatio:[.05,.95],cornerRadius:[0,10000],brushWidth:[.1,10000],pencilTolerance:[.01,100]};
 for(const [key,[min,max]] of Object.entries(rules))if(!Number.isFinite(o[key])||o[key]<min||o[key]>max||(key==='sides'&&!Number.isInteger(o[key])))throw new RangeError(`Invalid ${key}: expected ${min}–${max}`);
 return o;
}
function preview(editor,points,closed=false){editor.renderer.toolPreview={points,closed};editor.renderer.invalidate();}
function angleConstraint(a,p,event,step=Math.PI/12){if(!event.shiftKey)return p;const len=distance(a,p),t=Math.round(Math.atan2(p.y-a.y,p.x-a.x)/step)*step;return{x:a.x+Math.cos(t)*len,y:a.y+Math.sin(t)*len};}
function pressure(event){return event.pointerType==='pen'?Math.max(.05,Math.min(1,event.pressure||.05)):.5;}
export function beginInteraction(editor,e,screen,raw,p) {
 if(!extended.has(editor.tool))return false;
 const tool=editor.tool;
 if(tool==='zoom'){editor.drag={kind:'extra',tool,start:screen,last:screen,alt:e.altKey};editor.renderer.marquee={a:screen,b:screen};return true;}
 if(tool==='lasso'){editor.drag={kind:'extra',tool,points:[raw],original:new Set(e.shiftKey?editor.selection:[])};preview(editor,[raw]);return true;}
 if(!editor.canEdit){editor.status.emit('Select an unlocked source master to edit.');return true;}
 if(tool==='scissors'){
  const hit=editor.nearest(raw);if(hit&&hit.distance<12/editor.renderer.camera.scale)editor.transaction('Cut contour',()=>{const cs=cutContourAt(hit.contour,hit.index,hit.t),i=editor.layer.contours.indexOf(hit.contour);editor.layer.contours.splice(i,1,...cs);editor.selection.clear();});
  return true;
 }
 if(tool==='knife'){editor.drag={kind:'extra',tool,start:p,last:p};preview(editor,[p,p]);return true;}
 if(['move','rotate','scale','slant'].includes(tool)) {
  const original=structuredClone(editor.layer.contours),selected=editor.selection.size?new Set(editor.selection):null;
  const ns=original.flatMap(c=>c.nodes).filter(n=>!selected||selected.has(n.id));if(!ns.length)return true;
  const b=bounds([contour(ns,false)]),center={x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2};
  editor.history.begin(`${tool[0].toUpperCase()+tool.slice(1)} outlines`,editor.glyphId);
  editor.drag={kind:'extra',tool,start:raw,original,selected,center,box:b};preview(editor,[center,raw]);return true;
 }
 if(tool==='anchor'){
  const hit=editor.layer.anchors.find(a=>distance(a,raw)<10/editor.renderer.camera.scale);
  if(e.altKey&&hit){editor.transaction('Delete anchor',()=>editor.layer.anchors.splice(editor.layer.anchors.indexOf(hit),1));return true;}
  editor.history.begin(hit?'Move anchor':'Add anchor',editor.glyphId);
  let anchor=hit;if(!anchor){let i=1;while(editor.layer.anchors.some(a=>a.name===`anchor${i}`))i++;anchor={id:uid('a'),name:`anchor${i}`,x:p.x,y:p.y};editor.layer.anchors.push(anchor);}
  editor.drag={kind:'extra',tool,index:editor.layer.anchors.indexOf(anchor)};editor.refresh();return true;
 }
 if(tool==='guide'){
  const hit=editor.layer.guides.find(g=>distance(g,raw)<10/editor.renderer.camera.scale);
  if(e.altKey&&hit){editor.transaction('Delete guide',()=>editor.layer.guides.splice(editor.layer.guides.indexOf(hit),1));return true;}
  editor.history.begin('Add guide',editor.glyphId);editor.layer.guides.push({id:uid('guide'),x:p.x,y:p.y,angle:0});
  editor.drag={kind:'extra',tool,start:p,index:editor.layer.guides.length-1};editor.refresh();return true;
 }
 editor.history.begin(`Draw ${tool}`,editor.glyphId);const c=contour([],false);editor.layer.contours.push(c);
 editor.drag={kind:'extra',tool,id:c.id,start:p,last:p,points:[{...p,pressure:pressure(e)}],screen};return true;
}
export function moveInteraction(editor,e,screen,raw,p) {
 const d=editor.drag;if(d?.kind!=='extra')return false;
 d.last=p;
 if(d.tool==='zoom'){d.last=screen;editor.renderer.marquee.b=screen;editor.renderer.invalidate();return true;}
 if(d.tool==='lasso'){
  if(d.points.length<4096&&distance(d.points.at(-1),raw)>2/editor.renderer.camera.scale)d.points.push(raw);preview(editor,d.points,true);return true;
 }
 if(d.tool==='knife'){d.last=angleConstraint(d.start,p,e);preview(editor,[d.start,d.last]);return true;}
 if(d.tool==='anchor'){const a=editor.layer.anchors[d.index];a.x=p.x;a.y=p.y;editor.refresh();return true;}
 if(d.tool==='guide'){const a=editor.layer.guides[d.index],end=angleConstraint(d.start,p,e);if(distance(d.start,end)>3/editor.renderer.camera.scale)a.angle=Math.atan2(end.y-d.start.y,end.x-d.start.x)*180/Math.PI;editor.refresh();return true;}
 if(d.original){
  const c=d.center;let m=[1,0,0,1,0,0];
  if(d.tool==='move'){const q=angleConstraint(d.start,p,e,Math.PI/2);m[4]=q.x-d.start.x;m[5]=q.y-d.start.y;}
  if(d.tool==='rotate'){let theta=Math.atan2(raw.y-c.y,raw.x-c.x)-Math.atan2(d.start.y-c.y,d.start.x-c.x);if(e.shiftKey)theta=Math.round(theta/(Math.PI/12))*Math.PI/12;const cos=Math.cos(theta),sin=Math.sin(theta);m=[cos,sin,-sin,cos,c.x-cos*c.x+sin*c.y,c.y-sin*c.x-cos*c.y];}
  if(d.tool==='scale'){let sx=1+(raw.x-d.start.x)/Math.max(d.box.width,50),sy=1+(raw.y-d.start.y)/Math.max(d.box.height,50);if(e.shiftKey)sy=sx;
    sx=Math.max(.01,Math.min(20,sx));sy=Math.max(.01,Math.min(20,sy));m=[sx,0,0,sy,c.x*(1-sx),c.y*(1-sy)];}
  if(d.tool==='slant'){let k=(raw.x-d.start.x)/Math.max(d.box.height,50);k=Math.max(-4,Math.min(4,k));if(e.shiftKey)k=Math.tan(Math.round(Math.atan(k)/(Math.PI/12))*Math.PI/12);m=[1,0,k,1,-k*c.y,0];}
  editor.layer.contours=structuredClone(d.original);transformContours(editor.layer.contours,m,d.selected);preview(editor,[c,raw]);editor.refresh();return true;
 }
 const c=editor.layer.contours.find(c=>c.id===d.id);if(!c)return true;
 if(['pencil','brush'].includes(d.tool)){
  for(const sample of e.getCoalescedEvents?.().length?e.getCoalescedEvents():[e]){const q=editor.snapPoint(editor.renderer.camera.world(editor.local(sample)),sample);if(d.points.length<4096&&distance(d.points.at(-1),q)>1.2/editor.renderer.camera.scale)d.points.push({...q,pressure:pressure(sample)});}
  if(d.tool==='brush'){const shape=strokePolyline(d.points,editor.toolOptions.brushWidth);c.nodes=shape.nodes;c.closed=true;}
  else {c.nodes=d.points.map(q=>node(q.x,q.y));c.closed=false;}
 }else if(d.tool==='line'){const q=angleConstraint(d.start,p,e);c.nodes=[node(d.start.x,d.start.y),node(q.x,q.y)];c.closed=false;}
 else {
  let w=p.x-d.start.x,h=p.y-d.start.y;if(e.shiftKey){const size=Math.max(Math.abs(w),Math.abs(h));w=Math.sign(w||1)*size;h=Math.sign(h||1)*size;}
  const x=Math.min(d.start.x,d.start.x+w),y=Math.min(d.start.y,d.start.y+h);w=Math.abs(w);h=Math.abs(h);
  const shape=d.tool==='rounded'?roundedRectangle(x,y,w,h,editor.toolOptions.cornerRadius):polygon(x+w/2,y+h/2,w/2,h/2,editor.toolOptions.sides,d.tool==='star'?editor.toolOptions.innerRatio:1);
  c.nodes=shape.nodes;c.closed=shape.closed;
 }
 editor.selection=new Set(c.nodes.map(n=>n.id));editor.refresh();return true;
}
export function endInteraction(editor,e) {
 const d=editor.drag;if(d?.kind!=='extra')return;
 if(d.tool==='zoom'){
  const camera=editor.renderer.camera,width=Math.abs(d.last.x-d.start.x),height=Math.abs(d.last.y-d.start.y);
  const at={x:(d.start.x+d.last.x)/2,y:(d.start.y+d.last.y)/2};
  if(width>8&&height>8&&!d.alt){const factor=Math.min(editor.renderer.host.clientWidth/width,editor.renderer.host.clientHeight/height)*.9;camera.zoomAt(factor,at);camera.x+=editor.renderer.host.clientWidth/2-at.x;camera.y+=editor.renderer.host.clientHeight/2-at.y;}
  else camera.zoomAt(d.alt?1/1.5:1.5,d.start);
  editor.renderer.changed.emit(camera);
 }
 if(d.tool==='lasso'){
  const region=contour(d.points.map(p=>node(p.x,p.y)),true),ids=[...d.original];
  if(d.points.length>2)for(const c of editor.layer.contours)for(const n of c.nodes)if(containsPoint(region,n))ids.push(n.id);
  editor.select(ids);
 }
 if(d.tool==='knife'&&distance(d.start,d.last)>3/editor.renderer.camera.scale){
  editor.transaction('Knife contours',()=>{const selected=new Set(editor.selectedContours().map(c=>c.id));editor.layer.contours=editor.layer.contours.flatMap(c=>selected.has(c.id)&&c.closed?knifeContour(c,d.start,d.last):[c]);editor.selection.clear();});
 }
 if(d.id){const c=editor.layer.contours.find(c=>c.id===d.id);
  if(!c||c.nodes.length<2||(['polygon','star','rounded'].includes(d.tool)&&(bounds([c]).width<1e-6||bounds([c]).height<1e-6))||distance(d.start,d.last)<.01&&d.points.length<2){editor.history.cancel();}
  else if(d.tool==='pencil'){const points=simplifyPolyline(d.points,editor.toolOptions.pencilTolerance);c.nodes=points.map(p=>node(p.x,p.y));editor.selection=new Set(c.nodes.map(n=>n.id));}
 }
 editor.renderer.toolPreview=null;
}
