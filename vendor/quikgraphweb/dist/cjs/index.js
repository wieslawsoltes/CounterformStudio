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
var index_exports = {};
__export(index_exports, {
  GraphColor: () => import_algorithm_base.GraphColor
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("./equality.js"), module.exports);
__reExport(index_exports, require("./core.js"), module.exports);
__reExport(index_exports, require("./collections.js"), module.exports);
__reExport(index_exports, require("./algorithm-base.js"), module.exports);
var import_algorithm_base = require("./algorithm-base.js");
__reExport(index_exports, require("./search.js"), module.exports);
__reExport(index_exports, require("./shortest-paths.js"), module.exports);
__reExport(index_exports, require("./observers.js"), module.exports);
__reExport(index_exports, require("./structural.js"), module.exports);
__reExport(index_exports, require("./advanced.js"), module.exports);
__reExport(index_exports, require("./graphviz.js"), module.exports);
__reExport(index_exports, require("./serialization.js"), module.exports);
__reExport(index_exports, require("./petri.js"), module.exports);
__reExport(index_exports, require("./data.js"), module.exports);
__reExport(index_exports, require("./msagl.js"), module.exports);
__reExport(index_exports, require("./algorithm-extensions.js"), module.exports);
__reExport(index_exports, require("./helpers.js"), module.exports);
__reExport(index_exports, require("./web-component.js"), module.exports);
__reExport(index_exports, require("./nrbf.js"), module.exports);
__reExport(index_exports, require("./binary-serialization.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GraphColor,
  ...require("./equality.js"),
  ...require("./core.js"),
  ...require("./collections.js"),
  ...require("./algorithm-base.js"),
  ...require("./search.js"),
  ...require("./shortest-paths.js"),
  ...require("./observers.js"),
  ...require("./structural.js"),
  ...require("./advanced.js"),
  ...require("./graphviz.js"),
  ...require("./serialization.js"),
  ...require("./petri.js"),
  ...require("./data.js"),
  ...require("./msagl.js"),
  ...require("./algorithm-extensions.js"),
  ...require("./helpers.js"),
  ...require("./web-component.js"),
  ...require("./nrbf.js"),
  ...require("./binary-serialization.js")
});
//# sourceMappingURL=index.js.map
