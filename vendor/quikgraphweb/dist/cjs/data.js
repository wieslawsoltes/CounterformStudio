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
var data_exports = {};
__export(data_exports, {
  DataRelationEdge: () => DataRelationEdge,
  DataSetGraph: () => DataSetGraph,
  DataSetGraphExtensions: () => DataSetGraphExtensions,
  DataSetGraphPopulatorAlgorithm: () => DataSetGraphPopulatorAlgorithm,
  DataSetGraphvizAlgorithm: () => DataSetGraphvizAlgorithm,
  DataSetToGraph: () => DataSetToGraph,
  DataSetToGraphviz: () => DataSetToGraphviz
});
module.exports = __toCommonJS(data_exports);
var import_core = require("./core.js");
var import_algorithm_base = require("./algorithm-base.js");
var import_graphviz = require("./graphviz.js");
const required = (v, name = "value") => {
  if (v == null) throw new TypeError(`${name} cannot be null`);
  return v;
};
class DataRelationEdge {
  constructor(relation) {
    this.Relation = required(relation, "relation");
  }
  get Source() {
    return this.Relation.ParentTable;
  }
  get Target() {
    return this.Relation.ChildTable;
  }
}
class DataSetGraph extends import_core.BidirectionalGraph {
  constructor(dataSet) {
    super();
    this.DataSet = required(dataSet, "dataSet");
  }
}
class DataSetGraphPopulatorAlgorithm extends import_algorithm_base.AlgorithmBase {
  constructor(visitedGraph, dataSet) {
    super(visitedGraph);
    this.DataSet = required(dataSet, "dataSet");
  }
  InternalCompute() {
    for (const table of this.DataSet.Tables) {
      this.ThrowIfCancellationRequested();
      this.VisitedGraph.AddVertex(table);
    }
    for (const relation of this.DataSet.Relations) {
      this.ThrowIfCancellationRequested();
      this.VisitedGraph.AddEdge(new DataRelationEdge(relation));
    }
  }
}
class DataSetGraphvizAlgorithm extends import_graphviz.GraphvizAlgorithm {
  constructor(graph, imageType) {
    super(graph, imageType);
    this.CommonVertexFormat.Style = import_graphviz.GraphvizVertexStyle.Solid;
    this.CommonVertexFormat.Shape = import_graphviz.GraphvizVertexShape.Record;
    this.FormatVertex.add((sender, args) => this.FormatTable(sender, args));
    this.FormatEdge.add((sender, args) => this.FormatRelation(sender, args));
  }
  FormatTable(sender, args) {
    const table = args.Vertex, format = args.VertexFormat;
    format.Shape = import_graphviz.GraphvizVertexShape.Record;
    format.Record.Cells.Add(new import_graphviz.GraphvizRecordCell(table.TableName));
    format.Record.Cells.Add(new import_graphviz.GraphvizRecordCell(Array.from(table.Columns ?? [], (column) => `+ ${column.ColumnName} : ${column.DataType?.Name ?? column.DataType?.name ?? column.DataType ?? "Object"}${column.Unique ? " unique" : ""}`).join("\n")));
  }
  FormatRelation(sender, args) {
    args.EdgeFormat.Label.Value = args.Edge.Relation.RelationName;
  }
}
function DataSetToGraph(dataSet) {
  const graph = new DataSetGraph(dataSet);
  new DataSetGraphPopulatorAlgorithm(graph, dataSet).Compute();
  return graph;
}
function DataSetToGraphviz(graph) {
  return new DataSetGraphvizAlgorithm(graph).Generate();
}
const DataSetGraphExtensions = Object.freeze({ ToGraph: DataSetToGraph, ToGraphviz: DataSetToGraphviz });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DataRelationEdge,
  DataSetGraph,
  DataSetGraphExtensions,
  DataSetGraphPopulatorAlgorithm,
  DataSetGraphvizAlgorithm,
  DataSetToGraph,
  DataSetToGraphviz
});
//# sourceMappingURL=data.js.map
