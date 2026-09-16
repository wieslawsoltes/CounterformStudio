import { EventDispatcher, FlowDocument, type DocumentNode } from "./model.js";
import type { RichTextEngine } from "./engine.js";
import { type TextOperation, type VersionVector } from "./collaboration.js";
export type DocumentCollection = "Children" | "Columns";
export type RichDocumentAction = {
    Kind: "Insert";
    Node: DocumentNode;
    ParentId: string;
    Collection: DocumentCollection;
    After: string | null;
} | {
    Kind: "Move";
    NodeId: string;
    ParentId: string;
    Collection: DocumentCollection;
    After: string | null;
} | {
    Kind: "Remove" | "Restore";
    NodeIds: string[];
} | {
    Kind: "Property";
    NodeId: string;
    Name: string;
    Value?: unknown;
    Remove?: boolean;
} | {
    Kind: "Entry";
    NodeId: string;
    Name: "Annotations";
    EntryId: string;
    Value?: unknown;
    Remove?: boolean;
} | {
    Kind: "Text";
    NodeId: string;
    Operation: TextOperation;
};
export interface RichDocumentOperation {
    Protocol: 2;
    DocumentId: string;
    Epoch: string;
    InitialHash: string;
    ActorId: string;
    Sequence: number;
    Clock: number;
    Dependencies: VersionVector;
    Actions: RichDocumentAction[];
}
export interface DocumentCheckpoint {
    PreviousEpoch: string;
    Frontier: VersionVector;
    Acknowledgements: Record<string, VersionVector>;
}
export interface RichDocumentSnapshot {
    Protocol: 2;
    DocumentId: string;
    Epoch: string;
    InitialDocument: DocumentNode;
    Operations: RichDocumentOperation[];
    Checkpoint?: DocumentCheckpoint;
}
export interface CollaborativeDocumentOptions {
    DocumentId: string;
    ActorId: string;
    Document: FlowDocument | DocumentNode;
    MaxPendingOperations?: number;
    CompactionOperationThreshold?: number;
}
/** Causally delivered rich tree transactions, replicated text, and explicit epoch checkpoints. */
export declare class CollaborativeDocumentSession {
    readonly DocumentId: string;
    readonly ActorId: string;
    readonly OperationGenerated: EventDispatcher<RichDocumentOperation>;
    readonly Changed: EventDispatcher<{
        Session: CollaborativeDocumentSession;
        Operation?: RichDocumentOperation;
        Remote: boolean;
        Checkpoint?: boolean;
    }>;
    readonly Conflict: EventDispatcher<{
        Error: Error;
        Operation?: RichDocumentOperation;
    }>;
    private epoch;
    private initial;
    private initialHash;
    private checkpoint?;
    private state;
    private document;
    private vector;
    private accepted;
    private pending;
    private clock;
    private resync;
    private readonly maxPending;
    private readonly threshold;
    constructor(options: CollaborativeDocumentOptions);
    get Epoch(): string;
    get Document(): FlowDocument;
    get DocumentJSON(): DocumentNode;
    get Text(): string;
    get VersionVector(): VersionVector;
    get PendingCount(): number;
    get ResyncRequired(): boolean;
    get RequiresCompaction(): boolean;
    get Statistics(): {
        Operations: number;
        Nodes: number;
        TombstonedNodes: number;
        Placements: number;
        Characters: number;
        Pending: number;
    };
    private textSession;
    private record;
    private seed;
    private chosen;
    private project;
    private next;
    private key;
    private ready;
    private validate;
    private applyAction;
    private draft;
    private report;
    private notify;
    private accept;
    private commit;
    Receive(input: RichDocumentOperation): "applied" | "queued" | "duplicate";
    private drain;
    private anchor;
    InsertNode(parentId: string, index: number, node: DocumentNode, collection?: DocumentCollection): RichDocumentOperation;
    /** Move to a final zero-based index, excluding the moved node from its destination siblings. */
    MoveNode(nodeId: string, parentId: string, index: number, collection?: DocumentCollection): RichDocumentOperation;
    RemoveNode(nodeId: string): RichDocumentOperation;
    RestoreNodes(nodeIds: string[]): RichDocumentOperation;
    SetProperty(nodeId: string, name: string, value: unknown): RichDocumentOperation;
    ClearProperty(nodeId: string, name: string): RichDocumentOperation;
    ReplaceText(nodeId: string, start: number, end: number, text: string): RichDocumentOperation | undefined;
    /** Capture a rich control transaction by stable identity; newly created nodes require globally unique IDs. */
    UpdateDocument(document: FlowDocument | DocumentNode): RichDocumentOperation | undefined;
    ExportSnapshot(): RichDocumentSnapshot;
    static FromSnapshot(snapshot: RichDocumentSnapshot, actorId: string): CollaborativeDocumentSession;
    /** Start a new epoch only after every known participant acknowledges the same complete frontier. */
    CreateCheckpoint(acknowledgements: Record<string, VersionVector>): RichDocumentSnapshot;
    AdoptCheckpoint(snapshot: RichDocumentSnapshot): void;
    BindEngine(engine: RichTextEngine): RichDocumentBinding;
}
/** Shares the full existing control engine; remote application retains live matching model objects. */
export declare class RichDocumentBinding {
    readonly Session: CollaborativeDocumentSession;
    readonly Engine: RichTextEngine;
    private subscriptions;
    private applying;
    private disposed;
    get IsConnected(): boolean;
    constructor(Session: CollaborativeDocumentSession, Engine: RichTextEngine);
    private fail;
    Dispose(): void;
}
