import {isVariationSelector} from '@wieslawsoltes/counterform-binary';
import {FontDocument,setSidebearing,validateDocumentShape} from '@wieslawsoltes/counterform-model';
import {kerningValue,pairKey} from '@wieslawsoltes/counterform-opentype';

const MAX_ITEMS=2048, MAX_VALUE=1e7;
const finite=n=>{if(!Number.isFinite(n)||Math.abs(n)>MAX_VALUE)throw new RangeError('Metric expression exceeds the finite numeric budget');return n;};
const glyph=(doc,id)=>{const g=doc.glyph(id);if(!g)throw new Error(`Unknown metrics glyph: ${id}`);return g;};
const master=(doc,id)=>{if(!doc.data.masters.some(m=>m.id===id))throw new Error('Unknown metrics master');};
/** Source-order metrics text. /name selects a glyph, // is a literal slash. No shaping is implied. */
export function parseMetricsText(text,doc) {
    if(typeof text!=='string'||text.length>32768)throw new RangeError('Metrics text must contain at most 32768 UTF-16 units');
    const result=[];let i=0;
    const add=(g,start,end,label)=>{if(result.length>=MAX_ITEMS)throw new RangeError('Metrics text exceeds 2048 glyphs');result.push({glyphId:g?.id??null,name:g?.name??label,start,end,missing:!g});};
    while(i<text.length){const start=i,cp=text.codePointAt(i),char=String.fromCodePoint(cp);i+=char.length;
        if(char==='\r'||char==='\n')throw new Error('Metrics text is a single line; use separate proof lines for paragraphs');
        if(char==='/'&&text[i]!=='/'){
            const match=/^[A-Za-z0-9_.$-]+/.exec(text.slice(i));
            if(match){i+=match[0].length;add(doc.glyph(match[0]),start,i,match[0]);if(text[i]===' ')i++;continue;}
        }else if(char==='/'&&text[i]==='/')i++;
        const vs=text.codePointAt(i);
        if(isVariationSelector(vs)&&!isVariationSelector(cp)) {
            i+=String.fromCodePoint(vs).length;
            add(doc.variation(cp,vs)??doc.char(cp),start,i,`U+${cp.toString(16).toUpperCase()} U+${vs.toString(16).toUpperCase()}`);
        } else add(doc.char(cp),start,i,`U+${cp.toString(16).toUpperCase()}`);
    }
    return result;
}
export function layoutMetrics(doc,masterId,text,{kerning=true,tracking=0}={}) {
    master(doc,masterId);finite(tracking);const tokens=parseMetricsText(text,doc),cache=new Map();let x=0,last=null;
    const items=tokens.map((token,index)=>{
        if(token.missing){last=null;return {...token,index,x,advanceWidth:0,lsb:0,rsb:0,width:0,kernBefore:0};}
        const g=glyph(doc,token.glyphId);if(!cache.has(g.id))cache.set(g.id,doc.metrics(g.id,masterId));const metrics=cache.get(g.id);
        if(!metrics)throw new Error(`Missing metrics layer: ${g.name}`);
        const kernBefore=last&&kerning?kerningValue(doc.data,masterId,last,g.name):0;
        if(index)x+=tracking;x+=kernBefore;const item={...token,...metrics,index,x,kernBefore};x+=metrics.advanceWidth;last=g.name;return item;
    });
    return {items,advanceWidth:x,missing:items.filter(t=>t.missing)};
}

