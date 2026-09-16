import { EventDispatcher } from "./model.js";
import type { RichTextEngine } from "./engine.js";
export type VersionVector = Record<string, number>;
export interface TextOperation {
    Protocol: 1;
    DocumentId: string;
    InitialHash: string;
    ActorId: string;
    Sequence: number;
    Clock: number;
    Dependencies: VersionVector;
    Kind: "Insert" | "Delete" | "Replace" | "Format";
    After?: string;
    Text?: string;
    Targets?: string[];
    Property?: string;
    Value?: unknown;
}
export interface CollaborationSnapshot {
    Protocol: 1;
    DocumentId: string;
    InitialText: string;
    Operations: TextOperation[];
}
export interface CollaborationOptions {
    DocumentId: string;
    ActorId: string;
    Text?: string;
    MaxPendingOperations?: number;
    MaxCharacters?: number;
}
export declare class CollaborationConflictError extends Error {
    constructor(message: string);
}
/** Replicated growable character sequence with causal delivery and tombstones. */
export declare class CollaborativeTextSession {
    readonly DocumentId: string;
    readonly ActorId: string;
    readonly InitialText: string;
    readonly InitialHash: string;
    readonly OperationGenerated: EventDispatcher<TextOperation>;
    readonly Changed: EventDispatcher<{
        Session: CollaborativeTextSession;
        Operation: TextOperation;
        Remote: boolean;
    }>;
    readonly Conflict: EventDispatcher<{
        Error: Error;
        Operation?: TextOperation;
    }>;
    private characters;
    private children;
    private vector;
    private accepted;
    private pending;
    private clock;
    private maxPending;
    private maxCharacters;
    private resyncRequired;
    constructor(options: CollaborationOptions);
    get Text(): string;
    get VersionVector(): VersionVector;
    get ResyncRequired(): boolean;
    get RequiresCompaction(): boolean;
    get PendingCount(): number;
    get CharacterCount(): number;
    private ordered;
    private visible;
    private boundary;
    private base;
    Insert(offset: number, text: string): TextOperation | undefined;
    Delete(start: number, end: number): TextOperation | undefined;
    Replace(start: number, end: number, text: string): TextOperation | undefined;
    Format(start: number, end: number, property: string, value: unknown): TextOperation | undefined;
    private commitLocal;
    Receive(input: TextOperation): "applied" | "queued" | "duplicate";
    private key;
    private validate;
    private ready;
    private apply;
    private addCharacter;
    private drain;
    GetFormatting(): Array<{
        CharacterId: string;
        Start: number;
        End: number;
        Properties: Record<string, unknown>;
    }>;
    /** Fork an isolated replica without replaying its complete operation history. */
    Fork(actorId?: string): CollaborativeTextSession;
    ExportSnapshot(): CollaborationSnapshot;
    static FromSnapshot(snapshot: CollaborationSnapshot, actorId: string): CollaborativeTextSession;
    BindEngine(engine: RichTextEngine): CollaborationBinding;
}
/** Binds root paragraphs and rich inlines; structural merges use explicit host logic. */
export declare class CollaborationBinding {
    readonly Session: CollaborativeTextSession;
    readonly Engine: RichTextEngine;
    private subscriptions;
    private applying;
    private disposed;
    private formatting;
    get IsConnected(): boolean;
    constructor(Session: CollaborativeTextSession, Engine: RichTextEngine);
    private fail;
    Dispose(): void;
}
export * from "./collaboration-document.js";
