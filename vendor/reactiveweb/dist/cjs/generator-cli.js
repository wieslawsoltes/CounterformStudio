#!/usr/bin/env node
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
var generator_cli_exports = {};
__export(generator_cli_exports, {
  GenerateViewModelSource: () => GenerateViewModelSource,
  RunGenerator: () => RunGenerator,
  ValidateGenerationSchema: () => ValidateGenerationSchema
});
module.exports = __toCommonJS(generator_cli_exports);
var import_promises = require("node:fs/promises");
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_url = require("node:url");
var import_reactive_object = require("./reactive-object.js");
const import_meta = {};
const allowedTypes = /* @__PURE__ */ new Set(["string", "number", "boolean", "object", "unknown", "string[]", "number[]", "boolean[]"]);
const reserved = /* @__PURE__ */ new Set(["await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "package", "private", "protected", "public", "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield"]);
const reservedMembers = /* @__PURE__ */ new Set(["constructor", "__proto__", "prototype", "Dispose", "dispose", "unsubscribe", "Changed", "Changing", "PropertyChanged", "PropertyChanging", "ThrownExceptions", "GetValue", "RaiseAndSetIfChanged", "RaisePropertyChanged", "RaisePropertyChanging", "SuppressChangeNotifications", "DelayChangeNotifications", "AreChangeNotificationsEnabled", "__generatedResources", "__generatedDisposed"]);
const baseProbe = new import_reactive_object.ReactiveObject();
for (const name of Object.getOwnPropertyNames(baseProbe)) reservedMembers.add(name);
baseProbe.Dispose();
for (const name of Object.getOwnPropertyNames(import_reactive_object.ReactiveObject.prototype)) reservedMembers.add(name);
const reservedImports = /* @__PURE__ */ new Set(["ReactiveObject", "ReactiveCommand", "ToProperty", "ReactivePropertyValidationError"]);
function record(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
}
function identifier(value, label) {
  if (typeof value !== "string" || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) || reserved.has(value)) {
    throw new TypeError(`${label} must be a non-reserved JavaScript identifier.`);
  }
}
function typeName(value, label, allowVoid = false) {
  if (value !== void 0 && (typeof value !== "string" || !allowedTypes.has(value) && !(allowVoid && value === "void"))) {
    throw new TypeError(`${label} must be a supported scalar, object, or primitive-array type.`);
  }
}
function rejectUnknown(value, keys, label) {
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new TypeError(`Unknown ${label} option '${key}'.`);
}
function booleanOption(value, label) {
  if (value !== void 0 && typeof value !== "boolean") throw new TypeError(`${label} must be boolean.`);
}
function validInitial(initial, type, nullable, label) {
  if (initial === null && nullable) return;
  if (!type || type === "unknown") return;
  const matches = type.endsWith("[]") ? Array.isArray(initial) && initial.every((value) => typeof value === type.slice(0, -2)) : type === "object" ? initial !== null && typeof initial === "object" && !Array.isArray(initial) : typeof initial === type;
  if (!matches || typeof initial === "number" && !Number.isFinite(initial)) throw new TypeError(`${label} does not match its declared type '${type}'.`);
}
function ValidateGenerationSchema(value) {
  record(value, "Schema");
  rejectUnknown(value, ["className", "imports", "properties", "computed", "commands"], "schema");
  identifier(value.className, "className");
  if (reservedImports.has(value.className)) throw new TypeError("className conflicts with a runtime import.");
  const imports = value.imports ?? {};
  record(imports, "imports");
  for (const [name, moduleName] of Object.entries(imports)) {
    identifier(name, "Imported name");
    if (reservedImports.has(name) || name === value.className) throw new TypeError(`Imported name '${name}' conflicts with a generated declaration.`);
    if (typeof moduleName !== "string" || !moduleName.trim() || /[\r\n\0]/.test(moduleName)) throw new TypeError(`Invalid module for '${name}'.`);
  }
  const allNames = /* @__PURE__ */ new Set();
  const requireFactory = (factory, label) => {
    identifier(factory, label);
    if (!Object.hasOwn(imports, factory)) throw new TypeError(`${label} '${factory}' is missing from imports.`);
  };
  for (const section of ["properties", "computed", "commands"]) {
    const members = value[section] ?? {};
    record(members, section);
    for (const [name, raw] of Object.entries(members)) {
      identifier(name, `${section} member name`);
      if (allNames.has(name) || reservedMembers.has(name)) throw new TypeError(`Duplicate or reserved member '${name}'.`);
      allNames.add(name);
      record(raw, `${section}.${name}`);
      if (section === "properties") {
        rejectUnknown(raw, ["initial", "type", "nullable", "validate", "dependents"], `property '${name}'`);
        if (!Object.hasOwn(raw, "initial")) throw new TypeError(`Property '${name}' requires initial.`);
        typeName(raw.type, `${name}.type`);
        booleanOption(raw.nullable, `${name}.nullable`);
        validInitial(raw.initial, raw.type, raw.nullable, name);
        if (raw.dependents !== void 0) {
          if (!Array.isArray(raw.dependents)) throw new TypeError(`${name}.dependents must be an array.`);
          for (const dependent of raw.dependents) identifier(dependent, "Dependent name");
        }
        if (raw.validate !== void 0) {
          record(raw.validate, `${name}.validate`);
          rejectUnknown(raw.validate, ["required", "minimum", "maximum", "minLength", "maxLength", "pattern"], `validation for '${name}'`);
          booleanOption(raw.validate.required, `${name}.validate.required`);
          for (const bound of ["minimum", "maximum", "minLength", "maxLength"]) {
            const boundValue = raw.validate[bound];
            if (boundValue !== void 0 && (typeof boundValue !== "number" || !Number.isFinite(boundValue) || bound.endsWith("Length") && (!Number.isInteger(boundValue) || boundValue < 0))) {
              throw new TypeError(`${name}.validate.${bound} must be a finite ${bound.endsWith("Length") ? "nonnegative integer" : "number"}.`);
            }
          }
          if (raw.validate.minimum !== void 0 && raw.validate.maximum !== void 0 && Number(raw.validate.minimum) > Number(raw.validate.maximum)) throw new TypeError(`${name}: minimum exceeds maximum.`);
          if (raw.validate.minLength !== void 0 && raw.validate.maxLength !== void 0 && Number(raw.validate.minLength) > Number(raw.validate.maxLength)) throw new TypeError(`${name}: minLength exceeds maxLength.`);
          if (raw.validate.pattern !== void 0) {
            if (typeof raw.validate.pattern !== "string") throw new TypeError(`${name}.validate.pattern must be a regular-expression string.`);
            new RegExp(raw.validate.pattern);
          }
        }
      } else if (section === "computed") {
        rejectUnknown(raw, ["source", "type", "nullable", "initialValue", "deferSubscription"], `computed '${name}'`);
        requireFactory(raw.source, `${name}.source`);
        typeName(raw.type, `${name}.type`);
        booleanOption(raw.nullable, `${name}.nullable`);
        booleanOption(raw.deferSubscription, `${name}.deferSubscription`);
        if (Object.hasOwn(raw, "initialValue")) validInitial(raw.initialValue, raw.type, raw.nullable, name);
      } else {
        rejectUnknown(raw, ["execute", "kind", "canExecute", "inputType", "outputType"], `command '${name}'`);
        requireFactory(raw.execute, `${name}.execute`);
        if (raw.canExecute !== void 0) requireFactory(raw.canExecute, `${name}.canExecute`);
        if (raw.kind !== void 0 && !["sync", "task", "observable"].includes(String(raw.kind))) throw new TypeError(`${name}.kind must be sync, task, or observable.`);
        typeName(raw.inputType, `${name}.inputType`, true);
        typeName(raw.outputType, `${name}.outputType`, true);
      }
    }
  }
}
function literal(value) {
  const serialized = JSON.stringify(value);
  if (serialized === void 0) throw new TypeError("Initial values must be JSON serializable.");
  return serialized.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function inferredType(value) {
  return typeof value === "string" ? "string" : typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "unknown";
}
function validationCondition(_name, property, variable = "value") {
  const rules = [];
  if (property.type && property.type !== "unknown") {
    const type = property.type;
    const condition = type.endsWith("[]") ? `Array.isArray(${variable}) && ${variable}.every(item => typeof item === ${literal(type.slice(0, -2))})` : type === "object" ? `${variable} !== null && typeof ${variable} === "object" && !Array.isArray(${variable})` : `typeof ${variable} === ${literal(type)}${type === "number" ? ` && Number.isFinite(${variable})` : ""}`;
    rules.push(property.nullable ? `(${variable} === null || (${condition}))` : `(${condition})`);
  }
  const validation = property.validate;
  if (validation?.required) rules.push(`(${variable} !== null && ${variable} !== undefined && ${variable} !== "")`);
  if (validation?.minimum !== void 0) rules.push(`(typeof ${variable} === "number" && ${variable} >= ${validation.minimum})`);
  if (validation?.maximum !== void 0) rules.push(`(typeof ${variable} === "number" && ${variable} <= ${validation.maximum})`);
  if (validation?.minLength !== void 0) rules.push(`((typeof ${variable} === "string" || Array.isArray(${variable})) && ${variable}.length >= ${validation.minLength})`);
  if (validation?.maxLength !== void 0) rules.push(`((typeof ${variable} === "string" || Array.isArray(${variable})) && ${variable}.length <= ${validation.maxLength})`);
  if (validation?.pattern !== void 0) rules.push(`(typeof ${variable} === "string" && new RegExp(${literal(validation.pattern)}).test(${variable}))`);
  return rules;
}
function GenerateViewModelSource(schema, options = {}) {
  ValidateGenerationSchema(schema);
  if (options.language !== void 0 && options.language !== "ts" && options.language !== "js") throw new TypeError("language must be ts or js.");
  const ts = options.language !== "js";
  const moduleName = options.moduleName ?? "@wieslawsoltes/reactiveweb";
  if (!moduleName || /[\r\n\0]/.test(moduleName)) throw new TypeError("moduleName must be a valid module specifier.");
  const properties = Object.entries(schema.properties ?? {});
  const computed = Object.entries(schema.computed ?? {});
  const commands = Object.entries(schema.commands ?? {});
  const coreImports = ["ReactiveObject", ...computed.length ? ["ToProperty"] : [], ...commands.length ? ["ReactiveCommand"] : [], ...properties.some(([name, value]) => validationCondition(name, value).length) ? ["ReactivePropertyValidationError"] : []];
  const lines = ["// Generated by reactiveweb-generate. Edit the schema and regenerate.", `import { ${coreImports.join(", ")} } from ${literal(moduleName)};`];
  const groupedImports = /* @__PURE__ */ new Map();
  for (const [name, source] of Object.entries(schema.imports ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    const group = groupedImports.get(source) ?? [];
    group.push(name);
    groupedImports.set(source, group);
  }
  for (const [source, names] of groupedImports) lines.push(`import { ${names.join(", ")} } from ${literal(source)};`);
  lines.push("", `export class ${schema.className} extends ReactiveObject {`, `  #generatedResources${ts ? ": { Dispose(): void }[]" : ""} = [];`, "  #generatedDisposed = false;");
  if (ts) {
    for (const [name, definition] of computed) lines.push(`  declare readonly ${name}: ${definition.type ?? inferredType(definition.initialValue)}${definition.nullable ? " | null" : ""}${definition.initialValue === void 0 ? " | undefined" : ""};`);
    for (const [name, definition] of commands) lines.push(`  readonly ${name}: ReactiveCommand<${definition.inputType ?? "unknown"}, ${definition.outputType ?? "unknown"}>;`);
  }
  const initialType = ts ? `: Partial<Pick<${schema.className}, ${properties.map(([name]) => literal(name)).join(" | ") || "never"}>>` : "";
  lines.push("", `  constructor(initial${initialType} = {}) {`, "    super();");
  lines.push(`    const allowedProperties = new Set(${literal(properties.map(([name]) => name))});`, "    for (const name of Object.keys(initial)) {", "      if (!allowedProperties.has(name)) throw new TypeError(`Unknown reactive property: ${name}`);", "    }", "    try {");
  for (const [name, definition] of properties) lines.push(`      this.${name} = Object.hasOwn(initial, ${literal(name)}) ? initial.${name}${ts ? "!" : ""} : ${literal(definition.initial)};`);
  for (const [name, definition] of computed) {
    const settings = `{ ${definition.initialValue !== void 0 ? `initialValue: ${literal(definition.initialValue)}, ` : ""}deferSubscription: ${definition.deferSubscription ?? false} }`;
    lines.push(`      this.#generatedResources.push(ToProperty(${definition.source}(this), this, ${literal(name)}, ${settings}));`);
  }
  for (const [name, definition] of commands) {
    const method = definition.kind === "task" ? "CreateFromTask" : definition.kind === "observable" ? "CreateFromObservable" : "Create";
    const asynchronous = method !== "Create";
    const args = `input${ts ? `: ${definition.inputType ?? "unknown"}` : ""}${asynchronous ? `, signal${ts ? ": AbortSignal" : ""}` : ""}`;
    const generic = ts ? `<${definition.inputType ?? "unknown"}, ${definition.outputType ?? "unknown"}>` : "";
    lines.push(`      this.${name} = ReactiveCommand.${method}${generic}((${args}) => ${definition.execute}(this, input${asynchronous ? ", signal" : ""})${definition.canExecute ? `, ${definition.canExecute}(this)` : ""});`, `      this.#generatedResources.push(this.${name});`);
  }
  lines.push("    } catch (error) {", "      this.Dispose();", "      throw error;", "    }", "  }");
  for (const [name, definition] of properties) {
    const type = `${definition.type ?? inferredType(definition.initial)}${definition.nullable ? " | null" : ""}`;
    const rules = validationCondition(name, definition, "candidate");
    lines.push("", `  get ${name}()${ts ? `: ${type}` : ""} { return this.GetValue${ts ? `<${type}>` : ""}(${literal(name)}); }`, `  set ${name}(value${ts ? `: ${type}` : ""}) {`);
    if (rules.length) {
      lines.push(`    const candidate${ts ? ": unknown" : ""} = value;`);
      rules.forEach((rule, index) => lines.push(`    const valid${index} = ${rule};`));
      lines.push(`    if (!(${rules.map((_, index) => `valid${index}`).join(" && ")})) throw new ReactivePropertyValidationError(${literal(name)}, value);`);
    }
    lines.push(`    if (Object.is(this.GetValue(${literal(name)}), value)) return;`);
    const dependents = [...new Set(definition.dependents ?? [])].filter((dependent) => dependent !== name);
    dependents.forEach((dependent, index) => lines.push(`    const dependent${index} = Reflect.get(this, ${literal(dependent)});`));
    dependents.forEach((dependent, index) => lines.push(`    this.RaisePropertyChanging(${literal(dependent)}, dependent${index});`));
    lines.push(`    this.RaiseAndSetIfChanged(${literal(name)}, value);`);
    dependents.forEach((dependent, index) => lines.push(`    this.RaisePropertyChanged(${literal(dependent)}, dependent${index}, Reflect.get(this, ${literal(dependent)}));`));
    lines.push("  }");
  }
  lines.push("", `  ${ts ? "override " : ""}Dispose()${ts ? ": void" : ""} {`, "    if (this.#generatedDisposed) return;", "    this.#generatedDisposed = true;", `    const errors${ts ? ": unknown[]" : ""} = [];`, "    for (const resource of this.#generatedResources.splice(0).reverse()) {", "      try { resource.Dispose(); } catch (error) { errors.push(error); }", "    }", "    super.Dispose();", '    if (errors.length) throw new AggregateError(errors, "Generated view model disposal failed.");', "  }", "}", "");
  return lines.join("\n");
}
const usage = `Usage: reactiveweb-generate <schema.json> --out <view-model.ts|js> [--language ts|js] [--module package] [--force]

Generate a reactive class with properties, computed observables, and commands.
Existing files are preserved unless --force is supplied.
`;
async function RunGenerator(args, io = { stdout: (text) => process.stdout.write(text), stderr: (text) => process.stderr.write(text) }) {
  try {
    if (args.includes("--help") || args.includes("-h")) {
      io.stdout(usage);
      return 0;
    }
    let input;
    let output;
    let language;
    let moduleName;
    let force = false;
    const seen = /* @__PURE__ */ new Set();
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (arg === "--force") {
        force = true;
        continue;
      }
      if (["--out", "--language", "--module"].includes(arg)) {
        if (seen.has(arg)) throw new TypeError(`Duplicate option ${arg}.`);
        seen.add(arg);
        const value = args[++index];
        if (!value || value.startsWith("--")) throw new TypeError(`Missing value for ${arg}.`);
        if (arg === "--out") output = value;
        if (arg === "--module") moduleName = value;
        if (arg === "--language") {
          if (value !== "ts" && value !== "js") throw new TypeError("--language must be ts or js.");
          language = value;
        }
      } else if (arg.startsWith("-")) throw new TypeError(`Unknown option ${arg}.`);
      else if (input) throw new TypeError("Only one schema input is accepted.");
      else input = arg;
    }
    if (!input || !output) throw new TypeError(usage.trim());
    if ((0, import_node_path.resolve)(input) === (0, import_node_path.resolve)(output)) throw new TypeError("Output must not overwrite the input schema.");
    if (!language) language = [".js", ".mjs"].includes((0, import_node_path.extname)(output)) ? "js" : "ts";
    const schema = JSON.parse(await (0, import_promises.readFile)(input, "utf8"));
    ValidateGenerationSchema(schema);
    const generated = GenerateViewModelSource(schema, { language, ...moduleName ? { moduleName } : {} });
    await (0, import_promises.mkdir)((0, import_node_path.dirname)((0, import_node_path.resolve)(output)), { recursive: true });
    try {
      await (0, import_promises.writeFile)(output, generated, { encoding: "utf8", flag: force ? "w" : "wx" });
    } catch (error) {
      if (error.code === "EEXIST") throw new Error(`Output already exists: ${output}. Use --force to replace it.`);
      throw error;
    }
    io.stdout(`Generated ${schema.className}: ${output}
`);
    return 0;
  } catch (error) {
    io.stderr(`reactiveweb-generate: ${error instanceof Error ? error.message : String(error)}
`);
    return 1;
  }
}
function isMainModule() {
  try {
    return !!process.argv[1] && import_meta.url === (0, import_node_url.pathToFileURL)((0, import_node_fs.realpathSync)((0, import_node_path.resolve)(process.argv[1]))).href;
  } catch {
    return false;
  }
}
if (isMainModule()) {
  void RunGenerator(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GenerateViewModelSource,
  RunGenerator,
  ValidateGenerationSchema
});
//# sourceMappingURL=generator-cli.js.map
