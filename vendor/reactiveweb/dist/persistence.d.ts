import { Observable, Subject, type SchedulerLike } from 'rxjs';
import { type IDisposable } from './disposables.js';
import type { DynamicDataSource } from './dynamic-data.js';
export type AsyncResult<T> = T | PromiseLike<T> | Observable<T>;
export interface ISuspensionDriver<T = unknown> {
    LoadState(): AsyncResult<T | null>;
    SaveState(state: T): AsyncResult<unknown>;
    InvalidateState(): AsyncResult<unknown>;
}
export declare class InMemorySuspensionDriver<T = unknown> implements ISuspensionDriver<T> {
    private state;
    LoadState(): T | null;
    SaveState(state: T): void;
    InvalidateState(): void;
}
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export interface JsonPersistenceOptions<T> {
    key?: string;
    storage?: StorageLike;
    /** Validate or migrate parsed data before the application receives it. */
    deserialize?: (json: unknown) => T;
    serialize?: (state: T) => unknown;
}
export declare class LocalStorageSuspensionDriver<T = unknown> implements ISuspensionDriver<T> {
    private readonly options;
    private readonly storage;
    constructor(options?: JsonPersistenceOptions<T> | string);
    get Key(): string;
    LoadState(): T | null;
    SaveState(state: T): void;
    InvalidateState(): void;
}
export { LocalStorageSuspensionDriver as BrowserSuspensionDriver };
/** Coordinates launch/resume/persist lifecycle streams with a pluggable state driver. */
export declare class SuspensionHost<T = unknown> implements IDisposable {
    readonly IsLaunchingNew: Subject<void>;
    readonly IsResuming: Subject<void>;
    readonly IsUnpausing: Subject<void>;
    readonly ShouldPersistState: Subject<void | IDisposable>;
    readonly ShouldInvalidateState: Subject<void>;
    readonly ThrownExceptions: Subject<unknown>;
    CreateNewAppState: () => T;
    private readonly state;
    private setup?;
    private disposed;
    constructor(createNewAppState?: () => T);
    get AppState(): T | null;
    set AppState(value: T | null);
    get AppStateChanged(): Observable<T | null>;
    SetupDefaultSuspendResume(driver: ISuspensionDriver<T>): IDisposable;
    GetAppState<TState extends T>(): TState | null;
    Dispose(): void;
    unsubscribe(): void;
}
export declare function SetupDefaultSuspendResume<T>(host: SuspensionHost<T>, driver: ISuspensionDriver<T>): IDisposable;
export interface AutoPersistOptions {
    throttleMs?: number;
    scheduler?: SchedulerLike;
    initial?: boolean;
    onError?: (error: unknown) => void;
    changes?: Observable<unknown>;
}
export interface IPersistenceSubscription extends IDisposable {
    readonly Errors: Observable<unknown>;
    Flush(): Promise<void>;
    Trigger(): void;
    unsubscribe(): void;
}
/** Debounced, serialized persistence. Flush surfaces failures; later changes retry normally. */
export declare function AutoPersist<T>(item: T, persist: (item: T) => AsyncResult<unknown>, options?: AutoPersistOptions): IPersistenceSubscription;
/** Browser attachment reports lifecycle only; browsers do not await arbitrary asynchronous unload saves. */
export declare function AttachBrowserLifecycle<T>(host: SuspensionHost<T>, target?: Window): IDisposable;
/** Persists each live object independently, and releases its observer when it leaves the collection. */
export declare function AutoPersistCollection<T>(collection: DynamicDataSource<T>, persist: (item: T) => AsyncResult<unknown>, options?: AutoPersistOptions): IPersistenceSubscription;
//# sourceMappingURL=persistence.d.ts.map