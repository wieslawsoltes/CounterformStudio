const dimension = (value, name, min, max) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max)
    throw new RangeError(`${name} must be a number between ${min} and ${max}.`);
  return value;
};
function pageMargins(value = 72) {
  if (typeof value === "number") {
    const n = dimension(value, "PagePadding", 0, 2e4);
    return { Left: n, Top: n, Right: n, Bottom: n };
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(
      "PagePadding must be a number or Left/Top/Right/Bottom margins."
    );
  const result = {};
  for (const key of ["Left", "Top", "Right", "Bottom"])
    result[key] = dimension(
      value[key],
      `PagePadding.${key}`,
      0,
      2e4
    );
  return result;
}
function validatePageSetup(current, options) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Page setup options must be an object.");
  const known = /* @__PURE__ */ new Set([
    "PageWidth",
    "PageHeight",
    "PagePadding",
    "ColumnCount",
    "ColumnGap",
    "HeaderDistance",
    "FooterDistance",
    "PageNumberStart",
    "DifferentFirstPage",
    "DifferentOddAndEvenPages"
  ]);
  for (const key of Object.keys(options)) {
    if (!known.has(key))
      throw new TypeError(`Unknown page setup property: ${key}`);
    if (options[key] === void 0)
      throw new TypeError(`Page setup property ${key} must have a value.`);
  }
  const next = {
    PageWidth: 794,
    PageHeight: 1123,
    PagePadding: 72,
    ColumnCount: 1,
    ColumnGap: 32,
    HeaderDistance: 8,
    FooterDistance: 8,
    PageNumberStart: 1
  };
  for (const key of known) {
    if (current[key] !== void 0)
      next[key] = current[key];
    if (Object.hasOwn(options, key))
      next[key] = options[key];
  }
  const width = dimension(next.PageWidth, "PageWidth", 96, 2e4);
  const height = dimension(next.PageHeight, "PageHeight", 96, 2e4);
  const margins = pageMargins(next.PagePadding);
  const columns = dimension(next.ColumnCount, "ColumnCount", 1, 12);
  if (!Number.isInteger(columns))
    throw new RangeError("ColumnCount must be an integer.");
  const gap = dimension(next.ColumnGap, "ColumnGap", 0, 2e4);
  if (margins.Left > width / 3 || margins.Right > width / 3 || margins.Top > height / 3 || margins.Bottom > height / 3)
    throw new RangeError(
      "Each margin must be no greater than one third of its paper dimension."
    );
  if (width - margins.Left - margins.Right - (columns - 1) * gap < columns * 24)
    throw new RangeError(
      "Page margins and column gaps must leave at least 24 pixels per text column."
    );
  if (height - margins.Top - margins.Bottom < 24)
    throw new RangeError(
      "Page margins must leave at least 24 pixels of body height."
    );
  dimension(next.HeaderDistance, "HeaderDistance", 0, margins.Top);
  dimension(next.FooterDistance, "FooterDistance", 0, margins.Bottom);
  if (!Number.isSafeInteger(next.PageNumberStart) || next.PageNumberStart < 1 || next.PageNumberStart > 1e6)
    throw new RangeError(
      "PageNumberStart must be an integer between 1 and 1000000."
    );
  for (const key of ["DifferentFirstPage", "DifferentOddAndEvenPages"])
    if (next[key] !== void 0 && typeof next[key] !== "boolean")
      throw new TypeError(`${key} must be boolean.`);
  const result = structuredClone(options);
  if (Object.hasOwn(result, "PagePadding")) result.PagePadding = margins;
  return result;
}
function pageStoryKey(props, kind, physicalPage) {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 1)
    throw new RangeError("Invalid physical page number.");
  const first = props.DifferentFirstPage ?? Array.isArray(props[`FirstPage${kind}`]);
  const even = props.DifferentOddAndEvenPages ?? Array.isArray(props[`EvenPage${kind}`]);
  if (physicalPage === 1 && first) return `FirstPage${kind}`;
  if (physicalPage % 2 === 0 && even) return `EvenPage${kind}`;
  return `${kind}s`;
}
function documentPageNumber(props, physicalPage) {
  const start = props.PageNumberStart;
  return physicalPage + (typeof start === "number" && Number.isSafeInteger(start) && start > 0 ? start - 1 : 0);
}
function pageStoryVariantEnabled(props, variant) {
  const explicit = props[variant === "FirstPage" ? "DifferentFirstPage" : "DifferentOddAndEvenPages"];
  return typeof explicit === "boolean" ? explicit : Array.isArray(props[`${variant}Header`]) || Array.isArray(props[`${variant}Footer`]);
}
export {
  documentPageNumber,
  pageMargins,
  pageStoryKey,
  pageStoryVariantEnabled,
  validatePageSetup
};
//# sourceMappingURL=page-setup.js.map
