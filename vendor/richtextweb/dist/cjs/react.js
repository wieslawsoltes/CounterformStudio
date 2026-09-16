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
var react_exports = {};
__export(react_exports, {
  ReactEquationEditor: () => ReactEquationEditor,
  RichTextEditor: () => RichTextEditor,
  RichTextPagedEditor: () => RichTextPagedEditor,
  useDocumentRevision: () => useDocumentRevision,
  useFlowDocument: () => useFlowDocument,
  useObservableProperty: () => useObservableProperty
});
module.exports = __toCommonJS(react_exports);
var import_react = require("react");
var import_model = require("./model.js");
var import_control = require("./control.js");
var import_equation_control = require("./equation-control.js");
function assignRef(ref, value) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
function createEditorComponent(tag) {
  return (0, import_react.forwardRef)(
    function RichTextControl(props, forwardedRef) {
      const {
        document,
        defaultDocument,
        readOnly = false,
        acceptsTab = false,
        zoom = 1,
        viewMode = "page",
        documentView,
        pageArrangement,
        zoomMode,
        outlineLevel,
        onViewChange,
        enableVirtualization = false,
        virtualizationThreshold = 200,
        virtualizationOverscan = 6,
        onVirtualizationChange,
        onPaginated,
        onPageChange,
        onDocumentChange,
        onSelectionChange,
        onCommandStateChange,
        onReady,
        ...attributes
      } = props;
      const [editor, setEditor] = (0, import_react.useState)(null);
      const initialized = (0, import_react.useRef)(null);
      const attached = (0, import_react.useRef)(null);
      const assigningDocument = (0, import_react.useRef)(false);
      const callbacks = (0, import_react.useRef)({
        onDocumentChange,
        onSelectionChange,
        onCommandStateChange,
        onReady,
        onVirtualizationChange,
        onPaginated,
        onPageChange,
        onViewChange
      });
      callbacks.current = {
        onDocumentChange,
        onSelectionChange,
        onCommandStateChange,
        onReady,
        onVirtualizationChange,
        onPaginated,
        onPageChange,
        onViewChange
      };
      const attach = (0, import_react.useCallback)(
        (element) => {
          if (element) (0, import_control.registerRichTextWeb)();
          const control = element;
          const previous = attached.current;
          attached.current = control;
          assignRef(forwardedRef, control);
          setEditor(control);
          if (!control && previous)
            queueMicrotask(() => {
              if (attached.current !== previous && !previous.isConnected)
                previous.Dispose();
            });
        },
        [forwardedRef]
      );
      (0, import_react.useEffect)(() => {
        if (!editor) return;
        const changed = (event) => {
          if (!assigningDocument.current)
            callbacks.current.onDocumentChange?.(
              editor.Document,
              event
            );
        };
        const selected = (event) => callbacks.current.onSelectionChange?.(
          editor.Selection,
          event
        );
        const state = (event) => callbacks.current.onCommandStateChange?.(
          event.detail,
          event
        );
        const virtualized = (event) => callbacks.current.onVirtualizationChange?.(
          event.detail.statistics,
          event
        );
        const paginated = (event) => callbacks.current.onPaginated?.(
          event.detail.layout,
          event
        );
        const pageChanged = (event) => callbacks.current.onPageChange?.(
          event.detail,
          event
        );
        const viewChanged = (event) => callbacks.current.onViewChange?.(
          event.detail,
          event
        );
        editor.addEventListener("viewchange", viewChanged);
        editor.addEventListener("virtualizationchange", virtualized);
        editor.addEventListener("paginated", paginated);
        editor.addEventListener("pagechange", pageChanged);
        editor.addEventListener("documentchange", changed);
        editor.addEventListener("selectionchange", selected);
        editor.addEventListener("commandstatechange", state);
        return () => {
          editor.removeEventListener("viewchange", viewChanged);
          editor.removeEventListener("virtualizationchange", virtualized);
          editor.removeEventListener("paginated", paginated);
          editor.removeEventListener("pagechange", pageChanged);
          editor.removeEventListener("documentchange", changed);
          editor.removeEventListener("selectionchange", selected);
          editor.removeEventListener("commandstatechange", state);
        };
      }, [editor]);
      (0, import_react.useEffect)(() => {
        if (!editor) return;
        assigningDocument.current = true;
        try {
          if (document && editor.Document !== document)
            editor.Document = document;
          else if (!document && initialized.current !== editor && defaultDocument)
            editor.Document = defaultDocument;
          editor.IsReadOnly = readOnly;
          editor.AcceptsTab = acceptsTab;
          if (editor.Zoom !== zoom && (!zoomMode || zoomMode === "Custom"))
            editor.Zoom = zoom;
          if (editor instanceof import_control.RichTextPageEditor && documentView)
            editor.DocumentView = documentView;
          else if (editor.ViewMode !== viewMode) editor.ViewMode = viewMode;
          if (editor instanceof import_control.RichTextPageEditor) {
            if (pageArrangement && editor.PageArrangement !== pageArrangement)
              editor.PageArrangement = pageArrangement;
            if (zoomMode && editor.ZoomMode !== zoomMode)
              editor.ZoomMode = zoomMode;
            if (outlineLevel !== void 0 && editor.OutlineLevel !== outlineLevel)
              editor.OutlineLevel = outlineLevel;
          }
          if (editor.VirtualizationThreshold !== virtualizationThreshold)
            editor.VirtualizationThreshold = virtualizationThreshold;
          if (editor.VirtualizationOverscan !== virtualizationOverscan)
            editor.VirtualizationOverscan = virtualizationOverscan;
          if (editor.EnableVirtualization !== enableVirtualization)
            editor.EnableVirtualization = enableVirtualization;
          if (initialized.current !== editor) {
            initialized.current = editor;
            callbacks.current.onReady?.(editor);
          }
        } finally {
          assigningDocument.current = false;
        }
      }, [
        editor,
        document,
        defaultDocument,
        readOnly,
        acceptsTab,
        zoom,
        viewMode,
        documentView,
        pageArrangement,
        zoomMode,
        outlineLevel,
        enableVirtualization,
        virtualizationThreshold,
        virtualizationOverscan
      ]);
      return (0, import_react.createElement)(tag, { ...attributes, ref: attach });
    }
  );
}
const RichTextEditor = createEditorComponent("rich-text-box");
const RichTextPagedEditor = createEditorComponent(
  "rich-text-page-editor"
);
function useDocumentRevision(document) {
  const subscribe = (0, import_react.useCallback)(
    (notify) => {
      const subscription = document.Changed.Subscribe(notify);
      return () => subscription.Dispose();
    },
    [document]
  );
  const snapshot = (0, import_react.useCallback)(() => document.Revision, [document]);
  return (0, import_react.useSyncExternalStore)(subscribe, snapshot, snapshot);
}
function useFlowDocument(initial) {
  const [document] = (0, import_react.useState)(
    () => typeof initial === "function" ? initial() : initial ?? new import_model.FlowDocument()
  );
  useDocumentRevision(document);
  return document;
}
function useObservableProperty(source, propertyName, defaultValue) {
  const subscribe = (0, import_react.useCallback)(
    (notify) => {
      const subscription = source.PropertyChanged.Subscribe((args) => {
        if (!args.PropertyName || args.PropertyName === propertyName) notify();
      });
      return () => subscription.Dispose();
    },
    [source, propertyName]
  );
  const snapshot = (0, import_react.useCallback)(
    () => source.GetProperty(propertyName, defaultValue),
    [source, propertyName, defaultValue]
  );
  return (0, import_react.useSyncExternalStore)(subscribe, snapshot, snapshot);
}
const ReactEquationEditor = (0, import_react.forwardRef)(function ReactEquationEditor2(props, forwardedRef) {
  const {
    value,
    defaultValue,
    readOnly = false,
    onValueChange,
    onValidationChange,
    onReady,
    ...attributes
  } = props;
  const [editor, setEditor] = (0, import_react.useState)(null);
  const attached = (0, import_react.useRef)(null), initialized = (0, import_react.useRef)(null);
  const callbacks = (0, import_react.useRef)({ onValueChange, onValidationChange, onReady });
  callbacks.current = { onValueChange, onValidationChange, onReady };
  const attach = (0, import_react.useCallback)(
    (node) => {
      if (node) (0, import_equation_control.registerEquationEditor)();
      const previous = attached.current, control = node;
      attached.current = control;
      assignRef(forwardedRef, control);
      setEditor(control);
      if (!control && previous)
        queueMicrotask(() => {
          if (attached.current !== previous && !previous.isConnected)
            previous.Dispose();
        });
    },
    [forwardedRef]
  );
  (0, import_react.useEffect)(() => {
    if (!editor) return;
    const change = (event) => callbacks.current.onValueChange?.(editor.Value, event);
    const validation = (event) => callbacks.current.onValidationChange?.(
      event.detail,
      event
    );
    editor.addEventListener("equationchange", change);
    editor.addEventListener("validationchange", validation);
    return () => {
      editor.removeEventListener("equationchange", change);
      editor.removeEventListener("validationchange", validation);
    };
  }, [editor]);
  (0, import_react.useEffect)(() => {
    if (!editor) return;
    if (initialized.current !== editor) {
      if (value ?? defaultValue) editor.Value = value ?? defaultValue;
      editor.IsReadOnly = readOnly;
      initialized.current = editor;
      callbacks.current.onReady?.(editor);
    }
    const same = value && value.Source === editor.Source && (value.Format ?? "latex") === editor.Format && !!value.DisplayMode === editor.DisplayMode && (value.AlternativeText ?? "") === (editor.Value.AlternativeText ?? "");
    if (value && !same) editor.Value = value;
    if (editor.IsReadOnly !== readOnly) editor.IsReadOnly = readOnly;
  }, [editor, value, defaultValue, readOnly]);
  return (0, import_react.createElement)("rich-equation-editor", { ...attributes, ref: attach });
});
//# sourceMappingURL=react.js.map
