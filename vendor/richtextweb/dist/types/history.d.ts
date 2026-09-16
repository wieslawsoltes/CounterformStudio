import { FlowDocument, type DocumentNode } from "./model.js";
export interface PropertyPatch {
    Name: string;
    Before?: unknown;
    After?: unknown;
    HadBefore: boolean;
    HasAfter: boolean;
}
export interface TextPatch {
    Offset: number;
    Removed: string;
    Inserted: string;
    BeforeFingerprint: string;
    AfterFingerprint: string;
}
export interface ChildrenPatch {
    Index: number;
    Removed: DocumentNode[];
    Inserted: DocumentNode[];
}
export interface NodePatch {
    Id: string;
    Type: string;
    Properties?: PropertyPatch[];
    Text?: TextPatch;
    Children?: ChildrenPatch;
    Descendants?: NodePatch[];
}
/** Serializable reversible patch containing changed values and subtrees only. */
export interface DocumentPatch {
    Version: 1;
    RootId: string;
    Change: NodePatch;
}
export declare class PatchConflictError extends Error {
    constructor(message: string);
}
export declare class DocumentObserverError extends Error {
    readonly Errors: unknown[];
    readonly Committed = true;
    constructor(Errors: unknown[]);
}
export declare function CreateDocumentPatch(before: DocumentNode, after: DocumentNode): DocumentPatch | undefined;
export declare function InvertDocumentPatch(patch: DocumentPatch): DocumentPatch;
/** Validate contextual preconditions before returning a detached patched tree. */
export declare function ApplyPatchToJSON(document: DocumentNode, patch: DocumentPatch): DocumentNode;
/** Reconcile a validated tree through live collections, retaining matching objects. */
export declare function ReconcileDocument(document: FlowDocument, target: DocumentNode): void;
export declare function ApplyDocumentPatch(document: FlowDocument, patch: DocumentPatch): void;
export declare function PatchByteLength(patch: DocumentPatch): number;
