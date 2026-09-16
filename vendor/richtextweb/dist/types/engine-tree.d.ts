import type { DocumentNode } from "./model.js";
/** Internal immutable-tree helpers. Public offsets count UTF-16 code units. */
export interface TextBlock {
    node: DocumentNode;
    parent: DocumentNode;
    index: number;
    start: number;
    end: number;
    text: string;
}
export interface TextLeaf {
    node: DocumentNode;
    start: number;
    end: number;
    props: Record<string, unknown>;
}
export declare const uid: () => `${string}-${string}-${string}-${string}-${string}`;
export declare const clone: <T>(value: T) => T;
export declare const makeNode: (type: string, children?: DocumentNode[], props?: Record<string, any>) => DocumentNode;
export declare const run: (text: string, props?: Record<string, any>) => DocumentNode;
export declare function newIds(node: DocumentNode): DocumentNode;
export declare function inlineText(node: DocumentNode): string;
export declare function textBlocks(root: DocumentNode): TextBlock[];
export declare const plainText: (root: DocumentNode) => string;
export declare function effectiveProps(node: DocumentNode, inherited?: Record<string, unknown>): Record<string, unknown>;
export declare function leaves(root: DocumentNode): TextLeaf[];
/** Slice inline nodes without flattening spans, hyperlinks, or object atoms. */
export declare function sliceInlines(nodes: DocumentNode[], start: number, end: number, fresh?: boolean): DocumentNode[];
export declare function pointBlock(root: DocumentNode, offset: number): TextBlock;
export declare function deleteRange(root: DocumentNode, start: number, end: number): void;
export declare function insertText(root: DocumentNode, offset: number, text: string, props: Record<string, any>): number;
export declare function formatRange(root: DocumentNode, start: number, end: number, property: string, value: unknown): void;
export declare function mapMetadata(root: DocumentNode, start: number, end: number, insertedLength: number): void;
