import { Observable, Subject, Subscription, asyncScheduler, observeOn, queueScheduler, } from 'rxjs';
import { RxApp } from './rx-app.js';
/** A subject whose observers receive notifications on a supplied scheduler. */
export class ScheduledSubject extends Observable {
    scheduler;
    defaultObserver;
    backing;
    subscriptions = new Subscription();
    fallbackSubscription;
    observerCount = 0;
    disposed = false;
    terminal = false;
    constructor(scheduler = RxApp.MainThreadScheduler, defaultObserver, defaultSubject) {
        super(subscriber => this.subscribeObserver(subscriber));
        this.scheduler = scheduler;
        this.defaultObserver = defaultObserver;
        this.backing = defaultSubject ?? new Subject();
        this.attachDefaultObserver();
    }
    subscribeObserver(observer) {
        if (this.IsDisposed) {
            observer.error(new Error('ScheduledSubject has been disposed.'));
            return;
        }
        this.fallbackSubscription?.unsubscribe();
        this.fallbackSubscription = undefined;
        this.observerCount++;
        observer.add(() => {
            this.observerCount--;
            if (this.observerCount === 0)
                this.attachDefaultObserver();
        });
        this.subscriptions.add(observer);
        return this.backing.pipe(observeOn(this.scheduler)).subscribe(observer);
    }
    attachDefaultObserver() {
        if (this.IsDisposed || this.terminal || this.backing.isStopped || !this.defaultObserver || this.observerCount)
            return;
        const observer = typeof this.defaultObserver === 'function'
            ? { next: this.defaultObserver }
            : this.defaultObserver;
        this.fallbackSubscription = this.backing.pipe(observeOn(this.scheduler)).subscribe({
            next: value => observer.next?.(value),
            error: error => observer.error ? observer.error(error) : RxApp.HandleException(error),
            complete: () => observer.complete?.(),
        });
    }
    get HasObservers() { return !this.IsDisposed && this.backing.observed; }
    get ObserverCount() { return this.observerCount; }
    get IsDisposed() { return this.disposed || this.backing.closed; }
    get closed() { return this.IsDisposed; }
    get observed() { return this.HasObservers; }
    OnNext(value) { this.next(value); }
    OnError(error) { this.error(error); }
    OnCompleted() { this.complete(); }
    next(value) {
        if (this.IsDisposed)
            throw new Error('ScheduledSubject has been disposed.');
        this.backing.next(value);
    }
    error(error) {
        if (this.IsDisposed)
            throw new Error('ScheduledSubject has been disposed.');
        this.terminal = true;
        this.backing.error(error);
    }
    complete() {
        if (this.IsDisposed)
            throw new Error('ScheduledSubject has been disposed.');
        this.terminal = true;
        this.backing.complete();
    }
    Subscribe(observer) {
        const subscription = this.subscribe(observer);
        return Object.assign(subscription, { Dispose() { subscription.unsubscribe(); } });
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.fallbackSubscription?.unsubscribe();
        this.subscriptions.unsubscribe();
        this.backing.unsubscribe();
    }
    unsubscribe() { this.Dispose(); }
    dispose() { this.Dispose(); }
}
/**
 * Retries a lazily available dispatcher and caches the first successful result.
 * Default behavior matches ReactiveUI: unavailable work runs on the fallback.
 * The web-only wait mode retries through delayed, cancellable scheduler actions.
 */
export class WaitForDispatcherScheduler {
    provider;
    dispatcher;
    pending = new Subscription();
    disposed = false;
    lastError;
    fallback;
    retryScheduler;
    retryDelay;
    wait;
    constructor(provider = () => RxApp.MainThreadScheduler, options = {}) {
        this.provider = provider;
        if (typeof provider !== 'function')
            throw new TypeError('A scheduler provider is required.');
        this.fallback = options.fallbackScheduler ?? queueScheduler;
        this.retryScheduler = options.retryScheduler ?? asyncScheduler;
        this.retryDelay = options.retryDelay ?? 16;
        if (!Number.isFinite(this.retryDelay) || this.retryDelay <= 0)
            throw new RangeError('retryDelay must be positive.');
        this.wait = options.waitForDispatcher ?? false;
        this.resolve();
    }
    resolve() {
        if (this.disposed)
            return undefined;
        if (this.dispatcher)
            return this.dispatcher;
        try {
            const scheduler = this.provider();
            if (scheduler != null) {
                if (scheduler === this || typeof scheduler.schedule !== 'function' || typeof scheduler.now !== 'function') {
                    throw new TypeError('The dispatcher provider must return another SchedulerLike.');
                }
                this.dispatcher = scheduler;
                this.lastError = undefined;
            }
        }
        catch (error) {
            this.lastError = error;
        }
        return this.dispatcher;
    }
    now() { return (this.resolve() ?? this.fallback).now(); }
    get Now() { return this.now(); }
    get IsReady() { return this.dispatcher !== undefined; }
    get IsDisposed() { return this.disposed; }
    get LastProviderError() { return this.lastError; }
    schedule(work, delay = 0, state) {
        if (this.disposed)
            throw new Error('WaitForDispatcherScheduler has been disposed.');
        const scheduler = this;
        let current;
        const action = new Subscription(() => current?.unsubscribe());
        action.schedule = (nextState, nextDelay = 0) => {
            if (action.closed || scheduler.disposed)
                return action;
            scheduler.pending.add(action);
            current?.unsubscribe();
            const cycle = new Subscription();
            current = cycle;
            const deadline = scheduler.retryScheduler.now() + Math.max(0, nextDelay);
            const attempt = () => {
                if (action.closed || cycle.closed)
                    return;
                const dispatcher = scheduler.resolve() ?? (scheduler.wait ? undefined : scheduler.fallback);
                if (dispatcher) {
                    const remaining = Math.max(0, deadline - scheduler.retryScheduler.now());
                    cycle.add(dispatcher.schedule(() => {
                        if (action.closed || cycle.closed)
                            return;
                        try {
                            work.call(action, nextState);
                        }
                        catch (error) {
                            action.unsubscribe();
                            throw error;
                        }
                        finally {
                            // Completed one-shot actions must not accumulate on a long-lived
                            // dispatcher. A recursively rescheduled action owns a new cycle.
                            if (current === cycle) {
                                cycle.unsubscribe();
                                scheduler.pending.remove(action);
                            }
                        }
                    }, remaining));
                }
                else {
                    cycle.add(scheduler.retryScheduler.schedule(function () {
                        attempt();
                        this.unsubscribe();
                    }, scheduler.retryDelay));
                }
            };
            attempt();
            return action;
        };
        action.schedule(state, delay);
        return action;
    }
    Schedule(state, action, delay = 0) {
        const subscription = this.schedule(() => action(this, state), delay);
        return Object.assign(subscription, { Dispose() { subscription.unsubscribe(); } });
    }
    Dispose() { if (!this.disposed) {
        this.disposed = true;
        this.pending.unsubscribe();
    } }
    unsubscribe() { this.Dispose(); }
    dispose() { this.Dispose(); }
}
//# sourceMappingURL=scheduled-subject.js.map