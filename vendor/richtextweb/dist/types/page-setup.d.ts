/** Shared, strict page-setup command contract. Legacy imports may still use pageSettings' tolerant rendering. */
export interface PageMargins {
    Left: number;
    Top: number;
    Right: number;
    Bottom: number;
}
export interface PageSetupOptions {
    PageWidth?: number;
    PageHeight?: number;
    PagePadding?: number | PageMargins;
    ColumnCount?: number;
    ColumnGap?: number;
    HeaderDistance?: number;
    FooterDistance?: number;
    PageNumberStart?: number;
    DifferentFirstPage?: boolean;
    DifferentOddAndEvenPages?: boolean;
}
/** Padding is .NET left/top/right/bottom; inputs are copied, never retained by reference. */
export declare function pageMargins(value?: unknown): PageMargins;
/** Merge supplied properties without resetting unrelated paper, stories or metadata. Validate before mutation. */
export declare function validatePageSetup(current: Record<string, unknown>, options: PageSetupOptions): PageSetupOptions;
/** Missing flags preserve the legacy presence-based variant policy; explicit false disables a retained story. */
export declare function pageStoryKey(props: Record<string, unknown>, kind: "Header" | "Footer", physicalPage: number): string;
export declare function documentPageNumber(props: Record<string, unknown>, physicalPage: number): number;
/** Native switches apply to both stories; legacy browser behavior stays per-story without explicit flags. */
export declare function pageStoryVariantEnabled(props: Record<string, unknown>, variant: "FirstPage" | "EvenPage"): boolean;
