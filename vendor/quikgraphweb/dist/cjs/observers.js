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
var observers_exports = {};
__export(observers_exports, {
  EdgePredecessorRecorderObserver: () => EdgePredecessorRecorderObserver,
  EdgeRecorderObserver: () => EdgeRecorderObserver,
  UndirectedVertexDistanceRecorderObserver: () => UndirectedVertexDistanceRecorderObserver,
  UndirectedVertexPredecessorRecorderObserver: () => UndirectedVertexPredecessorRecorderObserver,
  VertexDistanceRecorderObserver: () => VertexDistanceRecorderObserver,
  VertexPredecessorPathRecorderObserver: () => VertexPredecessorPathRecorderObserver,
  VertexPredecessorRecorderObserver: () => VertexPredecessorRecorderObserver,
  VertexRecorderObserver: () => VertexRecorderObserver,
  VertexTimeStamperObserver: () => VertexTimeStamperObserver
});
module.exports = __toCommonJS(observers_exports);
var import_equality = require("./equality.js");
var import_algorithm_base = require("./algorithm-base.js");
var import_shortest_paths = require("./shortest-paths.js");
function attach(algorithm, handlers) {
  (0, import_algorithm_base.requireValue)(algorithm, "algorithm");
  const subscriptions = [];
  for (const [name, handler] of Object.entries(handlers)) {
    if (!algorithm[name]?.add) {
      for (const [event, fn] of subscriptions) event.remove(fn);
      throw new TypeError(`Algorithm must expose ${name}.`);
    }
    algorithm[name].add(handler);
    subscriptions.push([algorithm[name], handler]);
  }
  let disposed = false;
  const dispose = () => {
    if (!disposed) {
      disposed = true;
      for (const [event, handler] of subscriptions) event.remove(handler);
    }
  };
  const result = { Dispose: dispose, dispose, unsubscribe: dispose };
  if (Symbol.dispose) result[Symbol.dispose] = dispose;
  return result;
}
class VertexPredecessorRecorderObserver {
  constructor(verticesPredecessors = new import_equality.EqualityMap()) {
    this.VerticesPredecessors = (0, import_algorithm_base.requireValue)(verticesPredecessors, "verticesPredecessors");
  }
  Attach(algorithm) {
    return attach(algorithm, { TreeEdge: (edge) => this.VerticesPredecessors.set(edge.Target, edge) });
  }
  TryGetPath(vertex) {
    return (0, import_shortest_paths.predecessorPath)(this.VerticesPredecessors, vertex);
  }
}
class UndirectedVertexPredecessorRecorderObserver extends VertexPredecessorRecorderObserver {
  Attach(algorithm) {
    return attach(algorithm, { TreeEdge: (_sender, args) => this.VerticesPredecessors.set(args.Target, args.Edge) });
  }
  TryGetPath(vertex) {
    return (0, import_shortest_paths.predecessorPath)(this.VerticesPredecessors, vertex, true);
  }
}
class VertexDistanceRecorderObserver {
  constructor(edgeWeights, distanceRelaxer = import_algorithm_base.DistanceRelaxers.EdgeShortestDistance, distances = new import_equality.EqualityMap()) {
    this.EdgeWeights = (0, import_algorithm_base.requireValue)(edgeWeights, "edgeWeights");
    this.DistanceRelaxer = (0, import_algorithm_base.requireValue)(distanceRelaxer, "distanceRelaxer");
    this.Distances = (0, import_algorithm_base.requireValue)(distances, "distances");
  }
  _record(edge, source, target) {
    if (!this.Distances.has(source)) this.Distances.set(source, this.DistanceRelaxer.InitialDistance);
    this.Distances.set(target, this.DistanceRelaxer.Combine(this.Distances.get(source), this.EdgeWeights(edge)));
  }
  Attach(algorithm) {
    return attach(algorithm, { TreeEdge: (edge) => this._record(edge, edge.Source, edge.Target) });
  }
}
class UndirectedVertexDistanceRecorderObserver extends VertexDistanceRecorderObserver {
  Attach(algorithm) {
    return attach(algorithm, { TreeEdge: (_sender, args) => this._record(args.Edge, args.Source, args.Target) });
  }
}
class VertexTimeStamperObserver {
  constructor(discoverTimes, finishTimes) {
    this.DiscoverTimes = arguments.length ? (0, import_algorithm_base.requireValue)(discoverTimes, "discoverTimes") : new import_equality.EqualityMap();
    this.FinishTimes = arguments.length === 1 ? null : arguments.length > 1 ? (0, import_algorithm_base.requireValue)(finishTimes, "finishTimes") : new import_equality.EqualityMap();
    this._currentTime = 0;
  }
  Attach(algorithm) {
    const handlers = { DiscoverVertex: (v) => this.DiscoverTimes.set(v, this._currentTime++) };
    if (this.FinishTimes) handlers.FinishVertex = (v) => this.FinishTimes.set(v, this._currentTime++);
    return attach(algorithm, handlers);
  }
}
class VertexRecorderObserver {
  constructor(vertices = []) {
    this.Vertices = [...(0, import_algorithm_base.requireValue)(vertices, "vertices")];
  }
  Attach(algorithm) {
    return attach(algorithm, { DiscoverVertex: (vertex) => this.Vertices.push(vertex) });
  }
}
class EdgeRecorderObserver {
  constructor(edges = []) {
    this.Edges = [...(0, import_algorithm_base.requireValue)(edges, "edges")];
  }
  Attach(algorithm) {
    return attach(algorithm, { TreeEdge: (edge) => this.Edges.push(edge) });
  }
}
class VertexPredecessorPathRecorderObserver extends VertexPredecessorRecorderObserver {
  constructor(...args) {
    super(...args);
    this.EndPathVertices = [];
  }
  Attach(algorithm) {
    return attach(algorithm, {
      TreeEdge: (edge) => this.VerticesPredecessors.set(edge.Target, edge),
      FinishVertex: (vertex) => {
        for (const edge of this.VerticesPredecessors.values()) if ((0, import_algorithm_base.sameVertex)(edge.Source, vertex)) return;
        this.EndPathVertices.push(vertex);
      }
    });
  }
  *AllPaths() {
    for (const vertex of this.EndPathVertices) {
      const path = this.TryGetPath(vertex);
      if (path) yield path;
    }
  }
}
class EdgePredecessorRecorderObserver {
  constructor(edgesPredecessors = new import_equality.EqualityMap()) {
    this.EdgesPredecessors = (0, import_algorithm_base.requireValue)(edgesPredecessors, "edgesPredecessors");
    this.EndPathEdges = [];
  }
  Attach(algorithm) {
    return attach(algorithm, {
      DiscoverTreeEdge: (edge, targetEdge) => {
        if (!(0, import_equality.valueEquals)(edge, targetEdge)) this.EdgesPredecessors.set(targetEdge, edge);
      },
      FinishEdge: (edge) => {
        for (const predecessor of this.EdgesPredecessors.values()) if ((0, import_equality.valueEquals)(predecessor, edge)) return;
        this.EndPathEdges.push(edge);
      }
    });
  }
  Path(startingEdge) {
    (0, import_algorithm_base.requireValue)(startingEdge, "startingEdge");
    const path = [], seen = new import_equality.EqualitySet();
    let edge = startingEdge;
    while (edge !== void 0) {
      if (seen.has(edge)) throw (0, import_algorithm_base.algorithmError)("InvalidOperationException", "The edge predecessor map contains a cycle.");
      seen.add(edge);
      path.push(edge);
      edge = this.EdgesPredecessors.get(edge);
    }
    return path.reverse();
  }
  *AllPaths() {
    for (const edge of this.EndPathEdges) yield this.Path(edge);
  }
  MergedPath(startingEdge, colors) {
    (0, import_algorithm_base.requireValue)(startingEdge, "startingEdge");
    (0, import_algorithm_base.requireValue)(colors, "colors");
    const path = [];
    let edge = startingEdge;
    while (edge !== void 0) {
      if (!colors.has(edge)) throw (0, import_algorithm_base.algorithmError)("KeyNotFoundException", "No color recorded for edge.");
      if (colors.get(edge) !== import_algorithm_base.GraphColor.White) break;
      colors.set(edge, import_algorithm_base.GraphColor.Black);
      path.push(edge);
      edge = this.EdgesPredecessors.get(edge);
    }
    return path.reverse();
  }
  *AllMergedPaths() {
    const colors = new import_equality.EqualityMap();
    for (const [edge, parent] of this.EdgesPredecessors) {
      colors.set(edge, import_algorithm_base.GraphColor.White);
      colors.set(parent, import_algorithm_base.GraphColor.White);
    }
    for (const edge of this.EndPathEdges) {
      if (!colors.has(edge)) colors.set(edge, import_algorithm_base.GraphColor.White);
      yield this.MergedPath(edge, colors);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EdgePredecessorRecorderObserver,
  EdgeRecorderObserver,
  UndirectedVertexDistanceRecorderObserver,
  UndirectedVertexPredecessorRecorderObserver,
  VertexDistanceRecorderObserver,
  VertexPredecessorPathRecorderObserver,
  VertexPredecessorRecorderObserver,
  VertexRecorderObserver,
  VertexTimeStamperObserver
});
//# sourceMappingURL=observers.js.map
