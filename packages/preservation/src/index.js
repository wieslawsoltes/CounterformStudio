import {Reader,Writer,readDirectory,sfnt} from '@wieslawsoltes/counterform-binary';
const LIMIT=32*1024*1024,encoder=new TextEncoder();
async function hash(bytes){if(!globalThis.crypto?.subtle)throw new Error('Font preservation requires secure-origin Web Crypto');return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
const editable=['familyName','styleName','designer','manufacturer','copyright','license','versionMajor','versionMinor'];
function sourceText(source,structural=false){const data={...source};delete data.originalFont;delete data.id;delete data.notes;delete data.richNotes;data.glyphs=data.glyphs.map(g=>({...g,layers:g.layers.map(l=>{const layer={...l};delete layer.artwork;return layer;})}));if(structural){data.info={...data.info};for(const key of editable)delete data.info[key];}return JSON.stringify(data,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);}
function encode64(bytes){let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);}
function decode64(text){if(typeof text!=='string'||text.length>Math.ceil(LIMIT/3)*4||text.length%4)throw new Error('Invalid original font payload');let raw;try{raw=atob(text);}catch{throw new Error('Invalid original font payload');}if(btoa(raw)!==text)throw new Error('Noncanonical original font payload');return Uint8Array.from(raw,c=>c.charCodeAt(0));}
/** Captures the original container independently of lossy outline reconstruction. */
export async function captureOriginal(bytes,source,{filename='original-font.bin'}={}){
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>LIMIT)throw new RangeError('Original font archive accepts at most 32 MiB');
 const copy=bytes.slice(),full=sourceText(source),structure=sourceText(source,true),info=structuredClone(source.info);
 return {format:1,filename:String(filename).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,200),bytes:encode64(copy),sha256:await hash(copy),sourceSha256:await hash(encoder.encode(full)),structureSha256:await hash(encoder.encode(structure)),info};
}
/** Returns the unedited original, even if the current source has changed. */
export async function restoreOriginal(archive){if(archive?.format!==1)throw new Error('No supported original-font archive');const bytes=decode64(archive.bytes);if(await hash(bytes)!==archive.sha256)throw new Error('Original font archive integrity failure');return bytes;}
export async function preservationStatus(archive,source){await restoreOriginal(archive);return {unchanged:await hash(encoder.encode(sourceText(source)))===archive.sourceSha256,metadataOnly:await hash(encoder.encode(sourceText(source,true)))===archive.structureSha256};}
const unicode=text=>{const w=new Writer();for(let i=0;i<text.length;i++)w.u16(text.charCodeAt(i));return w.finish();};
let roman;
function encodedName(record,text){
 if(record.platform===0||record.platform===3)return unicode(text);
 if(record.platform===1&&record.encoding===0){roman??=new Map(Array.from({length:256},(_,i)=>[new TextDecoder('macintosh').decode(Uint8Array.of(i)),i]));return Uint8Array.from([...text].map(c=>{if(!roman.has(c))throw new Error('Edited name cannot be represented in a retained Mac Roman record');return roman.get(c);}));}
 throw new Error(`Cannot safely replace name platform ${record.platform}/${record.encoding}`);
}
/** Retains every untouched name record and format-1 language tag verbatim. */
export function rewriteNames(bytes,replacements){
 const r=new Reader(bytes),format=r.u16(),count=r.u16(),storage=r.u16(),records=[],languages=[];if(format>1)throw new Error('Unsupported name table format');
 const readString=(offset,length)=>{if(storage+offset+length>bytes.length)throw new Error('Name string outside table');return bytes.slice(storage+offset,storage+offset+length);};
 for(let i=0;i<count;i++){const platform=r.u16(),encoding=r.u16(),language=r.u16(),name=r.u16(),length=r.u16(),offset=r.u16();records.push({platform,encoding,language,name,bytes:readString(offset,length)});}
 if(format===1){const n=r.u16();for(let i=0;i<n;i++){const length=r.u16(),offset=r.u16();languages.push(readString(offset,length));}}
 if(storage<r.pos)throw new Error('Name storage overlaps records');
 for(const record of records)if(replacements.has(record.name))record.bytes=encodedName(record,replacements.get(record.name));
 for(const [name,text] of replacements)if(!records.some(r=>r.name===name))records.push({platform:3,encoding:1,language:0x409,name,bytes:unicode(text)});
 if(records.length>65535)throw new RangeError('Too many name records');
 records.sort((a,b)=>a.platform-b.platform||a.encoding-b.encoding||a.language-b.language||a.name-b.name);
 const head=6+records.length*12+(format===1?2+languages.length*4:0);if(head>65535)throw new RangeError('Name directory exceeds Offset16');
 const w=new Writer().u16(format).u16(records.length).u16(head),strings=new Writer();
 const add=b=>{if(b.length>65535||strings.pos>65535)throw new RangeError('Name string offset exceeds Offset16');const at=strings.pos;strings.raw(b);return at;};
 for(const record of records)w.u16(record.platform).u16(record.encoding).u16(record.language).u16(record.name).u16(record.bytes.length).u16(add(record.bytes));
 if(format===1){w.u16(languages.length);for(const b of languages)w.u16(b.length).u16(add(b));}
 return w.raw(strings.finish()).finish();
}
/** Refuses opaque-table reuse after any structural source change. Never pretends to merge edited glyph IDs. */
export async function exportMetadataOnly(archive,source){
 const snapshot=structuredClone(source),status=await preservationStatus(archive,snapshot),original=await restoreOriginal(archive);
 if(!status.metadataOnly)throw new Error('Outlines, encoding, metrics, masters or features changed; opaque-table reuse is unsafe. Use a normal compiled export or download the untouched original.');
 if(status.unchanged)return {bytes:original,warnings:[]};
 const flavor=new DataView(original.buffer,original.byteOffset,original.byteLength).getUint32(0);
 if(![0x10000,0x4f54544f].includes(flavor))throw new Error('Metadata-only editing requires an original TTF/OTF sfnt container');
 const tables=new Map([...readDirectory(original).tables].map(([tag,t])=>[tag,t.bytes.slice()]));if(!tables.has('name')||!tables.has('head')||tables.get('head').length<54)throw new Error('Missing name/head metadata');
 const info=snapshot.info,changed=new Set(editable.filter(k=>info[k]!==archive.info[k])),values=new Map();
 for(const [key,id]of [['designer',9],['manufacturer',8],['copyright',0],['license',13]])if(changed.has(key))values.set(id,String(info[key]||''));
 if(changed.has('familyName')){values.set(1,info.familyName);values.set(16,info.familyName);}
 if(changed.has('styleName')){values.set(2,info.styleName);values.set(17,info.styleName);}
 if(changed.has('familyName')||changed.has('styleName')){values.set(4,`${info.familyName} ${info.styleName}`);values.set(6,(`${info.familyName}-${info.styleName}`).normalize('NFKD').replace(/[^A-Za-z0-9-]/g,'').slice(0,63)||`Counterform-${archive.sha256.slice(0,16)}`);}
 if(changed.has('versionMajor')||changed.has('versionMinor')){
  if(!Number.isInteger(info.versionMajor)||info.versionMajor<0||info.versionMajor>65535||!Number.isInteger(info.versionMinor)||info.versionMinor<0||info.versionMinor>999)throw new RangeError('Version must have major 0…65535 and minor 0…999');
  values.set(5,`Version ${info.versionMajor}.${String(info.versionMinor).padStart(3,'0')}`);new DataView(tables.get('head').buffer).setUint32(4,Math.round((info.versionMajor+info.versionMinor/1000)*65536));
 }
 for(const v of values.values())if(typeof v!=='string'||v.length>32767||v.includes('\0'))throw new Error('Invalid edited name');
 tables.set('name',rewriteNames(tables.get('name'),values));new DataView(tables.get('head').buffer).setUint32(8,0);
 const warnings=[];if(tables.delete('DSIG'))warnings.push('Removed DSIG: changing metadata invalidates the original digital signature');
 return {bytes:sfnt(tables,flavor),warnings};
}
