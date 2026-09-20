import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeatures,compileLayout,normalizeFeatureConditions,featureCoordinate,matchFeatureCondition,encodeFeatureVariations} from '@wieslawsoltes/counterform-opentype';
import {createDemoFont,addMaster} from '@wieslawsoltes/counterform-model';
import {compileVariableTrueType,instanceDocument} from '@wieslawsoltes/counterform-variations';
import {compileTrueType} from '@wieslawsoltes/counterform-font-io';
import {readDirectory,Reader} from '@wieslawsoltes/counterform-binary';
const axes=[{tag:'wght',min:100,default:400,max:900,map:[[-1,-1],[0,0],[.5,.75],[1,1]]}];
const fea=`conditionset Heavy { wght 650 900; } Heavy;
feature rvrn { sub C by D; } rvrn;
variation rvrn Heavy { sub A by B; } rvrn;
variation kern Heavy { pos A V -120; } kern;`;
function doc(){const d=createDemoFont();d.data.axes=structuredClone(axes);d.data.masters[0].location={wght:400};d.data.masters=d.data.masters.slice(0,1);d.data.glyphs.forEach(g=>g.layers=g.layers.slice(0,1));addMaster(d,'Black',{wght:900});d.data.features=fea;return d;}
test('condition sets parse decimal design coordinates, named variations and universal fallback',()=>{
 const p=parseFeatures('conditionset Wide { wdth 87.5 125; } Wide; variation rvrn Wide { sub A by B; } rvrn; variation rvrn NULL { sub B by A; } rvrn;',['A','B']);
 assert.deepEqual(p.conditionSets.Wide.wdth,[87.5,125]);assert.deepEqual(p.variations.map(v=>v.conditionSet),['Wide','NULL']);
});
test('invalid condition declarations fail with source diagnostics',()=>{
 for(const text of ['conditionset H { wght 900 400; } H;','conditionset H { wght 400 900; wght 0 1; } H;','variation rvrn Absent { sub A by B; } rvrn;','conditionset NULL {} NULL;','conditionset H { wght Infinity 2; } H;'])assert.throws(()=>parseFeatures(text),/line \d+, column/);
});
test('conditions normalize through avar and test inclusive F2DOT14 boundaries',()=>{
 const c=normalizeFeatureConditions({Heavy:{wght:[650,900]}},axes).get('Heavy');
 assert.equal(c[0].min,.75);assert.equal(featureCoordinate(650,axes[0]),.75);
 assert(matchFeatureCondition(c,axes,{wght:650}));assert(!matchFeatureCondition(c,axes,{wght:649}));assert(matchFeatureCondition([],axes,{}));
 for(const sets of [{x:{wdth:[0,1]}},{x:{wght:[0,400]}},{x:{wght:[700,500]}}])assert.throws(()=>normalizeFeatureConditions(sets,axes));
});
test('GSUB and GPOS version 1.1 contain ordered conditional Feature substitutions',()=>{
 const d=doc(),raw=compileVariableTrueType(d),tables=readDirectory(raw).tables;
 for(const tag of ['GSUB','GPOS']){const r=new Reader(tables.get(tag).bytes);assert.equal(r.u32(),0x10001);r.seek(10);const v=r.u32();r.seek(v);assert.equal(r.u32(),0x10000);assert.equal(r.u32(),1);const cs=r.u32()+v,fs=r.u32()+v;r.seek(cs);assert.equal(r.u16(),1);r.seek(cs+r.u32());assert.equal(r.u16(),1);assert.equal(r.u16(),0);assert.equal(r.f2dot14(),.75);assert.equal(r.f2dot14(),1);r.seek(fs);assert.equal(r.u32(),0x10000);assert(r.u16()>0);}
});
test('static master and extracted instance compile resolved layout without FeatureVariations',()=>{
 const d=doc();for(const mid of d.data.masters.map(m=>m.id)){const tables=readDirectory(compileTrueType(d,{masterId:mid})).tables;assert.equal(new Reader(tables.get('GSUB').bytes).u32(),0x10000);}
 const i=instanceDocument(d,{wght:800});assert.equal(i.data.axes.length,0);assert.equal(i.data.featureInstance.location.wght,800);assert(compileTrueType(i).length>1000);
});
test('low-level FeatureVariations validates counts, indices and normalized ranges',()=>{
 assert.throws(()=>encodeFeatureVariations([{conditions:[{axisIndex:0,min:2,max:3}],substitutions:[]}]),/Invalid normalized/);
 assert.throws(()=>encodeFeatureVariations([{conditions:[],substitutions:[{featureIndex:1,indices:[]},{featureIndex:1,indices:[]}]}]),/duplicate/);
 assert.throws(()=>encodeFeatureVariations([{conditions:[],substitutions:[{featureIndex:0,indices:[-1]}]}]),/lookup indices/);
});
test('conditional-only features acquire a ScriptList entry; scope identity includes alternatives',()=>{
 const d=doc();d.data.features='conditionset H { wght 650 900; } H; variation rvrn H { script latn; language TRK; sub A by B; } rvrn;';
 const b=compileVariableTrueType(d);assert(readDirectory(b).tables.has('GSUB'));
 d.data.axes=[];assert.throws(()=>compileLayout(d.data,d.data.glyphs,d.data.masters[0].id),/axes/);
});

test('static feature-instance context validates input and follows the active design space when axes return',()=>{
 const d=doc(),before=compileTrueType(d);d.data.featureInstance={axes:structuredClone(d.data.axes),location:{wght:800}};assert.deepEqual(compileTrueType(d),before);
 const i=instanceDocument(d,{wght:800});i.data.featureInstance.axes[0].map=[[0,0]];assert.throws(()=>new (d.constructor)(i.data),/map|mapping/i);
});
