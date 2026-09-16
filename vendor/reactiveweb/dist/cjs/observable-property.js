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
var observable_property_exports = {};
__export(observable_property_exports, {
  ObservableAsPropertyHelper: () => ObservableAsPropertyHelper,
  ToProperty: () => ToProperty,
  toProperty: () => toProperty
});
module.exports = __toCommonJS(observable_property_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
var import_rx_app = require("./rx-app.js");
class ObservableAsPropertyHelper {
  constructor(source, optionsOrChanged = {}, initialValue, deferSubscription = false, scheduler) {
    this.source = source;
    this.options = typeof optionsOrChanged === "function" ? { onChanged: optionsOrChanged, initialValue, deferSubscription, scheduler } : optionsOrChanged;
    this.value = this.options.initialValue;
    if (!this.options.deferSubscription) this.Subscribe();
  }
  source;
  value;
  disposed = false;
  subscribed = false;
  subscription = new import_disposables.SingleAssignmentDisposable();
  exceptionSubject = new import_rxjs.Subject();
  options;
  ThrownExceptions = this.exceptionSubject.asObservable();
  thrownExceptions = this.ThrownExceptions;
  get Value() {
    this.Subscribe();
    return this.value;
  }
  get valueOrDefault() {
    return this.value;
  }
  get IsSubscribed() {
    return this.subscribed;
  }
  get IsDisposed() {
    return this.disposed;
  }
  get closed() {
    return this.disposed;
  }
  Subscribe() {
    if (this.disposed || this.subscribed) return;
    this.subscribed = true;
    const comparer = this.options.comparer ?? Object.is;
    const source = this.source.pipe((0, import_rxjs.distinctUntilChanged)(comparer), (0, import_rxjs.observeOn)(this.options.scheduler ?? import_rx_app.RxApp.MainThreadScheduler));
    this.subscription.Disposable = source.subscribe({
      next: (value) => {
        if (this.disposed || comparer(this.value, value)) return;
        const previous = this.value;
        try {
          this.options.onChanging?.(value, previous);
          if (this.disposed) return;
          this.value = value;
          this.options.onChanged?.(value, previous);
        } catch (error) {
          this.reportException(error);
        }
      },
      error: (error) => this.reportException(error)
    });
  }
  reportException(error) {
    if (this.disposed) return;
    if (this.exceptionSubject.observed) this.exceptionSubject.next(error);
    else import_rx_app.RxApp.HandleException(error);
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.subscription.Dispose();
    } finally {
      this.exceptionSubject.complete();
    }
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
function isOptions(value) {
  return value !== null && typeof value === "object" && (Object.keys(value).length === 0 || ["initialValue", "scheduler", "deferSubscription", "comparer", "onChanging", "onChanged", "installProperty"].some((key) => key in value));
}
function ToProperty(source, owner, propertyName, initialValueOrOptions, extraOptions) {
  const options = extraOptions ? { ...extraOptions, initialValue: initialValueOrOptions } : isOptions(initialValueOrOptions) ? initialValueOrOptions : { initialValue: initialValueOrOptions };
  const helper = new ObservableAsPropertyHelper(source, {
    ...options,
    deferSubscription: true,
    onChanging(value, previous) {
      owner.RaisePropertyChanging(propertyName, previous, value);
      options.onChanging?.(value, previous);
    },
    onChanged(value, previous) {
      owner.RaisePropertyChanged(propertyName, previous, value);
      options.onChanged?.(value, previous);
    }
  });
  let current = owner;
  let descriptor;
  while (current && !descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(current, propertyName);
    current = Object.getPrototypeOf(current);
  }
  const shouldInstall = options.installProperty ?? !(descriptor?.get && !descriptor.set);
  if (shouldInstall) {
    try {
      Object.defineProperty(owner, propertyName, { enumerable: true, configurable: true, get: () => helper.Value });
    } catch (error) {
      helper.Dispose();
      throw error;
    }
  }
  if (!options.deferSubscription) helper.Subscribe();
  return helper;
}
const toProperty = ToProperty;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ObservableAsPropertyHelper,
  ToProperty,
  toProperty
});
//# sourceMappingURL=observable-property.js.map
