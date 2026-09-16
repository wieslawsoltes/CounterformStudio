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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var pdf_exports = {};
__export(pdf_exports, {
  PDFEditorControl: () => import_pdf_control.PDFEditorControl,
  configurePDF: () => import_pdf_import.configurePDF,
  configurePDFWorker: () => import_pdf_import.configurePDFWorker,
  extractPDF: () => import_pdf_import.extractPDF,
  fromPDF: () => import_pdf_import.fromPDF,
  registerPDFEditor: () => import_pdf_control.registerPDFEditor
});
module.exports = __toCommonJS(pdf_exports);
__reExport(pdf_exports, require("./formats-pdf.js"), module.exports);
var import_pdf_import = require("./pdf-import.js");
var import_pdf_control = require("./pdf-control.js");
//# sourceMappingURL=pdf.js.map
