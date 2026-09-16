function length(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+(?:\.\d+)?(?:px|pt)?$/.test(value.trim()))
    return parseFloat(value) * (value.trim().endsWith("pt") ? 4 / 3 : 1);
  return fallback;
}
function pageSettings(props) {
  const PageWidth = Math.max(96, Math.min(2e4, length(props.PageWidth, 794)));
  const PageHeight = Math.max(
    96,
    Math.min(2e4, length(props.PageHeight, 1123))
  );
  const raw = props.PagePadding ?? 72;
  let values;
  if (raw && typeof raw === "object")
    values = [
      raw.Top ?? raw.top,
      raw.Right ?? raw.right,
      raw.Bottom ?? raw.bottom,
      raw.Left ?? raw.left
    ].map((value) => length(value, 72));
  else if (typeof raw === "string" && /[,\s]/.test(raw.trim())) {
    const v = raw.trim().split(/[,\s]+/).map((value) => length(value, 72));
    values = raw.includes(",") && v.length === 4 ? [v[1], v[2], v[3], v[0]] : raw.includes(",") && v.length === 2 ? [v[1], v[0], v[1], v[0]] : [v[0], v[1] ?? v[0], v[2] ?? v[0], v[3] ?? v[1] ?? v[0]];
  } else values = Array(4).fill(length(raw, 72));
  const Padding = {
    Top: Math.max(0, Math.min(PageHeight / 3, values[0])),
    Right: Math.max(0, Math.min(PageWidth / 3, values[1])),
    Bottom: Math.max(0, Math.min(PageHeight / 3, values[2])),
    Left: Math.max(0, Math.min(PageWidth / 3, values[3]))
  };
  const hasFootnotes = Array.isArray(props.Footnotes) && props.Footnotes.length > 0;
  const FootnoteHeight = hasFootnotes ? Math.max(
    24,
    Math.min(PageHeight / 3, length(props.FootnoteAreaHeight, 96))
  ) : 0;
  let ContentWidth = PageWidth - Padding.Left - Padding.Right;
  const preferredWidth = length(props.ColumnWidth, 0);
  const deriveColumns = props.ColumnCount === void 0 && preferredWidth > 0;
  const requestedGap = Math.max(0, length(props.ColumnGap, 32));
  const ColumnCount = Math.max(1, Math.min(12, deriveColumns ? Math.floor((ContentWidth + requestedGap) / (preferredWidth + requestedGap)) : Math.floor(Number(props.ColumnCount) || 1)));
  const ColumnGap = Math.max(0, Math.min(ContentWidth / ColumnCount, requestedGap));
  if (deriveColumns && props.IsColumnWidthFlexible === false) {
    const fixedWidth = Math.min(ContentWidth, ColumnCount * preferredWidth + (ColumnCount - 1) * ColumnGap);
    Padding.Right += ContentWidth - fixedWidth;
    ContentWidth = fixedWidth;
  }
  return {
    PageWidth,
    PageHeight,
    Padding,
    ContentWidth,
    ContentHeight: Math.max(
      24,
      PageHeight - Padding.Top - Padding.Bottom - FootnoteHeight
    ),
    ColumnGap,
    ColumnCount,
    TextColumnWidth: Math.max(
      1,
      (ContentWidth - (ColumnCount - 1) * ColumnGap) / ColumnCount
    ),
    FootnoteHeight
  };
}
function measurePageLayout(surface, render, document, revision, settings) {
  const owner = surface.ownerDocument;
  const bounds = surface.getBoundingClientRect();
  const zoom = bounds.width / settings.ContentWidth || 1;
  const stride = (settings.ContentWidth + settings.ColumnGap) * zoom;
  const rtl = owner.defaultView?.getComputedStyle(surface).direction === "rtl";
  const pageOf = (rect) => Math.max(
    0,
    Math.floor(
      ((rtl ? bounds.right - rect.right : rect.left - bounds.left) + 0.5) / stride
    )
  );
  const pages = /* @__PURE__ */ new Map();
  const overflows = [];
  let largest = 0;
  const add = (index, start, end) => {
    largest = Math.max(largest, index);
    const page = pages.get(index);
    if (page) {
      page.start = Math.min(page.start, start);
      page.end = Math.max(page.end, end);
    } else pages.set(index, { start, end });
  };
  const range = owner.createRange();
  for (const leaf of render.leaves) {
    const element = leaf.node.nodeType === 1 ? leaf.node : leaf.node.parentElement;
    range.selectNodeContents(leaf.node);
    let rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.height > 0
    );
    if (!rects.length) rects = Array.from(element.getClientRects());
    const indices = [...new Set(rects.map(pageOf))].sort((a, b) => a - b);
    if (!indices.length) continue;
    if (leaf.node.nodeType !== 3 || indices.length === 1 || leaf.end <= leaf.start)
      add(indices[0], leaf.start, leaf.end);
    else {
      const size = leaf.node.textContent?.length || 0;
      const pageAt = (offset) => {
        range.setStart(leaf.node, offset);
        range.setEnd(leaf.node, Math.min(size, offset + 1));
        const rect = range.getClientRects()[0];
        return rect ? pageOf(rect) : indices[0];
      };
      const lowerBound = (page) => {
        let low = 0, high = size;
        while (low < high) {
          const mid = low + high >>> 1;
          if (pageAt(mid) < page) low = mid + 1;
          else high = mid;
        }
        return low;
      };
      for (const page of indices)
        add(
          page,
          leaf.start + lowerBound(page),
          leaf.start + lowerBound(page + 1)
        );
    }
    for (const rect of rects) {
      const PageNumber = pageOf(rect) + 1;
      if (rect.width / zoom > settings.TextColumnWidth + 1)
        overflows.push({
          ElementId: element.dataset.rtId || "",
          PageNumber,
          Reason: "width",
          Measured: rect.width / zoom,
          Available: settings.TextColumnWidth
        });
      if (leaf.atomic && rect.height / zoom > settings.ContentHeight + 1)
        overflows.push({
          ElementId: element.dataset.rtId || "",
          PageNumber,
          Reason: "height",
          Measured: rect.height / zoom,
          Available: settings.ContentHeight
        });
    }
  }
  for (const paragraph of render.paragraphs) {
    for (const rect of Array.from(paragraph.node.getClientRects())) {
      const index = pageOf(rect);
      largest = Math.max(largest, index);
      if (!pages.has(index)) add(index, paragraph.start, paragraph.start);
    }
  }
  const PageCount = Math.max(1, largest + 1);
  const Pages = [];
  const overflowPages = new Set(overflows.map((item) => item.PageNumber));
  for (let index = 0; index < PageCount; index++) {
    const current = pages.get(index);
    Pages.push({
      PageNumber: index + 1,
      StartOffset: current?.start ?? (Pages[index - 1]?.EndOffset || 0),
      EndOffset: current?.end ?? 0,
      HasOverflow: overflowPages.has(index + 1)
    });
  }
  Pages[0].StartOffset = 0;
  for (let index = 0; index < Pages.length; index++)
    Pages[index].EndOffset = index + 1 < Pages.length ? Pages[index + 1].StartOffset : render.length;
  return {
    ...settings,
    Method: "css-column-fragmentation",
    Revision: revision,
    PageCount,
    Pages,
    Overflows: overflows
  };
}
export {
  measurePageLayout,
  pageSettings
};
//# sourceMappingURL=pagination.js.map
