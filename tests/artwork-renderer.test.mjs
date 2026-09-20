import test from 'node:test';
import assert from 'node:assert/strict';
import {ArtworkRenderer} from '../packages/renderer/src/artwork.js';
import {createBitmapReference,createVectorReference} from '@wieslawsoltes/counterform-artwork';
import {rectangle} from '@wieslawsoltes/counterform-geometry';
import {makePNG} from './artwork-fixture.mjs';
function harness(){
 const events=[];let fail=false;
 const S={SKImage:{FromEncodedData(){if(fail)return null;events.push('image');return {Width:32,Height:32,Dispose(){events.push('imageDisposed');}};}},SKPaint:class{Dispose(){events.push('paintDisposed');}},SKColor:class{constructor(...channels){events.push(channels);}},SKPaintStyle:{Fill:1},SKMatrix:class{constructor(...m){events.push(m);}}};
 const renderer=new ArtworkRenderer(S,()=>{events.push('path');return {Dispose(){events.push('pathDisposed');}};});
 const canvas={Save(){events.push('save');},Restore(){events.push('restore');},Concat(){},DrawImage(){events.push('drawImage');},DrawPath(){events.push('drawPath');}};
 return{events,renderer,canvas,fail(){fail=true;}};
}
test('native artwork caches bitmap pixels, invalidates geometry, applies alpha and maps the exact affine',()=>{
 const h=harness(),r=createBitmapReference(makePNG().bytes,{opacity:.5,transform:[1,2,3,4,5,6]});h.renderer.update([r]);assert.equal(h.renderer.draw(h.canvas),1);h.renderer.update([r]);h.renderer.draw(h.canvas);
 assert.equal(h.events.filter(e=>e==='image').length,1);assert(h.events.some(e=>Array.isArray(e)&&JSON.stringify(e)==='[255,255,255,128]'));assert(h.events.some(e=>Array.isArray(e)&&JSON.stringify(e)==='[1,3,5,2,4,6,0,0,1]'));
 h.renderer.update([]);assert.equal(h.events.filter(e=>e==='imageDisposed').length,1);h.renderer.dispose();assert.equal(h.events.filter(e=>e==='imageDisposed').length,1);
});
test('artwork kind changes, hidden layers and disposal release the exact native resources',()=>{
 const h=harness(),r=createBitmapReference(makePNG().bytes),v={...createVectorReference([rectangle(0,0,2,2)]),id:r.id};h.renderer.update([r]);h.renderer.draw(h.canvas);h.renderer.update([v]);h.renderer.draw(h.canvas);
 assert.equal(h.events.filter(e=>e==='imageDisposed').length,1);assert.equal(h.events.filter(e=>e==='drawPath').length,1);h.renderer.update([{...v,visible:false}]);assert.equal(h.events.filter(e=>e==='pathDisposed').length,1);assert.equal(h.renderer.draw(h.canvas),0);h.renderer.dispose();h.renderer.draw(h.canvas);assert.equal(h.renderer.entries.size,0);
});
test('failed artwork decoding allocates no paint and failed drawing balances native save/restore',()=>{
 const h=harness(),r=createBitmapReference(makePNG().bytes);h.fail();h.renderer.update([r]);assert.throws(()=>h.renderer.draw(h.canvas),/decode/);assert(!h.events.includes('save'));h.renderer.dispose();
 const k=harness();k.renderer.update([r]);k.canvas.DrawImage=()=>{throw new Error('GPU failure');};assert.throws(()=>k.renderer.draw(k.canvas),/GPU failure/);assert.deepEqual(k.events.slice(-2),['paintDisposed','restore']);k.renderer.dispose();assert(k.events.includes('imageDisposed'));
});
