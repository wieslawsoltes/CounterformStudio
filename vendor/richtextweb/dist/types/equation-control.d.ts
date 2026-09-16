import { type MatrixEdit, type EquationMatrixPosition, type EquationOptions, type EquationRenderResult, type MathToken } from "./equations.js";
import type { EquationInputFormat } from "./model.js";
declare const HTMLElementBase: typeof HTMLElement;
export type EquationStructure = "fraction" | "power" | "subscript" | "root" | "sum" | "integral" | "matrix";
/** Reusable visual math workbench. Apply its Value to any engine or host framework. */
export declare class EquationEditor extends HTMLElementBase {
    private value;
    private undo;
    private redo;
    private result;
    private tokens;
    private selected;
    private error;
    private timer;
    private locked;
    private sourceInput;
    private preview;
    private status;
    private tokenSelect;
    private tokenInput;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    get Value(): EquationOptions;
    set Value(value: EquationOptions);
    get Source(): string;
    set Source(value: string);
    get Format(): EquationInputFormat;
    set Format(value: EquationInputFormat);
    /** Convert a valid equation, or interpret a replacement draft in its requested format.
     * Failed conversions preserve the source and history. The Format setter remains
     * available for callers that explicitly want to change only interpretation.
     */
    ConvertFormat(format: EquationInputFormat): boolean;
    get DisplayMode(): boolean;
    set DisplayMode(value: boolean);
    get IsReadOnly(): boolean;
    set IsReadOnly(value: boolean);
    get IsValid(): boolean;
    get Error(): string;
    get RenderResult(): EquationRenderResult | null;
    get CanUndo(): boolean;
    get CanRedo(): boolean;
    get SelectedToken(): Readonly<MathToken> | null;
    Validate(): boolean;
    SelectToken(index: number): void;
    ReplaceToken(text: string, structure?: EquationStructure): void;
    get SelectedMatrix(): EquationMatrixPosition | null;
    EditMatrix(operation: MatrixEdit): void;
    InsertToken(text: string, before?: boolean): void;
    DeleteToken(): void;
    private validSelection;
    InsertTemplate(name: string): void;
    Undo(): boolean;
    Redo(): boolean;
    Dispose(): void;
    private change;
    private refreshValue;
    private emitValue;
    private render;
    private button;
    private renderPreview;
    private updateTokenSelection;
}
export declare function registerEquationEditor(registry?: CustomElementRegistry | undefined): void;
declare global {
    interface HTMLElementTagNameMap {
        "rich-equation-editor": EquationEditor;
    }
}
export {};
