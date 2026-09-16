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
var compatibility_exports = {};
__export(compatibility_exports, {
  BindingOptions: () => BindingOptions,
  DynamicDataOptions: () => DynamicDataOptions,
  ObservableCollectionExtended: () => ObservableCollectionExtended,
  PageRequest: () => PageRequest,
  SortAndBindOptions: () => SortAndBindOptions,
  SortDirection: () => SortDirection,
  SortExpressionComparer: () => SortExpressionComparer,
  SortOptions: () => SortOptions,
  VirtualRequest: () => VirtualRequest,
  addOrUpdate: () => addOrUpdate,
  clear: () => clear,
  editDiff: () => editDiff,
  fluent: () => fluent,
  installFluentOperators: () => installFluentOperators,
  isEmpty: () => isEmpty,
  isNotEmpty: () => isNotEmpty,
  maximum: () => maximum,
  minimum: () => minimum,
  observeOn: () => observeOn,
  observeOnDispatcher: () => observeOnDispatcher,
  refresh: () => refresh,
  remove: () => remove,
  removeKeys: () => removeKeys,
  subscribeOn: () => subscribeOn
});
module.exports = __toCommonJS(compatibility_exports);
var import_rxjs = require("rxjs");
var import_core = require("./core.js");
var import_operators = require("./operators.js");
var import_advanced = require("./advanced.js");
const compare = (a, b) => a == null ? b == null ? 0 : -1 : b == null ? 1 : a < b ? -1 : a > b ? 1 : 0;
const SortDirection = Object.freeze({ Ascending: "ascending", Descending: "descending" });
class SortExpressionComparer {
  constructor(expressions = []) {
    this.expressions = Array.from(expressions);
  }
  compare(a, b) {
    for (const { selector, direction } of this.expressions) {
      const n = compare(selector(a), selector(b));
      if (n) return direction === "descending" ? -n : n;
    }
    return 0;
  }
  Compare(a, b) {
    return this.compare(a, b);
  }
  thenBy(selector, direction = "ascending") {
    return new SortExpressionComparer([...this.expressions, { selector, direction }]);
  }
  thenByAscending(selector) {
    return this.thenBy(selector);
  }
  thenByDescending(selector) {
    return this.thenBy(selector, "descending");
  }
  ThenBy(selector, direction) {
    return this.thenBy(selector, direction);
  }
  ThenByAscending(selector) {
    return this.thenByAscending(selector);
  }
  ThenByDescending(selector) {
    return this.thenByDescending(selector);
  }
  static ascending(selector) {
    return new SortExpressionComparer([{ selector, direction: "ascending" }]);
  }
  static descending(selector) {
    return new SortExpressionComparer([{ selector, direction: "descending" }]);
  }
  static Ascending(selector) {
    return this.ascending(selector);
  }
  static Descending(selector) {
    return this.descending(selector);
  }
}
class PageRequest {
  constructor(page = 1, size = 25) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1) throw new RangeError("Page and size must be positive integers");
    this.page = page;
    this.size = size;
    Object.freeze(this);
  }
  get Page() {
    return this.page;
  }
  get Size() {
    return this.size;
  }
  equals(other) {
    return other?.page === this.page && other?.size === this.size;
  }
  static get Default() {
    return new PageRequest();
  }
}
class VirtualRequest {
  constructor(startIndex = 0, size = 25) {
    if (!Number.isInteger(startIndex) || startIndex < 0 || !Number.isInteger(size) || size < 1) throw new RangeError("Start index must be nonnegative and size positive");
    this.startIndex = startIndex;
    this.size = size;
    Object.freeze(this);
  }
  get StartIndex() {
    return this.startIndex;
  }
  get Size() {
    return this.size;
  }
  equals(other) {
    return other?.startIndex === this.startIndex && other?.size === this.size;
  }
  static get Default() {
    return new VirtualRequest();
  }
}
class BindingOptions {
  constructor(options = {}) {
    this.resetThreshold = 25;
    Object.assign(this, options);
  }
  static neverFireReset(useReplaceForUpdates = true) {
    return new BindingOptions({ resetThreshold: Infinity, useReplaceForUpdates });
  }
  static NeverFireReset(value) {
    return this.neverFireReset(value);
  }
}
class SortAndBindOptions extends BindingOptions {
  constructor(options = {}) {
    super(options);
  }
}
const SortOptions = Object.freeze({ None: 0, UseBinarySearch: 1, ComparesImmutableValuesOnly: 2 });
const DynamicDataOptions = Object.freeze({ binding: new BindingOptions(), scheduler: import_rxjs.asyncScheduler });
class ObservableCollectionExtended extends import_core.SourceList {
  constructor(items = []) {
    super();
    if (items.length) this.addRange(items);
  }
  replaceAll(items) {
    return this.edit((list) => {
      list.clear();
      list.addRange(items);
    });
  }
  ReplaceAll(items) {
    return this.replaceAll(items);
  }
  suspendCountNotifications() {
    return this.suspendCount();
  }
}
const minimum = import_advanced.min;
const maximum = import_advanced.max;
const isEmpty = () => (source) => source.pipe((0, import_advanced.count)(), (0, import_rxjs.map)((n) => n === 0), (0, import_rxjs.distinctUntilChanged)());
const isNotEmpty = () => (source) => source.pipe((0, import_advanced.count)(), (0, import_rxjs.map)((n) => n !== 0), (0, import_rxjs.distinctUntilChanged)());
const addOrUpdate = (source, ...args) => source.addOrUpdate(...args);
const clear = (source) => source.clear();
const refresh = (source, ...args) => source.refresh(...args);
const remove = (source, ...args) => source.remove(...args);
const removeKeys = (source, ...args) => source.removeKeys(...args);
function editDiff(source, items, equality = Object.is) {
  const incoming = Array.from(items);
  if (source instanceof import_core.SourceCache) {
    const byKey = new Map(incoming.map((x) => [source.getKey(x), x]));
    return source.edit((c) => {
      c.removeKeys(c.keys.filter((k) => !byKey.has(k)));
      for (const [key, value] of byKey) {
        const old = c.lookup(key);
        if (!old.hasValue || !equality(old.value, value)) c.addOrUpdate(value);
      }
    });
  }
  return source.edit((list) => {
    for (let i = list.count - 1; i >= incoming.length; i--) list.removeAt(i);
    for (let i = 0; i < incoming.length; i++) {
      if (i >= list.count) list.add(incoming[i]);
      else if (!equality(list.items[i], incoming[i])) list.replaceAt(i, incoming[i]);
    }
  });
}
const observeOn = (scheduler) => (0, import_rxjs.observeOn)(scheduler);
const subscribeOn = (scheduler) => (0, import_rxjs.subscribeOn)(scheduler);
const observeOnDispatcher = () => (0, import_rxjs.observeOn)(typeof requestAnimationFrame === "function" ? import_rxjs.animationFrameScheduler : import_rxjs.asyncScheduler);
const decorated = /* @__PURE__ */ new WeakSet();
let operatorRegistry = {};
function fluent(observable) {
  if (!(observable instanceof import_rxjs.Observable) && !observable?.subscribe) return observable;
  if (decorated.has(observable)) return observable;
  decorated.add(observable);
  const originalPipe = observable.pipe.bind(observable);
  Object.defineProperty(observable, "pipe", { value: (...operators) => fluent(originalPipe(...operators)), configurable: true });
  Object.defineProperty(observable, "Pipe", { value: (...operators) => fluent(originalPipe(...operators)), configurable: true });
  Object.defineProperty(observable, "Subscribe", { value: (...args) => {
    const sub = observable.subscribe(...args);
    if (!sub.Dispose) Object.defineProperty(sub, "Dispose", { value: () => sub.unsubscribe() });
    return sub;
  }, configurable: true });
  for (const [name, operator] of Object.entries(operatorRegistry)) {
    if (typeof operator !== "function" || !/^[A-Z]/.test(name) || name in observable) continue;
    Object.defineProperty(observable, name, { value: (...args) => {
      const result = operator(...args);
      return typeof result === "function" ? fluent(result(observable)) : result;
    }, configurable: true });
  }
  return observable;
}
function installFluentOperators(registry) {
  operatorRegistry = registry;
  (0, import_core.setObservableDecorator)(fluent);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BindingOptions,
  DynamicDataOptions,
  ObservableCollectionExtended,
  PageRequest,
  SortAndBindOptions,
  SortDirection,
  SortExpressionComparer,
  SortOptions,
  VirtualRequest,
  addOrUpdate,
  clear,
  editDiff,
  fluent,
  installFluentOperators,
  isEmpty,
  isNotEmpty,
  maximum,
  minimum,
  observeOn,
  observeOnDispatcher,
  refresh,
  remove,
  removeKeys,
  subscribeOn
});
//# sourceMappingURL=compatibility.js.map
