import { Observable } from 'rxjs';
import { type IDisposable } from './disposables.js';
export interface IReactivePropertyChangedEventArgs<TSender = object, TValue = unknown> {
    readonly Sender: TSender;
    readonly PropertyName: string;
    readonly Value: TValue;
    readonly OldValue: TValue | undefined;
    readonly sender: TSender;
    readonly propertyName: string;
    readonly value: TValue;
    readonly oldValue: TValue | undefined;
}
export type PropertyChangedEvent<TSender = object, TValue = unknown> = IReactivePropertyChangedEventArgs<TSender, TValue>;
export type PropertyPath<T = any> = string | readonly (string | number)[] | ((source: T) => unknown);
export interface ObservePropertyOptions<T = unknown> {
    beforeChange?: boolean;
    skipInitial?: boolean;
    distinct?: boolean;
    comparer?: (previous: T, current: T) => boolean;
}
/** Stores reactive values separately from accessors, so property setters never recurse. */
export declare class ReactiveObject implements IDisposable {
    private readonly values;
    private readonly changingSubject;
    private readonly changedSubject;
    private readonly exceptionSubject;
    private suppressCount;
    private delayCount;
    private pending;
    private disposed;
    readonly Changing: Observable<PropertyChangedEvent<this>>;
    readonly Changed: Observable<PropertyChangedEvent<this>>;
    readonly ThrownExceptions: Observable<unknown>;
    readonly PropertyChanging: Observable<PropertyChangedEvent<this, unknown>>;
    readonly PropertyChanged: Observable<PropertyChangedEvent<this, unknown>>;
    readonly changing: Observable<PropertyChangedEvent<this, unknown>>;
    readonly changed: Observable<PropertyChangedEvent<this, unknown>>;
    readonly thrownExceptions: Observable<unknown>;
    constructor(initialValues?: Record<string, unknown>);
    get IsDisposed(): boolean;
    get AreChangeNotificationsEnabled(): boolean;
    GetChangedObservable(): Observable<PropertyChangedEvent<this>>;
    GetChangingObservable(): Observable<PropertyChangedEvent<this>>;
    GetThrownExceptionsObservable(): Observable<unknown>;
    GetValue<T>(propertyName: string, fallback?: T): T;
    getValue<T>(propertyName: string, fallback?: T): T;
    SetValue<T>(propertyName: string, value: T): T;
    setValue<T>(propertyName: string, value: T): T;
    RaiseAndSetIfChanged<T>(propertyName: string, value: T): T;
    raiseAndSetIfChanged<T>(propertyName: string, value: T): T;
    RaisePropertyChanging(propertyName: string, oldValue?: unknown, newValue?: unknown): void;
    RaisePropertyChanged(propertyName: string, oldValue?: unknown, newValue?: unknown): void;
    private readProperty;
    SuppressChangeNotifications(): IDisposable & {
        unsubscribe(): void;
    };
    suppressChangeNotifications(): IDisposable & {
        unsubscribe(): void;
    };
    DelayChangeNotifications(): IDisposable & {
        unsubscribe(): void;
    };
    delayChangeNotifications(): IDisposable & {
        unsubscribe(): void;
    };
    ReportException(error: unknown): void;
    ObservableForProperty<T = unknown>(path: PropertyPath<this>, options?: ObservePropertyOptions<T>): Observable<PropertyChangedEvent<this, T>>;
    WhenAnyValue<TKey extends keyof this>(path: TKey): Observable<this[TKey]>;
    WhenAnyValue<T>(path: (source: this) => T): Observable<T>;
    WhenAnyValue<T1, T2>(first: (source: this) => T1, second: (source: this) => T2): Observable<[T1, T2]>;
    WhenAnyValue<T1, TResult>(path: (source: this) => T1, selector: (value: T1) => TResult): Observable<TResult>;
    WhenAnyValue<T1, T2, TResult>(first: (source: this) => T1, second: (source: this) => T2, selector: (first: T1, second: T2) => TResult): Observable<TResult>;
    WhenAnyValue<T = unknown>(...pathsAndSelector: any[]): Observable<T>;
    whenAnyValue<T = unknown>(...pathsAndSelector: any[]): Observable<T>;
    WhenAny<T = unknown>(...pathsAndSelector: any[]): Observable<T>;
    WhenAnyDynamic<T = unknown>(...pathsAndSelector: any[]): Observable<T>;
    WhenAnyObservable<T = unknown>(...pathsAndSelector: any[]): Observable<T>;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
export declare function DefineReactiveProperty<T>(target: ReactiveObject, propertyName: string, initialValue: T): void;
export declare const defineReactiveProperty: typeof DefineReactiveProperty;
export declare function defineReactiveProperties<T extends ReactiveObject, TProperties extends Record<string, unknown>>(target: T, properties: TProperties): T & TProperties;
/** Converts a member-access selector or dotted/bracketed path into a safe property chain. */
export declare function getPropertyPath<T>(path: PropertyPath<T>): string[];
/** Observes every reactive object in a chain and detaches old branches on replacement. */
export declare function ObservableForProperty<TSource extends object, TValue = unknown>(source: TSource, path: PropertyPath<TSource>, options?: ObservePropertyOptions<TValue>): Observable<PropertyChangedEvent<TSource, TValue>>;
export declare const observableForProperty: typeof ObservableForProperty;
export declare function WhenAnyValue<TSource extends object, TKey extends keyof TSource>(source: TSource, path: TKey): Observable<TSource[TKey]>;
export declare function WhenAnyValue<TSource extends object, TValue>(source: TSource, path: (source: TSource) => TValue): Observable<TValue>;
export declare function WhenAnyValue<TSource extends object, T1, T2>(source: TSource, first: (source: TSource) => T1, second: (source: TSource) => T2): Observable<[T1, T2]>;
export declare function WhenAnyValue<TSource extends object, T1, TResult>(source: TSource, path: (source: TSource) => T1, selector: (value: T1) => TResult): Observable<TResult>;
export declare function WhenAnyValue<TSource extends object, T1, T2, TResult>(source: TSource, first: (source: TSource) => T1, second: (source: TSource) => T2, selector: (first: T1, second: T2) => TResult): Observable<TResult>;
export declare function WhenAnyValue<TSource extends object, TResult = unknown>(source: TSource, ...pathsAndSelector: any[]): Observable<TResult>;
export declare const whenAnyValue: typeof WhenAnyValue;
export declare function WhenAny<TSource extends object, TResult = unknown>(source: TSource, ...pathsAndSelector: any[]): Observable<TResult>;
export declare const whenAny: typeof WhenAny;
export declare const WhenAnyDynamic: typeof WhenAny;
export declare const whenAnyDynamic: typeof WhenAny;
export declare function WhenAnyObservable<TSource extends object, TValue = unknown>(source: TSource, ...pathsAndSelector: any[]): Observable<TValue>;
export declare const whenAnyObservable: typeof WhenAnyObservable;
//# sourceMappingURL=reactive-object.d.ts.map