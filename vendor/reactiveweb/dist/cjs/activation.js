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
var activation_exports = {};
__export(activation_exports, {
  ViewModelActivator: () => ViewModelActivator,
  WhenActivated: () => WhenActivated
});
module.exports = __toCommonJS(activation_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
class ViewModelActivator {
  blocks = /* @__PURE__ */ new Map();
  activated = new import_rxjs.Subject();
  deactivated = new import_rxjs.Subject();
  active = new import_rxjs.BehaviorSubject(false);
  references = 0;
  generation = 0;
  scope;
  disposed = false;
  get Activated() {
    return this.activated.asObservable();
  }
  get Deactivated() {
    return this.deactivated.asObservable();
  }
  get IsActive() {
    return this.active.asObservable();
  }
  get IsActiveValue() {
    return this.active.value;
  }
  get ReferenceCount() {
    return this.references;
  }
  run(block, scope) {
    const childScope = new import_disposables.CompositeDisposable();
    scope.Add(childScope);
    try {
      const result = block(childScope);
      if (result) childScope.Add(result);
    } catch (error) {
      scope.Remove(childScope);
      throw error;
    }
  }
  AddActivationBlock(block) {
    if (this.disposed) throw new Error("Activator is disposed");
    const key = /* @__PURE__ */ Symbol();
    this.blocks.set(key, block);
    if (this.scope) {
      try {
        this.run(block, this.scope);
      } catch (error) {
        this.blocks.delete(key);
        throw error;
      }
    }
    return import_disposables.Disposable.Create(() => this.blocks.delete(key));
  }
  Activate() {
    if (this.disposed) throw new Error("Activator is disposed");
    if (this.references === 0) {
      const scope = new import_disposables.CompositeDisposable();
      this.scope = scope;
      this.references = 1;
      this.generation++;
      try {
        for (const block of [...this.blocks.values()]) this.run(block, scope);
      } catch (error) {
        this.references = 0;
        this.scope = void 0;
        scope.Dispose();
        throw error;
      }
      this.active.next(true);
      this.activated.next();
    } else this.references++;
    const generation = this.generation;
    return import_disposables.Disposable.Create(() => {
      if (generation === this.generation) this.Deactivate();
    });
  }
  Deactivate(ignoreRefCount = false) {
    if (!this.references) return;
    this.references = ignoreRefCount ? 0 : this.references - 1;
    if (this.references) return;
    const scope = this.scope;
    this.scope = void 0;
    this.generation++;
    try {
      scope?.Dispose();
    } finally {
      this.active.next(false);
      this.deactivated.next();
    }
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.Deactivate(true);
    } finally {
      this.blocks.clear();
      this.active.complete();
      this.activated.complete();
      this.deactivated.complete();
    }
  }
  unsubscribe() {
    this.Dispose();
  }
}
function WhenActivated(target, block) {
  return (target instanceof ViewModelActivator ? target : target.Activator).AddActivationBlock(block);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ViewModelActivator,
  WhenActivated
});
//# sourceMappingURL=activation.js.map
