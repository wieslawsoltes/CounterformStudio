import { Observable } from 'rxjs';
import { type ChangeSet as DynamicChangeSetType } from '@wieslawsoltes/dynamicdataweb';
import { ObservableCollection, type ChangeSet as ReactiveChangeSet } from './collections.js';
import type { IDisposable } from './disposables.js';
export * from '@wieslawsoltes/dynamicdataweb';
export * as DynamicData from '@wieslawsoltes/dynamicdataweb';
export type DynamicDataSource<T, K = unknown> = Observable<DynamicChangeSetType<T, K>> | {
    Connect(): Observable<DynamicChangeSetType<T, K>>;
} | {
    Connect(): Observable<ReactiveChangeSet<T>>;
};
/** Convert the legacy collection protocol, retaining indices, duplicate occurrences and Edit batches. */
export declare function ToDynamicDataChangeSet<T>(source: {
    Connect(): Observable<ReactiveChangeSet<T>>;
} | Observable<ReactiveChangeSet<T>>): Observable<DynamicChangeSetType<T>>;
/** ReactiveUI-style name for converting an ObservableCollection to DynamicData's change sets. */
export declare const ToObservableChangeSet: typeof ToDynamicDataChangeSet;
/** Connect to native DynamicData sources or normalize the legacy ReactiveWeb protocol. */
export declare function ConnectDynamicData<T, K = unknown>(source: DynamicDataSource<T, K>): Observable<DynamicChangeSetType<T, K>>;
/** Apply native changes directly. Cache keys identify entries even when multiple keys share one object. */
export declare function ApplyDynamicDataChanges<T, K>(target: ObservableCollection<T>, changes: DynamicChangeSetType<T, K>): void;
export interface IChangeSetBinding<T> extends IDisposable {
    readonly Collection: ObservableCollection<T>;
    readonly Errors: Observable<unknown>;
    readonly IsDisposed: boolean;
    unsubscribe(): void;
}
/** One batch becomes one collection Edit. Disposing releases only this binding and its owned target. */
export declare function BindChangeSet<T, K = unknown>(source: DynamicDataSource<T, K>, target?: ObservableCollection<T>): IChangeSetBinding<T>;
export declare const ToReactiveCollection: typeof BindChangeSet;
//# sourceMappingURL=dynamic-data.d.ts.map