import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAxisMap,mapAxisCoordinate,encodeAvar,decodeAvar} from '@wieslawsoltes/counterform-varstore';
import {createDemoFont,FontDocument} from '@wieslawsoltes/counterform-model';
import {normalizeLocation,compileVariableTrueType,instanceDocument} from '@wieslawsoltes/counterform-variations';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {readDirectory} from '@wieslawsoltes/counterform-binary';
const map=[[-1,-1],[0,0],[.5,.25],[1,1]];
test('normalized axis mapping is deterministic, piecewise linear and non-mutating',()=>{
 assert.deepEqual(normalizeAxisMap(),[[-1,-1],[0,0],[1,1]]);
 const copy=normalizeAxisMap(map);copy[2][1]=.5;assert.equal(map[2][1],.25);
 assert.equal(mapAxisCoordinate(.25,map),.125);assert.equal(mapAxisCoordinate(.75,map),.625);
 assert.equal(mapAxisCoordinate(-3,map),-1);assert.equal(mapAxisCoordinate(3,map),1);
 assert.equal(mapAxisCoordinate(.2,[[-1,-1],[0,0],[.5,0],[1,1]]),0);
});
test('axis maps reject bad endpoints, retrograde output, nonfinite values and quantized collisions',()=>{
 for(const m of [[[0,0]], [[-1,-1],[0,.1],[1,1]], [[-1,-1],[0,0],[.5,.8],[.75,.4],[1,1]], [[-1,-1],[0,0],[.5,.5],[.5000001,.6],[1,1]], [[-1,-1],[0,NaN],[1,1]]])assert.throws(()=>normalizeAxisMap(m));
 assert.throws(()=>mapAxisCoordinate(Infinity,map));
 assert.throws(()=>normalizeAxisMap([[-1,-1],[0,0],[,.2],[1,1]]));
});
test('avar binary codec includes identity records for unmapped axes and rejects bad framing',()=>{
 const bytes=encodeAvar([{map},{}]);assert.deepEqual(decodeAvar(bytes,2),[map,normalizeAxisMap()]);
 assert.equal(encodeAvar([{}]),null);assert.throws(()=>decodeAvar(bytes,1));
 for(let i=0;i<bytes.length;i++)assert.throws(()=>decodeAvar(bytes.slice(0,i),2));
 const altered=bytes.slice();altered[1]=2;assert.throws(()=>decodeAvar(altered));
 assert.throws(()=>decodeAvar(new Uint8Array([...bytes,0])));
});
test('source validation rejects invalid maps and preview normalizes both source masters and queries',()=>{
 const d=createDemoFont(),axis=d.data.axes[0];axis.map=map;
 assert.equal(normalizeLocation({[axis.tag]:(axis.default+axis.max)/2},d.data.axes)[axis.tag],.25);
 const withMap=instanceDocument(d,{[axis.tag]:(axis.default+axis.max)/2});
 const plain=new FontDocument(structuredClone(d.data));delete plain.data.axes[0].map;
 const without=instanceDocument(plain,{[axis.tag]:axis.default+(axis.max-axis.default)/4});
 assert.equal(withMap.glyph('A').layers[0].advanceWidth,without.glyph('A').layers[0].advanceWidth);
 const bad=structuredClone(d.data);bad.axes[0].map=[[0,0]];assert.throws(()=>new FontDocument(bad));
});
test('TrueType and CFF2 variable exports contain the same axis map',()=>{
 const d=createDemoFont();d.data.axes[0].map=map;
 for(const bytes of [compileVariableTrueType(d),compileOpenTypeCFF2(d,{variable:true})])assert.deepEqual(decodeAvar(readDirectory(bytes).tables.get('avar').bytes,1),[map]);
});
