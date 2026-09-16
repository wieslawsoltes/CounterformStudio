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
var kernel_exports = {};
__export(kernel_exports, {
  Error: () => ErrorInfo,
  ErrorInfo: () => ErrorInfo,
  ItemWithIndex: () => ItemWithIndex,
  ItemWithValue: () => ItemWithValue,
  OptionElse: () => OptionElse,
  SortExpression: () => SortExpression,
  asArray: () => asArray,
  asList: () => asList,
  convertOptional: () => convertOptional,
  convertOr: () => convertOr,
  createOptional: () => createOptional,
  duplicates: () => duplicates,
  firstOrOptional: () => firstOrOptional,
  fromOptional: () => fromOptional,
  getValueOrDefault: () => getValueOrDefault,
  ifHasValue: () => ifHasValue,
  indexOfMany: () => indexOfMany,
  lookup: () => lookup,
  onHasNoValue: () => onHasNoValue,
  onHasValue: () => onHasValue,
  orElse: () => orElse,
  removeIfContained: () => removeIfContained,
  selectValues: () => selectValues,
  toOptional: () => toOptional,
  valueOr: () => valueOr,
  valueOrDefault: () => valueOrDefault,
  valueOrThrow: () => valueOrThrow
});
module.exports = __toCommonJS(kernel_exports);
var import_rxjs = require("rxjs");
var import_core = require("./core.js");
const identity = (value) => value;
const requireFunction = (fn, name) => {
  if (typeof fn !== "function") throw new TypeError(`${name} must be a function`);
  return fn;
};
const isOptional = (value) => value instanceof import_core.Optional;
const requireOptional = (value) => {
  if (!isOptional(value)) throw new TypeError("Expected Optional.some(value) or Optional.none()");
  return value;
};
const optionalMap = (source, project) => (0, import_rxjs.isObservable)(source) ? source.pipe((0, import_rxjs.map)((value) => project(requireOptional(value)))) : project(requireOptional(source));
const fallbackValue = (value) => typeof value === "function" ? value() : value;
const equal = (a, b) => a === b || Number.isNaN(a) && Number.isNaN(b);
function asArray(source) {
  if (source == null || typeof source[Symbol.iterator] !== "function") throw new TypeError("Expected an iterable");
  return Array.isArray(source) ? source : Array.from(source);
}
const asList = asArray;
function duplicates(source, valueSelector = identity) {
  requireFunction(valueSelector, "valueSelector");
  const groups = /* @__PURE__ */ new Map();
  for (const item of asArray(source)) {
    const key = valueSelector(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()].filter((items) => items.length > 1).flat();
}
function indexOfMany(source, itemsToFind, resultSelector = (item, index) => new ItemWithIndex(item, index)) {
  requireFunction(resultSelector, "resultSelector");
  const index = /* @__PURE__ */ new Map();
  asArray(source).forEach((item, i) => {
    if (!index.has(item)) index.set(item, []);
    index.get(item).push([item, i]);
  });
  const results = [];
  for (const item of asArray(itemsToFind)) for (const [found, i] of index.get(item) || []) results.push(resultSelector(found, i));
  return results;
}
function firstOrOptional(source, predicate = () => true) {
  requireFunction(predicate, "predicate");
  if (source == null || typeof source[Symbol.iterator] !== "function") throw new TypeError("Expected an iterable");
  for (const item of source) if (predicate(item)) return import_core.Optional.some(item);
  return import_core.Optional.none();
}
function toOptional(source) {
  if (!arguments.length) return (input) => (0, import_rxjs.isObservable)(input) ? input.pipe((0, import_rxjs.map)((value) => import_core.Optional.of(value))) : import_core.Optional.of(input);
  return (0, import_rxjs.isObservable)(source) ? source.pipe((0, import_rxjs.map)((value) => import_core.Optional.of(value))) : import_core.Optional.of(source);
}
const createOptional = (source) => import_core.Optional.of(source);
function fromOptional(source) {
  if (!arguments.length) return (input) => optionalMap(input, (value) => value.value);
  return optionalMap(source, (value) => value.value);
}
function convertOptional(sourceOrConverter, maybeConverter) {
  const direct = arguments.length > 1, converter = requireFunction(direct ? maybeConverter : sourceOrConverter, "converter");
  const project = (value) => {
    if (!value.hasValue) return import_core.Optional.none();
    const result = converter(value.value);
    return isOptional(result) ? result : import_core.Optional.some(result);
  };
  return direct ? optionalMap(sourceOrConverter, project) : (source) => optionalMap(source, project);
}
function convertOr(sourceOrConverter, converterOrFallback, maybeFallback) {
  const direct = arguments.length >= 3;
  const converter = requireFunction(direct ? converterOrFallback : sourceOrConverter, "converter");
  const fallback = requireFunction(direct ? maybeFallback : converterOrFallback, "fallbackConverter");
  const project = (value) => value.hasValue ? converter(value.value) : fallback();
  return direct ? optionalMap(sourceOrConverter, project) : (source) => optionalMap(source, project);
}
function orElse(sourceOrFallback, maybeFallback) {
  const direct = arguments.length > 1, fallback = requireFunction(direct ? maybeFallback : sourceOrFallback, "fallbackOperation");
  const project = (value) => value.hasValue ? value : requireOptional(fallback());
  return direct ? optionalMap(sourceOrFallback, project) : (source) => optionalMap(source, project);
}
function valueOr(sourceOrFallback, maybeFallback) {
  const direct = arguments.length > 1, fallback = direct ? maybeFallback : sourceOrFallback;
  const project = (value) => value.hasValue ? value.value : fallbackValue(fallback);
  if (direct && !isOptional(sourceOrFallback) && !(0, import_rxjs.isObservable)(sourceOrFallback)) return sourceOrFallback ?? fallbackValue(fallback);
  return direct ? optionalMap(sourceOrFallback, project) : (source) => optionalMap(source, project);
}
function valueOrDefault(source) {
  const project = (value) => value.hasValue ? value.value : void 0;
  return arguments.length ? optionalMap(source, project) : (input) => optionalMap(input, project);
}
function valueOrThrow(sourceOrException, maybeException) {
  const direct = isOptional(sourceOrException) || (0, import_rxjs.isObservable)(sourceOrException);
  const exception = requireFunction((direct ? maybeException : sourceOrException) ?? (() => new globalThis.Error("Optional has no value")), "exceptionGenerator");
  const project = (value) => {
    if (value.hasValue) return value.value;
    throw exception();
  };
  return direct ? optionalMap(sourceOrException, project) : (source) => optionalMap(source, project);
}
function optionalEffect(onPresent, sourceOrAction, actionOrElse, maybeElse) {
  const direct = isOptional(sourceOrAction) || (0, import_rxjs.isObservable)(sourceOrAction);
  const action = requireFunction(direct ? actionOrElse : sourceOrAction, "action"), otherwise = direct ? maybeElse : actionOrElse;
  if (otherwise != null) requireFunction(otherwise, "elseAction");
  const effect = (value) => {
    requireOptional(value);
    if (onPresent) {
      if (value.hasValue) action(value.value);
      else otherwise?.();
    } else {
      if (!value.hasValue) action();
      else otherwise?.(value.value);
    }
  };
  const run = (source) => {
    if ((0, import_rxjs.isObservable)(source)) return source.pipe((0, import_rxjs.tap)(effect));
    effect(source);
    return source;
  };
  return direct ? run(sourceOrAction) : run;
}
function onHasValue(sourceOrAction, actionOrElse, maybeElse) {
  return optionalEffect(true, sourceOrAction, actionOrElse, maybeElse);
}
function onHasNoValue(sourceOrAction, actionOrElse, maybeElse) {
  return optionalEffect(false, sourceOrAction, actionOrElse, maybeElse);
}
function selectValues(source) {
  const run = (input) => {
    if ((0, import_rxjs.isObservable)(input)) return input.pipe((0, import_rxjs.filter)((value) => requireOptional(value).hasValue), (0, import_rxjs.map)((value) => value.value));
    const values = [];
    for (const optional of asArray(input)) if (requireOptional(optional).hasValue) values.push(optional.value);
    return values;
  };
  return arguments.length ? run(source) : run;
}
function lookup(source, key) {
  if (source instanceof Map) return source.has(key) ? import_core.Optional.some(source.get(key)) : import_core.Optional.none();
  if (typeof source?.lookup === "function") return source.lookup(key);
  if (source && typeof source === "object") return Object.hasOwn(source, key) ? import_core.Optional.some(source[key]) : import_core.Optional.none();
  throw new TypeError("lookup requires a Map, cache or object");
}
function removeIfContained(source, key) {
  if (source instanceof Map) return source.delete(key);
  if (source && typeof source === "object") {
    if (!Object.hasOwn(source, key)) return false;
    return Reflect.deleteProperty(source, key);
  }
  throw new TypeError("removeIfContained requires a Map or object");
}
function getValueOrDefault(source, key, fallback) {
  if (isOptional(source)) return source.hasValue ? source.value : key;
  const value = lookup(source, key);
  return value.hasValue ? value.value : fallback;
}
class OptionElse {
  constructor(shouldRunAction = true) {
    this.shouldRunAction = shouldRunAction;
    Object.freeze(this);
  }
  else(action) {
    requireFunction(action, "action");
    if (this.shouldRunAction) action();
  }
  Else(action) {
    return this.else(action);
  }
}
function ifHasValue(source, action) {
  requireFunction(action, "action");
  if (source == null) return new OptionElse();
  requireOptional(source);
  if (!source.hasValue) return new OptionElse();
  action(source.value);
  return new OptionElse(false);
}
class ItemWithIndex {
  constructor(item, index) {
    if (!Number.isInteger(index)) throw new TypeError("index must be an integer");
    this.item = item;
    this.index = index;
    Object.freeze(this);
  }
  get Item() {
    return this.item;
  }
  get Index() {
    return this.index;
  }
  // Upstream equality deliberately compares the item, not its index.
  equals(other) {
    return other instanceof ItemWithIndex && equal(this.item, other.item);
  }
  Equals(other) {
    return this.equals(other);
  }
  toString() {
    return `${String(this.item)} (${this.index})`;
  }
  ToString() {
    return this.toString();
  }
}
class ItemWithValue {
  constructor(item, value) {
    this.item = item;
    this.value = value;
    Object.freeze(this);
  }
  get Item() {
    return this.item;
  }
  get Value() {
    return this.value;
  }
  equals(other) {
    return other instanceof ItemWithValue && equal(this.item, other.item) && equal(this.value, other.value);
  }
  Equals(other) {
    return this.equals(other);
  }
  toString() {
    return `${String(this.item)} (${String(this.value)})`;
  }
  ToString() {
    return this.toString();
  }
}
class ErrorInfo {
  constructor(exception, value, key) {
    this.exception = exception;
    this.value = value;
    this.key = key;
    Object.freeze(this);
  }
  get Exception() {
    return this.exception;
  }
  get Value() {
    return this.value;
  }
  get Key() {
    return this.key;
  }
  equals(other) {
    return other instanceof ErrorInfo && equal(this.exception, other.exception) && equal(this.value, other.value) && equal(this.key, other.key);
  }
  Equals(other) {
    return this.equals(other);
  }
  toString() {
    return `Key: ${String(this.key)}, Value: ${String(this.value)}, Exception: ${String(this.exception)}`;
  }
  ToString() {
    return this.toString();
  }
}
class SortExpression {
  constructor(expression, direction = "ascending") {
    this.expression = requireFunction(expression, "expression");
    this.selector = expression;
    if (direction === 0) direction = "ascending";
    else if (direction === 1) direction = "descending";
    direction = String(direction).toLowerCase();
    if (direction !== "ascending" && direction !== "descending") throw new TypeError("direction must be ascending or descending");
    this.direction = direction;
    Object.freeze(this);
  }
  get Expression() {
    return this.expression;
  }
  get Direction() {
    return this.direction;
  }
  compare(left, right) {
    const a = this.expression(left), b = this.expression(right), comparison = equal(a, b) ? 0 : a == null ? -1 : b == null ? 1 : Number.isNaN(a) ? -1 : Number.isNaN(b) ? 1 : a < b ? -1 : a > b ? 1 : 0;
    return this.direction === "descending" ? -comparison : comparison;
  }
  Compare(left, right) {
    return this.compare(left, right);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Error,
  ErrorInfo,
  ItemWithIndex,
  ItemWithValue,
  OptionElse,
  SortExpression,
  asArray,
  asList,
  convertOptional,
  convertOr,
  createOptional,
  duplicates,
  firstOrOptional,
  fromOptional,
  getValueOrDefault,
  ifHasValue,
  indexOfMany,
  lookup,
  onHasNoValue,
  onHasValue,
  orElse,
  removeIfContained,
  selectValues,
  toOptional,
  valueOr,
  valueOrDefault,
  valueOrThrow
});
//# sourceMappingURL=kernel.js.map
