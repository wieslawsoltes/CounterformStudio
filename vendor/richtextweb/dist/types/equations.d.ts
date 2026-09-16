import { type MarkupNode } from "./formats-markup.js";
import type { DocumentNode, EquationInputFormat } from "./model.js";
export interface EquationOptions {
    Source: string;
    Format?: EquationInputFormat;
    DisplayMode?: boolean;
    AlternativeText?: string;
}
export interface EquationRenderResult {
    readonly SVG: string;
    readonly MathML: string;
    readonly WidthEx: number;
    readonly HeightEx: number;
    readonly DepthEx: number;
    readonly Text: string;
}
export interface EquationTemplate {
    Name: string;
    Category: string;
    Source: string;
}
/** Templates are ordinary editable TeX, not images or executable macros. */
export declare const EquationTemplates: readonly EquationTemplate[];
/** Strictly bounded, inert presentation MathML. No XML entities, HTML, links, or actions. */
export declare function sanitizeMathML(source: string): string;
/** Synchronous deterministic vector math. SVG outlines need no font binaries, network, or DOM. */
export declare function renderEquation(options: EquationOptions | string): EquationRenderResult;
export declare function clearEquationCache(): void;
export declare function equationOptions(node: DocumentNode): EquationOptions;
export declare function equationToMathML(options: EquationOptions | string): string;
export declare function equationToSVG(options: EquationOptions | string): string;
export interface MathToken {
    Path: number[];
    Kind: string;
    Text: string;
}
export declare function equationTokens(mathML: string): MathToken[];
export declare function serializeMathNode(node: MarkupNode): string;
/** Replace a selected visual token with text or a structural MathML expression. */
export declare function replaceEquationToken(mathML: string, path: readonly number[], text: string, structure?: "fraction" | "power" | "subscript" | "root" | "sum" | "integral" | "matrix"): string;
export * from "./equation-structure.js";
