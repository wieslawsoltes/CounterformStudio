/** Type-only C# interface/delegate contracts adapted to JS iterables, Maps and direct TryGet results. */
import type * as Runtime from './index.js';
export type AlgorithmEventHandler<TGraph = unknown> = (sender: IAlgorithm<TGraph>, args: unknown) => void;
export type ITransitionFactory<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  IsValid(vertex: TVertex): boolean;
  Apply(source: TVertex): Iterable<TEdge>;
}
export type IAlgorithm<TGraph = unknown> = IComputation & {
  VisitedGraph: TGraph;
}
export type IComputation = {
  SyncRoot: unknown;
  State: (typeof Runtime.ComputationState)[keyof typeof Runtime.ComputationState];
  Compute(): void;
  Abort(): void;
  StateChanged: Runtime.EventHook<[sender: unknown, args: unknown]>;
  Started: Runtime.EventHook<[sender: unknown, args: unknown]>;
  Finished: Runtime.EventHook<[sender: unknown, args: unknown]>;
  Aborted: Runtime.EventHook<[sender: unknown, args: unknown]>;
}
export type IConnectedComponentAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>, TGraph = unknown> = IAlgorithm<TGraph> & {
  ComponentCount: number;
  Components: Map<TVertex, number>;
}
export type IDistanceRecorderAlgorithm<TVertex = unknown> = {
  InitializeVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
  DiscoverVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
}
export type IEdgeColorizerAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  EdgesColors: Map<TEdge, (typeof Runtime.GraphColor)[keyof typeof Runtime.GraphColor]>;
}
export type IEdgePredecessorRecorderAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  DiscoverTreeEdge: Runtime.EventHook<Parameters<EdgeEdgeAction<TVertex, TEdge>>>;
  FinishEdge: Runtime.EventHook<Parameters<EdgeAction<TVertex, TEdge>>>;
}
export type ITreeBuilderAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  TreeEdge: Runtime.EventHook<Parameters<EdgeAction<TVertex, TEdge>>>;
}
export type IUndirectedTreeBuilderAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  TreeEdge: Runtime.EventHook<Parameters<UndirectedEdgeAction<TVertex, TEdge>>>;
}
export type IUndirectedVertexPredecessorRecorderAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IUndirectedTreeBuilderAlgorithm<TVertex, TEdge> & {
  StartVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
  FinishVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
}
export type IVertexColorizerAlgorithm<TVertex = unknown> = {
  GetVertexColor(vertex: TVertex): (typeof Runtime.GraphColor)[keyof typeof Runtime.GraphColor];
}
export type IVertexPredecessorRecorderAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = ITreeBuilderAlgorithm<TVertex, TEdge> & {
  StartVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
  FinishVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
}
export type IVertexTimeStamperAlgorithm<TVertex = unknown> = {
  DiscoverVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
  FinishVertex: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
}
export type IMinimumSpanningTreeAlgorithm<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IAlgorithm<Runtime.IUndirectedGraph<TVertex, TEdge>> & ITreeBuilderAlgorithm<TVertex, TEdge> & {
}
export type IObserver<TAlgorithm = unknown> = {
  Attach(algorithm: TAlgorithm): Runtime.IDisposable;
}
export type IEdgeChain<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  TryGetSuccessor(graph: IImplicitGraph<TVertex, TEdge>, vertex: TVertex): TEdge | undefined;
  TryGetSuccessor(edges: Iterable<TEdge>, vertex: TVertex): TEdge | undefined;
}
export type IMarkovEdgeChain<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IEdgeChain<TVertex, TEdge> & {
  Rand: unknown;
}
export type IAlgorithmComponent = {
  Services: IAlgorithmServices;
  GetService<T>(): T;
  TryGetService<T>(): T | undefined;
}
export type IAlgorithmServices = {
  CancelManager: ICancelManager;
}
export type ICancelManager = {
  CancelRequested: Runtime.EventHook<[sender: unknown, args: unknown]>;
  Cancel(): void;
  IsCancelling: boolean;
  CancelReset: Runtime.EventHook<[sender: unknown, args: unknown]>;
  ResetCancel(): void;
}
export type IDisjointSet<T = unknown> = {
  SetCount: number;
  ElementCount: number;
  MakeSet(value: T): void;
  FindSet(value: T): T;
  AreInSameSet(left: T, right: T): boolean;
  Union(left: T, right: T): boolean;
  Contains(value: T): boolean;
}
export type IEdgeList<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  TrimExcess(): void;
  Clone(): IEdgeList<TVertex, TEdge>;
}
export type IPriorityQueue<T = unknown> = IQueue<T> & {
  Update(value: T): void;
}
export type IQueue<T = unknown> = {
  Count: number;
  Contains(value: T): boolean;
  Enqueue(value: T): void;
  Dequeue(): T;
  Peek(): T;
  ToArray(): T[];
}
export type IVertexEdgeDictionary<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  Clone(): IVertexEdgeDictionary<TVertex, TEdge>;
}
export type CreateEdge<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (graph: IVertexListGraph<TVertex, TEdge>, source: TVertex, target: TVertex) => TEdge;
export type CreateVertexDelegate<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (graph: IVertexListGraph<TVertex, TEdge>) => TVertex;
export type EdgeAction<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (edge: TEdge) => void;
export type EdgeEdgeAction<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (edge: TEdge, targetEdge: TEdge) => void;
export type EdgeEqualityComparer<TVertex = unknown> = (edge: Runtime.IEdge<TVertex>, source: TVertex, target: TVertex) => boolean;
export type EdgeEventHandler<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (sender: unknown, args: Runtime.EdgeEventArgs<TVertex, TEdge>) => void;
export type EdgeIdentity<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (edge: TEdge) => string;
export type FormatClusterEventHandler<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (sender: unknown, args: Runtime.FormatClusterEventArgs) => void;
export type FormatEdgeAction<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (sender: unknown, args: Runtime.FormatEdgeEventArgs) => void;
export type FormatVertexEventHandler<TVertex = unknown> = (sender: unknown, args: Runtime.FormatVertexEventArgs) => void;
export type IDotEngine = {
  Run(imageType: (typeof Runtime.GraphvizImageType)[keyof typeof Runtime.GraphvizImageType], dot: string, outputFilePath: string): string;
}
export type IBidirectionalIncidenceGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IIncidenceGraph<TVertex, TEdge> & {
  IsInEdgesEmpty(vertex: TVertex): boolean;
  InDegree(vertex: TVertex): number;
  InEdges(vertex: TVertex): Iterable<TEdge>;
  TryGetInEdges(vertex: TVertex): Iterable<TEdge> | undefined;
  InEdge(vertex: TVertex, index: number): TEdge;
  Degree(vertex: TVertex): number;
}
export type ICloneableEdge<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = Runtime.IEdge<TVertex> & {
  Clone(source: TVertex, target: TVertex): TEdge;
}
export type IClusteredGraph = {
  Clusters: Iterable<unknown>;
  ClustersCount: number;
  Collapsed: boolean;
  AddCluster(): IClusteredGraph;
  RemoveCluster(graph: IClusteredGraph): void;
}
export type IdentifiableEdgeFactory<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (source: TVertex, target: TVertex, id: string) => TEdge;
export type IdentifiableVertexFactory<TVertex = unknown> = (id: string) => TVertex;
export type IEdgeListAndIncidenceGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IEdgeListGraph<TVertex, TEdge> & IIncidenceGraph<TVertex, TEdge> & {
}
export type IEdgeListGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = Runtime.IGraph<TVertex, TEdge> & IEdgeSet<TVertex, TEdge> & IVertexSet<TVertex> & {
}
export type IEdgeSet<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = {
  IsEdgesEmpty: boolean;
  EdgeCount: number;
  Edges: Iterable<TEdge>;
  ContainsEdge(edge: TEdge): boolean;
}
export type IHierarchy<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableVertexAndEdgeListGraph<TVertex, TEdge> & {
  Root: TVertex;
  GetParent(vertex: TVertex): TVertex;
  GetParentEdge(vertex: TVertex): TEdge;
  IsCrossEdge(edge: TEdge): boolean;
  IsRealEdge(edge: TEdge): boolean;
  IsPredecessorOf(source: TVertex, target: TVertex): boolean;
  InducedEdgeCount(source: TVertex, target: TVertex): number;
  IsInnerNode(vertex: TVertex): boolean;
  ChildrenEdges(vertex: TVertex): Iterable<TEdge>;
  ChildrenVertices(vertex: TVertex): Iterable<TVertex>;
}
export type IImplicitGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = Runtime.IGraph<TVertex, TEdge> & IImplicitVertexSet<TVertex> & {
  IsOutEdgesEmpty(vertex: TVertex): boolean;
  OutDegree(vertex: TVertex): number;
  OutEdges(vertex: TVertex): Iterable<TEdge>;
  TryGetOutEdges(vertex: TVertex): Iterable<TEdge> | undefined;
  OutEdge(vertex: TVertex, index: number): TEdge;
}
export type IImplicitUndirectedGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IImplicitVertexSet<TVertex> & Runtime.IGraph<TVertex, TEdge> & {
  EdgeEqualityComparer: EdgeEqualityComparer<TVertex>;
  AdjacentEdges(vertex: TVertex): Iterable<TEdge>;
  AdjacentDegree(vertex: TVertex): number;
  IsAdjacentEdgesEmpty(vertex: TVertex): boolean;
  AdjacentEdge(vertex: TVertex, index: number): TEdge;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  ContainsEdge(source: TVertex, target: TVertex): boolean;
}
export type IImplicitVertexSet<TVertex = unknown> = {
  ContainsVertex(vertex: TVertex): boolean;
}
export type IIncidenceGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IImplicitGraph<TVertex, TEdge> & {
  ContainsEdge(source: TVertex, target: TVertex): boolean;
  TryGetEdge(source: TVertex, target: TVertex): TEdge | undefined;
  TryGetEdges(source: TVertex, target: TVertex): Iterable<TEdge> | undefined;
}
export type IMutableBidirectionalGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableVertexAndEdgeListGraph<TVertex, TEdge> & Runtime.IBidirectionalGraph<TVertex, TEdge> & {
  RemoveInEdgeIf(vertex: TVertex, predicate: Runtime.EdgePredicate<TVertex, TEdge>): number;
  ClearInEdges(vertex: TVertex): void;
  ClearEdges(vertex: TVertex): void;
}
export type IMutableEdgeListGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableGraph<TVertex, TEdge> & IEdgeListGraph<TVertex, TEdge> & {
  AddEdge(edge: TEdge): boolean;
  EdgeAdded: Runtime.EventHook<Parameters<EdgeAction<TVertex, TEdge>>>;
  AddEdgeRange(edges: Iterable<TEdge>): number;
  RemoveEdge(edge: TEdge): boolean;
  EdgeRemoved: Runtime.EventHook<Parameters<EdgeAction<TVertex, TEdge>>>;
  RemoveEdgeIf(predicate: Runtime.EdgePredicate<TVertex, TEdge>): number;
}
export type IMutableGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = Runtime.IGraph<TVertex, TEdge> & {
  Clear(): void;
}
export type IMutableIncidenceGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableGraph<TVertex, TEdge> & IIncidenceGraph<TVertex, TEdge> & {
  RemoveOutEdgeIf(vertex: TVertex, predicate: Runtime.EdgePredicate<TVertex, TEdge>): number;
  ClearOutEdges(vertex: TVertex): void;
  TrimEdgeExcess(): void;
}
export type IMutableTermBidirectionalGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = ITermBidirectionalGraph<TVertex, TEdge> & IMutableBidirectionalGraph<TVertex, TEdge> & {
}
export type IMutableUndirectedGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = Runtime.IUndirectedGraph<TVertex, TEdge> & IMutableVertexAndEdgeSet<TVertex, TEdge> & {
  RemoveAdjacentEdgeIf(vertex: TVertex, predicate: Runtime.EdgePredicate<TVertex, TEdge>): number;
  ClearAdjacentEdges(vertex: TVertex): void;
}
export type IMutableVertexAndEdgeListGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableVertexListGraph<TVertex, TEdge> & IMutableVertexAndEdgeSet<TVertex, TEdge> & Runtime.IVertexAndEdgeListGraph<TVertex, TEdge> & {
}
export type IMutableVertexAndEdgeSet<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableVertexSet<TVertex> & IMutableEdgeListGraph<TVertex, TEdge> & {
  AddVerticesAndEdge(edge: TEdge): boolean;
  AddVerticesAndEdgeRange(edges: Iterable<TEdge>): number;
}
export type IMutableVertexListGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IMutableIncidenceGraph<TVertex, TEdge> & IMutableVertexSet<TVertex> & {
}
export type IMutableVertexSet<TVertex = unknown> = IVertexSet<TVertex> & {
  VertexAdded: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
  AddVertex(vertex: TVertex): boolean;
  AddVertexRange(vertices: Iterable<TVertex>): number;
  VertexRemoved: Runtime.EventHook<Parameters<VertexAction<TVertex>>>;
  RemoveVertex(vertex: TVertex): boolean;
  RemoveVertexIf(predicate: Runtime.VertexPredicate<TVertex>): number;
}
export type ITermBidirectionalGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = Runtime.IBidirectionalGraph<TVertex, TEdge> & {
  OutTerminalCount(vertex: TVertex): number;
  IsOutEdgesEmptyAt(vertex: TVertex, terminal: number): boolean;
  OutDegreeAt(vertex: TVertex, terminal: number): number;
  OutEdgesAt(vertex: TVertex, terminal: number): Iterable<TEdge>;
  TryGetOutEdgesAt(vertex: TVertex, terminal: number): Iterable<TEdge> | undefined;
  InTerminalCount(vertex: TVertex): number;
  IsInEdgesEmptyAt(vertex: TVertex, terminal: number): boolean;
  InDegreeAt(vertex: TVertex, terminal: number): number;
  InEdgesAt(vertex: TVertex, terminal: number): Iterable<TEdge>;
  TryGetInEdgesAt(vertex: TVertex, terminal: number): Iterable<TEdge> | undefined;
}
export type IUndirectedEdge<TVertex = unknown> = Runtime.IEdge<TVertex> & {
}
export type IVertexListGraph<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = IIncidenceGraph<TVertex, TEdge> & IVertexSet<TVertex> & {
}
export type IVertexSet<TVertex = unknown> = IImplicitVertexSet<TVertex> & {
  IsVerticesEmpty: boolean;
  VertexCount: number;
  Vertices: Iterable<TVertex>;
}
export type MsaglEdgeEventHandler<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (sender: unknown, args: Runtime.MsaglEdgeEventArgs) => void;
export type MsaglVertexNodeEventHandler<TVertex = unknown> = (sender: unknown, args: Runtime.MsaglVertexEventArgs) => void;
export type IArc<TToken = unknown> = Runtime.IEdge<IPetriVertex> & {
  IsInputArc: boolean;
  Place: IPlace<TToken>;
  Transition: ITransition<TToken>;
  Annotation: IExpression<TToken>;
}
export type IConditionExpression<TToken = unknown> = {
  IsEnabled(tokens: Array<TToken>): boolean;
}
export type IExpression<TToken = unknown> = {
  Evaluate(markings: Array<TToken>): Array<TToken>;
}
export type IMutablePetriNet<TToken = unknown> = IPetriNet<TToken> & {
  AddPlace(name: string): IPlace<TToken>;
  AddTransition(name: string): ITransition<TToken>;
  AddArc(place: IPlace<TToken>, transition: ITransition<TToken>): IArc<TToken>;
  AddArc(transition: ITransition<TToken>, place: IPlace<TToken>): IArc<TToken>;
}
export type IPetriGraph<TToken = unknown> = IReadOnlyPetriGraph<TToken> & IMutableBidirectionalGraph<IPetriVertex, IArc<TToken>> & {
}
export type IPetriNet<TToken = unknown> = {
  Places: Iterable<IPlace<TToken>>;
  Transitions: Iterable<ITransition<TToken>>;
  Arcs: Iterable<IArc<TToken>>;
  Graph: IReadOnlyPetriGraph<TToken>;
}
export type IPetriVertex = {
  Name: string;
}
export type IPlace<TToken = unknown> = IPetriVertex & {
  Marking: Array<TToken>;
  ToStringWithMarking(): string;
}
export type IReadOnlyPetriGraph<TToken = unknown> = Runtime.IBidirectionalGraph<IPetriVertex, IArc<TToken>> & {
}
export type ITransition<TToken = unknown> = IPetriVertex & {
  Condition: IConditionExpression<TToken>;
}
export type TryFunc<T1, T2, T3 = never, T4 = never, T5 = never> = [T5] extends [never] ? [T4] extends [never] ? [T3] extends [never] ? (arg1: T1) => T2 | undefined : (arg1: T1, arg2: T2) => T3 | undefined : (arg1: T1, arg2: T2, arg3: T3) => T4 | undefined : (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5 | undefined;
export type UndirectedEdgeAction<TVertex = unknown, TEdge extends Runtime.IEdge<TVertex> = Runtime.IEdge<TVertex>> = (sender: unknown, args: Runtime.UndirectedEdgeEventArgs<TVertex, TEdge>) => void;
export type VertexAction<TVertex = unknown> = (vertex: TVertex) => void;
export type VertexEventHandler<TVertex = unknown> = (sender: unknown, args: Runtime.VertexEventArgs<TVertex>) => void;
export type VertexFactory<TVertex = unknown> = () => TVertex;
export type VertexIdentity<TVertex = unknown> = (vertex: TVertex) => string;
