"use strict";
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
var control_renderer_exports = {};
__export(control_renderer_exports, {
  applyDocumentStyle: () => applyDocumentStyle,
  applyEffectiveStyleValues: () => applyEffectiveStyleValues,
  reconcileDocumentDOM: () => reconcileDocumentDOM,
  renderDocument: () => renderDocument,
  safeImageSource: () => safeImageSource,
  safeNavigationUri: () => safeNavigationUri,
  thicknessCSS: () => thicknessCSS
});
module.exports = __toCommonJS(control_renderer_exports);
var import_equations = require("./equations.js");
const renderedProperties = [
  "FontFamily",
  "FontSize",
  "FontWeight",
  "FontStyle",
  "FontStretch",
  "Foreground",
  "Background",
  "TextDecorations",
  "TextAlignment",
  "FlowDirection",
  "Margin",
  "Padding",
  "LineHeight",
  "TextIndent",
  "Width",
  "Height",
  "BreakPageBefore",
  "BreakColumnBefore",
  "KeepTogether",
  "KeepWithNext",
  "Widows",
  "Orphans",
  "BaselineAlignment",
  "BorderBrush",
  "BorderThickness",
  "Language",
  "CharacterSpacing",
  "IsHyphenationEnabled",
  "PageWidth",
  "PageHeight",
  "PagePadding",
  "ColumnCount",
  "ColumnWidth",
  "IsColumnWidthFlexible",
  "ColumnGap",
  "WrapStyle",
  "HorizontalAnchor",
  "VerticalAnchor",
  "HorizontalAlignment",
  "HorizontalOffset",
  "VerticalOffset",
  "WrapDirection",
  "WrapDistance",
  "Rotation",
  "Shape"
];
function applyEffectiveStyleValues(node, model, window, includeChildren = true) {
  for (const name of renderedProperties) {
    const source = model.GetValueSource(name);
    if (source.BaseValueSource !== "Default" || source.IsCoerced || source.IsCurrent) {
      const value = model.GetValue(name);
      if (value !== void 0) node.props[name] = value;
    }
  }
  if (!includeChildren) return;
  for (let index = 0; index < (node.children?.length || 0); index++) {
    if (window && !window.Realized.has(index)) continue;
    const child = model.Children[index];
    if (child) applyEffectiveStyleValues(node.children[index], child);
  }
}
function reconcileDocumentDOM(surface, next) {
  const existing = /* @__PURE__ */ new Map();
  surface.querySelectorAll("[data-rt-id]").forEach(
    (element) => existing.set(element.dataset.rtId, element)
  );
  const remap = /* @__PURE__ */ new Map();
  const stats = {
    Created: 0,
    Reused: 0,
    Updated: 0,
    Removed: 0
  };
  const committedPositions = /* @__PURE__ */ new WeakMap();
  function reconcile(parent, desired) {
    const retained = [];
    for (let index = 0; index < desired.length; index++) {
      const source = desired[index];
      const id = source.nodeType === 1 ? source.dataset.rtId : void 0;
      let live = id ? existing.get(id) : parent.childNodes[index];
      if (!live || live.nodeType !== source.nodeType || live.nodeName !== source.nodeName || !id && live.nodeType === 1 && live.dataset.rtId)
        live = void 0;
      if (live) {
        stats.Reused++;
        if (source.nodeType === 3) {
          if (live.nodeValue !== source.nodeValue) {
            live.nodeValue = source.nodeValue;
            stats.Updated++;
          }
        } else if (source.nodeType === 1) {
          const target = live, template = source;
          let updated = false;
          for (const attribute of Array.from(target.attributes))
            if (!template.hasAttribute(attribute.name)) {
              target.removeAttribute(attribute.name);
              updated = true;
            }
          for (const attribute of Array.from(template.attributes))
            if (target.getAttribute(attribute.name) !== attribute.value) {
              target.setAttribute(attribute.name, attribute.value);
              updated = true;
            }
          if (updated) stats.Updated++;
        }
      } else {
        live = source.cloneNode(false);
        stats.Created++;
      }
      remap.set(source, live);
      const position = next.positions.get(source);
      if (position) committedPositions.set(live, position);
      reconcile(live, Array.from(source.childNodes));
      if (parent.childNodes[index] !== live)
        parent.insertBefore(live, parent.childNodes[index] || null);
      retained.push(live);
    }
    const wanted = new Set(retained);
    for (const child of Array.from(parent.childNodes))
      if (!wanted.has(child)) {
        child.remove();
        stats.Removed++;
      }
  }
  reconcile(surface, Array.from(next.fragment.childNodes));
  next.positions = committedPositions;
  next.leaves = next.leaves.map((leaf) => ({
    ...leaf,
    node: remap.get(leaf.node)
  }));
  next.paragraphs = next.paragraphs.map((paragraph) => ({
    ...paragraph,
    node: remap.get(paragraph.node)
  }));
  next.statistics = stats;
  return next;
}
function safeNavigationUri(value) {
  if (typeof value !== "string") return void 0;
  const uri = value.trim();
  if (!uri || /[\u0000-\u0020\u007f]/.test(uri)) return void 0;
  if (/^(https?:|mailto:|tel:)/i.test(uri) || /^(#|\/|\.\.?\/)/.test(uri))
    return uri;
  if (!/^[a-z][a-z\d+.-]*:/i.test(uri)) return uri;
  return void 0;
}
function safeImageSource(value) {
  if (typeof value !== "string") return void 0;
  const uri = value.trim();
  if (/^data:image\/(?:png|jpeg|gif|webp|avif);base64,[a-z\d+/=\s]+$/i.test(uri))
    return uri;
  if (/^(https?:\/\/|blob:)/i.test(uri) && !/[\u0000-\u0020\u007f]/.test(uri))
    return uri;
  if (/^(\/|\.\.?\/)/.test(uri) && !/[\u0000-\u0020\u007f]/.test(uri))
    return uri;
  return void 0;
}
function cssLength(value) {
  if (value && typeof value === "object") {
    const figure = value;
    if (figure.FigureUnitType === "Auto") return "auto";
    if (figure.FigureUnitType === "Pixel") return cssLength(figure.Value);
    if (["Column", "Content", "Page"].includes(figure.FigureUnitType || "") && Number.isFinite(figure.Value))
      return `${Number(figure.Value) * 100}%`;
  }
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && /^-?\d+(?:\.\d+)?(?:px|pt|em|rem|%)?$/.test(value))
    return /^-?\d+(?:\.\d+)?$/.test(value) ? `${value}px` : value;
  return void 0;
}
function thicknessCSS(value) {
  const scalar = cssLength(value);
  if (scalar) return scalar;
  if (value && typeof value === "object") {
    const t = value;
    const parts = [
      t.Top ?? t.top,
      t.Right ?? t.right,
      t.Bottom ?? t.bottom,
      t.Left ?? t.left
    ].map(cssLength);
    if (parts.every(Boolean)) return parts.join(" ");
  }
  if (typeof value === "string") {
    const parts = value.trim().split(/[\s,]+/).map(cssLength);
    if (parts.length > 0 && parts.length <= 4 && parts.every(Boolean)) {
      if (value.includes(",") && parts.length === 4)
        return [parts[1], parts[2], parts[3], parts[0]].join(" ");
      if (value.includes(",") && parts.length === 2)
        return [parts[1], parts[0]].join(" ");
      return parts.join(" ");
    }
  }
  return void 0;
}
function applyStyle(element, props) {
  const s = element.style;
  if (props.FontFamily) s.fontFamily = String(props.FontFamily);
  const fontSize = cssLength(props.FontSize);
  if (fontSize) s.fontSize = fontSize;
  if (props.FontWeight) s.fontWeight = String(props.FontWeight).toLowerCase();
  if (props.FontStyle) s.fontStyle = String(props.FontStyle).toLowerCase();
  if (props.FontStretch)
    s.fontStretch = String(props.FontStretch).replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  if (Number.isFinite(props.CharacterSpacing))
    s.letterSpacing = `${props.CharacterSpacing / 1e3}em`;
  if (props.Foreground) s.color = String(props.Foreground);
  if (props.Background) s.backgroundColor = String(props.Background);
  if (props.TextDecorations) {
    const decoration = String(props.TextDecorations).replace(/Strikethrough/gi, "line-through").toLowerCase();
    if (/^(none|underline|line-through|overline)( (underline|line-through|overline))*$/.test(
      decoration
    ))
      s.textDecoration = decoration;
  }
  const alignment = String(props.TextAlignment ?? "").toLowerCase();
  if (["left", "center", "right", "justify", "start", "end"].includes(alignment))
    s.textAlign = alignment;
  if (props.FlowDirection === "RightToLeft") element.dir = "rtl";
  if (props.FlowDirection === "LeftToRight") element.dir = "ltr";
  const margin = thicknessCSS(props.Margin);
  if (margin) s.margin = margin;
  const padding = thicknessCSS(props.Padding);
  if (padding) s.padding = padding;
  const lineHeight = cssLength(props.LineHeight);
  if (lineHeight) s.lineHeight = lineHeight;
  const textIndent = cssLength(props.TextIndent);
  if (textIndent) s.textIndent = textIndent;
  const width = cssLength(props.Width);
  if (width) s.width = width;
  const height = cssLength(props.Height);
  if (height) s.height = height;
  if (props.BreakPageBefore) s.breakBefore = "page";
  else if (props.BreakColumnBefore) s.breakBefore = "column";
  if (props.KeepTogether) s.breakInside = "avoid";
  if (props.KeepWithNext) s.breakAfter = "avoid";
  if (props.Widows !== void 0)
    s.widows = String(Math.max(1, Math.floor(Number(props.Widows) || 2)));
  if (props.Orphans !== void 0)
    s.orphans = String(Math.max(1, Math.floor(Number(props.Orphans) || 2)));
  if (props.NoteReference) {
    s.verticalAlign = "super";
    s.fontSize = ".75em";
  }
  if (props.BaselineAlignment === "Superscript") s.verticalAlign = "super";
  if (props.BaselineAlignment === "Subscript") s.verticalAlign = "sub";
  if (props.BorderBrush) s.borderColor = String(props.BorderBrush);
  const border = thicknessCSS(props.BorderThickness);
  if (border) {
    s.borderWidth = border;
    s.borderStyle = "solid";
  }
  if (typeof props.Language === "string") element.lang = props.Language;
  if (props.IsHyphenationEnabled !== void 0)
    s.hyphens = props.IsHyphenationEnabled ? "auto" : "manual";
}
function applyFloatingStyle(element, props, anchored) {
  const style = element.style;
  const anchor = String(
    props.HorizontalAnchor || props.HorizontalAlignment || "Right"
  );
  const alignment = /Left$/.test(anchor) ? "left" : /Center$/.test(anchor) ? "center" : "right";
  const wrapping = String(
    props.WrapStyle || (props.WrapDirection === "None" ? "TopAndBottom" : anchored ? "Square" : "Inline")
  );
  element.dataset.rtWrap = wrapping;
  const offsetX = Number.isFinite(props.HorizontalOffset) ? props.HorizontalOffset : 0;
  const offsetY = Number.isFinite(props.VerticalOffset) ? props.VerticalOffset : 0;
  const distance = Number.isFinite(props.WrapDistance) ? Math.max(0, props.WrapDistance) : 12;
  if (anchored) {
    style.display = "block";
    style.width ||= "240px";
    style.maxWidth = "100%";
    style.whiteSpace = "normal";
    style.overflow = "hidden";
    style.breakInside = "avoid";
    element.setAttribute("role", "group");
    element.setAttribute(
      "aria-label",
      String(props.AlternativeText || "Floating text content")
    );
  }
  if (wrapping === "Square" || wrapping === "Tight") {
    style.cssFloat = props.WrapDirection === "Left" ? "right" : props.WrapDirection === "Right" ? "left" : alignment === "left" ? "left" : "right";
    style.margin = style.cssFloat === "left" ? `${offsetY}px ${distance}px ${distance}px ${distance + offsetX}px` : `${offsetY}px ${distance - offsetX}px ${distance}px ${distance}px`;
    if (wrapping === "Tight")
      style.shapeOutside = props.Shape === "Ellipse" ? "ellipse(50% 50%)" : "inset(0)";
    style.shapeMargin = `${distance}px`;
    if (alignment === "center")
      element.dataset.rtLayoutWarning = "A centered wrapped object uses the right float edge; use TopAndBottom for centered placement.";
  } else if (wrapping === "TopAndBottom") {
    style.display = "block";
    style.clear = "both";
    style.marginTop = `${Math.max(0, offsetY)}px`;
    style.marginBottom = `${distance}px`;
    style.marginLeft = alignment === "left" ? `${Math.max(0, offsetX)}px` : "auto";
    style.marginRight = alignment === "right" ? `${Math.max(0, -offsetX)}px` : "auto";
  } else if (wrapping === "Inline" && anchored) {
    style.display = "inline-block";
    style.verticalAlign = "middle";
  } else if (wrapping === "BehindText" || wrapping === "InFrontOfText") {
    style.position = "absolute";
    style.left = `${offsetX}px`;
    style.top = `${offsetY}px`;
    style.zIndex = wrapping === "BehindText" ? "-1" : "1";
  }
  if (Number.isFinite(props.Rotation))
    style.transform = `rotate(${props.Rotation}deg)`;
  if (props.HorizontalAlignment === "Stretch") {
    style.width = "100%";
    style.cssFloat = "none";
    style.display = "block";
    style.clear = "both";
  }
  if (props.VerticalAnchor && props.VerticalAnchor !== "ParagraphTop")
    element.dataset.rtLayoutWarning = "Page/content vertical anchors are preserved in the model; browser placement uses the paragraph anchor and offsets.";
  for (const dimension of [props.Width, props.Height])
    if (dimension && typeof dimension === "object" && dimension.FigureUnitType === "Page")
      element.dataset.rtLayoutWarning = "Page-relative FigureLength is resolved against the current containing flow area.";
}
function renderDocument(node, owner, previousTemplates, window) {
  const result = {
    fragment: owner.createDocumentFragment(),
    positions: /* @__PURE__ */ new WeakMap(),
    leaves: [],
    paragraphs: [],
    length: 0,
    templates: /* @__PURE__ */ new Map()
  };
  let position = 0;
  let blockSeen = false;
  function visit(current, parent) {
    const props = current.props || {};
    const isParagraph = current.type === "Paragraph";
    const isAtomicBlock = current.type === "BlockUIContainer";
    if (isParagraph || isAtomicBlock) {
      if (blockSeen) position++;
      blockSeen = true;
    }
    const start = position;
    let tag = "span";
    switch (current.type) {
      case "FlowDocument":
      case "Section":
        tag = "section";
        break;
      case "Paragraph":
        tag = Number(props.HeadingLevel) >= 1 && Number(props.HeadingLevel) <= 6 ? `h${Number(props.HeadingLevel)}` : "p";
        break;
      case "Bold":
        tag = "strong";
        break;
      case "Italic":
        tag = "em";
        break;
      case "Underline":
        tag = "u";
        break;
      case "Hyperlink":
        tag = "a";
        break;
      case "LineBreak":
        tag = "br";
        break;
      case "List":
        tag = /decimal|latin|roman|number/i.test(
          String(props.MarkerStyle || "")
        ) ? "ol" : "ul";
        break;
      case "ListItem":
        tag = "li";
        break;
      case "Table":
        tag = "table";
        break;
      case "TableRowGroup":
        tag = props.IsHeader ? "thead" : "tbody";
        break;
      case "TableRow":
        tag = "tr";
        break;
      case "TableCell":
        tag = props.IsHeader ? "th" : "td";
        break;
      case "BlockUIContainer":
        tag = "div";
        break;
      case "Figure":
      case "Floater":
        tag = "span";
        break;
      case "Image":
        tag = "img";
        break;
    }
    const cached = previousTemplates?.get(current.id);
    const element = cached?.localName === tag ? cached : owner.createElement(tag);
    const cachedText = current.type === "Run" && element.firstChild?.nodeType === 3 ? element.firstChild : null;
    const cachedPlaceholder = isParagraph ? element.querySelector(":scope > br[data-rt-placeholder]") : null;
    element.replaceChildren();
    for (const attribute of Array.from(element.attributes))
      element.removeAttribute(attribute.name);
    result.templates.set(current.id, element);
    element.dataset.rtId = current.id;
    element.dataset.rtType = current.type;
    applyStyle(element, props);
    if ([
      "Figure",
      "Floater",
      "Image",
      "InlineUIContainer",
      "BlockUIContainer"
    ].includes(current.type))
      applyFloatingStyle(
        element,
        props,
        current.type === "Figure" || current.type === "Floater"
      );
    if (isParagraph) element.dataset.rtParagraph = "";
    if (isParagraph || current.type === "Run")
      element.style.whiteSpace = "pre-wrap";
    if (current.type === "Hyperlink") {
      const uri = safeNavigationUri(props.NavigateUri);
      if (uri) element.href = uri;
      element.rel = "noopener noreferrer";
      if (props.ToolTip) element.title = String(props.ToolTip);
    }
    if (current.type === "List") {
      if (tag === "ol" && Number.isInteger(Number(props.StartIndex)))
        element.start = Number(props.StartIndex);
      const listStyles = {
        Decimal: "decimal",
        LowerLatin: "lower-alpha",
        UpperLatin: "upper-alpha",
        LowerRoman: "lower-roman",
        UpperRoman: "upper-roman",
        Disc: "disc",
        Circle: "circle",
        Square: "square",
        None: "none"
      };
      const marker = listStyles[String(props.MarkerStyle)];
      if (marker) element.style.listStyleType = marker;
    }
    if (current.type === "TableCell") {
      if (Number(props.RowSpan) > 1)
        element.rowSpan = Math.min(
          1e3,
          Number(props.RowSpan)
        );
      if (Number(props.ColumnSpan) > 1)
        element.colSpan = Math.min(
          1e3,
          Number(props.ColumnSpan)
        );
    }
    if (current.type === "Table") {
      if (Number(props.CellSpacing) > 0) {
        element.style.borderCollapse = "separate";
        element.style.borderSpacing = `${Number(props.CellSpacing)}px`;
      }
      if (Array.isArray(props.Columns) && props.Columns.length) {
        const group = owner.createElement("colgroup");
        for (const column of props.Columns) {
          const col = owner.createElement("col");
          const width = cssLength(column?.props?.Width);
          if (width) col.style.width = width;
          group.append(col);
        }
        element.append(group);
      }
    }
    if (current.type === "Run") {
      const text = cachedText || owner.createTextNode(current.text || "");
      if (text.data !== (current.text || "")) text.data = current.text || "";
      element.append(text);
      position += text.data.length;
      result.positions.set(text, { start, end: position });
      result.leaves.push({ node: text, start, end: position });
    } else if (current.type === "LineBreak") {
      position++;
      result.leaves.push({ node: element, start, end: position, atomic: true });
    } else if (current.type === "Equation" || current.type === "Image" || current.type === "InlineUIContainer" || current.type === "Figure" || current.type === "Floater" || isAtomicBlock) {
      if (current.type === "Equation") {
        element.className = "rt-equation";
        element.dataset.display = String(Boolean(props.DisplayMode));
        element.setAttribute("role", "math");
        element.setAttribute(
          "aria-label",
          String(props.AlternativeText || props.EquationSource || "Equation")
        );
        try {
          const output = (0, import_equations.renderEquation)((0, import_equations.equationOptions)(current));
          element.innerHTML = output.SVG;
          element.title = String(
            props.AlternativeText || "Double-click to edit equation"
          );
          element.querySelector("svg")?.setAttribute("aria-hidden", "true");
        } catch (error) {
          element.textContent = "[Invalid equation]";
          element.setAttribute("aria-invalid", "true");
          element.title = error instanceof Error ? error.message : String(error);
        }
      } else if (current.type === "Image") {
        const image = element;
        const source = safeImageSource(props.Source);
        if (source) image.src = source;
        image.alt = String(props.AlternativeText || "");
        image.draggable = false;
        image.loading = "lazy";
      } else if (current.type === "Figure" || current.type === "Floater") {
        const story = renderDocument(
          {
            type: "FlowDocument",
            id: `${current.id}-story`,
            props: {},
            children: current.children || []
          },
          owner
        );
        element.append(story.fragment);
      } else {
        element.className = "rt-embedded";
        const embedded = current.children?.find(
          (child) => child.type === "Image"
        );
        if (embedded) {
          const image = owner.createElement("img");
          const source = safeImageSource(embedded.props.Source);
          if (source) image.src = source;
          image.alt = String(embedded.props.AlternativeText || "");
          applyStyle(image, embedded.props);
          element.append(image);
        } else
          element.textContent = String(
            props.AlternativeText || props.Text || "Embedded content"
          );
        element.setAttribute("role", "img");
        element.setAttribute(
          "aria-label",
          String(props.AlternativeText || "Embedded content")
        );
      }
      element.contentEditable = "false";
      position++;
      result.leaves.push({ node: element, start, end: position, atomic: true });
    } else {
      for (const child of current.children || []) visit(child, element);
    }
    if (isParagraph) {
      if (!element.childNodes.length || start === position) {
        const br = cachedPlaceholder || owner.createElement("br");
        br.dataset.rtPlaceholder = "";
        element.append(br);
        result.positions.set(br, { start: position, end: position });
      }
      result.paragraphs.push({ node: element, start, end: position });
    }
    result.positions.set(element, { start, end: position });
    parent.appendChild(element);
  }
  const children = node.children || [];
  for (let index = 0; index < children.length; index++) {
    if (!window || window.Realized.has(index))
      visit(children[index], result.fragment);
    else {
      const start = position;
      let height = 0;
      const first = index;
      while (index < children.length && !window.Realized.has(index)) {
        const block = window.Blocks[index];
        height += block.Height;
        position = block.EndOffset;
        blockSeen = block.HasTextBlock;
        index++;
      }
      const spacer = owner.createElement("div");
      spacer.dataset.rtVirtualSpacer = `${first}:${index - 1}`;
      spacer.style.height = `${height}px`;
      spacer.style.pointerEvents = "none";
      spacer.contentEditable = "false";
      spacer.setAttribute("aria-hidden", "true");
      result.positions.set(spacer, { start, end: position });
      result.fragment.append(spacer);
      index--;
    }
  }
  if (!result.fragment.childNodes.length) {
    const paragraph = owner.createElement("p");
    paragraph.dataset.rtParagraph = "";
    paragraph.append(owner.createElement("br"));
    result.fragment.append(paragraph);
    result.positions.set(paragraph, { start: 0, end: 0 });
    result.paragraphs.push({ node: paragraph, start: 0, end: 0 });
  }
  result.length = position;
  return result;
}
function applyDocumentStyle(surface, props) {
  surface.removeAttribute("style");
  applyStyle(surface, props);
  if (typeof props.ColumnCount === "number" && props.ColumnCount > 1)
    surface.style.columnCount = String(
      Math.min(12, Math.floor(props.ColumnCount))
    );
  const gap = cssLength(props.ColumnGap);
  if (gap) surface.style.columnGap = gap;
}
//# sourceMappingURL=control-renderer.js.map
