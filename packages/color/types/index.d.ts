export interface ColorLayer { glyphId: string; paletteIndex: number; }
export interface ColorGlyph { id: string; name: string; export?: boolean; colorLayers?: ColorLayer[]; }
export interface ColorSource { glyphs: ColorGlyph[]; palettes: string[][]; }
export declare const FOREGROUND: 65535;
export declare function parseColor(value: string): [number, number, number, number];
export declare function validateColorSource<T extends ColorSource>(source: T): T;
export declare function compileColorTables(source: ColorSource, glyphOrder: ColorGlyph[]): Map<string, Uint8Array>;
export declare function readColorTables(colr: Uint8Array, cpal: Uint8Array, glyphOrder: ColorGlyph[]): {palettes:string[][];colorLayers:Map<string,ColorLayer[]>};
