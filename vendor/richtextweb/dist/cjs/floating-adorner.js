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
var floating_adorner_exports = {};
__export(floating_adorner_exports, {
  FloatingObjectAdorner: () => FloatingObjectAdorner,
  floatingAdornerCSS: () => floatingAdornerCSS
});
module.exports = __toCommonJS(floating_adorner_exports);
class FloatingObjectAdorner {
  constructor(host, surface, viewport) {
    this.host = host;
    this.surface = surface;
    this.viewport = viewport;
    const owner = host.ownerDocument;
    this.layer = owner.createElement("div");
    this.layer.className = "rt-object-adorner";
    this.layer.setAttribute("part", "object-adorner");
    this.layer.hidden = true;
    for (const grip of ["move", "nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
      const button = owner.createElement("button");
      button.type = "button";
      button.dataset.grip = grip;
      button.className = `rt-object-grip rt-object-${grip}`;
      button.setAttribute(
        "aria-label",
        grip === "move" ? "Move selected object" : `Resize selected object ${grip}`
      );
      button.textContent = grip === "move" ? "Move" : "";
      button.addEventListener(
        "pointerdown",
        (event) => this.begin(event, grip)
      );
      button.addEventListener("pointermove", (event) => this.move(event));
      button.addEventListener("pointerup", (event) => this.end(event, false));
      button.addEventListener(
        "pointercancel",
        (event) => this.end(event, true)
      );
      button.addEventListener("keydown", (event) => this.key(event, grip));
      this.layer.append(button);
    }
    viewport.append(this.layer);
    const signal = this.abort.signal;
    host.addEventListener(
      "objectselectionchange",
      (event) => {
        this.selected = event.detail.elementId;
        this.Refresh();
      },
      { signal }
    );
    host.addEventListener("documentchange", () => this.Refresh(), { signal });
    host.addEventListener("commandstatechange", () => this.Refresh(), {
      signal
    });
    viewport.addEventListener("scroll", () => this.Refresh(), {
      signal,
      passive: true
    });
    surface.addEventListener("load", () => this.Refresh(), {
      signal,
      capture: true
    });
  }
  host;
  surface;
  viewport;
  layer;
  selected = null;
  abort = new AbortController();
  drag = null;
  node() {
    const walk = (node) => node.id === this.selected ? node : node.children?.map(walk).find(Boolean);
    return walk(this.host.Document.ToJSON());
  }
  element() {
    return Array.from(
      this.surface.querySelectorAll("[data-rt-id]")
    ).find((element) => element.dataset.rtId === this.selected);
  }
  Refresh() {
    const target = this.element();
    this.layer.hidden = !target || this.host.IsReadOnly || !this.selected;
    if (!target || this.layer.hidden) return;
    const rect = target.getBoundingClientRect(), viewport = this.viewport.getBoundingClientRect();
    Object.assign(this.layer.style, {
      left: `${rect.left - viewport.left + this.viewport.scrollLeft}px`,
      top: `${rect.top - viewport.top + this.viewport.scrollTop}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  }
  begin(event, grip) {
    if (this.host.IsReadOnly || event.button !== 0) return;
    const node = this.node(), target = this.element();
    if (!node || !target) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = target.getBoundingClientRect();
    this.drag = {
      id: node.id,
      grip,
      x: event.clientX,
      y: event.clientY,
      width: rect.width / this.host.Zoom,
      height: rect.height / this.host.Zoom,
      left: Number(node.props.HorizontalOffset) || 0,
      top: Number(node.props.VerticalOffset) || 0,
      props: node.props,
      target
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  change(dx, dy) {
    const drag = this.drag;
    if (drag.grip === "move")
      return {
        HorizontalOffset: Math.max(-2e4, Math.min(2e4, drag.left + dx)),
        VerticalOffset: Math.max(-2e4, Math.min(2e4, drag.top + dy))
      };
    const result = {};
    if (/[ew]/.test(drag.grip))
      result.Width = Math.max(
        16,
        Math.min(2e4, drag.width + (drag.grip.includes("w") ? -dx : dx))
      );
    if (/[ns]/.test(drag.grip))
      result.Height = Math.max(
        16,
        Math.min(2e4, drag.height + (drag.grip.includes("n") ? -dy : dy))
      );
    return result;
  }
  move(event) {
    if (!this.drag) return;
    const dx = (event.clientX - this.drag.x) / this.host.Zoom, dy = (event.clientY - this.drag.y) / this.host.Zoom;
    const next = this.change(dx, dy);
    if (next.Width) this.drag.target.style.width = `${next.Width}px`;
    if (next.Height) this.drag.target.style.height = `${next.Height}px`;
    if (this.drag.grip === "move")
      this.drag.target.style.transform = `translate(${dx}px, ${dy}px)`;
    this.Refresh();
  }
  end(event, cancel) {
    const drag = this.drag;
    if (!drag) return;
    const dx = (event.clientX - drag.x) / this.host.Zoom, dy = (event.clientY - drag.y) / this.host.Zoom;
    const next = this.change(dx, dy);
    this.drag = null;
    try {
      if (cancel || this.host.IsReadOnly || !dx && !dy) this.host.Refresh();
      else {
        const current = this.node();
        if (!current || JSON.stringify(current.props) !== JSON.stringify(drag.props))
          throw new Error(
            "The selected object's properties changed during this gesture."
          );
        if (drag.grip === "move" && (!drag.props.WrapStyle || drag.props.WrapStyle === "Inline"))
          next.WrapStyle = "Square";
        this.host.SetFloatingLayout(drag.id, next);
      }
    } catch (error) {
      this.host.Refresh();
      this.host.dispatchEvent(
        new CustomEvent("objectlayouterror", {
          detail: { elementId: drag.id, error },
          bubbles: true,
          composed: true
        })
      );
    }
    this.Refresh();
  }
  key(event, grip) {
    if (event.key === "Escape") {
      this.selected = null;
      this.Refresh();
      this.host.Focus();
      return;
    }
    if (!event.key.startsWith("Arrow") || this.host.IsReadOnly) return;
    event.preventDefault();
    const node = this.node(), element = this.element();
    if (!node || !element) return;
    const step = event.shiftKey ? 10 : 1, horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight", direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const value = grip === "move" ? {
      [horizontal ? "HorizontalOffset" : "VerticalOffset"]: (Number(
        node.props[horizontal ? "HorizontalOffset" : "VerticalOffset"]
      ) || 0) + step * direction,
      WrapStyle: node.props.WrapStyle || "Square"
    } : {
      [horizontal ? "Width" : "Height"]: Math.max(
        16,
        (horizontal ? element.getBoundingClientRect().width : element.getBoundingClientRect().height) / this.host.Zoom + step * direction
      )
    };
    this.host.SetFloatingLayout(node.id, value);
  }
  Dispose() {
    this.abort.abort();
    this.layer.remove();
  }
}
const floatingAdornerCSS = `.surface{isolation:isolate}.rt-object-adorner{position:absolute;z-index:20;border:1px solid var(--rt-accent);pointer-events:none;box-sizing:border-box}.rt-object-adorner[hidden]{display:none}.rt-object-grip{position:absolute;pointer-events:auto;width:10px;height:10px;border:1px solid var(--rt-accent);padding:0;background:var(--rt-paper);border-radius:1px;touch-action:none}.rt-object-grip:focus-visible{outline:2px solid var(--rt-accent);outline-offset:2px}.rt-object-nw{left:-5px;top:-5px;cursor:nwse-resize}.rt-object-n{left:calc(50% - 5px);top:-5px;cursor:ns-resize}.rt-object-ne{right:-5px;top:-5px;cursor:nesw-resize}.rt-object-e{right:-5px;top:calc(50% - 5px);cursor:ew-resize}.rt-object-se{right:-5px;bottom:-5px;cursor:nwse-resize}.rt-object-s{left:calc(50% - 5px);bottom:-5px;cursor:ns-resize}.rt-object-sw{left:-5px;bottom:-5px;cursor:nesw-resize}.rt-object-w{left:-5px;top:calc(50% - 5px);cursor:ew-resize}.rt-object-move{left:0;top:-25px;width:45px;height:20px;font:11px Segoe UI,system-ui;cursor:move}@media print{.rt-object-adorner{display:none}}`;
//# sourceMappingURL=floating-adorner.js.map
