import { EqualityMap as Map } from './equality.js';
import { RootedAlgorithmBase, RootedSearchAlgorithmBase } from './algorithm-base.js';
export declare class BreadthFirstSearchAlgorithm extends RootedAlgorithmBase {
    VertexQueue: any;
    VerticesColors: any;
    OutEdgesFilter: any;
    constructor(...input: any[]);
    GetVertexColor(vertex: any): any;
    Initialize(): void;
    _edges(v: any): any;
    InternalCompute(): void;
    Visit(root: any): void;
    _visit(roots: any): void;
}
export declare class UndirectedBreadthFirstSearchAlgorithm extends BreadthFirstSearchAlgorithm {
    _undirected: boolean;
    constructor(...args: any[]);
}
export declare class DepthFirstSearchAlgorithm extends RootedAlgorithmBase {
    VerticesColors: Map | globalThis.Map<any, any>;
    OutEdgesFilter: any;
    AdjacentEdgesFilter: any;
    ProcessAllComponents: boolean;
    _maxDepth: number;
    constructor(...input: any[]);
    get MaxDepth(): number;
    set MaxDepth(value: number);
    GetVertexColor(vertex: any): any;
    Initialize(): void;
    _edges(v: any): Generator<any, void, any>;
    InternalCompute(): void;
    Visit(root: any): void;
}
export declare class UndirectedDepthFirstSearchAlgorithm extends DepthFirstSearchAlgorithm {
    _undirected: boolean;
    constructor(...args: any[]);
}
export declare class BidirectionalDepthFirstSearchAlgorithm extends DepthFirstSearchAlgorithm {
    _bidirectional: boolean;
    constructor(...args: any[]);
}
export declare class ImplicitDepthFirstSearchAlgorithm extends DepthFirstSearchAlgorithm {
    _implicit: boolean;
    constructor(...args: any[]);
}
export declare class EdgeDepthFirstSearchAlgorithm extends RootedAlgorithmBase {
    EdgesColors: any;
    ProcessAllComponents: boolean;
    _maxDepth: number;
    constructor(...input: any[]);
    get MaxDepth(): number;
    set MaxDepth(value: number);
    Initialize(): void;
    InternalCompute(): void;
    Visit(root: any): void;
}
export declare class ImplicitEdgeDepthFirstSearchAlgorithm extends EdgeDepthFirstSearchAlgorithm {
    _implicit: boolean;
    constructor(...args: any[]);
}
/** Best-first frontier search tracks edge operators and removes expanded nodes. */
export declare class BestFirstFrontierSearchAlgorithm extends RootedSearchAlgorithmBase {
    Weights: any;
    DistanceRelaxer: any;
    OperatorMaxCount: number;
    constructor(...input: any[]);
    InternalCompute(): void;
}
