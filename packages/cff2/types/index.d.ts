import type {FontDocument,Contour} from '@wieslawsoltes/counterform-model';
import type {VariationModel} from '@wieslawsoltes/counterform-variations';
export function compileCFF2Table(masterContours:Contour[][][],options?:{unitsPerEm?:number;axes?:{tag:string}[];model?:VariationModel|null}):Uint8Array;
export function compileOpenTypeCFF2(doc:FontDocument,options?:{variable?:boolean;masterId?:string}):Uint8Array;
