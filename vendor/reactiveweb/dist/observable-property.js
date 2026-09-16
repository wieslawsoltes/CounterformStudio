import { Subject, distinctUntilChanged, observeOn } from 'rxjs';
import { SingleAssignmentDisposable } from './disposables.js';
import { RxApp } from './rx-app.js';
/** A cached observable value with .NET notification order and deterministic ownership. */
export class ObservableAsPropertyHelper {
    source;
    value;
    disposed = false;
    subscribed = false;
    subscription = new SingleAssignmentDisposable();
    exceptionSubject = new Subject();
    options;
    ThrownExceptions = this.exceptionSubject.asObservable();
    thrownExceptions = this.ThrownExceptions;
    constructor(source, optionsOrChanged = {}, initialValue, deferSubscription = false, scheduler) {
        this.source = source;
        this.options = typeof optionsOrChanged === 'function'
            ? { onChanged: optionsOrChanged, initialValue, deferSubscription, scheduler }
            : optionsOrChanged;
        this.value = this.options.initialValue;
        if (!this.options.deferSubscription)
            this.Subscribe();
    }
    get Value() { this.Subscribe(); return this.value; }
    get valueOrDefault() { return this.value; }
    get IsSubscribed() { return this.subscribed; }
    get IsDisposed() { return this.disposed; }
    get closed() { return this.disposed; }
    Subscribe() {
        if (this.disposed || this.subscribed)
            return;
        this.subscribed = true;
        const comparer = this.options.comparer ?? Object.is;
        const source = this.source.pipe(distinctUntilChanged(comparer), observeOn(this.options.scheduler ?? RxApp.MainThreadScheduler));
        this.subscription.Disposable = source.subscribe({
            next: value => {
                if (this.disposed || comparer(this.value, value))
                    return;
                const previous = this.value;
                try {
                    this.options.onChanging?.(value, previous);
                    if (this.disposed)
                        return;
                    this.value = value;
                    this.options.onChanged?.(value, previous);
                }
                catch (error) {
                    this.reportException(error);
                }
            },
            error: error => this.reportException(error)
        });
    }
    reportException(error) {
        if (this.disposed)
            return;
        if (this.exceptionSubject.observed)
            this.exceptionSubject.next(error);
        else
            RxApp.HandleException(error);
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        try {
            this.subscription.Dispose();
        }
        finally {
            this.exceptionSubject.complete();
        }
    }
    unsubscribe() { this.Dispose(); }
    dispose() { this.Dispose(); }
}
function isOptions(value) {
    return value !== null && typeof value === 'object' &&
        (Object.keys(value).length === 0 || ['initialValue', 'scheduler', 'deferSubscription', 'comparer', 'onChanging', 'onChanged', 'installProperty'].some(key => key in value));
}
export function ToProperty(source, owner, propertyName, initialValueOrOptions, extraOptions) {
    const options = extraOptions
        ? { ...extraOptions, initialValue: initialValueOrOptions }
        : isOptions(initialValueOrOptions) ? initialValueOrOptions : { initialValue: initialValueOrOptions };
    const helper = new ObservableAsPropertyHelper(source, {
        ...options,
        deferSubscription: true,
        onChanging(value, previous) {
            owner.RaisePropertyChanging(propertyName, previous, value);
            options.onChanging?.(value, previous);
        },
        onChanged(value, previous) {
            owner.RaisePropertyChanged(propertyName, previous, value);
            options.onChanged?.(value, previous);
        }
    });
    let current = owner;
    let descriptor;
    while (current && !descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(current, propertyName);
        current = Object.getPrototypeOf(current);
    }
    const shouldInstall = options.installProperty ?? !(descriptor?.get && !descriptor.set);
    if (shouldInstall) {
        try {
            Object.defineProperty(owner, propertyName, { enumerable: true, configurable: true, get: () => helper.Value });
        }
        catch (error) {
            helper.Dispose();
            throw error;
        }
    }
    if (!options.deferSubscription)
        helper.Subscribe();
    return helper;
}
export const toProperty = ToProperty;
//# sourceMappingURL=observable-property.js.map