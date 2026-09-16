import { FlowDocument } from "./model.js";
import { RichTextEngine } from "./engine.js";
import { DocumentFeatures } from "./document-features.js";
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
    const root = new FlowDocument().ToJSON();
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
    this.Engine = new RichTextEngine(FlowDocument.FromJSON(root));
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
      new DocumentFeatures(this.owner).SetStory(
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
export {
  DocumentStorySession
};
//# sourceMappingURL=story-session.js.map
