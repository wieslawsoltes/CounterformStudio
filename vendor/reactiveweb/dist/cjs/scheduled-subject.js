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
var scheduled_subject_exports = {};
__export(scheduled_subject_exports, {
  ScheduledSubject: () => ScheduledSubject,
  WaitForDispatcherScheduler: () => WaitForDispatcherScheduler
});
module.exports = __toCommonJS(scheduled_subject_exports);
var import_rxjs = require("rxjs");
var import_rx_app = require("./rx-app.js");
class ScheduledSubject extends import_rxjs.Observable {
  constructor(scheduler = import_rx_app.RxApp.MainThreadScheduler, defaultObserver, defaultSubject) {
    super((subscriber) => this.subscribeObserver(subscriber));
    this.scheduler = scheduler;
    this.defaultObserver = defaultObserver;
    this.backing = defaultSubject ?? new import_rxjs.Subject();
    this.attachDefaultObserver();
  }
  scheduler;
  defaultObserver;
  backing;
  subscriptions = new import_rxjs.Subscription();
  fallbackSubscription;
  observerCount = 0;
  disposed = false;
  terminal = false;
  subscribeObserver(observer) {
    if (this.IsDisposed) {
      observer.error(new Error("ScheduledSubject has been disposed."));
      return;
    }
    this.fallbackSubscription?.unsubscribe();
    this.fallbackSubscription = void 0;
    this.observerCount++;
    observer.add(() => {
      this.observerCount--;
      if (this.observerCount === 0) this.attachDefaultObserver();
    });
    this.subscriptions.add(observer);
    return this.backing.pipe((0, import_rxjs.observeOn)(this.scheduler)).subscribe(observer);
  }
  attachDefaultObserver() {
    if (this.IsDisposed || this.terminal || this.backing.isStopped || !this.defaultObserver || this.observerCount) return;
    const observer = typeof this.defaultObserver === "function" ? { next: this.defaultObserver } : this.defaultObserver;
    this.fallbackSubscription = this.backing.pipe((0, import_rxjs.observeOn)(this.scheduler)).subscribe({
      next: (value) => observer.next?.(value),
      error: (error) => observer.error ? observer.error(error) : import_rx_app.RxApp.HandleException(error),
      complete: () => observer.complete?.()
    });
  }
  get HasObservers() {
    return !this.IsDisposed && this.backing.observed;
  }
  get ObserverCount() {
    return this.observerCount;
  }
  get IsDisposed() {
    return this.disposed || this.backing.closed;
  }
  get closed() {
    return this.IsDisposed;
  }
  get observed() {
    return this.HasObservers;
  }
  OnNext(value) {
    this.next(value);
  }
  OnError(error) {
    this.error(error);
  }
  OnCompleted() {
    this.complete();
  }
  next(value) {
    if (this.IsDisposed) throw new Error("ScheduledSubject has been disposed.");
    this.backing.next(value);
  }
  error(error) {
    if (this.IsDisposed) throw new Error("ScheduledSubject has been disposed.");
    this.terminal = true;
    this.backing.error(error);
  }
  complete() {
    if (this.IsDisposed) throw new Error("ScheduledSubject has been disposed.");
    this.terminal = true;
    this.backing.complete();
  }
  Subscribe(observer) {
    const subscription = this.subscribe(observer);
    return Object.assign(subscription, { Dispose() {
      subscription.unsubscribe();
    } });
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.fallbackSubscription?.unsubscribe();
    this.subscriptions.unsubscribe();
    this.backing.unsubscribe();
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
class WaitForDispatcherScheduler {
  constructor(provider = () => import_rx_app.RxApp.MainThreadScheduler, options = {}) {
    this.provider = provider;
    if (typeof provider !== "function") throw new TypeError("A scheduler provider is required.");
    this.fallback = options.fallbackScheduler ?? import_rxjs.queueScheduler;
    this.retryScheduler = options.retryScheduler ?? import_rxjs.asyncScheduler;
    this.retryDelay = options.retryDelay ?? 16;
    if (!Number.isFinite(this.retryDelay) || this.retryDelay <= 0) throw new RangeError("retryDelay must be positive.");
    this.wait = options.waitForDispatcher ?? false;
    this.resolve();
  }
  provider;
  dispatcher;
  pending = new import_rxjs.Subscription();
  disposed = false;
  lastError;
  fallback;
  retryScheduler;
  retryDelay;
  wait;
  resolve() {
    if (this.disposed) return void 0;
    if (this.dispatcher) return this.dispatcher;
    try {
      const scheduler = this.provider();
      if (scheduler != null) {
        if (scheduler === this || typeof scheduler.schedule !== "function" || typeof scheduler.now !== "function") {
          throw new TypeError("The dispatcher provider must return another SchedulerLike.");
        }
        this.dispatcher = scheduler;
        this.lastError = void 0;
      }
    } catch (error) {
      this.lastError = error;
    }
    return this.dispatcher;
  }
  now() {
    return (this.resolve() ?? this.fallback).now();
  }
  get Now() {
    return this.now();
  }
  get IsReady() {
    return this.dispatcher !== void 0;
  }
  get IsDisposed() {
    return this.disposed;
  }
  get LastProviderError() {
    return this.lastError;
  }
  schedule(work, delay = 0, state) {
    if (this.disposed) throw new Error("WaitForDispatcherScheduler has been disposed.");
    const scheduler = this;
    let current;
    const action = new import_rxjs.Subscription(() => current?.unsubscribe());
    action.schedule = (nextState, nextDelay = 0) => {
      if (action.closed || scheduler.disposed) return action;
      scheduler.pending.add(action);
      current?.unsubscribe();
      const cycle = new import_rxjs.Subscription();
      current = cycle;
      const deadline = scheduler.retryScheduler.now() + Math.max(0, nextDelay);
      const attempt = () => {
        if (action.closed || cycle.closed) return;
        const dispatcher = scheduler.resolve() ?? (scheduler.wait ? void 0 : scheduler.fallback);
        if (dispatcher) {
          const remaining = Math.max(0, deadline - scheduler.retryScheduler.now());
          cycle.add(dispatcher.schedule(() => {
            if (action.closed || cycle.closed) return;
            try {
              work.call(action, nextState);
            } catch (error) {
              action.unsubscribe();
              throw error;
            } finally {
              if (current === cycle) {
                cycle.unsubscribe();
                scheduler.pending.remove(action);
              }
            }
          }, remaining));
        } else {
          cycle.add(scheduler.retryScheduler.schedule(function() {
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
    return Object.assign(subscription, { Dispose() {
      subscription.unsubscribe();
    } });
  }
  Dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.pending.unsubscribe();
    }
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ScheduledSubject,
  WaitForDispatcherScheduler
});
//# sourceMappingURL=scheduled-subject.js.map
