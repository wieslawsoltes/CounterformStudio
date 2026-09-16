import { BehaviorSubject, Observable, Subscription, combineLatest, defaultIfEmpty, from, isObservable, observable, observeOn, of, skip } from 'rxjs';
import { CompositeDisposable, Disposable } from './disposables.js';
import { ReactiveObject } from './reactive-object.js';
function errorsFrom(result) {
    if (result == null || result === true)
        return [];
    if (result === false)
        return ['The value is invalid.'];
    return typeof result === 'string' ? result ? [result] : [] : result.filter(message => !!message);
}
function isPropertyOptions(value) {
    return value !== null && typeof value === 'object' &&
        (Object.keys(value).length === 0 || ['initialValue', 'allowDuplicateValues', 'skipCurrentValueOnSubscribe', 'ignoreInitialError', 'comparer', 'scheduler'].some(key => key in value));
}
/** A mutable reactive value, an RxJS source, and a cancellable validation model. */
export class ReactiveProperty extends ReactiveObject {
    currentValue;
    valueSubject;
    validationValueSubject;
    errorSubject = new BehaviorSubject([]);
    hasErrorsSubject = new BehaviorSubject(false);
    validatingSubject = new BehaviorSubject(false);
    errorsChangedSubject = new BehaviorSubject({ PropertyName: 'Value', propertyName: 'Value' });
    sourceSubscription = new Subscription();
    validationSubscription = new Subscription();
    validationVersion = 0;
    validators = new Set();
    streamErrors = new Map();
    valueErrors = [];
    options;
    wasEdited = false;
    ErrorsChanged = this.errorsChangedSubject.asObservable();
    IsValidatingObservable = this.validatingSubject.asObservable();
    static Create(initialValue, options) { return new ReactiveProperty(initialValue, options); }
    constructor(initialValueOrSource, optionsOrInitial, sourceOptions) {
        super();
        const source = isObservable(initialValueOrSource) ? initialValueOrSource : undefined;
        this.options = source
            ? sourceOptions ? { ...sourceOptions, initialValue: optionsOrInitial }
                : isPropertyOptions(optionsOrInitial) ? optionsOrInitial : { initialValue: optionsOrInitial }
            : (optionsOrInitial ?? {});
        this.currentValue = source ? this.options.initialValue : initialValueOrSource;
        this.valueSubject = new BehaviorSubject(this.currentValue);
        this.validationValueSubject = new BehaviorSubject(this.currentValue);
        if (source)
            this.sourceSubscription.add(source.subscribe({ next: value => this.OnNext(value), error: error => this.OnError(error) }));
    }
    get Value() { return this.currentValue; }
    set Value(value) { this.OnNext(value); }
    get value() { return this.Value; }
    set value(value) { this.Value = value; }
    get HasErrors() { return this.errorSubject.value.length > 0; }
    get IsValidating() { return this.validatingSubject.value; }
    get Errors() { return this.errorSubject.value; }
    get ObserveErrorChanged() { return this.errorSubject.asObservable(); }
    get ObserveHasErrors() { return this.hasErrorsSubject.asObservable(); }
    observeErrorChanged() { return this.ObserveErrorChanged; }
    observeHasErrors() { return this.ObserveHasErrors; }
    GetErrors(propertyName) { return propertyName && propertyName !== 'Value' ? [] : this.Errors; }
    OnNext(value) {
        if (this.IsDisposed)
            return;
        this.wasEdited = true;
        if (!this.options.allowDuplicateValues && (this.options.comparer ?? Object.is)(this.currentValue, value))
            return;
        this.setCurrent(value);
    }
    setCurrent(value) {
        const previous = this.currentValue;
        this.RaisePropertyChanging('Value', previous, value);
        this.currentValue = value;
        this.RaisePropertyChanged('Value', previous, value);
        this.valueSubject.next(value);
        this.CheckValidation();
    }
    OnError(error) { if (!this.IsDisposed)
        this.ReportException(error); }
    OnCompleted() { this.valueSubject.complete(); }
    next(value) { this.OnNext(value); }
    error(error) { this.OnError(error); }
    complete() { this.OnCompleted(); }
    Refresh() {
        if (this.IsDisposed)
            return;
        this.wasEdited = true;
        this.setCurrent(this.currentValue);
    }
    refresh() { this.Refresh(); }
    AddValidationError(validator, ignoreInitialError = this.options.ignoreInitialError ?? false) {
        if (this.IsDisposed)
            throw new Error('ReactiveProperty has been disposed.');
        this.validators.add(validator);
        if (!ignoreInitialError || this.wasEdited)
            this.CheckValidation();
        return this;
    }
    /** Persistent stream validators retain operator state, including debounce, switchMap, and scan. */
    AddValidationErrorObservable(transform, ignoreInitialError = this.options.ignoreInitialError ?? false) {
        if (this.IsDisposed)
            throw new Error('ReactiveProperty has been disposed.');
        const key = {};
        this.streamErrors.set(key, []);
        const values = ignoreInitialError ? this.validationValueSubject.pipe(skip(1)) : this.validationValueSubject.asObservable();
        try {
            this.sourceSubscription.add(transform(values).subscribe({
                next: errors => { this.streamErrors.set(key, errorsFrom(errors)); this.publishErrors(); },
                error: error => { this.streamErrors.set(key, [error instanceof Error ? error.message : String(error)]); this.publishErrors(); }
            }));
        }
        catch (error) {
            this.streamErrors.set(key, [error instanceof Error ? error.message : String(error)]);
            this.publishErrors();
        }
        return this;
    }
    /** Web convenience: returns a removable validator lifetime. */
    AddValidator(validator) {
        this.AddValidationError(validator);
        return Disposable.Create(() => {
            this.validators.delete(validator);
            this.CheckValidation();
        });
    }
    CheckValidation() {
        if (this.IsDisposed)
            return;
        const version = ++this.validationVersion;
        this.validationSubscription.unsubscribe();
        this.validationSubscription = new Subscription();
        this.validationValueSubject.next(this.currentValue);
        if (version !== this.validationVersion || this.IsDisposed)
            return;
        const validations = [];
        for (const validator of this.validators) {
            try {
                const result = validator(this.currentValue);
                const observableResult = isObservable(result) ? result
                    : result && typeof result.then === 'function'
                        ? from(result) : of(result);
                validations.push(new Observable(subscriber => observableResult.subscribe({
                    next: value => subscriber.next(errorsFrom(value)),
                    error: error => { subscriber.next([error instanceof Error ? error.message : String(error)]); subscriber.complete(); },
                    complete: () => subscriber.complete()
                })).pipe(defaultIfEmpty([])));
            }
            catch (error) {
                validations.push(of([error instanceof Error ? error.message : String(error)]));
            }
        }
        if (!validations.length) {
            this.valueErrors = [];
            this.publishErrors();
            this.setValidating(false);
            return;
        }
        this.setValidating(true);
        const subscription = combineLatest(validations).subscribe({
            next: results => {
                if (version !== this.validationVersion || this.IsDisposed)
                    return;
                this.valueErrors = results.flat();
                this.publishErrors();
                if (version === this.validationVersion)
                    this.setValidating(false);
            },
            complete: () => { if (version === this.validationVersion && !this.IsDisposed)
                this.setValidating(false); }
        });
        this.validationSubscription.add(subscription);
    }
    publishErrors() { this.setErrors([...new Set([...this.valueErrors, ...[...this.streamErrors.values()].flat()])]); }
    setValidating(value) {
        if (this.validatingSubject.value === value)
            return;
        this.RaisePropertyChanging('IsValidating', !value, value);
        this.validatingSubject.next(value);
        this.RaisePropertyChanged('IsValidating', !value, value);
    }
    setErrors(errors) {
        const previous = this.errorSubject.value;
        if (previous.length === errors.length && previous.every((value, index) => value === errors[index]))
            return;
        const hadErrors = previous.length > 0;
        const hasErrors = errors.length > 0;
        this.RaisePropertyChanging('Errors', previous, errors);
        if (hadErrors !== hasErrors)
            this.RaisePropertyChanging('HasErrors', hadErrors, hasErrors);
        this.errorSubject.next(Object.freeze([...errors]));
        if (hadErrors !== hasErrors)
            this.hasErrorsSubject.next(hasErrors);
        this.errorsChangedSubject.next({ PropertyName: 'Value', propertyName: 'Value' });
        this.RaisePropertyChanged('Errors', previous, errors);
        if (hadErrors !== hasErrors)
            this.RaisePropertyChanged('HasErrors', hadErrors, hasErrors);
    }
    asObservable() {
        const source = this.valueSubject.asObservable();
        const selected = this.options.skipCurrentValueOnSubscribe ? source.pipe(skip(1)) : source;
        return this.options.scheduler ? selected.pipe(observeOn(this.options.scheduler)) : selected;
    }
    ToObservable() { return this.asObservable(); }
    [observable]() { return this.asObservable(); }
    lift(operator) { return this.asObservable().lift(operator); }
    subscribe(observer) { return this.asObservable().subscribe(observer); }
    Subscribe(observer) { return this.subscribe(observer); }
    pipe(...operators) { return operators.reduce((source, operator) => operator(source), this.asObservable()); }
    Dispose() {
        if (this.IsDisposed)
            return;
        this.validationVersion++;
        super.Dispose();
        try {
            new CompositeDisposable(this.validationSubscription, this.sourceSubscription).Dispose();
        }
        finally {
            this.validators.clear();
            this.streamErrors.clear();
            this.valueSubject.complete();
            this.validationValueSubject.complete();
            this.errorSubject.complete();
            this.hasErrorsSubject.complete();
            this.validatingSubject.complete();
            this.errorsChangedSubject.complete();
        }
    }
}
export function ToReactiveProperty(source, options) {
    return new ReactiveProperty(source, options);
}
export const toReactiveProperty = ToReactiveProperty;
//# sourceMappingURL=reactive-property.js.map