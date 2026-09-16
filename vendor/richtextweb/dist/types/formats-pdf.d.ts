import { FlowDocument } from "./model.js";
import { type PDFTextInspection, type PDFTextReplacementOptions, type PDFSourceTextReplaceOptions, type PDFTextEditResult } from "./pdf-operators.js";
export type { PDFTextOperator, PDFTextDiagnostic, PDFTextInspection, PDFTextReplacementOptions, PDFSourceTextReplaceOptions, PDFTextEditResult, } from "./pdf-operators.js";
/** PDF coordinates are points (1/72 inch). FlowDocument dimensions are CSS pixels. */
export interface PDFExportOptions {
    /** Override page size in PDF points. Default is A4, or the document's CSS pixel page size. */
    pageWidth?: number;
    pageHeight?: number;
    /** Override page margins in PDF points. */
    margin?: number | {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    title?: string;
    author?: string;
    subject?: string;
    /** Standard PDF fonts cover WinAnsi. Unsupported characters throw by default. */
    unsupportedGlyphs?: "error" | "replace";
    /** Embed a supplied TTF/OTF font. Its character map is checked before drawing. */
    fontBytes?: Uint8Array | ArrayBuffer;
    /** Optional style faces. An absent face uses fontBytes, retaining the supplied font's actual face. */
    fontStyleBytes?: {
        bold?: Uint8Array | ArrayBuffer;
        italic?: Uint8Array | ArrayBuffer;
        boldItalic?: Uint8Array | ArrayBuffer;
    };
    /** Called for each explicitly replaced unsupported character. */
    onWarning?: (message: string) => void;
    /** Text drawn in the bottom margin after pagination. */
    pageNumbers?: boolean;
}
export interface PDFPageInfo {
    index: number;
    width: number;
    height: number;
    rotation: number;
}
export interface PDFTextOptions {
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: "Helvetica" | "Times" | "Courier";
    bold?: boolean;
    italic?: boolean;
    color?: string;
    opacity?: number;
    maxWidth?: number;
    lineHeight?: number;
    /** Embed a custom font for this overlay. Supersedes fontFamily, bold and italic. */
    fontBytes?: Uint8Array | ArrayBuffer;
}
export interface PDFRectangleOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
}
export interface PDFImageOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    opacity?: number;
}
/** Export the canonical flow model to a paginated, selectable-text PDF. */
export declare function toPDF(document: FlowDocument, options?: PDFExportOptions): Promise<Uint8Array>;
/**
 * Edits existing PDF pages by adding drawing operators and reorganizing pages.
 * Covers/highlights are visual overlays: original content remains recoverable.
 * Source text edits rewrite actual operators. They do not constitute a document-wide redaction audit.
 */
export declare class PDFEditor {
    private pdf;
    private sourceQueue;
    private mutationRevision;
    private constructor();
    static Load(bytes: Uint8Array | ArrayBuffer): Promise<PDFEditor>;
    static Create(): Promise<PDFEditor>;
    get PageCount(): number;
    GetPages(): PDFPageInfo[];
    private page;
    /** Adds text without modifying existing text content. Coordinates use the unrotated PDF page. */
    AddText(pageIndex: number, text: string, options: PDFTextOptions): Promise<void>;
    AddImage(pageIndex: number, source: string | Uint8Array | ArrayBuffer, options: PDFImageOptions): Promise<void>;
    DrawRectangle(pageIndex: number, options: PDFRectangleOptions): void;
    Highlight(pageIndex: number, region: Omit<PDFRectangleOptions, "opacity"> & {
        opacity?: number;
    }): void;
    /** Visual covering only. This does not remove text, images, metadata, or sensitive information. */
    CoverRegion(pageIndex: number, region: Omit<PDFRectangleOptions, "opacity">): void;
    /** Sets absolute rotation; accepts integer multiples of 90 degrees. */
    RotatePage(pageIndex: number, rotation: number): void;
    /** All existing page indices must appear exactly once. */
    ReorderPages(order: readonly number[]): void;
    DeletePages(indices: readonly number[]): void;
    AddPage(width?: number, height?: number): number;
    /** Copies selected pages from another PDF into this document. Defaults to appending all source pages. */
    InsertPages(bytes: Uint8Array | ArrayBuffer, indices?: readonly number[], insertionIndex?: number): Promise<void>;
    /** Inspect actual text-showing operators in page streams and nested Form XObjects. */
    GetTextOperators(pageIndex?: number): Promise<PDFTextInspection>;
    /** Replace original text, retaining its font unless a replacement font is supplied. */
    ReplaceTextOperator(pageIndex: number, operatorId: string, replacement: string, options?: PDFTextReplacementOptions): Promise<PDFTextEditResult>;
    /** Replace literal matches within original text-showing operators, with an atomic preflight. */
    ReplaceSourceText(query: string, replacement: string, options?: PDFSourceTextReplaceOptions): Promise<PDFTextEditResult>;
    private editSource;
    Save(): Promise<Uint8Array>;
    private coordinates;
    private opacity;
}
