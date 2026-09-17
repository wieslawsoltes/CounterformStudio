import type {ColorPaintGlyph} from '@wieslawsoltes/counterform-colrv1';
export interface ColorLayer {glyphId:string;paletteIndex:number;}
export interface ColorGlyph extends ColorPaintGlyph {name:string;colorLayers?:ColorLayer[];}
export interface PaletteMetadata {paletteTypes?:number[];paletteLabels?:string[];paletteEntryLabels?:string[];}
export interface ColorSource extends PaletteMetadata {glyphs:ColorGlyph[];palettes:string[][];}
export interface PaletteNamePlan {names:[number,string][];paletteLabels?:number[];paletteEntryLabels?:number[];}
export declare const FOREGROUND:65535;
export declare function parseColor(value:string):[number,number,number,number];
export declare function validateColorSource<T extends ColorSource>(source:T):T;
export declare function createPaletteNamePlan(source:PaletteMetadata,extraNames?:[number,string][]):PaletteNamePlan;
export declare function compileColorTables(source:ColorSource,glyphOrder:ColorGlyph[],options?:{namePlan?:PaletteNamePlan}):Map<string,Uint8Array>;
export declare function readColorTables(colr:Uint8Array,cpal:Uint8Array,glyphOrder:ColorGlyph[],options?:{names?:Map<number,string>}):PaletteMetadata & {palettes:string[][];colorLayers:Map<string,ColorLayer[]>;colorPaints:Map<string,import('@wieslawsoltes/counterform-colrv1').Paint>;colorClips:Map<string,[number,number,number,number]>;paletteLabelIds?:number[];paletteEntryLabelIds?:number[]};
