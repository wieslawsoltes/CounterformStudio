import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {traceMask,traceBitmap,thresholdRaster,otsuThreshold,fitPolyline} from '@wieslawsoltes/counterform-tracing';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
import {cubicAt,segments} from '@wieslawsoltes/counterform-geometry';
import {makePNG} from './artwork-fixture.mjs';
function mask(w,h,bits){return {width:w,height:h,mask:Uint8Array.from(bits)};}
function inside(c,x,y){let winding=0;const p=c.nodes;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a.y<=y&&b.y>y)||(a.y>y&&b.y<=y)){const cross=a.x+(y-a.y)*(b.x-a.x)/(b.y-a.y);if(cross>x)winding+=b.y>a.y?1:-1;}}return winding;}
test('exact pixel contours retain counters, winding, image border and diagonal connectivity',()=>{
 const r=traceMask(mask(3,3,[1,1,1,1,0,1,1,1,1]));assert.deepEqual(r.areas,[9,-1]);assert.equal(r.holes,1);assert.equal(r.inkPixels,8);assert.equal(r.pointCount,8);
 assert.equal(traceMask(mask(2,2,[1,0,0,1])).contours.length,2);assert.equal(traceMask(mask(1,1,[1])).areas[0],1);assert.equal(traceMask(mask(2,2,[0,0,0,0])).contours.length,0);
});
test('all 512 three-by-three masks rasterize exactly and conserve signed area',()=>{
 for(let bits=0;bits<512;bits++){const m=mask(3,3,Array.from({length:9},(_,i)=>(bits>>i)&1)),r=traceMask(m);assert.equal(r.areas.reduce((a,b)=>a+b,0),r.inkPixels);
 for(let y=0;y<3;y++)for(let x=0;x<3;x++)assert.equal(Number(r.contours.reduce((w,c)=>w+inside(c,x+.5,y+.5),0)!==0),m.mask[y*3+x],`mask ${bits},${x},${y}`);
 }
});
test('despeckling uses bounded four-connected components without filling counters or mutating input',()=>{
 const m=mask(4,3,[1,0,0,1,0,0,1,1,0,0,1,1]),before=m.mask.slice(),r=traceMask(m,{minComponentPixels:2});assert.equal(r.removedPixels,1);assert.equal(r.inkPixels,5);assert.deepEqual(m.mask,before);
});
test('thresholding alpha-composites before classifying and Otsu handles constant images',()=>{
 const r=thresholdRaster({width:2,height:1,pixels:Uint8Array.of(0,0,0,0,0,0,0,255)});assert.deepEqual([...r.mask],[0,1]);assert.equal(r.threshold,127);
 const image=makePNG(1,1,()=>false);assert.equal(traceBitmap(image).inkPixels,0);assert.equal(traceBitmap(image,{invert:true}).inkPixels,1);
 const h=new Uint32Array(256);h[40]=h[200]=10;assert.equal(otsuThreshold(h),119);
 assert.throws(()=>otsuThreshold(new Int32Array(256).fill(-1)),/histogram/);
});
test('raster/mask options reject malformed buffers, unsafe values and allocation/expansion overruns',()=>{
 const image=makePNG(2,2,()=>true);
 for(const bad of [{width:0},{height:5000},{pixels:new Uint8Array(15)}])assert.throws(()=>traceBitmap({...image,...bad}));
 for(const options of [{threshold:NaN},{threshold:256},{invert:1},{curves:1},{tolerance:Infinity},{minComponentPixels:-1},{maxEdges:3},{maxContours:0}])assert.throws(()=>traceBitmap(image,options));
 assert.throws(()=>traceMask(mask(2,2,[1,0,0,1]),{maxContours:1}),/contour budget/);assert.throws(()=>traceBitmap(image,{maxEdges:4}),/boundary budget/);
 assert.throws(()=>traceMask(mask(1,1,[2])),/entries/);
});
test('continuous cubic fit preserves endpoints, sharp reversals and closed contours',()=>{
 const line=fitPolyline([{x:0,y:0},{x:10,y:0},{x:20,y:0}]);assert.equal(line.contour.nodes.length,2);assert.equal(line.errorBound,0);
 const reverse=fitPolyline([{x:0,y:0},{x:10,y:0},{x:0,y:0}],{tolerance:0});assert.equal(reverse.contour.nodes.length,3);
 const p=Array.from({length:65},(_,i)=>({x:100*Math.cos(2*Math.PI*i/64),y:100*Math.sin(2*Math.PI*i/64)}));
 const copy=structuredClone(p),r=fitPolyline(p,{closed:true,tolerance:.5});assert.equal(r.contour.closed,true);assert(r.contour.nodes.length<32);assert(r.errorBound<=.5);assert.deepEqual(p,copy);
 const nodes=r.contour.nodes;assert.notDeepEqual([nodes[0].x,nodes[0].y],[nodes.at(-1).x,nodes.at(-1).y]);assert(nodes.some(n=>n.in||n.out));
});
test('fitted cubic samples stay within the reported conservative bound of the input polyline',()=>{
 const p=Array.from({length:80},(_,i)=>({x:i*2,y:20*Math.sin(i/8)})),r=fitPolyline(p,{tolerance:.3});
 const distance=(p,a,b)=>{const x=b.x-a.x,y=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/(x*x+y*y)));return Math.hypot(p.x-a.x-t*x,p.y-a.y-t*y);};
 for(const s of segments(r.contour))for(let k=0;k<=20;k++){const v=cubicAt(s.p0,s.p1,s.p2,s.p3,k/20);let d=Infinity;for(let j=1;j<p.length;j++)d=Math.min(d,distance(v,p[j-1],p[j]));assert(d<=r.errorBound+1e-8);}
 assert(r.contour.nodes.length<p.length/2);
});
test('curve fitting and trace output identity, limits and purity are deterministic',()=>{
 const image=makePNG(40,40,(x,y)=>(x-20)**2+(y-20)**2<250),before=image.pixels.slice();const a=traceBitmap(image,{curves:true}),b=traceBitmap(image,{curves:true});assert.deepEqual(a,b);assert.deepEqual(image.pixels,before);assert(a.errorBound<=.35);
 assert.equal(new Set(a.contours.flatMap(c=>c.nodes.map(n=>n.id))).size,a.pointCount);
 for(const options of [{tolerance:-1},{tolerance:NaN},{maxWork:0},{maxPoints:1}])assert.throws(()=>fitPolyline([{x:0,y:0},{x:1,y:1}],options));
 assert.throws(()=>fitPolyline([{x:NaN,y:0},{x:1,y:1}]));assert.throws(()=>fitPolyline(Array.from({length:100},(_,i)=>({x:i,y:i%2})),{maxWork:1}),/work budget/);
});
test('real authoring worker traces an immutable snapshot and supports keyed cancellation and recovery',async()=>{
 const image=makePNG(),expected=traceBitmap(image),client=new CompilerClient({workerFactory:()=>new Worker(new URL('../packages/compiler/src/node-worker.js',import.meta.url))});
 try{const pending=client.trace(image);image.pixels.fill(255);assert.deepEqual(await pending,expected);
 const controller=new AbortController(),cancelled=client.trace(makePNG(),{},{signal:controller.signal,key:'trace'});controller.abort();await assert.rejects(cancelled,{name:'AbortError'});
 assert.deepEqual(await client.trace(makePNG()),expected);await assert.rejects(client.trace({...image,width:99999}),/width/);
 }finally{client.dispose();}
});

test('fitting collapsed chord-parameter intervals never accepts NaN control bounds',()=>{
 const p=[{x:0,y:0},{x:1e7,y:0},{x:1e7,y:1e-290},{x:1e7,y:2e-290},{x:1e7-1e-8,y:3e-290}];
 const r=fitPolyline(p,{tolerance:1});assert(Number.isFinite(r.errorBound));assert(r.errorBound<=1);
 for(const n of r.contour.nodes)for(const v of [n,n.in,n.out])if(v)assert(Number.isFinite(v.x)&&Number.isFinite(v.y));
});
