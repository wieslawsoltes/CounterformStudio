import {deflateSync} from 'node:zlib';
import {Writer} from '@wieslawsoltes/counterform-binary';
import {pngChunk} from './artwork-fixture.mjs';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {createBitmapGlyph} from '@wieslawsoltes/counterform-bitmap';
export function colorPNG(width=32,height=32){
    const raw=new Uint8Array(height*(width*4+1));
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const ring=(x-width*.5)**2+(y-height*.5)**2<(width*.43)**2&&(x-width*.5)**2+(y-height*.5)**2>(width*.21)**2;
        const p=y*(width*4+1)+1+x*4;raw.set(x<width/2?[235,35,65,ring?255:0]:[35,105,235,ring?255:0],p);
    }
    const header=new Writer().u32(width).u32(height).u8(8).u8(6).u8(0).u8(0).u8(0).finish();
    return new Writer().raw(Uint8Array.of(137,80,78,71,13,10,26,10)).raw(pngChunk('IHDR',header)).raw(pngChunk('IDAT',deflateSync(raw))).raw(pngChunk('IEND',new Uint8Array())).finish();
}
export function bitmapFont(format='both'){
    const doc=createDemoFont();doc.data.bitmapFont={format,overlay:false,strikes:[{id:'large',ppem:96,ppi:72},{id:'small',ppem:64,ppi:72}]};
    const png=colorPNG();
    for(const name of ['A','V'])doc.glyph(name).bitmaps=[createBitmapGlyph('small',png,{x:2,y:3}),createBitmapGlyph('large',colorPNG(48,48),{x:3,y:4})];
    doc.glyph('B').bitmaps=[createBitmapGlyph('small',png,{x:-2,y:-3,advance:42,vertical:{x:-8,y:8,advance:64}})];
    return doc;
}
/** Independently assembled index fixtures, including shared metrics for PNG19. */
export function indexFixture(index,format=19){
    const png=colorPNG(8,8),m=new Writer().u8(8).u8(8).i8(2).i8(6).u8(9).i8(-3).i8(4).u8(10).finish();
    const record=new Writer();if(format===17)record.raw(m.subarray(0,5));if(format===18)record.raw(m);record.u32(png.length).raw(png);
    const img=record.finish(),sparse=index===4||index===5,gids=sparse?[1,3]:[1,2,3];
    const data=new Writer().u32(0x30000);gids.forEach(()=>data.raw(img));
    const sub=new Writer().u16(index).u16(format).u32(4);
    if(index===1||index===3)for(let i=0;i<=gids.length;i++)index===1?sub.u32(img.length*i):sub.u16(img.length*i);
    if(index===2||index===5){sub.u32(img.length).raw(m);if(index===5){sub.u32(gids.length);gids.forEach(g=>sub.u16(g));}}
    if(index===4){sub.u32(gids.length);gids.forEach((g,i)=>sub.u16(g).u16(i*img.length));sub.u16(0xffff).u16(gids.length*img.length);}
    const sb=sub.finish(),loc=new Writer().u32(0x30000).u32(1).u32(56).u32(8+sb.length).u32(1).u32(0).zeros(24).u16(1).u16(3).u8(16).u8(16).u8(32).u8(1).u16(1).u16(3).u32(8).raw(sb);
    return {cbdt:data.finish(),cblc:loc.finish(),gids,png};
}
