/** Structural graph algorithms ported from QuikGraph (MS-PL).
 * Iterative traversals avoid browser call-stack limits. Explicit vertex equality is retained.
 */
import { EqualityMap as Map } from './equality.js';
import { AlgorithmBase, RootedAlgorithmBase } from './algorithm-base.js';
import { Edge, BidirectionalGraph, EventHook } from './core.js';
declare class DisjointSets {
    parents: Map;
    ranks: Map;
    count: number;
    constructor(values?: any[]);
    add(v: any): void;
    find(v: any): any;
    union(a: any, b: any): boolean;
}
declare class ComponentsBase extends AlgorithmBase {
    Components: any;
    _componentMap: Map;
    ComponentCount: number;
    constructor(...args: any[]);
    Initialize(): void;
    Clean(): void;
    get Graphs(): BidirectionalGraph[];
}
export declare class ConnectedComponentsAlgorithm extends ComponentsBase {
    InternalCompute(): void;
}
export declare class WeaklyConnectedComponentsAlgorithm extends ConnectedComponentsAlgorithm {
}
export declare class StronglyConnectedComponentsAlgorithm extends ComponentsBase {
    Roots: Map;
    DiscoverTimes: Map;
    Steps: number;
    ComponentsPerStep: any[] | null;
    VerticesPerStep: any[] | null;
    constructor(...args: any[]);
    Initialize(): void;
    InternalCompute(): void;
}
export declare class IncrementalConnectedComponentsAlgorithm extends AlgorithmBase {
    _sets: DisjointSets | null;
    _subscriptions: any[];
    constructor(...args: any[]);
    InternalCompute(): void;
    get ComponentCount(): number;
    GetComponents(): {
        Key: number;
        Value: Map;
    };
    Dispose(): void;
}
export declare const TopologicalSortDirection: Readonly<{
    Forward: 0;
    Backward: 1;
}>;
export declare class TopologicalSortAlgorithm extends AlgorithmBase {
    SortedVertices: any[] | null;
    DiscoverVertex: EventHook;
    FinishVertex: EventHook;
    constructor(graph: any, capacity?: number);
    Initialize(): void;
    InternalCompute(): void;
}
export declare class UndirectedTopologicalSortAlgorithm extends TopologicalSortAlgorithm {
    _undirected: boolean;
    AllowCyclicGraph: boolean;
    constructor(graph: any, capacity?: number);
}
export declare class SourceFirstTopologicalSortAlgorithm extends AlgorithmBase {
    SortedVertices: any[] | null;
    InDegrees: Map;
    VertexAdded: EventHook;
    _direction: number;
    constructor(graph: any, capacity?: number);
    Initialize(): void;
    InternalCompute(): void;
}
export declare class SourceFirstBidirectionalTopologicalSortAlgorithm extends SourceFirstTopologicalSortAlgorithm {
    _direction: 0 | 1;
    constructor(graph: any, direction?: 0, capacity?: number);
}
export declare class UndirectedFirstTopologicalSortAlgorithm extends AlgorithmBase {
    SortedVertices: any[] | null;
    Degrees: Map;
    AllowCyclicGraph: boolean;
    VertexAdded: EventHook;
    constructor(graph: any, capacity?: number);
    Initialize(): void;
    InternalCompute(): void;
}
declare class MinimumSpanningTreeBase extends AlgorithmBase {
    _edgeWeights: any;
    ExamineEdge: EventHook;
    TreeEdge: EventHook;
    SpanningTree: any[];
    constructor(...args: any[]);
    Initialize(): void;
    _add(edge: any): void;
}
export declare class KruskalMinimumSpanningTreeAlgorithm extends MinimumSpanningTreeBase {
    InternalCompute(): void;
}
export declare class PrimMinimumSpanningTreeAlgorithm extends MinimumSpanningTreeBase {
    InternalCompute(): void;
}
export declare class CondensedEdge extends Edge {
    Edges: any[];
    constructor(source: any, target: any);
}
export declare class MergedEdge extends Edge {
    Edges: any[];
    constructor(source: any, target: any);
    static Merge(inEdge: any, outEdge: any): MergedEdge;
}
export declare class CondensationGraphAlgorithm extends AlgorithmBase {
    StronglyConnected: boolean;
    CondensedGraph: BidirectionalGraph | null;
    GraphFactory: any;
    constructor(graph: any, graphFactory?: () => BidirectionalGraph);
    InternalCompute(): void;
}
export declare class EdgeMergeCondensationGraphAlgorithm extends AlgorithmBase {
    CondensedGraph: any;
    VertexPredicate: any;
    constructor(graph: any, condensedGraph: any, vertexPredicate: any);
    InternalCompute(): void;
}
export declare class TransitiveClosureAlgorithm extends AlgorithmBase {
    _createEdge: any;
    TransitiveClosure: BidirectionalGraph;
    constructor(graph: any, edgeFactory: any);
    InternalCompute(): void;
}
export declare class TransitiveReductionAlgorithm extends AlgorithmBase {
    TransitiveReduction: BidirectionalGraph;
    constructor(graph: any);
    InternalCompute(): void;
}
export declare class PageRankAlgorithm extends AlgorithmBase {
    Ranks: Map;
    _damping: number;
    _tolerance: number;
    _maxIterations: number;
    Iterations: number;
    constructor(graph: any);
    get Damping(): number;
    set Damping(value: number);
    get Tolerance(): number;
    set Tolerance(value: number);
    get MaxIterations(): number;
    set MaxIterations(value: number);
    Initialize(): void;
    InternalCompute(): void;
    GetRanksSum(): number;
    GetRanksMean(): number;
}
declare class VertexPairMap extends Map {
    _keys: Map;
    constructor();
    _key(pair: any): any;
    get(pair: any): any;
    has(pair: any): boolean;
    set(pair: any, value: any): this;
    delete(pair: any): boolean;
    clear(): void;
}
export declare class TarjanOfflineLeastCommonAncestorAlgorithm extends RootedAlgorithmBase {
    Ancestors: VertexPairMap;
    _pairs: any[] | undefined;
    constructor(...args: any[]);
    TryGetVertexPairs(): any[] | undefined;
    SetVertexPairs(pairs: any): void;
    Compute(...args: any[]): this;
    Initialize(): void;
    InternalCompute(): void;
}
export declare class RandomGraphFactory {
    static GetVertex(graphOrVertices: any, countOrRng: any, rng: any): any;
    static GetEdge(graphOrEdges: any, countOrRng: any, rng: any): any;
    static Create(graph: any, vertexFactory: any, edgeFactory: any, rng: any, vertexCount: any, edgeCount: any, selfEdges: any): any;
}
export {};
