import { EqualityMap as Map } from './equality.js';
export declare const GraphColor: Readonly<{
    White: 0;
    Gray: 1;
    Black: 2;
}>;
export declare class QuikGraphException extends Error {
    constructor(message: string | undefined, innerExceptionOrOptions: any);
    get Message(): string;
    get InnerException(): {} | null;
    get StackTrace(): string | undefined;
    ToString(): string;
}
export declare class VertexNotFoundException extends QuikGraphException {
}
export declare class NegativeCycleGraphException extends QuikGraphException {
}
export declare class NegativeWeightException extends QuikGraphException {
}
export declare class ParallelEdgeNotAllowedException extends QuikGraphException {
}
export declare class NegativeCapacityException extends QuikGraphException {
}
export declare class NoPathFoundException extends QuikGraphException {
}
export declare class NonStronglyConnectedGraphException extends QuikGraphException {
}
export declare class NonAcyclicGraphException extends QuikGraphException {
}
export declare class ArgumentException extends TypeError {
    constructor(message?: string);
}
export declare class ArgumentNullException extends ArgumentException {
}
export declare class ArgumentOutOfRangeException extends RangeError {
    constructor(message?: string);
}
export declare class InvalidOperationException extends Error {
    constructor(message?: string);
}
export declare class NotSupportedException extends Error {
    constructor(message?: string);
}
export declare function requireValue(value: any, name?: string): any;
export declare function equals(a: any, b: any): any;
export declare function defaultCompare(a: any, b: any): any;
/** Multicast event. Listeners run in registration order; duplicate registrations are supported. */
export declare class EventHook {
    _listeners: any[];
    constructor();
    add(listener: any): any;
    remove(listener: any): boolean;
    subscribe(listener: any): {
        dispose: () => void;
        unsubscribe: () => void;
        Dispose: () => void;
    };
    emit(...args: any[]): void;
    clear(): void;
    get Count(): number;
}
export declare class VertexEventArgs {
    Vertex: any;
    constructor(vertex: any);
}
export declare class EdgeEventArgs {
    Edge: any;
    constructor(edge: any);
}
export declare class UndirectedEdgeEventArgs extends EdgeEventArgs {
    Reversed: boolean;
    constructor(edge: any, reversed: any);
    get Source(): any;
    get Target(): any;
}
export declare class Edge {
    constructor(source: any, target: any, mode: any);
    Equals(other: any): boolean;
    GetHashCode(): any;
    ToString(): string;
    toString(): string;
}
export declare class EquatableEdge extends Edge {
    Equals(other: any): any;
    GetHashCode(): number;
}
export declare class SEdge extends Edge {
    constructor(source: any, target: any);
    Equals(other: any): any;
    GetHashCode(): number;
}
export declare class SEquatableEdge extends SEdge {
}
export declare class UndirectedEdge extends Edge {
    constructor(source: any, target: any, mode: any);
    ToString(): string;
}
export declare class EquatableUndirectedEdge extends UndirectedEdge {
    Equals(other: any): any;
    GetHashCode(): number;
}
export declare class SUndirectedEdge extends UndirectedEdge {
    constructor(source: any, target: any);
    Equals(other: any): any;
    GetHashCode(): number;
}
declare const TaggedEdge_base: {
    new (...args: any[]): {
        [x: string]: any;
        _tag: any;
        TagChanged: EventHook;
        get Tag(): any;
        set Tag(value: any);
        ToString(): string;
    };
    [x: string]: any;
};
export declare class TaggedEdge extends TaggedEdge_base {
}
declare const EquatableTaggedEdge_base: {
    new (...args: any[]): {
        [x: string]: any;
        _tag: any;
        TagChanged: EventHook;
        get Tag(): any;
        set Tag(value: any);
        ToString(): string;
    };
    [x: string]: any;
};
export declare class EquatableTaggedEdge extends EquatableTaggedEdge_base {
}
declare const STaggedEdge_base: {
    new (...args: any[]): {
        [x: string]: any;
        _tag: any;
        TagChanged: EventHook;
        get Tag(): any;
        set Tag(value: any);
        ToString(): string;
    };
    [x: string]: any;
};
export declare class STaggedEdge extends STaggedEdge_base {
    Equals(other: any): any;
    GetHashCode(): number;
}
declare const SEquatableTaggedEdge_base: {
    new (...args: any[]): {
        [x: string]: any;
        _tag: any;
        TagChanged: EventHook;
        get Tag(): any;
        set Tag(value: any);
        ToString(): string;
    };
    [x: string]: any;
};
export declare class SEquatableTaggedEdge extends SEquatableTaggedEdge_base {
}
declare const TaggedUndirectedEdge_base: {
    new (...args: any[]): {
        [x: string]: any;
        _tag: any;
        TagChanged: EventHook;
        get Tag(): any;
        set Tag(value: any);
        ToString(): string;
    };
    [x: string]: any;
};
export declare class TaggedUndirectedEdge extends TaggedUndirectedEdge_base {
}
declare const STaggedUndirectedEdge_base: {
    new (...args: any[]): {
        [x: string]: any;
        _tag: any;
        TagChanged: EventHook;
        get Tag(): any;
        set Tag(value: any);
        ToString(): string;
    };
    [x: string]: any;
};
export declare class STaggedUndirectedEdge extends STaggedUndirectedEdge_base {
    Equals(other: any): any;
    GetHashCode(): number;
}
export declare class TermEdge extends Edge {
    constructor(source: any, target: any, sourceTerminal?: number, targetTerminal?: number);
    ToString(): string;
}
export declare class EquatableTermEdge extends TermEdge {
    Equals(other: any): any;
    GetHashCode(): number;
}
export declare class SReversedEdge extends Edge {
    constructor(originalEdge: any);
    Equals(other: any): any;
    GetHashCode(): number;
    ToString(): string;
}
declare class GraphQueries {
    get IsVerticesEmpty(): boolean;
    get IsEdgesEmpty(): boolean;
    ContainsEdge(edgeOrSource: any, target: any): any;
    TryGetEdge(source: any, target: any): any;
    TryGetEdges(source: any, target: any): any;
    OutDegree(vertex: any): any;
    IsOutEdgesEmpty(vertex: any): boolean;
    OutEdge(vertex: any, index: any): any;
    InDegree(vertex: any): any;
    IsInEdgesEmpty(vertex: any): boolean;
    InEdge(vertex: any, index: any): any;
    Degree(vertex: any): any;
    AdjacentEdges(vertex: any): any;
    TryGetAdjacentEdges(vertex: any): any;
    AdjacentDegree(vertex: any): any;
    IsAdjacentEdgesEmpty(vertex: any): boolean;
    AdjacentEdge(vertex: any, index: any): any;
    AdjacentVertices(vertex: any): any[];
}
/** Mutable indexed directed multigraph. Vertex identity follows JavaScript Map semantics. */
export declare class AdjacencyGraph extends GraphQueries {
    AllowParallelEdges: any;
    EdgeCapacity: any;
    _out: Map;
    _in: Map;
    _count: number;
    VertexAdded: EventHook;
    VertexRemoved: EventHook;
    EdgeAdded: EventHook;
    EdgeRemoved: EventHook;
    constructor(allowParallelEdges?: boolean, vertexCapacity?: number, edgeCapacity?: number);
    get IsDirected(): boolean;
    get VertexType(): ObjectConstructor;
    get EdgeType(): typeof Edge;
    get VertexCount(): number;
    get EdgeCount(): number;
    get Vertices(): any[];
    get Edges(): any[];
    ContainsVertex(vertex: any): boolean;
    ContainsEdge(edgeOrSource: any, target: any): any;
    TryGetEdge(source: any, target: any): any;
    TryGetEdges(source: any, target: any): any;
    OutEdges(vertex: any): any;
    TryGetOutEdges(vertex: any): any;
    InEdges(vertex: any): any;
    TryGetInEdges(vertex: any): any;
    OutDegree(vertex: any): any;
    InDegree(vertex: any): any;
    AddVertex(vertex: any): boolean;
    AddVertexRange(vertices: any): number;
    AddEdge(edge: any): boolean;
    AddEdgeRange(edges: any): number;
    AddVerticesAndEdge(edge: any): boolean;
    AddVerticesAndEdgeRange(edges: any): number;
    RemoveEdge(edge: any): boolean;
    RemoveEdges(edges: any): number;
    RemoveEdgeIf(predicate: any): number;
    RemoveOutEdgeIf(vertex: any, predicate: any): number;
    RemoveInEdgeIf(vertex: any, predicate: any): number;
    ClearOutEdges(vertex: any): void;
    ClearInEdges(vertex: any): void;
    ClearEdges(vertex: any): void;
    RemoveVertex(vertex: any): boolean;
    RemoveVertexIf(predicate: any): number;
    Clear(): void;
    TrimEdgeExcess(): void;
    Clone(): any;
}
export declare class BidirectionalGraph extends AdjacencyGraph {
    MergeVertex(vertex: any, edgeFactory: any): void;
    MergeVerticesIf(predicate: any, edgeFactory: any): void;
}
export declare class UndirectedGraph extends AdjacencyGraph {
    EdgeCapacity: number;
    EdgeEqualityComparer: any;
    _edges: any[];
    _sortedEdgeType: any;
    constructor(allowParallelEdges?: boolean, edgeEqualityComparer?: typeof UndirectedVertexEquality);
    get IsDirected(): boolean;
    get Edges(): any[];
    ContainsEdge(edgeOrSource: any, target: any): any;
    TryGetEdges(source: any, target: any): any;
    TryGetEdge(source: any, target: any): any;
    AdjacentEdges(vertex: any): any;
    AdjacentDegree(vertex: any): any;
    TryGetAdjacentEdges(vertex: any): any;
    InEdges(vertex: any): any;
    TryGetInEdges(vertex: any): any;
    InDegree(vertex: any): any;
    Degree(vertex: any): any;
    AddEdge(edge: any): boolean;
    RemoveEdge(edge: any): boolean;
    ClearAdjacentEdges(vertex: any): void;
    ClearEdges(vertex: any): void;
    ClearInEdges(vertex: any): void;
    RemoveAdjacentEdgeIf(vertex: any, predicate: any): number;
    Clear(): void;
    Clone(): UndirectedGraph;
}
export declare class EdgeListGraph extends GraphQueries {
    IsDirected: boolean;
    AllowParallelEdges: boolean;
    _edges: any[];
    EdgeAdded: EventHook;
    EdgeRemoved: EventHook;
    constructor(isDirected?: boolean, allowParallelEdges?: boolean);
    get Edges(): any[];
    get EdgeCount(): number;
    get Vertices(): any[];
    get VertexCount(): number;
    ContainsVertex(vertex: any): boolean;
    TryGetOutEdges(v: any): any[] | undefined;
    OutEdges(v: any): any[];
    InEdges(v: any): any[];
    AddEdge(edge: any): boolean;
    AddVerticesAndEdge(edge: any): boolean;
    AddEdgeRange(edges: any): number;
    AddVerticesAndEdgeRange(edges: any): number;
    RemoveEdge(edge: any): boolean;
    RemoveEdgeIf(predicate: any): number;
    Clear(): void;
    Clone(): EdgeListGraph;
}
declare class GraphView extends GraphQueries {
    OriginalGraph: any;
    constructor(graph: any);
    get IsDirected(): any;
    get AllowParallelEdges(): any;
    get Vertices(): any[];
    get VertexCount(): any;
    get Edges(): any[];
    get EdgeCount(): any;
    ContainsVertex(v: any): any;
    OutEdges(v: any): any[];
    TryGetOutEdges(v: any): any[] | undefined;
    InEdges(v: any): any[];
    TryGetInEdges(v: any): any[] | undefined;
}
export declare class ArrayAdjacencyGraph extends GraphView {
    constructor(graph: any);
    Clone(): any;
}
export declare class ArrayBidirectionalGraph extends ArrayAdjacencyGraph {
    constructor(graph: any);
}
export declare class ArrayUndirectedGraph extends GraphView {
    EdgeEqualityComparer: any;
    constructor(graph: any);
    AdjacentEdges(v: any): any;
    AdjacentDegree(v: any): any;
    TryGetEdges(s: any, t: any): any;
    Clone(): ArrayUndirectedGraph;
}
export declare class BidirectionalAdapterGraph extends GraphView {
    _incoming: Map;
    constructor(graph: any);
    InEdges(v: any): any;
    TryGetInEdges(v: any): any;
}
export declare class ReversedBidirectionalGraph extends GraphView {
    get Edges(): any;
    OutEdges(v: any): any;
    InEdges(v: any): any;
}
export declare class UndirectedBidirectionalGraph extends GraphView {
    EdgeEqualityComparer: typeof UndirectedVertexEquality;
    constructor(graph: any);
    get IsDirected(): boolean;
    AdjacentEdges(v: any): any;
    AdjacentDegree(v: any): any;
    AdjacentEdge(): void;
    OutEdges(v: any): any;
    InEdges(v: any): any;
}
export declare class BidirectionalMatrixGraph extends BidirectionalGraph {
    _size: any;
    _matrix: Map | undefined;
    constructor(vertexCount: any);
    AddVertex(...args: any[]): never;
    RemoveVertex(...args: any[]): never;
    ContainsVertex(v: any): boolean;
    TryGetEdge(s: any, t: any): any;
    AddEdge(e: any): boolean;
    RemoveEdge(e: any): boolean;
    OutEdges(v: any): any;
    InEdges(v: any): any;
    get Edges(): any[];
    Clear(): void;
    Clone(): BidirectionalMatrixGraph;
}
/** Compact immutable adjacency graph: typed offset array plus contiguous targets. */
export declare class CompressedSparseRowGraph extends GraphQueries {
    _vertices: any[];
    _index: Map;
    _offsets: Uint32Array<ArrayBuffer>;
    _targets: any[];
    constructor(graph: any);
    static FromGraph(graph: any): CompressedSparseRowGraph;
    get IsDirected(): boolean;
    get AllowParallelEdges(): boolean;
    get VertexCount(): number;
    get Vertices(): any[];
    get EdgeCount(): number;
    get Edges(): SEquatableEdge[];
    ContainsVertex(v: any): boolean;
    OutEdges(v: any): SEquatableEdge[];
    TryGetOutEdges(v: any): SEquatableEdge[] | undefined;
    OutDegree(v: any): number;
    Clone(): CompressedSparseRowGraph;
}
export declare class DelegateImplicitGraph extends GraphQueries {
    _getter: any;
    AllowParallelEdges: boolean;
    constructor(tryGetOutEdges: any, allowParallelEdges?: boolean);
    get IsDirected(): boolean;
    TryGetOutEdges(v: any): any[] | undefined;
    ContainsVertex(v: any): boolean;
    OutEdges(v: any): any[];
}
export declare class DelegateIncidenceGraph extends DelegateImplicitGraph {
}
export declare class DelegateBidirectionalIncidenceGraph extends DelegateIncidenceGraph {
    _inGetter: any;
    constructor(outEdges: any, inEdges: any, allowParallelEdges?: boolean);
    TryGetInEdges(v: any): any[] | undefined;
    InEdges(v: any): any[];
}
export declare class DelegateVertexAndEdgeListGraph extends DelegateIncidenceGraph {
    _vertices: any;
    constructor(vertices: any, getter: any, allowParallelEdges?: boolean);
    get Vertices(): any[];
    get VertexCount(): number;
    get Edges(): any[];
    get EdgeCount(): number;
    ContainsVertex(v: any): boolean;
    TryGetOutEdges(v: any): any[] | undefined;
    OutEdges(v: any): any[];
}
export declare class DelegateImplicitUndirectedGraph extends DelegateImplicitGraph {
    EdgeEqualityComparer: typeof UndirectedVertexEquality;
    constructor(getter: any, allowParallelEdges?: boolean);
    get IsDirected(): boolean;
    AdjacentEdges(v: any): any[];
    TryGetAdjacentEdges(v: any): any[] | undefined;
}
export declare class DelegateUndirectedGraph extends DelegateImplicitUndirectedGraph {
    _vertices: any;
    constructor(vertices: any, getter: any, allowParallelEdges?: boolean);
    get Vertices(): any[];
    get VertexCount(): number;
    get Edges(): any[];
    get EdgeCount(): number;
    ContainsVertex(v: any): boolean;
    TryGetOutEdges(v: any): any[] | undefined;
    OutEdges(v: any): any[];
}
export declare class ClusteredAdjacencyGraph extends GraphView {
    Parent: any;
    Wrapped: any;
    Collapsed: boolean;
    _clusters: any[];
    constructor(graph: any);
    get EdgeCapacity(): any;
    set EdgeCapacity(v: any);
    get VertexType(): ObjectConstructor;
    get EdgeType(): typeof Edge;
    get Clusters(): any[];
    get ClustersCount(): number;
    AddCluster(): ClusteredAdjacencyGraph;
    RemoveCluster(graph: any): void;
    AddVertex(v: any): any;
    AddVertexRange(vs: any): any;
    AddEdge(e: any): any;
    AddEdgeRange(es: any): any;
    AddVerticesAndEdge(e: any): any;
    AddVerticesAndEdgeRange(es: any): any;
    _removeDescendants(method: any, value: any): void;
    RemoveVertex(v: any): boolean;
    RemoveEdge(e: any): boolean;
    RemoveVertexIf(p: any): any;
    RemoveEdgeIf(p: any): any;
    RemoveOutEdgeIf(v: any, p: any): any;
    ClearOutEdges(v: any): void;
    Clear(): void;
}
/** Live filtered view. Both endpoints and the edge itself must satisfy their predicates. */
export declare class FilteredGraph extends GraphView {
    BaseGraph: any;
    VertexPredicate: any;
    EdgePredicate: any;
    constructor(baseGraph: any, vertexPredicate: any, edgePredicate: any);
    FilterEdge(e: any): any;
    get Vertices(): any[];
    get VertexCount(): number;
    get Edges(): any[];
    get EdgeCount(): number;
    ContainsVertex(v: any): any;
    ContainsEdge(e: any, t: any): any;
    OutEdges(v: any): any[];
    TryGetOutEdges(v: any): any[] | undefined;
    InEdges(v: any): any[];
    TryGetInEdges(v: any): any[] | undefined;
    TryGetEdges(s: any, t: any): any;
}
export declare class FilteredImplicitVertexSet extends FilteredGraph {
}
export declare class FilteredImplicitGraph extends FilteredImplicitVertexSet {
}
export declare class FilteredIncidenceGraph extends FilteredImplicitGraph {
}
export declare class FilteredVertexListGraph extends FilteredIncidenceGraph {
}
export declare class FilteredVertexAndEdgeListGraph extends FilteredVertexListGraph {
}
export declare class FilteredEdgeListGraph extends FilteredImplicitVertexSet {
}
export declare class FilteredBidirectionalGraph extends FilteredVertexListGraph {
}
export declare class FilteredUndirectedGraph extends FilteredGraph {
    get EdgeEqualityComparer(): any;
    AdjacentEdges(v: any): any[];
    AdjacentDegree(v: any): any;
    OutEdges(v: any): any[];
    InEdges(v: any): any[];
}
export declare class InDictionaryVertexPredicate {
    VertexMap: any;
    constructor(vertexMap: any);
    Test(v: any): any;
}
export declare class IsolatedVertexPredicate {
    VisitedGraph: any;
    constructor(graph: any);
    Test(v: any): boolean;
}
export declare class SinkVertexPredicate {
    VisitedGraph: any;
    constructor(graph: any);
    Test(v: any): boolean;
}
export declare class ResidualEdgePredicate {
    ResidualCapacities: any;
    constructor(capacities: any);
    Test(e: any): boolean;
}
export declare class ReversedResidualEdgePredicate extends ResidualEdgePredicate {
    ReversedEdges: any;
    constructor(capacities: any, reversedEdges: any);
    Test(e: any): boolean;
}
export declare function IsSelfEdge(edge: any): any;
export declare function GetOtherVertex(edge: any, vertex: any): any;
export declare function IsAdjacent(edge: any, vertex: any): any;
export declare function IsPath(path: any): boolean;
export declare function HasCycles(path: any): boolean;
export declare function IsPathWithoutCycles(path: any): boolean;
export declare function ToVertexPair(edge: any): SEquatableEdge;
export declare function IsPredecessor(predecessors: any, root: any, vertex: any): boolean;
export declare function TryGetPath(predecessors: any, vertex: any): any[] | undefined;
export declare function SortedVertexEquality(edge: any, source: any, target: any): any;
export declare function UndirectedVertexEquality(edge: any, source: any, target: any): any;
export declare function GetUndirectedVertexEquality(edgeType: any): typeof SortedVertexEquality;
export declare function ReverseEdges(edges: any): SReversedEdge[];
export declare const EdgeExtensions: Readonly<{
    IsSelfEdge: typeof IsSelfEdge;
    GetOtherVertex: typeof GetOtherVertex;
    IsAdjacent: typeof IsAdjacent;
    IsPath: typeof IsPath;
    HasCycles: typeof HasCycles;
    IsPathWithoutCycles: typeof IsPathWithoutCycles;
    ToVertexPair: typeof ToVertexPair;
    IsPredecessor: typeof IsPredecessor;
    TryGetPath: typeof TryGetPath;
    SortedVertexEquality: typeof SortedVertexEquality;
    UndirectedVertexEquality: typeof UndirectedVertexEquality;
    GetUndirectedVertexEquality: typeof GetUndirectedVertexEquality;
    ReverseEdges: typeof ReverseEdges;
}>;
export declare function ToAdjacencyGraph(input: any, factoryOrParallel?: boolean, parallel?: boolean): any;
export declare function ToBidirectionalGraph(input: any, factoryOrParallel?: boolean, parallel?: boolean): any;
export declare function ToUndirectedGraph(input: any, factoryOrParallel?: boolean, parallel?: boolean): any;
export declare function ToArrayAdjacencyGraph(graph: any): ArrayAdjacencyGraph;
export declare function ToArrayBidirectionalGraph(graph: any): ArrayBidirectionalGraph;
export declare function ToArrayUndirectedGraph(graph: any): ArrayUndirectedGraph;
export declare function ToCompressedRowGraph(graph: any): CompressedSparseRowGraph;
export declare function ToDelegateIncidenceGraph(getter: any): DelegateIncidenceGraph;
export declare function ToDelegateBidirectionalIncidenceGraph(outGetter: any, inGetter: any): DelegateBidirectionalIncidenceGraph;
export declare function ToDelegateVertexAndEdgeListGraph(vertices: any, getter: any): DelegateVertexAndEdgeListGraph;
export declare function ToDelegateUndirectedGraph(vertices: any, getter: any): DelegateUndirectedGraph;
export declare const GraphExtensions: Readonly<{
    ToAdjacencyGraph: typeof ToAdjacencyGraph;
    ToBidirectionalGraph: typeof ToBidirectionalGraph;
    ToUndirectedGraph: typeof ToUndirectedGraph;
    ToArrayAdjacencyGraph: typeof ToArrayAdjacencyGraph;
    ToArrayBidirectionalGraph: typeof ToArrayBidirectionalGraph;
    ToArrayUndirectedGraph: typeof ToArrayUndirectedGraph;
    ToCompressedRowGraph: typeof ToCompressedRowGraph;
    ToDelegateIncidenceGraph: typeof ToDelegateIncidenceGraph;
    ToDelegateBidirectionalIncidenceGraph: typeof ToDelegateBidirectionalIncidenceGraph;
    ToDelegateVertexAndEdgeListGraph: typeof ToDelegateVertexAndEdgeListGraph;
    ToDelegateUndirectedGraph: typeof ToDelegateUndirectedGraph;
}>;
export {};
