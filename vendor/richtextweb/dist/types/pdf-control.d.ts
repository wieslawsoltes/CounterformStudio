import { FlowDocument } from "./model.js";
import type { PDFTextOperator, PDFTextInspection, PDFTextReplacementOptions, PDFSourceTextReplaceOptions, PDFTextEditResult } from "./pdf-operators.js";
import { PDFEditor, type PDFExportOptions, type PDFTextOptions, type PDFRectangleOptions, type PDFImageOptions } from "./formats-pdf.js";
import { type PDFImportOptions, type PDFTextGeometry } from "./pdf-import.js";
declare const HTMLElementBase: typeof HTMLElement;
export type PDFTool = "select" | "text" | "highlight" | "rectangle" | "cover" | "image";
export interface PDFSearchMatch extends PDFTextGeometry {
    pageIndex: number;
    text: string;
    matchIndex: number;
}
/** Reusable PDF viewer, page/overlay editor, and reconstructed-flow editing surface. */
export declare class PDFEditorControl extends HTMLElementBase {
    static get observedAttributes(): string[];
    /** Default font/page settings used by ExportReflow and its built-in download button. */
    ReflowExportOptions: PDFExportOptions;
    private _engine;
    private _handle;
    private _importOptions;
    private _pageIndex;
    private _zoom;
    private _readonly;
    private _tool;
    private _viewMode;
    private _flow;
    private _flowDocument;
    private _viewport;
    private _renderTask;
    private _textLayer;
    private _renderVersion;
    private _loadVersion;
    private _disposed;
    private _history;
    private _future;
    private _pending;
    private _pageCache;
    private _matches;
    private _matchIndex;
    private _imageBytes;
    private _sourceOperators;
    private _selectedSourceId;
    private _flowToolbar;
    /** Optional font options used by the built-in original-text replacement tools. */
    SourceTextReplacementOptions: PDFTextReplacementOptions;
    private _drag;
    private _canvas;
    private _page;
    private _scroll;
    private _textContainer;
    private _searchLayer;
    private _status;
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    get Engine(): PDFEditor | null;
    get PageCount(): number;
    get PageIndex(): number;
    set PageIndex(value: number);
    get Zoom(): number;
    set Zoom(value: number);
    get IsReadOnly(): boolean;
    set IsReadOnly(value: boolean);
    get Tool(): PDFTool;
    set Tool(value: PDFTool);
    get ViewMode(): "pdf" | "flow";
    set ViewMode(value: "pdf" | "flow");
    get FlowDocument(): FlowDocument | null;
    get CanUndo(): boolean;
    get CanRedo(): boolean;
    Load(bytes: Uint8Array | ArrayBuffer, options?: PDFImportOptions): Promise<void>;
    /** Saves the source PDF plus original-text, page and overlay edits. Flow edits are exported separately. */
    Save(): Promise<Uint8Array>;
    /** Refresh after callers mutate Engine directly; direct mutations do not enter control history. */
    Refresh(): Promise<void>;
    /** Inspect original page/Form text operators independently of PDF.js display grouping. */
    GetTextOperators(pageIndex?: number): Promise<PDFTextInspection>;
    get SelectedTextOperator(): PDFTextOperator | null;
    /** Populate the control's original-text picker for the current page. */
    InspectSourceText(): Promise<PDFTextInspection>;
    SelectTextOperator(operatorId: string): void;
    ReplaceTextOperator(pageIndex: number, operatorId: string, replacement: string, options?: PDFTextReplacementOptions): Promise<PDFTextEditResult>;
    ReplaceSourceText(query: string, replacement: string, options?: PDFSourceTextReplaceOptions): Promise<PDFTextEditResult>;
    AddText(pageIndex: number, text: string, options: PDFTextOptions): Promise<void>;
    AddImage(pageIndex: number, source: string | Uint8Array | ArrayBuffer, options: PDFImageOptions): Promise<void>;
    Highlight(pageIndex: number, options: PDFRectangleOptions): Promise<void>;
    DrawRectangle(pageIndex: number, options: PDFRectangleOptions): Promise<void>;
    CoverRegion(pageIndex: number, options: PDFRectangleOptions): Promise<void>;
    RotatePage(pageIndex: number, degrees: number): Promise<void>;
    ReorderPages(order: readonly number[]): Promise<void>;
    DeletePages(indices: readonly number[]): Promise<void>;
    AddPage(width?: number, height?: number): Promise<void>;
    InsertPages(bytes: Uint8Array | ArrayBuffer, indices?: readonly number[], insertionIndex?: number): Promise<void>;
    Undo(): Promise<void>;
    Redo(): Promise<void>;
    ImportToFlowDocument(options?: PDFImportOptions): Promise<FlowDocument>;
    ExportReflow(options?: PDFExportOptions): Promise<Uint8Array>;
    Find(query: string, options?: {
        caseSensitive?: boolean;
    }): Promise<PDFSearchMatch[]>;
    FitWidth(): Promise<void>;
    Dispose(): Promise<void>;
    private requiredEngine;
    private assertActive;
    private assertWritable;
    private emit;
    private status;
    private reportError;
    private input;
    private enqueue;
    private mutate;
    private restore;
    private render;
    private clearSourceSelection;
    private selectSourceAt;
    private drawSearch;
    private updateToolbar;
    private fileSelected;
    private command;
    private localPoint;
    private pointerDown;
    private pointerMove;
    private pointerUp;
}
export declare function registerPDFEditor(registry?: CustomElementRegistry | undefined): void;
export {};
