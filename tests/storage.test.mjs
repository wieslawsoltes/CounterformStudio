import test from 'node:test';
import assert from 'node:assert/strict';
import {Autosave,ProjectStore} from '@wieslawsoltes/counterform-storage';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
const tick=()=>new Promise(r=>setImmediate(r));
function delayedStore(){const writes=[],releases=[];return{writes,releases,save:source=>{writes.push(structuredClone(source));return new Promise((resolve,reject)=>releases.push({resolve,reject}));}};}
test('autosave flush awaits the in-flight and trailing write without premature success',async()=>{
 const doc=createDemoFont(),store=delayedStore(),status=[],a=new Autosave(doc,store,{onStatus:s=>status.push(s)});
 const first=a.flush();await tick();doc.info.familyName='Second';doc.touch();const second=a.flush();assert.equal(first,second);
 store.releases[0].resolve();await tick();assert.equal(store.writes.length,2);assert.equal(store.writes[1].info.familyName,'Second');assert(!status.includes('saved'));
 let settled=false;second.then(()=>settled=true);await tick();assert(!settled);store.releases[1].resolve();assert.equal(await second,true);assert.equal(status.at(-1),'saved');a.dispose();
});
test('autosave snapshots are immutable while asynchronous persistence is running',async()=>{
 const doc=createDemoFont(),store=delayedStore(),a=new Autosave(doc,store),name=doc.info.familyName,p=a.flush();await tick();doc.info.familyName='changed';assert.equal(store.writes[0].info.familyName,name);store.releases[0].resolve();await p;a.dispose();
});
test('autosave write failure is observable, retryable and does not strand flush callers',async()=>{
 const d=createDemoFont(),s=delayedStore(),states=[],a=new Autosave(d,s,{onStatus:x=>states.push(x)}),p=a.flush();await tick();s.releases[0].reject(Error('quota'));assert.equal(await p,false);assert.equal(states.at(-1),'error');const q=a.flush();await tick();s.releases[1].resolve();assert.equal(await q,true);a.dispose();
});
test('disposing autosave suppresses trailing work and status after shutdown',async()=>{
 const d=createDemoFont(),s=delayedStore(),states=[],a=new Autosave(d,s,{onStatus:x=>states.push(x)}),p=a.flush();await tick();d.touch();a.dispose();s.releases[0].resolve();await p;assert.equal(s.writes.length,1);assert.deepEqual(states,['saving']);
});
test('reentrant autosave status observers do not create parallel writes',async()=>{
 const d=createDemoFont(),s=delayedStore();let requested=false;const a=new Autosave(d,s,{onStatus:state=>{if(state==='saving'&&!requested){requested=true;a.flush();}}}),p=a.flush();await tick();assert.equal(s.writes.length,1);s.releases[0].resolve();await tick();assert.equal(s.writes.length,2);s.releases[1].resolve();await p;a.dispose();
});
test('ProjectStore captures the exact input before awaiting database open',async()=>{
 const source=createDemoFont();const s=new ProjectStore();let unlock,stored;
 s.open=()=>new Promise(resolve=>unlock=resolve);
 const name=source.info.familyName,p=s.save(source);source.info.familyName='later';
 const tx={objectStore:()=>({put:value=>{stored=value;queueMicrotask(()=>tx.oncomplete());}})};
 unlock({transaction:()=>tx});await p;assert.equal(stored.data.info.familyName,name);
});
