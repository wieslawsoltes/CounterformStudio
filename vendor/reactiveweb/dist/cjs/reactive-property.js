"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var reactive_property_exports = {};
__export(reactive_property_exports, {
  ReactiveProperty: () => ReactiveProperty,
  ToReactiveProperty: () => ToReactiveProperty,
  toReactiveProperty: () => toReactiveProperty
});
module.exports = __toCommonJS(reactive_property_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
var import_reactive_object = require("./reactive-object.js");
function errorsFrom(result) {
  if (result == null || result === true) return [];
  if (result === false) return ["The value is invalid."];
  return typeof result === "string" ? result ? [result] : [] : result.filter((message) => !!message);
}
function isPropertyOptions(value) {
  return value !== null && typeof value === "object" && (Object.keys(value).length === 0 || ["initialValue", "allowDuplicateValues", "skipCurrentValueOnSubscribe", "ignoreInitialError", "comparer", "scheduler"].some((key) => key in value));
}
class ReactiveProperty extends import_reactive_object.ReactiveObject {
  currentValue;
  valueSubject;
  validationValueSubject;
  errorSubject = new import_rxjs.BehaviorSubject([]);
  hasErrorsSubject = new import_rxjs.BehaviorSubject(false);
  validatingSubject = new import_rxjs.BehaviorSubject(false);
  errorsChangedSubject = new import_rxjs.BehaviorSubject({ PropertyName: "Value", propertyName: "Value" });
  sourceSubscription = new import_rxjs.Subscription();
  validationSubscription = new import_rxjs.Subscription();
  validationVersion = 0;
  validators = /* @__PURE__ */ new Set();
  streamErrors = /* @__PURE__ */ new Map();
  valueErrors = [];
  options;
  wasEdited = false;
  ErrorsChanged = this.errorsChangedSubject.asObservable();
  IsValidatingObservable = this.validatingSubject.asObservable();
  static Create(initialValue, options) {
    return new ReactiveProperty(initialValue, options);
  }
  constructor(initialValueOrSource, optionsOrInitial, sourceOptions) {
    super();
    const source = (0, import_rxjs.isObservable)(initialValueOrSource) ? initialValueOrSource : void 0;
    this.options = source ? sourceOptions ? { ...sourceOptions, initialValue: optionsOrInitial } : isPropertyOptions(optionsOrInitial) ? optionsOrInitial : { initialValue: optionsOrInitial } : optionsOrInitial ?? {};
    this.currentValue = source ? this.options.initialValue : initialValueOrSource;
    this.valueSubject = new import_rxjs.BehaviorSubject(this.currentValue);
    this.validationValueSubject = new import_rxjs.BehaviorSubject(this.currentValue);
    if (source) this.sourceSubscription.add(source.subscribe({ next: (value) => this.OnNext(value), error: (error) => this.OnError(error) }));
  }
  get Value() {
    return this.currentValue;
  }
  set Value(value) {
    this.OnNext(value);
  }
  get value() {
    return this.Value;
  }
  set value(value) {
    this.Value = value;
  }
  get HasErrors() {
    return this.errorSubject.value.length > 0;
  }
  get IsValidating() {
    return this.validatingSubject.value;
  }
  get Errors() {
    return this.errorSubject.value;
  }
  get ObserveErrorChanged() {
    return this.errorSubject.asObservable();
  }
  get ObserveHasErrors() {
    return this.hasErrorsSubject.asObservable();
  }
  observeErrorChanged() {
    return this.ObserveErrorChanged;
  }
  observeHasErrors() {
    return this.ObserveHasErrors;
  }
  GetErrors(propertyName) {
    return propertyName && propertyName !== "Value" ? [] : this.Errors;
  }
  OnNext(value) {
    if (this.IsDisposed) return;
    this.wasEdited = true;
    if (!this.options.allowDuplicateValues && (this.options.comparer ?? Object.is)(this.currentValue, value)) return;
    this.setCurrent(value);
  }
  setCurrent(value) {
    const previous = this.currentValue;
    this.RaisePropertyChanging("Value", previous, value);
    this.currentValue = value;
    this.RaisePropertyChanged("Value", previous, value);
    this.valueSubject.next(value);
    this.CheckValidation();
  }
  OnError(error) {
    if (!this.IsDisposed) this.ReportException(error);
  }
  OnCompleted() {
    this.valueSubject.complete();
  }
  next(value) {
    this.OnNext(value);
  }
  error(error) {
    this.OnError(error);
  }
  complete() {
    this.OnCompleted();
  }
  Refresh() {
    if (this.IsDisposed) return;
    this.wasEdited = true;
    this.setCurrent(this.currentValue);
  }
  refresh() {
    this.Refresh();
  }
  AddValidationError(validator, ignoreInitialError = this.options.ignoreInitialError ?? false) {
    if (this.IsDisposed) throw new Error("ReactiveProperty has been disposed.");
    this.validators.add(validator);
    if (!ignoreInitialError || this.wasEdited) this.CheckValidation();
    return this;
  }
  /** Persistent stream validators retain operator state, including debounce, switchMap, and scan. */
  AddValidationErrorObservable(transform, ignoreInitialError = this.options.ignoreInitialError ?? false) {
    if (this.IsDisposed) throw new Error("ReactiveProperty has been disposed.");
    const key = {};
    this.streamErrors.set(key, []);
    const values = ignoreInitialError ? this.validationValueSubject.pipe((0, import_rxjs.skip)(1)) : this.validationValueSubject.asObservable();
    try {
      this.sourceSubscription.add(transform(values).subscribe({
        next: (errors) => {
          this.streamErrors.set(key, errorsFrom(errors));
          this.publishErrors();
        },
        error: (error) => {
          this.streamErrors.set(key, [error instanceof Error ? error.message : String(error)]);
          this.publishErrors();
        }
      }));
    } catch (error) {
      this.streamErrors.set(key, [error instanceof Error ? error.message : String(error)]);
      this.publishErrors();
    }
    return this;
  }
  /** Web convenience: returns a removable validator lifetime. */
  AddValidator(validator) {
    this.AddValidationError(validator);
    return import_disposables.Disposable.Create(() => {
      this.validators.delete(validator);
      this.CheckValidation();
    });
  }
  CheckValidation() {
    if (this.IsDisposed) return;
    const version = ++this.validationVersion;
    this.validationSubscription.unsubscribe();
    this.validationSubscription = new import_rxjs.Subscription();
    this.validationValueSubject.next(this.currentValue);
    if (version !== this.validationVersion || this.IsDisposed) return;
    const validations = [];
    for (const validator of this.validators) {
      try {
        const result = validator(this.currentValue);
        const observableResult = (0, import_rxjs.isObservable)(result) ? result : result && typeof result.then === "function" ? (0, import_rxjs.from)(result) : (0, import_rxjs.of)(result);
        validations.push(new import_rxjs.Observable((subscriber) => observableResult.subscribe({
          next: (value) => subscriber.next(errorsFrom(value)),
          error: (error) => {
            subscriber.next([error instanceof Error ? error.message : String(error)]);
            subscriber.complete();
          },
          complete: () => subscriber.complete()
        })).pipe((0, import_rxjs.defaultIfEmpty)([])));
      } catch (error) {
        validations.push((0, import_rxjs.of)([error instanceof Error ? error.message : String(error)]));
      }
    }
    if (!validations.length) {
      this.valueErrors = [];
      this.publishErrors();
      this.setValidating(false);
      return;
    }
    this.setValidating(true);
    const subscription = (0, import_rxjs.combineLatest)(validations).subscribe({
      next: (results) => {
        if (version !== this.validationVersion || this.IsDisposed) return;
        this.valueErrors = results.flat();
        this.publishErrors();
        if (version === this.validationVersion) this.setValidating(false);
      },
      complete: () => {
        if (version === this.validationVersion && !this.IsDisposed) this.setValidating(false);
      }
    });
    this.validationSubscription.add(subscription);
  }
  publishErrors() {
    this.setErrors([.../* @__PURE__ */ new Set([...this.valueErrors, ...[...this.streamErrors.values()].flat()])]);
  }
  setValidating(value) {
    if (this.validatingSubject.value === value) return;
    this.RaisePropertyChanging("IsValidating", !value, value);
    this.validatingSubject.next(value);
    this.RaisePropertyChanged("IsValidating", !value, value);
  }
  setErrors(errors) {
    const previous = this.errorSubject.value;
    if (previous.length === errors.length && previous.every((value, index) => value === errors[index])) return;
    const hadErrors = previous.length > 0;
    const hasErrors = errors.length > 0;
    this.RaisePropertyChanging("Errors", previous, errors);
    if (hadErrors !== hasErrors) this.RaisePropertyChanging("HasErrors", hadErrors, hasErrors);
    this.errorSubject.next(Object.freeze([...errors]));
    if (hadErrors !== hasErrors) this.hasErrorsSubject.next(hasErrors);
    this.errorsChangedSubject.next({ PropertyName: "Value", propertyName: "Value" });
    this.RaisePropertyChanged("Errors", previous, errors);
    if (hadErrors !== hasErrors) this.RaisePropertyChanged("HasErrors", hadErrors, hasErrors);
  }
  asObservable() {
    const source = this.valueSubject.asObservable();
    const selected = this.options.skipCurrentValueOnSubscribe ? source.pipe((0, import_rxjs.skip)(1)) : source;
    return this.options.scheduler ? selected.pipe((0, import_rxjs.observeOn)(this.options.scheduler)) : selected;
  }
  ToObservable() {
    return this.asObservable();
  }
  [import_rxjs.observable]() {
    return this.asObservable();
  }
  lift(operator) {
    return this.asObservable().lift(operator);
  }
  subscribe(observer) {
    return this.asObservable().subscribe(observer);
  }
  Subscribe(observer) {
    return this.subscribe(observer);
  }
  pipe(...operators) {
    return operators.reduce((source, operator) => operator(source), this.asObservable());
  }
  Dispose() {
    if (this.IsDisposed) return;
    this.validationVersion++;
    super.Dispose();
    try {
      new import_disposables.CompositeDisposable(this.validationSubscription, this.sourceSubscription).Dispose();
    } finally {
      this.validators.clear();
      this.streamErrors.clear();
      this.valueSubject.complete();
      this.validationValueSubject.complete();
      this.errorSubject.complete();
      this.hasErrorsSubject.complete();
      this.validatingSubject.complete();
      this.errorsChangedSubject.complete();
    }
  }
}
function ToReactiveProperty(source, options) {
  return new ReactiveProperty(source, options);
}
const toReactiveProperty = ToReactiveProperty;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReactiveProperty,
  ToReactiveProperty,
  toReactiveProperty
});
//# sourceMappingURL=reactive-property.js.map
