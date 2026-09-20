import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeCollection,readCollection,extractCollectionFace,readDirectory,Reader,checksum,sfnt} from '@wieslawsoltes/counterform-binary';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileTrueType,compileOpenTypeCFF} from '@wieslawsoltes/counterform-font-io';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
const doc=createDemoFont(),ttf=compileTrueType(doc),otf=compileOpenTypeCFF(doc),cff2=compileOpenTypeCFF2(doc);
test('v1/v2 collections support mixed sfnt outlines and preserve input bytes',()=>{
 for(const version of [1,2]){
  const raw=encodeCollection([ttf,otf,cff2],{version}),c=readCollection(raw);
  assert.equal(c.version,version);assert.equal(c.faces.length,3);assert.equal(c.signature,null);
  for(let i=0;i<3;i++){const face=extractCollectionFace(raw,i);assert.equal(checksum(face),0xb1b0afba);const originals=readDirectory([ttf,otf,cff2][i]).tables;for(const [tag,t]of readDirectory(face).tables)if(tag!=='head')assert.deepEqual(t.bytes,originals.get(tag).bytes);}
 }
});
test('identical tables share actual aligned offsets without mutating source',()=>{
 const before=ttf.slice(),raw=encodeCollection([ttf,ttf]);assert.deepEqual(ttf,before);const c=readCollection(raw);
 assert(raw.length<ttf.length*1.1);const t0=c.faces[0].tables.find(t=>t.tag==='glyf'),t1=c.faces[1].tables.find(t=>t.tag==='glyf');assert.equal(t0.offset,t1.offset);assert.equal(t0.offset%4,0);
 const unshared=readCollection(encodeCollection([ttf,ttf],{shareTables:false}));assert.notEqual(unshared.faces[0].tables[0].offset,unshared.faces[1].tables[0].offset);
});
test('repackaging removes invalid signatures and zeroes collection head adjustments',()=>{
 const tables=new Map([...readDirectory(ttf).tables].map(([tag,t])=>[tag,t.bytes.slice()]));tables.get('head').fill(0,8,12);tables.set('DSIG',new Uint8Array(8));const raw=encodeCollection([sfnt(tables)]);
 const face=readCollection(raw).faces[0];assert(!face.tables.some(t=>t.tag==='DSIG'));assert.equal(new Reader(face.tables.find(t=>t.tag==='head').bytes).seek(8).u32(),0);
});
test('collection parser rejects truncation, corrupt checksums and directory/table overlap',()=>{
 const raw=encodeCollection([ttf,otf]);for(const length of [0,3,11,20,raw.length-9])assert.throws(()=>readCollection(raw.slice(0,length)));
 const broken=raw.slice(),c=readCollection(raw);broken[c.faces[0].tables.find(t=>t.tag==='glyf').offset+12]^=1;assert.throws(()=>readCollection(broken),/checksum/);assert.equal(readCollection(broken,{verifyChecksums:false}).faces.length,2);
 const aliased=raw.slice();new DataView(aliased.buffer).setUint32(16,c.faces[0].offset);assert.throws(()=>readCollection(aliased),/Overlapping/);
 const overlap=raw.slice(),v=new DataView(overlap.buffer);v.setUint32(c.faces[0].offset+12+8,0);assert.throws(()=>readCollection(overlap,{verifyChecksums:false}),/Overlapping/);
});
test('invalid face indices, budgets and nested collections fail explicitly',()=>{
 const raw=encodeCollection([ttf]);for(const index of [-1,1,NaN,.5])assert.throws(()=>extractCollectionFace(raw,index));
 for(const f of [[],Array(257).fill(ttf),[raw]])assert.throws(()=>encodeCollection(f));assert.throws(()=>encodeCollection([ttf],{version:3}));
});

test('bulk collection extraction preserves opaque tables without repeating shared checksum work',async()=>{
 const {extractCollectionFaces,sfnt,readDirectory}=await import('@wieslawsoltes/counterform-binary');
 const raw=compileTrueType(createDemoFont()),directory=readDirectory(raw),tables=new Map([...directory.tables].map(([tag,t])=>[tag,t.bytes]));tables.set('PRIV',new Uint8Array([1,2,3,4,5]));const source=sfnt(tables);
 const rebuilt=extractCollectionFaces(encodeCollection([source,source]));assert.equal(rebuilt.length,2);for(const bytes of rebuilt)assert.deepEqual(readDirectory(bytes).tables.get('PRIV').bytes,new Uint8Array([1,2,3,4,5]));
});

test('sfnt repackaging normalizes an existing head adjustment without mutating input tables',()=>{
 const source=compileTrueType(createDemoFont()),before=source.slice(),tables=new Map([...readDirectory(source).tables].map(([tag,t])=>[tag,t.bytes]));const rebuilt=sfnt(tables);
 assert.equal(checksum(rebuilt),0xb1b0afba);assert.deepEqual(source,before);assert.equal(readCollection(encodeCollection([rebuilt])).faces.length,1);
});


test('sfnt rejects duplicate and invalid directory tags before writing bytes',()=>{
 assert.throws(()=>sfnt([['TEST',new Uint8Array()],['TEST',new Uint8Array()]]),/duplicate/);
 assert.throws(()=>sfnt(new Map([['\u0000bad',new Uint8Array()]])),/Invalid sfnt/);
});
