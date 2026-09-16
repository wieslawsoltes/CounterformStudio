import type { DocumentNode } from "./model.js";
import type { RenderResult } from "./control-renderer.js";
export interface PageSettings {
    PageWidth: number;
    PageHeight: number;
    Padding: {
        Top: number;
        Right: number;
        Bottom: number;
        Left: number;
    };
    ContentWidth: number;
    ContentHeight: number;
    ColumnGap: number;
    ColumnCount: number;
    TextColumnWidth: number;
    FootnoteHeight: number;
}
export interface PageLayoutPage {
    PageNumber: number;
    StartOffset: number;
    EndOffset: number;
    HasOverflow: boolean;
}
export interface PageLayoutOverflow {
    ElementId: string;
    PageNumber: number;
    Reason: "width" | "height" | "header" | "footer" | "footnotes";
    Measured: number;
    Available: number;
}
export interface PageLayoutResult extends PageSettings {
    Method: "css-column-fragmentation";
    Revision: number;
    PageCount: number;
    Pages: PageLayoutPage[];
    Overflows: PageLayoutOverflow[];
}
/** Device-independent CSS pixels; invalid/missing paper settings use A4 at 96 dpi. */
export declare function pageSettings(props: Record<string, any>): PageSettings;
/** Browser-measured column fragments, including UTF-16 ranges for every real page. */
export declare function measurePageLayout(surface: HTMLElement, render: RenderResult, document: DocumentNode, revision: number, settings: PageSettings): PageLayoutResult;
