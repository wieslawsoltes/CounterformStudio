import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Observable, Subscription, firstValueFrom, switchMap, take } from 'rxjs';
import { CompositeDisposable, dispose } from './disposables.js';
import { ToReactiveCollection } from './dynamic-data.js';
import { ViewLocator } from './services.js';
function makeObservableStore(source, initial, serverValue) {
    let value = initial;
    let failure;
    let failed = false;
    let subscription;
    const listeners = new Set();
    const notify = () => { for (const listener of [...listeners])
        listener(); };
    return {
        subscribe(listener) {
            listeners.add(listener);
            if (!subscription) {
                subscription = new Subscription();
                subscription.add(source.subscribe({
                    next(next) { if (!Object.is(value, next) || failed) {
                        value = next;
                        failed = false;
                        notify();
                    } },
                    error(error) { failed = true; failure = error; notify(); },
                }));
            }
            return () => { listeners.delete(listener); if (!listeners.size) {
                subscription?.unsubscribe();
                subscription = undefined;
            } };
        },
        getSnapshot() { if (failed)
            throw failure; return value; },
        getServerSnapshot() { return serverValue; },
    };
}
export function useObservable(source, initialValue, serverValue = initialValue) {
    // BehaviorSubject values can be read without starting work during a render.
    const initial = initialValue === undefined && 'getValue' in source ? source.getValue() : initialValue;
    const store = useMemo(() => makeObservableStore(source, initial, serverValue === undefined ? initial : serverValue), [source]);
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
function makeCollectionStore(source, serverSnapshot) {
    // Reading Items starts no observable work, including on the server or abandoned renders.
    const initial = 'Items' in source ? Array.from(source.Items) : [];
    let snapshot = Object.freeze(initial);
    const server = serverSnapshot === undefined ? snapshot : Object.freeze([...serverSnapshot]);
    let connection;
    let failure, failed = false;
    const listeners = new Set();
    const notify = () => { for (const listener of [...listeners])
        listener(); };
    return {
        subscribe(listener) {
            listeners.add(listener);
            if (!connection) {
                const lifetime = new CompositeDisposable();
                connection = lifetime;
                const binding = 'ItemsChanged' in source ? undefined : ToReactiveCollection(source);
                if (binding)
                    lifetime.Add(binding);
                const collection = (binding?.Collection ?? source);
                // A finite synchronous source may complete its snapshot subject before subscription.
                snapshot = Object.freeze([...collection.Items]);
                failed = false;
                notify();
                const error = (reason) => { failed = true; failure = reason; notify(); };
                lifetime.Add(collection.ItemsChanged.subscribe({
                    next(items) { snapshot = Object.freeze([...items]); failed = false; notify(); }, error,
                }));
                if (binding)
                    lifetime.Add(binding.Errors.subscribe(error));
            }
            return () => { listeners.delete(listener); if (!listeners.size) {
                const old = connection;
                connection = undefined;
                old?.Dispose();
            } };
        },
        getSnapshot() { if (failed)
            throw failure; return snapshot; },
        getServerSnapshot() { return server; },
    };
}
/** Immutable, cached collection snapshots; subscribes only after commit and owns no source. */
export function useReactiveCollection(source, serverSnapshot) {
    // A server snapshot initializes a source. Inline snapshot literals must not recreate subscriptions.
    const store = useMemo(() => makeCollectionStore(source, serverSnapshot), [source]);
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
export const useCollection = useReactiveCollection;
const reactiveStores = new WeakMap();
function reactiveStore(source) {
    const existing = reactiveStores.get(source);
    if (existing)
        return existing;
    let revision = 0;
    let subscription;
    const listeners = new Set();
    const store = {
        subscribe(listener) {
            listeners.add(listener);
            if (!subscription) {
                // Re-check mutations between render and subscribe, including StrictMode remounts.
                revision++;
                subscription = source.Changed.subscribe(() => { revision++; for (const notify of [...listeners])
                    notify(); });
            }
            return () => { listeners.delete(listener); if (!listeners.size) {
                subscription?.unsubscribe();
                subscription = undefined;
            } };
        },
        getSnapshot: () => revision,
        getServerSnapshot: () => 0,
    };
    reactiveStores.set(source, store);
    return store;
}
export function useReactiveObject(viewModel, selector) {
    const store = useMemo(() => reactiveStore(viewModel), [viewModel]);
    useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    return selector ? selector(viewModel) : viewModel;
}
/** React StrictMode setup-cleanup-setup owns one independent activation lease per setup. */
export function useWhenActivated(viewModel, block, dependencies = []) {
    const blockRef = useRef(block);
    blockRef.current = block;
    useEffect(() => {
        const lifetime = new CompositeDisposable();
        try {
            lifetime.Add(viewModel.Activator.Activate());
            const resource = blockRef.current?.(lifetime);
            if (resource)
                lifetime.Add(resource);
        }
        catch (error) {
            lifetime.Dispose();
            throw error;
        }
        return () => lifetime.Dispose();
    }, [viewModel, ...dependencies]);
}
const notExecuting = new Observable(subscriber => { subscriber.next(false); subscriber.complete(); });
export function useReactiveCommand(command) {
    const canExecute = useObservable(command.CanExecute, false);
    const isExecuting = useObservable(command.IsExecuting ?? notExecuting, false);
    const execute = useCallback((parameter) => firstValueFrom(command.CanExecute.pipe(take(1), switchMap(enabled => {
        if (!enabled || ('CanExecuteValue' in command && command.CanExecuteValue === false))
            throw new Error('The command cannot execute in its current state.');
        return command.Execute(parameter);
    }))), [command]);
    return useMemo(() => ({ canExecute, isExecuting, execute, CanExecute: canExecute, IsExecuting: isExecuting, Execute: execute }), [canExecute, isExecuting, execute]);
}
const ViewModelContext = createContext(undefined);
export function ReactiveProvider({ viewModel, children }) {
    return createElement(ViewModelContext.Provider, { value: viewModel }, children);
}
export function useViewModel() {
    const viewModel = useContext(ViewModelContext);
    if (viewModel === undefined)
        throw new Error('useViewModel must be used inside ReactiveProvider.');
    return viewModel;
}
export function createReactiveContext() {
    const context = createContext(undefined);
    const Provider = ({ viewModel, children }) => createElement(context.Provider, { value: viewModel }, children);
    const useReactiveViewModel = () => {
        const value = useContext(context);
        if (value === undefined)
            throw new Error('Reactive context provider is missing.');
        return value;
    };
    return { Provider, useViewModel: useReactiveViewModel, Context: context };
}
/** Register a factory returning a React component type, e.g. () => DetailsView. */
export function ViewModelViewHost({ viewModel, viewLocator = ViewLocator.Current, contract, fallback = null }) {
    const resolved = useMemo(() => viewModel == null ? undefined : viewLocator.ResolveView(viewModel, contract), [viewModel, viewLocator, contract]);
    // Instances with explicit resource ownership are released when a view is replaced.
    useEffect(() => () => { if (resolved && typeof resolved === 'object' && 'Dispose' in resolved)
        dispose(resolved); }, [resolved]);
    if (!resolved || viewModel == null)
        return fallback;
    return createElement(ReactiveProvider, { viewModel }, createElement(resolved, { viewModel, ViewModel: viewModel }));
}
export function RoutedViewHost({ router, initialViewModel, ...props }) {
    const viewModel = useObservable(router.CurrentViewModel, initialViewModel ?? router.CurrentViewModelValue ?? null);
    return createElement(ViewModelViewHost, { ...props, viewModel });
}
//# sourceMappingURL=react.js.map