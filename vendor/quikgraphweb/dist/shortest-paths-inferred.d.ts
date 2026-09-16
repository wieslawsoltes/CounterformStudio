import { EqualityMap as Map } from './equality.js';
import { AlgorithmBase, RootedAlgorithmBase, RootedSearchAlgorithmBase } from './algorithm-base.js';
export declare function predecessorPath(predecessors: any, vertex: any, undirected?: boolean): any[] | undefined;
export declare class ShortestPathAlgorithmBase extends RootedAlgorithmBase {
    Weights: any;
    DistanceRelaxer: any;
    Distances: any;
    VerticesColors: any;
    Predecessors: Map;
    constructor(...input: any[]);
    TryGetDistance(v: any): any;
    GetDistance(v: any): any;
    GetDistances(): any;
    DistancesIndexGetter(): (vertex: any) => any;
    OnTreeEdge(edge: any, reversed?: boolean): void;
    GetVertexDistance(v: any): any;
    SetVertexDistance(v: any, distance: any): void;
    GetVertexColor(v: any): any;
    TryGetPath(v: any): any[] | undefined;
    Initialize(): void;
    _emitEdge(name: any, edge: any, source: any): void;
    Relax(edge: any, source?: any, target?: any): boolean;
}
export declare class UndirectedShortestPathAlgorithmBase extends ShortestPathAlgorithmBase {
    _undirected: boolean;
    constructor(...args: any[]);
}
export declare class DijkstraShortestPathAlgorithm extends ShortestPathAlgorithmBase {
    InternalCompute(): void;
    _fromRoot(root: any): void;
}
export declare class UndirectedDijkstraShortestPathAlgorithm extends DijkstraShortestPathAlgorithm {
    _undirected: boolean;
    constructor(...args: any[]);
}
export declare class AStarShortestPathAlgorithm extends DijkstraShortestPathAlgorithm {
    CostHeuristic: any;
    constructor(...input: any[]);
}
export declare class BellmanFordShortestPathAlgorithm extends ShortestPathAlgorithmBase {
    FoundNegativeCycle: boolean;
    constructor(...args: any[]);
    Initialize(): void;
    InternalCompute(): void;
    Clean(): void;
}
export declare class DagShortestPathAlgorithm extends ShortestPathAlgorithmBase {
    InternalCompute(): void;
}
export declare class FloydWarshallAllShortestPathAlgorithm extends AlgorithmBase {
    Weights: any;
    DistanceRelaxer: any;
    Distances: Map;
    _next: Map;
    constructor(...input: any[]);
    Initialize(): void;
    InternalCompute(): void;
    TryGetDistance(source: any, target: any): any;
    TryGetPath(source: any, target: any): any[] | undefined;
    Dump(writer: any): string;
}
export declare class SortedPath {
    Edges: any[];
    constructor(edges: any);
    get Count(): number;
    GetVertex(i: any): any;
    GetEdge(i: any): any;
    GetEdges(count: any): any[];
    Equals(other: any): boolean;
    GetHashCode(): any;
    [Symbol.iterator](): ArrayIterator<any>;
}
/** Yen: repeated Dijkstra spur searches, a persistent candidate heap and root-prefix exclusions. */
export declare class YenShortestPathsAlgorithm {
    VisitedGraph: any;
    Source: any;
    Target: any;
    K: any;
    Weights: (edge: any) => any;
    Filter: (paths: any) => any;
    static SortedPath: typeof SortedPath;
    constructor(graph: any, source: any, target: any, k: any, edgeWeights?: null, filter?: null);
    Execute(): any[];
}
export declare class RankedShortestPathAlgorithmBase extends RootedSearchAlgorithmBase {
    DistanceRelaxer: any;
    _shortestPathCount: number;
    ComputedShortestPaths: any[];
    constructor(...input: any[]);
    get ShortestPathCount(): number;
    set ShortestPathCount(value: number);
    get ComputedShortestPathCount(): number;
    AddComputedShortestPath(path: any): void;
    Initialize(): void;
}
/** Hoffman–Pavley builds the reverse shortest tree and enumerates its deviations. */
export declare class HoffmanPavleyRankedShortestPathAlgorithm extends RankedShortestPathAlgorithmBase {
    Weights: any;
    constructor(...input: any[]);
    InternalCompute(): void;
}
