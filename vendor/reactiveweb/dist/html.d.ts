import { Observable } from 'rxjs';
import { CompositeDisposable, type DisposableLike, type IDisposable } from './disposables.js';
import { ViewModelActivator } from './activation.js';
import type { ValidationContext, IValidatableViewModel } from './validation.js';
import type { InteractionHandler } from './interaction.js';
import { ConverterService, PropertyBindingHookRegistry, type BindingTypeToken } from './converters.js';
import { type DynamicDataSource } from './dynamic-data.js';
import type { ChangeSet } from './collections.js';
export interface IViewFor<T = unknown> {
    ViewModel: T | null;
}
export interface IBindingTypeConverter<TFrom = unknown, TTo = unknown> {
    Convert(value: TFrom): TTo;
    ConvertBack?(value: TTo): TFrom;
}
export interface BindingOptions<T = unknown, U = unknown> {
    event?: string;
    converter?: IBindingTypeConverter<T, U>;
    convert?: (value: T) => U;
    convertBack?: (value: U) => T;
    onError?: (error: unknown) => void;
    conversionService?: ConverterService;
    sourceType?: BindingTypeToken<T>;
    targetType?: BindingTypeToken<U>;
    conversionHint?: unknown;
    bindingHooks?: PropertyBindingHookRegistry;
}
export interface CommandLike<T = unknown, R = unknown> {
    readonly CanExecute: Observable<boolean>;
    readonly CanExecuteValue?: boolean;
    readonly IsExecuting?: Observable<boolean>;
    Execute(parameter: T): Observable<R>;
}
export declare class ReactiveBinding extends CompositeDisposable {
    get IsBound(): boolean;
}
/** Structural collection contract shared by HTML and React; snapshots are immutable. */
export interface ReactiveCollectionSource<T> {
    readonly Items: readonly T[];
    readonly ItemsChanged: Observable<readonly T[]>;
    readonly CollectionChanged?: Observable<ChangeSet<T>>;
    Connect?(): Observable<ChangeSet<T>>;
}
export type CollectionViewSource<T, K = unknown> = ReactiveCollectionSource<T> | DynamicDataSource<T, K>;
export interface CollectionBindingOptions<T> {
    /** Stable business identity. Repeated keys are matched by occurrence. */
    keySelector?: (item: T) => unknown;
    /** Updates retained nodes after refresh, replacement, or a changed index. */
    update?: (node: Node, item: T, index: number, lifetime: CompositeDisposable) => void;
    onError?: (error: unknown) => void;
}
export type CollectionItemRenderer<T> = (item: T, index: number, lifetime: CompositeDisposable) => Node;
/** Owns rendered rows and subscriptions, while the caller retains collection ownership. */
export declare class ReactiveCollectionBinding<T, K = unknown> extends ReactiveBinding {
    readonly Element: Element;
    private readonly render;
    private readonly options;
    private source;
    private readonly connection;
    private rows;
    private readonly ownedRows;
    private readonly ownedNodes;
    private readonly anchor;
    private processing;
    private generation;
    private readonly pending;
    constructor(source: CollectionViewSource<T, K>, Element: Element, render: CollectionItemRenderer<T>, options?: CollectionBindingOptions<T>);
    get Source(): CollectionViewSource<T, K>;
    set Source(value: CollectionViewSource<T, K>);
    private run;
    private clearRows;
    private createRow;
    private removeRows;
    private reconcile;
    private apply;
    private layout;
    private connect;
}
/** Binds DynamicData list/cache changes or a bindable collection to independently owned rows. */
export declare function BindCollection<T, K = unknown>(source: CollectionViewSource<T, K>, element: Element, render: CollectionItemRenderer<T>, options?: CollectionBindingOptions<T>): ReactiveCollectionBinding<T, K>;
export declare const bindCollection: typeof BindCollection;
/** Binds an observable directly to a DOM property and returns its subscription lifetime. */
export declare function BindTo<T>(source: Observable<T>, element: Element, property?: string, options?: BindingOptions<T, any>): ReactiveBinding;
export declare function OneWayBind<T extends object>(viewModel: T, path: string, element: Element, property?: string, options?: BindingOptions<any, any>): ReactiveBinding;
/** Two-way binding; inputs use input, select/checkbox/radio use change by default. */
export declare function Bind<T extends object>(viewModel: T, path: string, element: Element, property?: string, options?: BindingOptions<any, any>): ReactiveBinding;
export interface CommandBindingOptions<T> {
    event?: string;
    parameter?: T | ((event: Event) => T);
    preventDefault?: boolean;
    onError?: (error: unknown) => void;
}
export declare function BindCommand<T, R>(command: CommandLike<T, R>, element: Element, options?: CommandBindingOptions<T>): ReactiveBinding;
export declare function BindValidation(viewModel: IValidatableViewModel | ValidationContext, element: Element, propertyName?: string, separator?: string): ReactiveBinding;
/** Re-registers the handler if a reactive interaction property is replaced. */
export declare function BindInteraction<TInput, TOutput>(viewModel: object, path: string, handler: InteractionHandler<TInput, TOutput>): ReactiveBinding;
export declare const BindingConverters: Readonly<{
    String: {
        Convert: (value: unknown) => string;
        ConvertBack: (value: string) => string;
    };
    Number: {
        Convert: (value: number | null) => string;
        ConvertBack: (value: string) => number | null;
    };
    Boolean: {
        Convert: (value: unknown) => boolean;
        ConvertBack: (value: unknown) => boolean;
    };
    Not: {
        Convert: (value: unknown) => boolean;
        ConvertBack: (value: unknown) => boolean;
    };
}>;
export interface HtmlBindingOptions {
    converters?: Record<string, IBindingTypeConverter<any, any>>;
    observeMutations?: boolean;
    onError?: (error: unknown) => void;
}
/** Declarative bindings use property paths only, never eval or expression compilation. */
export declare function BindHtml(root: ParentNode, viewModel: object, options?: HtmlBindingOptions): ReactiveBinding;
declare const HTMLElementBase: typeof HTMLElement;
export declare class ReactiveElement<T extends object = object> extends HTMLElementBase implements IViewFor<T> {
    readonly Activator: ViewModelActivator;
    private viewModel;
    private lifetime?;
    private disposed;
    get ViewModel(): T | null;
    set ViewModel(value: T | null);
    get DataContext(): T | null;
    set DataContext(value: T | null);
    get BindingRoot(): ParentNode;
    connectedCallback(): void;
    disconnectedCallback(): void;
    WhenActivated(block: (disposables: CompositeDisposable) => void | DisposableLike): IDisposable;
    protected OnActivated(_disposables: CompositeDisposable): void;
    protected RefreshBindings(): void;
    private activate;
    Dispose(): void;
    unsubscribe(): void;
}
export { ReactiveElement as ReactiveUserControl };
export interface HtmlView extends IViewFor {
    readonly Element: Node;
    Dispose?(): void;
}
export interface ViewResolver {
    ResolveView(viewModel: unknown, contract?: string): unknown;
    IsSingletonView?(view: unknown): boolean;
}
export declare class ViewModelViewHost extends ReactiveElement {
    private locator;
    get ViewLocator(): ViewResolver;
    set ViewLocator(value: ViewResolver);
    private contract?;
    private fallback;
    get ViewContract(): string | undefined;
    set ViewContract(value: string | undefined);
    get DefaultContent(): Node | string | null;
    set DefaultContent(value: Node | string | null);
    protected OnActivated(disposables: CompositeDisposable): void;
}
export interface RouterLike {
    readonly CurrentViewModel: Observable<unknown>;
    readonly CurrentViewModelValue?: unknown;
}
export declare class RoutedViewHost extends ReactiveElement {
    private locator;
    get ViewLocator(): ViewResolver;
    set ViewLocator(value: ViewResolver);
    private router;
    private contract?;
    private fallback;
    get Router(): RouterLike | null;
    set Router(value: RouterLike | null);
    get ViewContract(): string | undefined;
    set ViewContract(value: string | undefined);
    get DefaultContent(): Node | string | null;
    set DefaultContent(value: Node | string | null);
    protected OnActivated(disposables: CompositeDisposable): void;
}
/** Explicit registration avoids globals and allows multiple versions in the same document. */
export declare function RegisterReactiveElements(registry?: CustomElementRegistry, prefix?: string): void;
export declare const bind: typeof Bind;
export declare const oneWayBind: typeof OneWayBind;
export declare const bindTo: typeof BindTo;
export declare const bindCommand: typeof BindCommand;
export declare const bindHtml: typeof BindHtml;
//# sourceMappingURL=html.d.ts.map