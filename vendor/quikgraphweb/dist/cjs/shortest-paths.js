var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var shortest_paths_exports = {};
__export(shortest_paths_exports, {
  AStarShortestPathAlgorithm: () => AStarShortestPathAlgorithm,
  BellmanFordShortestPathAlgorithm: () => BellmanFordShortestPathAlgorithm,
  DagShortestPathAlgorithm: () => DagShortestPathAlgorithm,
  DijkstraShortestPathAlgorithm: () => DijkstraShortestPathAlgorithm,
  FloydWarshallAllShortestPathAlgorithm: () => FloydWarshallAllShortestPathAlgorithm,
  HoffmanPavleyRankedShortestPathAlgorithm: () => HoffmanPavleyRankedShortestPathAlgorithm,
  RankedShortestPathAlgorithmBase: () => RankedShortestPathAlgorithmBase,
  ShortestPathAlgorithmBase: () => ShortestPathAlgorithmBase,
  SortedPath: () => SortedPath,
  UndirectedDijkstraShortestPathAlgorithm: () => UndirectedDijkstraShortestPathAlgorithm,
  UndirectedShortestPathAlgorithmBase: () => UndirectedShortestPathAlgorithmBase,
  YenShortestPathsAlgorithm: () => YenShortestPathsAlgorithm,
  predecessorPath: () => predecessorPath
});
module.exports = __toCommonJS(shortest_paths_exports);
var import_equality = require("./equality.js");
var import_algorithm_base = require("./algorithm-base.js");
var import_core = require("./core.js");
const { White, Gray, Black } = import_algorithm_base.GraphColor;
function parse(input) {
  const args = [...input];
  let host = null;
  if (args[0] == null || args[0]?.Services && args[1]?.ContainsVertex) host = args.shift();
  const graph = (0, import_algorithm_base.requireValue)(args.shift(), "visitedGraph");
  if (typeof graph.ContainsVertex !== "function") throw (0, import_algorithm_base.algorithmError)("ArgumentException", "visitedGraph must implement ContainsVertex.");
  return { host, graph, args };
}
function checkedWeight(weights, edge, nonnegative = false) {
  const weight = weights(edge);
  if (typeof weight !== "number" || !Number.isFinite(weight)) throw (0, import_algorithm_base.algorithmError)("ArgumentException", "Edge weights must be finite numbers.");
  if (nonnegative && weight < 0) throw (0, import_algorithm_base.algorithmError)("NegativeWeightException", "Algorithm requires non-negative edge weights.");
  return weight;
}
function predecessorPath(predecessors, vertex, undirected = false) {
  (0, import_algorithm_base.requireValue)(vertex, "vertex");
  const path = [], seen = new import_equality.EqualitySet();
  while (predecessors.has(vertex)) {
    if (seen.has(vertex)) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "The predecessor map contains a cycle.");
    seen.add(vertex);
    const edge = predecessors.get(vertex);
    path.push(edge);
    vertex = undirected && (0, import_algorithm_base.sameVertex)(edge.Source, vertex) ? edge.Target : edge.Source;
  }
  return path.length ? path.reverse() : void 0;
}
class ShortestPathAlgorithmBase extends import_algorithm_base.RootedAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parse(input);
    super(host, graph);
    this.Weights = (0, import_algorithm_base.requireValue)(args[0], "edgeWeights");
    this.DistanceRelaxer = args.length > 1 ? (0, import_algorithm_base.requireValue)(args[1], "distanceRelaxer") : import_algorithm_base.DistanceRelaxers.ShortestDistance;
    this.Distances = null;
    this.VerticesColors = null;
    this.Predecessors = new import_equality.EqualityMap();
    (0, import_algorithm_base.events)(this, "TreeEdge InitializeVertex DiscoverVertex StartVertex ExamineVertex ExamineEdge FinishVertex EdgeNotRelaxed");
  }
  TryGetDistance(v) {
    (0, import_algorithm_base.requireValue)(v, "vertex");
    if (!this.Distances) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "Run the algorithm before.");
    return this.Distances.get(v);
  }
  GetDistance(v) {
    const result = this.TryGetDistance(v);
    if (result === void 0) throw (0, import_algorithm_base.algorithmError)("VertexNotFoundException", "Vertex distance not available.");
    return result;
  }
  GetDistances() {
    return this.Distances ? this.Distances.entries() : [][Symbol.iterator]();
  }
  DistancesIndexGetter() {
    return (vertex) => this.GetDistance(vertex);
  }
  OnTreeEdge(edge, reversed = false) {
    if (this._undirected) this.TreeEdge.emit(this, new import_core.UndirectedEdgeEventArgs(edge, reversed));
    else this.TreeEdge.emit(edge);
  }
  GetVertexDistance(v) {
    return this.GetDistance(v);
  }
  SetVertexDistance(v, distance) {
    this.Distances.set(v, distance);
  }
  GetVertexColor(v) {
    if (!this.VerticesColors.has(v)) throw (0, import_algorithm_base.algorithmError)("VertexNotFoundException", "Vertex color not available.");
    return this.VerticesColors.get(v);
  }
  TryGetPath(v) {
    return predecessorPath(this.Predecessors, v, this._undirected);
  }
  Initialize() {
    this.Distances ??= new import_equality.EqualityMap();
    this.VerticesColors ??= new import_equality.EqualityMap();
    this.Distances.clear();
    this.VerticesColors.clear();
    this.Predecessors.clear();
    for (const v of this.VisitedGraph.Vertices) {
      this.Distances.set(v, this.DistanceRelaxer.InitialDistance);
      this.VerticesColors.set(v, White);
      this.InitializeVertex.emit(v);
    }
  }
  _emitEdge(name, edge, source) {
    if (this._undirected && name !== "ExamineEdge") this[name].emit(this, new import_core.UndirectedEdgeEventArgs(edge, (0, import_algorithm_base.sameVertex)(edge.Target, source)));
    else this[name].emit(edge);
  }
  Relax(edge, source = edge.Source, target = edge.Target) {
    const distance = this.Distances.get(source);
    if (distance === this.DistanceRelaxer.InitialDistance || distance === Infinity) return false;
    const combined = this.DistanceRelaxer.Combine(distance, checkedWeight(this.Weights, edge));
    if (this.DistanceRelaxer.Compare(combined, this.Distances.get(target)) < 0) {
      this.Distances.set(target, combined);
      this.Predecessors.set(target, edge);
      return true;
    }
    return false;
  }
}
class UndirectedShortestPathAlgorithmBase extends ShortestPathAlgorithmBase {
  constructor(...args) {
    super(...args);
    this._undirected = true;
  }
}
class DijkstraShortestPathAlgorithm extends ShortestPathAlgorithmBase {
  InternalCompute() {
    if (this._hasRoot) {
      this.AssertRootInGraph(this._root);
      this._fromRoot(this._root);
    } else for (const v of this.VisitedGraph.Vertices) if (this.GetVertexColor(v) === White) this._fromRoot(v);
  }
  _fromRoot(root) {
    const heap = new import_algorithm_base.AlgorithmHeap((a, b) => this.DistanceRelaxer.Compare(a.priority, b.priority));
    this.Distances.set(root, 0);
    this.StartVertex.emit(root);
    this.VerticesColors.set(root, Gray);
    this.DiscoverVertex.emit(root);
    heap.Enqueue({ vertex: root, distance: 0, priority: 0 });
    while (heap.Count) {
      this.ThrowIfCancellationRequested();
      const entry = heap.Dequeue(), u = entry.vertex;
      if (entry.distance !== this.Distances.get(u) || this.GetVertexColor(u) === Black) continue;
      this.ExamineVertex.emit(u);
      const edges = this._undirected ? this.VisitedGraph.AdjacentEdges(u) : this.VisitedGraph.OutEdges(u);
      for (const edge of edges) {
        this.ThrowIfCancellationRequested();
        const v = this._undirected && (0, import_algorithm_base.sameVertex)(edge.Target, u) ? edge.Source : edge.Target;
        this.ExamineEdge.emit(edge);
        checkedWeight(this.Weights, edge, true);
        const oldColor = this.GetVertexColor(v);
        if (oldColor === Black && !this.CostHeuristic) continue;
        if (this.Relax(edge, u, v)) {
          const distance = this.Distances.get(v);
          let priority;
          if (this.CostHeuristic && oldColor !== Black) {
            priority = this.DistanceRelaxer.Combine(distance, this.CostHeuristic(v));
            this._emitEdge("TreeEdge", edge, u);
          } else {
            this._emitEdge("TreeEdge", edge, u);
            priority = this.CostHeuristic ? this.DistanceRelaxer.Combine(distance, this.CostHeuristic(v)) : distance;
          }
          this.VerticesColors.set(v, Gray);
          if (oldColor === White) this.DiscoverVertex.emit(v);
          heap.Enqueue({ vertex: v, distance, priority });
        } else this._emitEdge("EdgeNotRelaxed", edge, u);
      }
      this.VerticesColors.set(u, Black);
      this.FinishVertex.emit(u);
    }
  }
}
class UndirectedDijkstraShortestPathAlgorithm extends DijkstraShortestPathAlgorithm {
  constructor(...args) {
    super(...args);
    this._undirected = true;
  }
}
class AStarShortestPathAlgorithm extends DijkstraShortestPathAlgorithm {
  constructor(...input) {
    const { host, graph, args } = parse(input);
    super(host, graph, args[0], args.length > 2 ? (0, import_algorithm_base.requireValue)(args[2], "distanceRelaxer") : import_algorithm_base.DistanceRelaxers.ShortestDistance);
    this.CostHeuristic = (0, import_algorithm_base.requireValue)(args[1], "costHeuristic");
  }
}
class BellmanFordShortestPathAlgorithm extends ShortestPathAlgorithmBase {
  constructor(...args) {
    super(...args);
    this.FoundNegativeCycle = false;
    (0, import_algorithm_base.events)(this, "EdgeMinimized EdgeNotMinimized");
  }
  Initialize() {
    super.Initialize();
    this.FoundNegativeCycle = false;
    for (const v of this.VisitedGraph.Vertices) this.Distances.set(v, Infinity);
    const root = this._hasRoot ? this.GetAndAssertRootInGraph() : this.VisitedGraph.Vertices[Symbol.iterator]().next().value;
    if (root === void 0) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "Graph is empty.");
    this.Distances.set(root, 0);
  }
  InternalCompute() {
    for (let pass = 0; pass < this.VisitedGraph.VertexCount; pass++) {
      let changed = false;
      for (const edge of this.VisitedGraph.Edges) {
        this.ThrowIfCancellationRequested();
        this.ExamineEdge.emit(edge);
        if (this.Relax(edge)) {
          changed = true;
          this.TreeEdge.emit(edge);
        } else this.EdgeNotRelaxed.emit(edge);
      }
      if (!changed) break;
    }
    for (const edge of this.VisitedGraph.Edges) {
      const source = this.Distances.get(edge.Source);
      if (source !== Infinity && this.DistanceRelaxer.Compare(this.DistanceRelaxer.Combine(source, checkedWeight(this.Weights, edge)), this.Distances.get(edge.Target)) < 0) {
        this.EdgeMinimized.emit(edge);
        this.FoundNegativeCycle = true;
        return;
      }
      this.EdgeNotMinimized.emit(edge);
    }
  }
  Clean() {
    for (const v of this.VisitedGraph.Vertices) this.VerticesColors.set(v, Black);
  }
}
class DagShortestPathAlgorithm extends ShortestPathAlgorithmBase {
  InternalCompute() {
    const root = this.GetAndAssertRootInGraph(), vertices = [...this.VisitedGraph.Vertices], degrees = new import_equality.EqualityMap(vertices.map((v) => [v, 0]));
    for (const edge of this.VisitedGraph.Edges) degrees.set(edge.Target, degrees.get(edge.Target) + 1);
    const order = vertices.filter((v) => degrees.get(v) === 0);
    for (let i = 0; i < order.length; i++) for (const edge of this.VisitedGraph.OutEdges(order[i])) {
      degrees.set(edge.Target, degrees.get(edge.Target) - 1);
      if (!degrees.get(edge.Target)) order.push(edge.Target);
    }
    if (order.length !== vertices.length) throw (0, import_algorithm_base.algorithmError)("NonAcyclicGraphException", "DAG shortest paths require an acyclic graph.");
    this.Distances.set(root, 0);
    this.VerticesColors.set(root, Gray);
    this.DiscoverVertex.emit(root);
    for (const u of order) {
      this.ThrowIfCancellationRequested();
      this.StartVertex.emit(u);
      this.VerticesColors.set(u, Gray);
      this.ExamineVertex.emit(u);
      for (const edge of this.VisitedGraph.OutEdges(u)) {
        this.VerticesColors.set(edge.Target, Gray);
        this.ExamineEdge.emit(edge);
        this.DiscoverVertex.emit(edge.Target);
        (this.Relax(edge) ? this.TreeEdge : this.EdgeNotRelaxed).emit(edge);
      }
      this.VerticesColors.set(u, Black);
      this.FinishVertex.emit(u);
    }
  }
}
class FloydWarshallAllShortestPathAlgorithm extends import_algorithm_base.AlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parse(input);
    super(host, graph);
    this.Weights = (0, import_algorithm_base.requireValue)(args[0], "edgeWeights");
    this.DistanceRelaxer = args.length > 1 ? (0, import_algorithm_base.requireValue)(args[1], "distanceRelaxer") : import_algorithm_base.DistanceRelaxers.ShortestDistance;
    this.Distances = new import_equality.EqualityMap();
    this._next = new import_equality.EqualityMap();
  }
  Initialize() {
    this.Distances.clear();
    this._next.clear();
    for (const v of this.VisitedGraph.Vertices) {
      this.Distances.set(v, new import_equality.EqualityMap([[v, 0]]));
      this._next.set(v, new import_equality.EqualityMap());
    }
    for (const edge of this.VisitedGraph.Edges) {
      const weight = checkedWeight(this.Weights, edge), row = this.Distances.get(edge.Source);
      if (!row.has(edge.Target) || this.DistanceRelaxer.Compare(weight, row.get(edge.Target)) < 0) {
        row.set(edge.Target, weight);
        this._next.get(edge.Source).set(edge.Target, edge);
      }
      if (!this.VisitedGraph.IsDirected) {
        const reverse = this.Distances.get(edge.Target);
        if (!reverse.has(edge.Source) || this.DistanceRelaxer.Compare(weight, reverse.get(edge.Source)) < 0) {
          reverse.set(edge.Source, weight);
          this._next.get(edge.Target).set(edge.Source, edge);
        }
      }
    }
  }
  InternalCompute() {
    const vertices = [...this.VisitedGraph.Vertices];
    for (const k of vertices) {
      this.ThrowIfCancellationRequested();
      const rowK = this.Distances.get(k);
      for (const i of vertices) {
        const rowI = this.Distances.get(i);
        if (!rowI.has(k)) continue;
        const ik = rowI.get(k);
        for (const j of vertices) {
          if (!rowK.has(j)) continue;
          const distance = this.DistanceRelaxer.Combine(ik, rowK.get(j));
          if (!rowI.has(j) || this.DistanceRelaxer.Compare(distance, rowI.get(j)) < 0) {
            rowI.set(j, distance);
            this._next.get(i).set(j, this._next.get(i).get(k) ?? this._next.get(k).get(j));
          }
        }
      }
    }
    for (const v of vertices) if (this.Distances.get(v).get(v) < 0) throw (0, import_algorithm_base.algorithmError)("NegativeCycleGraphException", "Graph contains a negative cycle.");
  }
  TryGetDistance(source, target) {
    (0, import_algorithm_base.requireValue)(source, "source");
    (0, import_algorithm_base.requireValue)(target, "target");
    return this.Distances.get(source)?.get(target);
  }
  TryGetPath(source, target) {
    (0, import_algorithm_base.requireValue)(source, "source");
    (0, import_algorithm_base.requireValue)(target, "target");
    if ((0, import_algorithm_base.sameVertex)(source, target) || !this._next.get(source)?.has(target)) return void 0;
    const path = [], seen = new import_equality.EqualitySet();
    while (!(0, import_algorithm_base.sameVertex)(source, target)) {
      if (seen.has(source)) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "Cycle in shortest path.");
      seen.add(source);
      const edge = this._next.get(source)?.get(target);
      if (!edge) return void 0;
      path.push(edge);
      source = !this.VisitedGraph.IsDirected && (0, import_algorithm_base.sameVertex)(edge.Target, source) ? edge.Source : edge.Target;
    }
    return path;
  }
  Dump(writer) {
    (0, import_algorithm_base.requireValue)(writer, "writer");
    const lines = ["data:"];
    for (const [source, row] of this.Distances) for (const [target, distance] of row) lines.push(`${source}->${target}: ${distance}`);
    const result = lines.join("\n");
    if (typeof writer === "function") writer(result);
    else if (writer.WriteLine) for (const line of lines) writer.WriteLine(line);
    else writer.write(result);
    return result;
  }
}
let nextSortedPathHash = 1;
const sortedPathHashes = /* @__PURE__ */ new WeakMap();
class SortedPath {
  constructor(edges) {
    this.Edges = [...(0, import_algorithm_base.requireValue)(edges, "edges")];
    sortedPathHashes.set(this, nextSortedPathHash++);
  }
  get Count() {
    return this.Edges.length;
  }
  GetVertex(i) {
    return this.Edges[i].Source;
  }
  GetEdge(i) {
    return this.Edges[i];
  }
  GetEdges(count) {
    return this.Edges.slice(0, count);
  }
  Equals(other) {
    return other instanceof SortedPath && this.Count === other.Count && this.Edges.every((edge, i) => (0, import_equality.valueEquals)(edge, other.Edges[i]));
  }
  GetHashCode() {
    return sortedPathHashes.get(this);
  }
  [Symbol.iterator]() {
    return this.Edges[Symbol.iterator]();
  }
}
function shortestAvoiding(graph, source, target, weights, bannedVertices = new import_equality.EqualitySet(), bannedEdges = new import_equality.EqualitySet()) {
  const distances = new import_equality.EqualityMap([[source, 0]]), predecessors = new import_equality.EqualityMap(), heap = new import_algorithm_base.AlgorithmHeap();
  heap.Enqueue({ vertex: source, priority: 0 });
  while (heap.Count) {
    const { vertex, priority } = heap.Dequeue();
    if (distances.get(vertex) !== priority) continue;
    if ((0, import_algorithm_base.sameVertex)(vertex, target)) return predecessorPath(predecessors, vertex) ?? [];
    for (const edge of graph.OutEdges(vertex)) {
      if (bannedEdges.has(edge) || bannedVertices.has(edge.Target)) continue;
      const d = priority + checkedWeight(weights, edge, true);
      if (d < (distances.get(edge.Target) ?? Infinity)) {
        distances.set(edge.Target, d);
        predecessors.set(edge.Target, edge);
        heap.Enqueue({ vertex: edge.Target, priority: d });
      }
    }
  }
  return void 0;
}
class YenShortestPathsAlgorithm {
  static SortedPath = SortedPath;
  constructor(graph, source, target, k, edgeWeights = null, filter = null) {
    this.VisitedGraph = (0, import_algorithm_base.requireValue)(graph, "graph").Clone();
    (0, import_algorithm_base.requireValue)(source, "source");
    (0, import_algorithm_base.requireValue)(target, "target");
    if (!graph.ContainsVertex(source) || !graph.ContainsVertex(target)) throw (0, import_algorithm_base.algorithmError)("ArgumentException", "Both endpoints must be in the graph.");
    if (!Number.isInteger(k) || k < 1) throw (0, import_algorithm_base.algorithmError)("ArgumentOutOfRangeException", "k must be a positive integer.");
    this.Source = source;
    this.Target = target;
    this.K = k;
    this.Weights = edgeWeights ?? ((edge) => edge.Tag);
    this.Filter = filter ?? ((paths) => paths);
  }
  Execute() {
    const graph = this.VisitedGraph, first = shortestAvoiding(graph, this.Source, this.Target, this.Weights);
    if (first === void 0 || !first.length) throw (0, import_algorithm_base.algorithmError)("NoPathFoundException", "No path found between the supplied vertices.");
    const accepted = [first], heap = new import_algorithm_base.AlgorithmHeap(), seen = new import_equality.EqualitySet(), ids = new import_equality.EqualityMap([...graph.Edges].map((edge, i) => [edge, i]));
    const key = (path) => path.map((edge) => ids.get(edge)).join(",");
    seen.add(key(first));
    for (let rank = 1; rank < this.K; rank++) {
      const previous = accepted[rank - 1];
      for (let i = 0; i < previous.length; i++) {
        const prefix = previous.slice(0, i), spur = previous[i].Source, bannedEdges = new import_equality.EqualitySet(), bannedVertices = new import_equality.EqualitySet(prefix.map((edge) => edge.Source));
        for (const path of accepted) if (path.length > i && prefix.every((edge, j) => (0, import_equality.valueEquals)(edge, path[j]))) bannedEdges.add(path[i]);
        const tail = shortestAvoiding(graph, spur, this.Target, this.Weights, bannedVertices, bannedEdges);
        if (tail === void 0) continue;
        const candidate = [...prefix, ...tail], id = key(candidate);
        if (!seen.has(id)) {
          seen.add(id);
          heap.Enqueue({ path: candidate, priority: candidate.reduce((sum, edge) => sum + this.Weights(edge), 0) });
        }
      }
      if (!heap.Count) break;
      accepted.push(heap.Dequeue().path);
    }
    return [...this.Filter(accepted.map((path) => new SortedPath(path)))];
  }
}
class RankedShortestPathAlgorithmBase extends import_algorithm_base.RootedSearchAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parse(input);
    super(host, graph);
    this.DistanceRelaxer = args[0] ?? import_algorithm_base.DistanceRelaxers.ShortestDistance;
    this._shortestPathCount = 3;
    this.ComputedShortestPaths = [];
  }
  get ShortestPathCount() {
    return this._shortestPathCount;
  }
  set ShortestPathCount(value) {
    if (!Number.isInteger(value) || value <= 1) throw (0, import_algorithm_base.algorithmError)("ArgumentOutOfRangeException", "ShortestPathCount must be more than 1.");
    this._shortestPathCount = value;
  }
  get ComputedShortestPathCount() {
    return this.ComputedShortestPaths.length;
  }
  AddComputedShortestPath(path) {
    this.ComputedShortestPaths.push([...path]);
  }
  Initialize() {
    this.ComputedShortestPaths = [];
  }
}
class HoffmanPavleyRankedShortestPathAlgorithm extends RankedShortestPathAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parse(input);
    super(host, graph, args.length > 1 ? (0, import_algorithm_base.requireValue)(args[1], "distanceRelaxer") : import_algorithm_base.DistanceRelaxers.ShortestDistance);
    this.Weights = (0, import_algorithm_base.requireValue)(args[0], "edgeWeights");
  }
  InternalCompute() {
    const root = this.GetAndAssertRootInGraph(), target = this.TryGetTargetVertex();
    if (target === void 0) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "Target vertex not set.");
    this.AssertRootInGraph(target);
    if ((0, import_algorithm_base.sameVertex)(root, target)) return;
    const graph = this.VisitedGraph, incoming = new import_equality.EqualityMap([...graph.Vertices].map((v) => [v, []]));
    for (const edge of graph.Edges) incoming.get(edge.Target).push(edge);
    const distances = new import_equality.EqualityMap([[target, 0]]), successors = new import_equality.EqualityMap(), treeQueue = new import_algorithm_base.AlgorithmHeap((a, b) => this.DistanceRelaxer.Compare(a.priority, b.priority));
    treeQueue.Enqueue({ vertex: target, priority: 0 });
    while (treeQueue.Count) {
      this.ThrowIfCancellationRequested();
      const { vertex, priority } = treeQueue.Dequeue();
      if (distances.get(vertex) !== priority) continue;
      for (const edge of incoming.get(vertex)) {
        const d = this.DistanceRelaxer.Combine(priority, checkedWeight(this.Weights, edge, true));
        if (!distances.has(edge.Source) || this.DistanceRelaxer.Compare(d, distances.get(edge.Source)) < 0) {
          distances.set(edge.Source, d);
          successors.set(edge.Source, edge);
          treeQueue.Enqueue({ vertex: edge.Source, priority: d });
        }
      }
    }
    const append = (path, vertex) => {
      const seen = new import_equality.EqualitySet();
      while (successors.has(vertex)) {
        if (seen.has(vertex)) return false;
        seen.add(vertex);
        const edge = successors.get(vertex);
        path.push(edge);
        vertex = edge.Target;
      }
      return (0, import_algorithm_base.sameVertex)(vertex, target);
    };
    const first = [];
    if (!append(first, root) || !first.length) return;
    this.AddComputedShortestPath(first);
    const queue = new import_algorithm_base.AlgorithmHeap((a, b) => this.DistanceRelaxer.Compare(a.priority, b.priority)), edgeIds = new import_equality.EqualityMap([...graph.Edges].map((e, i) => [e, i])), seenPaths = new import_equality.EqualitySet([first.map((e) => edgeIds.get(e)).join(",")]);
    const deviations = (path, startEdge) => {
      let previousWeight = 0;
      const vertices = new import_equality.EqualitySet([root]);
      for (let i = 0; i < path.length; i++) {
        const edge = path[i];
        if (i >= startEdge) for (const deviation of graph.OutEdges(edge.Source)) {
          if ((0, import_equality.valueEquals)(deviation, edge) || vertices.has(deviation.Target) || !distances.has(deviation.Target)) continue;
          const priority = this.DistanceRelaxer.Combine(previousWeight, this.DistanceRelaxer.Combine(this.Weights(deviation), distances.get(deviation.Target)));
          queue.Enqueue({ parent: path, index: i, edge: deviation, priority });
        }
        previousWeight += this.Weights(edge);
        if (vertices.has(edge.Target)) break;
        vertices.add(edge.Target);
      }
    };
    deviations(first, 0);
    while (queue.Count && this.ComputedShortestPathCount < this.ShortestPathCount) {
      this.ThrowIfCancellationRequested();
      const item = queue.Dequeue(), path = [...item.parent.slice(0, item.index), item.edge], start = path.length;
      if (!append(path, item.edge.Target)) continue;
      const id = path.map((edge) => edgeIds.get(edge)).join(",");
      if (seenPaths.has(id)) continue;
      seenPaths.add(id);
      const vertices = new import_equality.EqualitySet([root]);
      let cyclic = false;
      for (const edge of path) {
        if (vertices.has(edge.Target)) cyclic = true;
        vertices.add(edge.Target);
      }
      if (!cyclic) this.AddComputedShortestPath(path);
      if (start < graph.VertexCount) deviations(path, start);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AStarShortestPathAlgorithm,
  BellmanFordShortestPathAlgorithm,
  DagShortestPathAlgorithm,
  DijkstraShortestPathAlgorithm,
  FloydWarshallAllShortestPathAlgorithm,
  HoffmanPavleyRankedShortestPathAlgorithm,
  RankedShortestPathAlgorithmBase,
  ShortestPathAlgorithmBase,
  SortedPath,
  UndirectedDijkstraShortestPathAlgorithm,
  UndirectedShortestPathAlgorithmBase,
  YenShortestPathsAlgorithm,
  predecessorPath
});
//# sourceMappingURL=shortest-paths.js.map
