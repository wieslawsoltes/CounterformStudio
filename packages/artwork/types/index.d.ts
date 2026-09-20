export type Affine=[number,number,number,number,number,number];
export interface ArtworkPoint {x:number;y:number;}
export interface ArtworkNode extends ArtworkPoint {id:string;in:ArtworkPoint|null;out:ArtworkPoint|null;smooth:boolean;}
export interface ArtworkContour {id:string;closed:boolean;nodes:ArtworkNode[];}
export interface ReferenceBase {id:string;name:string;transform:Affine;opacity:number;visible:boolean;locked:boolean;}
export interface BitmapReference extends ReferenceBase {kind:'bitmap';png:string;width:number;height:number;}
export interface VectorReference extends ReferenceBase {kind:'vector';contours:ArtworkContour[];}
export type ArtworkReference=BitmapReference|VectorReference;
export const ARTWORK_LIMITS:Readonly<{maxReferences:number;maxPixels:number;maxDimension:number;maxBytes:number;maxDocumentBytes:number;maxPoints:number}>;
export function bytesToBase64(bytes:Uint8Array):string;
export function bytesFromBase64(text:string):Uint8Array;
export function inspectPNG(bytes:Uint8Array):{width:number;height:number;bitDepth:number;colorType:number;byteLength:number};
export function validateArtwork(references:unknown):{bytes:number;points:number;pixels:number};
export function createBitmapReference(bytes:Uint8Array,options?:{name?:string;transform?:Affine;opacity?:number}):BitmapReference;
export function createVectorReference(contours:ArtworkContour[],options?:{name?:string;transform?:Affine;opacity?:number}):VectorReference;
export function duplicateReference<T extends ArtworkReference>(reference:T):T;
export function referenceContours(reference:VectorReference):ArtworkContour[];
export function referenceBounds(reference:ArtworkReference):{minX:number;minY:number;maxX:number;maxY:number;width:number;height:number;empty:boolean};
