import { type IDisposable } from './disposables.js';
/** Explicit runtime tokens replace CLR Type values and erased JavaScript generics. */
export type BindingTypeToken<T = unknown> = string | symbol | Function;
export type ConversionResult<T = unknown> = {
    readonly Success: true;
    readonly Result: T;
    readonly success: true;
    readonly value: T;
} | {
    readonly Success: false;
    readonly Result?: undefined;
    readonly success: false;
    readonly value?: undefined;
    readonly Error?: unknown;
};
export declare const Conversion: Readonly<{
    Success<T>(value: T): ConversionResult<T>;
    Failure(error?: unknown): ConversionResult<never>;
}>;
export interface IBindingTypeConverter<TFrom = unknown, TTo = unknown> {
    readonly FromType: BindingTypeToken<TFrom>;
    readonly ToType: BindingTypeToken<TTo>;
    GetAffinityForObjects(): number;
    TryConvertTyped(value: TFrom, conversionHint?: unknown): ConversionResult<TTo>;
}
export interface IBindingFallbackConverter {
    GetAffinityForObjects(fromType: BindingTypeToken, toType: BindingTypeToken): number;
    TryConvert(fromType: BindingTypeToken, value: unknown, toType: BindingTypeToken, conversionHint?: unknown): ConversionResult;
}
export interface ISetMethodBindingConverter {
    GetAffinityForObjects(fromType: BindingTypeToken, toType: BindingTypeToken): number;
    PerformSet(target: unknown, value: unknown, arguments_?: readonly unknown[]): unknown;
}
/** Subclass for custom conversion or use the constructor with an explicit callback. */
export declare class BindingTypeConverter<TFrom = unknown, TTo = unknown> implements IBindingTypeConverter<TFrom, TTo> {
    readonly FromType: BindingTypeToken<TFrom>;
    readonly ToType: BindingTypeToken<TTo>;
    private readonly convert?;
    private readonly affinity;
    constructor(FromType: BindingTypeToken<TFrom>, ToType: BindingTypeToken<TTo>, convert?: ((value: TFrom, hint?: unknown) => ConversionResult<TTo>) | undefined, affinity?: number);
    GetAffinityForObjects(): number;
    TryConvertTyped(value: TFrom, hint?: unknown): ConversionResult<TTo>;
    TryConvert(value: TFrom, hint?: unknown): ConversionResult<TTo>;
}
declare class Registry<T> {
    protected readonly registrations: {
        value: T;
        identity: symbol;
    }[];
    Register(converter: T): IDisposable;
    GetAllConverters(): readonly T[];
    Clear(): void;
    protected highest(score: (value: T) => number): T | undefined;
}
export declare class TypedConverterRegistry extends Registry<IBindingTypeConverter<any, any>> {
    TryGetConverter(fromType: BindingTypeToken, toType: BindingTypeToken): IBindingTypeConverter<any, any> | undefined;
}
export declare class FallbackConverterRegistry extends Registry<IBindingFallbackConverter> {
    TryGetConverter(fromType: BindingTypeToken, toType: BindingTypeToken): IBindingFallbackConverter | undefined;
}
export declare class SetMethodConverterRegistry extends Registry<ISetMethodBindingConverter> {
    TryGetConverter(fromType: BindingTypeToken, toType: BindingTypeToken): ISetMethodBindingConverter | undefined;
}
export declare function GetBindingType(value: unknown): BindingTypeToken;
export interface ResolvedBindingConverter {
    TryConvert(value: unknown, conversionHint?: unknown): ConversionResult;
}
/** Selects typed exact-token converters before fallback converters. Conversion failures are data. */
export declare class ConverterService {
    private static current?;
    static get Current(): ConverterService;
    static set Current(value: ConverterService);
    readonly TypedConverters: TypedConverterRegistry;
    readonly FallbackConverters: FallbackConverterRegistry;
    readonly SetMethodConverters: SetMethodConverterRegistry;
    constructor(registerDefaults?: boolean);
    ResolveConverter(fromType: BindingTypeToken, toType: BindingTypeToken): ResolvedBindingConverter | undefined;
    ResolveSetMethodConverter(fromType: BindingTypeToken, toType: BindingTypeToken): ISetMethodBindingConverter | undefined;
    TryConvert<T = unknown>(value: unknown, toType: BindingTypeToken<T>, conversionHint?: unknown, fromType?: BindingTypeToken): ConversionResult<T>;
    Convert<T = unknown>(value: unknown, toType: BindingTypeToken<T>, conversionHint?: unknown, fromType?: BindingTypeToken): T;
}
export declare class EqualityTypeConverter implements IBindingFallbackConverter {
    GetAffinityForObjects(fromType: BindingTypeToken, toType: BindingTypeToken): number;
    TryConvert(fromType: BindingTypeToken, value: unknown, toType: BindingTypeToken): ConversionResult;
}
export declare class StringConverter implements IBindingFallbackConverter {
    GetAffinityForObjects(fromType: BindingTypeToken, toType: BindingTypeToken): number;
    TryConvert(_fromType: BindingTypeToken, value: unknown, toType: BindingTypeToken): ConversionResult<string>;
}
export declare class StringToNumberConverter extends BindingTypeConverter<string, number> {
    constructor();
}
export declare class NumberToStringConverter extends BindingTypeConverter<number, string> {
    constructor();
}
export declare class StringToBooleanConverter extends BindingTypeConverter<string, boolean> {
    constructor();
}
export declare class NumberToBooleanConverter extends BindingTypeConverter<number, boolean> {
    constructor();
}
export declare class StringToDateConverter extends BindingTypeConverter<string, Date> {
    constructor();
}
export declare class DateToStringConverter extends BindingTypeConverter<Date, string> {
    constructor();
}
export declare function RegisterDefaultConverters(service: ConverterService): IDisposable;
export interface BindingHookContext {
    readonly ViewModel: object;
    readonly View: object;
    readonly SourceProperty: string;
    readonly TargetProperty: string;
    readonly Direction: 'OneWay' | 'TwoWay';
}
export interface IPropertyBindingHook {
    ExecuteHook(context: BindingHookContext): boolean;
}
/** Providers may reject a binding before any subscriptions or event handlers are installed. */
export declare class PropertyBindingHookRegistry {
    static Current: PropertyBindingHookRegistry;
    private readonly hooks;
    Register(hook: IPropertyBindingHook): IDisposable;
    ExecuteHooks(context: BindingHookContext): boolean;
}
export { TypedConverterRegistry as BindingTypeConverterRegistry, FallbackConverterRegistry as BindingFallbackConverterRegistry, SetMethodConverterRegistry as SetMethodBindingConverterRegistry };
export declare class RxConverters {
    static get Services(): ConverterService;
    static set Services(value: ConverterService);
}
//# sourceMappingURL=converters.d.ts.map