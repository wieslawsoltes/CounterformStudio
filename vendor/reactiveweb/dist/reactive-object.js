import { EMPTY, Observable, Subject, Subscription, combineLatest, distinctUntilChanged, isObservable, map, merge, switchMap } from 'rxjs';
import { Disposable } from './disposables.js';
import { RxApp } from './rx-app.js';
import { getPropertyChangeObservable } from './providers.js';
function event(sender, propertyName, value, oldValue) {
    return { Sender: sender, PropertyName: propertyName, Value: value, OldValue: oldValue,
        sender, propertyName, value, oldValue };
}
/** Stores reactive values separately from accessors, so property setters never recurse. */
export class ReactiveObject {
    values = new Map();
    changingSubject = new Subject();
    changedSubject = new Subject();
    exceptionSubject = new Subject();
    suppressCount = 0;
    delayCount = 0;
    pending = new Map();
    disposed = false;
    Changing = this.changingSubject.asObservable();
    Changed = this.changedSubject.asObservable();
    ThrownExceptions = this.exceptionSubject.asObservable();
    PropertyChanging = this.Changing;
    PropertyChanged = this.Changed;
    changing = this.Changing;
    changed = this.Changed;
    thrownExceptions = this.ThrownExceptions;
    constructor(initialValues) {
        if (initialValues)
            defineReactiveProperties(this, initialValues);
    }
    get IsDisposed() { return this.disposed; }
    get AreChangeNotificationsEnabled() { return !this.disposed && this.suppressCount === 0; }
    GetChangedObservable() { return this.Changed; }
    GetChangingObservable() { return this.Changing; }
    GetThrownExceptionsObservable() { return this.ThrownExceptions; }
    GetValue(propertyName, fallback) {
        return (this.values.has(propertyName) ? this.values.get(propertyName) : fallback);
    }
    getValue(propertyName, fallback) { return this.GetValue(propertyName, fallback); }
    SetValue(propertyName, value) { return this.RaiseAndSetIfChanged(propertyName, value); }
    setValue(propertyName, value) { return this.SetValue(propertyName, value); }
    RaiseAndSetIfChanged(propertyName, value) {
        const previous = this.values.get(propertyName);
        if (Object.is(previous, value) && this.values.has(propertyName))
            return value;
        this.RaisePropertyChanging(propertyName, previous, value);
        this.values.set(propertyName, value);
        this.RaisePropertyChanged(propertyName, previous, value);
        return value;
    }
    raiseAndSetIfChanged(propertyName, value) { return this.RaiseAndSetIfChanged(propertyName, value); }
    RaisePropertyChanging(propertyName, oldValue, newValue) {
        if (!this.AreChangeNotificationsEnabled)
            return;
        if (arguments.length < 2)
            oldValue = this.readProperty(propertyName);
        if (arguments.length < 3)
            newValue = oldValue;
        if (this.delayCount > 0) {
            if (!this.pending.has(propertyName))
                this.pending.set(propertyName, { oldValue, value: newValue });
            return;
        }
        this.changingSubject.next(event(this, propertyName, newValue, oldValue));
    }
    RaisePropertyChanged(propertyName, oldValue, newValue) {
        if (!this.AreChangeNotificationsEnabled)
            return;
        if (arguments.length < 3)
            newValue = this.readProperty(propertyName);
        if (this.delayCount > 0) {
            const pending = this.pending.get(propertyName);
            this.pending.delete(propertyName);
            this.pending.set(propertyName, { oldValue: pending ? pending.oldValue : oldValue, value: newValue });
            return;
        }
        this.changedSubject.next(event(this, propertyName, newValue, oldValue));
    }
    readProperty(propertyName) {
        return propertyName in this ? this[propertyName] : this.values.get(propertyName);
    }
    SuppressChangeNotifications() {
        if (this.disposed)
            return Disposable.Empty;
        this.suppressCount++;
        return Disposable.Create(() => { this.suppressCount--; });
    }
    suppressChangeNotifications() { return this.SuppressChangeNotifications(); }
    DelayChangeNotifications() {
        if (this.disposed)
            return Disposable.Empty;
        this.delayCount++;
        return Disposable.Create(() => {
            this.delayCount--;
            if (this.delayCount || !this.pending.size)
                return;
            const pending = this.pending;
            this.pending = new Map();
            if (!this.AreChangeNotificationsEnabled)
                return;
            for (const [propertyName, change] of pending) {
                this.RaisePropertyChanging(propertyName, change.oldValue, change.value);
                this.RaisePropertyChanged(propertyName, change.oldValue, change.value);
            }
        });
    }
    delayChangeNotifications() { return this.DelayChangeNotifications(); }
    ReportException(error) {
        if (this.exceptionSubject.observed)
            this.exceptionSubject.next(error);
        else
            RxApp.HandleException(error);
    }
    ObservableForProperty(path, options) {
        return ObservableForProperty(this, path, options);
    }
    WhenAnyValue(...pathsAndSelector) { return WhenAnyValue(this, ...pathsAndSelector); }
    whenAnyValue(...pathsAndSelector) { return this.WhenAnyValue(...pathsAndSelector); }
    WhenAny(...pathsAndSelector) { return WhenAny(this, ...pathsAndSelector); }
    WhenAnyDynamic(...pathsAndSelector) { return this.WhenAny(...pathsAndSelector); }
    WhenAnyObservable(...pathsAndSelector) { return WhenAnyObservable(this, ...pathsAndSelector); }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.pending.clear();
        this.changingSubject.complete();
        this.changedSubject.complete();
        this.exceptionSubject.complete();
    }
    unsubscribe() { this.Dispose(); }
    dispose() { this.Dispose(); }
}
const definedProperties = new WeakMap();
export function DefineReactiveProperty(target, propertyName, initialValue) {
    const defined = definedProperties.get(target) ?? new Set();
    if (!defined.has(propertyName) && propertyName in target)
        throw new TypeError(`Property '${propertyName}' conflicts with an existing member.`);
    const own = Object.getOwnPropertyDescriptor(target, propertyName);
    if (own && !own.configurable)
        throw new TypeError(`Property '${propertyName}' is not configurable.`);
    Object.defineProperty(target, propertyName, {
        enumerable: true, configurable: true,
        get() { return this.GetValue(propertyName); },
        set(value) { this.RaiseAndSetIfChanged(propertyName, value); }
    });
    defined.add(propertyName);
    definedProperties.set(target, defined);
    const suppressed = target.SuppressChangeNotifications();
    try {
        target.SetValue(propertyName, initialValue);
    }
    finally {
        suppressed.Dispose();
    }
}
export const defineReactiveProperty = DefineReactiveProperty;
export function defineReactiveProperties(target, properties) {
    for (const [key, value] of Object.entries(properties))
        DefineReactiveProperty(target, key, value);
    return target;
}
/** Converts a member-access selector or dotted/bracketed path into a safe property chain. */
export function getPropertyPath(path) {
    if (Array.isArray(path)) {
        if (!path.length)
            throw new TypeError('A property path must contain at least one property.');
        return path.map(String);
    }
    if (typeof path === 'string') {
        const result = [];
        const expression = /(?:^|\.)([^.\[\]]+)|\[(?:(\d+)|"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\]/g;
        let match;
        let end = 0;
        while ((match = expression.exec(path))) {
            if (match.index !== end)
                throw new TypeError(`Invalid property path: ${path}`);
            result.push(match[1] ?? match[2] ?? (match[3] !== undefined ? JSON.parse(`"${match[3]}"`) : match[4].replace(/\\'/g, "'")));
            end = expression.lastIndex;
        }
        if (!result.length || end !== path.length)
            throw new TypeError(`Invalid property path: ${path}`);
        return result;
    }
    if (typeof path !== 'function')
        throw new TypeError('Expected a property path or member-access selector.');
    const chains = new WeakMap();
    const create = (chain) => {
        const proxy = new Proxy({}, {
            get(_target, property) {
                if (typeof property === 'symbol')
                    throw new TypeError('Property selectors must use string keys.');
                return create([...chain, property]);
            }
        });
        chains.set(proxy, chain);
        return proxy;
    };
    const selected = path(create([]));
    const chain = selected && typeof selected === 'object' ? chains.get(selected) : undefined;
    if (!chain?.length)
        throw new TypeError('Selectors must return a single property access, such as x => x.Person.Name.');
    return chain;
}
function readPath(source, parts) {
    let value = source;
    for (const part of parts) {
        if (value == null)
            return undefined;
        value = part in Object(value) ? value[part] : typeof value.GetValue === 'function' ? value.GetValue(part) : undefined;
    }
    return value;
}
/** Observes every reactive object in a chain and detaches old branches on replacement. */
export function ObservableForProperty(source, path, options = {}) {
    const parts = getPropertyPath(path);
    const propertyName = parts.join('.');
    const observable = new Observable(subscriber => {
        let subscriptions = new Subscription();
        let first = true;
        let previous;
        let rebuilding = false;
        let rebuildAgain = false;
        const emit = () => {
            const value = readPath(source, parts);
            const oldValue = previous;
            previous = value;
            if (first) {
                first = false;
                if (options.skipInitial)
                    return;
            }
            subscriber.next(event(source, propertyName, value, oldValue));
        };
        const rebuild = () => {
            if (subscriber.closed)
                return;
            if (rebuilding) {
                rebuildAgain = true;
                return;
            }
            rebuilding = true;
            try {
                do {
                    rebuildAgain = false;
                    subscriptions.unsubscribe();
                    subscriptions = new Subscription();
                    let current = source;
                    for (const part of parts) {
                        if (current == null)
                            break;
                        const candidateChanges = current.Changed ?? current.changed;
                        const changes = isObservable(candidateChanges) ? candidateChanges : getPropertyChangeObservable(current, part, false);
                        if (isObservable(changes)) {
                            subscriptions.add(changes.subscribe({
                                next: (change) => {
                                    if (change?.PropertyName && change.PropertyName !== part || change?.propertyName && change.propertyName !== part)
                                        return;
                                    rebuild();
                                    if (!options.beforeChange)
                                        emit();
                                },
                                error: error => subscriber.error(error)
                            }));
                        }
                        if (options.beforeChange) {
                            const candidateChanging = current.Changing ?? current.changing;
                            const changing = isObservable(candidateChanging) ? candidateChanging : getPropertyChangeObservable(current, part, true);
                            if (isObservable(changing))
                                subscriptions.add(changing.subscribe({
                                    next: (change) => {
                                        if (change?.PropertyName && change.PropertyName !== part || change?.propertyName && change.propertyName !== part)
                                            return;
                                        emit();
                                    },
                                    error: error => subscriber.error(error)
                                }));
                        }
                        current = part in Object(current) ? current[part] : typeof current.GetValue === 'function' ? current.GetValue(part) : undefined;
                    }
                } while (rebuildAgain && !subscriber.closed);
            }
            catch (error) {
                subscriber.error(error);
            }
            finally {
                rebuilding = false;
            }
        };
        rebuild();
        if (!subscriber.closed) {
            try {
                emit();
            }
            catch (error) {
                subscriber.error(error);
            }
        }
        return () => subscriptions.unsubscribe();
    });
    if (options.distinct === false)
        return observable;
    const comparer = options.comparer ?? Object.is;
    return observable.pipe(distinctUntilChanged((previous, current) => comparer(previous.Value, current.Value)));
}
export const observableForProperty = ObservableForProperty;
function splitObservationArguments(args) {
    if (!args.length)
        throw new TypeError('At least one property path is required.');
    const paths = [...args];
    let selector;
    if (paths.length > 1 && typeof paths[paths.length - 1] === 'function') {
        const candidate = paths[paths.length - 1];
        let isPath = false;
        if (candidate.length <= 1 && !paths.slice(0, -1).every(path => typeof path === 'string' || Array.isArray(path))) {
            try {
                getPropertyPath(candidate);
                isPath = true;
            }
            catch { /* A result selector is not a member-access path. */ }
        }
        if (!isPath)
            selector = paths.pop();
    }
    return { paths, selector };
}
export function WhenAnyValue(source, ...pathsAndSelector) {
    const { paths, selector } = splitObservationArguments(pathsAndSelector);
    const observations = paths.map(path => ObservableForProperty(source, path).pipe(map(change => change.Value)));
    if (observations.length === 1 && !selector)
        return observations[0];
    return combineLatest(observations).pipe(map(values => (selector ? selector(...values) : values)));
}
export const whenAnyValue = WhenAnyValue;
export function WhenAny(source, ...pathsAndSelector) {
    const args = [...pathsAndSelector];
    const explicitSelector = args.length > 1 && typeof args[args.length - 1] === 'function' ? args.pop() : undefined;
    const { paths, selector = explicitSelector } = splitObservationArguments(args);
    const observations = paths.map(path => ObservableForProperty(source, path));
    if (observations.length === 1 && !selector)
        return observations[0];
    return combineLatest(observations).pipe(map(values => (selector ? selector(...values) : values)));
}
export const whenAny = WhenAny;
export const WhenAnyDynamic = WhenAny;
export const whenAnyDynamic = WhenAny;
export function WhenAnyObservable(source, ...pathsAndSelector) {
    const { paths, selector } = splitObservationArguments(pathsAndSelector);
    const streams = paths.map(path => WhenAnyValue(source, path).pipe(switchMap(value => value == null ? EMPTY : value)));
    return (selector ? combineLatest(streams).pipe(map(values => selector(...values))) : merge(...streams));
}
export const whenAnyObservable = WhenAnyObservable;
//# sourceMappingURL=reactive-object.js.map