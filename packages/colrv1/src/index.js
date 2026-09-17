import { Reader, Writer } from '@wieslawsoltes/counterform-binary';

/** OpenType COLR 1.9.1. Angles in this API are counter-clockwise degrees. */
export const compositeModes = Object.freeze(['clear','src','dest','src_over','dest_over','src_in','dest_in','src_out','dest_out','src_atop','dest_atop','xor','plus','screen','overlay','darken','lighten','color_dodge','color_burn','hard_light','soft_light','difference','exclusion','multiply','hsl_hue','hsl_saturation','hsl_color','hsl_luminosity']);
export const extendModes = Object.freeze(['pad','repeat','reflect']);
const transforms = Object.freeze({
    translate:[14,['dx','i16'],['dy','i16']],
    scale:[16,['scaleX','f2'],['scaleY','f2']],
    scaleAroundCenter:[18,['scaleX','f2'],['scaleY','f2'],['centerX','i16'],['centerY','i16']],
    scaleUniform:[20,['scale','f2']],
    scaleUniformAroundCenter:[22,['scale','f2'],['centerX','i16'],['centerY','i16']],
    rotate:[24,['angle','angle']],
    rotateAroundCenter:[26,['angle','angle'],['centerX','i16'],['centerY','i16']],
    skew:[28,['xSkewAngle','angle'],['ySkewAngle','angle']],
    skewAroundCenter:[30,['xSkewAngle','angle'],['ySkewAngle','angle'],['centerX','i16'],['centerY','i16']]
});
export const paintTypes = Object.freeze(['layers','solid','linear','radial','sweep','glyph','colrGlyph','transform',...Object.keys(transforms),'composite']);
const limits = {maxNodes:65535,maxDepth:64,maxStops:65535,maxBytes:16*1024*1024};
const fail = m => { throw new Error('COLRv1: '+m); };
const object = p => p && typeof p==='object' && !Array.isArray(p);
function number(n,kind,label) {
    if(!Number.isFinite(n)) fail(label+' must be finite');
    const [min,max,scale] = kind==='i16'?[-32768,32767,1]:kind==='u16'?[0,65535,1]:kind==='fixed'?[-32768,32767.99998474121,65536]:[-2,1.99993896484375,16384];
    const v = kind==='angle'? n/180:kind==='sweep'?n/180-1:n;
    if(v<min||v>max||((kind==='i16'||kind==='u16')&&!Number.isInteger(v))) fail(label+' is outside its OpenType range');
    return Math.round(v*scale);
}
function palette(index,count) { if(!Number.isInteger(index)||index<0||(index!==65535&&index>=count))fail('invalid palette index'); }
function alpha(value=1) { if(!Number.isFinite(value)||value<0||value>1)fail('alpha must be in [0,1]');return value; }
export function paintChildren(p) {
    if(p?.type==='layers')return p.layers||[];
    if(p?.type==='composite')return [p.backdrop,p.source];
    return p?.paint?[p.paint]:[];
}
/** Validate cycles, exported references, numeric encodings and render-expansion budgets. */
export function validatePaintSource(source, options={}) {
    const budget={...limits,...options};
    for(const k of Object.keys(limits))if(!Number.isSafeInteger(budget[k])||budget[k]<1||budget[k]>limits[k])fail('invalid '+k);
    if(!Array.isArray(source?.glyphs))fail('source glyphs are required');
    const glyphs=new Map(source.glyphs.map(g=>[g.id,g])), count=source.palettes?.[0]?.length||0;
    let visited=0,stops=0;
    const active=new Set(), bases=new Set();
    function walk(p,depth,exporting) {
        if(++visited>budget.maxNodes||depth>budget.maxDepth)fail('paint graph budget exceeded');
        if(!object(p)||!paintTypes.includes(p.type))fail('unsupported paint type '+p?.type);
        if(active.has(p))fail('cyclic paint graph');
        if('varIndexBase' in p || 'variations' in p)fail('variable paint parameters are not supported');
        active.add(p);let bounded=false;
        const child=()=>walk(p.paint,depth+1,exporting);
        const ref=()=>{const g=glyphs.get(p.glyphId);if(!g||exporting&&g.export===false)fail('missing or excluded glyph reference '+p.glyphId);return g;};
        if(p.type==='solid'){palette(p.paletteIndex,count);alpha(p.alpha);}
        else if(['linear','radial','sweep'].includes(p.type)) {
            if(!extendModes.includes(p.extend??'pad'))fail('invalid gradient extension');
            if(!Array.isArray(p.stops)||(stops+=p.stops.length)>budget.maxStops)fail('gradient stop budget exceeded');
            for(const s of p.stops){if(!object(s))fail('invalid stop');number(s.offset,'f2','stop offset');palette(s.paletteIndex,count);alpha(s.alpha);}
            const keys=p.type==='linear'?['x0','y0','x1','y1','x2','y2']:p.type==='radial'?['x0','y0','r0','x1','y1','r1']:['centerX','centerY','startAngle','endAngle'];
            for(const k of keys)number(p[k],k.startsWith('r')?'u16':k.endsWith('Angle')?'sweep':'i16',k);
        } else if(p.type==='glyph'){ref();child();bounded=true;}
        else if(p.type==='colrGlyph') {
            const g=ref();if(!g.colorPaint)fail('PaintColrGlyph must reference a COLRv1 base');
            if(bases.has(g.id))fail('cyclic color-glyph reference');
            bases.add(g.id);bounded=walk(g.colorPaint,depth+1,exporting)||!!g.colorClip;bases.delete(g.id);
        } else if(p.type==='layers') {
            if(!Array.isArray(p.layers)||!p.layers.length||p.layers.length>255)fail('a layer group requires 1 to 255 children');
            bounded=true;for(const c of p.layers)bounded=walk(c,depth+1,exporting)&&bounded;
        } else if(p.type==='transform') {
            if(!Array.isArray(p.matrix)||p.matrix.length!==6)fail('an affine transform requires six numbers');
            p.matrix.forEach(n=>number(n,'fixed','matrix'));bounded=child();
        } else if(transforms[p.type]) {
            for(const [k,t] of transforms[p.type].slice(1))number(p[k],t,k);bounded=child();
        } else if(p.type==='composite') {
            const mode=compositeModes.indexOf(p.mode);if(mode<0)fail('invalid composite mode');
            const a=walk(p.source,depth+1,exporting),b=walk(p.backdrop,depth+1,exporting);
            bounded=mode===0?true:[1,7].includes(mode)?a:[2,8].includes(mode)?b:[5,6].includes(mode)?a||b:a&&b;
        }
        active.delete(p);return bounded;
    }
    for(const g of source.glyphs) {
        if(g.colorClip!==undefined){const b=g.colorClip;if(!Array.isArray(b)||b.length!==4)fail('clip requires [xMin,yMin,xMax,yMax]');b.forEach(n=>number(n,'i16','clip'));if(b[0]>b[2]||b[1]>b[3])fail('inverted clip bounds');}
        if(g.colorPaint!==undefined){bases.add(g.id);const bounded=walk(g.colorPaint,0,g.export!==false);bases.delete(g.id);if(!bounded&&!g.colorClip)fail('unbounded base paint requires a clip box');}
    }
    return {nodes:visited,stops};
}
function u24(w,n){if(!Number.isInteger(n)||n<0||n>0xffffff)fail('Offset24 overflow');w.u8(n>>>16).u16(n&65535);}
function patch24(w,at,n){if(!Number.isInteger(n)||n<1||n>0xffffff)fail('Offset24 overflow');w.view.setUint8(at,n>>>16);w.view.setUint16(at+1,n&65535);}
function read24(r){return r.u8()*65536+r.u16();}

