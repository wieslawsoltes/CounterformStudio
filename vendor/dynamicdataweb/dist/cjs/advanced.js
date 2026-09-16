var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except2, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except2)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var advanced_exports = {};
__export(advanced_exports, {
  AggregateType: () => AggregateType,
  CombineOperator: () => CombineOperator,
  Group: () => Group,
  ImmutableGroup: () => ImmutableGroup,
  and: () => and,
  average: () => average,
  avg: () => avg,
  combine: () => combine,
  count: () => count,
  except: () => except,
  forAggregation: () => forAggregation,
  fullJoin: () => fullJoin,
  fullJoinMany: () => fullJoinMany,
  group: () => group,
  groupOn: () => groupOn,
  groupOnImmutable: () => groupOnImmutable,
  groupOnObservable: () => groupOnObservable,
  groupOnProperty: () => groupOnProperty,
  groupOnPropertyWithImmutableState: () => groupOnPropertyWithImmutableState,
  groupWithImmutableState: () => groupWithImmutableState,
  groupWithSpecifiedGroups: () => groupWithSpecifiedGroups,
  innerJoin: () => innerJoin,
  innerJoinMany: () => innerJoinMany,
  invalidateWhen: () => invalidateWhen,
  leftJoin: () => leftJoin,
  leftJoinMany: () => leftJoinMany,
  max: () => max,
  min: () => min,
  or: () => or,
  rightJoin: () => rightJoin,
  rightJoinMany: () => rightJoinMany,
  standardDeviation: () => standardDeviation,
  stdDev: () => stdDev,
  sum: () => sum,
  sumMany: () => sumMany,
  xor: () => xor
});
module.exports = __toCommonJS(advanced_exports);
var import_rxjs = require("rxjs");
var import_lifecycle = require("./lifecycle.js");
var import_core = require("./core.js");
const identity = (x) => x;
const UNASSIGNED_GROUP = /* @__PURE__ */ Symbol("unassigned group");
const asStream = (x) => typeof x?.connect === "function" ? x.connect() : typeof x?.Connect === "function" ? x.Connect() : x;
const set = (changes = [], kind = "cache") => new import_core.ChangeSet(changes, kind);
const reason = (c) => String(c.reason).toLowerCase();
const same = Object.is;
const optional = (present, value) => present ? import_core.Optional.some(value) : import_core.Optional.none();
const safe = (observer, action) => {
  try {
    return action();
  } catch (e) {
    observer.error(e);
  }
};
class Group {
  constructor(key, kind = "cache") {
    this.key = key;
    this.kind = kind;
    this._data = kind === "cache" ? /* @__PURE__ */ new Map() : [];
    this._subject = new import_rxjs.Subject();
    this.isDisposed = false;
    this.cache = this;
    this.list = this;
  }
  get Key() {
    return this.key;
  }
  get Cache() {
    return this;
  }
  get List() {
    return this;
  }
  get items() {
    return this.kind === "cache" ? [...this._data.values()] : this._data.slice();
  }
  get Items() {
    return this.items;
  }
  get keys() {
    return this.kind === "cache" ? [...this._data.keys()] : this._data.map((_, i) => i);
  }
  get keyValues() {
    return this.kind === "cache" ? [...this._data.entries()] : this._data.map((v, i) => [i, v]);
  }
  get size() {
    return this.kind === "cache" ? this._data.size : this._data.length;
  }
  get count() {
    return this.size;
  }
  get Count() {
    return this.size;
  }
  lookup(key) {
    return optional(this.kind === "cache" ? this._data.has(key) : key >= 0 && key < this.size, this.kind === "cache" ? this._data.get(key) : this._data[key]);
  }
  Lookup(key) {
    return this.lookup(key);
  }
  connect() {
    return new import_rxjs.Observable((observer) => {
      if (this.isDisposed) {
        observer.complete();
        return;
      }
      const initial = this.kind === "cache" ? set([...this._data].map(([key, current]) => ({ reason: "add", key, current }))) : set(this.size ? [{ reason: "addRange", range: { items: this.items, index: 0 } }] : [], "list");
      const sub = this._subject.subscribe(observer);
      observer.next(initial);
      return sub;
    });
  }
  Connect() {
    return this.connect();
  }
  dispose() {
    if (!this.isDisposed) {
      this.isDisposed = true;
      this._subject.complete();
    }
  }
  Dispose() {
    this.dispose();
  }
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}
class ImmutableGroup {
  constructor(key, entries, kind = "cache") {
    this.key = key;
    this.kind = kind;
    this._entries = Object.freeze([...entries].map(([k, v]) => Object.freeze([k, v])));
    this.items = Object.freeze(this._entries.map((x) => x[1]));
    this.cache = this;
    this.list = this;
    Object.freeze(this);
  }
  get Key() {
    return this.key;
  }
  get Items() {
    return this.items;
  }
  get Cache() {
    return this;
  }
  get List() {
    return this;
  }
  get keys() {
    return this._entries.map((x) => x[0]);
  }
  get keyValues() {
    return this._entries.slice();
  }
  get size() {
    return this.items.length;
  }
  get count() {
    return this.size;
  }
  get Count() {
    return this.size;
  }
  lookup(key) {
    const entry = this._entries.find((x) => same(x[0], key) || x[0] === key);
    return optional(!!entry, entry?.[1]);
  }
  Lookup(key) {
    return this.lookup(key);
  }
  connect() {
    return (0, import_rxjs.of)(this.kind === "cache" ? set(this._entries.map(([key, current]) => ({ reason: "add", key, current }))) : set(this.size ? [{ reason: "addRange", range: { items: this.items.slice(), index: 0 } }] : [], "list"));
  }
  Connect() {
    return this.connect();
  }
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}
function grouping(selector, regrouper, immutable = false) {
  if (typeof selector !== "function" && !(0, import_rxjs.isObservable)(selector)) throw new TypeError("A group selector function or observable is required");
  return (source) => new import_rxjs.Observable((observer) => {
    const subscriptions = new import_rxjs.Subscription();
    const groups = /* @__PURE__ */ new Map(), membership = /* @__PURE__ */ new Map(), data = /* @__PURE__ */ new Map(), snapshots = /* @__PURE__ */ new Map();
    let currentSelector = typeof selector === "function" ? selector : null, kind = "cache", listRecords = [];
    const listGroups = /* @__PURE__ */ new Map();
    const publish = (before, touched, pending) => {
      for (const [key, changes] of pending) if (changes.length) groups.get(key)?._subject.next(set(changes, kind));
      const out = [];
      for (const [key, group2] of groups) {
        if (!group2.size) {
          if (before.has(key)) out.push({ reason: "remove", key, current: immutable ? snapshots.get(key) : group2 });
          groups.delete(key);
          snapshots.delete(key);
          group2.dispose();
        } else if (!before.has(key) || immutable && touched.has(key)) {
          const value = immutable ? new ImmutableGroup(key, group2.keyValues, kind) : group2;
          out.push({ reason: before.has(key) ? "update" : "add", key, current: value, ...before.has(key) ? { previous: snapshots.get(key) } : {} });
          snapshots.set(key, value);
        }
      }
      if (out.length) observer.next(set(out));
    };
    const runCache = (changes) => {
      const before = new Set(groups.keys()), touched = /* @__PURE__ */ new Set(), pending = /* @__PURE__ */ new Map();
      const record = (groupKey, change) => {
        let group2 = groups.get(groupKey);
        if (!group2) {
          group2 = new Group(groupKey);
          groups.set(groupKey, group2);
        }
        if (!pending.has(groupKey)) pending.set(groupKey, []);
        pending.get(groupKey).push(change);
        touched.add(groupKey);
        if (change.reason === "remove") group2._data.delete(change.key);
        else group2._data.set(change.key, change.current);
      };
      for (const c of changes) {
        const key = c.key, oldGroupKey = membership.get(key), had = membership.has(key), r = reason(c);
        if (r === "remove") {
          data.delete(key);
          if (had) {
            record(oldGroupKey, { reason: "remove", key, current: groups.get(oldGroupKey)._data.get(key) });
            membership.delete(key);
          }
          continue;
        }
        if (r === "clear") {
          for (const [oldKey, item] of data) if (membership.has(oldKey)) record(membership.get(oldKey), { reason: "remove", key: oldKey, current: item });
          data.clear();
          membership.clear();
          continue;
        }
        data.set(key, c.current);
        if (!currentSelector) continue;
        const groupKey = currentSelector(c.current, key);
        if (groupKey === UNASSIGNED_GROUP) {
          if (had) {
            record(oldGroupKey, { reason: "remove", key, current: groups.get(oldGroupKey)._data.get(key) });
            membership.delete(key);
          }
          continue;
        }
        if (had && !same(groupKey, oldGroupKey)) record(oldGroupKey, { reason: "remove", key, current: groups.get(oldGroupKey)._data.get(key) });
        const unchanged = had && same(groupKey, oldGroupKey);
        const previous = unchanged ? groups.get(groupKey)._data.get(key) : void 0;
        record(groupKey, { reason: unchanged ? r === "refresh" ? "refresh" : "update" : "add", key, current: c.current, ...unchanged && r !== "refresh" ? { previous } : {} });
        membership.set(key, groupKey);
      }
      publish(before, touched, pending);
    };
    const runList = (changes) => {
      const refreshed = /* @__PURE__ */ new Set(), replaced = /* @__PURE__ */ new Set();
      const makeRecord = (item) => ({ token: {}, item });
      const findItem = (item) => listRecords.findIndex((entry) => same(entry.item, item));
      for (const c of changes || []) {
        const r = reason(c), index = c.currentIndex ?? -1;
        if (r === "add") listRecords.splice(index < 0 ? listRecords.length : index, 0, makeRecord(c.current));
        else if (r === "addrange") {
          const values = c.range?.items || c.range || [], position = c.range?.index ?? index;
          let offset = position < 0 ? listRecords.length : position;
          for (const item of values) listRecords.splice(offset++, 0, makeRecord(item));
        } else if (r === "remove") {
          const position = index >= 0 ? index : findItem(c.current);
          if (position >= 0) listRecords.splice(position, 1);
        } else if (r === "removerange") {
          const values = c.range?.items || c.range || [], position = c.range?.index ?? index;
          if (position >= 0) listRecords.splice(position, values.length);
          else for (const item of values) {
            const found = findItem(item);
            if (found >= 0) listRecords.splice(found, 1);
          }
        } else if (r === "clear") listRecords.length = 0;
        else if (r === "replace" || r === "update") {
          const previousIndex = c.previousIndex >= 0 ? c.previousIndex : index >= 0 ? index : findItem(c.previous);
          const previous = previousIndex >= 0 ? listRecords.splice(previousIndex, 1)[0] : void 0;
          const entry = { token: previous?.token || {}, item: c.current };
          replaced.add(entry.token);
          listRecords.splice(index >= 0 ? index : previousIndex >= 0 ? previousIndex : listRecords.length, 0, entry);
        } else if (r === "move" || r === "moved") {
          const previousIndex = c.previousIndex >= 0 ? c.previousIndex : findItem(c.current);
          if (previousIndex >= 0) {
            const entry = listRecords.splice(previousIndex, 1)[0];
            if (entry) listRecords.splice(index, 0, entry);
          }
        } else if (r === "refresh") {
          const position = index >= 0 ? index : findItem(c.current);
          if (listRecords[position]) refreshed.add(listRecords[position].token);
        }
      }
      if (changes?.items && (changes.items.length !== listRecords.length || changes.items.some((item, i) => !same(item, listRecords[i]?.item)))) {
        const occurrences = /* @__PURE__ */ new Map();
        for (const entry of listRecords) {
          if (!occurrences.has(entry.item)) occurrences.set(entry.item, []);
          occurrences.get(entry.item).push(entry);
        }
        const offsets = /* @__PURE__ */ new Map();
        listRecords = changes.items.map((item) => {
          const position = offsets.get(item) || 0;
          offsets.set(item, position + 1);
          return occurrences.get(item)?.[position] || makeRecord(item);
        });
      }
      if (!currentSelector) return;
      const partitions = /* @__PURE__ */ new Map(), before = new Set(groups.keys()), touched = /* @__PURE__ */ new Set(), pending = /* @__PURE__ */ new Map();
      listRecords.forEach((entry, index) => {
        const key = currentSelector(entry.item, index);
        if (!partitions.has(key)) partitions.set(key, []);
        partitions.get(key).push(entry);
      });
      for (const key of /* @__PURE__ */ new Set([...before, ...partitions.keys()])) {
        let group2 = groups.get(key);
        if (!group2) {
          group2 = new Group(key, "list");
          groups.set(key, group2);
        }
        const next = partitions.get(key) || [], work = (listGroups.get(key) || []).slice(), wanted = new Set(next.map((entry) => entry.token)), delta = [];
        for (let index = work.length - 1; index >= 0; index--) if (!wanted.has(work[index].token)) {
          delta.push({ reason: "remove", current: work[index].item, currentIndex: index });
          work.splice(index, 1);
        }
        const presentTokens = new Set(work.map((entry) => entry.token));
        for (let index = 0; index < next.length; index++) {
          const entry = next[index];
          let previousIndex = !presentTokens.has(entry.token) ? -1 : work[index]?.token === entry.token ? index : work.findIndex((previous) => previous.token === entry.token);
          if (previousIndex < 0) {
            delta.push({ reason: "add", current: entry.item, currentIndex: index });
            work.splice(index, 0, entry);
            presentTokens.add(entry.token);
          } else {
            if (previousIndex !== index) {
              const previous = work.splice(previousIndex, 1)[0];
              work.splice(index, 0, previous);
              delta.push({ reason: "move", current: previous.item, previousIndex, currentIndex: index });
            }
            if (replaced.has(entry.token) || !same(work[index].item, entry.item)) {
              delta.push({ reason: "replace", previous: work[index].item, current: entry.item, previousIndex: index, currentIndex: index });
              work[index] = entry;
            } else if (refreshed.has(entry.token)) delta.push({ reason: "refresh", current: entry.item, currentIndex: index });
          }
        }
        group2._data = next.map((entry) => entry.item);
        if (next.length) listGroups.set(key, next.slice());
        else listGroups.delete(key);
        if (delta.length) {
          pending.set(key, delta);
          touched.add(key);
        }
      }
      publish(before, touched, pending);
    };
    const regroup = () => safe(observer, () => kind === "list" ? runList() : runCache([...data].map(([key, current]) => ({ reason: "refresh", key, current }))));
    if ((0, import_rxjs.isObservable)(selector)) subscriptions.add(selector.subscribe({ next: (next) => {
      if (typeof next !== "function") {
        observer.error(new TypeError("Group selector emissions must be functions"));
        return;
      }
      currentSelector = next;
      regroup();
    }, error: (e) => observer.error(e) }));
    if (regrouper) subscriptions.add(asStream(regrouper).subscribe({ next: regroup, error: (e) => observer.error(e) }));
    subscriptions.add(source.subscribe({ next: (changes) => safe(observer, () => {
      kind = changes.kind || kind;
      if (kind === "list") runList(changes);
      else runCache(changes);
    }), error: (e) => observer.error(e), complete: () => observer.complete() }));
    return () => {
      subscriptions.unsubscribe();
      for (const group2 of groups.values()) group2.dispose();
      groups.clear();
      data.clear();
      membership.clear();
      listGroups.clear();
      listRecords.length = 0;
    };
  });
}
const groupOn = (selector, regrouper) => grouping(selector, regrouper);
const group = (selector, regrouperOrOptions) => regrouperOrOptions?.resultGroupSource ? groupWithSpecifiedGroups(selector, regrouperOrOptions.resultGroupSource) : groupOn(selector, regrouperOrOptions);
const groupOnImmutable = (selector, regrouper) => grouping(selector, regrouper, true);
const groupWithImmutableState = groupOnImmutable;
function groupOnObservable(selector) {
  return (source) => new import_rxjs.Observable((observer) => {
    const subs = new import_rxjs.Subscription(), forwarded = new import_rxjs.Subject(), regroup = new import_rxjs.Subject(), streams = /* @__PURE__ */ new Map(), values = /* @__PURE__ */ new Map();
    const active = /* @__PURE__ */ new Set();
    let inBatch = false, sourceDone = false;
    const finish = () => {
      if (sourceDone && !inBatch && !active.size) forwarded.complete();
    };
    subs.add(forwarded.pipe(groupOn((item, key) => values.has(key) ? values.get(key) : UNASSIGNED_GROUP, regroup)).subscribe(observer));
    subs.add(source.subscribe({ next: (changes) => safe(observer, () => {
      if (changes.kind === "list") throw new TypeError("groupOnObservable requires a keyed cache change stream");
      inBatch = true;
      try {
        for (const c of changes) {
          const r = reason(c);
          if (r === "remove" || r === "update" || r === "add") {
            streams.get(c.key)?.unsubscribe();
            streams.delete(c.key);
            active.delete(c.key);
            values.delete(c.key);
          }
          if (r === "clear") {
            for (const sub of streams.values()) sub.unsubscribe();
            streams.clear();
            active.clear();
            values.clear();
          }
          if (r === "add" || r === "update") {
            const stream = selector(c.current, c.key);
            if (!(0, import_rxjs.isObservable)(stream)) throw new TypeError("groupOnObservable selector must return an Observable");
            active.add(c.key);
            const sub = stream.pipe((0, import_rxjs.distinctUntilChanged)()).subscribe({ next: (value) => {
              values.set(c.key, value);
              if (!inBatch) regroup.next();
            }, error: (e) => observer.error(e), complete: () => {
              active.delete(c.key);
              finish();
            } });
            streams.set(c.key, sub);
          }
        }
        forwarded.next(changes);
      } finally {
        inBatch = false;
        finish();
      }
    }), error: (e) => observer.error(e), complete: () => {
      sourceDone = true;
      finish();
    } }));
    return () => {
      subs.unsubscribe();
      for (const sub of streams.values()) sub.unsubscribe();
      forwarded.complete();
      regroup.complete();
    };
  });
}
function join(type, rightSource, foreignKeySelector, resultSelector, many = false) {
  if (typeof foreignKeySelector !== "function" || typeof resultSelector !== "function") throw new TypeError("Join requires foreign-key and result selectors");
  return (leftSource) => new import_rxjs.Observable((observer) => {
    const subs = new import_rxjs.Subscription(), left = /* @__PURE__ */ new Map(), right = /* @__PURE__ */ new Map(), rightForeign = /* @__PURE__ */ new Map(), buckets = /* @__PURE__ */ new Map();
    const result = /* @__PURE__ */ new Map(), outputByForeign = /* @__PURE__ */ new Map(), tupleKeys = /* @__PURE__ */ new Map();
    let leftDone = false, rightDone = false;
    const tuple = (lk, rk) => {
      if (!tupleKeys.has(lk)) tupleKeys.set(lk, /* @__PURE__ */ new Map());
      const m = tupleKeys.get(lk);
      if (!m.has(rk)) {
        const key = [lk, rk];
        Object.defineProperties(key, { leftKey: { value: lk }, rightKey: { value: rk } });
        m.set(rk, Object.freeze(key));
      }
      return m.get(rk);
    };
    const select = (key, l, r) => resultSelector.length >= 3 ? resultSelector(key, l, r) : resultSelector(l, r);
    const update = (side, changes) => {
      if (changes.kind === "list") throw new TypeError("Join requires keyed cache change streams");
      const affected = /* @__PURE__ */ new Set(), onlyRefresh = /* @__PURE__ */ new Map();
      const touch = (key, refresh) => {
        affected.add(key);
        onlyRefresh.set(key, (onlyRefresh.get(key) ?? true) && refresh);
      };
      for (const c of changes) {
        const r = reason(c), key = c.key;
        if (r === "clear") {
          if (side === "left") {
            for (const k of left.keys()) touch(k, false);
            left.clear();
          } else {
            for (const k of buckets.keys()) touch(k, false);
            right.clear();
            rightForeign.clear();
            buckets.clear();
          }
          continue;
        }
        if (side === "left") {
          if (r === "remove") left.delete(key);
          else left.set(key, c.current);
          touch(key, r === "refresh");
        } else {
          const had = rightForeign.has(key), oldFk = rightForeign.get(key), fk = r === "remove" ? oldFk : foreignKeySelector(c.current, key);
          if (had) {
            if (r === "remove" || !same(oldFk, fk)) {
              const bucket = buckets.get(oldFk);
              bucket?.delete(key);
              if (bucket && !bucket.size) buckets.delete(oldFk);
            }
            touch(oldFk, r === "refresh" && same(oldFk, fk));
          }
          if (r === "remove") {
            right.delete(key);
            rightForeign.delete(key);
          } else {
            right.set(key, c.current);
            rightForeign.set(key, fk);
            if (!buckets.has(fk)) buckets.set(fk, /* @__PURE__ */ new Map());
            buckets.get(fk).set(key, c.current);
            touch(fk, r === "refresh" && (!had || same(oldFk, fk)));
          }
        }
      }
      const out = [], plans = /* @__PURE__ */ new Map(), previousKeys = /* @__PURE__ */ new Set(), desiredKeys = /* @__PURE__ */ new Set();
      for (const fk of affected) {
        const hasLeft = left.has(fk), l = left.get(fk), bucket = buckets.get(fk) || /* @__PURE__ */ new Map(), rows = /* @__PURE__ */ new Map(), oldKeys = outputByForeign.get(fk) || /* @__PURE__ */ new Set();
        if (many) {
          const include = type === "inner" ? hasLeft && bucket.size > 0 : type === "left" ? hasLeft : type === "right" ? bucket.size > 0 : hasLeft || bucket.size > 0;
          if (include) rows.set(fk, [type === "inner" || type === "left" ? l : optional(hasLeft, l), new ImmutableGroup(fk, bucket)]);
        } else if (type === "inner" || type === "right") {
          if (hasLeft || type === "right") for (const [rk, r] of bucket) rows.set(type === "inner" ? tuple(fk, rk) : rk, [type === "inner" ? l : optional(hasLeft, l), r]);
        } else if (hasLeft || type === "full" && bucket.size) {
          const r = [...bucket.values()].at(-1);
          rows.set(fk, [type === "left" ? l : optional(hasLeft, l), optional(bucket.size > 0, r)]);
        }
        plans.set(fk, rows);
        for (const key of oldKeys) previousKeys.add(key);
        for (const key of rows.keys()) desiredKeys.add(key);
      }
      for (const key of previousKeys) if (!desiredKeys.has(key)) {
        out.push({ reason: "remove", key, current: result.get(key) });
        result.delete(key);
      }
      for (const [fk, rows] of plans) {
        const bucket = buckets.get(fk) || /* @__PURE__ */ new Map();
        for (const [key, [lv, rv]] of rows) {
          if (onlyRefresh.get(fk) && result.has(key)) out.push({ reason: "refresh", key, current: result.get(key) });
          else {
            const value = select(key, lv, rv), had = result.has(key), previous = result.get(key);
            result.set(key, value);
            out.push({ reason: had ? "update" : "add", key, current: value, ...had ? { previous } : {} });
          }
        }
        if (rows.size) outputByForeign.set(fk, new Set(rows.keys()));
        else {
          outputByForeign.delete(fk);
          tupleKeys.delete(fk);
        }
        if (type === "inner" && tupleKeys.has(fk)) {
          const tuples = tupleKeys.get(fk);
          for (const rk of tuples.keys()) if (!bucket.has(rk)) tuples.delete(rk);
        }
      }
      if (out.length) observer.next(set(out));
    };
    const done = () => {
      if (leftDone && rightDone) observer.complete();
    };
    subs.add(asStream(rightSource).subscribe({ next: (c) => safe(observer, () => update("right", c)), error: (e) => observer.error(e), complete: () => {
      rightDone = true;
      done();
    } }));
    if (!observer.closed) subs.add(leftSource.subscribe({ next: (c) => safe(observer, () => update("left", c)), error: (e) => observer.error(e), complete: () => {
      leftDone = true;
      done();
    } }));
    return subs;
  });
}
const innerJoin = (right, fk, selector) => join("inner", right, fk, selector);
const leftJoin = (right, fk, selector) => join("left", right, fk, selector);
const rightJoin = (right, fk, selector) => join("right", right, fk, selector);
const fullJoin = (right, fk, selector) => join("full", right, fk, selector);
const innerJoinMany = (right, fk, selector) => join("inner", right, fk, selector, true);
const leftJoinMany = (right, fk, selector) => join("left", right, fk, selector, true);
const rightJoinMany = (right, fk, selector) => join("right", right, fk, selector, true);
const fullJoinMany = (right, fk, selector) => join("full", right, fk, selector, true);
const CombineOperator = Object.freeze({ And: "and", Or: "or", Xor: "xor", Except: "except", and: "and", or: "or", xor: "xor", except: "except" });
function combine(sources, operator = "or") {
  const type = String(operator).toLowerCase();
  if (!["and", "or", "xor", "except"].includes(type)) throw new TypeError(`Unknown combine operator: ${operator}`);
  return new import_rxjs.Observable((observer) => {
    const subs = new import_rxjs.Subscription(), entries = [], output = /* @__PURE__ */ new Map(), pendingLatest = /* @__PURE__ */ new Map();
    let kind = "cache", outerDone = false, suspended = false, initialized = false;
    const matches = (key) => {
      const n = entries.reduce((count2, e) => count2 + e.data.has(key), 0);
      return type === "and" ? entries.length > 0 && n === entries.length : type === "or" ? n > 0 : type === "xor" ? n === 1 : !!entries[0]?.data.has(key) && n === 1;
    };
    const recalculate = (keys, latest, refreshKeys = /* @__PURE__ */ new Set()) => {
      if (observer.closed) return;
      if (suspended) {
        for (const key of keys) {
          if (latest?.has(key)) pendingLatest.set(key, latest.get(key));
          else pendingLatest.delete(key);
        }
        return;
      }
      const out = [];
      for (const key of keys) {
        const had = output.has(key), previous = output.get(key);
        if (!matches(key)) {
          if (had) {
            output.delete(key);
            out.push({ reason: "remove", key, current: previous });
          }
          continue;
        }
        const current = latest?.has(key) ? latest.get(key) : entries.find((e) => e.data.has(key))?.data.get(key);
        if (!had || !same(current, previous)) {
          output.set(key, current);
          out.push({ reason: had ? "update" : "add", key, current, ...had ? { previous } : {} });
        } else if (refreshKeys.has(key)) out.push({ reason: "refresh", key, current });
      }
      if (out.length) {
        if (kind === "list") {
          const listChanges = out.flatMap((c) => c.reason === "update" ? [{ reason: "remove", current: c.previous }, { reason: "add", current: c.current }] : [{ reason: c.reason, current: c.current }]);
          observer.next(set(listChanges, "list"));
        } else observer.next(set(out));
      }
    };
    const allKeys = () => /* @__PURE__ */ new Set([...output.keys(), ...entries.flatMap((e) => [...e.data.keys()])]);
    const complete = () => {
      if (initialized && outerDone && entries.every((e) => e.done)) observer.complete();
    };
    const attach = (entry) => {
      const sub = asStream(entry.source).subscribe({ next: (changes) => safe(observer, () => {
        const keys = /* @__PURE__ */ new Set(), latest = /* @__PURE__ */ new Map(), refresh = /* @__PURE__ */ new Set();
        if (changes.kind === "list") {
          kind = "list";
          const before = new Map(entry.data);
          (0, import_core.applyChanges)(entry.list, changes);
          entry.data = new Map(entry.list.map((item) => [item, item]));
          for (const key of before.keys()) keys.add(key);
          for (const key of entry.data.keys()) keys.add(key);
          for (const [key, value] of entry.data) latest.set(key, value);
          for (const c of changes) if (reason(c) === "refresh") refresh.add(c.current);
        } else {
          for (const c of changes) {
            const r = reason(c);
            if (r === "clear") {
              for (const key of entry.data.keys()) keys.add(key);
              entry.data.clear();
              continue;
            }
            keys.add(c.key);
            if (r === "remove") entry.data.delete(c.key);
            else {
              entry.data.set(c.key, c.current);
              if (r === "refresh") refresh.add(c.key);
              else latest.set(c.key, c.current);
            }
          }
        }
        recalculate(keys, latest, refresh);
      }), error: (e) => observer.error(e), complete: () => {
        entry.done = true;
        complete();
      } });
      entry.sub = sub;
      subs.add(sub);
    };
    const replaceSources = (next) => {
      suspended = true;
      const old = entries.slice(), nextEntries = [], unused = old.slice();
      for (const source of next) {
        const index = unused.findIndex((e) => e.source === source);
        nextEntries.push(index < 0 ? { source, data: /* @__PURE__ */ new Map(), list: [], done: false, sub: null } : unused.splice(index, 1)[0]);
      }
      for (const entry of unused) {
        entry.sub?.unsubscribe();
        subs.remove(entry.sub);
      }
      entries.splice(0, entries.length, ...nextEntries);
      for (const entry of entries) if (!entry.sub && !observer.closed) attach(entry);
      suspended = false;
      initialized = true;
      recalculate(allKeys(), pendingLatest);
      pendingLatest.clear();
      complete();
    };
    if (Array.isArray(sources)) {
      outerDone = true;
      replaceSources(sources);
    } else {
      const sourceList = [], sourceCache = /* @__PURE__ */ new Map();
      subs.add(asStream(sources).subscribe({ next: (changes) => safe(observer, () => {
        if (Array.isArray(changes) && !changes.kind && (changes.length === 0 || !changes[0]?.reason)) {
          sourceList.splice(0, sourceList.length, ...changes);
        } else if (changes.kind === "cache") {
          (0, import_core.applyChanges)(sourceCache, changes);
          sourceList.splice(0, sourceList.length, ...sourceCache.values());
        } else (0, import_core.applyChanges)(sourceList, changes);
        replaceSources(sourceList);
      }), error: (e) => observer.error(e), complete: () => {
        outerDone = true;
        initialized = true;
        complete();
      } }));
    }
    return subs;
  });
}
const logical = (type) => (...others) => (source) => {
  if (!others.length) return combine(source, type);
  return combine([source, ...others.flat()], type);
};
const and = logical("and");
const or = logical("or");
const xor = logical("xor");
const except = logical("except");
function aggregate(mode, selector = identity, fallback = 0) {
  if (typeof selector !== "function") throw new TypeError("Aggregate selector must be a function");
  return (source) => new import_rxjs.Observable((observer) => {
    const values = /* @__PURE__ */ new Map(), list = [], aggregateItems = [];
    let aggregateId = 0;
    let total = 0, squares = 0, count2 = 0, last, hasLast = false;
    const remove = (number) => {
      total -= number;
      squares -= number * number;
      count2--;
    };
    const add = (number) => {
      total += number;
      squares += number * number;
      count2++;
    };
    return source.subscribe({ next: (changes) => safe(observer, () => {
      if (changes.kind === "aggregate") {
        for (const c of changes) {
          if (c.type === "remove") {
            const index = aggregateItems.findIndex((x) => same(x.item, c.item));
            if (index >= 0) {
              const entry = aggregateItems.splice(index, 1)[0];
              remove(values.get(entry.key));
              values.delete(entry.key);
            }
          } else {
            const entry = { key: aggregateId++, item: c.item };
            aggregateItems.push(entry);
            const value2 = selector(c.item);
            values.set(entry.key, value2);
            add(value2);
          }
        }
      } else if (changes.kind === "list") {
        (0, import_core.applyChanges)(list, changes);
        values.clear();
        total = squares = count2 = 0;
        list.forEach((item, index) => {
          const v = selector(item, index);
          values.set(index, v);
          add(v);
        });
      } else {
        for (const c of changes) {
          if (reason(c) === "clear") {
            values.clear();
            total = squares = count2 = 0;
            continue;
          }
          if (values.has(c.key)) {
            remove(values.get(c.key));
            values.delete(c.key);
          }
          if (reason(c) !== "remove") {
            const v = selector(c.current, c.key);
            values.set(c.key, v);
            add(v);
          }
        }
      }
      if (!count2) total = squares = 0;
      else if (!Number.isFinite(total) || !Number.isFinite(squares)) {
        total = squares = 0;
        for (const value2 of values.values()) {
          total += value2;
          squares += value2 * value2;
        }
      }
      let value;
      if (mode === "sum" || mode === "count") value = total;
      else if (mode === "avg") value = count2 ? total / count2 : fallback;
      else if (mode === "stdDev") value = count2 < 2 ? fallback : Math.sqrt(Math.max(0, squares - total * total / count2)) / (count2 - 1);
      else if (mode === "standardDeviation") value = count2 < 2 ? fallback : Math.sqrt(Math.max(0, squares - total * total / count2) / (count2 - 1));
      else {
        value = fallback;
        let seen = false;
        for (const v of values.values()) if (!seen || (mode === "min" ? v < value : v > value)) {
          value = v;
          seen = true;
        }
      }
      if (!hasLast || !same(last, value)) {
        hasLast = true;
        last = value;
        observer.next(value);
      }
    }), error: (e) => observer.error(e), complete: () => observer.complete() });
  });
}
const count = (predicate = null) => aggregate("count", predicate ? (item, key) => predicate(item, key) ? 1 : 0 : () => 1);
const sum = (selector = identity) => aggregate("sum", selector);
const avg = (selector = identity, fallback = 0) => aggregate("avg", selector, fallback);
const average = avg;
const min = (selector = identity, fallback = 0) => aggregate("min", selector, fallback);
const max = (selector = identity, fallback = 0) => aggregate("max", selector, fallback);
const stdDev = (selector = identity, fallback = 0) => aggregate("stdDev", selector, fallback);
const standardDeviation = (selector = identity, fallback = 0) => aggregate("standardDeviation", selector, fallback);
const sumMany = (childrenSelector = identity, valueSelector = identity) => sum((item, key) => [...childrenSelector(item, key)].reduce((total, child) => total + valueSelector(child), 0));
function groupOnProperty(property, throttleOrOptions = {}, scheduler) {
  const options = typeof throttleOrOptions === "number" ? { throttle: throttleOrOptions, scheduler } : throttleOrOptions || {};
  const selector = typeof property === "function" ? property : (item) => String(property).split(".").reduce((value, key) => value?.[key], item);
  return (source) => source.pipe((0, import_lifecycle.autoRefresh)(property, options), groupOn(selector));
}
function groupOnPropertyWithImmutableState(property, throttleOrOptions = {}, scheduler) {
  const options = typeof throttleOrOptions === "number" ? { throttle: throttleOrOptions, scheduler } : throttleOrOptions || {};
  const selector = typeof property === "function" ? property : (item) => String(property).split(".").reduce((value, key) => value?.[key], item);
  return (source) => source.pipe((0, import_lifecycle.autoRefresh)(property, options), groupOnImmutable(selector));
}
const AggregateType = Object.freeze({ Add: "add", Remove: "remove", add: "add", remove: "remove" });
function forAggregation() {
  return (source) => new import_rxjs.Observable((observer) => {
    let kind = "cache", state = /* @__PURE__ */ new Map();
    return source.subscribe({ next: (changes) => safe(observer, () => {
      if (changes.kind === "aggregate") {
        observer.next(changes);
        return;
      }
      if (changes.kind !== kind) {
        kind = changes.kind;
        state = kind === "list" ? [] : /* @__PURE__ */ new Map();
      }
      const out = [];
      const record = (type, item) => out.push({ type, item, Type: type, Item: item });
      for (const c of changes) {
        const r = reason(c);
        if (r === "add") record("add", c.current);
        else if (r === "remove") record("remove", c.current === void 0 && kind === "cache" ? state.get(c.key) : c.current);
        else if (r === "update" || r === "replace") {
          record("remove", c.previous === void 0 && kind === "cache" ? state.get(c.key) : c.previous);
          record("add", c.current);
        } else if (r === "addrange" || r === "removerange") for (const item of c.range?.items || c.range || []) record(r === "addrange" ? "add" : "remove", item);
        else if (r === "clear") for (const item of kind === "list" ? state : state.values()) record("remove", item);
        (0, import_core.applyChanges)(state, set([c], kind));
      }
      const result = set(out);
      result.kind = "aggregate";
      observer.next(result);
    }), error: (e) => observer.error(e), complete: () => observer.complete() });
  });
}
const invalidateWhen = (invalidate) => (source) => asStream(invalidate).pipe((0, import_rxjs.startWith)(void 0), (0, import_rxjs.switchMap)(() => source), (0, import_rxjs.distinctUntilChanged)());
function groupWithSpecifiedGroups(selector, resultGroupSource) {
  return (source) => new import_rxjs.Observable((observer) => {
    const subs = new import_rxjs.Subscription(), available = /* @__PURE__ */ new Map(), exposed = /* @__PURE__ */ new Map(), inner = /* @__PURE__ */ new Map();
    let keys = [], sourceDone = false, keysDone = false;
    const complete = () => {
      if (sourceDone && keysDone) observer.complete();
    };
    const refreshKeys = (changes) => {
      if (changes.kind === "cache") {
        const m = new Map(keys.map((key) => [key, key]));
        for (const c of changes) {
          const key = c.current ?? c.key;
          if (reason(c) === "remove") m.delete(key);
          else if (reason(c) === "clear") m.clear();
          else m.set(key, key);
        }
        keys = [...m.keys()];
      } else (0, import_core.applyChanges)(keys, changes);
      const wanted = new Set(keys), out = [];
      for (const [key, group2] of exposed) if (!wanted.has(key)) {
        out.push({ reason: "remove", key, current: group2 });
        exposed.delete(key);
        group2.dispose();
      }
      for (const key of wanted) if (!exposed.has(key)) {
        const original = available.get(key), group2 = new Group(key, original?.kind || "cache");
        if (original) group2._data = original.kind === "cache" ? new Map(original.keyValues) : original.items;
        exposed.set(key, group2);
        out.push({ reason: "add", key, current: group2 });
      }
      if (out.length) observer.next(set(out));
    };
    subs.add(asStream(resultGroupSource).subscribe({ next: (c) => safe(observer, () => refreshKeys(c)), error: (e) => observer.error(e), complete: () => {
      keysDone = true;
      complete();
    } }));
    if (!observer.closed) subs.add(source.pipe(groupOn(selector)).subscribe({ next: (changes) => safe(observer, () => {
      for (const c of changes) {
        if (reason(c) === "remove") {
          available.delete(c.key);
          inner.get(c.key)?.unsubscribe();
          inner.delete(c.key);
        } else {
          const original = c.current;
          available.set(c.key, original);
          inner.get(c.key)?.unsubscribe();
          const sub = original.connect().subscribe({ next: (batch) => {
            const group2 = exposed.get(c.key);
            if (!group2) return;
            if (group2.kind !== batch.kind) {
              group2.kind = batch.kind;
              group2._data = batch.kind === "cache" ? /* @__PURE__ */ new Map() : [];
            }
            (0, import_core.applyChanges)(group2._data, batch);
            if (batch.length) group2._subject.next(batch);
          }, error: (e) => observer.error(e) });
          inner.set(c.key, sub);
          subs.add(sub);
        }
      }
    }), error: (e) => observer.error(e), complete: () => {
      sourceDone = true;
      complete();
    } }));
    return () => {
      subs.unsubscribe();
      for (const group2 of exposed.values()) group2.dispose();
      available.clear();
      exposed.clear();
      inner.clear();
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AggregateType,
  CombineOperator,
  Group,
  ImmutableGroup,
  and,
  average,
  avg,
  combine,
  count,
  except,
  forAggregation,
  fullJoin,
  fullJoinMany,
  group,
  groupOn,
  groupOnImmutable,
  groupOnObservable,
  groupOnProperty,
  groupOnPropertyWithImmutableState,
  groupWithImmutableState,
  groupWithSpecifiedGroups,
  innerJoin,
  innerJoinMany,
  invalidateWhen,
  leftJoin,
  leftJoinMany,
  max,
  min,
  or,
  rightJoin,
  rightJoinMany,
  standardDeviation,
  stdDev,
  sum,
  sumMany,
  xor
});
//# sourceMappingURL=advanced.js.map
