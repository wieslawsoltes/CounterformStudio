import {crc32} from '@wieslawsoltes/counterform-binary';
import {uid,transformContours,bounds} from '@wieslawsoltes/counterform-geometry';
export const ARTWORK_LIMITS=Object.freeze({maxReferences:64,maxPixels:4194304,maxDimension:4096,maxBytes:16*1024*1024,maxDocumentBytes:64*1024*1024,maxPoints:250000});
const infoCache=new Map();let cachedCharacters=0;
const finite=(v,limit=1e7)=>Number.isFinite(v)&&Math.abs(v)<=limit;
export function bytesToBase64(bytes){if(!(bytes instanceof Uint8Array)||bytes.length>ARTWORK_LIMITS.maxBytes)throw new RangeError('Invalid artwork byte buffer');let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(text);}
export function bytesFromBase64(text){if(typeof text!=='string'||text.length>Math.ceil(ARTWORK_LIMITS.maxBytes/3)*4||text.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw new TypeError('Invalid embedded PNG base64');const raw=atob(text),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytesToBase64(bytes)!==text)throw new TypeError('Noncanonical embedded PNG base64');return bytes;}
/** Checks PNG framing, CRCs and dimensions before a native decoder allocates.
 * This does not itself decompress IDAT; the native image decoder remains required. */
