import { type DependencyList, type ReactElement, type ReactNode } from 'react';
import { Observable } from 'rxjs';
import { CompositeDisposable, type DisposableLike, type IDisposable } from './disposables.js';
import type { ReactiveObject } from './reactive-object.js';
import type { CommandLike, RouterLike, ViewResolver, CollectionViewSource } from './html.js';
/** Subscribes after commit; caches snapshots and releases subscriptions on unmount. */
export declare function useObservable<T>(source: Observable<T>, initialValue: T, serverValue?: T): T;
export declare function useObservable<T>(source: Observable<T>): T | undefined;
/** Immutable, cached collection snapshots; subscribes only after commit and owns no source. */
export declare function useReactiveCollection<T, K = unknown>(source: CollectionViewSource<T, K>, serverSnapshot?: readonly T[]): readonly T[];
export declare const useCollection: typeof useReactiveCollection;
export declare function useReactiveObject<T extends Pick<ReactiveObject, 'Changed'>>(viewModel: T): T;
export declare function useReactiveObject<T extends Pick<ReactiveObject, 'Changed'>, R>(viewModel: T, selector: (viewModel: T) => R): R;
export interface Activatable {
    readonly Activator: {
        Activate(): IDisposable;
    };
}
/** React StrictMode setup-cleanup-setup owns one independent activation lease per setup. */
export declare function useWhenActivated(viewModel: Activatable, block?: (disposables: CompositeDisposable) => void | DisposableLike, dependencies?: DependencyList): void;
export interface ReactiveCommandHook<T, R> {
    readonly canExecute: boolean;
    readonly isExecuting: boolean;
    /** Resolves the command's first result; rejects failures and blocked executions. */
    readonly execute: (parameter: T) => Promise<R>;
    readonly CanExecute: boolean;
    readonly IsExecuting: boolean;
    readonly Execute: (parameter: T) => Promise<R>;
}
export declare function useReactiveCommand<T, R>(command: CommandLike<T, R>): ReactiveCommandHook<T, R>;
export declare function ReactiveProvider<T>({ viewModel, children }: {
    viewModel: T;
    children?: ReactNode;
}): ReactElement;
export declare function useViewModel<T>(): T;
export declare function createReactiveContext<T>(): {
    Provider: ({ viewModel, children }: {
        viewModel: T;
        children?: ReactNode;
    }) => import("react").FunctionComponentElement<import("react").ProviderProps<T | undefined>>;
    useViewModel: () => T;
    Context: import("react").Context<T | undefined>;
};
export interface ViewModelViewHostProps<T = unknown> {
    viewModel: T | null;
    viewLocator?: ViewResolver;
    contract?: string;
    fallback?: ReactNode;
}
/** Register a factory returning a React component type, e.g. () => DetailsView. */
export declare function ViewModelViewHost<T>({ viewModel, viewLocator, contract, fallback }: ViewModelViewHostProps<T>): ReactNode;
export interface RoutedViewHostProps extends Omit<ViewModelViewHostProps, 'viewModel'> {
    router: RouterLike;
    initialViewModel?: unknown;
}
export declare function RoutedViewHost({ router, initialViewModel, ...props }: RoutedViewHostProps): ReactNode;
//# sourceMappingURL=react.d.ts.map