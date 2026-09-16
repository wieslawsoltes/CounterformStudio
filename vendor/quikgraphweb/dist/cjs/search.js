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
var search_exports = {};
__export(search_exports, {
  BestFirstFrontierSearchAlgorithm: () => BestFirstFrontierSearchAlgorithm,
  BidirectionalDepthFirstSearchAlgorithm: () => BidirectionalDepthFirstSearchAlgorithm,
  BreadthFirstSearchAlgorithm: () => BreadthFirstSearchAlgorithm,
  DepthFirstSearchAlgorithm: () => DepthFirstSearchAlgorithm,
  EdgeDepthFirstSearchAlgorithm: () => EdgeDepthFirstSearchAlgorithm,
  ImplicitDepthFirstSearchAlgorithm: () => ImplicitDepthFirstSearchAlgorithm,
  ImplicitEdgeDepthFirstSearchAlgorithm: () => ImplicitEdgeDepthFirstSearchAlgorithm,
  UndirectedBreadthFirstSearchAlgorithm: () => UndirectedBreadthFirstSearchAlgorithm,
  UndirectedDepthFirstSearchAlgorithm: () => UndirectedDepthFirstSearchAlgorithm
});
module.exports = __toCommonJS(search_exports);
var import_equality = require("./equality.js");
var import_algorithm_base = require("./algorithm-base.js");
var import_core = require("./core.js");
const { White, Gray, Black } = import_algorithm_base.GraphColor;
function parseSearch(args) {
  args = [...args];
  let host = null;
  if (args[0] == null || args[0]?.Services && args[1]?.ContainsVertex) host = args.shift();
  const graph = (0, import_algorithm_base.requireValue)(args.shift(), "visitedGraph");
  if (typeof graph.ContainsVertex !== "function") throw (0, import_algorithm_base.algorithmError)("ArgumentException", "visitedGraph must implement ContainsVertex.");
  return { host, graph, args };
}
function color(map, vertex) {
  if (!map.has(vertex)) throw (0, import_algorithm_base.algorithmError)("VertexNotFoundException", "Vertex color not available.");
  return map.get(vertex);
}
function emitEdge(algorithm, name, edge, vertex) {
  if (algorithm._undirected && !(name === "ExamineEdge" && algorithm instanceof BreadthFirstSearchAlgorithm)) algorithm[name].emit(algorithm, new import_core.UndirectedEdgeEventArgs(edge, (0, import_algorithm_base.sameVertex)(edge.Target, vertex)));
  else algorithm[name].emit(edge);
}
class BreadthFirstSearchAlgorithm extends import_algorithm_base.RootedAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parseSearch(input);
    super(host, graph);
    this.VertexQueue = args[0] ?? null;
    this.VerticesColors = args[1] ?? new import_equality.EqualityMap();
    this.OutEdgesFilter = args[2] ?? ((edges) => edges);
    if (args.length && args[0] == null) throw (0, import_algorithm_base.algorithmError)("ArgumentNullException", "vertexQueue cannot be null.");
    if (args.length > 1 && args[1] == null) throw (0, import_algorithm_base.algorithmError)("ArgumentNullException", "verticesColors cannot be null.");
    if (args.length > 2 && args[2] == null) throw (0, import_algorithm_base.algorithmError)("ArgumentNullException", "outEdgesFilter cannot be null.");
    (0, import_algorithm_base.events)(this, "InitializeVertex StartVertex DiscoverVertex ExamineVertex ExamineEdge TreeEdge NonTreeEdge GrayTarget BlackTarget FinishVertex");
  }
  GetVertexColor(vertex) {
    return color(this.VerticesColors, vertex);
  }
  Initialize() {
    this.ThrowIfCancellationRequested();
    this.VerticesColors.clear();
    for (const v of this.VisitedGraph.Vertices) {
      this.VerticesColors.set(v, White);
      this.InitializeVertex.emit(v);
    }
  }
  _edges(v) {
    return this.OutEdgesFilter(this._undirected ? this.VisitedGraph.AdjacentEdges(v) : this.VisitedGraph.OutEdges(v));
  }
  InternalCompute() {
    if (this._undirected) return this._visit([this.GetAndAssertRootInGraph()]);
    if (this.VisitedGraph.VertexCount === 0) return;
    if (this._hasRoot) {
      this.AssertRootInGraph(this._root);
      return this._visit([this._root]);
    }
    const targets = new import_equality.EqualitySet(Array.from(this.VisitedGraph.Edges, (edge) => edge.Target));
    this._visit(Array.from(this.VisitedGraph.Vertices).filter((v) => !targets.has(v)));
  }
  Visit(root) {
    this.AssertRootInGraph(root);
    this._visit([root]);
  }
  _visit(roots) {
    const queue = this.VertexQueue;
    const items = [];
    let head = 0;
    const push = (v) => queue ? queue.Enqueue(v) : items.push(v);
    const pop = () => queue ? queue.Dequeue() : items[head++];
    const count = () => queue ? queue.Count : items.length - head;
    for (const root of roots) {
      this.StartVertex.emit(root);
      this.VerticesColors.set(root, Gray);
      this.DiscoverVertex.emit(root);
      push(root);
    }
    while (count()) {
      this.ThrowIfCancellationRequested();
      const u = pop();
      this.ExamineVertex.emit(u);
      for (const edge of this._edges(u)) {
        const v = this._undirected && (0, import_algorithm_base.sameVertex)(edge.Target, u) ? edge.Source : edge.Target;
        emitEdge(this, "ExamineEdge", edge, u);
        const c = this.GetVertexColor(v);
        if (c === White) {
          emitEdge(this, "TreeEdge", edge, u);
          this.VerticesColors.set(v, Gray);
          this.DiscoverVertex.emit(v);
          push(v);
        } else {
          emitEdge(this, "NonTreeEdge", edge, u);
          emitEdge(this, c === Gray ? "GrayTarget" : "BlackTarget", edge, u);
        }
      }
      this.VerticesColors.set(u, Black);
      this.FinishVertex.emit(u);
    }
  }
}
class UndirectedBreadthFirstSearchAlgorithm extends BreadthFirstSearchAlgorithm {
  constructor(...args) {
    super(...args);
    this._undirected = true;
  }
}
class DepthFirstSearchAlgorithm extends import_algorithm_base.RootedAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parseSearch(input);
    super(host, graph);
    this.VerticesColors = args[0] instanceof globalThis.Map ? args[0] : new import_equality.EqualityMap();
    this.OutEdgesFilter = args.find((a) => typeof a === "function") ?? ((edges) => edges);
    if (args.length && args[0] == null) throw (0, import_algorithm_base.algorithmError)("ArgumentNullException", "verticesColors cannot be null.");
    if (args.length > 1 && args[1] == null) throw (0, import_algorithm_base.algorithmError)("ArgumentNullException", "outEdgesFilter cannot be null.");
    this.AdjacentEdgesFilter = this.OutEdgesFilter;
    this.ProcessAllComponents = false;
    this._maxDepth = 2147483647;
    (0, import_algorithm_base.events)(this, "InitializeVertex StartVertex DiscoverVertex ExamineEdge TreeEdge BackEdge ForwardOrCrossEdge FinishVertex VertexMaxDepthReached");
  }
  get MaxDepth() {
    return this._maxDepth;
  }
  set MaxDepth(value) {
    if (!Number.isInteger(value) || value < 0) throw (0, import_algorithm_base.algorithmError)("ArgumentOutOfRangeException", "MaxDepth must be a non-negative integer.");
    this._maxDepth = value;
  }
  GetVertexColor(vertex) {
    return this._implicit ? this.VerticesColors.get(vertex) ?? White : color(this.VerticesColors, vertex);
  }
  Initialize() {
    this.VerticesColors.clear();
    if (!this._implicit) for (const v of this.VisitedGraph.Vertices) {
      this.VerticesColors.set(v, White);
      this.InitializeVertex.emit(v);
    }
  }
  *_edges(v) {
    if (this._undirected) yield* this.AdjacentEdgesFilter(this.VisitedGraph.AdjacentEdges(v));
    else {
      yield* this.OutEdgesFilter(this.VisitedGraph.OutEdges(v));
      if (this._bidirectional) yield* this.VisitedGraph.InEdges(v);
    }
  }
  InternalCompute() {
    if (this._implicit && !this._hasRoot) this.GetAndAssertRootInGraph();
    if (this._hasRoot) {
      this.AssertRootInGraph(this._root);
      this.StartVertex.emit(this._root);
      this.Visit(this._root);
      if (!this.ProcessAllComponents) return;
    }
    for (const v of this.VisitedGraph.Vertices ?? []) {
      this.ThrowIfCancellationRequested();
      if (this.GetVertexColor(v) === White) {
        this.StartVertex.emit(v);
        this.Visit(v);
      }
    }
  }
  Visit(root) {
    const visitedEdges = new import_equality.EqualitySet(), stack = [];
    const enter = (v, depth) => {
      if ((this._implicit || this._bidirectional) && depth > this.MaxDepth) return;
      this.VerticesColors.set(v, Gray);
      this.DiscoverVertex.emit(v);
      stack.push({ v, depth, edges: this._edges(v)[Symbol.iterator]() });
    };
    enter(root, 0);
    while (stack.length) {
      this.ThrowIfCancellationRequested();
      const frame = stack[stack.length - 1];
      if (frame.depth > this.MaxDepth) {
        this.VertexMaxDepthReached.emit(frame.v);
        stack.pop();
        this.VerticesColors.set(frame.v, Black);
        this.FinishVertex.emit(frame.v);
        continue;
      }
      const next = frame.edges.next();
      if (next.done) {
        stack.pop();
        this.VerticesColors.set(frame.v, Black);
        this.FinishVertex.emit(frame.v);
        continue;
      }
      const edge = next.value;
      if (this._undirected) {
        if (visitedEdges.has(edge)) continue;
        visitedEdges.add(edge);
      }
      const v = (this._undirected || this._bidirectional) && (0, import_algorithm_base.sameVertex)(edge.Target, frame.v) ? edge.Source : edge.Target;
      emitEdge(this, "ExamineEdge", edge, frame.v);
      const c = this.GetVertexColor(v);
      if (c === White) {
        emitEdge(this, "TreeEdge", edge, frame.v);
        enter(v, frame.depth + 1);
      } else emitEdge(this, c === Gray ? "BackEdge" : "ForwardOrCrossEdge", edge, frame.v);
    }
  }
}
class UndirectedDepthFirstSearchAlgorithm extends DepthFirstSearchAlgorithm {
  constructor(...args) {
    super(...args);
    this._undirected = true;
  }
}
class BidirectionalDepthFirstSearchAlgorithm extends DepthFirstSearchAlgorithm {
  constructor(...args) {
    super(...args);
    this._bidirectional = true;
  }
}
class ImplicitDepthFirstSearchAlgorithm extends DepthFirstSearchAlgorithm {
  constructor(...args) {
    super(...args);
    this._implicit = true;
  }
}
class EdgeDepthFirstSearchAlgorithm extends import_algorithm_base.RootedAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parseSearch(input);
    super(host, graph);
    this.EdgesColors = args.length ? (0, import_algorithm_base.requireValue)(args[0], "edgesColors") : new import_equality.EqualityMap();
    this.ProcessAllComponents = false;
    this._maxDepth = 2147483647;
    (0, import_algorithm_base.events)(this, "InitializeEdge StartVertex StartEdge DiscoverTreeEdge TreeEdge BackEdge ForwardOrCrossEdge FinishEdge");
  }
  get MaxDepth() {
    return this._maxDepth;
  }
  set MaxDepth(value) {
    if (!Number.isInteger(value) || value < 0) throw (0, import_algorithm_base.algorithmError)("ArgumentOutOfRangeException", "MaxDepth must be a non-negative integer.");
    this._maxDepth = value;
  }
  Initialize() {
    this.EdgesColors.clear();
    if (!this._implicit) for (const edge of this.VisitedGraph.Edges) {
      this.EdgesColors.set(edge, White);
      this.InitializeEdge.emit(edge);
    }
  }
  InternalCompute() {
    if (this._implicit && !this._hasRoot) this.GetAndAssertRootInGraph();
    if (this._hasRoot) {
      this.AssertRootInGraph(this._root);
      this.StartVertex.emit(this._root);
      for (const edge of this.VisitedGraph.OutEdges(this._root)) if ((this.EdgesColors.get(edge) ?? White) === White) {
        this.StartEdge.emit(edge);
        this.Visit(edge);
      }
      if (!this.ProcessAllComponents) return;
    }
    for (const edge of this.VisitedGraph.Edges ?? []) if ((this.EdgesColors.get(edge) ?? White) === White) {
      this.StartEdge.emit(edge);
      this.Visit(edge);
    }
  }
  Visit(root) {
    const stack = [];
    const enter = (edge, depth) => {
      if (depth > this.MaxDepth) {
        if (!this._implicit) {
          this.EdgesColors.set(edge, Black);
          this.FinishEdge.emit(edge);
        }
        return;
      }
      this.EdgesColors.set(edge, Gray);
      this.TreeEdge.emit(edge);
      stack.push({ edge, depth, iterator: this.VisitedGraph.OutEdges(edge.Target)[Symbol.iterator]() });
    };
    enter(root, 0);
    while (stack.length) {
      this.ThrowIfCancellationRequested();
      const frame = stack[stack.length - 1], next = frame.depth > this.MaxDepth ? { done: true } : frame.iterator.next();
      if (next.done) {
        stack.pop();
        this.EdgesColors.set(frame.edge, Black);
        this.FinishEdge.emit(frame.edge);
        continue;
      }
      const edge = next.value, c = this.EdgesColors.get(edge) ?? White;
      if (c === White) {
        this.DiscoverTreeEdge.emit(frame.edge, edge);
        enter(edge, frame.depth + 1);
      } else (c === Gray ? this.BackEdge : this.ForwardOrCrossEdge).emit(edge);
    }
  }
}
class ImplicitEdgeDepthFirstSearchAlgorithm extends EdgeDepthFirstSearchAlgorithm {
  constructor(...args) {
    super(...args);
    this._implicit = true;
  }
}
class BestFirstFrontierSearchAlgorithm extends import_algorithm_base.RootedSearchAlgorithmBase {
  constructor(...input) {
    const { host, graph, args } = parseSearch(input);
    super(host, graph);
    this.Weights = (0, import_algorithm_base.requireValue)(args[0], "edgeWeights");
    this.DistanceRelaxer = args.length > 1 ? (0, import_algorithm_base.requireValue)(args[1], "distanceRelaxer") : import_algorithm_base.DistanceRelaxers.ShortestDistance;
    this.OperatorMaxCount = -1;
    (0, import_algorithm_base.events)(this, "TreeEdge");
  }
  InternalCompute() {
    const root = this.GetAndAssertRootInGraph(), target = this.TryGetTargetVertex();
    if (target === void 0) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "Target vertex not set.");
    this.AssertRootInGraph(target);
    if ((0, import_algorithm_base.sameVertex)(root, target)) {
      this.OnTargetReached();
      return;
    }
    const heap = new import_algorithm_base.AlgorithmHeap((a, b) => this.DistanceRelaxer.Compare(a.priority, b.priority)), open = new import_equality.EqualityMap([[root, 0]]), operators = new import_equality.EqualityMap();
    const settled = new import_equality.EqualitySet();
    heap.Enqueue({ vertex: root, priority: 0 });
    for (const edge of this.VisitedGraph.OutEdges(root)) operators.set(edge, White);
    while (heap.Count) {
      this.ThrowIfCancellationRequested();
      const { vertex, priority } = heap.Dequeue();
      if (open.get(vertex) !== priority || settled.has(vertex)) continue;
      open.delete(vertex);
      settled.add(vertex);
      if ((0, import_algorithm_base.sameVertex)(vertex, target)) {
        this.OnTargetReached();
        return;
      }
      for (const edge of this.VisitedGraph.OutEdges(vertex)) {
        if ((0, import_algorithm_base.sameVertex)(edge.Source, edge.Target) || settled.has(edge.Target)) continue;
        if (operators.get(edge) === Gray) {
          operators.delete(edge);
          continue;
        }
        const weight = this.Weights(edge);
        if (weight < 0) throw (0, import_algorithm_base.algorithmError)("NegativeWeightException", "Best-first search requires non-negative weights.");
        const cost = this.DistanceRelaxer.Combine(priority, weight);
        operators.set(edge, Gray);
        if (!open.has(edge.Target) || this.DistanceRelaxer.Compare(cost, open.get(edge.Target)) < 0) {
          open.set(edge.Target, cost);
          heap.Enqueue({ vertex: edge.Target, priority: cost });
          this.TreeEdge.emit(edge);
        }
      }
      this.OperatorMaxCount = Math.max(this.OperatorMaxCount, operators.size);
      for (const edge of this.VisitedGraph.InEdges(vertex)) if (operators.get(edge) === Gray) operators.delete(edge);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BestFirstFrontierSearchAlgorithm,
  BidirectionalDepthFirstSearchAlgorithm,
  BreadthFirstSearchAlgorithm,
  DepthFirstSearchAlgorithm,
  EdgeDepthFirstSearchAlgorithm,
  ImplicitDepthFirstSearchAlgorithm,
  ImplicitEdgeDepthFirstSearchAlgorithm,
  UndirectedBreadthFirstSearchAlgorithm,
  UndirectedDepthFirstSearchAlgorithm
});
//# sourceMappingURL=search.js.map
