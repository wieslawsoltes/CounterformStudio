export type ValueRecord = [number, number, number, number];
export interface FeatureScope { flags?: number; markFilteringSet?:number|null; script?: string | null; language?: string; exclude?: boolean; required?: boolean; offset?: number }
export interface ContextItem { glyphs: string[]; class: boolean; marked: boolean; lookups: string[]; value?: ValueRecord }
export interface AttachmentAnchor {x:number;y:number;point?:number}
export interface MarkAnchor {name:string;anchor:AttachmentAnchor|null}
export type FeatureRule = FeatureScope & (
    {type:'cursivePos';glyphs:string[];entry:AttachmentAnchor|null;exit:AttachmentAnchor|null} |
    {type:'basePos'|'ligaturePos'|'markPos';glyphs:string[];components:MarkAnchor[][]} |
    { type: 'single'; from: string; to: string } |
    { type: 'multiple' | 'alternate'; from: string; to: string[] } |
    { type: 'ligature'; input: string[]; output: string } |
    { type: 'singlePos'; glyph: string; value: ValueRecord } |
    { type: 'pairFull'; left: string; right: string; value1: ValueRecord; value2: ValueRecord } |
    { type: 'pair'; left: string; right: string; value: number } |
    { type: 'contextSub' | 'reverse'; input: ContextItem[]; output: string[][]; outputClass: boolean; replacement: boolean; first: number; last: number; ignore: boolean } |
    { type: 'contextPos'; input: ContextItem[]; first: number; last: number; ignore: boolean } |
    { type: 'lookup'; name: string } | { type: 'break' }
);
export interface FeatureProgram {
    pointReferences:{glyph:string;point:number}[];hasContourPoints:boolean;
    markClasses:Record<string,{glyph:string;anchor:AttachmentAnchor}[]>;
    anchorDefinitions:Record<string,AttachmentAnchor>;
    glyphClasses:Record<string,number>;
    markFilteringSets:string[][];
    markAttachmentClasses:string[][];
    classes: Record<string, string[]>;
    features: { tag: string; rules: FeatureRule[] }[];
    lookups: Record<string, FeatureRule[]>;
    languages: { script: string; language: string }[];
}
export interface LayoutLookup { type: number; flags?: number; markFilteringSet?:number|null; bytes?: Uint8Array; subtables?: Uint8Array[] }
export interface LayoutSelection { tag: string; index: number; scope?: FeatureScope }
export interface LayoutPlan { languages: FeatureProgram['languages']; selections: LayoutSelection[] }
export interface KerningPair { left: number; right: number; value: number; variation?: {outer: number; inner: number} | null }
export function parseFeatures(source: string, glyphNames?: string[]): FeatureProgram;
export function pairKey(left: string, right: string): string;
export function parsePairKey(key: string): [string, string];
export function kerningValue(data: any, masterId: string, left: string, right: string): number;
export function expandKerning(data: any, masterId: string, glyphs: any[]): KerningPair[];
export function layoutTable(features: Map<string, number[]>, lookups: LayoutLookup[], plan?: LayoutPlan | null, which?: 'sub' | 'pos'): Uint8Array | null;
export function compileLayout(data: any, glyphs: any[], masterId: string, variationModel?: any): {tables: Map<string, Uint8Array>; parsed: FeatureProgram; kern: KerningPair[]};
export function compileKern(pairs: KerningPair[]): Uint8Array | null;
export function readKern(bytes: Uint8Array): KerningPair[];
