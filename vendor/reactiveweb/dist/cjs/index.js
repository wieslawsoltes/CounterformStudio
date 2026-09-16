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
var index_exports = {};
__export(index_exports, {
  ApplyDynamicDataChanges: () => import_dynamic_data.ApplyDynamicDataChanges,
  BindChangeSet: () => import_dynamic_data.BindChangeSet,
  ConnectDynamicData: () => import_dynamic_data.ConnectDynamicData,
  DynamicData: () => import_dynamic_data.DynamicData,
  ToDynamicDataChangeSet: () => import_dynamic_data.ToDynamicDataChangeSet,
  ToObservableChangeSet: () => import_dynamic_data.ToObservableChangeSet,
  ToReactiveCollection: () => import_dynamic_data.ToReactiveCollection
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("./disposables.js"), module.exports);
__reExport(index_exports, require("./rx-app.js"), module.exports);
__reExport(index_exports, require("./reactive-object.js"), module.exports);
__reExport(index_exports, require("./observable-property.js"), module.exports);
__reExport(index_exports, require("./reactive-property.js"), module.exports);
__reExport(index_exports, require("./command.js"), module.exports);
__reExport(index_exports, require("./interaction.js"), module.exports);
__reExport(index_exports, require("./activation.js"), module.exports);
__reExport(index_exports, require("./routing.js"), module.exports);
__reExport(index_exports, require("./services.js"), module.exports);
__reExport(index_exports, require("./persistence.js"), module.exports);
__reExport(index_exports, require("./collections.js"), module.exports);
__reExport(index_exports, require("./validation.js"), module.exports);
__reExport(index_exports, require("./generation.js"), module.exports);
__reExport(index_exports, require("./converters.js"), module.exports);
__reExport(index_exports, require("./providers.js"), module.exports);
__reExport(index_exports, require("./builder.js"), module.exports);
__reExport(index_exports, require("./scheduled-subject.js"), module.exports);
__reExport(index_exports, require("./observable-extensions.js"), module.exports);
var import_dynamic_data = require("./dynamic-data.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApplyDynamicDataChanges,
  BindChangeSet,
  ConnectDynamicData,
  DynamicData,
  ToDynamicDataChangeSet,
  ToObservableChangeSet,
  ToReactiveCollection,
  ...require("./disposables.js"),
  ...require("./rx-app.js"),
  ...require("./reactive-object.js"),
  ...require("./observable-property.js"),
  ...require("./reactive-property.js"),
  ...require("./command.js"),
  ...require("./interaction.js"),
  ...require("./activation.js"),
  ...require("./routing.js"),
  ...require("./services.js"),
  ...require("./persistence.js"),
  ...require("./collections.js"),
  ...require("./validation.js"),
  ...require("./generation.js"),
  ...require("./converters.js"),
  ...require("./providers.js"),
  ...require("./builder.js"),
  ...require("./scheduled-subject.js"),
  ...require("./observable-extensions.js")
});
//# sourceMappingURL=index.js.map
