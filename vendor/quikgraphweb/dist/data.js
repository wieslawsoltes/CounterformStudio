import { BidirectionalGraph } from "./core.js";
import { AlgorithmBase } from "./algorithm-base.js";
import { GraphvizAlgorithm, GraphvizRecordCell, GraphvizVertexShape, GraphvizVertexStyle } from "./graphviz.js";
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
class DataSetGraph extends BidirectionalGraph {
  constructor(dataSet) {
    super();
    this.DataSet = required(dataSet, "dataSet");
  }
}
class DataSetGraphPopulatorAlgorithm extends AlgorithmBase {
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
class DataSetGraphvizAlgorithm extends GraphvizAlgorithm {
  constructor(graph, imageType) {
    super(graph, imageType);
    this.CommonVertexFormat.Style = GraphvizVertexStyle.Solid;
    this.CommonVertexFormat.Shape = GraphvizVertexShape.Record;
    this.FormatVertex.add((sender, args) => this.FormatTable(sender, args));
    this.FormatEdge.add((sender, args) => this.FormatRelation(sender, args));
  }
  FormatTable(sender, args) {
    const table = args.Vertex, format = args.VertexFormat;
    format.Shape = GraphvizVertexShape.Record;
    format.Record.Cells.Add(new GraphvizRecordCell(table.TableName));
    format.Record.Cells.Add(new GraphvizRecordCell(Array.from(table.Columns ?? [], (column) => `+ ${column.ColumnName} : ${column.DataType?.Name ?? column.DataType?.name ?? column.DataType ?? "Object"}${column.Unique ? " unique" : ""}`).join("\n")));
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
export {
  DataRelationEdge,
  DataSetGraph,
  DataSetGraphExtensions,
  DataSetGraphPopulatorAlgorithm,
  DataSetGraphvizAlgorithm,
  DataSetToGraph,
  DataSetToGraphviz
};
//# sourceMappingURL=data.js.map
