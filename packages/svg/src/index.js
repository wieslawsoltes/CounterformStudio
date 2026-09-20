import {fromSVG,transformContours} from '@wieslawsoltes/counterform-geometry';
const ID=[1,0,0,1,0,0],MAX=1e7;
const finite=n=>{if(!Number.isFinite(n)||Math.abs(n)>MAX)throw new RangeError('SVG geometry exceeds numeric budget');return n;};
const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]].map(finite);
function numbers(text){
    const result=[];let i=0,first=true;const p=/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
    while(i<text.length){while(/[\t\r\n ]/.test(text[i]||'~'))i++;if(i===text.length)break;
        if(text[i]===','){if(first)throw new SyntaxError('Unexpected SVG comma');i++;while(/[\t\r\n ]/.test(text[i]||'~'))i++;}
        p.lastIndex=i;const m=p.exec(text);if(!m)throw new SyntaxError('Invalid SVG number list');result.push(finite(Number(m[0])));i=p.lastIndex;first=false;
        if(result.length>500000)throw new RangeError('SVG number budget exceeded');
    }return result;
}
/** SVG transform lists post-multiply in document order. */
export function parseSVGTransform(text='') {
    if(typeof text!=='string'||text.length>65536)throw new RangeError('SVG transform budget exceeded');
    let matrix=ID,i=0,count=0;const token=/\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^()]*)\)/y;
    while(i<text.length){if(!text.slice(i).trim())break;
        token.lastIndex=i;const m=token.exec(text);if(!m)throw new SyntaxError('Invalid SVG transform list');i=token.lastIndex;
        const n=numbers(m[2]);let t;const angle=(n[0]%360)*Math.PI/180;
        switch(m[1]){
            case 'matrix':if(n.length===6)t=n;break;
            case 'translate':if(n.length===1||n.length===2)t=[1,0,0,1,n[0],n[1]??0];break;
            case 'scale':if(n.length===1||n.length===2)t=[n[0],0,0,n[1]??n[0],0,0];break;
            case 'rotate':if(n.length===1||n.length===3){t=[Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle),0,0];if(n.length===3)t=mul(mul([1,0,0,1,n[1],n[2]],t),[1,0,0,1,-n[1],-n[2]]);}break;
            case 'skewX':if(n.length===1)t=[1,0,Math.tan(angle),1,0,0];break;
            case 'skewY':if(n.length===1)t=[1,Math.tan(angle),0,1,0,0];break;
        }
        if(!t)throw new SyntaxError(`Invalid ${m[1]} arguments`);matrix=mul(matrix,t);
        if(++count>1024)throw new RangeError('SVG transform count exceeded');
        const sep=/^[\t\n\r ]*,?/.exec(text.slice(i))[0];i+=sep.length;
        if(sep.includes(',')&&!text.slice(i).trim())throw new SyntaxError('Trailing SVG transform comma');
    }return matrix;
}
/** Maps a viewBox into a viewport. Extraction does not apply viewport clipping. */
export function svgViewportTransform(box,width,height,aspect='xMidYMid meet') {
    if(!Array.isArray(box)||box.length!==4)throw new TypeError('A four-number viewBox is required');
    [...box,width,height].forEach(finite);if(box[2]<=0||box[3]<=0||width<=0||height<=0)throw new RangeError('SVG viewport dimensions must be positive');
    const match=/^(none|x(Min|Mid|Max)Y(Min|Mid|Max))(?:\s+(meet|slice))?$/.exec(aspect.trim());
    if(!match)throw new SyntaxError('Invalid preserveAspectRatio');
    let sx=width/box[2],sy=height/box[3],x=0,y=0;
    if(match[1]!=='none'){sx=sy=match[4]==='slice'?Math.max(sx,sy):Math.min(sx,sy);const f={Min:0,Mid:.5,Max:1};x=(width-box[2]*sx)*f[match[2]];y=(height-box[3]*sy)*f[match[3]];}
    return [sx,0,0,sy,x-box[0]*sx,y-box[1]*sy].map(finite);
}
function xml(text){
    if(typeof text!=='string'||text.length>16*1024*1024||/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error('Oversized SVG or forbidden DTD/entity declaration');
    const root={name:'root',attrs:{},children:[]},stack=[root];let i=0,count=0;
    function decode(s){return s.replace(/&([^;]+);/g,(_,n)=>{const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};if(Object.hasOwn(named,n))return named[n];
        if(!/^#(?:x[\da-fA-F]+|\d+)$/.test(n))throw new SyntaxError('Unknown XML entity');const cp=n[1]==='x'?parseInt(n.slice(2),16):Number(n.slice(1));
        if(!Number.isInteger(cp)||cp<=0||cp>0x10ffff||cp>=0xd800&&cp<=0xdfff)throw new SyntaxError('Invalid XML character');return String.fromCodePoint(cp);});}
    while(i<text.length){
        if(text.startsWith('<!--',i)){const end=text.indexOf('-->',i+4);if(end<0)throw new SyntaxError('Unclosed XML comment');i=end+3;continue;}
        if(text.startsWith('<?',i)){const end=text.indexOf('?>',i+2);if(end<0)throw new SyntaxError('Unclosed XML instruction');if(!/^<\?xml\s/.test(text.slice(i,end)))throw new Error('SVG processing instructions are not supported');i=end+2;continue;}
        if(text.startsWith('<![CDATA[',i)){const end=text.indexOf(']]>',i+9);if(end<0)throw new SyntaxError('Unclosed XML CDATA');i=end+3;continue;}
        if(text[i]!=='<'){const next=text.indexOf('<',i),end=next<0?text.length:next;if(stack.length===1&&text.slice(i,end).trim())throw new SyntaxError('Text outside SVG root');i=end;continue;}
        const token=/^<\/?[\w:.-]+(?:"[^"<]*"|'[^'<]*'|[^<>"'])*>/.exec(text.slice(i));if(!token)throw new SyntaxError('Malformed XML tag');const raw=token[0];i+=raw.length;
        if(raw.startsWith('</')){const m=/^<\/([\w:.-]+)\s*>$/.exec(raw);if(!m||stack.length<2||stack.pop().name!==m[1])throw new SyntaxError('Malformed XML nesting');continue;}
        const tag=/^<([\w:.-]+)/.exec(raw)[1],attrs=Object.create(null),closing=/\/\s*>$/.test(raw),end=raw.length-(closing?2:1);let at=tag.length+1;
        const attribute=/\s+([\w:.-]+)\s*=\s*(?:"([^"<]*)"|'([^'<]*)')/y;
        while(at<end){if(!raw.slice(at,end).trim())break;attribute.lastIndex=at;const m=attribute.exec(raw);if(!m||attribute.lastIndex>end||Object.hasOwn(attrs,m[1]))throw new SyntaxError('Malformed or duplicate SVG attribute');attrs[m[1]]=decode(m[2]??m[3]);at=attribute.lastIndex;}
        const n={name:tag,attrs,children:[]};stack.at(-1).children.push(n);
        if(++count>100000||stack.length>64)throw new RangeError('SVG XML complexity budget exceeded');if(!closing)stack.push(n);
    }
    if(stack.length!==1||root.children.length!==1)throw new SyntaxError('SVG requires one complete root element');return root.children[0];
}
const local=n=>n.name.split(':').at(-1);
const units={'':1,px:1,pt:96/72,pc:16,mm:96/25.4,cm:96/2.54,in:96};
function length(raw,fallback=0,extent=0){if(raw===undefined)return fallback;
    const m=/^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(px|pt|pc|mm|cm|in|%)?\s*$/i.exec(raw);
    if(!m)throw new SyntaxError(`Unsupported SVG length: ${raw}`);return finite(Number(m[1])*(m[2]==='%'?extent/100:units[m[2]?.toLowerCase()??'']));}
