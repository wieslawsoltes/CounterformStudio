import { FlowDocument } from "./model.js";
/** Produces a real OPC/WordprocessingML package with styled text, tables, lists and embedded images. */
export declare function toDOCX(document: FlowDocument): Promise<Uint8Array>;
/** Reads the principal WordprocessingML story. Does not execute macros, fields or linked resources. */
export declare function fromDOCX(bytes: Uint8Array | ArrayBuffer): Promise<FlowDocument>;
