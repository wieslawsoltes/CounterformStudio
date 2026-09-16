import { EqualityMap as Map } from './equality.js';
export declare class VertexPredecessorRecorderObserver {
    VerticesPredecessors: any;
    constructor(verticesPredecessors?: Map);
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
    TryGetPath(vertex: any): any[] | undefined;
}
export declare class UndirectedVertexPredecessorRecorderObserver extends VertexPredecessorRecorderObserver {
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
    TryGetPath(vertex: any): any[] | undefined;
}
export declare class VertexDistanceRecorderObserver {
    EdgeWeights: any;
    DistanceRelaxer: any;
    Distances: any;
    constructor(edgeWeights: any, distanceRelaxer?: Readonly<{
        InitialDistance: 0;
        Compare: (a: any, b: any) => -1 | 0 | 1;
        Combine: (d: any, w: any) => any;
    }>, distances?: Map);
    _record(edge: any, source: any, target: any): void;
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
}
export declare class UndirectedVertexDistanceRecorderObserver extends VertexDistanceRecorderObserver {
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
}
export declare class VertexTimeStamperObserver {
    DiscoverTimes: any;
    FinishTimes: any;
    _currentTime: number;
    constructor(discoverTimes: any, finishTimes: any);
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
}
export declare class VertexRecorderObserver {
    Vertices: any[];
    constructor(vertices?: any[]);
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
}
export declare class EdgeRecorderObserver {
    Edges: any[];
    constructor(edges?: any[]);
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
}
export declare class VertexPredecessorPathRecorderObserver extends VertexPredecessorRecorderObserver {
    EndPathVertices: any[];
    constructor(...args: any[]);
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
    AllPaths(): Generator<any[], void, unknown>;
}
export declare class EdgePredecessorRecorderObserver {
    EdgesPredecessors: any;
    EndPathEdges: any[];
    constructor(edgesPredecessors?: Map);
    Attach(algorithm: any): {
        Dispose: () => void;
        dispose: () => void;
        unsubscribe: () => void;
    };
    Path(startingEdge: any): any[];
    AllPaths(): Generator<any[], void, unknown>;
    MergedPath(startingEdge: any, colors: any): any[];
    AllMergedPaths(): Generator<any[], void, unknown>;
}