export function inspectPNG(bytes){
    if(!(bytes instanceof Uint8Array)||bytes.length<57||bytes.length>ARTWORK_LIMITS.maxBytes)throw new RangeError('PNG byte budget or minimum length violated');
    if([137,80,78,71,13,10,26,10].some((v,i)=>bytes[i]!==v))throw new Error('Expected a PNG image');
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let at=8,info=null,palette=false,idat=false,endedData=false,dataBytes=0,chunks=0;
    while(at<bytes.length){
        if(++chunks>16384||at+12>bytes.length)throw new RangeError('Truncated PNG or chunk budget exceeded');
        const size=view.getUint32(at),end=at+12+size;if(end>bytes.length)throw new RangeError('Truncated PNG chunk');
        const tag=String.fromCharCode(...bytes.subarray(at+4,at+8));if(!/^[A-Za-z]{4}$/.test(tag)||tag[2]!==tag[2].toUpperCase())throw new Error('Invalid PNG chunk type');
        if(crc32(bytes.subarray(at+4,end-4))!==view.getUint32(end-4))throw new Error(`PNG ${tag} checksum mismatch`);
        if(!info&&tag!=='IHDR')throw new Error('PNG must begin with IHDR');
        if(['acTL','fcTL','fdAT'].includes(tag))throw new Error('Animated PNG is not a static artwork reference');
        if(tag==='IHDR'){
            if(info||size!==13)throw new Error('Invalid or duplicate PNG header');
            const width=view.getUint32(at+8),height=view.getUint32(at+12),bitDepth=bytes[at+16],colorType=bytes[at+17];
            if(!width||!height||width>ARTWORK_LIMITS.maxDimension||height>ARTWORK_LIMITS.maxDimension||width*height>ARTWORK_LIMITS.maxPixels)throw new RangeError('PNG dimensions exceed artwork pixel budget');
            if(!({0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]}[colorType]?.includes(bitDepth))||bytes[at+18]||bytes[at+19]||bytes[at+20]>1)throw new Error('Unsupported PNG header fields');
            info={width,height,bitDepth,colorType,byteLength:bytes.length};
        }else if(tag==='PLTE'){
            if(palette||idat||!size||size%3||size>768||[0,4].includes(info.colorType)||(info.colorType===3&&size/3>2**info.bitDepth))throw new Error('Invalid PNG palette');palette=true;
        }else if(tag==='IDAT'){
            if(endedData||info.colorType===3&&!palette)throw new Error('Invalid PNG image-data order');idat=true;dataBytes+=size;
        }else if(tag==='IEND'){
            if(size||end!==bytes.length||!idat||!dataBytes)throw new Error('Invalid PNG image trailer');return info;
        }else{
            if(tag[0]===tag[0].toUpperCase())throw new Error(`Unsupported critical PNG chunk ${tag}`);
            if(idat)endedData=true;
        }
        at=end;
    }
    throw new Error('Missing PNG image trailer');
}
function cachedInfo(base64){
    if(infoCache.has(base64))return infoCache.get(base64);
    const info=inspectPNG(bytesFromBase64(base64));
    while(infoCache.size&& (infoCache.size>=8||cachedCharacters+base64.length>32*1024*1024)){const key=infoCache.keys().next().value;cachedCharacters-=key.length;infoCache.delete(key);}
    if(base64.length<=32*1024*1024){infoCache.set(base64,info);cachedCharacters+=base64.length;}
    return info;
}
export function validateArtwork(references){
    if(references===undefined)return {bytes:0,points:0,pixels:0};
    if(!Array.isArray(references)||references.length>ARTWORK_LIMITS.maxReferences)throw new RangeError('Invalid artwork references or layer budget');
    const ids=new Set();let bytes=0,points=0,pixels=0;
    for(const r of references){
        if(!r||!['bitmap','vector'].includes(r.kind)||typeof r.id!=='string'||!r.id||r.id.length>128||ids.has(r.id))throw new Error('Invalid or duplicate artwork identity');ids.add(r.id);
        if(typeof r.name!=='string'||r.name.length>256||typeof r.visible!=='boolean'||typeof r.locked!=='boolean'||!Number.isFinite(r.opacity)||r.opacity<0||r.opacity>1)throw new Error('Invalid artwork presentation');
        if(!Array.isArray(r.transform)||r.transform.length!==6||r.transform.some(v=>!finite(v))||Math.abs(r.transform[0]*r.transform[3]-r.transform[1]*r.transform[2])<1e-12)throw new Error('Artwork transform must be finite and invertible');
        if(r.kind==='bitmap'){
            const info=cachedInfo(r.png);if(r.width!==info.width||r.height!==info.height)throw new Error('Embedded PNG dimensions do not match artwork source');bytes+=info.byteLength;pixels+=r.width*r.height;
        }else{
            if(!Array.isArray(r.contours))throw new Error('Invalid vector reference');
            for(const c of r.contours){if(!c||!Array.isArray(c.nodes)||typeof c.closed!=='boolean')throw new Error('Invalid artwork contour');
                for(const n of c.nodes){if(++points>ARTWORK_LIMITS.maxPoints)throw new RangeError('Artwork point budget exceeded');if(!n||!finite(n.x)||!finite(n.y))throw new Error('Invalid artwork node');for(const h of [n.in,n.out])if(h&&(!finite(h.x)||!finite(h.y)))throw new Error('Invalid artwork handle');}
            }
        }
        if(bytes>ARTWORK_LIMITS.maxDocumentBytes||pixels>ARTWORK_LIMITS.maxPixels*4)throw new RangeError('Artwork memory budget exceeded');
    }
    return {bytes,points,pixels};
}
export function createBitmapReference(bytes,{name='Bitmap reference',transform=[1,0,0,-1,0,0],opacity=.35}={}){
    const info=inspectPNG(bytes);const r={id:uid('art'),kind:'bitmap',name,width:info.width,height:info.height,png:bytesToBase64(bytes),transform:[...transform],opacity,visible:true,locked:false};validateArtwork([r]);return r;
}
export function createVectorReference(contours,{name='Outline mask',transform=[1,0,0,1,0,0],opacity=.4}={}){
    const r={id:uid('art'),kind:'vector',name,contours:structuredClone(contours),transform:[...transform],opacity,visible:true,locked:false};validateArtwork([r]);return r;
}
export function duplicateReference(reference){validateArtwork([reference]);const copy=structuredClone(reference);copy.id=uid('art');copy.name=(copy.name+' copy').slice(0,256);return copy;}
export function referenceContours(reference){validateArtwork([reference]);if(reference.kind!=='vector')throw new TypeError('Bitmap artwork must be traced before becoming outlines');const cs=structuredClone(reference.contours);for(const c of cs){c.id=uid('c');for(const n of c.nodes)n.id=uid();}return transformContours(cs,reference.transform);}
export function referenceBounds(reference){validateArtwork([reference]);if(reference.kind==='vector')return bounds(transformContours(structuredClone(reference.contours),reference.transform));const {width:w,height:h}=reference;return bounds(transformContours([{closed:true,nodes:[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}]}],reference.transform));}
