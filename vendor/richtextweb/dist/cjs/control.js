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
var control_exports = {};
__export(control_exports, {
  DocumentVirtualizer: () => import_virtualization2.DocumentVirtualizer,
  FlowDocumentPageViewer: () => FlowDocumentPageViewer,
  FlowDocumentReader: () => FlowDocumentReader,
  FlowDocumentScrollViewer: () => FlowDocumentScrollViewer,
  RichTextBox: () => RichTextBox,
  RichTextPageEditor: () => RichTextPageEditor,
  normalizeFloatingLayout: () => import_floating_layout2.normalizeFloatingLayout,
  pageAtOffset: () => import_page_window2.pageAtOffset,
  pagePreviewWindow: () => import_page_window2.pagePreviewWindow,
  registerRichTextWeb: () => registerRichTextWeb
});
module.exports = __toCommonJS(control_exports);
var import_page_setup = require("./page-setup.js");
var import_page_window = require("./page-window.js");
var import_page_window2 = require("./page-window.js");
var import_equation_control = require("./equation-control.js");
var import_model = require("./model.js");
var import_engine = require("./engine.js");
var import_formats = require("./formats.js");
var import_control_renderer = require("./control-renderer.js");
var import_pagination = require("./pagination.js");
var import_toolbar = require("./toolbar.js");
var import_virtualization = require("./virtualization.js");
var import_floating_layout = require("./floating-layout.js");
var import_floating_adorner = require("./floating-adorner.js");
var import_virtualization2 = require("./virtualization.js");
var import_floating_layout2 = require("./floating-layout.js");
const HTMLElementBase = globalThis.HTMLElement ?? class extends EventTarget {
};
const stylesheet = `
:host{display:block;min-width:0;min-height:160px;--rt-accent:#2463d5;--rt-ink:#182236;--rt-paper:#fff;--rt-workspace:#edf0f5;--rt-border:#d7dce5;color:var(--rt-ink);font-family:Segoe UI,Inter,system-ui,sans-serif;color-scheme:light dark;contain:layout style}
*{box-sizing:border-box}.viewport{height:100%;min-height:inherit;overflow:auto;background:var(--rt-workspace);padding:28px;scrollbar-gutter:stable;position:relative;overscroll-behavior:contain}.surface{box-sizing:border-box;position:relative;outline:none;margin:0 auto;width:var(--rt-page-width,794px);min-height:var(--rt-page-height,1123px);padding:var(--rt-page-padding,72px);background:var(--rt-paper);color:var(--rt-ink);box-shadow:0 2px 14px #17233a13;border:1px solid var(--rt-border);font:16px/1.5 Georgia,Cambria,serif;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;caret-color:var(--rt-accent);zoom:var(--rt-zoom,1);tab-size:4}
.surface:focus-visible{outline:2px solid color-mix(in srgb,var(--rt-accent) 28%,transparent);outline-offset:3px}.viewport.continuous{padding:0;background:var(--rt-paper)}.continuous .surface{width:100%;min-height:100%;padding:24px;border:0;box-shadow:none}.surface:empty::before,.surface[data-empty=true]::before{content:attr(data-placeholder);position:absolute;color:#818898;pointer-events:none;font-family:Segoe UI,system-ui,sans-serif}.surface p{margin:0 0 .7em;min-height:1.5em}.surface p:last-child{margin-bottom:0}.surface h1,.surface h2,.surface h3,.surface h4,.surface h5,.surface h6{font-family:Segoe UI,system-ui,sans-serif;line-height:1.2;margin:1em 0 .45em;break-after:avoid}.surface h1{font-size:2em}.surface h2{font-size:1.5em}.surface h3{font-size:1.2em}.surface h1:first-child,.surface h2:first-child{margin-top:0}.surface a{color:var(--rt-accent);text-decoration:underline;cursor:text}.surface [contenteditable=false]{cursor:default}.surface table{border-collapse:collapse;margin:.75em 0;max-width:100%;width:100%;table-layout:fixed}.surface td,.surface th{border:1px solid #b8c0ce;padding:8px 10px;vertical-align:top;min-width:24px}.surface th{background:color-mix(in srgb,var(--rt-accent) 8%,var(--rt-paper));font-weight:600}.surface td p,.surface th p{margin:0}.surface ul,.surface ol{padding-inline-start:1.7em;margin:.5em 0}.surface li>p{margin-bottom:.25em}.surface img{max-width:100%;object-fit:contain;vertical-align:middle}.surface .rt-embedded{display:inline-block;border:1px dashed var(--rt-border);padding:4px 8px;border-radius:3px;font-family:Segoe UI,system-ui,sans-serif;font-size:.85em}.surface div.rt-embedded{display:block}.surface .rt-equation{display:inline-block;max-width:100%;vertical-align:baseline;white-space:normal;overflow:visible;line-height:normal}.surface .rt-equation[data-display=true]{display:block;text-align:center;margin:.6em 0;break-inside:avoid}.rt-equation mjx-container{display:inline-block;line-height:0;direction:ltr;text-indent:0}.rt-equation svg{overflow:visible;max-width:100%;height:auto}.rt-equation[aria-invalid=true]{border:1px solid #c42b1c;padding:.2em}.surface ::selection{background:color-mix(in srgb,var(--rt-accent) 25%,transparent)}
:host([theme=dark]){--rt-ink:#e7e9ef;--rt-paper:#242730;--rt-workspace:#1a1d24;--rt-border:#3a4050}:host([theme=light]){color-scheme:light}:host([theme=dark]){color-scheme:dark}@media(prefers-color-scheme:dark){:host(:not([theme=light])){--rt-ink:#e7e9ef;--rt-paper:#242730;--rt-workspace:#1a1d24;--rt-border:#3a4050}}@media(max-width:640px){.viewport{padding:12px}.surface{padding:32px;width:max(100%,var(--rt-page-width,794px))}.continuous .surface{width:100%;padding:18px}}@media print{:host{display:block;height:auto!important;contain:none;--rt-paper:white;--rt-ink:black}.viewport{height:auto!important;overflow:visible;padding:0;background:white}.surface,.continuous .surface{width:auto;min-height:0;margin:0;padding:0;border:0;box-shadow:none;zoom:1!important;outline:none!important}.surface td,.surface th{break-inside:avoid}.surface a{color:inherit}}`;
class RichTextBox extends HTMLElementBase {
  static get observedAttributes() {
    return [
      "readonly",
      "accepts-tab",
      "zoom",
      "view-mode",
      "placeholder",
      "aria-label",
      "spellcheck",
      "virtualize"
    ];
  }
  _engine = new import_engine.RichTextEngine();
  _editor = null;
  _viewport = null;
  _render = null;
  _readOnly = false;
  _presentationReadOnly = false;
  _renderDocument = null;
  _acceptsTab = false;
  _zoom = 1;
  _viewMode = "page";
  _composing = false;
  _compositionBase = null;
  _suspendRender = false;
  _restoringSelection = false;
  _backwardSelection = false;
  _lastDOMHTML = "";
  _subscriptions = [];
  _connected = false;
  _disposed = false;
  _enableVirtualization = false;
  _virtualizationThreshold = 200;
  _virtualizationOverscan = 6;
  _virtualizer = new import_virtualization.DocumentVirtualizer();
  _virtualWindow = null;
  _virtualizationSuspended = false;
  _virtualFrame = 0;
  _virtualResizeObserver = null;
  _refreshing = false;
  _selectedObjectId = null;
  _objectAdorner = null;
  _documentSelectionChanged = (event) => {
    if (event.target === this.ownerDocument) this.syncSelection();
  };
  constructor(options = {}) {
    super();
    this._readOnly = Boolean(options.readOnly);
    this._viewMode = options.viewMode || "page";
    this._subscriptions.push(
      this._engine.Changed.Subscribe(() => {
        if (!this._composing && !this._suspendRender) this.Refresh();
        this.emit("documentchange", {
          document: this.Document,
          engine: this.Engine,
          revision: this.Document.Revision
        });
        this.emitCommandState();
      })
    );
    this._subscriptions.push(
      this._engine.SelectionChanged.Subscribe(() => {
        const selection = this.Selection;
        if (!this._restoringSelection) this.restoreSelection();
        this.emit("selectionchange", {
          selection,
          start: selection.Start.Offset,
          end: selection.End.Offset,
          text: selection.Text
        });
        this.emitCommandState();
      })
    );
    if (typeof this.attachShadow !== "function") return;
    const shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
    const style = this.ownerDocument.createElement("style");
    style.textContent = stylesheet + import_floating_adorner.floatingAdornerCSS;
    const viewport = this.ownerDocument.createElement("div");
    viewport.className = "viewport";
    viewport.setAttribute("part", "viewport");
    const editor = this.ownerDocument.createElement("div");
    editor.className = "surface";
    editor.setAttribute("part", "editor");
    editor.setAttribute("role", "textbox");
    editor.setAttribute("aria-multiline", "true");
    editor.tabIndex = 0;
    viewport.append(editor);
    shadow.append(style, viewport);
    this._editor = editor;
    this._viewport = viewport;
    this._objectAdorner = new import_floating_adorner.FloatingObjectAdorner(this, editor, viewport);
    viewport.addEventListener("scroll", () => this.queueVirtualRefresh(), {
      passive: true
    });
    editor.addEventListener("load", () => this.queueVirtualRefresh(), true);
    editor.addEventListener(
      "beforeinput",
      (event) => this.beforeInput(event)
    );
    editor.addEventListener("input", () => {
      if (!this._composing) this.reconcileNativeInput();
    });
    editor.addEventListener("compositionstart", () => {
      this.syncSelection();
      this.materializeNativeEditing();
      this._compositionBase = this.Document.Text;
      this._composing = true;
    });
    editor.addEventListener("compositionend", () => {
      this._composing = false;
      queueMicrotask(() => this.reconcileNativeInput());
    });
    editor.addEventListener("keydown", (event) => this.keyDown(event));
    editor.addEventListener("keyup", () => this.syncSelection());
    editor.addEventListener("pointerup", () => this.syncSelection());
    editor.addEventListener("pointerdown", (event) => {
      const target = event.target;
      const object = target.closest(
        '[data-rt-type="Figure"],[data-rt-type="Floater"]'
      ) || target.closest(
        '[data-rt-type="Equation"],[data-rt-type="Image"],[data-rt-type="InlineUIContainer"],[data-rt-type="BlockUIContainer"]'
      );
      this._selectedObjectId = object?.dataset.rtId || null;
      this.emit("objectselectionchange", { elementId: this._selectedObjectId });
    });
    editor.addEventListener("dblclick", (event) => {
      if (this._selectedObjectId && !this.IsReadOnly)
        this.emit("objecteditrequest", { elementId: this._selectedObjectId });
    });
    editor.addEventListener("focus", () => this.restoreSelection());
    editor.addEventListener("copy", (event) => this.copy(event, false));
    editor.addEventListener("cut", (event) => this.copy(event, true));
    editor.addEventListener("paste", (event) => this.paste(event));
    editor.addEventListener("dragover", (event) => {
      if (!this.IsReadOnly && event.dataTransfer?.types.some(
        (type) => type === "text/plain" || type === "text/html"
      )) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    });
    editor.addEventListener("drop", (event) => this.drop(event));
    editor.addEventListener("click", (event) => {
      const link = event.target?.closest?.("a");
      if (link) {
        event.preventDefault();
        if (event.ctrlKey || event.metaKey || this.IsReadOnly)
          this.emit("linkactivate", {
            uri: link.getAttribute("href"),
            originalEvent: event
          });
      }
    });
  }
  connectedCallback() {
    if (this._disposed || this._connected) return;
    this._connected = true;
    if (typeof ResizeObserver !== "undefined" && !this._virtualResizeObserver) {
      this._virtualResizeObserver = new ResizeObserver(
        () => this.queueVirtualRefresh()
      );
      this._virtualResizeObserver.observe(this);
    }
    this.ownerDocument.addEventListener(
      "selectionchange",
      this._documentSelectionChanged
    );
    this.updateAttributes();
    this.Refresh();
  }
  disconnectedCallback() {
    this._connected = false;
    this._virtualResizeObserver?.disconnect();
    this._virtualResizeObserver = null;
    if (this._virtualFrame)
      this.ownerDocument?.defaultView?.cancelAnimationFrame(this._virtualFrame);
    this._virtualFrame = 0;
    this.ownerDocument?.removeEventListener(
      "selectionchange",
      this._documentSelectionChanged
    );
  }
  attributeChangedCallback(name, _old, value) {
    switch (name) {
      case "readonly":
        this._readOnly = value !== null && value !== "false";
        break;
      case "accepts-tab":
        this._acceptsTab = value !== null && value !== "false";
        break;
      case "zoom": {
        const parsed = Number(value);
        if (value !== null && Number.isFinite(parsed) && parsed > 0)
          this._zoom = Math.max(0.25, Math.min(4, parsed));
        break;
      }
      case "view-mode":
        this._viewMode = value === "continuous" ? "continuous" : "page";
        break;
      case "virtualize":
        this._enableVirtualization = value !== null && value !== "false";
        break;
    }
    this.updateAttributes();
    if (name === "virtualize" && this._connected) this.Refresh();
  }
  get Document() {
    return this._engine.Document;
  }
  set Document(value) {
    if (!(value instanceof import_model.FlowDocument))
      throw new TypeError("Document must be a FlowDocument.");
    this._engine.SetDocument(value);
    this.Refresh();
  }
  get Engine() {
    return this._engine;
  }
  get EnableVirtualization() {
    return this._enableVirtualization;
  }
  set EnableVirtualization(value) {
    this._enableVirtualization = Boolean(value);
    this.reflectBoolean("virtualize", this._enableVirtualization);
    this.Refresh();
  }
  get VirtualizationThreshold() {
    return this._virtualizationThreshold;
  }
  set VirtualizationThreshold(value) {
    if (!Number.isInteger(value) || value < 1)
      throw new RangeError(
        "VirtualizationThreshold must be a positive integer."
      );
    this._virtualizationThreshold = value;
    this.Refresh();
  }
  get VirtualizationOverscan() {
    return this._virtualizationOverscan;
  }
  set VirtualizationOverscan(value) {
    if (!Number.isInteger(value) || value < 1 || value > 100)
      throw new RangeError(
        "VirtualizationOverscan must be between 1 and 100 blocks."
      );
    this._virtualizationOverscan = value;
    this.Refresh();
  }
  get VirtualizationStatistics() {
    return this._virtualWindow?.Statistics || {
      Active: false,
      TotalBlocks: this.Document.Blocks.Count,
      RealizedBlocks: this.Document.Blocks.Count,
      EstimatedHeight: this._editor?.scrollHeight || 0,
      FirstVisibleBlock: 0,
      LastVisibleBlock: Math.max(0, this.Document.Blocks.Count - 1),
      SelectionExpanded: false
    };
  }
  get SelectedObjectId() {
    return this._selectedObjectId;
  }
  GetSelectedObject() {
    const nodes = /* @__PURE__ */ new Map();
    const walk = (node) => {
      nodes.set(node.id, node);
      node.children?.forEach(walk);
    };
    walk(this.Document.ToJSON());
    const chosen = this._selectedObjectId && nodes.get(this._selectedObjectId);
    if (chosen) return chosen;
    const at = this.Selection.Start.Offset;
    const leaf = this._render?.leaves.find(
      (item) => item.atomic && at >= item.start && at <= item.end && item.node.nodeType === 1 && [
        "Figure",
        "Floater",
        "Equation",
        "Image",
        "InlineUIContainer",
        "BlockUIContainer"
      ].includes(item.node.dataset.rtType || "")
    );
    return leaf ? nodes.get(leaf.node.dataset.rtId) || null : null;
  }
  SelectObject(elementId) {
    const element = Array.from(
      this._editor?.querySelectorAll("[data-rt-id]") || []
    ).find((candidate) => candidate.dataset.rtId === elementId);
    const position = element && this._render?.positions.get(element);
    if (!position) return false;
    this._selectedObjectId = elementId;
    this.Select(position.start, position.end);
    this.emit("objectselectionchange", { elementId });
    return true;
  }
  SetFloatingLayout(elementId, options) {
    if (this.IsReadOnly) throw new Error("The document is read-only.");
    const properties = (0, import_floating_layout.normalizeFloatingLayout)(options);
    const root = this.Document.ToJSON();
    let object;
    const walk = (node) => {
      if (node.id === elementId) object = node;
      else node.children?.forEach(walk);
    };
    walk(root);
    if (!object || ![
      "Figure",
      "Floater",
      "Image",
      "InlineUIContainer",
      "BlockUIContainer"
    ].includes(object.type))
      throw new Error("Choose an image or floating text object first.");
    this.Engine.BeginChange();
    try {
      for (const [name, value] of Object.entries(properties))
        this.Engine.SetElementProperty(elementId, name, value);
    } finally {
      this.Engine.EndChange();
    }
    this._selectedObjectId = elementId;
    this.emit("objectlayoutchange", { elementId, properties });
  }
  get FloatingLayoutDiagnostics() {
    return Array.from(
      this._editor?.querySelectorAll("[data-rt-layout-warning]") || []
    ).map((element) => ({
      ElementId: element.dataset.rtId || "",
      Message: element.dataset.rtLayoutWarning
    }));
  }
  get Selection() {
    return this._engine.Selection;
  }
  get CaretPosition() {
    return this.Selection.End;
  }
  set CaretPosition(value) {
    if (value.Document !== this.Document)
      throw new Error("CaretPosition belongs to a different document.");
    this.Select(value.Offset, value.Offset);
  }
  get IsReadOnly() {
    return this._readOnly || this._presentationReadOnly;
  }
  set IsReadOnly(value) {
    this._readOnly = Boolean(value);
    this.reflectBoolean("readonly", this._readOnly);
    this.updateAttributes();
    this.emitCommandState();
  }
  setPresentationReadOnly(value) {
    this._presentationReadOnly = value;
    this.updateAttributes();
    this.emitCommandState();
  }
  get AcceptsTab() {
    return this._acceptsTab;
  }
  set AcceptsTab(value) {
    this._acceptsTab = Boolean(value);
    this.reflectBoolean("accepts-tab", this._acceptsTab);
  }
  get Zoom() {
    return this._zoom;
  }
  set Zoom(value) {
    if (!Number.isFinite(value) || value <= 0)
      throw new RangeError("Zoom must be a positive finite number.");
    this._zoom = Math.max(0.25, Math.min(4, value));
    this.setAttribute?.("zoom", String(this._zoom));
    this.updateAttributes();
  }
  get ViewMode() {
    return this._viewMode;
  }
  set ViewMode(value) {
    if (value !== "page" && value !== "continuous")
      throw new TypeError("ViewMode must be page or continuous.");
    this._viewMode = value;
    this.setAttribute?.("view-mode", value);
    this.updateAttributes();
  }
  get CanUndo() {
    return !this.IsReadOnly && this._engine.CanUndo;
  }
  get CanRedo() {
    return !this.IsReadOnly && this._engine.CanRedo;
  }
  get Text() {
    return this.Document.Text;
  }
  set Text(value) {
    this.Document = (0, import_formats.fromText)(String(value));
  }
  get value() {
    return this.Text;
  }
  set value(value) {
    this.Text = value;
  }
  get document() {
    return this.Document;
  }
  set document(value) {
    this.Document = value;
  }
  get readOnly() {
    return this.IsReadOnly;
  }
  set readOnly(value) {
    this.IsReadOnly = value;
  }
  get acceptsTab() {
    return this.AcceptsTab;
  }
  set acceptsTab(value) {
    this.AcceptsTab = value;
  }
  get zoom() {
    return this.Zoom;
  }
  set zoom(value) {
    this.Zoom = value;
  }
  get viewMode() {
    return this.ViewMode;
  }
  set viewMode(value) {
    this.ViewMode = value;
  }
  Focus() {
    this._editor?.focus({ preventScroll: true });
    this.restoreSelection();
  }
  Select(start, end = start) {
    this._engine.Select(start, end);
    this.restoreSelection();
  }
  SelectAll() {
    this.Select(0, this.Document.Text.length);
  }
  Undo() {
    if (!this.IsReadOnly) {
      this._engine.Undo();
      this.restoreSelection();
    }
  }
  Redo() {
    if (!this.IsReadOnly) {
      this._engine.Redo();
      this.restoreSelection();
    }
  }
  AppendText(text) {
    this._engine.Select(this.Document.Text.length, this.Document.Text.length);
    this._engine.InsertText(String(text));
    this.restoreSelection();
  }
  BeginChange() {
    this._engine.BeginChange();
  }
  EndChange() {
    this._engine.EndChange();
  }
  DeclareChangeBlock() {
    this.BeginChange();
    let disposed = false;
    return {
      Dispose: () => {
        if (!disposed) {
          disposed = true;
          this.EndChange();
        }
      }
    };
  }
  ScrollToHome() {
    if (this._viewport) this._viewport.scrollTop = 0;
  }
  ScrollToEnd() {
    if (this._viewport) this._viewport.scrollTop = this._viewport.scrollHeight;
  }
  ScrollToTextOffset(offset) {
    if (!Number.isInteger(offset) || offset < 0 || offset > this.Document.Text.length)
      throw new RangeError("Text offset is outside the document.");
    this.Select(offset);
    if (this._virtualWindow && this._viewport) {
      const block = this._virtualizer.BlockAtOffset(offset);
      if (block) this._viewport.scrollTop = block.Top * this.Zoom;
      this.Refresh();
    }
    const point = this.domPoint(offset);
    const element = point?.node.nodeType === 1 ? point.node : point?.node.parentElement;
    element?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  async Copy() {
    this.syncSelection();
    if (this.Selection.IsEmpty) return;
    const clipboard = this.ownerDocument?.defaultView?.navigator.clipboard;
    if (!clipboard)
      throw new Error(
        "Clipboard access requires a secure browser context and permission."
      );
    const html = (0, import_formats.toHTML)(this.Engine.GetSelectedFragment()), text = this.Selection.Text;
    if (typeof ClipboardItem !== "undefined" && clipboard.write)
      await clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" })
        })
      ]);
    else if (clipboard.writeText) await clipboard.writeText(text);
    else throw new Error("This browser cannot write the system clipboard.");
  }
  async Cut() {
    if (this.IsReadOnly) return;
    this.syncSelection();
    const revision = this.Document.Revision, document = this.Document, start = this.Selection.Start.Offset, end = this.Selection.End.Offset;
    await this.Copy();
    if (this.IsReadOnly || this.Document !== document || this.Document.Revision !== revision || this.Selection.Start.Offset !== start || this.Selection.End.Offset !== end)
      throw new Error(
        "The document or selection changed while copying; no content was cut."
      );
    if (start !== end) this.Engine.InsertText("");
  }
  async Paste() {
    if (this.IsReadOnly) return;
    const clipboard = this.ownerDocument?.defaultView?.navigator.clipboard;
    if (!clipboard)
      throw new Error(
        "Clipboard access requires a secure browser context and permission."
      );
    this.syncSelection();
    const revision = this.Document.Revision, document = this.Document, start = this.Selection.Start.Offset, end = this.Selection.End.Offset;
    let html = "", text = "";
    if (clipboard.read) {
      const items = await clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html"))
          html = await (await item.getType("text/html")).text();
        if (item.types.includes("text/plain"))
          text = await (await item.getType("text/plain")).text();
        if (html || text) break;
      }
    } else if (clipboard.readText) text = await clipboard.readText();
    else throw new Error("This browser cannot read the system clipboard.");
    if (this.IsReadOnly || this.Document !== document || this.Document.Revision !== revision || this.Selection.Start.Offset !== start || this.Selection.End.Offset !== end)
      throw new Error(
        "The document or selection changed while reading the clipboard; paste was cancelled."
      );
    if (html) this.PasteHTML(html);
    else if (text) this.Engine.InsertText(text);
    this.restoreSelection();
  }
  Execute(command, parameter) {
    const name = command.replace(
      /^(EditingCommands|ApplicationCommands)\./,
      ""
    );
    const normalized = name.replace(/[\s_-]/g, "").toLowerCase();
    if (normalized === "copy") return this.Copy();
    if (normalized === "cut") return this.Cut();
    if (normalized === "paste") return this.Paste();
    if (normalized === "setfloatinglayout")
      return this.SetFloatingLayout(
        parameter.elementId ?? parameter.ElementId,
        parameter.options ?? parameter.Options
      );
    if (normalized === "selectall") {
      this.SelectAll();
      return;
    }
    if (normalized === "print") {
      this.Print();
      return;
    }
    if (this.IsReadOnly && normalized !== "find") return false;
    this.syncSelection();
    const result = this._engine.Execute(name, parameter);
    this.restoreSelection();
    return result;
  }
  /** Import rich HTML at the selection using the serializer's safe allowlist. */
  PasteHTML(html) {
    if (this.IsReadOnly) return;
    const fragment = (0, import_formats.fromHTML)(html);
    this._engine.InsertFragment(fragment.ToJSON().children || []);
    this.restoreSelection();
  }
  Refresh() {
    if (!this._editor || this._composing || this._suspendRender || this._refreshing)
      return;
    this._refreshing = true;
    try {
      const hadFocus = this.shadowRoot?.activeElement === this._editor;
      const scrollTop = this._viewport?.scrollTop || 0;
      const scrollLeft = this._viewport?.scrollLeft || 0;
      const json = this.Document.ToJSON();
      this._virtualWindow = null;
      if (this._enableVirtualization && this.ViewMode === "continuous" && !this._virtualizationSuspended && (json.children?.length || 0) >= this.VirtualizationThreshold) {
        this._virtualizer.Index(
          json,
          (this._editor.clientWidth || this.clientWidth || 794) - 48
        );
        this._virtualWindow = this._virtualizer.Window(
          scrollTop / this.Zoom,
          (this._viewport?.clientHeight || 600) / this.Zoom,
          this.VirtualizationOverscan,
          {
            Start: this.Selection.Start.Offset,
            End: this.Selection.End.Offset
          }
        );
      }
      (0, import_control_renderer.applyEffectiveStyleValues)(
        json,
        this.Document,
        this._virtualWindow || void 0
      );
      this._renderDocument = json;
      this._render = (0, import_control_renderer.reconcileDocumentDOM)(
        this._editor,
        (0, import_control_renderer.renderDocument)(
          json,
          this.ownerDocument,
          this._render?.templates,
          this._virtualWindow || void 0
        )
      );
      (0, import_control_renderer.applyDocumentStyle)(this._editor, json.props || {});
      const props = json.props || {};
      if (Number.isFinite(Number(props.PageWidth)) && Number(props.PageWidth) > 0)
        this._editor.style.setProperty(
          "--rt-page-width",
          `${Number(props.PageWidth)}px`
        );
      if (Number.isFinite(Number(props.PageHeight)) && Number(props.PageHeight) > 0)
        this._editor.style.setProperty(
          "--rt-page-height",
          `${Number(props.PageHeight)}px`
        );
      const padding = (0, import_control_renderer.thicknessCSS)(props.PagePadding);
      if (padding) this._editor.style.setProperty("--rt-page-padding", padding);
      this._editor.dataset.empty = this.Document.Text.length ? "false" : "true";
      this.updateAttributes();
      this._lastDOMHTML = this._editor.innerHTML;
      if (hadFocus) this.restoreSelection();
      if (this._viewport) {
        this._viewport.scrollTop = scrollTop;
        this._viewport.scrollLeft = scrollLeft;
      }
      if (this._virtualWindow) {
        let measured = false;
        for (const element of Array.from(
          this._editor.children
        )) {
          if (!element.dataset.rtId) continue;
          const style = this.ownerDocument.defaultView.getComputedStyle(element);
          measured = this._virtualizer.SetMeasuredHeight(
            element.dataset.rtId,
            element.getBoundingClientRect().height / this.Zoom + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0)
          ) || measured;
        }
        if (measured) this.queueVirtualRefresh();
        this.emit("virtualizationchange", {
          statistics: this.VirtualizationStatistics
        });
      }
      this._objectAdorner?.Refresh();
    } finally {
      this._refreshing = false;
    }
  }
  queueVirtualRefresh() {
    if (!this._enableVirtualization || this._virtualFrame || this._composing || this._virtualizationSuspended || !this.isConnected)
      return;
    this._virtualFrame = this.ownerDocument.defaultView.requestAnimationFrame(
      () => {
        this._virtualFrame = 0;
        this.Refresh();
      }
    );
  }
  materializeNativeEditing() {
    if (!this._virtualWindow) return;
    this._virtualizationSuspended = true;
    this.Refresh();
  }
  get RenderStatistics() {
    return this._render?.statistics || {
      Created: 0,
      Reused: 0,
      Updated: 0,
      Removed: 0
    };
  }
  /** Open a printable browser view. Invoke from a user gesture to allow its window. */
  Print() {
    const view = this.ownerDocument?.defaultView;
    if (!view) throw new Error("Printing requires a browser.");
    const popup = view.open("", "_blank", "popup,width=900,height=900");
    if (!popup)
      throw new Error(
        "The browser blocked the print window. Invoke Print from a user gesture."
      );
    const html = (0, import_formats.toHTML)(this.Document);
    popup.document.open();
    popup.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Print document</title><style>@page{margin:18mm}body{font:12pt/1.5 Georgia,serif;color:#000;background:#fff}p{margin:0 0 .7em}table{width:100%;border-collapse:collapse}td,th{border:1px solid #aeb5bf;padding:6pt}img{max-width:100%}h1,h2,h3{break-after:avoid}tr{break-inside:avoid}</style></head><body>${html}</body></html>`
    );
    popup.document.close();
    popup.opener = null;
    const ready = () => {
      popup.focus();
      popup.print();
    };
    if (popup.document.readyState === "complete") ready();
    else popup.addEventListener("load", ready, { once: true });
  }
  Dispose() {
    this._objectAdorner?.Dispose();
    if (this._virtualFrame)
      this.ownerDocument?.defaultView?.cancelAnimationFrame(this._virtualFrame);
    this.disconnectedCallback();
    for (const subscription of this._subscriptions.splice(0))
      subscription.Dispose();
    this._engine.Dispose();
    this._disposed = true;
  }
  reflectBoolean(name, value) {
    if (typeof this.toggleAttribute === "function")
      this.toggleAttribute(name, value);
  }
  emit(name, detail) {
    if (typeof CustomEvent !== "undefined")
      this.dispatchEvent(
        new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true,
          cancelable: name === "objecteditrequest"
        })
      );
  }
  emitCommandState() {
    this.emit("commandstatechange", {
      canUndo: this.CanUndo,
      canRedo: this.CanRedo,
      isReadOnly: this.IsReadOnly
    });
  }
  updateAttributes() {
    if (!this._editor || !this._viewport) return;
    this._editor.contentEditable = String(!this.IsReadOnly);
    this._editor.setAttribute("aria-readonly", String(this.IsReadOnly));
    this._editor.setAttribute(
      "aria-label",
      this.getAttribute("aria-label") || "Rich text document"
    );
    this._editor.setAttribute(
      "aria-placeholder",
      this.getAttribute("placeholder") || ""
    );
    this._editor.dataset.placeholder = this.getAttribute("placeholder") || "";
    this._editor.spellcheck = this.getAttribute("spellcheck") !== "false";
    this._editor.style.setProperty("--rt-zoom", String(this._zoom));
    this._viewport.classList.toggle(
      "continuous",
      this._viewMode === "continuous"
    );
  }
  nativeSelection() {
    const shadow = this.shadowRoot;
    return shadow?.getSelection?.() || this.ownerDocument?.getSelection() || null;
  }
  nativeRange() {
    const selection = this.nativeSelection();
    if (!selection || !this._editor) return null;
    if (selection.anchorNode && selection.focusNode && this._editor.contains(selection.anchorNode) && this._editor.contains(selection.focusNode)) {
      const range = selection.rangeCount ? selection.getRangeAt(0) : null;
      if (range && this._editor.contains(range.startContainer))
        return {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
          backward: selection.anchorNode === range.endContainer && selection.anchorOffset === range.endOffset && !selection.isCollapsed
        };
      return {
        startContainer: selection.anchorNode,
        startOffset: selection.anchorOffset,
        endContainer: selection.focusNode,
        endOffset: selection.focusOffset
      };
    }
    const composed = selection.getComposedRanges?.({
      shadowRoots: [this.shadowRoot]
    })?.[0];
    if (composed && this._editor.contains(composed.startContainer) && this._editor.contains(composed.endContainer))
      return composed;
    return null;
  }
  offsetFromDOM(node, offset) {
    if (!this._render || !this._editor) return 0;
    const positions = this._render.positions;
    const own = positions.get(node);
    if (node.nodeType === 3 && own)
      return own.start + Math.max(0, Math.min(offset, node.textContent?.length || 0));
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset];
      const position = positions.get(child);
      if (position) return position.start;
    }
    if (offset > 0 && node.childNodes.length) {
      const child = node.childNodes[Math.min(offset, node.childNodes.length) - 1];
      const position = positions.get(child);
      if (position) return position.end;
    }
    if (own) return offset > 0 ? own.end : own.start;
    return node === this._editor && offset > 0 ? this.Document.Text.length : 0;
  }
  syncSelection() {
    if (this._restoringSelection || this._composing || this._suspendRender)
      return;
    if (!this._editor || this.shadowRoot?.activeElement !== this._editor)
      return;
    const range = this.nativeRange();
    if (!range) return;
    this._backwardSelection = Boolean(range.backward);
    const start = this.offsetFromDOM(range.startContainer, range.startOffset);
    const end = this.offsetFromDOM(range.endContainer, range.endOffset);
    if (start !== this.Selection.Start.Offset || end !== this.Selection.End.Offset)
      this._engine.Select(start, end);
  }
  domPoint(offset) {
    if (!this._render || !this._editor) return null;
    const at = Math.max(0, Math.min(offset, this.Document.Text.length));
    const leaf = this._render.leaves.find(
      (item) => !item.atomic && at >= item.start && at <= item.end
    );
    if (leaf) return { node: leaf.node, offset: at - leaf.start };
    const atomic = this._render.leaves.find(
      (item) => item.atomic && at >= item.start && at <= item.end
    );
    if (atomic?.node.parentNode)
      return {
        node: atomic.node.parentNode,
        offset: Array.prototype.indexOf.call(
          atomic.node.parentNode.childNodes,
          atomic.node
        ) + (at > atomic.start ? 1 : 0)
      };
    const paragraph = this._render.paragraphs.find(
      (item) => at >= item.start && at <= item.end
    ) || this._render.paragraphs.find((item) => item.start > at) || this._render.paragraphs.at(-1);
    if (paragraph)
      return {
        node: paragraph.node,
        offset: at <= paragraph.start ? 0 : paragraph.node.childNodes.length
      };
    return { node: this._editor, offset: 0 };
  }
  restoreSelection() {
    if (!this._editor || this._composing || this._suspendRender || this.shadowRoot?.activeElement !== this._editor)
      return;
    if (this._virtualWindow && !this._refreshing) {
      const start2 = this._virtualizer.BlockAtOffset(
        this.Selection.Start.Offset
      )?.Index;
      const end2 = this._virtualizer.BlockAtOffset(
        this.Selection.End.Offset
      )?.Index;
      if (start2 !== void 0 && !this._virtualWindow.Realized.has(start2) || end2 !== void 0 && !this._virtualWindow.Realized.has(end2) || start2 !== void 0 && end2 !== void 0 && Array.from({ length: end2 - start2 + 1 }, (_, i) => start2 + i).some(
        (index) => !this._virtualWindow.Realized.has(index)
      ))
        this.Refresh();
    }
    const selection = this.nativeSelection();
    const start = this.domPoint(this.Selection.Start.Offset), end = this.domPoint(this.Selection.End.Offset);
    if (!selection || !start || !end) return;
    this._restoringSelection = true;
    try {
      if (this._backwardSelection && selection.setBaseAndExtent)
        selection.setBaseAndExtent(
          end.node,
          end.offset,
          start.node,
          start.offset
        );
      else {
        const range = this.ownerDocument.createRange();
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } finally {
      this._restoringSelection = false;
    }
  }
  beforeInput(event) {
    if (this.IsReadOnly) {
      event.preventDefault();
      return;
    }
    if (!event.cancelable && !this._composing) this.materializeNativeEditing();
    if (this._composing || event.isComposing || event.inputType === "insertCompositionText" || !event.cancelable)
      return;
    this.syncSelection();
    let handled = true;
    switch (event.inputType) {
      case "insertText":
      case "insertReplacementText":
        this._engine.InsertText(event.data || "");
        break;
      case "insertParagraph":
        this._engine.InsertParagraph();
        break;
      case "insertLineBreak":
        this._engine.Execute("InsertLineBreak");
        break;
      case "deleteContentBackward":
        this._engine.DeleteBackward();
        break;
      case "deleteContentForward":
        this._engine.DeleteForward();
        break;
      case "deleteWordBackward":
        this.deleteWord(-1);
        break;
      case "deleteWordForward":
        this.deleteWord(1);
        break;
      case "deleteSoftLineBackward":
      case "deleteHardLineBackward":
        this.deleteLine(-1);
        break;
      case "deleteSoftLineForward":
      case "deleteHardLineForward":
        this.deleteLine(1);
        break;
      case "historyUndo":
        this._engine.Undo();
        break;
      case "historyRedo":
        this._engine.Redo();
        break;
      case "formatBold":
        this._engine.ToggleFormat("FontWeight", "Bold", "Normal");
        break;
      case "formatItalic":
        this._engine.ToggleFormat("FontStyle", "Italic", "Normal");
        break;
      case "formatUnderline":
        this._engine.ToggleFormat("TextDecorations", "Underline", "None");
        break;
      case "formatStrikeThrough":
        this._engine.ToggleFormat("TextDecorations", "Strikethrough", "None");
        break;
      case "formatJustifyCenter":
        this._engine.SetParagraphProperty("TextAlignment", "Center");
        break;
      case "formatJustifyLeft":
        this._engine.SetParagraphProperty("TextAlignment", "Left");
        break;
      case "formatJustifyRight":
        this._engine.SetParagraphProperty("TextAlignment", "Right");
        break;
      case "formatJustifyFull":
        this._engine.SetParagraphProperty("TextAlignment", "Justify");
        break;
      case "insertFromPaste":
      case "insertFromDrop": {
        if (event.dataTransfer) this.insertTransfer(event.dataTransfer);
        else handled = false;
        break;
      }
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      this.restoreSelection();
    } else this.materializeNativeEditing();
  }
  deleteWord(direction) {
    let start = this.Selection.Start.Offset, end = this.Selection.End.Offset;
    if (start === end) {
      const text = this.Document.Text;
      if (direction < 0)
        start -= text.slice(0, start).match(/(?:\s+|[^\s]+\s*)$/u)?.[0].length || 0;
      else end += text.slice(end).match(/^(?:\s+|[^\s]+\s*)/u)?.[0].length || 0;
    }
    this._engine.Select(start, end);
    this._engine.InsertText("");
  }
  deleteLine(direction) {
    let start = this.Selection.Start.Offset, end = this.Selection.End.Offset;
    if (start === end) {
      const text = this.Document.Text;
      if (direction < 0)
        start = text.lastIndexOf("\n", Math.max(-1, start - 1)) + 1;
      else {
        const next = text.indexOf("\n", end);
        end = next < 0 ? text.length : next;
      }
    }
    this._engine.Select(start, end);
    this._engine.InsertText("");
  }
  keyDown(event) {
    if (event.isComposing || this._composing) return;
    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (modifier && !event.altKey) {
      if (key === "a") {
        event.preventDefault();
        this.SelectAll();
        return;
      }
      if (this.IsReadOnly) return;
      if (key === "z") {
        event.preventDefault();
        event.shiftKey ? this.Redo() : this.Undo();
        return;
      }
      if (key === "y") {
        event.preventDefault();
        this.Redo();
        return;
      }
      const formats = {
        b: ["FontWeight", "Bold", "Normal"],
        i: ["FontStyle", "Italic", "Normal"],
        u: ["TextDecorations", "Underline", "None"]
      };
      if (!event.shiftKey && formats[key]) {
        event.preventDefault();
        this.syncSelection();
        this._engine.ToggleFormat(...formats[key]);
        this.restoreSelection();
        return;
      }
    }
    if (event.key === "Tab" && this.AcceptsTab && !this.IsReadOnly && !modifier && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      this.syncSelection();
      this._engine.InsertText("	");
      this.restoreSelection();
    }
  }
  copy(event, cut) {
    this.syncSelection();
    if (this.Selection.IsEmpty || !event.clipboardData) return;
    event.preventDefault();
    event.clipboardData.setData("text/plain", this.Selection.Text);
    event.clipboardData.setData(
      "text/html",
      (0, import_formats.toHTML)(this._engine.GetSelectedFragment())
    );
    if (cut && !this.IsReadOnly) {
      this._engine.InsertText("");
      this.restoreSelection();
    }
  }
  paste(event) {
    if (this.IsReadOnly) {
      event.preventDefault();
      return;
    }
    if (!event.clipboardData) return;
    event.preventDefault();
    this.syncSelection();
    this.insertTransfer(event.clipboardData);
  }
  insertTransfer(transfer) {
    const html = transfer.getData("text/html");
    const text = transfer.getData("text/plain");
    if (html) this.PasteHTML(html);
    else if (text) this._engine.InsertText(text);
    this.restoreSelection();
  }
  drop(event) {
    if (this.IsReadOnly || !event.dataTransfer) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const document = this.ownerDocument;
    const position = document.caretPositionFromPoint?.(
      event.clientX,
      event.clientY,
      { shadowRoots: [this.shadowRoot] }
    );
    const range = !position ? document.caretRangeFromPoint?.(event.clientX, event.clientY) : void 0;
    const node = position?.offsetNode || range?.startContainer;
    const offset = position?.offset ?? range?.startOffset ?? 0;
    if (node && this._editor?.contains(node))
      this._engine.Select(
        this.offsetFromDOM(node, offset),
        this.offsetFromDOM(node, offset)
      );
    this.Focus();
    this.insertTransfer(event.dataTransfer);
  }
  /** Native IME, spell-check and browser input fallback commit as one undoable change. */
  reconcileNativeInput() {
    if (!this._editor || this._composing) return;
    if (this._editor.innerHTML === this._lastDOMHTML) {
      this._compositionBase = null;
      if (this._virtualizationSuspended) {
        this._virtualizationSuspended = false;
        this.Refresh();
      }
      return;
    }
    if (this.IsReadOnly) {
      this.Refresh();
      return;
    }
    if (this._virtualWindow) {
      this.emit("nativeinputconflict", {
        reason: "A native input arrived without beforeinput in a virtualized surface; the authoritative document was preserved."
      });
      this.Refresh();
      return;
    }
    const native = this.nativeRange();
    const caret = native ? this.nativeTextOffset(native.endContainer, native.endOffset) : this.Selection.End.Offset;
    const content = this._editor.cloneNode(true);
    const preservedAtoms = this.preserveNativeAtoms(content);
    content.querySelectorAll("[data-rt-placeholder]").forEach((node) => node.remove());
    content.querySelectorAll("p,div,h1,h2,h3,h4,h5,h6,span").forEach((node) => {
      node.style.whiteSpace = "pre-wrap";
    });
    const html = content.innerHTML;
    const compositionBase = this._compositionBase;
    this._compositionBase = null;
    this._suspendRender = true;
    try {
      const replacement = (0, import_formats.fromHTML)(html);
      if (compositionBase !== null && compositionBase !== this.Document.Text) {
        this.emit("compositionconflict", {
          document: this.Document,
          composedText: replacement.Text,
          baseText: compositionBase
        });
      } else if (compositionBase !== null) {
        const next = replacement.Text;
        let prefix = 0, suffix = 0;
        while (prefix < compositionBase.length && prefix < next.length && compositionBase[prefix] === next[prefix])
          prefix++;
        if (prefix > 0 && /[\uD800-\uDBFF]/.test(compositionBase[prefix - 1]) && /[\uDC00-\uDFFF]/.test(compositionBase[prefix] || next[prefix] || ""))
          prefix--;
        while (suffix < compositionBase.length - prefix && suffix < next.length - prefix && compositionBase[compositionBase.length - suffix - 1] === next[next.length - suffix - 1])
          suffix++;
        if (suffix > 0 && /[\uDC00-\uDFFF]/.test(
          compositionBase[compositionBase.length - suffix] || ""
        ) && /[\uD800-\uDBFF]/.test(
          compositionBase[compositionBase.length - suffix - 1] || ""
        ))
          suffix--;
        this._engine.BeginChange();
        try {
          if (next !== compositionBase) {
            this._engine.Select(prefix, compositionBase.length - suffix);
            this._engine.InsertText(next.slice(prefix, next.length - suffix));
          }
          this._engine.Select(
            Math.min(caret, this.Document.Text.length),
            Math.min(caret, this.Document.Text.length)
          );
        } finally {
          this._engine.EndChange();
        }
      } else {
        const node = replacement.ToJSON();
        const restoreAtoms = (current) => {
          if (current.type === "Paragraph" && current.children?.length === 1 && current.children[0].type === "Image") {
            const block = preservedAtoms.get(
              String(current.children[0].props.AlternativeText)
            );
            if (block?.type === "BlockUIContainer")
              return structuredClone(block);
          }
          const original = current.type === "Image" && preservedAtoms.get(String(current.props.AlternativeText));
          if (original) return structuredClone(original);
          if (current.children)
            current.children = current.children.map(restoreAtoms);
          return current;
        };
        restoreAtoms(node);
        node.props = { ...this.Document.ToJSON().props };
        this._engine.ReplaceDocument(import_model.FlowDocument.FromJSON(node));
        this._engine.Select(
          Math.min(caret, this.Document.Text.length),
          Math.min(caret, this.Document.Text.length)
        );
      }
    } finally {
      this._suspendRender = false;
      this._virtualizationSuspended = false;
    }
    this.Refresh();
    this.restoreSelection();
  }
  nativeTextOffset(node, offset) {
    if (!this._editor) return 0;
    const range = this.ownerDocument.createRange();
    range.selectNodeContents(this._editor);
    try {
      range.setEnd(node, offset);
    } catch {
      return this.Selection.End.Offset;
    }
    const wrapper = this.ownerDocument.createElement("div");
    wrapper.append(range.cloneContents());
    this.preserveNativeAtoms(wrapper);
    wrapper.querySelectorAll("[data-rt-placeholder]").forEach((node2) => node2.remove());
    wrapper.querySelectorAll("p,div,h1,h2,h3,h4,h5,h6,span").forEach((node2) => {
      node2.style.whiteSpace = "pre-wrap";
    });
    return (0, import_formats.fromHTML)(wrapper.innerHTML).Text.length;
  }
  preserveNativeAtoms(container) {
    container.querySelectorAll("[data-rt-pagination-spacer]").forEach((node) => node.remove());
    const originals = /* @__PURE__ */ new Map();
    const walk = (node) => {
      originals.set(node.id, node);
      node.children?.forEach(walk);
    };
    walk(this.Document.ToJSON());
    const preserved = /* @__PURE__ */ new Map();
    for (const element of Array.from(
      container.querySelectorAll(
        '[data-rt-type="Equation"],[data-rt-type="Figure"],[data-rt-type="Floater"],[data-rt-type="Image"],[data-rt-type="InlineUIContainer"],[data-rt-type="BlockUIContainer"]'
      )
    )) {
      if (!container.contains(element)) continue;
      const original = originals.get(element.dataset.rtId || "");
      if (!original) continue;
      const key = `rtw-native-object:${original.id}`;
      preserved.set(key, original);
      const placeholder = this.ownerDocument.createElement("img");
      placeholder.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      placeholder.alt = key;
      if (original.type === "BlockUIContainer") {
        const paragraph = this.ownerDocument.createElement("p");
        paragraph.append(placeholder);
        element.replaceWith(paragraph);
      } else element.replaceWith(placeholder);
    }
    return preserved;
  }
}
class FlowDocumentReader extends RichTextBox {
  constructor(viewMode = "page") {
    super({ readOnly: true, viewMode });
  }
  connectedCallback() {
    this.IsReadOnly = true;
    super.connectedCallback();
  }
}
class FlowDocumentScrollViewer extends FlowDocumentReader {
  constructor() {
    super("continuous");
  }
}
class FlowDocumentPageViewer extends FlowDocumentReader {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      "document-view",
      "page-arrangement",
      "zoom-mode"
    ];
  }
  _documentView = "PrintLayout";
  _arrangement = "SinglePage";
  _zoomMode = "Custom";
  _layoutEpoch = 0;
  _measuredEpoch = -1;
  _layoutPasses = 0;
  _cacheHits = 0;
  _lastLayoutDuration = 0;
  _configuredRevision = -1;
  _configuredDocument = null;
  _grid = null;
  _gridKey = "";
  _pageSlots = /* @__PURE__ */ new Map();
  _previews = /* @__PURE__ */ new Map();
  _previewFrame = 0;
  _fittingZoom = false;
  _outlineLevel = 9;
  _fontListener = () => this.InvalidatePagination();
  _pageInput = null;
  _pageNumber = 1;
  _layout = null;
  _settings = (0, import_pagination.pageSettings)({});
  _sheet = null;
  _pageWindow = null;
  _header = null;
  _footer = null;
  _footnotes = null;
  _pageLabel = null;
  _previousButton = null;
  _nextButton = null;
  _layoutPending = null;
  _resizeObserver = null;
  _pageDisposed = false;
  _paginationDocument = null;
  _elementsById = /* @__PURE__ */ new Map();
  _pageNoteBlocks = /* @__PURE__ */ new Map();
  constructor() {
    super("page");
    if (!this._editor || !this._viewport || !this.shadowRoot) return;
    const owner = this.ownerDocument;
    const style = owner.createElement("style");
    style.textContent = `:host{display:flex;flex-direction:column;overflow:hidden}.viewport{flex:1;min-height:0;height:auto}.rt-page-sheet{position:relative;flex:none;box-sizing:border-box;margin:0 auto;background:var(--rt-paper);color:var(--rt-ink);border:0;outline:1px solid var(--rt-border);box-shadow:0 2px 14px #17233a13;overflow:hidden}.rt-page-window{position:relative;overflow:hidden}.surface.rt-page-flow{box-sizing:content-box!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;zoom:1!important;overflow:visible!important;column-fill:auto;widows:2;orphans:2;outline:none!important}.surface.rt-page-flow p{widows:2;orphans:2}.surface.rt-page-flow tr{break-inside:avoid-column}.rt-page-nav{display:flex;align-items:center;justify-content:center;gap:16px;padding:10px;background:var(--rt-workspace);border-bottom:1px solid var(--rt-border);font:13px Segoe UI,system-ui,sans-serif}.rt-page-nav button{font:inherit;padding:5px 12px;border:1px solid var(--rt-border);border-radius:5px;background:var(--rt-paper);color:var(--rt-ink);cursor:pointer}.rt-page-nav button:disabled{opacity:.45;cursor:default}.rt-page-nav button:focus-visible{outline:2px solid var(--rt-accent)}.rt-page-story.surface{position:absolute;box-sizing:border-box;min-height:0!important;max-height:none;padding:0!important;margin:0!important;border:0!important;box-shadow:none!important;zoom:1!important;overflow:hidden;font-size:12px;line-height:1.4}.rt-page-story p{margin:0 0 .35em;min-height:0}.rt-page-notes{border-top:1px solid var(--rt-border)!important;padding-top:6px!important}.rt-page-story a{cursor:pointer}@media print{.rt-page-nav{display:none}.rt-page-sheet{width:auto!important;height:auto!important;overflow:visible;zoom:1!important;border:0;box-shadow:none}.rt-page-window{width:auto!important;height:auto!important;overflow:visible}.surface.rt-page-flow{height:auto!important;width:auto!important;column-width:auto!important;columns:auto!important;transform:none!important}.rt-page-story{display:none!important}}`;
    this.shadowRoot.append(style);
    const nav = owner.createElement("div");
    nav.className = "rt-page-nav";
    nav.setAttribute("part", "page-navigation");
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "Document pages");
    this._previousButton = owner.createElement("button");
    this._previousButton.type = "button";
    this._previousButton.textContent = "Previous";
    this._previousButton.setAttribute("aria-label", "Previous page");
    this._previousButton.onclick = () => this.PreviousPage();
    this._nextButton = owner.createElement("button");
    this._nextButton.type = "button";
    this._nextButton.textContent = "Next";
    this._nextButton.setAttribute("aria-label", "Next page");
    this._nextButton.onclick = () => this.NextPage();
    this._pageLabel = owner.createElement("span");
    this._pageLabel.setAttribute("aria-live", "polite");
    this._pageInput = owner.createElement("input");
    this._pageInput.type = "number";
    this._pageInput.min = "1";
    this._pageInput.step = "1";
    this._pageInput.value = "1";
    this._pageInput.setAttribute("part", "page-number");
    this._pageInput.setAttribute("aria-label", "Go to page");
    this._pageInput.style.cssText = "width:58px;min-width:0;font:inherit;color:inherit;background:var(--rt-paper);border:1px solid var(--rt-border);border-radius:4px;padding:5px";
    const navigate = () => {
      this.GoToPage(Number(this._pageInput.value));
      this._pageInput.value = String(this.PageNumber);
    };
    this._pageInput.onchange = navigate;
    this._pageInput.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        navigate();
      }
      if (event.key === "Escape")
        this._pageInput.value = String(this.PageNumber);
    };
    nav.style.flexWrap = "wrap";
    nav.append(
      this._previousButton,
      this._pageLabel,
      this._pageInput,
      this._nextButton
    );
    this.shadowRoot.insertBefore(nav, this._viewport);
    this._sheet = owner.createElement("div");
    this._sheet.className = "rt-page-sheet";
    this._sheet.setAttribute("part", "page");
    this._pageWindow = owner.createElement("div");
    this._pageWindow.className = "rt-page-window";
    this._header = owner.createElement("div");
    this._header.className = "surface rt-page-story";
    this._header.setAttribute("part", "page-header");
    this._footer = owner.createElement("div");
    this._footer.className = "surface rt-page-story";
    this._footer.setAttribute("part", "page-footer");
    this._footnotes = owner.createElement("div");
    this._footnotes.className = "surface rt-page-story rt-page-notes";
    this._footnotes.setAttribute("part", "page-footnotes");
    this._pageWindow.append(this._editor);
    this._sheet.append(
      this._header,
      this._pageWindow,
      this._footnotes,
      this._footer
    );
    this._viewport.append(this._sheet);
    for (const [element, kind] of [
      [this._header, "Header"],
      [this._footer, "Footer"]
    ]) {
      element?.addEventListener("dblclick", (event) => {
        if (this.IsReadOnly) return;
        event.preventDefault();
        this.dispatchEvent(
          new CustomEvent("storyeditrequest", {
            detail: {
              kind: (0, import_page_setup.pageStoryKey)(
                this._paginationDocument?.props || {},
                kind,
                this.PageNumber
              ),
              pageNumber: this.PageNumber
            },
            bubbles: true,
            composed: true,
            cancelable: true
          })
        );
      });
    }
    const viewsStyle = owner.createElement("style");
    viewsStyle.textContent = `.rt-page-grid{display:grid;gap:24px;justify-content:center;align-items:start;min-width:100%;width:max-content}.rt-page-slot{position:relative;flex:none;outline:1px dashed var(--rt-border);background:color-mix(in srgb,var(--rt-paper) 50%,transparent)}.rt-page-slot>.rt-page-sheet{margin:0}.rt-page-slot-label{position:absolute;bottom:-21px;left:0;right:0;text-align:center;font:11px/18px system-ui;color:var(--rt-ink);opacity:.65;pointer-events:none}.rt-page-preview{cursor:text}.rt-page-preview *{pointer-events:none!important;user-select:none!important}.rt-page-preview:focus-visible{outline:2px solid var(--rt-accent)}:host([document-view=ReadMode]) .viewport{padding:32px;background:color-mix(in srgb,var(--rt-workspace) 60%,var(--rt-paper))}:host([document-view=Draft]) .surface{font-family:ui-monospace,monospace!important;line-height:1.7!important;max-width:none;box-shadow:none}:host([document-view=Draft]) .surface p{border-bottom:1px dotted var(--rt-border)}:host([document-view=Outline]) .surface{font-family:system-ui!important;max-width:100%;padding:22px}:host([document-view=Outline]) [data-rt-paragraph]{padding-inline-start:18px;position:relative}:host([document-view=Outline]) [data-rt-paragraph]::before{content:"\xB7";position:absolute;inset-inline-start:0;color:var(--rt-accent)}:host([document-view=Outline]) [data-outline-heading]::before{content:"+";font-weight:bold}:host([document-view=Outline]) [data-outline-hidden]{display:none!important}.rt-page-flow [data-rt-pagination-spacer]{margin:0!important;padding:0!important;border:0!important;pointer-events:none!important;font-size:0!important;line-height:0!important;visibility:hidden;user-select:none}`;
    this.shadowRoot.append(viewsStyle);
    this._viewport.addEventListener("scroll", () => this.queuePagePreviews(), {
      passive: true
    });
    this._editor.addEventListener(
      "load",
      () => this.InvalidatePagination(),
      true
    );
    this._editor.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !this.IsReadOnly) {
        event.preventDefault();
        event.shiftKey ? this.Engine.InsertColumnBreak() : this.Engine.InsertPageBreak();
        return;
      }
      if (this.ViewMode === "page" && (event.key === "PageDown" || event.key === "PageUp")) {
        event.preventDefault();
        event.key === "PageDown" ? this.NextPage() : this.PreviousPage();
      }
    });
  }
  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined" && !this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        this.applyZoomMode();
        this.updatePageArrangement();
        this.queuePagination();
      });
      this._resizeObserver.observe(this);
    }
    this.ownerDocument.fonts?.addEventListener(
      "loadingdone",
      this._fontListener
    );
    this.queuePagination();
  }
  disconnectedCallback() {
    this.ownerDocument?.fonts?.removeEventListener(
      "loadingdone",
      this._fontListener
    );
    if (this._previewFrame)
      this.ownerDocument.defaultView?.cancelAnimationFrame(this._previewFrame);
    this._previewFrame = 0;
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    super.disconnectedCallback();
  }
  Refresh() {
    this._editor?.querySelectorAll("[data-rt-pagination-spacer]").forEach((node) => node.remove());
    super.Refresh();
    this._configuredRevision = -1;
    this._layoutEpoch = (this._layoutEpoch || 0) + 1;
    this._previews?.clear();
    this._pageSlots?.forEach(
      (slot) => slot.querySelector(".rt-page-preview")?.remove()
    );
    this.configurePagination();
    this.configureOutline();
    if (this._editor) this._lastDOMHTML = this._editor.innerHTML;
    this.queuePagination();
  }
  /** Invalidate font/image geometry without rebuilding the model or edit history. */
  InvalidatePagination() {
    this._layoutEpoch++;
    this._previews.clear();
    this._pageSlots.forEach(
      (slot) => slot.querySelector(".rt-page-preview")?.remove()
    );
    this.queuePagination();
  }
  get PaginationStatistics() {
    return {
      LayoutPasses: this._layoutPasses,
      CacheHits: this._cacheHits,
      LastDurationMs: this._lastLayoutDuration,
      Revision: this._layout?.Revision ?? -1,
      RealizedPagePreviews: this._previews.size,
      RealizedPageSlots: this._pageSlots.size,
      TotalPages: this.PageCount
    };
  }
  get DocumentView() {
    return this._documentView;
  }
  set DocumentView(value) {
    if (!["PrintLayout", "WebLayout", "ReadMode", "Outline", "Draft"].includes(
      value
    ))
      throw new TypeError("Unknown document view mode.");
    const changed = value !== this._documentView;
    this._documentView = value;
    this.setPresentationReadOnly(value === "ReadMode");
    if (this.getAttribute("document-view") !== value)
      this.setAttribute("document-view", value);
    const mode = value === "PrintLayout" || value === "ReadMode" ? "page" : "continuous";
    if (this.ViewMode !== mode) this.ViewMode = mode;
    else if (changed) {
      this.configureOutline();
      this.configurePagination();
    }
    this.emit("viewchange", {
      documentView: value,
      pageArrangement: this.PageArrangement,
      zoomMode: this.ZoomMode
    });
  }
  get PageArrangement() {
    return this._arrangement;
  }
  set PageArrangement(value) {
    if (!["SinglePage", "TwoPages", "Vertical", "MultiplePages"].includes(value))
      throw new TypeError("Unknown page arrangement.");
    this._arrangement = value;
    if (this.getAttribute("page-arrangement") !== value)
      this.setAttribute("page-arrangement", value);
    this.updatePageArrangement();
    this.emit("viewchange", {
      documentView: this.DocumentView,
      pageArrangement: value,
      zoomMode: this.ZoomMode
    });
  }
  get ZoomMode() {
    return this._zoomMode;
  }
  set ZoomMode(value) {
    if (!["Custom", "PageWidth", "WholePage", "TwoPages"].includes(value))
      throw new TypeError("Unknown zoom mode.");
    this._zoomMode = value;
    if (this.getAttribute("zoom-mode") !== value)
      this.setAttribute("zoom-mode", value);
    this.applyZoomMode();
  }
  get OutlineLevel() {
    return this._outlineLevel;
  }
  set OutlineLevel(value) {
    if (!Number.isInteger(value) || value < 1 || value > 9)
      throw new RangeError(
        "OutlineLevel must be between 1 and 9; 9 includes body text."
      );
    this._outlineLevel = value;
    this.configureOutline();
  }
  configureOutline() {
    if (!this._editor) return;
    this._editor.querySelectorAll("[data-rt-paragraph]").forEach((element) => {
      const level = Number(
        element.dataset.rtHeading || element.tagName.match(/^H([1-6])$/)?.[1]
      ) || 9;
      element.toggleAttribute("data-outline-heading", level < 9);
      element.toggleAttribute(
        "data-outline-hidden",
        this.DocumentView === "Outline" && level > this._outlineLevel
      );
    });
  }
  applyZoomMode() {
    if (!this._viewport || !this._sheet || this.ViewMode !== "page" || this._fittingZoom || this.ZoomMode === "Custom")
      return;
    const style = this.ownerDocument.defaultView.getComputedStyle(
      this._viewport
    );
    const width = this._viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = this._viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (width < 1 || height < 1) return;
    const zoom = this.ZoomMode === "TwoPages" ? Math.min(
      (width - 24) / (2 * this._settings.PageWidth),
      height / this._settings.PageHeight
    ) : this.ZoomMode === "WholePage" ? Math.min(
      width / this._settings.PageWidth,
      height / this._settings.PageHeight
    ) : width / this._settings.PageWidth;
    this._fittingZoom = true;
    try {
      if (Math.abs(this.Zoom - Math.max(0.25, Math.min(4, zoom))) > 1e-3)
        this.Zoom = zoom;
    } finally {
      this._fittingZoom = false;
    }
  }
  attributeChangedCallback(name, oldValue, value) {
    super.attributeChangedCallback(name, oldValue, value);
    if (oldValue === value) return;
    if (name === "document-view" && value && value !== this.DocumentView)
      this.DocumentView = value;
    if (name === "page-arrangement" && value && value !== this.PageArrangement)
      this.PageArrangement = value;
    if (name === "zoom-mode" && value && value !== this.ZoomMode)
      this.ZoomMode = value;
    if (name === "zoom") {
      if (!this._fittingZoom) {
        this._zoomMode = "Custom";
        if (this.getAttribute("zoom-mode") !== "Custom")
          this.setAttribute("zoom-mode", "Custom");
      }
      if (this._sheet) this._sheet.style.zoom = String(this.Zoom);
      this._gridKey = "";
      this.updatePageArrangement();
    }
    if (name === "view-mode" && this.isConnected) {
      if (value === "continuous" && ["PrintLayout", "ReadMode"].includes(this.DocumentView))
        this.DocumentView = "WebLayout";
      if (value === "page" && !["PrintLayout", "ReadMode"].includes(this.DocumentView))
        this.DocumentView = "PrintLayout";
      this.Refresh();
    }
  }
  get PageCount() {
    return this._layout?.PageCount || 1;
  }
  get PageNumber() {
    return this._pageNumber;
  }
  set PageNumber(value) {
    if (!Number.isInteger(value) || value < 1 || value > this.PageCount)
      throw new RangeError("PageNumber is outside the measured page range.");
    this.GoToPage(value);
  }
  get CanGoToNextPage() {
    return this._pageNumber < this.PageCount;
  }
  get CanGoToPreviousPage() {
    return this._pageNumber > 1;
  }
  /** Locate a measured page without scanning all preceding pages. */
  GetPageAtOffset(offset, backward = false) {
    return this._layout ? (0, import_page_window.pageAtOffset)(this._layout, offset, backward) : null;
  }
  get LayoutResult() {
    return this._layout;
  }
  NextPage() {
    return this.GoToPage(this.PageNumber + 1);
  }
  PreviousPage() {
    return this.GoToPage(this.PageNumber - 1);
  }
  FirstPage() {
    return this.GoToPage(1);
  }
  LastPage() {
    return this.GoToPage(this.PageCount);
  }
  GoToPage(number) {
    if (!Number.isInteger(number) || number < 1 || number > this.PageCount)
      return false;
    const changed = number !== this._pageNumber;
    this._pageNumber = number;
    this.updatePageView();
    if (changed && this._viewport && this._grid) {
      const slot = this._pageSlots.get(number);
      if (slot) {
        const top = slot.offsetTop + this._grid.offsetTop;
        if (top < this._viewport.scrollTop || top + Math.min(slot.offsetHeight, this._viewport.clientHeight) > this._viewport.scrollTop + this._viewport.clientHeight)
          this._viewport.scrollTop = top;
      }
    }
    if (changed)
      this.emit("pagechange", {
        pageNumber: number,
        pageCount: this.PageCount,
        page: this._layout?.Pages[number - 1]
      });
    return true;
  }
  Execute(command, parameter) {
    switch (command.replace(/[\s_-]/g, "").toLowerCase()) {
      case "documentview":
      case "viewmode":
        return this.DocumentView = parameter;
      case "pagearrangement":
        return this.PageArrangement = parameter;
      case "zoommode":
        return this.ZoomMode = parameter;
      case "outlinelevel":
        return this.OutlineLevel = Number(parameter);
      case "nextpage":
        return this.NextPage();
      case "previouspage":
        return this.PreviousPage();
      case "firstpage":
        return this.FirstPage();
      case "lastpage":
        return this.LastPage();
      case "gotopage":
        return this.GoToPage(Number(parameter));
      default:
        return super.Execute(command, parameter);
    }
  }
  /** Measure only after document/geometry changes; caret, page and zoom navigation reuse the layout. */
  Repaginate() {
    if (this.ViewMode === "continuous")
      return Promise.reject(
        new Error("Screen pagination requires page view mode.")
      );
    if (this._layoutPending) return this._layoutPending;
    if (this._layout && this._measuredEpoch === this._layoutEpoch && this._layout.Revision === this.Document.Revision) {
      this._cacheHits++;
      return Promise.resolve(this._layout);
    }
    if (!this.isConnected || !this._editor || !this._render || !this.ownerDocument?.defaultView)
      return Promise.reject(
        new Error("Screen pagination requires a connected browser document.")
      );
    this._layoutPending = (async () => {
      await this.ownerDocument.fonts?.ready;
      await new Promise(
        (resolve) => this.ownerDocument.defaultView.requestAnimationFrame(() => resolve())
      );
      if (this._pageDisposed) throw new Error("Page viewer is disposed.");
      if (this.ViewMode !== "page")
        throw new Error("Screen pagination requires page view mode.");
      this.configurePagination();
      if (!this.isConnected || this._editor.getBoundingClientRect().width < 1)
        throw new Error("Screen pagination requires a visible layout surface.");
      const started = performance.now(), epoch = this._layoutEpoch;
      this.alignPhysicalPageBreaks();
      this._layout = (0, import_pagination.measurePageLayout)(
        this._editor,
        this._render,
        this._paginationDocument,
        this.Document.Revision,
        this._settings
      );
      this._pageNumber = Math.min(this._pageNumber, this._layout.PageCount);
      this.indexPageNotes();
      this._measuredEpoch = epoch;
      this._layoutPasses++;
      this.updatePageView();
      this.applyZoomMode();
      this.updatePageArrangement();
      this._lastLayoutDuration = performance.now() - started;
      this.emit("paginated", { layout: this._layout });
      return this._layout;
    })().finally(() => {
      this._layoutPending = null;
    });
    return this._layoutPending;
  }
  alignPhysicalPageBreaks() {
    if (!this._editor || !this._paginationDocument) return;
    this._editor.querySelectorAll("[data-rt-pagination-spacer]").forEach((node) => node.remove());
    const s = this._settings;
    if (s.ColumnCount > 1) {
      const pageBreaks = [];
      const walk = (node) => {
        if (node.props.BreakPageBefore) pageBreaks.push(node);
        node.children?.forEach(walk);
      };
      walk(this._paginationDocument);
      for (const node of pageBreaks) {
        const element = this._elementsById.get(node.id);
        if (!element || !element.parentElement || !element.getClientRects().length)
          continue;
        const bounds = this._editor.getBoundingClientRect(), scale = bounds.width / s.ContentWidth || 1;
        const rtl = this.ownerDocument.defaultView.getComputedStyle(this._editor).direction === "rtl";
        const rect = element.getClientRects()[0];
        const offset = rtl ? bounds.right - rect.right : rect.left - bounds.left;
        const column = Math.max(
          0,
          Math.floor(
            (offset / scale + 0.5) / (s.TextColumnWidth + s.ColumnGap)
          )
        );
        const missing = (s.ColumnCount - column % s.ColumnCount) % s.ColumnCount;
        for (let index = 0; index < missing; index++) {
          const spacer = this.ownerDocument.createElement("div");
          spacer.dataset.rtPaginationSpacer = "";
          spacer.contentEditable = "false";
          spacer.setAttribute("aria-hidden", "true");
          spacer.style.cssText = `height:${s.ContentHeight}px;break-before:column;break-after:column;break-inside:avoid-column;`;
          element.parentElement.insertBefore(spacer, element);
        }
      }
    }
    this._lastDOMHTML = this._editor.innerHTML;
  }
  Dispose() {
    this._pageDisposed = true;
    super.Dispose();
  }
  queuePagination() {
    if (this._pageDisposed || !this.isConnected || !this._editor || !this._render || this.ViewMode === "continuous")
      return;
    void this.Repaginate().catch((error) => {
      if (!this._pageDisposed) this.emit("paginationerror", { error });
    });
  }
  configurePagination() {
    if (!this._editor || !this._sheet || !this._pageWindow) return;
    if (this.ViewMode === "continuous") {
      this._sheet.style.display = "contents";
      this._pageWindow.style.display = "contents";
      this._editor.classList.remove("rt-page-flow");
      for (const property of [
        "height",
        "width",
        "column-width",
        "column-count",
        "column-gap",
        "column-fill",
        "transform"
      ])
        this._editor.style.removeProperty(property);
      this._editor.querySelectorAll("[data-rt-pagination-spacer]").forEach((node) => node.remove());
      this._sheet.style.zoom = "1";
      this.moveLiveSheet(this._viewport);
      this._grid?.remove();
      this._grid = null;
      this._gridKey = "";
      this._pageSlots.clear();
      this._previews.clear();
      this._viewport?.classList.add("continuous");
      for (const element of [
        this._header,
        this._footer,
        this._footnotes,
        this.shadowRoot?.querySelector(".rt-page-nav")
      ])
        if (element) element.style.display = "none";
      return;
    }
    this._sheet.style.display = "";
    this._pageWindow.style.display = "";
    const nav = this.shadowRoot?.querySelector(".rt-page-nav");
    if (nav) nav.style.display = "flex";
    const unchanged = this._configuredDocument === this.Document && this._configuredRevision === this.Document.Revision;
    const json = unchanged && this._paginationDocument ? this._paginationDocument : this._renderDocument ?? this.Document.ToJSON();
    if (!unchanged)
      (0, import_control_renderer.applyEffectiveStyleValues)(json, this.Document, void 0, false);
    this._paginationDocument = json;
    this._configuredDocument = this.Document;
    this._configuredRevision = this.Document.Revision;
    this._settings = (0, import_pagination.pageSettings)(json.props || {});
    const s = this._settings, paper = this._sheet.style, flow = this._editor.style;
    this._viewport?.classList.remove("continuous");
    this._editor.classList.add("rt-page-flow");
    paper.width = `${s.PageWidth}px`;
    paper.height = `${s.PageHeight}px`;
    paper.padding = `${s.Padding.Top}px ${s.Padding.Right}px ${s.Padding.Bottom}px ${s.Padding.Left}px`;
    paper.zoom = String(this.Zoom);
    this._pageWindow.style.width = `${s.ContentWidth}px`;
    this._pageWindow.style.height = `${s.ContentHeight}px`;
    flow.width = `${s.ContentWidth}px`;
    flow.height = `${s.ContentHeight}px`;
    flow.columnWidth = `${s.TextColumnWidth}px`;
    flow.columnGap = `${s.ColumnGap}px`;
    flow.columnCount = String(s.ColumnCount);
    flow.columnFill = "auto";
    if (unchanged && this._elementsById.size) {
      this.updatePageView();
      return;
    }
    const model = /* @__PURE__ */ new Map();
    const visit = (node) => {
      model.set(node.id, node);
      node.children?.forEach(visit);
    };
    visit(json);
    this._elementsById = /* @__PURE__ */ new Map();
    this._editor.querySelectorAll("[data-rt-id]").forEach((element) => {
      this._elementsById.set(element.dataset.rtId, element);
      const props = model.get(element.dataset.rtId)?.props || {};
      if (props.BreakPageBefore || props.BreakColumnBefore || element.style.breakBefore === "page")
        element.style.breakBefore = "column";
      if (props.KeepTogether || element.style.breakInside === "avoid")
        element.style.breakInside = "avoid-column";
      if (props.KeepWithNext || element.style.breakAfter === "avoid")
        element.style.breakAfter = "avoid-column";
    });
    this.updatePageView();
  }
  updatePageView() {
    if (!this._editor || !this._sheet) return;
    if (this.ViewMode === "continuous") return;
    const s = this._settings;
    const rtl = this.ownerDocument.defaultView?.getComputedStyle(this._editor).direction === "rtl";
    this._editor.style.transform = `translateX(${(rtl ? 1 : -1) * (this._pageNumber - 1) * (s.ContentWidth + s.ColumnGap)}px)`;
    this._sheet.setAttribute(
      "aria-label",
      `Page ${this.PageNumber} of ${this.PageCount}`
    );
    if (this._pageLabel)
      this._pageLabel.textContent = `Page ${this.PageNumber} of ${this.PageCount}`;
    if (this._pageInput) {
      this._pageInput.max = String(this.PageCount);
      if (this.shadowRoot?.activeElement !== this._pageInput)
        this._pageInput.value = String(this.PageNumber);
    }
    if (this._previousButton)
      this._previousButton.disabled = !this.CanGoToPreviousPage;
    if (this._nextButton) this._nextButton.disabled = !this.CanGoToNextPage;
    this.renderStories();
    this.updatePageArrangement();
    this._objectAdorner?.Refresh();
  }
  moveLiveSheet(parent) {
    if (!this._sheet || this._sheet.parentElement === parent) return;
    const focused = this.shadowRoot?.activeElement === this._editor;
    if (this._sheet.isConnected && parent.isConnected && typeof parent.moveBefore === "function")
      parent.moveBefore(this._sheet, null);
    else parent.append(this._sheet);
    if (focused && this._editor) {
      this._editor.focus({ preventScroll: true });
      this.restoreSelection();
    }
  }
  arrangementColumns() {
    if (this.PageArrangement === "TwoPages") return 2;
    if (this.PageArrangement !== "MultiplePages" || !this._viewport) return 1;
    return Math.max(
      1,
      Math.min(
        4,
        Math.floor(
          (this._viewport.clientWidth - 32) / (this._settings.PageWidth * this.Zoom + 24)
        )
      )
    );
  }
  updatePageArrangement() {
    if (!this._viewport || !this._sheet || this.ViewMode !== "page") return;
    if (this.PageArrangement === "SinglePage") {
      this.moveLiveSheet(this._viewport);
      this._grid?.remove();
      this._grid = null;
      this._gridKey = "";
      this._pageSlots.clear();
      this._previews.clear();
      return;
    }
    const cols = this.arrangementColumns(), start = this.PageArrangement === "TwoPages" ? Math.floor((this.PageNumber - 1) / 2) * 2 + 1 : 1;
    const end = this.PageArrangement === "TwoPages" ? Math.min(this.PageCount, start + 1) : this.PageCount;
    const width = this._settings.PageWidth * this.Zoom, height = this._settings.PageHeight * this.Zoom;
    const key = `${this.PageArrangement}:${start}:${end}:${width}:${height}:${cols}`;
    if (this._gridKey !== key) {
      this.moveLiveSheet(this._viewport);
      this._grid?.remove();
      this._grid = this.ownerDocument.createElement("div");
      this._grid.className = "rt-page-grid";
      this._grid.setAttribute("part", "pages");
      this._grid.style.cssText = `display:block;position:relative;min-width:0;margin:0 auto;width:${Math.min(cols, end - start + 1) * (width + 24) - 24}px;height:${Math.ceil((end - start + 1) / cols) * (height + 24) - 24}px`;
      this._viewport.append(this._grid);
      this._pageSlots.clear();
      this._previews.clear();
      this._gridKey = key;
    }
    this.syncPageSlots(this.wantedPagePreviews());
    this.queuePagePreviews();
  }
  wantedPagePreviews() {
    if (!this._viewport || !this._grid) return [];
    if (this.PageArrangement === "TwoPages") {
      const first = Math.floor((this.PageNumber - 1) / 2) * 2 + 1;
      return first < this.PageCount ? [first, first + 1] : [first];
    }
    return (0, import_page_window.pagePreviewWindow)({
      PageCount: this.PageCount,
      Columns: this.arrangementColumns(),
      PageHeight: this._settings.PageHeight * this.Zoom,
      ScrollTop: this._viewport.getBoundingClientRect().top - this._grid.getBoundingClientRect().top,
      ViewportHeight: this._viewport.clientHeight
    });
  }
  /** Bound the placeholder DOM as well as previews; the live selection-bearing sheet stays pinned. */
  syncPageSlots(wanted) {
    if (!this._grid || !this._viewport || !this._sheet) return;
    const retained = /* @__PURE__ */ new Set([...wanted, this.PageNumber]);
    const columns = this.arrangementColumns();
    const start = this.PageArrangement === "TwoPages" ? Math.floor((this.PageNumber - 1) / 2) * 2 + 1 : 1;
    const width = this._settings.PageWidth * this.Zoom, height = this._settings.PageHeight * this.Zoom;
    for (const number of retained) {
      if (this._pageSlots.has(number)) continue;
      const slot = this.ownerDocument.createElement("div");
      slot.className = "rt-page-slot";
      slot.dataset.page = String(number);
      const index = number - start;
      slot.style.cssText = `position:absolute;left:${index % columns * (width + 24)}px;top:${Math.floor(index / columns) * (height + 24)}px;width:${width}px;height:${height}px`;
      const label = this.ownerDocument.createElement("div");
      label.className = "rt-page-slot-label";
      label.textContent = `Page ${number}`;
      slot.append(label);
      this._grid.append(slot);
      this._pageSlots.set(number, slot);
    }
    const live = this._pageSlots.get(this.PageNumber);
    this._previews.get(this.PageNumber)?.remove();
    this._previews.delete(this.PageNumber);
    this.moveLiveSheet(live);
    for (const [number, slot] of this._pageSlots) {
      if (retained.has(number)) continue;
      slot.remove();
      this._pageSlots.delete(number);
      this._previews.delete(number);
    }
  }
  queuePagePreviews() {
    if (this._previewFrame || !this._grid || !this.isConnected || this.ViewMode !== "page" || this._pageDisposed)
      return;
    this._previewFrame = this.ownerDocument.defaultView.requestAnimationFrame(
      () => {
        this._previewFrame = 0;
        if (!this.isConnected || !this._grid || !this._layout || this._measuredEpoch !== this._layoutEpoch)
          return;
        this.renderVisiblePagePreviews();
      }
    );
  }
  renderVisiblePagePreviews() {
    if (!this._viewport || !this._grid) return;
    const wanted = this.wantedPagePreviews();
    this.syncPageSlots(wanted);
    for (const [page, preview] of this._previews)
      if (!wanted.includes(page) || page === this.PageNumber) {
        preview.remove();
        this._previews.delete(page);
      }
    for (const page of wanted) {
      if (page === this.PageNumber || this._previews.has(page)) continue;
      const slot = this._pageSlots.get(page);
      if (!slot) continue;
      const preview = this.snapshotPage(page);
      preview.classList.add("rt-page-preview");
      preview.setAttribute("role", "button");
      preview.tabIndex = 0;
      preview.setAttribute(
        "aria-label",
        `Activate page ${page} of ${this.PageCount}`
      );
      for (const child of Array.from(preview.children))
        child.setAttribute("aria-hidden", "true");
      preview.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const anchor = this.Selection.Start.Offset;
        this.GoToPage(page);
        const nativeDocument = this.ownerDocument;
        const point = nativeDocument.caretPositionFromPoint?.(
          event.clientX,
          event.clientY,
          { shadowRoots: [this.shadowRoot] }
        );
        const range = !point && nativeDocument.caretRangeFromPoint?.(event.clientX, event.clientY);
        const node = point?.offsetNode ?? range?.startContainer, offset = point?.offset ?? range?.startOffset;
        if (node && this._editor?.contains(node)) {
          const at = this.offsetFromDOM(node, offset);
          this.Select(event.shiftKey ? anchor : at, at);
        }
        this.Focus();
      });
      preview.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.GoToPage(page);
          this.Focus();
        }
      });
      slot.prepend(preview);
      this._previews.set(page, preview);
    }
  }
  snapshotPage(number) {
    if (!this._sheet || !this._editor)
      throw new Error("The page surface is unavailable.");
    const current = this._pageNumber;
    this._pageNumber = number;
    this.renderStories();
    const clone = this._sheet.cloneNode(true);
    this._pageNumber = current;
    this.renderStories();
    const flow = clone.querySelector(".rt-page-flow");
    const rtl = this.ownerDocument.defaultView.getComputedStyle(this._editor).direction === "rtl";
    if (flow)
      flow.style.transform = `translateX(${(rtl ? 1 : -1) * (number - 1) * (this._settings.ContentWidth + this._settings.ColumnGap)}px)`;
    clone.setAttribute("aria-label", `Page ${number} of ${this.PageCount}`);
    clone.querySelectorAll("[part],[contenteditable],[tabindex],[id]").forEach((element) => {
      element.removeAttribute("part");
      element.removeAttribute("tabindex");
      element.removeAttribute("id");
      if (element.hasAttribute("contenteditable"))
        element.contentEditable = "false";
    });
    clone.querySelectorAll("[data-rt-id]").forEach((element) => element.removeAttribute("data-rt-id"));
    clone.querySelectorAll(".rt-object-adorner").forEach((element) => element.remove());
    clone.removeAttribute("part");
    return clone;
  }
  /** Return actual measured page sheets, including stories, columns and vector equations. */
  async GetPrintHTML(options = {}) {
    if (this.ViewMode !== "page") {
      const viewer = this.ownerDocument.createElement(
        "flow-document-page-viewer"
      );
      viewer.Document = import_model.FlowDocument.FromJSON(this.Document.ToJSON());
      viewer.style.cssText = "position:fixed;left:-40000px;top:0;width:1200px;height:1400px";
      viewer.setAttribute("theme", "light");
      this.ownerDocument.body.append(viewer);
      try {
        return await viewer.GetPrintHTML(options);
      } finally {
        viewer.Dispose();
        viewer.remove();
      }
    }
    const layout = await this.Repaginate();
    const first = options.StartPage ?? 1, last = options.EndPage ?? layout.PageCount;
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > layout.PageCount || first > last)
      throw new RangeError("Invalid print page range.");
    const sheets = [];
    let bytes = 0;
    for (let page = first; page <= last; page++) {
      const sheet = this.snapshotPage(page);
      sheet.style.zoom = "1";
      const html = sheet.outerHTML;
      bytes += html.length;
      if (bytes > 128 * 1024 * 1024)
        throw new RangeError(
          "This print job exceeds the 128 MiB page-markup budget. Print a smaller page range."
        );
      sheets.push(html);
    }
    const styles = Array.from(this.shadowRoot.querySelectorAll("style")).map((style) => style.textContent).join("\n");
    const s = this._settings, title = String(
      options.Title ?? this.Document.GetValue("Title") ?? "Print document"
    ).replace(
      /[<>&"']/g,
      (c) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;"
      })[c]
    );
    const override = `@page{size:${s.PageWidth}px ${s.PageHeight}px;margin:0}html,body{margin:0;padding:0;background:white;color:black;--rt-paper:white;--rt-ink:black;--rt-accent:#2463d5;--rt-border:#d7dce5}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}.rt-page-sheet{display:block!important;width:${s.PageWidth}px!important;height:${s.PageHeight}px!important;padding:${s.Padding.Top}px ${s.Padding.Right}px ${s.Padding.Bottom}px ${s.Padding.Left}px!important;margin:0!important;border:0!important;outline:none!important;box-shadow:none!important;overflow:hidden!important;zoom:1!important;break-after:page;break-inside:avoid}.rt-page-sheet:last-child{break-after:auto}.rt-page-window{display:block!important;width:${s.ContentWidth}px!important;height:${s.ContentHeight}px!important;overflow:hidden!important}.surface.rt-page-flow{width:${s.ContentWidth}px!important;height:${s.ContentHeight}px!important;column-width:${s.TextColumnWidth}px!important;column-count:${s.ColumnCount}!important;column-gap:${s.ColumnGap}px!important;column-fill:auto!important;transform:var(--rt-print-transform)!important;min-height:0!important}.rt-page-story{display:block!important}.rt-page-story[style*="display: none"]{display:none!important}`;
    const body = sheets.join("").replace(
      /(<div[^>]*class="[^"]*rt-page-flow[^>]*style=")([^"]*)"/g,
      (_all, head, style) => `${head}${style};--rt-print-transform:${style.match(/(?:^|;)\s*transform:\s*([^;]+)/)?.[1] ?? "none"}"`
    );
    return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${styles}
