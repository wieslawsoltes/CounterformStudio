import { Observable, Subscription, type ObservableInput, type SchedulerLike } from 'rxjs';
export interface IInteractionContext<TInput, TOutput> {
    readonly Input: TInput;
    readonly IsHandled: boolean;
    readonly Signal: AbortSignal;
    GetInput(): TInput;
    SetOutput(output: TOutput): void;
}
/** One request and its write-once answer. */
export declare class InteractionContext<TInput, TOutput> implements IInteractionContext<TInput, TOutput> {
    readonly Input: TInput;
    private handled;
    private output;
    readonly Signal: AbortSignal;
    constructor(Input: TInput, signal?: AbortSignal);
    get IsHandled(): boolean;
    GetInput(): TInput;
    SetOutput(output: TOutput): void;
    GetOutput(): TOutput;
    get input(): TInput;
    get isHandled(): boolean;
    get signal(): AbortSignal;
    setOutput(output: TOutput): void;
}
export declare class UnhandledInteractionError<TInput = unknown, TOutput = unknown> extends Error {
    readonly Interaction: Interaction<TInput, TOutput>;
    readonly Input: TInput;
    constructor(Interaction: Interaction<TInput, TOutput>, Input: TInput);
}
/** Familiar .NET name, referring to the same error class. */
export { UnhandledInteractionError as UnhandledInteractionException };
export type InteractionHandler<TInput, TOutput> = (context: InteractionContext<TInput, TOutput>) => void | PromiseLike<unknown> | ObservableInput<unknown>;
export interface IInteraction<TInput, TOutput> {
    Handle(input: TInput): Observable<TOutput>;
    RegisterHandler(handler: InteractionHandler<TInput, TOutput>): Subscription & {
        Dispose(): void;
    };
}
/**
 * A view-independent request/response channel. Handlers are tried newest first,
 * sequentially; each may decline by completing without SetOutput. Async and
 * Observable handlers must complete before the next handler runs. Every Handle
 * subscription takes a fresh handler snapshot and independent context.
 */
export declare class Interaction<TInput, TOutput> implements IInteraction<TInput, TOutput> {
    private readonly handlerScheduler;
    private handlers;
    private readonly requests;
    private disposed;
    constructor(handlerScheduler?: SchedulerLike);
    RegisterHandler(handler: InteractionHandler<TInput, TOutput>): Subscription & {
        Dispose(): void;
    };
    Handle(input: TInput): Observable<TOutput>;
    protected GenerateContext(input: TInput, signal?: AbortSignal): InteractionContext<TInput, TOutput>;
    get IsDisposed(): boolean;
    get HandlerCount(): number;
    handle(input: TInput): Observable<TOutput>;
    registerHandler(handler: InteractionHandler<TInput, TOutput>): Subscription & {
        Dispose(): void;
    };
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
//# sourceMappingURL=interaction.d.ts.map