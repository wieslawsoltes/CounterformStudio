import { BehaviorSubject, Subject } from 'rxjs';
import { CompositeDisposable, Disposable } from './disposables.js';
/** Reference-counted activation. Every final release disposes the current activation scope. */
export class ViewModelActivator {
    blocks = new Map();
    activated = new Subject();
    deactivated = new Subject();
    active = new BehaviorSubject(false);
    references = 0;
    generation = 0;
    scope;
    disposed = false;
    get Activated() { return this.activated.asObservable(); }
    get Deactivated() { return this.deactivated.asObservable(); }
    get IsActive() { return this.active.asObservable(); }
    get IsActiveValue() { return this.active.value; }
    get ReferenceCount() { return this.references; }
    run(block, scope) {
        const childScope = new CompositeDisposable();
        scope.Add(childScope);
        try {
            const result = block(childScope);
            if (result)
                childScope.Add(result);
        }
        catch (error) {
            scope.Remove(childScope);
            throw error;
        }
    }
    AddActivationBlock(block) {
        if (this.disposed)
            throw new Error('Activator is disposed');
        const key = Symbol();
        this.blocks.set(key, block);
        if (this.scope) {
            try {
                this.run(block, this.scope);
            }
            catch (error) {
                this.blocks.delete(key);
                throw error;
            }
        }
        return Disposable.Create(() => this.blocks.delete(key));
    }
    Activate() {
        if (this.disposed)
            throw new Error('Activator is disposed');
        if (this.references === 0) {
            const scope = new CompositeDisposable();
            this.scope = scope;
            this.references = 1;
            this.generation++;
            try {
                for (const block of [...this.blocks.values()])
                    this.run(block, scope);
            }
            catch (error) {
                this.references = 0;
                this.scope = undefined;
                scope.Dispose();
                throw error;
            }
            this.active.next(true);
            this.activated.next();
        }
        else
            this.references++;
        const generation = this.generation;
        return Disposable.Create(() => { if (generation === this.generation)
            this.Deactivate(); });
    }
    Deactivate(ignoreRefCount = false) {
        if (!this.references)
            return;
        this.references = ignoreRefCount ? 0 : this.references - 1;
        if (this.references)
            return;
        const scope = this.scope;
        this.scope = undefined;
        this.generation++;
        try {
            scope?.Dispose();
        }
        finally {
            this.active.next(false);
            this.deactivated.next();
        }
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        try {
            this.Deactivate(true);
        }
        finally {
            this.blocks.clear();
            this.active.complete();
            this.activated.complete();
            this.deactivated.complete();
        }
    }
    unsubscribe() { this.Dispose(); }
}
export function WhenActivated(target, block) {
    return (target instanceof ViewModelActivator ? target : target.Activator).AddActivationBlock(block);
}
//# sourceMappingURL=activation.js.map