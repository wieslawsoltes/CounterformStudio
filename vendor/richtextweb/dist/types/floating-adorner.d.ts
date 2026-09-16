import type { RichTextBox } from "./control.js";
/** Pointer/keyboard resize chrome is owned by the reusable editor, outside document DOM. */
export declare class FloatingObjectAdorner {
    private host;
    private surface;
    private viewport;
    private layer;
    private selected;
    private abort;
    private drag;
    constructor(host: RichTextBox, surface: HTMLElement, viewport: HTMLElement);
    private node;
    private element;
    Refresh(): void;
    private begin;
    private change;
    private move;
    private end;
    private key;
    Dispose(): void;
}
export declare const floatingAdornerCSS = ".surface{isolation:isolate}.rt-object-adorner{position:absolute;z-index:20;border:1px solid var(--rt-accent);pointer-events:none;box-sizing:border-box}.rt-object-adorner[hidden]{display:none}.rt-object-grip{position:absolute;pointer-events:auto;width:10px;height:10px;border:1px solid var(--rt-accent);padding:0;background:var(--rt-paper);border-radius:1px;touch-action:none}.rt-object-grip:focus-visible{outline:2px solid var(--rt-accent);outline-offset:2px}.rt-object-nw{left:-5px;top:-5px;cursor:nwse-resize}.rt-object-n{left:calc(50% - 5px);top:-5px;cursor:ns-resize}.rt-object-ne{right:-5px;top:-5px;cursor:nesw-resize}.rt-object-e{right:-5px;top:calc(50% - 5px);cursor:ew-resize}.rt-object-se{right:-5px;bottom:-5px;cursor:nwse-resize}.rt-object-s{left:calc(50% - 5px);bottom:-5px;cursor:ns-resize}.rt-object-sw{left:-5px;bottom:-5px;cursor:nesw-resize}.rt-object-w{left:-5px;top:calc(50% - 5px);cursor:ew-resize}.rt-object-move{left:0;top:-25px;width:45px;height:20px;font:11px Segoe UI,system-ui;cursor:move}@media print{.rt-object-adorner{display:none}}";
