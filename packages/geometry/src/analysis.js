import {segments, bounds, splitCubic, cubicAt, cubicDerivative} from './index.js';
const cross = (a,b) => a.x*b.y-a.y*b.x;
const derivative = p => p.slice(1).map((v,i)=>v*(i+1));
const product = (a,b) => {const c=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>c[i+j]+=x*y));return c;};
const integral = p => p.reduce((sum,v,i)=>sum+v/(i+1),0);
const poly = (p0,p1,p2,p3) => [p0,3*(p1-p0),3*(p0-2*p1+p2),p3-p0+3*(p1-p2)];
function options(value={}) {
    const o={tolerance:.001,maxDepth:22,maxSubdivisions:100000,maxSegments:20000,...value};
    if(!Number.isFinite(o.tolerance)||o.tolerance<=0||o.tolerance>1e6)throw new RangeError('Length tolerance must be positive and finite');
    for(const [k,max] of [['maxDepth',26],['maxSubdivisions',1000000],['maxSegments',100000]])if(!Number.isInteger(o[k])||o[k]<1||o[k]>max)throw new RangeError(`Invalid ${k} budget`);
    return o;
}
function validate(contours,o) {
    if(!Array.isArray(contours)||contours.length>o.maxSegments)throw new RangeError('Contour budget exceeded');
    let edges=0;
    for(const c of contours){
        if(!c||!Array.isArray(c.nodes)||typeof c.closed!=='boolean')throw new TypeError('Expected an endpoint contour');
        edges+=Math.max(0,c.nodes.length-(c.closed?0:1));
        if(edges>o.maxSegments||c.nodes.length>o.maxSegments)throw new RangeError('Segment budget exceeded');
        for(const n of c.nodes)for(const p of [n,n.in,n.out])if(p&&![p.x,p.y].every(x=>Number.isFinite(x)&&Math.abs(x)<=1e9))throw new RangeError('Analysis coordinates must be finite and within ±1e9');
    }
    return edges;
}
/** Chord/control-polygon bounds, refined by de Casteljau. No quadrature error is hidden. */
function arc(points,tolerance,o,state,depth=0) {
    const low=Math.hypot(points[3].x-points[0].x,points[3].y-points[0].y);
    const high=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);
    if(high-low<=2*tolerance||depth>=o.maxDepth||state.splits>=o.maxSubdivisions)return {low,high};
    state.splits++;
    const [a,b]=splitCubic(...points),l=arc(a,tolerance/2,o,state,depth+1),r=arc(b,tolerance/2,o,state,depth+1);
    return {low:l.low+r.low,high:l.high+r.high};
}
function inflections(s) {
    if(!s.curve)return [];
    const x=poly(s.p0.x,s.p1.x,s.p2.x,s.p3.x),y=poly(s.p0.y,s.p1.y,s.p2.y,s.p3.y);
    const a={x:x[3],y:y[3]},b={x:x[2],y:y[2]},c={x:x[1],y:y[1]};
    const A=-6*cross(a,b),B=6*cross(c,a),C=2*cross(c,b),scale=Math.max(Math.abs(A),Math.abs(B),Math.abs(C));
    if(scale===0)return [];
    const aa=A/scale,bb=B/scale,cc=C/scale,roots=[];
    if(Math.abs(aa)<1e-14){if(Math.abs(bb)>1e-14)roots.push(-cc/bb);}
    else {const d=bb*bb-4*aa*cc;if(d>0){const q=-.5*(bb+Math.sign(bb||1)*Math.sqrt(d));roots.push(q/aa,cc/q);}}
    return roots.filter(t=>t>0&&t<1&&segmentProperties(s,t).curvature!==null).sort((a,b)=>a-b);
}
/** Position, tangent and signed curvature in font-space (undefined at a cusp). */
export function segmentProperties(s,t) {
    if(!Number.isFinite(t)||t<0||t>1)throw new RangeError('Curve parameter must be within 0…1');
    if(!s?.p0||!s.p3)throw new TypeError('Expected an outline segment');
    for(const p of s.curve?[s.p0,s.p1,s.p2,s.p3]:[s.p0,s.p3])if(!p||![p.x,p.y].every(Number.isFinite))throw new TypeError('Expected finite control points');
    const position=s.curve?cubicAt(s.p0,s.p1,s.p2,s.p3,t):{x:s.p0.x+(s.p3.x-s.p0.x)*t,y:s.p0.y+(s.p3.y-s.p0.y)*t};
    const d=s.curve?cubicDerivative(s.p0,s.p1,s.p2,s.p3,t):{x:s.p3.x-s.p0.x,y:s.p3.y-s.p0.y};
    const dd=s.curve?{x:6*((1-t)*(s.p2.x-2*s.p1.x+s.p0.x)+t*(s.p3.x-2*s.p2.x+s.p1.x)),y:6*((1-t)*(s.p2.y-2*s.p1.y+s.p0.y)+t*(s.p3.y-2*s.p2.y+s.p1.y))}:{x:0,y:0};
    const speed=Math.hypot(d.x,d.y),curvature=speed>1e-12?cross(d,dd)/(speed**3):null;
    return {position,speed,tangent:speed>1e-12?{x:d.x/speed,y:d.y/speed}:null,curvature,radius:curvature===null||Math.abs(curvature)<1e-15?null:1/Math.abs(curvature)};
}
/** Algebraic Green-integral moments; open paths do not acquire an implicit closing edge. */
export function analyzeContours(contours,settings={}) {
    const o=options(settings),count=validate(contours,o),state={splits:0},tolerance=o.tolerance/Math.max(count,1);
    const rows=contours.map(c=>{
        const origin=c.nodes[0]||{x:0,y:0};let twiceArea=0,momentX=0,momentY=0,low=0,high=0;
        const edges=[...segments(c)].map(s=>{
            const ps=[s.p0,s.p1,s.p2,s.p3].map(p=>({x:p.x-origin.x,y:p.y-origin.y}));
            const x=s.curve?poly(...ps.map(p=>p.x)):[ps[0].x,ps[3].x-ps[0].x];
            const y=s.curve?poly(...ps.map(p=>p.y)):[ps[0].y,ps[3].y-ps[0].y];
            if(c.closed){twiceArea+=integral(product(x,derivative(y)))-integral(product(y,derivative(x)));momentX+=integral(product(product(x,x),derivative(y)));momentY-=integral(product(product(y,y),derivative(x)));}
            const len=s.curve?arc(ps,tolerance,o,state):{low:Math.hypot(x[1],y[1]),high:Math.hypot(x[1],y[1])};low+=len.low;high+=len.high;
            return {index:s.index,curve:s.curve,length:(len.low+len.high)/2,lengthBounds:[len.low,len.high],inflections:inflections(s)};
        });
        const area=c.closed?twiceArea/2:null;
        const centroid=area!==null&&Math.abs(area)>1e-12?{x:origin.x+momentX/(2*area),y:origin.y+momentY/(2*area)}:null;
        return {id:c.id,closed:c.closed,bounds:bounds([c]),signedArea:area,centroid,orientation:area===null?'open':Math.abs(area)<1e-12?'degenerate':area>0?'counterclockwise':'clockwise',length:(low+high)/2,lengthBounds:[low,high],segments:edges};
    });
    const signedArea=rows.reduce((sum,r)=>sum+(r.signedArea||0),0),low=rows.reduce((s,r)=>s+r.lengthBounds[0],0),high=rows.reduce((s,r)=>s+r.lengthBounds[1],0);
    const centroid=Math.abs(signedArea)>1e-12?rows.reduce((s,r)=>{if(r.centroid){s.x+=r.centroid.x*r.signedArea/signedArea;s.y+=r.centroid.y*r.signedArea/signedArea;}return s;},{x:0,y:0}):null;
    return {contours:rows,bounds:bounds(contours),segmentCount:count,signedArea,centroid,length:(low+high)/2,lengthBounds:[low,high],lengthErrorBound:(high-low)/2,converged:high-low<=2*o.tolerance*(1+1e-8),subdivisions:state.splits};
}
