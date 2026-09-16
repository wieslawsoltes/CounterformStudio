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
var providers_exports = {};
__export(providers_exports, {
  ObservablePropertyProviderRegistry: () => ObservablePropertyProviderRegistry,
  ObservablePropertyProviders: () => ObservablePropertyProviders,
  getPropertyChangeObservable: () => getPropertyChangeObservable
});
module.exports = __toCommonJS(providers_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
class ObservablePropertyProviderRegistry {
  providers = [];
  Register(provider) {
    const registration = { provider };
    this.providers.push(registration);
    return import_disposables.Disposable.Create(() => {
      const index = this.providers.indexOf(registration);
      if (index >= 0) this.providers.splice(index, 1);
    });
  }
  GetProvider(sender, propertyName, beforeChanged = false) {
    let best, affinity = 0;
    for (const { provider } of this.providers) {
      const score = provider.GetAffinityForObject(sender.constructor, propertyName, beforeChanged);
      if (Number.isFinite(score) && score > 0 && score >= affinity) {
        affinity = score;
        best = provider;
      }
    }
    return best;
  }
  Observe(sender, propertyName, beforeChanged = false) {
    const provider = this.GetProvider(sender, propertyName, beforeChanged);
    if (!provider) return void 0;
    const stream = provider.GetNotificationForProperty(sender, propertyName, beforeChanged);
    if (!(0, import_rxjs.isObservable)(stream)) throw new TypeError("An observable property provider must return an RxJS Observable");
    return stream;
  }
  get Count() {
    return this.providers.length;
  }
  Clear() {
    this.providers.length = 0;
  }
}
class ObservablePropertyProviders {
  static Current = new ObservablePropertyProviderRegistry();
}
function getPropertyChangeObservable(target, propertyName, beforeChange) {
  return ObservablePropertyProviders.Current.Observe(target, propertyName, beforeChange);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ObservablePropertyProviderRegistry,
  ObservablePropertyProviders,
  getPropertyChangeObservable
});
//# sourceMappingURL=providers.js.map
