export { pageAtOffset, pagePreviewWindow } from "./page-window.js";
import { FlowDocument, type DocumentNode, type TextPointer } from "./model.js";
import { RichTextEngine, type TextSelection } from "./engine.js";
import { type RenderResult, type RenderStatistics } from "./control-renderer.js";
import { type PageLayoutResult, type PageLayoutPage } from "./pagination.js";
import { RichTextToolbar } from "./toolbar.js";
import { type VirtualizationStatistics } from "./virtualization.js";
import { type FloatingLayoutOptions, type FloatingLayoutDiagnostic } from "./floating-layout.js";
import { FloatingObjectAdorner } from "./floating-adorner.js";
export { DocumentVirtualizer } from "./virtualization.js";
export { normalizeFloatingLayout } from "./floating-layout.js";
export type { VirtualizationStatistics, VirtualBlock, VirtualWindow, } from "./virtualization.js";
export type { FloatingLayoutOptions, FloatingLayoutDiagnostic, TextWrappingStyle, } from "./floating-layout.js";
export type { PageLayoutResult, PageLayoutPage, PageLayoutOverflow, PageSettings, } from "./pagination.js";
declare const HTMLElementBase: typeof HTMLElement;
export type RichTextViewMode = "page" | "continuous";
export interface DocumentChangeDetail {
    document: FlowDocument;
    engine: RichTextEngine;
    revision: number;
}
export interface SelectionChangeDetail {
    selection: TextSelection;
    start: number;
    end: number;
    text: string;
}
export interface CommandStateChangeDetail {
    canUndo: boolean;
    canRedo: boolean;
    isReadOnly: boolean;
}
/** A model-backed, framework-independent rich text editing control. */
export declare class RichTextBox extends HTMLElementBase {
    static get observedAttributes(): string[];
    private _engine;
    protected _editor: HTMLDivElement | null;
    protected _viewport: HTMLDivElement | null;
    protected _render: RenderResult | null;
    private _readOnly;
    private _presentationReadOnly;
    protected _renderDocument: DocumentNode | null;
    private _acceptsTab;
    private _zoom;
    private _viewMode;
    private _composing;
    private _compositionBase;
    private _suspendRender;
    private _restoringSelection;
    private _backwardSelection;
    protected _lastDOMHTML: string;
    private _subscriptions;
    private _connected;
    private _disposed;
    private _enableVirtualization;
    private _virtualizationThreshold;
    private _virtualizationOverscan;
    private _virtualizer;
    private _virtualWindow;
    private _virtualizationSuspended;
    private _virtualFrame;
    private _virtualResizeObserver;
    private _refreshing;
    private _selectedObjectId;
    protected _objectAdorner: FloatingObjectAdorner | null;
    private _documentSelectionChanged;
    constructor(options?: {
        readOnly?: boolean;
        viewMode?: RichTextViewMode;
    });
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    get Document(): FlowDocument;
    set Document(value: FlowDocument);
    get Engine(): RichTextEngine;
    get EnableVirtualization(): boolean;
    set EnableVirtualization(value: boolean);
    get VirtualizationThreshold(): number;
    set VirtualizationThreshold(value: number);
    get VirtualizationOverscan(): number;
    set VirtualizationOverscan(value: number);
    get VirtualizationStatistics(): Readonly<VirtualizationStatistics>;
    get SelectedObjectId(): string | null;
    GetSelectedObject(): DocumentNode | null;
    SelectObject(elementId: string): boolean;
    SetFloatingLayout(elementId: string, options: FloatingLayoutOptions): void;
    get FloatingLayoutDiagnostics(): FloatingLayoutDiagnostic[];
    get Selection(): TextSelection;
    get CaretPosition(): TextPointer;
    set CaretPosition(value: TextPointer);
    get IsReadOnly(): boolean;
    set IsReadOnly(value: boolean);
    protected setPresentationReadOnly(value: boolean): void;
    get AcceptsTab(): boolean;
    set AcceptsTab(value: boolean);
    get Zoom(): number;
    set Zoom(value: number);
    get ViewMode(): RichTextViewMode;
    set ViewMode(value: RichTextViewMode);
    get CanUndo(): boolean;
    get CanRedo(): boolean;
    get Text(): string;
    set Text(value: string);
    get value(): string;
    set value(value: string);
    get document(): FlowDocument;
    set document(value: FlowDocument);
    get readOnly(): boolean;
    set readOnly(value: boolean);
    get acceptsTab(): boolean;
    set acceptsTab(value: boolean);
    get zoom(): number;
    set zoom(value: number);
    get viewMode(): RichTextViewMode;
    set viewMode(value: RichTextViewMode);
    Focus(): void;
    Select(start: number, end?: number): void;
    SelectAll(): void;
    Undo(): void;
    Redo(): void;
    AppendText(text: string): void;
    BeginChange(): void;
    EndChange(): void;
    DeclareChangeBlock(): {
        Dispose(): void;
    };
    ScrollToHome(): void;
    ScrollToEnd(): void;
    ScrollToTextOffset(offset: number): void;
    Copy(): Promise<void>;
    Cut(): Promise<void>;
    Paste(): Promise<void>;
    Execute(command: string, parameter?: any): unknown;
    /** Import rich HTML at the selection using the serializer's safe allowlist. */
    PasteHTML(html: string): void;
    Refresh(): void;
    private queueVirtualRefresh;
    private materializeNativeEditing;
    get RenderStatistics(): Readonly<RenderStatistics>;
    /** Open a printable browser view. Invoke from a user gesture to allow its window. */
    Print(): void;
    Dispose(): void;
    private reflectBoolean;
    protected emit(name: string, detail: unknown): void;
    private emitCommandState;
    private updateAttributes;
    private nativeSelection;
    private nativeRange;
    protected offsetFromDOM(node: Node, offset: number): number;
    private syncSelection;
    private domPoint;
    protected restoreSelection(): void;
    private beforeInput;
    private deleteWord;
    private deleteLine;
    private keyDown;
    private copy;
    private paste;
    private insertTransfer;
    private drop;
    /** Native IME, spell-check and browser input fallback commit as one undoable change. */
    private reconcileNativeInput;
    private nativeTextOffset;
    private preserveNativeAtoms;
}
/** Read-only document presentation controls use the same document and renderer. */
export declare class FlowDocumentReader extends RichTextBox {
    constructor(viewMode?: RichTextViewMode);
    connectedCallback(): void;
}
export declare class FlowDocumentScrollViewer extends FlowDocumentReader {
    constructor();
}
export type DocumentViewMode = "PrintLayout" | "WebLayout" | "ReadMode" | "Outline" | "Draft";
export type PageArrangement = "SinglePage" | "TwoPages" | "Vertical" | "MultiplePages";
export type DocumentZoomMode = "Custom" | "PageWidth" | "WholePage" | "TwoPages";
export interface PaginationStatistics {
    LayoutPasses: number;
    CacheHits: number;
    LastDurationMs: number;
    Revision: number;
    RealizedPagePreviews: number;
    RealizedPageSlots: number;
    TotalPages: number;
}
export declare class FlowDocumentPageViewer extends FlowDocumentReader {
    static get observedAttributes(): string[];
    private _documentView;
    private _arrangement;
    private _zoomMode;
    private _layoutEpoch;
    private _measuredEpoch;
    private _layoutPasses;
    private _cacheHits;
    private _lastLayoutDuration;
    private _configuredRevision;
    private _configuredDocument;
    private _grid;
    private _gridKey;
    private _pageSlots;
    private _previews;
    private _previewFrame;
    private _fittingZoom;
    private _outlineLevel;
    private _fontListener;
    private _pageInput;
    private _pageNumber;
    private _layout;
    private _settings;
    private _sheet;
    private _pageWindow;
    private _header;
    private _footer;
    private _footnotes;
    private _pageLabel;
    private _previousButton;
    private _nextButton;
    private _layoutPending;
    private _resizeObserver;
    private _pageDisposed;
    private _paginationDocument;
    private _elementsById;
    private _pageNoteBlocks;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    Refresh(): void;
    /** Invalidate font/image geometry without rebuilding the model or edit history. */
    InvalidatePagination(): void;
    get PaginationStatistics(): PaginationStatistics;
    get DocumentView(): DocumentViewMode;
    set DocumentView(value: DocumentViewMode);
    get PageArrangement(): PageArrangement;
    set PageArrangement(value: PageArrangement);
    get ZoomMode(): DocumentZoomMode;
    set ZoomMode(value: DocumentZoomMode);
    get OutlineLevel(): number;
    set OutlineLevel(value: number);
    private configureOutline;
    private applyZoomMode;
    attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void;
    get PageCount(): number;
    get PageNumber(): number;
    set PageNumber(value: number);
    get CanGoToNextPage(): boolean;
    get CanGoToPreviousPage(): boolean;
    /** Locate a measured page without scanning all preceding pages. */
    GetPageAtOffset(offset: number, backward?: boolean): PageLayoutPage | null;
    get LayoutResult(): Readonly<PageLayoutResult> | null;
    NextPage(): boolean;
    PreviousPage(): boolean;
    FirstPage(): boolean;
    LastPage(): boolean;
    GoToPage(number: number): boolean;
    Execute(command: string, parameter?: any): unknown;
    /** Measure only after document/geometry changes; caret, page and zoom navigation reuse the layout. */
    Repaginate(): Promise<PageLayoutResult>;
    private alignPhysicalPageBreaks;
    Dispose(): void;
    private queuePagination;
    protected configurePagination(): void;
    private updatePageView;
    private moveLiveSheet;
    private arrangementColumns;
    private updatePageArrangement;
    private wantedPagePreviews;
    /** Bound the placeholder DOM as well as previews; the live selection-bearing sheet stays pinned. */
    private syncPageSlots;
    private queuePagePreviews;
    private renderVisiblePagePreviews;
    private snapshotPage;
    /** Return actual measured page sheets, including stories, columns and vector equations. */
    GetPrintHTML(options?: {
        StartPage?: number;
        EndPage?: number;
        Title?: string;
    }): Promise<string>;
    Print(): void;
    private renderStories;
    private indexPageNotes;
}
/** Finite screen pages and ordinary model editing share the same control implementation. */
export declare class RichTextPageEditor extends FlowDocumentPageViewer {
    private _followingCaret;
    constructor();
    connectedCallback(): void;
    GoToPage(number: number): boolean;
}
/** Explicit and idempotent registration; safe to import during server rendering. */
export declare function registerRichTextWeb(registry?: CustomElementRegistry | undefined): void;
declare global {
    interface HTMLElementTagNameMap {
        "rich-text-box": RichTextBox;
        "flow-document-reader": FlowDocumentReader;
        "flow-document-scroll-viewer": FlowDocumentScrollViewer;
        "flow-document-page-viewer": FlowDocumentPageViewer;
        "rich-text-toolbar": RichTextToolbar;
        "rich-text-page-editor": RichTextPageEditor;
    }
}
