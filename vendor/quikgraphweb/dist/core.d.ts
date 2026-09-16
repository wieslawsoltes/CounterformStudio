import * as Raw from './core-inferred.js';
export * from './core-inferred.js';

export interface IDisposable { Dispose(): void; }
export interface Subscription extends IDisposable { dispose(): void; unsubscribe(): void; }
export interface IEdge<TVertex = unknown> { readonly Source: TVertex; readonly Target: TVertex; }
export interface ITermEdge<TVertex = unknown> extends IEdge<TVertex> { readonly SourceTerminal: number; readonly TargetTerminal: number; }
export interface ITagged<TTag = unknown> { Tag: TTag; }
export type VertexPredicate<TVertex> = (vertex: TVertex) => boolean;
export type EdgePredicate<TVertex, TEdge extends IEdge<TVertex>> = (edge: TEdge) => boolean;
export type EdgeFactory<TVertex, TEdge extends IEdge<TVertex>> = (source: TVertex, target: TVertex) => TEdge;
export type UndirectedEdgeEqualityComparer<TVertex, TEdge extends IEdge<TVertex>> = (edge: TEdge, source: TVertex, target: TVertex) => boolean;
export interface IGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> {
  readonly IsDirected: boolean; readonly AllowParallelEdges: boolean;
  readonly Vertices: TVertex[]; readonly Edges: TEdge[];
  readonly VertexCount: number; readonly EdgeCount: number;
  ContainsVertex(vertex: TVertex): boolean;
}
export interface IVertexAndEdgeListGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> extends IGraph<TVertex, TEdge> {
  OutEdges(vertex: TVertex): TEdge[];
  TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number;
}
export interface IBidirectionalGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> extends IVertexAndEdgeListGraph<TVertex, TEdge> {
  InEdges(vertex: TVertex): TEdge[];
  TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  InDegree(vertex: TVertex): number;
}
export interface IUndirectedGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> extends IVertexAndEdgeListGraph<TVertex, TEdge> {
  AdjacentEdges(vertex: TVertex): TEdge[];
  TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentDegree(vertex: TVertex): number;
}
export class EventHook<TArgs extends unknown[] = any[]> extends Raw.EventHook {
  add(listener: (...args: TArgs) => void): (...args: TArgs) => void;
  remove(listener: (...args: TArgs) => void): boolean;
  subscribe(listener: (...args: TArgs) => void): Subscription;
  emit(...args: TArgs): void;
}
export class VertexEventArgs<TVertex = unknown> extends Raw.VertexEventArgs {
  constructor(vertex: TVertex); Vertex: TVertex;
}
export class EdgeEventArgs<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> extends Raw.EdgeEventArgs {
  constructor(edge: TEdge); Edge: TEdge;
}
export class UndirectedEdgeEventArgs<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> extends Raw.UndirectedEdgeEventArgs {
  constructor(edge: TEdge, reversed: boolean); Edge: TEdge;
  get Source(): TVertex; get Target(): TVertex;
}
export class Edge<TVertex = unknown> extends Raw.Edge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class EquatableEdge<TVertex = unknown> extends Raw.EquatableEdge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class SEdge<TVertex = unknown> extends Raw.SEdge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class SEquatableEdge<TVertex = unknown> extends Raw.SEquatableEdge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class UndirectedEdge<TVertex = unknown> extends Raw.UndirectedEdge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class EquatableUndirectedEdge<TVertex = unknown> extends Raw.EquatableUndirectedEdge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class SUndirectedEdge<TVertex = unknown> extends Raw.SUndirectedEdge implements IEdge<TVertex> {
  constructor(source: TVertex, target: TVertex);
  readonly Source: TVertex; readonly Target: TVertex;
}
export class TaggedEdge<TVertex = unknown, TTag = unknown> extends Raw.TaggedEdge implements IEdge<TVertex>, ITagged<TTag> {
  constructor(source: TVertex, target: TVertex, tag: TTag);
  readonly Source: TVertex; readonly Target: TVertex;
  get Tag(): TTag; set Tag(value: TTag); TagChanged: EventHook<[sender: this, args: object]>;
}
export class EquatableTaggedEdge<TVertex = unknown, TTag = unknown> extends Raw.EquatableTaggedEdge implements IEdge<TVertex>, ITagged<TTag> {
  constructor(source: TVertex, target: TVertex, tag: TTag);
  readonly Source: TVertex; readonly Target: TVertex;
  get Tag(): TTag; set Tag(value: TTag); TagChanged: EventHook<[sender: this, args: object]>;
}
export class STaggedEdge<TVertex = unknown, TTag = unknown> extends Raw.STaggedEdge implements IEdge<TVertex>, ITagged<TTag> {
  constructor(source: TVertex, target: TVertex, tag: TTag);
  readonly Source: TVertex; readonly Target: TVertex;
  get Tag(): TTag; set Tag(value: TTag); TagChanged: EventHook<[sender: this, args: object]>;
}
export class SEquatableTaggedEdge<TVertex = unknown, TTag = unknown> extends Raw.SEquatableTaggedEdge implements IEdge<TVertex>, ITagged<TTag> {
  constructor(source: TVertex, target: TVertex, tag: TTag);
  readonly Source: TVertex; readonly Target: TVertex;
  get Tag(): TTag; set Tag(value: TTag); TagChanged: EventHook<[sender: this, args: object]>;
}
export class TaggedUndirectedEdge<TVertex = unknown, TTag = unknown> extends Raw.TaggedUndirectedEdge implements IEdge<TVertex>, ITagged<TTag> {
  constructor(source: TVertex, target: TVertex, tag: TTag);
  readonly Source: TVertex; readonly Target: TVertex;
  get Tag(): TTag; set Tag(value: TTag); TagChanged: EventHook<[sender: this, args: object]>;
}
export class STaggedUndirectedEdge<TVertex = unknown, TTag = unknown> extends Raw.STaggedUndirectedEdge implements IEdge<TVertex>, ITagged<TTag> {
  constructor(source: TVertex, target: TVertex, tag: TTag);
  readonly Source: TVertex; readonly Target: TVertex;
  get Tag(): TTag; set Tag(value: TTag); TagChanged: EventHook<[sender: this, args: object]>;
}
export class TermEdge<TVertex = unknown> extends Raw.TermEdge implements ITermEdge<TVertex> {
 constructor(source: TVertex, target: TVertex, sourceTerminal?: number, targetTerminal?: number);
 readonly Source: TVertex; readonly Target: TVertex; readonly SourceTerminal: number; readonly TargetTerminal: number;
}
export class EquatableTermEdge<TVertex = unknown> extends Raw.EquatableTermEdge implements ITermEdge<TVertex> {
 constructor(source: TVertex, target: TVertex, sourceTerminal?: number, targetTerminal?: number);
 readonly Source: TVertex; readonly Target: TVertex; readonly SourceTerminal: number; readonly TargetTerminal: number;
}
export class SReversedEdge<TVertex = unknown, TEdge extends IEdge<TVertex> = IEdge<TVertex>> extends Raw.SReversedEdge implements IEdge<TVertex> {
  constructor(originalEdge: TEdge); readonly Source: TVertex; readonly Target: TVertex; readonly OriginalEdge: TEdge;
}
export class AdjacencyGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.AdjacencyGraph implements IVertexAndEdgeListGraph<TVertex, TEdge> {
  constructor(allowParallelEdges?: boolean | IGraph<TVertex, TEdge>, vertexCapacity?: number, edgeCapacity?: number);

