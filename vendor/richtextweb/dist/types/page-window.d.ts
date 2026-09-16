import type { PageLayoutPage, PageLayoutResult } from "./pagination.js";
/** Binary search over measured UTF-16 page boundaries. Backward affinity selects the preceding sheet at a boundary. */
export declare function pageAtOffset(layout: Pick<PageLayoutResult, "Pages">, offset: number, backward?: boolean): PageLayoutPage | null;
export interface PagePreviewWindowOptions {
    PageCount: number;
    Columns: number;
    PageHeight: number;
    ViewportHeight: number;
    ScrollTop: number;
    Gap?: number;
    OverscanRows?: number;
}
/** Realize visible sheets first, then adjacent rows. A tall viewport must not lose its lower visible pages to overscan. */
export declare function pagePreviewWindow(options: PagePreviewWindowOptions): number[];
