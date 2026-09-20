import {node,contour} from './index.js';
const TAU = Math.PI * 2, MAX = 1e7;
const value = n => { if (!Number.isFinite(n) || Math.abs(n) > MAX) throw new RangeError('SVG coordinate exceeds ±10,000,000'); return n; };
/** Endpoint-parameterized SVG arcs, converted to <=45-degree cubic spans.
 * SVG radius correction and sweep semantics follow SVG 2, Appendix B.
 * Cubics approximate ellipses; straight/quadratic/cubic commands remain exact. */
export function arcToCubics(start,rx,ry,rotation,largeArc,sweep,end) {
    [start.x,start.y,rx,ry,rotation,end.x,end.y].forEach(value);
    if (![0,1].includes(largeArc) || ![0,1].includes(sweep)) throw new RangeError('SVG arc flags must be 0 or 1');
    rx=Math.abs(rx);ry=Math.abs(ry);
    if(start.x===end.x&&start.y===end.y)return [];
    if(!rx||!ry)return [{end:{...end},control1:null,control2:null}];
    const phi=(rotation%360)*Math.PI/180,c=Math.cos(phi),s=Math.sin(phi);
    const dx=(start.x-end.x)/2,dy=(start.y-end.y)/2;
    const x=c*dx+s*dy,y=-s*dx+c*dy;
    const correction=Math.hypot(x/rx,y/ry);
    if(correction>1){rx*=correction;ry*=correction;}
    value(rx);value(ry);
    const ux=x/rx,uy=y/ry,norm=ux*ux+uy*uy;
    if(!Number.isFinite(norm)||norm===0)throw new RangeError('SVG arc exceeds floating-point resolution');
    const factor=(largeArc===sweep?-1:1)*Math.sqrt(Math.max(0,1-norm))/Math.sqrt(norm);
    const cxp=factor*rx*uy,cyp=-factor*ry*ux;
    const cx=c*cxp-s*cyp+(start.x+end.x)/2,cy=s*cxp+c*cyp+(start.y+end.y)/2;
    const ax=(x-cxp)/rx,ay=(y-cyp)/ry,bx=(-x-cxp)/rx,by=(-y-cyp)/ry;
    const theta=Math.atan2(ay,ax);let delta=Math.atan2(ax*by-ay*bx,ax*bx+ay*by);
    if(!sweep&&delta>0)delta-=TAU;else if(sweep&&delta<0)delta+=TAU;
    const count=Math.max(1,Math.ceil(Math.abs(delta)/(Math.PI/4))),step=delta/count;
    const at=t=>({x:cx+rx*c*Math.cos(t)-ry*s*Math.sin(t),y:cy+rx*s*Math.cos(t)+ry*c*Math.sin(t)});
    const derivative=t=>({x:-rx*c*Math.sin(t)-ry*s*Math.cos(t),y:-rx*s*Math.sin(t)+ry*c*Math.cos(t)});
    const result=[];
    for(let i=0;i<count;i++){
        const a=theta+i*step,b=a+step,k=4/3*Math.tan(step/4),p=at(a),q=at(b),u=derivative(a),v=derivative(b);
        const control1={x:p.x+k*u.x,y:p.y+k*u.y},control2={x:q.x-k*v.x,y:q.y-k*v.y};
        for(const point of [control1,control2,q]){value(point.x);value(point.y);}
        result.push({control1,control2,end:i===count-1?{...end}:q});
    }
    return result;
}
/** Strict complete SVG path command grammar, with bounded linear-time scanning. */
export function parseSVGPath(source,{maxNodes=250000}={}) {
    if(typeof source!=='string'||source.length>16*1024*1024)throw new RangeError('SVG path byte budget exceeded');
    if(!Number.isInteger(maxNodes)||maxNodes<1||maxNodes>250000)throw new RangeError('Invalid SVG node budget');
    let i=0,command='',previous='',p={x:0,y:0},start={...p},current=null,control=null,nodes=0,moved=false,comma=false;
    const result=[],pattern=/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
    const ws=()=>{while(i<source.length&&/[\t\n\r ]/.test(source[i]))i++;};
    function number(flag=false){ws();if(source[i]===','){if(!comma)throw new SyntaxError('Unexpected SVG comma');i++;ws();}
        let n;if(flag){const ch=source[i++];if(ch!=='0'&&ch!=='1')throw new SyntaxError('SVG arc flags must be 0 or 1');n=Number(ch);}
        else {pattern.lastIndex=i;const m=pattern.exec(source);if(!m)throw new SyntaxError(`Expected SVG number at ${i}`);i=pattern.lastIndex;n=value(Number(m[0]));}
        comma=true;return n;
    }
    function add(q,inHandle=null){if(++nodes>maxNodes)throw new RangeError('SVG point limit exceeded');value(q.x);value(q.y);const n=node(q.x,q.y,{in:inHandle});current.nodes.push(n);p=q;return n;}
    while(true){ws();if(i===source.length)break;
        if(/[a-zA-Z]/.test(source[i])){command=source[i++];comma=false;}
        if(!command)throw new SyntaxError(`SVG path needs a command at ${i}`);
        const C=command.toUpperCase(),relative=C!==command,old={...p};
        const point=()=>({x:value(number()+(relative?old.x:0)),y:value(number()+(relative?old.y:0))});
        if(!moved&&C!=='M')throw new SyntaxError('SVG path must start with moveto');
        if(C==='M'){
            const q=point();current=contour([],false);result.push(current);add(q);start={...q};moved=true;command=relative?'l':'L';
        }else if(C==='Z'){
            if(current){current.closed=true;const first=current.nodes[0],last=current.nodes.at(-1);
                if(current.nodes.length>1&&first.x===last.x&&first.y===last.y){first.in=last.in;current.nodes.pop();}}
            current=null;p={...start};command='';comma=false;
        }else {
            if(!'LHVCQS TA'.replaceAll(' ','').includes(C))throw new SyntaxError(`Unsupported SVG command ${C}`);
            if(!current){current=contour([],false);result.push(current);add({...p});start={...p};}
            const last=current.nodes.at(-1);
            if(C==='L')add(point());
            else if(C==='H')add({x:value(number()+(relative?old.x:0)),y:old.y});
            else if(C==='V')add({x:old.x,y:value(number()+(relative?old.y:0))});
            else if(C==='C'||C==='S'){
                const a=C==='C'?point():['C','S'].includes(previous)?{x:2*old.x-control.x,y:2*old.y-control.y}:{...old};
                const b=point(),q=point();last.out=a;add(q,b);control=b;
            }else if(C==='Q'||C==='T'){
                const a=C==='Q'?point():['Q','T'].includes(previous)?{x:2*old.x-control.x,y:2*old.y-control.y}:{...old};
                const q=point();last.out={x:old.x+(a.x-old.x)*2/3,y:old.y+(a.y-old.y)*2/3};add(q,{x:q.x+(a.x-q.x)*2/3,y:q.y+(a.y-q.y)*2/3});control=a;
            }else if(C==='A'){
                const rx=number(),ry=number(),rotation=number(),large=number(true),sweep=number(true),q=point();
                for(const span of arcToCubics(old,rx,ry,rotation,large,sweep,q)){
                    if(span.control1)current.nodes.at(-1).out=span.control1;
                    add(span.end,span.control2);
                }
            }
        }
        previous=C;
    }
    // Include reflected handles in the same numeric contract as explicit points.
    for(const c of result)for(const n of c.nodes)for(const q of [n.in,n.out])if(q){value(q.x);value(q.y);}
    return result;
}
