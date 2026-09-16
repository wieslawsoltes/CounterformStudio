/** Runtime alternatives to .NET source-generated reactive members. */
import { type Observable, type ObservableInput, type SchedulerLike } from 'rxjs';
import { ReactiveObject } from './reactive-object.js';
import { ReactiveCommand } from './command.js';
export interface ReactivePropertyOptions<T = unknown> {
    /** Rejects a write before any property notification or state mutation. */
    validate?: (value: T) => boolean | string;
    /** Replaces Object.is when deciding whether a write changes the property. */
    equals?: (previous: T, next: T) => boolean;
    /** Names of synchronous computed getters affected by this property. */
    dependents?: readonly string[];
}
/** An invalid reactive property assignment; the previous value remains intact. */
export declare class ReactivePropertyValidationError extends TypeError {
    readonly PropertyName: string;
    readonly AttemptedValue: unknown;
    constructor(PropertyName: string, AttemptedValue: unknown, message?: string);
}
export type ReactiveAccessorDecorator = <TThis extends ReactiveObject, TValue>(target: ClassAccessorDecoratorTarget<TThis, TValue>, context: ClassAccessorDecoratorContext<TThis, TValue>) => ClassAccessorDecoratorResult<TThis, TValue>;
/**
 * Standard TypeScript 5+ auto-accessor decorator. Use `@Reactive accessor Name = ''`.
 * Does not require legacy experimentalDecorators, Proxy, or reflection metadata.
 */
export declare function Reactive<TThis extends ReactiveObject, TValue>(target: ClassAccessorDecoratorTarget<TThis, TValue>, context: ClassAccessorDecoratorContext<TThis, TValue>): ClassAccessorDecoratorResult<TThis, TValue>;
export declare function Reactive(): ReactiveAccessorDecorator;
export declare function Reactive<TValue>(options: ReactivePropertyOptions<TValue>): <TThis extends ReactiveObject>(target: ClassAccessorDecoratorTarget<TThis, TValue>, context: ClassAccessorDecoratorContext<TThis, TValue>) => ClassAccessorDecoratorResult<TThis, TValue>;
export interface ReactivePropertyDefinition<T = unknown> extends ReactivePropertyOptions<T> {
    initial: T;
    /** Per-instance initialization for values that cannot be structured-cloned. */
    factory?: () => T;
}
/** Preserves the property type while adding validation and dependent notifications. */
export declare function reactiveProperty<T>(initial: T, options?: Omit<ReactivePropertyDefinition<T>, 'initial'>): ReactivePropertyDefinition<T>;
export type PropertyValues<P extends Record<string, ReactivePropertyDefinition<any>>> = {
    [K in keyof P]: P[K] extends ReactivePropertyDefinition<infer T> ? T : never;
};
export interface ComputedPropertyDefinition<T = unknown, TViewModel = any> {
    source: (viewModel: TViewModel) => Observable<T>;
    initialValue?: T;
    scheduler?: SchedulerLike;
    deferSubscription?: boolean;
    comparer?: (previous: T, next: T) => boolean;
}
export type GeneratedCommandDefinition<TInput = any, TOutput = any, TViewModel = any> = {
    canExecute?: (viewModel: TViewModel) => Observable<boolean>;
    outputScheduler?: SchedulerLike;
} & ({
    kind?: 'sync';
    execute: (viewModel: TViewModel, input: TInput) => TOutput;
} | {
    kind: 'task';
    execute: (viewModel: TViewModel, input: TInput, signal: AbortSignal) => PromiseLike<TOutput>;
} | {
    kind: 'observable';
    execute: (viewModel: TViewModel, input: TInput, signal: AbortSignal) => ObservableInput<TOutput>;
});
type ComputedValues<C extends Record<string, ComputedPropertyDefinition<any, any>>> = {
    readonly [K in keyof C]: C[K] extends ComputedPropertyDefinition<infer T, any> ? C[K] extends {
        initialValue: unknown;
    } ? T : T | undefined : never;
};
type CommandValues<C extends Record<string, GeneratedCommandDefinition>> = {
    readonly [K in keyof C]: C[K] extends GeneratedCommandDefinition<infer TInput, infer TOutput> ? ReactiveCommand<TInput, TOutput> : never;
};
export interface GeneratedViewModel extends ReactiveObject {
    /** Releases generated commands and observable-as-property subscriptions. */
    Dispose(): void;
}
export interface ViewModelSchema<P extends Record<string, ReactivePropertyDefinition<any>>, C extends Record<string, ComputedPropertyDefinition<any, ReactiveObject & PropertyValues<P>>>, M extends Record<string, GeneratedCommandDefinition<any, any, ReactiveObject & PropertyValues<P>>>> {
    name?: string;
    properties: P;
    computed?: C & Record<string, ComputedPropertyDefinition<any, ReactiveObject & PropertyValues<P>>>;
    commands?: M & Record<string, GeneratedCommandDefinition<any, any, ReactiveObject & PropertyValues<P>>>;
}
/**
 * Creates one class with regular prototype accessors. Every instance owns its
 * property values, computed subscriptions, and commands. No Proxy is involved.
 */
export declare function defineViewModel<P extends Record<string, ReactivePropertyDefinition<any>>, C extends Record<string, ComputedPropertyDefinition<any, ReactiveObject & PropertyValues<P>>> = {}, M extends Record<string, GeneratedCommandDefinition<any, any, ReactiveObject & PropertyValues<P>>> = {}>(schema: ViewModelSchema<P, C, M>): new (initial?: Partial<PropertyValues<P>>) => GeneratedViewModel & PropertyValues<P> & ComputedValues<C> & CommandValues<M>;
/** Familiar .NET spelling of the modern runtime class factory. */
export declare const DefineViewModel: typeof defineViewModel;
export {};
//# sourceMappingURL=generation.d.ts.map