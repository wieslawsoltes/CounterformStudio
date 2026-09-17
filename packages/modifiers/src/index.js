import {transformContours,reverseContour} from '@wieslawsoltes/counterform-geometry';
export const modifierKinds=Object.freeze(['translate','scale','rotate','slant','matrix','round','reverse','repeat']);
const number=(v,min,max,label)=>{if(!Number.isFinite(v)||v<min||v>max)throw new RangeError(`${label} must be finite within ${min}…${max}`);return v;};
/** Validate disabled modifiers too, so enabling cannot activate unchecked data. */
export function validateModifiers(stack=[]){
 if(!Array.isArray(stack)||stack.length>64)throw new RangeError('At most 64 outline modifiers are supported');
 for(const m of stack){
  if(!m||!modifierKinds.includes(m.type)||(m.enabled!==undefined&&typeof m.enabled!=='boolean'))throw new TypeError('Invalid outline modifier');
  switch(m.type){
   case 'translate':case 'repeat':number(m.x??0,-1e6,1e6,'X');number(m.y??0,-1e6,1e6,'Y');if(m.type==='repeat'&&(!Number.isInteger(m.count)||m.count<1||m.count>128))throw new RangeError('Repeat count must be 1…128');break;
   case 'scale':number(m.x??1,-1000,1000,'X scale');number(m.y??1,-1000,1000,'Y scale');break;
   case 'rotate':number(m.angle??0,-36000,36000,'Rotation');break;
   case 'slant':number(m.angle??0,-85,85,'Slant');break;
   case 'round':number(m.grid??1,1e-6,1e6,'Grid');break;
   case 'matrix':if(!Array.isArray(m.matrix)||m.matrix.length!==6)throw new TypeError('Expected six affine coefficients');m.matrix.forEach(v=>number(v,-1e6,1e6,'Affine coefficient'));break;
  }
  if(m.origin){number(m.origin.x,-1e6,1e6,'Origin X');number(m.origin.y,-1e6,1e6,'Origin Y');}
 }
 return stack;
}
function around(m,a,b,c,d){const {x=0,y=0}=m.origin||{};return [a,b,c,d,x-a*x-c*y,y-b*x-d*y];}
/** Pure evaluation; source identities remain stable except deterministic repeat-copy identities. */
export function evaluateModifiers(contours,stack=[],{maxNodes=2000000}={}){
 validateModifiers(stack);if(!Number.isSafeInteger(maxNodes)||maxNodes<1||maxNodes>2000000)throw new RangeError('Invalid modifier node budget');
 let result=structuredClone(contours);
 const checked=()=>{let count=0;for(const c of result)for(const n of c.nodes){if(++count>maxNodes)throw new RangeError('Modifier node budget exceeded');for(const p of [n,n.in,n.out])if(p) {number(p.x,-1e7,1e7,'Output X');number(p.y,-1e7,1e7,'Output Y');}}};checked();
 for(let index=0;index<stack.length;index++){
  const m=stack[index];if(m.enabled===false)continue;let matrix;
  switch(m.type){
   case 'translate':matrix=[1,0,0,1,m.x??0,m.y??0];break;
   case 'scale':matrix=around(m,m.x??1,0,0,m.y??1);break;
   case 'rotate':{const a=(m.angle??0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);matrix=around(m,c,s,-s,c);break;}
   case 'slant':matrix=around(m,1,0,Math.tan((m.angle??0)*Math.PI/180),1);break;
   case 'matrix':matrix=m.matrix;break;
   case 'reverse':result=result.map(reverseContour);break;
   case 'round':for(const c of result)for(const n of c.nodes)for(const p of [n,n.in,n.out])if(p){p.x=Math.round(p.x/(m.grid??1))*(m.grid??1);p.y=Math.round(p.y/(m.grid??1))*(m.grid??1);}break;
   case 'repeat':{
    if(result.reduce((n,c)=>n+c.nodes.length,0)*m.count>maxNodes)throw new RangeError('Repeat exceeds modifier node budget');
    const source=result;result=[];
    for(let k=0;k<m.count;k++){const copy=transformContours(structuredClone(source),[1,0,0,1,k*(m.x??0),k*(m.y??0)]);for(const c of copy){c.id+=`~m${index}r${k}`;for(const n of c.nodes)n.id+=`~m${index}r${k}`;}result.push(...copy);}break;
   }
  }
  if(matrix)result=transformContours(result,matrix);checked();
 }
 return result;
}
