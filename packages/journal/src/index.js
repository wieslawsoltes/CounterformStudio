const ZERO='0'.repeat(64),utf8=new TextEncoder();
function identifier(id){if(typeof id!=='string'||!id.length||id.length>255)throw new TypeError('Invalid journal identity');return id;}
async function digest(text){if(!globalThis.crypto?.subtle)throw new Error('Journal integrity requires Web Crypto on a secure origin');return [...new Uint8Array(await crypto.subtle.digest('SHA-256',utf8.encode(text)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
const signed=r=>JSON.stringify([1,r.projectId,r.sequence,r.previous,r.time,r.label,r.payload]);
const token=s=>s?`${s.next}:${s.tail}`:null;
export class JournalConflictError extends Error {constructor(){super('Another editor changed this recovery journal; reload or recover into a new project');this.name='JournalConflictError';}}
export class JournalCorruptionError extends Error {constructor(){super('Recovery journal is damaged; recover its valid prefix into a new project');this.name='JournalCorruptionError';}}
/** Deterministic in-memory CAS backend for hosts and fault-injection tests. */
export class MemoryJournalBackend {
 constructor(){this.streams=new Map();}
 async read(id){return structuredClone(this.streams.get(id)||null);}
 async list(){return [...this.streams.values()].map(s=>({id:s.id,time:s.records.at(-1)?.time??0,count:s.records.length,bytes:s.bytes}));}
 async compareAndSwap(id,expected,next){if(token(this.streams.get(id))!==expected)throw new JournalConflictError();this.streams.set(id,structuredClone(next));}
 close(){}
}
/** A stream replacement is one IndexedDB transaction; hashing never holds a transaction open. */
export class IndexedDBJournalBackend {
 constructor({name='counterform-recovery-v1'}={}){this.name=name;this.db=null;this.opening=null;this.closed=false;}
 open(){
  if(this.closed)return Promise.reject(new Error('Journal backend closed'));
  if(this.db)return Promise.resolve(this.db);if(this.opening)return this.opening;
  if(!globalThis.indexedDB)return Promise.reject(new Error('IndexedDB is unavailable'));
  this.opening=new Promise((resolve,reject)=>{const r=indexedDB.open(this.name,1);r.onupgradeneeded=()=>r.result.createObjectStore('streams',{keyPath:'id'});r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Journal database upgrade blocked'));
   r.onsuccess=()=>{if(this.closed){r.result.close();reject(new Error('Journal backend closed'));return;}this.db=r.result;this.db.onversionchange=()=>this.close();resolve(this.db);};}).finally(()=>this.opening=null);return this.opening;
 }
 async read(id){const db=await this.open();return new Promise((resolve,reject)=>{const r=db.transaction('streams').objectStore('streams').get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
 async list(){const db=await this.open();return new Promise((resolve,reject)=>{const out=[],r=db.transaction('streams').objectStore('streams').openCursor();r.onerror=()=>reject(r.error);r.onsuccess=()=>{const c=r.result;if(!c){resolve(out.sort((a,b)=>b.time-a.time));return;}const s=c.value;out.push({id:s.id,time:s.records.at(-1)?.time??0,count:s.records.length,bytes:s.bytes});c.continue();};});}
 async compareAndSwap(id,expected,next){const db=await this.open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('streams','readwrite',{durability:'strict'}),store=tx.objectStore('streams');let error;
  tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(error||tx.error||new Error('Journal transaction aborted'));
  const r=store.get(id);r.onsuccess=()=>{if(token(r.result)!==expected){error=new JournalConflictError();tx.abort();return;}store.put(next);};
 });}
 close(){this.closed=true;this.db?.close();this.db=null;}
}
/** Verify the retained checkpoint and every subsequent snapshot. Never skips a damaged record. */
export async function verifyJournal(stream){
 if(!stream)return {snapshots:[],issue:null};
 const fail=message=>({snapshots:[],issue:message});
 if(stream.format!==1||!Array.isArray(stream.records)||!Number.isSafeInteger(stream.first)||stream.first<1||!/^[a-f0-9]{64}$/.test(stream.baseHash))return fail('Invalid journal header');
 let previous=stream.baseHash,sequence=stream.first,total=0;const snapshots=[];let issue=null;
 for(const r of stream.records){
  try{
   if(r.projectId!==stream.id||r.sequence!==sequence||r.previous!==previous||!Number.isFinite(r.time)||typeof r.label!=='string'||typeof r.payload!=='string'||r.bytes!==utf8.encode(r.payload).length||await digest(signed(r))!==r.hash)throw new Error('Record continuity or integrity failure');
   const data=JSON.parse(r.payload);if(data.id!==stream.id)throw new Error('Snapshot identity mismatch');
   snapshots.push({sequence:r.sequence,time:r.time,label:r.label,data});previous=r.hash;sequence++;total+=r.bytes;
  }catch(e){issue=`Revision ${sequence}: ${e.message}`;break;}
 }
 if(!issue&&(sequence!==stream.next||previous!==stream.tail||total!==stream.bytes))issue='Journal head does not match retained records';
 return {snapshots,issue};
}
/** Full-snapshot WAL with bounded retention. append() captures input before its first await. */
export class RevisionJournal {
 constructor(backend=new IndexedDBJournalBackend(),{maxBytes=64*1024*1024,maxSnapshotBytes=32*1024*1024,maxRecords=24}={}){
  if(!Number.isSafeInteger(maxRecords)||maxRecords<2||maxRecords>1024||!Number.isSafeInteger(maxBytes)||!Number.isSafeInteger(maxSnapshotBytes)||maxSnapshotBytes<1||maxBytes<maxSnapshotBytes*2||maxBytes>256*1024*1024)throw new RangeError('Invalid recovery retention limits');
  this.backend=backend;this.limits={maxBytes,maxSnapshotBytes,maxRecords};this.states=new Map();this.queue=Promise.resolve();this.closed=false;this.pending=0;this.pendingBytes=0;
 }
 append(data,{label='Edit',time=Date.now()}={}){
  if(this.closed)return Promise.reject(new Error('Journal closed'));if(this.pending>=32)return Promise.reject(new RangeError('Journal queue full; a portable save is recommended'));let payload,id,bytes;try{id=identifier(data.id);payload=JSON.stringify(data);bytes=utf8.encode(payload).length;}catch(e){return Promise.reject(e);}
  if(bytes>this.limits.maxSnapshotBytes||this.pendingBytes+bytes>this.limits.maxBytes)return Promise.reject(new RangeError('Snapshot exceeds journal capacity'));
  if(typeof label!=='string'||label.length>256||!Number.isFinite(time))return Promise.reject(new TypeError('Invalid journal metadata'));
  this.pending++;this.pendingBytes+=bytes;const task=this.queue.then(async()=>{
   let previous=this.states.get(id);
   if(previous===undefined){previous=await this.backend.read(id);if((await verifyJournal(previous)).issue)throw new JournalCorruptionError();}
   if(previous?.records.at(-1)?.payload===payload){await this.backend.compareAndSwap(id,token(previous),previous);this.states.set(id,previous);return previous.next-1;}
   const next=previous?structuredClone(previous):{format:1,id:id,first:1,next:1,baseHash:ZERO,tail:ZERO,bytes:0,records:[]};
   if(!Number.isSafeInteger(next.next)||next.next>=Number.MAX_SAFE_INTEGER)throw new RangeError('Journal sequence exhausted');
   const record={projectId:id,sequence:next.next,previous:next.tail,time,label,payload,bytes};record.hash=await digest(signed(record));
   next.records.push(record);next.next++;next.tail=record.hash;next.bytes+=bytes;
   while(next.records.length>this.limits.maxRecords||next.bytes>this.limits.maxBytes){const old=next.records.shift();next.bytes-=old.bytes;next.first=old.sequence+1;next.baseHash=old.hash;}
   await this.backend.compareAndSwap(id,token(previous),next);this.states.set(id,next);return record.sequence;
  }).finally(()=>{this.pending--;this.pendingBytes-=bytes;});this.queue=task.catch(()=>{});return task;
 }
 async recover(id){await this.queue;const stream=await this.backend.read(identifier(id));return verifyJournal(stream);}
 async list(){await this.queue;return this.backend.list();}
 flush(){return this.queue;}
 async close(){this.closed=true;await this.queue;this.backend.close();}
}
