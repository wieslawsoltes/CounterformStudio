import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {polygon,roundedRectangle,simplifyPolyline,strokePolyline,openContourAt,cutContourAt,joinContours,knifeContour,lineIntersections,convertSegments,distributeNodes} from '@wieslawsoltes/counterform-construction';
import {rectangle,ellipse,bounds,node,contour,segments,signedArea} from '@wieslawsoltes/counterform-geometry';
import {iconNames,iconURL,commandIcon,iconPaths} from '@wieslawsoltes/counterform-icons';
import {tools} from '@wieslawsoltes/counterform-editor';
import {validateToolOptions} from '../packages/editor/src/interactions.js';
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
test('original vector icon URLs are packaged, safe and cover all 24 tools',async()=>{
 assert.equal(tools.length,24);assert.equal(new Set(tools.map(t=>t.id)).size,24);assert.ok(iconNames.length>=60);
 for(const name of iconNames){const url=new URL(iconURL(name));assert.ok((await stat(url)).isFile());const xml=await readFile(url,'utf8');assert.match(xml,/viewBox="0 0 24 24"/);assert.doesNotMatch(xml,/<script|onload|http[^:]/);}
 for(const t of tools)assert.equal(commandIcon('tool.'+t.id),t.id);
 assert.throws(()=>iconURL('../font'),RangeError);assert.throws(()=>iconURL('constructor'),RangeError);
});
test('polygon and star topology, dimensions, limits and unique nodes',()=>{
 const p=polygon(0,0,100,60,6),s=polygon(0,0,100,60,5,.4);assert.equal(p.nodes.length,6);assert.equal(s.nodes.length,10);assert.equal(s.closed,true);
 close(p.nodes[0].y,60);assert.equal(new Set(s.nodes.map(n=>n.id)).size,10);
 for(const args of [[0,0,1,1,2],[0,0,1,1,200],[0,0,1,1,3,0],[NaN,0,1,1]])assert.throws(()=>polygon(...args),RangeError);
});
test('rounded rectangles retain exact box, tangencies and bounded corner radius',()=>{
 const c=roundedRectangle(10,20,200,100,80),b=bounds([c]);assert.equal(c.nodes.length,8);assert.equal([...segments(c)].filter(s=>s.curve).length,4);
 close(b.minX,10);close(b.minY,20);close(b.maxX,210);close(b.maxY,120);assert.throws(()=>roundedRectangle(0,0,-1,10));
});
test('polyline simplification preserves endpoints, pressure and immutability',()=>{
 const ps=Array.from({length:200},(_,i)=>({x:i,y:Math.sin(i/10)*.01,pressure:i/200})),before=structuredClone(ps),out=simplifyPolyline(ps,.1);
 assert.equal(out.length,2);assert.deepEqual(ps,before);assert.deepEqual(out[0],ps[0]);assert.deepEqual(out.at(-1),ps.at(-1));assert.notEqual(out[0],ps[0]);assert.throws(()=>simplifyPolyline(ps,0));assert.throws(()=>simplifyPolyline(Array(9000).fill(ps[0])));
});
test('pressure brush forms a closed bounded stroke with distinct widths',()=>{
 const c=strokePolyline([{x:0,y:0,pressure:.25},{x:100,y:0,pressure:.5}],40);assert.equal(c.closed,true);close(Math.abs(c.nodes[0].y),10);close(Math.abs(c.nodes[1].y),20);
 const turn=strokePolyline([{x:0,y:0},{x:100,y:0},{x:0,y:0}],40);assert.ok(turn.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));assert.throws(()=>strokePolyline([],0));
});
test('opening a cubic contour preserves every edge including closing edge',()=>{
 const c=ellipse(0,0,100,80),before=structuredClone(c),open=openContourAt(c,2);
 assert.equal(open.closed,false);assert.equal(open.nodes.length,5);assert.equal([...segments(open)].length,4);close(open.nodes[0].x,open.nodes.at(-1).x);assert.equal(open.nodes[0].in,null);assert.equal(open.nodes.at(-1).out,null);assert.deepEqual(c,before);
 assert.equal(new Set(open.nodes.map(n=>n.id)).size,5);close(bounds([open]).width,200);
});
test('scissors split an open cubic and reject endpoint no-ops',()=>{
 const c=contour([node(0,0,{out:{x:40,y:100}}),node(100,0,{in:{x:60,y:100}})],false),out=cutContourAt(c,0,.5);
 assert.equal(out.length,2);close(out[0].nodes.at(-1).x,50);close(out[0].nodes.at(-1).y,75);close(bounds(out).height,75);assert.equal(c.nodes.length,2);assert.throws(()=>cutContourAt(c,0,0));
 assert.equal(new Set(out.flatMap(c=>c.nodes.map(n=>n.id))).size,4);
});
test('knife cuts rectangle into two real contours without losing area',()=>{
 const c=rectangle(0,0,100,100),before=structuredClone(c),out=knifeContour(c,{x:-10,y:40},{x:110,y:40});assert.equal(out.length,2);out.forEach(c=>assert.equal(c.closed,true));
 close(out.reduce((sum,c)=>sum+Math.abs(signedArea(c)),0),10000);assert.deepEqual(c,before);assert.equal(new Set(out.flatMap(c=>c.nodes.map(n=>n.id))).size,out.flatMap(c=>c.nodes).length);
});
test('knife bisects cubic arcs at computed intersections, not flattened segments',()=>{
 const c=ellipse(0,0,100,80),a={x:-200,y:25},b={x:200,y:25},hits=lineIntersections(c,a,b),out=knifeContour(c,a,b);assert.equal(hits.length,2);for(const h of hits)close(h.point.y,25);assert.equal(out.length,2);assert.ok(out.every(c=>[...segments(c)].some(s=>s.curve)));close(bounds(out).width,200);close(bounds(out).height,160);
});
test('knife rejects vertex and incomplete crossings instead of corrupting geometry',()=>{
 const c=rectangle(0,0,100,100);assert.throws(()=>knifeContour(c,{x:-20,y:-20},{x:120,y:120}),/ambiguous/);
 assert.throws(()=>knifeContour(c,{x:40,y:40},{x:140,y:40}),/two/);assert.equal(knifeContour(c,{x:-30,y:40},{x:-10,y:40}).length,1);
 assert.throws(()=>knifeContour(c,{x:0,y:0},{x:0,y:0}));
});
test('endpoint joining orients contours and retains incoming cubic handles',()=>{
 const a=contour([node(0,0),node(10,0,{in:{x:5,y:5}})],false),b=contour([node(30,0),node(20,0)],false),joined=joinContours(a,1,b,1);
 assert.deepEqual(joined.nodes.map(n=>n.x),[0,10,20,30]);assert.equal(joined.nodes[1].in.y,5);assert.deepEqual(b.nodes.map(n=>n.x),[30,20]);assert.throws(()=>joinContours(rectangle(0,0,10,10),0,b,0));
});
test('line/cubic conversion and distribution preserve unaffected geometry',()=>{
 const c=contour([node(0,0),node(10,20),node(100,30)],false),out=convertSegments(c,true);assert.ok(out.nodes[0].out);close(out.nodes[0].out.x,10/3);assert.equal(c.nodes[0].out,null);
 const lines=convertSegments(out,false);assert.equal(lines.nodes[1].in,null);distributeNodes([out],new Set(out.nodes.map(n=>n.id)),'x');close(out.nodes[1].x,50);close(out.nodes[1].in.x,50-10/3);
 assert.throws(()=>distributeNodes([out],new Set(),'z'));
});
test('tool options reject NaN, negative sizes and runaway sample geometry',()=>{
 assert.equal(validateToolOptions({sides:8}).sides,8);for(const o of [{sides:2},{sides:4.5},{brushWidth:0},{innerRatio:2},{pencilTolerance:NaN}])assert.throws(()=>validateToolOptions(o));
});
test('cubic conversion never straightens an existing Bézier',()=>{
 const c=ellipse(0,0,100,200);assert.deepEqual(convertSegments(c,true),c);
});
test('zero corner radius is a clean four-node rectangle',()=>{
 const c=roundedRectangle(0,0,100,200,0);assert.equal(c.nodes.length,4);assert.ok(c.nodes.every(n=>!n.in&&!n.out));
});
test('finite knife strokes ignore out-of-range tangent or collinear edges',()=>{
 assert.equal(knifeContour(ellipse(0,0,100,80),{x:150,y:80},{x:200,y:80}).length,1);
 assert.equal(knifeContour(rectangle(0,0,100,100),{x:150,y:0},{x:200,y:0}).length,1);
});
test('scissors reject out-of-domain parameters',()=>{
 assert.throws(()=>cutContourAt(rectangle(0,0,100,100),0,-1),RangeError);
 assert.throws(()=>cutContourAt(rectangle(0,0,100,100),0,2),RangeError);
});
