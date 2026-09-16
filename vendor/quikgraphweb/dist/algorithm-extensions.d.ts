import { EqualityMap as Map } from './equality.js';
import * as Core from './core.js';
import * as Collections from './collections.js';
import * as Structural from './structural.js';
import * as Advanced from './advanced.js';
export declare function GetIndexer(dictionary: any): (key: any) => any;
export declare function GetVertexIdentity(graph: any): (value: any) => any;
export declare function GetEdgeIdentity(graph: any): (value: any) => any;
export declare function TreeBreadthFirstSearch(graph: any, root: any): {
    (vertex: any): any[] | undefined;
    algorithm: any;
    predecessors: any;
};
export declare function TreeDepthFirstSearch(graph: any, root: any): {
    (vertex: any): any[] | undefined;
    algorithm: any;
    predecessors: any;
};
/** Return the final loop-erased directed path from a vertex toward the requested root. */
export declare function TreeCyclePoppingRandom(graph: any, root: any, edgeChain?: Advanced.NormalizedMarkovEdgeChain): {
    (vertex: any): any[] | undefined;
    algorithm: Advanced.CyclePoppingRandomTreeAlgorithm;
    successors: Map;
};
export declare function ShortestPathsDijkstra(graph: any, weights: any, root: any): {
    (vertex: any): any[] | undefined;
    algorithm: any;
    predecessors: any;
};
export declare function ShortestPathsAStar(graph: any, weights: any, heuristic: any, root: any): {
    (vertex: any): any[] | undefined;
    algorithm: any;
    predecessors: any;
};
export declare function ShortestPathsBellmanFord(graph: any, weights: any, root: any): {
    (vertex: any): any[] | undefined;
    algorithm: any;
    predecessors: any;
} & {
    hasNegativeCycle: any;
};
export declare function ShortestPathsDag(graph: any, weights: any, root: any): {
    (vertex: any): any[] | undefined;
    algorithm: any;
    predecessors: any;
};
export declare function RankedShortestPathHoffmanPavley(graph: any, weights: any, root: any, target: any, pathCount?: number): any[];
export declare function Sinks(graph: any): any[];
export declare function Roots(graph: any): any[];
export declare function IsolatedVertices(graph: any): any[];
export declare function TopologicalSort(graph: any, output?: undefined): any;
export declare function SourceFirstTopologicalSort(graph: any, output?: undefined): any;
export declare function SourceFirstBidirectionalTopologicalSort(graph: any, direction?: number, output?: undefined): any[];
export declare function ConnectedComponents(graph: any, output?: Map): any;
export declare function StronglyConnectedComponents(graph: any, output?: Map): any;
export declare function WeaklyConnectedComponents(graph: any, output?: Map): any;
export declare function IncrementalConnectedComponents(graph: any): Structural.IncrementalConnectedComponentsAlgorithm;
export declare function CondensateStronglyConnected(graph: any, graphFactory?: undefined): Core.BidirectionalGraph | null;
export declare function CondensateWeaklyConnected(graph: any, graphFactory?: undefined): Core.BidirectionalGraph | null;
export declare function CondensateEdges(graph: any, vertexPredicate?: () => boolean): any;
export declare function OddVertices(graph: any): any[];
export declare function IsDirectedAcyclicGraph(value: any): boolean;
export declare function IsUndirectedAcyclicGraph(value: any): boolean;
export declare function ComputePredecessorCost(predecessors: any, weights: any, vertex: any): number;
export declare function ComputeDisjointSet(graph: any): Collections.ForestDisjointSet;
export declare function MinimumSpanningTreePrim(graph: any, weights: any): any[];
export declare function MinimumSpanningTreeKruskal(graph: any, weights: any): any[];
export declare function OfflineLeastCommonAncestor(graph: any, root: any, pairs: any): (pair: any) => any;
/** Additional .NET out value is exposed as `result.predecessors` on this record. */
export declare function MaximumFlow(graph: any, capacities: any, source: any, sink: any, edgeFactory: ((s: any, t: any) => Core.Edge) | undefined, augmentor: any): {
    value: number;
    predecessors: (vertex: any) => any;
    algorithm: Advanced.EdmondsKarpMaximumFlowAlgorithm;
};
export declare function ComputeTransitiveReduction(graph: any): Core.BidirectionalGraph;
export declare function ComputeTransitiveClosure(graph: any, edgeFactory?: (s: any, t: any) => Core.Edge): Core.BidirectionalGraph;
export declare function Clone(graph: any, vertexCloner: any, edgeCloner: any, clone: any): any;
export declare const AlgorithmExtensions: Readonly<{
    GetIndexer: typeof GetIndexer;
    GetVertexIdentity: typeof GetVertexIdentity;
    GetEdgeIdentity: typeof GetEdgeIdentity;
    TreeBreadthFirstSearch: typeof TreeBreadthFirstSearch;
    TreeDepthFirstSearch: typeof TreeDepthFirstSearch;
    TreeCyclePoppingRandom: typeof TreeCyclePoppingRandom;
    ShortestPathsDijkstra: typeof ShortestPathsDijkstra;
    ShortestPathsAStar: typeof ShortestPathsAStar;
    ShortestPathsBellmanFord: typeof ShortestPathsBellmanFord;
    ShortestPathsDag: typeof ShortestPathsDag;
    RankedShortestPathHoffmanPavley: typeof RankedShortestPathHoffmanPavley;
    Sinks: typeof Sinks;
    Roots: typeof Roots;
    IsolatedVertices: typeof IsolatedVertices;
    TopologicalSort: typeof TopologicalSort;
    SourceFirstTopologicalSort: typeof SourceFirstTopologicalSort;
    SourceFirstBidirectionalTopologicalSort: typeof SourceFirstBidirectionalTopologicalSort;
    ConnectedComponents: typeof ConnectedComponents;
    IncrementalConnectedComponents: typeof IncrementalConnectedComponents;
    StronglyConnectedComponents: typeof StronglyConnectedComponents;
    WeaklyConnectedComponents: typeof WeaklyConnectedComponents;
    CondensateStronglyConnected: typeof CondensateStronglyConnected;
    CondensateWeaklyConnected: typeof CondensateWeaklyConnected;
    CondensateEdges: typeof CondensateEdges;
    OddVertices: typeof OddVertices;
    IsDirectedAcyclicGraph: typeof IsDirectedAcyclicGraph;
    IsUndirectedAcyclicGraph: typeof IsUndirectedAcyclicGraph;
    ComputePredecessorCost: typeof ComputePredecessorCost;
    ComputeDisjointSet: typeof ComputeDisjointSet;
    MinimumSpanningTreePrim: typeof MinimumSpanningTreePrim;
    MinimumSpanningTreeKruskal: typeof MinimumSpanningTreeKruskal;
    OfflineLeastCommonAncestor: typeof OfflineLeastCommonAncestor;
    MaximumFlow: typeof MaximumFlow;
    ComputeTransitiveReduction: typeof ComputeTransitiveReduction;
    ComputeTransitiveClosure: typeof ComputeTransitiveClosure;
    Clone: typeof Clone;
}>;
