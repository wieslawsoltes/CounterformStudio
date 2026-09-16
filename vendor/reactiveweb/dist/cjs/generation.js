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
var generation_exports = {};
__export(generation_exports, {
  DefineViewModel: () => DefineViewModel,
  Reactive: () => Reactive,
  ReactivePropertyValidationError: () => ReactivePropertyValidationError,
  defineViewModel: () => defineViewModel,
  reactiveProperty: () => reactiveProperty
});
module.exports = __toCommonJS(generation_exports);
var import_reactive_object = require("./reactive-object.js");
var import_observable_property = require("./observable-property.js");
var import_command = require("./command.js");
const reservedReactiveNames = (() => {
  const probe = new import_reactive_object.ReactiveObject();
  const names = new Set(Object.getOwnPropertyNames(probe));
  probe.Dispose();
  return names;
})();
class ReactivePropertyValidationError extends TypeError {
  constructor(PropertyName, AttemptedValue, message) {
    super(message || `Invalid value for reactive property '${PropertyName}'.`);
    this.PropertyName = PropertyName;
    this.AttemptedValue = AttemptedValue;
    this.name = "ReactivePropertyValidationError";
  }
  PropertyName;
  AttemptedValue;
}
function validate(name, value, options) {
  const result = options.validate?.(value);
  if (result === false || typeof result === "string") {
    throw new ReactivePropertyValidationError(name, value, typeof result === "string" ? result : void 0);
  }
}
function setReactive(owner, name, previous, value, options) {
  validate(name, value, options);
  if ((options.equals ?? Object.is)(previous, value)) return previous;
  const dependents = [...new Set(options.dependents ?? [])].filter((dependent) => dependent !== name);
  const previousValues = dependents.map((dependent) => owner[dependent]);
  for (let index = 0; index < dependents.length; index++) owner.RaisePropertyChanging(dependents[index], previousValues[index]);
  const next = owner.RaiseAndSetIfChanged(name, value);
  for (let index = 0; index < dependents.length; index++) owner.RaisePropertyChanged(dependents[index], previousValues[index], owner[dependents[index]]);
  return next;
}
function Reactive(targetOrOptions = {}, context) {
  if (!context) {
    const options = targetOrOptions;
    return ((target, currentContext) => decorateReactive(target, currentContext, options));
  }
  return decorateReactive(targetOrOptions, context, {});
}
function decorateReactive(target, context, options) {
  if (context.kind !== "accessor" || context.static || context.private || typeof context.name !== "string") {
    throw new TypeError("@Reactive requires a public, non-static, string-named auto-accessor on ReactiveObject.");
  }
  const name = context.name;
  if (reservedReactiveNames.has(name) || name in import_reactive_object.ReactiveObject.prototype || name === "__proto__") {
    throw new TypeError(`Reserved reactive property name '${name}'.`);
  }
  return {
    init(value) {
      validate(name, value, options);
      const suppressed = this.SuppressChangeNotifications();
      try {
        this.SetValue(name, value);
      } finally {
        suppressed.Dispose();
      }
      return value;
    },
    get() {
      return this.GetValue(name);
    },
    set(value) {
      setReactive(this, name, this.GetValue(name), value, options);
    }
  };
}
function reactiveProperty(initial, options = {}) {
  return { initial, ...options };
}
function defineViewModel(schema) {
  const properties = Object.entries(schema.properties);
  const computed = Object.entries(schema.computed ?? {});
  const commands = Object.entries(schema.commands ?? {});
  const names = [...properties, ...computed, ...commands].map(([name]) => name);
  if (names.length !== new Set(names).size) throw new TypeError("Reactive, computed, and command member names must be unique.");
  for (const name of names) {
    if (!name || reservedReactiveNames.has(name) || name in import_reactive_object.ReactiveObject.prototype || ["__proto__", "prototype", "constructor", "Dispose", "Changed", "Changing", "PropertyChanged", "PropertyChanging", "ThrownExceptions", "changed", "changing", "thrownExceptions", "__generatedResources", "__generatedDisposed"].includes(name)) {
      throw new TypeError(`Reserved or invalid generated member name '${name}'.`);
    }
  }
  class SchemaViewModel extends import_reactive_object.ReactiveObject {
    #resources = [];
    #disposed = false;
    constructor(initial = {}) {
      super();
      for (const name of Object.keys(initial)) {
        if (!Object.hasOwn(schema.properties, name)) throw new TypeError(`Unknown reactive property '${name}'.`);
      }
      try {
        for (const [name, definition] of properties) {
          const value = Object.hasOwn(initial, name) ? initial[name] : definition.factory ? definition.factory() : cloneInitial(definition.initial);
          validate(name, value, definition);
          this.RaiseAndSetIfChanged(name, value);
        }
        for (const [name, definition] of computed) {
          const helper = (0, import_observable_property.ToProperty)(definition.source(this), this, name, {
            initialValue: definition.initialValue,
            ...definition.scheduler ? { scheduler: definition.scheduler } : {},
            ...definition.deferSubscription !== void 0 ? { deferSubscription: definition.deferSubscription } : {},
            ...definition.comparer ? { comparer: definition.comparer } : {}
          });
          this.#resources.push(helper);
        }
        for (const [name, definition] of commands) {
          const canExecute = definition.canExecute?.(this);
          const command = definition.kind === "task" ? import_command.ReactiveCommand.CreateFromTask((input, signal) => definition.execute(this, input, signal), canExecute, definition.outputScheduler) : definition.kind === "observable" ? import_command.ReactiveCommand.CreateFromObservable((input, signal) => definition.execute(this, input, signal), canExecute, definition.outputScheduler) : import_command.ReactiveCommand.Create((input) => definition.execute(this, input), canExecute, definition.outputScheduler);
          Object.defineProperty(this, name, { value: command, enumerable: true });
          this.#resources.push(command);
        }
      } catch (error) {
        this.Dispose();
        throw error;
      }
    }
    Dispose() {
      if (this.#disposed) return;
      this.#disposed = true;
      const errors = [];
      for (const resource of this.#resources.splice(0).reverse()) {
        try {
          resource.Dispose();
        } catch (error) {
          errors.push(error);
        }
      }
      super.Dispose();
      if (errors.length) throw new AggregateError(errors, "Generated view model disposal failed.");
    }
  }
  if (schema.name) Object.defineProperty(SchemaViewModel, "name", { value: schema.name });
  for (const [name, definition] of properties) {
    Object.defineProperty(SchemaViewModel.prototype, name, {
      enumerable: true,
      get() {
        return this.GetValue(name);
      },
      set(value) {
        setReactive(this, name, this.GetValue(name), value, definition);
      }
    });
  }
  return SchemaViewModel;
}
function cloneInitial(value) {
  if (value === null || typeof value !== "object") return value;
  try {
    return structuredClone(value);
  } catch {
    throw new TypeError("Reactive property initial values must be cloneable; provide factory for class instances or non-cloneable values.");
  }
}
const DefineViewModel = defineViewModel;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DefineViewModel,
  Reactive,
  ReactivePropertyValidationError,
  defineViewModel,
  reactiveProperty
});
//# sourceMappingURL=generation.js.map
