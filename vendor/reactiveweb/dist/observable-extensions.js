import { catchError, filter, from, isObservable, of, switchMap, tap, throwError, } from 'rxjs';
import { RxApp } from './rx-app.js';
export function SwitchSelect(sourceOrSelector, selector) {
    const project = selector ?? sourceOrSelector;
    if (typeof project !== 'function')
        throw new TypeError('A selector is required.');
    const operator = source => source.pipe(filter((value) => value != null), switchMap(project));
    return selector ? operator(sourceOrSelector) : operator;
}
export function SwitchSubscribe(source, selectorOrObserver, observer) {
    const selector = observer === undefined ? (value) => value : selectorOrObserver;
    const target = observer ?? selectorOrObserver;
    const handlers = typeof target === 'function' ? { next: target } : target;
    const subscription = SwitchSelect(source, selector).subscribe({
        next: value => handlers.next?.(value),
        error: error => handlers.error ? handlers.error(error) : RxApp.HandleException(error),
        complete: () => handlers.complete?.(),
    });
    return Object.assign(subscription, { Dispose() { subscription.unsubscribe(); } });
}
export function Do(sourceOrObserver, observerOrError, errorOrComplete, onCompleted) {
    const direct = isObservable(sourceOrObserver);
    const observer = (direct ? observerOrError : sourceOrObserver);
    const onError = (direct ? errorOrComplete : observerOrError);
    const complete = (direct ? onCompleted : errorOrComplete);
    const handlers = typeof observer === 'function' ? { next: observer, error: onError, complete } : observer;
    const operator = tap(handlers);
    return direct ? sourceOrObserver.pipe(operator) : operator;
}
function resolveLogger(source) {
    return 'Log' in source && typeof source.Log === 'function' ? source.Log() : source;
}
function info(logger, message, value) {
    const target = resolveLogger(logger);
    if (target.info)
        target.info(message, value);
    else
        target.Info?.(message, value);
}
function warn(logger, message, error) {
    const target = resolveLogger(logger);
    if (target.warn)
        target.warn(message, error);
    else
        target.Warn?.(error, message);
}
export function Log(sourceOrLogger = console, loggerOrMessage, messageOrStringifier, stringify) {
    const direct = isObservable(sourceOrLogger);
    const logger = (direct ? loggerOrMessage ?? console : sourceOrLogger);
    const message = (direct ? messageOrStringifier : loggerOrMessage);
    const stringifier = (direct ? stringify : messageOrStringifier);
    const prefix = message ? `${message} ` : '';
    const operator = tap({
        next: value => info(logger, `${prefix}OnNext`, stringifier ? stringifier(value) : value),
        error: error => warn(logger, `${prefix}OnError`, error),
        complete: () => info(logger, `${prefix}OnCompleted`),
    });
    return direct ? sourceOrLogger.pipe(operator) : operator;
}
export function LoggedCatch(sourceOrLogger = console, loggerOrFallback, fallbackOrMessage, messageOrPredicate, predicate) {
    const direct = isObservable(sourceOrLogger);
    const logger = (direct ? loggerOrFallback ?? console : sourceOrLogger);
    const fallback = (direct ? fallbackOrMessage : loggerOrFallback);
    const message = (direct ? messageOrPredicate : fallbackOrMessage);
    const shouldCatch = (direct ? predicate : messageOrPredicate);
    const operator = source => source.pipe(catchError(error => {
        if (shouldCatch && !shouldCatch(error))
            return throwError(() => error);
        warn(logger, message ?? '', error);
        if (fallback === undefined)
            return of(undefined);
        return from(typeof fallback === 'function' ? fallback(error) : fallback);
    }));
    return direct ? operator(sourceOrLogger) : operator;
}
export const switchSelect = SwitchSelect;
export const switchSubscribe = SwitchSubscribe;
export const loggedCatch = LoggedCatch;
export const logObservable = Log;
export const ObservableLoggingMixins = { Log, LoggedCatch, Do };
export const SwitchSubscribeMixins = { SwitchSelect, SwitchSubscribe };
//# sourceMappingURL=observable-extensions.js.map