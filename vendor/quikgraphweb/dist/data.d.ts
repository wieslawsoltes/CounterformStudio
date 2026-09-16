/** DataSet bridge. Input is { Tables, Relations }; table and relation identity is preserved. */
import { BidirectionalGraph } from './core.js';
import { AlgorithmBase } from './algorithm-base.js';
import { GraphvizAlgorithm } from './graphviz.js';
export declare class DataRelationEdge {
    Relation: any;
    constructor(relation: any);
    get Source(): any;
    get Target(): any;
}
export declare class DataSetGraph extends BidirectionalGraph {
    DataSet: any;
    constructor(dataSet: any);
}
export declare class DataSetGraphPopulatorAlgorithm extends AlgorithmBase {
    DataSet: any;
    constructor(visitedGraph: any, dataSet: any);
    InternalCompute(): void;
}
export declare class DataSetGraphvizAlgorithm extends GraphvizAlgorithm {
    constructor(graph: any, imageType: any);
    FormatTable(sender: any, args: any): void;
    FormatRelation(sender: any, args: any): void;
}
export declare function DataSetToGraph(dataSet: any): DataSetGraph;
export declare function DataSetToGraphviz(graph: any): any;
export declare const DataSetGraphExtensions: Readonly<{
    ToGraph: typeof DataSetToGraph;
    ToGraphviz: typeof DataSetToGraphviz;
}>;
