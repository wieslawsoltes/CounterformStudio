import { FlowDocument, type DocumentNode } from "./model.js";
export { toDOCX, fromDOCX } from "./formats-docx.js";
export { toPDF, PDFEditor } from "./formats-pdf.js";
export type { PDFExportOptions, PDFPageInfo, PDFTextOptions, PDFRectangleOptions, PDFImageOptions, } from "./formats-pdf.js";
import { toDOCX, fromDOCX } from "./formats-docx.js";
import { toPDF } from "./formats-pdf.js";
export declare function makeNode(type: string, children?: DocumentNode[], props?: Record<string, any>, text?: string): DocumentNode;
export declare function toText(doc: FlowDocument): string;
export declare function fromText(text: string): FlowDocument;
/** Safe inert HTML. Scriptable URLs, event handlers and arbitrary CSS never enter the result. */
export declare function toHTML(doc: FlowDocument): string;
export declare function fromHTML(html: string): FlowDocument;
/** Canonical HTML sanitization through the document model; unsupported markup is removed. */
export declare function sanitizeHTML(html: string): string;
export declare function toMarkdown(doc: FlowDocument): string;
export declare function fromMarkdown(markdown: string): FlowDocument;
export declare function toXAML(doc: FlowDocument): string;
export declare function fromXAML(xaml: string): FlowDocument;
export declare function toRTF(doc: FlowDocument): string;
/** Imports the textual RTF subset (groups, Unicode, inline styling and paragraphs). */
export declare function fromRTF(rtf: string): FlowDocument;
export type DocumentFormat = "text" | "html" | "markdown" | "xaml" | "rtf" | "json";
export declare class DocumentSerializer {
    static ToText: typeof toText;
    static FromText: typeof fromText;
    static ToHTML: typeof toHTML;
    static FromHTML: typeof fromHTML;
    static ToMarkdown: typeof toMarkdown;
    static FromMarkdown: typeof fromMarkdown;
    static ToXAML: typeof toXAML;
    static FromXAML: typeof fromXAML;
    static ToRTF: typeof toRTF;
    static FromRTF: typeof fromRTF;
    static ToDOCX: typeof toDOCX;
    static FromDOCX: typeof fromDOCX;
    static ToPDF: typeof toPDF;
    static Serialize(document: FlowDocument, format?: DocumentFormat): string;
    static Deserialize(value: string, format?: DocumentFormat): FlowDocument;
}
