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
var equality_exports = {};
__export(equality_exports, {
  EqualityMap: () => EqualityMap,
  EqualitySet: () => EqualitySet,
  valueEquals: () => valueEquals
});
module.exports = __toCommonJS(equality_exports);
function valueEquals(a, b) {
  return a === b || a !== a && b !== b || a != null && typeof a.Equals === "function" && !!a.Equals(b);
}
const NativeMap = globalThis.Map;
const NativeSet = globalThis.Set;
const hasEquality = (value) => value !== null && (typeof value === "object" || typeof value === "function") && typeof value.Equals === "function";
const hashKey = (value) => typeof value.GetHashCode === "function" ? value.GetHashCode() : void 0;
function equalitySetArgument(other) {
  if (other == null || typeof other !== "object" && typeof other !== "function") throw new TypeError("Expected a set-like object.");
  const size = Number(other.size);
  if (Number.isNaN(size)) throw new TypeError("Set-like size must be numeric.");
  if (Math.trunc(size) < 0) throw new RangeError("Set-like size must be nonnegative.");
  if (typeof other.has !== "function" || typeof other.keys !== "function") throw new TypeError("Set-like object must provide has() and keys().");
  return other instanceof EqualitySet ? other : new EqualitySet({ [Symbol.iterator]: () => other.keys() });
}
class EqualityMap extends NativeMap {
  constructor(entries) {
    super();
    this._buckets = null;
    if (entries != null) for (const [key, value] of entries) this.set(key, value);
  }
  _canonicalKey(key) {
    if (NativeMap.prototype.has.call(this, key) || !hasEquality(key)) return key;
    const bucket = this._buckets?.get(hashKey(key));
    if (bucket) {
      for (const candidate of bucket) if (valueEquals(candidate, key)) return candidate;
    }
    return key;
  }
  has(key) {
    if (NativeMap.prototype.has.call(this, key)) return true;
    if (!hasEquality(key)) return false;
    return NativeMap.prototype.has.call(this, this._canonicalKey(key));
  }
  get(key) {
    if (NativeMap.prototype.has.call(this, key) || !hasEquality(key)) return NativeMap.prototype.get.call(this, key);
    return NativeMap.prototype.get.call(this, this._canonicalKey(key));
  }
  set(key, value) {
    if (NativeMap.prototype.has.call(this, key) || !hasEquality(key)) {
      NativeMap.prototype.set.call(this, key, value);
      return this;
    }
    const hash = hashKey(key);
    this._buckets ??= new NativeMap();
    let bucket = this._buckets.get(hash);
    if (bucket) {
      for (const candidate of bucket) if (valueEquals(candidate, key)) {
        NativeMap.prototype.set.call(this, candidate, value);
        return this;
      }
    }
    if (!bucket) {
      bucket = [];
      this._buckets.set(hash, bucket);
    }
    bucket.push(key);
    NativeMap.prototype.set.call(this, key, value);
    return this;
  }
  delete(key) {
    const canonical = this._canonicalKey(key);
    if (!NativeMap.prototype.delete.call(this, canonical)) return false;
    if (hasEquality(canonical)) {
      const hash = hashKey(canonical), bucket = this._buckets.get(hash);
      if (bucket) {
        const index = bucket.indexOf(canonical);
        if (index >= 0) bucket.splice(index, 1);
        if (!bucket.length) this._buckets.delete(hash);
      }
    }
    return true;
  }
  clear() {
    NativeMap.prototype.clear.call(this);
    this._buckets?.clear();
  }
}
class EqualitySet extends NativeSet {
  constructor(values) {
    super();
    this._index = null;
    if (values != null) for (const value of values) this.add(value);
  }
  add(value) {
    if (!hasEquality(value)) {
      NativeSet.prototype.add.call(this, value);
      return this;
    }
    this._index ??= new EqualityMap();
    if (!this._index.has(value)) {
      this._index.set(value, value);
      NativeSet.prototype.add.call(this, value);
    }
    return this;
  }
  has(value) {
    if (NativeSet.prototype.has.call(this, value)) return true;
    return hasEquality(value) && (this._index?.has(value) ?? false);
  }
  delete(value) {
    if (!hasEquality(value)) return NativeSet.prototype.delete.call(this, value);
    if (!this._index?.has(value)) return false;
    const canonical = this._index.get(value);
    this._index.delete(value);
    return NativeSet.prototype.delete.call(this, canonical);
  }
  clear() {
    NativeSet.prototype.clear.call(this);
    this._index?.clear();
  }
  union(other) {
    const right = equalitySetArgument(other), result = new EqualitySet(this);
    for (const value of right) result.add(value);
    return result;
  }
  intersection(other) {
    const right = equalitySetArgument(other), result = new EqualitySet(), smaller = this.size <= right.size ? this : right, larger = smaller === this ? right : this;
    for (const value of smaller) if (larger.has(value)) result.add(value);
    return result;
  }
  difference(other) {
    const right = equalitySetArgument(other), result = new EqualitySet();
    for (const value of this) if (!right.has(value)) result.add(value);
    return result;
  }
  symmetricDifference(other) {
    const right = equalitySetArgument(other), result = this.difference(right);
    for (const value of right) if (!this.has(value)) result.add(value);
    return result;
  }
  isSubsetOf(other) {
    const right = equalitySetArgument(other);
    if (this.size > right.size) return false;
    for (const value of this) if (!right.has(value)) return false;
    return true;
  }
  isSupersetOf(other) {
    const right = equalitySetArgument(other);
    return right.isSubsetOf(this);
  }
  isDisjointFrom(other) {
    const right = equalitySetArgument(other), smaller = this.size <= right.size ? this : right, larger = smaller === this ? right : this;
    for (const value of smaller) if (larger.has(value)) return false;
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EqualityMap,
  EqualitySet,
  valueEquals
});
//# sourceMappingURL=equality.js.map
