const entities = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\xA0",
  ndash: "\u2013",
  mdash: "\u2014",
  bull: "\u2022",
  hellip: "\u2026",
  copy: "\xA9",
  reg: "\xAE",
  trade: "\u2122",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D"
};
function decodeEntities(value) {
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi,
    (all, key) => {
      if (key[0] !== "#") return entities[key.toLowerCase()] ?? all;
      const n = key[1]?.toLowerCase() === "x" ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return n > 0 && n <= 1114111 && !(n >= 55296 && n <= 57343) ? String.fromCodePoint(n) : "\uFFFD";
    }
  );
}
const escapeMarkup = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
function parseMarkup(source, xml = false) {
  if (source.length > 32 * 1024 * 1024)
    throw new RangeError("Markup exceeds the 32 MiB import limit.");
  if (xml && /<!DOCTYPE|<!ENTITY/i.test(source))
    throw new Error("DTD and custom XML entities are not supported.");
  const root = { name: "#root", attrs: {}, children: [] };
  const stack = [root];
  const voidTags = /* @__PURE__ */ new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ]);
  let i = 0, count = 0;
  const addText = (text) => {
    if (text)
      stack[stack.length - 1].children.push({
        name: "#text",
        attrs: {},
        children: [],
        text: decodeEntities(text)
      });
  };
  while (i < source.length) {
    if (++count > 5e5)
      throw new RangeError("Markup exceeds the node limit.");
    if (source[i] !== "<") {
      const end2 = source.indexOf("<", i);
      addText(source.slice(i, end2 < 0 ? source.length : end2));
      i = end2 < 0 ? source.length : end2;
      continue;
    }
    if (source.startsWith("<!--", i)) {
      const end2 = source.indexOf("-->", i + 4);
      i = end2 < 0 ? source.length : end2 + 3;
      continue;
    }
    if (source.startsWith("<![CDATA[", i)) {
      const end2 = source.indexOf("]]>", i + 9);
      addText(source.slice(i + 9, end2 < 0 ? source.length : end2));
      i = end2 < 0 ? source.length : end2 + 3;
      continue;
    }
    let end = i + 1, quote = "";
    for (; end < source.length; end++) {
      const c = source[end];
      if (quote) {
        if (c === quote) quote = "";
      } else if (c === '"' || c === "'") quote = c;
      else if (c === ">") break;
    }
    if (end >= source.length) {
      addText(source.slice(i));
      break;
    }
    const raw = source.slice(i + 1, end);
    i = end + 1;
    if (/^[!?]/.test(raw)) continue;
    const closing = /^\s*\//.test(raw);
    const match = raw.match(/^\s*\/?\s*([A-Za-z_][\w:.-]*)/);
    if (!match) {
      addText("<" + raw + ">");
      continue;
    }
    const name = xml ? match[1] : match[1].toLowerCase();
    if (closing) {
      const index = stack.map((n) => n.name).lastIndexOf(name);
      if (index > 0) stack.length = index;
      continue;
    }
    const attrs = /* @__PURE__ */ Object.create(null);
    const attrSource = raw.slice(match[0].length).replace(/\/\s*$/, "");
    const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attr;
    while (attr = re.exec(attrSource)) {
      const key = xml ? attr[1] : attr[1].toLowerCase();
      if (key !== "__proto__" && key !== "constructor" && key !== "prototype")
        attrs[key] = decodeEntities(attr[2] ?? attr[3] ?? attr[4] ?? "");
    }
    const node = { name, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!/\/\s*$/.test(raw) && !(voidTags.has(name) && !xml)) {
      if (stack.length > 256)
        throw new RangeError("Markup nesting exceeds 256 levels.");
      stack.push(node);
    }
  }
  return root;
}
function textContent(node) {
  return node.text ?? node.children.map(textContent).join("");
}
function descendants(node, name) {
  const result = [];
  const visit = (n) => {
    if (n.name === name) result.push(n);
    for (const c of n.children) visit(c);
  };
  visit(node);
  return result;
}
function child(node, name) {
  return node?.children.find((n) => n.name === name);
}
function safeURL(value, image = false) {
  const text = String(value ?? "").trim();
  if (!text || /[\u0000-\u0020\u007f]/.test(text)) return "";
  if (image && /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(text))
    return text;
  if (/^(?:https?:|blob:)/i.test(text) || !image && /^(?:mailto:|tel:)/i.test(text))
    return text;
  if (/^[#/?]|^\.\.?\//.test(text)) return text;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text) && !/[<>"'`\\]/.test(text))
    return text;
  return "";
}
export {
  child,
  decodeEntities,
  descendants,
  escapeMarkup,
  parseMarkup,
  safeURL,
  textContent
};
//# sourceMappingURL=formats-markup.js.map
