/** Advanced algorithms ported from QuikGraph (MS-PL); see NOTICE. */
import { Edge, BidirectionalGraph } from './core.js';
import { AlgorithmBase, RootedAlgorithmBase } from './algorithm-base.js';
import { ShortestPathAlgorithmBase } from './shortest-paths.js';
import { EqualityMap as Map, EqualitySet as Set } from './equality.js';
declare const edgeFactory: (source: any, target: any) => Edge;
export declare class ReversedEdgeAugmentorAlgorithm {
    VisitedGraph: any;
    EdgeFactory: any;
    ReversedEdges: Map;
    _augmented: any[];
    Augmented: boolean;
    constructor(graph: any, factory?: typeof edgeFactory);
    get AugmentedEdges(): any[];
    AddReversedEdges(): void;
    RemoveReversedEdges(): void;
    Dispose(): void;
}
export declare class MaximumFlowAlgorithm extends AlgorithmBase {
    Capacities: any;
    EdgeFactory: any;
    Predecessors: Map;
    ResidualCapacities: Map;
    ReversedEdges: Map;
    VerticesColors: Map;
    MaxFlow: number;
    Source: any;
    Sink: any;
    constructor(...args: any[]);
    GetVertexColor(vertex: any): any;
    Compute(source: any, sink: any): number;
}
export declare class EdmondsKarpMaximumFlowAlgorithm extends MaximumFlowAlgorithm {
    _reverser: any;
    ReversedEdges: any;
    Flows: Map;
    constructor(...args: any[]);
    Initialize(): void;
    InternalCompute(): void;
}
export declare class GraphAugmentorAlgorithmBase extends AlgorithmBase {
    VertexFactory: any;
    EdgeFactory: any;
    SuperSource: any;
    SuperSink: any;
    Augmented: boolean;
    _augmented: any[];
    _originalVertices: any[] | undefined;
    constructor(...args: any[]);
    get AugmentedEdges(): any[];
    InternalCompute(): void;
    AddAugmentedEdge(source: any, target: any): any;
    AugmentGraph(): void;
    Rollback(): void;
    Dispose(): void;
}
export declare class AllVerticesGraphAugmentorAlgorithm extends GraphAugmentorAlgorithmBase {
    AugmentGraph(): void;
}
export declare class MultiSourceSinkGraphAugmentorAlgorithm extends GraphAugmentorAlgorithmBase {
    AugmentGraph(): void;
}
export declare class BipartiteToMaximumFlowGraphAugmentorAlgorithm extends GraphAugmentorAlgorithmBase {
    SourceToVertices: any;
    VerticesToSink: any;
    constructor(...args: any[]);
    AugmentGraph(): void;
}
export declare class GraphBalancerAlgorithm {
    VisitedGraph: any;
    Source: any;
    Sink: any;
    VertexFactory: any;
    EdgeFactory: any;
    Capacities: any;
    _preFlow: Map;
    Balanced: boolean;
    SurplusVertices: any[];
    DeficientVertices: any[];
    SurplusEdges: any[];
    DeficientEdges: any[];
    BalancingSource: any;
    BalancingSink: any;
    _balancingAddedVertices: any[] | undefined;
    _balancingAddedEdges: Set | undefined;
    BalancingSourceEdge: any;
    BalancingSinkEdge: any;
    constructor(graph: any, source: any, sink: any, vertexFactory: any, factory: typeof edgeFactory | undefined, capacities: any);
    GetBalancingIndex(v: any): number;
    Balance(): void;
    UnBalance(): void;
}
export declare class MaximumBipartiteMatchingAlgorithm extends AlgorithmBase {
    SourceToVertices: any;
    VerticesToSink: any;
    VertexFactory: any;
    EdgeFactory: any;
    _matchedEdges: any[];
    constructor(graph: any, left: any, right: any, vertexFactory?: () => symbol, factory?: typeof edgeFactory);
    get MatchedEdges(): any[];
    Initialize(): void;
    InternalCompute(): void;
}
export declare const HungarianSteps: Readonly<{
    Init: 0;
    Step1: 1;
    Step2: 2;
    Step3: 3;
    Step4: 4;
    End: 5;
}>;
export declare class HungarianIteration {
    Matrix: any;
    Mask: any;
    RowsCovered: any;
    ColumnsCovered: any;
    Step: any;
    constructor(matrix: any, mask: any, rowsCovered: any, columnsCovered: any, step: any);
}
export declare class HungarianAlgorithm {
    _height: number;
    _width: any;
    _costs: any[];
    _step: number;
    AgentsTasks: number[] | undefined;
    _mask: any[][] | undefined;
    _rows: any[] | undefined;
    _cols: any[] | undefined;
    _start: number[] | undefined;
    static Steps: Readonly<{
        Init: 0;
        Step1: 1;
        Step2: 2;
        Step3: 3;
        Step4: 4;
        End: 5;
    }>;
    constructor(costs: any);
    Compute(): number[] | undefined;
    GetIterations(): Generator<HungarianIteration, void, unknown>;
    _doStep(): number;
}
export declare class Partition {
    VertexSetA: Set;
    VertexSetB: Set;
    CutCost: any;
    constructor(vertexSetA: any, vertexSetB: any, cutCost: any);
    static AreEquivalent(a: any, b: any): boolean;
}
export declare const PartitionHelpers: Readonly<{
    AreEquivalent: typeof Partition.AreEquivalent;
}>;
/** TSP work-item ordering, exposed for the upstream internal priority tests. */
export declare class TaskPriority {
    _cost: any;
    _pathSize: any;
    constructor(cost: any, pathSize: any);
    Equals(other: any): boolean;
    CompareTo(other: any): number;
    GetHashCode(): number;
}
export declare class KernighanLinAlgorithm extends AlgorithmBase {
    _iterations: number;
    Partition: Partition | undefined;
    constructor(graph: any, nbIterations?: number);
    InternalCompute(): void;
}
export declare class TSP extends ShortestPathAlgorithmBase {
    BestCost: number;
    ResultPath: BidirectionalGraph | undefined;
    constructor(graph: any, weights: any);
    Initialize(): void;
    TryGetDistance(vertex: any): undefined;
    /** @returns {never} */
    GetVertexColor(vertex: any): never;
    InternalCompute(): void;
    _save(path: any, cost: any, vs: any): void;
}
export declare const ComponentWithEdges: Readonly<{
    NoComponent: 0;
    OneComponent: 1;
    ManyComponents: 2;
}>;
export declare class IsEulerianGraphAlgorithm {
    VisitedGraph: any;
    _adj: Map;
    constructor(graph: any);
    CheckComponentsWithEdges(): number;
    IsEulerian(): boolean;
    static IsEulerian(graph: any): boolean;
}
export declare class IsHamiltonianGraphAlgorithm {
    VisitedGraph: any;
    _adj: Map;
    constructor(graph: any);
    GetPermutations(): any[][];
    EnumeratePermutations(): Generator<any[], void, unknown>;
    IsHamiltonian(): any;
    static IsHamiltonian(graph: any): any;
}
export declare class EulerianTrailAlgorithm extends RootedAlgorithmBase {
    _circuit: any[];
    _temporaryEdges: any[];
    constructor(...args: any[]);
    get Circuit(): any[];
    Initialize(): void;
    InternalCompute(): void;
    static ComputeEulerianPathCount(graph: any): number;
    AddTemporaryEdges(factory: any): any[];
    RemoveTemporaryEdges(): void;
    Trails(startingVertex: any): Generator<any[], void, unknown>;
    _trails(startingVertex: any): Generator<any[], void, unknown>;
}
export declare class VertexColoringAlgorithm extends AlgorithmBase {
    Colors: Map;
    constructor(graph: any);
    Initialize(): void;
    InternalCompute(): void;
}
export declare class MinimumVertexCoverApproximationAlgorithm extends AlgorithmBase {
    _rng: any;
    _cover: any[];
    constructor(graph: any, rng?: () => number);
    get CoverSet(): any[] | null;
    Initialize(): void;
    InternalCompute(): void;
}
export declare class MaximumCliqueAlgorithmBase extends AlgorithmBase {
}
/** Optional concrete extension: exact Bron-Kerbosch maximum-clique search. */
export declare class BronKerboschMaximumCliqueAlgorithm extends MaximumCliqueAlgorithmBase {
    MaximumClique: any[];
    MaximalCliques: any[];
    constructor(...args: any[]);
    Initialize(): void;
    InternalCompute(): void;
}
export declare class MarkovEdgeChainBase {
    Rand: () => number;
    constructor();
    TryGetSuccessor(...args: any[]): any;
}
export declare class NormalizedMarkovEdgeChain extends MarkovEdgeChainBase {
    TryGetSuccessor(graphOrEdges: any, vertex: any): any;
}
export declare class RoundRobinEdgeChain {
    _indices: Map;
    constructor();
    TryGetSuccessor(graphOrEdges: any, vertex: any): any;
}
export declare class WeightedMarkovEdgeChainBase extends MarkovEdgeChainBase {
    Weights: any;
    constructor(weights: any);
    GetWeights(es: any): number;
    GetOutWeight(graph: any, vertex: any): number;
    _choose(es: any): any;
}
export declare class WeightedMarkovEdgeChain extends WeightedMarkovEdgeChainBase {
    TryGetSuccessor(graphOrEdges: any, vertex: any): any;
}
export declare class VanishingWeightedMarkovEdgeChain extends WeightedMarkovEdgeChainBase {
    Factor: number;
    constructor(weights: any, factor?: number);
    TryGetSuccessor(graphOrEdges: any, vertex: any): any;
}
export declare class RandomWalkAlgorithm extends RootedAlgorithmBase {
    EndPredicate: any;
    _chain: any;
    constructor(graph: any, chain?: NormalizedMarkovEdgeChain);
    get EdgeChain(): any;
    set EdgeChain(value: any);
    InternalCompute(): void;
    Generate(root: any, walkCount?: number): void;
}
export declare class CyclePoppingRandomTreeAlgorithm extends RootedAlgorithmBase {
    EdgeChain: any;
    _rand: () => number;
    VerticesColors: Map;
    Successors: Map;
    constructor(...args: any[]);
    get Rand(): () => number;
    set Rand(value: () => number);
    GetVertexColor(v: any): any;
    Initialize(): void;
    _makeTreeRoot(vertex: any): void;
    _closedClasses(): any[][];
    _seedClosedClasses(): void;
    InternalCompute(): void;
    RandomTreeWithRoot(root: any): this;
    RandomTree(): this;
}
export declare class TransitionFactoryImplicitGraph {
    _factories: any[];
    _cache: Map;
    _pending: Map;
    _vertexPredicate: () => boolean;
    _edgePredicate: () => boolean;
    constructor();
    get IsDirected(): boolean;
    get AllowParallelEdges(): boolean;
    get SuccessorVertexPredicate(): () => boolean;
    set SuccessorVertexPredicate(v: () => boolean);
    get SuccessorEdgePredicate(): () => boolean;
    set SuccessorEdgePredicate(v: () => boolean);
    AddTransitionFactory(factory: any): void;
    AddTransitionFactories(factories: any): void;
    RemoveTransitionFactory(factory: any): boolean;
    ClearTransitionFactories(): void;
    ContainsTransitionFactory(factory: any): boolean;
    ContainsVertex(vertex: any): boolean;
    TryGetOutEdges(vertex: any): any;
    OutEdges(vertex: any): any;
    OutDegree(vertex: any): any;
    IsOutEdgesEmpty(vertex: any): boolean;
    OutEdge(vertex: any, index: any): any;
}
export declare class DefaultFinishedPredicate {
    MaxVertexCount: number;
    MaxEdgeCount: number;
    constructor(maxVertexCount?: number, maxEdgeCount?: number);
    Test(algorithm: any): boolean;
}
export declare class CloneableVertexGraphExplorerAlgorithm extends RootedAlgorithmBase {
    _factories: any[];
    _queue: any[];
    FinishedSuccessfully: boolean;
    _addVertexPredicate: any;
    _exploreVertexPredicate: any;
    _addEdgePredicate: any;
    _finishedPredicate: any;
    static DefaultFinishedPredicate: typeof DefaultFinishedPredicate;
    constructor(...args: any[]);
    get AddVertexPredicate(): any;
    set AddVertexPredicate(value: any);
    get ExploreVertexPredicate(): any;
    set ExploreVertexPredicate(value: any);
    get AddEdgePredicate(): any;
    set AddEdgePredicate(value: any);
    get FinishedPredicate(): any;
    set FinishedPredicate(value: any);
    get UnExploredVertices(): any[];
    AddTransitionFactory(factory: any): void;
    AddTransitionFactories(factories: any): void;
    RemoveTransitionFactory(factory: any): boolean;
    ClearTransitionFactories(): void;
    ContainsTransitionFactory(f: any): boolean;
    Compute(root: any): AlgorithmBase;
    InternalCompute(): void;
}
export {};
