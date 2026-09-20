import {Writer} from '@wieslawsoltes/counterform-binary';
import {mapAxisCoordinate} from '@wieslawsoltes/counterform-varstore';

/** Normalize design coordinates through avar before OpenType F2DOT14 quantization. */
export function featureCoordinate(value, axis) {
    if (!axis || ![axis.min,axis.default,axis.max,value].every(Number.isFinite)
        || axis.min > axis.default || axis.default > axis.max || axis.min === axis.max)
        throw new RangeError('Invalid feature-variation axis or coordinate');
    value = Math.min(axis.max, Math.max(axis.min, value));
    const delta = value - axis.default;
    const normalized = !delta ? 0 : delta / (delta < 0 ? axis.default - axis.min : axis.max - axis.default);
    return Math.floor(mapAxisCoordinate(normalized, axis.map) * 16384 + .5) / 16384;
}

export function normalizeFeatureConditions(conditionSets, axes) {
    if (!Array.isArray(axes) || axes.length > 16) throw new RangeError('Feature axes exceed budget');
    const axisIds = new Map(axes.map((a,i)=>[a.tag,i]));
    if (axisIds.size !== axes.length) throw new Error('Duplicate feature-variation axis');
    const result = new Map();
    for (const [name, ranges] of Object.entries(conditionSets || {})) {
        if (!axes.length) throw new Error('Feature conditions require variation axes');
        const conditions = Object.entries(ranges).map(([tag, range]) => {
            const index = axisIds.get(tag), axis = axes[index];
            if (index === undefined) throw new Error(`Unknown condition axis '${tag}'`);
            if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite)
                || range[0] > range[1] || range[0] < axis.min || range[1] > axis.max)
                throw new RangeError(`${name}: condition range for '${tag}' is outside its design space`);
            return {axisIndex:index,min:featureCoordinate(range[0],axis),max:featureCoordinate(range[1],axis)};
        }).sort((a,b)=>a.axisIndex-b.axisIndex);
        result.set(name,conditions);
    }
    result.set('NULL', []);
    return result;
}

/** First matching record wins; an empty condition set is the universal fallback. */
export function matchFeatureCondition(conditions, axes, location = {}) {
    return conditions.every(c => {
        const a=axes[c.axisIndex];
        const v=featureCoordinate(location[a.tag] ?? a.default,a);
        return v >= c.min && v <= c.max;
    });
}

/** Encode format-1 conditions and sorted replacement Feature tables with Offset32 addressing. */
export function encodeFeatureVariations(records) {
    if (!Array.isArray(records) || records.length > 256) throw new RangeError('Feature variation record budget exceeded');
    const w = new Writer().u16(1).u16(0).u32(records.length).zeros(records.length*8);
    records.forEach((r,i)=>{
        const conditions = r.conditions;
        if (!Array.isArray(conditions) || conditions.length>16) throw new RangeError('Condition count exceeds budget');
        w.patch32(8+i*8,w.pos);
        const cs=w.pos;w.u16(conditions.length).zeros(conditions.length*4);
        conditions.forEach((c,j)=>{
            if (!Number.isInteger(c.axisIndex)||c.axisIndex<0||c.axisIndex>65535||![c.min,c.max].every(Number.isFinite)||c.min < -1||c.max>1||c.min>c.max)
                throw new RangeError('Invalid normalized feature condition');
            w.patch32(cs+2+j*4,w.pos-cs).u16(1).u16(c.axisIndex).f2dot14(c.min).f2dot14(c.max);
        });
        w.patch32(12+i*8,w.pos);
        const fs=w.pos, substitutions=[...r.substitutions].sort((a,b)=>a.featureIndex-b.featureIndex);
        if(substitutions.length>65535)throw new RangeError('Feature substitution budget exceeded');
        w.u16(1).u16(0).u16(substitutions.length);
        substitutions.forEach((s,j)=>{
            if(!Number.isInteger(s.featureIndex)||s.featureIndex<0||s.featureIndex>65535||j && s.featureIndex===substitutions[j-1].featureIndex)
                throw new RangeError('Invalid/duplicate feature substitution index');
            w.u16(s.featureIndex).u32(0);
        });
        substitutions.forEach((s,j)=>{
            if(!Array.isArray(s.indices)||s.indices.length>65535||s.indices.some(n=>!Number.isInteger(n)||n<0||n>65535))throw new RangeError('Invalid alternate lookup indices');
            w.patch32(fs+8+j*6,w.pos-fs).u16(0).u16(s.indices.length);
            s.indices.forEach(n=>w.u16(n));
        });
        if(w.pos>16*1024*1024)throw new RangeError('Feature variation binary budget exceeded');
    });
    return w.finish();
}
