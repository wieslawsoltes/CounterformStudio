import { EventDispatcher, FlowDocument } from "./model.js";
import { leaves } from "./engine-tree.js";
class CollaborationConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "CollaborationConflictError";
  }
}
const ROOT = "@root";
const properties = /* @__PURE__ */ new Set([
  "FontFamily",
  "FontSize",
  "FontWeight",
  "FontStyle",
  "Foreground",
  "Background",
  "TextDecorations",
  "BaselineAlignment",
  "Language"
]);
const safeActor = (id) => typeof id === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(id) && !["__proto__", "prototype", "constructor"].includes(id);
const integer = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
const clone = (value) => structuredClone(value);
const canonical = (value) => JSON.stringify(
  value && typeof value === "object" ? Array.isArray(value) ? value.map((item) => JSON.parse(canonical(item))) : Object.fromEntries(
    Object.keys(value).sort().filter((key) => value[key] !== void 0).map((key) => [key, JSON.parse(canonical(value[key]))])
  ) : value
);
const fingerprint = (text) => {
  let a = 2166136261, b = 2246822519;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 16777619);
    b = Math.imul(b ^ text.charCodeAt(i), 3266489917);
  }
  return `${text.length}:${(a >>> 0).toString(16)}:${(b >>> 0).toString(16)}`;
};
const stampCompare = (a, b) => a.Clock - b.Clock || (a.ActorId < b.ActorId ? -1 : a.ActorId > b.ActorId ? 1 : 0) || a.Sequence - b.Sequence;
class CollaborativeTextSession {
  DocumentId;
  ActorId;
  InitialText;
  InitialHash;
  OperationGenerated = new EventDispatcher();
  Changed = new EventDispatcher();
  Conflict = new EventDispatcher();
  characters = /* @__PURE__ */ new Map();
  children = /* @__PURE__ */ new Map();
  vector = /* @__PURE__ */ new Map();
  accepted = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  clock = 0;
  maxPending;
  maxCharacters;
  resyncRequired = false;
  constructor(options) {
    if (!options || typeof options.DocumentId !== "string" || !options.DocumentId || options.DocumentId.length > 200 || !safeActor(options.ActorId))
      throw new TypeError(
        "A document ID and unique safe actor ID are required."
      );
    if (options.Text !== void 0 && typeof options.Text !== "string")
      throw new TypeError("Initial collaboration text must be a string.");
    this.DocumentId = options.DocumentId;
    this.ActorId = options.ActorId;
    this.InitialText = (options.Text ?? "").replace(/\r\n?/g, "\n");
    this.InitialHash = fingerprint(this.InitialText);
    this.maxPending = options.MaxPendingOperations ?? 1e3;
    this.maxCharacters = options.MaxCharacters ?? 1e6;
    if (!integer(this.maxPending) || !integer(this.maxCharacters) || this.InitialText.length > this.maxCharacters)
      throw new RangeError("Invalid collaboration limits.");
    let after = ROOT, index = 0;
    for (const text of Array.from(this.InitialText)) {
      const Id = `@seed:${index}`;
      this.addCharacter({
        Id,
        After: after,
        Text: text,
        Clock: 0,
        ActorId: "",
        Sequence: 0,
        Index: index,
        Deleted: false,
        Styles: /* @__PURE__ */ new Map()
      });
      after = Id;
      index++;
    }
  }
  get Text() {
    return this.visible().map((item) => item.Text).join("");
  }
  get VersionVector() {
    return Object.fromEntries(
      [...this.vector].sort(([a], [b]) => a < b ? -1 : 1)
    );
  }
  get ResyncRequired() {
    return this.resyncRequired;
  }
  get RequiresCompaction() {
    return this.characters.size >= this.maxCharacters;
  }
  get PendingCount() {
    return this.pending.size;
  }
  get CharacterCount() {
    return this.characters.size;
  }
  ordered() {
    const output = [], stack = [...this.children.get(ROOT) ?? []].reverse();
    while (stack.length) {
      const id = stack.pop(), item = this.characters.get(id);
      output.push(item);
      const children = this.children.get(id) ?? [];
      for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
    }
    return output;
  }
  visible() {
    return this.ordered().filter((item) => !item.Deleted);
  }
  boundary(offset) {
    if (!integer(offset))
      throw new RangeError("Text offsets must be nonnegative integers.");
    const items = this.visible();
    let position = 0;
    for (let i = 0; i < items.length; i++) {
      if (position === offset) return { items, index: i };
      position += items[i].Text.length;
      if (position > offset)
        throw new RangeError(
          "A collaborative edit cannot split a Unicode surrogate pair."
        );
    }
    if (position !== offset)
      throw new RangeError("Text offset is outside the document.");
    return { items, index: items.length };
  }
  base(kind) {
    return {
      Protocol: 1,
      DocumentId: this.DocumentId,
      InitialHash: this.InitialHash,
      ActorId: this.ActorId,
      Sequence: (this.vector.get(this.ActorId) ?? 0) + 1,
      Clock: this.clock + 1,
      Dependencies: {
        ...this.VersionVector,
        [this.ActorId]: this.vector.get(this.ActorId) ?? 0
      },
      Kind: kind
    };
  }
  Insert(offset, text) {
    if (typeof text !== "string")
      throw new TypeError("Insertion text must be a string.");
    text = text.replace(/\r\n?/g, "\n");
    if (!text) return void 0;
    const { items, index } = this.boundary(offset), operation = {
      ...this.base("Insert"),
      After: index ? items[index - 1].Id : ROOT,
      Text: text
    };
    this.commitLocal(operation);
    return clone(operation);
  }
  Delete(start, end) {
    if (end < start) throw new RangeError("Deletion end precedes its start.");
    const a = this.boundary(start), b = this.boundary(end);
    if (a.index === b.index) return void 0;
    const operation = {
      ...this.base("Delete"),
      Targets: a.items.slice(a.index, b.index).map((item) => item.Id)
    };
    this.commitLocal(operation);
    return clone(operation);
  }
  Replace(start, end, text) {
    if (typeof text !== "string" || end < start)
      throw new TypeError(
        "A replacement requires ordered offsets and string text."
      );
    text = text.replace(/\r\n?/g, "\n");
    if (start === end) return this.Insert(start, text);
    if (!text) return this.Delete(start, end);
    const a = this.boundary(start), b = this.boundary(end), operation = {
      ...this.base("Replace"),
      After: a.index ? a.items[a.index - 1].Id : ROOT,
      Targets: a.items.slice(a.index, b.index).map((item) => item.Id),
      Text: text
    };
    this.commitLocal(operation);
    return clone(operation);
  }
  Format(start, end, property, value) {
    if (end < start) throw new RangeError("Formatting end precedes its start.");
    const a = this.boundary(start), b = this.boundary(end);
    if (a.index === b.index) return void 0;
    const operation = {
      ...this.base("Format"),
      Targets: a.items.slice(a.index, b.index).map((item) => item.Id),
      Property: property,
      Value: clone(value)
    };
    this.commitLocal(operation);
    return clone(operation);
  }
  commitLocal(operation) {
    this.validate(operation);
    this.apply(operation, false);
    this.OperationGenerated.Emit(clone(operation));
    this.drain();
  }
  Receive(input) {
    try {
      const operation = clone(input);
      this.validate(operation);
      const key = this.key(operation), known = this.accepted.get(key) ?? this.pending.get(key);
      if (known) {
        if (canonical(known) !== canonical(operation))
          throw new CollaborationConflictError(
            "An operation ID was reused with different contents."
          );
        return "duplicate";
      }
      if (operation.Sequence <= (this.vector.get(operation.ActorId) ?? 0))
        throw new CollaborationConflictError(
          "An actor sequence was replayed with unknown contents."
        );
      if (!this.ready(operation)) {
        if (this.pending.size >= this.maxPending) {
          this.resyncRequired = true;
          throw new CollaborationConflictError(
            "Causal queue limit exceeded; obtain a current snapshot."
          );
        }
        this.pending.set(key, operation);
        return "queued";
      }
      this.apply(operation, true);
      this.drain();
      return "applied";
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      this.Conflict.Emit({ Error: failure, Operation: input });
      throw failure;
    }
  }
  key(operation) {
    return `${operation.ActorId}:${operation.Sequence}`;
  }
  validate(operation) {
    if (!operation || operation.Protocol !== 1 || operation.DocumentId !== this.DocumentId || operation.InitialHash !== this.InitialHash)
      throw new CollaborationConflictError(
        "Protocol, document identity, or initial content does not match."
      );
    const keys = /* @__PURE__ */ new Set([
      "Protocol",
      "DocumentId",
      "InitialHash",
      "ActorId",
      "Sequence",
      "Clock",
      "Dependencies",
      "Kind",
      "After",
      "Text",
      "Targets",
      "Property",
      "Value"
    ]);
    if (Object.keys(operation).some((key) => !keys.has(key)) || !safeActor(operation.ActorId) || !integer(operation.Sequence) || operation.Sequence < 1 || !integer(operation.Clock) || operation.Clock < 1 || !operation.Dependencies || typeof operation.Dependencies !== "object" || Array.isArray(operation.Dependencies))
      throw new CollaborationConflictError("Malformed operation envelope.");
    if (Object.entries(operation.Dependencies).some(
      ([actor, sequence]) => !safeActor(actor) || !integer(sequence)
    ) || (operation.Dependencies[operation.ActorId] ?? 0) !== operation.Sequence - 1)
      throw new CollaborationConflictError("Invalid causal version vector.");
    if (operation.Kind === "Insert" || operation.Kind === "Replace") {
      if (typeof operation.Text !== "string" || !operation.Text.length || operation.Text.length > 65536 || operation.Text.includes("\r") || typeof operation.After !== "string" || operation.Kind === "Insert" && operation.Targets !== void 0 || operation.Property !== void 0 || operation.Value !== void 0)
        throw new CollaborationConflictError("Malformed insertion operation.");
      if (operation.Kind === "Replace" && (!Array.isArray(operation.Targets) || !operation.Targets.length || operation.Targets.length > 1e5 || new Set(operation.Targets).size !== operation.Targets.length || operation.Targets.some(
        (id) => typeof id !== "string" || id.length > 150
      )))
        throw new CollaborationConflictError(
          "Malformed replacement target list."
        );
    } else if (operation.Kind === "Delete" || operation.Kind === "Format") {
      if (!Array.isArray(operation.Targets) || !operation.Targets.length || operation.Targets.length > 1e5 || new Set(operation.Targets).size !== operation.Targets.length || operation.Targets.some(
        (id) => typeof id !== "string" || id.length > 150
      ) || operation.Text !== void 0 || operation.After !== void 0)
        throw new CollaborationConflictError(
          "Malformed target character list."
        );
      if (operation.Kind === "Format") {
        if (!properties.has(operation.Property ?? "") || operation.Value === void 0 || !(typeof operation.Value === "string" || typeof operation.Value === "number" || typeof operation.Value === "boolean" || operation.Value === null) || typeof operation.Value === "number" && !Number.isFinite(operation.Value) || JSON.stringify(operation.Value).length > 2048)
          throw new CollaborationConflictError(
            "Unsupported collaboration formatting property or value."
          );
        if (operation.Property === "FontSize" && (typeof operation.Value !== "number" || !Number.isFinite(operation.Value) || operation.Value <= 0))
          throw new CollaborationConflictError(
            "Font size must be a positive finite number."
          );
      } else if (operation.Property !== void 0 || operation.Value !== void 0)
        throw new CollaborationConflictError(
          "Deletion operations do not contain formatting."
        );
    } else throw new CollaborationConflictError("Unknown operation kind.");
  }
  ready(operation) {
    return operation.Sequence === (this.vector.get(operation.ActorId) ?? 0) + 1 && Object.entries(operation.Dependencies).every(
      ([actor, sequence]) => (this.vector.get(actor) ?? 0) >= sequence
    );
  }
  apply(operation, remote) {
    let causalClock = 0;
    for (const [actor, sequence] of Object.entries(operation.Dependencies)) {
      if (!sequence) continue;
      const predecessor = this.accepted.get(`${actor}:${sequence}`);
      if (!predecessor)
        throw new CollaborationConflictError("Missing causal predecessor.");
      causalClock = Math.max(causalClock, predecessor.Clock);
    }
    if (operation.Clock !== causalClock + 1)
      throw new CollaborationConflictError(
        "Lamport clock does not match the causal version vector."
      );
    const causal = (item) => {
      if (item.Sequence && (operation.Dependencies[item.ActorId] ?? 0) < item.Sequence)
        throw new CollaborationConflictError(
          "Referenced character is absent from the causal version vector."
        );
    };
    if (operation.Kind === "Insert" || operation.Kind === "Replace") {
      if (operation.After !== ROOT && !this.characters.has(operation.After))
        throw new CollaborationConflictError(
          "Insertion anchor is unknown despite satisfied dependencies."
        );
      if (operation.After !== ROOT)
        causal(this.characters.get(operation.After));
      const points = Array.from(operation.Text);
      if (!remote && this.characters.size + points.length > this.maxCharacters)
        throw new CollaborationConflictError(
          "Character/tombstone limit reached; compact through an agreed new snapshot."
        );
      const removed = (operation.Targets ?? []).map((id) => {
        const item = this.characters.get(id);
        if (!item)
          throw new CollaborationConflictError(
            "A replacement target is unknown."
          );
        causal(item);
        return item;
      });
      for (const item of removed) item.Deleted = true;
      let after = operation.After;
      points.forEach((text, index) => {
        const Id = `${operation.ActorId}:${operation.Sequence}:${index}`;
        this.addCharacter({
          Id,
          After: after,
          Text: text,
          Clock: operation.Clock,
          ActorId: operation.ActorId,
          Sequence: operation.Sequence,
          Index: index,
          Deleted: false,
          Styles: /* @__PURE__ */ new Map()
        });
        after = Id;
      });
    } else {
      const targets = operation.Targets.map((id) => {
        const item = this.characters.get(id);
        if (!item)
          throw new CollaborationConflictError(
            "A target character is unknown despite satisfied dependencies."
          );
        causal(item);
        return item;
      });
      for (const item of targets) {
        if (operation.Kind === "Delete") item.Deleted = true;
        else {
          const old = item.Styles.get(operation.Property);
          if (!old || stampCompare(old, operation) < 0)
            item.Styles.set(operation.Property, {
              Clock: operation.Clock,
              ActorId: operation.ActorId,
              Sequence: operation.Sequence,
              Value: clone(operation.Value)
            });
        }
      }
    }
    this.clock = Math.max(this.clock, operation.Clock);
    this.vector.set(operation.ActorId, operation.Sequence);
    this.accepted.set(this.key(operation), clone(operation));
    this.Changed.Emit({
      Session: this,
      Operation: clone(operation),
      Remote: remote
    });
  }
  addCharacter(item) {
    this.characters.set(item.Id, item);
    const siblings = this.children.get(item.After) ?? [];
    siblings.push(item.Id);
    siblings.sort(
      (a, b) => stampCompare(this.characters.get(b), this.characters.get(a)) || this.characters.get(a).Index - this.characters.get(b).Index
    );
    this.children.set(item.After, siblings);
  }
  drain() {
    let progress = true;
    while (progress) {
      progress = false;
      for (const [key, operation] of this.pending) {
        if (this.ready(operation)) {
          this.pending.delete(key);
          try {
            this.apply(operation, true);
          } catch (error) {
            this.resyncRequired = true;
            this.Conflict.Emit({
              Error: error instanceof Error ? error : new Error(String(error)),
              Operation: operation
            });
          }
          progress = true;
        }
      }
    }
  }
  GetFormatting() {
    let offset = 0;
    return this.visible().map((item) => {
      const Start = offset;
      offset += item.Text.length;
      return {
        CharacterId: item.Id,
        Start,
        End: offset,
        Properties: Object.fromEntries(
          [...item.Styles].map(([name, stamp]) => [name, clone(stamp.Value)])
        )
      };
    });
  }
  /** Fork an isolated replica without replaying its complete operation history. */
  Fork(actorId = this.ActorId) {
    const session = new CollaborativeTextSession({
      DocumentId: this.DocumentId,
      ActorId: actorId,
      Text: this.InitialText,
      MaxPendingOperations: this.maxPending,
      MaxCharacters: this.maxCharacters
    });
    session.characters = new Map(
      [...this.characters].map(([id, item]) => [
        id,
        {
          ...item,
          Styles: new Map(
            [...item.Styles].map(([name, stamp]) => [
              name,
              { ...stamp, Value: clone(stamp.Value) }
            ])
          )
        }
      ])
    );
    session.children = new Map(
      [...this.children].map(([id, children]) => [id, [...children]])
    );
    session.vector = new Map(this.vector);
    session.accepted = new Map(this.accepted);
    session.pending = new Map(this.pending);
    session.clock = this.clock;
    session.resyncRequired = this.resyncRequired;
    return session;
  }
  ExportSnapshot() {
    return {
      Protocol: 1,
      DocumentId: this.DocumentId,
      InitialText: this.InitialText,
      Operations: [...this.accepted.values()].map(clone)
    };
  }
  static FromSnapshot(snapshot, actorId) {
    if (!snapshot || snapshot.Protocol !== 1 || !Array.isArray(snapshot.Operations))
      throw new CollaborationConflictError("Malformed collaboration snapshot.");
    const session = new CollaborativeTextSession({
      DocumentId: snapshot.DocumentId,
      ActorId: actorId,
      Text: snapshot.InitialText
    });
    for (const operation of snapshot.Operations) session.Receive(operation);
    if (session.PendingCount)
      throw new CollaborationConflictError(
        "Snapshot is missing causal operations."
      );
    return session;
  }
  BindEngine(engine) {
    return new CollaborationBinding(this, engine);
  }
}
class CollaborationBinding {
  constructor(Session, Engine) {
    this.Session = Session;
    this.Engine = Engine;
    const engine = Engine;
    validateProjection(engine.Document.ToJSON());
    if (engine.Document.Text !== Session.Text)
      throw new CollaborationConflictError(
        "Engine and collaboration session must begin with identical text."
      );
    this.formatting = captureFormatting(engine);
    this.subscriptions.push(
      engine.Changed.Subscribe(() => {
        if (this.applying || this.disposed) return;
        try {
          validateProjection(engine.Document.ToJSON());
          const before = Session.Text, after = engine.Document.Text, current = captureFormatting(engine);
          this.applying = true;
          try {
            if (before !== after) {
              const diff = textDifference(before, after);
              Session.Replace(diff.Start, diff.End, diff.Text);
              for (const span of current) {
                const start = Math.max(span.Start, diff.Start), end = Math.min(span.End, diff.Start + diff.Text.length);
                if (end > start)
                  for (const [property, value] of Object.entries(
                    span.Properties
                  ))
                    Session.Format(start, end, property, value);
              }
            } else
              for (const change of formattingDifference(
                this.formatting,
                current
              ))
                Session.Format(
                  change.Start,
                  change.End,
                  change.Property,
                  change.Value
                );
            this.formatting = current;
          } finally {
            this.applying = false;
          }
        } catch (error) {
          this.fail(error);
        }
      })
    );
    this.subscriptions.push(
      Session.Changed.Subscribe(({ Operation }) => {
        if (this.applying || this.disposed) return;
        this.applying = true;
        const tracking = engine.TrackChanges, selection = engine.CaptureSelectionState();
        engine.TrackChanges = false;
        try {
          engine.Change(() => {
            const diff = textDifference(engine.Document.Text, Session.Text);
            let insertedStart = -1, insertedEnd = -1;
            if (diff.Start !== diff.End || diff.Text) {
              engine.Select(diff.Start, diff.End);
              engine.ResetInsertionFormatting();
              engine.InsertText(diff.Text);
              insertedStart = diff.Start;
              insertedEnd = diff.Start + diff.Text.length;
            }
            const targets = new Set(Operation.Targets ?? []), spans = Session.GetFormatting(), changes = [];
            for (const span of spans) {
              const inserted = span.Start >= insertedStart && span.End <= insertedEnd && insertedStart >= 0;
              if (inserted) {
                for (const [Property, Value] of Object.entries({
                  ...defaultFormatting,
                  ...span.Properties
                }))
                  changes.push({
                    Start: span.Start,
                    End: span.End,
                    Property,
                    Value
                  });
              } else if (Operation.Kind === "Format" && targets.has(span.CharacterId))
                changes.push({
                  Start: span.Start,
                  End: span.End,
                  Property: Operation.Property,
                  Value: span.Properties[Operation.Property]
                });
            }
            for (const change of coalesceFormats(changes)) {
              engine.Select(change.Start, change.End);
              engine.ApplyProperty(change.Property, change.Value);
            }
          });
          engine.RestoreSelectionState(selection);
          this.formatting = captureFormatting(engine);
          if (engine.Document.Text !== Session.Text)
            throw new CollaborationConflictError(
              "The engine cannot project this operation without changing document structure."
            );
        } catch (error) {
          this.fail(error);
        } finally {
          engine.TrackChanges = tracking;
          this.applying = false;
        }
      })
    );
  }
  Session;
  Engine;
  subscriptions = [];
  applying = false;
  disposed = false;
  formatting = [];
  get IsConnected() {
    return !this.disposed;
  }
  fail(error) {
    const failure = error instanceof Error ? error : new Error(String(error));
    this.Dispose();
    this.Session.Conflict.Emit({ Error: failure });
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.subscriptions.forEach((subscription) => subscription.Dispose());
    this.subscriptions = [];
  }
}
const defaultDocument = new FlowDocument();
const defaultFormatting = Object.fromEntries(
  [...properties].map((name) => [name, defaultDocument.GetValue(name)]).filter(([, value]) => value !== void 0)
);
function captureFormatting(engine) {
  return leaves(engine.Document.ToJSON()).filter((leaf) => leaf.end > leaf.start).map((leaf) => ({
    Start: leaf.start,
    End: leaf.end,
    Properties: Object.fromEntries(
      [...properties].map((name) => [
        name,
        leaf.props[name] ?? engine.Document.GetValue(name)
      ]).filter(([, value]) => value !== void 0)
    )
  }));
}
function coalesceFormats(changes) {
  changes.sort(
    (a, b) => a.Property < b.Property ? -1 : a.Property > b.Property ? 1 : a.Start - b.Start
  );
  const result = [];
  for (const change of changes) {
    const last = result.at(-1);
    if (last && last.Property === change.Property && last.End === change.Start && canonical(last.Value) === canonical(change.Value))
      last.End = change.End;
    else result.push({ ...change });
  }
  return result;
}
function formattingDifference(before, after) {
  const boundaries = [
    ...new Set(
      [...before, ...after].flatMap((span) => [span.Start, span.End])
    )
  ].sort((a, b) => a - b), changes = [];
  let oldIndex = 0, newIndex = 0;
  for (let i = 0; i < boundaries.length - 1; i++) {
    const Start = boundaries[i], End = boundaries[i + 1];
    while (oldIndex < before.length && before[oldIndex].End <= Start)
      oldIndex++;
    while (newIndex < after.length && after[newIndex].End <= Start) newIndex++;
    const old = before[oldIndex], next = after[newIndex];
    if (!old || !next || old.Start > Start || next.Start > Start) continue;
    for (const [Property, Value] of Object.entries(next.Properties))
      if (canonical(old.Properties[Property]) !== canonical(Value))
        changes.push({ Start, End, Property, Value });
  }
  return coalesceFormats(changes);
}
function textDifference(before, after) {
  let start = 0, suffix = 0;
  while (start < before.length && start < after.length && before[start] === after[start])
    start++;
  if (start > 0 && /[\uDC00-\uDFFF]/.test(before[start] ?? after[start] ?? ""))
    start--;
  while (suffix < before.length - start && suffix < after.length - start && before.at(-suffix - 1) === after.at(-suffix - 1))
    suffix++;
  if (suffix > 0 && /[\uDC00-\uDFFF]/.test(
    before[before.length - suffix] ?? after[after.length - suffix] ?? ""
  ))
    suffix--;
  return {
    Start: start,
    End: before.length - suffix,
    Text: after.slice(start, after.length - suffix)
  };
}
function validateProjection(root) {
  const inline = /* @__PURE__ */ new Set([
    "Run",
    "Span",
    "Bold",
    "Italic",
    "Underline",
    "Hyperlink",
    "LineBreak"
  ]);
  if (root.children?.some((child) => child.type !== "Paragraph"))
    throw new CollaborationConflictError(
      "Text collaboration binding supports root paragraphs; tables, lists and structural blocks require a host merge protocol."
    );
  const visit = (node) => {
    for (const child of node.children ?? []) {
      if (node.type !== "FlowDocument" && !inline.has(child.type))
        throw new CollaborationConflictError(
          "Text collaboration cannot project embedded objects or structural edits."
        );
      visit(child);
    }
  };
  visit(root);
}
export * from "./collaboration-document.js";
export {
  CollaborationBinding,
  CollaborationConflictError,
  CollaborativeTextSession
};
//# sourceMappingURL=collaboration.js.map
