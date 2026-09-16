/** Graphviz DOT bridge. Rendering engines are supplied through IDotEngine-compatible adapters. */
import { EventHook } from './core.js';
export declare const GraphvizArrowClipping: Readonly<{
    None: "none";
    Left: "left";
    Right: "right";
}>;
export declare const GraphvizArrowFilling: Readonly<{
    Close: "close";
    Open: "open";
}>;
export declare const GraphvizArrowShape: Readonly<{
    Box: "box";
    Crow: "crow";
    Diamond: "diamond";
    Dot: "dot";
    Inv: "inv";
    None: "none";
    Normal: "normal";
    Tee: "tee";
    Vee: "vee";
    Curve: "curve";
    ICurve: "icurve";
}>;
export declare const GraphvizClusterMode: Readonly<{
    Local: "local";
    Global: "global";
    None: "none";
}>;
export declare const GraphvizEdgeDirection: Readonly<{
    None: "none";
    Forward: "forward";
    Back: "back";
    Both: "both";
}>;
export declare const GraphvizEdgeStyle: Readonly<{
    Unspecified: "unspecified";
    Invis: "invis";
    Dashed: "dashed";
    Dotted: "dotted";
    Bold: "bold";
    Solid: "solid";
}>;
export declare const GraphvizImageType: Readonly<{
    Cmap: "cmap";
    Fig: "fig";
    Gd: "gd";
    Gd2: "gd2";
    Gif: "gif";
    Hpgl: "hpgl";
    Imap: "imap";
    Jpeg: "jpeg";
    Mif: "mif";
    Mp: "mp";
    Pcl: "pcl";
    Pic: "pic";
    PlainText: "plaintext";
    Png: "png";
    Ps: "ps";
    Ps2: "ps2";
    Svg: "svg";
    Svgz: "svgz";
    Vrml: "vrml";
    Vtx: "vtx";
    Wbmp: "wbmp";
}>;
export declare const GraphvizLabelJustification: Readonly<{
    L: "l";
    R: "r";
    C: "c";
}>;
export declare const GraphvizLabelLocation: Readonly<{
    T: "t";
    B: "b";
}>;
export declare const GraphvizOutputMode: Readonly<{
    BreadthFirst: "breadthfirst";
    NodesFirst: "nodesfirst";
    EdgesFirst: "edgesfirst";
}>;
export declare const GraphvizPageDirection: Readonly<{
    BL: "BL";
    BR: "BR";
    TL: "TL";
    TR: "TR";
    RB: "RB";
    RT: "RT";
    LB: "LB";
    LT: "LT";
}>;
export declare const GraphvizRankDirection: Readonly<{
    LR: "LR";
    TB: "TB";
}>;
export declare const GraphvizRatioMode: Readonly<{
    Fill: "fill";
    Compress: "compress";
    Auto: "auto";
}>;
export declare const GraphvizSplineType: Readonly<{
    Spline: "spline";
    None: "none";
    Line: "line";
    Polyline: "polyline";
    Curved: "curved";
    Ortho: "ortho";
}>;
export declare const GraphvizVertexShape: Readonly<{
    Unspecified: "unspecified";
    Box: "box";
    Polygon: "polygon";
    Ellipse: "ellipse";
    Circle: "circle";
    Point: "point";
    Egg: "egg";
    Triangle: "triangle";
    Plaintext: "plaintext";
    Diamond: "diamond";
    Trapezium: "trapezium";
    Parallelogram: "parallelogram";
    House: "house";
    Pentagon: "pentagon";
    Hexagon: "hexagon";
    Septagon: "septagon";
    Octagon: "octagon";
    DoubleCircle: "doublecircle";
    DoubleOctagon: "doubleoctagon";
    TripleOctagon: "tripleoctagon";
    InvTriangle: "invtriangle";
    InvTrapezium: "invtrapezium";
    InvHouse: "invhouse";
    MDiamond: "mdiamond";
    MSquare: "msquare";
    MCircle: "mcircle";
    Rect: "rect";
    Rectangle: "rectangle";
    Record: "record";
}>;
export declare const GraphvizVertexStyle: Readonly<{
    Unspecified: "unspecified";
    Filled: "filled";
    Diagonals: "diagonals";
    Rounded: "rounded";
    Invis: "invis";
    Dashed: "dashed";
    Dotted: "dotted";
    Bold: "bold";
    Solid: "solid";
}>;
export declare const DotEscapers: Readonly<{
    Escape(value: any): string;
    EscapeRecord(value: any): string;
    EscapePort(value: any): string;
}>;
export declare class HtmlString {
    String: any;
    constructor(value: any);
    toString(): any;
}
export declare class GraphvizColor {
    A: number;
    R: number;
    G: number;
    B: number;
    constructor(a?: number, r?: number, g?: number, b?: number);
    Equals(other: any): boolean;
    GetHashCode(): number;
    ToDot(): string;
    toString(): string;
}
export declare namespace GraphvizColor {
    var AliceBlue: GraphvizColor;
    var AntiqueWhite: GraphvizColor;
    var Aqua: GraphvizColor;
    var Aquamarine: GraphvizColor;
    var Azure: GraphvizColor;
    var Beige: GraphvizColor;
    var Bisque: GraphvizColor;
    var Black: GraphvizColor;
    var BlanchedAlmond: GraphvizColor;
    var Blue: GraphvizColor;
    var BlueViolet: GraphvizColor;
    var Brown: GraphvizColor;
    var BurlyWood: GraphvizColor;
    var CadetBlue: GraphvizColor;
    var Chartreuse: GraphvizColor;
    var Chocolate: GraphvizColor;
    var Coral: GraphvizColor;
    var CornflowerBlue: GraphvizColor;
    var Cornsilk: GraphvizColor;
    var Crimson: GraphvizColor;
    var Cyan: GraphvizColor;
    var DarkBlue: GraphvizColor;
    var DarkCyan: GraphvizColor;
    var DarkGoldenrod: GraphvizColor;
    var DarkGray: GraphvizColor;
    var DarkGreen: GraphvizColor;
    var DarkKhaki: GraphvizColor;
    var DarkMagenta: GraphvizColor;
    var DarkOliveGreen: GraphvizColor;
    var DarkOrange: GraphvizColor;
    var DarkOrchid: GraphvizColor;
    var DarkRed: GraphvizColor;
    var DarkSalmon: GraphvizColor;
    var DarkSeaGreen: GraphvizColor;
    var DarkSlateBlue: GraphvizColor;
    var DarkSlateGray: GraphvizColor;
    var DarkTurquoise: GraphvizColor;
    var DarkViolet: GraphvizColor;
    var DeepPink: GraphvizColor;
    var DeepSkyBlue: GraphvizColor;
    var DimGray: GraphvizColor;
    var DodgerBlue: GraphvizColor;
    var Firebrick: GraphvizColor;
    var FloralWhite: GraphvizColor;
    var ForestGreen: GraphvizColor;
    var Fuchsia: GraphvizColor;
    var Gainsboro: GraphvizColor;
    var GhostWhite: GraphvizColor;
    var Gold: GraphvizColor;
    var Goldenrod: GraphvizColor;
    var Gray: GraphvizColor;
    var Green: GraphvizColor;
    var GreenYellow: GraphvizColor;
    var Honeydew: GraphvizColor;
    var HotPink: GraphvizColor;
    var IndianRed: GraphvizColor;
    var Indigo: GraphvizColor;
    var Ivory: GraphvizColor;
    var Khaki: GraphvizColor;
    var Lavender: GraphvizColor;
    var LavenderBlush: GraphvizColor;
    var LawnGreen: GraphvizColor;
    var LemonChiffon: GraphvizColor;
    var LightBlue: GraphvizColor;
    var LightCoral: GraphvizColor;
    var LightCyan: GraphvizColor;
    var LightGoldenrodYellow: GraphvizColor;
    var LightGray: GraphvizColor;
    var LightGreen: GraphvizColor;
    var LightPink: GraphvizColor;
    var LightSalmon: GraphvizColor;
    var LightSeaGreen: GraphvizColor;
    var LightSkyBlue: GraphvizColor;
    var LightSlateGray: GraphvizColor;
    var LightSteelBlue: GraphvizColor;
    var LightYellow: GraphvizColor;
    var Lime: GraphvizColor;
    var LimeGreen: GraphvizColor;
    var Linen: GraphvizColor;
    var Magenta: GraphvizColor;
    var Maroon: GraphvizColor;
    var MediumAquamarine: GraphvizColor;
    var MediumBlue: GraphvizColor;
    var MediumOrchid: GraphvizColor;
    var MediumPurple: GraphvizColor;
    var MediumSeaGreen: GraphvizColor;
    var MediumSlateBlue: GraphvizColor;
    var MediumSpringGreen: GraphvizColor;
    var MediumTurquoise: GraphvizColor;
    var MediumVioletRed: GraphvizColor;
    var MidnightBlue: GraphvizColor;
    var MintCream: GraphvizColor;
    var MistyRose: GraphvizColor;
    var Moccasin: GraphvizColor;
    var NavajoWhite: GraphvizColor;
    var Navy: GraphvizColor;
    var OldLace: GraphvizColor;
    var Olive: GraphvizColor;
    var OliveDrab: GraphvizColor;
    var Orange: GraphvizColor;
    var OrangeRed: GraphvizColor;
    var Orchid: GraphvizColor;
    var PaleGoldenrod: GraphvizColor;
    var PaleGreen: GraphvizColor;
    var PaleTurquoise: GraphvizColor;
    var PaleVioletRed: GraphvizColor;
    var PapayaWhip: GraphvizColor;
    var PeachPuff: GraphvizColor;
    var Peru: GraphvizColor;
    var Pink: GraphvizColor;
    var Plum: GraphvizColor;
    var PowderBlue: GraphvizColor;
    var Purple: GraphvizColor;
    var Red: GraphvizColor;
    var RosyBrown: GraphvizColor;
    var RoyalBlue: GraphvizColor;
    var SaddleBrown: GraphvizColor;
    var Salmon: GraphvizColor;
    var SandyBrown: GraphvizColor;
    var SeaGreen: GraphvizColor;
    var SeaShell: GraphvizColor;
    var Sienna: GraphvizColor;
    var Silver: GraphvizColor;
    var SkyBlue: GraphvizColor;
    var SlateBlue: GraphvizColor;
    var SlateGray: GraphvizColor;
    var Snow: GraphvizColor;
    var SpringGreen: GraphvizColor;
    var SteelBlue: GraphvizColor;
    var Tan: GraphvizColor;
    var Teal: GraphvizColor;
    var Thistle: GraphvizColor;
    var Tomato: GraphvizColor;
    var Transparent: GraphvizColor;
    var Turquoise: GraphvizColor;
    var Violet: GraphvizColor;
    var Wheat: GraphvizColor;
    var White: GraphvizColor;
    var WhiteSmoke: GraphvizColor;
    var Yellow: GraphvizColor;
    var YellowGreen: GraphvizColor;
}
export declare class GraphvizFont {
    Name: any;
    SizeInPoints: any;
    constructor(name: any, sizeInPoints: any);
}
export declare class GraphvizPoint {
    X: any;
    Y: any;
    constructor(x: any, y: any);
}
export declare class GraphvizSizeF {
    Width: number;
    Height: number;
    constructor(width?: number, height?: number);
    get IsEmpty(): boolean;
    ToString(): string;
    toString(): string;
}
export declare class GraphvizSize extends GraphvizSizeF {
}
declare class DotCollection extends Array {
    static get [Symbol.species](): ArrayConstructor;
    constructor(collection?: any[]);
    get Count(): number;
    Add(item: any): void;
    AddRange(items: any): void;
    Clear(): void;
    Contains(item: any): boolean;
    Remove(item: any): boolean;
    Insert(index: any, item: any): void;
    RemoveAt(index: any): void;
}
export declare class GraphvizLayer {
    _name: any;
    constructor(name: any);
    get Name(): any;
    set Name(value: any);
}
export declare class GraphvizLayerCollection extends DotCollection {
    _separators: any;
    constructor(collection?: any[]);
    get Separators(): any;
    set Separators(value: any);
    ToDot(): string;
}
export declare class GraphvizRecordCellCollection extends DotCollection {
}
export declare class GraphvizRecord {
    _cells: any;
    constructor();
    get Cells(): any;
    set Cells(value: any);
    ToDot(): string;
    ToString(): string;
    toString(): string;
}
export declare class GraphvizRecordCell extends GraphvizRecord {
    Text: any;
    Port: any;
    constructor(text?: null, port?: null);
    get HasPort(): boolean;
    get HasText(): boolean;
    ToDot(): string;
}
export declare class GraphvizArrow {
    Shape: any;
    Clipping: "none";
    Filling: "close";
    constructor(shape: any, clipping?: "none", filling?: "close");
    ToDot(): string;
    ToString(): string;
    toString(): string;
}
declare class DotFormat {
    GenerateDot(properties: any): string;
    ToString(): any;
    toString(): any;
}
export declare class GraphvizVertex extends DotFormat {
    Position: any; /** @type {string | null} */
    Comment: any;
    IsHtmlLabel: boolean; /** @type {string | null} */
    Label: any; /** @type {string | null} */
    ToolTip: any; /** @type {string | null} */
    Url: any;
    Distortion: number;
    FillColor: GraphvizColor; /** @type {GraphvizFont | null} */
    Font: any;
    FontColor: GraphvizColor;
    PenWidth: number; /** @type {string | null} */
    Group: any; /** @type {GraphvizLayer | null} */
    Layer: any;
    Orientation: number;
    Peripheries: number;
    Regular: boolean;
    Record: GraphvizRecord;
    Shape: "unspecified";
    Sides: number;
    Size: GraphvizSizeF;
    FixedSize: boolean;
    Skew: number;
    StrokeColor: GraphvizColor;
    Style: "unspecified";
    Z: number;
    constructor();
    InternalToDot(commonFormat?: null): string;
    ToDot(): string;
}
export declare class GraphvizEdgeLabel {
    Angle: number;
    Distance: number;
    Float: boolean; /** @type {GraphvizFont | null} */
    Font: any;
    FontColor: GraphvizColor;
    IsHtmlLabel: boolean; /** @type {string | null} */
    Value: any;
    constructor();
    AddParameters(parameters: any, escape?: boolean): void;
}
export declare class GraphvizEdgeExtremity {
    IsHead: boolean;
    IsClipped: boolean;
    IsHtmlLabel: boolean; /** @type {string | null} */
    Label: any; /** @type {string | null} */
    ToolTip: any; /** @type {string | null} */
    Url: any; /** @type {string | null} */
    Logical: any; /** @type {string | null} */
    Same: any;
    constructor(isHead: any);
    AddParameters(parameters: any, escape?: boolean): void;
}
export declare class GraphvizEdge extends DotFormat {
    Comment: any;
    ToolTip: any; /** @type {string | null} */
    Url: any;
    Direction: "forward"; /** @type {GraphvizFont | null} */
    Font: any;
    FontColor: GraphvizColor;
    PenWidth: number;
    HeadArrow: any; /** @type {string | null} */
    HeadPort: any;
    TailArrow: any; /** @type {string | null} */
    TailPort: any;
    IsConstrained: boolean;
    IsDecorated: boolean; /** @type {GraphvizLayer | null} */
    Layer: any;
    StrokeColor: GraphvizColor;
    Style: "unspecified";
    Weight: number;
    Length: number;
    MinLength: number;
    _label: any;
    _head: any;
    _tail: any;
    constructor();
    get Label(): any;
    set Label(v: any);
    get Head(): any;
    set Head(v: any);
    get Tail(): any;
    set Tail(v: any);
    ToDot(): string;
}
export declare class GraphvizGraph extends DotFormat {
    Comment: any; /** @type {string | null} */
    Url: any;
    BackgroundColor: GraphvizColor;
    ClusterRank: "local"; /** @type {GraphvizFont | null} */
    Font: any;
    FontColor: GraphvizColor;
    PenWidth: number;
    IsCentered: boolean;
    IsCompounded: boolean;
    IsConcentrated: boolean;
    IsLandscape: boolean;
    IsNormalized: boolean;
    IsReMinCross: boolean;
    IsHtmlLabel: boolean; /** @type {string | null} */
    Label: any;
    LabelJustification: "c";
    LabelLocation: "b";
    Layers: GraphvizLayerCollection;
    McLimit: number;
    NodeSeparation: number;
    RankDirection: "TB";
    RankSeparation: number;
    NsLimit: number;
    NsLimit1: number;
    OutputOrder: "breadthfirst";
    PageDirection: "BL";
    PageSize: GraphvizSizeF;
    Quantum: number;
    Ratio: "auto";
    Resolution: number;
    Rotate: number;
    SamplePoints: number;
    SearchSize: number;
    Size: GraphvizSizeF;
    Splines: "spline"; /** @type {string | null} */
    StyleSheet: any;
    _name: any;
    constructor();
    get Name(): any;
    set Name(v: any);
    GenerateDot(p: any): string;
    ToDot(): string;
}
export declare class FormatVertexEventArgs {
    Vertex: any;
    VertexFormat: any;
    constructor(vertex: any, vertexFormat: any);
}
export declare class FormatEdgeEventArgs {
    Edge: any;
    EdgeFormat: any;
    constructor(edge: any, edgeFormat: any);
}
export declare class FormatClusterEventArgs {
    Cluster: any;
    GraphFormat: any;
    constructor(cluster: any, graphFormat: any);
}
export declare class GraphvizAlgorithm {
    ImageType: "png";
    GraphFormat: GraphvizGraph;
    CommonVertexFormat: GraphvizVertex;
    CommonEdgeFormat: GraphvizEdge;
    FormatVertex: EventHook;
    FormatEdge: EventHook;
    FormatCluster: EventHook; /** @type {string | null} */
    Output: string | null;
    ClusterCount: number;
    _graph: any;
    constructor(graph: any, imageType?: "png");
    get VisitedGraph(): any;
    set VisitedGraph(v: any);
    Generate(engine: any, outputFilePath: any): any;
}
export declare function ToGraphviz(graph: any, configure: any): any;
/** Historical upstream endpoint is no longer operational. ToSvg requires an actual rendering engine. */
export declare const DotToSvgApiEndpoint = "https://rise4fun.com/rest/ask/Agl/";
export declare function ToSvg(graphOrDot: any, engine: any, configure: any): any;
export declare const GraphvizExtensions: Readonly<{
    ToGraphviz: typeof ToGraphviz;
    ToSvg: typeof ToSvg;
    DotToSvgApiEndpoint: "https://rise4fun.com/rest/ask/Agl/";
}>;
/** Portable file writer: pass (path, text) => result. A Promise result is supported. */
export declare class FileDotEngine {
    WriteFile: any;
    constructor(writeFile: any);
    Run(imageType: any, dot: any, path: any): any;
}
export declare const SvgHtmlWrapper: Readonly<{
    ParseSize(svg: any): GraphvizSize;
    DumpHtml(size: any, svgPath: any, writeFile: any): any;
    WrapSvg(svg: any, svgPath: string | undefined, writeFile: any): any;
}>;
export declare class GraphRendererBase {
    Graphviz: GraphvizAlgorithm;
    constructor(graph: any);
    get VisitedGraph(): any;
    Initialize(): void;
    Clean(): void;
    Generate(...args: any[]): any;
}
export declare class CondensatedGraphRenderer extends GraphRendererBase {
    _vertexFormatter: ((_: any, args: any) => void) | undefined;
    _edgeFormatter: ((_: any, args: any) => void) | undefined;
    Initialize(): void;
    Clean(): void;
}
export declare class EdgeMergeCondensatedGraphRenderer extends CondensatedGraphRenderer {
    Initialize(): void;
}
export declare const BasicStructuresExtensions: Readonly<{
    ToGraphvizColor: (color: any) => GraphvizColor;
    ToFont: (font: any, fontFactory: any) => any;
    ToGraphvizFont: (font: any) => GraphvizFont | null;
    ToGraphvizPoint: (point: any) => GraphvizPoint;
    ToGraphvizSize: (size: any) => GraphvizSize;
    ToGraphvizSizeF: (size: any) => GraphvizSizeF;
}>;
export {};
