import { Writer, readDirectory, checksum } from '@wieslawsoltes/counterform-binary';

/** Canonical unsigned Base128 as specified by WOFF2. */
export function uintBase128(value) {
    if (!Number.isSafeInteger(value) || value<0 || value>0xffffffff) throw new RangeError('Invalid UIntBase128');
    const out=[value%128];
    while ((value=Math.floor(value/128))) out.unshift((value%128)|128);
    return Uint8Array.from(out);
}
/** RFC 7932 uncompressed meta-blocks. Valid Brotli, intentionally not size-optimized.
 * This dependency-free path works in synchronous browser workers. Inject an encoder
 * or use the Node subpath for real compression without changing container semantics.
 */
export function brotliStore(data) {
    if (!(data instanceof Uint8Array)) throw new TypeError('Expected Uint8Array');
    const out = new Writer(data.length + Math.ceil(data.length / 65536) * 4 + 4);
    let byte=0,bits=0;
    const put=(n,count)=>{ for(let i=0;i<count;i++){byte|=((n>>>i)&1)<<bits;if(++bits===8){out.u8(byte);byte=bits=0;}} };
    const align=()=>{if(bits){out.u8(byte);byte=bits=0;}};
    put(0,1); // WBITS=16.
    for(let i=0;i<data.length;i+=65536){const block=data.subarray(i,i+65536);
        put(0,1);put(0,2);put(block.length-1,16);put(1,1);align();out.raw(block);
    }
    put(1,1);put(1,1);align();return out.finish();
}
/** Lossless, null-transform WOFF2 wrapping of one sfnt face, not a collection. */
export function encodeWOFF2(input,{compress=brotliStore,maxBytes=64*1024*1024}={}) {
    const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
    if(bytes.length>maxBytes)throw new RangeError('Font size budget exceeded');
    if(String.fromCharCode(...bytes.subarray(0,4))==='ttcf')throw new Error('Choose an individual face before WOFF2 export');
    const {tables,flavor}=readDirectory(bytes);
    if(!tables.size || tables.size>4096 || !tables.has('head'))throw new Error('Invalid sfnt table inventory');
    // Keep glyf immediately before loca, even though null-transform fonts do not require it.
    const entries=[...tables.values()].sort((a,b)=>a.tag<b.tag?-1:a.tag>b.tag?1:0);
    const loca=entries.findIndex(e=>e.tag==='loca'),glyf=entries.findIndex(e=>e.tag==='glyf');
    if((loca>=0)!==(glyf>=0))throw new Error('glyf and loca must occur together');
    if(loca>=0)entries.splice(glyf+1,0,...entries.splice(loca,1));
    const directory=new Writer(), stream=new Writer();let sfntSize=12+16*entries.length;
    for(const table of entries){
        if(!/^[ -~]{4}$/.test(table.tag))throw new Error('Invalid font table tag');
        if(table.tag!=='head'&&checksum(table.bytes)!==table.checksum)throw new Error(`${table.tag}: checksum mismatch`);
        directory.u8((['glyf','loca'].includes(table.tag)?0xc0:0)|63).tag(table.tag).raw(uintBase128(table.length));
        stream.raw(table.bytes);sfntSize+=Math.ceil(table.length/4)*4;
    }
    if(stream.pos>maxBytes)throw new RangeError('Table expansion budget exceeded');
    const compressed=compress(stream.finish());
    if(!(compressed instanceof Uint8Array)||compressed.length>maxBytes+1048576)throw new TypeError('Invalid Brotli encoder result');
    const w=new Writer().tag('wOF2').u32(flavor).u32(48+directory.pos+compressed.length)
        .u16(entries.length).u16(0).u32(sfntSize).u32(compressed.length).u16(1).u16(0).zeros(20)
        .raw(directory.finish()).raw(compressed);
    return w.finish();
}
