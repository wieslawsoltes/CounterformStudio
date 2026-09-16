const atomic = /* @__PURE__ */ new Set([
  "Equation",
  "Image",
  "InlineUIContainer",
  "BlockUIContainer",
  "Figure",
  "Floater"
]);
class DocumentVirtualizer {
  heights = /* @__PURE__ */ new Map();
  blocks = [];
  totalHeight = 0;
  width = 0;
  Index(document, availableWidth) {
    const width = Math.max(80, availableWidth);
    if (Math.abs(width - this.width) > 1) this.heights.clear();
    this.width = width;
    let position = 0, blockSeen = false, top = 0;
    const ids = /* @__PURE__ */ new Set();
    const measure = (node) => {
      if (node.type === "Paragraph" || node.type === "BlockUIContainer") {
        if (blockSeen) position++;
        blockSeen = true;
      }
      if (node.type === "Run") position += (node.text || "").length;
      else if (node.type === "LineBreak" || atomic.has(node.type)) position++;
      else node.children?.forEach(measure);
    };
    this.blocks = (document.children || []).map((node, Index) => {
      ids.add(node.id);
      const StartOffset = position;
      const previousBlock = blockSeen;
      measure(node);
      const chars = position - StartOffset;
      const font = Math.max(
        8,
        Number(node.props?.FontSize || document.props?.FontSize || 16)
      );
      const line = Math.max(font, Number(node.props?.LineHeight || font * 1.5));
      const estimate = Math.max(
        line + 12,
        Math.ceil(Math.max(1, chars) / Math.max(8, width / (font * 0.52))) * line + 12
      );
      const Height = this.heights.get(node.id) ?? estimate;
      const entry = {
        Id: node.id,
        Index,
        StartOffset,
        EndOffset: position,
        Height,
        Top: top,
        HasTextBlock: blockSeen || previousBlock
      };
      top += Height;
      return entry;
    });
    for (const id of this.heights.keys())
      if (!ids.has(id)) this.heights.delete(id);
    this.totalHeight = top;
  }
  SetMeasuredHeight(id, height) {
    if (!Number.isFinite(height) || height < 1) return false;
    if (Math.abs((this.heights.get(id) ?? -1) - height) < 0.5) return false;
    this.heights.set(id, height);
    return true;
  }
  BlockAtOffset(offset) {
    let low = 0, high = this.blocks.length - 1;
    while (low < high) {
      const mid = low + high + 1 >>> 1;
      if (this.blocks[mid].StartOffset <= offset) low = mid;
      else high = mid - 1;
    }
    return this.blocks[low];
  }
  Window(scrollTop, viewportHeight, overscan, selection) {
    const blocks = this.blocks;
    const atHeight = (height) => {
      let low = 0, high = Math.max(0, blocks.length - 1);
      while (low < high) {
        const mid = low + high + 1 >>> 1;
        if (blocks[mid].Top <= height) low = mid;
        else high = mid - 1;
      }
      return low;
    };
    const first = Math.max(0, atHeight(Math.max(0, scrollTop)) - overscan);
    const last = Math.min(
      blocks.length - 1,
      atHeight(Math.max(0, scrollTop + viewportHeight)) + overscan
    );
    const Realized = /* @__PURE__ */ new Set();
    for (let index = first; index <= last; index++) Realized.add(index);
    const initialCount = Realized.size;
    if (selection) {
      const start = this.BlockAtOffset(Math.min(selection.Start, selection.End))?.Index ?? 0;
      const end = this.BlockAtOffset(Math.max(selection.Start, selection.End))?.Index ?? start;
      for (let index = Math.max(0, start - 1); index <= Math.min(blocks.length - 1, end + 1); index++)
        Realized.add(index);
    }
    return {
      Blocks: blocks,
      Realized,
      Statistics: {
        Active: true,
        TotalBlocks: blocks.length,
        RealizedBlocks: Realized.size,
        EstimatedHeight: this.totalHeight,
        FirstVisibleBlock: first,
        LastVisibleBlock: Math.max(first, last),
        SelectionExpanded: Realized.size > initialCount
      }
    };
  }
}
export {
  DocumentVirtualizer
};
//# sourceMappingURL=virtualization.js.map
