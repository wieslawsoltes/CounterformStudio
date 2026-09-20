import {Reader, Writer, checksum, sfnt} from './index.js';
const LIMIT = 256 * 1024 * 1024;
const align = value => Math.ceil(value / 4) * 4;
const validFlavor = n => n === 0x10000 || n === 0x4f54544f || n === 0x74727565;
const bytes = b => { if (!(b instanceof Uint8Array)) throw new TypeError('Expected Uint8Array font bytes'); if(b.length>LIMIT)throw new RangeError('Collection byte budget exceeded');return b; };
const zeroHead = (tag,b) => { if(tag!=='head')return b; if(b.length<54)throw new Error('Truncated head table');const copy=b.slice();copy.fill(0,8,12);return copy; };
const equal = (a,b) => a.length===b.length && a.every((v,i)=>v===b[i]);
function directory(data,base,verifyChecksums) {
    const r=new Reader(data).seek(base),flavor=r.u32(),count=r.u16();r.skip(6);
    if(!validFlavor(flavor)||!count||count>4095)throw new Error('Invalid collection sfnt directory');
    r.need(count*16);
    const tables=[],tags=new Set();
    for(let i=0;i<count;i++){
        const tag=r.tag(),sum=r.u32(),offset=r.u32(),length=r.u32();
        if(!/^[ -~]{4}$/.test(tag)||tags.has(tag)||offset%4)throw new Error('Invalid or duplicate collection table');
        tags.add(tag);r.need(length,offset);
        const content=data.subarray(offset,offset+length);
        if(verifyChecksums && checksum(zeroHead(tag,content))!==sum)throw new Error(`Invalid ${tag} table checksum`);
        tables.push({tag,checksum:sum,offset,length,bytes:content});
    }
    return {flavor,offset:base,directoryLength:12+count*16,tables};
}

/** Parse TTC/OTC v1 or v2 with byte, face, offset, overlap and optional checksum validation.
 * Returned table bytes are read-only views; no outline renumbering or instruction rewriting occurs.
 */
export function readCollection(input,{verifyChecksums=true}={}) {
    const data=bytes(input),r=new Reader(data);
    if(r.tag()!=='ttcf')throw new Error('Expected a TTC/OTC collection');
    const version=r.u32(),count=r.u32();
    if(![0x10000,0x20000].includes(version)||!count||count>256)throw new RangeError('Invalid collection version/face count');
    const headerLength=12+count*4+(version===0x20000?12:0);r.need(headerLength-12);
    const offsets=Array.from({length:count},()=>r.u32());
    let signature=null;
    if(version===0x20000){const tag=r.u32(),length=r.u32(),offset=r.u32();
        if(tag||length||offset){if(tag!==0x44534947||!length||offset%4)throw new Error('Invalid collection signature record');r.need(length,offset);signature={offset,length};}}
    let tableCount=0;
    const faces=offsets.map(offset=>{
        if(offset<headerLength||offset%4)throw new Error('Invalid collection face offset');
        const face=directory(data,offset,false);tableCount+=face.tables.length;
        if(tableCount>65536)throw new RangeError('Collection table-record budget exceeded');return face;
    });
    const directories=[{offset:0,length:headerLength},...faces.map(f=>({offset:f.offset,length:f.directoryLength}))];
    // Identical shared ranges are permitted, partial overlaps and directory aliases are not.
    const ranges=[...directories.map(r=>({...r,kind:'directory'})),...faces.flatMap(f=>f.tables.filter(t=>t.length).map(t=>({...t,kind:'table'}))),...(signature?[{...signature,kind:'signature'}]:[])].sort((a,b)=>a.offset-b.offset||a.length-b.length);
    let last=null;
    for(const range of ranges){
        if(last&&range.offset<last.offset+last.length){
            if(range.kind!=='table'||last.kind!=='table'||range.offset!==last.offset||range.length!==last.length||range.tag!==last.tag)
                throw new Error('Overlapping collection ranges');
        }else last=range;
    }
    if(verifyChecksums){const checked=new Set();for(const f of faces)for(const t of f.tables){const key=`${t.tag}/${t.offset}/${t.length}/${t.checksum}`;if(checked.has(key))continue;
        if(checksum(zeroHead(t.tag,t.bytes))!==t.checksum)throw new Error(`Invalid ${t.tag} table checksum`);checked.add(key);}}
    return {version:version>>>16,faces,signature,byteLength:data.length};
}

