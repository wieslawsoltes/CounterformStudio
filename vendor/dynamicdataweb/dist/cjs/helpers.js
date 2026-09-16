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
var helpers_exports = {};
__export(helpers_exports, {
  ChangeSetAggregator: () => ChangeSetAggregator,
  ItemWithIndex: () => import_kernel2.ItemWithIndex,
  Watcher: () => Watcher,
  addOrInsertRange: () => addOrInsertRange,
  asAggregator: () => asAggregator,
  asWatcher: () => asWatcher,
  binarySearch: () => binarySearch,
  getChangeType: () => getChangeType,
  indexOfOptional: () => indexOfOptional,
  replaceOrAdd: () => replaceOrAdd,
  retryWithBackOff: () => retryWithBackOff,
  scheduleRecurringAction: () => scheduleRecurringAction,
  yieldWithoutIndex: () => yieldWithoutIndex
});
module.exports = __toCommonJS(helpers_exports);
var import_rxjs = require("rxjs");
var import_core = require("./core.js");
var import_extras = require("./extras.js");
var import_kernel = require("./kernel.js");
var import_kernel2 = require("./kernel.js");
const streamOf = (source) => typeof source?.connect === "function" ? source.connect() : source;
const equality = (comparer) => typeof comparer === "function" ? comparer : comparer?.equals?.bind(comparer) ?? comparer?.Equals?.bind(comparer) ?? Object.is;
const compareDefault = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const validateList = (source) => {
  if (!Array.isArray(source) && typeof source?.insertRange !== "function") throw new TypeError("source must be an Array or SourceList");
};
function addOrInsertRange(source, items, index = -1) {
  validateList(source);
  const values = Array.from(items);
  const count = Array.isArray(source) ? source.length : source.count;
  if (!Number.isInteger(index) || index > count) throw new RangeError("index must be an integer no greater than the list length");
  if (Array.isArray(source)) {
    const at = index < 0 ? source.length : index;
    const tail = source.splice(at);
    for (const item of values) source.push(item);
    for (const item of tail) source.push(item);
  } else if (index < 0) source.addRange(values);
  else source.insertRange(values, index);
  return source;
}
function binarySearch(source, value, comparer = compareDefault) {
  const compare = typeof comparer === "function" ? comparer : comparer?.compare?.bind(comparer) ?? comparer?.Compare?.bind(comparer);
  if (typeof compare !== "function") throw new TypeError("comparer must be a function or comparer object");
  let lower = 0, upper = (source.length ?? source.count) - 1;
  const at = (index) => Array.isArray(source) || ArrayBuffer.isView(source) ? source[index] : source.get(index);
  while (lower <= upper) {
    const middle = lower + Math.floor((upper - lower) / 2), result = compare(value, at(middle));
    if (result < 0) upper = middle - 1;
    else if (result > 0) lower = middle + 1;
    else return middle;
  }
  return -lower - 1;
}
function getChangeType(reason) {
  if (["add", "refresh", "replace", "move", "moved", "remove"].includes(reason)) return import_core.ChangeType.Item;
  if (["addRange", "removeRange", "clear"].includes(reason)) return import_core.ChangeType.Range;
  throw new RangeError(`Unknown list change reason: ${reason}`);
}
function indexOfOptional(source, item, comparer) {
  const equals = equality(comparer);
  let index = 0;
  for (const candidate of source) {
    if (equals(candidate, item)) return import_core.Optional.some(new import_kernel.ItemWithIndex(item, index));
    index++;
  }
  return import_core.Optional.none();
}
function replaceOrAdd(source, original, replaceWith, comparer) {
  validateList(source);
  const found = indexOfOptional(source, original, comparer);
  if (found.hasValue) {
    if (Array.isArray(source)) source[found.value.index] = replaceWith;
    else source.replaceAt(found.value.index, replaceWith);
  } else if (Array.isArray(source)) source.push(replaceWith);
  else source.add(replaceWith);
  return source;
}
function* yieldWithoutIndex(source) {
  for (const change of source) {
    if (change.reason === "move" || change.reason === "moved") continue;
    yield new import_core.ListChange({ ...change, currentIndex: -1, previousIndex: -1, ...change.range ? { range: { items: [...change.range.items], index: -1 } } : {} });
  }
}
class ChangeSetAggregator {
  constructor(source, options = {}) {
    if (typeof options === "string") options = { kind: options };
    this.messages = [];
    this.error = null;
    this.isCompleted = false;
    this.isDisposed = false;
    this.summary = import_extras.ChangeSummary.empty;
    this._kind = options.kind ?? source.kind ?? null;
    this._collection = this._kind === "list" ? new import_core.SourceList() : new import_core.SourceCache(options.keySelector ?? ((item) => item?.id ?? item?.key ?? item));
    this.data = this._kind === "list" ? this._collection.asObservableList() : this._collection.asObservableCache();
    const updates = new import_rxjs.Subject();
    this._subscriptions = new import_rxjs.Subscription();
    this._subscriptions.add(updates.pipe((0, import_extras.collectUpdateStats)()).subscribe((summary) => {
      this.summary = summary;
    }));
    this._subscriptions.add(streamOf(source).subscribe({
      next: (changes) => {
        const kind = changes.kind ?? (changes.some((change) => "key" in change) ? "cache" : "list");
        if (this._kind == null && kind === "list") {
          this.data.dispose();
          this._collection.dispose();
          this._collection = new import_core.SourceList();
          this.data = this._collection.asObservableList();
        }
        this._kind ??= kind;
        if (kind !== this._kind) {
          this.error = new TypeError("An aggregator cannot mix list and cache changesets");
          return;
        }
        this.messages.push(changes);
        this._collection.clone(changes);
        updates.next(changes);
      },
      error: (error) => {
        this.error = error;
        updates.complete();
      },
      complete: () => {
        this.isCompleted = true;
        updates.complete();
      }
    }));
    this._subscriptions.add(() => updates.complete());
  }
  get Data() {
    return this.data;
  }
  get Messages() {
    return this.messages;
  }
  get Error() {
    return this.error;
  }
  get exception() {
    return this.error;
  }
  get Exception() {
    return this.error;
  }
  get IsCompleted() {
    return this.isCompleted;
  }
  get Summary() {
    return this.summary;
  }
  dispose() {
    if (!this.isDisposed) {
      this.isDisposed = true;
      this._subscriptions.unsubscribe();
      this.data.dispose();
      this._collection.dispose();
    }
  }
  unsubscribe() {
    this.dispose();
  }
  Dispose() {
    this.dispose();
  }
}
function asAggregator(source, options) {
  return new ChangeSetAggregator(source, options);
}
class Watcher {
  constructor(source, scheduler) {
    this.scheduler = scheduler;
    this.cache = new import_core.ObservableCache(streamOf(source));
  }
  watch(key) {
    const observable = this.cache.watch(key);
    return this.scheduler ? observable.pipe((0, import_rxjs.observeOn)(this.scheduler)) : observable;
  }
  Watch(key) {
    return this.watch(key);
  }
  dispose() {
    this.cache.dispose();
  }
  unsubscribe() {
    this.dispose();
  }
  Dispose() {
    this.dispose();
  }
}
function asWatcher(source, scheduler) {
  return new Watcher(source, scheduler);
}
function retryWithBackOff(strategyOrOptions = {}) {
  const options = typeof strategyOrOptions === "function" ? { backOffStrategy: strategyOrOptions } : strategyOrOptions;
  const count = options.count ?? options.maxRetries ?? Infinity;
  const scheduler = options.scheduler ?? import_rxjs.asyncScheduler;
  const strategy = options.backOffStrategy ?? (typeof options.delay === "function" ? options.delay : null);
  const initialDelay = options.initialDelay ?? (typeof options.delay === "number" ? options.delay : 100);
  return (0, import_rxjs.retry)({
    count,
    resetOnSuccess: options.resetOnSuccess ?? false,
    delay(error, retryCount) {
      if (options.errorPredicate && !options.errorPredicate(error)) throw error;
      const delay = strategy ? strategy(error, retryCount - 1) : Math.min(options.maxDelay ?? 3e4, initialDelay * (options.factor ?? 2) ** (retryCount - 1));
      if (delay == null) throw error;
      if (typeof delay?.subscribe === "function") return delay;
      if (typeof delay !== "number" || !Number.isFinite(delay) || delay < 0) throw new RangeError("Retry delay must be a finite nonnegative number of milliseconds, an Observable, or null");
      return (0, import_rxjs.timer)(delay, scheduler);
    }
  });
}
function scheduleRecurringAction(scheduler, interval, action) {
  if (typeof scheduler?.schedule !== "function") {
    action = interval;
    interval = scheduler;
    scheduler = import_rxjs.asyncScheduler;
  }
  if (typeof action !== "function") throw new TypeError("action must be a function");
  const delay = () => {
    const value = typeof interval === "function" ? interval() : interval;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new RangeError("interval must be a finite nonnegative number of milliseconds");
    return value;
  };
  const subscription = new import_rxjs.Subscription();
  subscription.dispose = subscription.unsubscribe.bind(subscription);
  subscription.Dispose = subscription.dispose;
  subscription.add(scheduler.schedule(function tick() {
    if (subscription.closed) return;
    try {
      action();
      if (!subscription.closed) this.schedule(void 0, delay());
    } catch (error) {
      subscription.unsubscribe();
      throw error;
    }
  }, delay()));
  return subscription;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChangeSetAggregator,
  ItemWithIndex,
  Watcher,
  addOrInsertRange,
  asAggregator,
  asWatcher,
  binarySearch,
  getChangeType,
  indexOfOptional,
  replaceOrAdd,
  retryWithBackOff,
  scheduleRecurringAction,
  yieldWithoutIndex
});
//# sourceMappingURL=helpers.js.map
