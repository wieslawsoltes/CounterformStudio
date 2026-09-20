export {fitPolyline} from './fit.js';
import {fitPolyline} from './fit.js';
export const TRACE_LIMITS=Object.freeze({maxPixels:4194304,maxDimension:4096,maxEdges:500000,maxContours:10000,maxPoints:250000});
function integer(v,lo,hi,name){if(!Number.isInteger(v)||v<lo||v>hi)throw new RangeError(`${name} must be an integer in ${lo}..${hi}`);return v;}
export function validateRaster(image){
    if(!image||typeof image!=='object')throw new TypeError('Expected RGBA raster');
    const {width,height,pixels}=image;
    integer(width,1,TRACE_LIMITS.maxDimension,'width');integer(height,1,TRACE_LIMITS.maxDimension,'height');
    if(width*height>TRACE_LIMITS.maxPixels)throw new RangeError('Raster pixel budget exceeded');
    if(!(pixels instanceof Uint8Array||pixels instanceof Uint8ClampedArray)||pixels.length!==width*height*4)throw new TypeError('Expected exactly width × height × 4 unpremultiplied RGBA bytes');
    return image;
}
/** Maximum between-class variance; the threshold is inclusive on the ink side. */
export function otsuThreshold(histogram){
    if(!histogram||histogram.length!==256)throw new TypeError('Expected 256 histogram bins');
    let total=0,sum=0;for(let i=0;i<256;i++){const n=histogram[i];if(!Number.isSafeInteger(n)||n<0)throw new RangeError('Invalid histogram count');total+=n;sum+=n*i;}
    if(total>TRACE_LIMITS.maxPixels)throw new RangeError('Histogram budget exceeded');
    let left=0,leftSum=0,best=-1,first=127,last=127;
    for(let i=0;i<255;i++){left+=histogram[i];leftSum+=histogram[i]*i;if(!left)continue;const right=total-left;if(!right)break;const delta=leftSum/left-(sum-leftSum)/right,score=left*right*delta*delta;
        if(score>best){best=score;first=last=i;}else if(score===best)last=i;
    }
    return best<0?127:Math.floor((first+last)/2);
}
export function thresholdRaster(image,{threshold=null,invert=false}={}){
    validateRaster(image);if(threshold!==null)integer(threshold,0,255,'threshold');if(typeof invert!=='boolean')throw new TypeError('invert must be Boolean');
    const {width,height,pixels}=image,gray=new Uint8Array(width*height),histogram=new Uint32Array(256);
    for(let i=0;i<gray.length;i++){const p=i*4,a=pixels[p+3]/255;const y=Math.round((.2126*pixels[p]+.7152*pixels[p+1]+.0722*pixels[p+2])*a+255*(1-a));gray[i]=y;histogram[y]++;}
    const value=threshold??otsuThreshold(histogram),mask=new Uint8Array(gray.length);let inkPixels=0;
    for(let i=0;i<gray.length;i++){mask[i]=Number(invert?gray[i]>value:gray[i]<=value);inkPixels+=mask[i];}
    return {width,height,mask,threshold:value,inkPixels};
}
function despeckle(mask,w,h,minimum){
    if(minimum<2)return 0;
    const seen=new Uint8Array(mask.length),queue=new Uint32Array(mask.length);let removed=0;
    for(let start=0;start<mask.length;start++){
        if(!mask[start]||seen[start])continue;let head=0,tail=1;queue[0]=start;seen[start]=1;
        while(head<tail){const i=queue[head++],x=i%w;for(const j of [x?i-1:-1,x<w-1?i+1:-1,i-w,i+w])if(j>=0&&j<mask.length&&mask[j]&&!seen[j]){seen[j]=1;queue[tail++]=j;}}
        if(tail<minimum){removed+=tail;for(let k=0;k<tail;k++)mask[queue[k]]=0;}
    }
    return removed;
}
function signedArea(p){let n=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];n+=a.x*b.y-b.x*a.y;}return n/2;}
function simplifyCollinear(points){
    const out=[];for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];if((b.x-a.x)*(c.y-b.y)!==(b.y-a.y)*(c.x-b.x))out.push(b);}return out;
}
/** Exact oriented pixel-cell boundaries. Four-connected ink stays disconnected
 * at a diagonal saddle; background uses the complementary eight-connectivity. */
