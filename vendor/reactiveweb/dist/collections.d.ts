import { Observable } from 'rxjs';
import { type ChangeSet as DynamicChangeSetType } from '@wieslawsoltes/dynamicdataweb';
import { type DynamicDataSource } from './dynamic-data.js';
import { type IDisposable, type DisposableLike } from './disposables.js';
export type CollectionChangeReason = 'add' | 'remove' | 'replace' | 'move' | 'reset' | 'refresh';
export interface CollectionChange<T> {
    readonly Reason: CollectionChangeReason;
    readonly Index: number;
    readonly Items: readonly T[];
    readonly PreviousItems?: readonly T[];
    readonly PreviousIndex?: number;
}
export type ChangeSet<T> = readonly CollectionChange<T>[];
/** A list with synchronous mutation, immutable snapshots and atomic change batches. */
export declare class ObservableCollection<T> implements Iterable<T>, IDisposable {
    protected values: T[];
    private readonly changes;
    private readonly snapshots;
    private readonly counts;
    private editDepth;
    private publishing;
    private revision;
    private pending;
    private disposed;
    constructor(items?: Iterable<T>);
    get Count(): number;
    get length(): number;
    get Items(): readonly T[];
    get ItemsChanged(): Observable<readonly T[]>;
    get CountChanged(): Observable<number>;
    get CollectionChanged(): Observable<ChangeSet<T>>;
    get IsDisposed(): boolean;
    [Symbol.iterator](): Iterator<T>;
    GetAt(index: number): T;
    IndexOf(item: T): number;
    Contains(item: T): boolean;
    ToArray(): T[];
    private checkIndex;
    private checkAlive;
    private record;
    private publish;
    Add(item: T): void;
    AddRange(items: Iterable<T>): void;
    Insert(index: number, item: T): void;
    Remove(item: T): boolean;
    RemoveAt(index: number): T;
    RemoveRange(index: number, count: number): void;
    RemoveAll(predicate: (item: T) => boolean): number;
    SetAt(index: number, item: T): void;
    Move(oldIndex: number, newIndex: number): void;
    Clear(): void;
    Reset(items: Iterable<T>): void;
    Refresh(item?: T): void;
    /** Refresh a particular occurrence, including duplicate references. */
    RefreshAt(index: number): void;
    /** Native DynamicData binding hook; Connect continues to expose the legacy protocol. */
    ApplyChanges<K = unknown>(changes: DynamicChangeSetType<T, K>): void;
    /** Nested edits produce one batch. An exception restores that edit's pre-mutation state. */
    Edit(action: (collection: this) => void): void;
    Connect(): Observable<ChangeSet<T>>;
    Dispose(): void;
    unsubscribe(): void;
    add(item: T): void;
    remove(item: T): boolean;
    edit(action: (collection: this) => void): void;
}
export interface DerivedListOptions<T> {
    filter?: (item: T) => boolean;
    comparer?: (left: T, right: T) => number;
    filterObservable?: Observable<(item: T) => boolean>;
    comparerObservable?: Observable<((left: T, right: T) => number) | undefined>;
    /** Defaults to DynamicData property notifications, including ReactiveObject.Changed. */
    observeItem?: (item: T) => Observable<unknown> | undefined;
}
/** Incremental DynamicData projection; unaffected objects keep their existing property subscriptions. */
export declare class BindableDerivedList<T> implements Iterable<T>, IDisposable {
    readonly Source: DynamicDataSource<T>;
    private readonly result;
    private readonly filtered;
    private readonly subscription;
    private readonly errors;
    private readonly filter;
    private readonly comparer;
    private readonly refresh;
    private sorted?;
    private comparison?;
    private disposed;
    constructor(Source: DynamicDataSource<T>, options?: DerivedListOptions<T>);
    get Count(): number;
    get Items(): readonly T[];
    get ItemsChanged(): Observable<readonly T[]>;
    get CountChanged(): Observable<number>;
    get CollectionChanged(): Observable<ChangeSet<T>>;
    get ThrownExceptions(): Observable<unknown>;
    get IsDisposed(): boolean;
    GetAt(index: number): T;
    ToArray(): T[];
    [Symbol.iterator](): Iterator<T>;
    Connect(): Observable<ChangeSet<T>>;
    SetFilter(filter?: (item: T) => boolean): void;
    SetComparer(comparer?: (left: T, right: T) => number): void;
    private bindOrdering;
    Refresh(): void;
    Dispose(): void;
    unsubscribe(): void;
}
export declare function ToObservableCollection<T>(source: Observable<Iterable<T>>, target?: ObservableCollection<T>): {
    Collection: ObservableCollection<T>;
    Subscription: IDisposable;
};
export interface IObjectLifecycleSubscription extends IDisposable {
    readonly Errors: Observable<unknown>;
    unsubscribe(): void;
}
/** Own one resource per distinct object; duplicates retain it until their last removal. */
export declare function ActOnEveryObject<T>(collection: DynamicDataSource<T>, onAdded: (item: T) => DisposableLike | void, onRemoved?: (item: T) => void): IObjectLifecycleSubscription;
export declare function ObserveCollectionChanges<T>(collection: ObservableCollection<T>): Observable<ChangeSet<T>>;
export declare function WhenCountChanged<T>(collection: ObservableCollection<T>): Observable<number>;
export type ReactiveChange<T> = CollectionChange<T>;
export type ReactiveChangeSet<T> = ChangeSet<T>;
export type Comparer<T> = (left: T, right: T) => number;
/** Composable stable-order keys usable with native array sort and derived collections. */
export declare class OrderedComparer<T> {
    private readonly compare;
    private constructor();
    static OrderBy<T, TKey>(selector: (item: T) => TKey, comparer?: Comparer<TKey>): OrderedComparer<T>;
    static OrderByDescending<T, TKey>(selector: (item: T) => TKey, comparer?: Comparer<TKey>): OrderedComparer<T>;
    ThenBy<TKey>(selector: (item: T) => TKey, comparer?: Comparer<TKey>): OrderedComparer<T>;
    ThenByDescending<TKey>(selector: (item: T) => TKey, comparer?: Comparer<TKey>): OrderedComparer<T>;
    Compare: (left: T, right: T) => number;
}
//# sourceMappingURL=collections.d.ts.map