${override}</style></head><body>${body}</body></html>`;
  }
  Print() {
    const popup = this.ownerDocument.defaultView?.open(
      "",
      "_blank",
      "popup,width=1000,height=900"
    );
    if (!popup)
      throw new Error(
        "The browser blocked the print window. Invoke Print from a user gesture."
      );
    popup.opener = null;
    popup.document.body.textContent = "Preparing measured document pages\u2026";
    void this.GetPrintHTML().then(async (html) => {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      await popup.document.fonts?.ready;
      await Promise.all(
        Array.from(popup.document.images).map(
          (image) => image.decode?.().catch(() => {
          })
        )
      );
      popup.focus();
      popup.print();
    }).catch((error) => {
      if (!popup.closed)
        popup.document.body.textContent = error instanceof Error ? error.message : String(error);
      this.emit("printerror", { error });
    });
  }
  renderStories() {
    if (!this._header || !this._footer || !this._footnotes) return;
    const props = this._paginationDocument?.props || {}, s = this._settings;
    const variant = (kind) => props[(0, import_page_setup.pageStoryKey)(props, kind, this.PageNumber)] || [];
    const resolveFields = (node) => {
      const copy = {
        ...node,
        props: { ...node.props },
        children: node.children?.map(resolveFields)
      };
      const field = node.props?.Field;
      const type = String(field?.Type || field?.Instruction || "").split(/\s+/)[0].toUpperCase();
      if (type === "PAGE" || type === "NUMPAGES")
        copy.children = [
          {
            type: "Run",
            id: `${node.id}-page-cache`,
            props: {},
            text: String(
              type === "PAGE" ? (0, import_page_setup.documentPageNumber)(props, this.PageNumber) : this.PageCount
            )
          }
        ];
      return copy;
    };
    const renderStory = (element, blocks, kind) => {
      const document = {
        type: "FlowDocument",
        id: `page-${kind}`,
        props: {},
        children: blocks.map(resolveFields)
      };
      (0, import_control_renderer.reconcileDocumentDOM)(
        element,
        (0, import_control_renderer.renderDocument)(document, this.ownerDocument)
      );
      element.style.width = `${s.ContentWidth}px`;
      element.style.left = `${s.Padding.Left}px`;
      element.style.display = blocks.length ? "block" : "none";
      if (kind === "header") {
        const distance = Math.max(
          0,
          Math.min(s.Padding.Top, Number(props.HeaderDistance ?? 8) || 0)
        );
        element.style.top = `${distance}px`;
        element.style.height = `${Math.max(0, s.Padding.Top - distance - 8)}px`;
      } else if (kind === "footer") {
        const distance = Math.max(
          0,
          Math.min(s.Padding.Bottom, Number(props.FooterDistance ?? 8) || 0)
        );
        element.style.bottom = `${distance}px`;
        element.style.height = `${Math.max(0, s.Padding.Bottom - distance - 8)}px`;
      } else {
        element.style.top = `${s.Padding.Top + s.ContentHeight}px`;
        element.style.height = `${s.FootnoteHeight}px`;
      }
      if (this._layout)
        this._layout.Overflows = this._layout.Overflows.filter(
          (item) => !(item.PageNumber === this.PageNumber && item.Reason === kind)
        );
      if (blocks.length && element.scrollHeight > element.clientHeight + 1 && this._layout) {
        this._layout.Overflows.push({
          ElementId: `page-${kind}`,
          PageNumber: this.PageNumber,
          Reason: kind,
          Measured: element.scrollHeight,
          Available: element.clientHeight
        });
      }
      if (this._layout)
        this._layout.Pages[this.PageNumber - 1].HasOverflow = this._layout.Overflows.some(
          (item) => item.PageNumber === this.PageNumber
        );
    };
    renderStory(this._header, variant("Header"), "header");
    renderStory(this._footer, variant("Footer"), "footer");
    renderStory(
      this._footnotes,
      this._pageNoteBlocks.get(this.PageNumber) || [],
      "footnotes"
    );
    if (this._pageLabel && this._layout?.Pages[this.PageNumber - 1]?.HasOverflow)
      this._pageLabel.textContent += " \xB7 Content exceeds page";
  }
  indexPageNotes() {
    this._pageNoteBlocks = /* @__PURE__ */ new Map();
    if (!this._paginationDocument || !this._layout || !this._render) return;
    const notes = new Map(
      (this._paginationDocument.props.Footnotes || []).map((note) => [
        String(note.Id),
        note.Blocks || []
      ])
    );
    if (!notes.size) return;
    const added = /* @__PURE__ */ new Map();
    const walk = (node) => {
      const reference = node.props?.NoteReference;
      if (reference?.Kind === "Footnote" && notes.has(String(reference.Id))) {
        const element = this._elementsById.get(node.id), position = element && this._render.positions.get(element);
        if (position) {
          const pages = this._layout.Pages;
          let low = 0, high = pages.length - 1;
          while (low < high) {
            const mid = low + high + 1 >>> 1;
            if (pages[mid].StartOffset <= position.start) low = mid;
            else high = mid - 1;
          }
          const page = low + 1, id = String(reference.Id), ids = added.get(page) || /* @__PURE__ */ new Set();
          if (!ids.has(id)) {
            ids.add(id);
            added.set(page, ids);
            this._pageNoteBlocks.set(page, [
              ...this._pageNoteBlocks.get(page) || [],
              ...notes.get(id)
            ]);
          }
        }
      }
      node.children?.forEach(walk);
    };
    walk(this._paginationDocument);
  }
}
class RichTextPageEditor extends FlowDocumentPageViewer {
  _followingCaret = false;
  constructor() {
    super();
    this.IsReadOnly = false;
    const follow = () => {
      if (this.ViewMode !== "page" || this._followingCaret || !this.isConnected)
        return;
      void this.Repaginate().then((layout) => {
        if (this.ViewMode !== "page" || !this.isConnected) return;
        const offset = this.Selection.End.Offset;
        const page = (0, import_page_window.pageAtOffset)(layout, offset);
        if (page && page.PageNumber !== this.PageNumber) {
          this._followingCaret = true;
          try {
            super.GoToPage(page.PageNumber);
          } finally {
            this._followingCaret = false;
          }
        }
      }).catch(() => {
      });
    };
    this.addEventListener("selectionchange", follow);
    this.addEventListener("documentchange", follow);
  }
  connectedCallback() {
    const readOnly = this.hasAttribute("readonly") && this.getAttribute("readonly") !== "false";
    super.connectedCallback();
    this.IsReadOnly = readOnly;
  }
  GoToPage(number) {
    const result = super.GoToPage(number);
    if (result && !this._followingCaret && !this.IsReadOnly) {
      const page = this.LayoutResult?.Pages[number - 1];
      if (page) {
        this._followingCaret = true;
        try {
          this.Select(page.StartOffset);
        } finally {
          this._followingCaret = false;
        }
      }
    }
    return result;
  }
}
function registerRichTextWeb(registry = globalThis.customElements) {
  if (!registry) return;
  const controls = [
    ["rich-equation-editor", import_equation_control.EquationEditor],
    ["rich-text-box", RichTextBox],
    ["flow-document-reader", FlowDocumentReader],
    ["flow-document-scroll-viewer", FlowDocumentScrollViewer],
    ["flow-document-page-viewer", FlowDocumentPageViewer],
    ["rich-text-toolbar", import_toolbar.RichTextToolbar],
    ["rich-text-page-editor", RichTextPageEditor]
  ];
  for (const [name, constructor] of controls)
    if (!registry.get(name)) registry.define(name, constructor);
}
//# sourceMappingURL=control.js.map
