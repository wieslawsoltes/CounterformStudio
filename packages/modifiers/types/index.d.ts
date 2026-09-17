export interface Point {x:number;y:number;}
export interface Node extends Point {id:string;in:Point|null;out:Point|null;smooth:boolean;}
export interface Contour {id:string;closed:boolean;nodes:Node[];}
export interface Modifier {type:'translate'|'scale'|'rotate'|'slant'|'matrix'|'round'|'reverse'|'repeat';enabled?:boolean;x?:number;y?:number;angle?:number;grid?:number;count?:number;origin?:Point;matrix?:[number,number,number,number,number,number];}
export declare const modifierKinds:readonly Modifier['type'][];
export declare function validateModifiers(stack?:Modifier[]):Modifier[];
export declare function evaluateModifiers(contours:Contour[],stack?:Modifier[],options?:{maxNodes?:number}):Contour[];
