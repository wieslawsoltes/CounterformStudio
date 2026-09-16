import { ReplaySubject, Subject, Subscription, observeOn } from 'rxjs';
import { Disposable } from './disposables.js';
/** Explicit tokens replace erased CLR generic type information. Last registration wins. */
export class ServiceLocator {
    registrations = new Map();
    Register(factory, serviceType, contract) {
        if (typeof factory !== 'function')
            throw new TypeError('A service factory is required');
        return this.registerRecord(serviceType, contract, { factory, singleton: false, created: false, resolving: false });
    }
    RegisterConstant(value, serviceType, contract) {
        return this.registerRecord(serviceType, contract, { factory: () => value, singleton: true, created: true, resolving: false, value });
    }
    RegisterLazySingleton(factory, serviceType, contract) {
        return this.registerRecord(serviceType, contract, { factory, singleton: true, created: false, resolving: false });
    }
    registerRecord(token, contract, registration) {
        if (token === undefined || token === null)
            throw new TypeError('An explicit service token is required');
        let contracts = this.registrations.get(token);
        if (!contracts)
            this.registrations.set(token, contracts = new Map());
        let records = contracts.get(contract ?? '');
        if (!records)
            contracts.set(contract ?? '', records = []);
        records.push(registration);
        return Disposable.Create(() => {
            const current = this.registrations.get(token)?.get(contract ?? '');
            const index = current?.indexOf(registration) ?? -1;
            if (index >= 0)
                current.splice(index, 1);
            this.prune(token, contract);
        });
    }
    prune(token, contract) {
        const contracts = this.registrations.get(token);
        if (contracts?.get(contract ?? '')?.length === 0)
            contracts.delete(contract ?? '');
        if (contracts?.size === 0)
            this.registrations.delete(token);
    }
    resolveRegistration(record) {
        if (record.singleton && record.created)
            return record.value;
        if (record.resolving)
            throw new Error('Circular service dependency detected');
        record.resolving = true;
        try {
            const value = record.factory();
            if (record.singleton) {
                record.value = value;
                record.created = true;
            }
            return value;
        }
        finally {
            record.resolving = false;
        }
    }
    GetService(serviceType, contract) {
        const record = this.registrations.get(serviceType)?.get(contract ?? '')?.at(-1);
        return record ? this.resolveRegistration(record) : undefined;
    }
    GetRequiredService(serviceType, contract) {
        if (!this.HasRegistration(serviceType, contract))
            throw new Error(`Service is not registered: ${String(serviceType)}${contract ? ` (${contract})` : ''}`);
        return this.GetService(serviceType, contract);
    }
    GetServices(serviceType, contract) {
        return (this.registrations.get(serviceType)?.get(contract ?? '') ?? []).map(record => this.resolveRegistration(record));
    }
    HasRegistration(serviceType, contract) {
        return (this.registrations.get(serviceType)?.get(contract ?? '')?.length ?? 0) > 0;
    }
    UnregisterCurrent(serviceType, contract) {
        this.registrations.get(serviceType)?.get(contract ?? '')?.pop();
        this.prune(serviceType, contract);
    }
    UnregisterAll(serviceType, contract) {
        this.registrations.get(serviceType)?.delete(contract ?? '');
        this.prune(serviceType, contract);
    }
    Clear() { this.registrations.clear(); }
    register(token, factory, contract) { return this.Register(factory, token, contract); }
    resolve(token, contract) { return this.GetService(token, contract); }
}
export class Locator {
    static Current = new ServiceLocator();
    static get CurrentMutable() { return this.Current; }
}
/** View factories support DOM nodes, IViewFor wrappers, and framework components. */
export class ViewLocator {
    static Current = new ViewLocator();
    views = new Map();
    singletonViews = new WeakMap();
    singletonRegistrations = new Set();
    Register(type, factory, contract) {
        let contracts = this.views.get(type);
        if (!contracts)
            this.views.set(type, contracts = new Map());
        let factories = contracts.get(contract ?? '');
        if (!factories)
            contracts.set(contract ?? '', factories = []);
        factories.push(factory);
        return Disposable.Create(() => {
            const index = factories.indexOf(factory);
            if (index >= 0)
                factories.splice(index, 1);
            if (!factories.length)
                contracts.delete(contract ?? '');
            if (!contracts.size)
                this.views.delete(type);
        });
    }
    RegisterSingleton(type, factory, contract) {
        let created = false, view;
        const factoryRegistration = this.Register(type, vm => {
            if (!created) {
                view = factory(vm);
                created = true;
                if (view !== null && (typeof view === 'object' || typeof view === 'function')) {
                    const object = view;
                    this.singletonViews.set(object, (this.singletonViews.get(object) ?? 0) + 1);
                }
            }
            return view;
        }, contract);
        const registration = Disposable.Create(() => {
            this.singletonRegistrations.delete(registration);
            factoryRegistration.Dispose();
            if (created && view !== null && (typeof view === 'object' || typeof view === 'function')) {
                const object = view, remaining = (this.singletonViews.get(object) ?? 1) - 1;
                if (remaining > 0)
                    this.singletonViews.set(object, remaining);
                else {
                    this.singletonViews.delete(object);
                    const disposable = view;
                    if (typeof disposable.Dispose === 'function')
                        disposable.Dispose();
                    else if (typeof disposable.unsubscribe === 'function')
                        disposable.unsubscribe();
                    else if (typeof disposable.dispose === 'function')
                        disposable.dispose();
                }
            }
        });
        this.singletonRegistrations.add(registration);
        return registration;
    }
    IsSingletonView(view) {
        return view !== null && (typeof view === 'object' || typeof view === 'function') && (this.singletonViews.get(view) ?? 0) > 0;
    }
    ResolveView(viewModel, contract) {
        if (viewModel === null || viewModel === undefined)
            return undefined;
        let prototype = Object.getPrototypeOf(viewModel);
        while (prototype) {
            const factory = this.views.get(prototype.constructor)?.get(contract ?? '')?.at(-1);
            if (factory)
                return factory(viewModel);
            prototype = Object.getPrototypeOf(prototype);
        }
        return undefined;
    }
    Clear() {
        const errors = [];
        for (const registration of [...this.singletonRegistrations]) {
            try {
                registration.Dispose();
            }
            catch (error) {
                errors.push(error);
            }
        }
        this.views.clear();
        if (errors.length)
            throw new AggregateError(errors, 'Singleton view disposal failed');
    }
}
/** In-process typed message channels. A source failure does not poison the channel. */
export class MessageBus {
    static Current = new MessageBus();
    channels = new Map();
    schedulers = new Map();
    sources = new Subscription();
    errors = new Subject();
    disposed = false;
    get ThrownExceptions() { return this.errors.asObservable(); }
    channel(token, contract) {
        if (this.disposed)
            throw new Error('Message bus is disposed');
        if (token === undefined || token === null)
            throw new TypeError('An explicit message token is required');
        let contracts = this.channels.get(token);
        if (!contracts)
            this.channels.set(token, contracts = new Map());
        let channel = contracts.get(contract ?? '');
        if (!channel)
            contracts.set(contract ?? '', channel = { live: new Subject(), latest: new ReplaySubject(1) });
        return channel;
    }
    schedule(stream, token, contract) {
        const scheduler = this.schedulers.get(token)?.get(contract ?? '');
        return scheduler ? stream.pipe(observeOn(scheduler)) : stream;
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
        const subscription = source.subscribe({ next: value => this.SendMessage(value, messageType, contract), error: error => this.errors.next(error) });
        this.sources.add(subscription);
        return Disposable.Create(() => { subscription.unsubscribe(); this.sources.remove(subscription); });
    }
    RegisterScheduler(scheduler, messageType, contract) {
        let contracts = this.schedulers.get(messageType);
        if (!contracts)
            this.schedulers.set(messageType, contracts = new Map());
        contracts.set(contract ?? '', scheduler);
    }
    IsRegistered(messageType, contract) { return this.channels.get(messageType)?.has(contract ?? '') ?? false; }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.sources.unsubscribe();
        for (const contracts of this.channels.values())
            for (const channel of contracts.values()) {
                channel.live.complete();
                channel.latest.complete();
            }
        this.channels.clear();
        this.schedulers.clear();
        this.errors.complete();
    }
    unsubscribe() { this.Dispose(); }
}
//# sourceMappingURL=services.js.map