import {compileColorTables,createPaletteNamePlan} from '@wieslawsoltes/counterform-color';
import {compileLayout} from '@wieslawsoltes/counterform-opentype';
import { Writer, readDirectory, sfnt } from '@wieslawsoltes/counterform-binary';
import { FontDocument } from '@wieslawsoltes/counterform-model';
import { segments } from '@wieslawsoltes/counterform-geometry';
import { compileOpenTypeCFF, exportGlyphOrder, nameTable } from '@wieslawsoltes/counterform-font-io';
import { modelForDocument, variationMetadata, compileMetricVariations, masterInfo } from '@wieslawsoltes/counterform-variations';
import { encodeItemVariationStore } from '@wieslawsoltes/counterform-varstore';

function index(items) {
    if(items.length>65535)throw new RangeError('CFF2 glyph/index budget exceeded');
    const w=new Writer().u32(items.length);if(!items.length)return w.finish();
    const total=items.reduce((n,b)=>n+b.length,1),size=total<=255?1:total<=65535?2:total<=0xffffff?3:4;
    w.u8(size);let offset=1;
    const put=n=>{for(let shift=size-1;shift>=0;shift--)w.u8(Math.floor(n/2**(8*shift))&255);};
    put(offset);for(const b of items){offset+=b.length;put(offset);}items.forEach(b=>w.raw(b));return w.finish();
}
function number(w,value) {
    if(!Number.isFinite(value)||value<-32768||value>=32768)throw new RangeError('CFF2 operand outside signed 16.16 range');
    if(!Number.isInteger(value)){w.u8(255).fixed(value);return;}
    if(value>=-107&&value<=107)w.u8(value+139);
    else if(value>=108&&value<=1131)w.u8(((value-108)>>8)+247).u8((value-108)&255);
    else if(value<=-108&&value>=-1131)w.u8(((-value-108)>>8)+251).u8((-value-108)&255);
    else w.u8(28).i16(value);
}
function dictNumber(w,n){return w.u8(29).i32(n);}
function real(w,n){
    const chars=String(n).replace('e-','X').replace('e+','E').replace('e','E');
    const values=[...chars].map(c=>({'.':10,E:11,X:12,'-':14})[c]??Number(c));values.push(15);if(values.length%2)values.push(15);
    w.u8(30);for(let i=0;i<values.length;i+=2)w.u8(values[i]*16+values[i+1]);
}
/** Every segment uses rrcurveto, so line/curve master differences remain compatible. */
function pathProgram(contours){
    const program=[];let x=0,y=0;
    for(const contour of contours){
        if(!contour.closed||contour.nodes.length<2)continue;
        const start=contour.nodes[0];program.push({op:21,args:[start.x-x,start.y-y]});x=start.x;y=start.y;
        for(const s of segments(contour)){
            const p1=s.curve?s.p1:{x:x+(s.b.x-x)/3,y:y+(s.b.y-y)/3};
            const p2=s.curve?s.p2:{x:x+2*(s.b.x-x)/3,y:y+2*(s.b.y-y)/3};
            const p3=s.curve?s.p3:s.b;
            program.push({op:8,args:[p1.x-x,p1.y-y,p2.x-p1.x,p2.y-p1.y,p3.x-p2.x,p3.y-p2.y]});x=p3.x;y=p3.y;
        }
    }
    return program;
}
export function compileCFF2Table(masterContours,{unitsPerEm=1000,axes=[],model=null}={}) {
    if(!Number.isInteger(unitsPerEm)||unitsPerEm<16||unitsPerEm>16384)throw new RangeError('Invalid unitsPerEm');
    if(!masterContours.length||masterContours.length>64)throw new RangeError('CFF2 needs 1…64 masters');
    const count=masterContours[0].length;
    if(masterContours.some(m=>m.length!==count))throw new Error('Master glyph orders differ');
    const baseIndex=model?model.order[0].index:0, supports=model?.supports.slice(1)||[];
    if(model&&model.order.length!==masterContours.length)throw new Error('Variation model/master count mismatch');
    const strings=[];
    for(let gid=0;gid<count;gid++){
        const cs=masterContours.map(m=>m[gid].filter(c=>c.closed&&c.nodes.length>=2));
        if(cs.some(m=>m.length!==cs[0].length||m.some((c,i)=>c.nodes.length!==cs[0][i].nodes.length)))throw new Error(`Glyph ${gid}: incompatible contour topology`);
        const programs=cs.map(pathProgram),base=programs[baseIndex],w=new Writer();
        for(let ci=0;ci<base.length;ci++){
            const command=base[ci];
            const operands=command.args.map((_,ai)=>{const values=programs.map(p=>p[ci].args[ai]);return model?model.deltas(values):[values[0]];});
            operands.forEach(ds=>number(w,ds[0]));
            // At most 6*64+1 stack values: one complete blend avoids width-heuristic
            // ambiguity in existing CFF tooling while remaining below the 513 limit.
            if(operands.some(ds=>ds.slice(1).some(v=>Math.abs(v)>1/65536))){
                operands.forEach(ds=>ds.slice(1).forEach(n=>number(w,n)));
                number(w,operands.length);w.u8(16);
            }
            w.u8(command.op);
        }
        // No width, endchar or return operators are permitted in a CFF2 glyph.
        strings.push(w.finish());
    }
    const chars=index(strings),globalSubrs=index([]);
    const store=supports.length?encodeItemVariationStore(axes,supports,[{items:[]}]):null;
    if(store&&store.length>65535)throw new RangeError('CFF2 variation store exceeds uint16 length');
    const top=(charOffset,fdOffset,varOffset)=>{
        const w=new Writer();dictNumber(w,charOffset).u8(17);dictNumber(w,fdOffset).u8(12).u8(36);
        if(store)dictNumber(w,varOffset).u8(24);
        if(unitsPerEm!==1000){for(const n of [1/unitsPerEm,0,0,1/unitsPerEm,0,0])real(w,n);w.u8(12).u8(7);}
        return w.finish();
    };
    const top0=top(0,0,0),charOffset=5+top0.length+globalSubrs.length,fdOffset=charOffset+chars.length;
    const fontDict=offset=>{const w=new Writer();dictNumber(w,0);dictNumber(w,offset).u8(18);return index([w.finish()]);};
    const privateOffset=fdOffset+fontDict(0).length,varOffset=privateOffset;
    const w=new Writer().u8(2).u8(0).u8(5).u16(top0.length).raw(top(charOffset,fdOffset,varOffset))
        .raw(globalSubrs).raw(chars).raw(fontDict(privateOffset));
    if(store)w.u16(store.length).raw(store);
    return w.finish();
}
/** Compile actual CFF2 outlines; variable output includes fvar/STAT/HVAR and optional MVAR. */
export function compileOpenTypeCFF2(doc,{variable=false,masterId=doc.data.masters[0].id}={}) {
    const model=variable?modelForDocument(doc):null;
    if(variable&&!doc.data.axes.length)throw new Error('Variable CFF2 needs at least one axis');
    const masters=variable?doc.data.masters:doc.data.masters.filter(m=>m.id===masterId);
    if(!masters.length)throw new Error('Unknown master');
    const base=masters[model?model.order[0].index:0],glyphs=exportGlyphOrder(doc);
    const info=masterInfo(doc,base),baseDoc=new FontDocument({...doc.data,info});
    try {
        const binary=compileOpenTypeCFF(baseDoc,{masterId:base.id});
        const tables=new Map([...readDirectory(binary).tables].map(([tag,t])=>[tag,t.bytes.slice()]));
        tables.delete('CFF ');new DataView(tables.get('head').buffer).setUint32(8,0);
        tables.set('CFF2',compileCFF2Table(masters.map(m=>glyphs.map(g=>doc.glyph(g.id)?doc.resolve(g.id,m.id):[])),
            {unitsPerEm:info.unitsPerEm,axes:doc.data.axes,model}));
        if(variable){
            for(const [tag,bytes]of compileLayout(doc.data,glyphs,base.id,model).tables)tables.set(tag,bytes);
            const meta=variationMetadata(doc.data);for(const [tag,bytes]of meta.tables)tables.set(tag,bytes);
            const colorNames=createPaletteNamePlan(doc.data,meta.names);tables.set('name',nameTable(info,[...meta.names,...colorNames.names]));
            for(const [tag,bytes]of compileColorTables(doc.data,glyphs,{namePlan:colorNames}))tables.set(tag,bytes);
            for(const [tag,bytes]of compileMetricVariations(doc,model,glyphs))tables.set(tag,bytes);
        }
        return sfnt(tables,0x4f54544f);
    }finally{baseDoc.dispose();}
}
