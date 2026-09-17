import { Writer } from '@wieslawsoltes/counterform-binary';
import { bounds } from '@wieslawsoltes/counterform-geometry';
import { encodeItemVariationStore, encodeDeltaSetIndexMap } from '@wieslawsoltes/counterform-varstore';

export const metricTags = Object.freeze({ascender:'hasc',descender:'hdsc',lineGap:'hlgp',capHeight:'cpht',xHeight:'xhgt'});
export function masterInfo(doc,master) {
    const result={...doc.info};
    for(const key of Object.keys(metricTags))if(master.metrics?.[key]!==undefined){
        const value=master.metrics[key];
        if(!Number.isFinite(value)||Math.abs(value)>32767)throw new RangeError(`Invalid ${key} master metric`);
        result[key]=Math.round(value);
    }
    return result;
}
/** HVAR has explicit LSB/RSB maps as well as implicit GID→advance rows. */
export function compileMetricVariations(doc,model,glyphs) {
    const masters=doc.data.masters,axes=doc.data.axes,supports=model.supports.slice(1);
    const deltas=values=>model.deltas(values.map(Math.round)).slice(1).map(Math.round);
    const rows=[[],[],[]];
    for(const g of glyphs){
        const metrics=masters.map(m=>{const layer=g.layers.find(l=>l.masterId===m.id);
            if(!layer)throw new Error(`${g.name}: missing master metrics`);
            const box=bounds(doc.glyph(g.id)?doc.resolve(g.id,m.id):[]);
            const advance=Math.round(layer.advanceWidth),left=Math.floor(box.minX),right=advance-Math.ceil(box.maxX);
            return [advance,left,right];
        });
        rows.forEach((set,j)=>set.push(deltas(metrics.map(v=>v[j]))));
    }
    const store=encodeItemVariationStore(axes,supports,rows.map(items=>({items})));
    const lsb=encodeDeltaSetIndexMap(glyphs.length,1),rsb=encodeDeltaSetIndexMap(glyphs.length,2);
    const hvar=new Writer().u16(1).u16(0).u32(20).u32(0).u32(20+store.length).u32(20+store.length+lsb.length)
        .raw(store).raw(lsb).raw(rsb).finish();
    const records=Object.entries(metricTags).map(([key,tag])=>({tag,deltas:deltas(masters.map(m=>masterInfo(doc,m)[key]))}))
        .filter(r=>r.deltas.some(Boolean)).sort((a,b)=>a.tag<b.tag?-1:1);
    const tables=new Map([['HVAR',hvar]]);
    if(records.length){
        const vstore=encodeItemVariationStore(axes,supports,[{items:records.map(r=>r.deltas)}]);
        const w=new Writer().u16(1).u16(0).u16(0).u16(8).u16(records.length).u16(12+records.length*8);
        records.forEach((r,i)=>w.tag(r.tag).u16(0).u16(i));w.raw(vstore);tables.set('MVAR',w.finish());
    }
    return tables;
}
