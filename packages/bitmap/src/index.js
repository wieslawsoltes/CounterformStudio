import {Reader, Writer} from '@wieslawsoltes/counterform-binary';
import {inspectPNG, bytesFromBase64, bytesToBase64} from '@wieslawsoltes/counterform-artwork';

/** Static PNG strikes, independent of DOM, renderer, document classes and workers. */
export const BITMAP_LIMITS = Object.freeze({strikes:32, entries:131072, bytes:64*1024*1024, pixels:64*1024*1024});
const integer = (v, min, max, label) => {
    if (!Number.isInteger(v) || v < min || v > max) throw new RangeError(`${label} must be an integer in ${min}..${max}`);
    return v;
};
const identity = v => typeof v === 'string' && v.length > 0 && v.length <= 128 && !['__proto__','constructor','prototype'].includes(v);
const cache = new Map(); let cacheBytes = 0;
function image(png) {
    if (cache.has(png)) { const value=cache.get(png);cache.delete(png);cache.set(png,value);return value; }
    const bytes=bytesFromBase64(png), info=inspectPNG(bytes), result={bytes,info};
    while(cache.size && (cache.size>=8 || cacheBytes+bytes.length>8*1024*1024)) {
        const key=cache.keys().next().value;cacheBytes-=cache.get(key).bytes.length;cache.delete(key);
    }
    if(bytes.length<=8*1024*1024){cache.set(png,result);cacheBytes+=bytes.length;}
    return result;
}
/** Remove non-rendering metadata. Reject color transforms rather than silently changing appearance. */
export function prepareBitmapPNG(bytes) {
    inspectPNG(bytes);
    const r=new Reader(bytes),w=new Writer().raw(bytes.subarray(0,8));let at=8;
    const permitted=new Set(['IHDR','PLTE','tRNS','sRGB','IDAT','IEND']);
    while(at<bytes.length){
        r.seek(at);const size=r.u32(),tag=r.tag(),end=at+12+size;
        if(['iCCP','gAMA','cHRM','cICP','mDCv','cLLi'].includes(tag)) throw new Error(`Convert PNG ${tag} color information to sRGB before bitmap export`);
        if(permitted.has(tag))w.raw(bytes.subarray(at,end));at=end;
    }
    return w.finish();
}
/** Source x/y are integer lower-left bitmap offsets in pixels at the strike PPEM.
 * sbix stores these verbatim. CBDT stores the corresponding top bearing y+height. */
