// src/xml-validation.js
import { GraphMLResourceResolver, GraphMLDeserializer, GraphMLSerializer } from "./serialization.js";
var schemaBase = "quikgraphweb://schemas/graphml/1.1/", schemaNames = ["graphml.xsd", "graphml-structure.xsd", "graphml-attributes.xsd", "graphml-parseinfo.xsd", "xlink.xsd"], providers = /* @__PURE__ */ new WeakMap(), encoder = new TextEncoder(), decoder = new TextDecoder("utf-8", { fatal: !0 }), constructionKey = /* @__PURE__ */ Symbol("GraphMLSchemaValidator");
function inputText(input) {
  if (typeof input == "string") return input;
  if (input instanceof Uint8Array) return decoder.decode(input);
  if (input instanceof ArrayBuffer) return decoder.decode(new Uint8Array(input));
  if (input?.ReadToEnd) {
    let text2 = input.ReadToEnd();
    if (typeof text2 == "string") return text2;
  }
  let text = input?.documentElement?.outerHTML ?? input?.outerHTML;
  if (typeof text == "string") return text;
  throw new TypeError("GraphML input must be XML text, UTF-8 bytes, an XML document, or a synchronous ReadToEnd reader");
}
function diagnostics(error, filename) {
  return Object.freeze((error.details?.length ? error.details : [{ message: error.message }]).map((d) => Object.freeze({
    Message: String(d.message ?? "XML validation failed").trim(),
    FileName: String(d.file || filename),
    LineNumber: Number(d.line) || 0,
    ColumnNumber: Number(d.col) || 0,
    Severity: d.level === 1 ? "warning" : d.level === 3 ? "fatal" : "error",
    Path: d.xpath || null
  })));
}
function schemaText(name) {
  return decoder.decode(GraphMLResourceResolver.GetResource(name)).replace(/schemaLocation="([^"]+)"/g, (_, location) => {
    let dependency = location.split("/").at(-1);
    if (!schemaNames.includes(dependency)) throw new Error(`Unbundled GraphML schema dependency: ${location}`);
    return `schemaLocation="${schemaBase}${dependency}"`;
  });
}
function registerSchemas(engine) {
  if (providers.has(engine)) return;
  let resources = /* @__PURE__ */ Object.create(null);
  for (let name of schemaNames) resources[schemaBase + name] = encoder.encode(schemaText(name));
  let provider = new engine.XmlBufferInputProvider(resources);
  if (!engine.xmlRegisterInputProvider(provider)) throw new Error("libxml2 could not register the local GraphML schema resolver");
  providers.set(engine, provider);
}
var GraphMLValidationError = class extends SyntaxError {
  /** @param {ReadonlyArray<GraphMLValidationDiagnostic>} errors @param {Error} [cause] */
  constructor(errors, cause) {
    super(errors.map((error) => `${error.FileName}:${error.LineNumber}:${error.ColumnNumber}: ${error.Message}`).join(`
`), cause ? { cause } : void 0), this.name = "GraphMLValidationError", this.Errors = errors;
  }
}, GraphMLSchemaValidator = class {
  constructor(key, engine, schema) {
    if (key !== constructionKey) throw new TypeError("Use await CreateGraphMLSchemaValidator()");
    this._engine = engine, this._schema = schema, this._disposed = !1;
  }
  get IsDisposed() {
    return this._disposed;
  }
  get SchemaNamespace() {
    return "http://graphml.graphdrawing.org/xmlns";
  }
  get SchemaVersion() {
    return "1.1";
  }
  _ensureActive() {
    if (this._disposed) throw new Error("GraphMLSchemaValidator is disposed");
  }
  /** Validate XML with the bundled official GraphML 1.1 XSD, including its imports/redefines.
   * @param {string|Uint8Array|ArrayBuffer|any} input
   * @param {{filename?:string}} [options]
   * @returns {GraphMLValidationResult}
   */
  Validate(input, options = {}) {
    this._ensureActive();
    let xml = inputText(input), filename = String(options.filename ?? "graph.graphml"), engine = this._engine, document;
    try {
      return document = engine.XmlDocument.fromString(xml, {
        url: filename,
        option: engine.ParseOption.XML_PARSE_NONET | engine.ParseOption.XML_PARSE_NO_XXE | engine.ParseOption.XML_PARSE_BIG_LINES
      }), this._schema.validate(document), Object.freeze({ IsValid: !0, Errors: Object.freeze([]) });
    } catch (error) {
      if (!(error instanceof engine.XmlError)) throw error;
      return Object.freeze({ IsValid: !1, Errors: diagnostics(error, filename) });
    } finally {
      document?.dispose();
    }
  }
  /** @returns {GraphMLValidationResult} */
  ValidateAndThrow(input, options = {}) {
    let result = this.Validate(input, options);
    if (!result.IsValid) throw new GraphMLValidationError(result.Errors);
    return result;
  }
  /** Validate before invoking a factory, assigning properties, or mutating a graph. */
  Deserialize(input, options = {}) {
    this._ensureActive();
    let text = inputText(input);
    return this.ValidateAndThrow(text, { filename: options.filename }), new GraphMLDeserializer(options).Deserialize(text, options.graph, options.vertexFactory, options.edgeFactory);
  }
  /** Serialize and validate before invoking an optional output writer. */
  Serialize(graph, options = {}) {
    this._ensureActive();
    let text = new GraphMLSerializer(options).Serialize(graph, options);
    this.ValidateAndThrow(text, { filename: options.filename });
    let writer = options.writer;
    if (writer != null)
      if (typeof writer == "function") writer(text);
      else if (typeof writer.Write == "function") writer.Write(text);
      else if (typeof writer.write == "function") writer.write(text);
      else throw new TypeError("writer must be a callback or expose Write/write");
    return text;
  }
  /** Release the compiled native schema. Repeated disposal is harmless. */
  Dispose() {
    this._disposed || (this._disposed = !0, this._schema.dispose(), this._schema = null, this._engine = null);
  }
  dispose() {
    this.Dispose();
  }
  [Symbol.dispose ?? /* @__PURE__ */ Symbol.for("Symbol.dispose")]() {
    this.Dispose();
  }
};
async function CreateGraphMLSchemaValidator(options = {}) {
  if (!options || typeof options != "object") throw new TypeError("options must be an object");
  if (options.engineLoader !== void 0 && typeof options.engineLoader != "function") throw new TypeError("engineLoader must be a function");
  let engine = await (options.engineLoader ? options.engineLoader() : options.engineUrl ? import(String(options.engineUrl)) : import("./vendor/libxml2-wasm.mjs"));
  for (let name of ["XmlDocument", "XsdValidator", "XmlError", "XmlLibError", "XmlBufferInputProvider", "xmlRegisterInputProvider"])
    if (!engine?.[name]) throw new TypeError(`The XML engine does not expose ${name}`);
  registerSchemas(engine);
  let document;
  try {
    return document = engine.XmlDocument.fromString(schemaText("graphml.xsd"), { url: schemaBase + "graphml.xsd" }), new GraphMLSchemaValidator(constructionKey, engine, engine.XsdValidator.fromDoc(document));
  } catch (error) {
    throw error instanceof engine.XmlLibError ? new GraphMLValidationError(diagnostics(error, "graphml.xsd"), error) : error;
  } finally {
    document?.dispose();
  }
}
async function ValidateGraphMLSchema(input, options = {}) {
  let validator = await CreateGraphMLSchemaValidator(options);
  try {
    return validator.Validate(input, options);
  } finally {
    validator.Dispose();
  }
}
async function DeserializeAndValidateGraphML(input, options = {}) {
  let validator = await CreateGraphMLSchemaValidator(options);
  try {
    return validator.Deserialize(input, options);
  } finally {
    validator.Dispose();
  }
}
export {
  CreateGraphMLSchemaValidator,
  DeserializeAndValidateGraphML,
  GraphMLSchemaValidator,
  GraphMLValidationError,
  ValidateGraphMLSchema
};
//# sourceMappingURL=xml-validation.js.map
