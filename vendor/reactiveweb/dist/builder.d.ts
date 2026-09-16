import { type SchedulerLike } from 'rxjs';
import { type DisposableLike, type IDisposable } from './disposables.js';
import { type RxAppOptions } from './rx-app.js';
import { MessageBus, ServiceLocator, ViewLocator, type ServiceToken, type ViewFactory } from './services.js';
import { SuspensionHost, type ISuspensionDriver } from './persistence.js';
import { ConverterService, type IBindingTypeConverter, type IBindingFallbackConverter, type ISetMethodBindingConverter } from './converters.js';
import { ObservablePropertyProviderRegistry, type IObservableForProperty } from './providers.js';
export declare class RxSchedulers {
    static get MainThreadScheduler(): SchedulerLike;
    static set MainThreadScheduler(value: SchedulerLike);
    static get TaskpoolScheduler(): SchedulerLike;
    static set TaskpoolScheduler(value: SchedulerLike);
}
export declare class RxState {
    static get DefaultExceptionHandler(): NonNullable<RxAppOptions['defaultExceptionHandler']>;
    static set DefaultExceptionHandler(value: NonNullable<RxAppOptions['defaultExceptionHandler']>);
    static get ServiceLocator(): ServiceLocator;
    static get MessageBus(): MessageBus;
    static HandleException(error: unknown): void;
}
export declare class RxSuspension {
    static SuspensionHost: SuspensionHost<any>;
}
export interface ServiceRegistrationOptions {
    contract?: string;
    lifetime?: 'transient' | 'singleton';
}
type AppConfiguration = (app: ReactiveApplication) => void | DisposableLike;
interface AppResources {
    services: ServiceLocator;
    views: ViewLocator;
    messages: MessageBus;
    suspension: SuspensionHost<any>;
    providers: ObservablePropertyProviderRegistry;
    converters: ConverterService;
    mainThread: SchedulerLike;
    taskpool: SchedulerLike;
}
/** A built application's registrations and bootstrap subscriptions share a disposable lifetime. */
export declare class ReactiveApplication implements IDisposable {
    readonly Services: ServiceLocator;
    readonly Views: ViewLocator;
    readonly MessageBus: MessageBus;
    readonly SuspensionHost: SuspensionHost<any>;
    readonly PropertyProviders: ObservablePropertyProviderRegistry;
    readonly Converters: ConverterService;
    readonly MainThreadScheduler: SchedulerLike;
    readonly TaskpoolScheduler: SchedulerLike;
    private readonly lifetime;
    constructor(resources: AppResources);
    get IsDisposed(): boolean;
    AddDisposable<T extends DisposableLike>(resource: T): T;
    Dispose(): void;
    unsubscribe(): void;
}
/** Explicit JS constructors/tokens replace CLR assembly scanning during fluent app setup. */
export declare class RxAppBuilder {
    private readonly configure;
    private readonly onBuild;
    private readonly schedulerOptions;
    private mainThread;
    private taskpool;
    private messageBusFactory;
    private suspensionFactory;
    private ownsMessageBus;
    private ownsSuspension;
    private installGlobals;
    private built;
    static Create(): RxAppBuilder;
    private editable;
    WithMainThreadScheduler(scheduler: SchedulerLike, setRxApp?: boolean): this;
    WithTaskPoolScheduler(scheduler: SchedulerLike, setRxApp?: boolean): this;
    WithTaskpoolScheduler(scheduler: SchedulerLike, setRxApp?: boolean): this;
    WithExceptionHandler(handler: NonNullable<RxAppOptions['defaultExceptionHandler']>): this;
    WithDefaultExceptionHandler(handler: NonNullable<RxAppOptions['defaultExceptionHandler']>): this;
    /** Local application resources can be built without replacing the global facades. */
    WithGlobalInstallation(enabled: boolean): this;
    WithService<T>(token: ServiceToken<T>, factory: () => T, options?: ServiceRegistrationOptions | string): this;
    WithInstance<T>(instance: T, token: ServiceToken<T>, contract?: string): this;
    WithServices(configure: (services: ServiceLocator) => void | DisposableLike): this;
    WithRegistration(configure: (services: ServiceLocator) => void | DisposableLike): this;
    WithRegistrationOnBuild(configure: AppConfiguration): this;
    WithViews(configure: (views: ViewLocator) => void | DisposableLike): this;
    ConfigureViewLocator(configure: (views: ViewLocator) => void | DisposableLike): this;
    RegisterView<TViewModel, TView>(viewModelType: abstract new (...args: any[]) => TViewModel, factory: ViewFactory<TViewModel, TView>, contract?: string): this;
    WithView<TViewModel, TView>(viewModelType: abstract new (...args: any[]) => TViewModel, factory: ViewFactory<TViewModel, TView>, contract?: string): this;
    RegisterSingletonView<TViewModel, TView>(viewModelType: abstract new (...args: any[]) => TViewModel, factory: ViewFactory<TViewModel, TView>, contract?: string): this;
    RegisterViewModel<T>(type: new (...args: any[]) => T, factory?: () => T, contract?: string): this;
    RegisterSingletonViewModel<T>(type: new (...args: any[]) => T, factory?: () => T, contract?: string): this;
    RegisterConstantViewModel<T extends object>(instance: T, token?: ServiceToken<T>, contract?: string): this;
    WithMessageBus(busOrConfigure?: MessageBus | ((bus: MessageBus) => void | DisposableLike)): this;
    WithSuspensionHost<T>(hostOrFactory: SuspensionHost<T> | (() => SuspensionHost<T>)): this;
    WithSuspension<T>(createNewAppState: () => T, driver: ISuspensionDriver<T>): this;
    ConfigureSuspensionDriver<T>(driverOrFactory: ISuspensionDriver<T> | ((app: ReactiveApplication) => ISuspensionDriver<T>)): this;
    WithObservableForProperty(provider: IObservableForProperty): this;
    WithConverters(configure: (converters: ConverterService) => void | DisposableLike): this;
    WithConverter(converter: IBindingTypeConverter<any, any>): this;
    WithFallbackConverter(converter: IBindingFallbackConverter): this;
    WithSetMethodConverter(converter: ISetMethodBindingConverter): this;
    Build(): ReactiveApplication;
    BuildApp(): ReactiveApplication;
    private install;
}
export declare class DefaultRxAppBuilder extends RxAppBuilder {
}
export { RxAppBuilder as ReactiveWebBuilder, RxAppBuilder as ReactiveUIBuilder };
//# sourceMappingURL=builder.d.ts.map