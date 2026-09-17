import test from 'node:test';
import assert from 'node:assert/strict';
import { brotliDecompressSync } from 'node:zlib';
import { createDemoFont, FontDocument } from '@wieslawsoltes/counterform-model';
import { compileTrueType, compileOpenTypeCFF } from '@wieslawsoltes/counterform-font-io';
import { readDirectory, checksum } from '@wieslawsoltes/counterform-binary';
import { encodeItemVariationStore, VariationStoreBuilder } from '@wieslawsoltes/counterform-varstore';
import { compileOpenTypeCFF2 } from '@wieslawsoltes/counterform-cff2';
import { compileVariableTrueType, instanceDocument } from '@wieslawsoltes/counterform-variations';
import { uintBase128, brotliStore, encodeWOFF2 } from '@wieslawsoltes/counterform-woff2';
import { encodeWOFF2Compressed } from '@wieslawsoltes/counterform-woff2/node';
import { CompilerClient } from '@wieslawsoltes/counterform-compiler';
import { Worker } from 'node:worker_threads';

test('portable Brotli blocks decode independently across every block-size boundary',()=>{
    for(const n of [0,1,2,65535,65536,65537,131072,199999]){
        const source=Uint8Array.from({length:n},(_,i)=>(i*37)&255);
        assert.deepEqual(new Uint8Array(brotliDecompressSync(brotliStore(source))),source);
    }
});
test('UIntBase128 encodes canonical values and rejects unsafe lengths',()=>{
    assert.deepEqual([...uintBase128(128)],[129,0]);assert.deepEqual([...uintBase128(0xffffffff)],[143,255,255,255,127]);
    for(const n of [-1,1.5,NaN,0x100000000])assert.throws(()=>uintBase128(n));
});
test('WOFF2 portable and compressed encoders write valid bounded headers without mutating source',()=>{
    const d=createDemoFont(),input=compileTrueType(d),copy=input.slice();
    const stored=encodeWOFF2(input),compressed=encodeWOFF2Compressed(input);
    for(const bytes of [stored,compressed]){const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);assert.equal(v.getUint32(0),0x774f4632);assert.equal(v.getUint32(8),bytes.length);}
    assert(compressed.length<stored.length);assert.deepEqual(input,copy);
    assert.throws(()=>encodeWOFF2(input,{maxBytes:4}));d.dispose();
});
test('CFF2 static and variable encoders write actual tables and valid whole-font checksum',()=>{
    const d=createDemoFont();for(const variable of [false,true]){
        const bytes=compileOpenTypeCFF2(d,{variable}),{tables}=readDirectory(bytes);
        assert(tables.has('CFF2'));assert(!tables.has('CFF '));assert.equal(tables.get('CFF2').bytes[0],2);
        assert.equal(tables.has('fvar'),variable);assert.equal(tables.has('HVAR'),variable);assert.equal(checksum(bytes),0xb1b0afba);
    }d.dispose();
});
test('CFF2 rejects missing masters and incompatible topology rather than exporting corruption',()=>{
    const d=createDemoFont();assert.throws(()=>compileOpenTypeCFF2(d,{masterId:'missing'}));
    d.glyph('A').layers[1].contours.pop();assert.throws(()=>compileOpenTypeCFF2(d,{variable:true}),/topology/);d.dispose();
});
test('variable metrics affect HVAR/MVAR and in-memory instances',()=>{
    const d=createDemoFont();d.data.masters.at(-1).metrics={ascender:950,capHeight:750};
    const bytes=compileVariableTrueType(d),{tables}=readDirectory(bytes);assert(tables.has('HVAR'));assert(tables.has('MVAR'));
    const m=d.data.masters.at(-1),ins=instanceDocument(d,m.location);assert.equal(ins.info.ascender,950);ins.dispose();d.dispose();
});
test('item variation stores reject malformed support/row arrays and deduplicate positioning deltas',()=>{
    const b=new VariationStoreBuilder(['wght'],[{wght:[0,1,1]}]);assert.equal(b.add([0]),null);assert.deepEqual(b.add([1.1]),{outer:0,inner:0});assert.deepEqual(b.add([1.2]),{outer:0,inner:0});assert(b.encode().length);
    assert.throws(()=>encodeItemVariationStore(['wght'],[{wght:[1,0,1]}]));
    assert.throws(()=>encodeItemVariationStore(['wght'],[{wght:[0,1,1]}],[{items:[[1,2]]}]));
});
test('real compiler worker supports every new export and validates unknown formats',async()=>{
    const d=createDemoFont(),c=new CompilerClient({workerFactory:()=>new Worker(new URL(import.meta.resolve('@wieslawsoltes/counterform-compiler/node-worker')))});
    try{for(const format of ['cff2','variable-cff2','woff2','variable-woff2','cff2-woff2']){const {bytes,mime}=await c.compile(d,{format});assert(bytes.length>1000);assert(mime.startsWith('font/'));}await assert.rejects(c.compile(d,{format:'unknown'}));}finally{c.dispose();d.dispose();}
});

test('WOFF2 padding and known tags are canonical for every remainder; DSIG is excluded',()=>{
 const d=createDemoFont();for(let n=0;n<4;n++){const b=compileTrueType(d,{extraTables:new Map([['ZZZZ',new Uint8Array(n+1)],['DSIG',new Uint8Array(8)]])}),w=encodeWOFF2(b);assert.equal(w.length%4,0);assert.equal(new DataView(w.buffer).getUint16(12),readDirectory(b).tables.size-1);const names=new TextDecoder('latin1').decode(w.subarray(48,110));assert(!names.includes('head'));}d.dispose();
});
