export interface Point {x:number;y:number;pressure?:number}
export interface Node extends Point {id:string;in:Point|null;out:Point|null;smooth:boolean}
export interface Contour {id:string;closed:boolean;nodes:Node[]}
export declare function polygon(cx:number,cy:number,rx:number,ry:number,sides?:number,inner?:number,rotation?:number):Contour;
export declare function roundedRectangle(x:number,y:number,w:number,h:number,radius?:number):Contour;
export declare function simplifyPolyline(points:Point[],tolerance?:number):Point[];
export declare function strokePolyline(points:Point[],width?:number,options?:{miterLimit?:number}):Contour;
export declare function openContourAt(source:Contour,index:number):Contour;
export declare function cutContourAt(source:Contour,index:number,t?:number):Contour[];
export declare function joinContours(first:Contour,firstEnd:number,second:Contour,secondEnd:number):Contour;
export declare function lineIntersections(source:Contour,a:Point,b:Point):{index:number;t:number;point:Point}[];
export declare function knifeContour(source:Contour,a:Point,b:Point):Contour[];
export declare function convertSegments(source:Contour,curve:boolean,selected?:Set<string>|null):Contour;
export declare function distributeNodes(contours:Contour[],selection:Set<string>,axis:'x'|'y'):void;
