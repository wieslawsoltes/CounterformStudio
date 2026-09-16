import { Disposable } from './disposables.js';
export const Conversion = Object.freeze({
    Success(value) { return { Success: true, Result: value, success: true, value }; },
    Failure(error) { return { Success: false, success: false, Error: error }; },
});
/** Subclass for custom conversion or use the constructor with an explicit callback. */
export class BindingTypeConverter {
    FromType;
    ToType;
    convert;
    affinity;
    constructor(FromType, ToType, convert, affinity = 10) {
        this.FromType = FromType;
        this.ToType = ToType;
        this.convert = convert;
        this.affinity = affinity;
    }
    GetAffinityForObjects() { return this.affinity; }
    TryConvertTyped(value, hint) {
        if (!this.convert)
            return Conversion.Failure(new Error('Override TryConvertTyped or provide a conversion callback.'));
        try {
            return this.convert(value, hint);
        }
        catch (error) {
            return Conversion.Failure(error);
        }
    }
    TryConvert(value, hint) { return this.TryConvertTyped(value, hint); }
}
class Registry {
    registrations = [];
    Register(converter) {
        if (!converter)
            throw new TypeError('A converter is required.');
        const entry = { value: converter, identity: Symbol() };
        this.registrations.push(entry);
        return Disposable.Create(() => { const index = this.registrations.indexOf(entry); if (index >= 0)
            this.registrations.splice(index, 1); });
    }
    GetAllConverters() { return this.registrations.map(entry => entry.value); }
    Clear() { this.registrations.length = 0; }
    highest(score) {
        let winner, best = 0;
        // Equal affinity prefers the latest registration, supporting scoped overrides.
        for (const { value } of this.registrations) {
            const affinity = score(value);
            if (Number.isFinite(affinity) && affinity > 0 && affinity >= best) {
                best = affinity;
                winner = value;
            }
        }
        return winner;
    }
}
export class TypedConverterRegistry extends Registry {
    TryGetConverter(fromType, toType) {
        return this.highest(converter => converter.FromType === fromType && converter.ToType === toType ? converter.GetAffinityForObjects() : 0);
    }
}
export class FallbackConverterRegistry extends Registry {
    TryGetConverter(fromType, toType) { return this.highest(converter => converter.GetAffinityForObjects(fromType, toType)); }
}
export class SetMethodConverterRegistry extends Registry {
    TryGetConverter(fromType, toType) { return this.highest(converter => converter.GetAffinityForObjects(fromType, toType)); }
}
export function GetBindingType(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    switch (typeof value) {
        case 'string': return String;
        case 'number': return Number;
        case 'boolean': return Boolean;
        case 'bigint': return BigInt;
        case 'symbol': return Symbol;
        case 'function': return Function;
        default: return Object.getPrototypeOf(value)?.constructor ?? Object;
    }
}
/** Selects typed exact-token converters before fallback converters. Conversion failures are data. */
export class ConverterService {
    static current;
    static get Current() { return this.current ??= new ConverterService(); }
    static set Current(value) { this.current = value; }
    TypedConverters = new TypedConverterRegistry();
    FallbackConverters = new FallbackConverterRegistry();
    SetMethodConverters = new SetMethodConverterRegistry();
    constructor(registerDefaults = true) { if (registerDefaults)
        RegisterDefaultConverters(this); }
    ResolveConverter(fromType, toType) {
        const typed = this.TypedConverters.TryGetConverter(fromType, toType);
        if (typed)
            return { TryConvert: (value, hint) => typed.TryConvertTyped(value, hint) };
        const fallback = this.FallbackConverters.TryGetConverter(fromType, toType);
        if (fallback)
            return { TryConvert: (value, hint) => fallback.TryConvert(fromType, value, toType, hint) };
        return undefined;
    }
    ResolveSetMethodConverter(fromType, toType) { return this.SetMethodConverters.TryGetConverter(fromType, toType); }
    TryConvert(value, toType, conversionHint, fromType = GetBindingType(value)) {
        try {
            return (this.ResolveConverter(fromType, toType)?.TryConvert(value, conversionHint) ?? Conversion.Failure(new TypeError('No converter is registered for these types.')));
        }
        catch (error) {
            return Conversion.Failure(error);
        }
    }
    Convert(value, toType, conversionHint, fromType) {
        const result = this.TryConvert(value, toType, conversionHint, fromType);
        if (!result.Success)
            throw result.Error ?? new TypeError('The value cannot be converted.');
        return result.Result;
    }
}
export class EqualityTypeConverter {
    GetAffinityForObjects(fromType, toType) { return fromType === toType ? 1 : 0; }
    TryConvert(fromType, value, toType) {
        if (fromType !== toType)
            return Conversion.Failure();
        if (toType === Number && !Number.isFinite(value))
            return Conversion.Failure(new TypeError('Expected a finite number.'));
        if (toType === Date && (!(value instanceof Date) || Number.isNaN(value.getTime())))
            return Conversion.Failure(new TypeError('Expected a valid Date.'));
        return Conversion.Success(value);
    }
}
export class StringConverter {
    GetAffinityForObjects(fromType, toType) { return toType === String && [String, Number, Boolean, BigInt, 'null', 'undefined'].includes(fromType) ? 1 : 0; }
    TryConvert(_fromType, value, toType) {
        if (toType !== String)
            return Conversion.Failure();
        return Conversion.Success(value == null ? '' : String(value));
    }
}
export class StringToNumberConverter extends BindingTypeConverter {
    constructor() {
        super(String, Number, value => {
            if (typeof value !== 'string' || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))
                return Conversion.Failure(new TypeError('Expected a decimal number.'));
            const number = Number(value);
            return Number.isFinite(number) ? Conversion.Success(number) : Conversion.Failure(new TypeError('Expected a finite number.'));
        });
    }
}
export class NumberToStringConverter extends BindingTypeConverter {
    constructor() { super(Number, String, value => Number.isFinite(value) ? Conversion.Success(String(value)) : Conversion.Failure(new TypeError('Expected a finite number.'))); }
}
export class StringToBooleanConverter extends BindingTypeConverter {
    constructor() {
        super(String, Boolean, value => {
            if (typeof value !== 'string')
                return Conversion.Failure();
            const normalized = value.trim().toLowerCase();
            return normalized === 'true' || normalized === '1' ? Conversion.Success(true) : normalized === 'false' || normalized === '0' ? Conversion.Success(false) : Conversion.Failure(new TypeError('Expected true, false, 1 or 0.'));
        });
    }
}
export class NumberToBooleanConverter extends BindingTypeConverter {
    constructor() { super(Number, Boolean, value => value === 1 ? Conversion.Success(true) : value === 0 ? Conversion.Success(false) : Conversion.Failure(new TypeError('Expected 0 or 1.'))); }
}
export class StringToDateConverter extends BindingTypeConverter {
    constructor() {
        super(String, Date, value => {
            // Deterministic UTC parsing; local/culture date formats need an explicit custom converter.
            if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value))
                return Conversion.Failure(new TypeError('Expected an ISO UTC date.'));
            const date = new Date(value);
            return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10) ? Conversion.Success(date) : Conversion.Failure(new TypeError('Invalid calendar date.'));
        });
    }
}
export class DateToStringConverter extends BindingTypeConverter {
    constructor() { super(Date, String, value => value instanceof Date && Number.isFinite(value.getTime()) ? Conversion.Success(value.toISOString()) : Conversion.Failure(new TypeError('Expected a valid Date.'))); }
}
export function RegisterDefaultConverters(service) {
    const registrations = [new StringToNumberConverter(), new NumberToStringConverter(), new StringToBooleanConverter(), new NumberToBooleanConverter(), new StringToDateConverter(), new DateToStringConverter()].map(converter => service.TypedConverters.Register(converter));
    registrations.push(service.FallbackConverters.Register(new EqualityTypeConverter()), service.FallbackConverters.Register(new StringConverter()));
    return Disposable.Create(() => { for (const registration of registrations)
        registration.Dispose(); });
}
/** Providers may reject a binding before any subscriptions or event handlers are installed. */
export class PropertyBindingHookRegistry {
    static Current = new PropertyBindingHookRegistry();
    hooks = new Map();
    Register(hook) { const key = Symbol(); this.hooks.set(key, hook); return Disposable.Create(() => { this.hooks.delete(key); }); }
    ExecuteHooks(context) { return [...this.hooks.values()].every(hook => hook.ExecuteHook(context)); }
}
export { TypedConverterRegistry as BindingTypeConverterRegistry, FallbackConverterRegistry as BindingFallbackConverterRegistry, SetMethodConverterRegistry as SetMethodBindingConverterRegistry };
export class RxConverters {
    static get Services() { return ConverterService.Current; }
    static set Services(value) { ConverterService.Current = value; }
}
//# sourceMappingURL=converters.js.map