/** Deterministic collection assembly; identical same-tag tables are shared after byte comparison.
 * Digital signatures are deliberately omitted because repackaging invalidates them.
 */
export function encodeCollection(fonts,{version=2,shareTables=true}={}) {
    if(!Array.isArray(fonts)||!fonts.length||fonts.length>256||![1,2].includes(version)||typeof shareTables!=='boolean')throw new RangeError('Expected 1–256 sfnt fonts and TTC version 1 or 2');
    let aggregate=0;
    const faces=fonts.map(raw=>{
        const data=bytes(raw);aggregate+=data.length;if(aggregate>LIMIT)throw new RangeError('Collection input budget exceeded');
        const f=directory(data,0,true);
        const tableStart=12+f.tables.length*16,rs=f.tables.filter(t=>t.length).sort((a,b)=>a.offset-b.offset);
        let end=tableStart;for(const t of rs){if(t.offset<end)throw new Error('Overlapping input sfnt ranges');end=t.offset+t.length;}
        if(!f.tables.some(t=>t.tag!=='DSIG'))throw new Error('Collection face has no unsigned tables');
        return {...f,tables:f.tables.filter(t=>t.tag!=='DSIG').sort((a,b)=>a.tag<b.tag?-1:1).map(t=>({...t,bytes:zeroHead(t.tag,t.bytes)}))};
    });
    const header=12+faces.length*4+(version===2?12:0),pooled=[],buckets=new Map();let cursor=header;
    for(const f of faces){f.offset=cursor;cursor+=12+f.tables.length*16;}
    for(const f of faces)for(const t of f.tables){
        t.checksum=checksum(t.bytes);const key=`${t.tag}/${t.bytes.length}/${t.checksum}`;
        let shared=shareTables?(buckets.get(key)||[]).find(other=>equal(t.bytes,other.bytes)):null;
        if(!shared){shared={...t,offset:cursor};cursor+=align(t.bytes.length);if(cursor>LIMIT)throw new RangeError('Collection output budget exceeded');pooled.push(shared);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(shared);}
        t.offset=shared.offset;
    }
    const w=new Writer(cursor).tag('ttcf').u32(version*65536).u32(faces.length);
    faces.forEach(f=>w.u32(f.offset));if(version===2)w.zeros(12);
    for(const f of faces){const n=f.tables.length,power=2**Math.floor(Math.log2(n));w.u32(f.flavor).u16(n).u16(power*16).u16(Math.log2(power)).u16(n*16-power*16);
        f.tables.forEach(t=>w.tag(t.tag).u32(t.checksum).u32(t.offset).u32(t.bytes.length));}
    pooled.forEach(t=>w.raw(t.bytes).align());
    return w.finish();
}

/** Extract a standalone, checksum-correct face without decoding its glyphs or discarding unknown tables. */
export function extractCollectionFace(input,index=0) {
    const collection=readCollection(input);
    if(!Number.isInteger(index)||index<0||index>=collection.faces.length)throw new RangeError('Invalid collection face index');
    return rebuildFace(collection.faces[index]);
}
const rebuiltLength=face=>12+16*face.tables.length+face.tables.reduce((n,t)=>n+align(t.length),0);
function rebuildFace(face){return sfnt(new Map(face.tables.filter(t=>t.tag!=='DSIG').map(t=>[t.tag,zeroHead(t.tag,t.bytes)])),face.flavor);}
/** Verify shared source ranges once, then extract under a separate expansion budget. */
export function extractCollectionFaces(input) {
    const collection=readCollection(input);
    if(collection.faces.reduce((n,f)=>n+rebuiltLength(f),0)>LIMIT)throw new RangeError('Expanded collection byte budget exceeded');
    return collection.faces.map(rebuildFace);
}

