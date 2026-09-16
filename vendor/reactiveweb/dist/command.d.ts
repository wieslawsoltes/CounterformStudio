import { Observable, Subscription, type ObservableInput, type OperatorFunction, type SchedulerLike } from 'rxjs';
/** The small command contract that bindings and framework adapters consume. */
export interface IReactiveCommand<TInput = void, TOutput = void> {
    readonly CanExecute: Observable<boolean>;
    readonly IsExecuting: Observable<boolean>;
    readonly ThrownExceptions: Observable<unknown>;
    Execute(input?: TInput): Observable<TOutput>;
    Dispose(): void;
    unsubscribe(): void;
}
export type CommandTask<TInput, TOutput> = (input: TInput, signal: AbortSignal) => PromiseLike<TOutput>;
export type CommandObservable<TInput, TOutput> = (input: TInput, signal: AbortSignal) => ObservableInput<TOutput>;
/**
 * A reusable RxJS command. Subscribe to the command for all successful results;
 * subscribe to Execute(input) to start one cold execution and observe its result.
 * Explicit executions are independent of CanExecute, as in ReactiveUI. Bindings
 * and InvokeCommand honor CanExecute and drop disabled/busy invocations.
 *
 * Result broadcasts, execution-state transitions and ThrownExceptions use the
 * output scheduler. Execute's own observer receives the source notifications
 * directly. Unsubscribing cancels an observable execution and aborts a task's
 * signal; a task stays executing until its promise actually settles.
 */
export declare class ReactiveCommand<TInput = void, TOutput = void> extends Observable<TOutput> implements IReactiveCommand<TInput, TOutput> {
    private readonly executeFactory;
    private readonly outputScheduler;
    private readonly tracksPromise;
    private readonly results;
    private readonly canExecuteState;
    private readonly executingState;
    private readonly exceptions;
    private readonly lifetime;
    private readonly scheduled;
    private readonly executions;
    private userCanExecute;
    private inFlight;
    private disposed;
    private forwardExecutionErrors;
    readonly CanExecute: Observable<boolean>;
    readonly IsExecuting: Observable<boolean>;
    readonly ThrownExceptions: Observable<unknown>;
    readonly Results: Observable<TOutput>;
    /** Compatibility hook; by default this delegates to RxApp's current handler. */
    static DefaultExceptionHandler: (error: unknown) => void;
    constructor(executeFactory: CommandObservable<TInput, TOutput>, canExecute?: Observable<boolean>, outputScheduler?: SchedulerLike, tracksPromise?: boolean);
    static Create<TInput = void, TOutput = void>(execute: (input: TInput) => TOutput, canExecute?: Observable<boolean>, outputScheduler?: SchedulerLike): ReactiveCommand<TInput, TOutput>;
    static CreateFromTask<TInput = void, TOutput = void>(execute: CommandTask<TInput, TOutput>, canExecute?: Observable<boolean>, outputScheduler?: SchedulerLike): ReactiveCommand<TInput, TOutput>;
    static CreateFromObservable<TInput = void, TOutput = void>(execute: CommandObservable<TInput, TOutput>, canExecute?: Observable<boolean>, outputScheduler?: SchedulerLike): ReactiveCommand<TInput, TOutput>;
    /** Execute every child, combining the latest result from each child. */
    static CreateCombined<TInput = void, TOutput = void>(commands: readonly ReactiveCommand<TInput, TOutput>[], canExecute?: Observable<boolean>, outputScheduler?: SchedulerLike): ReactiveCommand<TInput, TOutput[]>;
    static create: typeof ReactiveCommand.Create;
    static createFromTask: typeof ReactiveCommand.CreateFromTask;
    static createFromObservable: typeof ReactiveCommand.CreateFromObservable;
    static createCombined: typeof ReactiveCommand.CreateCombined;
    get CanExecuteValue(): boolean;
    get IsExecutingValue(): boolean;
    get IsDisposed(): boolean;
    get canExecute$(): Observable<boolean>;
    get isExecuting$(): Observable<boolean>;
    get thrownExceptions$(): Observable<unknown>;
    Execute(input?: TInput): Observable<TOutput>;
    /** Gated, eager execution for DOM events and ICommand-style use. */
    Invoke(input?: TInput): Subscription;
    execute(input?: TInput): Observable<TOutput>;
    invoke(input?: TInput): Subscription;
    executeAsync(input?: TInput): Promise<TOutput>;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
    private setCanExecute;
    private publishState;
    private reportException;
    private schedule;
}
/** Operator form: source.pipe(InvokeCommand(command)).subscribe(). */
export declare function InvokeCommand<TInput, TOutput>(command: ReactiveCommand<TInput, TOutput>): OperatorFunction<TInput, TOutput>;
/** .NET extension-style form: InvokeCommand(source, command), already subscribed. */
export declare function InvokeCommand<TInput, TOutput>(source: Observable<TInput>, command: ReactiveCommand<TInput, TOutput>): Subscription & {
    Dispose(): void;
};
export declare const invokeCommand: typeof InvokeCommand;
//# sourceMappingURL=command.d.ts.map