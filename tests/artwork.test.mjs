import test from 'node:test';
import assert from 'node:assert/strict';
import {Writer} from '@wieslawsoltes/counterform-binary';
import {inspectPNG,createBitmapReference,createVectorReference,duplicateReference,referenceContours,referenceBounds,validateArtwork,bytesToBase64,bytesFromBase64} from '@wieslawsoltes/counterform-artwork';
import {createDemoFont,duplicateGlyph,validateDocumentShape} from '@wieslawsoltes/counterform-model';
import {History} from '@wieslawsoltes/counterform-history';
import {compileTrueType,compileOpenTypeCFF} from '@wieslawsoltes/counterform-font-io';
import {captureOriginal,preservationStatus} from '@wieslawsoltes/counterform-preservation';
import {exportUFO,importUFO} from '@wieslawsoltes/counterform-ufo';
import {rectangle} from '@wieslawsoltes/counterform-geometry';
import {makePNG,pngChunk} from './artwork-fixture.mjs';

test('PNG preflight verifies dimensions, byte views and every truncation before native decode',()=>{
 const {bytes}=makePNG();assert.equal(inspectPNG(bytes).width,32);const framed=new Uint8Array(bytes.length+6);framed.set(bytes,3);assert.deepEqual(inspectPNG(framed.subarray(3,-3)),inspectPNG(bytes));
 for(let n=0;n<bytes.length;n++)assert.throws(()=>inspectPNG(bytes.subarray(0,n)));
 const broken=bytes.slice();broken[broken.length-8]^=1;assert.throws(()=>inspectPNG(broken),/checksum/);
 assert.throws(()=>inspectPNG(new Uint8Array([...bytes,0])),/trailer/);
});
test('PNG preflight rejects unsafe dimensions, animation, critical extensions and broken data order',()=>{
 const {bytes}=makePNG(),join=(...parts)=>new Writer().raw(parts.flatMap(p=>[...p])).finish();
 const header=new Writer().u32(100000).u32(100000).u8(8).u8(6).u8(0).u8(0).u8(0).finish();
 assert.throws(()=>inspectPNG(join(bytes.subarray(0,8),pngChunk('IHDR',header),bytes.subarray(33))),/dimensions/);
 for(const tag of ['acTL','ZZZZ'])assert.throws(()=>inspectPNG(join(bytes.subarray(0,33),pngChunk(tag,new Uint8Array(8)),bytes.subarray(33))),/Animated|critical/);
 assert.throws(()=>inspectPNG(join(bytes.subarray(0,-12),pngChunk('tEXt',new Uint8Array()),pngChunk('IDAT',new Uint8Array([0])),bytes.subarray(-12))),/order/);
});
test('embedded PNG base64 is canonical and source dimensions cannot be forged',()=>{
 const {bytes}=makePNG(),r=createBitmapReference(bytes);assert.deepEqual(bytesFromBase64(r.png),bytes);assert.equal(bytesToBase64(bytes),r.png);
 for(const invalid of ['','!','YQ=','YR==','data:image/png;base64,AAAA'])assert.throws(()=>inspectPNG(bytesFromBase64(invalid)));
 assert.throws(()=>validateArtwork([{...r,width:33}]),/dimensions/);
});
test('artwork transforms, opacity, locks and aggregate budgets are validated without mutation',()=>{
 const r=createVectorReference([rectangle(0,0,20,30)]),before=structuredClone(r);assert.deepEqual(validateArtwork([r]),{bytes:0,pixels:0,points:4});
 for(const bad of [{opacity:-1},{opacity:NaN},{transform:[0,0,0,0,0,0]},{transform:[1,0,0,1,Infinity,0]},{visible:1},{name:null},{kind:'html'},{contours:[{closed:true,nodes:[null]}]}])assert.throws(()=>validateArtwork([{...r,...bad}]));
 assert.throws(()=>validateArtwork([r,r]),/duplicate/);assert.deepEqual(r,before);
});
test('mask insertion bakes its affine transform and uses independent outline identities',()=>{
 const original=rectangle(0,0,20,30),r=createVectorReference([original],{transform:[2,0,0,-2,10,70]}),a=referenceContours(r),b=referenceContours(r);assert.deepEqual(referenceBounds(r),{minX:10,minY:10,maxX:50,maxY:70,width:40,height:60,empty:false});assert.notEqual(a[0].id,b[0].id);assert.notEqual(a[0].nodes[0].id,original.nodes[0].id);assert.deepEqual(r.contours,[original]);
 const copy=duplicateReference(r);assert.notEqual(copy.id,r.id);copy.contours[0].nodes[0].x=100;assert.notEqual(r.contours[0].nodes[0].x,100);
});
test('per-master references undo and redo without changing compiled TrueType or CFF font bytes',()=>{
 const doc=createDemoFont(),g=doc.glyph('A'),mid=doc.data.masters[0].id,history=new History(doc),old=doc.serialize(),ttf=compileTrueType(doc),cff=compileOpenTypeCFF(doc);
 history.execute('Artwork',()=>doc.layer(g.id,mid).artwork=[createBitmapReference(makePNG().bytes),createVectorReference(doc.layer(g.id,mid).contours)],g.id);
 assert.equal(doc.layer(g.id,doc.data.masters[1].id).artwork,undefined);assert.deepEqual(compileTrueType(doc),ttf);assert.deepEqual(compileOpenTypeCFF(doc),cff);history.undo();assert.equal(doc.serialize(),old);history.redo();validateDocumentShape(doc.data);
 const copy=duplicateGlyph(doc.glyph('A'),'A.copy');assert.notEqual(copy.layers[0].artwork[0].id,doc.glyph('A').layers[0].artwork[0].id);
});
test('artwork survives Counterform/UFO source interchange and remains nonstructural for opaque font preservation',async()=>{
 const doc=createDemoFont(),bytes=compileTrueType(doc),archive=await captureOriginal(bytes,doc.data),g=doc.glyph('A');g.layers[0].artwork=[createBitmapReference(makePNG().bytes)];
 assert.deepEqual(await preservationStatus(archive,doc.data),{unchanged:true,metadataOnly:true});const imported=await importUFO(exportUFO(doc));assert.deepEqual(imported.glyph('A').layers[0].artwork,g.layers[0].artwork);
});
