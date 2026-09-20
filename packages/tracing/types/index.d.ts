export interface Point {x:number;y:number;}
export interface TraceNode extends Point {id:string;in:Point|null;out:Point|null;smooth:boolean;}
export interface TraceContour {id:string;closed:boolean;nodes:TraceNode[];}
export interface Raster {width:number;height:number;pixels:Uint8Array|Uint8ClampedArray;}
export interface BinaryRaster {width:number;height:number;mask:Uint8Array;}
export interface TraceOptions {threshold?:number|null;invert?:boolean;minComponentPixels?:number;curves?:boolean;tolerance?:number;idPrefix?:string;maxEdges?:number;maxContours?:number;}
export interface TraceResult {contours:TraceContour[];areas:number[];width:number;height:number;inkPixels:number;removedPixels:number;edgeCount:number;pointCount:number;errorBound:number;holes:number;approximate:boolean;warnings:string[];}
export const TRACE_LIMITS:Readonly<{maxPixels:number;maxDimension:number;maxEdges:number;maxContours:number;maxPoints:number}>;
export function validateRaster(image:unknown):Raster;
export function otsuThreshold(histogram:ArrayLike<number>):number;
export function thresholdRaster(image:Raster,options?:TraceOptions):BinaryRaster&{threshold:number;inkPixels:number};
export function traceMask(image:BinaryRaster,options?:TraceOptions):TraceResult;
export function traceBitmap(image:Raster,options?:TraceOptions):TraceResult&{threshold:number};
export function fitPolyline(points:Point[],options?:{tolerance?:number;closed?:boolean;idPrefix?:string;maxPoints?:number;maxWork?:number}):{contour:TraceContour;errorBound:number;inputPoints:number;work:number};
