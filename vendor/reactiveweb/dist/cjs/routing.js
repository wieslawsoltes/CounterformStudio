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
var routing_exports = {};
__export(routing_exports, {
  IsCurrentViewModel: () => IsCurrentViewModel,
  RoutingState: () => RoutingState,
  WhenNavigatedFrom: () => WhenNavigatedFrom,
  WhenNavigatedTo: () => WhenNavigatedTo,
  WhenNavigatedToObservable: () => WhenNavigatedToObservable,
  WhenNavigatingFromObservable: () => WhenNavigatingFromObservable
});
module.exports = __toCommonJS(routing_exports);
var import_rxjs = require("rxjs");
var import_disposables = require("./disposables.js");
var import_collections = require("./collections.js");
var import_command = require("./command.js");
class RoutingState {
  NavigationStack = new import_collections.ObservableCollection();
  CurrentViewModel;
  Navigate;
  NavigateBack;
  NavigateAndReset;
  constructor() {
    this.CurrentViewModel = this.NavigationStack.ItemsChanged.pipe((0, import_rxjs.map)((stack) => stack.at(-1) ?? null), (0, import_rxjs.distinctUntilChanged)());
    this.Navigate = import_command.ReactiveCommand.Create((viewModel) => {
      this.validate(viewModel);
      this.NavigationStack.Add(viewModel);
      return viewModel;
    });
    this.NavigateBack = import_command.ReactiveCommand.Create(() => {
      if (this.NavigationStack.Count > 1) this.NavigationStack.RemoveAt(this.NavigationStack.Count - 1);
      return this.CurrentViewModelValue;
    }, this.NavigationStack.CountChanged.pipe((0, import_rxjs.map)((count) => count > 1)));
    this.NavigateAndReset = import_command.ReactiveCommand.Create((viewModel) => {
      this.validate(viewModel);
      this.NavigationStack.Reset([viewModel]);
      return viewModel;
    });
  }
  validate(viewModel) {
    if (!viewModel || typeof viewModel.UrlPathSegment !== "string") throw new TypeError("Navigation requires an IRoutableViewModel with UrlPathSegment");
  }
  get CurrentViewModelValue() {
    return this.NavigationStack.Items.at(-1) ?? null;
  }
  get CurrentPath() {
    return this.NavigationStack.Items.map((item) => item.UrlPathSegment).join("/");
  }
  FindViewModelInStack(type) {
    return [...this.NavigationStack.Items].reverse().find((item) => item instanceof type);
  }
  Dispose() {
    this.Navigate.Dispose();
    this.NavigateBack.Dispose();
    this.NavigateAndReset.Dispose();
    this.NavigationStack.Dispose();
  }
  unsubscribe() {
    this.Dispose();
  }
}
function WhenNavigatedTo(viewModel, onNavigate) {
  if (onNavigate) {
    let resource, current = false;
    const subscription = viewModel.HostScreen.Router.CurrentViewModel.subscribe((value) => {
      const isCurrent = value === viewModel;
      if (isCurrent && !current) {
        current = true;
        resource = onNavigate();
      } else if (!isCurrent && current) {
        current = false;
        const old = resource;
        resource = void 0;
        (0, import_disposables.dispose)(old);
      }
    });
    return import_disposables.Disposable.Create(() => {
      subscription.unsubscribe();
      (0, import_disposables.dispose)(resource);
      resource = void 0;
    });
  }
  return new import_rxjs.Observable((subscriber) => {
    let wasCurrent = false;
    return viewModel.HostScreen.Router.CurrentViewModel.subscribe((current) => {
      const isCurrent = current === viewModel;
      if (isCurrent && !wasCurrent) subscriber.next();
      wasCurrent = isCurrent;
    });
  });
}
function WhenNavigatedFrom(viewModel) {
  return new import_rxjs.Observable((subscriber) => {
    let wasCurrent = false;
    return viewModel.HostScreen.Router.CurrentViewModel.subscribe((current) => {
      const isCurrent = current === viewModel;
      if (!isCurrent && wasCurrent) subscriber.next();
      wasCurrent = isCurrent;
    });
  });
}
function IsCurrentViewModel(viewModel) {
  return viewModel.HostScreen.Router.CurrentViewModel.pipe((0, import_rxjs.map)((current) => current === viewModel), (0, import_rxjs.distinctUntilChanged)());
}
const WhenNavigatedToObservable = (viewModel) => WhenNavigatedTo(viewModel);
const WhenNavigatingFromObservable = WhenNavigatedFrom;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IsCurrentViewModel,
  RoutingState,
  WhenNavigatedFrom,
  WhenNavigatedTo,
  WhenNavigatedToObservable,
  WhenNavigatingFromObservable
});
//# sourceMappingURL=routing.js.map