export function traceMask(input,{minComponentPixels=0,maxEdges=TRACE_LIMITS.maxEdges,maxContours=TRACE_LIMITS.maxContours,curves=false,tolerance=.35,idPrefix='trace'}={}){
    const {width:w,height:h}=input??{};integer(w,1,TRACE_LIMITS.maxDimension,'width');integer(h,1,TRACE_LIMITS.maxDimension,'height');
    if(w*h>TRACE_LIMITS.maxPixels||!(input.mask instanceof Uint8Array)||input.mask.length!==w*h)throw new RangeError('Invalid mask dimensions or pixel budget');
    integer(minComponentPixels,0,TRACE_LIMITS.maxPixels,'minimum component pixels');integer(maxEdges,4,TRACE_LIMITS.maxEdges,'maxEdges');integer(maxContours,1,TRACE_LIMITS.maxContours,'maxContours');
    if(typeof curves!=='boolean'||!Number.isFinite(tolerance)||tolerance<0||tolerance>8||typeof idPrefix!=='string'||idPrefix.length>100)throw new RangeError('Invalid trace options');
    const mask=input.mask.slice();for(const b of mask)if(b!==0&&b!==1)throw new TypeError('Mask entries must be 0 or 1');
    const removedPixels=despeckle(mask,w,h,minComponentPixels),stride=w+1,edges=new Uint8Array(stride*(h+1));let edgeCount=0,inkPixels=0;
    function edge(x,y,d){if(++edgeCount>maxEdges)throw new RangeError('Trace boundary budget exceeded; increase despeckling or reduce image size');edges[y*stride+x]|=1<<d;}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;inkPixels++;if(!y||!mask[i-w])edge(x,y,0);if(x===w-1||!mask[i+1])edge(x+1,y,1);if(y===h-1||!mask[i+w])edge(x+1,y+1,2);if(!x||!mask[i-1])edge(x,y+1,3);}
    const offsets=[1,stride,-1,-stride],contours=[],areas=[];let pointCount=0,errorBound=0,fitWork=0;
    for(let start=0;start<edges.length;start++)while(edges[start]){
        if(contours.length>=maxContours)throw new RangeError('Trace contour budget exceeded');
        const points=[];let current=start,d=[0,1,2,3].find(d=>edges[start]&(1<<d)),steps=0;
        do{
            if(++steps>edgeCount)throw new Error('Invalid boundary cycle');points.push({x:current%stride,y:Math.floor(current/stride)});edges[current]&=~(1<<d);current+=offsets[d];
            if(current===start)break;
            d=[(d+1)%4,d,(d+3)%4,(d+2)%4].find(next=>edges[current]&(1<<next));if(d===undefined)throw new Error('Open boundary in binary raster');
        }while(true);
        const p=simplifyCollinear(points),id=`${idPrefix}-${contours.length}`;let c;
        if(curves&&tolerance>0){const fitted=fitPolyline(p,{closed:true,tolerance,idPrefix:id,maxPoints:TRACE_LIMITS.maxEdges,maxWork:Math.max(1,8000000-fitWork)});c=fitted.contour;fitWork+=fitted.work;if(fitWork>8000000)throw new RangeError('Curve fitting work budget exceeded');errorBound=Math.max(errorBound,fitted.errorBound);}
        else c={id:`${id}-c`,closed:true,nodes:p.map((n,i)=>({id:`${id}-n${i}`,...n,in:null,out:null,smooth:false}))};
        pointCount+=c.nodes.length;if(pointCount>TRACE_LIMITS.maxPoints)throw new RangeError('Trace output point budget exceeded');
        contours.push(c);areas.push(signedArea(p));
    }
    return {contours,areas,width:w,height:h,inkPixels,removedPixels,edgeCount,pointCount,errorBound,holes:areas.filter(a=>a<0).length,approximate:curves&&tolerance>0,warnings:curves&&tolerance>0?['Curve fitting is bounded against the exact pixel boundary; close contours and diagonal contacts may change topology. Review the overlay before applying.']:[]};
}
export function traceBitmap(image,options={}){const binary=thresholdRaster(image,options);return {...traceMask(binary,options),threshold:binary.threshold};}
