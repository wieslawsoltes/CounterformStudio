import { Observable, type MonoTypeOperatorFunction, type ObservableInput, type Observer, type OperatorFunction } from 'rxjs';
import type { DisposableSubscription } from './scheduled-subject.js';
/** Project non-null values and switch to the latest projected observable. */
export declare function SwitchSelect<T, R>(selector: (value: T) => ObservableInput<R>): OperatorFunction<T | null | undefined, R>;
export declare function SwitchSelect<T, R>(source: Observable<T | null | undefined>, selector: (value: T) => ObservableInput<R>): Observable<R>;
type SubscriptionObserver<T> = Partial<Observer<T>> | ((value: T) => void);
/** Subscribe to a replaceable inner observable, ignoring null outer values. */
export declare function SwitchSubscribe<T>(source: Observable<ObservableInput<T> | null | undefined>, observer: SubscriptionObserver<T>): DisposableSubscription;
/** Project a replaceable object (such as a command), then subscribe to its stream. */
export declare function SwitchSubscribe<T, R>(source: Observable<T | null | undefined>, selector: (value: T) => ObservableInput<R>, observer: SubscriptionObserver<R>): DisposableSubscription;
/** .NET-style Do is RxJS tap: callbacks run before the unchanged notification. */
export declare function Do<T>(observer: SubscriptionObserver<T>, onError?: (error: unknown) => void, onCompleted?: () => void): MonoTypeOperatorFunction<T>;
export declare function Do<T>(source: Observable<T>, observer: SubscriptionObserver<T>, onError?: (error: unknown) => void, onCompleted?: () => void): Observable<T>;
/** Logger contracts accept browser consoles and small .NET-style logger adapters. */
export interface ObservableLogger {
    info?(message: string, value?: unknown): void;
    warn?(message: string, error?: unknown): void;
    Info?(message: string, value?: unknown): void;
    Warn?(error: unknown, message: string): void;
}
export type ObservableLoggerSource = ObservableLogger | {
    Log(): ObservableLogger;
};
/** Log every notification while preserving values, errors, and completion. */
export declare function Log<T>(logger?: ObservableLoggerSource, message?: string, stringifier?: (value: T) => string): MonoTypeOperatorFunction<T>;
export declare function Log<T>(source: Observable<T>, logger?: ObservableLoggerSource, message?: string, stringifier?: (value: T) => string): Observable<T>;
export type LoggedFallback<T> = ObservableInput<T> | ((error: unknown) => ObservableInput<T>);
/** Log a matching source error, then use its fallback. Omitted fallback emits undefined once. */
export declare function LoggedCatch<T>(logger?: ObservableLoggerSource): OperatorFunction<T, T | undefined>;
export declare function LoggedCatch<T>(logger: ObservableLoggerSource, fallback: LoggedFallback<T>, message?: string, shouldCatch?: (error: unknown) => boolean): MonoTypeOperatorFunction<T>;
export declare function LoggedCatch<T>(source: Observable<T>, logger?: ObservableLoggerSource): Observable<T | undefined>;
export declare function LoggedCatch<T>(source: Observable<T>, logger: ObservableLoggerSource, fallback: LoggedFallback<T>, message?: string, shouldCatch?: (error: unknown) => boolean): Observable<T>;
export declare const switchSelect: typeof SwitchSelect;
export declare const switchSubscribe: typeof SwitchSubscribe;
export declare const loggedCatch: typeof LoggedCatch;
export declare const logObservable: typeof Log;
export declare const ObservableLoggingMixins: {
    Log: typeof Log;
    LoggedCatch: typeof LoggedCatch;
    Do: typeof Do;
};
export declare const SwitchSubscribeMixins: {
    SwitchSelect: typeof SwitchSelect;
    SwitchSubscribe: typeof SwitchSubscribe;
};
export {};
//# sourceMappingURL=observable-extensions.d.ts.map