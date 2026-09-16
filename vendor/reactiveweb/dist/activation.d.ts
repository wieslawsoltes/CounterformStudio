import { Observable } from 'rxjs';
import { CompositeDisposable, type IDisposable, type DisposableLike } from './disposables.js';
export type ActivationBlock = (disposables: CompositeDisposable) => void | DisposableLike;
export interface IActivatableViewModel {
    readonly Activator: ViewModelActivator;
}
/** Reference-counted activation. Every final release disposes the current activation scope. */
export declare class ViewModelActivator implements IDisposable {
    private readonly blocks;
    private readonly activated;
    private readonly deactivated;
    private readonly active;
    private references;
    private generation;
    private scope?;
    private disposed;
    get Activated(): Observable<void>;
    get Deactivated(): Observable<void>;
    get IsActive(): Observable<boolean>;
    get IsActiveValue(): boolean;
    get ReferenceCount(): number;
    private run;
    AddActivationBlock(block: ActivationBlock): IDisposable;
    Activate(): IDisposable;
    Deactivate(ignoreRefCount?: boolean): void;
    Dispose(): void;
    unsubscribe(): void;
}
export declare function WhenActivated(target: ViewModelActivator | IActivatableViewModel, block: ActivationBlock): IDisposable;
//# sourceMappingURL=activation.d.ts.map