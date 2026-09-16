function pageAtOffset(layout, offset, backward = false) {
  if (!Number.isInteger(offset) || offset < 0)
    throw new RangeError("A page text offset must be a nonnegative integer.");
  const pages = layout.Pages;
  if (!pages.length) return null;
  if (offset === 0) return pages[0];
  let low = 0, high = pages.length;
  while (low < high) {
    const middle = low + high >>> 1;
    if (pages[middle].StartOffset < offset || !backward && pages[middle].StartOffset === offset)
      low = middle + 1;
    else high = middle;
  }
  return pages[Math.max(0, low - 1)];
}
function pagePreviewWindow(options) {
  const { PageCount, Columns, PageHeight, ViewportHeight, ScrollTop } = options;
  const gap = options.Gap ?? 24, overscan = options.OverscanRows ?? 1;
  if (![
    PageCount,
    Columns,
    PageHeight,
    ViewportHeight,
    ScrollTop,
    gap,
    overscan
  ].every(Number.isFinite) || !Number.isInteger(PageCount) || PageCount < 0 || !Number.isInteger(Columns) || Columns < 1 || Columns > 12 || PageHeight <= 0 || ViewportHeight < 0 || gap < 0 || !Number.isInteger(overscan) || overscan < 0 || overscan > 8)
    throw new RangeError("Invalid page preview window geometry.");
  if (!PageCount || !ViewportHeight) return [];
  const stride = PageHeight + gap;
  const first = Math.max(0, Math.floor(Math.max(0, ScrollTop) / stride));
  const last = Math.min(
    Math.ceil(PageCount / Columns) - 1,
    Math.floor(Math.max(0, ScrollTop + ViewportHeight - 1e-3) / stride)
  );
  const pages = [];
  const row = (index) => {
    if (index < 0) return;
    for (let column = 0; column < Columns; column++) {
      const page = index * Columns + column + 1;
      if (page <= PageCount && pages.length < 128) pages.push(page);
    }
  };
  for (let index = first; index <= last && pages.length < 128; index++)
    row(index);
  for (let distance = 1; distance <= overscan && pages.length < 128; distance++) {
    row(first - distance);
    row(last + distance);
  }
  return pages;
}
export {
  pageAtOffset,
  pagePreviewWindow
};
//# sourceMappingURL=page-window.js.map
