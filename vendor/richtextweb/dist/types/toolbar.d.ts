import { RichTextBox } from "./control.js";
declare const HTMLElementBase: typeof HTMLElement;
export type ToolbarMode = "home" | "insert" | "layout" | "review" | "all";
/** Reusable editor chrome. All mutations go through the attached RichTextBox engine. */
export declare class RichTextToolbar extends HTMLElementBase {
    static get observedAttributes(): string[];
    private editor;
    private mode;
    private subscriptions;
    private status;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    get Editor(): RichTextBox | null;
    set Editor(value: RichTextBox | null);
    get Target(): string;
    set Target(value: string);
    get Mode(): ToolbarMode;
    set Mode(value: ToolbarMode);
    private detach;
    private connectTarget;
    Dispose(): void;
    private render;
    private select;
    Refresh(): void;
    private executeSafe;
    /** Commands can also be driven by framework bindings and application menus. */
    Execute(command: string, parameter?: unknown): unknown;
    /** Each invocation owns a dialog: queued close events must not reach a new session. */
    private createDialog;
    private prompt;
    private editStory;
    private editEquation;
    private editFloatingStory;
    private reviewChanges;
}
export declare function registerRichTextToolbar(registry?: CustomElementRegistry | undefined): void;
export {};
