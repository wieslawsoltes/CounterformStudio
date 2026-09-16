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
var bridge_exports = {};
__export(bridge_exports, {
  BridgeProtocol: () => BridgeProtocol,
  RichTextWebBridge: () => RichTextWebBridge,
  connectScriptHost: () => connectScriptHost,
  connectWebView2: () => connectWebView2,
  parseBridgeRequest: () => parseBridgeRequest
});
module.exports = __toCommonJS(bridge_exports);
var import_model = require("./model.js");
var import_document_features = require("./document-features.js");
var import_mvvm = require("./mvvm.js");
const BridgeProtocol = { channel: "richtextweb", version: 1 };
class ProtocolError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  code;
}
const structuredEditingCommands = {
  moveselection: "moveSelection",
  moveblocks: "moveBlocks",
  setelementproperty: "setElementProperty",
  settableproperty: "setTableProperty",
  setcellproperty: "setCellProperty",
  mergetablecells: "mergeTableCells",
  splittablecell: "splitTableCell",
  editfloatingcontent: "editFloatingContent"
};
const forbiddenKeys = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function stringParam(params, name) {
  if (typeof params[name] !== "string")
    throw new ProtocolError("invalid_params", `${name} must be a string`);
  return params[name];
}
function integerParam(params, name) {
  if (!Number.isSafeInteger(params[name]))
    throw new ProtocolError("invalid_params", `${name} must be a safe integer`);
  return params[name];
}
function parseBridgeRequest(input, maxMessageLength = 8 * 1024 * 1024) {
  let value = input;
  if (typeof input === "string") {
    if (input.length > maxMessageLength)
      throw new ProtocolError(
        "message_too_large",
        "Bridge message exceeds the configured size limit"
      );
    try {
      value = JSON.parse(input);
    } catch {
      throw new ProtocolError(
        "invalid_json",
        "Bridge message is not valid JSON"
      );
    }
  }
  let serialized;
  try {
    const active = /* @__PURE__ */ new Set();
    const visit = (current, depth) => {
      if (depth > 128) throw new Error("Object is too deeply nested");
      if (current === null || typeof current === "string" || typeof current === "boolean")
        return;
      if (typeof current === "number" && Number.isFinite(current)) return;
      if (typeof current !== "object" || !record(current) && !Array.isArray(current))
        throw new Error("Only JSON values are allowed");
      if (active.has(current)) throw new Error("Cyclic object");
      active.add(current);
      for (const [key, child] of Object.entries(current)) {
        if (forbiddenKeys.has(key))
          throw new Error(`Forbidden property: ${key}`);
        visit(child, depth + 1);
      }
      active.delete(current);
    };
    visit(value, 0);
    serialized = JSON.stringify(value);
  } catch (error) {
    throw new ProtocolError(
      "invalid_message",
      error instanceof Error ? error.message : "Invalid message"
    );
  }
  if (serialized.length > maxMessageLength)
    throw new ProtocolError(
      "message_too_large",
      "Bridge message exceeds the configured size limit"
    );
  if (!record(value) || value.channel !== BridgeProtocol.channel || value.version !== BridgeProtocol.version || value.kind !== "request") {
    throw new ProtocolError(
      "invalid_envelope",
      "Expected a richtextweb version 1 request"
    );
  }
  if (typeof value.id !== "string" || !value.id || value.id.length > 128 || typeof value.method !== "string" || value.method.length > 128) {
    throw new ProtocolError(
      "invalid_envelope",
      "id and method must be nonempty bounded strings"
    );
  }
  if (value.params !== void 0 && !record(value.params))
    throw new ProtocolError("invalid_params", "params must be an object");
  return value;
}
const nodeTypes = /* @__PURE__ */ new Set([
  "FlowDocument",
  "Section",
  "Paragraph",
  "Run",
  "Span",
  "Bold",
  "Italic",
  "Underline",
  "Hyperlink",
  "LineBreak",
  "List",
  "ListItem",
  "Table",
  "TableRowGroup",
  "TableRow",
  "TableCell",
  "TableColumn",
  "InlineUIContainer",
  "BlockUIContainer",
  "Image",
  "Equation",
  "Figure",
  "Floater"
]);
function validateDocument(value, maxNodes, maxDepth, requireDocument = true) {
  let nodes = 0;
  const ids = /* @__PURE__ */ new Set();
  const visit = (node, depth) => {
    if (++nodes > maxNodes || depth > maxDepth)
      throw new ProtocolError(
        "document_too_large",
        "Document exceeds bridge node/depth limits"
      );
    if (!record(node) || typeof node.type !== "string" || !nodeTypes.has(node.type) || typeof node.id !== "string" || !node.id || !record(node.props)) {
      throw new ProtocolError(
        "invalid_document",
        "Every node requires a supported type, nonempty id and props object"
      );
    }
    if (ids.has(node.id))
      throw new ProtocolError(
        "invalid_document",
        `Duplicate node id: ${node.id}`
      );
    ids.add(node.id);
    if (node.type === "Table" && node.props.Columns !== void 0) {
      if (!Array.isArray(node.props.Columns))
        throw new ProtocolError(
          "invalid_document",
          "Table Columns must be an array"
        );
      for (const column of node.props.Columns) {
        if (!record(column) || column.type !== "TableColumn")
          throw new ProtocolError(
            "invalid_document",
            "Table Columns must contain TableColumn nodes"
          );
        visit(column, depth + 1);
      }
    }
    if (node.text !== void 0 && typeof node.text !== "string")
      throw new ProtocolError("invalid_document", "Node text must be a string");
    if (node.children !== void 0) {
      if (!Array.isArray(node.children))
        throw new ProtocolError(
          "invalid_document",
          "Node children must be an array"
        );
      for (const child of node.children) visit(child, depth + 1);
    }
  };
  visit(value, 0);
  if (requireDocument && value.type !== "FlowDocument")
    throw new ProtocolError(
      "invalid_document",
      "Root node must be FlowDocument"
    );
  return value;
}
const fieldTypes = /* @__PURE__ */ new Set([
  "PAGE",
  "NUMPAGES",
  "DATE",
  "TIME",
  "REF",
  "PAGEREF",
  "MERGEFIELD",
  "SEQ",
  "TITLE",
  "AUTHOR",
  "FILENAME"
]);
const storyKinds = /* @__PURE__ */ new Set([
  "Headers",
  "Footers",
  "FirstPageHeader",
  "FirstPageFooter",
  "EvenPageHeader",
  "EvenPageFooter"
]);
const noteKinds = /* @__PURE__ */ new Set(["Footnote", "Endnote"]);
function optionalString(params, name) {
  return params[name] === void 0 ? void 0 : stringParam(params, name);
}
function enumParam(params, name, allowed) {
  const value = stringParam(params, name);
  if (!allowed.has(value))
    throw new ProtocolError("invalid_params", `Unsupported ${name}: ${value}`);
  return value;
}
function fieldContext(value) {
  if (value === void 0) return {};
  if (!record(value))
    throw new ProtocolError("invalid_params", "context must be an object");
  const context = {};
  const allowed = /* @__PURE__ */ new Set([
    "PageNumber",
    "PageCount",
    "Now",
    "Locale",
    "Data",
    "FileName",
    "PageMap"
  ]);
  for (const key of Object.keys(value))
    if (!allowed.has(key))
      throw new ProtocolError(
        "invalid_params",
        `Unsupported field context member: ${key}`
      );
  for (const key of ["PageNumber", "PageCount"]) {
    if (value[key] !== void 0) {
      const number = integerParam(value, key);
      if (number < 1)
        throw new ProtocolError("invalid_params", `${key} must be positive`);
      context[key] = number;
    }
  }
  if (value.Now !== void 0) {
    const date = stringParam(value, "Now");
    if (!/^\d{4}-\d{2}-\d{2}T/.test(date) || !Number.isFinite(Date.parse(date)))
      throw new ProtocolError(
        "invalid_params",
        "Now must be an ISO date/time string"
      );
    context.Now = new Date(date);
  }
  if (value.Locale !== void 0) context.Locale = stringParam(value, "Locale");
  if (value.FileName !== void 0)
    context.FileName = stringParam(value, "FileName");
  if (value.Data !== void 0) {
    if (!record(value.Data))
      throw new ProtocolError("invalid_params", "Data must be an object");
    context.Data = value.Data;
  }
  if (value.PageMap !== void 0) {
    if (!record(value.PageMap))
      throw new ProtocolError(
        "invalid_params",
        "PageMap must map node IDs to positive page numbers"
      );
    const pages = value.PageMap;
    for (const [id, page] of Object.entries(pages))
      if (!id || !Number.isSafeInteger(page) || Number(page) < 1)
        throw new ProtocolError(
          "invalid_params",
          "PageMap values must be positive integers"
        );
    context.PageOfNode = (id) => pages[id];
  }
  return context;
}
function tocOptions(value) {
  if (value === void 0) return {};
  if (!record(value))
    throw new ProtocolError("invalid_params", "options must be an object");
  const options = {};
  for (const name of Object.keys(value))
    if (!["MaxLevel", "Title", "IncludePageNumbers"].includes(name))
      throw new ProtocolError(
        "invalid_params",
        `Unsupported TOC option: ${name}`
      );
  if (value.MaxLevel !== void 0) {
    const level = integerParam(value, "MaxLevel");
    if (level < 1 || level > 9)
      throw new ProtocolError("invalid_params", "MaxLevel must be 1\u20139");
    options.MaxLevel = level;
  }
  if (value.Title !== void 0) options.Title = stringParam(value, "Title");
  if (value.IncludePageNumbers !== void 0) {
    if (typeof value.IncludePageNumbers !== "boolean")
      throw new ProtocolError(
        "invalid_params",
        "IncludePageNumbers must be a boolean"
      );
    options.IncludePageNumbers = value.IncludePageNumbers;
  }
  return options;
}
class RichTextWebBridge {
  constructor(Engine, postMessage, options = {}) {
    this.Engine = Engine;
    this.postMessage = postMessage;
    this.options = options;
    this.maxMessageLength = options.maxMessageLength ?? 8 * 1024 * 1024;
    this.maxNodes = options.maxDocumentNodes ?? 1e5;
    this.maxDepth = options.maxDocumentDepth ?? 64;
    for (const limit of [this.maxMessageLength, this.maxNodes, this.maxDepth])
      if (!Number.isSafeInteger(limit) || limit < 1)
        throw new RangeError("Bridge limits must be positive integers");
    this.subscriptions.push(
      Engine.Changed.Subscribe(
        () => this.emit("documentChanged", {
          ...this.GetState(),
          ...this.options.includeDocumentInEvents ? { document: this.Engine.Document.ToJSON() } : {}
        })
      )
    );
    this.subscriptions.push(
      Engine.SelectionChanged.Subscribe(
        () => this.emit("selectionChanged", this.selection())
      )
    );
  }
  Engine;
  postMessage;
  options;
  TransportError = new import_mvvm.ObservableEvent();
  subscriptions = [];
  disposed = false;
  maxMessageLength;
  maxNodes;
  maxDepth;
  send(message) {
    if (this.disposed) return;
    try {
      this.postMessage(message);
    } catch (error) {
      this.TransportError.Emit(error);
    }
  }
  emit(event, payload) {
    this.send({ ...BridgeProtocol, kind: "event", event, payload });
  }
  selection() {
    return {
      start: this.Engine.Selection.Start.Offset,
      end: this.Engine.Selection.End.Offset,
      text: this.Engine.Selection.Text
    };
  }
  GetState() {
    return {
      revision: this.Engine.Document.Revision,
      textLength: this.Engine.Document.Text.length,
      canUndo: this.Engine.CanUndo,
      canRedo: this.Engine.CanRedo,
      readOnly: this.options.isReadOnly?.() ?? false,
      selection: this.selection()
    };
  }
  NotifyReady() {
    this.emit("ready", this.GetState());
  }
  /** JSON equivalents of structural engine operations. No executable callbacks cross the bridge. */
  editStructure(method, params) {
    const property = () => {
      const name = stringParam(params, "name");
      if (forbiddenKeys.has(name) || !/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name))
        throw new ProtocolError(
          "invalid_params",
          "Property name must be an identifier"
        );
      if (!Object.hasOwn(params, "value"))
        throw new ProtocolError("invalid_params", "Property value is required");
      return name;
    };
    switch (method) {
      case "moveSelection": {
        const destination = integerParam(params, "destination");
        if (destination < 0 || destination > this.Engine.Document.Text.length)
          throw new ProtocolError(
            "invalid_params",
            "Destination must be inside the document"
          );
        this.Engine.MoveSelection(destination);
        break;
      }
      case "moveBlocks": {
        if (!Array.isArray(params.ids) || !params.ids.length || params.ids.length > this.maxNodes || !params.ids.every((id) => typeof id === "string" && id.length > 0) || new Set(params.ids).size !== params.ids.length)
          throw new ProtocolError(
            "invalid_params",
            "ids must be a nonempty array of unique node IDs"
          );
        this.Engine.MoveBlocks(
          params.ids,
          stringParam(params, "parentId"),
          integerParam(params, "index")
        );
        break;
      }
      case "setElementProperty":
        this.Engine.SetElementProperty(
          stringParam(params, "id"),
          property(),
          params.value
        );
        break;
      case "setTableProperty":
        this.Engine.SetTableProperty(property(), params.value);
        break;
      case "setCellProperty":
        this.Engine.SetCellProperty(property(), params.value);
        break;
      case "mergeTableCells": {
        const count = params.count === void 0 ? 2 : integerParam(params, "count");
        if (count < 2)
          throw new ProtocolError(
            "invalid_params",
            "count must be at least two"
          );
        this.Engine.MergeTableCells(count);
        break;
      }
      case "splitTableCell":
        this.Engine.SplitTableCell();
        break;
      case "editFloatingContent": {
        const id = stringParam(params, "id"), target = this.Engine.Document.FindById(id);
        if (!target || !["Figure", "Floater"].includes(target.Type))
          throw new ProtocolError(
            "invalid_params",
            "Target must be a Figure or Floater"
          );
        if (!Array.isArray(params.blocks))
          throw new ProtocolError(
            "invalid_params",
            "blocks must be a document node array"
          );
        const replacement = new import_model.FlowDocument().ToJSON();
        replacement.children = params.blocks;
        validateDocument(replacement, this.maxNodes, this.maxDepth);
        let canonical;
        try {
          canonical = import_model.FlowDocument.FromJSON(replacement).ToJSON().children ?? [];
        } catch (error) {
          throw new ProtocolError(
            "invalid_document",
            error instanceof Error ? error.message : "Invalid floating story"
          );
        }
        const oldIds = /* @__PURE__ */ new Set();
        const visit = (node, action) => {
          action(node);
          for (const child of node.children ?? []) visit(child, action);
          if (node.type === "Table")
            for (const column of node.props.Columns ?? [])
              visit(column, action);
        };
        for (const child of target.ToJSON().children ?? [])
          visit(child, (node) => oldIds.add(node.id));
        for (const child of canonical)
          visit(child, (node) => {
            if (this.Engine.Document.FindById(node.id) && !oldIds.has(node.id))
              throw new ProtocolError(
                "invalid_document",
                `Floating story node ID conflicts with the main document: ${node.id}`
              );
          });
        this.Engine.EditFloatingContent(id, (story) => {
          const snapshot = story.Document.ToJSON();
          snapshot.children = canonical;
          story.ReplaceDocument(import_model.FlowDocument.FromJSON(snapshot));
        });
        break;
      }
      default:
        throw new ProtocolError(
          "unknown_method",
          `Unknown structured edit: ${method}`
        );
    }
  }
  /** Returns a response, without posting it. Events caused by an edit are still posted. */
  HandleMessage(input) {
    let id = null;
    try {
      if (this.disposed)
        throw new ProtocolError("disposed", "Bridge is disposed");
      const request = parseBridgeRequest(input, this.maxMessageLength);
      id = request.id;
      const params = request.params ?? {};
      const mutating = /* @__PURE__ */ new Set([
        "setDocument",
        "insertText",
        "insertNode",
        "deleteBackward",
        "deleteForward",
        "applyProperty",
        "setParagraphProperty",
        "undo",
        "redo",
        "execute",
        "insertField",
        "updateFields",
        "setStory",
        "insertNote",
        "updateNote",
        "insertTableOfContents",
        "updateTableOfContents",
        ...Object.values(structuredEditingCommands)
      ]);
      if (mutating.has(request.method)) {
        if (this.options.isReadOnly?.())
          throw new ProtocolError(
            "read_only",
            "The host document is read-only"
          );
        if (params.expectedRevision !== void 0 && integerParam(params, "expectedRevision") !== this.Engine.Document.Revision)
          throw new ProtocolError(
            "revision_conflict",
            "The document has changed since the expected revision"
          );
      }
      const features = new import_document_features.DocumentFeatures(this.Engine);
      const blocks = (value) => {
        if (!Array.isArray(value))
          throw new ProtocolError(
            "invalid_params",
            "blocks must be a document node array"
          );
        const root = new import_model.FlowDocument().ToJSON();
        root.children = value;
        return validateDocument(root, this.maxNodes, this.maxDepth).children ?? [];
      };
      let result;
      switch (request.method) {
        case "getDocument":
          result = this.Engine.Document.ToJSON();
          break;
        case "getText":
          result = this.Engine.Document.Text;
          break;
        case "getState":
          result = this.GetState();
          break;
        case "getReviewState":
          result = {
            trackChanges: this.Engine.TrackChanges,
            currentAuthor: this.Engine.CurrentAuthor,
            revisions: this.Engine.Revisions
          };
          break;
        case "insertField":
          features.InsertField(
            enumParam(params, "type", fieldTypes),
            optionalString(params, "argument") ?? "",
            optionalString(params, "format")
          );
          result = this.GetState();
          break;
        case "updateFields":
          result = features.UpdateFields(fieldContext(params.context));
          break;
        case "setStory":
          features.SetStory(
            enumParam(params, "kind", storyKinds),
            blocks(params.blocks),
            optionalString(params, "sectionId")
          );
          result = this.GetState();
          break;
        case "insertNote":
          result = {
            id: features.InsertNote(
              enumParam(params, "kind", noteKinds),
              typeof params.content === "string" ? params.content : blocks(params.content)
            )
          };
          break;
        case "updateNote":
          features.UpdateNote(
            enumParam(params, "kind", noteKinds),
            stringParam(params, "id"),
            stringParam(params, "content")
          );
          result = this.GetState();
          break;
        case "insertTableOfContents":
          features.InsertTableOfContents(
            tocOptions(params.options),
            fieldContext(params.context)
          );
          result = this.GetState();
          break;
        case "updateTableOfContents":
          result = {
            updated: features.UpdateTableOfContents(
              fieldContext(params.context)
            )
          };
          break;
        case "mailMerge": {
          if (params.expectedRevision !== void 0 && integerParam(params, "expectedRevision") !== this.Engine.Document.Revision)
            throw new ProtocolError(
              "revision_conflict",
              "The merge template has changed since the expected revision"
            );
          if (!Array.isArray(params.records) || params.records.length > 1e3 || !params.records.every(record))
            throw new ProtocolError(
              "invalid_params",
              "records must be an array of at most 1000 JSON objects"
            );
          const context = fieldContext(params.context);
          if (context.Data !== void 0)
            throw new ProtocolError(
              "invalid_params",
              "Mail merge data must be supplied in records"
            );
          const documents = [];
          let outputSize = 2;
          for (const data of params.records) {
            const merged = features.MailMerge([data], context)[0].ToJSON();
            outputSize += JSON.stringify(merged).length + 1;
            if (outputSize > this.maxMessageLength)
              throw new ProtocolError(
                "message_too_large",
                "Merged documents exceed the bridge output budget; use smaller batches"
              );
            documents.push(merged);
          }
          result = documents;
          break;
        }
        case "setDocument":
          this.Engine.SetDocument(
            import_model.FlowDocument.FromJSON(
              validateDocument(params.document, this.maxNodes, this.maxDepth)
            )
          );
          result = this.GetState();
          break;
        case "select": {
          const start = integerParam(params, "start");
          const end = integerParam(params, "end");
          if (start < 0 || end < 0 || start > this.Engine.Document.Text.length || end > this.Engine.Document.Text.length)
            throw new ProtocolError(
              "invalid_params",
              "Selection offsets must be inside the document"
            );
          this.Engine.Select(start, end);
          result = this.selection();
          break;
        }
        case "insertText":
          this.Engine.InsertText(stringParam(params, "text"));
          result = this.GetState();
          break;
        case "insertNode":
          this.Engine.InsertNode(
            validateDocument(params.node, this.maxNodes, this.maxDepth, false)
          );
          result = this.GetState();
          break;
        case "deleteBackward":
          this.Engine.DeleteBackward();
          result = this.GetState();
          break;
        case "deleteForward":
          this.Engine.DeleteForward();
          result = this.GetState();
          break;
        case "applyProperty":
        case "setParagraphProperty": {
          const name = stringParam(params, "name");
          if (forbiddenKeys.has(name) || !/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name))
            throw new ProtocolError(
              "invalid_params",
              "Property name must be an identifier"
            );
          if (!Object.prototype.hasOwnProperty.call(params, "value"))
            throw new ProtocolError(
              "invalid_params",
              "Property value is required"
            );
          if (request.method === "applyProperty")
            this.Engine.ApplyProperty(name, params.value);
          else this.Engine.SetParagraphProperty(name, params.value);
          result = this.GetState();
          break;
        }
        case "moveSelection":
        case "moveBlocks":
        case "setElementProperty":
        case "setTableProperty":
        case "setCellProperty":
        case "mergeTableCells":
        case "splitTableCell":
        case "editFloatingContent":
          this.editStructure(request.method, params);
          result = this.GetState();
          break;
        case "undo":
          this.Engine.Undo();
          result = this.GetState();
          break;
        case "redo":
          this.Engine.Redo();
          result = this.GetState();
          break;
        case "execute": {
          const command = stringParam(params, "command");
          const normalized = command.replace(/^(EditingCommands|ApplicationCommands)\./, "").replace(/[\s_-]/g, "").toLowerCase();
          const structured = Object.hasOwn(
            structuredEditingCommands,
            normalized
          ) ? structuredEditingCommands[normalized] : void 0;
          if (structured) {
            const value = params.parameter;
            const parameter = record(value) ? value : {};
            const converted = {};
            for (const [source, target] of [
              ["Id", "id"],
              ["Ids", "ids"],
              ["ParentId", "parentId"],
              ["Index", "index"],
              ["Name", "name"],
              ["Value", "value"],
              ["Destination", "destination"],
              ["Count", "count"],
              ["Blocks", "blocks"]
            ])
              if (Object.hasOwn(parameter, source))
                converted[target] = parameter[source];
            if (structured === "moveSelection" && typeof value === "number")
              converted.destination = value;
            if (structured === "mergeTableCells" && typeof value === "number")
              converted.count = value;
            if (structured !== "splitTableCell" && structured !== "mergeTableCells" && !record(value) && typeof value !== "number")
              throw new ProtocolError(
                "invalid_params",
                "Structured editing command requires a JSON parameter object"
              );
            if (structured === "mergeTableCells" && value !== void 0 && value !== null && !record(value) && typeof value !== "number")
              throw new ProtocolError(
                "invalid_params",
                "MergeTableCells requires a count"
              );
            this.editStructure(structured, converted);
          } else {
            this.Engine.Execute(command, params.parameter);
          }
          result = this.GetState();
          break;
        }
        default:
          throw new ProtocolError(
            "unknown_method",
            `Unknown bridge method: ${request.method}`
          );
      }
      return { ...BridgeProtocol, kind: "response", id, result };
    } catch (error) {
      return {
        ...BridgeProtocol,
        kind: "response",
        id,
        error: {
          code: error instanceof ProtocolError ? error.code : "operation_failed",
          message: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  Receive(input) {
    const response = this.HandleMessage(input);
    this.send(response);
    return response;
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const subscription of this.subscriptions) subscription.Dispose();
    this.TransportError.Clear();
  }
}
function connectWebView2(engine, host, options) {
  const bridge = new RichTextWebBridge(
    engine,
    (message) => host.postMessage(message),
    options
  );
  const listener = (event) => bridge.Receive(event.data);
  host.addEventListener("message", listener);
  const dispose = bridge.Dispose.bind(bridge);
  bridge.Dispose = () => {
    host.removeEventListener("message", listener);
    dispose();
  };
  bridge.NotifyReady();
  return bridge;
}
function connectScriptHost(engine, globalObject, sendToNative, options) {
  const name = "receiveRichTextWebMessage";
  if (Object.prototype.hasOwnProperty.call(globalObject, name))
    throw new Error(`${name} is already installed`);
  const bridge = new RichTextWebBridge(
    engine,
    (message) => sendToNative(JSON.stringify(message)),
    options
  );
  const receive = (message) => bridge.Receive(message);
  globalObject[name] = receive;
  const cleanup = new import_mvvm.Subscription(() => {
    if (globalObject[name] === receive) delete globalObject[name];
  });
  const dispose = bridge.Dispose.bind(bridge);
  bridge.Dispose = () => {
    cleanup.Dispose();
    dispose();
  };
  bridge.NotifyReady();
  return bridge;
}
//# sourceMappingURL=bridge.js.map
