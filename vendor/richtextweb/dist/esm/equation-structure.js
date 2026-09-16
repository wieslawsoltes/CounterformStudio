import { parseMarkup, textContent } from "./formats-markup.js";
import { sanitizeMathML, serializeMathNode } from "./equations.js";
const tokenNames = /* @__PURE__ */ new Set(["mi", "mn", "mo", "mtext"]);
const node = (name, children = []) => ({
  name,
  attrs: {},
  children
});
const token = (text, kind = "mi") => {
  if (typeof text !== "string" || text.length > 2048)
    throw new RangeError(
      "An equation token must be a string of at most 2048 characters."
    );
  return node(kind, [{ name: "#text", attrs: {}, children: [], text }]);
};
const placeholder = () => token("\u25A1");
function rootOf(source) {
  return parseMarkup(sanitizeMathML(source), true).children[0];
}
function pathNodes(root, path) {
  if (!Array.isArray(path) || path.length > 96)
    throw new RangeError("Invalid equation selection path.");
  const nodes = [root];
  for (const index of path) {
    const current = nodes.at(-1);
    if (!Number.isInteger(index) || index < 0 || !current.children[index])
      throw new RangeError("The selected equation node no longer exists.");
    nodes.push(current.children[index]);
  }
  return nodes;
}
function selectedMatrix(root, path) {
  const nodes = pathNodes(root, path);
  let depth = nodes.length - 1;
  while (depth >= 0 && nodes[depth].name !== "mtable") depth--;
  if (depth < 0 || nodes[depth + 1]?.name !== "mtr" || nodes[depth + 2]?.name !== "mtd")
    throw new TypeError("Select a symbol inside a matrix cell first.");
  const matrix = nodes[depth], rows = matrix.children;
  const columns = rows[0]?.children.length ?? 0;
  if (!rows.length || !columns || rows.length > 32 || columns > 32 || rows.some(
    (row) => row.name !== "mtr" || row.children.length !== columns || row.children.some(
      (cell) => cell.name !== "mtd" || Number(cell.attrs.rowspan || 1) !== 1 || Number(cell.attrs.columnspan || 1) !== 1
    )
  ))
    throw new TypeError(
      "Matrix editing requires a rectangular, unmerged matrix of at most 32 \xD7 32 cells."
    );
  return {
    matrix,
    position: {
      Path: path.slice(0, depth),
      Row: path[depth],
      Column: path[depth + 1],
      Rows: rows.length,
      Columns: columns
    }
  };
}
function equationMatrixAt(source, path) {
  return selectedMatrix(rootOf(source), path).position;
}
function editEquationMatrix(source, path, operation) {
  const root = rootOf(source), { matrix, position: p } = selectedMatrix(root, path);
  const cell = () => node("mtd", [placeholder()]);
  switch (operation) {
    case "InsertRowBefore":
    case "InsertRowAfter":
      if (p.Rows === 32)
        throw new RangeError("A matrix can have at most 32 rows.");
      matrix.children.splice(
        p.Row + Number(operation === "InsertRowAfter"),
        0,
        node("mtr", Array.from({ length: p.Columns }, cell))
      );
      break;
    case "DeleteRow":
      if (p.Rows === 1)
        throw new RangeError("A matrix must retain at least one row.");
      matrix.children.splice(p.Row, 1);
      break;
    case "InsertColumnBefore":
    case "InsertColumnAfter":
      if (p.Columns === 32)
        throw new RangeError("A matrix can have at most 32 columns.");
      for (const row of matrix.children)
        row.children.splice(
          p.Column + Number(operation === "InsertColumnAfter"),
          0,
          cell()
        );
      break;
    case "DeleteColumn":
      if (p.Columns === 1)
        throw new RangeError("A matrix must retain at least one column.");
      for (const row of matrix.children) row.children.splice(p.Column, 1);
      break;
    default:
      throw new TypeError("Unknown matrix edit operation.");
  }
  return sanitizeMathML(serializeMathNode(root));
}
function insertEquationToken(source, path, text, before = false) {
  const root = rootOf(source), nodes = pathNodes(root, path), selected = nodes.at(-1);
  if (!tokenNames.has(selected.name) || nodes.length < 2)
    throw new TypeError("Select an equation token first.");
  const parent = nodes.at(-2), index = path.at(-1);
  const next = token(
    text,
    /^\d+(?:\.\d+)?$/.test(text) ? "mn" : /^[+\-=<>×÷±∓]$/.test(text) ? "mo" : "mi"
  );
  if (["mrow", "math", "mtd", "msqrt", "mstyle"].includes(parent.name))
    parent.children.splice(index + Number(!before), 0, next);
  else
    parent.children[index] = node(
      "mrow",
      before ? [next, selected] : [selected, next]
    );
  return sanitizeMathML(serializeMathNode(root));
}
function deleteEquationToken(source, path) {
  const root = rootOf(source), nodes = pathNodes(root, path), selected = nodes.at(-1);
  if (!tokenNames.has(selected.name) || nodes.length < 2)
    throw new TypeError("Select an equation token first.");
  const parent = nodes.at(-2), index = path.at(-1);
  if (["mrow", "math", "mtd", "msqrt", "mstyle"].includes(parent.name) && parent.children.length > 1)
    parent.children.splice(index, 1);
  else parent.children[index] = placeholder();
  return sanitizeMathML(serializeMathNode(root));
}
function mathMLToLaTeX(source) {
  const root = rootOf(source);
  const escape = (text) => text.replace(
    /[\\{}#$%&_~^]/g,
    (c) => ({
      "\\": "\\backslash{}",
      "{": "\\{",
      "}": "\\}",
      "#": "\\#",
      $: "\\$",
      "%": "\\%",
      "&": "\\&",
      _: "\\_",
      "~": "\\textasciitilde{}",
      "^": "\\textasciicircum{}"
    })[c]
  );
  const variants = {
    normal: "mathrm",
    bold: "mathbf",
    italic: "mathit",
    "bold-italic": "boldsymbol",
    "double-struck": "mathbb",
    fraktur: "mathfrak",
    script: "mathcal",
    "sans-serif": "mathsf",
    monospace: "mathtt"
  };
  const delimiter = (text) => ({
    "{": "\\{",
    "}": "\\}",
    "": ".",
    "\u2016": "\\Vert",
    "\u2308": "\\lceil",
    "\u2309": "\\rceil",
    "\u230A": "\\lfloor",
    "\u230B": "\\rfloor",
    "\u27E8": "\\langle",
    "\u27E9": "\\rangle"
  })[text] ?? text;
  const convert = (n) => {
    if (n.name === "#text") return escape(n.text ?? "");
    const children = n.children.filter((c2) => c2.name !== "#text"), c = children.map(convert), a = n.attrs;
    let output2;
    switch (n.name) {
      case "math":
      case "mrow":
      case "mstyle":
      case "semantics":
      case "mtd":
        output2 = c.join(" ");
        break;
      case "mi":
      case "mn":
      case "mo":
      case "mtext": {
        const text = textContent(n);
        output2 = text === "\u2061" || text === "\u2062" ? "" : text === "\xA0" ? "~" : escape(text);
        if (n.name === "mtext") output2 = `\\text{${output2}}`;
        break;
      }
      case "mfrac":
        if (a.bevelled === "true")
          throw new TypeError(
            "Bevelled fractions need MathML input to preserve their layout."
          );
        output2 = a.linethickness === "0" || a.linethickness === "0px" ? `\\binom{${c[0]}}{${c[1]}}` : `\\frac{${c[0]}}{${c[1]}}`;
        break;
      case "msqrt":
        output2 = `\\sqrt{${c.join(" ")}}`;
        break;
      case "mroot":
        output2 = `\\sqrt[${c[1]}]{${c[0]}}`;
        break;
      case "msup":
        output2 = `{${c[0]}}^{${c[1]}}`;
        break;
      case "msub":
        output2 = `{${c[0]}}_{${c[1]}}`;
        break;
      case "msubsup":
        output2 = `{${c[0]}}_{${c[1]}}^{${c[2]}}`;
        break;
      case "mover":
      case "munder": {
        const marks = n.name === "mover" ? {
          "\xAF": "overline",
          "\u203E": "overline",
          "\u2192": "vec",
          "^": "hat",
          "\u02C6": "hat",
          "~": "tilde",
          "\u02DC": "tilde",
          "\u02D9": "dot",
          "\xA8": "ddot",
          "\u23DE": "overbrace"
        } : { _: "underline", "\u0332": "underline", "\u23DF": "underbrace" };
        const mark = marks[textContent(children[1])];
        output2 = mark ? `\\${mark}{${c[0]}}` : `\\${n.name === "mover" ? "overset" : "underset"}{${c[1]}}{${c[0]}}`;
        break;
      }
      case "munderover":
        output2 = `\\mathop{${c[0]}}\\limits_{${c[1]}}^{${c[2]}}`;
        break;
      case "mfenced": {
        const separators = Array.from(a.separators ?? ",");
        output2 = `\\left${delimiter(a.open ?? "(")} ${c.map((s, i) => (i ? escape(separators[Math.min(i - 1, separators.length - 1)] ?? "") : "") + s).join(" ")} \\right${delimiter(a.close ?? ")")}`;
        break;
      }
      case "mtable": {
        if (children.some((row) => row.name !== "mtr"))
          throw new TypeError("Labeled math rows require MathML input.");
        const cols = Math.max(1, ...children.map((row) => row.children.length));
        const aligns = (a.columnalign ?? "center").split(/\s+/);
        const specification = Array.from(
          { length: cols },
          (_, i) => ({ left: "l", right: "r", center: "c" })[aligns[Math.min(i, aligns.length - 1)]] ?? "c"
        ).join("");
        output2 = `\\begin{array}{${specification}}${c.join(" \\\\ ")}\\end{array}`;
        break;
      }
      case "mtr":
        output2 = c.join(" & ");
        break;
      case "mphantom":
        output2 = `\\phantom{${c.join(" ")}}`;
        break;
      case "menclose": {
        const command = {
          box: "boxed",
          updiagonalstrike: "cancel",
          downdiagonalstrike: "bcancel",
          "updiagonalstrike downdiagonalstrike": "xcancel"
        }[a.notation];
        if (!command) throw new TypeError("This enclosure needs MathML input.");
        output2 = `\\${command}{${c.join(" ")}}`;
        break;
      }
      case "mspace":
        if (a.width && !/^-?[\d.]+(?:em|ex|pt|px|mu)$/.test(a.width))
          throw new TypeError("This math spacing requires MathML input.");
        output2 = a.width ? `\\hspace{${a.width}}` : "";
        break;
      case "none":
      case "mprescripts":
        output2 = "";
        break;
      default:
        throw new TypeError(
          `MathML ${n.name} cannot be converted to TeX without losing structure. Keep MathML input.`
        );
    }
    if (a.mathvariant) {
      const variant = variants[a.mathvariant];
      if (!variant)
        throw new TypeError(`Unsupported TeX math variant: ${a.mathvariant}`);
      output2 = `\\${variant}{${output2}}`;
    }
    if (a.mathcolor) output2 = `{\\color{${a.mathcolor}} ${output2}}`;
    if (a.mathbackground || a.mathsize || a.rowspan || a.columnspan)
      throw new TypeError(
        "Math background, custom sizing, or merged cells require MathML input."
      );
    if (a.displaystyle)
      output2 = `{\\${a.displaystyle === "true" ? "displaystyle" : "textstyle"} ${output2}}`;
    return output2;
  };
  const output = convert(root);
  if (output.length > 16384)
    throw new RangeError("Converted TeX exceeds the 16 KiB input limit.");
  return output;
}
export {
  deleteEquationToken,
  editEquationMatrix,
  equationMatrixAt,
  insertEquationToken,
  mathMLToLaTeX
};
//# sourceMappingURL=equation-structure.js.map
