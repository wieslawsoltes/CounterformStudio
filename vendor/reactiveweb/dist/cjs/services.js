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
var services_exports = {};
__export(services_exports, {
  Locator: () => Locator,
  MessageBus: () => MessageBus,
  ServiceLocator: () => ServiceLocator,
  ViewLocator: () => ViewLocator
});
module.exports = __toCommonJS(services_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
class ServiceLocator {
  registrations = /* @__PURE__ */ new Map();
  Register(factory, serviceType, contract) {
    if (typeof factory !== "function") throw new TypeError("A service factory is required");
    return this.registerRecord(serviceType, contract, { factory, singleton: false, created: false, resolving: false });
  }
  RegisterConstant(value, serviceType, contract) {
    return this.registerRecord(serviceType, contract, { factory: () => value, singleton: true, created: true, resolving: false, value });
  }
  RegisterLazySingleton(factory, serviceType, contract) {
    return this.registerRecord(serviceType, contract, { factory, singleton: true, created: false, resolving: false });
  }
  registerRecord(token, contract, registration) {
    if (token === void 0 || token === null) throw new TypeError("An explicit service token is required");
    let contracts = this.registrations.get(token);
    if (!contracts) this.registrations.set(token, contracts = /* @__PURE__ */ new Map());
    let records = contracts.get(contract ?? "");
    if (!records) contracts.set(contract ?? "", records = []);
    records.push(registration);
    return import_disposables.Disposable.Create(() => {
      const current = this.registrations.get(token)?.get(contract ?? "");
      const index = current?.indexOf(registration) ?? -1;
      if (index >= 0) current.splice(index, 1);
      this.prune(token, contract);
    });
  }
  prune(token, contract) {
    const contracts = this.registrations.get(token);
    if (contracts?.get(contract ?? "")?.length === 0) contracts.delete(contract ?? "");
    if (contracts?.size === 0) this.registrations.delete(token);
  }
  resolveRegistration(record) {
    if (record.singleton && record.created) return record.value;
    if (record.resolving) throw new Error("Circular service dependency detected");
    record.resolving = true;
    try {
      const value = record.factory();
      if (record.singleton) {
        record.value = value;
        record.created = true;
      }
      return value;
    } finally {
      record.resolving = false;
    }
  }
  GetService(serviceType, contract) {
    const record = this.registrations.get(serviceType)?.get(contract ?? "")?.at(-1);
    return record ? this.resolveRegistration(record) : void 0;
  }
  GetRequiredService(serviceType, contract) {
    if (!this.HasRegistration(serviceType, contract)) throw new Error(`Service is not registered: ${String(serviceType)}${contract ? ` (${contract})` : ""}`);
    return this.GetService(serviceType, contract);
  }
  GetServices(serviceType, contract) {
    return (this.registrations.get(serviceType)?.get(contract ?? "") ?? []).map((record) => this.resolveRegistration(record));
  }
  HasRegistration(serviceType, contract) {
    return (this.registrations.get(serviceType)?.get(contract ?? "")?.length ?? 0) > 0;
  }
  UnregisterCurrent(serviceType, contract) {
    this.registrations.get(serviceType)?.get(contract ?? "")?.pop();
    this.prune(serviceType, contract);
  }
  UnregisterAll(serviceType, contract) {
    this.registrations.get(serviceType)?.delete(contract ?? "");
    this.prune(serviceType, contract);
  }
  Clear() {
    this.registrations.clear();
  }
  register(token, factory, contract) {
    return this.Register(factory, token, contract);
  }
  resolve(token, contract) {
    return this.GetService(token, contract);
  }
}
class Locator {
  static Current = new ServiceLocator();
  static get CurrentMutable() {
    return this.Current;
  }
}
class ViewLocator {
  static Current = new ViewLocator();
  views = /* @__PURE__ */ new Map();
  singletonViews = /* @__PURE__ */ new WeakMap();
  singletonRegistrations = /* @__PURE__ */ new Set();
  Register(type, factory, contract) {
    let contracts = this.views.get(type);
    if (!contracts) this.views.set(type, contracts = /* @__PURE__ */ new Map());
    let factories = contracts.get(contract ?? "");
    if (!factories) contracts.set(contract ?? "", factories = []);
    factories.push(factory);
    return import_disposables.Disposable.Create(() => {
      const index = factories.indexOf(factory);
      if (index >= 0) factories.splice(index, 1);
      if (!factories.length) contracts.delete(contract ?? "");
      if (!contracts.size) this.views.delete(type);
    });
  }
  RegisterSingleton(type, factory, contract) {
    let created = false, view;
    const factoryRegistration = this.Register(type, (vm) => {
      if (!created) {
        view = factory(vm);
        created = true;
        if (view !== null && (typeof view === "object" || typeof view === "function")) {
          const object = view;
          this.singletonViews.set(object, (this.singletonViews.get(object) ?? 0) + 1);
        }
      }
      return view;
    }, contract);
    const registration = import_disposables.Disposable.Create(() => {
      this.singletonRegistrations.delete(registration);
      factoryRegistration.Dispose();
      if (created && view !== null && (typeof view === "object" || typeof view === "function")) {
        const object = view, remaining = (this.singletonViews.get(object) ?? 1) - 1;
        if (remaining > 0) this.singletonViews.set(object, remaining);
        else {
          this.singletonViews.delete(object);
          const disposable = view;
          if (typeof disposable.Dispose === "function") disposable.Dispose();
          else if (typeof disposable.unsubscribe === "function") disposable.unsubscribe();
          else if (typeof disposable.dispose === "function") disposable.dispose();
        }
      }
    });
    this.singletonRegistrations.add(registration);
    return registration;
  }
  IsSingletonView(view) {
    return view !== null && (typeof view === "object" || typeof view === "function") && (this.singletonViews.get(view) ?? 0) > 0;
  }
  ResolveView(viewModel, contract) {
    if (viewModel === null || viewModel === void 0) return void 0;
    let prototype = Object.getPrototypeOf(viewModel);
    while (prototype) {
      const factory = this.views.get(prototype.constructor)?.get(contract ?? "")?.at(-1);
      if (factory) return factory(viewModel);
      prototype = Object.getPrototypeOf(prototype);
    }
    return void 0;
  }
  Clear() {
    const errors = [];
    for (const registration of [...this.singletonRegistrations]) {
      try {
        registration.Dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    this.views.clear();
    if (errors.length) throw new AggregateError(errors, "Singleton view disposal failed");
  }
}
class MessageBus {
  static Current = new MessageBus();
  channels = /* @__PURE__ */ new Map();
  schedulers = /* @__PURE__ */ new Map();
  sources = new import_rxjs.Subscription();
  errors = new import_rxjs.Subject();
  disposed = false;
  get ThrownExceptions() {
    return this.errors.asObservable();
  }
  channel(token, contract) {
    if (this.disposed) throw new Error("Message bus is disposed");
    if (token === void 0 || token === null) throw new TypeError("An explicit message token is required");
    let contracts = this.channels.get(token);
    if (!contracts) this.channels.set(token, contracts = /* @__PURE__ */ new Map());
    let channel = contracts.get(contract ?? "");
    if (!channel) contracts.set(contract ?? "", channel = { live: new import_rxjs.Subject(), latest: new import_rxjs.ReplaySubject(1) });
    return channel;
  }
  schedule(stream, token, contract) {
    const scheduler = this.schedulers.get(token)?.get(contract ?? "");
    return scheduler ? stream.pipe((0, import_rxjs.observeOn)(scheduler)) : stream;
  }
  Listen(messageType, contract) {
    return this.schedule(this.channel(messageType, contract).live.asObservable(), messageType, contract);
  }
  ListenIncludeLatest(messageType, contract) {
    return this.schedule(this.channel(messageType, contract).latest.asObservable(), messageType, contract);
  }
  SendMessage(message, messageType, contract) {
    const channel = this.channel(messageType, contract);
    channel.latest.next(message);
    channel.live.next(message);
  }
  RegisterMessageSource(source, messageType, contract) {
    this.channel(messageType, contract);
    const subscription = source.subscribe({ next: (value) => this.SendMessage(value, messageType, contract), error: (error) => this.errors.next(error) });
    this.sources.add(subscription);
    return import_disposables.Disposable.Create(() => {
      subscription.unsubscribe();
      this.sources.remove(subscription);
    });
  }
  RegisterScheduler(scheduler, messageType, contract) {
    let contracts = this.schedulers.get(messageType);
    if (!contracts) this.schedulers.set(messageType, contracts = /* @__PURE__ */ new Map());
    contracts.set(contract ?? "", scheduler);
  }
  IsRegistered(messageType, contract) {
    return this.channels.get(messageType)?.has(contract ?? "") ?? false;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.sources.unsubscribe();
    for (const contracts of this.channels.values()) for (const channel of contracts.values()) {
      channel.live.complete();
      channel.latest.complete();
    }
    this.channels.clear();
    this.schedulers.clear();
    this.errors.complete();
  }
  unsubscribe() {
    this.Dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Locator,
  MessageBus,
  ServiceLocator,
  ViewLocator
});
//# sourceMappingURL=services.js.map
