import { Observable, type SchedulerLike } from 'rxjs';
import { type IDisposable } from './disposables.js';
export interface ObservableAsPropertyOptions<T> {
    initialValue?: T;
    scheduler?: SchedulerLike;
    deferSubscription?: boolean;
    comparer?: (previous: T, current: T) => boolean;
    onChanging?: (value: T, previous: T) => void;
    onChanged?: (value: T, previous: T) => void;
    /** ToProperty installs a read-only accessor unless the owner already declares a read-only getter. */
    installProperty?: boolean;
}
export interface PropertyNotificationTarget {
    RaisePropertyChanging(propertyName: string, oldValue?: unknown, newValue?: unknown): void;
    RaisePropertyChanged(propertyName: string, oldValue?: unknown, newValue?: unknown): void;
    ReportException?(error: unknown): void;
}
/** A cached observable value with .NET notification order and deterministic ownership. */
export declare class ObservableAsPropertyHelper<T> implements IDisposable {
    private readonly source;
    private value;
    private disposed;
    private subscribed;
    private readonly subscription;
    private readonly exceptionSubject;
    private readonly options;
    readonly ThrownExceptions: Observable<unknown>;
    readonly thrownExceptions: Observable<unknown>;
    constructor(source: Observable<T>, options?: ObservableAsPropertyOptions<T>);
    constructor(source: Observable<T>, onChanged: (value: T, previous: T) => void, initialValue?: T, deferSubscription?: boolean, scheduler?: SchedulerLike);
    get Value(): T;
    get valueOrDefault(): T;
    get IsSubscribed(): boolean;
    get IsDisposed(): boolean;
    get closed(): boolean;
    Subscribe(): void;
    private reportException;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
export declare function ToProperty<T>(source: Observable<T>, owner: PropertyNotificationTarget, propertyName: string, options?: ObservableAsPropertyOptions<T>): ObservableAsPropertyHelper<T>;
export declare function ToProperty<T>(source: Observable<T>, owner: PropertyNotificationTarget, propertyName: string, initialValue?: T, options?: ObservableAsPropertyOptions<T>): ObservableAsPropertyHelper<T>;
export declare const toProperty: typeof ToProperty;
//# sourceMappingURL=observable-property.d.ts.map