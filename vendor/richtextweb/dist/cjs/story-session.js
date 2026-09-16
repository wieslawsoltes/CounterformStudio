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
var story_session_exports = {};
__export(story_session_exports, {
  DocumentStorySession: () => DocumentStorySession
});
module.exports = __toCommonJS(story_session_exports);
var import_model = require("./model.js");
var import_engine = require("./engine.js");
var import_document_features = require("./document-features.js");
const kinds = [
  "Headers",
  "Footers",
  "FirstPageHeader",
  "FirstPageFooter",
  "EvenPageHeader",
  "EvenPageFooter"
];
class DocumentStorySession {
  constructor(owner, kind, SectionId) {
    this.owner = owner;
    this.SectionId = SectionId;
    if (!kinds.includes(kind))
      throw new TypeError("Unknown header/footer story.");
    this.Kind = kind;
    this.parent = owner.Document;
    const target = this.target();
    const content = target.props[kind];
    this.original = JSON.stringify(content ?? null);
    const root = new import_model.FlowDocument().ToJSON();
    const properties = this.parent.ToJSON().props;
    for (const name of [
      "FontFamily",
      "FontSize",
      "FontWeight",
      "FontStyle",
      "Foreground",
      "FlowDirection",
      "Language"
    ])
      if (properties[name] !== void 0) root.props[name] = properties[name];
    root.children = structuredClone(Array.isArray(content) ? content : []);
    this.Engine = new import_engine.RichTextEngine(import_model.FlowDocument.FromJSON(root));
  }
  owner;
  SectionId;
  Engine;
  Kind;
  parent;
  original;
  closed = false;
  get Document() {
    return this.Engine.Document;
  }
  get IsClosed() {
    return this.closed;
  }
  get HasConflict() {
    if (this.closed || this.owner.Document !== this.parent) return true;
    try {
      return JSON.stringify(this.target().props[this.Kind] ?? null) !== this.original;
    } catch {
      return true;
    }
  }
  Apply() {
    if (this.closed) throw new Error("The story editing session is closed.");
    if (this.HasConflict)
      throw new Error(
        "The target story changed or was removed; reopen it before applying."
      );
    const children = this.Document.ToJSON().children ?? [];
    const changed = JSON.stringify(children) !== this.original && !(this.original === "null" && children.length === 0);
    if (changed)
      new import_document_features.DocumentFeatures(this.owner).SetStory(
        this.Kind,
        children,
        this.SectionId
      );
    this.Dispose();
    return changed;
  }
  Cancel() {
    this.Dispose();
  }
  Dispose() {
    if (this.closed) return;
    this.closed = true;
    this.Engine.Dispose();
  }
  target() {
    const root = this.owner.Document.ToJSON();
    if (!this.SectionId) return root;
    const node = this.owner.Document.FindById(this.SectionId);
    if (!node || node.Type !== "Section")
      throw new Error("Section was not found.");
    return node.ToJSON();
  }
}
//# sourceMappingURL=story-session.js.map
