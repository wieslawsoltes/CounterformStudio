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
var validation_exports = {};
__export(validation_exports, {
  PropertyValidationRule: () => PropertyValidationRule,
  ReactiveValidationObject: () => ReactiveValidationObject,
  ValidationContext: () => ValidationContext,
  ValidationRule: () => ValidationRule
});
module.exports = __toCommonJS(validation_exports);
var import_rxjs = require("rxjs");
var import_reactive_object = require("./reactive-object.js");
var import_disposables = require("./disposables.js");
const valid = Object.freeze({ IsValid: true, Text: Object.freeze([]), IsPending: false });
const pending = Object.freeze({ IsValid: false, Text: Object.freeze([]), IsPending: true });
class ValidationContext {
  rules = /* @__PURE__ */ new Map();
  state = new import_rxjs.BehaviorSubject(valid);
  disposed = false;
  ValidationStatusChange = this.state.asObservable();
  IsValid = this.ValidationStatusChange.pipe((0, import_rxjs.map)((x) => x.IsValid), (0, import_rxjs.distinctUntilChanged)());
  IsPending = this.ValidationStatusChange.pipe((0, import_rxjs.map)((x) => x.IsPending), (0, import_rxjs.distinctUntilChanged)());
  Text = this.ValidationStatusChange.pipe((0, import_rxjs.map)((x) => x.Text));
  get State() {
    return this.state.value;
  }
  get IsValidValue() {
    return this.State.IsValid;
  }
  get IsPendingValue() {
    return this.State.IsPending;
  }
  get Validations() {
    return [...this.rules.keys()];
  }
  get HasErrors() {
    return !this.State.IsValid;
  }
  Add(rule) {
    if (this.disposed) throw new Error("ValidationContext is disposed.");
    if (this.rules.has(rule)) throw new Error("The validation rule is already registered.");
    this.rules.set(rule, new import_rxjs.Subscription());
    const subscription = rule.ValidationStatusChange.subscribe(() => this.refresh());
    this.rules.set(rule, subscription);
    this.refresh();
    return import_disposables.Disposable.Create(() => this.Remove(rule));
  }
  Remove(rule) {
    const subscription = this.rules.get(rule);
    if (!subscription) return false;
    this.rules.delete(rule);
    subscription.unsubscribe();
    this.refresh();
    return true;
  }
  GetErrors(propertyName) {
    return [...this.rules.keys()].filter((rule) => propertyName == null || rule.PropertyName === propertyName).flatMap((rule) => [...rule.State.Text]);
  }
  ObserveErrors(propertyName) {
    return this.ValidationStatusChange.pipe((0, import_rxjs.map)(() => this.GetErrors(propertyName)), (0, import_rxjs.distinctUntilChanged)((a, b) => a.length === b.length && a.every((x, i) => x === b[i])));
  }
  refresh() {
    if (this.disposed) return;
    const states = [...this.rules.keys()].map((rule) => rule.State);
    this.state.next(Object.freeze({ IsValid: states.every((x) => x.IsValid && !x.IsPending), IsPending: states.some((x) => x.IsPending), Text: Object.freeze(states.flatMap((x) => [...x.Text])) }));
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const entries = [...this.rules];
    this.rules.clear();
    for (const [rule, subscription] of entries) {
      subscription.unsubscribe();
      rule.Dispose();
    }
    this.state.complete();
  }
  unsubscribe() {
    this.Dispose();
  }
}
function normalize(result, message) {
  if (typeof result === "boolean") return result ? valid : Object.freeze({ IsValid: false, Text: Object.freeze([message]), IsPending: false });
  if (typeof result === "string") return result.length ? Object.freeze({ IsValid: false, Text: Object.freeze([result]), IsPending: false }) : valid;
  if (Array.isArray(result)) return result.length ? Object.freeze({ IsValid: false, Text: Object.freeze([...result]), IsPending: false }) : valid;
  const state = result;
  return Object.freeze({ IsValid: state.IsValid, IsPending: state.IsPending ?? false, Text: Object.freeze([...state.Text]) });
}
class PropertyValidationRule {
  constructor(context, PropertyName, values, predicate, message = "The value is invalid.") {
    this.PropertyName = PropertyName;
    this.registration = context.Add(this);
    this.subscription = values.pipe((0, import_rxjs.switchMap)((value) => (0, import_rxjs.defer)(() => {
      const result = predicate(value);
      const asynchronous = (0, import_rxjs.isObservable)(result) || result != null && typeof result.then === "function";
      const states = (asynchronous ? (0, import_rxjs.from)(result) : (0, import_rxjs.of)(result)).pipe((0, import_rxjs.map)((result2) => normalize(result2, message)));
      return asynchronous ? states.pipe((0, import_rxjs.startWith)(pending)) : states;
    }).pipe((0, import_rxjs.catchError)(() => (0, import_rxjs.of)(normalize(false, message)))))).subscribe((state) => this.state.next(state));
  }
  PropertyName;
  state = new import_rxjs.BehaviorSubject(pending);
  subscription;
  registration;
  disposed = false;
  ValidationStatusChange = this.state.asObservable();
  get State() {
    return this.state.value;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.subscription.unsubscribe();
    this.registration?.Dispose();
    this.registration = void 0;
    this.state.complete();
  }
  unsubscribe() {
    this.Dispose();
  }
}
function ValidationRule(viewModel, propertyName, predicate, message) {
  return new PropertyValidationRule(viewModel.ValidationContext, propertyName, (0, import_reactive_object.WhenAnyValue)(viewModel, propertyName), predicate, message);
}
class ReactiveValidationObject extends import_reactive_object.ReactiveObject {
  ValidationContext = new ValidationContext();
  get HasErrors() {
    return this.ValidationContext.HasErrors;
  }
  GetErrors(propertyName) {
    return this.ValidationContext.GetErrors(propertyName);
  }
  ValidationRule(propertyName, predicate, message) {
    return ValidationRule(this, propertyName, predicate, message);
  }
  Dispose() {
    this.ValidationContext.Dispose();
    super.Dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PropertyValidationRule,
  ReactiveValidationObject,
  ValidationContext,
  ValidationRule
});
//# sourceMappingURL=validation.js.map