export function createBitmapGlyph(strikeId, bytes, {x=0,y=0,advance,vertical}={}) {
    const value={strikeId,png:bytesToBase64(prepareBitmapPNG(bytes)),x,y};
    if(advance!==undefined)value.advance=advance;
    if(vertical!==undefined)value.vertical={...vertical};
    return value;
}
export function validateBitmapSource(source, glyphs=source.glyphs) {
    if(!Array.isArray(glyphs))throw new TypeError('A glyph array is required');
    for(const g of glyphs)if(!g || (g.bitmaps!==undefined&&!Array.isArray(g.bitmaps)))throw new Error('Invalid per-glyph bitmap list');
    const config=source.bitmapFont, hasEntries=glyphs.some(g=>g.bitmaps?.length);
    if(config===undefined){if(hasEntries)throw new Error('Bitmap glyphs require font strike settings');return {bytes:0,pixels:0,entries:0};}
    if(!config || !['sbix','cbdt','both'].includes(config.format) || typeof config.overlay!=='boolean' || !Array.isArray(config.strikes) || config.strikes.length>BITMAP_LIMITS.strikes)throw new Error('Invalid bitmap font settings');
    if(config.overlay && config.format!=='sbix')throw new Error('Outline overlay is only defined for sbix');
    const strikes=new Map(),sizes=new Set();
    for(const s of config.strikes){
        if(!s||!identity(s.id)||strikes.has(s.id))throw new Error('Invalid or duplicate bitmap strike identity');
        integer(s.ppem,1,65535,'Strike PPEM');integer(s.ppi,1,65535,'Strike PPI');
        if(config.format!=='sbix'&&(s.ppem>255||s.ppi!==72))throw new Error('CBDT requires square 1..255 PPEM strikes; PPI metadata must be 72');
        const key=`${s.ppem}/${s.ppi}`;if(sizes.has(key))throw new Error('Duplicate bitmap strike size');sizes.add(key);strikes.set(s.id,s);
    }
    let bytes=0,pixels=0,entries=0;
    for(const g of glyphs){
        if(g.bitmaps===undefined)continue;
        if(!Array.isArray(g.bitmaps)||g.bitmaps.length>BITMAP_LIMITS.strikes)throw new Error('Invalid per-glyph bitmap list');
        const seen=new Set();
        for(const e of g.bitmaps){
            if(!e||!strikes.has(e.strikeId)||seen.has(e.strikeId))throw new Error('Missing or duplicate glyph strike');seen.add(e.strikeId);
            integer(e.x,-32768,32767,'Bitmap x');integer(e.y,-32768,32767,'Bitmap y');
            if(e.advance!==undefined)integer(e.advance,0,255,'Bitmap advance');
            if(e.vertical!==undefined){if(!e.vertical)throw new Error('Invalid vertical metrics');integer(e.vertical.x,-128,127,'Vertical x');integer(e.vertical.y,-128,127,'Vertical y');integer(e.vertical.advance,0,255,'Vertical advance');}
            const im=image(e.png);bytes+=im.bytes.length;pixels+=im.info.width*im.info.height;entries++;
            if(config.format!=='sbix'){
                integer(im.info.width,1,255,'CBDT width');integer(im.info.height,1,255,'CBDT height');integer(e.x,-128,127,'CBDT bearing X');integer(e.y+im.info.height,-128,127,'CBDT bearing Y');
            }
            if(bytes>BITMAP_LIMITS.bytes||pixels>BITMAP_LIMITS.pixels||entries>BITMAP_LIMITS.entries)throw new RangeError('Bitmap source memory budget exceeded');
        }
    }
    return {bytes,pixels,entries};
}
function countGlyphs(ids){integer(ids.length,1,65535,'Glyph count');if(ids.some(id=>typeof id!=='string'||!id||id.length>255))throw new Error('Invalid glyph identity');if(new Set(ids).size!==ids.length)throw new Error('Duplicate glyph identity');}
function tableReader(bytes){if(!(bytes instanceof Uint8Array)||bytes.length>BITMAP_LIMITS.bytes)throw new RangeError('Bitmap table byte budget exceeded');return new Reader(bytes);}
function offsetArray(r,count,min,end,size=4){r.need(count*size);const values=[];let last=min;for(let i=0;i<count;i++){const n=size===4?r.u32():r.u16();if(n<last||n>end)throw new Error('Invalid bitmap offset order or range');values.push(n);last=n;}return values;}
function attach(result,id,e){const a=result.bitmaps.get(id)||[];a.push(e);result.bitmaps.set(id,a);}
function finishRead(result,ids){validateBitmapSource({bitmapFont:result.bitmapFont,glyphs:ids.map(id=>({id,bitmaps:result.bitmaps.get(id)||[]}))});return result;}

