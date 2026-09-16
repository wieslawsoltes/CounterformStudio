import type { CSSProperties, HTMLAttributes } from "react";
import { FlowDocument } from "./model.js";
import { RichTextBox, RichTextPageEditor, type VirtualizationStatistics, type PageLayoutResult, type PageLayoutPage, type DocumentViewMode, type PageArrangement, type DocumentZoomMode } from "./control.js";
import { EquationEditor } from "./equation-control.js";
import type { EquationOptions } from "./equations.js";
import type { TextSelection } from "./engine.js";
import type { ObservableObject } from "./mvvm.js";
interface RichTextControlProps<TControl extends RichTextBox> extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange" | "onSelect" | "defaultValue"> {
    /** Shared mutable document model. Change its identity to replace the editor document. */
    document?: FlowDocument;
    /** Used only when this mounted control is first initialized. */
    defaultDocument?: FlowDocument;
    readOnly?: boolean;
    acceptsTab?: boolean;
    zoom?: number;
    viewMode?: "page" | "continuous";
    documentView?: DocumentViewMode;
    pageArrangement?: PageArrangement;
    zoomMode?: DocumentZoomMode;
    outlineLevel?: number;
    onViewChange?: (state: {
        documentView: DocumentViewMode;
        pageArrangement: PageArrangement;
        zoomMode: DocumentZoomMode;
    }, event: CustomEvent) => void;
    style?: CSSProperties;
    enableVirtualization?: boolean;
    virtualizationThreshold?: number;
    virtualizationOverscan?: number;
    onVirtualizationChange?: (statistics: VirtualizationStatistics, event: CustomEvent) => void;
    onPaginated?: (layout: PageLayoutResult, event: CustomEvent) => void;
    onPageChange?: (state: {
        pageNumber: number;
        pageCount: number;
        page?: PageLayoutPage;
    }, event: CustomEvent) => void;
    onDocumentChange?: (document: FlowDocument, event: CustomEvent) => void;
    onSelectionChange?: (selection: TextSelection, event: CustomEvent) => void;
    onCommandStateChange?: (state: {
        canUndo: boolean;
        canRedo: boolean;
        isReadOnly: boolean;
    }, event: CustomEvent) => void;
    onReady?: (editor: TControl) => void;
}
export interface RichTextEditorProps extends RichTextControlProps<RichTextBox> {
}
export interface RichTextPagedEditorProps extends RichTextControlProps<RichTextPageEditor> {
}
/** Works with React 18 and 19; ref exposes the actual RichTextBox control. */
export declare const RichTextEditor: import("react").ForwardRefExoticComponent<RichTextControlProps<RichTextBox> & import("react").RefAttributes<RichTextBox>>;
/** Finite page editing with the same React document, lifecycle, events and virtualization props. */
export declare const RichTextPagedEditor: import("react").ForwardRefExoticComponent<RichTextControlProps<RichTextPageEditor> & import("react").RefAttributes<RichTextPageEditor>>;
/** Subscribes React to a mutable FlowDocument using a stable numeric snapshot. */
export declare function useDocumentRevision(document: FlowDocument): number;
/** Creates one model per component instance and rerenders on document mutations. */
export declare function useFlowDocument(initial?: FlowDocument | (() => FlowDocument)): FlowDocument;
/** Select an observable property; object values should be replaced to notify React. */
export declare function useObservableProperty<T>(source: ObservableObject, propertyName: string, defaultValue?: T): T;
export interface ReactEquationEditorProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange" | "defaultValue"> {
    value?: EquationOptions;
    defaultValue?: EquationOptions;
    readOnly?: boolean;
    onValueChange?: (value: EquationOptions, event: CustomEvent) => void;
    onValidationChange?: (state: {
        isValid: boolean;
        error: string;
    }, event: CustomEvent) => void;
    onReady?: (editor: EquationEditor) => void;
}
/** Controlled/uncontrolled React math workbench using the same web component and local history. */
export declare const ReactEquationEditor: import("react").ForwardRefExoticComponent<ReactEquationEditorProps & import("react").RefAttributes<EquationEditor>>;
export {};