/** Compile all non-variable paint formats. legacyCOLR may contain v0 fallback layers. */
export function compileCOLRv1(source,glyphOrder,{legacyCOLR=null}={}) {
    validatePaintSource(source);
    const ids=new Map(glyphOrder.map((g,i)=>[g.id,i]));
    if(ids.size!==glyphOrder.length||glyphOrder.length>65535)fail('invalid glyph order');
    const bases=glyphOrder.filter(g=>g.colorPaint);
    if(!bases.length)return legacyCOLR;
    const gid=id=>{const n=ids.get(id);if(n===undefined)fail('glyph absent from export order');return n;};
    const w=new Writer().u16(1).zeros(32);
    if(legacyCOLR){const r=new Reader(legacyCOLR);if(r.u16()!==0)fail('fallback must be COLRv0');const n=r.u16(),a=r.u32(),b=r.u32(),m=r.u16();w.patch16(2,n).patch16(12,m);if(n){w.patch32(4,w.pos);w.raw(r.slice(a,n*6).bytes);}if(m){w.patch32(8,w.pos);w.raw(r.slice(b,m*4).bytes);}}
    const baseAt=w.pos;w.patch32(14,baseAt).u32(bases.length);
    const roots=bases.map(g=>{w.u16(gid(g.id));const at=w.pos;w.u32(0);return {g,at};});
    // Reserve layer-list entries first so nested layers have stable uint32 indexes.
    const allLayers=[],layerRanges=new WeakMap();
    function collect(p){if(p.type==='layers'){if(layerRanges.has(p))return;layerRanges.set(p,allLayers.length);allLayers.push(...p.layers);}for(const c of paintChildren(p))collect(c);}
    for(const g of bases)collect(g.colorPaint);
    const layerAt=w.pos;
    if(allLayers.length)w.patch32(18,layerAt).u32(allLayers.length).zeros(allLayers.length*4);
    const clips=bases.filter(g=>g.colorClip);
    if(clips.length){const at=w.pos;w.patch32(22,at).u8(1).u32(clips.length);const patches=clips.map(g=>{w.u16(gid(g.id)).u16(gid(g.id));const p=w.pos;u24(w,0);return [p,g.colorClip];});for(const [p,b]of patches){patch24(w,p,w.pos-at);w.u8(1);b.forEach(n=>w.i16(n));}}
    function colorLine(p){const at=w.pos;w.u8(extendModes.indexOf(p.extend??'pad')).u16(p.stops.length);for(const s of p.stops)w.f2dot14(s.offset).u16(s.paletteIndex).f2dot14(s.alpha??1);return at;}
    function emit(p,depth=0){if(w.pos>limits.maxBytes||depth>limits.maxDepth)fail('binary paint budget exceeded');const at=w.pos;
        const child=(offset=at+1)=>patch24(w,offset,emit(p.paint,depth+1)-at);
        if(p.type==='solid')w.u8(2).u16(p.paletteIndex).f2dot14(p.alpha??1);
        else if(p.type==='layers')w.u8(1).u8(p.layers.length).u32(layerRanges.get(p));
        else if(['linear','radial','sweep'].includes(p.type)){
            w.u8({linear:4,radial:6,sweep:8}[p.type]);u24(w,0);
            if(p.type==='linear')for(const k of ['x0','y0','x1','y1','x2','y2'])w.i16(p[k]);
            if(p.type==='radial')for(const k of ['x0','y0','r0','x1','y1','r1'])k.startsWith('r')?w.u16(p[k]):w.i16(p[k]);
            if(p.type==='sweep')w.i16(p.centerX).i16(p.centerY).i16(number(p.startAngle,'sweep','startAngle')).i16(number(p.endAngle,'sweep','endAngle'));
            patch24(w,at+1,colorLine(p)-at);
        } else if(p.type==='glyph'){w.u8(10);u24(w,0);w.u16(gid(p.glyphId));child();}
        else if(p.type==='colrGlyph')w.u8(11).u16(gid(p.glyphId));
        else if(p.type==='transform'){w.u8(12);u24(w,0);u24(w,7);p.matrix.forEach(n=>w.fixed(n));child();}
        else if(transforms[p.type]){w.u8(transforms[p.type][0]);u24(w,0);for(const [k,t]of transforms[p.type].slice(1))w.i16(number(p[k],t,k));child();}
        else if(p.type==='composite'){w.u8(32);u24(w,0);w.u8(compositeModes.indexOf(p.mode));u24(w,0);patch24(w,at+1,emit(p.source,depth+1)-at);patch24(w,at+5,emit(p.backdrop,depth+1)-at);}
        return at;
    }
    for(const {g,at}of roots)w.patch32(at,emit(g.colorPaint)-baseAt);
    for(let i=0;i<allLayers.length;i++)w.patch32(layerAt+4+i*4,emit(allLayers[i])-layerAt);
    if(w.pos>limits.maxBytes)fail('binary paint budget exceeded');
    return w.finish();
}

