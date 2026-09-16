import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, NEVER, share, of } from 'rxjs';
import { AutoRefreshOnObservable, Filter, Sort, ChangeSet as DynamicChangeSet, WhenPropertyChanged, applyChanges } from '@wieslawsoltes/dynamicdataweb';
import { ApplyDynamicDataChanges, BindChangeSet, ConnectDynamicData, ToDynamicDataChangeSet } from './dynamic-data.js';
import { Disposable, dispose } from './disposables.js';
/** A list with synchronous mutation, immutable snapshots and atomic change batches. */
export class ObservableCollection {
    values;
    changes = new Subject();
    snapshots;
    counts;
    editDepth = 0;
    publishing = false;
    revision = 0;
    pending = [];
    disposed = false;
    constructor(items = []) {
        this.values = Array.from(items);
        this.snapshots = new BehaviorSubject(Object.freeze([...this.values]));
        this.counts = new BehaviorSubject(this.values.length);
    }
    get Count() { return this.values.length; }
    get length() { return this.Count; }
    get Items() { return this.snapshots.value; }
    get ItemsChanged() { return new Observable(observer => { if (this.disposed) {
        observer.next(this.Items);
        observer.complete();
        return;
    } return this.snapshots.subscribe(observer); }); }
    get CountChanged() { return new Observable(observer => { if (this.disposed) {
        observer.next(this.Count);
        observer.complete();
        return;
    } return this.counts.subscribe(observer); }); }
    get CollectionChanged() { return this.changes.asObservable(); }
    get IsDisposed() { return this.disposed; }
    [Symbol.iterator]() { return this.values[Symbol.iterator](); }
    GetAt(index) { this.checkIndex(index); return this.values[index]; }
    IndexOf(item) { return this.values.indexOf(item); }
    Contains(item) { return this.values.includes(item); }
    ToArray() { return [...this.values]; }
    checkIndex(index, allowEnd = false) {
        if (!Number.isInteger(index) || index < 0 || index >= this.values.length + (allowEnd ? 1 : 0))
            throw new RangeError(`Invalid collection index: ${index}`);
    }
    checkAlive() { if (this.disposed)
        throw new Error('Collection is disposed'); }
    record(change) {
        this.pending.push(Object.freeze(change));
        if (this.editDepth === 0 && !this.publishing)
            this.publish();
    }
    publish() {
        if (this.publishing || !this.pending.length)
            return;
        this.publishing = true;
        try {
            // Mutations made by observers queue their publication after the current immutable batch.
            while (this.pending.length) {
                const batch = Object.freeze(this.pending.splice(0));
                this.revision++;
                const snapshot = Object.freeze([...this.values]);
                this.snapshots.next(snapshot);
                if (this.counts.value !== snapshot.length)
                    this.counts.next(snapshot.length);
                this.changes.next(batch);
            }
        }
        finally {
            this.publishing = false;
        }
    }
    Add(item) { this.Insert(this.Count, item); }
    AddRange(items) {
        this.checkAlive();
        const added = Array.from(items);
        if (!added.length)
            return;
        const index = this.Count;
        this.values.push(...added);
        this.record({ Reason: 'add', Index: index, Items: Object.freeze(added) });
    }
    Insert(index, item) {
        this.checkAlive();
        this.checkIndex(index, true);
        this.values.splice(index, 0, item);
        this.record({ Reason: 'add', Index: index, Items: Object.freeze([item]) });
    }
    Remove(item) {
        this.checkAlive();
        const index = this.IndexOf(item);
        if (index < 0)
            return false;
        this.RemoveAt(index);
        return true;
    }
    RemoveAt(index) {
        this.checkAlive();
        this.checkIndex(index);
        const item = this.values.splice(index, 1)[0];
        this.record({ Reason: 'remove', Index: index, Items: Object.freeze([item]) });
        return item;
    }
    RemoveRange(index, count) {
        this.checkAlive();
        this.checkIndex(index, true);
        if (!Number.isInteger(count) || count < 0 || index + count > this.Count)
            throw new RangeError('Invalid collection range');
        if (!count)
            return;
        this.record({ Reason: 'remove', Index: index, Items: Object.freeze(this.values.splice(index, count)) });
    }
    RemoveAll(predicate) {
        let removed = 0;
        this.Edit(list => { for (let i = list.Count - 1; i >= 0; i--)
            if (predicate(list.GetAt(i))) {
                list.RemoveAt(i);
                removed++;
            } });
        return removed;
    }
    SetAt(index, item) {
        this.checkAlive();
        this.checkIndex(index);
        const previous = this.values[index];
        if (Object.is(previous, item))
            return;
        this.values[index] = item;
        this.record({ Reason: 'replace', Index: index, Items: Object.freeze([item]), PreviousItems: Object.freeze([previous]) });
    }
    Move(oldIndex, newIndex) {
        this.checkAlive();
        this.checkIndex(oldIndex);
        this.checkIndex(newIndex);
        if (oldIndex === newIndex)
            return;
        const item = this.values.splice(oldIndex, 1)[0];
        this.values.splice(newIndex, 0, item);
        this.record({ Reason: 'move', Index: newIndex, PreviousIndex: oldIndex, Items: Object.freeze([item]) });
    }
    Clear() { this.Reset([]); }
    Reset(items) {
        this.checkAlive();
        const next = Array.from(items);
        const previous = this.values;
        if (next.length === previous.length && next.every((item, i) => Object.is(item, previous[i])))
            return;
        this.values = next;
        this.record({ Reason: 'reset', Index: 0, Items: Object.freeze([...next]), PreviousItems: Object.freeze([...previous]) });
    }
    Refresh(item) {
        this.checkAlive();
        const index = arguments.length ? this.IndexOf(item) : 0;
        if (index < 0)
            return;
        this.record({ Reason: 'refresh', Index: index, Items: Object.freeze(arguments.length ? [item] : [...this.values]) });
    }
    /** Refresh a particular occurrence, including duplicate references. */
    RefreshAt(index) { this.checkAlive(); this.checkIndex(index); this.record({ Reason: 'refresh', Index: index, Items: Object.freeze([this.values[index]]) }); }
    /** Native DynamicData binding hook; Connect continues to expose the legacy protocol. */
    ApplyChanges(changes) { ApplyDynamicDataChanges(this, changes); }
    /** Nested edits produce one batch. An exception restores that edit's pre-mutation state. */
    Edit(action) {
        this.checkAlive();
        const before = [...this.values], pendingStart = this.pending.length;
        this.editDepth++;
        try {
            action(this);
        }
        catch (error) {
            this.values = before;
            this.pending.splice(pendingStart);
            throw error;
        }
        finally {
            this.editDepth--;
            if (!this.editDepth)
                this.publish();
        }
    }
    Connect() {
        return new Observable(subscriber => {
            const revision = this.revision;
            if (this.disposed) {
                subscriber.next(Object.freeze([{ Reason: 'reset', Index: 0, Items: this.Items }]));
                subscriber.complete();
                return;
            }
            const subscription = this.changes.subscribe({ next: batch => { if (this.revision > revision)
                    subscriber.next(batch); }, error: error => subscriber.error(error), complete: () => subscriber.complete() });
            if (!subscriber.closed)
                subscriber.next(Object.freeze([{ Reason: 'reset', Index: 0, Items: this.Items }]));
            return subscription;
        });
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.changes.complete();
        this.snapshots.complete();
        this.counts.complete();
    }
    unsubscribe() { this.Dispose(); }
    add(item) { this.Add(item); }
    remove(item) { return this.Remove(item); }
    edit(action) { this.Edit(action); }
}
/** Incremental DynamicData projection; unaffected objects keep their existing property subscriptions. */
export class BindableDerivedList {
    Source;
    result = new ObservableCollection();
    filtered = new ObservableCollection();
    subscription = new Subscription();
    errors = new ReplaySubject(1);
    filter;
    comparer;
    refresh = new Subject();
    sorted;
    comparison;
    disposed = false;
    constructor(Source, options = {}) {
        this.Source = Source;
        this.filter = new BehaviorSubject(options.filter ?? (() => true));
        this.comparison = options.comparer;
        this.comparer = new BehaviorSubject(options.comparer ?? (() => 0));
        const streams = new Map();
        const observe = (item) => {
            let stream = streams.get(item);
            if (!stream) {
                const selected = options.observeItem ? options.observeItem(item)
                    : item != null && (typeof item === 'object' || typeof item === 'function') ? WhenPropertyChanged(item, undefined, false) : NEVER;
                stream = (selected ?? NEVER).pipe(share({ resetOnRefCountZero: () => { streams.delete(item); return of(undefined); } }));
                streams.set(item, stream);
            }
            return stream;
        };
        const input = ConnectDynamicData(Source).pipe(AutoRefreshOnObservable(observe), Filter(this.filter, this.refresh));
        const binding = BindChangeSet(input, this.filtered);
        this.subscription.add(() => binding.Dispose());
        this.subscription.add(binding.Errors.subscribe(error => this.errors.next(error)));
        this.bindOrdering();
        if (options.filterObservable)
            this.subscription.add(options.filterObservable.subscribe({ next: value => this.SetFilter(value), error: error => this.errors.next(error) }));
        if (options.comparerObservable)
            this.subscription.add(options.comparerObservable.subscribe({ next: value => this.SetComparer(value), error: error => this.errors.next(error) }));
        this.subscription.add(() => streams.clear());
    }
    get Count() { return this.result.Count; }
    get Items() { return this.result.Items; }
    get ItemsChanged() { return this.result.ItemsChanged; }
    get CountChanged() { return this.result.CountChanged; }
    get CollectionChanged() { return this.result.CollectionChanged; }
    get ThrownExceptions() { return this.errors.asObservable(); }
    get IsDisposed() { return this.disposed; }
    GetAt(index) { return this.result.GetAt(index); }
    ToArray() { return this.result.ToArray(); }
    [Symbol.iterator]() { return this.result[Symbol.iterator](); }
    Connect() { return this.result.Connect(); }
    SetFilter(filter) { if (!this.disposed)
        this.filter.next(filter ?? (() => true)); }
    SetComparer(comparer) {
        if (this.disposed)
            return;
        const toggle = !!comparer !== !!this.comparison;
        this.comparison = comparer;
        if (toggle)
            this.sorted?.unsubscribe();
        this.comparer.next(comparer ?? (() => 0));
        if (toggle)
            this.bindOrdering();
    }
    bindOrdering() {
        this.sorted?.unsubscribe();
        let first = true;
        const source = ToDynamicDataChangeSet(this.filtered);
        const ordered = this.comparison ? source.pipe(Sort(this.comparer, { resetThreshold: Number.POSITIVE_INFINITY })) : source;
        this.sorted = ordered.subscribe({
            next: changes => {
                try {
                    // A change of ordering starts a fresh operator subscription, while the target retains rows.
                    this.result.ApplyChanges(first ? new DynamicChangeSet([], 'list', applyChanges([], changes)) : changes);
                    first = false;
                }
                catch (error) {
                    this.errors.next(error);
                }
            }, error: error => this.errors.next(error),
        });
    }
    Refresh() { if (!this.disposed) {
        this.refresh.next();
        if (this.comparison)
            this.comparer.next(this.comparison);
    } }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.subscription.unsubscribe();
        this.sorted?.unsubscribe();
        this.filter.complete();
        this.comparer.complete();
        this.refresh.complete();
        this.filtered.Dispose();
        this.result.Dispose();
        this.errors.complete();
    }
    unsubscribe() { this.Dispose(); }
}
export function ToObservableCollection(source, target = new ObservableCollection()) {
    const subscription = source.subscribe(items => target.Reset(items));
    return { Collection: target, Subscription: Disposable.Create(() => subscription.unsubscribe()) };
}
/** Own one resource per distinct object; duplicates retain it until their last removal. */
export function ActOnEveryObject(collection, onAdded, onRemoved) {
    const resources = new Map(), errors = new ReplaySubject(1), scope = new Subscription();
    const state = new ObservableCollection();
    let disposed = false, processing = false, terminated = false;
    const pending = [];
    const release = (item, resource, failures) => {
        resources.delete(item);
        try {
            dispose(resource);
        }
        catch (error) {
            failures.push(error);
        }
        try {
            onRemoved?.(item);
        }
        catch (error) {
            failures.push(error);
        }
    };
    const cleanup = () => { const failures = []; for (const [item, resource] of resources)
        release(item, resource, failures); return failures; };
    const report = (failures) => { if (failures.length)
        errors.next(new AggregateError(failures, 'Collection resource disposal failed')); };
    const finish = () => { report(cleanup()); state.Dispose(); errors.complete(); };
    scope.add(ConnectDynamicData(collection).subscribe({
        next(changes) {
            if (disposed || terminated)
                return;
            pending.push(changes);
            if (processing)
                return;
            processing = true;
            try {
                while (pending.length) {
                    state.ApplyChanges(pending.shift());
                    const current = new Set(state.Items), failures = [];
                    for (const [item, resource] of resources)
                        if (!current.has(item))
                            release(item, resource, failures);
                    for (const item of current)
                        if (!resources.has(item)) {
                            try {
                                resources.set(item, onAdded(item) || undefined);
                            }
                            catch (error) {
                                failures.push(error);
                            }
                        }
                    report(failures);
                }
            }
            catch (error) {
                errors.next(error);
                report(cleanup());
            }
            finally {
                processing = false;
                if (terminated)
                    finish();
            }
        },
        error(error) { errors.next(error); terminated = true; if (!processing)
            finish(); },
        complete() { terminated = true; if (!processing)
            finish(); },
    }));
    return { Errors: errors.asObservable(),
        Dispose() { if (disposed)
            return; disposed = true; scope.unsubscribe(); const failures = cleanup(); state.Dispose(); errors.complete(); if (failures.length)
            throw new AggregateError(failures, 'Collection resource disposal failed'); },
        unsubscribe() { this.Dispose(); },
    };
}
export function ObserveCollectionChanges(collection) { return collection.Connect(); }
export function WhenCountChanged(collection) { return collection.CountChanged; }
/** Composable stable-order keys usable with native array sort and derived collections. */
export class OrderedComparer {
    compare;
    constructor(compare) {
        this.compare = compare;
    }
    static OrderBy(selector, comparer) {
        const compare = comparer ?? ((left, right) => left < right ? -1 : left > right ? 1 : 0);
        return new OrderedComparer((left, right) => compare(selector(left), selector(right)));
    }
    static OrderByDescending(selector, comparer) {
        const ascending = OrderedComparer.OrderBy(selector, comparer);
        return new OrderedComparer((left, right) => -ascending.Compare(left, right));
    }
    ThenBy(selector, comparer) {
        const next = OrderedComparer.OrderBy(selector, comparer);
        return new OrderedComparer((left, right) => this.Compare(left, right) || next.Compare(left, right));
    }
    ThenByDescending(selector, comparer) {
        const next = OrderedComparer.OrderByDescending(selector, comparer);
        return new OrderedComparer((left, right) => this.Compare(left, right) || next.Compare(left, right));
    }
    Compare = (left, right) => this.compare(left, right);
}
//# sourceMappingURL=collections.js.map