import {deflateSync} from 'node:zlib';
import {Writer,crc32} from '@wieslawsoltes/counterform-binary';
export function pngChunk(tag,data){const w=new Writer().u32(data.length),t=Uint8Array.from(tag,c=>c.charCodeAt(0));return w.raw(t).raw(data).u32(crc32(new Uint8Array([...t,...data]))).finish();}
export function makePNG(width=32,height=32,ink=(x,y)=>x>=4&&x<28&&y>=4&&y<28&&!(x>=10&&x<22&&y>=10&&y<22)){
    const pixels=new Uint8Array(width*height*4),raw=new Uint8Array(height*(1+width*4));
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const v=ink(x,y)?0:255,p=(y*width+x)*4;pixels.set([v,v,v,255],p);raw.set(pixels.subarray(p,p+4),y*(1+width*4)+1+x*4);}
    const header=new Writer().u32(width).u32(height).u8(8).u8(6).u8(0).u8(0).u8(0).finish();
    const bytes=new Writer().raw(Uint8Array.of(137,80,78,71,13,10,26,10)).raw(pngChunk('IHDR',header)).raw(pngChunk('IDAT',deflateSync(raw))).raw(pngChunk('IEND',new Uint8Array())).finish();
    return {width,height,pixels,bytes};
}
