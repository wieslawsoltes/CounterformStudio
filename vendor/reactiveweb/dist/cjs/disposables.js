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
var disposables_exports = {};
__export(disposables_exports, {
  CompositeDisposable: () => CompositeDisposable,
  Disposable: () => Disposable,
  DisposeWith: () => DisposeWith,
  RefCountDisposable: () => RefCountDisposable,
  SerialDisposable: () => SerialDisposable,
  SingleAssignmentDisposable: () => SingleAssignmentDisposable,
  dispose: () => dispose,
  disposeWith: () => disposeWith
});
module.exports = __toCommonJS(disposables_exports);
function dispose(resource) {
  if (!resource) return;
  if (typeof resource === "function") resource();
  else if ("Dispose" in resource) resource.Dispose();
  else resource.unsubscribe();
}
function disposeAll(resources) {
  const errors = [];
  for (const resource of resources) {
    try {
      dispose(resource);
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) throw new AggregateError(errors, "Multiple resources failed to dispose.");
}
class Disposable {
  action;
  disposed = false;
  constructor(action = () => {
  }) {
    this.action = action;
  }
  static Create(action) {
    return new Disposable(action);
  }
  static create(action) {
    return Disposable.Create(action);
  }
  static Empty = Object.freeze({ Dispose() {
  }, unsubscribe() {
  }, IsDisposed: false, closed: false });
  get IsDisposed() {
    return this.disposed;
  }
  get closed() {
    return this.disposed;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const action = this.action;
    this.action = void 0;
    action?.();
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
class CompositeDisposable {
  items = [];
  disposed = false;
  constructor(...resources) {
    for (const item of resources) {
      if (Array.isArray(item)) this.items.push(...item);
      else if (item) this.items.push(item);
    }
  }
  get Count() {
    return this.items.length;
  }
  get IsDisposed() {
    return this.disposed;
  }
  get closed() {
    return this.disposed;
  }
  Add(resource) {
    if (this.disposed) dispose(resource);
    else if (resource) this.items.push(resource);
    return resource;
  }
  add(resource) {
    return this.Add(resource);
  }
  Remove(resource) {
    const index = this.items.indexOf(resource);
    if (index < 0) return false;
    this.items.splice(index, 1);
    dispose(resource);
    return true;
  }
  remove(resource) {
    return this.Remove(resource);
  }
  Contains(resource) {
    return this.items.includes(resource);
  }
  Clear() {
    const previous = this.items;
    this.items = [];
    disposeAll(previous);
  }
  clear() {
    this.Clear();
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.Clear();
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
  [Symbol.iterator]() {
    return this.items.slice()[Symbol.iterator]();
  }
}
class SerialDisposable {
  current;
  disposed = false;
  get Disposable() {
    return this.current;
  }
  set Disposable(value) {
    if (this.disposed) {
      dispose(value);
      return;
    }
    const old = this.current;
    this.current = value;
    dispose(old);
  }
  get disposable() {
    return this.Disposable;
  }
  set disposable(value) {
    this.Disposable = value;
  }
  get IsDisposed() {
    return this.disposed;
  }
  get closed() {
    return this.disposed;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const old = this.current;
    this.current = void 0;
    dispose(old);
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
class SingleAssignmentDisposable {
  current;
  assigned = false;
  disposed = false;
  get Disposable() {
    return this.current;
  }
  set Disposable(value) {
    if (this.assigned) throw new Error("Disposable has already been assigned.");
    this.assigned = true;
    if (this.disposed) dispose(value);
    else this.current = value;
  }
  get disposable() {
    return this.Disposable;
  }
  set disposable(value) {
    this.Disposable = value;
  }
  get IsDisposed() {
    return this.disposed;
  }
  get closed() {
    return this.disposed;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const old = this.current;
    this.current = void 0;
    dispose(old);
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
class RefCountDisposable {
  constructor(resource) {
    this.resource = resource;
  }
  resource;
  ownerDisposed = false;
  disposed = false;
  count = 0;
  get IsDisposed() {
    return this.disposed;
  }
  get closed() {
    return this.disposed;
  }
  GetDisposable() {
    if (this.disposed) return Disposable.Empty;
    this.count++;
    return Disposable.Create(() => {
      this.count--;
      this.tryDispose();
    });
  }
  getDisposable() {
    return this.GetDisposable();
  }
  tryDispose() {
    if (!this.disposed && this.ownerDisposed && this.count === 0) {
      this.disposed = true;
      const resource = this.resource;
      this.resource = void 0;
      dispose(resource);
    }
  }
  Dispose() {
    this.ownerDisposed = true;
    this.tryDispose();
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
function DisposeWith(resource, target) {
  if ("Add" in target) target.Add(resource);
  else target.add(resource);
  return resource;
}
const disposeWith = DisposeWith;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CompositeDisposable,
  Disposable,
  DisposeWith,
  RefCountDisposable,
  SerialDisposable,
  SingleAssignmentDisposable,
  dispose,
  disposeWith
});
//# sourceMappingURL=disposables.js.map