  get Vertices(): TVertex[]; get Edges(): TEdge[];
  ContainsVertex(vertex: TVertex): boolean;
  ContainsEdge(edge: TEdge): boolean;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): TEdge[] | undefined;
  OutEdges(vertex: TVertex): TEdge[]; TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  InEdges(vertex: TVertex): TEdge[]; TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number; InDegree(vertex: TVertex): number; Degree(vertex: TVertex): number;
  OutEdge(vertex: TVertex, index: number): TEdge; InEdge(vertex: TVertex, index: number): TEdge;
  AdjacentEdges(vertex: TVertex): TEdge[]; TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentEdge(vertex: TVertex, index: number): TEdge; AdjacentVertices(vertex: TVertex): TVertex[];

  VertexAdded: EventHook<[vertex: TVertex]>; VertexRemoved: EventHook<[vertex: TVertex]>;
  EdgeAdded: EventHook<[edge: TEdge]>; EdgeRemoved: EventHook<[edge: TEdge]>;
  AddVertex(vertex: TVertex): boolean; AddVertexRange(vertices: Iterable<TVertex>): number;
  AddEdge(edge: TEdge): boolean; AddEdgeRange(edges: Iterable<TEdge>): number;
  AddVerticesAndEdge(edge: TEdge): boolean; AddVerticesAndEdgeRange(edges: Iterable<TEdge>): number;
  RemoveVertex(vertex: TVertex): boolean; RemoveVertexIf(predicate: VertexPredicate<TVertex>): number;
  RemoveEdge(edge: TEdge): boolean; RemoveEdges(edges: Iterable<TEdge>): number;
  RemoveEdgeIf(predicate: (edge: TEdge) => boolean): number;
  RemoveOutEdgeIf(vertex: TVertex, predicate: (edge: TEdge) => boolean): number;
  ClearOutEdges(vertex: TVertex): void; ClearInEdges(vertex: TVertex): void; ClearEdges(vertex: TVertex): void;
  Clone(): AdjacencyGraph<TVertex, TEdge>;
}
export class BidirectionalGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.BidirectionalGraph implements IVertexAndEdgeListGraph<TVertex, TEdge> {
  constructor(allowParallelEdges?: boolean | IGraph<TVertex, TEdge>, vertexCapacity?: number, edgeCapacity?: number);

