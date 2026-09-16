import { Observable } from 'rxjs';
import { ReactiveObject } from './reactive-object.js';
import { type IDisposable } from './disposables.js';
export interface ValidationState {
    readonly IsValid: boolean;
    readonly Text: readonly string[];
    readonly IsPending: boolean;
}
export type ValidationResult = boolean | string | readonly string[] | ValidationState;
export type ValidationPredicate<T> = (value: T) => ValidationResult | PromiseLike<ValidationResult> | Observable<ValidationResult>;
export interface IValidatableViewModel {
    readonly ValidationContext: ValidationContext;
}
export interface ValidationComponent extends IDisposable {
    readonly PropertyName: string;
    readonly ValidationStatusChange: Observable<ValidationState>;
    readonly State: ValidationState;
}
/** Aggregates live rules. Pending validation deliberately prevents submission. */
export declare class ValidationContext implements IDisposable {
    private readonly rules;
    private readonly state;
    private disposed;
    readonly ValidationStatusChange: Observable<ValidationState>;
    readonly IsValid: Observable<boolean>;
    readonly IsPending: Observable<boolean>;
    readonly Text: Observable<readonly string[]>;
    get State(): ValidationState;
    get IsValidValue(): boolean;
    get IsPendingValue(): boolean;
    get Validations(): readonly ValidationComponent[];
    get HasErrors(): boolean;
    Add(rule: ValidationComponent): IDisposable;
    Remove(rule: ValidationComponent): boolean;
    GetErrors(propertyName?: string): readonly string[];
    ObserveErrors(propertyName?: string): Observable<readonly string[]>;
    private refresh;
    Dispose(): void;
    unsubscribe(): void;
}
export declare class PropertyValidationRule<T = unknown> implements ValidationComponent {
    readonly PropertyName: string;
    private readonly state;
    private readonly subscription;
    private registration?;
    private disposed;
    readonly ValidationStatusChange: Observable<ValidationState>;
    get State(): ValidationState;
    constructor(context: ValidationContext, PropertyName: string, values: Observable<T>, predicate: ValidationPredicate<T>, message?: string);
    Dispose(): void;
    unsubscribe(): void;
}
/** A .NET-style extension-function equivalent. Async rules cancel obsolete subscriptions. */
export declare function ValidationRule<T = unknown>(viewModel: object & IValidatableViewModel, propertyName: string, predicate: ValidationPredicate<T>, message?: string): PropertyValidationRule<T>;
export declare class ReactiveValidationObject extends ReactiveObject implements IValidatableViewModel {
    readonly ValidationContext: ValidationContext;
    get HasErrors(): boolean;
    GetErrors(propertyName?: string): readonly string[];
    ValidationRule<T = unknown>(propertyName: string, predicate: ValidationPredicate<T>, message?: string): PropertyValidationRule<T>;
    Dispose(): void;
}
//# sourceMappingURL=validation.d.ts.map