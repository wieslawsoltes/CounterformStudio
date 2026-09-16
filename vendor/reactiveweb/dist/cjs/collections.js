"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var collections_exports = {};
__export(collections_exports, {
  ActOnEveryObject: () => ActOnEveryObject,
  BindableDerivedList: () => BindableDerivedList,
  ObservableCollection: () => ObservableCollection,
  ObserveCollectionChanges: () => ObserveCollectionChanges,
  OrderedComparer: () => OrderedComparer,
  ToObservableCollection: () => ToObservableCollection,
  WhenCountChanged: () => WhenCountChanged
});
module.exports = __toCommonJS(collections_exports);
var import_rxjs = require("rxjs");
var import_dynamicdataweb = require("@wieslawsoltes/dynamicdataweb");
var import_dynamic_data = require("./dynamic-data.js");
var import_disposables = require("./disposables.js");
class ObservableCollection {
  values;
  changes = new import_rxjs.Subject();
  snapshots;
  counts;
  editDepth = 0;
  publishing = false;
  revision = 0;
  pending = [];
  disposed = false;
  constructor(items = []) {
    this.values = Array.from(items);
    this.snapshots = new import_rxjs.BehaviorSubject(Object.freeze([...this.values]));
    this.counts = new import_rxjs.BehaviorSubject(this.values.length);
  }
  get Count() {
    return this.values.length;
  }
  get length() {
    return this.Count;
  }
  get Items() {
    return this.snapshots.value;
  }
  get ItemsChanged() {
    return new import_rxjs.Observable((observer) => {
      if (this.disposed) {
        observer.next(this.Items);
        observer.complete();
        return;
      }
      return this.snapshots.subscribe(observer);
    });
  }
  get CountChanged() {
    return new import_rxjs.Observable((observer) => {
      if (this.disposed) {
        observer.next(this.Count);
        observer.complete();
        return;
      }
      return this.counts.subscribe(observer);
    });
  }
  get CollectionChanged() {
    return this.changes.asObservable();
  }
  get IsDisposed() {
    return this.disposed;
  }
  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }
  GetAt(index) {
    this.checkIndex(index);
    return this.values[index];
  }
  IndexOf(item) {
    return this.values.indexOf(item);
  }
  Contains(item) {
    return this.values.includes(item);
  }
  ToArray() {
    return [...this.values];
  }
  checkIndex(index, allowEnd = false) {
    if (!Number.isInteger(index) || index < 0 || index >= this.values.length + (allowEnd ? 1 : 0)) throw new RangeError(`Invalid collection index: ${index}`);
  }
  checkAlive() {
    if (this.disposed) throw new Error("Collection is disposed");
  }
  record(change) {
    this.pending.push(Object.freeze(change));
    if (this.editDepth === 0 && !this.publishing) this.publish();
  }
  publish() {
    if (this.publishing || !this.pending.length) return;
    this.publishing = true;
    try {
      while (this.pending.length) {
        const batch = Object.freeze(this.pending.splice(0));
        this.revision++;
        const snapshot = Object.freeze([...this.values]);
        this.snapshots.next(snapshot);
        if (this.counts.value !== snapshot.length) this.counts.next(snapshot.length);
        this.changes.next(batch);
      }
    } finally {
      this.publishing = false;
    }
  }
  Add(item) {
    this.Insert(this.Count, item);
  }
  AddRange(items) {
    this.checkAlive();
    const added = Array.from(items);
    if (!added.length) return;
    const index = this.Count;
    this.values.push(...added);
    this.record({ Reason: "add", Index: index, Items: Object.freeze(added) });
  }
  Insert(index, item) {
    this.checkAlive();
    this.checkIndex(index, true);
    this.values.splice(index, 0, item);
    this.record({ Reason: "add", Index: index, Items: Object.freeze([item]) });
  }
  Remove(item) {
    this.checkAlive();
    const index = this.IndexOf(item);
    if (index < 0) return false;
    this.RemoveAt(index);
    return true;
  }
  RemoveAt(index) {
    this.checkAlive();
    this.checkIndex(index);
    const item = this.values.splice(index, 1)[0];
    this.record({ Reason: "remove", Index: index, Items: Object.freeze([item]) });
    return item;
  }
  RemoveRange(index, count) {
    this.checkAlive();
    this.checkIndex(index, true);
    if (!Number.isInteger(count) || count < 0 || index + count > this.Count) throw new RangeError("Invalid collection range");
    if (!count) return;
    this.record({ Reason: "remove", Index: index, Items: Object.freeze(this.values.splice(index, count)) });
  }
  RemoveAll(predicate) {
    let removed = 0;
    this.Edit((list) => {
      for (let i = list.Count - 1; i >= 0; i--) if (predicate(list.GetAt(i))) {
        list.RemoveAt(i);
        removed++;
      }
    });
    return removed;
  }
  SetAt(index, item) {
    this.checkAlive();
    this.checkIndex(index);
    const previous = this.values[index];
    if (Object.is(previous, item)) return;
    this.values[index] = item;
    this.record({ Reason: "replace", Index: index, Items: Object.freeze([item]), PreviousItems: Object.freeze([previous]) });
  }
  Move(oldIndex, newIndex) {
    this.checkAlive();
    this.checkIndex(oldIndex);
    this.checkIndex(newIndex);
    if (oldIndex === newIndex) return;
    const item = this.values.splice(oldIndex, 1)[0];
    this.values.splice(newIndex, 0, item);
    this.record({ Reason: "move", Index: newIndex, PreviousIndex: oldIndex, Items: Object.freeze([item]) });
  }
  Clear() {
    this.Reset([]);
  }
  Reset(items) {
    this.checkAlive();
    const next = Array.from(items);
    const previous = this.values;
    if (next.length === previous.length && next.every((item, i) => Object.is(item, previous[i]))) return;
    this.values = next;
    this.record({ Reason: "reset", Index: 0, Items: Object.freeze([...next]), PreviousItems: Object.freeze([...previous]) });
  }
  Refresh(item) {
    this.checkAlive();
    const index = arguments.length ? this.IndexOf(item) : 0;
    if (index < 0) return;
    this.record({ Reason: "refresh", Index: index, Items: Object.freeze(arguments.length ? [item] : [...this.values]) });
  }
  /** Refresh a particular occurrence, including duplicate references. */
  RefreshAt(index) {
    this.checkAlive();
    this.checkIndex(index);
    this.record({ Reason: "refresh", Index: index, Items: Object.freeze([this.values[index]]) });
  }
  /** Native DynamicData binding hook; Connect continues to expose the legacy protocol. */
  ApplyChanges(changes) {
    (0, import_dynamic_data.ApplyDynamicDataChanges)(this, changes);
  }
  /** Nested edits produce one batch. An exception restores that edit's pre-mutation state. */
  Edit(action) {
    this.checkAlive();
    const before = [...this.values], pendingStart = this.pending.length;
    this.editDepth++;
    try {
      action(this);
    } catch (error) {
      this.values = before;
      this.pending.splice(pendingStart);
      throw error;
    } finally {
      this.editDepth--;
      if (!this.editDepth) this.publish();
    }
  }
  Connect() {
    return new import_rxjs.Observable((subscriber) => {
      const revision = this.revision;
      if (this.disposed) {
        subscriber.next(Object.freeze([{ Reason: "reset", Index: 0, Items: this.Items }]));
        subscriber.complete();
        return;
      }
      const subscription = this.changes.subscribe({ next: (batch) => {
        if (this.revision > revision) subscriber.next(batch);
      }, error: (error) => subscriber.error(error), complete: () => subscriber.complete() });
      if (!subscriber.closed) subscriber.next(Object.freeze([{ Reason: "reset", Index: 0, Items: this.Items }]));
      return subscription;
    });
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.changes.complete();
    this.snapshots.complete();
    this.counts.complete();
  }
  unsubscribe() {
    this.Dispose();
  }
  add(item) {
    this.Add(item);
  }
  remove(item) {
    return this.Remove(item);
  }
  edit(action) {
    this.Edit(action);
  }
}
class BindableDerivedList {
  constructor(Source, options = {}) {
    this.Source = Source;
    this.filter = new import_rxjs.BehaviorSubject(options.filter ?? (() => true));
    this.comparison = options.comparer;
    this.comparer = new import_rxjs.BehaviorSubject(options.comparer ?? (() => 0));
    const streams = /* @__PURE__ */ new Map();
    const observe = (item) => {
      let stream = streams.get(item);
      if (!stream) {
        const selected = options.observeItem ? options.observeItem(item) : item != null && (typeof item === "object" || typeof item === "function") ? (0, import_dynamicdataweb.WhenPropertyChanged)(item, void 0, false) : import_rxjs.NEVER;
        stream = (selected ?? import_rxjs.NEVER).pipe((0, import_rxjs.share)({ resetOnRefCountZero: () => {
          streams.delete(item);
          return (0, import_rxjs.of)(void 0);
        } }));
        streams.set(item, stream);
      }
      return stream;
    };
    const input = (0, import_dynamic_data.ConnectDynamicData)(Source).pipe((0, import_dynamicdataweb.AutoRefreshOnObservable)(observe), (0, import_dynamicdataweb.Filter)(this.filter, this.refresh));
    const binding = (0, import_dynamic_data.BindChangeSet)(input, this.filtered);
    this.subscription.add(() => binding.Dispose());
    this.subscription.add(binding.Errors.subscribe((error) => this.errors.next(error)));
    this.bindOrdering();
    if (options.filterObservable) this.subscription.add(options.filterObservable.subscribe({ next: (value) => this.SetFilter(value), error: (error) => this.errors.next(error) }));
    if (options.comparerObservable) this.subscription.add(options.comparerObservable.subscribe({ next: (value) => this.SetComparer(value), error: (error) => this.errors.next(error) }));
    this.subscription.add(() => streams.clear());
  }
  Source;
  result = new ObservableCollection();
  filtered = new ObservableCollection();
  subscription = new import_rxjs.Subscription();
  errors = new import_rxjs.ReplaySubject(1);
  filter;
  comparer;
  refresh = new import_rxjs.Subject();
  sorted;
  comparison;
  disposed = false;
  get Count() {
    return this.result.Count;
  }
  get Items() {
    return this.result.Items;
  }
  get ItemsChanged() {
    return this.result.ItemsChanged;
  }
  get CountChanged() {
    return this.result.CountChanged;
  }
  get CollectionChanged() {
    return this.result.CollectionChanged;
  }
  get ThrownExceptions() {
    return this.errors.asObservable();
  }
  get IsDisposed() {
    return this.disposed;
  }
  GetAt(index) {
    return this.result.GetAt(index);
  }
  ToArray() {
    return this.result.ToArray();
  }
  [Symbol.iterator]() {
    return this.result[Symbol.iterator]();
  }
  Connect() {
    return this.result.Connect();
  }
  SetFilter(filter) {
    if (!this.disposed) this.filter.next(filter ?? (() => true));
  }
  SetComparer(comparer) {
    if (this.disposed) return;
    const toggle = !!comparer !== !!this.comparison;
    this.comparison = comparer;
    if (toggle) this.sorted?.unsubscribe();
    this.comparer.next(comparer ?? (() => 0));
    if (toggle) this.bindOrdering();
  }
  bindOrdering() {
    this.sorted?.unsubscribe();
    let first = true;
    const source = (0, import_dynamic_data.ToDynamicDataChangeSet)(this.filtered);
    const ordered = this.comparison ? source.pipe((0, import_dynamicdataweb.Sort)(this.comparer, { resetThreshold: Number.POSITIVE_INFINITY })) : source;
    this.sorted = ordered.subscribe({
      next: (changes) => {
        try {
          this.result.ApplyChanges(first ? new import_dynamicdataweb.ChangeSet([], "list", (0, import_dynamicdataweb.applyChanges)([], changes)) : changes);
          first = false;
        } catch (error) {
          this.errors.next(error);
        }
      },
      error: (error) => this.errors.next(error)
    });
  }
  Refresh() {
    if (!this.disposed) {
      this.refresh.next();
      if (this.comparison) this.comparer.next(this.comparison);
    }
  }
  Dispose() {
    if (this.disposed) return;
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
  unsubscribe() {
    this.Dispose();
  }
}
function ToObservableCollection(source, target = new ObservableCollection()) {
  const subscription = source.subscribe((items) => target.Reset(items));
  return { Collection: target, Subscription: import_disposables.Disposable.Create(() => subscription.unsubscribe()) };
}
function ActOnEveryObject(collection, onAdded, onRemoved) {
  const resources = /* @__PURE__ */ new Map(), errors = new import_rxjs.ReplaySubject(1), scope = new import_rxjs.Subscription();
  const state = new ObservableCollection();
  let disposed = false, processing = false, terminated = false;
  const pending = [];
  const release = (item, resource, failures) => {
    resources.delete(item);
    try {
      (0, import_disposables.dispose)(resource);
    } catch (error) {
      failures.push(error);
    }
    try {
      onRemoved?.(item);
    } catch (error) {
      failures.push(error);
    }
  };
  const cleanup = () => {
    const failures = [];
    for (const [item, resource] of resources) release(item, resource, failures);
    return failures;
  };
  const report = (failures) => {
    if (failures.length) errors.next(new AggregateError(failures, "Collection resource disposal failed"));
  };
  const finish = () => {
    report(cleanup());
    state.Dispose();
    errors.complete();
  };
  scope.add((0, import_dynamic_data.ConnectDynamicData)(collection).subscribe({
    next(changes) {
      if (disposed || terminated) return;
      pending.push(changes);
      if (processing) return;
      processing = true;
      try {
        while (pending.length) {
          state.ApplyChanges(pending.shift());
          const current = new Set(state.Items), failures = [];
          for (const [item, resource] of resources) if (!current.has(item)) release(item, resource, failures);
          for (const item of current) if (!resources.has(item)) {
            try {
              resources.set(item, onAdded(item) || void 0);
            } catch (error) {
              failures.push(error);
            }
          }
          report(failures);
        }
      } catch (error) {
        errors.next(error);
        report(cleanup());
      } finally {
        processing = false;
        if (terminated) finish();
      }
    },
    error(error) {
      errors.next(error);
      terminated = true;
      if (!processing) finish();
    },
    complete() {
      terminated = true;
      if (!processing) finish();
    }
  }));
  return {
    Errors: errors.asObservable(),
    Dispose() {
      if (disposed) return;
      disposed = true;
      scope.unsubscribe();
      const failures = cleanup();
      state.Dispose();
      errors.complete();
      if (failures.length) throw new AggregateError(failures, "Collection resource disposal failed");
    },
    unsubscribe() {
      this.Dispose();
    }
  };
}
function ObserveCollectionChanges(collection) {
  return collection.Connect();
}
function WhenCountChanged(collection) {
  return collection.CountChanged;
}
class OrderedComparer {
  constructor(compare) {
    this.compare = compare;
  }
  compare;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActOnEveryObject,
  BindableDerivedList,
  ObservableCollection,
  ObserveCollectionChanges,
  OrderedComparer,
  ToObservableCollection,
  WhenCountChanged
});
//# sourceMappingURL=collections.js.map
