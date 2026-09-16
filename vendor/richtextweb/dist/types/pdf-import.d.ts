import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/src/display/api.js";
import { FlowDocument } from "./model.js";
export interface PDFConfiguration {
    workerSrc?: string;
    cMapUrl?: string;
    standardFontDataUrl?: string;
    wasmUrl?: string;
    iccUrl?: string;
}
export interface PDFImportOptions extends PDFConfiguration {
    password?: string;
    /** Spatial order reconstructs lines and columns. Content order follows PDF text operators. */
    readingOrder?: "layout" | "content";
    preservePageBreaks?: boolean;
    /** Default 500; exceeding a limit rejects rather than truncating the document. */
    maxPages?: number;
    /** Default 200000 extracted text items across the document. */
    maxTextItems?: number;
    signal?: AbortSignal;
    onWarning?: (warning: string) => void;
}
export interface PDFTextGeometry {
    /** Coordinates in points, relative to the displayed page's top-left corner. */
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface PDFExtractedRun extends PDFTextGeometry {
    text: string;
    fontName: string;
    fontFamily: string;
    fontSize: number;
    bold: boolean;
    italic: boolean;
    direction: string;
    /** Original PDF text transform in unrotated PDF coordinates. */
    transform: number[];
    sourceIndex: number;
}
export interface PDFExtractedLine extends PDFTextGeometry {
    text: string;
    runs: PDFExtractedRun[];
    column: number;
}
export interface PDFExtractedPage {
    index: number;
    /** Unrotated page crop-box size in PDF points. */
    width: number;
    height: number;
    displayWidth: number;
    displayHeight: number;
    rotation: number;
    cropBox: number[];
    text: string;
    lines: PDFExtractedLine[];
}
export interface PDFImportResult {
    document: FlowDocument;
    pages: PDFExtractedPage[];
    warnings: string[];
    metadata: Record<string, unknown>;
}
/** Configure same-origin or CORS-enabled PDF.js assets once per application. */
export declare function configurePDF(options: PDFConfiguration): void;
export declare function configurePDFWorker(workerSrc: string): void;
/** Internal shared loader. Bytes are copied so PDF.js cannot detach caller-owned buffers. */
export declare function openPDFDocument(bytes: Uint8Array | ArrayBuffer, options?: PDFImportOptions): Promise<{
    document: PDFDocumentProxy;
    destroy(): Promise<void>;
}>;
/** Extract a page's positioned text; also used by the reusable viewer's search. */
export declare function extractPDFPage(page: PDFPageProxy, options?: PDFImportOptions): Promise<PDFExtractedPage>;
/** Genuine PDF text extraction with heuristic paragraph/reading-order reconstruction. No OCR is performed. */
export declare function extractPDF(bytes: Uint8Array | ArrayBuffer, options?: PDFImportOptions): Promise<PDFImportResult>;
export declare function fromPDF(bytes: Uint8Array | ArrayBuffer, options?: PDFImportOptions): Promise<FlowDocument>;
export { pdfjs };
