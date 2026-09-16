/** GraphML / XML / DGML serialization with no DOM, runtime code generation, or filesystem dependency. */
import { AdjacencyGraph, EventHook } from './core.js';
import { AlgorithmBase } from './algorithm-base.js';
import { QuikGraphNrbfFormatter } from './binary-serialization.js';
export declare function EscapeXml(value: any): any;
export declare class XmlNode {
    Name: any;
    LocalName: any;
    Attributes: {};
    Children: any[];
    Text: string;
    Content: any[];
    NamespaceURI: string;
    constructor(name: any, attributes?: {}, children?: any[], text?: string);
    get Value(): string;
    get textContent(): string;
    GetAttribute(name: any, namespaceUri: any): any;
    getAttribute(name: any): any;
    Select(name: any): any[];
    ReadElementContentAsString(localName?: any, namespaceUri?: string): string;
}
/** Strict nonvalidating XML parser; external entities and DTDs are deliberately unsupported. */
export declare function ParseXml(input: any): any;
export declare class XmlStringWriter {
    _parts: any[];
    _stack: any[];
    _open: boolean;
    constructor();
    _close(): void;
    Write(value: any): void;
    write(value: any): void;
    WriteStartDocument(): void;
    WriteStartElement(name: any, namespaceUri: any): void;
    WriteAttributeString(name: any, ...values: any[]): void;
    WriteString(value: any): void;
    WriteValue(value: any): void;
    WriteEndElement(): void;
    WriteEndDocument(): void;
    Flush(): void;
    ToString(): string;
    toString(): string;
}
export declare class SerializerBase {
    EmitDocumentDeclaration: boolean;
    constructor();
}
/** JS property metadata replaces CLR XmlAttribute/DefaultValue reflection. */
export declare class GraphMLSerializer extends SerializerBase {
    Options: {};
    EmitDocumentDeclaration: any;
    constructor(options?: {});
    Serialize(writerOrGraph: any, graphOrOptions: any, vertexIdentity: any, edgeIdentity: any): any;
}
export declare class GraphMLDeserializer extends SerializerBase {
    Options: {};
    constructor(options?: {});
    Deserialize(reader: any, graph: any, vertexFactory?: (id: any, data: any) => any, edgeFactory?: (s: any, t: any, id: any, data: any) => any): any;
}
export declare function SerializeToGraphML(graph: any, optionsOrWriter: {} | undefined, vertexIdentity: any, edgeIdentity: any): any;
export declare function DeserializeFromGraphML(graphOrReader: any, readerOrOptions: any, vertexFactory: any, edgeFactory: any): any;
/** Structural/lexical validation plus an optional synchronous schema callback.
 * A callback may throw, return false, or return { IsValid: false, Errors } to reject XML.
 * Promise/thenable callbacks are rejected before conversion; use the asynchronous
 * DeserializeAndValidateGraphML API from xml-validation.js for native XSD initialization.
 */
