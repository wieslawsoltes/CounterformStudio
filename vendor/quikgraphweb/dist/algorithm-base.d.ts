import { EqualityMap as Map, valueEquals } from './equality.js';
import { EventHook } from './core.js';
export { requireValue } from './core.js';
export { GraphColor } from './core.js';
export declare const ComputationState: Readonly<{
    NotRunning: 0;
    Running: 1;
    PendingAbortion: 2;
    Finished: 3;
    Aborted: 4;
}>;
export declare class OperationCanceledException extends Error {
    constructor(message?: string);
}
export declare function algorithmError(name: any, message: any): any;
export declare const sameVertex: typeof valueEquals;
export declare function events(owner: any, names: any): void;
export declare class CancelManager {
    IsCancelling: boolean;
    CancelRequested: EventHook;
    CancelReset: EventHook;
    Cancelling: EventHook;
    constructor();
    Cancel(): void;
    ResetCancel(): void;
}
export declare class AlgorithmServices {
    Host: any;
    constructor(host: any);
    get CancelManager(): any;
}
export declare class AlgorithmBase {
    VisitedGraph: any;
    State: number;
    SyncRoot: {};
    _services: Map;
    Services: AlgorithmServices;
    constructor(host: any, graph: any);
    TryGetService(type: any): any;
    GetService(type: any): any;
    Compute(...args: any[]): any;
    Abort(): void;
    ThrowIfCancellationRequested(): void;
    OnStateChanged(args?: {}): void;
    OnStarted(args?: {}): void;
    OnFinished(args?: {}): void;
    OnAborted(args?: {}): void;
    Initialize(): void;
    InternalCompute(): void;
    Clean(): void;
}
export declare class RootedAlgorithmBase extends AlgorithmBase {
    _hasRoot: boolean;
    _root: any;
    constructor(...args: any[]);
    TryGetRootVertex(): any;
    SetRootVertex(root: any): void;
    ClearRootVertex(): void;
    OnRootVertexChanged(args?: {}): void;
    AssertRootInGraph(root: any): void;
    GetAndAssertRootInGraph(): any;
    Compute(root?: any): any;
}
export declare class RootedSearchAlgorithmBase extends RootedAlgorithmBase {
    _hasTarget: boolean;
    _target: any;
    constructor(...args: any[]);
    TryGetTargetVertex(): any;
    SetTargetVertex(target: any): void;
    ClearTargetVertex(): void;
    Compute(root?: any, target?: any): any;
    OnTargetVertexChanged(args?: {}): void;
    OnTargetReached(): void;
}
declare const compare: (a: any, b: any) => -1 | 0 | 1;
export declare const DistanceRelaxers: Readonly<{
    ShortestDistance: Readonly<{
        InitialDistance: number;
        Compare: typeof compare;
        Combine: (d: any, w: any) => any;
    }>;
    CriticalDistance: Readonly<{
        InitialDistance: number;
        Compare: (a: any, b: any) => number;
        Combine: (d: any, w: any) => any;
    }>;
    EdgeShortestDistance: Readonly<{
        InitialDistance: 0;
        Compare: typeof compare;
        Combine: (d: any, w: any) => any;
    }>;
    Prim: Readonly<{
        InitialDistance: number;
        Compare: typeof compare;
        Combine: (_d: any, w: any) => any;
    }>;
}>;
/** Stable binary min heap. Lazy decrease-key gives O((V+E) log E) shortest paths. */
export declare class AlgorithmHeap {
    items: any[];
    compareItems: (a: any, b: any) => number;
    sequence: number;
    constructor(compareItems?: (a: any, b: any) => number);
    get Count(): number;
    _compare(a: any, b: any): number;
    Enqueue(value: any): void;
    Dequeue(): any;
}
