import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeContours,segmentProperties,rectangle,ellipse,reverseContour,transformContours,node,contour,segments} from '@wieslawsoltes/counterform-geometry';
const near=(a,b,e=1e-7)=>assert(Math.abs(a-b)<=e,`${a} ≠ ${b}`);
test('exact polygon moments, winding and length; no source mutation',()=>{
 const cs=[rectangle(10,20,80,40)],before=JSON.stringify(cs),r=analyzeContours(cs);
 near(r.signedArea,-3200);near(r.length,240);near(r.centroid.x,50);near(r.centroid.y,40);assert(r.converged);assert.equal(JSON.stringify(cs),before);
 near(analyzeContours([reverseContour(cs[0])]).signedArea,3200);
});
test('cubic Green integrals compute exact parabola area and centroid',()=>{
 // y=x², x from 0 to 1, exact degree-elevated cubic, closed along y=0.
 const c=contour([node(0,0,{out:{x:1/3,y:0}}),node(1,1,{in:{x:2/3,y:1/3}}),node(1,0)],true),r=analyzeContours([c]);
 near(r.signedArea,-1/3);near(r.centroid.x,3/4);near(r.centroid.y,3/10);
 const length=.5*Math.sqrt(5)+.25*Math.asinh(2)+2;
 assert(r.lengthBounds[0]<=length&&length<=r.lengthBounds[1]);assert(r.lengthErrorBound<=.001);
});
test('opposite-winding hole has algebraic area/centroid and affine covariance',()=>{
 const cs=[reverseContour(rectangle(0,0,100,100)),rectangle(60,20,20,20)],r=analyzeContours(cs);
 near(r.signedArea,9600);near(r.centroid.x,(10000*50-400*70)/9600);
 const moved=analyzeContours(transformContours(structuredClone(cs),[2,0,0,3,1e7,-1e7]));
 near(moved.signedArea,57600);near(moved.centroid.x,r.centroid.x*2+1e7);near(moved.centroid.y,r.centroid.y*3-1e7);
});
test('ellipse arc bounds converge without claiming perfect analytic ellipse equality',()=>{
 const r=analyzeContours([ellipse(0,0,100,100)],{tolerance:.002});
 assert(r.converged);near(r.length,628.40667923,.002);assert(r.lengthErrorBound<=.002);assert(Math.abs(r.signedArea)>31415);
});
test('open curves have no enclosed area and cusps report undefined curvature',()=>{
 const c=contour([node(0,0),node(100,0)],false),r=analyzeContours([c]);assert.equal(r.contours[0].signedArea,null);assert.equal(r.centroid,null);near(r.length,100);
 const s=[...segments(c)][0];near(segmentProperties(s,.4).position.x,40);near(segmentProperties(s,.4).curvature,0);
 const zero={p0:{x:0,y:0},p3:{x:0,y:0},curve:false};assert.equal(segmentProperties(zero,.5).curvature,null);
});
test('cubic inflection and curvature sign change are detected analytically',()=>{
 const c=contour([node(0,0,{out:{x:0,y:100}}),node(100,100,{in:{x:100,y:0}})],false),r=analyzeContours([c]);
 assert.equal(r.contours[0].segments[0].inflections.length,1);near(r.contours[0].segments[0].inflections[0],.5);
 const s=[...segments(c)][0];assert(segmentProperties(s,.25).curvature*segmentProperties(s,.75).curvature<0);
});
test('bounded analysis reports non-convergence rather than false precision',()=>{
 const r=analyzeContours([ellipse(0,0,1000,1000)],{tolerance:1e-10,maxDepth:1,maxSubdivisions:1});assert(!r.converged);assert.equal(r.subdivisions,1);
 assert.throws(()=>analyzeContours([rectangle(0,0,1,1)],{maxSegments:2}),/budget/);
 assert.throws(()=>analyzeContours([contour([node(0,0),{x:NaN,y:0}],false)]),/finite/);
 assert.throws(()=>analyzeContours([],{tolerance:0}),/tolerance/);assert.throws(()=>segmentProperties({},2),/parameter/);
 assert.equal(analyzeContours([]).segmentCount,0);
});
