import {node, contour, segments, splitSegment, reverseContour, distance, uid, mix, rectangle} from '@wieslawsoltes/counterform-geometry';
const finite = (...v) => { if (v.some(x => !Number.isFinite(x) || Math.abs(x)>1e7)) throw new RangeError('Expected finite font-unit values within ±10,000,000'); };
const copy = c => structuredClone(c);
const unique = c => { c.id=uid('c');c.nodes.forEach(n=>n.id=uid());return c; };
/** Clockwise polygon/alternating-radius star. Inputs and node counts are bounded. */
export function polygon(cx,cy,rx,ry,sides=6,inner=1,rotation=Math.PI/2) {
    finite(cx,cy,rx,ry,inner,rotation);
    if (!Number.isInteger(sides)||sides<3||sides>128||rx<0||ry<0||inner<=0||inner>1) throw new RangeError('Polygon: 3–128 sides, nonnegative radii, inner ratio (0,1]');
    const count=inner===1?sides:sides*2;
    return contour(Array.from({length:count},(_,i)=>{const a=rotation-2*Math.PI*i/count,r=i%2?inner:1;return node(cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r);}));
}
export function roundedRectangle(x,y,w,h,radius=30) {
    finite(x,y,w,h,radius); if(w<0||h<0||radius<0) throw new RangeError('Negative dimensions');
    const r=Math.min(radius,w/2,h/2),k=.5522847498307936*r;if(r===0)return rectangle(x,y,w,h);
    const ns=[node(x+r,y),node(x,y+r),node(x,y+h-r),node(x+r,y+h),node(x+w-r,y+h),node(x+w,y+h-r),node(x+w,y+r),node(x+w-r,y)];
    for(const [a,b,p,q] of [[0,1,{x:x+r-k,y},{x,y:y+r-k}],[2,3,{x,y:y+h-r+k},{x:x+r-k,y:y+h}],[4,5,{x:x+w-r+k,y:y+h},{x:x+w,y:y+h-r+k}],[6,7,{x:x+w,y:y+r-k},{x:x+w-r+k,y}]]) {ns[a].out=p;ns[b].in=q;ns[a].smooth=ns[b].smooth=true;}
    return contour(ns);
}
function segmentDistance(p,a,b) {const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/den)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
/** Iterative Ramer–Douglas–Peucker simplification, retaining pressure and endpoints. */
export function simplifyPolyline(points,tolerance=1) {
    finite(tolerance);if(tolerance<=0||points.length>8192) throw new RangeError('Positive tolerance and at most 8192 samples required');
    points.forEach(p=>finite(p.x,p.y,p.pressure??.5));
    if(points.length<3)return points.map(p=>({...p}));
    const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
    const stack=[[0,points.length-1]];
    while(stack.length) {const [a,b]=stack.pop();let max=tolerance,index=-1;for(let i=a+1;i<b;i++){const d=segmentDistance(points[i],points[a],points[b]);if(d>max){max=d;index=i;}}
        if(index>=0){keep[index]=1;stack.push([a,index],[index,b]);}}
    return points.filter((_,i)=>keep[i]).map(p=>({...p}));
}
/** Pressure-sensitive polyline outline with bounded miter joins and flat end caps. */
export function strokePolyline(points,width=40,{miterLimit=4}={}) {
    finite(width,miterLimit);if(width<=0||width>10000||miterLimit<1||miterLimit>16||points.length>8192)throw new RangeError('Invalid stroke dimensions/sample budget');
    const ps=[];for(const p of points){finite(p.x,p.y,p.pressure??.5);if(!ps.length||distance(ps.at(-1),p)>1e-6)ps.push(p);}
    if(ps.length<2)return contour([]);
    const normals=ps.slice(1).map((p,i)=>{const a=ps[i],d=distance(a,p);return {x:-(p.y-a.y)/d,y:(p.x-a.x)/d};});
    const left=[],right=[];
    ps.forEach((p,i)=>{const a=normals[Math.max(0,i-1)],b=normals[Math.min(i,normals.length-1)];let nx=a.x+b.x,ny=a.y+b.y,len=Math.hypot(nx,ny);
        if(len<1e-6){nx=b.x;ny=b.y;len=1;}nx/=len;ny/=len;
        const half=width/2*Math.max(.1,Math.min(1,(p.pressure??.5)*2));
        const m=Math.min(miterLimit,1/Math.max(.01,nx*b.x+ny*b.y))*half;
        left.push(node(p.x+nx*m,p.y+ny*m));right.push(node(p.x-nx*m,p.y-ny*m));});
    return contour([...left,...right.reverse()]);
}
/** Open a closed contour at a node without losing its final cubic edge. */
export function openContourAt(source,index) {
    if(!source.closed||!Number.isInteger(index)||index<0||index>=source.nodes.length) throw new RangeError('Choose a node on a closed contour');
    const c=copy(source);c.closed=false;c.nodes=[...c.nodes.slice(index),...c.nodes.slice(0,index)];
    const end={...structuredClone(c.nodes[0]),id:uid(),out:null};c.nodes[0].in=null;c.nodes.push(end);return c;
}
/** Scissors preserve the original curve exactly; non-interior open endpoints are rejected. */
export function cutContourAt(source,index,t=.5) {
    finite(t);if(t<0||t>1)throw new RangeError('Segment parameter must be in [0,1]');const c=copy(source);const s=[...segments(c)][index];if(!s)throw new RangeError('Unknown segment');
    let at;
    if(t<=1e-6) at=index;else if(t>=1-1e-6) at=(index+1)%c.nodes.length;else {splitSegment(c,index,t);at=index+1;}
    if(c.closed)return [openContourAt(c,at)];
    if(at===0||at===c.nodes.length-1)throw new RangeError('Cut inside an open contour, not at its endpoint');
    const a=unique(contour(c.nodes.slice(0,at+1),false)),b=unique(contour(structuredClone(c.nodes.slice(at)),false));a.nodes.at(-1).out=null;b.nodes[0].in=null;return [a,b];
}
/** Join the requested endpoints of two open contours, preserving all existing edges. */
export function joinContours(first,firstEnd,second,secondEnd) {
    if(first.closed||second.closed||first.nodes.length<1||second.nodes.length<1||![0,first.nodes.length-1].includes(firstEnd)||![0,second.nodes.length-1].includes(secondEnd))throw new RangeError('Select endpoints of two open contours');
    const a=copy(first),b=copy(second);if(firstEnd===0)reverseContour(a);if(secondEnd!==0)reverseContour(b);
    a.nodes.at(-1).out=null;b.nodes[0].in=null;
    if(distance(a.nodes.at(-1),b.nodes[0])<1e-8){a.nodes.at(-1).out=b.nodes[0].out;b.nodes.shift();}
    a.nodes.push(...b.nodes);return unique(a);
}
function quadraticRoots(a,b,c){if(Math.abs(a)<1e-12)return Math.abs(b)<1e-12?[]:[-c/b];const d=b*b-4*a*c;if(d<0)return[];const q=-.5*(b+Math.sign(b||1)*Math.sqrt(d));return q===0?[-b/(2*a)]:[q/a,c/q];}
/** Cubic/finite-line intersections from monotone polynomial intervals; no outline flattening. */
export function lineIntersections(source,a,b) {
    finite(a.x,a.y,b.x,b.y);const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;if(den<1e-12)throw new RangeError('Knife stroke must have length');
    const cross=p=>((p.x-a.x)*dy-(p.y-a.y)*dx)/Math.sqrt(den),result=[];
    const add=(s,t,tangent=false)=>{let p;
        if(s.curve){const u=1-t;p={x:u*u*u*s.p0.x+3*u*u*t*s.p1.x+3*u*t*t*s.p2.x+t*t*t*s.p3.x,y:u*u*u*s.p0.y+3*u*u*t*s.p1.y+3*u*t*t*s.p2.y+t*t*t*s.p3.y};}
        else p=mix(s.p0,s.p3,t);
        const along=((p.x-a.x)*dx+(p.y-a.y)*dy)/den;
        if(along < -1e-9 || along > 1+1e-9)return;
        if(tangent&&t>1e-7&&t<1-1e-7)throw new RangeError('Tangent knife cut is ambiguous');
        if(t<1e-7||t>1-1e-7)throw new RangeError('Knife through a node is ambiguous; offset the stroke slightly');
        result.push({index:s.index,t,point:p});
    };
    for(const s of segments(source)) {
        const q=[cross(s.p0),cross(s.p1),cross(s.p2),cross(s.p3)];
        if(!s.curve){if(Math.abs(q[0]-q[3])<1e-10){if(Math.abs(q[0])<1e-8){const u=((s.p0.x-a.x)*dx+(s.p0.y-a.y)*dy)/den,v=((s.p3.x-a.x)*dx+(s.p3.y-a.y)*dy)/den;if(Math.max(u,v)>=0&&Math.min(u,v)<=1)throw new RangeError('Knife overlaps an edge');}continue;}const t=q[0]/(q[0]-q[3]);if(t>=0&&t<=1)add(s,t);continue;}
        const A=-q[0]+3*q[1]-3*q[2]+q[3],B=3*(q[0]-2*q[1]+q[2]),C=3*(q[1]-q[0]),D=q[0],value=t=>((A*t+B)*t+C)*t+D;
        const stops=[0,...quadraticRoots(3*A,2*B,C).filter(t=>t>0&&t<1),1].sort((x,y)=>x-y);
        for(const t of stops)if(Math.abs(value(t))<1e-8){add(s,t,true);}
        for(let i=0;i<stops.length-1;i++) {let lo=stops[i],hi=stops[i+1],vl=value(lo),vh=value(hi);if(vl*vh>=0)continue;for(let j=0;j<54;j++){const mid=(lo+hi)/2,vm=value(mid);if(vl*vm<=0){hi=mid;vh=vm;}else{lo=mid;vl=vm;}}add(s,(lo+hi)/2);}
    }
    return result;
}
/** A two-crossing cut produces two closed cubic contours. Ambiguous cuts fail atomically. */
export function knifeContour(source,a,b) {
    if(!source.closed)throw new RangeError('Knife requires closed contours; use Scissors for open paths');
    const hits=lineIntersections(source,a,b);if(hits.length===0)return[copy(source)];
    if(hits.length!==2)throw new RangeError('Knife requires exactly two transverse crossings per contour');
    const c=copy(source),cuts=[];let lastIndex=-1,end=1;
    for(const hit of [...hits].sort((a,b)=>b.index-a.index||b.t-a.t)) {if(lastIndex!==hit.index)end=1;const n=splitSegment(c,hit.index,hit.t/end);cuts.push(n.id);end=hit.t;lastIndex=hit.index;}
    const [i,j]=cuts.map(id=>c.nodes.findIndex(n=>n.id===id)).sort((a,b)=>a-b);
    const arcs=[c.nodes.slice(i,j+1),[...c.nodes.slice(j),...c.nodes.slice(0,i+1)]];
    return arcs.map(ns=>{const result=unique(contour(structuredClone(ns),true));result.nodes[0].in=null;result.nodes.at(-1).out=null;return result;});
}
export function convertSegments(source,curve,selected=null) {
    const c=copy(source);for(const s of segments(c)) {if(curve&&s.curve)continue;if(selected?.size&&!selected.has(s.a.id)&&!selected.has(s.b.id))continue;
        s.a.out=curve?mix(s.a,s.b,1/3):null;s.b.in=curve?mix(s.a,s.b,2/3):null;s.a.smooth=s.b.smooth=false;}
    return c;
}
export function distributeNodes(contours,selection,axis) {
    if(!['x','y'].includes(axis))throw new RangeError('Axis must be x or y');
    const ns=contours.flatMap(c=>c.nodes).filter(n=>selection.has(n.id)).sort((a,b)=>a[axis]-b[axis]);
    if(ns.length<3)return;const start=ns[0][axis],step=(ns.at(-1)[axis]-start)/(ns.length-1);
    ns.forEach((n,i)=>{const delta=start+i*step-n[axis];n[axis]+=delta;if(n.in)n.in[axis]+=delta;if(n.out)n.out[axis]+=delta;});
}
