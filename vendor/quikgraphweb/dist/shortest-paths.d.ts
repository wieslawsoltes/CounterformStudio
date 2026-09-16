import * as Raw from './shortest-paths-inferred.js';
import { IEdge, Edge, IVertexAndEdgeListGraph, EventHook, UndirectedEdgeEventArgs } from './core.js';
export * from './shortest-paths-inferred.js';
export interface IDistanceRelaxer { InitialDistance: number; Compare(left: number, right: number): number; Combine(distance: number, weight: number): number; }
export interface IDistancesCollection<TVertex> { GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined; GetDistances(): IterableIterator<[TVertex, number]>; }
export class ShortestPathAlgorithmBase<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.ShortestPathAlgorithmBase implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[edge: TEdge]>; EdgeNotRelaxed: EventHook<[edge: TEdge]>;
}
export class UndirectedShortestPathAlgorithmBase<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.UndirectedShortestPathAlgorithmBase implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[sender: this, args: UndirectedEdgeEventArgs<TVertex, TEdge>]>; EdgeNotRelaxed: EventHook<[sender: this, args: UndirectedEdgeEventArgs<TVertex, TEdge>]>;
}
export class DijkstraShortestPathAlgorithm<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.DijkstraShortestPathAlgorithm implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[edge: TEdge]>; EdgeNotRelaxed: EventHook<[edge: TEdge]>;
}
export class UndirectedDijkstraShortestPathAlgorithm<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.UndirectedDijkstraShortestPathAlgorithm implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[sender: this, args: UndirectedEdgeEventArgs<TVertex, TEdge>]>; EdgeNotRelaxed: EventHook<[sender: this, args: UndirectedEdgeEventArgs<TVertex, TEdge>]>;
}
export class AStarShortestPathAlgorithm<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.AStarShortestPathAlgorithm implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, costHeuristic: (vertex: TVertex) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, costHeuristic: (vertex: TVertex) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[edge: TEdge]>; EdgeNotRelaxed: EventHook<[edge: TEdge]>;
  CostHeuristic: (vertex: TVertex) => number;
}
export class BellmanFordShortestPathAlgorithm<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.BellmanFordShortestPathAlgorithm implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[edge: TEdge]>; EdgeNotRelaxed: EventHook<[edge: TEdge]>;
}
export class DagShortestPathAlgorithm<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.DagShortestPathAlgorithm implements IDistancesCollection<TVertex> {

  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, edgeWeights: (edge: TEdge) => number, distanceRelaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>;
  Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, number>; VerticesColors: Map<TVertex, number>; Predecessors: Map<TVertex, TEdge>;
  Compute(root?: TVertex): this;
  GetDistance(vertex: TVertex): number; TryGetDistance(vertex: TVertex): number | undefined;
  GetDistances(): IterableIterator<[TVertex, number]>;
  GetVertexDistance(vertex: TVertex): number; SetVertexDistance(vertex: TVertex, distance: number): void;
  GetVertexColor(vertex: TVertex): number; TryGetPath(vertex: TVertex): TEdge[] | undefined;
  TryGetRootVertex(): TVertex | undefined; SetRootVertex(vertex: TVertex): void;
  InitializeVertex: EventHook<[vertex: TVertex]>; DiscoverVertex: EventHook<[vertex: TVertex]>;
  StartVertex: EventHook<[vertex: TVertex]>; ExamineVertex: EventHook<[vertex: TVertex]>; FinishVertex: EventHook<[vertex: TVertex]>;
  ExamineEdge: EventHook<[edge: TEdge]>;
  TreeEdge: EventHook<[edge: TEdge]>; EdgeNotRelaxed: EventHook<[edge: TEdge]>;
}
export class FloydWarshallAllShortestPathAlgorithm<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.FloydWarshallAllShortestPathAlgorithm {
  constructor(graph: IVertexAndEdgeListGraph<TVertex, TEdge>, weights: (edge: TEdge) => number, relaxer?: IDistanceRelaxer);
  constructor(host: any, graph: IVertexAndEdgeListGraph<TVertex, TEdge>, weights: (edge: TEdge) => number, relaxer?: IDistanceRelaxer);
  VisitedGraph: IVertexAndEdgeListGraph<TVertex, TEdge>; Weights: (edge: TEdge) => number; DistanceRelaxer: IDistanceRelaxer;
  Distances: Map<TVertex, Map<TVertex, number>>;
  TryGetDistance(source: TVertex, target: TVertex): number | undefined;
  TryGetPath(source: TVertex, target: TVertex): TEdge[] | undefined;
}
export class SortedPath<TVertex = unknown, TEdge extends IEdge<TVertex> = Edge<TVertex>> extends Raw.SortedPath implements Iterable<TEdge> {
  constructor(edges: Iterable<TEdge>); Edges: TEdge[];
  GetVertex(index: number): TVertex; GetEdge(index: number): TEdge; GetEdges(count: number): TEdge[];
  [Symbol.iterator](): ArrayIterator<TEdge>;
}
