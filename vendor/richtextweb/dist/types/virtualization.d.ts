import type { DocumentNode } from "./model.js";
export interface VirtualBlock {
    Id: string;
    Index: number;
    StartOffset: number;
    EndOffset: number;
    Height: number;
    Top: number;
    HasTextBlock: boolean;
}
export interface VirtualizationStatistics {
    Active: boolean;
    TotalBlocks: number;
    RealizedBlocks: number;
    EstimatedHeight: number;
    FirstVisibleBlock: number;
    LastVisibleBlock: number;
    SelectionExpanded: boolean;
}
export interface VirtualWindow {
    Blocks: VirtualBlock[];
    Realized: Set<number>;
    Statistics: VirtualizationStatistics;
}
/** Offset and height index. Height estimates are replaced with measured block boxes. */
export declare class DocumentVirtualizer {
    private heights;
    private blocks;
    private totalHeight;
    private width;
    Index(document: DocumentNode, availableWidth: number): void;
    SetMeasuredHeight(id: string, height: number): boolean;
    BlockAtOffset(offset: number): VirtualBlock | undefined;
    Window(scrollTop: number, viewportHeight: number, overscan: number, selection?: {
        Start: number;
        End: number;
    }): VirtualWindow;
}
