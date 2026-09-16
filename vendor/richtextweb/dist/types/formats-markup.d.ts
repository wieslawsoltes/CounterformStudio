/** Small inert markup tokenizer. It never creates browser DOM or evaluates entities/code. */
export interface MarkupNode {
    name: string;
    attrs: Record<string, string>;
    children: MarkupNode[];
    text?: string;
}
export declare function decodeEntities(value: string): string;
export declare const escapeMarkup: (value: unknown) => string;
export declare function parseMarkup(source: string, xml?: boolean): MarkupNode;
export declare function textContent(node: MarkupNode): string;
export declare function descendants(node: MarkupNode, name: string): MarkupNode[];
export declare function child(node: MarkupNode | undefined, name: string): MarkupNode | undefined;
export declare function safeURL(value: unknown, image?: boolean): string;
