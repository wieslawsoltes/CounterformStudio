"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var persistence_exports = {};
__export(persistence_exports, {
  AttachBrowserLifecycle: () => AttachBrowserLifecycle,
  AutoPersist: () => AutoPersist,
  AutoPersistCollection: () => AutoPersistCollection,
  BrowserSuspensionDriver: () => LocalStorageSuspensionDriver,
  InMemorySuspensionDriver: () => InMemorySuspensionDriver,
  LocalStorageSuspensionDriver: () => LocalStorageSuspensionDriver,
  SetupDefaultSuspendResume: () => SetupDefaultSuspendResume,
  SuspensionHost: () => SuspensionHost
});
module.exports = __toCommonJS(persistence_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
var import_collections = require("./collections.js");
function observableResult(action) {
  return (0, import_rxjs.defer)(() => {
    const value = action();
    return (0, import_rxjs.isObservable)(value) ? value : value && typeof value.then === "function" ? (0, import_rxjs.from)(value) : (0, import_rxjs.of)(value);
  });
}
function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
class InMemorySuspensionDriver {
  state = null;
  LoadState() {
    return this.state === null ? null : clone(this.state);
  }
  SaveState(state) {
    this.state = clone(state);
  }
  InvalidateState() {
    this.state = null;
  }
}
class LocalStorageSuspensionDriver {
  options;
  storage;
  constructor(options = {}) {
    this.options = typeof options === "string" ? { key: options } : options;
    const storage = this.options.storage ?? globalThis.localStorage;
    if (!storage) throw new Error("localStorage is unavailable; supply a StorageLike implementation");
    this.storage = storage;
  }
  get Key() {
    return this.options.key ?? "reactiveweb.state";
  }
  LoadState() {
    const text = this.storage.getItem(this.Key);
    if (text === null) return null;
    const json = JSON.parse(text);
    return this.options.deserialize ? this.options.deserialize(json) : json;
  }
  SaveState(state) {
    const text = JSON.stringify(this.options.serialize ? this.options.serialize(state) : state);
    if (text === void 0) throw new TypeError("State is not JSON serializable");
    this.storage.setItem(this.Key, text);
  }
  InvalidateState() {
    this.storage.removeItem(this.Key);
  }
}
class SuspensionHost {
  IsLaunchingNew = new import_rxjs.Subject();
  IsResuming = new import_rxjs.Subject();
  IsUnpausing = new import_rxjs.Subject();
  ShouldPersistState = new import_rxjs.Subject();
  ShouldInvalidateState = new import_rxjs.Subject();
  ThrownExceptions = new import_rxjs.Subject();
  CreateNewAppState;
  state = new import_rxjs.BehaviorSubject(null);
  setup;
  disposed = false;
  constructor(createNewAppState = () => {
    throw new Error("CreateNewAppState must be configured");
  }) {
    this.CreateNewAppState = createNewAppState;
  }
  get AppState() {
    return this.state.value;
  }
  set AppState(value) {
    if (this.disposed) throw new Error("Suspension host is disposed");
    this.state.next(value);
  }
  get AppStateChanged() {
    return this.state.asObservable();
  }
  SetupDefaultSuspendResume(driver) {
    if (this.disposed) throw new Error("Suspension host is disposed");
    this.setup?.Dispose();
    const subscriptions = new import_rxjs.Subscription();
    const report = (error) => {
      this.ThrownExceptions.next(error);
      return import_rxjs.EMPTY;
    };
    subscriptions.add(this.IsLaunchingNew.subscribe(() => {
      try {
        this.AppState = this.CreateNewAppState();
      } catch (error) {
        report(error);
      }
    }));
    subscriptions.add(this.IsResuming.pipe((0, import_rxjs.concatMap)(() => observableResult(() => driver.LoadState()).pipe(
      (0, import_rxjs.catchError)((error) => {
        report(error);
        return (0, import_rxjs.of)(null);
      })
    ))).subscribe((state) => {
      try {
        this.AppState = state ?? this.CreateNewAppState();
      } catch (error) {
        report(error);
      }
    }));
    const pendingLeases = /* @__PURE__ */ new Set();
    const persistRequests = this.ShouldPersistState.pipe((0, import_rxjs.map)((lease) => ({ kind: "persist", lease })));
    const invalidateRequests = this.ShouldInvalidateState.pipe((0, import_rxjs.map)(() => ({ kind: "invalidate" })));
    subscriptions.add((0, import_rxjs.merge)(persistRequests, invalidateRequests).pipe(
      (0, import_rxjs.tap)((request) => {
        if (request.kind === "persist" && request.lease) pendingLeases.add(request.lease);
      }),
      (0, import_rxjs.concatMap)((request) => {
        if (request.kind === "invalidate") return observableResult(() => driver.InvalidateState()).pipe((0, import_rxjs.tap)(() => {
          this.AppState = null;
        }), (0, import_rxjs.catchError)(report));
        return new import_rxjs.Observable((subscriber) => {
          const state = this.AppState;
          const saving = (state === null ? (0, import_rxjs.of)(void 0) : observableResult(() => driver.SaveState(state))).subscribe({
            error: (error) => {
              report(error);
              subscriber.complete();
            },
            complete: () => subscriber.complete()
          });
          return () => {
            saving.unsubscribe();
            if (request.lease) {
              pendingLeases.delete(request.lease);
              request.lease.Dispose();
            }
          };
        });
      })
    ).subscribe());
    subscriptions.add(() => {
      for (const lease of pendingLeases) {
        try {
          lease.Dispose();
        } catch (error) {
          report(error);
        }
      }
      pendingLeases.clear();
    });
    const setup = import_disposables.Disposable.Create(() => subscriptions.unsubscribe());
    this.setup = setup;
    return setup;
  }
  GetAppState() {
    return this.AppState;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.setup?.Dispose();
    this.IsLaunchingNew.complete();
    this.IsResuming.complete();
    this.IsUnpausing.complete();
    this.ShouldPersistState.complete();
    this.ShouldInvalidateState.complete();
    this.ThrownExceptions.complete();
    this.state.complete();
  }
  unsubscribe() {
    this.Dispose();
  }
}
function SetupDefaultSuspendResume(host, driver) {
  return host.SetupDefaultSuspendResume(driver);
}
function AutoPersist(item, persist, options = {}) {
  const source = options.changes ?? item?.Changed;
  if (!source || typeof source.subscribe !== "function") throw new TypeError("AutoPersist requires a Changed observable or options.changes");
  if (options.throttleMs !== void 0 && (!Number.isFinite(options.throttleMs) || options.throttleMs < 0)) throw new RangeError("throttleMs must be a finite nonnegative number");
  const subscriptions = new import_rxjs.Subscription(), requests = new import_rxjs.Subject(), errors = new import_rxjs.Subject();
  let disposed = false, revision = 0, requestedRevision = 0;
  let queue = Promise.resolve();
  const report = (error) => {
    errors.next(error);
    options.onError?.(error);
  };
  const flush = () => {
    if (disposed || revision === requestedRevision) return queue;
    requestedRevision = revision;
    const job = queue.catch(() => void 0).then(async () => {
      if (disposed) return;
      try {
        await new Promise((resolve, reject) => {
          const savingScope = new import_rxjs.Subscription(() => resolve());
          subscriptions.add(savingScope);
          savingScope.add(observableResult(() => persist(item)).subscribe({
            error: (error) => {
              reject(error);
              savingScope.unsubscribe();
              subscriptions.remove(savingScope);
            },
            complete: () => {
              resolve();
              savingScope.unsubscribe();
              subscriptions.remove(savingScope);
            }
          }));
        });
      } catch (error) {
        if (!disposed) report(error);
        throw error;
      }
    });
    queue = job;
    void job.catch(() => void 0);
    return job;
  };
  const trigger = () => {
    if (!disposed) {
      revision++;
      requests.next();
    }
  };
  subscriptions.add(requests.pipe((0, import_rxjs.debounceTime)(options.throttleMs ?? 1e3, options.scheduler)).subscribe(() => {
    void flush().catch(() => void 0);
  }));
  subscriptions.add(source.subscribe({ next: trigger, error: report }));
  if (options.initial) trigger();
  return {
    Errors: errors.asObservable(),
    Flush: flush,
    Trigger: trigger,
    Dispose() {
      if (disposed) return;
      disposed = true;
      subscriptions.unsubscribe();
      requests.complete();
      errors.complete();
    },
    unsubscribe() {
      this.Dispose();
    }
  };
}
function AttachBrowserLifecycle(host, target = window) {
  const onPageHide = () => host.ShouldPersistState.next();
  const onVisibility = () => {
    if (target.document.visibilityState === "hidden") host.ShouldPersistState.next();
    else host.IsUnpausing.next();
  };
  const onPageShow = (event) => {
    if (event.persisted) host.IsUnpausing.next();
  };
  target.addEventListener("pagehide", onPageHide);
  target.addEventListener("pageshow", onPageShow);
  target.document.addEventListener("visibilitychange", onVisibility);
  return import_disposables.Disposable.Create(() => {
    target.removeEventListener("pagehide", onPageHide);
    target.removeEventListener("pageshow", onPageShow);
    target.document.removeEventListener("visibilitychange", onVisibility);
  });
}
function AutoPersistCollection(collection, persist, options = {}) {
  const handles = /* @__PURE__ */ new Map(), errors = new import_rxjs.ReplaySubject(1);
  let disposed = false, lifecycleError;
  const observer = (0, import_collections.ActOnEveryObject)(collection, (item) => {
    const handle = AutoPersist(item, persist, options);
    handles.set(item, handle);
    const errorsSubscription = handle.Errors.subscribe((error) => errors.next(error));
    return import_disposables.Disposable.Create(() => {
      errorsSubscription.unsubscribe();
      handle.Dispose();
      handles.delete(item);
    });
  });
  const lifecycleErrors = observer.Errors.subscribe((error) => {
    lifecycleError = error;
    errors.next(error);
    options.onError?.(error);
  });
  return {
    Errors: errors.asObservable(),
    async Flush() {
      if (!disposed) {
        await Promise.all([...handles.values()].map((handle) => handle.Flush()));
        if (lifecycleError !== void 0) throw lifecycleError;
      }
    },
    Trigger() {
      if (!disposed) for (const handle of handles.values()) handle.Trigger();
    },
    Dispose() {
      if (disposed) return;
      disposed = true;
      try {
        observer.Dispose();
      } finally {
        lifecycleErrors.unsubscribe();
        errors.complete();
      }
    },
    unsubscribe() {
      this.Dispose();
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AttachBrowserLifecycle,
  AutoPersist,
  AutoPersistCollection,
  BrowserSuspensionDriver,
  InMemorySuspensionDriver,
  LocalStorageSuspensionDriver,
  SetupDefaultSuspendResume,
  SuspensionHost
});
//# sourceMappingURL=persistence.js.map
