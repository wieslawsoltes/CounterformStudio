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
var react_exports = {};
__export(react_exports, {
  ReactiveProvider: () => ReactiveProvider,
  RoutedViewHost: () => RoutedViewHost,
  ViewModelViewHost: () => ViewModelViewHost,
  createReactiveContext: () => createReactiveContext,
  useCollection: () => useCollection,
  useObservable: () => useObservable,
  useReactiveCollection: () => useReactiveCollection,
  useReactiveCommand: () => useReactiveCommand,
  useReactiveObject: () => useReactiveObject,
  useViewModel: () => useViewModel,
  useWhenActivated: () => useWhenActivated
});
module.exports = __toCommonJS(react_exports);
var import_react = require("react");
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
var import_dynamic_data = require("./dynamic-data.js");
var import_services = require("./services.js");
function makeObservableStore(source, initial, serverValue) {
  let value = initial;
  let failure;
  let failed = false;
  let subscription;
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    for (const listener of [...listeners]) listener();
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!subscription) {
        subscription = new import_rxjs.Subscription();
        subscription.add(source.subscribe({
          next(next) {
            if (!Object.is(value, next) || failed) {
              value = next;
              failed = false;
              notify();
            }
          },
          error(error) {
            failed = true;
            failure = error;
            notify();
          }
        }));
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          subscription?.unsubscribe();
          subscription = void 0;
        }
      };
    },
    getSnapshot() {
      if (failed) throw failure;
      return value;
    },
    getServerSnapshot() {
      return serverValue;
    }
  };
}
function useObservable(source, initialValue, serverValue = initialValue) {
  const initial = initialValue === void 0 && "getValue" in source ? source.getValue() : initialValue;
  const store = (0, import_react.useMemo)(() => makeObservableStore(source, initial, serverValue === void 0 ? initial : serverValue), [source]);
  return (0, import_react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
function makeCollectionStore(source, serverSnapshot) {
  const initial = "Items" in source ? Array.from(source.Items) : [];
  let snapshot = Object.freeze(initial);
  const server = serverSnapshot === void 0 ? snapshot : Object.freeze([...serverSnapshot]);
  let connection;
  let failure, failed = false;
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    for (const listener of [...listeners]) listener();
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!connection) {
        const lifetime = new import_disposables.CompositeDisposable();
        connection = lifetime;
        const binding = "ItemsChanged" in source ? void 0 : (0, import_dynamic_data.ToReactiveCollection)(source);
        if (binding) lifetime.Add(binding);
        const collection = binding?.Collection ?? source;
        snapshot = Object.freeze([...collection.Items]);
        failed = false;
        notify();
        const error = (reason) => {
          failed = true;
          failure = reason;
          notify();
        };
        lifetime.Add(collection.ItemsChanged.subscribe({
          next(items) {
            snapshot = Object.freeze([...items]);
            failed = false;
            notify();
          },
          error
        }));
        if (binding) lifetime.Add(binding.Errors.subscribe(error));
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          const old = connection;
          connection = void 0;
          old?.Dispose();
        }
      };
    },
    getSnapshot() {
      if (failed) throw failure;
      return snapshot;
    },
    getServerSnapshot() {
      return server;
    }
  };
}
function useReactiveCollection(source, serverSnapshot) {
  const store = (0, import_react.useMemo)(() => makeCollectionStore(source, serverSnapshot), [source]);
  return (0, import_react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
const useCollection = useReactiveCollection;
const reactiveStores = /* @__PURE__ */ new WeakMap();
function reactiveStore(source) {
  const existing = reactiveStores.get(source);
  if (existing) return existing;
  let revision = 0;
  let subscription;
  const listeners = /* @__PURE__ */ new Set();
  const store = {
    subscribe(listener) {
      listeners.add(listener);
      if (!subscription) {
        revision++;
        subscription = source.Changed.subscribe(() => {
          revision++;
          for (const notify of [...listeners]) notify();
        });
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          subscription?.unsubscribe();
          subscription = void 0;
        }
      };
    },
    getSnapshot: () => revision,
    getServerSnapshot: () => 0
  };
  reactiveStores.set(source, store);
  return store;
}
function useReactiveObject(viewModel, selector) {
  const store = (0, import_react.useMemo)(() => reactiveStore(viewModel), [viewModel]);
  (0, import_react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return selector ? selector(viewModel) : viewModel;
}
function useWhenActivated(viewModel, block, dependencies = []) {
  const blockRef = (0, import_react.useRef)(block);
  blockRef.current = block;
  (0, import_react.useEffect)(() => {
    const lifetime = new import_disposables.CompositeDisposable();
    try {
      lifetime.Add(viewModel.Activator.Activate());
      const resource = blockRef.current?.(lifetime);
      if (resource) lifetime.Add(resource);
    } catch (error) {
      lifetime.Dispose();
      throw error;
    }
    return () => lifetime.Dispose();
  }, [viewModel, ...dependencies]);
}
const notExecuting = new import_rxjs.Observable((subscriber) => {
  subscriber.next(false);
  subscriber.complete();
});
function useReactiveCommand(command) {
  const canExecute = useObservable(command.CanExecute, false);
  const isExecuting = useObservable(command.IsExecuting ?? notExecuting, false);
  const execute = (0, import_react.useCallback)((parameter) => (0, import_rxjs.firstValueFrom)(command.CanExecute.pipe((0, import_rxjs.take)(1), (0, import_rxjs.switchMap)((enabled) => {
    if (!enabled || "CanExecuteValue" in command && command.CanExecuteValue === false) throw new Error("The command cannot execute in its current state.");
    return command.Execute(parameter);
  }))), [command]);
  return (0, import_react.useMemo)(() => ({ canExecute, isExecuting, execute, CanExecute: canExecute, IsExecuting: isExecuting, Execute: execute }), [canExecute, isExecuting, execute]);
}
const ViewModelContext = (0, import_react.createContext)(void 0);
function ReactiveProvider({ viewModel, children }) {
  return (0, import_react.createElement)(ViewModelContext.Provider, { value: viewModel }, children);
}
function useViewModel() {
  const viewModel = (0, import_react.useContext)(ViewModelContext);
  if (viewModel === void 0) throw new Error("useViewModel must be used inside ReactiveProvider.");
  return viewModel;
}
function createReactiveContext() {
  const context = (0, import_react.createContext)(void 0);
  const Provider = ({ viewModel, children }) => (0, import_react.createElement)(context.Provider, { value: viewModel }, children);
  const useReactiveViewModel = () => {
    const value = (0, import_react.useContext)(context);
    if (value === void 0) throw new Error("Reactive context provider is missing.");
    return value;
  };
  return { Provider, useViewModel: useReactiveViewModel, Context: context };
}
function ViewModelViewHost({ viewModel, viewLocator = import_services.ViewLocator.Current, contract, fallback = null }) {
  const resolved = (0, import_react.useMemo)(() => viewModel == null ? void 0 : viewLocator.ResolveView(viewModel, contract), [viewModel, viewLocator, contract]);
  (0, import_react.useEffect)(() => () => {
    if (resolved && typeof resolved === "object" && "Dispose" in resolved) (0, import_disposables.dispose)(resolved);
  }, [resolved]);
  if (!resolved || viewModel == null) return fallback;
  return (0, import_react.createElement)(ReactiveProvider, { viewModel }, (0, import_react.createElement)(resolved, { viewModel, ViewModel: viewModel }));
}
function RoutedViewHost({ router, initialViewModel, ...props }) {
  const viewModel = useObservable(router.CurrentViewModel, initialViewModel ?? router.CurrentViewModelValue ?? null);
  return (0, import_react.createElement)(ViewModelViewHost, { ...props, viewModel });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReactiveProvider,
  RoutedViewHost,
  ViewModelViewHost,
  createReactiveContext,
  useCollection,
  useObservable,
  useReactiveCollection,
  useReactiveCommand,
  useReactiveObject,
  useViewModel,
  useWhenActivated
});
//# sourceMappingURL=react.js.map
