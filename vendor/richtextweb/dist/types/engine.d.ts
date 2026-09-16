import { type PageSetupOptions } from "./page-setup.js";
import { EventDispatcher, FlowDocument, TextPointer, type DocumentNode } from "./model.js";
export interface FindOptions {
    MatchCase?: boolean;
    WholeWord?: boolean;
    matchCase?: boolean;
    wholeWord?: boolean;
    Start?: number;
}
export interface FindResult {
    Start: number;
    End: number;
    Text: string;
}
export interface DocumentAnnotation {
    Id: string;
    Kind: "Comment" | "Bookmark" | string;
    Start: number;
    End: number;
    Data: Record<string, any>;
}
export interface RevisionPropertyChange {
    Scope: "Inline" | "Node";
    NodeId?: string;
    Start?: number;
    End?: number;
    Name: string;
    HadBefore: boolean;
    Before?: unknown;
    HasAfter: boolean;
    After?: unknown;
}
export interface EngineChangedEvent {
    Engine: RichTextEngine;
    Document: FlowDocument;
    Revision: number;
}
export interface SelectionChangedEvent {
    Engine: RichTextEngine;
    Start: number;
    End: number;
}
interface TextEditSpan {
    Start: number;
    RemovedLength: number;
    InsertedLength: number;
}
/** WPF-shaped range API using UTF-16 plain-text offsets rather than WPF symbols. */
export declare class TextRange {
    protected _start: TextPointer;
    protected _end: TextPointer;
    protected owner?: RichTextEngine;
    constructor(start: TextPointer, end: TextPointer);
    get Start(): TextPointer;
    get End(): TextPointer;
    get IsEmpty(): boolean;
    get Text(): string;
    set Text(value: string);
    ApplyPropertyValue(property: string | {
        Name: string;
    }, value: unknown): void;
    GetPropertyValue(property: string | {
        Name: string;
    }): unknown;
    protected withEngine(action: (engine: RichTextEngine) => void): void;
}
export declare class TextSelection extends TextRange {
    constructor(engine: RichTextEngine);
    get Start(): TextPointer;
    get End(): TextPointer;
    Select(start: TextPointer | number, end: TextPointer | number): void;
    SelectAll(): void;
}
/** Framework-independent editing, selection, undo, search, and document structure. */
export declare class RichTextEngine {
    private _document;
    readonly Selection: TextSelection;
    readonly Changed: EventDispatcher<EngineChangedEvent>;
    readonly SelectionChanged: EventDispatcher<SelectionChangedEvent>;
    private subscription;
    private undoStack;
    private redoStack;
    private typing;
    private start;
    private end;
    private depth;
    private batch?;
    private batchTokens?;
    private batchTokensValid;
    private disposed;
    UndoLimit: number;
    /** Track text, formatting, moves, and document structure as reviewable changes. */
    TrackChanges: boolean;
    TrackFormatting: boolean;
    private historySuppressed;
    CurrentAuthor: string;
    private reviewSuppressed;
    get Revisions(): DocumentAnnotation[];
    constructor(document?: FlowDocument);
    get Document(): FlowDocument;
    get SelectionStart(): number;
    get SelectionEnd(): number;
    CaptureSelectionState(): {
        Start: number;
        End: number;
        TypingProperties: Record<string, any>;
    };
    RestoreSelectionState(state: {
        Start: number;
        End: number;
        TypingProperties: Record<string, any>;
    }): void;
    ResetInsertionFormatting(): void;
    get CanUndo(): boolean;
    get CanRedo(): boolean;
    get HistoryStatistics(): {
        UndoEntries: number;
        RedoEntries: number;
        RetainedBytes: number;
    };
    get Annotations(): DocumentAnnotation[];
    private assertLive;
    private subscribe;
    Select(start: number, end?: number): void;
    SetDocument(document: FlowDocument): void;
    /** Replace all content while retaining the document object, subscribers, and undo. */
    ReplaceDocument(document: FlowDocument, options?: {
        MapAnnotations?: boolean;
        TextChanges?: TextEditSpan[];
    }): void;
    /** Apply an incoming collaborative state without making it a local undo entry.
     * Prior local history is cleared because contextual patches are not selectively rebased.
     */
    ApplyRemoteDocument(document: FlowDocument, options?: {
        MapAnnotations?: boolean;
        TextChanges?: TextEditSpan[];
    }): void;
    BeginChange(): void;
    EndChange(): void;
    Change(action: () => void): void;
    ClearUndo(): void;
    Undo(): boolean;
    Redo(): boolean;
    private cursor;
    private setCursor;
    private snapshot;
    private record;
    private emitSelection;
    private mutate;
    InsertText(text: string): void;
    /** Common typing path: no detached document or whole-tree reconciliation. */
    private tryDirectTextEdit;
    private trimUndo;
    AcceptRevision(id: string): void;
    RejectRevision(id: string): void;
    AcceptAllRevisions(): void;
    RejectAllRevisions(): void;
    ReplaceSelection(text: string): void;
    InsertParagraph(): void;
    DeleteBackward(): void;
    DeleteForward(): void;
    DeleteWordBackward(): void;
    DeleteWordForward(): void;
    private deleteDirection;
    private insertionProperties;
    GetProperty(name: string): unknown;
    private formatMutation;
    ApplyProperty(name: string, value: unknown): void;
    ToggleFormat(name: string, value?: unknown, offValue?: unknown): void;
    SetParagraphProperty(name: string, value: unknown): void;
    private selectedBlocks;
    ClearFormatting(): void;
    InsertNode(node: DocumentNode): string;
    InsertFragment(nodes: DocumentNode[]): string[];
    /** Insert vector-rendered mathematical content as a single undoable atom. */
    InsertEquation(source: string, format?: "latex" | "mathml", displayMode?: boolean): string;
    UpdateEquation(elementId: string, source: string, format?: "latex" | "mathml", displayMode?: boolean): void;
    SetPageSetup(options: PageSetupOptions): void;
    InsertPageBreak(): void;
    InsertColumnBreak(): void;
    InsertImage(source: string, alternativeText?: string, width?: number, height?: number): void;
    InsertTable(rows?: number, columns?: number): void;
    InsertHyperlink(uri: string, text?: string): void;
    GetSelectedFragment(): FlowDocument;
    RemoveHyperlink(): void;
    Indent(amount?: number): void;
    SetElementProperty(id: string, name: string, value: unknown): void;
    SetTableProperty(name: string, value: unknown): void;
    SetCellProperty(name: string, value: unknown): void;
    /** Edit the independent text story hosted by a Figure/Floater, as one parent undo/review operation. */
    EditFloatingContent(id: string, action: (story: RichTextEngine) => void): void;
    /** Move rich selected content to a UTF-16 position measured before the move. */
    MoveSelection(destination: number): void;
    /** Move contiguous block siblings while preserving their live model identities. */
    MoveBlocks(ids: string[], parentId: string, index: number): void;
    /** Merge adjacent cells on the current row, keeping all rich block contents. */
    MergeTableCells(count?: number): void;
    /** Split a merged cell into its existing grid slots; contents stay in the first cell. */
    SplitTableCell(): void;
    InsertTableRow(before?: boolean): void;
    DeleteTableRow(): void;
    InsertTableColumn(before?: boolean): void;
    DeleteTableColumn(): void;
    DeleteTable(): void;
    ToggleList(markerStyle?: string): void;
    Find(text: string, options?: FindOptions): FindResult[];
    ReplaceAll(find: string, replacement: string, options?: FindOptions): number;
    AddAnnotation(kind: string, data: Record<string, any>, start?: number, end?: number): DocumentAnnotation;
    AddComment(text: string, author?: string): DocumentAnnotation;
    AddBookmark(name: string): DocumentAnnotation;
    UpdateAnnotation(id: string, data: Record<string, any>): void;
    RemoveAnnotation(id: string): boolean;
    GoToBookmark(name: string): boolean;
    Execute(command: string, parameter?: any): any;
    Dispose(): void;
}
/** String commands work with Execute, RelayCommand, toolbar bindings, and bridges. */
export declare const EditingCommands: Readonly<{
    [k: string]: string;
}>;
export declare const ApplicationCommands: Readonly<{
    Undo: "Undo";
    Redo: "Redo";
    SelectAll: "SelectAll";
    Find: "Find";
    Replace: "ReplaceAll";
}>;
export {};
