import type { RichTextEngine } from "./engine.js";
import { ObservableEvent } from "./mvvm.js";
import type { IDisposable } from "./mvvm.js";
export declare const BridgeProtocol: {
    readonly channel: "richtextweb";
    readonly version: 1;
};
export interface BridgeRequest {
    channel: "richtextweb";
    version: 1;
    kind: "request";
    id: string;
    method: string;
    params?: Record<string, unknown>;
}
export interface BridgeResponse {
    channel: "richtextweb";
    version: 1;
    kind: "response";
    id: string | null;
    result?: unknown;
    error?: {
        code: string;
        message: string;
    };
}
export interface BridgeEvent {
    channel: "richtextweb";
    version: 1;
    kind: "event";
    event: "ready" | "documentChanged" | "selectionChanged";
    payload: unknown;
}
export type BridgeOutgoingMessage = BridgeResponse | BridgeEvent;
export interface BridgeOptions {
    /** Number of UTF-16 code units accepted per incoming JSON message. Default 8 Mi. */
    maxMessageLength?: number;
    maxDocumentNodes?: number;
    maxDocumentDepth?: number;
    /** Optional host policy. All edit methods consult it before mutation. */
    isReadOnly?: () => boolean;
    /** Full documents are opt-in; default changed events carry state and revision only. */
    includeDocumentInEvents?: boolean;
}
/** Validates an incoming envelope and rejects prototype keys/cycles/non-JSON values. */
export declare function parseBridgeRequest(input: unknown, maxMessageLength?: number): BridgeRequest;
/** Owns only its subscriptions, never the supplied engine. No eval or arbitrary member access. */
export declare class RichTextWebBridge implements IDisposable {
    readonly Engine: RichTextEngine;
    private readonly postMessage;
    private readonly options;
    readonly TransportError: ObservableEvent<unknown>;
    private readonly subscriptions;
    private disposed;
    private readonly maxMessageLength;
    private readonly maxNodes;
    private readonly maxDepth;
    constructor(Engine: RichTextEngine, postMessage: (message: BridgeOutgoingMessage) => void, options?: BridgeOptions);
    private send;
    private emit;
    private selection;
    GetState(): {
        revision: number;
        textLength: number;
        canUndo: boolean;
        canRedo: boolean;
        readOnly: boolean;
        selection: {
            start: number;
            end: number;
            text: string;
        };
    };
    NotifyReady(): void;
    /** JSON equivalents of structural engine operations. No executable callbacks cross the bridge. */
    private editStructure;
    /** Returns a response, without posting it. Events caused by an edit are still posted. */
    HandleMessage(input: unknown): BridgeResponse;
    Receive(input: unknown): BridgeResponse;
    Dispose(): void;
}
export interface WebViewMessageHost {
    postMessage(message: unknown): void;
    addEventListener(type: "message", listener: (event: {
        data: unknown;
    }) => void): void;
    removeEventListener(type: "message", listener: (event: {
        data: unknown;
    }) => void): void;
}
/** Explicit WebView2 attachment. Does not attach untrusted window.postMessage listeners. */
export declare function connectWebView2(engine: RichTextEngine, host: WebViewMessageHost, options?: BridgeOptions): RichTextWebBridge & {
    Dispose(): void;
};
/** Avalonia/other hosts call receiveRichTextWebMessage(JSON); native outbound is explicitly injected. */
export declare function connectScriptHost(engine: RichTextEngine, globalObject: Record<string, unknown>, sendToNative: (json: string) => void, options?: BridgeOptions): RichTextWebBridge;