/** Bounded arithmetic AST. Metric references are explicit, never evaluated as JavaScript. */
export function parseMetricExpression(source,property='lsb') {
    if(typeof source==='number')return {ast:{type:'number',value:finite(source)},references:[]};
    if(typeof source!=='string'||source.length>2048)throw new RangeError('Metric expression must contain at most 2048 characters');
    let text=source.trim();
    // A compact same-side or opposite-side reference; glyph names containing '-' use quoted calls.
    if(/^=\|?[A-Za-z_][\w.$]*(?:\s*[+*/-]|$)/.test(text))text=text.replace(/^=(\|?)([A-Za-z_][\w.$]*)/,(_,flip,name)=>`${flip?(property==='lsb'?'rsb':property==='rsb'?'lsb':property):property}("${name}")`);
    else if(text.startsWith('='))text=text.slice(1);
    const tokens=[];let offset=0;
    const pattern=/\s*(?:(\d+(?:\.\d*)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|("(?:[^"\\]|\\["\\])*")|([+*/(),-]))/y;
    while(offset<text.length){pattern.lastIndex=offset;const m=pattern.exec(text);if(!m)throw new SyntaxError(`Invalid metric expression at character ${offset+1}`);offset=pattern.lastIndex;tokens.push(m[1]?{kind:'number',value:Number(m[1])}:m[2]?{kind:'identifier',value:m[2]}:m[3]?{kind:'string',value:JSON.parse(m[3])}:{kind:m[4]});if(tokens.length>256)throw new RangeError('Metric expression has too many tokens');}
    let pos=0,nodes=0;const refs=[];const take=kind=>{const t=tokens[pos++];if(t?.kind!==kind)throw new SyntaxError(`Expected ${kind} in metric expression`);return t;};
    function parse(min=0,depth=0){if(depth>32||++nodes>128)throw new RangeError('Metric expression is too deep');let a;const t=tokens[pos];
        if(!t)throw new SyntaxError('Empty metric expression');
        if(t.kind==='+'||t.kind==='-'){pos++;a={type:'unary',op:t.kind,value:parse(3,depth+1)};}
        else if(t.kind==='number'){pos++;a={type:'number',value:t.value};}
        else if(t.kind==='('){pos++;a=parse(0,depth+1);take(')');}
        else if(t.kind==='identifier'){
            pos++;const metric=t.value==='advance'?'advanceWidth':t.value;
            if(!['lsb','rsb','advanceWidth','width'].includes(metric))throw new SyntaxError(`Unknown metric function: ${t.value}`);
            take('(');const name=take('string').value;take(')');if(!name||name.length>255)throw new RangeError('Invalid reference glyph name');a={type:'reference',metric,glyph:name};refs.push({glyph:name,metric});
        }else throw new SyntaxError('Expected a number, reference, or parenthesis');
        while(pos<tokens.length){const op=tokens[pos].kind,p=op==='+'||op==='-'?1:op==='*'||op==='/'?2:0;if(!p||p<=min)break;pos++;a={type:'binary',op,left:a,right:parse(p,depth+1)};}
        return a;
    }
    const ast=parse();if(pos!==tokens.length)throw new SyntaxError('Unexpected trailing metric expression tokens');return {ast,references:refs};
}
export function evaluateMetricExpression(expression,resolve) {
    let count=0;function run(n,depth=0){if(depth>32||++count>256)throw new RangeError('Metric expression evaluation budget exceeded');
        if(n?.type==='number')return finite(n.value);
        if(n?.type==='reference')return finite(resolve(n.glyph,n.metric));
        if(n?.type==='unary'){if(!['+','-'].includes(n.op))throw new SyntaxError('Invalid unary operator');return finite((n.op==='-'?-1:1)*run(n.value,depth+1));}
        if(n?.type==='binary'){const a=run(n.left,depth+1),b=run(n.right,depth+1);if(n.op==='/'&&b===0)throw new RangeError('Division by zero in metric expression');switch(n.op){case '+':return finite(a+b);case '-':return finite(a-b);case '*':return finite(a*b);case '/':return finite(a/b);}}
        throw new SyntaxError('Invalid metric expression node');
    }return run(expression.ast);
}

/** Resolve a complete batch against a private source snapshot, in dependency order. */
export function planMetricEdits(doc,masterId,edits) {
    master(doc,masterId);if(!Array.isArray(edits)||!edits.length||edits.length>MAX_ITEMS)throw new RangeError('Supply 1–2048 metric edits');
    const staged=new FontDocument(structuredClone(doc.data)),byId=new Map(),state=new Map(),order=[],stack=[];
    try {
        for(const edit of edits){const g=glyph(staged,edit.glyphId),layer=staged.layer(g.id,masterId);if(!layer||layer.locked)throw new Error(`Source layer is missing or locked: ${g.name}`);if(byId.has(g.id))throw new Error(`Duplicate metric assignment: ${g.name}`);
            const fields={};for(const property of ['lsb','rsb','advanceWidth'])if(edit[property]!==undefined)fields[property]=parseMetricExpression(edit[property],property);
            if(!Object.keys(fields).length)throw new Error(`No metric assignment for ${g.name}`);byId.set(g.id,fields);
        }
        function visit(id,depth=0){if(depth>128)throw new RangeError('Metric dependency graph is too deep');if(state.get(id)===2)return;if(state.get(id)===1)throw new Error(`Cyclic metric dependency: ${[...stack,id].map(x=>glyph(staged,x).name).join(' → ')}`);
            state.set(id,1);stack.push(id);const fields=byId.get(id);
            // Component changes can move a parent's ink bounds even without a formula reference.
            for(const c of staged.layer(id,masterId)?.components||[])visit(glyph(staged,c.glyphId||c.glyphName).id,depth+1);
            for(const expression of Object.values(fields||{}))for(const ref of expression.references){const target=glyph(staged,ref.glyph).id;if(target===id&&ref.metric==='width')continue;visit(target,depth+1);}
            if(fields){const before=staged.metrics(id,masterId),values={};for(const [property,expression]of Object.entries(fields))values[property]=evaluateMetricExpression(expression,(name,metric)=>staged.metrics(glyph(staged,name).id,masterId)[metric]);
                const width=before.width,has=k=>Object.hasOwn(values,k);let lsb=has('lsb')?values.lsb:before.lsb,rsb=has('rsb')?values.rsb:before.rsb;
                if(has('advanceWidth')){if(has('lsb')&&has('rsb')&&Math.abs(values.advanceWidth-lsb-width-rsb)>1e-6)throw new Error(`Contradictory width and sidebearings: ${glyph(staged,id).name}`);if(has('rsb')&&!has('lsb'))lsb=values.advanceWidth-width-rsb;else rsb=values.advanceWidth-width-lsb;}
                const advanceWidth=lsb+width+rsb;
                if(lsb< -32768||lsb>32767||rsb< -32768||rsb>32767||advanceWidth<0||advanceWidth>65535)throw new RangeError(`Metrics outside OpenType ranges: ${glyph(staged,id).name}`);
                const outline=staged.resolve(id,masterId);if(!outline.some(c=>c.nodes.length)&&lsb!==0)throw new Error('An empty glyph cannot have a nonzero ink left sidebearing');
                if(lsb!==before.lsb)setSidebearing(staged,id,masterId,'left',lsb);
                staged.layer(id,masterId).advanceWidth=advanceWidth;order.push(id);
            }
            stack.pop();state.set(id,2);
        }
        for(const id of byId.keys())visit(id);validateDocumentShape(staged.data);
        return {documentId:doc.data.id,revision:doc.revision,masterId,assignments:order.map(glyphId=>({glyphId,layer:structuredClone(staged.layer(glyphId,masterId))}))};
    }finally{staged.dispose();}
}
/** Apply an optimistic plan once. Wrap this in the host's history transaction. */
export function applyMetricPlan(doc,plan) {
    if(plan?.documentId!==doc.data.id||plan.revision!==doc.revision)throw new Error('Stale metrics plan; recalculate against the current document');
    master(doc,plan.masterId);if(!Array.isArray(plan.assignments)||!plan.assignments.length||plan.assignments.length>MAX_ITEMS)throw new RangeError('Invalid metrics plan');
    const candidate=structuredClone(doc.data),seen=new Set(),writes=[];
    for(const a of plan.assignments){const g=glyph(doc,a.glyphId),layer=doc.layer(g.id,plan.masterId);if(seen.has(g.id)||!layer||layer.locked||a.layer?.id!==layer.id||a.layer?.masterId!==plan.masterId)throw new Error('Invalid or locked metrics-plan target');seen.add(g.id);
        const value=structuredClone(a.layer);candidate.glyphs.find(x=>x.id===g.id).layers[g.layers.indexOf(layer)]=value;writes.push({g,index:g.layers.indexOf(layer),value});}
    validateDocumentShape(candidate);for(const w of writes)w.g.layers[w.index]=w.value;doc.touch('structure');
}
export function setKerningException(doc,masterId,left,right,value) {
    master(doc,masterId);const l=glyph(doc,left),r=glyph(doc,right);
    if(value!==null&&(!Number.isInteger(value)||value< -32768||value>32767))throw new RangeError('Kerning requires an int16 value, or null to remove the exception');
    const pairs=doc.data.kerning[masterId]??={};delete pairs[`${l.name}/${r.name}`];if(value===null)delete pairs[pairKey(l.name,r.name)];else pairs[pairKey(l.name,r.name)]=value;
    doc.touch('kerning');
}
