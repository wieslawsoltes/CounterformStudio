import { ReactiveObject } from '@wieslawsoltes/reactiveweb';
import { SourceCache } from '@wieslawsoltes/dynamicdataweb';
import { FontDocument } from '@wieslawsoltes/counterform-model';
import { History } from '@wieslawsoltes/counterform-history';
import { CommandRegistry } from '@wieslawsoltes/counterform-commands';
import { FlatTreeDataGridSource } from '@wieslawsoltes/treedatagridweb';
import { Workbook } from '@wieslawsoltes/gridweb';
export interface GlyphRow { id:string;name:string;unicode:string;character:string;advance:number;contours:number;components:number;export:boolean;category:string;mark:string; }
export declare const escapeHTML:(value:unknown)=>string;
export declare const componentVersions:Record<string,string>;
export declare class StudioState extends ReactiveObject {
 constructor(doc:FontDocument); doc:FontDocument; glyphs:SourceCache<GlyphRow,string>;
 row(glyph:any):GlyphRow; sync(id?:string):void; Dispose():void;
}
export declare class GlyphTiles {
 constructor(host:HTMLElement,doc:FontDocument,state:StudioState,onSelect:(id:string)=>void,options?:{cellSize?:number;category?:boolean});
 rows:GlyphRow[];onOpen?:(id:string)=>void;filter():void;render():void;schedule():void;dispose():void;
}
export declare function createGlyphTable(doc:FontDocument,state:StudioState,history:History,onSelect:(id:string)=>void):{element:HTMLElement;source:FlatTreeDataGridSource<GlyphRow>;dispose():void};
export declare function createRibbon(registry:CommandRegistry,tabs:{id:string;label:string;groups:{id:string;label:string;commands:string[]}[]}[],options?:{theme?:string}):HTMLElement;
export declare function createKerningMatrix(doc:FontDocument,history:History,getMasterId:()=>string,options?:{onError?:(error:Error)=>void}):{element:HTMLElement;workbook:Workbook;refresh():void;dispose():void};
export declare function createNotes(doc:FontDocument,history:History):{element:HTMLElement;flush():void;dispose():void};