  get Vertices(): TVertex[]; get Edges(): TEdge[];
  ContainsVertex(vertex: TVertex): boolean;
  ContainsEdge(edge: TEdge): boolean;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): TEdge[] | undefined;
  OutEdges(vertex: TVertex): TEdge[]; TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  InEdges(vertex: TVertex): TEdge[]; TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number; InDegree(vertex: TVertex): number; Degree(vertex: TVertex): number;
  OutEdge(vertex: TVertex, index: number): TEdge; InEdge(vertex: TVertex, index: number): TEdge;
  AdjacentEdges(vertex: TVertex): TEdge[]; TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentEdge(vertex: TVertex, index: number): TEdge; AdjacentVertices(vertex: TVertex): TVertex[];

  VertexAdded: EventHook<[vertex: TVertex]>; VertexRemoved: EventHook<[vertex: TVertex]>;
  EdgeAdded: EventHook<[edge: TEdge]>; EdgeRemoved: EventHook<[edge: TEdge]>;
  AddVertex(vertex: TVertex): boolean; AddVertexRange(vertices: Iterable<TVertex>): number;
  AddEdge(edge: TEdge): boolean; AddEdgeRange(edges: Iterable<TEdge>): number;
  AddVerticesAndEdge(edge: TEdge): boolean; AddVerticesAndEdgeRange(edges: Iterable<TEdge>): number;
  RemoveVertex(vertex: TVertex): boolean; RemoveVertexIf(predicate: VertexPredicate<TVertex>): number;
  RemoveEdge(edge: TEdge): boolean; RemoveEdges(edges: Iterable<TEdge>): number;
  RemoveEdgeIf(predicate: (edge: TEdge) => boolean): number;
  RemoveOutEdgeIf(vertex: TVertex, predicate: (edge: TEdge) => boolean): number;
  ClearOutEdges(vertex: TVertex): void; ClearInEdges(vertex: TVertex): void; ClearEdges(vertex: TVertex): void;
  Clone(): BidirectionalGraph<TVertex, TEdge>;
  MergeVertex(vertex: TVertex, edgeFactory: EdgeFactory<TVertex, TEdge>): void;
  MergeVerticesIf(predicate: VertexPredicate<TVertex>, edgeFactory: EdgeFactory<TVertex, TEdge>): void;
}
export class UndirectedGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.UndirectedGraph implements IVertexAndEdgeListGraph<TVertex, TEdge> {
  constructor(allowParallelEdges?: boolean | IGraph<TVertex, TEdge>, edgeEqualityComparer?: UndirectedEdgeEqualityComparer<TVertex, TEdge>);

