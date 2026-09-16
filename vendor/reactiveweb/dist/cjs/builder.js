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
var builder_exports = {};
__export(builder_exports, {
  DefaultRxAppBuilder: () => DefaultRxAppBuilder,
  ReactiveApplication: () => ReactiveApplication,
  ReactiveUIBuilder: () => RxAppBuilder,
  ReactiveWebBuilder: () => RxAppBuilder,
  RxAppBuilder: () => RxAppBuilder,
  RxSchedulers: () => RxSchedulers,
  RxState: () => RxState,
  RxSuspension: () => RxSuspension
});
module.exports = __toCommonJS(builder_exports);
var import_disposables = require("./disposables.js");
var import_rx_app = require("./rx-app.js");
var import_services = require("./services.js");
var import_persistence = require("./persistence.js");
var import_converters = require("./converters.js");
var import_providers = require("./providers.js");
class RxSchedulers {
  static get MainThreadScheduler() {
    return import_rx_app.RxApp.MainThreadScheduler;
  }
  static set MainThreadScheduler(value) {
    import_rx_app.RxApp.MainThreadScheduler = value;
  }
  static get TaskpoolScheduler() {
    return import_rx_app.RxApp.TaskpoolScheduler;
  }
  static set TaskpoolScheduler(value) {
    import_rx_app.RxApp.TaskpoolScheduler = value;
  }
}
class RxState {
  static get DefaultExceptionHandler() {
    return import_rx_app.RxApp.DefaultExceptionHandler;
  }
  static set DefaultExceptionHandler(value) {
    import_rx_app.RxApp.DefaultExceptionHandler = value;
  }
  static get ServiceLocator() {
    return import_services.Locator.Current;
  }
  static get MessageBus() {
    return import_services.MessageBus.Current;
  }
  static HandleException(error) {
    import_rx_app.RxApp.HandleException(error);
  }
}
class RxSuspension {
  static SuspensionHost = new import_persistence.SuspensionHost();
}
const globalFrames = [];
function captureGlobals() {
  return { services: import_services.Locator.Current, views: import_services.ViewLocator.Current, messages: import_services.MessageBus.Current, suspension: RxSuspension.SuspensionHost, providers: import_providers.ObservablePropertyProviders.Current, converters: import_converters.ConverterService.Current, main: import_rx_app.RxApp.MainThreadScheduler, task: import_rx_app.RxApp.TaskpoolScheduler, error: import_rx_app.RxApp.DefaultExceptionHandler };
}
function releaseGlobals(frame) {
  frame.active = false;
  while (globalFrames.length && !globalFrames.at(-1).active) {
    const { previous, installed } = globalFrames.pop();
    if (import_services.Locator.Current === installed.services) import_services.Locator.Current = previous.services;
    if (import_services.ViewLocator.Current === installed.views) import_services.ViewLocator.Current = previous.views;
    if (import_services.MessageBus.Current === installed.messages) import_services.MessageBus.Current = previous.messages;
    if (RxSuspension.SuspensionHost === installed.suspension) RxSuspension.SuspensionHost = previous.suspension;
    if (import_providers.ObservablePropertyProviders.Current === installed.providers) import_providers.ObservablePropertyProviders.Current = previous.providers;
    if (import_converters.ConverterService.Current === installed.converters) import_converters.ConverterService.Current = previous.converters;
    if (import_rx_app.RxApp.MainThreadScheduler === installed.main) import_rx_app.RxApp.MainThreadScheduler = previous.main;
    if (import_rx_app.RxApp.TaskpoolScheduler === installed.task) import_rx_app.RxApp.TaskpoolScheduler = previous.task;
    if (import_rx_app.RxApp.DefaultExceptionHandler === installed.error) import_rx_app.RxApp.DefaultExceptionHandler = previous.error;
  }
}
class ReactiveApplication {
  Services;
  Views;
  MessageBus;
  SuspensionHost;
  PropertyProviders;
  Converters;
  MainThreadScheduler;
  TaskpoolScheduler;
  lifetime = new import_disposables.CompositeDisposable();
  constructor(resources) {
    this.Services = resources.services;
    this.Views = resources.views;
    this.MessageBus = resources.messages;
    this.SuspensionHost = resources.suspension;
    this.PropertyProviders = resources.providers;
    this.Converters = resources.converters;
    this.MainThreadScheduler = resources.mainThread;
    this.TaskpoolScheduler = resources.taskpool;
  }
  get IsDisposed() {
    return this.lifetime.IsDisposed;
  }
  AddDisposable(resource) {
    return this.lifetime.Add(resource);
  }
  Dispose() {
    this.lifetime.Dispose();
  }
  unsubscribe() {
    this.Dispose();
  }
}
class RxAppBuilder {
  configure = [];
  onBuild = [];
  schedulerOptions = {};
  mainThread = import_rx_app.RxApp.MainThreadScheduler;
  taskpool = import_rx_app.RxApp.TaskpoolScheduler;
  messageBusFactory = () => new import_services.MessageBus();
  suspensionFactory = () => new import_persistence.SuspensionHost();
  ownsMessageBus = true;
  ownsSuspension = true;
  installGlobals = true;
  built = false;
  static Create() {
    return new RxAppBuilder();
  }
  editable() {
    if (this.built) throw new Error("This application builder has already been built");
  }
  WithMainThreadScheduler(scheduler, setRxApp = true) {
    this.editable();
    this.mainThread = scheduler;
    if (setRxApp) this.schedulerOptions.mainThreadScheduler = scheduler;
    return this;
  }
  WithTaskPoolScheduler(scheduler, setRxApp = true) {
    this.editable();
    this.taskpool = scheduler;
    if (setRxApp) this.schedulerOptions.taskpoolScheduler = scheduler;
    return this;
  }
  WithTaskpoolScheduler(scheduler, setRxApp = true) {
    return this.WithTaskPoolScheduler(scheduler, setRxApp);
  }
  WithExceptionHandler(handler) {
    this.editable();
    this.schedulerOptions.defaultExceptionHandler = handler;
    return this;
  }
  WithDefaultExceptionHandler(handler) {
    return this.WithExceptionHandler(handler);
  }
  /** Local application resources can be built without replacing the global facades. */
  WithGlobalInstallation(enabled) {
    this.editable();
    this.installGlobals = enabled;
    return this;
  }
  WithService(token, factory, options = {}) {
    this.editable();
    const settings = typeof options === "string" ? { contract: options } : options;
    this.configure.push((app) => settings.lifetime === "singleton" ? app.Services.RegisterLazySingleton(factory, token, settings.contract) : app.Services.Register(factory, token, settings.contract));
    return this;
  }
  WithInstance(instance, token, contract) {
    this.editable();
    this.configure.push((app) => app.Services.RegisterConstant(instance, token, contract));
    return this;
  }
  WithServices(configure) {
    this.editable();
    this.configure.push((app) => configure(app.Services));
    return this;
  }
  WithRegistration(configure) {
    return this.WithServices(configure);
  }
  WithRegistrationOnBuild(configure) {
    this.editable();
    this.onBuild.push(configure);
    return this;
  }
  WithViews(configure) {
    this.editable();
    this.configure.push((app) => configure(app.Views));
    return this;
  }
  ConfigureViewLocator(configure) {
    return this.WithViews(configure);
  }
  RegisterView(viewModelType, factory, contract) {
    return this.WithViews((views) => views.Register(viewModelType, factory, contract));
  }
  WithView(viewModelType, factory, contract) {
    return this.RegisterView(viewModelType, factory, contract);
  }
  RegisterSingletonView(viewModelType, factory, contract) {
    return this.WithViews((views) => views.RegisterSingleton(viewModelType, factory, contract));
  }
  RegisterViewModel(type, factory = () => new type(), contract) {
    return this.WithService(type, factory, { contract });
  }
  RegisterSingletonViewModel(type, factory = () => new type(), contract) {
    return this.WithService(type, factory, { contract, lifetime: "singleton" });
  }
  RegisterConstantViewModel(instance, token = instance.constructor, contract) {
    return this.WithInstance(instance, token, contract);
  }
  WithMessageBus(busOrConfigure) {
    this.editable();
    if (busOrConfigure instanceof import_services.MessageBus) {
      this.messageBusFactory = () => busOrConfigure;
      this.ownsMessageBus = false;
    } else {
      this.messageBusFactory = () => new import_services.MessageBus();
      this.ownsMessageBus = true;
      if (busOrConfigure) this.configure.push((app) => busOrConfigure(app.MessageBus));
    }
    return this;
  }
  WithSuspensionHost(hostOrFactory) {
    this.editable();
    if (typeof hostOrFactory === "function") {
      this.suspensionFactory = hostOrFactory;
      this.ownsSuspension = true;
    } else {
      this.suspensionFactory = () => hostOrFactory;
      this.ownsSuspension = false;
    }
    return this;
  }
  WithSuspension(createNewAppState, driver) {
    this.WithSuspensionHost(() => new import_persistence.SuspensionHost(createNewAppState));
    return this.ConfigureSuspensionDriver(driver);
  }
  ConfigureSuspensionDriver(driverOrFactory) {
    this.editable();
    this.configure.push((app) => app.SuspensionHost.SetupDefaultSuspendResume(typeof driverOrFactory === "function" ? driverOrFactory(app) : driverOrFactory));
    return this;
  }
  WithObservableForProperty(provider) {
    this.editable();
    this.configure.push((app) => app.PropertyProviders.Register(provider));
    return this;
  }
  WithConverters(configure) {
    this.editable();
    this.configure.push((app) => configure(app.Converters));
    return this;
  }
  WithConverter(converter) {
    return this.WithConverters((service) => service.TypedConverters.Register(converter));
  }
  WithFallbackConverter(converter) {
    return this.WithConverters((service) => service.FallbackConverters.Register(converter));
  }
  WithSetMethodConverter(converter) {
    return this.WithConverters((service) => service.SetMethodConverters.Register(converter));
  }
  Build() {
    this.editable();
    this.built = true;
    const messages = this.messageBusFactory();
    let suspension;
    try {
      suspension = this.suspensionFactory();
    } catch (error) {
      if (this.ownsMessageBus) messages.Dispose();
      throw error;
    }
    const app = new ReactiveApplication({ services: new import_services.ServiceLocator(), views: new import_services.ViewLocator(), messages, suspension, providers: new import_providers.ObservablePropertyProviderRegistry(), converters: new import_converters.ConverterService(), mainThread: this.mainThread, taskpool: this.taskpool });
    app.AddDisposable(() => app.Services.Clear());
    app.AddDisposable(() => app.Views.Clear());
    app.AddDisposable(() => app.PropertyProviders.Clear());
    app.AddDisposable(() => {
      app.Converters.TypedConverters.Clear();
      app.Converters.FallbackConverters.Clear();
      app.Converters.SetMethodConverters.Clear();
    });
    if (this.ownsMessageBus) app.AddDisposable(app.MessageBus);
    if (this.ownsSuspension) app.AddDisposable(app.SuspensionHost);
    try {
      app.Services.RegisterConstant(app, ReactiveApplication);
      app.Services.RegisterConstant(app.Services, import_services.ServiceLocator);
      app.Services.RegisterConstant(app.Views, import_services.ViewLocator);
      app.Services.RegisterConstant(app.MessageBus, import_services.MessageBus);
      app.Services.RegisterConstant(app.SuspensionHost, import_persistence.SuspensionHost);
      app.Services.RegisterConstant(app.PropertyProviders, import_providers.ObservablePropertyProviderRegistry);
      app.Services.RegisterConstant(app.Converters, import_converters.ConverterService);
      for (const configure of this.configure) {
        const resource = configure(app);
        if (resource) app.AddDisposable(resource);
      }
      if (this.installGlobals) this.install(app);
      for (const configure of this.onBuild) {
        const resource = configure(app);
        if (resource) app.AddDisposable(resource);
      }
      return app;
    } catch (error) {
      try {
        app.Dispose();
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], "Application setup and cleanup failed");
      }
      throw error;
    }
  }
  BuildApp() {
    return this.Build();
  }
  install(app) {
    const previous = captureGlobals();
    import_services.Locator.Current = app.Services;
    import_services.ViewLocator.Current = app.Views;
    import_services.MessageBus.Current = app.MessageBus;
    RxSuspension.SuspensionHost = app.SuspensionHost;
    import_providers.ObservablePropertyProviders.Current = app.PropertyProviders;
    import_converters.ConverterService.Current = app.Converters;
    import_rx_app.RxApp.Configure(this.schedulerOptions);
    const frame = { active: true, previous, installed: captureGlobals() };
    globalFrames.push(frame);
    app.AddDisposable(import_disposables.Disposable.Create(() => releaseGlobals(frame)));
  }
}
class DefaultRxAppBuilder extends RxAppBuilder {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DefaultRxAppBuilder,
  ReactiveApplication,
  ReactiveUIBuilder,
  ReactiveWebBuilder,
  RxAppBuilder,
  RxSchedulers,
  RxState,
  RxSuspension
});
//# sourceMappingURL=builder.js.map
