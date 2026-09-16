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
var algorithm_base_exports = {};
__export(algorithm_base_exports, {
  AlgorithmBase: () => AlgorithmBase,
  AlgorithmHeap: () => AlgorithmHeap,
  AlgorithmServices: () => AlgorithmServices,
  CancelManager: () => CancelManager,
  ComputationState: () => ComputationState,
  DistanceRelaxers: () => DistanceRelaxers,
  GraphColor: () => import_core3.GraphColor,
  OperationCanceledException: () => OperationCanceledException,
  RootedAlgorithmBase: () => RootedAlgorithmBase,
  RootedSearchAlgorithmBase: () => RootedSearchAlgorithmBase,
  algorithmError: () => algorithmError,
  events: () => events,
  requireValue: () => import_core2.requireValue,
  sameVertex: () => sameVertex
});
module.exports = __toCommonJS(algorithm_base_exports);
var import_equality = require("./equality.js");
var Core = __toESM(require("./core.js"), 1);
var import_core = require("./core.js");
var import_core2 = require("./core.js");
var import_core3 = require("./core.js");
const ComputationState = Object.freeze({ NotRunning: 0, Running: 1, PendingAbortion: 2, Finished: 3, Aborted: 4 });
class OperationCanceledException extends Error {
  constructor(message = "Algorithm aborted.") {
    super(message);
    this.name = "OperationCanceledException";
  }
}
function algorithmError(name, message) {
  if (typeof Core[name] === "function") return new Core[name](message);
  const error = new Error(message);
  error.name = name;
  return error;
}
const sameVertex = import_equality.valueEquals;
function events(owner, names) {
  for (const name of names.split(" ")) if (!owner[name]) owner[name] = new import_core.EventHook();
}
class CancelManager {
  constructor() {
    this.IsCancelling = false;
    this.CancelRequested = new import_core.EventHook();
    this.CancelReset = new import_core.EventHook();
    this.Cancelling = this.CancelRequested;
  }
  Cancel() {
    if (!this.IsCancelling) {
      this.IsCancelling = true;
      this.Cancelling.emit(this, {});
    }
  }
  ResetCancel() {
    const cancelled = this.IsCancelling;
    this.IsCancelling = false;
    if (cancelled) this.CancelReset.emit(this, {});
  }
}
class AlgorithmServices {
  constructor(host) {
    this.Host = (0, import_core.requireValue)(host, "host");
  }
  get CancelManager() {
    return this._cancelManager ??= this.Host.GetService(CancelManager);
  }
}
class AlgorithmBase {
  constructor(host, graph) {
    if (arguments.length === 1) {
      graph = host;
      host = null;
    }
    this.VisitedGraph = (0, import_core.requireValue)(graph, "visitedGraph");
    this.State = ComputationState.NotRunning;
    this.SyncRoot = {};
    this._services = new import_equality.EqualityMap();
    this.Services = new AlgorithmServices(host ?? this);
    events(this, "StateChanged Started Finished Aborted");
  }
  TryGetService(type) {
    (0, import_core.requireValue)(type, "serviceType");
    if (type === CancelManager || type === "ICancelManager" || type === "CancelManager") {
      if (!this._services.has(CancelManager)) this._services.set(CancelManager, new CancelManager());
      return this._services.get(CancelManager);
    }
    return this._services.get(type);
  }
  GetService(type) {
    const service = this.TryGetService(type);
    if (service === void 0) throw algorithmError("InvalidOperationException", "Service not found.");
    return service;
  }
  Compute() {
    if (this.State === ComputationState.Running || this.State === ComputationState.PendingAbortion) throw algorithmError("InvalidOperationException", "Algorithm is already running.");
    this.State = ComputationState.Running;
    this.Services.CancelManager.ResetCancel();
    this.OnStarted({});
    this.OnStateChanged({});
    try {
      this.Initialize();
      this.ThrowIfCancellationRequested();
      this.InternalCompute();
    } catch (error) {
      if (!(error instanceof OperationCanceledException)) throw error;
    } finally {
      try {
        this.Clean();
      } finally {
        this.State = this.State === ComputationState.PendingAbortion ? ComputationState.Aborted : ComputationState.Finished;
        if (this.State === ComputationState.Aborted) this.OnAborted({});
        else this.OnFinished({});
        this.Services.CancelManager.ResetCancel();
        this.OnStateChanged({});
      }
    }
    return this;
  }
  Abort() {
    if (this.State === ComputationState.Running) {
      this.State = ComputationState.PendingAbortion;
      this.Services.CancelManager.Cancel();
      this.OnStateChanged({});
    }
  }
  ThrowIfCancellationRequested() {
    if (this.Services.CancelManager.IsCancelling) throw new OperationCanceledException();
  }
  OnStateChanged(args = {}) {
    this.StateChanged.emit(this, args);
  }
  OnStarted(args = {}) {
    this.Started.emit(this, args);
  }
  OnFinished(args = {}) {
    this.Finished.emit(this, args);
  }
  OnAborted(args = {}) {
    this.Aborted.emit(this, args);
  }
  Initialize() {
  }
  InternalCompute() {
    throw algorithmError("NotImplementedException", "Override InternalCompute().");
  }
  Clean() {
  }
}
class RootedAlgorithmBase extends AlgorithmBase {
  constructor(...args) {
    super(...args);
    this._hasRoot = false;
    events(this, "RootVertexChanged");
  }
  TryGetRootVertex() {
    return this._hasRoot ? this._root : void 0;
  }
  SetRootVertex(root) {
    (0, import_core.requireValue)(root, "root");
    const changed = !this._hasRoot || !sameVertex(root, this._root);
    this._root = root;
    this._hasRoot = true;
    if (changed) this.OnRootVertexChanged({});
  }
  ClearRootVertex() {
    const changed = this._hasRoot;
    this._hasRoot = false;
    this._root = void 0;
    if (changed) this.OnRootVertexChanged({});
  }
  OnRootVertexChanged(args = {}) {
    this.RootVertexChanged.emit(this, args);
  }
  AssertRootInGraph(root) {
    if (!this.VisitedGraph.ContainsVertex(root)) throw algorithmError("VertexNotFoundException", "Root vertex is not part of the graph.");
  }
  GetAndAssertRootInGraph() {
    if (!this._hasRoot) throw algorithmError("InvalidOperationException", "Root vertex not set.");
    this.AssertRootInGraph(this._root);
    return this._root;
  }
  Compute(root) {
    if (arguments.length) {
      this.SetRootVertex(root);
      if (!this.VisitedGraph.ContainsVertex(root)) throw algorithmError("ArgumentException", "Graph does not contain the provided root vertex.");
    }
    return super.Compute();
  }
}
class RootedSearchAlgorithmBase extends RootedAlgorithmBase {
  constructor(...args) {
    super(...args);
    this._hasTarget = false;
    events(this, "TargetVertexChanged TargetReached");
  }
  TryGetTargetVertex() {
    return this._hasTarget ? this._target : void 0;
  }
  SetTargetVertex(target) {
    (0, import_core.requireValue)(target, "target");
    const changed = !this._hasTarget || !sameVertex(target, this._target);
    this._target = target;
    this._hasTarget = true;
    if (changed) this.OnTargetVertexChanged({});
  }
  ClearTargetVertex() {
    const changed = this._hasTarget;
    this._hasTarget = false;
    this._target = void 0;
    if (changed) this.OnTargetVertexChanged({});
  }
  Compute(root, target) {
    if (arguments.length > 1) {
      (0, import_core.requireValue)(root, "root");
      this.SetTargetVertex(target);
      if (!this.VisitedGraph.ContainsVertex(target)) throw algorithmError("ArgumentException", "Graph does not contain the provided target vertex.");
    }
    return arguments.length ? super.Compute(root) : super.Compute();
  }
  OnTargetVertexChanged(args = {}) {
    this.TargetVertexChanged.emit(this, args);
  }
  OnTargetReached() {
    this.TargetReached.emit(this, {});
  }
}
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const DistanceRelaxers = Object.freeze({
  ShortestDistance: Object.freeze({ InitialDistance: Number.MAX_VALUE, Compare: compare, Combine: (d, w) => d + w }),
  CriticalDistance: Object.freeze({ InitialDistance: -Number.MAX_VALUE, Compare: (a, b) => -compare(a, b), Combine: (d, w) => d + w }),
  EdgeShortestDistance: Object.freeze({ InitialDistance: 0, Compare: compare, Combine: (d, w) => d + w }),
  Prim: Object.freeze({ InitialDistance: Number.MAX_VALUE, Compare: compare, Combine: (_d, w) => w })
});
class AlgorithmHeap {
  constructor(compareItems = (a, b) => a.priority - b.priority) {
    this.items = [];
    this.compareItems = compareItems;
    this.sequence = 0;
  }
  get Count() {
    return this.items.length;
  }
  _compare(a, b) {
    return this.compareItems(a.value, b.value) || a.sequence - b.sequence;
  }
  Enqueue(value) {
    const node = { value, sequence: this.sequence++ };
    let i = this.items.length;
    this.items.push(node);
    while (i) {
      const p = i - 1 >> 1;
      if (this._compare(this.items[p], node) <= 0) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = node;
  }
  Dequeue() {
    if (!this.Count) throw algorithmError("InvalidOperationException", "Queue is empty.");
    const result = this.items[0], last = this.items.pop();
    if (this.Count) {
      let i = 0;
      while (i * 2 + 1 < this.Count) {
        let child = i * 2 + 1;
        if (child + 1 < this.Count && this._compare(this.items[child + 1], this.items[child]) < 0) child++;
        if (this._compare(last, this.items[child]) <= 0) break;
        this.items[i] = this.items[child];
        i = child;
      }
      this.items[i] = last;
    }
    return result.value;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AlgorithmBase,
  AlgorithmHeap,
  AlgorithmServices,
  CancelManager,
  ComputationState,
  DistanceRelaxers,
  GraphColor,
  OperationCanceledException,
  RootedAlgorithmBase,
  RootedSearchAlgorithmBase,
  algorithmError,
  events,
  requireValue,
  sameVertex
});
//# sourceMappingURL=algorithm-base.js.map
