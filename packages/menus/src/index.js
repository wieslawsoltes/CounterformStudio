let sequence=0;
/** Command-backed DOM menus. Rendering never runs a command or mutates a document. */
export class CommandMenus {
    constructor(host, registry, menus, {icon=null,formatKey=k=>k,onError=()=>{}}={}) {
        if(!host?.ownerDocument||!registry?.commands)throw new TypeError('A DOM host and command registry are required');
        this.host=host;this.document=host.ownerDocument;this.registry=registry;this.menus=menus;this.icon=icon;this.formatKey=formatKey;this.onError=onError;
        this.abort=new AbortController();this.buttons=[];this.selected=0;this.context=null;this.search='';this.searchAt=0;
        host.setAttribute('role','menubar');host.setAttribute('aria-label','Application menu');
        menus.forEach((menu,i)=>{
            this.validate(menu.items);const button=this.document.createElement('button');button.type='button';button.textContent=menu.label;
            button.setAttribute('role','menuitem');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');button.tabIndex=i? -1:0;
            button.addEventListener('click',()=>this.popup&&this.activeIndex===i?this.close(true):this.open(i),{signal:this.abort.signal});
            button.addEventListener('pointerenter',()=>{if(this.popup&&this.activeIndex!==null)this.open(i);},{signal:this.abort.signal});
            button.addEventListener('keydown',e=>this.barKey(e,i),{signal:this.abort.signal});
            this.buttons.push(button);host.append(button);
        });
        host.addEventListener('pointerdown',()=>{if(!host.contains(this.document.activeElement)&&!this.popup?.contains(this.document.activeElement))this.commandFocus=this.document.activeElement;},{capture:true,signal:this.abort.signal});
        this.document.addEventListener('pointerdown',e=>{if(this.popup&&!this.popup.contains(e.target)&&!host.contains(e.target))this.close(false);},{capture:true,signal:this.abort.signal});
        this.document.addEventListener('keydown',e=>{if(e.isComposing||e.defaultPrevented)return;if(e.key==='F10'&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();if(!host.contains(this.document.activeElement)&&!this.popup?.contains(this.document.activeElement))this.commandFocus=this.document.activeElement;this.close(false);this.buttons[this.selected]?.focus();}},{capture:true,signal:this.abort.signal});
        this.document.defaultView?.addEventListener('resize',()=>this.close(false),{signal:this.abort.signal});
        this.document.defaultView?.addEventListener('blur',()=>this.close(false),{signal:this.abort.signal});
        this.off=registry.changed?.subscribe(()=>this.refresh());
    }
    validate(items){for(const id of items)if(id!==null&&!this.registry.commands.has(id))throw new Error(`Unknown menu command: ${id}`);}
    focusBar(index){this.selected=(index+this.buttons.length)%this.buttons.length;this.buttons.forEach((b,i)=>b.tabIndex=i===this.selected?0:-1);this.buttons[this.selected]?.focus();}
    barKey(e,index){if(e.isComposing)return;switch(e.key){case'ArrowRight':case'ArrowLeft':e.preventDefault();this.focusBar(index+(e.key==='ArrowRight'?1:-1));break;case'Home':case'End':e.preventDefault();this.focusBar(e.key==='Home'?0:this.buttons.length-1);break;case'ArrowDown':case'ArrowUp':e.preventDefault();this.open(index,e.key==='ArrowUp');break;case'Escape':this.close(true);break;default:if(e.key.length===1&&!e.ctrlKey&&!e.altKey&&!e.metaKey){const i=this.menus.findIndex(m=>m.label.toLowerCase().startsWith(e.key.toLowerCase()));if(i>=0){e.preventDefault();this.focusBar(i);this.open(i);}}}}
    open(index,last=false){const b=this.buttons[index];if(!b)return;this.focusBar(index);this.close(false);this.activeIndex=index;this.returnFocus=b;b.setAttribute('aria-expanded','true');const r=b.getBoundingClientRect();this.render(this.menus[index].items,r.left,r.bottom+4,last,this.menus[index].label);b.setAttribute('aria-controls',this.popup.id);}
    openContext(items,x,y,returnFocus=this.document.activeElement){this.validate(items);this.close(false);this.activeIndex=null;this.returnFocus=returnFocus;this.commandFocus=returnFocus;this.render(items,x,y,false,'Glyph actions');}
    render(items,x,y,last,label){
        const popup=this.document.createElement('div');this.popup=popup;this.popupAbort=new AbortController();popup.className='cf-command-menu';popup.id=`cf-menu-${++sequence}`;popup.setAttribute('role','menu');popup.setAttribute('aria-label',label);popup.tabIndex=-1;
        this.rows=[];this.search='';
        items.forEach(id=>{
            if(id===null){const line=this.document.createElement('div');line.setAttribute('role','separator');popup.append(line);return;}
            const c=this.registry.commands.get(id),row=this.document.createElement('button');row.type='button';row.tabIndex=-1;row.dataset.command=id;
            const glyph=this.icon?.(id,this.document);if(glyph)row.append(glyph);
            const text=this.document.createElement('span');text.className='cf-menu-label';text.textContent=c.label;row.append(text);
            const key=this.document.createElement('kbd');key.textContent=(this.registry.bindings.get(id)||[]).slice(0,1).map(k=>this.formatKey(k)).join('');row.append(key);
            row.addEventListener('click',()=>{if(!this.registry.canExecute(id))return;const focus=this.commandFocus?.isConnected?this.commandFocus:this.returnFocus;this.close(false);focus?.isConnected&&focus.focus({preventScroll:true});Promise.resolve().then(()=>this.registry.run(id)).catch(this.onError);},{signal:this.popupAbort.signal});
            row.addEventListener('pointermove',()=>{if(!row.disabled)row.focus({preventScroll:true});},{signal:this.popupAbort.signal});
            this.rows.push({row,id});popup.append(row);
        });
        popup.addEventListener('keydown',e=>this.popupKey(e),{signal:this.popupAbort.signal});this.document.body.append(popup);this.refresh();
        const win=this.document.defaultView,w=win.innerWidth,h=win.innerHeight,r=popup.getBoundingClientRect();
        popup.style.left=Math.max(4,Math.min(x,w-r.width-4))+'px';popup.style.top=Math.max(4,Math.min(y,h-r.height-4))+'px';
        const enabled=this.enabled();(enabled[last?enabled.length-1:0]||popup).focus({preventScroll:true});
    }
    refresh(){for(const {id,row} of this.rows||[]){const c=this.registry.commands.get(id);row.disabled=!this.registry.canExecute(id);row.setAttribute('aria-disabled',String(row.disabled));row.setAttribute('role',c.checked?'menuitemcheckbox':'menuitem');if(c.checked)row.setAttribute('aria-checked',String(!!c.checked()));row.querySelector('kbd').textContent=(this.registry.bindings.get(id)||[]).slice(0,1).map(this.formatKey).join('');}}
    enabled(){return(this.rows||[]).map(x=>x.row).filter(row=>!row.disabled);}
    popupKey(e){if(e.isComposing)return;const list=this.enabled(),index=list.indexOf(this.document.activeElement);let target=null;
        if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close(true);return;}
        if(e.key==='Tab'){this.close(false);return;}
        if(e.key==='ArrowDown')target=list[(index+1)%list.length];else if(e.key==='ArrowUp')target=list[(index-1+list.length)%list.length];else if(e.key==='Home')target=list[0];else if(e.key==='End')target=list.at(-1);
        else if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&this.activeIndex!==null){e.preventDefault();this.open((this.activeIndex+(e.key==='ArrowRight'?1:-1)+this.buttons.length)%this.buttons.length);return;}
        else if(e.key.length===1&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key!==' '){const now=Date.now();this.search=(now-this.searchAt<700?this.search:'')+e.key.toLowerCase();this.searchAt=now;const ordered=[...list.slice(index+1),...list.slice(0,index+1)];target=ordered.find(b=>b.querySelector('.cf-menu-label').textContent.toLowerCase().startsWith(this.search));if(!target&&this.search.length>1){this.search=e.key.toLowerCase();target=ordered.find(b=>b.querySelector('.cf-menu-label').textContent.toLowerCase().startsWith(this.search));}}
        if(target){e.preventDefault();target.focus();}if(e.key.length===1||e.key.startsWith('Arrow'))e.stopPropagation();
    }
    close(restore=false){this.popupAbort?.abort();this.popupAbort=null;this.popup?.remove();this.popup=null;this.rows=[];this.buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.removeAttribute('aria-controls');});if(restore&&this.returnFocus?.isConnected)this.returnFocus.focus({preventScroll:true});this.activeIndex=null;}
    dispose(){this.close(false);this.abort.abort();this.off?.();this.host.replaceChildren();this.host.removeAttribute('role');}
}
