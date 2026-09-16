import { PDFDocument, StandardFonts } from "pdf-lib";
/** An actual text-showing operator, including operators inside Form XObjects. */
export interface PDFTextOperator {
    /** Opaque source fingerprint. Re-inspect after any source edit; stale ids reject. */
    id: string;
    pageIndex: number;
    operator: "Tj" | "TJ" | "'" | '"';
    text: string | null;
    fontName: string;
    fontSize: number;
    editable: boolean;
    reason?: string;
    /** Approximate glyph bounds in unrotated PDF user space, not CSS/display coordinates. */
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    /** Baseline transform into unrotated PDF user space. */
    transform: number[];
    /** True when this occurrence is inside one or more Form XObjects. */
    inForm: boolean;
}
export interface PDFTextDiagnostic {
    pageIndex: number;
    source: string;
    message: string;
}
export interface PDFTextInspection {
    operators: PDFTextOperator[];
    diagnostics: PDFTextDiagnostic[];
}
export interface PDFTextReplacementOptions {
    /** Preserve the following operator's original position. Default true. */
    preserveAdvance?: boolean;
    /** Additional optimistic concurrency guard, compared against decoded source text. */
    expectedText?: string;
    /** Optional replacement font. It is installed in the edited stream's resource scope. */
    fontBytes?: Uint8Array | ArrayBuffer;
    /** Standard font used for replacement; mutually exclusive with fontBytes. */
    standardFont?: `${StandardFonts}`;
}
export interface PDFSourceTextReplaceOptions extends PDFTextReplacementOptions {
    pageIndices?: readonly number[];
    caseSensitive?: boolean;
    /** Default true. False replaces the first occurrence in content order. */
    all?: boolean;
    /** Explicitly permit leaving undecodable/unsupported source text untouched. */
    allowPartial?: boolean;
}
export interface PDFTextEditResult {
    operatorsChanged: number;
    occurrences: number;
    pages: number[];
}
export declare function inspectPDFText(pdf: PDFDocument, pageIndex?: number): Promise<PDFTextInspection>;
export declare function replacePDFTextOperator(pdf: PDFDocument, pageIndex: number, id: string, text: string, options?: PDFTextReplacementOptions): Promise<PDFTextEditResult>;
export declare function replacePDFSourceText(pdf: PDFDocument, query: string, replacement: string, options?: PDFSourceTextReplaceOptions): Promise<PDFTextEditResult>;
