/** Small .NET-style MVVM primitives. No framework or DOM dependency is required. */
import type { IDisposable } from "./model.js";
export type { IDisposable } from "./model.js";
export declare class Subscription implements IDisposable {
    private cleanup;
    constructor(cleanup: () => void);
    Dispose(): void;
}
/** Composite owns its children and immediately disposes additions after disposal. */
export declare class CompositeDisposable implements IDisposable {
    private items;
    private disposed;
    Add<T extends IDisposable>(item: T): T;
    Dispose(): void;
}
export declare class ObservableEvent<T> {
    private listeners;
    Subscribe(listener: (args: T) => void): IDisposable;
    Emit(args: T): void;
    Clear(): void;
}
export interface PropertyChangedEventArgs {
    Sender: ObservableObject;
    PropertyName: string;
    OldValue: unknown;
    NewValue: unknown;
}
export declare class ObservableObject implements IDisposable {
    readonly PropertyChanged: ObservableEvent<PropertyChangedEventArgs>;
    private readonly values;
    private disposed;
    constructor(initialValues?: Record<string, unknown>);
    GetProperty<T>(name: string, defaultValue?: T): T;
    /** Also useful inside conventional get/set accessors on a subclass. */
    SetProperty<T>(name: string, value: T): boolean;
    DefineProperty<T>(name: string, value: T): this;
    protected OnPropertyChanged(name: string, oldValue?: unknown, newValue?: unknown): void;
    Dispose(): void;
}
export interface ICommand<T = unknown> {
    readonly CanExecuteChanged: ObservableEvent<void>;
    CanExecute(parameter?: T): boolean;
    Execute(parameter?: T): unknown;
}
export declare class RelayCommand<T = unknown> implements ICommand<T>, IDisposable {
    private readonly execute;
    private readonly canExecute;
    readonly CanExecuteChanged: ObservableEvent<void>;
    private disposed;
    constructor(execute: (parameter?: T) => void, canExecute?: (parameter?: T) => boolean);
    CanExecute(parameter?: T): boolean;
    Execute(parameter?: T): boolean;
    NotifyCanExecuteChanged(): void;
    RaiseCanExecuteChanged(): void;
    Dispose(): void;
}
/** Execute returns a rejecting promise on failure; callers retain responsibility for handling errors. */
export declare class AsyncRelayCommand<T = unknown> extends ObservableObject implements ICommand<T> {
    private readonly execute;
    private readonly canExecute;
    readonly CanExecuteChanged: ObservableEvent<void>;
    ExecutionTask: Promise<void> | undefined;
    private controller;
    private commandDisposed;
    constructor(execute: (parameter: T | undefined, signal: AbortSignal) => Promise<void>, canExecute?: (parameter?: T) => boolean);
    get IsRunning(): boolean;
    get Error(): unknown;
    CanExecute(parameter?: T): boolean;
    Execute(parameter?: T): Promise<void>;
    Cancel(): void;
    NotifyCanExecuteChanged(): void;
    Dispose(): void;
}
export declare const BindingMode: {
    readonly OneWay: "OneWay";
    readonly TwoWay: "TwoWay";
    readonly OneTime: "OneTime";
    readonly OneWayToSource: "OneWayToSource";
};
export type BindingMode = (typeof BindingMode)[keyof typeof BindingMode];
export interface IValueConverter {
    Convert(value: unknown, parameter?: unknown): unknown;
    ConvertBack?(value: unknown, parameter?: unknown): unknown;
}
export interface BindingOptions {
    Source: object;
    Path: string;
    Mode?: BindingMode;
    Converter?: IValueConverter;
    ConverterParameter?: unknown;
    /** A DOM event used to push edited target values back to Source. */
    UpdateSourceEvent?: string;
}
export declare class Binding {
    readonly Options: Readonly<BindingOptions>;
    constructor(options: BindingOptions);
    Attach(target: object, targetProperty: string): BindingExpression;
    static SetBinding(target: object, targetProperty: string, binding: Binding | BindingOptions): BindingExpression;
}
export declare class BindingExpression implements IDisposable {
    private readonly options;
    private readonly target;
    private readonly targetProperty;
    private readonly path;
    private sourceSubscriptions;
    private targetSubscription;
    private updating;
    private disposed;
    private readonly mode;
    constructor(options: Readonly<BindingOptions>, target: object, targetProperty: string);
    private subscribeSource;
    private subscribeTarget;
    UpdateTarget(): void;
    UpdateSource(): void;
    Dispose(): void;
}
/** Connects a button-like DOM target to ICommand and owns its event subscriptions. */
export declare function BindCommand<T>(target: EventTarget & {
    disabled?: boolean;
}, command: ICommand<T>, parameter?: T | (() => T), onError?: (error: unknown) => void): IDisposable;
