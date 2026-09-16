import { EqualityMap as Map } from './equality.js';
/** MSAGL drawing bridge. The drawing data model is portable; layout requires an injected engine. */
import { EventHook } from './core.js';
import { AlgorithmBase } from './algorithm-base.js';
export declare class MsaglNode {
    Id: string;
    LabelText: string;
    Attr: {
        Shape: string;
    };
    UserData: any;
    constructor(id: any);
}
export declare class MsaglEdge {
    Source: any;
    Target: any;
    Attr: {};
    LabelText: string;
    UserData: any;
    constructor(source: any, target: any);
}
export declare class MsaglDrawingGraph {
    Id: string;
    Directed: boolean;
    _nodes: Map;
    _edges: any[];
    Attr: {};
    constructor(id?: string);
    get Nodes(): MapIterator<any>;
    get Edges(): ArrayIterator<any>;
    get NodeCount(): number;
    get EdgeCount(): number;
    AddNode(id: any): any;
    FindNode(id: any): any;
    AddEdge(source: any, target: any): MsaglEdge;
    /** adapter implements Layout(drawingGraph, options), returning geometry or a Promise. */
    Layout(adapter: any, options?: {}): any;
}
export declare class MsaglVertexEventArgs {
    Vertex: any;
    Node: any;
    constructor(vertex: any, node: any);
}
export declare class MsaglEdgeEventArgs {
    Edge: any;
    MsaglEdge: any;
    constructor(edge: any, msaglEdge: any);
}
export declare class MsaglGraphPopulator extends AlgorithmBase {
    GraphFactory: () => MsaglDrawingGraph;
    MsaglGraph: MsaglDrawingGraph | null;
    NodeAdded: EventHook;
    EdgeAdded: EventHook;
    constructor(graph: any, graphFactory?: () => MsaglDrawingGraph);
    OnNodeAdded(args: any): void;
    OnEdgeAdded(args: any): void;
    InternalCompute(): void;
    AddNode(...args: any[]): any;
    AddEdge(...args: any[]): any;
}
export declare class MsaglDefaultGraphPopulator extends MsaglGraphPopulator {
    _verticesIds: Map | null | undefined;
    Initialize(): void;
    Clean(): void;
    GetVertexId(...args: any[]): string;
    GetVertexLabel(id: any, vertex: any): string;
    AddNode(vertex: any): any;
    AddEdge(edge: any): MsaglEdge;
}
export declare class MsaglIdentifiableGraphPopulator extends MsaglGraphPopulator {
    VertexIdentity: any;
    constructor(graph: any, vertexIdentity: any, graphFactory: any);
    AddNode(vertex: any): any;
    AddEdge(edge: any): MsaglEdge;
}
export declare class MsaglToStringGraphPopulator extends MsaglDefaultGraphPopulator {
    Format: string;
    FormatProvider: any;
    constructor(graph: any, format: null | undefined, formatProvider: null | undefined, graphFactory: any);
    FormatValue(vertex: any, specifier: any): any;
    GetVertexId(vertex: any): string;
}
export declare function CreateMsaglPopulator(graph: any, formatOrIdentity: any, formatProvider: any): MsaglDefaultGraphPopulator | MsaglIdentifiableGraphPopulator | MsaglToStringGraphPopulator;
export declare function ToMsaglGraph(graph: any, nodeAdded?: null, edgeAdded?: null, options?: {}): MsaglDrawingGraph | null;
export declare const MsaglGraphExtensions: Readonly<{
    CreateMsaglPopulator: typeof CreateMsaglPopulator;
    ToMsaglGraph: typeof ToMsaglGraph;
}>;
