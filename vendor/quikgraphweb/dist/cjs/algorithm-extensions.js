var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var algorithm_extensions_exports = {};
__export(algorithm_extensions_exports, {
  AlgorithmExtensions: () => AlgorithmExtensions,
  Clone: () => Clone,
  ComputeDisjointSet: () => ComputeDisjointSet,
  ComputePredecessorCost: () => ComputePredecessorCost,
  ComputeTransitiveClosure: () => ComputeTransitiveClosure,
  ComputeTransitiveReduction: () => ComputeTransitiveReduction,
  CondensateEdges: () => CondensateEdges,
  CondensateStronglyConnected: () => CondensateStronglyConnected,
  CondensateWeaklyConnected: () => CondensateWeaklyConnected,
  ConnectedComponents: () => ConnectedComponents,
  GetEdgeIdentity: () => GetEdgeIdentity,
  GetIndexer: () => GetIndexer,
  GetVertexIdentity: () => GetVertexIdentity,
  IncrementalConnectedComponents: () => IncrementalConnectedComponents,
  IsDirectedAcyclicGraph: () => IsDirectedAcyclicGraph,
  IsUndirectedAcyclicGraph: () => IsUndirectedAcyclicGraph,
  IsolatedVertices: () => IsolatedVertices,
  MaximumFlow: () => MaximumFlow,
  MinimumSpanningTreeKruskal: () => MinimumSpanningTreeKruskal,
  MinimumSpanningTreePrim: () => MinimumSpanningTreePrim,
  OddVertices: () => OddVertices,
  OfflineLeastCommonAncestor: () => OfflineLeastCommonAncestor,
  RankedShortestPathHoffmanPavley: () => RankedShortestPathHoffmanPavley,
  Roots: () => Roots,
  ShortestPathsAStar: () => ShortestPathsAStar,
  ShortestPathsBellmanFord: () => ShortestPathsBellmanFord,
  ShortestPathsDag: () => ShortestPathsDag,
  ShortestPathsDijkstra: () => ShortestPathsDijkstra,
  Sinks: () => Sinks,
  SourceFirstBidirectionalTopologicalSort: () => SourceFirstBidirectionalTopologicalSort,
  SourceFirstTopologicalSort: () => SourceFirstTopologicalSort,
  StronglyConnectedComponents: () => StronglyConnectedComponents,
  TopologicalSort: () => TopologicalSort,
  TreeBreadthFirstSearch: () => TreeBreadthFirstSearch,
  TreeCyclePoppingRandom: () => TreeCyclePoppingRandom,
  TreeDepthFirstSearch: () => TreeDepthFirstSearch,
  WeaklyConnectedComponents: () => WeaklyConnectedComponents
});
module.exports = __toCommonJS(algorithm_extensions_exports);
var import_equality = require("./equality.js");
var Core = __toESM(require("./core.js"), 1);
var Collections = __toESM(require("./collections.js"), 1);
var Search = __toESM(require("./search.js"), 1);
var Paths = __toESM(require("./shortest-paths.js"), 1);
var Structural = __toESM(require("./structural.js"), 1);
var Advanced = __toESM(require("./advanced.js"), 1);
var Observers = __toESM(require("./observers.js"), 1);
const required = (value, name) => {
  if (value == null) throw new TypeError(`${name} is required.`);
  return value;
};
function GetIndexer(dictionary) {
  required(dictionary, "dictionary");
  return (key) => {
    if (dictionary instanceof globalThis.Map) {
      if (!dictionary.has(key)) throw new Error("Key not found.");
      return dictionary.get(key);
    }
    if (!Object.hasOwn(dictionary, key)) throw new Error("Key not found.");
    return dictionary[key];
  };
}
function identityAllocator(primitiveStrings) {
  const ids = new import_equality.EqualityMap(), owners = new import_equality.EqualityMap();
  let next = 0;
  return (value) => {
    required(value, "identity value");
    if (ids.has(value)) return ids.get(value);
    const type = typeof value;
    let id = primitiveStrings && ["string", "number", "boolean", "bigint"].includes(type) ? type === "boolean" ? value ? "True" : "False" : String(value) : void 0;
    if (id === void 0 || owners.has(id)) {
      do {
        id = String(next++);
      } while (owners.has(id));
    }
    ids.set(value, id);
    owners.set(id, value);
    return id;
  };
}
function GetVertexIdentity(graph) {
  required(graph, "graph");
  const types = new import_equality.EqualitySet([...graph.Vertices].map((v) => typeof v));
  const homogeneous = types.size <= 1 && ![...types].some((t) => !["string", "number", "boolean", "bigint"].includes(t));
  return identityAllocator(homogeneous);
}
function GetEdgeIdentity(graph) {
  required(graph, "graph");
  return identityAllocator(false);
}
function runTree(algorithm, root, undirected = false) {
  required(root, "root");
  const recorder = undirected ? new Observers.UndirectedVertexPredecessorRecorderObserver() : new Observers.VertexPredecessorRecorderObserver();
  const subscription = recorder.Attach(algorithm);
  try {
    algorithm.Compute(root);
  } finally {
    (subscription.Dispose ?? subscription.dispose ?? subscription.unsubscribe).call(subscription);
  }
  const lookup = (vertex) => recorder.TryGetPath(vertex);
  lookup.algorithm = algorithm;
  lookup.predecessors = recorder.VerticesPredecessors;
  return lookup;
}
function TreeBreadthFirstSearch(graph, root) {
  return runTree(new Search.BreadthFirstSearchAlgorithm(graph), root);
}
function TreeDepthFirstSearch(graph, root) {
  return runTree(new Search.DepthFirstSearchAlgorithm(graph), root);
}
function TreeCyclePoppingRandom(graph, root, edgeChain = new Advanced.NormalizedMarkovEdgeChain()) {
  const algorithm = new Advanced.CyclePoppingRandomTreeAlgorithm(graph, edgeChain);
  algorithm.Compute(required(root, "root"));
  const lookup = (vertex) => {
    required(vertex, "vertex");
    const path = [], seen = new import_equality.EqualitySet();
    let current = vertex;
    while (!(0, import_equality.valueEquals)(current, root)) {
      if (seen.has(current)) throw new Error("The final successor tree contains a cycle.");
      seen.add(current);
      const edge = algorithm.Successors.get(current);
      if (!edge) return void 0;
      path.push(edge);
      current = edge.Target;
    }
    return path.length ? path : void 0;
  };
  lookup.algorithm = algorithm;
  lookup.successors = algorithm.Successors;
  return lookup;
}
function ShortestPathsDijkstra(graph, weights, root) {
  required(graph, "graph");
  return runTree(graph.IsDirected ? new Paths.DijkstraShortestPathAlgorithm(graph, weights) : new Paths.UndirectedDijkstraShortestPathAlgorithm(graph, weights), root, !graph.IsDirected);
}
function ShortestPathsAStar(graph, weights, heuristic, root) {
  return runTree(new Paths.AStarShortestPathAlgorithm(graph, weights, heuristic), root);
}
function ShortestPathsBellmanFord(graph, weights, root) {
  const result = runTree(new Paths.BellmanFordShortestPathAlgorithm(graph, weights), root);
  return Object.assign(result, { hasNegativeCycle: result.algorithm.FoundNegativeCycle });
}
function ShortestPathsDag(graph, weights, root) {
  return runTree(new Paths.DagShortestPathAlgorithm(graph, weights), root);
}
function RankedShortestPathHoffmanPavley(graph, weights, root, target, pathCount = 3) {
  const algorithm = new Paths.HoffmanPavleyRankedShortestPathAlgorithm(graph, weights);
  algorithm.ShortestPathCount = pathCount;
  algorithm.Compute(root, target);
  return algorithm.ComputedShortestPaths;
}
function Sinks(graph) {
  required(graph, "graph");
  return [...graph.Vertices].filter((v) => graph.OutDegree(v) === 0);
}
function Roots(graph) {
  required(graph, "graph");
  const targets = new import_equality.EqualitySet([...graph.Edges].map((e) => e.Target));
  return [...graph.Vertices].filter((v) => !targets.has(v));
}
function IsolatedVertices(graph) {
  required(graph, "graph");
  const touched = new import_equality.EqualitySet();
  for (const e of graph.Edges) {
    touched.add(e.Source);
    touched.add(e.Target);
  }
  return [...graph.Vertices].filter((v) => !touched.has(v));
}
function sort(graph, Type, output) {
  const algorithm = new Type(graph);
  algorithm.Compute();
  const values = [...algorithm.SortedVertices];
  if (output) {
    output.push(...values);
    return output;
  }
  return values;
}
function TopologicalSort(graph, output = void 0) {
  required(graph, "graph");
  return sort(graph, graph.IsDirected ? Structural.TopologicalSortAlgorithm : Structural.UndirectedTopologicalSortAlgorithm, output);
}
function SourceFirstTopologicalSort(graph, output = void 0) {
  required(graph, "graph");
  return sort(graph, graph.IsDirected ? Structural.SourceFirstTopologicalSortAlgorithm : Structural.UndirectedFirstTopologicalSortAlgorithm, output);
}
function SourceFirstBidirectionalTopologicalSort(graph, direction = 0, output = void 0) {
  if (Array.isArray(direction)) {
    output = direction;
    direction = 0;
  }
  const algorithm = new Structural.SourceFirstBidirectionalTopologicalSortAlgorithm(graph, direction);
  algorithm.Compute();
  const values = [...algorithm.SortedVertices];
  if (output) {
    output.push(...values);
    return output;
  }
  return values;
}
function components(graph, Type, output = new import_equality.EqualityMap()) {
  const algorithm = new Type(graph, output);
  algorithm.Compute();
  if (algorithm.Components !== output) {
    output.clear();
    for (const pair of algorithm.Components) output.set(...pair);
  }
  return algorithm.ComponentCount;
}
function ConnectedComponents(graph, output = new import_equality.EqualityMap()) {
  return components(graph, Structural.ConnectedComponentsAlgorithm, output);
}
function StronglyConnectedComponents(graph, output = new import_equality.EqualityMap()) {
  return components(graph, Structural.StronglyConnectedComponentsAlgorithm, output);
}
function WeaklyConnectedComponents(graph, output = new import_equality.EqualityMap()) {
  return components(graph, Structural.WeaklyConnectedComponentsAlgorithm, output);
}
function IncrementalConnectedComponents(graph) {
  const algorithm = new Structural.IncrementalConnectedComponentsAlgorithm(graph);
  algorithm.Compute();
  return algorithm;
}
function CondensateStronglyConnected(graph, graphFactory = void 0) {
  const algorithm = graphFactory === void 0 ? new Structural.CondensationGraphAlgorithm(graph) : new Structural.CondensationGraphAlgorithm(graph, graphFactory);
  algorithm.StronglyConnected = true;
  algorithm.Compute();
  return algorithm.CondensedGraph;
}
function CondensateWeaklyConnected(graph, graphFactory = void 0) {
  const algorithm = graphFactory === void 0 ? new Structural.CondensationGraphAlgorithm(graph) : new Structural.CondensationGraphAlgorithm(graph, graphFactory);
  algorithm.StronglyConnected = false;
  algorithm.Compute();
  return algorithm.CondensedGraph;
}
function CondensateEdges(graph, vertexPredicate = () => true) {
  const algorithm = new Structural.EdgeMergeCondensationGraphAlgorithm(graph, new Core.BidirectionalGraph(), vertexPredicate);
  algorithm.Compute();
  return algorithm.CondensedGraph;
}
function OddVertices(graph) {
  required(graph, "graph");
  const counts = new import_equality.EqualityMap([...graph.Vertices].map((v) => [v, 0]));
  for (const e of graph.Edges) {
    counts.set(e.Source, counts.get(e.Source) + 1);
    counts.set(e.Target, counts.get(e.Target) - 1);
  }
  return [...counts].filter(([, count]) => count % 2 !== 0).map(([v]) => v);
}
function graphOrEdges(value, Type) {
  required(value, "graph or edges");
  if (value.Vertices !== void 0 && value.Edges !== void 0) return value;
  const graph = new Type();
  graph.AddVerticesAndEdgeRange(value);
  return graph;
}
function IsDirectedAcyclicGraph(value) {
  const graph = graphOrEdges(value, Core.AdjacencyGraph);
  try {
    new Structural.TopologicalSortAlgorithm(graph).Compute();
    return true;
  } catch (error) {
    if (error.name === "NonAcyclicGraphException") return false;
    throw error;
  }
}
function IsUndirectedAcyclicGraph(value) {
  const graph = graphOrEdges(value, Core.UndirectedGraph), sets = new Collections.ForestDisjointSet();
  for (const v of graph.Vertices) sets.MakeSet(v);
  for (const e of graph.Edges) {
    if (!sets.Union(e.Source, e.Target)) return false;
  }
  return true;
}
function ComputePredecessorCost(predecessors, weights, vertex) {
  required(predecessors, "predecessors");
  required(weights, "weights");
  required(vertex, "vertex");
  const weight = typeof weights === "function" ? weights : GetIndexer(weights);
  let cost = 0;
  const seen = new import_equality.EqualitySet();
  while (predecessors.has(vertex)) {
    if (seen.has(vertex)) throw new Error("Predecessors contain a cycle.");
    seen.add(vertex);
    const e = predecessors.get(vertex);
    cost += weight(e);
    vertex = e.Source;
  }
  return cost;
}
function ComputeDisjointSet(graph) {
  required(graph, "graph");
  const set = new Collections.ForestDisjointSet();
  for (const v of graph.Vertices) set.MakeSet(v);
  for (const e of graph.Edges) set.Union(e.Source, e.Target);
  return set;
}
function spanning(graph, weights, Type) {
  required(graph, "graph");
  required(weights, "weights");
  const algorithm = new Type(graph, weights), edges = [];
  algorithm.TreeEdge.add((e) => edges.push(e));
  algorithm.Compute();
  return edges;
}
function MinimumSpanningTreePrim(graph, weights) {
  return spanning(graph, weights, Structural.PrimMinimumSpanningTreeAlgorithm);
}
function MinimumSpanningTreeKruskal(graph, weights) {
  return spanning(graph, weights, Structural.KruskalMinimumSpanningTreeAlgorithm);
}
function OfflineLeastCommonAncestor(graph, root, pairs) {
  required(pairs, "pairs");
  const queries = [...pairs], algorithm = new Structural.TarjanOfflineLeastCommonAncestorAlgorithm(graph);
  algorithm.Compute(root, queries);
  return (pair) => algorithm.Ancestors.get(required(pair, "pair"));
}
function MaximumFlow(graph, capacities, source, sink, edgeFactory = (s, t) => new Core.Edge(s, t), augmentor) {
  required(source, "source");
  required(sink, "sink");
  if ((0, import_equality.valueEquals)(source, sink)) throw new Error("Source and sink must differ.");
  if (augmentor === null) throw new TypeError("augmentor is required.");
  const algorithm = augmentor === void 0 ? new Advanced.EdmondsKarpMaximumFlowAlgorithm(graph, capacities, edgeFactory) : new Advanced.EdmondsKarpMaximumFlowAlgorithm(graph, capacities, edgeFactory, augmentor);
  algorithm.Compute(source, sink);
  return { value: algorithm.MaxFlow, predecessors: (vertex) => algorithm.Predecessors.get(vertex), algorithm };
}
function ComputeTransitiveReduction(graph) {
  const algorithm = new Structural.TransitiveReductionAlgorithm(graph);
  algorithm.Compute();
  return algorithm.TransitiveReduction;
}
function ComputeTransitiveClosure(graph, edgeFactory = (s, t) => new Core.Edge(s, t)) {
  const algorithm = new Structural.TransitiveClosureAlgorithm(graph, edgeFactory);
  algorithm.Compute();
  return algorithm.TransitiveClosure;
}
function Clone(graph, vertexCloner, edgeCloner, clone) {
  required(graph, "graph");
  required(vertexCloner, "vertexCloner");
  required(edgeCloner, "edgeCloner");
  required(clone, "clone");
  if (graph === clone) throw new Error("Clone destination must differ from source.");
  clone.Clear();
  const vertices = new import_equality.EqualityMap();
  for (const vertex of graph.Vertices) {
    const copy = vertexCloner(vertex);
    clone.AddVertex(copy);
    vertices.set(vertex, copy);
  }
  for (const edge of graph.Edges) clone.AddEdge(edgeCloner(edge, vertices.get(edge.Source), vertices.get(edge.Target)));
  return clone;
}
const AlgorithmExtensions = Object.freeze({ GetIndexer, GetVertexIdentity, GetEdgeIdentity, TreeBreadthFirstSearch, TreeDepthFirstSearch, TreeCyclePoppingRandom, ShortestPathsDijkstra, ShortestPathsAStar, ShortestPathsBellmanFord, ShortestPathsDag, RankedShortestPathHoffmanPavley, Sinks, Roots, IsolatedVertices, TopologicalSort, SourceFirstTopologicalSort, SourceFirstBidirectionalTopologicalSort, ConnectedComponents, IncrementalConnectedComponents, StronglyConnectedComponents, WeaklyConnectedComponents, CondensateStronglyConnected, CondensateWeaklyConnected, CondensateEdges, OddVertices, IsDirectedAcyclicGraph, IsUndirectedAcyclicGraph, ComputePredecessorCost, ComputeDisjointSet, MinimumSpanningTreePrim, MinimumSpanningTreeKruskal, OfflineLeastCommonAncestor, MaximumFlow, ComputeTransitiveReduction, ComputeTransitiveClosure, Clone });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AlgorithmExtensions,
  Clone,
  ComputeDisjointSet,
  ComputePredecessorCost,
  ComputeTransitiveClosure,
  ComputeTransitiveReduction,
  CondensateEdges,
  CondensateStronglyConnected,
  CondensateWeaklyConnected,
  ConnectedComponents,
  GetEdgeIdentity,
  GetIndexer,
  GetVertexIdentity,
  IncrementalConnectedComponents,
  IsDirectedAcyclicGraph,
  IsUndirectedAcyclicGraph,
  IsolatedVertices,
  MaximumFlow,
  MinimumSpanningTreeKruskal,
  MinimumSpanningTreePrim,
  OddVertices,
  OfflineLeastCommonAncestor,
  RankedShortestPathHoffmanPavley,
  Roots,
  ShortestPathsAStar,
  ShortestPathsBellmanFord,
  ShortestPathsDag,
  ShortestPathsDijkstra,
  Sinks,
  SourceFirstBidirectionalTopologicalSort,
  SourceFirstTopologicalSort,
  StronglyConnectedComponents,
  TopologicalSort,
  TreeBreadthFirstSearch,
  TreeCyclePoppingRandom,
  TreeDepthFirstSearch,
  WeaklyConnectedComponents
});
//# sourceMappingURL=algorithm-extensions.js.map
