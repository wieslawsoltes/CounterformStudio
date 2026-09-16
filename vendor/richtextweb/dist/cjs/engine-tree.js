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
var engine_tree_exports = {};
__export(engine_tree_exports, {
  clone: () => clone,
  deleteRange: () => deleteRange,
  effectiveProps: () => effectiveProps,
  formatRange: () => formatRange,
  inlineText: () => inlineText,
  insertText: () => insertText,
  leaves: () => leaves,
  makeNode: () => makeNode,
  mapMetadata: () => mapMetadata,
  newIds: () => newIds,
  plainText: () => plainText,
  pointBlock: () => pointBlock,
  run: () => run,
  sliceInlines: () => sliceInlines,
  textBlocks: () => textBlocks,
  uid: () => uid
});
module.exports = __toCommonJS(engine_tree_exports);
let sequence = 0;
const uid = () => globalThis.crypto?.randomUUID?.() ?? `rtw-${Date.now().toString(36)}-${(++sequence).toString(36)}`;
const clone = (value) => structuredClone(value);
const makeNode = (type, children = [], props = {}) => ({ type, id: uid(), props, children });
const run = (text, props = {}) => ({ type: "Run", id: uid(), props: { ...props }, text });
function newIds(node) {
  const copy = clone(node);
  const visit = (n) => {
    n.id = uid();
    n.children?.forEach(visit);
  };
  visit(copy);
  return copy;
}
function inlineText(node) {
  if (node.type === "Run") return node.text ?? "";
  if (node.type === "LineBreak") return "\n";
  if ([
    "Equation",
    "Image",
    "InlineUIContainer",
    "BlockUIContainer",
    "Figure",
    "Floater"
  ].includes(node.type))
    return "\uFFFC";
  return (node.children ?? []).map(inlineText).join("");
}
function textBlocks(root) {
  const result = [];
  let offset = 0;
  const visit = (node) => (node.children ?? []).forEach((child, index) => {
    if (child.type === "Paragraph" || child.type === "BlockUIContainer") {
      if (result.length) offset++;
      const text = inlineText(child);
      result.push({
        node: child,
        parent: node,
        index,
        start: offset,
        end: offset + text.length,
        text
      });
      offset += text.length;
    } else visit(child);
  });
  visit(root);
  return result;
}
const plainText = (root) => textBlocks(root).map((block) => block.text).join("\n");
function effectiveProps(node, inherited = {}) {
  const semantic = node.type === "Bold" ? { FontWeight: "Bold" } : node.type === "Italic" ? { FontStyle: "Italic" } : node.type === "Underline" ? { TextDecorations: "Underline" } : {};
  return { ...inherited, ...semantic, ...node.props };
}
function leaves(root) {
  const result = [];
  let offset = 0;
  let hasBlock = false;
  const visit = (node, inherited) => {
    const props = effectiveProps(node, inherited);
    if (node.type === "Paragraph" || node.type === "BlockUIContainer") {
      if (hasBlock) offset++;
      hasBlock = true;
    }
    if ([
      "Run",
      "LineBreak",
      "Equation",
      "Image",
      "InlineUIContainer",
      "BlockUIContainer",
      "Figure",
      "Floater"
    ].includes(node.type)) {
      const length = inlineText(node).length;
      result.push({ node, start: offset, end: offset + length, props });
      offset += length;
    } else (node.children ?? []).forEach((child) => visit(child, props));
  };
  visit(root, {});
  return result;
}
function sliceInlines(nodes, start, end, fresh = false) {
  const result = [];
  let offset = 0;
  for (const node of nodes) {
    const length = inlineText(node).length;
    const from = Math.max(0, start - offset), to = Math.min(length, end - offset);
    if (to > from) {
      let copy = clone(node);
      if (copy.type === "Run") copy.text = (copy.text ?? "").slice(from, to);
      else if (copy.children && ![
        "InlineUIContainer",
        "Equation",
        "Image",
        "Figure",
        "Floater"
      ].includes(copy.type))
        copy.children = sliceInlines(copy.children, from, to);
      if (fresh) copy = newIds(copy);
      result.push(copy);
    }
    offset += length;
  }
  return result;
}
function pointBlock(root, offset) {
  let blocks = textBlocks(root);
  if (!blocks.length) {
    (root.children ??= []).push(makeNode("Paragraph"));
    blocks = textBlocks(root);
  }
  return blocks.find((block) => offset >= block.start && offset <= block.end) ?? blocks[blocks.length - 1];
}
function deleteRange(root, start, end) {
  if (end <= start) return;
  const single = leaves(root).find(
    (leaf) => leaf.node.type === "Run" && start >= leaf.start && end <= leaf.end
  );
  if (single) {
    const value = single.node.text ?? "";
    single.node.text = value.slice(0, start - single.start) + value.slice(end - single.start);
    return;
  }
  const blocks = textBlocks(root), first = blocks.find((block) => start >= block.start && start <= block.end) ?? blocks[0];
  const last = blocks.find((block) => end >= block.start && end <= block.end) ?? blocks[blocks.length - 1];
  if (!first || !last) return;
  for (const block of blocks) {
    if (block.end < start || block.start > end) continue;
    const from = Math.max(0, start - block.start), to = Math.min(block.text.length, end - block.start);
    if (block.node.type === "BlockUIContainer") {
      if (from === 0 && to >= 1) {
        block.node.type = "Paragraph";
        block.node.children = [];
        block.node.props = {};
      }
    } else if (to > from)
      block.node.children = [
        ...sliceInlines(block.node.children ?? [], 0, from),
        ...sliceInlines(block.node.children ?? [], to, block.text.length, true)
      ];
  }
  if (first !== last && first.parent === last.parent && first.node.type === "Paragraph" && last.node.type === "Paragraph") {
    const siblings = first.parent.children;
    const from = siblings.indexOf(first.node), to = siblings.indexOf(last.node);
    if (to > from && siblings.slice(from, to + 1).every((node) => node.type === "Paragraph")) {
      first.node.children = [
        ...first.node.children ?? [],
        ...last.node.children ?? []
      ];
      siblings.splice(from + 1, to - from);
    }
  }
}
function insertText(root, offset, text, props) {
  if (!text.includes("\n") && !text.includes("\r")) {
    const list = leaves(root), leaf = list.find(
      (item) => item.node.type === "Run" && item.start < offset && item.end >= offset
    ) ?? list.find((item) => item.node.type === "Run" && item.start === offset);
    if (leaf && Object.entries(props).every(
      ([name, value]) => JSON.stringify(leaf.props[name]) === JSON.stringify(value)
    )) {
      const local2 = offset - leaf.start, value = leaf.node.text ?? "";
      leaf.node.text = value.slice(0, local2) + text + value.slice(local2);
      return offset + text.length;
    }
  }
  const block = pointBlock(root, offset);
  if (block.node.type !== "Paragraph") {
    const paragraph = makeNode("Paragraph");
    block.parent.children.splice(
      block.index + (offset > block.start ? 1 : 0),
      0,
      paragraph
    );
    return insertText(
      root,
      textBlocks(root).find((item) => item.node === paragraph).start,
      text,
      props
    );
  }
  const local = Math.min(block.text.length, Math.max(0, offset - block.start));
  const wrappers = [];
  const findWrapper = (nodes, at) => {
    let position = 0;
    for (const node of nodes) {
      const length = inlineText(node).length;
      if (at > position && at <= position + length || at === 0 && position === 0) {
        if (node.type === "Hyperlink") wrappers.push(node);
        if (node.children && !["Equation", "Image", "InlineUIContainer"].includes(node.type))
          findWrapper(node.children, at - position);
        break;
      }
      position += length;
    }
  };
  findWrapper(block.node.children ?? [], local);
  const insertion = (value) => wrappers.reduceRight(
    (child, wrapper) => makeNode(wrapper.type, [child], clone(wrapper.props)),
    run(value, props)
  );
  const before = sliceInlines(block.node.children ?? [], 0, local), after = sliceInlines(
    block.node.children ?? [],
    local,
    block.text.length,
    true
  );
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length === 1)
    block.node.children = [
      ...before,
      ...text ? [insertion(text)] : [],
      ...after
    ];
  else {
    block.node.children = [
      ...before,
      ...lines[0] ? [insertion(lines[0])] : []
    ];
    const created = lines.slice(1).map(
      (line, index) => makeNode(
        "Paragraph",
        [
          ...line ? [insertion(line)] : [],
          ...index === lines.length - 2 ? after : []
        ],
        {
          ...block.node.props,
          BreakPageBefore: false,
          BreakColumnBefore: false
        }
      )
    );
    block.parent.children.splice(block.index + 1, 0, ...created);
  }
  return offset + lines.join("\n").length;
}
function formatRange(root, start, end, property, value) {
  const walk = (node, base) => {
    const length = inlineText(node).length;
    if (base >= end || base + length <= start) return [node];
    if (node.type === "Run" || [
      "Equation",
      "Image",
      "InlineUIContainer",
      "LineBreak",
      "Figure",
      "Floater"
    ].includes(node.type)) {
      const from = Math.max(0, start - base), to = Math.min(length, end - base);
      const before = sliceInlines([node], 0, from), middle = sliceInlines([node], from, to, from > 0), after = sliceInlines([node], to, length, true);
      for (const item of middle) {
        if (value === void 0) delete item.props[property];
        else item.props[property] = clone(value);
      }
      return [...before, ...middle, ...after];
    }
    let offset = base;
    node.children = (node.children ?? []).flatMap((child) => {
      const at = offset;
      offset += inlineText(child).length;
      return walk(child, at);
    });
    return [node];
  };
  for (const block of textBlocks(root)) {
    if (block.node.type !== "Paragraph") continue;
    let offset = block.start;
    block.node.children = (block.node.children ?? []).flatMap((child) => {
      const at = offset;
      offset += inlineText(child).length;
      return walk(child, at);
    });
  }
}
function mapMetadata(root, start, end, insertedLength) {
  const shift = insertedLength - (end - start);
  const move = (value, trailing) => value < start ? value : value > end ? value + shift : start + (trailing ? insertedLength : 0);
  const items = root.props.Annotations;
  if (Array.isArray(items))
    for (const item of items) {
      if (item.Kind === "Formatting") {
        for (const change of item.Data?.PropertyChanges ?? [])
          if (change.Scope === "Inline") {
            change.Start = move(change.Start, false);
            change.End = Math.max(change.Start, move(change.End, true));
          }
      }
      if (item.Kind === "Move" && Number.isInteger(item.Data?.SourceStart))
        item.Data.SourceStart = move(item.Data.SourceStart, false);
      item.Start = move(item.Start, false);
      item.End = item.Kind === "Deletion" ? item.Start : Math.max(item.Start, move(item.End, true));
    }
}
//# sourceMappingURL=engine-tree.js.map