  get Vertices(): TVertex[]; get Edges(): TEdge[];
  ContainsVertex(vertex: TVertex): boolean;
  ContainsEdge(edge: TEdge): boolean;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): TEdge[] | undefined;
  OutEdges(vertex: TVertex): TEdge[]; TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  InEdges(vertex: TVertex): TEdge[]; TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number; InDegree(vertex: TVertex): number; Degree(vertex: TVertex): number;
  OutEdge(vertex: TVertex, index: number): TEdge; InEdge(vertex: TVertex, index: number): TEdge;
  AdjacentEdges(vertex: TVertex): TEdge[]; TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentEdge(vertex: TVertex, index: number): TEdge; AdjacentVertices(vertex: TVertex): TVertex[];

  VertexAdded: EventHook<[vertex: TVertex]>; VertexRemoved: EventHook<[vertex: TVertex]>;
  EdgeAdded: EventHook<[edge: TEdge]>; EdgeRemoved: EventHook<[edge: TEdge]>;
  AddVertex(vertex: TVertex): boolean; AddVertexRange(vertices: Iterable<TVertex>): number;
  AddEdge(edge: TEdge): boolean; AddEdgeRange(edges: Iterable<TEdge>): number;
  AddVerticesAndEdge(edge: TEdge): boolean; AddVerticesAndEdgeRange(edges: Iterable<TEdge>): number;
  RemoveVertex(vertex: TVertex): boolean; RemoveVertexIf(predicate: VertexPredicate<TVertex>): number;
  RemoveEdge(edge: TEdge): boolean; RemoveEdges(edges: Iterable<TEdge>): number;
  RemoveEdgeIf(predicate: (edge: TEdge) => boolean): number;
  RemoveOutEdgeIf(vertex: TVertex, predicate: (edge: TEdge) => boolean): number;
  ClearOutEdges(vertex: TVertex): void; ClearInEdges(vertex: TVertex): void; ClearEdges(vertex: TVertex): void;
  Clone(): UndirectedGraph<TVertex, TEdge>;
  EdgeEqualityComparer: UndirectedEdgeEqualityComparer<TVertex, TEdge>;
  RemoveAdjacentEdgeIf(vertex: TVertex, predicate: (edge: TEdge) => boolean): number;
  ClearAdjacentEdges(vertex: TVertex): void;
}
export class ArrayAdjacencyGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.ArrayAdjacencyGraph {
 constructor(graph: IGraph<TVertex, TEdge>);
 
  get Vertices(): TVertex[]; get Edges(): TEdge[];
  ContainsVertex(vertex: TVertex): boolean;
  ContainsEdge(edge: TEdge): boolean;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): TEdge[] | undefined;
  OutEdges(vertex: TVertex): TEdge[]; TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  InEdges(vertex: TVertex): TEdge[]; TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number; InDegree(vertex: TVertex): number; Degree(vertex: TVertex): number;
  OutEdge(vertex: TVertex, index: number): TEdge; InEdge(vertex: TVertex, index: number): TEdge;
  AdjacentEdges(vertex: TVertex): TEdge[]; TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentEdge(vertex: TVertex, index: number): TEdge; AdjacentVertices(vertex: TVertex): TVertex[];

 Clone(): ArrayAdjacencyGraph<TVertex, TEdge>;
}
export class ArrayBidirectionalGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.ArrayBidirectionalGraph {
 constructor(graph: IGraph<TVertex, TEdge>);
 
  get Vertices(): TVertex[]; get Edges(): TEdge[];
  ContainsVertex(vertex: TVertex): boolean;
  ContainsEdge(edge: TEdge): boolean;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): TEdge[] | undefined;
  OutEdges(vertex: TVertex): TEdge[]; TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  InEdges(vertex: TVertex): TEdge[]; TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number; InDegree(vertex: TVertex): number; Degree(vertex: TVertex): number;
  OutEdge(vertex: TVertex, index: number): TEdge; InEdge(vertex: TVertex, index: number): TEdge;
  AdjacentEdges(vertex: TVertex): TEdge[]; TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentEdge(vertex: TVertex, index: number): TEdge; AdjacentVertices(vertex: TVertex): TVertex[];

 Clone(): ArrayBidirectionalGraph<TVertex, TEdge>;
}
export class ArrayUndirectedGraph<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.ArrayUndirectedGraph {
 constructor(graph: IGraph<TVertex, TEdge>);
 
  get Vertices(): TVertex[]; get Edges(): TEdge[];
  ContainsVertex(vertex: TVertex): boolean;
  ContainsEdge(edge: TEdge): boolean;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): TEdge[] | undefined;
  OutEdges(vertex: TVertex): TEdge[]; TryGetOutEdges(vertex: TVertex): TEdge[] | undefined;
  InEdges(vertex: TVertex): TEdge[]; TryGetInEdges(vertex: TVertex): TEdge[] | undefined;
  OutDegree(vertex: TVertex): number; InDegree(vertex: TVertex): number; Degree(vertex: TVertex): number;
  OutEdge(vertex: TVertex, index: number): TEdge; InEdge(vertex: TVertex, index: number): TEdge;
  AdjacentEdges(vertex: TVertex): TEdge[]; TryGetAdjacentEdges(vertex: TVertex): TEdge[] | undefined;
  AdjacentEdge(vertex: TVertex, index: number): TEdge; AdjacentVertices(vertex: TVertex): TVertex[];

 Clone(): ArrayUndirectedGraph<TVertex, TEdge>;
}
