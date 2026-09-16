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
var command_exports = {};
__export(command_exports, {
  InvokeCommand: () => InvokeCommand,
  ReactiveCommand: () => ReactiveCommand,
  invokeCommand: () => invokeCommand
});
module.exports = __toCommonJS(command_exports);
var import_rxjs = require("rxjs");
var import_rx_app = require("./rx-app.js");
class ReactiveCommand extends import_rxjs.Observable {
  constructor(executeFactory, canExecute, outputScheduler = import_rx_app.RxApp.MainThreadScheduler, tracksPromise = false) {
    const results = new import_rxjs.Subject();
    super((subscriber) => results.subscribe(subscriber));
    this.executeFactory = executeFactory;
    this.outputScheduler = outputScheduler;
    this.tracksPromise = tracksPromise;
    if (typeof executeFactory !== "function") throw new TypeError("execute must be a function.");
    this.results = results;
    this.Results = results.asObservable();
    this.lifetime.add((canExecute ?? (0, import_rxjs.of)(true)).subscribe({
      next: (value) => {
        this.userCanExecute = Boolean(value);
        this.setCanExecute(this.CanExecuteValue);
      },
      error: (error) => {
        this.userCanExecute = false;
        this.setCanExecute(false);
        this.reportException(error);
      }
    }));
  }
  executeFactory;
  outputScheduler;
  tracksPromise;
  results;
  canExecuteState = new import_rxjs.BehaviorSubject(false);
  executingState = new import_rxjs.BehaviorSubject(false);
  exceptions = new import_rxjs.Subject();
  lifetime = new import_rxjs.Subscription();
  scheduled = new import_rxjs.Subscription();
  executions = /* @__PURE__ */ new Set();
  userCanExecute = false;
  inFlight = 0;
  disposed = false;
  forwardExecutionErrors = true;
  CanExecute = this.canExecuteState.asObservable();
  IsExecuting = this.executingState.asObservable();
  ThrownExceptions = this.exceptions.asObservable();
  Results;
  /** Compatibility hook; by default this delegates to RxApp's current handler. */
  static DefaultExceptionHandler = (error) => import_rx_app.RxApp.HandleException(error);
  static Create(execute, canExecute, outputScheduler) {
    if (typeof execute !== "function") throw new TypeError("execute must be a function.");
    return new ReactiveCommand((input) => (0, import_rxjs.of)(execute(input)), canExecute, outputScheduler);
  }
  static CreateFromTask(execute, canExecute, outputScheduler) {
    return new ReactiveCommand(execute, canExecute, outputScheduler, true);
  }
  static CreateFromObservable(execute, canExecute, outputScheduler) {
    return new ReactiveCommand(execute, canExecute, outputScheduler);
  }
  /** Execute every child, combining the latest result from each child. */
  static CreateCombined(commands, canExecute, outputScheduler) {
    if (commands == null) throw new TypeError("commands are required.");
    const children = [...commands];
    if (!children.length) throw new RangeError("At least one child command is required.");
    const enabled = (0, import_rxjs.combineLatest)([
      canExecute ?? (0, import_rxjs.of)(true),
      ...children.map((command) => command.CanExecute)
    ]).pipe((0, import_rxjs.map)((states) => states.every(Boolean)));
    const combined = ReactiveCommand.CreateFromObservable(
      (input) => (0, import_rxjs.combineLatest)(children.map((command) => command.Execute(input))),
      enabled,
      outputScheduler
    );
    combined.forwardExecutionErrors = false;
    for (const child of children) {
      combined.lifetime.add(child.ThrownExceptions.subscribe((error) => {
        combined.reportException(error);
      }));
    }
    return combined;
  }
  static create = ReactiveCommand.Create;
  static createFromTask = ReactiveCommand.CreateFromTask;
  static createFromObservable = ReactiveCommand.CreateFromObservable;
  static createCombined = ReactiveCommand.CreateCombined;
  get CanExecuteValue() {
    return !this.disposed && this.userCanExecute && this.inFlight === 0;
  }
  get IsExecutingValue() {
    return this.inFlight > 0;
  }
  get IsDisposed() {
    return this.disposed;
  }
  get canExecute$() {
    return this.CanExecute;
  }
  get isExecuting$() {
    return this.IsExecuting;
  }
  get thrownExceptions$() {
    return this.ThrownExceptions;
  }
  Execute(input) {
    return new import_rxjs.Observable((downstream) => {
      if (this.disposed) {
        const error = new Error("ReactiveCommand has been disposed.");
        error.name = "ObjectDisposedError";
        downstream.error(error);
        return;
      }
      const controller = new AbortController();
      let ended = false;
      let cancelled = false;
      let taskSettled = false;
      let taskStarted = false;
      const inner = new import_rxjs.Subscription();
      const finish = () => {
        if (ended) return;
        ended = true;
        this.executions.delete(cancel);
        this.inFlight = Math.max(0, this.inFlight - 1);
        this.publishState();
      };
      const cancel = () => {
        if (!cancelled) {
          cancelled = true;
          controller.abort();
          inner.unsubscribe();
        }
        if (!taskStarted || taskSettled || this.disposed) finish();
        if (!downstream.closed) downstream.complete();
      };
      this.executions.add(cancel);
      this.inFlight++;
      this.publishState();
      downstream.add(cancel);
      const value = (result) => {
        if (cancelled || downstream.closed || this.disposed) return;
        downstream.next(result);
        this.schedule(() => this.results.next(result));
      };
      const fail = (error) => {
        finish();
        if (cancelled || downstream.closed || this.disposed) return;
        if (this.forwardExecutionErrors) this.reportException(error);
        downstream.error(error);
      };
      try {
        if (downstream.closed || this.disposed) return;
        const source = this.executeFactory(input, controller.signal);
        if (this.tracksPromise) {
          if (source == null || typeof source.then !== "function") {
            throw new TypeError("CreateFromTask must return a Promise or thenable.");
          }
          taskStarted = true;
          Promise.resolve(source).then(
            (result) => {
              taskSettled = true;
              value(result);
              finish();
              downstream.complete();
            },
            (error) => {
              taskSettled = true;
              fail(error);
            }
          );
        } else {
          const observer = new import_rxjs.Subscriber({
            next: value,
            error: fail,
            complete: () => {
              finish();
              downstream.complete();
            }
          });
          inner.add(observer);
          (0, import_rxjs.from)(source).subscribe(observer);
        }
      } catch (error) {
        fail(error);
      }
    });
  }
  /** Gated, eager execution for DOM events and ICommand-style use. */
  Invoke(input) {
    return this.CanExecuteValue ? this.Execute(input).subscribe({ error: () => {
    } }) : import_rxjs.Subscription.EMPTY;
  }
  execute(input) {
    return this.Execute(input);
  }
  invoke(input) {
    return this.Invoke(input);
  }
  executeAsync(input) {
    return new Promise((resolve, reject) => {
      let found = false;
      let last;
      this.Execute(input).subscribe({
        next: (value) => {
          found = true;
          last = value;
        },
        error: reject,
        complete: () => found ? resolve(last) : reject(new Error("The command completed without a result."))
      });
    });
  }
  Dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.lifetime.unsubscribe();
    for (const cancel of [...this.executions]) cancel();
    this.scheduled.unsubscribe();
    this.inFlight = 0;
    this.setCanExecute(false);
    if (this.executingState.value) this.executingState.next(false);
    this.canExecuteState.complete();
    this.executingState.complete();
    this.results.complete();
    this.exceptions.complete();
  }
  unsubscribe() {
    this.Dispose();
  }
  dispose() {
    this.Dispose();
  }
  setCanExecute(value) {
    if (this.canExecuteState.value !== value) this.canExecuteState.next(value);
  }
  publishState() {
    const executing = this.IsExecutingValue;
    this.schedule(() => {
      if (this.executingState.value !== executing) this.executingState.next(executing);
      this.setCanExecute(!this.disposed && this.userCanExecute && !executing);
    });
  }
  reportException(error) {
    this.schedule(() => {
      if (this.exceptions.observed) this.exceptions.next(error);
      else ReactiveCommand.DefaultExceptionHandler(error);
    });
  }
  schedule(action) {
    if (this.disposed) return;
    const scheduled = this.outputScheduler.schedule(function() {
      action();
      this.unsubscribe();
    });
    this.scheduled.add(scheduled);
  }
}
function InvokeCommand(sourceOrCommand, command) {
  const target = command ?? sourceOrCommand;
  const operator = (source) => source.pipe(
    (0, import_rxjs.withLatestFrom)(target.CanExecute),
    (0, import_rxjs.filter)(([, enabled]) => enabled && target.CanExecuteValue),
    (0, import_rxjs.mergeMap)(([input]) => target.Execute(input).pipe((0, import_rxjs.catchError)(() => import_rxjs.EMPTY)))
  );
  if (!command) return operator;
  const subscription = operator(sourceOrCommand).subscribe({
    error: (error) => ReactiveCommand.DefaultExceptionHandler(error)
  });
  return Object.assign(subscription, { Dispose() {
    subscription.unsubscribe();
  } });
}
const invokeCommand = InvokeCommand;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InvokeCommand,
  ReactiveCommand,
  invokeCommand
});
//# sourceMappingURL=command.js.map