export function encodeSbix(source, glyphs=source.glyphs) {
    validateBitmapSource(source,glyphs);countGlyphs(glyphs.map(g=>g.id));
    const config=source.bitmapFont;
    if(!config)return null;
    const strikes=[...config.strikes].sort((a,b)=>a.ppem-b.ppem||a.ppi-b.ppi),n=glyphs.length;
    if(!strikes.length||!glyphs.some(g=>g.bitmaps?.length))return null;
    const w=new Writer().u16(1).u16(config.overlay?3:1).u32(strikes.length).zeros(strikes.length*4);
    strikes.forEach((s,si)=>{
        w.patch32(8+4*si,w.pos);const start=w.pos;w.u16(s.ppem).u16(s.ppi).zeros(4*(n+1));
        const duplicates=new Map();
        glyphs.forEach((g,i)=>{
            w.patch32(start+4+4*i,w.pos-start);const e=g.bitmaps?.find(e=>e.strikeId===s.id);if(!e)return;
            // Include origins: consumers differ on whether dupe origins override the target.
            const key=`${e.x}/${e.y}/${e.png}`,target=duplicates.get(key);
            w.i16(e.x).i16(e.y);
            if(target!==undefined)w.tag('dupe').u16(target);
            else{duplicates.set(key,i);w.tag('png ').raw(image(e.png).bytes);}
        });
        w.patch32(start+4+4*n,w.pos-start);
        if(w.pos>BITMAP_LIMITS.bytes)throw new RangeError('sbix table byte budget exceeded');
    });
    return w.finish();
}
export function decodeSbix(bytes, glyphIds) {
    countGlyphs(glyphIds);const r=tableReader(bytes);
    if(r.u16()!==1)throw new Error('Unsupported sbix version');const flags=r.u16(),n=r.u32();
    if(![1,3].includes(flags)||n>BITMAP_LIMITS.strikes)throw new Error('Invalid sbix flags or strike count');
    const starts=offsetArray(r,n,8+n*4,bytes.length),result={bitmapFont:{format:'sbix',overlay:flags===3,strikes:[]},bitmaps:new Map()};
    let expanded=0,totalEntries=0;
    for(let i=0;i<n;i++){
        const end=starts[i+1]??bytes.length,sr=r.slice(starts[i],end-starts[i]);const s={id:`sbix-${i}`,ppem:sr.u16(),ppi:sr.u16()};result.bitmapFont.strikes.push(s);
        const offsets=offsetArray(sr,glyphIds.length+1,4+4*(glyphIds.length+1),sr.bytes.length),records=new Map();
        for(let g=0;g<glyphIds.length;g++){
            const length=offsets[g+1]-offsets[g];if(!length)continue;
            if(++totalEntries>BITMAP_LIMITS.entries)throw new RangeError('Bitmap entry budget exceeded');
            const gr=sr.slice(offsets[g],length),x=gr.i16(),y=gr.i16(),type=gr.tag();
            if(type==='png '){const png=gr.take(length-8);inspectPNG(png);records.set(g,{x,y,png});}
            else if(type==='dupe'){if(length!==10)throw new Error('Invalid sbix dupe length');const target=gr.u16();if(target>=glyphIds.length)throw new Error('Invalid sbix dupe target');records.set(g,{x,y,target});}
            else throw new Error(`Unsupported sbix graphic type '${type}'; PNG and dupe only`);
        }
        const resolved=new Map();
        const resolve=g=>{const seen=new Set(),path=[];let at=g;
            while(!resolved.has(at)){
                if(seen.has(at)||path.length>=64)throw new Error('Cyclic or excessive sbix dupe chain');seen.add(at);path.push(at);
                const record=records.get(at);if(!record)throw new Error('sbix dupe refers to missing bitmap');
                if(record.png){resolved.set(at,record.png);break;}at=record.target;
            }
            const png=resolved.get(at);for(const id of path)resolved.set(id,png);return png;
        };
        for(const [g,e] of records){const png=resolve(g);expanded+=png.length;if(expanded>BITMAP_LIMITS.bytes)throw new RangeError('Expanded bitmap byte budget exceeded');attach(result,glyphIds[g],{strikeId:s.id,x:e.x,y:e.y,png:bytesToBase64(png)});}
    }
    return finishRead(result,glyphIds);
}
function pngForCBDT(e){const bytes=image(e.png).bytes,prepared=prepareBitmapPNG(bytes);return {bytes:prepared,info:image(e.png).info};}
function smallMetrics(w,m){w.u8(m.height).u8(m.width).i8(m.x).i8(m.y).u8(m.advance);}
function lineMetrics(w,rows){
    const max=a=>Math.max(...a),min=a=>Math.min(...a),clip=n=>Math.max(-128,Math.min(127,n));
    const top=max(rows.map(r=>r.y)),bottom=min(rows.map(r=>r.y-r.height));
    w.i8(clip(top)).i8(clip(bottom)).u8(max(rows.map(r=>r.width))).i8(1).i8(0).i8(0)
        .i8(clip(min(rows.map(r=>r.x)))).i8(clip(min(rows.map(r=>r.advance-r.x-r.width))))
        .i8(clip(top)).i8(clip(bottom)).i8(0).i8(0);
}
export function encodeCBDT(source, glyphs=source.glyphs, advances=glyphs.map(()=>0)) {
    validateBitmapSource(source,glyphs);countGlyphs(glyphs.map(g=>g.id));
    if(!source.bitmapFont?.strikes.length||!glyphs.some(g=>g.bitmaps?.length))return new Map();
    if(source.bitmapFont.overlay)throw new Error('CBDT has no outline overlay flag');
    integer(source.info?.unitsPerEm,16,16384,'unitsPerEm');
    if(advances.length!==glyphs.length)throw new Error('Missing bitmap glyph advances');
    const strikes=[];const data=new Writer().u16(3).u16(0);
    for(const s of [...(source.bitmapFont?.strikes||[])].sort((a,b)=>a.ppem-b.ppem)){
        integer(s.ppem,1,255,'CBDT PPEM');if(s.ppi!==72)throw new Error('CBDT has no PPI metadata; use PPI 72');
        const rows=[];
        glyphs.forEach((g,gid)=>{const e=g.bitmaps?.find(e=>e.strikeId===s.id);if(!e)return;
            const im=pngForCBDT(e),m={width:im.info.width,height:im.info.height,x:e.x,y:e.y+im.info.height,advance:e.advance??Math.round(advances[gid]*s.ppem/source.info.unitsPerEm)};
            integer(m.width,1,255,'CBDT width');integer(m.height,1,255,'CBDT height');integer(m.x,-128,127,'CBDT bearing X');integer(m.y,-128,127,'CBDT bearing Y');integer(m.advance,0,255,'CBDT advance');
            const offset=data.pos,format=e.vertical?18:17;smallMetrics(data,m);
            if(e.vertical)data.i8(e.vertical.x).i8(e.vertical.y).u8(e.vertical.advance);
            data.u32(im.bytes.length).raw(im.bytes);rows.push({...m,gid,format,offset,end:data.pos});
            if(data.pos>BITMAP_LIMITS.bytes)throw new RangeError('CBDT table byte budget exceeded');
        });
        if(rows.length)strikes.push({s,rows});
    }
    if(!strikes.length)return new Map();
    const loc=new Writer().u16(3).u16(0).u32(strikes.length).zeros(48*strikes.length);
    strikes.forEach(({s,rows},si)=>{
        const groups=[];for(const row of rows){const last=groups.at(-1);if(last&&row.gid===last.at(-1).gid+1&&row.format===last[0].format)last.push(row);else groups.push([row]);}
        const array=loc.pos;loc.zeros(groups.length*8);
        groups.forEach((group,i)=>{
            const first=group[0],last=group.at(-1);loc.patch16(array+i*8,first.gid).patch16(array+i*8+2,last.gid).patch32(array+i*8+4,loc.pos-array);
            loc.u16(1).u16(first.format).u32(first.offset);for(const row of group)loc.u32(row.offset-first.offset);loc.u32(last.end-first.offset);
        });
        const h=new Writer().u32(array).u32(loc.pos-array).u32(groups.length).u32(0);lineMetrics(h,rows);h.zeros(12).u16(rows[0].gid).u16(rows.at(-1).gid).u8(s.ppem).u8(s.ppem).u8(32).i8(1);
        loc.bytes.set(h.finish(),8+si*48);
    });
    return new Map([['CBDT',data.finish()],['CBLC',loc.finish()]]);
}
function readMetrics(r,big){const m={height:r.u8(),width:r.u8(),x:r.i8(),y:r.i8(),advance:r.u8()};if(big)m.vertical={x:r.i8(),y:r.i8(),advance:r.u8()};return m;}
export function decodeCBDT(cbdt,cblc,glyphIds){
    countGlyphs(glyphIds);const d=tableReader(cbdt),l=tableReader(cblc);
    if(d.u32()!==0x30000||l.u32()!==0x30000)throw new Error('Unsupported CBDT/CBLC version');
    const count=integer(l.u32(),0,BITMAP_LIMITS.strikes,'CBDT strike count');l.need(count*48);
    const result={bitmapFont:{format:'cbdt',overlay:false,strikes:[]},bitmaps:new Map()};let totalBytes=0,totalEntries=0;
    for(let si=0;si<count;si++){
        const h=l.slice(8+si*48,48),array=h.u32(),length=h.u32(),n=h.u32(),color=h.u32();h.skip(24);
        const first=h.u16(),last=h.u16(),px=h.u8(),py=h.u8(),depth=h.u8(),flags=h.u8();
        if(!n||n>glyphIds.length||first>last||last>=glyphIds.length||color||!px||px!==py||depth!==32||flags!==1||array<8+count*48)throw new Error('Unsupported CBLC strike: square RGBA horizontal strikes required');
        const table=l.slice(array,length);table.need(n*8);const s={id:`cbdt-${si}`,ppem:px,ppi:72};result.bitmapFont.strikes.push(s);let prior=first-1;
        for(let ti=0;ti<n;ti++){
            table.seek(ti*8);const a=table.u16(),b=table.u16(),offset=table.u32();
            if(a<=prior||a>b||a<first||b>last||offset<n*8||offset>=length)throw new Error('Invalid CBLC index range');prior=b;
            const r=table.slice(offset,length-offset),index=r.u16(),format=r.u16(),base=r.u32();
            if(![17,18,19].includes(format)||base<4)throw new Error('Unsupported CBDT image format');
            const locations=[];let shared=null;
            if(index===1||index===3){const off=offsetArray(r,b-a+2,0,cbdt.length-base,index===1?4:2);for(let i=0;i<=b-a;i++)locations.push([a+i,off[i],off[i+1]]);}
            else if(index===2||index===5){const size=r.u32();if(!size)throw new Error('Empty fixed CBDT record');shared=readMetrics(r,true);
                const num=index===2?b-a+1:integer(r.u32(),0,b-a+1,'Sparse bitmap count');r.need(index===5?num*2:0);let prev=a-1;
                for(let i=0;i<num;i++){const gid=index===2?a+i:r.u16();if(gid<=prev||gid<a||gid>b)throw new Error('Invalid sparse bitmap glyph order');prev=gid;locations.push([gid,i*size,(i+1)*size]);}
            }else if(index===4){const num=integer(r.u32(),0,b-a+1,'Sparse bitmap count');r.need((num+1)*4);const pairs=[];let prev=a-1,off=0;
                for(let i=0;i<=num;i++){const gid=r.u16(),p=r.u16();if(p<off||(i<num&&(gid<=prev||gid<a||gid>b)))throw new Error('Invalid sparse bitmap offsets');pairs.push([gid,p]);prev=gid;off=p;}
                for(let i=0;i<num;i++)locations.push([pairs[i][0],pairs[i][1],pairs[i+1][1]]);
            }else throw new Error(`Unsupported CBLC index format ${index}`);
            if(format===19&&!shared)throw new Error('CBDT format 19 requires shared big metrics');
            for(const [gid,start,end]of locations){
                if(start===end)continue;if(end<start||base+end>cbdt.length)throw new Error('CBDT image offsets exceed table');
                if(++totalEntries>BITMAP_LIMITS.entries)throw new RangeError('Bitmap entry budget exceeded');
                const r=d.slice(base+start,end-start),m=format===19?shared:readMetrics(r,format===18),size=r.u32();
                if(size>r.bytes.length-r.pos)throw new Error('Truncated CBDT PNG');
                totalBytes+=size;if(totalBytes>BITMAP_LIMITS.bytes)throw new RangeError('Expanded bitmap byte budget exceeded');
                const png=r.take(size),info=inspectPNG(png);if(info.width!==m.width||info.height!==m.height)throw new Error('CBDT PNG dimensions differ from metrics');
                // Fixed-size index records may contain zero padding, not extra payload.
                if(r.bytes.subarray(r.pos).some(v=>v))throw new Error('Unexpected CBDT trailing data');
                const e={strikeId:s.id,png:bytesToBase64(png),x:m.x,y:m.y-m.height,advance:m.advance};if(m.vertical)e.vertical={...m.vertical};attach(result,glyphIds[gid],e);
            }
        }
    }
    return finishRead(result,glyphIds);
}
export function compileBitmapTables(source,glyphs=source.glyphs,advances=glyphs.map(()=>0)){
    validateBitmapSource(source,glyphs);const tables=new Map(),format=source.bitmapFont?.format;
    if(format==='sbix'||format==='both'){const bytes=encodeSbix(source,glyphs);if(bytes)tables.set('sbix',bytes);}
    if(format==='cbdt'||format==='both')for(const [tag,bytes]of encodeCBDT(source,glyphs,advances))tables.set(tag,bytes);
    return tables;
}
/** Decode supported bitmap tables without applying a partially decoded result.
 * Different sbix/CBDT artwork cannot share a single source; prefer sbix and report it. */
