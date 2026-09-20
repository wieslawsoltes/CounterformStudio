/** Conservative cubic fitting: every accepted span is bounded against the whole
 * input polyline, not just sampled vertices. No DOM, native or font dependency. */
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const mul=(a,k)=>({x:a.x*k,y:a.y*k});
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const length=a=>Math.hypot(a.x,a.y);
const mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const unit=a=>{const n=length(a);return n?{x:a.x/n,y:a.y/n}:{x:1,y:0};};
function split(q,t){const a=mix(q[0],q[1],t),b=mix(q[1],q[2],t),c=mix(q[2],q[3],t),d=mix(a,b,t),e=mix(b,c,t),f=mix(d,e,t);return [[q[0],a,d,f],[f,e,c,q[3]]];}
const line=(a,b)=>[a,mix(a,b,1/3),mix(a,b,2/3),b];
function candidate(p,lo,hi,u){
    const a=p[lo],b=p[hi],t0=unit(sub(p[lo+1],a)),t1=unit(sub(p[hi-1],b));
    let c00=0,c01=0,c11=0,x0=0,x1=0;
    for(let i=lo;i<=hi;i++){
        const t=u[i-lo],s=1-t,b1=3*s*s*t,b2=3*s*t*t;
        const v0=mul(t0,b1),v1=mul(t1,b2),r=sub(p[i],add(mul(a,s*s*s+b1),mul(b,b2+t*t*t)));
        c00+=dot(v0,v0);c01+=dot(v0,v1);c11+=dot(v1,v1);x0+=dot(v0,r);x1+=dot(v1,r);
    }
    const det=c00*c11-c01*c01,dist=length(sub(b,a));
    let h0=det>1e-15?(x0*c11-x1*c01)/det:dist/3,h1=det>1e-15?(x1*c00-x0*c01)/det:dist/3;
    if(!(h0>dist*1e-6&&h1>dist*1e-6)||h0>dist*4||h1>dist*4)h0=h1=dist/3;
    return [a,add(a,mul(t0,h0)),add(b,mul(t1,h1)),b];
}
/** Bounding the difference's Bézier control hull gives a continuous error bound
 * under the chord-length correspondence, hence a two-sided Hausdorff upper bound. */
function errorBound(q,p,lo,hi,u,budget){
    let max=0,index=Math.floor((lo+hi)/2),remaining=q;
    for(let i=lo;i<hi;i++){
        if(++budget.used>budget.max)throw new RangeError('Curve fitting work budget exceeded');
        const previous=u[i-lo],end=u[i-lo+1],fraction=previous<1?(end-previous)/(1-previous):0;
        const [span,tail]=i===hi-1?[remaining,remaining]:split(remaining,Math.max(0,Math.min(1,fraction)));
        remaining=tail;
        const l=line(p[i],p[i+1]);
        const bound=Math.max(...span.map((v,j)=>length(sub(v,l[j]))));
        if(!Number.isFinite(bound))throw new RangeError('Unstable numeric curve fitting bound');
        if(bound>max){max=bound;index=i+1;}
    }
    return {error:max,index};
}
function number(value,min,max,name){if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(`${name} must be ${min}..${max}`);return value;}
export function fitPolyline(points,{tolerance=.35,closed=false,idPrefix='fit',maxPoints=100000,maxWork=8000000}={}){
    number(tolerance,0,10000,'tolerance');
    if(!Number.isInteger(maxPoints)||maxPoints<2||maxPoints>1000000||!Number.isInteger(maxWork)||maxWork<1||maxWork>50000000)throw new RangeError('Invalid fitting budget');
    if(typeof closed!=='boolean'||typeof idPrefix!=='string'||idPrefix.length>128)throw new TypeError('Invalid fitting options');
    if(!Array.isArray(points)||points.length>maxPoints)throw new RangeError('Invalid polyline or point budget');
    const p=[];
    for(const v of points){if(!v||!Number.isFinite(v.x)||!Number.isFinite(v.y)||Math.max(Math.abs(v.x),Math.abs(v.y))>1e7)throw new RangeError('Invalid polyline coordinate');if(!p.length||v.x!==p.at(-1).x||v.y!==p.at(-1).y)p.push({x:v.x,y:v.y});}
    if(closed&&p.length>1&&p[0].x===p.at(-1).x&&p[0].y===p.at(-1).y)p.pop();
    if(p.length<(closed?3:2))throw new RangeError('Not enough distinct polyline points');
    // Remove exactly collinear vertices only. A reversal is never discarded.
    const compact=[];
    for(const v of p){while(compact.length>1){const a=sub(compact.at(-1),compact.at(-2)),b=sub(v,compact.at(-1));if(a.x*b.y-a.y*b.x!==0||dot(a,b)<0)break;compact.pop();}compact.push(v);}
    if(closed)compact.push({...compact[0]});
    const spans=[],budget={used:0,max:maxWork};let bound=0;
    const work=[];
    // Four topological spans avoid coincident endpoints in closed least squares.
    if(closed){const last=compact.length-1,n=Math.min(4,last);for(let i=n-1;i>=0;i--)work.push([Math.floor(last*i/n),Math.floor(last*(i+1)/n)]);}
    else work.push([0,compact.length-1]);
    while(work.length){
        const [lo,hi]=work.pop();if(lo===hi)continue;
        if(hi-lo===1){spans.push({q:line(compact[lo],compact[hi]),straight:true});continue;}
        const u=[0];for(let i=lo+1;i<=hi;i++)u.push(u.at(-1)+length(sub(compact[i],compact[i-1])));
        const total=u.at(-1);for(let i=1;i<u.length;i++)u[i]/=total;
        const q=candidate(compact,lo,hi,u),e=errorBound(q,compact,lo,hi,u,budget);
        if(e.error<=tolerance){spans.push({q,straight:false});bound=Math.max(bound,e.error);}
        else{const quarter=Math.max(1,Math.floor((hi-lo)/4)),at=Math.max(lo+quarter,Math.min(hi-quarter,e.index));work.push([at,hi],[lo,at]);}
        if(spans.length+work.length>maxPoints)throw new RangeError('Fitted output point budget exceeded');
    }
    const nodes=[{id:`${idPrefix}-n0`,...spans[0].q[0],in:null,out:null,smooth:false}];
    for(const {q,straight}of spans){const previous=nodes.at(-1);if(!straight)previous.out={...q[1]};nodes.push({id:`${idPrefix}-n${nodes.length}`,...q[3],in:straight?null:{...q[2]},out:null,smooth:false});}
    if(closed){nodes[0].in=nodes.at(-1).in;nodes.pop();}
    for(const n of nodes)if(n.in&&n.out){const a=sub(n,n.in),b=sub(n.out,n);n.smooth=dot(a,b)>0&&Math.abs(a.x*b.y-a.y*b.x)<=1e-6*length(a)*length(b);}
    return {contour:{id:`${idPrefix}-c`,closed,nodes},errorBound:bound,inputPoints:p.length,work:budget.used};
}
