import type {SVGContour} from '@wieslawsoltes/counterform-geometry';
type Affine=[number,number,number,number,number,number];
export function parseSVGTransform(text?:string):Affine;
export function svgViewportTransform(viewBox:[number,number,number,number],width:number,height:number,preserveAspectRatio?:string):Affine;
/** Bounded editable-vector extraction; no network or executable document content. */
export function readSVGOutlines(text:string,options?:{maxNodes?:number;maxElements?:number}):{contours:SVGContour[];warnings:string[];nodeCount:number};