export function readBitmapTables(tables,glyphIds){
    const get=tag=>tables.get(tag)?.bytes??tables.get(tag),warnings=[],supported=[];
    let sbix=null,cbdt=null;
    if(get('sbix'))try{sbix=decodeSbix(get('sbix'),glyphIds);}catch(e){warnings.push(`sbix reconstruction: ${e.message}`);}
    if(get('CBDT')||get('CBLC'))try{if(!get('CBDT')||!get('CBLC'))throw new Error('CBDT requires CBLC and vice versa');cbdt=decodeCBDT(get('CBDT'),get('CBLC'),glyphIds);}catch(e){warnings.push(`CBDT reconstruction: ${e.message}`);}
    const normalized=result=>{
        const byId=new Map(result.bitmapFont.strikes.map(s=>[s.id,`${s.ppem}/${s.ppi}`]));
        return JSON.stringify({strikes:[...byId.values()].sort(),glyphs:glyphIds.map(id=>(result.bitmaps.get(id)||[]).map(e=>({size:byId.get(e.strikeId),x:e.x,y:e.y,png:e.png})).sort((a,b)=>a.size.localeCompare(b.size)))});
    };
    let selected=sbix||cbdt;
    if(sbix){supported.push('sbix');if(cbdt){
        if(!sbix.bitmapFont.overlay&&normalized(sbix)===normalized(cbdt)){
            selected=cbdt;selected.bitmapFont.format='both';supported.push('CBLC','CBDT');
        }else warnings.push('Distinct sbix and CBDT artwork: reconstructed sbix only; original archive retains both');
    }}else if(cbdt)supported.push('CBLC','CBDT');
    return {...(selected||{bitmapFont:undefined,bitmaps:new Map()}),warnings,supported};
}
