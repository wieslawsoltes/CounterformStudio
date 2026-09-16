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
var mvvm_exports = {};
__export(mvvm_exports, {
  AsyncRelayCommand: () => AsyncRelayCommand,
  BindCommand: () => BindCommand,
  Binding: () => Binding,
  BindingExpression: () => BindingExpression,
  BindingMode: () => BindingMode,
  CompositeDisposable: () => CompositeDisposable,
  ObservableEvent: () => ObservableEvent,
  ObservableObject: () => ObservableObject,
  RelayCommand: () => RelayCommand,
  Subscription: () => Subscription
});
module.exports = __toCommonJS(mvvm_exports);
class Subscription {
  cleanup;
  constructor(cleanup) {
    this.cleanup = cleanup;
  }
  Dispose() {
    const cleanup = this.cleanup;
    this.cleanup = void 0;
    cleanup?.();
  }
}
class CompositeDisposable {
  items = /* @__PURE__ */ new Set();
  disposed = false;
  Add(item) {
    if (this.disposed) item.Dispose();
    else this.items.add(item);
    return item;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const errors = [];
    for (const item of this.items) {
      try {
        item.Dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    this.items.clear();
    if (errors.length)
      throw new AggregateError(
        errors,
        "One or more subscriptions failed to dispose"
      );
  }
}
class ObservableEvent {
  listeners = /* @__PURE__ */ new Set();
  Subscribe(listener) {
    this.listeners.add(listener);
    return new Subscription(() => this.listeners.delete(listener));
  }
  Emit(args) {
    for (const listener of [...this.listeners]) listener(args);
  }
  Clear() {
    this.listeners.clear();
  }
}
const unsafeNames = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function assertPropertyName(name) {
  if (!name || unsafeNames.has(name))
    throw new TypeError(`Invalid property name: ${name}`);
}
class ObservableObject {
  PropertyChanged = new ObservableEvent();
  values = /* @__PURE__ */ new Map();
  disposed = false;
  constructor(initialValues = {}) {
    for (const [name, value] of Object.entries(initialValues))
      this.DefineProperty(name, value);
  }
  GetProperty(name, defaultValue) {
    return this.values.has(name) ? this.values.get(name) : defaultValue;
  }
  /** Also useful inside conventional get/set accessors on a subclass. */
  SetProperty(name, value) {
    assertPropertyName(name);
    if (this.disposed) throw new Error("ObservableObject is disposed");
    const previous = this.values.get(name);
    if (this.values.has(name) && Object.is(previous, value)) return false;
    this.values.set(name, value);
    this.OnPropertyChanged(name, previous, value);
    return true;
  }
  DefineProperty(name, value) {
    assertPropertyName(name);
    if (name in this) throw new TypeError(`Property already exists: ${name}`);
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: false,
      get: () => this.GetProperty(name),
      set: (next) => this.SetProperty(name, next)
    });
    this.SetProperty(name, value);
    return this;
  }
  OnPropertyChanged(name, oldValue, newValue) {
    this.PropertyChanged.Emit({
      Sender: this,
      PropertyName: name,
      OldValue: oldValue,
      NewValue: newValue
    });
  }
  Dispose() {
    this.disposed = true;
    this.PropertyChanged.Clear();
  }
}
class RelayCommand {
  constructor(execute, canExecute = () => true) {
    this.execute = execute;
    this.canExecute = canExecute;
  }
  execute;
  canExecute;
  CanExecuteChanged = new ObservableEvent();
  disposed = false;
  CanExecute(parameter) {
    return !this.disposed && this.canExecute(parameter);
  }
  Execute(parameter) {
    if (!this.CanExecute(parameter)) return false;
    this.execute(parameter);
    return true;
  }
  NotifyCanExecuteChanged() {
    this.CanExecuteChanged.Emit();
  }
  RaiseCanExecuteChanged() {
    this.NotifyCanExecuteChanged();
  }
  Dispose() {
    this.disposed = true;
    this.NotifyCanExecuteChanged();
    this.CanExecuteChanged.Clear();
  }
}
class AsyncRelayCommand extends ObservableObject {
  constructor(execute, canExecute = () => true) {
    super();
    this.execute = execute;
    this.canExecute = canExecute;
  }
  execute;
  canExecute;
  CanExecuteChanged = new ObservableEvent();
  ExecutionTask;
  controller;
  commandDisposed = false;
  get IsRunning() {
    return this.GetProperty("IsRunning", false);
  }
  get Error() {
    return this.GetProperty("Error");
  }
  CanExecute(parameter) {
    return !this.commandDisposed && !this.IsRunning && this.canExecute(parameter);
  }
  Execute(parameter) {
    if (!this.CanExecute(parameter)) return Promise.resolve();
    this.controller = new AbortController();
    const signal = this.controller.signal;
    this.SetProperty("IsRunning", true);
    this.SetProperty("Error", void 0);
    this.NotifyCanExecuteChanged();
    this.ExecutionTask = Promise.resolve().then(() => {
      signal.throwIfAborted();
      return this.execute(parameter, signal);
    }).catch((error) => {
      if (!this.commandDisposed) this.SetProperty("Error", error);
      throw error;
    }).finally(() => {
      this.controller = void 0;
      if (!this.commandDisposed) {
        this.SetProperty("IsRunning", false);
        this.NotifyCanExecuteChanged();
      }
    });
    return this.ExecutionTask;
  }
  Cancel() {
    this.controller?.abort();
  }
  NotifyCanExecuteChanged() {
    this.CanExecuteChanged.Emit();
  }
  Dispose() {
    if (this.commandDisposed) return;
    this.commandDisposed = true;
    this.Cancel();
    this.SetProperty("IsRunning", false);
    this.CanExecuteChanged.Emit();
    this.CanExecuteChanged.Clear();
    super.Dispose();
  }
}
const BindingMode = {
  OneWay: "OneWay",
  TwoWay: "TwoWay",
  OneTime: "OneTime",
  OneWayToSource: "OneWayToSource"
};
function readProperty(value, name) {
  if (value == null) return void 0;
  return value[name];
}
class Binding {
  Options;
  constructor(options) {
    if (!options.Source || typeof options.Source !== "object")
      throw new TypeError("Binding.Source must be an object");
    if (!options.Path || options.Path.split(".").some((part) => !part || unsafeNames.has(part)))
      throw new TypeError("Binding.Path must contain safe property names");
    if (options.Mode && !Object.values(BindingMode).includes(options.Mode))
      throw new TypeError("Unknown binding mode");
    this.Options = { ...options };
  }
  Attach(target, targetProperty) {
    return new BindingExpression(this.Options, target, targetProperty);
  }
  static SetBinding(target, targetProperty, binding) {
    return (binding instanceof Binding ? binding : new Binding(binding)).Attach(
      target,
      targetProperty
    );
  }
}
class BindingExpression {
  constructor(options, target, targetProperty) {
    this.options = options;
    this.target = target;
    this.targetProperty = targetProperty;
    assertPropertyName(targetProperty);
    this.path = options.Path.split(".");
    this.mode = options.Mode ?? BindingMode.OneWay;
    try {
      if (this.mode !== BindingMode.OneTime) this.subscribeSource();
      if (this.mode === BindingMode.TwoWay || this.mode === BindingMode.OneWayToSource)
        this.subscribeTarget();
      if (this.mode === BindingMode.OneWayToSource) this.UpdateSource();
      else this.UpdateTarget();
    } catch (error) {
      this.Dispose();
      throw error;
    }
  }
  options;
  target;
  targetProperty;
  path;
  sourceSubscriptions = [];
  targetSubscription;
  updating = false;
  disposed = false;
  mode;
  subscribeSource() {
    for (const item of this.sourceSubscriptions) item.Dispose();
    this.sourceSubscriptions = [];
    let current = this.options.Source;
    for (const segment of this.path) {
      const observable = current;
      if (observable?.PropertyChanged?.Subscribe) {
        this.sourceSubscriptions.push(
          observable.PropertyChanged.Subscribe((args) => {
            if (this.disposed || args.PropertyName && args.PropertyName !== segment)
              return;
            this.subscribeSource();
            if (!this.updating && this.mode !== BindingMode.OneWayToSource)
              this.UpdateTarget();
          })
        );
      }
      current = readProperty(current, segment);
    }
  }
  subscribeTarget() {
    const observable = this.target;
    if (observable.PropertyChanged?.Subscribe) {
      this.targetSubscription = observable.PropertyChanged.Subscribe((args) => {
        if (!args.PropertyName || args.PropertyName === this.targetProperty)
          this.UpdateSource();
      });
    } else if ("addEventListener" in this.target && "removeEventListener" in this.target) {
      const target = this.target;
      const event = this.options.UpdateSourceEvent ?? (this.targetProperty === "Document" ? "documentchange" : "change");
      const listener = () => this.UpdateSource();
      target.addEventListener(event, listener);
      this.targetSubscription = new Subscription(
        () => target.removeEventListener(event, listener)
      );
    } else if (!this.options.UpdateSourceEvent) {
    }
  }
  UpdateTarget() {
    if (this.disposed || this.updating) return;
    this.updating = true;
    try {
      let value = this.options.Source;
      for (const segment of this.path) value = readProperty(value, segment);
      if (this.options.Converter)
        value = this.options.Converter.Convert(
          value,
          this.options.ConverterParameter
        );
      this.target[this.targetProperty] = value;
    } finally {
      this.updating = false;
    }
  }
  UpdateSource() {
    if (this.disposed || this.updating) return;
    if (this.mode !== BindingMode.TwoWay && this.mode !== BindingMode.OneWayToSource)
      return;
    this.updating = true;
    try {
      let owner = this.options.Source;
      for (const segment of this.path.slice(0, -1))
        owner = readProperty(owner, segment);
      if (owner == null || typeof owner !== "object")
        throw new TypeError(
          `Cannot write binding path ${this.options.Path}: parent is missing`
        );
      let value = readProperty(this.target, this.targetProperty);
      if (this.options.Converter) {
        if (!this.options.Converter.ConvertBack)
          throw new TypeError("A two-way converter must implement ConvertBack");
        value = this.options.Converter.ConvertBack(
          value,
          this.options.ConverterParameter
        );
      }
      owner[this.path[this.path.length - 1]] = value;
    } finally {
      this.updating = false;
    }
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const item of this.sourceSubscriptions) item.Dispose();
    this.sourceSubscriptions = [];
    this.targetSubscription?.Dispose();
    this.targetSubscription = void 0;
  }
}
function BindCommand(target, command, parameter, onError) {
  const getParameter = () => typeof parameter === "function" ? parameter() : parameter;
  const refresh = () => {
    target.disabled = !command.CanExecute(getParameter());
  };
  const handleError = (error) => {
    if (onError) onError(error);
    else if (typeof CustomEvent !== "undefined")
      target.dispatchEvent(
        new CustomEvent("commanderror", {
          detail: { error },
          bubbles: true,
          composed: true
        })
      );
    else
      queueMicrotask(() => {
        throw error;
      });
  };
  const listener = () => {
    try {
      const value = getParameter();
      if (!command.CanExecute(value)) return;
      const result = command.Execute(value);
      if (result && typeof result.then === "function")
        void Promise.resolve(result).catch(handleError);
    } catch (error) {
      handleError(error);
    }
  };
  target.addEventListener("click", listener);
  const subscription = command.CanExecuteChanged.Subscribe(refresh);
  refresh();
  return new Subscription(() => {
    target.removeEventListener("click", listener);
    subscription.Dispose();
  });
}
//# sourceMappingURL=mvvm.js.map
