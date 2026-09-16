import { CompositeDisposable, Disposable } from './disposables.js';
import { RxApp } from './rx-app.js';
import { Locator, MessageBus, ServiceLocator, ViewLocator } from './services.js';
import { SuspensionHost } from './persistence.js';
import { ConverterService } from './converters.js';
import { ObservablePropertyProviders, ObservablePropertyProviderRegistry } from './providers.js';
export class RxSchedulers {
    static get MainThreadScheduler() { return RxApp.MainThreadScheduler; }
    static set MainThreadScheduler(value) { RxApp.MainThreadScheduler = value; }
    static get TaskpoolScheduler() { return RxApp.TaskpoolScheduler; }
    static set TaskpoolScheduler(value) { RxApp.TaskpoolScheduler = value; }
}
export class RxState {
    static get DefaultExceptionHandler() { return RxApp.DefaultExceptionHandler; }
    static set DefaultExceptionHandler(value) { RxApp.DefaultExceptionHandler = value; }
    static get ServiceLocator() { return Locator.Current; }
    static get MessageBus() { return MessageBus.Current; }
    static HandleException(error) { RxApp.HandleException(error); }
}
export class RxSuspension {
    static SuspensionHost = new SuspensionHost();
}
const globalFrames = [];
function captureGlobals() {
    return { services: Locator.Current, views: ViewLocator.Current, messages: MessageBus.Current, suspension: RxSuspension.SuspensionHost, providers: ObservablePropertyProviders.Current, converters: ConverterService.Current, main: RxApp.MainThreadScheduler, task: RxApp.TaskpoolScheduler, error: RxApp.DefaultExceptionHandler };
}
function releaseGlobals(frame) {
    frame.active = false;
    while (globalFrames.length && !globalFrames.at(-1).active) {
        const { previous, installed } = globalFrames.pop();
        if (Locator.Current === installed.services)
            Locator.Current = previous.services;
        if (ViewLocator.Current === installed.views)
            ViewLocator.Current = previous.views;
        if (MessageBus.Current === installed.messages)
            MessageBus.Current = previous.messages;
        if (RxSuspension.SuspensionHost === installed.suspension)
            RxSuspension.SuspensionHost = previous.suspension;
        if (ObservablePropertyProviders.Current === installed.providers)
            ObservablePropertyProviders.Current = previous.providers;
        if (ConverterService.Current === installed.converters)
            ConverterService.Current = previous.converters;
        if (RxApp.MainThreadScheduler === installed.main)
            RxApp.MainThreadScheduler = previous.main;
        if (RxApp.TaskpoolScheduler === installed.task)
            RxApp.TaskpoolScheduler = previous.task;
        if (RxApp.DefaultExceptionHandler === installed.error)
            RxApp.DefaultExceptionHandler = previous.error;
    }
}
/** A built application's registrations and bootstrap subscriptions share a disposable lifetime. */
export class ReactiveApplication {
    Services;
    Views;
    MessageBus;
    SuspensionHost;
    PropertyProviders;
    Converters;
    MainThreadScheduler;
    TaskpoolScheduler;
    lifetime = new CompositeDisposable();
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
    get IsDisposed() { return this.lifetime.IsDisposed; }
    AddDisposable(resource) { return this.lifetime.Add(resource); }
    Dispose() { this.lifetime.Dispose(); }
    unsubscribe() { this.Dispose(); }
}
/** Explicit JS constructors/tokens replace CLR assembly scanning during fluent app setup. */
export class RxAppBuilder {
    configure = [];
    onBuild = [];
    schedulerOptions = {};
    mainThread = RxApp.MainThreadScheduler;
    taskpool = RxApp.TaskpoolScheduler;
    messageBusFactory = () => new MessageBus();
    suspensionFactory = () => new SuspensionHost();
    ownsMessageBus = true;
    ownsSuspension = true;
    installGlobals = true;
    built = false;
    static Create() { return new RxAppBuilder(); }
    editable() { if (this.built)
        throw new Error('This application builder has already been built'); }
    WithMainThreadScheduler(scheduler, setRxApp = true) {
        this.editable();
        this.mainThread = scheduler;
        if (setRxApp)
            this.schedulerOptions.mainThreadScheduler = scheduler;
        return this;
    }
    WithTaskPoolScheduler(scheduler, setRxApp = true) {
        this.editable();
        this.taskpool = scheduler;
        if (setRxApp)
            this.schedulerOptions.taskpoolScheduler = scheduler;
        return this;
    }
    WithTaskpoolScheduler(scheduler, setRxApp = true) { return this.WithTaskPoolScheduler(scheduler, setRxApp); }
    WithExceptionHandler(handler) {
        this.editable();
        this.schedulerOptions.defaultExceptionHandler = handler;
        return this;
    }
    WithDefaultExceptionHandler(handler) { return this.WithExceptionHandler(handler); }
    /** Local application resources can be built without replacing the global facades. */
    WithGlobalInstallation(enabled) { this.editable(); this.installGlobals = enabled; return this; }
    WithService(token, factory, options = {}) {
        this.editable();
        const settings = typeof options === 'string' ? { contract: options } : options;
        this.configure.push(app => settings.lifetime === 'singleton'
            ? app.Services.RegisterLazySingleton(factory, token, settings.contract)
            : app.Services.Register(factory, token, settings.contract));
        return this;
    }
    WithInstance(instance, token, contract) {
        this.editable();
        this.configure.push(app => app.Services.RegisterConstant(instance, token, contract));
        return this;
    }
    WithServices(configure) {
        this.editable();
        this.configure.push(app => configure(app.Services));
        return this;
    }
    WithRegistration(configure) { return this.WithServices(configure); }
    WithRegistrationOnBuild(configure) { this.editable(); this.onBuild.push(configure); return this; }
    WithViews(configure) {
        this.editable();
        this.configure.push(app => configure(app.Views));
        return this;
    }
    ConfigureViewLocator(configure) { return this.WithViews(configure); }
    RegisterView(viewModelType, factory, contract) {
        return this.WithViews(views => views.Register(viewModelType, factory, contract));
    }
    WithView(viewModelType, factory, contract) {
        return this.RegisterView(viewModelType, factory, contract);
    }
    RegisterSingletonView(viewModelType, factory, contract) {
        return this.WithViews(views => views.RegisterSingleton(viewModelType, factory, contract));
    }
    RegisterViewModel(type, factory = () => new type(), contract) {
        return this.WithService(type, factory, { contract });
    }
    RegisterSingletonViewModel(type, factory = () => new type(), contract) {
        return this.WithService(type, factory, { contract, lifetime: 'singleton' });
    }
    RegisterConstantViewModel(instance, token = instance.constructor, contract) {
        return this.WithInstance(instance, token, contract);
    }
    WithMessageBus(busOrConfigure) {
        this.editable();
        if (busOrConfigure instanceof MessageBus) {
            this.messageBusFactory = () => busOrConfigure;
            this.ownsMessageBus = false;
        }
        else {
            this.messageBusFactory = () => new MessageBus();
            this.ownsMessageBus = true;
            if (busOrConfigure)
                this.configure.push(app => busOrConfigure(app.MessageBus));
        }
        return this;
    }
    WithSuspensionHost(hostOrFactory) {
        this.editable();
        if (typeof hostOrFactory === 'function') {
            this.suspensionFactory = hostOrFactory;
            this.ownsSuspension = true;
        }
        else {
            this.suspensionFactory = () => hostOrFactory;
            this.ownsSuspension = false;
        }
        return this;
    }
    WithSuspension(createNewAppState, driver) {
        this.WithSuspensionHost(() => new SuspensionHost(createNewAppState));
        return this.ConfigureSuspensionDriver(driver);
    }
    ConfigureSuspensionDriver(driverOrFactory) {
        this.editable();
        this.configure.push(app => app.SuspensionHost.SetupDefaultSuspendResume(typeof driverOrFactory === 'function' ? driverOrFactory(app) : driverOrFactory));
        return this;
    }
    WithObservableForProperty(provider) {
        this.editable();
        this.configure.push(app => app.PropertyProviders.Register(provider));
        return this;
    }
    WithConverters(configure) {
        this.editable();
        this.configure.push(app => configure(app.Converters));
        return this;
    }
    WithConverter(converter) { return this.WithConverters(service => service.TypedConverters.Register(converter)); }
    WithFallbackConverter(converter) { return this.WithConverters(service => service.FallbackConverters.Register(converter)); }
    WithSetMethodConverter(converter) { return this.WithConverters(service => service.SetMethodConverters.Register(converter)); }
    Build() {
        this.editable();
        this.built = true;
        const messages = this.messageBusFactory();
        let suspension;
        try {
            suspension = this.suspensionFactory();
        }
        catch (error) {
            if (this.ownsMessageBus)
                messages.Dispose();
            throw error;
        }
        const app = new ReactiveApplication({ services: new ServiceLocator(), views: new ViewLocator(), messages, suspension, providers: new ObservablePropertyProviderRegistry(), converters: new ConverterService(), mainThread: this.mainThread, taskpool: this.taskpool });
        // Add owned object cleanup first; bootstrap registrations are individually removable too.
        app.AddDisposable(() => app.Services.Clear());
        app.AddDisposable(() => app.Views.Clear());
        app.AddDisposable(() => app.PropertyProviders.Clear());
        app.AddDisposable(() => { app.Converters.TypedConverters.Clear(); app.Converters.FallbackConverters.Clear(); app.Converters.SetMethodConverters.Clear(); });
        if (this.ownsMessageBus)
            app.AddDisposable(app.MessageBus);
        if (this.ownsSuspension)
            app.AddDisposable(app.SuspensionHost);
        try {
            app.Services.RegisterConstant(app, ReactiveApplication);
            app.Services.RegisterConstant(app.Services, ServiceLocator);
            app.Services.RegisterConstant(app.Views, ViewLocator);
            app.Services.RegisterConstant(app.MessageBus, MessageBus);
            app.Services.RegisterConstant(app.SuspensionHost, SuspensionHost);
            app.Services.RegisterConstant(app.PropertyProviders, ObservablePropertyProviderRegistry);
            app.Services.RegisterConstant(app.Converters, ConverterService);
            for (const configure of this.configure) {
                const resource = configure(app);
                if (resource)
                    app.AddDisposable(resource);
            }
            if (this.installGlobals)
                this.install(app);
            for (const configure of this.onBuild) {
                const resource = configure(app);
                if (resource)
                    app.AddDisposable(resource);
            }
            return app;
        }
        catch (error) {
            try {
                app.Dispose();
            }
            catch (cleanupError) {
                throw new AggregateError([error, cleanupError], 'Application setup and cleanup failed');
            }
            throw error;
        }
    }
    BuildApp() { return this.Build(); }
    install(app) {
        const previous = captureGlobals();
        Locator.Current = app.Services;
        ViewLocator.Current = app.Views;
        MessageBus.Current = app.MessageBus;
        RxSuspension.SuspensionHost = app.SuspensionHost;
        ObservablePropertyProviders.Current = app.PropertyProviders;
        ConverterService.Current = app.Converters;
        RxApp.Configure(this.schedulerOptions);
        const frame = { active: true, previous, installed: captureGlobals() };
        globalFrames.push(frame);
        app.AddDisposable(Disposable.Create(() => releaseGlobals(frame)));
    }
}
export class DefaultRxAppBuilder extends RxAppBuilder {
}
export { RxAppBuilder as ReactiveWebBuilder, RxAppBuilder as ReactiveUIBuilder };
//# sourceMappingURL=builder.js.map