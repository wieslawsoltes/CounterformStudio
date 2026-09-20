import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readDirectory,Writer} from '@wieslawsoltes/counterform-binary';
import {FontDocument,createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileTrueType,compileOpenTypeCFF,parseTrueType} from '@wieslawsoltes/counterform-font-io';
import {compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
import {History} from '@wieslawsoltes/counterform-history';
import {createBitmapGlyph,encodeSbix,decodeSbix,encodeCBDT,decodeCBDT,readBitmapTables,validateBitmapSource,prepareBitmapPNG,compileBitmapTables} from '@wieslawsoltes/counterform-bitmap';
import {bytesToBase64} from '@wieslawsoltes/counterform-artwork';
import {bitmapFont,colorPNG,indexFixture} from './bitmap-fixture.mjs';
import {pngChunk} from './artwork-fixture.mjs';
const clone=structuredClone,ids=d=>d.data.glyphs.map(g=>g.id),widths=d=>d.data.glyphs.map(g=>g.layers[0].advanceWidth);
const normalized=r=>[...r.bitmaps].map(([id,entries])=>[id,entries.map(e=>{const s=r.bitmapFont.strikes.find(s=>s.id===e.strikeId);return {...e,strikeId:`${s.ppem}/${s.ppi}`};})]);

test('bitmap source is optional; outline-only binaries do not acquire empty color tables',()=>{
    const d=createDemoFont();assert.equal(compileBitmapTables(d.data).size,0);const tables=readDirectory(compileTrueType(d)).tables;
    for(const t of ['sbix','CBLC','CBDT'])assert(!tables.has(t));
    assert.throws(()=>validateBitmapSource({glyphs:[{bitmaps:{}}]}),/bitmap list/);
    assert.throws(()=>validateBitmapSource({glyphs:[{bitmaps:[{}]}]}),/strike settings/);
});
test('sbix encodes sorted multiple strikes, sparse glyphs and exact duplicate artwork',()=>{
    const d=bitmapFont('sbix'),bytes=encodeSbix(d.data),r=decodeSbix(bytes,ids(d));
    assert.deepEqual(r.bitmapFont.strikes.map(s=>s.ppem),[64,96]);assert.equal(r.bitmaps.size,3);
    assert.equal(r.bitmaps.get(d.glyph('A').id)[0].x,2);assert.equal(r.bitmaps.get(d.glyph('B').id)[0].y,-3);
    assert(Buffer.from(bytes).includes(Buffer.from('dupe')));assert.equal(r.bitmaps.get(d.glyph('V').id)[0].png,d.glyph('A').bitmaps[0].png);
    d.data.bitmapFont.overlay=true;assert.equal(decodeSbix(encodeSbix(d.data),ids(d)).bitmapFont.overlay,true);
});
test('sbix image origins are part of the deduplication key',()=>{
    const d=bitmapFont('sbix');d.glyph('V').bitmaps.forEach(e=>e.x++);const bytes=encodeSbix(d.data);
    assert(!Buffer.from(bytes).includes(Buffer.from('dupe')));assert.equal(decodeSbix(bytes,ids(d)).bitmaps.get(d.glyph('V').id)[0].x,3);
});
test('sbix rejects invalid offsets, flags, versions, targets and cyclic dupe chains',()=>{
    const d=bitmapFont('sbix'),bytes=encodeSbix(d.data),all=ids(d);
    for(const [pos,val]of [[0,2],[2,0]]){const b=bytes.slice();new DataView(b.buffer).setUint16(pos,val);assert.throws(()=>decodeSbix(b,all));}
    let b=bytes.slice();new DataView(b.buffer).setUint32(8,0);assert.throws(()=>decodeSbix(b,all),/offset/);
    const at=Buffer.from(bytes).indexOf('dupe');assert(at>0);b=bytes.slice();new DataView(b.buffer).setUint16(at+4,all.indexOf(d.glyph('V').id));assert.throws(()=>decodeSbix(b,all),/Cyclic/);
    b=bytes.slice();new DataView(b.buffer).setUint16(at+4,all.length);assert.throws(()=>decodeSbix(b,all),/target/);
    b=bytes.slice();b.set(Buffer.from('jpeg'),at);assert.throws(()=>decodeSbix(b,all),/graphic type/);
    for(let n=0;n<Math.min(bytes.length,120);n++)assert.throws(()=>decodeSbix(bytes.subarray(0,n),all));
});
test('CBDT PNG17/18 and CBLC index1 preserve bearings, explicit and automatic advances',()=>{
    const d=bitmapFont(),tables=encodeCBDT(d.data,d.data.glyphs,widths(d)),r=decodeCBDT(tables.get('CBDT'),tables.get('CBLC'),ids(d));
    assert.deepEqual(r.bitmapFont.strikes.map(s=>s.ppem),[64,96]);assert.equal(r.bitmaps.size,3);
    const e=r.bitmaps.get(d.glyph('B').id)[0];assert.deepEqual({x:e.x,y:e.y,advance:e.advance,vertical:e.vertical},{x:-2,y:-3,advance:42,vertical:{x:-8,y:8,advance:64}});
    assert.equal(r.bitmaps.get(d.glyph('A').id)[0].advance,Math.round(d.glyph('A').layers[0].advanceWidth*64/d.info.unitsPerEm));
});
for(const index of [1,2,3,4,5])for(const format of [17,18,...([2,5].includes(index)?[19]:[])])test(`CBDT reconstructs independent index ${index} / image ${format}`,()=>{
    const f=indexFixture(index,format),r=decodeCBDT(f.cbdt,f.cblc,['zero','one','two','three']);assert.deepEqual([...r.bitmaps.keys()],f.gids.map(g=>['zero','one','two','three'][g]));
    for(const es of r.bitmaps.values()){assert.equal(es[0].x,2);assert.equal(es[0].y,-2);assert.equal(es[0].advance,9);assert.equal(es[0].png,bytesToBase64(f.png));if(format!==17)assert.deepEqual(es[0].vertical,{x:-3,y:4,advance:10});}
});
test('CBDT rejects unsupported metrics, non-square/vertical strikes, damaged indexes and PNG dimensions',()=>{
    const f=indexFixture(1,17),all=['zero','one','two','three'];
    for(const pos of [45+8,46+8,47+8]){const b=f.cblc.slice();b[pos]=99;assert.throws(()=>decodeCBDT(f.cbdt,b,all));}
    const b=f.cbdt.slice();b[4]=9;assert.throws(()=>decodeCBDT(b,f.cblc,all),/dimensions/);
    const bad=f.cblc.slice();new DataView(bad.buffer).setUint32(64+8,0xffffffff);assert.throws(()=>decodeCBDT(f.cbdt,bad,all),/offset/);
    for(let n=0;n<f.cblc.length;n++)assert.throws(()=>decodeCBDT(f.cbdt,f.cblc.subarray(0,n),all));
    assert.throws(()=>decodeCBDT(f.cbdt.subarray(0,f.cbdt.length-1),f.cblc,all));
});
test('strike validation rejects duplicates, missing references and unrepresentable fields',()=>{
    const d=bitmapFont();for(const mutate of [
        s=>s.bitmapFont.strikes[1].ppem=96,s=>s.bitmapFont.strikes[0].id='small',s=>s.bitmapFont.strikes[0].ppem=256,
        s=>s.bitmapFont.strikes[0].ppi=96,s=>s.bitmapFont.overlay=true,s=>s.glyphs.find(g=>g.name==='A').bitmaps[0].strikeId='missing',
        s=>s.glyphs.find(g=>g.name==='A').bitmaps[0].x=128,s=>s.glyphs.find(g=>g.name==='A').bitmaps[0].y=100,
        s=>s.glyphs.find(g=>g.name==='A').bitmaps[0].advance=256,s=>s.glyphs.find(g=>g.name==='A').bitmaps[0].png='bad',
        s=>s.glyphs.find(g=>g.name==='A').bitmaps.push(clone(s.glyphs.find(g=>g.name==='A').bitmaps[0]))]){
        const source=clone(d.data);mutate(source);assert.throws(()=>validateBitmapSource(source));
    }
    const s=clone(d.data);s.info.unitsPerEm=16;assert.throws(()=>encodeCBDT(s,s.glyphs,widths(d)),/advance/);
});
test('PNG metadata is stripped while unsupported color conversions fail explicitly',()=>{
    const png=colorPNG(),chunk=pngChunk('tEXt',Buffer.from('Comment\0Author data')),withText=new Uint8Array([...png.subarray(0,33),...chunk,...png.subarray(33)]);
    assert.deepEqual(prepareBitmapPNG(withText),png);
    const gamma=pngChunk('gAMA',new Writer().u32(45455).finish()),withGamma=new Uint8Array([...png.subarray(0,33),...gamma,...png.subarray(33)]);
    assert.throws(()=>prepareBitmapPNG(withGamma),/sRGB/);
});
test('matching bitmap table families reconstruct atomically and retain distinct formats as warnings',()=>{
    const d=bitmapFont(),t=compileBitmapTables(d.data,d.data.glyphs,widths(d)),r=readBitmapTables(t,ids(d));assert.equal(r.bitmapFont.format,'both');assert.equal(r.supported.length,3);assert.deepEqual(r.warnings,[]);
    d.glyph('A').bitmaps[0].x++;t.set('sbix',encodeSbix(d.data));const distinct=readBitmapTables(t,ids(d));assert.equal(distinct.bitmapFont.format,'sbix');assert.deepEqual(distinct.supported,['sbix']);assert.match(distinct.warnings[0],/Distinct/);
    t.set('sbix',new Uint8Array([0]));const partial=readBitmapTables(t,ids(d));assert.equal(partial.bitmapFont.format,'cbdt');assert.match(partial.warnings[0],/reconstruction/);
});
test('source validation and history undo retain complete bitmap data without modifying outlines',()=>{
    const d=createDemoFont(),history=new History(d),original=clone(d.data),ready=bitmapFont();
    history.execute('Bitmap source',()=>{d.data.bitmapFont=clone(ready.data.bitmapFont);d.glyph('A').bitmaps=clone(ready.glyph('A').bitmaps);});
    const entry=clone(d.glyph('A').bitmaps);history.undo();assert.deepEqual(d.data,original);history.redo();assert.deepEqual(d.glyph('A').bitmaps,entry);
    const restored=new FontDocument(JSON.parse(d.serialize()));assert.deepEqual(restored.glyph('A').bitmaps,entry);
    assert.deepEqual(d.glyph('A').layers,original.glyphs.find(g=>g.name==='A').layers);
    assert.throws(()=>history.execute('Invalid bitmap',()=>d.glyph('A').bitmaps[0].strikeId='bad'));assert.deepEqual(d.glyph('A').bitmaps,entry);
});
test('TTF reconstructs native bitmap source; static/variable and CFF binaries include real tables',()=>{
    const d=bitmapFont(),bytes=compileTrueType(d),parsed=parseTrueType(bytes);assert.equal(parsed.data.bitmapFont.format,'both');assert.equal(parsed.glyph('A').bitmaps.length,2);
    for(const compile of [compileTrueType,compileVariableTrueType,compileOpenTypeCFF]){const t=readDirectory(compile(d)).tables;assert(t.has('sbix')&&t.has('CBDT')&&t.has('CBLC'));}
    const again=parseTrueType(compileTrueType(parsed));for(const tag of ['sbix','CBDT','CBLC'])assert.deepEqual(readDirectory(compileTrueType(parsed)).tables.get(tag).bytes,readDirectory(compileTrueType(again)).tables.get(tag).bytes);
});
test('a real Node compiler worker emits byte-identical bitmap fonts and disposes cleanly',async()=>{
    const compiler=new CompilerClient({workerFactory:()=>new Worker(new URL('../packages/compiler/src/node-worker.js',import.meta.url))});
    try{const d=bitmapFont();const {bytes}=await compiler.compile(d,{format:'ttf'});assert.deepEqual(bytes,compileTrueType(d));}finally{compiler.dispose();}
});

test('bitmap strikes persist in custom UFO metadata; edits invalidate opaque metadata-only reuse',async()=>{
    const {exportUFO,importUFO}=await import('@wieslawsoltes/counterform-ufo');
    const {captureOriginal,preservationStatus}=await import('@wieslawsoltes/counterform-preservation');
    const {duplicateGlyph}=await import('@wieslawsoltes/counterform-model');
    const d=bitmapFont(),bytes=compileTrueType(d),archive=await captureOriginal(bytes,d.data);
    const imported=await importUFO(exportUFO(d));assert.deepEqual(imported.data.bitmapFont,d.data.bitmapFont);assert.deepEqual(imported.glyph('A').bitmaps,d.glyph('A').bitmaps);
    const copy=duplicateGlyph(d.glyph('A'),'A.copy');copy.bitmaps[0].x++;assert.notEqual(copy.bitmaps[0].x,d.glyph('A').bitmaps[0].x);
    assert((await preservationStatus(archive,d.data)).metadataOnly);d.glyph('A').bitmaps[0].x++;assert(!(await preservationStatus(archive,d.data)).metadataOnly);
});
