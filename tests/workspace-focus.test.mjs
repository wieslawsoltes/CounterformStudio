import test from 'node:test';
import assert from 'node:assert/strict';
import {WorkspaceFocus} from '../packages/workbench/src/workspace-focus.js';

function harness() {
    const listeners=new Map(),queued=new Map(),calls=[];
    let next=0;
    const doc={activeElement:null,
        addEventListener(type,handler){listeners.set(type,handler);},
        removeEventListener(type,handler){assert.equal(listeners.get(type),handler);listeners.delete(type);}
    };
    const target=name=>({name,isConnected:true,visible:true,getClientRects(){return this.visible?[{}]:[];},
        focus(options){assert.equal(options.preventScroll,true);calls.push(name);doc.activeElement=this;listeners.get('focusin')?.({target:this});}
    });
    const focus=new WorkspaceFocus(doc,callback=>{queued.set(++next,callback);return next;},id=>queued.delete(id));
    const flush=()=>{const work=[...queued.values()];queued.clear();for(const callback of work)callback();};
    return {doc,target,focus,flush,calls,listeners,queued};
}

test('visible editor focuses immediately and settles once after the docking frame',()=>{
    const h=harness(),editor=h.target('editor');let fit=0;
    h.focus.request(editor,{ready:()=>fit++});assert.deepEqual(h.calls,['editor']);assert.equal(fit,0);
    h.flush();assert.deepEqual(h.calls,['editor','editor']);assert.equal(fit,1);assert.equal(h.focus.pending,null);
    h.flush();assert.equal(fit,1);h.focus.dispose();
});

test('hidden docking content receives focus only after it becomes visible',()=>{
    const h=harness(),editor=h.target('editor');editor.visible=false;
    h.focus.request(editor);assert.equal(h.calls.length,0);editor.visible=true;h.flush();assert.deepEqual(h.calls,['editor']);
    h.focus.dispose();
});

test('new pointer input, keyboard input and unrelated focus cancel a queued handoff',()=>{
    for(const type of ['pointerdown','keydown','focusin']){
        const h=harness(),editor=h.target('editor');let fit=0;
        h.focus.request(editor,{ready:()=>fit++});h.calls.length=0;
        h.listeners.get(type)({target:h.target('field')});h.flush();assert.equal(fit,0);assert.deepEqual(h.calls,[]);
        h.focus.dispose();
    }
});

test('superseded, stale, disconnected and disposed requests cannot restore focus',()=>{
    const h=harness(),first=h.target('first'),second=h.target('second');let fit=0;
    h.focus.request(first,{ready:()=>fit++});const stale=[...h.queued.values()][0];
    h.focus.request(second);h.calls.length=0;stale();h.flush();assert.deepEqual(h.calls,['second']);assert.equal(fit,0);
    let valid=true;h.focus.request(first,{valid:()=>valid});valid=false;h.calls.length=0;h.flush();assert.deepEqual(h.calls,[]);
    h.focus.request(first);first.isConnected=false;h.calls.length=0;h.flush();assert.deepEqual(h.calls,[]);
    h.focus.request(second);h.focus.dispose();h.calls.length=0;h.flush();assert.equal(h.listeners.size,0);
    h.focus.request(second);h.focus.dispose();assert.deepEqual(h.calls,[]);
});

test('a dialog opened during ready wins over the pending editor focus',()=>{
    const h=harness(),editor=h.target('editor'),dialog=h.target('dialog');
    h.focus.request(editor,{ready:()=>dialog.focus({preventScroll:true})});h.flush();
    assert.equal(h.doc.activeElement,dialog);assert.deepEqual(h.calls,['editor','dialog']);assert.equal(h.focus.pending,null);
    h.focus.dispose();
});

test('callback failure clears pending ownership and leaves the controller reusable',()=>{
    const h=harness(),editor=h.target('editor');
    h.focus.request(editor,{ready:()=>{throw new Error('fit failed');}});assert.throws(h.flush,/fit failed/);
    assert.equal(h.focus.pending,null);h.focus.request(editor);h.flush();assert.equal(h.doc.activeElement,editor);h.focus.dispose();
});
