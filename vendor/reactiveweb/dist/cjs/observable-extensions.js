"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var observable_extensions_exports = {};
__export(observable_extensions_exports, {
  Do: () => Do,
  Log: () => Log,
  LoggedCatch: () => LoggedCatch,
  ObservableLoggingMixins: () => ObservableLoggingMixins,
  SwitchSelect: () => SwitchSelect,
  SwitchSubscribe: () => SwitchSubscribe,
  SwitchSubscribeMixins: () => SwitchSubscribeMixins,
  logObservable: () => logObservable,
  loggedCatch: () => loggedCatch,
  switchSelect: () => switchSelect,
  switchSubscribe: () => switchSubscribe
});
module.exports = __toCommonJS(observable_extensions_exports);
var import_rxjs = require("rxjs");
var import_rx_app = require("./rx-app.js");
function SwitchSelect(sourceOrSelector, selector) {
  const project = selector ?? sourceOrSelector;
  if (typeof project !== "function") throw new TypeError("A selector is required.");
  const operator = (source) => source.pipe(
    (0, import_rxjs.filter)((value) => value != null),
    (0, import_rxjs.switchMap)(project)
  );
  return selector ? operator(sourceOrSelector) : operator;
}
function SwitchSubscribe(source, selectorOrObserver, observer) {
  const selector = observer === void 0 ? (value) => value : selectorOrObserver;
  const target = observer ?? selectorOrObserver;
  const handlers = typeof target === "function" ? { next: target } : target;
  const subscription = SwitchSelect(source, selector).subscribe({
    next: (value) => handlers.next?.(value),
    error: (error) => handlers.error ? handlers.error(error) : import_rx_app.RxApp.HandleException(error),
    complete: () => handlers.complete?.()
  });
  return Object.assign(subscription, { Dispose() {
    subscription.unsubscribe();
  } });
}
function Do(sourceOrObserver, observerOrError, errorOrComplete, onCompleted) {
  const direct = (0, import_rxjs.isObservable)(sourceOrObserver);
  const observer = direct ? observerOrError : sourceOrObserver;
  const onError = direct ? errorOrComplete : observerOrError;
  const complete = direct ? onCompleted : errorOrComplete;
  const handlers = typeof observer === "function" ? { next: observer, error: onError, complete } : observer;
  const operator = (0, import_rxjs.tap)(handlers);
  return direct ? sourceOrObserver.pipe(operator) : operator;
}
function resolveLogger(source) {
  return "Log" in source && typeof source.Log === "function" ? source.Log() : source;
}
function info(logger, message, value) {
  const target = resolveLogger(logger);
  if (target.info) target.info(message, value);
  else target.Info?.(message, value);
}
function warn(logger, message, error) {
  const target = resolveLogger(logger);
  if (target.warn) target.warn(message, error);
  else target.Warn?.(error, message);
}
function Log(sourceOrLogger = console, loggerOrMessage, messageOrStringifier, stringify) {
  const direct = (0, import_rxjs.isObservable)(sourceOrLogger);
  const logger = direct ? loggerOrMessage ?? console : sourceOrLogger;
  const message = direct ? messageOrStringifier : loggerOrMessage;
  const stringifier = direct ? stringify : messageOrStringifier;
  const prefix = message ? `${message} ` : "";
  const operator = (0, import_rxjs.tap)({
    next: (value) => info(logger, `${prefix}OnNext`, stringifier ? stringifier(value) : value),
    error: (error) => warn(logger, `${prefix}OnError`, error),
    complete: () => info(logger, `${prefix}OnCompleted`)
  });
  return direct ? sourceOrLogger.pipe(operator) : operator;
}
function LoggedCatch(sourceOrLogger = console, loggerOrFallback, fallbackOrMessage, messageOrPredicate, predicate) {
  const direct = (0, import_rxjs.isObservable)(sourceOrLogger);
  const logger = direct ? loggerOrFallback ?? console : sourceOrLogger;
  const fallback = direct ? fallbackOrMessage : loggerOrFallback;
  const message = direct ? messageOrPredicate : fallbackOrMessage;
  const shouldCatch = direct ? predicate : messageOrPredicate;
  const operator = (source) => source.pipe((0, import_rxjs.catchError)((error) => {
    if (shouldCatch && !shouldCatch(error)) return (0, import_rxjs.throwError)(() => error);
    warn(logger, message ?? "", error);
    if (fallback === void 0) return (0, import_rxjs.of)(void 0);
    return (0, import_rxjs.from)(typeof fallback === "function" ? fallback(error) : fallback);
  }));
  return direct ? operator(sourceOrLogger) : operator;
}
const switchSelect = SwitchSelect;
const switchSubscribe = SwitchSubscribe;
const loggedCatch = LoggedCatch;
const logObservable = Log;
const ObservableLoggingMixins = { Log, LoggedCatch, Do };
const SwitchSubscribeMixins = { SwitchSelect, SwitchSubscribe };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Do,
  Log,
  LoggedCatch,
  ObservableLoggingMixins,
  SwitchSelect,
  SwitchSubscribe,
  SwitchSubscribeMixins,
  logObservable,
  loggedCatch,
  switchSelect,
  switchSubscribe
});
//# sourceMappingURL=observable-extensions.js.map
