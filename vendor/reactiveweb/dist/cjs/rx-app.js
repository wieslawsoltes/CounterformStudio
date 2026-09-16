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
var rx_app_exports = {};
__export(rx_app_exports, {
  RxApp: () => RxApp
});
module.exports = __toCommonJS(rx_app_exports);
var import_rxjs = require("rxjs");
class RxApp {
  static MainThreadScheduler = import_rxjs.queueScheduler;
  static TaskpoolScheduler = import_rxjs.asyncScheduler;
  static DefaultExceptionHandler = {
    next(error) {
      console.error("Unhandled ReactiveWeb exception:", error);
    }
  };
  static Configure(options) {
    if (options.mainThreadScheduler) this.MainThreadScheduler = options.mainThreadScheduler;
    if (options.taskpoolScheduler) this.TaskpoolScheduler = options.taskpoolScheduler;
    if (options.defaultExceptionHandler) this.DefaultExceptionHandler = options.defaultExceptionHandler;
  }
  static configure(options) {
    this.Configure(options);
  }
  static HandleException(error) {
    const handler = this.DefaultExceptionHandler;
    if (typeof handler === "function") handler(error);
    else handler.next(error);
  }
  static get mainThreadScheduler() {
    return this.MainThreadScheduler;
  }
  static set mainThreadScheduler(value) {
    this.MainThreadScheduler = value;
  }
  static get taskpoolScheduler() {
    return this.TaskpoolScheduler;
  }
  static set taskpoolScheduler(value) {
    this.TaskpoolScheduler = value;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RxApp
});
//# sourceMappingURL=rx-app.js.map
