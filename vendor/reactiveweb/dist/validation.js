import { BehaviorSubject, Subscription, catchError, defer, distinctUntilChanged, from, isObservable, map, of, startWith, switchMap } from 'rxjs';
import { ReactiveObject, WhenAnyValue } from './reactive-object.js';
import { Disposable } from './disposables.js';
const valid = Object.freeze({ IsValid: true, Text: Object.freeze([]), IsPending: false });
const pending = Object.freeze({ IsValid: false, Text: Object.freeze([]), IsPending: true });
/** Aggregates live rules. Pending validation deliberately prevents submission. */
export class ValidationContext {
    rules = new Map();
    state = new BehaviorSubject(valid);
    disposed = false;
    ValidationStatusChange = this.state.asObservable();
    IsValid = this.ValidationStatusChange.pipe(map(x => x.IsValid), distinctUntilChanged());
    IsPending = this.ValidationStatusChange.pipe(map(x => x.IsPending), distinctUntilChanged());
    Text = this.ValidationStatusChange.pipe(map(x => x.Text));
    get State() { return this.state.value; }
    get IsValidValue() { return this.State.IsValid; }
    get IsPendingValue() { return this.State.IsPending; }
    get Validations() { return [...this.rules.keys()]; }
    get HasErrors() { return !this.State.IsValid; }
    Add(rule) {
        if (this.disposed)
            throw new Error('ValidationContext is disposed.');
        if (this.rules.has(rule))
            throw new Error('The validation rule is already registered.');
        this.rules.set(rule, new Subscription());
        const subscription = rule.ValidationStatusChange.subscribe(() => this.refresh());
        this.rules.set(rule, subscription);
        this.refresh();
        return Disposable.Create(() => this.Remove(rule));
    }
    Remove(rule) {
        const subscription = this.rules.get(rule);
        if (!subscription)
            return false;
        this.rules.delete(rule);
        subscription.unsubscribe();
        this.refresh();
        return true;
    }
    GetErrors(propertyName) {
        return [...this.rules.keys()].filter(rule => propertyName == null || rule.PropertyName === propertyName).flatMap(rule => [...rule.State.Text]);
    }
    ObserveErrors(propertyName) {
        return this.ValidationStatusChange.pipe(map(() => this.GetErrors(propertyName)), distinctUntilChanged((a, b) => a.length === b.length && a.every((x, i) => x === b[i])));
    }
    refresh() {
        if (this.disposed)
            return;
        const states = [...this.rules.keys()].map(rule => rule.State);
        this.state.next(Object.freeze({ IsValid: states.every(x => x.IsValid && !x.IsPending), IsPending: states.some(x => x.IsPending), Text: Object.freeze(states.flatMap(x => [...x.Text])) }));
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        const entries = [...this.rules];
        this.rules.clear();
        for (const [rule, subscription] of entries) {
            subscription.unsubscribe();
            rule.Dispose();
        }
        this.state.complete();
    }
    unsubscribe() { this.Dispose(); }
}
function normalize(result, message) {
    if (typeof result === 'boolean')
        return result ? valid : Object.freeze({ IsValid: false, Text: Object.freeze([message]), IsPending: false });
    if (typeof result === 'string')
        return result.length ? Object.freeze({ IsValid: false, Text: Object.freeze([result]), IsPending: false }) : valid;
    if (Array.isArray(result))
        return result.length ? Object.freeze({ IsValid: false, Text: Object.freeze([...result]), IsPending: false }) : valid;
    const state = result;
    return Object.freeze({ IsValid: state.IsValid, IsPending: state.IsPending ?? false, Text: Object.freeze([...state.Text]) });
}
export class PropertyValidationRule {
    PropertyName;
    state = new BehaviorSubject(pending);
    subscription;
    registration;
    disposed = false;
    ValidationStatusChange = this.state.asObservable();
    get State() { return this.state.value; }
    constructor(context, PropertyName, values, predicate, message = 'The value is invalid.') {
        this.PropertyName = PropertyName;
        this.registration = context.Add(this);
        this.subscription = values.pipe(switchMap(value => defer(() => {
            const result = predicate(value);
            const asynchronous = isObservable(result) || (result != null && typeof result.then === 'function');
            const states = (asynchronous ? from(result) : of(result)).pipe(map(result => normalize(result, message)));
            return asynchronous ? states.pipe(startWith(pending)) : states;
        }).pipe(catchError(() => of(normalize(false, message)))))).subscribe(state => this.state.next(state));
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.subscription.unsubscribe();
        this.registration?.Dispose();
        this.registration = undefined;
        this.state.complete();
    }
    unsubscribe() { this.Dispose(); }
}
/** A .NET-style extension-function equivalent. Async rules cancel obsolete subscriptions. */
export function ValidationRule(viewModel, propertyName, predicate, message) {
    return new PropertyValidationRule(viewModel.ValidationContext, propertyName, WhenAnyValue(viewModel, propertyName), predicate, message);
}
export class ReactiveValidationObject extends ReactiveObject {
    ValidationContext = new ValidationContext();
    get HasErrors() { return this.ValidationContext.HasErrors; }
    GetErrors(propertyName) { return this.ValidationContext.GetErrors(propertyName); }
    ValidationRule(propertyName, predicate, message) {
        return ValidationRule(this, propertyName, predicate, message);
    }
    Dispose() { this.ValidationContext.Dispose(); super.Dispose(); }
}
//# sourceMappingURL=validation.js.map