import { Observable, Subject, Subscription, type Observer, type SchedulerAction, type SchedulerLike } from 'rxjs';
export type DisposableSubscription = Subscription & {
    Dispose(): void;
};
/** A subject whose observers receive notifications on a supplied scheduler. */
export declare class ScheduledSubject<T> extends Observable<T> implements Observer<T> {
    private readonly scheduler;
    private readonly defaultObserver?;
    private readonly backing;
    private readonly subscriptions;
    private fallbackSubscription;
    private observerCount;
    private disposed;
    private terminal;
    constructor(scheduler?: SchedulerLike, defaultObserver?: Partial<Observer<T>> | ((value: T) => void) | undefined, defaultSubject?: Subject<T>);
    private subscribeObserver;
    private attachDefaultObserver;
    get HasObservers(): boolean;
    get ObserverCount(): number;
    get IsDisposed(): boolean;
    get closed(): boolean;
    get observed(): boolean;
    OnNext(value: T): void;
    OnError(error: unknown): void;
    OnCompleted(): void;
    next(value: T): void;
    error(error: unknown): void;
    complete(): void;
    Subscribe(observer: Partial<Observer<T>> | ((value: T) => void)): DisposableSubscription;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
export interface DispatcherSchedulerOptions {
    /** Default false: use fallback now and retry the provider on the next request. */
    waitForDispatcher?: boolean;
    /** Scheduler used before the provider becomes available. Defaults to queueScheduler. */
    fallbackScheduler?: SchedulerLike;
    /** Scheduler that times retries in wait mode. Defaults to asyncScheduler. */
    retryScheduler?: SchedulerLike;
    /** A positive retry delay in milliseconds; defaults to 16. */
    retryDelay?: number;
}
/**
 * Retries a lazily available dispatcher and caches the first successful result.
 * Default behavior matches ReactiveUI: unavailable work runs on the fallback.
 * The web-only wait mode retries through delayed, cancellable scheduler actions.
 */
export declare class WaitForDispatcherScheduler implements SchedulerLike {
    private readonly provider;
    private dispatcher?;
    private readonly pending;
    private disposed;
    private lastError;
    private readonly fallback;
    private readonly retryScheduler;
    private readonly retryDelay;
    private readonly wait;
    constructor(provider?: () => SchedulerLike | undefined | null, options?: DispatcherSchedulerOptions);
    private resolve;
    now(): number;
    get Now(): number;
    get IsReady(): boolean;
    get IsDisposed(): boolean;
    get LastProviderError(): unknown;
    schedule<T>(work: (this: SchedulerAction<T>, state: T) => void, delay?: number, state?: T): Subscription;
    Schedule<T>(state: T, action: (scheduler: this, state: T) => void, delay?: number): DisposableSubscription;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
//# sourceMappingURL=scheduled-subject.d.ts.map