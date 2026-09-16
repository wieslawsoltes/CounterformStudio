import { Observable, Subscription, observable, type Observer, type Operator, type OperatorFunction, type PartialObserver, type SchedulerLike } from 'rxjs';
import { type IDisposable } from './disposables.js';
import { ReactiveObject } from './reactive-object.js';
export type ReactiveValueValidationResult = string | readonly string[] | null | undefined | boolean;
export type ReactivePropertyValidator<T> = (value: T) => ReactiveValueValidationResult | PromiseLike<ReactiveValueValidationResult> | Observable<ReactiveValueValidationResult>;
export interface ReactiveValueOptions<T> {
    initialValue?: T;
    allowDuplicateValues?: boolean;
    skipCurrentValueOnSubscribe?: boolean;
    ignoreInitialError?: boolean;
    comparer?: (previous: T, current: T) => boolean;
    scheduler?: SchedulerLike;
}
/** A mutable reactive value, an RxJS source, and a cancellable validation model. */
export declare class ReactiveProperty<T> extends ReactiveObject implements Observer<T> {
    [observable]: () => Observable<T>;
    private currentValue;
    private readonly valueSubject;
    private readonly validationValueSubject;
    private readonly errorSubject;
    private readonly hasErrorsSubject;
    private readonly validatingSubject;
    private readonly errorsChangedSubject;
    private readonly sourceSubscription;
    private validationSubscription;
    private validationVersion;
    private readonly validators;
    private readonly streamErrors;
    private valueErrors;
    private readonly options;
    private wasEdited;
    readonly ErrorsChanged: Observable<{
        PropertyName: string;
        propertyName: string;
    }>;
    readonly IsValidatingObservable: Observable<boolean>;
    static Create<T>(initialValue?: T, options?: ReactiveValueOptions<T>): ReactiveProperty<T>;
    constructor(initialValue?: T, options?: ReactiveValueOptions<T>);
    constructor(source: Observable<T>, options?: ReactiveValueOptions<T>);
    constructor(source: Observable<T>, initialValue: T, options?: ReactiveValueOptions<T>);
    get Value(): T;
    set Value(value: T);
    get value(): T;
    set value(value: T);
    get HasErrors(): boolean;
    get IsValidating(): boolean;
    get Errors(): readonly string[];
    get ObserveErrorChanged(): Observable<readonly string[]>;
    get ObserveHasErrors(): Observable<boolean>;
    observeErrorChanged(): Observable<readonly string[]>;
    observeHasErrors(): Observable<boolean>;
    GetErrors(propertyName?: string | null): readonly string[];
    OnNext(value: T): void;
    private setCurrent;
    OnError(error: unknown): void;
    OnCompleted(): void;
    next(value: T): void;
    error(error: unknown): void;
    complete(): void;
    Refresh(): void;
    refresh(): void;
    AddValidationError(validator: ReactivePropertyValidator<T>, ignoreInitialError?: boolean): this;
    /** Persistent stream validators retain operator state, including debounce, switchMap, and scan. */
    AddValidationErrorObservable(transform: (values: Observable<T>) => Observable<ReactiveValueValidationResult>, ignoreInitialError?: boolean): this;
    /** Web convenience: returns a removable validator lifetime. */
    AddValidator(validator: ReactivePropertyValidator<T>): IDisposable & {
        unsubscribe(): void;
    };
    CheckValidation(): void;
    private publishErrors;
    private setValidating;
    private setErrors;
    asObservable(): Observable<T>;
    ToObservable(): Observable<T>;
    lift<R>(operator?: Operator<T, R>): Observable<R>;
    subscribe(observer?: PartialObserver<T> | ((value: T) => void)): Subscription;
    Subscribe(observer?: PartialObserver<T> | ((value: T) => void)): Subscription;
    pipe(): Observable<T>;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
    pipe(...operators: OperatorFunction<any, any>[]): Observable<any>;
    Dispose(): void;
}
export declare function ToReactiveProperty<T>(source: Observable<T>, options?: ReactiveValueOptions<T>): ReactiveProperty<T>;
export declare const toReactiveProperty: typeof ToReactiveProperty;
//# sourceMappingURL=reactive-property.d.ts.map