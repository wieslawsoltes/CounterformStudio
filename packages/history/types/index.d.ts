/** Undo journal with glyph-scoped snapshots; a drag is one atomic command. */
export class History {
    constructor(doc: any, { limit, byteLimit }?: {
        limit?: number;
        byteLimit?: number;
    });
    doc: any;
    limit: number;
    byteLimit: number;
    undoStack: any[];
    redoStack: any[];
    active: {
        label: any;
        glyphId: any;
        before: any;
        revision: any;
    };
    listeners: Set<any>;
    subscribe(fn: any): () => boolean;
    notify(): void;
    begin(label: any, glyphId?: any): {
        label: any;
        glyphId: any;
        before: any;
        revision: any;
    };
    commit(): boolean;
    cancel(): void;
    execute(label: any, fn: any, glyphId?: any): any;
    apply(c: any, data: any): void;
    undo(): boolean;
    redo(): boolean;
    clear(): void;
    get canUndo(): boolean;
    get canRedo(): boolean;
}
