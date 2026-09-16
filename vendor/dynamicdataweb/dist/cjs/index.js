var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except3, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except3)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  Adapt: () => import_extras2.adapt,
  AddKey: () => import_extras3.addKey,
  AddOrInsertRange: () => import_helpers2.addOrInsertRange,
  AddOrUpdate: () => import_compatibility2.addOrUpdate,
  AggregateType: () => import_advanced.AggregateType,
  And: () => import_advanced2.and,
  AsAggregator: () => import_helpers3.asAggregator,
  AsArray: () => import_kernel2.asArray,
  AsList: () => import_kernel3.asList,
  AsObservableCache: () => import_operators.AsObservableCache,
  AsObservableList: () => import_operators.AsObservableList,
  AsWatcher: () => import_helpers4.asWatcher,
  AsyncDisposeMany: () => import_lifecycle2.asyncDisposeMany,
  AutoRefresh: () => import_lifecycle3.autoRefresh,
  AutoRefreshOnObservable: () => import_lifecycle4.autoRefreshOnObservable,
  Average: () => import_advanced3.average,
  Avg: () => import_advanced4.avg,
  Batch: () => import_lifecycle5.batch,
  BatchIf: () => import_lifecycle6.batchIf,
  BinarySearch: () => import_helpers5.binarySearch,
  Bind: () => import_operators.Bind,
  BindToObservableCollection: () => import_operators.BindToObservableCollection,
  BindToObservableList: () => import_operators.BindToObservableList,
  BindingOptions: () => import_compatibility.BindingOptions,
  BufferIf: () => import_lifecycle7.bufferIf,
  BufferInitial: () => import_lifecycle8.bufferInitial,
  Cast: () => import_operators.Cast,
  CastToObject: () => import_operators.CastToObject,
  Change: () => import_core.Change,
  ChangeAwareCache: () => import_core.ChangeAwareCache,
  ChangeAwareList: () => import_core.ChangeAwareList,
  ChangeKey: () => import_operators.ChangeKey,
  ChangeReason: () => import_core.ChangeReason,
  ChangeSet: () => import_core.ChangeSet,
  ChangeSetAggregator: () => import_helpers.ChangeSetAggregator,
  ChangeStatistics: () => import_extras.ChangeStatistics,
  ChangeSummary: () => import_extras.ChangeSummary,
  ChangeType: () => import_core.ChangeType,
  Clear: () => import_compatibility3.clear,
  Clone: () => import_extras4.clone,
  CollectUpdateStats: () => import_extras5.collectUpdateStats,
  Combine: () => import_advanced5.combine,
  CombineOperator: () => import_advanced.CombineOperator,
  ConnectionStatus: () => import_lifecycle.ConnectionStatus,
  Convert: () => import_operators.Convert,
  ConvertOptional: () => import_kernel4.convertOptional,
  ConvertOr: () => import_kernel5.convertOr,
  Count: () => import_advanced6.count,
  CreateObservableObject: () => import_lifecycle9.createObservableObject,
  CreateOptional: () => import_kernel6.createOptional,
  DeferUntilLoaded: () => import_lifecycle10.deferUntilLoaded,
  DisposeMany: () => import_lifecycle11.disposeMany,
  DistinctValues: () => import_operators.DistinctValues,
  Duplicates: () => import_kernel7.duplicates,
  DynamicDataOptions: () => import_compatibility.DynamicDataOptions,
  EditDiff: () => import_compatibility4.editDiff,
  EnsureUniqueKeys: () => import_extras6.ensureUniqueKeys,
  Error: () => import_kernel.Error,
  ErrorInfo: () => import_kernel.ErrorInfo,
  Except: () => import_advanced7.except,
  ExcludeUpdateWhen: () => import_extras7.excludeUpdateWhen,
  ExpireAfter: () => import_lifecycle12.expireAfter,
  Filter: () => import_operators.Filter,
  FilterImmutable: () => import_operators.FilterImmutable,
  FilterOnObservable: () => import_lifecycle13.filterOnObservable,
  FilterOnProperty: () => import_lifecycle14.filterOnProperty,
  FilterWithState: () => import_operators.FilterWithState,
  FinallySafe: () => import_lifecycle15.finallySafe,
  FirstOrOptional: () => import_kernel8.firstOrOptional,
  Flatten: () => import_extras8.flatten,
  FlattenBufferResult: () => import_extras9.flattenBufferResult,
  FlattenChanges: () => import_extras10.flattenChanges,
  ForAggregation: () => import_advanced8.forAggregation,
  ForEachChange: () => import_extras11.forEachChange,
  ForEachItemChange: () => import_extras12.forEachItemChange,
  FromOptional: () => import_kernel9.fromOptional,
  FullJoin: () => import_advanced9.fullJoin,
  FullJoinMany: () => import_advanced10.fullJoinMany,
  GetChangeType: () => import_helpers6.getChangeType,
  GetValueOrDefault: () => import_kernel10.getValueOrDefault,
  Group: () => import_advanced.Group,
  GroupOn: () => import_advanced11.groupOn,
  GroupOnImmutable: () => import_advanced12.groupOnImmutable,
  GroupOnObservable: () => import_advanced13.groupOnObservable,
  GroupOnProperty: () => import_advanced14.groupOnProperty,
  GroupOnPropertyWithImmutableState: () => import_advanced15.groupOnPropertyWithImmutableState,
  GroupWithImmutableState: () => import_advanced16.groupWithImmutableState,
  GroupWithSpecifiedGroups: () => import_advanced17.groupWithSpecifiedGroups,
  IfHasValue: () => import_kernel11.ifHasValue,
  IgnoreSameReferenceUpdate: () => import_extras13.ignoreSameReferenceUpdate,
  IgnoreUpdateWhen: () => import_extras14.ignoreUpdateWhen,
  ImmutableGroup: () => import_advanced.ImmutableGroup,
  IncludeUpdateWhen: () => import_extras15.includeUpdateWhen,
  IndexOfMany: () => import_kernel12.indexOfMany,
  IndexOfOptional: () => import_helpers7.indexOfOptional,
  InnerJoin: () => import_advanced18.innerJoin,
  InnerJoinMany: () => import_advanced19.innerJoinMany,
  IntermediateCache: () => import_core.IntermediateCache,
  InvalidateWhen: () => import_advanced20.invalidateWhen,
  InvokeEvaluate: () => import_extras16.invokeEvaluate,
  IsEmpty: () => import_compatibility5.isEmpty,
  IsNotEmpty: () => import_compatibility6.isNotEmpty,
  ItemChange: () => import_core.ItemChange,
  ItemChanges: () => import_extras17.itemChanges,
  ItemWithIndex: () => import_kernel.ItemWithIndex,
  ItemWithValue: () => import_kernel.ItemWithValue,
  LeftJoin: () => import_advanced21.leftJoin,
  LeftJoinMany: () => import_advanced22.leftJoinMany,
  LimitSizeTo: () => import_lifecycle16.limitSizeTo,
  ListChange: () => import_core.ListChange,
  ListChangeReason: () => import_core.ListChangeReason,
  Lookup: () => import_kernel13.lookup,
  Max: () => import_advanced23.max,
  Maximum: () => import_compatibility7.maximum,
  MergeChangeSets: () => import_extras18.mergeChangeSets,
  MergeMany: () => import_lifecycle17.mergeMany,
  MergeManyChangeSets: () => import_extras19.mergeManyChangeSets,
  MergeManyItems: () => import_lifecycle18.mergeManyItems,
  Min: () => import_advanced24.min,
  Minimum: () => import_compatibility8.minimum,
  MonitorStatus: () => import_lifecycle19.monitorStatus,
  Node: () => import_extras.Node,
  NotEmpty: () => import_lifecycle20.notEmpty,
  NotifyPropertyChanged: () => import_lifecycle21.notifyPropertyChanged,
  ObservableCache: () => import_core.ObservableCache,
  ObservableChangeSet: () => import_lifecycle.ObservableChangeSet,
  ObservableCollectionExtended: () => import_compatibility.ObservableCollectionExtended,
  ObservableList: () => import_core.ObservableList,
  ObservableObject: () => import_lifecycle22.observableObject,
  ObserveCollectionChanges: () => import_lifecycle23.observeCollectionChanges,
  ObserveOn: () => import_compatibility9.observeOn,
  ObserveOnDispatcher: () => import_compatibility10.observeOnDispatcher,
  ObserveProperty: () => import_lifecycle24.observeProperty,
  OfType: () => import_operators.OfType,
  OnHasNoValue: () => import_kernel14.onHasNoValue,
  OnHasValue: () => import_kernel15.onHasValue,
  OnItemAdded: () => import_lifecycle25.onItemAdded,
  OnItemRefreshed: () => import_lifecycle26.onItemRefreshed,
  OnItemRemoved: () => import_lifecycle27.onItemRemoved,
  OnItemUpdated: () => import_lifecycle28.onItemUpdated,
  OptionElse: () => import_kernel.OptionElse,
  Optional: () => import_core.Optional,
  Or: () => import_advanced25.or,
  OrElse: () => import_kernel16.orElse,
  Page: () => import_operators.Page,
  PageRequest: () => import_compatibility.PageRequest,
  PopulateFrom: () => import_extras20.populateFrom,
  PopulateInto: () => import_extras21.populateInto,
  QuerySnapshot: () => import_extras.QuerySnapshot,
  QueryWhenChanged: () => import_extras22.queryWhenChanged,
  RangeChange: () => import_core.RangeChange,
  RefCount: () => import_lifecycle29.refCount,
  Refresh: () => import_compatibility11.refresh,
  Remove: () => import_compatibility12.remove,
  RemoveIfContained: () => import_kernel17.removeIfContained,
  RemoveIndex: () => import_extras23.removeIndex,
  RemoveKey: () => import_operators.RemoveKey,
  RemoveKeys: () => import_compatibility13.removeKeys,
  ReplaceOrAdd: () => import_helpers8.replaceOrAdd,
  RetryWithBackOff: () => import_helpers9.retryWithBackOff,
  Reverse: () => import_operators.Reverse,
  RightJoin: () => import_advanced26.rightJoin,
  RightJoinMany: () => import_advanced27.rightJoinMany,
  ScheduleRecurringAction: () => import_helpers10.scheduleRecurringAction,
  SelectValues: () => import_kernel18.selectValues,
  SkipInitial: () => import_lifecycle30.skipInitial,
  Sort: () => import_operators.Sort,
  SortAndBind: () => import_operators.SortAndBind,
  SortAndBindOptions: () => import_compatibility.SortAndBindOptions,
  SortAndPage: () => import_operators.SortAndPage,
  SortAndVirtualise: () => import_operators.SortAndVirtualise,
  SortAndVirtualize: () => import_operators.SortAndVirtualize,
  SortBy: () => import_operators.SortBy,
  SortDirection: () => import_compatibility.SortDirection,
  SortExpression: () => import_kernel.SortExpression,
  SortExpressionComparer: () => import_compatibility.SortExpressionComparer,
  SortOptions: () => import_compatibility.SortOptions,
  SourceCache: () => import_core.SourceCache,
  SourceList: () => import_core.SourceList,
  StandardDeviation: () => import_advanced28.standardDeviation,
  StartWithEmpty: () => import_extras24.startWithEmpty,
  StartWithItem: () => import_extras25.startWithItem,
  StdDev: () => import_advanced29.stdDev,
  SubscribeMany: () => import_lifecycle31.subscribeMany,
  SubscribeOn: () => import_compatibility14.subscribeOn,
  Sum: () => import_advanced30.sum,
  SumMany: () => import_advanced31.sumMany,
  SuppressRefresh: () => import_extras26.suppressRefresh,
  Switch: () => import_lifecycle32.switch,
  ToCollection: () => import_operators.ToCollection,
  ToObservableChangeSet: () => import_lifecycle33.toObservableChangeSet,
  ToObservableOptional: () => import_extras27.toObservableOptional,
  ToOptional: () => import_kernel19.toOptional,
  ToSortedCollection: () => import_extras28.toSortedCollection,
  Top: () => import_operators.Top,
  Transform: () => import_operators.Transform,
  TransformAsync: () => import_lifecycle34.transformAsync,
  TransformImmutable: () => import_operators.TransformImmutable,
  TransformMany: () => import_operators.TransformMany,
  TransformManyAsync: () => import_lifecycle35.transformManyAsync,
  TransformManySafeAsync: () => import_lifecycle36.transformManySafeAsync,
  TransformOnObservable: () => import_lifecycle37.transformOnObservable,
  TransformSafe: () => import_operators.TransformSafe,
  TransformSafeAsync: () => import_lifecycle38.transformSafeAsync,
  TransformToTree: () => import_extras29.transformToTree,
  TransformWithInlineUpdate: () => import_operators.TransformWithInlineUpdate,
  TreatMovesAsRemoveAdd: () => import_extras30.treatMovesAsRemoveAdd,
  TrueForAll: () => import_lifecycle39.trueForAll,
  TrueForAny: () => import_lifecycle40.trueForAny,
  UpdateIndex: () => import_extras31.updateIndex,
  ValueOr: () => import_kernel20.valueOr,
  ValueOrDefault: () => import_kernel21.valueOrDefault,
  ValueOrThrow: () => import_kernel22.valueOrThrow,
  VirtualRequest: () => import_compatibility.VirtualRequest,
  Virtualise: () => import_operators.Virtualise,
  Virtualize: () => import_operators.Virtualize,
  Watch: () => import_lifecycle41.watch,
  WatchValue: () => import_lifecycle42.watchValue,
  Watcher: () => import_helpers.Watcher,
  WhenAnyPropertyChanged: () => import_lifecycle43.whenAnyPropertyChanged,
  WhenChanged: () => import_lifecycle44.whenChanged,
  WhenPropertyChanged: () => import_lifecycle45.whenPropertyChanged,
  WhenValueChanged: () => import_lifecycle46.whenValueChanged,
  WhereReasonsAre: () => import_extras32.whereReasonsAre,
  WhereReasonsAreNot: () => import_extras33.whereReasonsAreNot,
  Xor: () => import_advanced32.xor,
  YieldWithoutIndex: () => import_helpers11.yieldWithoutIndex,
  adapt: () => import_extras.adapt,
  addKey: () => import_extras.addKey,
  addOrInsertRange: () => import_helpers.addOrInsertRange,
  addOrUpdate: () => import_compatibility.addOrUpdate,
  and: () => import_advanced.and,
  applyChanges: () => import_core.applyChanges,
  asAggregator: () => import_helpers.asAggregator,
  asArray: () => import_kernel.asArray,
  asList: () => import_kernel.asList,
  asObservableCache: () => import_operators.asObservableCache,
  asObservableList: () => import_operators.asObservableList,
  asWatcher: () => import_helpers.asWatcher,
  asyncDisposeMany: () => import_lifecycle.asyncDisposeMany,
  autoRefresh: () => import_lifecycle.autoRefresh,
  autoRefreshOnObservable: () => import_lifecycle.autoRefreshOnObservable,
  average: () => import_advanced.average,
  avg: () => import_advanced.avg,
  batch: () => import_lifecycle.batch,
  batchIf: () => import_lifecycle.batchIf,
  binarySearch: () => import_helpers.binarySearch,
  bind: () => import_operators.bind,
  bindToObservableCollection: () => import_operators.bindToObservableCollection,
  bindToObservableList: () => import_operators.bindToObservableList,
  bufferIf: () => import_lifecycle.bufferIf,
  bufferInitial: () => import_lifecycle.bufferInitial,
  cast: () => import_operators.cast,
  castToObject: () => import_operators.castToObject,
  changeKey: () => import_operators.changeKey,
  clear: () => import_compatibility.clear,
  clone: () => import_extras.clone,
  collectUpdateStats: () => import_extras.collectUpdateStats,
  combine: () => import_advanced.combine,
  convert: () => import_operators.convert,
  convertOptional: () => import_kernel.convertOptional,
  convertOr: () => import_kernel.convertOr,
  count: () => import_advanced.count,
  createObservableObject: () => import_lifecycle.createObservableObject,
  createOptional: () => import_kernel.createOptional,
  deferUntilLoaded: () => import_lifecycle.deferUntilLoaded,
  disposeMany: () => import_lifecycle.disposeMany,
  distinctValues: () => import_operators.distinctValues,
  duplicates: () => import_kernel.duplicates,
  editDiff: () => import_compatibility.editDiff,
  ensureUniqueKeys: () => import_extras.ensureUniqueKeys,
  except: () => import_advanced.except,
  excludeUpdateWhen: () => import_extras.excludeUpdateWhen,
  expireAfter: () => import_lifecycle.expireAfter,
  filter: () => import_operators.filter,
  filterImmutable: () => import_operators.filterImmutable,
  filterOnObservable: () => import_lifecycle.filterOnObservable,
  filterOnProperty: () => import_lifecycle.filterOnProperty,
  filterWithState: () => import_operators.filterWithState,
  finallySafe: () => import_lifecycle.finallySafe,
  firstOrOptional: () => import_kernel.firstOrOptional,
  flatten: () => import_extras.flatten,
  flattenBufferResult: () => import_extras.flattenBufferResult,
  flattenChanges: () => import_extras.flattenChanges,
  fluent: () => import_compatibility.fluent,
  forAggregation: () => import_advanced.forAggregation,
  forEachChange: () => import_extras.forEachChange,
  forEachItemChange: () => import_extras.forEachItemChange,
  fromOptional: () => import_kernel.fromOptional,
  fullJoin: () => import_advanced.fullJoin,
  fullJoinMany: () => import_advanced.fullJoinMany,
  getChangeType: () => import_helpers.getChangeType,
  getValueOrDefault: () => import_kernel.getValueOrDefault,
  group: () => import_advanced.group,
  groupOn: () => import_advanced.groupOn,
  groupOnImmutable: () => import_advanced.groupOnImmutable,
  groupOnObservable: () => import_advanced.groupOnObservable,
  groupOnProperty: () => import_advanced.groupOnProperty,
  groupOnPropertyWithImmutableState: () => import_advanced.groupOnPropertyWithImmutableState,
  groupWithImmutableState: () => import_advanced.groupWithImmutableState,
  groupWithSpecifiedGroups: () => import_advanced.groupWithSpecifiedGroups,
  ifHasValue: () => import_kernel.ifHasValue,
  ignoreSameReferenceUpdate: () => import_extras.ignoreSameReferenceUpdate,
  ignoreUpdateWhen: () => import_extras.ignoreUpdateWhen,
  includeUpdateWhen: () => import_extras.includeUpdateWhen,
  indexOfMany: () => import_kernel.indexOfMany,
  indexOfOptional: () => import_helpers.indexOfOptional,
  innerJoin: () => import_advanced.innerJoin,
  innerJoinMany: () => import_advanced.innerJoinMany,
  installFluentOperators: () => import_compatibility.installFluentOperators,
  invalidateWhen: () => import_advanced.invalidateWhen,
  invokeEvaluate: () => import_extras.invokeEvaluate,
  isEmpty: () => import_compatibility.isEmpty,
  isNotEmpty: () => import_compatibility.isNotEmpty,
  itemChanges: () => import_extras.itemChanges,
  leftJoin: () => import_advanced.leftJoin,
  leftJoinMany: () => import_advanced.leftJoinMany,
  limitSizeTo: () => import_lifecycle.limitSizeTo,
  lookup: () => import_kernel.lookup,
  max: () => import_advanced.max,
  maximum: () => import_compatibility.maximum,
  mergeChangeSets: () => import_extras.mergeChangeSets,
  mergeMany: () => import_lifecycle.mergeMany,
  mergeManyChangeSets: () => import_extras.mergeManyChangeSets,
  mergeManyItems: () => import_lifecycle.mergeManyItems,
  min: () => import_advanced.min,
  minimum: () => import_compatibility.minimum,
  monitorStatus: () => import_lifecycle.monitorStatus,
  notEmpty: () => import_lifecycle.notEmpty,
  notifyPropertyChanged: () => import_lifecycle.notifyPropertyChanged,
  observableObject: () => import_lifecycle.observableObject,
  observeCollectionChanges: () => import_lifecycle.observeCollectionChanges,
  observeOn: () => import_compatibility.observeOn,
  observeOnDispatcher: () => import_compatibility.observeOnDispatcher,
  observeProperty: () => import_lifecycle.observeProperty,
  ofType: () => import_operators.ofType,
  onHasNoValue: () => import_kernel.onHasNoValue,
  onHasValue: () => import_kernel.onHasValue,
  onItemAdded: () => import_lifecycle.onItemAdded,
  onItemRefreshed: () => import_lifecycle.onItemRefreshed,
  onItemRemoved: () => import_lifecycle.onItemRemoved,
  onItemUpdated: () => import_lifecycle.onItemUpdated,
  or: () => import_advanced.or,
  orElse: () => import_kernel.orElse,
  page: () => import_operators.page,
  populateFrom: () => import_extras.populateFrom,
  populateInto: () => import_extras.populateInto,
  queryWhenChanged: () => import_extras.queryWhenChanged,
  refCount: () => import_lifecycle.refCount,
  refresh: () => import_compatibility.refresh,
  remove: () => import_compatibility.remove,
  removeIfContained: () => import_kernel.removeIfContained,
  removeIndex: () => import_extras.removeIndex,
  removeKey: () => import_operators.removeKey,
  removeKeys: () => import_compatibility.removeKeys,
  replaceOrAdd: () => import_helpers.replaceOrAdd,
  retryWithBackOff: () => import_helpers.retryWithBackOff,
  reverse: () => import_operators.reverse,
  rightJoin: () => import_advanced.rightJoin,
  rightJoinMany: () => import_advanced.rightJoinMany,
  scheduleRecurringAction: () => import_helpers.scheduleRecurringAction,
  selectValues: () => import_kernel.selectValues,
  setObservableDecorator: () => import_core.setObservableDecorator,
  skipInitial: () => import_lifecycle.skipInitial,
  snapshotChanges: () => import_core.snapshotChanges,
  sort: () => import_operators.sort,
  sortAndBind: () => import_operators.sortAndBind,
  sortAndPage: () => import_operators.sortAndPage,
  sortAndVirtualise: () => import_operators.sortAndVirtualise,
  sortAndVirtualize: () => import_operators.sortAndVirtualize,
  sortBy: () => import_operators.sortBy,
  standardDeviation: () => import_advanced.standardDeviation,
  startWithEmpty: () => import_extras.startWithEmpty,
  startWithItem: () => import_extras.startWithItem,
  stdDev: () => import_advanced.stdDev,
  subscribeMany: () => import_lifecycle.subscribeMany,
  subscribeOn: () => import_compatibility.subscribeOn,
  sum: () => import_advanced.sum,
  sumMany: () => import_advanced.sumMany,
  suppressRefresh: () => import_extras.suppressRefresh,
  switch: () => import_lifecycle.switch,
  switchLatest: () => import_lifecycle.switchLatest,
  toCollection: () => import_operators.toCollection,
  toObservableChangeSet: () => import_lifecycle.toObservableChangeSet,
  toObservableOptional: () => import_extras.toObservableOptional,
  toOptional: () => import_kernel.toOptional,
  toSortedCollection: () => import_extras.toSortedCollection,
  top: () => import_operators.top,
  transform: () => import_operators.transform,
  transformAsync: () => import_lifecycle.transformAsync,
  transformImmutable: () => import_operators.transformImmutable,
  transformMany: () => import_operators.transformMany,
  transformManyAsync: () => import_lifecycle.transformManyAsync,
  transformManySafeAsync: () => import_lifecycle.transformManySafeAsync,
  transformOnObservable: () => import_lifecycle.transformOnObservable,
  transformSafe: () => import_operators.transformSafe,
  transformSafeAsync: () => import_lifecycle.transformSafeAsync,
  transformToTree: () => import_extras.transformToTree,
  transformWithInlineUpdate: () => import_operators.transformWithInlineUpdate,
  treatMovesAsRemoveAdd: () => import_extras.treatMovesAsRemoveAdd,
  trueForAll: () => import_lifecycle.trueForAll,
  trueForAny: () => import_lifecycle.trueForAny,
  updateIndex: () => import_extras.updateIndex,
  valueOr: () => import_kernel.valueOr,
  valueOrDefault: () => import_kernel.valueOrDefault,
  valueOrThrow: () => import_kernel.valueOrThrow,
  virtualise: () => import_operators.virtualise,
  virtualize: () => import_operators.virtualize,
  watch: () => import_lifecycle.watch,
  watchValue: () => import_lifecycle.watchValue,
  whenAnyPropertyChanged: () => import_lifecycle.whenAnyPropertyChanged,
  whenChanged: () => import_lifecycle.whenChanged,
  whenPropertyChanged: () => import_lifecycle.whenPropertyChanged,
  whenValueChanged: () => import_lifecycle.whenValueChanged,
  whereReasonsAre: () => import_extras.whereReasonsAre,
  whereReasonsAreNot: () => import_extras.whereReasonsAreNot,
  xor: () => import_advanced.xor,
  yieldWithoutIndex: () => import_helpers.yieldWithoutIndex
});
module.exports = __toCommonJS(index_exports);
var import_core = require("./core.js");
var import_operators = require("./operators.js");
var import_advanced = require("./advanced.js");
var import_lifecycle = require("./lifecycle.js");
var import_extras = require("./extras.js");
var import_helpers = require("./helpers.js");
var import_kernel = require("./kernel.js");
var import_compatibility = require("./compatibility.js");
var import_advanced2 = require("./advanced.js");
var import_advanced3 = require("./advanced.js");
var import_advanced4 = require("./advanced.js");
var import_advanced5 = require("./advanced.js");
var import_advanced6 = require("./advanced.js");
var import_advanced7 = require("./advanced.js");
var import_advanced8 = require("./advanced.js");
var import_advanced9 = require("./advanced.js");
var import_advanced10 = require("./advanced.js");
var import_advanced11 = require("./advanced.js");
var import_advanced12 = require("./advanced.js");
var import_advanced13 = require("./advanced.js");
var import_advanced14 = require("./advanced.js");
var import_advanced15 = require("./advanced.js");
var import_advanced16 = require("./advanced.js");
var import_advanced17 = require("./advanced.js");
var import_advanced18 = require("./advanced.js");
var import_advanced19 = require("./advanced.js");
var import_advanced20 = require("./advanced.js");
var import_advanced21 = require("./advanced.js");
var import_advanced22 = require("./advanced.js");
var import_advanced23 = require("./advanced.js");
var import_advanced24 = require("./advanced.js");
var import_advanced25 = require("./advanced.js");
var import_advanced26 = require("./advanced.js");
var import_advanced27 = require("./advanced.js");
var import_advanced28 = require("./advanced.js");
var import_advanced29 = require("./advanced.js");
var import_advanced30 = require("./advanced.js");
var import_advanced31 = require("./advanced.js");
var import_advanced32 = require("./advanced.js");
var import_lifecycle2 = require("./lifecycle.js");
var import_lifecycle3 = require("./lifecycle.js");
var import_lifecycle4 = require("./lifecycle.js");
var import_lifecycle5 = require("./lifecycle.js");
var import_lifecycle6 = require("./lifecycle.js");
var import_lifecycle7 = require("./lifecycle.js");
var import_lifecycle8 = require("./lifecycle.js");
var import_lifecycle9 = require("./lifecycle.js");
var import_lifecycle10 = require("./lifecycle.js");
var import_lifecycle11 = require("./lifecycle.js");
var import_lifecycle12 = require("./lifecycle.js");
var import_lifecycle13 = require("./lifecycle.js");
var import_lifecycle14 = require("./lifecycle.js");
var import_lifecycle15 = require("./lifecycle.js");
var import_lifecycle16 = require("./lifecycle.js");
var import_lifecycle17 = require("./lifecycle.js");
var import_lifecycle18 = require("./lifecycle.js");
var import_lifecycle19 = require("./lifecycle.js");
var import_lifecycle20 = require("./lifecycle.js");
var import_lifecycle21 = require("./lifecycle.js");
var import_lifecycle22 = require("./lifecycle.js");
var import_lifecycle23 = require("./lifecycle.js");
var import_lifecycle24 = require("./lifecycle.js");
var import_lifecycle25 = require("./lifecycle.js");
var import_lifecycle26 = require("./lifecycle.js");
var import_lifecycle27 = require("./lifecycle.js");
var import_lifecycle28 = require("./lifecycle.js");
var import_lifecycle29 = require("./lifecycle.js");
var import_lifecycle30 = require("./lifecycle.js");
var import_lifecycle31 = require("./lifecycle.js");
var import_lifecycle32 = require("./lifecycle.js");
var import_lifecycle33 = require("./lifecycle.js");
var import_lifecycle34 = require("./lifecycle.js");
var import_lifecycle35 = require("./lifecycle.js");
var import_lifecycle36 = require("./lifecycle.js");
var import_lifecycle37 = require("./lifecycle.js");
var import_lifecycle38 = require("./lifecycle.js");
var import_lifecycle39 = require("./lifecycle.js");
var import_lifecycle40 = require("./lifecycle.js");
var import_lifecycle41 = require("./lifecycle.js");
var import_lifecycle42 = require("./lifecycle.js");
var import_lifecycle43 = require("./lifecycle.js");
var import_lifecycle44 = require("./lifecycle.js");
var import_lifecycle45 = require("./lifecycle.js");
var import_lifecycle46 = require("./lifecycle.js");
var import_extras2 = require("./extras.js");
var import_extras3 = require("./extras.js");
var import_extras4 = require("./extras.js");
var import_extras5 = require("./extras.js");
var import_extras6 = require("./extras.js");
var import_extras7 = require("./extras.js");
var import_extras8 = require("./extras.js");
var import_extras9 = require("./extras.js");
var import_extras10 = require("./extras.js");
var import_extras11 = require("./extras.js");
var import_extras12 = require("./extras.js");
var import_extras13 = require("./extras.js");
var import_extras14 = require("./extras.js");
var import_extras15 = require("./extras.js");
var import_extras16 = require("./extras.js");
var import_extras17 = require("./extras.js");
var import_extras18 = require("./extras.js");
var import_extras19 = require("./extras.js");
var import_extras20 = require("./extras.js");
var import_extras21 = require("./extras.js");
var import_extras22 = require("./extras.js");
var import_extras23 = require("./extras.js");
var import_extras24 = require("./extras.js");
var import_extras25 = require("./extras.js");
var import_extras26 = require("./extras.js");
var import_extras27 = require("./extras.js");
var import_extras28 = require("./extras.js");
var import_extras29 = require("./extras.js");
var import_extras30 = require("./extras.js");
var import_extras31 = require("./extras.js");
var import_extras32 = require("./extras.js");
var import_extras33 = require("./extras.js");
var import_helpers2 = require("./helpers.js");
var import_helpers3 = require("./helpers.js");
var import_helpers4 = require("./helpers.js");
var import_helpers5 = require("./helpers.js");
var import_helpers6 = require("./helpers.js");
var import_helpers7 = require("./helpers.js");
var import_helpers8 = require("./helpers.js");
var import_helpers9 = require("./helpers.js");
var import_helpers10 = require("./helpers.js");
var import_helpers11 = require("./helpers.js");
var import_kernel2 = require("./kernel.js");
var import_kernel3 = require("./kernel.js");
var import_kernel4 = require("./kernel.js");
var import_kernel5 = require("./kernel.js");
var import_kernel6 = require("./kernel.js");
var import_kernel7 = require("./kernel.js");
var import_kernel8 = require("./kernel.js");
var import_kernel9 = require("./kernel.js");
var import_kernel10 = require("./kernel.js");
var import_kernel11 = require("./kernel.js");
var import_kernel12 = require("./kernel.js");
var import_kernel13 = require("./kernel.js");
var import_kernel14 = require("./kernel.js");
var import_kernel15 = require("./kernel.js");
var import_kernel16 = require("./kernel.js");
var import_kernel17 = require("./kernel.js");
var import_kernel18 = require("./kernel.js");
var import_kernel19 = require("./kernel.js");
var import_kernel20 = require("./kernel.js");
var import_kernel21 = require("./kernel.js");
var import_kernel22 = require("./kernel.js");
var import_compatibility2 = require("./compatibility.js");
var import_compatibility3 = require("./compatibility.js");
var import_compatibility4 = require("./compatibility.js");
var import_compatibility5 = require("./compatibility.js");
var import_compatibility6 = require("./compatibility.js");
var import_compatibility7 = require("./compatibility.js");
var import_compatibility8 = require("./compatibility.js");
var import_compatibility9 = require("./compatibility.js");
var import_compatibility10 = require("./compatibility.js");
var import_compatibility11 = require("./compatibility.js");
var import_compatibility12 = require("./compatibility.js");
var import_compatibility13 = require("./compatibility.js");
var import_compatibility14 = require("./compatibility.js");
var import_operators2 = require("./operators.js");
var import_operators3 = require("./operators.js");
var import_operators4 = require("./operators.js");
var import_operators5 = require("./operators.js");
var import_operators6 = require("./operators.js");
var import_operators7 = require("./operators.js");
var import_operators8 = require("./operators.js");
var import_operators9 = require("./operators.js");
var import_operators10 = require("./operators.js");
var import_operators11 = require("./operators.js");
var import_operators12 = require("./operators.js");
var import_operators13 = require("./operators.js");
var import_operators14 = require("./operators.js");
var import_operators15 = require("./operators.js");
var import_operators16 = require("./operators.js");
var import_operators17 = require("./operators.js");
var import_operators18 = require("./operators.js");
var import_operators19 = require("./operators.js");
var import_operators20 = require("./operators.js");
var import_operators21 = require("./operators.js");
var import_operators22 = require("./operators.js");
var import_operators23 = require("./operators.js");
var import_operators24 = require("./operators.js");
var import_operators25 = require("./operators.js");
var import_operators26 = require("./operators.js");
var import_operators27 = require("./operators.js");
var import_operators28 = require("./operators.js");
var import_operators29 = require("./operators.js");
var import_operators30 = require("./operators.js");
var import_operators31 = require("./operators.js");
var import_operators32 = require("./operators.js");
var import_operators33 = require("./operators.js");
var import_advanced33 = require("./advanced.js");
var import_advanced34 = require("./advanced.js");
var import_advanced35 = require("./advanced.js");
var import_advanced36 = require("./advanced.js");
var import_advanced37 = require("./advanced.js");
var import_advanced38 = require("./advanced.js");
var import_advanced39 = require("./advanced.js");
var import_advanced40 = require("./advanced.js");
var import_advanced41 = require("./advanced.js");
var import_advanced42 = require("./advanced.js");
var import_advanced43 = require("./advanced.js");
var import_advanced44 = require("./advanced.js");
var import_advanced45 = require("./advanced.js");
var import_advanced46 = require("./advanced.js");
var import_advanced47 = require("./advanced.js");
var import_advanced48 = require("./advanced.js");
var import_advanced49 = require("./advanced.js");
var import_advanced50 = require("./advanced.js");
var import_advanced51 = require("./advanced.js");
var import_advanced52 = require("./advanced.js");
var import_advanced53 = require("./advanced.js");
var import_advanced54 = require("./advanced.js");
var import_advanced55 = require("./advanced.js");
var import_advanced56 = require("./advanced.js");
var import_advanced57 = require("./advanced.js");
var import_advanced58 = require("./advanced.js");
var import_advanced59 = require("./advanced.js");
var import_advanced60 = require("./advanced.js");
var import_advanced61 = require("./advanced.js");
var import_advanced62 = require("./advanced.js");
var import_advanced63 = require("./advanced.js");
var import_advanced64 = require("./advanced.js");
var import_lifecycle47 = require("./lifecycle.js");
var import_lifecycle48 = require("./lifecycle.js");
var import_lifecycle49 = require("./lifecycle.js");
var import_lifecycle50 = require("./lifecycle.js");
var import_lifecycle51 = require("./lifecycle.js");
var import_lifecycle52 = require("./lifecycle.js");
var import_lifecycle53 = require("./lifecycle.js");
var import_lifecycle54 = require("./lifecycle.js");
var import_lifecycle55 = require("./lifecycle.js");
var import_lifecycle56 = require("./lifecycle.js");
var import_lifecycle57 = require("./lifecycle.js");
var import_lifecycle58 = require("./lifecycle.js");
var import_lifecycle59 = require("./lifecycle.js");
var import_lifecycle60 = require("./lifecycle.js");
var import_lifecycle61 = require("./lifecycle.js");
var import_lifecycle62 = require("./lifecycle.js");
var import_lifecycle63 = require("./lifecycle.js");
var import_lifecycle64 = require("./lifecycle.js");
var import_lifecycle65 = require("./lifecycle.js");
var import_lifecycle66 = require("./lifecycle.js");
var import_lifecycle67 = require("./lifecycle.js");
var import_lifecycle68 = require("./lifecycle.js");
var import_lifecycle69 = require("./lifecycle.js");
var import_lifecycle70 = require("./lifecycle.js");
var import_lifecycle71 = require("./lifecycle.js");
var import_lifecycle72 = require("./lifecycle.js");
var import_lifecycle73 = require("./lifecycle.js");
var import_lifecycle74 = require("./lifecycle.js");
var import_lifecycle75 = require("./lifecycle.js");
var import_lifecycle76 = require("./lifecycle.js");
var import_lifecycle77 = require("./lifecycle.js");
var import_lifecycle78 = require("./lifecycle.js");
var import_lifecycle79 = require("./lifecycle.js");
var import_lifecycle80 = require("./lifecycle.js");
var import_lifecycle81 = require("./lifecycle.js");
var import_lifecycle82 = require("./lifecycle.js");
var import_lifecycle83 = require("./lifecycle.js");
var import_lifecycle84 = require("./lifecycle.js");
var import_lifecycle85 = require("./lifecycle.js");
var import_lifecycle86 = require("./lifecycle.js");
var import_lifecycle87 = require("./lifecycle.js");
var import_lifecycle88 = require("./lifecycle.js");
var import_lifecycle89 = require("./lifecycle.js");
var import_lifecycle90 = require("./lifecycle.js");
var import_lifecycle91 = require("./lifecycle.js");
var import_extras34 = require("./extras.js");
var import_extras35 = require("./extras.js");
var import_extras36 = require("./extras.js");
var import_extras37 = require("./extras.js");
var import_extras38 = require("./extras.js");
var import_extras39 = require("./extras.js");
var import_extras40 = require("./extras.js");
var import_extras41 = require("./extras.js");
var import_extras42 = require("./extras.js");
var import_extras43 = require("./extras.js");
var import_extras44 = require("./extras.js");
var import_extras45 = require("./extras.js");
var import_extras46 = require("./extras.js");
var import_extras47 = require("./extras.js");
var import_extras48 = require("./extras.js");
var import_extras49 = require("./extras.js");
var import_extras50 = require("./extras.js");
var import_extras51 = require("./extras.js");
var import_extras52 = require("./extras.js");
var import_extras53 = require("./extras.js");
var import_extras54 = require("./extras.js");
var import_extras55 = require("./extras.js");
var import_extras56 = require("./extras.js");
var import_extras57 = require("./extras.js");
var import_extras58 = require("./extras.js");
var import_extras59 = require("./extras.js");
var import_extras60 = require("./extras.js");
var import_extras61 = require("./extras.js");
var import_extras62 = require("./extras.js");
var import_extras63 = require("./extras.js");
var import_extras64 = require("./extras.js");
var import_extras65 = require("./extras.js");
var import_helpers12 = require("./helpers.js");
var import_helpers13 = require("./helpers.js");
var import_helpers14 = require("./helpers.js");
var import_helpers15 = require("./helpers.js");
var import_helpers16 = require("./helpers.js");
var import_helpers17 = require("./helpers.js");
var import_helpers18 = require("./helpers.js");
var import_helpers19 = require("./helpers.js");
var import_helpers20 = require("./helpers.js");
var import_helpers21 = require("./helpers.js");
var import_kernel23 = require("./kernel.js");
var import_kernel24 = require("./kernel.js");
var import_kernel25 = require("./kernel.js");
var import_kernel26 = require("./kernel.js");
var import_kernel27 = require("./kernel.js");
var import_kernel28 = require("./kernel.js");
var import_kernel29 = require("./kernel.js");
var import_kernel30 = require("./kernel.js");
var import_kernel31 = require("./kernel.js");
var import_kernel32 = require("./kernel.js");
var import_kernel33 = require("./kernel.js");
var import_kernel34 = require("./kernel.js");
var import_kernel35 = require("./kernel.js");
var import_kernel36 = require("./kernel.js");
var import_kernel37 = require("./kernel.js");
var import_kernel38 = require("./kernel.js");
var import_kernel39 = require("./kernel.js");
var import_kernel40 = require("./kernel.js");
var import_kernel41 = require("./kernel.js");
var import_kernel42 = require("./kernel.js");
var import_kernel43 = require("./kernel.js");
var import_compatibility15 = require("./compatibility.js");
var import_compatibility16 = require("./compatibility.js");
var import_compatibility17 = require("./compatibility.js");
var import_compatibility18 = require("./compatibility.js");
var import_compatibility19 = require("./compatibility.js");
var import_compatibility20 = require("./compatibility.js");
var import_compatibility21 = require("./compatibility.js");
var import_compatibility22 = require("./compatibility.js");
var import_compatibility23 = require("./compatibility.js");
var import_compatibility24 = require("./compatibility.js");
var import_compatibility25 = require("./compatibility.js");
var import_compatibility26 = require("./compatibility.js");
var import_compatibility27 = require("./compatibility.js");
var import_compatibility28 = require("./compatibility.js");
(0, import_compatibility28.installFluentOperators)({ AsObservableCache: import_operators2.asObservableCache, AsObservableList: import_operators3.asObservableList, Bind: import_operators4.bind, BindToObservableCollection: import_operators5.bindToObservableCollection, BindToObservableList: import_operators6.bindToObservableList, Cast: import_operators7.cast, CastToObject: import_operators8.castToObject, ChangeKey: import_operators9.changeKey, Convert: import_operators10.convert, DistinctValues: import_operators11.distinctValues, Filter: import_operators12.filter, FilterImmutable: import_operators13.filterImmutable, FilterWithState: import_operators14.filterWithState, OfType: import_operators15.ofType, Page: import_operators16.page, RemoveKey: import_operators17.removeKey, Reverse: import_operators18.reverse, Sort: import_operators19.sort, SortAndBind: import_operators20.sortAndBind, SortAndPage: import_operators21.sortAndPage, SortAndVirtualise: import_operators22.sortAndVirtualise, SortAndVirtualize: import_operators23.sortAndVirtualize, SortBy: import_operators24.sortBy, ToCollection: import_operators25.toCollection, Top: import_operators26.top, Transform: import_operators27.transform, TransformImmutable: import_operators28.transformImmutable, TransformMany: import_operators29.transformMany, TransformSafe: import_operators30.transformSafe, TransformWithInlineUpdate: import_operators31.transformWithInlineUpdate, Virtualise: import_operators32.virtualise, Virtualize: import_operators33.virtualize, And: import_advanced33.and, Average: import_advanced34.average, Avg: import_advanced35.avg, Combine: import_advanced36.combine, Count: import_advanced37.count, Except: import_advanced38.except, ForAggregation: import_advanced39.forAggregation, FullJoin: import_advanced40.fullJoin, FullJoinMany: import_advanced41.fullJoinMany, Group: import_advanced42.group, GroupOn: import_advanced43.groupOn, GroupOnImmutable: import_advanced44.groupOnImmutable, GroupOnObservable: import_advanced45.groupOnObservable, GroupOnProperty: import_advanced46.groupOnProperty, GroupOnPropertyWithImmutableState: import_advanced47.groupOnPropertyWithImmutableState, GroupWithImmutableState: import_advanced48.groupWithImmutableState, GroupWithSpecifiedGroups: import_advanced49.groupWithSpecifiedGroups, InnerJoin: import_advanced50.innerJoin, InnerJoinMany: import_advanced51.innerJoinMany, InvalidateWhen: import_advanced52.invalidateWhen, LeftJoin: import_advanced53.leftJoin, LeftJoinMany: import_advanced54.leftJoinMany, Max: import_advanced55.max, Min: import_advanced56.min, Or: import_advanced57.or, RightJoin: import_advanced58.rightJoin, RightJoinMany: import_advanced59.rightJoinMany, StandardDeviation: import_advanced60.standardDeviation, StdDev: import_advanced61.stdDev, Sum: import_advanced62.sum, SumMany: import_advanced63.sumMany, Xor: import_advanced64.xor, AsyncDisposeMany: import_lifecycle47.asyncDisposeMany, AutoRefresh: import_lifecycle48.autoRefresh, AutoRefreshOnObservable: import_lifecycle49.autoRefreshOnObservable, Batch: import_lifecycle50.batch, BatchIf: import_lifecycle51.batchIf, BufferIf: import_lifecycle52.bufferIf, BufferInitial: import_lifecycle53.bufferInitial, CreateObservableObject: import_lifecycle54.createObservableObject, DeferUntilLoaded: import_lifecycle55.deferUntilLoaded, DisposeMany: import_lifecycle56.disposeMany, ExpireAfter: import_lifecycle57.expireAfter, FilterOnObservable: import_lifecycle58.filterOnObservable, FilterOnProperty: import_lifecycle59.filterOnProperty, FinallySafe: import_lifecycle60.finallySafe, LimitSizeTo: import_lifecycle61.limitSizeTo, MergeMany: import_lifecycle62.mergeMany, MergeManyItems: import_lifecycle63.mergeManyItems, MonitorStatus: import_lifecycle64.monitorStatus, NotEmpty: import_lifecycle65.notEmpty, NotifyPropertyChanged: import_lifecycle66.notifyPropertyChanged, ObservableObject: import_lifecycle67.observableObject, ObserveCollectionChanges: import_lifecycle68.observeCollectionChanges, ObserveProperty: import_lifecycle69.observeProperty, OnItemAdded: import_lifecycle70.onItemAdded, OnItemRefreshed: import_lifecycle71.onItemRefreshed, OnItemRemoved: import_lifecycle72.onItemRemoved, OnItemUpdated: import_lifecycle73.onItemUpdated, RefCount: import_lifecycle74.refCount, SkipInitial: import_lifecycle75.skipInitial, SubscribeMany: import_lifecycle76.subscribeMany, Switch: import_lifecycle77.switch, ToObservableChangeSet: import_lifecycle78.toObservableChangeSet, TransformAsync: import_lifecycle79.transformAsync, TransformManyAsync: import_lifecycle80.transformManyAsync, TransformManySafeAsync: import_lifecycle81.transformManySafeAsync, TransformOnObservable: import_lifecycle82.transformOnObservable, TransformSafeAsync: import_lifecycle83.transformSafeAsync, TrueForAll: import_lifecycle84.trueForAll, TrueForAny: import_lifecycle85.trueForAny, Watch: import_lifecycle86.watch, WatchValue: import_lifecycle87.watchValue, WhenAnyPropertyChanged: import_lifecycle88.whenAnyPropertyChanged, WhenChanged: import_lifecycle89.whenChanged, WhenPropertyChanged: import_lifecycle90.whenPropertyChanged, WhenValueChanged: import_lifecycle91.whenValueChanged, Adapt: import_extras34.adapt, AddKey: import_extras35.addKey, Clone: import_extras36.clone, CollectUpdateStats: import_extras37.collectUpdateStats, EnsureUniqueKeys: import_extras38.ensureUniqueKeys, ExcludeUpdateWhen: import_extras39.excludeUpdateWhen, Flatten: import_extras40.flatten, FlattenBufferResult: import_extras41.flattenBufferResult, FlattenChanges: import_extras42.flattenChanges, ForEachChange: import_extras43.forEachChange, ForEachItemChange: import_extras44.forEachItemChange, IgnoreSameReferenceUpdate: import_extras45.ignoreSameReferenceUpdate, IgnoreUpdateWhen: import_extras46.ignoreUpdateWhen, IncludeUpdateWhen: import_extras47.includeUpdateWhen, InvokeEvaluate: import_extras48.invokeEvaluate, ItemChanges: import_extras49.itemChanges, MergeChangeSets: import_extras50.mergeChangeSets, MergeManyChangeSets: import_extras51.mergeManyChangeSets, PopulateFrom: import_extras52.populateFrom, PopulateInto: import_extras53.populateInto, QueryWhenChanged: import_extras54.queryWhenChanged, RemoveIndex: import_extras55.removeIndex, StartWithEmpty: import_extras56.startWithEmpty, StartWithItem: import_extras57.startWithItem, SuppressRefresh: import_extras58.suppressRefresh, ToObservableOptional: import_extras59.toObservableOptional, ToSortedCollection: import_extras60.toSortedCollection, TransformToTree: import_extras61.transformToTree, TreatMovesAsRemoveAdd: import_extras62.treatMovesAsRemoveAdd, UpdateIndex: import_extras63.updateIndex, WhereReasonsAre: import_extras64.whereReasonsAre, WhereReasonsAreNot: import_extras65.whereReasonsAreNot, AddOrInsertRange: import_helpers12.addOrInsertRange, AsAggregator: import_helpers13.asAggregator, AsWatcher: import_helpers14.asWatcher, BinarySearch: import_helpers15.binarySearch, GetChangeType: import_helpers16.getChangeType, IndexOfOptional: import_helpers17.indexOfOptional, ReplaceOrAdd: import_helpers18.replaceOrAdd, RetryWithBackOff: import_helpers19.retryWithBackOff, ScheduleRecurringAction: import_helpers20.scheduleRecurringAction, YieldWithoutIndex: import_helpers21.yieldWithoutIndex, AsArray: import_kernel23.asArray, AsList: import_kernel24.asList, ConvertOptional: import_kernel25.convertOptional, ConvertOr: import_kernel26.convertOr, CreateOptional: import_kernel27.createOptional, Duplicates: import_kernel28.duplicates, FirstOrOptional: import_kernel29.firstOrOptional, FromOptional: import_kernel30.fromOptional, GetValueOrDefault: import_kernel31.getValueOrDefault, IfHasValue: import_kernel32.ifHasValue, IndexOfMany: import_kernel33.indexOfMany, Lookup: import_kernel34.lookup, OnHasNoValue: import_kernel35.onHasNoValue, OnHasValue: import_kernel36.onHasValue, OrElse: import_kernel37.orElse, RemoveIfContained: import_kernel38.removeIfContained, SelectValues: import_kernel39.selectValues, ToOptional: import_kernel40.toOptional, ValueOr: import_kernel41.valueOr, ValueOrDefault: import_kernel42.valueOrDefault, ValueOrThrow: import_kernel43.valueOrThrow, AddOrUpdate: import_compatibility15.addOrUpdate, Clear: import_compatibility16.clear, EditDiff: import_compatibility17.editDiff, IsEmpty: import_compatibility18.isEmpty, IsNotEmpty: import_compatibility19.isNotEmpty, Maximum: import_compatibility20.maximum, Minimum: import_compatibility21.minimum, ObserveOn: import_compatibility22.observeOn, ObserveOnDispatcher: import_compatibility23.observeOnDispatcher, Refresh: import_compatibility24.refresh, Remove: import_compatibility25.remove, RemoveKeys: import_compatibility26.removeKeys, SubscribeOn: import_compatibility27.subscribeOn });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Adapt,
  AddKey,
  AddOrInsertRange,
  AddOrUpdate,
  AggregateType,
  And,
  AsAggregator,
  AsArray,
  AsList,
  AsObservableCache,
  AsObservableList,
  AsWatcher,
  AsyncDisposeMany,
  AutoRefresh,
  AutoRefreshOnObservable,
  Average,
  Avg,
  Batch,
  BatchIf,
  BinarySearch,
  Bind,
  BindToObservableCollection,
  BindToObservableList,
  BindingOptions,
  BufferIf,
  BufferInitial,
  Cast,
  CastToObject,
  Change,
  ChangeAwareCache,
  ChangeAwareList,
  ChangeKey,
  ChangeReason,
  ChangeSet,
  ChangeSetAggregator,
  ChangeStatistics,
  ChangeSummary,
  ChangeType,
  Clear,
  Clone,
  CollectUpdateStats,
  Combine,
  CombineOperator,
  ConnectionStatus,
  Convert,
  ConvertOptional,
  ConvertOr,
  Count,
  CreateObservableObject,
  CreateOptional,
  DeferUntilLoaded,
  DisposeMany,
  DistinctValues,
  Duplicates,
  DynamicDataOptions,
  EditDiff,
  EnsureUniqueKeys,
  Error,
  ErrorInfo,
  Except,
  ExcludeUpdateWhen,
  ExpireAfter,
  Filter,
  FilterImmutable,
  FilterOnObservable,
  FilterOnProperty,
  FilterWithState,
  FinallySafe,
  FirstOrOptional,
  Flatten,
  FlattenBufferResult,
  FlattenChanges,
  ForAggregation,
  ForEachChange,
  ForEachItemChange,
  FromOptional,
  FullJoin,
  FullJoinMany,
  GetChangeType,
  GetValueOrDefault,
  Group,
  GroupOn,
  GroupOnImmutable,
  GroupOnObservable,
  GroupOnProperty,
  GroupOnPropertyWithImmutableState,
  GroupWithImmutableState,
  GroupWithSpecifiedGroups,
  IfHasValue,
  IgnoreSameReferenceUpdate,
  IgnoreUpdateWhen,
  ImmutableGroup,
  IncludeUpdateWhen,
  IndexOfMany,
  IndexOfOptional,
  InnerJoin,
  InnerJoinMany,
  IntermediateCache,
  InvalidateWhen,
  InvokeEvaluate,
  IsEmpty,
  IsNotEmpty,
  ItemChange,
  ItemChanges,
  ItemWithIndex,
  ItemWithValue,
  LeftJoin,
  LeftJoinMany,
  LimitSizeTo,
  ListChange,
  ListChangeReason,
  Lookup,
  Max,
  Maximum,
  MergeChangeSets,
  MergeMany,
  MergeManyChangeSets,
  MergeManyItems,
  Min,
  Minimum,
  MonitorStatus,
  Node,
  NotEmpty,
  NotifyPropertyChanged,
  ObservableCache,
  ObservableChangeSet,
  ObservableCollectionExtended,
  ObservableList,
  ObservableObject,
  ObserveCollectionChanges,
  ObserveOn,
  ObserveOnDispatcher,
  ObserveProperty,
  OfType,
  OnHasNoValue,
  OnHasValue,
  OnItemAdded,
  OnItemRefreshed,
  OnItemRemoved,
  OnItemUpdated,
  OptionElse,
  Optional,
  Or,
  OrElse,
  Page,
  PageRequest,
  PopulateFrom,
  PopulateInto,
  QuerySnapshot,
  QueryWhenChanged,
  RangeChange,
  RefCount,
  Refresh,
  Remove,
  RemoveIfContained,
  RemoveIndex,
  RemoveKey,
  RemoveKeys,
  ReplaceOrAdd,
  RetryWithBackOff,
  Reverse,
  RightJoin,
  RightJoinMany,
  ScheduleRecurringAction,
  SelectValues,
  SkipInitial,
  Sort,
  SortAndBind,
  SortAndBindOptions,
  SortAndPage,
  SortAndVirtualise,
  SortAndVirtualize,
  SortBy,
  SortDirection,
  SortExpression,
  SortExpressionComparer,
  SortOptions,
  SourceCache,
  SourceList,
  StandardDeviation,
  StartWithEmpty,
  StartWithItem,
  StdDev,
  SubscribeMany,
  SubscribeOn,
  Sum,
  SumMany,
  SuppressRefresh,
  Switch,
  ToCollection,
  ToObservableChangeSet,
  ToObservableOptional,
  ToOptional,
  ToSortedCollection,
  Top,
  Transform,
  TransformAsync,
  TransformImmutable,
  TransformMany,
  TransformManyAsync,
  TransformManySafeAsync,
  TransformOnObservable,
  TransformSafe,
  TransformSafeAsync,
  TransformToTree,
  TransformWithInlineUpdate,
  TreatMovesAsRemoveAdd,
  TrueForAll,
  TrueForAny,
  UpdateIndex,
  ValueOr,
  ValueOrDefault,
  ValueOrThrow,
  VirtualRequest,
  Virtualise,
  Virtualize,
  Watch,
  WatchValue,
  Watcher,
  WhenAnyPropertyChanged,
  WhenChanged,
  WhenPropertyChanged,
  WhenValueChanged,
  WhereReasonsAre,
  WhereReasonsAreNot,
  Xor,
  YieldWithoutIndex,
  adapt,
  addKey,
  addOrInsertRange,
  addOrUpdate,
  and,
  applyChanges,
  asAggregator,
  asArray,
  asList,
  asObservableCache,
  asObservableList,
  asWatcher,
  asyncDisposeMany,
  autoRefresh,
  autoRefreshOnObservable,
  average,
  avg,
  batch,
  batchIf,
  binarySearch,
  bind,
  bindToObservableCollection,
  bindToObservableList,
  bufferIf,
  bufferInitial,
  cast,
  castToObject,
  changeKey,
  clear,
  clone,
  collectUpdateStats,
  combine,
  convert,
  convertOptional,
  convertOr,
  count,
  createObservableObject,
  createOptional,
  deferUntilLoaded,
  disposeMany,
  distinctValues,
  duplicates,
  editDiff,
  ensureUniqueKeys,
  except,
  excludeUpdateWhen,
  expireAfter,
  filter,
  filterImmutable,
  filterOnObservable,
  filterOnProperty,
  filterWithState,
  finallySafe,
  firstOrOptional,
  flatten,
  flattenBufferResult,
  flattenChanges,
  fluent,
  forAggregation,
  forEachChange,
  forEachItemChange,
  fromOptional,
  fullJoin,
  fullJoinMany,
  getChangeType,
  getValueOrDefault,
  group,
  groupOn,
  groupOnImmutable,
  groupOnObservable,
  groupOnProperty,
  groupOnPropertyWithImmutableState,
  groupWithImmutableState,
  groupWithSpecifiedGroups,
  ifHasValue,
  ignoreSameReferenceUpdate,
  ignoreUpdateWhen,
  includeUpdateWhen,
  indexOfMany,
  indexOfOptional,
  innerJoin,
  innerJoinMany,
  installFluentOperators,
  invalidateWhen,
  invokeEvaluate,
  isEmpty,
  isNotEmpty,
  itemChanges,
  leftJoin,
  leftJoinMany,
  limitSizeTo,
  lookup,
  max,
  maximum,
  mergeChangeSets,
  mergeMany,
  mergeManyChangeSets,
  mergeManyItems,
  min,
  minimum,
  monitorStatus,
  notEmpty,
  notifyPropertyChanged,
  observableObject,
  observeCollectionChanges,
  observeOn,
  observeOnDispatcher,
  observeProperty,
  ofType,
  onHasNoValue,
  onHasValue,
  onItemAdded,
  onItemRefreshed,
  onItemRemoved,
  onItemUpdated,
  or,
  orElse,
  page,
  populateFrom,
  populateInto,
  queryWhenChanged,
  refCount,
  refresh,
  remove,
  removeIfContained,
  removeIndex,
  removeKey,
  removeKeys,
  replaceOrAdd,
  retryWithBackOff,
  reverse,
  rightJoin,
  rightJoinMany,
  scheduleRecurringAction,
  selectValues,
  setObservableDecorator,
  skipInitial,
  snapshotChanges,
  sort,
  sortAndBind,
  sortAndPage,
  sortAndVirtualise,
  sortAndVirtualize,
  sortBy,
  standardDeviation,
  startWithEmpty,
  startWithItem,
  stdDev,
  subscribeMany,
  subscribeOn,
  sum,
  sumMany,
  suppressRefresh,
  switch: null,
  switchLatest,
  toCollection,
  toObservableChangeSet,
  toObservableOptional,
  toOptional,
  toSortedCollection,
  top,
  transform,
  transformAsync,
  transformImmutable,
  transformMany,
  transformManyAsync,
  transformManySafeAsync,
  transformOnObservable,
  transformSafe,
  transformSafeAsync,
  transformToTree,
  transformWithInlineUpdate,
  treatMovesAsRemoveAdd,
  trueForAll,
  trueForAny,
  updateIndex,
  valueOr,
  valueOrDefault,
  valueOrThrow,
  virtualise,
  virtualize,
  watch,
  watchValue,
  whenAnyPropertyChanged,
  whenChanged,
  whenPropertyChanged,
  whenValueChanged,
  whereReasonsAre,
  whereReasonsAreNot,
  xor,
  yieldWithoutIndex
});
//# sourceMappingURL=index.js.map
