import type { DocumentNode, TextElement } from "./model.js";
import type { VirtualWindow } from "./virtualization.js";
/** DOM positions are UTF-16 text offsets, including paragraph separators. */
export interface DOMPosition {
    start: number;
    end: number;
}
export interface RenderResult {
    fragment: DocumentFragment;
    positions: WeakMap<Node, DOMPosition>;
    leaves: Array<{
        node: Node;
        start: number;
        end: number;
        atomic?: boolean;
    }>;
    paragraphs: Array<{
        node: HTMLElement;
        start: number;
        end: number;
    }>;
    length: number;
    statistics?: RenderStatistics;
    /** @internal Reusable detached templates; never the live editing DOM. */
    templates?: Map<string, HTMLElement>;
}
export interface RenderStatistics {
    Created: number;
    Reused: number;
    Updated: number;
    Removed: number;
}
/** Render effective property values while leaving portable serialization as local base values. */
export declare function applyEffectiveStyleValues(node: DocumentNode, model: TextElement, window?: VirtualWindow, includeChildren?: boolean): void;
/** Commit a detached render by stable document IDs, retaining live DOM identity. */
export declare function reconcileDocumentDOM(surface: HTMLElement, next: RenderResult): RenderResult;
export declare function safeNavigationUri(value: unknown): string | undefined;
export declare function safeImageSource(value: unknown): string | undefined;
export declare function thicknessCSS(value: unknown): string | undefined;
/** Render canonical nodes with DOM APIs; markup and embedded controls are never executed. */
export declare function renderDocument(node: DocumentNode, owner: Document, previousTemplates?: Map<string, HTMLElement>, window?: VirtualWindow): RenderResult;
export declare function applyDocumentStyle(surface: HTMLElement, props: Record<string, any>): void;
