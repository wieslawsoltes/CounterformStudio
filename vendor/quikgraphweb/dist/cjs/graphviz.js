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
var graphviz_exports = {};
__export(graphviz_exports, {
  BasicStructuresExtensions: () => BasicStructuresExtensions,
  CondensatedGraphRenderer: () => CondensatedGraphRenderer,
  DotEscapers: () => DotEscapers,
  DotToSvgApiEndpoint: () => DotToSvgApiEndpoint,
  EdgeMergeCondensatedGraphRenderer: () => EdgeMergeCondensatedGraphRenderer,
  FileDotEngine: () => FileDotEngine,
  FormatClusterEventArgs: () => FormatClusterEventArgs,
  FormatEdgeEventArgs: () => FormatEdgeEventArgs,
  FormatVertexEventArgs: () => FormatVertexEventArgs,
  GraphRendererBase: () => GraphRendererBase,
  GraphvizAlgorithm: () => GraphvizAlgorithm,
  GraphvizArrow: () => GraphvizArrow,
  GraphvizArrowClipping: () => GraphvizArrowClipping,
  GraphvizArrowFilling: () => GraphvizArrowFilling,
  GraphvizArrowShape: () => GraphvizArrowShape,
  GraphvizClusterMode: () => GraphvizClusterMode,
  GraphvizColor: () => GraphvizColor,
  GraphvizEdge: () => GraphvizEdge,
  GraphvizEdgeDirection: () => GraphvizEdgeDirection,
  GraphvizEdgeExtremity: () => GraphvizEdgeExtremity,
  GraphvizEdgeLabel: () => GraphvizEdgeLabel,
  GraphvizEdgeStyle: () => GraphvizEdgeStyle,
  GraphvizExtensions: () => GraphvizExtensions,
  GraphvizFont: () => GraphvizFont,
  GraphvizGraph: () => GraphvizGraph,
  GraphvizImageType: () => GraphvizImageType,
  GraphvizLabelJustification: () => GraphvizLabelJustification,
  GraphvizLabelLocation: () => GraphvizLabelLocation,
  GraphvizLayer: () => GraphvizLayer,
  GraphvizLayerCollection: () => GraphvizLayerCollection,
  GraphvizOutputMode: () => GraphvizOutputMode,
  GraphvizPageDirection: () => GraphvizPageDirection,
  GraphvizPoint: () => GraphvizPoint,
  GraphvizRankDirection: () => GraphvizRankDirection,
  GraphvizRatioMode: () => GraphvizRatioMode,
  GraphvizRecord: () => GraphvizRecord,
  GraphvizRecordCell: () => GraphvizRecordCell,
  GraphvizRecordCellCollection: () => GraphvizRecordCellCollection,
  GraphvizSize: () => GraphvizSize,
  GraphvizSizeF: () => GraphvizSizeF,
  GraphvizSplineType: () => GraphvizSplineType,
  GraphvizVertex: () => GraphvizVertex,
  GraphvizVertexShape: () => GraphvizVertexShape,
  GraphvizVertexStyle: () => GraphvizVertexStyle,
  HtmlString: () => HtmlString,
  SvgHtmlWrapper: () => SvgHtmlWrapper,
  ToGraphviz: () => ToGraphviz,
  ToSvg: () => ToSvg
});
module.exports = __toCommonJS(graphviz_exports);
var import_equality = require("./equality.js");
var import_core = require("./core.js");
const required = (value, name = "value") => {
  if (value == null) throw new TypeError(`${name} cannot be null`);
  return value;
};
const nonempty = (value, name = "value") => {
  required(value, name);
  if (String(value).length === 0) throw new TypeError(`${name} cannot be empty`);
  return value;
};
const equal = (a, b) => a?.Equals ? a.Equals(b) : a === b;
const GraphvizArrowClipping = Object.freeze({ "None": "none", "Left": "left", "Right": "right" });
const GraphvizArrowFilling = Object.freeze({ "Close": "close", "Open": "open" });
const GraphvizArrowShape = Object.freeze({ "Box": "box", "Crow": "crow", "Diamond": "diamond", "Dot": "dot", "Inv": "inv", "None": "none", "Normal": "normal", "Tee": "tee", "Vee": "vee", "Curve": "curve", "ICurve": "icurve" });
const GraphvizClusterMode = Object.freeze({ "Local": "local", "Global": "global", "None": "none" });
const GraphvizEdgeDirection = Object.freeze({ "None": "none", "Forward": "forward", "Back": "back", "Both": "both" });
const GraphvizEdgeStyle = Object.freeze({ "Unspecified": "unspecified", "Invis": "invis", "Dashed": "dashed", "Dotted": "dotted", "Bold": "bold", "Solid": "solid" });
const GraphvizImageType = Object.freeze({ "Cmap": "cmap", "Fig": "fig", "Gd": "gd", "Gd2": "gd2", "Gif": "gif", "Hpgl": "hpgl", "Imap": "imap", "Jpeg": "jpeg", "Mif": "mif", "Mp": "mp", "Pcl": "pcl", "Pic": "pic", "PlainText": "plaintext", "Png": "png", "Ps": "ps", "Ps2": "ps2", "Svg": "svg", "Svgz": "svgz", "Vrml": "vrml", "Vtx": "vtx", "Wbmp": "wbmp" });
const GraphvizLabelJustification = Object.freeze({ "L": "l", "R": "r", "C": "c" });
const GraphvizLabelLocation = Object.freeze({ "T": "t", "B": "b" });
const GraphvizOutputMode = Object.freeze({ "BreadthFirst": "breadthfirst", "NodesFirst": "nodesfirst", "EdgesFirst": "edgesfirst" });
const GraphvizPageDirection = Object.freeze({ "BL": "BL", "BR": "BR", "TL": "TL", "TR": "TR", "RB": "RB", "RT": "RT", "LB": "LB", "LT": "LT" });
const GraphvizRankDirection = Object.freeze({ "LR": "LR", "TB": "TB" });
const GraphvizRatioMode = Object.freeze({ "Fill": "fill", "Compress": "compress", "Auto": "auto" });
const GraphvizSplineType = Object.freeze({ "Spline": "spline", "None": "none", "Line": "line", "Polyline": "polyline", "Curved": "curved", "Ortho": "ortho" });
const GraphvizVertexShape = Object.freeze({ "Unspecified": "unspecified", "Box": "box", "Polygon": "polygon", "Ellipse": "ellipse", "Circle": "circle", "Point": "point", "Egg": "egg", "Triangle": "triangle", "Plaintext": "plaintext", "Diamond": "diamond", "Trapezium": "trapezium", "Parallelogram": "parallelogram", "House": "house", "Pentagon": "pentagon", "Hexagon": "hexagon", "Septagon": "septagon", "Octagon": "octagon", "DoubleCircle": "doublecircle", "DoubleOctagon": "doubleoctagon", "TripleOctagon": "tripleoctagon", "InvTriangle": "invtriangle", "InvTrapezium": "invtrapezium", "InvHouse": "invhouse", "MDiamond": "mdiamond", "MSquare": "msquare", "MCircle": "mcircle", "Rect": "rect", "Rectangle": "rectangle", "Record": "record" });
const GraphvizVertexStyle = Object.freeze({ "Unspecified": "unspecified", "Filled": "filled", "Diagonals": "diagonals", "Rounded": "rounded", "Invis": "invis", "Dashed": "dashed", "Dotted": "dotted", "Bold": "bold", "Solid": "solid" });
const DotEscapers = Object.freeze({
  Escape(value) {
    return String(required(value)).replace(/\r\n|\r|\n|["\\]/g, (s) => /[\r\n]/.test(s) ? "\\n" : "\\" + s);
  },
  EscapeRecord(value) {
    return String(required(value)).replace(/\r\n|\r|\n|[|<>" \\{}]/g, (s) => /[\r\n]/.test(s) ? "\\n" : "\\" + s);
  },
  EscapePort(value) {
    return String(required(value)).replace(/\r\n|\r|\n|[|<>" \\{}]/g, "_");
  }
});
class HtmlString {
  constructor(value) {
    this.String = required(value);
  }
  toString() {
    return this.String;
  }
}
class RawDot {
  constructor(value) {
    this.value = value;
  }
}
const raw = (value) => new RawDot(value);
const quote = (value) => `"${DotEscapers.Escape(value)}"`;
const dotValue = (value) => value instanceof RawDot ? String(value.value) : value instanceof HtmlString ? `<${value.String}>` : value instanceof GraphvizRecord ? `"${value.ToDot()}"` : value instanceof GraphvizColor ? quote(value.ToDot()) : typeof value === "string" ? quote(value) : String(value).toLowerCase();
const put = (map, key, value) => map instanceof globalThis.Map ? map.set(key, value) : required(map)[key] = value;
const dotParameters = (map, separator = ", ") => [...map instanceof globalThis.Map ? map : Object.entries(map)].map(([key, value]) => `${key}=${dotValue(value)}`).join(separator);
class GraphvizColor {
  constructor(a = 0, r = 0, g = 0, b = 0) {
    for (const c of [a, r, g, b]) if (!Number.isInteger(c) || c < 0 || c > 255) throw new RangeError("Color channels must be bytes");
    this.A = a;
    this.R = r;
    this.G = g;
    this.B = b;
    Object.freeze(this);
  }
  Equals(other) {
    return other instanceof GraphvizColor && this.A === other.A && this.R === other.R && this.G === other.G && this.B === other.B;
  }
  GetHashCode() {
    return this.A << 24 | this.R << 16 | this.G << 8 | this.B;
  }
  ToDot() {
    return "#" + [this.R, this.G, this.B, this.A].map((c) => c.toString(16).padStart(2, "0").toUpperCase()).join("");
  }
  toString() {
    return this.ToDot();
  }
}
GraphvizColor.AliceBlue = new GraphvizColor(255, 240, 248, 255);
GraphvizColor.AntiqueWhite = new GraphvizColor(255, 250, 235, 215);
GraphvizColor.Aqua = new GraphvizColor(255, 0, 255, 255);
GraphvizColor.Aquamarine = new GraphvizColor(255, 127, 255, 212);
GraphvizColor.Azure = new GraphvizColor(255, 240, 255, 255);
GraphvizColor.Beige = new GraphvizColor(255, 245, 245, 220);
GraphvizColor.Bisque = new GraphvizColor(255, 255, 228, 196);
GraphvizColor.Black = new GraphvizColor(255, 0, 0, 0);
GraphvizColor.BlanchedAlmond = new GraphvizColor(255, 255, 235, 205);
GraphvizColor.Blue = new GraphvizColor(255, 0, 0, 255);
GraphvizColor.BlueViolet = new GraphvizColor(255, 138, 43, 226);
GraphvizColor.Brown = new GraphvizColor(255, 165, 42, 42);
GraphvizColor.BurlyWood = new GraphvizColor(255, 222, 184, 135);
GraphvizColor.CadetBlue = new GraphvizColor(255, 95, 158, 160);
GraphvizColor.Chartreuse = new GraphvizColor(255, 127, 255, 0);
GraphvizColor.Chocolate = new GraphvizColor(255, 210, 105, 30);
GraphvizColor.Coral = new GraphvizColor(255, 255, 127, 80);
GraphvizColor.CornflowerBlue = new GraphvizColor(255, 100, 149, 237);
GraphvizColor.Cornsilk = new GraphvizColor(255, 255, 248, 220);
GraphvizColor.Crimson = new GraphvizColor(255, 220, 20, 60);
GraphvizColor.Cyan = new GraphvizColor(255, 0, 255, 255);
GraphvizColor.DarkBlue = new GraphvizColor(255, 0, 0, 139);
GraphvizColor.DarkCyan = new GraphvizColor(255, 0, 139, 139);
GraphvizColor.DarkGoldenrod = new GraphvizColor(255, 184, 134, 11);
GraphvizColor.DarkGray = new GraphvizColor(255, 169, 169, 169);
GraphvizColor.DarkGreen = new GraphvizColor(255, 0, 100, 0);
GraphvizColor.DarkKhaki = new GraphvizColor(255, 189, 183, 107);
GraphvizColor.DarkMagenta = new GraphvizColor(255, 139, 0, 139);
GraphvizColor.DarkOliveGreen = new GraphvizColor(255, 85, 107, 47);
GraphvizColor.DarkOrange = new GraphvizColor(255, 255, 140, 0);
GraphvizColor.DarkOrchid = new GraphvizColor(255, 153, 50, 204);
GraphvizColor.DarkRed = new GraphvizColor(255, 139, 0, 0);
GraphvizColor.DarkSalmon = new GraphvizColor(255, 233, 150, 122);
GraphvizColor.DarkSeaGreen = new GraphvizColor(255, 143, 188, 139);
GraphvizColor.DarkSlateBlue = new GraphvizColor(255, 72, 61, 139);
GraphvizColor.DarkSlateGray = new GraphvizColor(255, 47, 79, 79);
GraphvizColor.DarkTurquoise = new GraphvizColor(255, 0, 206, 209);
GraphvizColor.DarkViolet = new GraphvizColor(255, 148, 0, 211);
GraphvizColor.DeepPink = new GraphvizColor(255, 255, 20, 147);
GraphvizColor.DeepSkyBlue = new GraphvizColor(255, 0, 191, 255);
GraphvizColor.DimGray = new GraphvizColor(255, 105, 105, 105);
GraphvizColor.DodgerBlue = new GraphvizColor(255, 30, 144, 255);
GraphvizColor.Firebrick = new GraphvizColor(255, 178, 34, 34);
GraphvizColor.FloralWhite = new GraphvizColor(255, 255, 250, 240);
GraphvizColor.ForestGreen = new GraphvizColor(255, 34, 139, 34);
GraphvizColor.Fuchsia = new GraphvizColor(255, 255, 0, 255);
GraphvizColor.Gainsboro = new GraphvizColor(255, 220, 220, 220);
GraphvizColor.GhostWhite = new GraphvizColor(255, 248, 248, 255);
GraphvizColor.Gold = new GraphvizColor(255, 255, 215, 0);
GraphvizColor.Goldenrod = new GraphvizColor(255, 218, 165, 32);
GraphvizColor.Gray = new GraphvizColor(255, 128, 128, 128);
GraphvizColor.Green = new GraphvizColor(255, 0, 128, 0);
GraphvizColor.GreenYellow = new GraphvizColor(255, 173, 255, 47);
GraphvizColor.Honeydew = new GraphvizColor(255, 240, 255, 240);
GraphvizColor.HotPink = new GraphvizColor(255, 255, 105, 180);
GraphvizColor.IndianRed = new GraphvizColor(255, 205, 92, 92);
GraphvizColor.Indigo = new GraphvizColor(255, 75, 0, 130);
GraphvizColor.Ivory = new GraphvizColor(255, 255, 255, 240);
GraphvizColor.Khaki = new GraphvizColor(255, 240, 230, 140);
GraphvizColor.Lavender = new GraphvizColor(255, 230, 230, 250);
GraphvizColor.LavenderBlush = new GraphvizColor(255, 255, 240, 245);
GraphvizColor.LawnGreen = new GraphvizColor(255, 124, 252, 0);
GraphvizColor.LemonChiffon = new GraphvizColor(255, 255, 250, 205);
GraphvizColor.LightBlue = new GraphvizColor(255, 173, 216, 230);
GraphvizColor.LightCoral = new GraphvizColor(255, 240, 128, 128);
GraphvizColor.LightCyan = new GraphvizColor(255, 224, 255, 255);
GraphvizColor.LightGoldenrodYellow = new GraphvizColor(255, 250, 250, 210);
GraphvizColor.LightGray = new GraphvizColor(255, 211, 211, 211);
GraphvizColor.LightGreen = new GraphvizColor(255, 144, 238, 144);
GraphvizColor.LightPink = new GraphvizColor(255, 255, 182, 193);
GraphvizColor.LightSalmon = new GraphvizColor(255, 255, 160, 122);
GraphvizColor.LightSeaGreen = new GraphvizColor(255, 32, 178, 170);
GraphvizColor.LightSkyBlue = new GraphvizColor(255, 135, 206, 250);
GraphvizColor.LightSlateGray = new GraphvizColor(255, 119, 136, 153);
GraphvizColor.LightSteelBlue = new GraphvizColor(255, 176, 196, 222);
GraphvizColor.LightYellow = new GraphvizColor(255, 255, 255, 224);
GraphvizColor.Lime = new GraphvizColor(255, 0, 255, 0);
GraphvizColor.LimeGreen = new GraphvizColor(255, 50, 205, 50);
GraphvizColor.Linen = new GraphvizColor(255, 250, 240, 230);
GraphvizColor.Magenta = new GraphvizColor(255, 255, 0, 255);
GraphvizColor.Maroon = new GraphvizColor(255, 128, 0, 0);
GraphvizColor.MediumAquamarine = new GraphvizColor(255, 102, 205, 170);
GraphvizColor.MediumBlue = new GraphvizColor(255, 0, 0, 205);
GraphvizColor.MediumOrchid = new GraphvizColor(255, 186, 85, 211);
GraphvizColor.MediumPurple = new GraphvizColor(255, 147, 112, 219);
GraphvizColor.MediumSeaGreen = new GraphvizColor(255, 60, 179, 113);
GraphvizColor.MediumSlateBlue = new GraphvizColor(255, 123, 104, 238);
GraphvizColor.MediumSpringGreen = new GraphvizColor(255, 0, 250, 154);
GraphvizColor.MediumTurquoise = new GraphvizColor(255, 72, 209, 204);
GraphvizColor.MediumVioletRed = new GraphvizColor(255, 199, 21, 133);
GraphvizColor.MidnightBlue = new GraphvizColor(255, 25, 25, 112);
GraphvizColor.MintCream = new GraphvizColor(255, 245, 255, 250);
GraphvizColor.MistyRose = new GraphvizColor(255, 255, 228, 225);
GraphvizColor.Moccasin = new GraphvizColor(255, 255, 228, 225);
GraphvizColor.NavajoWhite = new GraphvizColor(255, 255, 222, 173);
GraphvizColor.Navy = new GraphvizColor(255, 0, 0, 128);
GraphvizColor.OldLace = new GraphvizColor(255, 253, 245, 230);
GraphvizColor.Olive = new GraphvizColor(255, 128, 128, 0);
GraphvizColor.OliveDrab = new GraphvizColor(255, 107, 142, 35);
GraphvizColor.Orange = new GraphvizColor(255, 255, 165, 0);
GraphvizColor.OrangeRed = new GraphvizColor(255, 255, 69, 0);
GraphvizColor.Orchid = new GraphvizColor(255, 218, 112, 214);
GraphvizColor.PaleGoldenrod = new GraphvizColor(255, 238, 232, 170);
GraphvizColor.PaleGreen = new GraphvizColor(255, 152, 251, 152);
GraphvizColor.PaleTurquoise = new GraphvizColor(255, 175, 238, 238);
GraphvizColor.PaleVioletRed = new GraphvizColor(255, 219, 112, 147);
GraphvizColor.PapayaWhip = new GraphvizColor(255, 255, 239, 213);
GraphvizColor.PeachPuff = new GraphvizColor(255, 255, 218, 185);
GraphvizColor.Peru = new GraphvizColor(255, 205, 133, 63);
GraphvizColor.Pink = new GraphvizColor(255, 255, 192, 203);
GraphvizColor.Plum = new GraphvizColor(255, 221, 160, 221);
GraphvizColor.PowderBlue = new GraphvizColor(255, 176, 224, 230);
GraphvizColor.Purple = new GraphvizColor(255, 128, 0, 128);
GraphvizColor.Red = new GraphvizColor(255, 255, 0, 0);
GraphvizColor.RosyBrown = new GraphvizColor(255, 188, 143, 143);
GraphvizColor.RoyalBlue = new GraphvizColor(255, 65, 105, 225);
GraphvizColor.SaddleBrown = new GraphvizColor(255, 139, 69, 19);
GraphvizColor.Salmon = new GraphvizColor(255, 250, 128, 114);
GraphvizColor.SandyBrown = new GraphvizColor(255, 244, 164, 96);
GraphvizColor.SeaGreen = new GraphvizColor(255, 46, 139, 87);
GraphvizColor.SeaShell = new GraphvizColor(255, 255, 245, 238);
GraphvizColor.Sienna = new GraphvizColor(255, 160, 82, 45);
GraphvizColor.Silver = new GraphvizColor(255, 192, 192, 192);
GraphvizColor.SkyBlue = new GraphvizColor(255, 135, 206, 235);
GraphvizColor.SlateBlue = new GraphvizColor(255, 106, 90, 205);
GraphvizColor.SlateGray = new GraphvizColor(255, 112, 128, 144);
GraphvizColor.Snow = new GraphvizColor(255, 255, 250, 250);
GraphvizColor.SpringGreen = new GraphvizColor(255, 0, 255, 127);
GraphvizColor.SteelBlue = new GraphvizColor(255, 70, 130, 180);
GraphvizColor.Tan = new GraphvizColor(255, 210, 180, 140);
GraphvizColor.Teal = new GraphvizColor(255, 0, 128, 128);
GraphvizColor.Thistle = new GraphvizColor(255, 216, 191, 216);
GraphvizColor.Tomato = new GraphvizColor(255, 255, 99, 71);
GraphvizColor.Transparent = new GraphvizColor(0, 255, 255, 255);
GraphvizColor.Turquoise = new GraphvizColor(255, 64, 224, 208);
GraphvizColor.Violet = new GraphvizColor(255, 238, 130, 238);
GraphvizColor.Wheat = new GraphvizColor(255, 245, 222, 179);
GraphvizColor.White = new GraphvizColor(255, 255, 255, 255);
GraphvizColor.WhiteSmoke = new GraphvizColor(255, 245, 245, 245);
GraphvizColor.Yellow = new GraphvizColor(255, 255, 255, 0);
GraphvizColor.YellowGreen = new GraphvizColor(255, 154, 205, 50);
class GraphvizFont {
  constructor(name, sizeInPoints) {
    this.Name = nonempty(name, "name");
    if (!(sizeInPoints > 0)) throw new RangeError("Size must be positive");
    this.SizeInPoints = sizeInPoints;
  }
}
class GraphvizPoint {
  constructor(x, y) {
    this.X = x;
    this.Y = y;
  }
}
class GraphvizSizeF {
  constructor(width = 0, height = 0) {
    if (!(width >= 0 && height >= 0)) throw new RangeError("Width and height must be nonnegative");
    this.Width = width;
    this.Height = height;
  }
  get IsEmpty() {
    return this.Width === 0 || this.Height === 0;
  }
  ToString() {
    return `${this.Width}x${this.Height}`;
  }
  toString() {
    return this.ToString();
  }
}
class GraphvizSize extends GraphvizSizeF {
}
class DotCollection extends Array {
  static get [Symbol.species]() {
    return Array;
  }
  constructor(collection = []) {
    super();
    this.push(...required(collection));
  }
  get Count() {
    return this.length;
  }
  Add(item) {
    this.push(required(item));
  }
  AddRange(items) {
    for (const item of items) this.Add(item);
  }
  Clear() {
    this.length = 0;
  }
  Contains(item) {
    return this.includes(item);
  }
  Remove(item) {
    const i = this.indexOf(item);
    if (i < 0) return false;
    this.splice(i, 1);
    return true;
  }
  Insert(index, item) {
    this.splice(index, 0, required(item));
  }
  RemoveAt(index) {
    if (index < 0 || index >= this.length) throw new RangeError("Index out of range");
    this.splice(index, 1);
  }
}
class GraphvizLayer {
  constructor(name) {
    this.Name = name;
  }
  get Name() {
    return this._name;
  }
  set Name(value) {
    this._name = nonempty(value, "Name");
  }
}
class GraphvizLayerCollection extends DotCollection {
  constructor(collection = []) {
    super(collection);
    this.Separators = ":";
  }
  get Separators() {
    return this._separators;
  }
  set Separators(value) {
    this._separators = nonempty(value, "Separators");
  }
  ToDot() {
    return this.length ? `layers=${quote(this.map((v) => v.Name).join(this.Separators))}; layersep=${quote(this.Separators)}` : "";
  }
}
class GraphvizRecordCellCollection extends DotCollection {
}
class GraphvizRecord {
  constructor() {
    this.Cells = new GraphvizRecordCellCollection();
  }
  get Cells() {
    return this._cells;
  }
  set Cells(value) {
    this._cells = required(value, "Cells");
  }
  ToDot() {
    return Array.from(this.Cells, (c) => c.ToDot()).join(" | ");
  }
  ToString() {
    return this.ToDot();
  }
  toString() {
    return this.ToDot();
  }
}
class GraphvizRecordCell extends GraphvizRecord {
  constructor(text = null, port = null) {
    super();
    this.Text = text;
    this.Port = port;
  }
  get HasPort() {
    return this.Port != null && String(this.Port).length > 0;
  }
  get HasText() {
    return this.Text != null && String(this.Text).length > 0;
  }
  ToDot() {
    let s = (this.HasPort ? `<${DotEscapers.EscapePort(this.Port)}> ` : "") + (this.HasText ? DotEscapers.EscapeRecord(this.Text) : "");
    if (this.Cells.length) s += (s ? " | " : "") + `{ ${super.ToDot()} }`;
    return s;
  }
}
class GraphvizArrow {
  constructor(shape, clipping = GraphvizArrowClipping.None, filling = GraphvizArrowFilling.Close) {
    this.Shape = shape;
    this.Clipping = clipping;
    this.Filling = filling;
  }
  ToDot() {
    const shape = String(this.Shape).toLowerCase();
    return (this.Filling === GraphvizArrowFilling.Open && ["box", "diamond", "dot", "inv", "normal"].includes(shape) ? "o" : "") + (["box", "crow", "diamond", "inv", "normal", "tee", "vee", "curve", "icurve"].includes(shape) ? this.Clipping === GraphvizArrowClipping.Left ? "l" : this.Clipping === GraphvizArrowClipping.Right ? "r" : "" : "") + shape;
  }
  ToString() {
    return this.ToDot();
  }
  toString() {
    return this.ToDot();
  }
}
class DotFormat {
  GenerateDot(properties) {
    return dotParameters(required(properties));
  }
  ToString() {
    return this.ToDot();
  }
  toString() {
    return this.ToDot();
  }
}
class GraphvizVertex extends DotFormat {
  constructor() {
    super();
    this.Position = null;
    this.Comment = null;
    this.IsHtmlLabel = false;
    this.Label = null;
    this.ToolTip = null;
    this.Url = null;
    this.Distortion = 0;
    this.FillColor = GraphvizColor.White;
    this.Font = null;
    this.FontColor = GraphvizColor.Black;
    this.PenWidth = 1;
    this.Group = null;
    this.Layer = null;
    this.Orientation = 0;
    this.Peripheries = -1;
    this.Regular = false;
    this.Record = new GraphvizRecord();
    this.Shape = GraphvizVertexShape.Unspecified;
    this.Sides = 4;
    this.Size = new GraphvizSizeF();
    this.FixedSize = false;
    this.Skew = 0;
    this.StrokeColor = GraphvizColor.Black;
    this.Style = GraphvizVertexStyle.Unspecified;
    this.Z = -1;
  }
  InternalToDot(commonFormat = null) {
    const p = new import_equality.EqualityMap();
    if (this.Font) {
      p.set("fontname", this.Font.Name);
      p.set("fontsize", this.Font.SizeInPoints);
    }
    if (!equal(this.FontColor, GraphvizColor.Black)) p.set("fontcolor", this.FontColor);
    if (this.PenWidth !== 1) p.set("penwidth", this.PenWidth);
    for (const [prop, key] of [["ToolTip", "tooltip"], ["Comment", "comment"], ["Url", "URL"]]) if (this[prop] != null) p.set(key, this[prop]);
    if (this.Shape !== GraphvizVertexShape.Unspecified) p.set("shape", raw(this.Shape));
    const shape = this.Shape === GraphvizVertexShape.Unspecified && commonFormat ? commonFormat.Shape : this.Shape;
    if (shape === GraphvizVertexShape.Record) {
      if (this.Label) p.set("label", raw(`"${this.Label}"`));
      else if (this.Record?.Cells.length) p.set("label", this.Record);
    } else if (this.Label) p.set("label", this.IsHtmlLabel ? new HtmlString(this.Label) : this.Label);
    if (shape === GraphvizVertexShape.Polygon) {
      for (const [prop, key] of [["Sides", "sides"], ["Skew", "skew"], ["Distortion", "distortion"]]) if (this[prop] !== 0) p.set(key, this[prop]);
    }
    if (this.FixedSize) {
      p.set("fixedsize", true);
      if (this.Size.Height > 0) p.set("height", this.Size.Height);
      if (this.Size.Width > 0) p.set("width", this.Size.Width);
    }
    if (this.Style !== GraphvizVertexStyle.Unspecified) p.set("style", raw(this.Style));
    if (!equal(this.StrokeColor, GraphvizColor.Black)) p.set("color", this.StrokeColor);
    if (!equal(this.FillColor, GraphvizColor.White)) p.set("fillcolor", this.FillColor);
    if (this.Orientation > 0) p.set("orientation", this.Orientation);
    if (this.Regular) p.set("regular", true);
    if (this.Group != null) p.set("group", this.Group);
    if (this.Layer) p.set("layer", this.Layer.Name);
    if (this.Peripheries >= 0) p.set("peripheries", this.Peripheries);
    if (this.Z > 0) p.set("z", this.Z);
    if (this.Position) p.set("pos", `${this.Position.X},${this.Position.Y}!`);
    return this.GenerateDot(p);
  }
  ToDot() {
    return this.InternalToDot();
  }
}
class GraphvizEdgeLabel {
  constructor() {
    this.Angle = -25;
    this.Distance = 1;
    this.Float = true;
    this.Font = null;
    this.FontColor = GraphvizColor.Black;
    this.IsHtmlLabel = false;
    this.Value = null;
  }
  AddParameters(parameters, escape = true) {
    required(parameters);
    if (this.Value == null) return;
    put(parameters, "label", this.IsHtmlLabel ? new HtmlString(this.Value) : escape ? DotEscapers.Escape(this.Value) : this.Value);
    if (this.Angle !== -25) put(parameters, "labelangle", this.Angle);
    if (this.Distance !== 1) put(parameters, "labeldistance", this.Distance);
    if (!this.Float) put(parameters, "labelfloat", false);
    if (this.Font) {
      put(parameters, "labelfontname", this.Font.Name);
      put(parameters, "labelfontsize", this.Font.SizeInPoints);
    }
    if (!equal(this.FontColor, GraphvizColor.Black)) put(parameters, "labelfontcolor", this.FontColor);
  }
}
class GraphvizEdgeExtremity {
  constructor(isHead) {
    this.IsHead = !!isHead;
    this.IsClipped = true;
    this.IsHtmlLabel = false;
    this.Label = null;
    this.ToolTip = null;
    this.Url = null;
    this.Logical = null;
    this.Same = null;
  }
  AddParameters(parameters, escape = true) {
    required(parameters);
    const e = this.IsHead ? "head" : "tail";
    if (this.Url != null) put(parameters, e + "URL", this.Url);
    if (!this.IsClipped) put(parameters, e + "clip", false);
    if (this.Label != null) put(parameters, e + "label", this.IsHtmlLabel ? new HtmlString(this.Label) : escape ? DotEscapers.Escape(this.Label) : this.Label);
    if (this.ToolTip != null) put(parameters, e + "tooltip", escape ? DotEscapers.Escape(this.ToolTip) : this.ToolTip);
    if (this.Logical != null) put(parameters, "l" + e, this.Logical);
    if (this.Same != null) put(parameters, "same" + e, this.Same);
  }
}
class GraphvizEdge extends DotFormat {
  constructor() {
    super();
    this.Comment = null;
    this.Label = new GraphvizEdgeLabel();
    this.ToolTip = null;
    this.Url = null;
    this.Direction = GraphvizEdgeDirection.Forward;
    this.Font = null;
    this.FontColor = GraphvizColor.Black;
    this.PenWidth = 1;
    this.Head = new GraphvizEdgeExtremity(true);
    this.HeadArrow = null;
    this.HeadPort = null;
    this.Tail = new GraphvizEdgeExtremity(false);
    this.TailArrow = null;
    this.TailPort = null;
    this.IsConstrained = true;
    this.IsDecorated = false;
    this.Layer = null;
    this.StrokeColor = GraphvizColor.Black;
    this.Style = GraphvizEdgeStyle.Unspecified;
    this.Weight = 1;
    this.Length = 1;
    this.MinLength = 1;
  }
  get Label() {
    return this._label;
  }
  set Label(v) {
    this._label = required(v, "Label");
  }
  get Head() {
    return this._head;
  }
  set Head(v) {
    if (!required(v, "Head").IsHead) throw new TypeError("Head must be a head extremity");
    this._head = v;
  }
  get Tail() {
    return this._tail;
  }
  set Tail(v) {
    if (required(v, "Tail").IsHead) throw new TypeError("Tail must be a tail extremity");
    this._tail = v;
  }
  ToDot() {
    const p = new import_equality.EqualityMap();
    if (this.Direction !== GraphvizEdgeDirection.Forward) p.set("dir", raw(this.Direction));
    if (this.Font) {
      p.set("fontname", this.Font.Name);
      p.set("fontsize", this.Font.SizeInPoints);
    }
    if (!equal(this.FontColor, GraphvizColor.Black)) p.set("fontcolor", this.FontColor);
    if (this.PenWidth !== 1) p.set("penwidth", this.PenWidth);
    this.Head.AddParameters(p, false);
    if (this.HeadArrow) p.set("arrowhead", this.HeadArrow.ToDot());
    if (this.HeadPort != null) p.set("headport", DotEscapers.EscapePort(this.HeadPort));
    if (!this.IsConstrained) p.set("constraint", false);
    if (this.IsDecorated) p.set("decorate", true);
    this.Label.AddParameters(p, false);
    if (this.Layer) p.set("layer", this.Layer.Name);
    if (this.MinLength !== 1) p.set("minlen", this.MinLength);
    if (this.Length !== 1) p.set("len", this.Length);
    if (!equal(this.StrokeColor, GraphvizColor.Black)) p.set("color", this.StrokeColor);
    if (this.Style !== GraphvizEdgeStyle.Unspecified) p.set("style", raw(this.Style));
    this.Tail.AddParameters(p, false);
    if (this.TailArrow) p.set("arrowtail", this.TailArrow.ToDot());
    if (this.TailPort != null) p.set("tailport", DotEscapers.EscapePort(this.TailPort));
    for (const [prop, key] of [["ToolTip", "tooltip"], ["Comment", "comment"], ["Url", "URL"]]) if (this[prop] != null) p.set(key, this[prop]);
    if (this.Weight !== 1) p.set("weight", this.Weight);
    return this.GenerateDot(p);
  }
}
class GraphvizGraph extends DotFormat {
  constructor() {
    super();
    this.Name = "G";
    this.Comment = null;
    this.Url = null;
    this.BackgroundColor = GraphvizColor.White;
    this.ClusterRank = GraphvizClusterMode.Local;
    this.Font = null;
    this.FontColor = GraphvizColor.Black;
    this.PenWidth = 1;
    this.IsCentered = false;
    this.IsCompounded = false;
    this.IsConcentrated = false;
    this.IsLandscape = false;
    this.IsNormalized = false;
    this.IsReMinCross = false;
    this.IsHtmlLabel = false;
    this.Label = null;
    this.LabelJustification = GraphvizLabelJustification.C;
    this.LabelLocation = GraphvizLabelLocation.B;
    this.Layers = new GraphvizLayerCollection();
    this.McLimit = 1;
    this.NodeSeparation = 0.25;
    this.RankDirection = GraphvizRankDirection.TB;
    this.RankSeparation = 0.5;
    this.NsLimit = -1;
    this.NsLimit1 = -1;
    this.OutputOrder = GraphvizOutputMode.BreadthFirst;
    this.PageDirection = GraphvizPageDirection.BL;
    this.PageSize = new GraphvizSizeF();
    this.Quantum = 0;
    this.Ratio = GraphvizRatioMode.Auto;
    this.Resolution = 0.96;
    this.Rotate = 0;
    this.SamplePoints = 8;
    this.SearchSize = 30;
    this.Size = new GraphvizSizeF();
    this.Splines = GraphvizSplineType.Spline;
    this.StyleSheet = null;
  }
  get Name() {
    return this._name;
  }
  set Name(v) {
    this._name = required(v, "Name");
  }
  GenerateDot(p) {
    const parts = [...p instanceof globalThis.Map ? p : Object.entries(p)].map(([key, value]) => value instanceof GraphvizLayerCollection ? value.ToDot() : `${key}=${dotValue(value)}`);
    return parts.join("; ") + (parts.length > 1 ? ";" : "");
  }
  ToDot() {
    const p = new import_equality.EqualityMap();
    if (this.Url != null) p.set("URL", this.Url);
    if (!equal(this.BackgroundColor, GraphvizColor.White)) p.set("bgcolor", this.BackgroundColor);
    if (this.IsCentered) p.set("center", true);
    if (this.ClusterRank !== GraphvizClusterMode.Local) p.set("clusterrank", this.ClusterRank);
    if (this.Comment != null) p.set("comment", this.Comment);
    if (this.IsCompounded) p.set("compound", true);
    if (this.IsConcentrated) p.set("concentrate", true);
    if (this.Font) {
      p.set("fontname", this.Font.Name);
      p.set("fontsize", this.Font.SizeInPoints);
    }
    if (!equal(this.FontColor, GraphvizColor.Black)) p.set("fontcolor", this.FontColor);
    if (this.PenWidth !== 1) p.set("penwidth", this.PenWidth);
    if (this.Label != null) p.set("label", this.IsHtmlLabel ? new HtmlString(this.Label) : this.Label);
    if (this.LabelJustification !== GraphvizLabelJustification.C) p.set("labeljust", this.LabelJustification);
    if (this.LabelLocation !== GraphvizLabelLocation.B) p.set("labelloc", this.LabelLocation);
    if (this.Layers.length) p.set("layers", this.Layers);
    for (const [prop, key, def] of [["McLimit", "mclimit", 1], ["NodeSeparation", "nodesep", 0.25]]) if (this[prop] !== def) p.set(key, this[prop]);
    if (this.RankDirection !== GraphvizRankDirection.TB) p.set("rankdir", raw(this.RankDirection));
    if (this.RankSeparation !== 0.5) p.set("ranksep", this.RankSeparation);
    if (this.IsNormalized) p.set("normalize", true);
    if (this.NsLimit > 0) p.set("nslimit", this.NsLimit);
    if (this.NsLimit1 > 0) p.set("nslimit1", this.NsLimit1);
    if (this.OutputOrder !== GraphvizOutputMode.BreadthFirst) p.set("outputorder", this.OutputOrder);
    if (!this.PageSize.IsEmpty) p.set("page", `${this.PageSize.Width},${this.PageSize.Height}`);
    if (this.PageDirection !== GraphvizPageDirection.BL) p.set("pagedir", raw(this.PageDirection));
    if (this.Quantum > 0) p.set("quantum", this.Quantum);
    if (this.Ratio !== GraphvizRatioMode.Auto) p.set("ratio", this.Ratio);
    if (this.IsReMinCross) p.set("remincross", true);
    if (this.Resolution !== 0.96) p.set("resolution", this.Resolution);
    if (this.Rotate) p.set("rotate", this.Rotate);
    else if (this.IsLandscape) p.set("orientation", "[1L]*");
    if (this.SamplePoints !== 8) p.set("samplepoints", this.SamplePoints);
    if (this.SearchSize !== 30) p.set("searchsize", this.SearchSize);
    if (!this.Size.IsEmpty) p.set("size", `${this.Size.Width},${this.Size.Height}`);
    if (this.Splines !== GraphvizSplineType.Spline) p.set("splines", raw(this.Splines));
    if (this.StyleSheet != null) p.set("stylesheet", this.StyleSheet);
    return this.GenerateDot(p);
  }
}
class FormatVertexEventArgs {
  constructor(vertex, vertexFormat) {
    this.Vertex = required(vertex, "vertex");
    this.VertexFormat = required(vertexFormat, "vertexFormat");
  }
}
class FormatEdgeEventArgs {
  constructor(edge, edgeFormat) {
    this.Edge = required(edge, "edge");
    this.EdgeFormat = required(edgeFormat, "edgeFormat");
  }
}
class FormatClusterEventArgs {
  constructor(cluster, graphFormat) {
    this.Cluster = required(cluster, "cluster");
    this.GraphFormat = required(graphFormat, "graphFormat");
  }
}
class GraphvizAlgorithm {
  constructor(graph, imageType = GraphvizImageType.Png) {
    this.VisitedGraph = graph;
    this.ImageType = imageType;
    this.GraphFormat = new GraphvizGraph();
    this.CommonVertexFormat = new GraphvizVertex();
    this.CommonEdgeFormat = new GraphvizEdge();
    this.FormatVertex = new import_core.EventHook();
    this.FormatEdge = new import_core.EventHook();
    this.FormatCluster = new import_core.EventHook();
    this.Output = null;
    this.ClusterCount = 0;
  }
  get VisitedGraph() {
    return this._graph;
  }
  set VisitedGraph(v) {
    this._graph = required(v, "graph");
  }
  Generate(engine, outputFilePath) {
    if (arguments.length && engine == null) throw new TypeError("engine cannot be null");
    if (engine) nonempty(outputFilePath, "outputFilePath");
    this.ClusterCount = 0;
    const ids = new import_equality.EqualityMap(Array.from(this.VisitedGraph.Vertices, (v, i) => [v, i]));
    const remainingVertices = new import_equality.EqualitySet(ids.keys());
    const remainingEdges = new import_equality.EqualitySet(this.VisitedGraph.Edges);
    const name = String(this.GraphFormat.Name);
    const lines = [`${this.VisitedGraph.IsDirected ? "digraph" : "graph"} ${/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(name) ? name : quote(name)} {`];
    const gf = this.GraphFormat.ToDot(), vf = this.CommonVertexFormat.ToDot(), ef = this.CommonEdgeFormat.ToDot();
    if (gf) lines.push(gf);
    if (vf) lines.push(`node [${vf}];`);
    if (ef) lines.push(`edge [${ef}];`);
    const vertex = (v) => {
      const f = new GraphvizVertex();
      this.FormatVertex.emit(this, new FormatVertexEventArgs(v, f));
      const dot = f.InternalToDot(this.CommonVertexFormat);
      lines.push(`${ids.get(v)}${dot ? ` [${dot}]` : ""};`);
      remainingVertices.delete(v);
    };
    const edge = (e) => {
      if (!ids.has(e.Source) || !ids.has(e.Target)) throw new Error("Edge references vertex outside graph");
      const f = new GraphvizEdge();
      this.FormatEdge.emit(this, new FormatEdgeEventArgs(e, f));
      const dot = f.ToDot();
      lines.push(`${ids.get(e.Source)} ${this.VisitedGraph.IsDirected ? "->" : "--"} ${ids.get(e.Target)}${dot ? ` [${dot}]` : ""};`);
      remainingEdges.delete(e);
    };
    const clusters = (parent) => {
      for (const cluster of parent.Clusters ?? []) {
        lines.push(`subgraph cluster${++this.ClusterCount} {`);
        const f = new GraphvizGraph();
        this.FormatCluster.emit(this, new FormatClusterEventArgs(cluster, f));
        const dot = f.ToDot();
        if (dot) lines.push(dot);
        clusters(cluster);
        if (parent.Collapsed) {
          for (const v of cluster.Vertices) remainingVertices.delete(v);
          for (const e of cluster.Edges) remainingEdges.delete(e);
        } else {
          for (const v of cluster.Vertices) if (remainingVertices.has(v)) vertex(v);
          for (const e of cluster.Edges) if (remainingEdges.has(e)) edge(e);
        }
        lines.push("}");
      }
    };
    clusters(this.VisitedGraph);
    for (const v of remainingVertices) vertex(v);
    for (const e of remainingEdges) edge(e);
    lines.push("}");
    this.Output = lines.join("\n");
    return engine ? engine.Run(this.ImageType, this.Output, outputFilePath) : this.Output;
  }
}
function ToGraphviz(graph, configure) {
  if (arguments.length > 1 && configure === null) throw new TypeError("initAlgorithm cannot be null");
  const algorithm = new GraphvizAlgorithm(graph);
  if (configure) configure(algorithm);
  return algorithm.Generate();
}
const DotToSvgApiEndpoint = "https://rise4fun.com/rest/ask/Agl/";
function ToSvg(graphOrDot, engine, configure) {
  required(graphOrDot, "graphOrDot");
  required(engine, "SVG rendering engine");
  const dot = typeof graphOrDot === "string" ? graphOrDot : ToGraphviz(graphOrDot, configure);
  let result;
  if (typeof engine === "function") result = engine(dot);
  else if (typeof engine.renderString === "function") result = engine.renderString(dot, { format: "svg" });
  else if (typeof engine.Run === "function") result = engine.Run(GraphvizImageType.Svg, dot, "graph.svg");
  else throw new TypeError("SVG engine must expose renderString, Run or be a callback");
  return result?.then ? result.then((value) => value ?? "") : result ?? "";
}
const GraphvizExtensions = Object.freeze({ ToGraphviz, ToSvg, DotToSvgApiEndpoint });
class FileDotEngine {
  constructor(writeFile) {
    this.WriteFile = required(writeFile, "writeFile callback");
  }
  Run(imageType, dot, path) {
    nonempty(dot, "dot");
    nonempty(path, "outputFilePath");
    const output = /\.dot$/i.test(path) ? path : path + ".dot";
    const value = this.WriteFile(output, dot);
    return value?.then ? value.then(() => output) : output;
  }
}
const SvgHtmlWrapper = Object.freeze({
  ParseSize(svg) {
    required(svg, "svg");
    const tag = String(svg).match(/<svg\b[^>]*>/i)?.[0] ?? "";
    const width = tag.match(/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)\s*(?:px)?["']/i);
    const height = tag.match(/\bheight\s*=\s*["'](\d+(?:\.\d+)?)\s*(?:px)?["']/i);
    return width && height ? new GraphvizSize(+width[1], +height[1]) : new GraphvizSize(400, 400);
  },
  DumpHtml(size, svgPath, writeFile) {
    required(size);
    required(svgPath);
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
    const html = `<!doctype html>
<html><body><object data="${esc(svgPath)}" type="image/svg+xml" width="${size.Width}" height="${size.Height}"></object></body></html>`;
    if (!writeFile) return html;
    const path = svgPath + ".html";
    const result = writeFile(path, html);
    return result?.then ? result.then(() => path) : path;
  },
  WrapSvg(svg, svgPath = "image.svg", writeFile) {
    return this.DumpHtml(this.ParseSize(svg), svgPath, writeFile);
  }
});
class GraphRendererBase {
  constructor(graph) {
    this.Graphviz = new GraphvizAlgorithm(graph);
    Object.assign(this.Graphviz.CommonVertexFormat, { Style: GraphvizVertexStyle.Filled, FillColor: GraphvizColor.LightYellow, Font: new GraphvizFont("Tahoma", 8.25), Shape: GraphvizVertexShape.Box });
    this.Graphviz.CommonEdgeFormat.Font = new GraphvizFont("Tahoma", 8.25);
  }
  get VisitedGraph() {
    return this.Graphviz.VisitedGraph;
  }
  Initialize() {
  }
  Clean() {
  }
  Generate(...args) {
    this.Initialize();
    try {
      return this.Graphviz.Generate(...args);
    } finally {
      this.Clean();
    }
  }
}
class CondensatedGraphRenderer extends GraphRendererBase {
  Initialize() {
    this._vertexFormatter = (_, args) => {
      const g = args.Vertex;
      args.VertexFormat.Label = `${g.VertexCount}-${g.EdgeCount}
` + Array.from(g.Vertices, (v) => `  ${v}
`).join("") + Array.from(g.Edges, (e) => `  ${e}
`).join("");
    };
    this._edgeFormatter = (_, args) => {
      const edges = [...args.Edge.Edges];
      args.EdgeFormat.Label.Value = `${edges.length}
` + edges.map((e) => `  ${e}
`).join("");
    };
    this.Graphviz.FormatVertex.add(this._vertexFormatter);
    this.Graphviz.FormatEdge.add(this._edgeFormatter);
  }
  Clean() {
    this.Graphviz.FormatVertex.remove(this._vertexFormatter);
    this.Graphviz.FormatEdge.remove(this._edgeFormatter);
  }
}
class EdgeMergeCondensatedGraphRenderer extends CondensatedGraphRenderer {
  Initialize() {
    super.Initialize();
    this.Graphviz.FormatVertex.remove(this._vertexFormatter);
    this._vertexFormatter = (_, args) => {
      args.VertexFormat.Label = String(args.Vertex);
    };
    this.Graphviz.FormatVertex.add(this._vertexFormatter);
  }
}
const BasicStructuresExtensions = Object.freeze({ ToGraphvizColor: (color) => color instanceof GraphvizColor ? color : new GraphvizColor(color.A ?? 255, color.R, color.G, color.B), ToFont: (font, fontFactory) => font == null ? null : fontFactory ? fontFactory(font.Name, font.SizeInPoints) : { Name: font.Name, SizeInPoints: font.SizeInPoints }, ToGraphvizFont: (font) => font == null ? null : new GraphvizFont(font.Name, font.SizeInPoints), ToGraphvizPoint: (point) => new GraphvizPoint(point.X, point.Y), ToGraphvizSize: (size) => new GraphvizSize(size.Width, size.Height), ToGraphvizSizeF: (size) => new GraphvizSizeF(size.Width, size.Height) });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BasicStructuresExtensions,
  CondensatedGraphRenderer,
  DotEscapers,
  DotToSvgApiEndpoint,
  EdgeMergeCondensatedGraphRenderer,
  FileDotEngine,
  FormatClusterEventArgs,
  FormatEdgeEventArgs,
  FormatVertexEventArgs,
  GraphRendererBase,
  GraphvizAlgorithm,
  GraphvizArrow,
  GraphvizArrowClipping,
  GraphvizArrowFilling,
  GraphvizArrowShape,
  GraphvizClusterMode,
  GraphvizColor,
  GraphvizEdge,
  GraphvizEdgeDirection,
  GraphvizEdgeExtremity,
  GraphvizEdgeLabel,
  GraphvizEdgeStyle,
  GraphvizExtensions,
  GraphvizFont,
  GraphvizGraph,
  GraphvizImageType,
  GraphvizLabelJustification,
  GraphvizLabelLocation,
  GraphvizLayer,
  GraphvizLayerCollection,
  GraphvizOutputMode,
  GraphvizPageDirection,
  GraphvizPoint,
  GraphvizRankDirection,
  GraphvizRatioMode,
  GraphvizRecord,
  GraphvizRecordCell,
  GraphvizRecordCellCollection,
  GraphvizSize,
  GraphvizSizeF,
  GraphvizSplineType,
  GraphvizVertex,
  GraphvizVertexShape,
  GraphvizVertexStyle,
  HtmlString,
  SvgHtmlWrapper,
  ToGraphviz,
  ToSvg
});
//# sourceMappingURL=graphviz.js.map
