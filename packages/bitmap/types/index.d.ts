export interface BitmapStrike {id:string;ppem:number;ppi:number;}
export interface BitmapFont {format:'sbix'|'cbdt'|'both';overlay:boolean;strikes:BitmapStrike[];}
export interface BitmapGlyph {strikeId:string;png:string;x:number;y:number;advance?:number;vertical?:{x:number;y:number;advance:number};}
export interface BitmapSource {bitmapFont?:BitmapFont;glyphs:{id:string;bitmaps?:BitmapGlyph[]}[];info?:{unitsPerEm:number};}
export interface DecodedBitmaps {bitmapFont:BitmapFont;bitmaps:Map<string,BitmapGlyph[]>;}
export const BITMAP_LIMITS:Readonly<{strikes:number;entries:number;bytes:number;pixels:number}>;
export function prepareBitmapPNG(bytes:Uint8Array):Uint8Array;
export function createBitmapGlyph(strikeId:string,bytes:Uint8Array,options?:Pick<BitmapGlyph,'x'|'y'|'advance'|'vertical'>|Partial<Pick<BitmapGlyph,'x'|'y'|'advance'|'vertical'>>):BitmapGlyph;
export function validateBitmapSource(source:BitmapSource,glyphs?:BitmapSource['glyphs']):{bytes:number;pixels:number;entries:number};
export function encodeSbix(source:BitmapSource,glyphs?:BitmapSource['glyphs']):Uint8Array|null;
export function decodeSbix(bytes:Uint8Array,glyphIds:string[]):DecodedBitmaps;
export function encodeCBDT(source:BitmapSource,glyphs?:BitmapSource['glyphs'],advances?:number[]):Map<string,Uint8Array>;
export function decodeCBDT(cbdt:Uint8Array,cblc:Uint8Array,glyphIds:string[]):DecodedBitmaps;
export function compileBitmapTables(source:BitmapSource,glyphs?:BitmapSource['glyphs'],advances?:number[]):Map<string,Uint8Array>;
export function readBitmapTables(tables:Map<string,Uint8Array|{bytes:Uint8Array}>,glyphIds:string[]):{bitmapFont?:BitmapFont;bitmaps:Map<string,BitmapGlyph[]>;warnings:string[];supported:string[]};