/** Reconstruct non-variable COLRv1 graphs. Unknown/variable formats fail explicitly. */
export function readCOLRv1(bytes,glyphOrder,{paletteEntries=65535}={}) {
    if(!Number.isInteger(paletteEntries)||paletteEntries<1||paletteEntries>65535)fail('invalid palette entry count');
    const r=new Reader(bytes);if(r.bytes.length>limits.maxBytes)fail('COLR table too large');if(r.u16()!==1)fail('expected COLRv1');r.skip(12);
    const baseAt=r.u32(),layerAt=r.u32(),clipAt=r.u32(),varMap=r.u32(),varStore=r.u32();
    if(varMap||varStore)fail('variable color paint parameters are not reconstructed');
    const offset=(origin,n,min=1)=>{if(!n||n<min)fail('invalid paint offset');r.need(1,origin+n);return origin+n;};
    const glyph=id=>{if(!glyphOrder[id])fail('invalid glyph reference');return glyphOrder[id].id;};
    const roots=new Map(),paints=new Map(),clips=new Map(),layers=[];
    if(!baseAt)fail('missing BaseGlyphList');offset(0,baseAt,34);r.seek(baseAt);let n=r.u32();if(n>65535)fail('base glyph budget exceeded');r.need(n*6);let previous=-1;
    for(let i=0;i<n;i++){const id=r.u16(),p=r.u32();if(id<=previous)fail('unsorted or duplicate base glyph');previous=id;roots.set(glyph(id),offset(baseAt,p,4+n*6));}
    if(layerAt){offset(0,layerAt,34);r.seek(layerAt);n=r.u32();if(n>limits.maxNodes)fail('layer list budget exceeded');r.need(n*4);for(let i=0;i<n;i++)layers.push(offset(layerAt,r.u32(),4+n*4));}
    if(clipAt){offset(0,clipAt,34);r.seek(clipAt);if(r.u8()!==1)fail('unsupported clip list');n=r.u32();if(n>65535)fail('clip budget exceeded');r.need(n*7);previous=-1;
        for(let i=0;i<n;i++){const first=r.u16(),last=r.u16(),p=read24(r);if(first<=previous||last<first||last>=glyphOrder.length)fail('invalid clip range');previous=last;const save=r.pos;r.seek(offset(clipAt,p,5+n*7));if(r.u8()!==1)fail('variable clip boxes are not reconstructed');const b=[r.i16(),r.i16(),r.i16(),r.i16()];for(let id=first;id<=last;id++)clips.set(glyph(id),b.slice());r.seek(save);}}
    let count=0,stopCount=0;const active=new Set();
    function line(at){const c=new Reader(bytes).seek(at),extend=extendModes[c.u8()],n=c.u16();if(extend===undefined||(stopCount+=n)>limits.maxStops)fail('invalid color line or stop budget');c.need(n*6);const stops=[];for(let i=0;i<n;i++)stops.push({offset:c.f2dot14(),paletteIndex:c.u16(),alpha:c.f2dot14()});return {extend,stops};}
    function paint(at,depth=0){if(++count>limits.maxNodes||depth>limits.maxDepth)fail('expanded graph budget exceeded');if(active.has(at))fail('cyclic binary paint graph');active.add(at);
        const p=new Reader(bytes).seek(at),format=p.u8();let out;
        const sub=(n,min)=>paint(offset(at,n,min),depth+1);
        if(format===1){const n=p.u8(),first=p.u32();if(!n||first+n>layers.length)fail('layer range outside LayerList');out={type:'layers',layers:layers.slice(first,first+n).map(x=>paint(x,depth+1))};}
        else if(format===2)out={type:'solid',paletteIndex:p.u16(),alpha:p.f2dot14()};
        else if([4,6,8].includes(format)){const loc=read24(p);out={type:{4:'linear',6:'radial',8:'sweep'}[format]};
            const keys=format===4?['x0','y0','x1','y1','x2','y2']:format===6?['x0','y0','r0','x1','y1','r1']:['centerX','centerY','startAngle','endAngle'];
            for(const k of keys)out[k]=k.startsWith('r')?p.u16():k.endsWith('Angle')?(p.f2dot14()+1)*180:p.i16();Object.assign(out,line(offset(at,loc,p.pos-at)));
        } else if(format===10){const loc=read24(p);out={type:'glyph',glyphId:glyph(p.u16()),paint:sub(loc,6)};}
        else if(format===11)out={type:'colrGlyph',glyphId:glyph(p.u16())};
        else if(format===12){const loc=read24(p),m=read24(p),a=new Reader(bytes).seek(offset(at,m,7));out={type:'transform',matrix:Array.from({length:6},()=>a.fixed()),paint:sub(loc,7)};}
        else if(format===32){const a=read24(p),mode=compositeModes[p.u8()],b=read24(p);if(mode===undefined)fail('invalid composite mode');out={type:'composite',source:sub(a,8),mode,backdrop:sub(b,8)};}
        else {const spec=Object.entries(transforms).find(([,s])=>s[0]===format);if(!spec)fail('unsupported paint format '+format);const loc=read24(p);out={type:spec[0]};for(const [k,t]of spec[1].slice(1))out[k]=t==='i16'?p.i16():t==='angle'?p.f2dot14()*180:p.f2dot14();out.paint=sub(loc,p.pos-at);}
        active.delete(at);return out;
    }
    for(const [id,at]of roots)paints.set(id,paint(at));
    validatePaintSource({palettes:[Array(paletteEntries).fill('#000000')],glyphs:glyphOrder.map(g=>({id:g.id,colorPaint:paints.get(g.id),colorClip:clips.get(g.id)}))});
    return {colorPaints:paints,colorClips:clips};
}
/** Stable glyph IDs used by both outline and color-subgraph reference nodes. */
export function paintReferences(p) {const ids=new Set(),active=new Set();let n=0;function walk(x,depth){if(!object(x)||++n>limits.maxNodes||depth>limits.maxDepth||active.has(x))fail('invalid paint graph');active.add(x);if(x.type==='glyph'||x.type==='colrGlyph')ids.add(x.glyphId);for(const c of paintChildren(x))walk(c,depth+1);active.delete(x);}if(p)walk(p,0);return ids;}
