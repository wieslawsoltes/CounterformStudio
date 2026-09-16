import { Observable, type SchedulerLike } from 'rxjs';
import { type IDisposable } from './disposables.js';
export type ServiceToken<T = unknown> = string | symbol | (abstract new (...args: any[]) => T);
/** Explicit tokens replace erased CLR generic type information. Last registration wins. */
export declare class ServiceLocator {
    private readonly registrations;
    Register<T>(factory: () => T, serviceType: ServiceToken<T>, contract?: string): IDisposable;
    RegisterConstant<T>(value: T, serviceType: ServiceToken<T>, contract?: string): IDisposable;
    RegisterLazySingleton<T>(factory: () => T, serviceType: ServiceToken<T>, contract?: string): IDisposable;
    private registerRecord;
    private prune;
    private resolveRegistration;
    GetService<T>(serviceType: ServiceToken<T>, contract?: string): T | undefined;
    GetRequiredService<T>(serviceType: ServiceToken<T>, contract?: string): T;
    GetServices<T>(serviceType: ServiceToken<T>, contract?: string): readonly T[];
    HasRegistration(serviceType: ServiceToken<any>, contract?: string): boolean;
    UnregisterCurrent(serviceType: ServiceToken<any>, contract?: string): void;
    UnregisterAll(serviceType: ServiceToken<any>, contract?: string): void;
    Clear(): void;
    register<T>(token: ServiceToken<T>, factory: () => T, contract?: string): IDisposable;
    resolve<T>(token: ServiceToken<T>, contract?: string): T | undefined;
}
export declare class Locator {
    static Current: ServiceLocator;
    static get CurrentMutable(): ServiceLocator;
}
export type ViewFactory<TViewModel = any, TView = any> = (viewModel: TViewModel) => TView;
/** View factories support DOM nodes, IViewFor wrappers, and framework components. */
export declare class ViewLocator {
    static Current: ViewLocator;
    private readonly views;
    private readonly singletonViews;
    private readonly singletonRegistrations;
    Register<TViewModel, TView>(type: abstract new (...args: any[]) => TViewModel, factory: ViewFactory<TViewModel, TView>, contract?: string): IDisposable;
    RegisterSingleton<TViewModel, TView>(type: abstract new (...args: any[]) => TViewModel, factory: ViewFactory<TViewModel, TView>, contract?: string): IDisposable;
    IsSingletonView(view: unknown): boolean;
    ResolveView<TView = any>(viewModel: unknown, contract?: string): TView | undefined;
    Clear(): void;
}
/** In-process typed message channels. A source failure does not poison the channel. */
export declare class MessageBus implements IDisposable {
    static Current: MessageBus;
    private readonly channels;
    private readonly schedulers;
    private readonly sources;
    private readonly errors;
    private disposed;
    get ThrownExceptions(): Observable<unknown>;
    private channel;
    private schedule;
    Listen<T>(messageType: ServiceToken<T>, contract?: string): Observable<T>;
    ListenIncludeLatest<T>(messageType: ServiceToken<T>, contract?: string): Observable<T>;
    SendMessage<T>(message: T, messageType: ServiceToken<T>, contract?: string): void;
    RegisterMessageSource<T>(source: Observable<T>, messageType: ServiceToken<T>, contract?: string): IDisposable;
    RegisterScheduler<T>(scheduler: SchedulerLike, messageType: ServiceToken<T>, contract?: string): void;
    IsRegistered(messageType: ServiceToken<any>, contract?: string): boolean;
    Dispose(): void;
    unsubscribe(): void;
}
//# sourceMappingURL=services.d.ts.map