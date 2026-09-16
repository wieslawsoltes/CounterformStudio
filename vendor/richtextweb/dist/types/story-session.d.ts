import { FlowDocument } from "./model.js";
import { RichTextEngine } from "./engine.js";
import { type StoryKind } from "./document-features.js";
/** A detached, editable rich story. Apply is one parent-document undo unit; Cancel never mutates the parent. */
export declare class DocumentStorySession {
    private readonly owner;
    readonly SectionId?: string | undefined;
    readonly Engine: RichTextEngine;
    readonly Kind: StoryKind;
    private readonly parent;
    private readonly original;
    private closed;
    constructor(owner: RichTextEngine, kind: StoryKind, SectionId?: string | undefined);
    get Document(): FlowDocument;
    get IsClosed(): boolean;
    get HasConflict(): boolean;
    Apply(): boolean;
    Cancel(): void;
    Dispose(): void;
    private target;
}
