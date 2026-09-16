import {
  FlowDocument,
  Run,
  Table,
  elementFromJSON
} from "./model.js";
const copy = (value) => structuredClone(value);
const stable = (value) => JSON.stringify(
  value,
  (_key, item) => item && typeof item === "object" && !Array.isArray(item) ? Object.fromEntries(
    Object.keys(item).sort().map((key) => [key, item[key]])
  ) : item
);
const equal = (a, b) => stable(a) === stable(b);
class PatchConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "PatchConflictError";
  }
}
class DocumentObserverError extends Error {
  constructor(Errors) {
    super("The document change committed, but a document observer failed.");
    this.Errors = Errors;
    this.name = "DocumentObserverError";
  }
  Errors;
  Committed = true;
}
function textFingerprint(value) {
  let a = 2166136261, b = 2246822519;
  for (let i = 0; i < value.length; i++) {
    a = Math.imul(a ^ value.charCodeAt(i), 16777619);
    b = Math.imul(b ^ value.charCodeAt(i), 3266489917);
  }
  return `${value.length}:${a >>> 0}:${b >>> 0}`;
}
function CreateDocumentPatch(before, after) {
  if (before.id !== after.id || before.type !== after.type)
    throw new TypeError("Patch roots must have the same identity and type.");
  const diff = (a, b) => {
    const result = { Id: a.id, Type: a.type }, props = [];
    for (const Name of /* @__PURE__ */ new Set([
      ...Object.keys(a.props),
      ...Object.keys(b.props)
    ])) {
      const HadBefore = Object.hasOwn(a.props, Name), HasAfter = Object.hasOwn(b.props, Name);
      if (HadBefore !== HasAfter || !equal(a.props[Name], b.props[Name]))
        props.push({
          Name,
          HadBefore,
          HasAfter,
          ...HadBefore ? { Before: copy(a.props[Name]) } : {},
          ...HasAfter ? { After: copy(b.props[Name]) } : {}
        });
    }
    if (props.length) result.Properties = props;
    if ((a.text ?? "") !== (b.text ?? "")) {
      const old2 = a.text ?? "", next2 = b.text ?? "";
      let prefix2 = 0, suffix2 = 0;
      while (prefix2 < old2.length && prefix2 < next2.length && old2[prefix2] === next2[prefix2])
        prefix2++;
      while (suffix2 < old2.length - prefix2 && suffix2 < next2.length - prefix2 && old2.at(-suffix2 - 1) === next2.at(-suffix2 - 1))
        suffix2++;
      result.Text = {
        Offset: prefix2,
        Removed: old2.slice(prefix2, old2.length - suffix2),
        Inserted: next2.slice(prefix2, next2.length - suffix2),
        BeforeFingerprint: textFingerprint(old2),
        AfterFingerprint: textFingerprint(next2)
      };
    }
    const old = a.children ?? [], next = b.children ?? [];
    let prefix = 0, suffix = 0;
    const same = (x, y) => x.id === y.id && x.type === y.type;
    while (prefix < old.length && prefix < next.length && same(old[prefix], next[prefix]))
      prefix++;
    while (suffix < old.length - prefix && suffix < next.length - prefix && same(old[old.length - suffix - 1], next[next.length - suffix - 1]))
      suffix++;
    if (prefix + suffix < old.length || prefix + suffix < next.length)
      result.Children = {
        Index: prefix,
        Removed: copy(old.slice(prefix, old.length - suffix)),
        Inserted: copy(next.slice(prefix, next.length - suffix))
      };
    const descendants = [];
    for (let i = 0; i < prefix; i++) {
      const change = diff(old[i], next[i]);
      if (change) descendants.push(change);
    }
    for (let i = 0; i < suffix; i++) {
      const change = diff(
        old[old.length - suffix + i],
        next[next.length - suffix + i]
      );
      if (change) descendants.push(change);
    }
    if (descendants.length) result.Descendants = descendants;
    return result.Properties || result.Text || result.Children || result.Descendants ? result : void 0;
  };
  const Change = diff(before, after);
  return Change ? { Version: 1, RootId: before.id, Change } : void 0;
}
function InvertDocumentPatch(patch) {
  const invert = (change) => ({
    Id: change.Id,
    Type: change.Type,
    ...change.Properties ? {
      Properties: change.Properties.map((p) => ({
        Name: p.Name,
        HadBefore: p.HasAfter,
        HasAfter: p.HadBefore,
        ...p.HasAfter ? { Before: copy(p.After) } : {},
        ...p.HadBefore ? { After: copy(p.Before) } : {}
      }))
    } : {},
    ...change.Text ? {
      Text: {
        Offset: change.Text.Offset,
        Removed: change.Text.Inserted,
        Inserted: change.Text.Removed,
        BeforeFingerprint: change.Text.AfterFingerprint,
        AfterFingerprint: change.Text.BeforeFingerprint
      }
    } : {},
    ...change.Children ? {
      Children: {
        Index: change.Children.Index,
        Removed: copy(change.Children.Inserted),
        Inserted: copy(change.Children.Removed)
      }
    } : {},
    ...change.Descendants ? { Descendants: change.Descendants.map(invert) } : {}
  });
  return { Version: 1, RootId: patch.RootId, Change: invert(patch.Change) };
}
function ApplyPatchToJSON(document, patch) {
  if (patch.Version !== 1 || patch.RootId !== document.id)
    throw new PatchConflictError(
      "Patch document identity or version does not match."
    );
  const root = copy(document);
  const apply = (node, change) => {
    if (node.id !== change.Id || node.type !== change.Type)
      throw new PatchConflictError(
        `Element ${change.Id} is missing or has changed type.`
      );
    for (const prop of change.Properties ?? []) {
      if (Object.hasOwn(node.props, prop.Name) !== prop.HadBefore || prop.HadBefore && !equal(node.props[prop.Name], prop.Before))
        throw new PatchConflictError(
          `Property ${prop.Name} changed after this operation.`
        );
      if (prop.HasAfter)
        Object.defineProperty(node.props, prop.Name, {
          value: copy(prop.After),
          writable: true,
          configurable: true,
          enumerable: true
        });
      else delete node.props[prop.Name];
    }
    if (change.Text) {
      const { Offset, Removed, Inserted } = change.Text, text = node.text ?? "";
      if (!Number.isInteger(Offset) || Offset < 0 || text.slice(Offset, Offset + Removed.length) !== Removed || Offset > text.length || textFingerprint(text) !== change.Text.BeforeFingerprint)
        throw new PatchConflictError(
          "Text patch no longer matches its target."
        );
      node.text = text.slice(0, Offset) + Inserted + text.slice(Offset + Removed.length);
      if (textFingerprint(node.text) !== change.Text.AfterFingerprint)
        throw new PatchConflictError(
          "Text patch result fingerprint is invalid."
        );
    }
    for (const childChange of change.Descendants ?? []) {
      const child = node.children?.find((n) => n.id === childChange.Id);
      if (!child)
        throw new PatchConflictError(
          `Child ${childChange.Id} no longer exists.`
        );
      apply(child, childChange);
    }
    if (change.Children) {
      const { Index, Removed, Inserted } = change.Children, children = node.children ??= [];
      if (!Number.isInteger(Index) || Index < 0 || Index > children.length || !equal(children.slice(Index, Index + Removed.length), Removed))
        throw new PatchConflictError(
          "Structural patch no longer matches its target children."
        );
      children.splice(Index, Removed.length, ...copy(Inserted));
    }
  };
  apply(root, patch.Change);
  return root;
}
function ReconcileDocument(document, target) {
  const input = copy(target);
  input.id = document.Id;
  const normalized = FlowDocument.FromJSON(input).ToJSON();
  const live = /* @__PURE__ */ new Map(), old = /* @__PURE__ */ new Map(), wanted = /* @__PURE__ */ new Map();
  const scanLive = (element) => {
    live.set(element.Id, element);
    for (const child of element.Children) scanLive(child);
  };
  scanLive(document);
  const scanOld = (node) => {
    old.set(node.id, node);
    node.children?.forEach(scanOld);
  };
  scanOld(document.ToJSON());
  const scanWanted = (node, parent) => {
    wanted.set(node.id, { node, parent });
    node.children?.forEach((child) => scanWanted(child, node.id));
  };
  scanWanted(normalized);
  const observerErrors = [];
  const attempt = (action) => {
    try {
      action();
    } catch (error) {
      observerErrors.push(error);
    }
  };
  document.BeginChange();
  try {
    for (const element of live.values()) {
      if (element === document || !element.Parent) continue;
      const target2 = wanted.get(element.Id), parent = wanted.get(element.Parent.Id);
      if (!target2 || target2.parent !== element.Parent.Id || target2.node.type !== element.Type || !parent || parent.node.type !== element.Parent.Type)
        attempt(() => {
          element._collection?.Remove(element);
        });
    }
    const reconcile = (node) => {
      let element = live.get(node.id);
      if (!element || element.Type !== node.type)
        element = elementFromJSON({ ...copy(node), children: [] });
      const before = old.get(node.id)?.props ?? element.ToJSON().props;
      for (const name of /* @__PURE__ */ new Set([
        ...Object.keys(before),
        ...Object.keys(node.props)
      ])) {
        if (name === "Columns" && element instanceof Table) {
          if (!equal(before.Columns, node.props.Columns)) {
            const table = element, existing = new Map(
              table.Columns.ToArray().map((column) => [column.Id, column])
            );
            const columns = (node.props.Columns ?? []).map(
              (column) => {
                const instance = existing.get(column.id);
                if (!instance) return elementFromJSON(column);
                const previous = instance.ToJSON().props;
                for (const key of /* @__PURE__ */ new Set([
                  ...Object.keys(previous),
                  ...Object.keys(column.props)
                ])) {
                  if (!Object.hasOwn(column.props, key))
                    attempt(() => instance.ClearValue(key));
                  else if (!equal(previous[key], column.props[key]))
                    attempt(() => instance.SetValue(key, column.props[key]));
                }
                return instance;
              }
            );
            for (const column of table.Columns.ToArray())
              if (!columns.includes(column))
                attempt(() => {
                  table.Columns.Remove(column);
                });
            columns.forEach((column, index) => {
              if (table.Columns.at(index) !== column) {
                attempt(() => {
                  column._collection?.Remove(column);
                });
                attempt(() => table.Columns.Insert(index, column));
              }
            });
          }
          continue;
        }
        if (!Object.hasOwn(node.props, name))
          attempt(() => element.ClearValue(name));
        else if (!equal(before[name], node.props[name]))
          attempt(() => element.SetValue(name, copy(node.props[name])));
      }
      if (element instanceof Run && element.Text !== (node.text ?? "")) {
        const run = element;
        attempt(() => {
          run.Text = node.text ?? "";
        });
      }
      const collection = element._getChildCollection?.() ?? ["Blocks", "Inlines", "ListItems", "RowGroups", "Rows", "Cells"].map((name) => element[name]).find((value) => value?.Owner === element);
      if (collection) {
        const children = (node.children ?? []).map(reconcile);
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (collection.at(i) === child) continue;
          attempt(() => {
            child._collection?.Remove(child);
          });
          attempt(() => collection.Insert(i, child));
        }
        while (collection.Count > children.length) {
          const before2 = collection.Count;
          attempt(() => collection.RemoveAt(collection.Count - 1));
          if (collection.Count === before2) break;
        }
      } else if (node.children?.length)
        throw new TypeError(
          `No child collection is available for ${element.Type}.`
        );
      return element;
    };
    reconcile(normalized);
  } finally {
    attempt(() => document.EndChange());
  }
  if (!equal(document.ToJSON(), normalized))
    throw new PatchConflictError(
      "Live reconciliation could not commit the validated target document."
    );
  if (observerErrors.length) throw new DocumentObserverError(observerErrors);
}
function ApplyDocumentPatch(document, patch) {
  const target = ApplyPatchToJSON(document.ToJSON(), patch);
  ReconcileDocument(document, target);
}
function PatchByteLength(patch) {
  return new TextEncoder().encode(JSON.stringify(patch)).length;
}
export {
  ApplyDocumentPatch,
  ApplyPatchToJSON,
  CreateDocumentPatch,
  DocumentObserverError,
  InvertDocumentPatch,
  PatchByteLength,
  PatchConflictError,
  ReconcileDocument
};
//# sourceMappingURL=history.js.map