/** Extract editable vector geometry, never execute SVG or fetch external resources.
 * Appearance that is not converted (stroke/fill/opacity) is reported explicitly;
 * masks, clip paths, filters, CSS sheets and text are rejected rather than lost. */
export function readSVGOutlines(text,{maxNodes=250000,maxElements=100000}={}) {
    if(!Number.isInteger(maxNodes)||maxNodes<1||maxNodes>250000||!Number.isInteger(maxElements)||maxElements<1||maxElements>100000)throw new RangeError('Invalid SVG extraction budget');
    const root=xml(text);if(root.attrs.xmlns&&root.attrs.xmlns!=='http://www.w3.org/2000/svg')throw new Error('Unexpected SVG namespace');if(local(root)!=='svg')throw new Error('Expected an SVG document');
    const ids=new Map(),warnings=new Set(),contours=[];let visits=0,total=0;
    function index(n){const name=local(n);if(['script','foreignObject','style','image','text','filter','mask','clipPath','animate','animateTransform','set'].includes(name))throw new Error(`SVG ${name} cannot be converted to editable outlines`);
        if(n.attrs.id){if(ids.has(n.attrs.id))throw new Error('Duplicate SVG identity');ids.set(n.attrs.id,n);}
        for(const [key,v]of Object.entries(n.attrs)){
            if(/^on/i.test(key))throw new Error('SVG event handlers are not accepted');
            if((key==='href'||key==='xlink:href')&&!/^#[^\s]+$/.test(v))throw new Error('External SVG references are not accepted');
            if(['clip-path','mask','filter'].includes(key)&&v!=='none')throw new Error(`SVG ${key} must be flattened before outline import`);
        }for(const c of n.children)index(c);
    }index(root);
    function walk(n,parent,viewport,inherited,refs,referenced=false,depth=0){
        if(++visits>maxElements||depth>64)throw new RangeError('Expanded SVG element budget exceeded');
        const name=local(n),a=n.attrs,style={...inherited};
        for(const key of ['fill','fill-rule','stroke','stroke-width','opacity','visibility','display','fill-opacity','stroke-opacity'])if(a[key]!==undefined)style[key]=a[key];
        if(a.style){for(const declaration of a.style.split(';')){if(!declaration.trim())continue;const pair=/^\s*([\w-]+)\s*:\s*(.*?)\s*$/.exec(declaration);if(!pair||!['fill','fill-rule','stroke','stroke-width','opacity','visibility','display','fill-opacity','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit'].includes(pair[1]))throw new Error('Unsupported SVG inline style');style[pair[1]]=pair[2];}}
        if(style.display==='none')return;
        // display is not inherited; a hidden ancestor already short-circuited.
        delete style.display;
        if(['metadata','title','desc'].includes(name)||name==='defs'&&!referenced||name==='symbol'&&!referenced)return;
        let matrix=mul(parent,parseSVGTransform(a.transform)),vp=viewport;
        if(name==='svg'||name==='symbol'){
            const box=a.viewBox?numbers(a.viewBox):null;
            if(box&&(box.length!==4||box[2]<=0||box[3]<=0))throw new Error('Invalid SVG viewBox');
            const w=length(a.width,viewport?.[0]??box?.[2]??300,viewport?.[0]??300),h=length(a.height,viewport?.[1]??box?.[3]??150,viewport?.[1]??150);
            if(w<0||h<0)throw new Error('Negative SVG viewport size');if(!w||!h)return;
            matrix=mul(matrix,[1,0,0,1,length(a.x,0,viewport?.[0]),length(a.y,0,viewport?.[1])]);
            if(box)matrix=mul(matrix,svgViewportTransform(box,w,h,a.preserveAspectRatio));vp=box?[box[2],box[3]]:[w,h];
            if(a.preserveAspectRatio?.includes('slice')||n!==root)warnings.add('Viewport clipping is not applied to extracted outlines.');
        }
        if(name==='use'){
            const ref=a.href??a['xlink:href'];if(!ref||!ids.has(ref.slice(1)))throw new Error('Missing local SVG reference');
            const target=ids.get(ref.slice(1));if(refs.has(target))throw new Error('Cyclic SVG use reference');const next=new Set(refs);next.add(target);
            matrix=mul(matrix,[1,0,0,1,length(a.x,0,vp?.[0]),length(a.y,0,vp?.[1])]);
            let clone=target;
            if(['symbol','svg'].includes(local(target)))clone={...target,attrs:{...target.attrs,...(a.width?{width:a.width}:{}),...(a.height?{height:a.height}:{})}};
            walk(clone,matrix,vp,style,next,true,depth+1);return;
        }
        const x=(key,def=0)=>length(a[key],def,vp?.[0]),y=(key,def=0)=>length(a[key],def,vp?.[1]);let d=null;
        if(name==='path')d=a.d||'';
        else if(name==='line')d=`M${x('x1')} ${y('y1')}L${x('x2')} ${y('y2')}`;
        else if(name==='polyline'||name==='polygon'){
            const points=numbers(a.points||'');if(points.length%2)throw new Error('SVG points need coordinate pairs');d=points.length?`M${points.join(' ')}${name==='polygon'?'Z':''}`:'';
        }else if(name==='rect'){
            const w=x('width'),h=y('height'),left=x('x'),top=y('y');let rx=x('rx',a.ry!==undefined?y('ry'):0),ry=y('ry',a.rx!==undefined?x('rx'):0);
            if(Math.min(w,h,rx,ry)<0)throw new Error('Negative SVG rectangle size');rx=Math.min(rx,w/2);ry=Math.min(ry,h/2);
            d=!w||!h?'':!rx||!ry?`M${left} ${top}h${w}v${h}h${-w}Z`:`M${left+rx} ${top}H${left+w-rx}A${rx} ${ry} 0 0 1 ${left+w} ${top+ry}V${top+h-ry}A${rx} ${ry} 0 0 1 ${left+w-rx} ${top+h}H${left+rx}A${rx} ${ry} 0 0 1 ${left} ${top+h-ry}V${top+ry}A${rx} ${ry} 0 0 1 ${left+rx} ${top}Z`;
        }else if(name==='circle'||name==='ellipse'){
            const radius=length(a.r,0,Math.hypot(...(vp||[300,150]))/Math.SQRT2),rx=name==='circle'?radius:x('rx'),ry=name==='circle'?radius:y('ry'),cx=x('cx'),cy=y('cy');
            if(rx<0||ry<0)throw new Error('Negative SVG radius');d=!rx||!ry?'':`M${cx+rx} ${cy}A${rx} ${ry} 0 0 1 ${cx-rx} ${cy}A${rx} ${ry} 0 0 1 ${cx+rx} ${cy}Z`;
        }else if(!['svg','g','defs','symbol','a'].includes(name))throw new Error(`Unsupported SVG element ${name}`);
        if(d!==null&&style.visibility!=='hidden'&&style.visibility!=='collapse'){
            if(style.stroke&&style.stroke!=='none')warnings.add('Stroke centerlines are imported; use Expand stroke to create filled outlines.');
            if(style['fill-rule']==='evenodd')warnings.add('Even-odd fill is not baked; use Correct winding for the imported contours.');
            if(Object.keys(style).some(k=>k.includes('opacity')))warnings.add('Opacity is not part of monochrome outline geometry.');
            if(style.fill&& !['black','#000','#000000','none','currentColor'].includes(style.fill))warnings.add('SVG paint colors are not copied to monochrome contours.');
            const cs=fromSVG(d,{maxNodes});total+=cs.reduce((n,c)=>n+c.nodes.length,0);if(total>maxNodes)throw new RangeError('Expanded SVG point budget exceeded');
            transformContours(cs,matrix);for(const c of cs)for(const node of c.nodes)for(const p of [node,node.in,node.out])if(p){finite(p.x);finite(p.y);}for(const c of cs)contours.push(c);
        }
        for(const child of n.children)walk(child,matrix,vp,style,refs,false,depth+1);
    }
    walk(root,ID,null,{},new Set([root]));
    return {contours,warnings:[...warnings],nodeCount:total};
}
