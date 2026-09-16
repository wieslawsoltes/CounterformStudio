import { type PageSetupOptions } from "./page-setup.js";
import { FlowDocument, Span, type DocumentNode } from "./model.js";
import { RichTextEngine } from "./engine.js";
export type FieldType = "PAGE" | "NUMPAGES" | "DATE" | "TIME" | "REF" | "PAGEREF" | "MERGEFIELD" | "SEQ" | "TITLE" | "AUTHOR" | "FILENAME";
export interface FieldDefinition {
    Type: FieldType;
    Instruction: string;
    Argument?: string;
    Format?: string;
}
export interface FieldContext {
    PageNumber?: number;
    PageCount?: number;
    Now?: Date;
    Locale?: string;
    Data?: Record<string, unknown>;
    FileName?: string;
    PageOfNode?: (id: string) => number | undefined;
}
export interface FieldUpdateResult {
    /** Exact main-story edits in pre-update UTF-16 coordinates, for pointer/history mapping. */
    TextChanges: {
        Start: number;
        RemovedLength: number;
        InsertedLength: number;
    }[];
    Updated: number;
    Unresolved: {
        Id: string;
        Instruction: string;
        Reason: string;
    }[];
}
export interface TableOfContentsOptions {
    MaxLevel?: number;
    Title?: string;
    IncludePageNumbers?: boolean;
}
export type StoryKind = "Headers" | "Footers" | "FirstPageHeader" | "FirstPageFooter" | "EvenPageHeader" | "EvenPageFooter";
export type NoteKind = "Footnote" | "Endnote";
export interface DocumentNote {
    Id: string;
    Blocks: DocumentNode[];
}
/** Portable cached field. Instructions are parsed as data and never executed. */
export declare function createField(type: FieldType, argument?: string, format?: string): Span;
/** Resolve fields on a detached canonical tree. Unresolvable fields retain their cached text. */
export declare function updateDocumentFields(root: DocumentNode, context?: FieldContext): FieldUpdateResult;
/** Engine-bound document operations: all changes use the control's existing history. */
export declare class DocumentFeatures {
    readonly Engine: RichTextEngine;
    constructor(Engine: RichTextEngine);
    /** Apply validated paper/story settings atomically without replacing the engine or resetting selection. */
    SetPageSetup(options: PageSetupOptions): void;
    InsertField(type: FieldType, argument?: string, format?: string): void;
    UpdateFields(context?: FieldContext): FieldUpdateResult;
    SetStory(kind: StoryKind, blocks: DocumentNode[], sectionId?: string): void;
    InsertNote(kind: NoteKind, content: string | DocumentNode[]): string;
    UpdateNote(kind: NoteKind, id: string, content: string): void;
    InsertTableOfContents(options?: TableOfContentsOptions, context?: FieldContext): void;
    UpdateTableOfContents(context?: FieldContext): number;
    private populateTOC;
    /** Create independent merged documents; template metadata and field definitions remain available. */
    MailMerge(records: Record<string, unknown>[], context?: Omit<FieldContext, "Data">): FlowDocument[];
}
