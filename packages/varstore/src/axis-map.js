import {Reader, Writer} from '@wieslawsoltes/counterform-binary';
const identity = () => [[-1,-1],[0,0],[1,1]];
const quantize = n => Math.round(n * 16384) / 16384;

/** Return a detached, binary-representable avar 1.0 segment map. Flat segments are legal. */
export function normalizeAxisMap(map) {
    if (map === undefined || map === null || Array.isArray(map) && !map.length) return identity();
    if (!Array.isArray(map) || map.length < 3 || map.length > 4096) throw new RangeError('Axis map requires 3–4096 coordinate pairs');
    const result = map.map(pair => {
        if (!Array.isArray(pair) || pair.length !== 2 || ![pair[0],pair[1]].every(n => typeof n === 'number' && Number.isFinite(n) && n >= -1 && n <= 1)) throw new RangeError('Axis mapping coordinates must be finite and within −1…1');
        return pair.map(quantize);
    });
    for (let i = 1; i < result.length; i++) {
        if (result[i][0] <= result[i-1][0]) throw new RangeError('Axis inputs must be strictly increasing at F2DOT14 precision');
        if (result[i][1] < result[i-1][1]) throw new RangeError('Axis outputs must be nondecreasing');
    }
    for (const required of [-1,0,1]) {
        if (!result.some(([from,to]) => from === required && to === required)) throw new RangeError('Axis maps must contain −1→−1, 0→0 and 1→1');
    }
    return result;
}

/** Piecewise-linear interpolation in normalized space, after default fvar normalization. */
export function mapAxisCoordinate(value, map) {
    if (!Number.isFinite(value)) throw new RangeError('Axis coordinate must be finite');
    const points = normalizeAxisMap(map), x = Math.max(-1, Math.min(1, value));
    let lo = 0, hi = points.length - 1;
    while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (points[mid][0] <= x) lo = mid; else hi = mid; }
    const [x0,y0] = points[lo], [x1,y1] = points[hi];
    return y0 + (y1-y0) * (x-x0) / (x1-x0);
}

export function encodeAvar(axes) {
    if (!Array.isArray(axes) || axes.length > 16) throw new RangeError('Axis count exceeds the authoring limit');
    const maps = axes.map(a => normalizeAxisMap(a.map));
    if (maps.every(map => map.every(([from,to]) => from === to))) return null;
    const w = new Writer().u16(1).u16(0).u16(0).u16(maps.length);
    for (const map of maps) { w.u16(map.length); for (const [from,to] of map) w.f2dot14(from).f2dot14(to); }
    return w.finish();
}

/** Decode avar 1.0 strictly; never interpret unsupported avar 2.0 as an identity map. */
export function decodeAvar(bytes, axisCount = null) {
    const r = new Reader(bytes);
    if (r.u16() !== 1 || r.u16() !== 0 || r.u16() !== 0) throw new Error('Only avar 1.0 with zero reserved bits is supported');
    const count = r.u16();
    if (count > 16 || axisCount !== null && count !== axisCount) throw new RangeError('avar/fvar axis count mismatch or limit exceeded');
    const maps = [];
    for (let i = 0; i < count; i++) {
        const length = r.u16(); if (length > 4096) throw new RangeError('Axis map exceeds record budget');
        const map = []; for (let j = 0; j < length; j++) map.push([r.i16()/16384,r.i16()/16384]);
        maps.push(normalizeAxisMap(map));
    }
    if (r.pos !== bytes.byteLength) throw new Error('Unexpected bytes after avar segment maps');
    return maps;
}
