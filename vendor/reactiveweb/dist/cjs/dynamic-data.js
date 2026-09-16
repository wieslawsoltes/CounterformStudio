"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var dynamic_data_exports = {};
__export(dynamic_data_exports, {
  ApplyDynamicDataChanges: () => ApplyDynamicDataChanges,
  BindChangeSet: () => BindChangeSet,
  ConnectDynamicData: () => ConnectDynamicData,
  DynamicData: () => DynamicData,
  ToDynamicDataChangeSet: () => ToDynamicDataChangeSet,
  ToObservableChangeSet: () => ToObservableChangeSet,
  ToReactiveCollection: () => ToReactiveCollection
});
module.exports = __toCommonJS(dynamic_data_exports);
var import_rxjs = require("rxjs");
var import_dynamicdataweb = require("@wieslawsoltes/dynamicdataweb");
var import_collections = require("./collections.js");
__reExport(dynamic_data_exports, require("@wieslawsoltes/dynamicdataweb"), module.exports);
var DynamicData = __toESM(require("@wieslawsoltes/dynamicdataweb"), 1);
function ToDynamicDataChangeSet(source) {
  return new import_rxjs.Observable((observer) => {
    let values = [];
    const input = new import_rxjs.Subscriber({
      next(batch) {
        try {
          const output = [];
          for (const change of batch) {
            const index = change.Index, items = [...change.Items];
            switch (change.Reason) {
              case "reset":
                if (values.length) output.push(new import_dynamicdataweb.ListChange("clear", values, 0));
                if (items.length) output.push(new import_dynamicdataweb.ListChange("addRange", items, 0));
                values = items;
                break;
              case "add":
                output.push(new import_dynamicdataweb.ListChange("addRange", items, index));
                values.splice(index, 0, ...items);
                break;
              case "remove":
                output.push(new import_dynamicdataweb.ListChange("removeRange", items, index));
                values.splice(index, items.length);
                break;
              case "replace":
                for (let offset = 0; offset < items.length; offset++) {
                  output.push(new import_dynamicdataweb.ListChange("replace", items[offset], index + offset, values[index + offset], index + offset));
                  values[index + offset] = items[offset];
                }
                break;
              case "move": {
                const from = change.PreviousIndex;
                const moved = values.splice(from, items.length);
                values.splice(index, 0, ...moved);
                for (let offset = 0; offset < moved.length; offset++) output.push(new import_dynamicdataweb.ListChange("move", moved[offset], index + offset, void 0, from + offset));
                break;
              }
              case "refresh":
                for (let offset = 0; offset < items.length; offset++) output.push(new import_dynamicdataweb.ListChange("refresh", items[offset], index + offset));
                break;
            }
          }
          observer.next(new import_dynamicdataweb.ChangeSet(output, "list"));
        } catch (error) {
          observer.error(error);
        }
      },
      error: (error) => observer.error(error),
      complete: () => observer.complete()
    });
    observer.add(input);
    ((0, import_rxjs.isObservable)(source) ? source : source.Connect()).subscribe(input);
    return input;
  });
}
const ToObservableChangeSet = ToDynamicDataChangeSet;
function ConnectDynamicData(source) {
  if (source instanceof import_collections.ObservableCollection) return ToDynamicDataChangeSet(source);
  return new import_rxjs.Observable((observer) => {
    const scope = new import_rxjs.Subscription();
    let legacy;
    const stream = (0, import_rxjs.isObservable)(source) ? source : source.Connect(void 0, false);
    observer.add(scope);
    const input = new import_rxjs.Subscriber({
      next(batch) {
        if ("kind" in batch) observer.next(batch);
        else {
          if (!legacy) {
            legacy = new import_rxjs.ReplaySubject(0);
            scope.add(ToDynamicDataChangeSet(legacy).subscribe(observer));
          }
          legacy.next(batch);
        }
      },
      error(error) {
        if (legacy) legacy.error(error);
        else observer.error(error);
      },
      complete() {
        if (legacy) legacy.complete();
        else observer.complete();
      }
    });
    scope.add(input);
    stream.subscribe(input);
    return scope;
  });
}
const states = /* @__PURE__ */ new WeakMap();
const sameKey = (left, right) => left === right || left !== left && right !== right;
function ApplyDynamicDataChanges(target, changes) {
  let state = states.get(target);
  if (!state) {
    state = { keys: [] };
    states.set(target, state);
  }
  if (state.kind && state.kind !== changes.kind && target.Count) throw new TypeError("Cannot mix list and cache change sets in one binding");
  const previous = { kind: state.kind, keys: [...state.keys] };
  state.kind = changes.kind;
  try {
    target.Edit((list) => {
      for (const change of changes) {
        const index = change.currentIndex;
        if (changes.kind === "cache") {
          const existing = state.keys.findIndex((key) => sameKey(key, change.key));
          switch (change.reason) {
            case "add":
            case "update":
            case "replace": {
              if (existing >= 0) {
                list.SetAt(existing, change.current);
                if (index >= 0 && index !== existing) {
                  list.Move(existing, index);
                  const [key] = state.keys.splice(existing, 1);
                  state.keys.splice(index, 0, key);
                }
              } else {
                const at = index < 0 ? list.Count : index;
                list.Insert(at, change.current);
                state.keys.splice(at, 0, change.key);
              }
              break;
            }
            case "remove":
              if (existing >= 0) {
                list.RemoveAt(existing);
                state.keys.splice(existing, 1);
              }
              break;
            case "move":
              if (existing >= 0 && index >= 0) {
                list.Move(existing, index);
                const [key] = state.keys.splice(existing, 1);
                state.keys.splice(index, 0, key);
              }
              break;
            case "refresh":
              if (existing >= 0) list.RefreshAt(existing);
              break;
            case "clear":
              list.RemoveRange(0, list.Count);
              state.keys = [];
              break;
          }
        } else {
          const range = Array.isArray(change.range) ? change.range : change.range?.items ?? [];
          const rangeIndex = Array.isArray(change.range) ? index : change.range?.index ?? index;
          switch (change.reason) {
            case "add":
              list.Insert(index < 0 ? list.Count : index, change.current);
              break;
            case "addRange": {
              const at = rangeIndex < 0 ? list.Count : rangeIndex;
              for (let i = 0; i < range.length; i++) list.Insert(at + i, range[i]);
              break;
            }
            case "remove": {
              const at = index < 0 ? list.IndexOf(change.current) : index;
              if (at >= 0) list.RemoveAt(at);
              break;
            }
            case "removeRange":
              if (rangeIndex >= 0) list.RemoveRange(rangeIndex, range.length);
              else for (const item of range) list.Remove(item);
              break;
            case "clear":
              list.RemoveRange(0, list.Count);
              break;
            case "replace":
            case "update": {
              const from = change.previousIndex >= 0 ? change.previousIndex : index >= 0 ? index : list.IndexOf(change.previous);
              if (from >= 0) {
                list.SetAt(from, change.current);
                if (index >= 0 && index !== from) list.Move(from, index);
              } else list.Insert(index < 0 ? list.Count : index, change.current);
              break;
            }
            case "move": {
              const from = change.previousIndex >= 0 ? change.previousIndex : list.IndexOf(change.current);
              if (from >= 0) list.Move(from, index);
              break;
            }
            case "refresh": {
              const at = index >= 0 ? index : list.IndexOf(change.current);
              if (at >= 0) list.RefreshAt(at);
              break;
            }
          }
        }
      }
      if (changes.items) {
        for (let index = 0; index < changes.items.length; index++) {
          const item = changes.items[index];
          if (index < list.Count && (changes.kind === "cache" && changes.keys ? sameKey(state.keys[index], changes.keys[index]) : Object.is(list.GetAt(index), item))) {
            list.SetAt(index, item);
            continue;
          }
          const at = changes.kind === "cache" && changes.keys ? state.keys.findIndex((key) => sameKey(key, changes.keys[index])) : list.ToArray().findIndex((value, offset) => offset >= index && Object.is(value, item));
          if (at < 0) {
            list.Insert(index, item);
            if (changes.kind === "cache") state.keys.splice(index, 0, changes.keys?.[index]);
          } else {
            if (at !== index) {
              list.Move(at, index);
              if (changes.kind === "cache") {
                const [key] = state.keys.splice(at, 1);
                state.keys.splice(index, 0, key);
              }
            }
            list.SetAt(index, item);
          }
        }
        if (list.Count > changes.items.length) {
          list.RemoveRange(changes.items.length, list.Count - changes.items.length);
          state.keys.length = changes.items.length;
        }
      }
    });
  } catch (error) {
    state.kind = previous.kind;
    state.keys = previous.keys;
    throw error;
  }
}
function BindChangeSet(source, target) {
  const collection = target ?? new import_collections.ObservableCollection();
  const errors = new import_rxjs.ReplaySubject(1), scope = new import_rxjs.Subscription();
  let disposed = false, first = true, processing = false, stopRequested = false, completionRequested = false;
  const pending = [];
  let model = new import_collections.ObservableCollection();
  const finish = () => {
    if (disposed) return;
    if (processing) {
      stopRequested = true;
      return;
    }
    disposed = true;
    pending.length = 0;
    scope.unsubscribe();
    model?.Dispose();
    model = void 0;
    if (!target) collection.Dispose();
    errors.complete();
  };
  const stream = new import_rxjs.Observable((observer2) => ConnectDynamicData(source).subscribe(observer2));
  const observer = new import_rxjs.Subscriber({
    next(changes) {
      if (disposed || stopRequested || completionRequested) return;
      pending.push(changes);
      if (processing) return;
      processing = true;
      try {
        while (pending.length && !stopRequested) {
          const changes2 = pending.shift();
          if (first) {
            model.ApplyChanges(changes2);
            states.delete(collection);
            const snapshot = new import_dynamicdataweb.ChangeSet([], changes2.kind, model.Items);
            if (changes2.kind === "cache") snapshot.keys = [...states.get(model)?.keys ?? []];
            collection.ApplyChanges(snapshot);
            model.Dispose();
            model = void 0;
            first = false;
          } else collection.ApplyChanges(changes2);
        }
      } catch (error) {
        errors.next(error);
        stopRequested = true;
      } finally {
        processing = false;
        if (stopRequested || completionRequested) finish();
      }
    },
    error(error) {
      errors.next(error);
      if (processing) completionRequested = true;
      else finish();
    },
    complete() {
      if (processing) completionRequested = true;
      else finish();
    }
  });
  scope.add(observer);
  stream.subscribe(observer);
  return {
    Collection: collection,
    Errors: errors.asObservable(),
    get IsDisposed() {
      return disposed;
    },
    Dispose: finish,
    unsubscribe() {
      this.Dispose();
    }
  };
}
const ToReactiveCollection = BindChangeSet;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApplyDynamicDataChanges,
  BindChangeSet,
  ConnectDynamicData,
  DynamicData,
  ToDynamicDataChangeSet,
  ToObservableChangeSet,
  ToReactiveCollection,
  ...require("@wieslawsoltes/dynamicdataweb")
});
//# sourceMappingURL=dynamic-data.js.map
