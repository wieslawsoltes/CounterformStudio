import type {Modifier} from '@wieslawsoltes/counterform-modifiers';
export interface Point {x:number;y:number;}
export interface OutlineNode extends Point {id:string;in:Point|null;out:Point|null;smooth:boolean;}
export interface Contour {id:string;closed:boolean;nodes:OutlineNode[];}
export type Affine = [number,number,number,number,number,number];
export interface Component {id?:string;glyphId?:string;glyphName?:string;transform:Affine;}
export interface Anchor extends Point {name:string;}
export interface Guide extends Point {angle:number;}
export interface Layer {modifiers?:Modifier[];id:string;masterId:string;name:string;contours:Contour[];components:Component[];anchors:Anchor[];guides:Guide[];color:string;visible:boolean;locked:boolean;advanceWidth:number;}
export interface ColorLayer {glyphId:string;paletteIndex:number;}
export interface Glyph {colorLayers?:ColorLayer[];id:string;name:string;unicodes:number[];category:string;mark:string;export:boolean;note:string;layers:Layer[];}
export interface Axis {tag:string;name:string;min:number;default:number;max:number;}
export interface Master {metrics?:Partial<Pick<FontInfo,"ascender"|"descender"|"lineGap"|"capHeight"|"xHeight">>;id:string;name:string;location:Record<string,number>;}
export interface Instance {name:string;location:Record<string,number>;}
export interface FontInfo {familyName:string;styleName:string;unitsPerEm:number;ascender:number;descender:number;capHeight:number;xHeight:number;lineGap:number;italicAngle:number;weightClass:number;widthClass:number;designer:string;manufacturer:string;copyright:string;license:string;versionMajor:number;versionMinor:number;}
export interface FontSource {originalFont?:{format:1;filename:string;bytes:string;sha256:string;sourceSha256:string;structureSha256:string;info:Record<string,unknown>};format:'counterform';version:1;id:string;info:FontInfo;axes:Axis[];masters:Master[];instances:Instance[];glyphs:Glyph[];kerning:Record<string,Record<string,number>>;groups:Record<string,string[]>;features:string;palettes:string[][];notes:string;richNotes?:unknown;importInfo:unknown;}
export interface DocumentChange {kind:string;glyphId?:string|null;revision:number;}
export declare class Signal<T=any> {subscribe(fn:(value:T)=>void):()=>void;emit(value:T):void;clear():void;}
export declare function createLayer(masterId:string,contours?:Contour[]):Layer;
export declare function createGlyph(name:string,unicode?:number|null,masters?:(string|Master)[]):Glyph;
export declare function createFont(familyName?:string,styleName?:string):FontSource;
export declare class FontDocument {
 constructor(data?:FontSource);data:FontSource;changed:Signal<DocumentChange>;revision:number;savedRevision:number;
 readonly info:FontInfo;readonly dirty:boolean;
 replace(data:FontSource,notify?:boolean):void;reindex():void;glyph(idOrName:string):Glyph|undefined;char(codePoint:number|string):Glyph|undefined;
 layer(glyphId:string,masterId?:string):Layer|undefined;touch(kind?:string,glyphId?:string|null):void;replaceGlyph(id:string,glyph:Glyph):void;addGlyph(glyph:Glyph):Glyph;
 markSaved():void;serialize():string;resolve(glyphId:string,masterId?:string,visited?:Set<string>,depth?:number):Contour[];
 metrics(glyphId:string,masterId?:string):({minX:number;minY:number;maxX:number;maxY:number;width:number;height:number;empty:boolean;advanceWidth:number;lsb:number;rsb:number})|null;
 dispose():void;
}
export declare function validateDocumentShape(data:unknown):FontSource;
export declare function duplicateGlyph(glyph:Glyph,newName:string):Glyph;
export declare function setSidebearing(doc:FontDocument,glyphId:string,masterId:string,side:'left'|'right',value:number):void;
export declare function addMaster(doc:FontDocument,name:string,location:Record<string,number>,sourceId?:string):string;
export declare function demoOutlines(character:string,width?:number):Contour[];
export declare function createDemoFont():FontDocument;
