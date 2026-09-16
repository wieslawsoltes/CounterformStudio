export function node(x: any, y: any, extra?: {}): {
    id: string;
    x: any;
    y: any;
    in: any;
    out: any;
    smooth: boolean;
};
export function rectangle(x: any, y: any, w: any, h: any): {
    id: string;
    closed: boolean;
    nodes: any[];
};
export function ellipse(cx: any, cy: any, rx: any, ry: any): {
    id: string;
    closed: boolean;
    nodes: any[];
};
export function segments(c: any): Generator<{
    index: number;
    a: any;
    b: any;
    p0: any;
    p1: any;
    p2: any;
    p3: any;
    curve: boolean;
}, void, unknown>;
export function cubicAt(p0: any, p1: any, p2: any, p3: any, t: any): {
    x: number;
    y: number;
};
export function cubicDerivative(p0: any, p1: any, p2: any, p3: any, t: any): {
    x: number;
    y: number;
};
export function splitCubic(p0: any, p1: any, p2: any, p3: any, t?: number): any[][];
export function extrema(p0: any, p1: any, p2: any, p3: any): number[];
export function bounds(contours: any): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    empty: boolean;
};
export function transformPoint(p: any, m: any): {
    x: any;
    y: any;
};
export function transformContours(cs: any, m: any, ids?: any): any;
export function multiply(a: any, b: any): any[];
export function invert(m: any): number[];
export function reverseContour(c: any): any;
export function splitSegment(c: any, index: any, t?: number): {
    id: string;
    x: any;
    y: any;
    in: any;
    out: any;
    smooth: boolean;
};
export function addExtrema(c: any): number;
export function flattenCubic(p0: any, p1: any, p2: any, p3: any, tolerance?: number, depth?: number, out?: any[]): any[];
export function flattenContour(c: any, tolerance?: number): {
    x: any;
    y: any;
}[];
export function signedArea(c: any): number;
export function containsPoint(c: any, p: any): boolean;
export function correctWinding(cs: any): any;
export function nearestOnContour(c: any, p: any): {
    distance: number;
    index: number;
    t: number;
    point: any;
};
export function smoothNode(c: any, index: any): void;
export function moveHandle(n: any, side: any, p: any, mirror?: boolean): void;
export function toSVG(cs: any, precision?: number): string;
/** SVG path parser supports M/L/H/V/C/S/Q/T/Z. Elliptical arcs are rejected, never silently lost. */
export function fromSVG(d: any): {
    id: string;
    closed: boolean;
    nodes: any[];
}[];
/** Approximate a cubic with quadratic splines using adaptive error-bounded subdivision. */
export function cubicToQuadratics(p0: any, p1: any, p2: any, p3: any, tolerance?: number, depth?: number): any;
export function contoursToQuadraticPoints(cs: any, tolerance?: number): any;
export function quadraticPointsToContour(pts: any): {
    id: string;
    closed: boolean;
    nodes: any[];
};
/** Double-precision outline geometry. Coordinate space is font units, y upwards.
 * A contour stores endpoint nodes; handles are absolute coordinates on each node.
 * The edge i→i+1 is cubic if either handle exists, otherwise linear.
 */
export const EPSILON: 1e-9;
export function uid(prefix?: string): string;
export function clamp(v: any, lo: any, hi: any): number;
export function lerp(a: any, b: any, t: any): any;
export function mix(a: any, b: any, t: any): {
    x: any;
    y: any;
};
export function distance(a: any, b: any): number;
export function point(x: any, y: any): {
    x: any;
    y: any;
};
export function contour(nodes?: any[], closed?: boolean): {
    id: string;
    closed: boolean;
    nodes: any[];
};