export declare function DeserializeAndValidateFromGraphML(graph: any, reader: any, vertexFactory: any, edgeFactory: any, options?: {}): any;
export declare const GraphMLExtensions: Readonly<{
    SerializeToGraphML: typeof SerializeToGraphML;
    DeserializeFromGraphML: typeof DeserializeFromGraphML;
    DeserializeAndValidateFromGraphML: typeof DeserializeAndValidateFromGraphML;
}>;
export declare const GraphMLResourceResolver: Readonly<{
    GetResource(name: any): Uint8Array<ArrayBuffer>;
}>;
export declare class GraphMLXmlResolver {
    BaseResolver: any;
    static GraphMLNamespace: string;
    constructor(baseResolver?: {
        GetEntity(): never;
    });
    set Credentials(value: any);
    GetEntity(absoluteUri: any, role?: null, ofObjectToReturn?: null): any;
}
export declare class XmlSerializableEdge {
    Source: any;
    Target: any;
    constructor(source?: null, target?: null);
}
export declare class XmlVertexList {
    Graph: any;
    constructor(graph: any);
    Add(vertex: any): any;
    [Symbol.iterator](): any;
    GetEnumerator(): any;
}
export declare class XmlEdgeList {
    Graph: any;
    constructor(graph: any);
    Add(edge: any): any;
    [Symbol.iterator](): any;
    GetEnumerator(): any;
}
export declare class XmlSerializableGraph {
    Graph: any;
    Vertices: XmlVertexList;
    Edges: XmlEdgeList;
    constructor(graph?: AdjacencyGraph);
}
export declare namespace XmlSerializableGraph {
    export { XmlVertexList };
    export { XmlEdgeList };
}
export declare function SerializeToXml(graph: any, writer: undefined, vertexIdentity: any, edgeIdentity: any, graphElementName: string | undefined, vertexElementName: string | undefined, edgeElementName: string | undefined, namespaceUri: string | undefined, writeGraphAttributes: any, writeVertexAttributes: any, writeEdgeAttributes: any): any;
/** Serialize the public XML graph proxy shape without requiring the CLR XmlSerializer runtime. */
export declare function SerializeXmlSerializableGraph(graph: any, writer: any, options?: {}): any;
export declare function DeserializeFromXml(reader: any, graphPredicate: ((n: any) => boolean) | undefined, vertexPredicate: ((n: any) => boolean) | undefined, edgePredicate: ((n: any) => boolean) | undefined, graphFactory: (() => AdjacencyGraph) | undefined, vertexFactory: ((n: any) => any) | undefined, edgeFactory: any): any;
/** MS-NRBF graph serialization, with an optional caller-supplied formatter. */
export declare function SerializeToBinary(graph: any, stream: any, adapter?: QuikGraphNrbfFormatter): Uint8Array<ArrayBuffer>;
export declare function DeserializeFromBinary(stream: any, adapter?: QuikGraphNrbfFormatter): any;
export declare const SerializationExtensions: Readonly<{
    SerializeToXml: typeof SerializeToXml;
    DeserializeFromXml: typeof DeserializeFromXml;
    SerializeToBinary: typeof SerializeToBinary;
    DeserializeFromBinary: typeof DeserializeFromBinary;
}>;
declare const arrayWrite: (writer: any, values: any) => any;
export declare const XmlWriterExtensions: Readonly<{
    [k: string]: typeof arrayWrite;
}>;
export declare const XmlReaderExtensions: Readonly<{
    ReadElementAsNullableString(reader: any, localName: any, namespaceUri: any): any;
    ReadElementContentAsArray(reader: any, localName: any, namespaceUri: any, convert?: StringConstructor): any;
}>;
export declare const HorizontalAlignmentEnum: Readonly<{
    Left: "Left";
    Center: "Center";
    Right: "Right";
}>;
export declare const VerticalAlignmentEnum: Readonly<{
    Top: "Top";
    Center: "Center";
    Bottom: "Bottom";
}>;
export declare const GroupEnum: Readonly<{
    Expanded: "Expanded";
    Collapsed: "Collapsed";
}>;
export declare const ClrBoolean: Readonly<{
    True: "True";
    False: "False";
    true: "true";
    false: "false";
}>;
export declare const VisibilityEnum: Readonly<{
    Visible: "Visible";
    Hidden: "Hidden";
    Collapsed: "Collapsed";
}>;
export declare const FontStyleEnum: Readonly<{
    Normal: "Normal";
    Italic: "Italic";
    Oblique: "Oblique";
}>;
export declare const FontWeightEnum: Readonly<{
    Black: "Black";
    Bold: "Bold";
    DemiBold: "DemiBold";
    ExtraBlack: "ExtraBlack";
    ExtraBold: "ExtraBold";
    ExtraLight: "ExtraLight";
    Heavy: "Heavy";
    Light: "Light";
    Medium: "Medium";
    Normal: "Normal";
    Regular: "Regular";
    Semibold: "Semibold";
    Thin: "Thin";
    UltraBlack: "UltraBlack";
    UltraBold: "UltraBold";
    UltraLight: "UltraLight";
}>;
export declare const FrameKindEnum: Readonly<{
    Conditional: "Conditional";
    Clause: "Clause";
    Loop: "Loop";
    Call: "Call";
}>;
export declare const PropertyType: Readonly<{
    ArrowHeadSize: "ArrowHeadSize";
    ArrowHeadWidth: "ArrowHeadWidth";
    Background: "Background";
    FontFamily: "FontFamily";
    FontSize: "FontSize";
    FontStyle: "FontStyle";
    FontWeight: "FontWeight";
    Foreground: "Foreground";
    HorizontalAlignment: "HorizontalAlignment";
    Icon: "Icon";
    Image: "Image";
    SelectedStroke: "SelectedStroke";
    ShadowDepth: "ShadowDepth";
    Shape: "Shape";
    Stroke: "Stroke";
    StrokeDashArray: "StrokeDashArray";
    StrokeThickness: "StrokeThickness";
    Style: "Style";
}>;
export declare const TargetTypeEnum: Readonly<{
    Node: "Node";
    Link: "Link";
}>;
export declare const GraphDirectionEnum: Readonly<{
    TopToBottom: "TopToBottom";
    BottomToTop: "BottomToTop";
    LeftToRight: "LeftToRight";
    RightToLeft: "RightToLeft";
}>;
export declare const LayoutEnum: Readonly<{
    None: "None";
    Sugiyama: "Sugiyama";
    ForceDirected: "ForceDirected";
    DependencyMatrix: "DependencyMatrix";
}>;
export declare class DirectedGraph {
    Nodes: any; /** @type {DirectedGraphLink[] | null} */
    Links: any; /** @type {DirectedGraphCategory[] | null} */
    Categories: any; /** @type {DirectedGraphProperty[] | null} */
    Properties: any; /** @type {DirectedGraphName[] | null} */
    QualifiedNames: any; /** @type {DirectedGraphAlias[] | null} */
    IdentifierAliases: any; /** @type {DirectedGraphStyle[] | null} */
    Styles: any; /** @type {DirectedGraphPath[] | null} */
    Paths: any; /** @type {string | null} */
    Title: any; /** @type {string | null} */
    Background: any; /** @type {string | null} */
    BackgroundImage: any; /** @type {string} */
    GraphDirection: string; /** @type {boolean} */
    GraphDirectionSpecified: boolean; /** @type {string} */
    Layout: string; /** @type {boolean} */
    LayoutSpecified: boolean; /** @type {string} */
    ButterflyMode: string; /** @type {boolean} */
    ButterflyModeSpecified: boolean; /** @type {string | null} */
    NeighborhoodDistance: any; /** @type {string | null} */
    ZoomLevel: any;
    constructor(values?: {});
    WriteXml(writer: any): any;
}
export declare class DirectedGraphNode {
    Category: any; /** @type {string | null} */
    Id: any; /** @type {string | null} */
    Category1: any; /** @type {string | null} */
    Icon: any; /** @type {string | null} */
    Shape: any; /** @type {string | null} */
    Style: any; /** @type {string} */
    HorizontalAlignment: string; /** @type {boolean} */
    HorizontalAlignmentSpecified: boolean; /** @type {string} */
    VerticalAlignment: string; /** @type {boolean} */
    VerticalAlignmentSpecified: boolean; /** @type {string | null} */
    Description: any; /** @type {string} */
    Group: string; /** @type {boolean} */
    GroupSpecified: boolean; /** @type {string} */
    IsVertical: string; /** @type {boolean} */
    IsVerticalSpecified: boolean; /** @type {string | null} */
    Reference: any; /** @type {string | null} */
    Label: any; /** @type {string} */
    Visibility: string; /** @type {boolean} */
    VisibilitySpecified: boolean; /** @type {string | null} */
    Background: any; /** @type {number} */
    FontSize: number; /** @type {boolean} */
    FontSizeSpecified: boolean; /** @type {string | null} */
    FontFamily: any; /** @type {string} */
    FontStyle: string; /** @type {boolean} */
    FontStyleSpecified: boolean; /** @type {string} */
    FontWeight: string; /** @type {boolean} */
    FontWeightSpecified: boolean; /** @type {string | null} */
    Access: any; /** @type {string | null} */
    Assembly: any; /** @type {string | null} */
    FilePath: any; /** @type {string | null} */
    FunctionTypeFlags: any; /** @type {string} */
    IsAbstract: string; /** @type {boolean} */
    IsAbstractSpecified: boolean; /** @type {string} */
    IsCodeType: string; /** @type {boolean} */
    IsCodeTypeSpecified: boolean; /** @type {string} */
    IsHub: string; /** @type {boolean} */
    IsHubSpecified: boolean; /** @type {string} */
    IsOverloaded: string; /** @type {boolean} */
    IsOverloadedSpecified: boolean; /** @type {string} */
    IsOverridable: string; /** @type {boolean} */
    IsOverridableSpecified: boolean; /** @type {string | null} */
    Language: any; /** @type {string | null} */
    Location: any; /** @type {number} */
    LinesOfCode: number; /** @type {boolean} */
    LinesOfCodeSpecified: boolean; /** @type {string | null} */
    Namespace: any; /** @type {string | null} */
    MustImplement: any; /** @type {string | null} */
    TypeName: any; /** @type {string} */
    IsDocumentation: string; /** @type {boolean} */
    IsDocumentationSpecified: boolean; /** @type {string | null} */
    CodeGenSourceName: any; /** @type {string | null} */
    CodeGenTargetName: any; /** @type {string} */
    CodeGenIncoming: string; /** @type {boolean} */
    CodeGenIncomingSpecified: boolean; /** @type {number} */
    CodeSchemaProperty_CallSequenceNumber: number; /** @type {boolean} */
    CodeSchemaProperty_CallSequenceNumberSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_DisableEnabledErrorHandler: string; /** @type {boolean} */
    CodeSchemaProperty_DisableEnabledErrorHandlerSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_DisableEnabledException: string; /** @type {boolean} */
    CodeSchemaProperty_DisableEnabledExceptionSpecified: boolean; /** @type {number} */
    CodeSchemaProperty_EndColumn: number; /** @type {boolean} */
    CodeSchemaProperty_EndColumnSpecified: boolean; /** @type {number} */
    CodeSchemaProperty_EndLine: number; /** @type {boolean} */
    CodeSchemaProperty_EndLineSpecified: boolean; /** @type {number} */
    CodeSchemaProperty_FrameDepth: number; /** @type {boolean} */
    CodeSchemaProperty_FrameDepthSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_FrameKind: string; /** @type {boolean} */
    CodeSchemaProperty_FrameKindSpecified: boolean; /** @type {string | null} */
    CodeSchemaProperty_Icon: any; /** @type {string | null} */
    CodeSchemaProperty_InstanceTrackingInformation: any; /** @type {string} */
    CodeSchemaProperty_IsAbstract: string; /** @type {boolean} */
    CodeSchemaProperty_IsAbstractSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsAnonymous: string; /** @type {boolean} */
    CodeSchemaProperty_IsAnonymousSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsArray: string; /** @type {boolean} */
    CodeSchemaProperty_IsArraySpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsByReference: string; /** @type {boolean} */
    CodeSchemaProperty_IsByReferenceSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsCallToThis: string; /** @type {boolean} */
    CodeSchemaProperty_IsCallToThisSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsConstructor: string; /** @type {boolean} */
    CodeSchemaProperty_IsConstructorSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsDo: string; /** @type {boolean} */
    CodeSchemaProperty_IsDoSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsFinal: string; /** @type {boolean} */
    CodeSchemaProperty_IsFinalSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsFor: string; /** @type {boolean} */
    CodeSchemaProperty_IsForSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsForEach: string; /** @type {boolean} */
    CodeSchemaProperty_IsForEachSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsGeneric: string; /** @type {boolean} */
    CodeSchemaProperty_IsGenericSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsGenericInstance: string; /** @type {boolean} */
    CodeSchemaProperty_IsGenericInstanceSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsInternal: string; /** @type {boolean} */
    CodeSchemaProperty_IsInternalSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsHideBySignature: string; /** @type {boolean} */
    CodeSchemaProperty_IsHideBySignatureSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsOperator: string; /** @type {boolean} */
    CodeSchemaProperty_IsOperatorSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsOut: string; /** @type {boolean} */
    CodeSchemaProperty_IsOutSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsParameterArray: string; /** @type {boolean} */
    CodeSchemaProperty_IsParameterArraySpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsPrivate: string; /** @type {boolean} */
    CodeSchemaProperty_IsPrivateSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsProtected: string; /** @type {boolean} */
    CodeSchemaProperty_IsProtectedSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsProtectedOrInternal: string; /** @type {boolean} */
    CodeSchemaProperty_IsProtectedOrInternalSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsPropertyGet: string; /** @type {boolean} */
    CodeSchemaProperty_IsPropertyGetSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsPropertySet: string; /** @type {boolean} */
    CodeSchemaProperty_IsPropertySetSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsPrototype: string; /** @type {boolean} */
    CodeSchemaProperty_IsPrototypeSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsPublic: string; /** @type {boolean} */
    CodeSchemaProperty_IsPublicSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsSpecialName: string; /** @type {boolean} */
    CodeSchemaProperty_IsSpecialNameSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsStatic: string; /** @type {boolean} */
    CodeSchemaProperty_IsStaticSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsUntilLoop: string; /** @type {boolean} */
    CodeSchemaProperty_IsUntilLoopSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsVirtual: string; /** @type {boolean} */
    CodeSchemaProperty_IsVirtualSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_IsWhile: string; /** @type {boolean} */
    CodeSchemaProperty_IsWhileSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_PreserveData: string; /** @type {boolean} */
    CodeSchemaProperty_PreserveDataSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_SingleInstanceSourceLink: string; /** @type {boolean} */
    CodeSchemaProperty_SingleInstanceSourceLinkSpecified: boolean; /** @type {string} */
    CodeSchemaProperty_SingleInstanceTargetLink: string; /** @type {boolean} */
    CodeSchemaProperty_SingleInstanceTargetLinkSpecified: boolean; /** @type {string | null} */
    CodeSchemaProperty_SourceText: any; /** @type {number} */
    CodeSchemaProperty_StartColumn: number; /** @type {boolean} */
    CodeSchemaProperty_StartColumnSpecified: boolean; /** @type {number} */
    CodeSchemaProperty_StartLine: number; /** @type {boolean} */
    CodeSchemaProperty_StartLineSpecified: boolean; /** @type {string | null} */
    CodeSchemaProperty_StatementKind: any; /** @type {number} */
    CodeSchemaProperty_StatementNumber: number; /** @type {boolean} */
    CodeSchemaProperty_StatementNumberSpecified: boolean; /** @type {string | null} */
    CodeSchemaProperty_StatementType: any;
    constructor(values?: {});
}
export declare class DirectedGraphNodeCategory {
    Ref: any;
    constructor(values?: {});
}
export declare class DirectedGraphLink {
    Category: any; /** @type {string | null} */
    Label: any; /** @type {string} */
    Visibility: string; /** @type {boolean} */
    VisibilitySpecified: boolean; /** @type {string | null} */
    Background: any; /** @type {number} */
    FontSize: number; /** @type {boolean} */
    FontSizeSpecified: boolean; /** @type {string | null} */
    FontFamily: any; /** @type {string} */
    FontStyle: string; /** @type {boolean} */
    FontStyleSpecified: boolean; /** @type {string} */
    FontWeight: string; /** @type {boolean} */
    FontWeightSpecified: boolean; /** @type {string | null} */
    Source: any; /** @type {string | null} */
    Target: any; /** @type {string | null} */
    Category1: any; /** @type {string | null} */
    Stroke: any; /** @type {string | null} */
    StrokeDashArray: any; /** @type {string} */
    Seeder: string; /** @type {boolean} */
    SeederSpecified: boolean; /** @type {string} */
    AttractConsumers: string; /** @type {boolean} */
    AttractConsumersSpecified: boolean;
    constructor(values?: {});
}
export declare class DirectedGraphLinkCategory {
    Ref: any;
    constructor(values?: {});
}
export declare class DirectedGraphCategory {
    Id: any; /** @type {string | null} */
    BasedOn: any; /** @type {string | null} */
    Label: any; /** @type {string} */
    Visibility: string; /** @type {boolean} */
    VisibilitySpecified: boolean; /** @type {string | null} */
    Background: any; /** @type {number} */
    FontSize: number; /** @type {boolean} */
    FontSizeSpecified: boolean; /** @type {string | null} */
    FontFamily: any; /** @type {string} */
    FontStyle: string; /** @type {boolean} */
    FontStyleSpecified: boolean; /** @type {string} */
    FontWeight: string; /** @type {boolean} */
    FontWeightSpecified: boolean; /** @type {string | null} */
    Icon: any; /** @type {string | null} */
    Shape: any; /** @type {string | null} */
    Style: any; /** @type {string} */
    HorizontalAlignment: string; /** @type {boolean} */
    HorizontalAlignmentSpecified: boolean; /** @type {string} */
    VerticalAlignment: string; /** @type {boolean} */
    VerticalAlignmentSpecified: boolean; /** @type {string | null} */
    Stroke: any; /** @type {string | null} */
    StrokeDashArray: any; /** @type {string | null} */
    CanLinkedNodesBeDataDriven: any; /** @type {string | null} */
    CanBeDataDriven: any; /** @type {string | null} */
    DefaultAction: any; /** @type {string | null} */
    IncomingActionLabel: any; /** @type {string} */
    IsProviderRoot: string; /** @type {boolean} */
    IsProviderRootSpecified: boolean; /** @type {string} */
    IsContainment: string; /** @type {boolean} */
    IsContainmentSpecified: boolean; /** @type {string} */
    IsTag: string; /** @type {boolean} */
    IsTagSpecified: boolean; /** @type {string | null} */
    NavigationActionLabel: any; /** @type {string | null} */
    OutgoingActionLabel: any; /** @type {string | null} */
    SourceCategory: any; /** @type {string | null} */
    TargetCategory: any; /** @type {string | null} */
    Details: any; /** @type {string | null} */
    InboundName: any; /** @type {string | null} */
    OutboundName: any;
    constructor(values?: {});
}
export declare class DirectedGraphProperty {
    Id: any; /** @type {string} */
    IsReference: string; /** @type {boolean} */
    IsReferenceSpecified: boolean; /** @type {string | null} */
    Label: any; /** @type {string | null} */
    DataType: any; /** @type {string | null} */
    Description: any; /** @type {string | null} */
    Group: any; /** @type {string | null} */
    ReferenceTemplate: any;
    constructor(values?: {});
}
export declare class DirectedGraphName {
    Id: any; /** @type {string | null} */
    Label: any; /** @type {string | null} */
    ValueType: any; /** @type {string | null} */
    Formatter: any;
    constructor(values?: {});
}
export declare class DirectedGraphAlias {
    n: number; /** @type {string | null} */
    Uri: any; /** @type {string | null} */
    Id: any;
    constructor(values?: {});
}
export declare class DirectedGraphStyle {
    Condition: any; /** @type {DirectedGraphStyleSetter[] | null} */
    Setter: any; /** @type {string} */
    TargetType: string; /** @type {string} */
    IsEnabled: string; /** @type {boolean} */
    IsEnabledSpecified: boolean; /** @type {string | null} */
    GroupLabel: any; /** @type {string | null} */
    ValueLabel: any; /** @type {string | null} */
    ToolTip: any;
    constructor(values?: {});
}
export declare class DirectedGraphStyleCondition {
    Expression: any;
    constructor(values?: {});
}
export declare class DirectedGraphStyleSetter {
    Property: string; /** @type {string | null} */
    Value: any; /** @type {string | null} */
    Expression: any;
    constructor(values?: {});
}
export declare class DirectedGraphPath {
    Id: any; /** @type {string | null} */
    Value: any;
    constructor(values?: {});
}
export declare function WriteDirectedGraphXml(graph: any, writer: any): any;
export declare function ReadDirectedGraphXml(reader: any): any;
export declare class DirectedGraphMLAlgorithm extends AlgorithmBase {
    VertexIdentity: any;
    EdgeIdentity: any;
    FormatNode: EventHook;
    FormatEdge: EventHook;
    FormatGraph: EventHook;
    DirectedGraph: DirectedGraph | null;
    constructor(graph: any, vertexIdentity: any, edgeIdentity: any);
    InternalCompute(): void;
}
export declare function ToDirectedGraphML(graph: any, vertexIdentityOrOptions: any, edgeIdentity: any, formatNode: any, formatEdge: any): DirectedGraph | null;
export declare function OpenAsDGML(graph: any, openDocument: any, options?: {}): any;
export declare const DirectedGraphMLExtensions: Readonly<{
    ToDirectedGraphML: typeof ToDirectedGraphML;
    WriteXml: typeof WriteDirectedGraphXml;
    OpenAsDGML: typeof OpenAsDGML;
    DirectedGraphSerializer: Readonly<{
        Serialize: typeof WriteDirectedGraphXml;
        Deserialize: typeof ReadDirectedGraphXml;
    }>;
}>;
export {};
