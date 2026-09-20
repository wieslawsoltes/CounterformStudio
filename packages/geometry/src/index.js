/** Double-precision outline geometry. Coordinate space is font units, y upwards.
 * A contour stores endpoint nodes; handles are absolute coordinates on each node.
 * The edge i→i+1 is cubic if either handle exists, otherwise linear.
 */
export const EPSILON = 1e-9;
let nextId = 0;
export const uid = (prefix = 'n') => `${prefix}-${(++nextId).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const point = (x, y) => ({ x, y });
export function node(x, y, extra = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(y))
        throw new TypeError('Non-finite node coordinate');
    return { id: uid(), x, y, in: null, out: null, smooth: false, ...extra };
}
export const contour = (nodes = [], closed = true) => ({ id: uid('c'), closed, nodes });
export function rectangle(x, y, w, h) {
    return contour([node(x, y), node(x, y + h), node(x + w, y + h), node(x + w, y)]);
}
export function ellipse(cx, cy, rx, ry) {
    const k = 0.5522847498307936;
    return contour([
        node(cx + rx, cy, { in: point(cx + rx, cy + ry * k), out: point(cx + rx, cy - ry * k), smooth: true }),
        node(cx, cy - ry, { in: point(cx + rx * k, cy - ry), out: point(cx - rx * k, cy - ry), smooth: true }),
        node(cx - rx, cy, { in: point(cx - rx, cy - ry * k), out: point(cx - rx, cy + ry * k), smooth: true }),
        node(cx, cy + ry, { in: point(cx - rx * k, cy + ry), out: point(cx + rx * k, cy + ry), smooth: true })
    ]);
}
export function* segments(c) {
    const n = c.nodes.length;
    for (let i = 0; i < (c.closed ? n : n - 1); i++) {
        const a = c.nodes[i], b = c.nodes[(i + 1) % n];
        yield { index: i, a, b, p0: a, p1: a.out || a, p2: b.in || b, p3: b, curve: !!(a.out || b.in) };
    }
}
export function cubicAt(p0, p1, p2, p3, t) {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}
export function cubicDerivative(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return { x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x), y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y) };
}
export function splitCubic(p0, p1, p2, p3, t = .5) {
    const a = mix(p0, p1, t), b = mix(p1, p2, t), c = mix(p2, p3, t), d = mix(a, b, t), e = mix(b, c, t), f = mix(d, e, t);
    return [[p0, a, d, f], [f, e, c, p3]];
}
function roots(a, b, c) {
    if (Math.abs(a) < EPSILON)
        return Math.abs(b) < EPSILON ? [] : [-c / b];
    const d = b * b - 4 * a * c;
    if (d < 0)
        return [];
    const q = -.5 * (b + Math.sign(b || 1) * Math.sqrt(d));
    return Math.abs(q) < EPSILON ? [-b / (2 * a)] : [q / a, c / q];
}
export function extrema(p0, p1, p2, p3) {
    const result = [];
    for (const axis of ['x', 'y']) {
        const a = -p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis], b = 2 * (p0[axis] - 2 * p1[axis] + p2[axis]), c = p1[axis] - p0[axis];
        for (const t of roots(a, b, c))
            if (t > EPSILON && t < 1 - EPSILON && !result.some(x => Math.abs(x - t) < 1e-7))
                result.push(t);
    }
    return result.sort((a, b) => a - b);
}
export function bounds(contours) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const add = p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); };
    for (const c of contours) {
        for (const n of c.nodes)
            add(n);
        for (const s of segments(c))
            if (s.curve)
                for (const t of extrema(s.p0, s.p1, s.p2, s.p3))
                    add(cubicAt(s.p0, s.p1, s.p2, s.p3, t));
    }
    if (minX === Infinity)
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, empty: true };
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, empty: false };
}
export function transformPoint(p, m) { return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }; }
export function transformContours(cs, m, ids = null) {
    if (m.length !== 6 || m.some(n => !Number.isFinite(n)))
        throw new TypeError('A finite affine matrix is required');
    for (const c of cs)
        for (const n of c.nodes)
            if (!ids || ids.has(n.id)) {
                const p = transformPoint(n, m);
                n.x = p.x;
                n.y = p.y;
                if (n.in)
                    n.in = transformPoint(n.in, m);
                if (n.out)
                    n.out = transformPoint(n.out, m);
            }
    return cs;
}
export function multiply(a, b) { return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]]; }
export function invert(m) {
    const d = m[0] * m[3] - m[1] * m[2];
    if (Math.abs(d) < EPSILON)
        throw new RangeError('Singular transform');
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d];
}
export function reverseContour(c) {
    c.nodes.reverse();
    for (const n of c.nodes)
        [n.in, n.out] = [n.out, n.in];
    return c;
}
export function splitSegment(c, index, t = .5) {
    const s = [...segments(c)][index];
    if (!s || t <= 0 || t >= 1)
        throw new RangeError('Split must lie inside a segment');
    let n;
    if (s.curve) {
        const [l, r] = splitCubic(s.p0, s.p1, s.p2, s.p3, t);
        s.a.out = l[1];
        s.b.in = r[2];
        n = node(l[3].x, l[3].y, { in: l[2], out: r[1], smooth: true });
    }
    else {
        const p = mix(s.a, s.b, t);
        n = node(p.x, p.y);
    }
    c.nodes.splice(index + 1, 0, n);
    return n;
}
export function addExtrema(c) {
    let added = 0;
    for (let i = [...segments(c)].length - 1; i >= 0; i--) {
        const s = [...segments(c)][i];
        if (!s.curve)
            continue;
        let end = 1;
        for (const t of extrema(s.p0, s.p1, s.p2, s.p3).reverse()) {
            splitSegment(c, i, t / end);
            end = t;
            added++;
        }
    }
    return added;
}
function lineDistance(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
    if (l < EPSILON)
        return distance(p, a);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / Math.sqrt(l);
}
export function flattenCubic(p0, p1, p2, p3, tolerance = .4, depth = 0, out = [p0]) {
    if (!Number.isFinite(tolerance) || tolerance <= 0)
        throw new RangeError('Positive flattening tolerance required');
    // The control polygon excess also detects collinear overshoot and reversal.
    const excess = distance(p0, p1) + distance(p1, p2) + distance(p2, p3) - distance(p0, p3);
    if (depth > 16 || (excess <= tolerance && Math.max(lineDistance(p1, p0, p3), lineDistance(p2, p0, p3)) <= tolerance)) {
        out.push(p3);
        return out;
    }
    const [l, r] = splitCubic(p0, p1, p2, p3);
    flattenCubic(...l, tolerance, depth + 1, out);
    flattenCubic(...r, tolerance, depth + 1, out);
    return out;
}
export function flattenContour(c, tolerance = .4) {
    const out = c.nodes.length ? [point(c.nodes[0].x, c.nodes[0].y)] : [];
    for (const s of segments(c)) {
        if (s.curve)
            out.push(...flattenCubic(s.p0, s.p1, s.p2, s.p3, tolerance).slice(1));
        else
            out.push(point(s.b.x, s.b.y));
    }
    if (c.closed && out.length > 1 && distance(out[0], out.at(-1)) < EPSILON)
        out.pop();
    return out;
}
export function signedArea(c) {
    const ps = flattenContour(c, .2);
    let a = 0;
    for (let i = 0; i < ps.length; i++) {
        const p = ps[i], q = ps[(i + 1) % ps.length];
        a += p.x * q.y - q.x * p.y;
    }
    return a / 2;
}
export function containsPoint(c, p) {
    const ps = flattenContour(c, .5);
    let w = 0;
    for (let i = 0; i < ps.length; i++) {
        const a = ps[i], b = ps[(i + 1) % ps.length];
        if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
            w++;
    }
    return (w % 2) === 1;
}
export function correctWinding(cs) {
    for (let i = 0; i < cs.length; i++) {
        const c = cs[i];
        if (!c.closed || !c.nodes.length)
            continue;
        const p = c.nodes[0];
        let nesting = 0;
        for (let j = 0; j < cs.length; j++)
            if (i !== j && containsPoint(cs[j], p))
                nesting++;
        const clockwise = nesting % 2 === 0;
        if ((signedArea(c) < 0) !== clockwise)
            reverseContour(c);
    }
    return cs;
}
export function nearestOnContour(c, p) {
    let best = { distance: Infinity, index: -1, t: 0, point: p };
    for (const s of segments(c)) {
        let t = 0;
        if (!s.curve) {
            const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y;
            t = clamp(((p.x - s.a.x) * dx + (p.y - s.a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
        }
        else {
            let d = Infinity;
            for (let i = 0; i <= 24; i++) {
                const v = i / 24, x = cubicAt(s.p0, s.p1, s.p2, s.p3, v), dist = distance(x, p);
                if (dist < d) {
                    d = dist;
                    t = v;
                }
            }
            let lo = Math.max(0, t - 1 / 24), hi = Math.min(1, t + 1 / 24);
            for (let n = 0; n < 20; n++) {
                const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
                if (distance(cubicAt(s.p0, s.p1, s.p2, s.p3, a), p) < distance(cubicAt(s.p0, s.p1, s.p2, s.p3, b), p))
                    hi = b;
                else
                    lo = a;
            }
            t = (lo + hi) / 2;
        }
        const q = s.curve ? cubicAt(s.p0, s.p1, s.p2, s.p3, t) : mix(s.a, s.b, t), d = distance(p, q);
        if (d < best.distance)
            best = { distance: d, index: s.index, t, point: q };
    }
    return best;
}
export function smoothNode(c, index) {
    const n = c.nodes[index], p = c.nodes[(index - 1 + c.nodes.length) % c.nodes.length], q = c.nodes[(index + 1) % c.nodes.length];
    const angle = Math.atan2(q.y - p.y, q.x - p.x), a = n.in ? distance(n, n.in) : distance(n, p) / 3, b = n.out ? distance(n, n.out) : distance(n, q) / 3;
    n.in = point(n.x - Math.cos(angle) * a, n.y - Math.sin(angle) * a);
    n.out = point(n.x + Math.cos(angle) * b, n.y + Math.sin(angle) * b);
    n.smooth = true;
}
export function moveHandle(n, side, p, mirror = false) {
    n[side] = p;
    const other = side === 'in' ? 'out' : 'in';
    if ((n.smooth || mirror) && n[other]) {
        const len = mirror ? distance(n, p) : distance(n, n[other]), d = distance(n, p) || 1;
        n[other] = point(n.x - (p.x - n.x) * len / d, n.y - (p.y - n.y) * len / d);
    }
}
export function toSVG(cs, precision = 3) {
    const f = n => +n.toFixed(precision);
    let d = '';
    for (const c of cs) {
        if (!c.nodes.length)
            continue;
        d += `M${f(c.nodes[0].x)} ${f(c.nodes[0].y)}`;
        for (const s of segments(c))
            d += s.curve ? `C${f(s.p1.x)} ${f(s.p1.y)} ${f(s.p2.x)} ${f(s.p2.y)} ${f(s.p3.x)} ${f(s.p3.y)}` : `L${f(s.b.x)} ${f(s.b.y)}`;
        if (c.closed)
            d += 'Z';
    }
    return d;
}
export {parseSVGPath as fromSVG,parseSVGPath,arcToCubics} from './svg-path.js';
/** Approximate a cubic with quadratic splines using adaptive error-bounded subdivision. */
export function cubicToQuadratics(p0, p1, p2, p3, tolerance = .25, depth = 0) {
    const q = point((3 * p1.x - p0.x + 3 * p2.x - p3.x) / 4, (3 * p1.y - p0.y + 3 * p2.y - p3.y) / 4);
    // Difference between cubic and elevated quadratic has a control polygon bound.
    const a = mix(p0, q, 2 / 3), b = mix(p3, q, 2 / 3), error = Math.max(distance(a, p1), distance(b, p2));
    if (error <= tolerance || depth >= 12)
        return [{ control: q, end: point(p3.x, p3.y) }];
    const [l, r] = splitCubic(p0, p1, p2, p3);
    return [...cubicToQuadratics(...l, tolerance, depth + 1), ...cubicToQuadratics(...r, tolerance, depth + 1)];
}
export function contoursToQuadraticPoints(cs, tolerance = .25) {
    return cs.filter(c => c.closed && c.nodes.length > 1).map(c => {
        const pts = [{ x: c.nodes[0].x, y: c.nodes[0].y, on: true }];
        for (const s of segments(c)) {
            if (s.curve)
                for (const q of cubicToQuadratics(s.p0, s.p1, s.p2, s.p3, tolerance)) {
                    pts.push({ ...q.control, on: false }, { ...q.end, on: true });
                }
            else
                pts.push({ x: s.b.x, y: s.b.y, on: true });
        }
        if (pts.length > 1 && distance(pts[0], pts.at(-1)) < 1e-6)
            pts.pop();
        return pts;
    });
}
export function quadraticPointsToContour(pts) {
    if (!pts.length)
        return contour([]);
    let start = pts[0].on ? pts[0] : pts.at(-1).on ? pts.at(-1) : { ...mix(pts.at(-1), pts[0], .5), on: true };
    let seq = pts[0].on ? pts.slice(1) : pts.at(-1).on ? pts.slice(0, -1) : pts.slice();
    seq.push(start);
    const c = contour([node(start.x, start.y)]);
    let p = start;
    for (let i = 0; i < seq.length; i++) {
        const q = seq[i];
        if (q.on) {
            if (i < seq.length - 1)
                c.nodes.push(node(q.x, q.y));
            p = q;
        }
        else {
            const next = seq[i + 1] || start, r = next.on ? next : { ...mix(q, next, .5), on: true };
            c.nodes.at(-1).out = mix(p, q, 2 / 3);
            const h = mix(r, q, 2 / 3);
            if (next.on && i + 1 === seq.length - 1)
                c.nodes[0].in = h;
            else
                c.nodes.push(node(r.x, r.y, { in: h }));
            p = r;
            if (next.on)
                i++;
        }
    }
    return c;
}


export {analyzeContours,segmentProperties} from './analysis.js';
