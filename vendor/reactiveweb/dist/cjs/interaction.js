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
var interaction_exports = {};
__export(interaction_exports, {
  Interaction: () => Interaction,
  InteractionContext: () => InteractionContext,
  UnhandledInteractionError: () => UnhandledInteractionError,
  UnhandledInteractionException: () => UnhandledInteractionError
});
module.exports = __toCommonJS(interaction_exports);
var import_rxjs = require("rxjs");
class InteractionContext {
  constructor(Input, signal) {
    this.Input = Input;
    this.Signal = signal ?? new AbortController().signal;
  }
  Input;
  handled = false;
  output;
  Signal;
  get IsHandled() {
    return this.handled;
  }
  GetInput() {
    return this.Input;
  }
  SetOutput(output) {
    if (this.handled) throw new Error("Output has already been set.");
    this.output = output;
    this.handled = true;
  }
  GetOutput() {
    if (!this.handled) throw new Error("Output has not been set.");
    return this.output;
  }
  get input() {
    return this.Input;
  }
  get isHandled() {
    return this.IsHandled;
  }
  get signal() {
    return this.Signal;
  }
  setOutput(output) {
    this.SetOutput(output);
  }
}
class UnhandledInteractionError extends Error {
  constructor(Interaction2, Input) {
    super("No registered interaction handler provided an output.");
    this.Interaction = Interaction2;
    this.Input = Input;
    this.name = "UnhandledInteractionError";
  }
  Interaction;
  Input;
}
class Interaction {
  constructor(handlerScheduler = import_rxjs.queueScheduler) {
    this.handlerScheduler = handlerScheduler;
  }
  handlerScheduler;
  handlers = [];
  requests = /* @__PURE__ */ new Set();
  disposed = false;
  RegisterHandler(handler) {
    if (typeof handler !== "function") throw new TypeError("handler must be a function.");
    if (this.disposed) throw new Error("Interaction has been disposed.");
    const entry = { handler };
    this.handlers.push(entry);
    const subscription = new import_rxjs.Subscription(() => {
      const index = this.handlers.indexOf(entry);
      if (index >= 0) this.handlers.splice(index, 1);
    });
    return Object.assign(subscription, { Dispose() {
      subscription.unsubscribe();
    } });
  }
  Handle(input) {
    return new import_rxjs.Observable((downstream) => {
      if (this.disposed) {
        downstream.error(new Error("Interaction has been disposed."));
        return;
      }
      const handlers = this.handlers.slice().reverse();
      const controller = new AbortController();
      const context = this.GenerateContext(input, controller.signal);
      const lifetime = new import_rxjs.Subscription();
      let index = 0;
      const cancel = () => {
        controller.abort();
        lifetime.unsubscribe();
        this.requests.delete(cancel);
        if (!downstream.closed) downstream.complete();
      };
      this.requests.add(cancel);
      downstream.add(cancel);
      const step = () => {
        const work = this.handlerScheduler.schedule(() => {
          if (downstream.closed) return;
          if (context.IsHandled) {
            downstream.next(context.GetOutput());
            downstream.complete();
            return;
          }
          if (index >= handlers.length) {
            downstream.error(new UnhandledInteractionError(this, input));
            return;
          }
          try {
            const result = handlers[index++].handler(context);
            if (downstream.closed) return;
            const observer = new import_rxjs.Subscriber({
              next: () => {
              },
              error: (error) => downstream.error(error),
              complete: step
            });
            lifetime.add(observer);
            (result == null ? (0, import_rxjs.of)(void 0) : (0, import_rxjs.from)(result)).subscribe(observer);
          } catch (error) {
            downstream.error(error);
          }
        });
        lifetime.add(work);
      };
      step();
    });
  }
  GenerateContext(input, signal) {
    return new InteractionContext(input, signal);
  }
  get IsDisposed() {
    return this.disposed;
  }
  get HandlerCount() {
    return this.handlers.length;
  }
  handle(input) {
    return this.Handle(input);
  }
  registerHandler(handler) {
    return this.RegisterHandler(handler);
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.handlers = [];
    for (const cancel of [...this.requests]) cancel();
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Interaction,
  InteractionContext,
  UnhandledInteractionError,
  UnhandledInteractionException
});
//# sourceMappingURL=interaction.js.map
