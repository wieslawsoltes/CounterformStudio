import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {EventEmitter} from 'node:events';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileTrueType,compileOpenTypeCFF,encodeWOFF} from '@wieslawsoltes/counterform-font-io';
import {compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
import {executeTask} from '@wieslawsoltes/counterform-compiler/tasks';
const workerFactory=()=>new Worker(new URL('../packages/compiler/src/node-worker.js',import.meta.url));
class FakeWorker extends EventEmitter {
 postMessage(message){this.message=message;}
 terminate(){this.terminated=true;}
 result(value={ok:true}){this.emit('message',{protocol:1,id:this.message.id,type:'result',value});}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('real worker compiles TTF/CFF/variable/WOFF identical to synchronous compiler',async()=>{
 const progress=[],client=new CompilerClient({workerFactory,onProgress:x=>progress.push(x.stage)}),d=createDemoFont();
 try{for(const [format,compile] of [['ttf',compileTrueType],['otf',compileOpenTypeCFF],['variable',compileVariableTrueType],['woff',d=>encodeWOFF(compileTrueType(d))]]){
  const r=await client.compile(d,{format});assert.deepEqual(r.bytes,compile(d));assert.equal(r.format,format);
 }assert(progress.includes('compile'));assert.equal(client.backend,'worker');}finally{client.dispose();}
});
test('real worker snapshots source at enqueue and validates, inspects, recovers from errors',async()=>{
 const client=new CompilerClient({workerFactory}),d=createDemoFont();
 try{const expected=compileTrueType(d),job=client.compile(d);d.glyph('A').layers[0].advanceWidth+=100;assert.deepEqual((await job).bytes,expected);
  assert(Array.isArray((await client.validate(d)).issues));assert((await client.inspect(d)).report.tables.length>8);
  await assert.rejects(client.compile(d,{format:'woff2'}),/Unsupported output/);
  assert((await client.compile(d)).bytes.length>1000);
 }finally{client.dispose();}
});
test('priority queues retain FIFO ties and enforce an active-inclusive budget',async()=>{
 const w=new FakeWorker(),c=new CompilerClient({workerFactory:()=>w,maxQueue:3});
 try{const a=c.run('compile',{}, {},{priority:10}),b=c.run('compile',{}, {},{priority:-1}),e=c.run('compile',{}, {},{priority:-1});
  await assert.rejects(c.run('compile',{}),/queue budget/);await tick();assert.equal(w.message.id,2);w.result('b');await tick();assert.equal(w.message.id,3);w.result('e');await tick();assert.equal(w.message.id,1);w.result('a');assert.deepEqual(await Promise.all([a,b,e]),['a','b','e']);
 }finally{c.dispose();}
});
test('cancelling active work terminates worker and next task starts on a fresh worker',async()=>{
 const workers=[],c=new CompilerClient({workerFactory:()=>{const w=new FakeWorker();workers.push(w);return w;}}),ac=new AbortController();
 const old=c.run('compile',{}, {},{signal:ac.signal,key:'proof'}),rejected=assert.rejects(old,{name:'AbortError'});await tick();ac.abort();await rejected;assert(workers[0].terminated);
 const next=c.run('compile',{});await tick();assert.equal(workers.length,2);workers[0].result('obsolete');workers[1].result('new');assert.equal(await next,'new');c.dispose();
});
test('keyed jobs supersede queued requests without dispatch and dispose settles all promises',async()=>{
 const c=new CompilerClient({workerFactory:()=>new FakeWorker()});
 const a=c.run('compile',{}, {},{key:'proof'}),ra=assert.rejects(a,{name:'AbortError'});
 const b=c.run('compile',{}, {},{key:'proof'}),rb=assert.rejects(b,{name:'AbortError'}),d=c.run('validate',{}),rd=assert.rejects(d,{name:'AbortError'});
 c.dispose();await Promise.all([ra,rb,rd]);await assert.rejects(c.compile({}),{name:'AbortError'});
});
test('worker timeout kills stalled work and reports TimeoutError',async()=>{
 const w=new FakeWorker(),c=new CompilerClient({workerFactory:()=>w,timeout:20});
 try{await assert.rejects(c.run('compile',{}),{name:'TimeoutError'});assert(w.terminated);}finally{c.dispose();}
});
test('worker load failure is explicit and never silently runs on caller thread',async()=>{
 const c=new CompilerClient({workerFactory:()=>{throw new Error('load denied');}});
 try{await assert.rejects(c.compile(createDemoFont()),/load denied/);}finally{c.dispose();}
});
test('inline execution is explicit and pre-aborted work does not compile',async()=>{
 const c=new CompilerClient({inline:true}),ac=new AbortController();ac.abort();
 try{await assert.rejects(c.compile(createDemoFont(),{}, {signal:ac.signal}),{name:'AbortError'});assert((await c.compile(createDemoFont())).bytes.length>1000);assert.match(c.backend,/inline/);assert.throws(()=>executeTask('unknown',{}),/Unknown/);}finally{c.dispose();}
});
test('progress exceptions cannot strand the worker and crashes reject active request',async()=>{
 const w=new FakeWorker(),c=new CompilerClient({workerFactory:()=>w,onProgress:()=>{throw Error('observer');}});
 try{const p=c.run('compile',{}),r=assert.rejects(p,/crash/);await tick();w.emit('message',{protocol:1,id:w.message.id,type:'progress',value:{stage:'compile'}});w.emit('error',Error('crash'));await r;assert(w.terminated);}finally{c.dispose();}
});

test('generated browser worker graph executes in a fresh directory without npm or import maps',async()=>{
 const fs=await import('node:fs/promises'),path=await import('node:path'),os=await import('node:os'),url=await import('node:url');
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'counterform-worker-graph-'));
 let client;
 try {
  await fs.cp(new URL('../app/workers/',import.meta.url),folder,{recursive:true});
  await fs.writeFile(path.join(folder,'package.json'),'{"type":"module"}');
  // Host only the browser message API. The entry and all actual compiler modules
  // are the exact generated browser graph, not the npm-resolved Node entry.
  await fs.writeFile(path.join(folder,'host.mjs'),`import {parentPort} from 'node:worker_threads';
  globalThis.self={addEventListener:(event,callback)=>{if(event==='message')parentPort.on('message',data=>callback({data}));},postMessage:(value,transfer)=>parentPort.postMessage(value,transfer)};
  await import('./compiler.js');`);
  client=new CompilerClient({workerFactory:()=>new Worker(url.pathToFileURL(path.join(folder,'host.mjs')))});
  const d=createDemoFont();d.glyph('A').colorLayers=[{glyphId:d.glyph('O').id,paletteIndex:1}];
  assert.deepEqual((await client.compile(d,{format:'variable'})).bytes,compileVariableTrueType(d));
 } finally {client?.dispose();await fs.rm(folder,{recursive:true,force:true});}
});
