class EventDispatcher {
  handlers = /* @__PURE__ */ new Set();
  Subscribe(handler) {
    if (typeof handler !== "function")
      throw new TypeError("An event handler must be a function.");
    this.handlers.add(handler);
    let disposed = false;
    return {
      Dispose: () => {
        if (!disposed) {
          disposed = true;
          this.handlers.delete(handler);
        }
      }
    };
  }
  Unsubscribe(handler) {
    this.handlers.delete(handler);
  }
  Emit(event) {
    const errors = [];
    for (const handler of [...this.handlers]) {
      try {
        handler(event);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw errors[0];
  }
  Invoke(event) {
    this.Emit(event);
  }
  Raise(event) {
    this.Emit(event);
  }
  Clear() {
    this.handlers.clear();
  }
  get Count() {
    return this.handlers.size;
  }
}
const FontWeights = {
  Thin: "Thin",
  ExtraLight: "ExtraLight",
  Light: "Light",
  Normal: "Normal",
  Medium: "Medium",
  SemiBold: "SemiBold",
  Bold: "Bold",
  ExtraBold: "ExtraBold",
  Black: "Black"
};
const FontStyles = {
  Normal: "Normal",
  Italic: "Italic",
  Oblique: "Oblique"
};
const TextDecorations = {
  None: "None",
  Underline: "Underline",
  Strikethrough: "Strikethrough",
  OverLine: "OverLine"
};
const TextAlignment = {
  Left: "Left",
  Center: "Center",
  Right: "Right",
  Justify: "Justify"
};
const FlowDirection = {
  LeftToRight: "LeftToRight",
  RightToLeft: "RightToLeft"
};
const LogicalDirection = {
  Forward: "Forward",
  Backward: "Backward"
};
const TextMarkerStyle = {
  None: "None",
  Disc: "Disc",
  Circle: "Circle",
  Square: "Square",
  Box: "Box",
  Decimal: "Decimal",
  LowerRoman: "LowerRoman",
  UpperRoman: "UpperRoman",
  LowerLatin: "LowerLatin",
  UpperLatin: "UpperLatin"
};
const BaselineAlignment = {
  Baseline: "Baseline",
  Superscript: "Superscript",
  Subscript: "Subscript",
  Top: "Top",
  Center: "Center",
  Bottom: "Bottom",
  TextTop: "TextTop",
  TextBottom: "TextBottom"
};
const LineStackingStrategy = {
  MaxHeight: "MaxHeight",
  BlockLineHeight: "BlockLineHeight"
};
class Thickness {
  Left;
  Top;
  Right;
  Bottom;
  constructor(left = 0, top = left, right = left, bottom = top) {
    for (const value of [left, top, right, bottom])
      if (!Number.isFinite(value))
        throw new RangeError("Thickness values must be finite.");
    this.Left = left;
    this.Top = top;
    this.Right = right;
    this.Bottom = bottom;
  }
  static Parse(value) {
    if (!value.trim())
      throw new TypeError(
        "Thickness requires one, two, or four numeric values."
      );
    const parts = value.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 1) return new Thickness(parts[0]);
    if (parts.length === 2) return new Thickness(parts[0], parts[1]);
    if (parts.length === 4)
      return new Thickness(parts[0], parts[1], parts[2], parts[3]);
    throw new TypeError("Thickness requires one, two, or four numeric values.");
  }
  Equals(other) {
    return other instanceof Thickness && this.Left === other.Left && this.Top === other.Top && this.Right === other.Right && this.Bottom === other.Bottom;
  }
  ToString() {
    return `${this.Left},${this.Top},${this.Right},${this.Bottom}`;
  }
  toString() {
    return this.ToString();
  }
  toJSON() {
    return {
      Left: this.Left,
      Top: this.Top,
      Right: this.Right,
      Bottom: this.Bottom
    };
  }
}
class PropertyMetadata {
  constructor(defaultValue, propertyChangedCallback, coerceValueCallback) {
    if (arguments.length) this.DefaultValue = defaultValue;
    if (propertyChangedCallback)
      this.PropertyChangedCallback = propertyChangedCallback;
    if (coerceValueCallback) this.CoerceValueCallback = coerceValueCallback;
  }
}
class UIPropertyMetadata extends PropertyMetadata {
}
const FrameworkPropertyMetadataOptions = {
  None: 0,
  AffectsMeasure: 1,
  AffectsArrange: 2,
  AffectsParentMeasure: 4,
  AffectsParentArrange: 8,
  AffectsRender: 16,
  Inherits: 32,
  OverridesInheritanceBehavior: 64,
  NotDataBindable: 128,
  BindsTwoWayByDefault: 256,
  Journal: 1024,
  SubPropertiesDoNotAffectRender: 2048
};
class FrameworkPropertyMetadata extends UIPropertyMetadata {
  constructor(defaultValue, flags = 0, propertyChangedCallback, coerceValueCallback) {
    super(defaultValue, propertyChangedCallback, coerceValueCallback);
    if (!arguments.length) delete this.DefaultValue;
    for (const [name, value] of Object.entries(
      FrameworkPropertyMetadataOptions
    ))
      if (value && flags & value)
        this[name === "NotDataBindable" ? "IsNotDataBindable" : name] = true;
  }
}
function typeChain(owner) {
  const result = [];
  let current = typeof owner === "object" && owner !== null ? owner.constructor : owner;
  while (current && current !== Function.prototype) {
    result.push(current);
    current = typeof current === "function" ? Object.getPrototypeOf(current) : null;
  }
  return result;
}
function normalizeMetadata(metadata) {
  return metadata !== null && typeof metadata === "object" && (metadata instanceof PropertyMetadata || Object.keys(metadata).length === 0 || [
    "DefaultValue",
    "Inherits",
    "ValidateValueCallback",
    "PropertyChangedCallback",
    "CoerceValueCallback"
  ].some((key) => key in metadata)) ? metadata : { DefaultValue: metadata };
}
function defaultForType(type) {
  return type === Number ? 0 : type === Boolean ? false : null;
}
function freezeMetadata(metadata) {
  const result = Object.assign(
    Object.create(Object.getPrototypeOf(metadata)),
    metadata
  );
  if (Object.prototype.hasOwnProperty.call(result, "DefaultValue"))
    result.DefaultValue = cloneValue(result.DefaultValue);
  result.IsSealed = true;
  const freeze = (value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      for (const child of Object.values(value)) freeze(child);
      Object.freeze(value);
    }
  };
  freeze(result.DefaultValue);
  return Object.freeze(result);
}
const readOnlyKeys = /* @__PURE__ */ new WeakMap();
class DependencyPropertyKey {
  /** @internal Keys are created by RegisterReadOnly; a forged key never authorizes writes. */
  constructor(DependencyProperty2) {
    this.DependencyProperty = DependencyProperty2;
  }
  DependencyProperty;
  OverrideMetadata(ownerType, metadata) {
    this.DependencyProperty.OverrideMetadata(ownerType, metadata, this);
  }
}
class DependencyProperty {
  static UnsetValue = /* @__PURE__ */ Symbol("UnsetValue");
  static registry = /* @__PURE__ */ new Map();
  static storageRegistry = /* @__PURE__ */ new Map();
  Name;
  PropertyType;
  OwnerType;
  DefaultMetadata;
  ValidateValueCallback;
  ReadOnly;
  IsAttached;
  /** @internal JSON storage preserves independent same-name property registrations. */
  StorageName;
  metadata = /* @__PURE__ */ new Map();
  usedTypes = /* @__PURE__ */ new Set();
  constructor(name, metadata = {}, propertyType, ownerType, validateValueCallback, readOnly = false, attached = false) {
    if (typeof name !== "string" || !name)
      throw new TypeError("Dependency property name cannot be empty.");
    this.Name = name;
    this.PropertyType = propertyType;
    this.OwnerType = ownerType;
    this.ReadOnly = readOnly;
    this.IsAttached = attached;
    this.ValidateValueCallback = validateValueCallback ?? metadata.ValidateValueCallback;
    const normalized = Object.assign(
      Object.create(Object.getPrototypeOf(metadata)),
      metadata
    );
    if (!("DefaultValue" in normalized) && propertyType !== void 0)
      normalized.DefaultValue = defaultForType(propertyType);
    if (normalized.DefaultValue !== void 0 && !this.IsValidValue(normalized.DefaultValue))
      throw new RangeError(`Invalid default value for ${name}.`);
    this.DefaultMetadata = freezeMetadata(normalized);
    this.metadata.set(ownerType, this.DefaultMetadata);
    const existing = DependencyProperty.registry.get(name);
    const ownerName = typeof ownerType === "function" ? ownerType.name : String(ownerType ?? "Attached");
    this.StorageName = existing?.length ? `${ownerName}.${name}` : name;
    if (DependencyProperty.storageRegistry.has(this.StorageName))
      throw new Error(
        `A dependency property storage name is already registered: ${this.StorageName}. Use a distinct owner type name.`
      );
  }
  static register(name, propertyType, ownerType, metadata, validate, readOnly = false, attached = false) {
    if (this.registry.get(name)?.some((p) => p.metadata.has(ownerType)))
      throw new Error(`${name} is already registered for this owner.`);
    const property = new DependencyProperty(
      name,
      normalizeMetadata(metadata),
      propertyType,
      ownerType,
      validate,
      readOnly,
      attached
    );
    this.registry.set(name, [...this.registry.get(name) ?? [], property]);
    this.storageRegistry.set(property.StorageName, property);
    if (metadata instanceof PropertyMetadata) Object.freeze(metadata);
    return property;
  }
  static Register(name, propertyType, ownerType, metadata = {}, validateValueCallback) {
    return this.register(
      name,
      propertyType,
      ownerType,
      metadata,
      validateValueCallback
    );
  }
  static RegisterAttached(name, propertyType, ownerType, metadata = {}, validateValueCallback) {
    return this.register(
      name,
      propertyType,
      ownerType,
      metadata,
      validateValueCallback,
      false,
      true
    );
  }
  static RegisterReadOnly(name, propertyType, ownerType, metadata = {}, validateValueCallback) {
    const property = this.register(
      name,
      propertyType,
      ownerType,
      metadata,
      validateValueCallback,
      true
    );
    const key = new DependencyPropertyKey(property);
    readOnlyKeys.set(property, key);
    return key;
  }
  static RegisterAttachedReadOnly(name, propertyType, ownerType, metadata = {}, validateValueCallback) {
    const property = this.register(
      name,
      propertyType,
      ownerType,
      metadata,
      validateValueCallback,
      true,
      true
    );
    const key = new DependencyPropertyKey(property);
    readOnlyKeys.set(property, key);
    return key;
  }
  static Find(name, ownerType) {
    const candidates = this.registry.get(name);
    for (const owner of typeChain(ownerType)) {
      const match = candidates?.find((p) => p.metadata.has(owner));
      if (match) return match;
    }
    const stored = this.storageRegistry.get(name);
    if (stored && stored.StorageName !== stored.Name) return stored;
    return ownerType === void 0 ? stored ?? candidates?.[0] : candidates?.find(
      (p) => p.IsAttached || typeof p.OwnerType !== "function"
    );
  }
  /** @internal */
  static GetRegisteredProperties() {
    return [...this.storageRegistry.values()];
  }
  IsValidType(value) {
    const matches = (type) => {
      if (type === void 0 || type === Object) return true;
      if (Array.isArray(type)) return type.some(matches);
      if (type === Number) return typeof value === "number";
      if (type === Boolean) return typeof value === "boolean";
      if (value === null) return true;
      if (type === String) return typeof value === "string";
      if (type === Thickness)
        return typeof value === "number" || !!value && typeof value === "object" && ["Left", "Top", "Right", "Bottom"].every(
          (k) => Number.isFinite(value[k])
        );
      return typeof type !== "function" || value instanceof type;
    };
    return value !== DependencyProperty.UnsetValue && matches(this.PropertyType);
  }
  IsValidValue(value) {
    return this.IsValidType(value) && (!this.ValidateValueCallback || this.ValidateValueCallback(value));
  }
  GetMetadata(ownerType) {
    for (const owner of typeChain(ownerType)) {
      const metadata = this.metadata.get(owner);
      if (metadata) return metadata;
    }
    return this.DefaultMetadata;
  }
  /** @internal */
  _getMetadataForUse(ownerType) {
    this.usedTypes.add(ownerType);
    return this.GetMetadata(ownerType);
  }
  OverrideMetadata(ownerType, metadata, key) {
    if (this.ReadOnly && readOnlyKeys.get(this) !== key)
      throw new Error(`${this.Name} requires its read-only property key.`);
    if (ownerType === void 0 || ownerType === null)
      throw new TypeError("An owner type is required.");
    if (this.metadata.has(ownerType))
      throw new Error(
        `Metadata for ${this.Name} is already registered on this owner.`
      );
    for (const used of this.usedTypes)
      if (typeChain(used).includes(ownerType))
        throw new Error(`Metadata for ${this.Name} cannot change after use.`);
    if (metadata.ValidateValueCallback && metadata.ValidateValueCallback !== this.ValidateValueCallback)
      throw new Error("Validation callbacks cannot be overridden in metadata.");
    const base = this.GetMetadata(
      typeof ownerType === "function" ? Object.getPrototypeOf(ownerType) : void 0
    );
    const merged = Object.assign(
      Object.create(Object.getPrototypeOf(metadata)),
      base,
      metadata
    );
    if (base.Inherits) merged.Inherits = true;
    if (base.PropertyChangedCallback && metadata.PropertyChangedCallback) {
      const before = base.PropertyChangedCallback, after = metadata.PropertyChangedCallback;
      merged.PropertyChangedCallback = (owner, event) => {
        const errors = [];
        try {
          before(owner, event);
        } catch (error) {
          errors.push(error);
        }
        try {
          after(owner, event);
        } catch (error) {
          errors.push(error);
        }
        if (errors.length) throw errors[0];
      };
    }
    if (merged.DefaultValue !== void 0 && !this.IsValidValue(merged.DefaultValue))
      throw new RangeError(`Invalid default value for ${this.Name}.`);
    this.metadata.set(ownerType, freezeMetadata(merged));
    if (metadata instanceof PropertyMetadata) Object.freeze(metadata);
  }
  AddOwner(ownerType, metadata) {
    if (DependencyProperty.registry.get(this.Name)?.some((p) => p !== this && p.metadata.has(ownerType)))
      throw new Error(`${this.Name} is already registered for this owner.`);
    if (this.metadata.has(ownerType))
      throw new Error(`${this.Name} already has this owner.`);
    this.OverrideMetadata(
      ownerType,
      metadata ?? {},
      readOnlyKeys.get(this)
    );
    return this;
  }
  ToString() {
    return this.Name;
  }
  toString() {
    return this.Name;
  }
}
const inherited = /* @__PURE__ */ new Set([
  "FontFamily",
  "FontSize",
  "FontWeight",
  "FontStyle",
  "FontStretch",
  "Foreground",
  "FlowDirection",
  "Language",
  "TextAlignment",
  "LineHeight"
]);
const defaults = {
  FontFamily: "system-ui",
  FontSize: 16,
  FontWeight: "Normal",
  FontStyle: "Normal",
  FontStretch: "Normal",
  TextDecorations: "None",
  Foreground: "#111827",
  Background: "transparent",
  TextAlignment: "Left",
  FlowDirection: "LeftToRight",
  Language: "en",
  Margin: 0,
  Padding: 0,
  LineHeight: 1.5,
  PageWidth: 794,
  PageHeight: 1123,
  PagePadding: 72,
  ColumnCount: 1,
  ColumnGap: 32,
  BreakPageBefore: false,
  BreakColumnBefore: false,
  KeepTogether: false,
  KeepWithNext: false,
  HeadingLevel: 0,
  BaselineAlignment: "Baseline",
  MarkerStyle: "Disc",
  StartIndex: 1,
  RowSpan: 1,
  ColumnSpan: 1,
  CellSpacing: 0,
  IsHyphenationEnabled: false,
  IsOptimalParagraphEnabled: false,
  IsColumnWidthFlexible: true,
  IsEnabled: true
};
const positive = /* @__PURE__ */ new Set(["FontSize", "PageWidth", "PageHeight"]);
const positiveInteger = /* @__PURE__ */ new Set([
  "ColumnCount",
  "RowSpan",
  "ColumnSpan",
  "StartIndex"
]);
function cloneValue(value) {
  if (value === void 0 || value === null) return value;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value))
    return value === 0 ? 0 : value;
  if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === 0 && !("toJSON" in value))
    return {};
  let serialized;
  try {
    serialized = JSON.stringify(value, (_key, item) => {
      if (typeof item === "function" || typeof item === "symbol" || typeof item === "bigint" || typeof item === "number" && !Number.isFinite(item))
        throw new TypeError(
          "Document properties must contain finite JSON data."
        );
      return item;
    });
  } catch (error) {
    throw new TypeError(
      `Document properties must be serializable JSON: ${String(error)}`
    );
  }
  return JSON.parse(serialized);
}
function equalValue(a, b) {
  return Object.is(a, b) || a !== null && b !== null && typeof a === "object" && typeof b === "object" && JSON.stringify(a) === JSON.stringify(b);
}
const BaseValueSource = {
  Default: "Default",
  Inherited: "Inherited",
  Style: "Style",
  StyleTrigger: "StyleTrigger",
  Local: "Local"
};
class LocalValueEnumerator {
  constructor(entries) {
    this.entries = entries;
  }
  entries;
  index = -1;
  get Count() {
    return this.entries.length;
  }
  get Current() {
    if (this.index < 0 || this.index >= this.entries.length)
      throw new Error("Enumerator is not positioned on an entry.");
    const entry = this.entries[this.index];
    return { Property: entry.Property, Value: cloneValue(entry.Value) };
  }
  MoveNext() {
    return ++this.index < this.entries.length;
  }
  Reset() {
    this.index = -1;
  }
  *[Symbol.iterator]() {
    for (const entry of this.entries)
      yield { Property: entry.Property, Value: cloneValue(entry.Value) };
  }
}
class DependencyPropertyHelper {
  static GetValueSource(owner, property) {
    return owner.GetValueSource(property);
  }
}
class DependencyObject {
  values = {};
  currentValues = /* @__PURE__ */ new Map();
  styleValues = /* @__PURE__ */ new Map();
  triggerValues = /* @__PURE__ */ new Map();
  effectiveValues = /* @__PURE__ */ new Map();
  evaluating = /* @__PURE__ */ new Set();
  retainedEffective = /* @__PURE__ */ new Map();
  // Monotonic marker keeps ordinary detached document construction out of current-value subtree walks.
  hasCurrentValuesInSubtree = false;
  PropertyChanged = new EventDispatcher();
  get InheritanceParent() {
    return null;
  }
  get InheritanceChildren() {
    return [];
  }
  resolve(property) {
    const candidate = property instanceof DependencyPropertyKey ? property.DependencyProperty : property;
    const name = typeof candidate === "string" ? candidate : candidate.Name;
    if (typeof name !== "string" || !name)
      throw new TypeError("A property name is required.");
    const definition = typeof candidate === "string" ? DependencyProperty.Find(name, this.constructor) : candidate;
    return {
      name: definition?.Name ?? name,
      key: definition?.StorageName ?? name,
      definition,
      metadata: definition?._getMetadataForUse(this.constructor) ?? {
        DefaultValue: defaults[name],
        Inherits: inherited.has(name)
      }
    };
  }
  evaluate(property) {
    const { key, definition, metadata } = this.resolve(property);
    const cached = this.effectiveValues.get(key);
    if (cached) return cached;
    if (this.evaluating.has(key))
      throw new Error(`Cyclic coercion for ${definition?.Name ?? key}.`);
    this.evaluating.add(key);
    try {
      let value, source;
      if (Object.prototype.hasOwnProperty.call(this.values, key)) {
        value = this.values[key];
        source = "Local";
      } else if (this.triggerValues.has(key)) {
        value = this.triggerValues.get(key);
        source = "StyleTrigger";
      } else if (this.styleValues.has(key)) {
        value = this.styleValues.get(key);
        source = "Style";
      } else if (metadata.Inherits && this.InheritanceParent) {
        const parent = this.InheritanceParent.evaluate(property);
        if (parent.source !== "Default" || this.InheritanceParent.currentValues.has(key)) {
          value = parent.value;
          source = "Inherited";
        } else {
          value = metadata.DefaultValue;
          source = "Default";
        }
      } else {
        value = metadata.DefaultValue;
        source = "Default";
      }
      if (this.currentValues.has(key)) value = this.currentValues.get(key);
      const base = value;
      if (metadata.CoerceValueCallback && (source !== "Default" || this.currentValues.has(key))) {
        const coerced = metadata.CoerceValueCallback(this, cloneValue(value));
        value = coerced === DependencyProperty.UnsetValue ? this.retainedEffective.has(key) ? this.retainedEffective.get(key) : metadata.DefaultValue : coerced;
        if (value !== void 0 && definition && !definition.IsValidValue(value))
          throw new RangeError(`Invalid coerced value for ${definition.Name}.`);
      }
      const result = {
        value: cloneValue(value),
        source,
        coerced: !equalValue(base, value)
      };
      this.effectiveValues.set(key, result);
      return result;
    } finally {
      this.evaluating.delete(key);
    }
  }
  GetValue(property) {
    return cloneValue(this.evaluate(property).value);
  }
  validate(property, value) {
    const { name, definition } = this.resolve(property);
    if (definition && !definition.IsValidValue(value))
      throw new RangeError(`Invalid value for ${name}.`);
    if (positive.has(name) && !(typeof value === "number" && Number.isFinite(value) && value > 0) || positiveInteger.has(name) && !(typeof value === "number" && Number.isSafeInteger(value) && value >= 1))
      throw new RangeError(
        `${name} must be a positive ${positiveInteger.has(name) ? "integer" : "number"}.`
      );
    if (name === "HeadingLevel" && !(typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6))
      throw new RangeError("HeadingLevel must be between 0 and 6.");
    cloneValue(value);
  }
  writable(property) {
    const { definition: resolvedDefinition } = this.resolve(property);
    const definition = resolvedDefinition ?? (typeof property === "string" ? DependencyProperty.Find(property) : void 0);
    if (definition?.ReadOnly && (!(property instanceof DependencyPropertyKey) || readOnlyKeys.get(definition) !== property))
      throw new Error(
        `${definition.Name} is read-only and requires its property key.`
      );
    return property instanceof DependencyPropertyKey ? property.DependencyProperty : property;
  }
  affected(property) {
    const result = /* @__PURE__ */ new Map();
    const visit = (owner) => {
      result.set(owner, owner.GetValue(property));
      for (const child of owner.InheritanceChildren) {
        const { key, metadata } = child.resolve(property);
        if (metadata.Inherits && !Object.prototype.hasOwnProperty.call(child.values, key) && !child.styleValues.has(key) && !child.triggerValues.has(key))
          visit(child);
      }
    };
    visit(this);
    return result;
  }
  notify(property, oldValue, inheritedChange = false, baseChanged = false) {
    const { name, definition, metadata } = this.resolve(property);
    const event = {
      Property: name,
      DependencyProperty: definition,
      OldValue: oldValue,
      NewValue: this.GetValue(property),
      IsInherited: inheritedChange
    };
    const changed = !equalValue(event.OldValue, event.NewValue);
    const errors = [];
    const invoke = (action) => {
      try {
        action();
      } catch (error) {
        errors.push(error);
      }
    };
    if (changed) {
      invoke(() => this.OnPropertyChanged(event));
      invoke(() => metadata.PropertyChangedCallback?.(this, event));
      invoke(() => this.PropertyChanged.Emit(event));
    } else if (baseChanged) invoke(() => this.OnBaseValueChanged(event));
    if (errors.length) throw errors[0];
  }
  mutate(property, mutation, baseChanged, preserveCurrent = false) {
    const before = this.affected(property), { key } = this.resolve(property);
    const previousLocal = this.values[key], hadLocal = Object.prototype.hasOwnProperty.call(this.values, key);
    const allPreviousCurrent = new Map(
      [...before.keys()].map((owner) => [owner, new Map(owner.currentValues)])
    );
    const allPreviousEffective = new Map(
      [...before.keys()].map((owner) => [
        owner,
        owner.effectiveValues.get(key)
      ])
    );
    const previousCurrent = new Map(this.currentValues), previousStyles = new Map(this.styleValues), previousTriggers = new Map(this.triggerValues);
    mutation();
    for (const owner of before.keys()) {
      owner.retainedEffective.set(key, before.get(owner));
      owner.effectiveValues.delete(key);
      if (owner !== this || !preserveCurrent) owner.currentValues.delete(key);
    }
    try {
      for (const owner of before.keys()) owner.GetValue(property);
    } catch (error) {
      if (hadLocal)
        Object.defineProperty(this.values, key, {
          value: previousLocal,
          writable: true,
          enumerable: true,
          configurable: true
        });
      else delete this.values[key];
      this.currentValues = previousCurrent;
      this.styleValues = previousStyles;
      this.triggerValues = previousTriggers;
      for (const owner of before.keys()) {
        owner.effectiveValues.delete(key);
        const previous = allPreviousEffective.get(owner);
        if (previous) owner.effectiveValues.set(key, previous);
        owner.currentValues = allPreviousCurrent.get(owner);
        owner.retainedEffective.delete(key);
      }
      throw error;
    }
    for (const owner of before.keys()) owner.retainedEffective.delete(key);
    const errors = [];
    for (const [owner, oldValue] of before)
      try {
        owner.notify(
          property,
          oldValue,
          owner !== this,
          baseChanged && owner === this
        );
      } catch (error) {
        errors.push(error);
      }
    if (errors.length) throw errors[0];
  }
  SetValue(property, value) {
    const resolved = this.writable(property);
    if (value === void 0 || value === DependencyProperty.UnsetValue) {
      this.ClearValue(property);
      return;
    }
    this.validate(resolved, value);
    const { key } = this.resolve(resolved), next = cloneValue(value);
    if (Object.prototype.hasOwnProperty.call(this.values, key) && equalValue(this.values[key], next) && !this.currentValues.has(key))
      return;
    this.mutate(
      resolved,
      () => Object.defineProperty(this.values, key, {
        value: next,
        writable: true,
        enumerable: true,
        configurable: true
      }),
      true
    );
  }
  SetCurrentValue(property, value) {
    const resolved = this.writable(property);
    if (value === void 0 || value === DependencyProperty.UnsetValue)
      throw new TypeError("SetCurrentValue requires a value.");
    this.validate(resolved, value);
    const { key } = this.resolve(resolved);
    for (let owner = this; owner; owner = owner.InheritanceParent)
      owner.hasCurrentValuesInSubtree = true;
    this.mutate(
      resolved,
      () => this.currentValues.set(key, cloneValue(value)),
      false,
      true
    );
  }
  ReadLocalValue(property) {
    const { key } = this.resolve(property);
    return Object.prototype.hasOwnProperty.call(this.values, key) ? cloneValue(this.values[key]) : DependencyProperty.UnsetValue;
  }
  ClearValue(property) {
    const resolved = this.writable(property), { key } = this.resolve(resolved);
    if (!Object.prototype.hasOwnProperty.call(this.values, key) && !this.currentValues.has(key))
      return;
    this.mutate(
      resolved,
      () => {
        delete this.values[key];
        this.currentValues.delete(key);
      },
      true
    );
  }
  /** Apply a style setter or active trigger from a host style system. Local values take precedence. */
  SetStyleValue(property, value, isTrigger = false) {
    const resolved = this.writable(property), { key } = this.resolve(resolved);
    if (value === void 0 || value === DependencyProperty.UnsetValue) {
      this.ClearStyleValue(property, isTrigger);
      return;
    }
    this.validate(resolved, value);
    this.mutate(
      resolved,
      () => (isTrigger ? this.triggerValues : this.styleValues).set(
        key,
        cloneValue(value)
      ),
      false
    );
  }
  ClearStyleValue(property, isTrigger = false) {
    const resolved = this.writable(property), { key } = this.resolve(resolved), values = isTrigger ? this.triggerValues : this.styleValues;
    if (values.has(key)) this.mutate(resolved, () => values.delete(key), false);
  }
  CoerceValue(property) {
    this.mutate(property, () => {
    }, false, true);
  }
  InvalidateProperty(property) {
    this.mutate(property, () => {
    }, false);
  }
  GetAnimationBaseValue(property) {
    return this.GetValue(property);
  }
  GetValueSource(property) {
    const { key } = this.resolve(property), effective = this.evaluate(property);
    return {
      BaseValueSource: effective.source,
      IsCoerced: effective.coerced,
      IsCurrent: this.currentValues.has(key),
      IsExpression: false,
      IsAnimated: false
    };
  }
  GetLocalValueEnumerator() {
    return new LocalValueEnumerator(
      Object.entries(this.values).map(([key, value]) => ({
        Property: DependencyProperty.Find(key, this.constructor) ?? key,
        Value: cloneValue(value)
      }))
    );
  }
  /** @internal Reset computed/transient values after a complete document replacement. */
  ResetPropertyState() {
    this.effectiveValues.clear();
    this.currentValues.clear();
    this.styleValues.clear();
    this.triggerValues.clear();
  }
  /** Parent changes invalidate inherited defaults, current values, and derived metadata across the subtree. */
  ChangeInheritanceParent(change, nextParent) {
    const unique = /* @__PURE__ */ new Map();
    const add = (name) => {
      const property = DependencyProperty.Find(name, this.constructor) ?? name;
      unique.set(this.resolve(property).key, property);
    };
    for (const parent of [this.InheritanceParent, nextParent]) {
      for (let owner = parent; owner; owner = owner.InheritanceParent) {
        for (const key of [
          ...Object.keys(owner.values),
          ...owner.styleValues.keys(),
          ...owner.triggerValues.keys(),
          ...owner.currentValues.keys()
        ])
          if (this.resolve(DependencyProperty.Find(key, owner.constructor) ?? key).metadata.Inherits)
            add(key);
      }
    }
    for (const [key, effective] of this.effectiveValues)
      if (effective.source === "Inherited") add(key);
    if (this.hasCurrentValuesInSubtree) {
      const visit = (owner) => {
        for (const key of owner.currentValues.keys())
          if (owner.resolve(key).metadata.Inherits) add(key);
        for (const child of owner.InheritanceChildren)
          if (child.hasCurrentValuesInSubtree) visit(child);
      };
      visit(this);
    }
    if (!unique.size) {
      change();
      if (this.hasCurrentValuesInSubtree)
        for (let owner = nextParent; owner; owner = owner.InheritanceParent)
          owner.hasCurrentValuesInSubtree = true;
      return () => {
      };
    }
    const snapshots = [...unique.values()].map(
      (property) => [property, this.affected(property)]
    );
    change();
    if (this.hasCurrentValuesInSubtree)
      for (let owner = nextParent; owner; owner = owner.InheritanceParent)
        owner.hasCurrentValuesInSubtree = true;
    for (const [property, before] of snapshots) {
      const { key } = this.resolve(property);
      for (const owner of before.keys()) {
        owner.effectiveValues.delete(key);
        owner.currentValues.delete(key);
      }
    }
    return () => {
      const errors = [];
      for (const [property, before] of snapshots) {
        const { key } = this.resolve(property);
        for (const owner of before.keys()) {
          owner.effectiveValues.delete(key);
          owner.currentValues.delete(key);
        }
        for (const [owner, value] of before)
          try {
            owner.notify(property, value, true);
          } catch (error) {
            errors.push(error);
          }
      }
      if (errors.length) throw errors[0];
    };
  }
  OnPropertyChanged(_event) {
  }
  OnBaseValueChanged(_event) {
  }
}
let idSequence = 0;
function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `rtw-${Date.now().toString(36)}-${(++idSequence).toString(36)}`;
}
class TextElement extends DependencyObject {
  Type;
  identity = createId();
  parent = null;
  /** Internal ownership slots; a node belongs to exactly one collection. */
  _collection = null;
  childCollection;
  /** @internal Shared collection access for structural engine patches. */
  _getChildCollection() {
    return this.childCollection;
  }
  constructor(type = "TextElement") {
    super();
    this.Type = type;
  }
  get Id() {
    return this.identity;
  }
  get Parent() {
    return this.parent;
  }
  get Document() {
    let node = this;
    while (node) {
      if (node instanceof FlowDocument) return node;
      node = node.Parent;
    }
    return null;
  }
  get InheritanceParent() {
    return this.parent;
  }
  /** @internal */
  _setParent(parent, collection) {
    return this.ChangeInheritanceParent(() => {
      this.parent = parent;
      this._collection = collection;
    }, parent);
  }
  /** @internal */
  _setId(id) {
    if (typeof id !== "string" || !id)
      throw new TypeError("Element id must be a nonempty string.");
    const doc = this.Document;
    if (doc && !(this instanceof FlowDocument))
      throw new Error("Cannot change the identity of an attached element.");
    if (this instanceof FlowDocument) this._changeRootId(this.identity, id);
    this.identity = id;
  }
  /** @internal */
  _notify(change) {
    this.Document?._record(change);
  }
  get InheritanceChildren() {
    return this instanceof Table ? [...this.Columns, ...this.Children] : this.Children;
  }
  OnPropertyChanged(event) {
    if (!event.IsInherited)
      this._notify({ Element: this, Kind: "property", ...event });
  }
  OnBaseValueChanged(event) {
    this._notify({ Element: this, Kind: "property", ...event });
  }
  get Text() {
    return getElementText(this);
  }
  get Children() {
    return this.childCollection?.ToArray() ?? [];
  }
  boundaryPointer(edge, direction) {
    const document = this.Document;
    if (!document)
      throw new Error("The element is not attached to a FlowDocument.");
    const bounds = document.GetSymbolMap().GetElementBounds(this);
    if (!bounds)
      throw new Error("This element is not part of the text symbol stream.");
    return TextPointer._fromElementBoundary(document, this.Id, edge, direction);
  }
  get ContentStart() {
    return this.boundaryPointer("ContentStart", LogicalDirection.Backward);
  }
  get ContentEnd() {
    return this.boundaryPointer("ContentEnd", LogicalDirection.Forward);
  }
  get ElementStart() {
    return this.boundaryPointer("ElementStart", LogicalDirection.Forward);
  }
  get ElementEnd() {
    return this.boundaryPointer("ElementEnd", LogicalDirection.Backward);
  }
  ToJSON() {
    const result = {
      type: this.Type,
      id: this.Id,
      props: cloneValue(this.values)
    };
    if (this instanceof Run) result.text = this.Text;
    if (this.childCollection)
      result.children = this.childCollection.ToArray().map((item) => item.ToJSON());
    return result;
  }
  Clone() {
    return this instanceof FlowDocument ? FlowDocument.FromJSON(this.ToJSON()) : elementFromJSON(this.ToJSON());
  }
  get Name() {
    return this.GetValue("Name") ?? "";
  }
  set Name(value) {
    this.SetValue("Name", value);
  }
  get Tag() {
    return this.GetValue("Tag");
  }
  set Tag(value) {
    this.SetValue("Tag", value);
  }
  get FontFamily() {
    return this.GetValue("FontFamily");
  }
  set FontFamily(value) {
    this.SetValue("FontFamily", value);
  }
  get FontSize() {
    return this.GetValue("FontSize");
  }
  set FontSize(value) {
    this.SetValue("FontSize", value);
  }
  get FontWeight() {
    return this.GetValue("FontWeight");
  }
  set FontWeight(value) {
    this.SetValue("FontWeight", value);
  }
  get FontStyle() {
    return this.GetValue("FontStyle");
  }
  set FontStyle(value) {
    this.SetValue("FontStyle", value);
  }
  get FontStretch() {
    return this.GetValue("FontStretch");
  }
  set FontStretch(value) {
    this.SetValue("FontStretch", value);
  }
  get Foreground() {
    return this.GetValue("Foreground");
  }
  set Foreground(value) {
    this.SetValue("Foreground", value);
  }
  get Background() {
    return this.GetValue("Background");
  }
  set Background(value) {
    this.SetValue("Background", value);
  }
  get TextDecorations() {
    return this.GetValue("TextDecorations");
  }
  set TextDecorations(value) {
    this.SetValue("TextDecorations", value);
  }
  get FlowDirection() {
    return this.GetValue("FlowDirection");
  }
  set FlowDirection(value) {
    this.SetValue("FlowDirection", value);
  }
  get Language() {
    return this.GetValue("Language");
  }
  set Language(value) {
    this.SetValue("Language", value);
  }
  static FontFamilyProperty = DependencyProperty.Register(
    "FontFamily",
    String,
    TextElement,
    { DefaultValue: defaults.FontFamily, Inherits: true }
  );
  static FontSizeProperty = DependencyProperty.Register(
    "FontSize",
    Number,
    TextElement,
    { DefaultValue: 16, Inherits: true }
  );
  static FontWeightProperty = DependencyProperty.Register(
    "FontWeight",
    [String, Number],
    TextElement,
    { DefaultValue: "Normal", Inherits: true }
  );
  static FontStyleProperty = DependencyProperty.Register(
    "FontStyle",
    String,
    TextElement,
    { DefaultValue: "Normal", Inherits: true }
  );
  static ForegroundProperty = DependencyProperty.Register(
    "Foreground",
    String,
    TextElement,
    { DefaultValue: defaults.Foreground, Inherits: true }
  );
  static BackgroundProperty = DependencyProperty.Register(
    "Background",
    String,
    TextElement,
    { DefaultValue: "transparent" }
  );
  static FontStretchProperty = DependencyProperty.Register(
    "FontStretch",
    String,
    TextElement,
    { DefaultValue: "Normal", Inherits: true }
  );
  static FlowDirectionProperty = DependencyProperty.Register(
    "FlowDirection",
    String,
    TextElement,
    { DefaultValue: "LeftToRight", Inherits: true },
    (value) => Object.values(FlowDirection).includes(value)
  );
  static LanguageProperty = DependencyProperty.Register(
    "Language",
    String,
    TextElement,
    { DefaultValue: "en", Inherits: true }
  );
  static TextDecorationsProperty = DependencyProperty.Register("TextDecorations", Object, TextElement, { DefaultValue: "None" });
  static NameProperty = DependencyProperty.Register(
    "Name",
    String,
    TextElement,
    { DefaultValue: "" }
  );
  static TagProperty = DependencyProperty.Register(
    "Tag",
    Object,
    TextElement,
    { DefaultValue: void 0 }
  );
  static GetFontFamily(owner) {
    return owner.GetValue(TextElement.FontFamilyProperty);
  }
  static SetFontFamily(owner, value) {
    owner.SetValue(TextElement.FontFamilyProperty, value);
  }
  static GetFontSize(owner) {
    return owner.GetValue(TextElement.FontSizeProperty);
  }
  static SetFontSize(owner, value) {
    owner.SetValue(TextElement.FontSizeProperty, value);
  }
  static GetFontWeight(owner) {
    return owner.GetValue(TextElement.FontWeightProperty);
  }
  static SetFontWeight(owner, value) {
    owner.SetValue(TextElement.FontWeightProperty, value);
  }
  static GetFontStyle(owner) {
    return owner.GetValue(TextElement.FontStyleProperty);
  }
  static SetFontStyle(owner, value) {
    owner.SetValue(TextElement.FontStyleProperty, value);
  }
  static GetFontStretch(owner) {
    return owner.GetValue(TextElement.FontStretchProperty);
  }
  static SetFontStretch(owner, value) {
    owner.SetValue(TextElement.FontStretchProperty, value);
  }
  static GetForeground(owner) {
    return owner.GetValue(TextElement.ForegroundProperty);
  }
  static SetForeground(owner, value) {
    owner.SetValue(TextElement.ForegroundProperty, value);
  }
}
class TextElementCollection {
  constructor(Owner, accepts = () => true) {
    this.Owner = Owner;
    this.accepts = accepts;
  }
  Owner;
  accepts;
  items = [];
  CollectionChanged = new EventDispatcher();
  get Count() {
    return this.items.length;
  }
  get length() {
    return this.Count;
  }
  get FirstBlock() {
    return this.items[0] ?? null;
  }
  get LastBlock() {
    return this.items[this.items.length - 1] ?? null;
  }
  get FirstInline() {
    return this.FirstBlock;
  }
  get LastInline() {
    return this.LastBlock;
  }
  Get(index) {
    this.checkIndex(index);
    return this.items[index];
  }
  at(index) {
    return this.items.at(index);
  }
  checkIndex(index, inserting = false) {
    if (!Number.isInteger(index) || index < 0 || index >= this.items.length + (inserting ? 1 : 0))
      throw new RangeError("Collection index is out of range.");
  }
  validate(item, ignoredIds = /* @__PURE__ */ new Set()) {
    if (!(item instanceof TextElement) || !this.accepts(item))
      throw new TypeError(`Invalid child for ${this.Owner.Type}.`);
    if (item.Parent || item._collection)
      throw new Error(
        "The element already has a parent. Remove it before inserting it elsewhere."
      );
    for (let owner = this.Owner; owner; owner = owner.Parent)
      if (owner === item)
        throw new Error(
          "An element cannot contain itself or one of its ancestors."
        );
    const doc = this.Owner.Document;
    if (doc) {
      const pendingIds = /* @__PURE__ */ new Set();
      for (const node of walkElements(item)) {
        if (doc._hasElementId(node.Id) && !ignoredIds.has(node.Id) || pendingIds.has(node.Id))
          throw new Error(`Duplicate element id: ${node.Id}`);
        pendingIds.add(node.Id);
      }
    }
  }
  Add(item) {
    const index = this.Count;
    this.Insert(index, item);
    return index;
  }
  AddRange(items) {
    const pending = [...items];
    const seenItems = /* @__PURE__ */ new Set();
    const seenIds = /* @__PURE__ */ new Set();
    for (const item of pending) {
      this.validate(item);
      if (seenItems.has(item))
        throw new Error("An element cannot occur twice in a collection.");
      seenItems.add(item);
      for (const node of walkElements(item)) {
        if (seenIds.has(node.Id))
          throw new Error(`Duplicate element id: ${node.Id}`);
        seenIds.add(node.Id);
      }
    }
    const doc = this.Owner.Document;
    doc?.BeginChange();
    try {
      for (const item of pending) this.Add(item);
    } finally {
      doc?.EndChange();
    }
  }
  dispatch(actions) {
    const errors = [];
    for (const action of actions)
      try {
        action();
      } catch (error) {
        errors.push(error);
      }
    if (errors.length) throw errors[0];
  }
  Insert(index, item) {
    this.checkIndex(index, true);
    this.validate(item);
    const notifyInheritance = item._setParent(this.Owner, this);
    this.items.splice(index, 0, item);
    this.Owner.Document?._registerSubtree(item);
    this.dispatch([
      () => this.Owner._notify({
        Element: this.Owner,
        Kind: "insert",
        NewValue: item,
        Index: index
      }),
      notifyInheritance,
      () => this.CollectionChanged.Emit({
        Action: "Add",
        NewItems: [item],
        OldItems: [],
        Index: index
      })
    ]);
  }
  InsertBefore(sibling, item) {
    const index = this.IndexOf(sibling);
    if (index < 0) throw new Error("Sibling is not in this collection.");
    this.Insert(index, item);
  }
  InsertAfter(sibling, item) {
    const index = this.IndexOf(sibling);
    if (index < 0) throw new Error("Sibling is not in this collection.");
    this.Insert(index + 1, item);
  }
  Set(index, item) {
    this.checkIndex(index);
    const previous = this.items[index];
    if (previous === item) return;
    this.validate(item, new Set(walkElements(previous).map((node) => node.Id)));
    const detached = previous._setParent(null, null), attached = item._setParent(this.Owner, this);
    this.Owner.Document?._unregisterSubtree(previous);
    this.items[index] = item;
    this.Owner.Document?._registerSubtree(item);
    this.dispatch([
      () => this.Owner._notify({
        Element: this.Owner,
        Kind: "reset",
        OldValue: previous,
        NewValue: item,
        Index: index
      }),
      detached,
      attached,
      () => this.CollectionChanged.Emit({
        Action: "Replace",
        NewItems: [item],
        OldItems: [previous],
        Index: index
      })
    ]);
  }
  Remove(item) {
    const index = this.items.indexOf(item);
    if (index < 0) return false;
    this.RemoveAt(index);
    return true;
  }
  RemoveAt(index) {
    this.checkIndex(index);
    const item = this.items[index];
    const notifyInheritance = item._setParent(null, null);
    this.items.splice(index, 1);
    this.Owner.Document?._unregisterSubtree(item);
    this.dispatch([
      () => this.Owner._notify({
        Element: this.Owner,
        Kind: "remove",
        OldValue: item,
        Index: index
      }),
      notifyInheritance,
      () => this.CollectionChanged.Emit({
        Action: "Remove",
        NewItems: [],
        OldItems: [item],
        Index: index
      })
    ]);
  }
  Clear() {
    if (!this.items.length) return;
    const oldItems = this.items;
    const notifications = oldItems.map((item) => item._setParent(null, null));
    this.items = [];
    for (const item of oldItems) this.Owner.Document?._unregisterSubtree(item);
    this.dispatch([
      () => this.Owner._notify({
        Element: this.Owner,
        Kind: "reset",
        OldValue: oldItems,
        NewValue: []
      }),
      ...notifications,
      () => this.CollectionChanged.Emit({
        Action: "Reset",
        NewItems: [],
        OldItems: oldItems,
        Index: 0
      })
    ]);
  }
  Contains(item) {
    return this.items.includes(item);
  }
  IndexOf(item) {
    return this.items.indexOf(item);
  }
  ToArray() {
    return [...this.items];
  }
  CopyTo(array, index) {
    if (!Number.isInteger(index) || index < 0)
      throw new RangeError("Array index must be nonnegative.");
    this.items.forEach((item, offset) => {
      array[index + offset] = item;
    });
  }
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}
class Inline extends TextElement {
  constructor(type = "Inline") {
    super(type);
  }
  get BaselineAlignment() {
    return this.GetValue("BaselineAlignment");
  }
  set BaselineAlignment(value) {
    this.SetValue("BaselineAlignment", value);
  }
  get NextInline() {
    if (!this._collection) return null;
    return this._collection.at(this._collection.IndexOf(this) + 1) ?? null;
  }
  get PreviousInline() {
    if (!this._collection) return null;
    const index = this._collection.IndexOf(this);
    return index > 0 ? this._collection.at(index - 1) ?? null : null;
  }
  static BaselineAlignmentProperty = DependencyProperty.Register(
    "BaselineAlignment",
    String,
    Inline,
    { DefaultValue: "Baseline" },
    (value) => Object.values(BaselineAlignment).includes(value)
  );
}
class Block extends TextElement {
  constructor(type = "Block") {
    super(type);
  }
  get Margin() {
    return this.GetValue("Margin");
  }
  set Margin(value) {
    this.SetValue("Margin", value);
  }
  get Padding() {
    return this.GetValue("Padding");
  }
  set Padding(value) {
    this.SetValue("Padding", value);
  }
  get TextAlignment() {
    return this.GetValue("TextAlignment");
  }
  set TextAlignment(value) {
    this.SetValue("TextAlignment", value);
  }
  get LineHeight() {
    return this.GetValue("LineHeight");
  }
  set LineHeight(value) {
    this.SetValue("LineHeight", value);
  }
  get BreakPageBefore() {
    return this.GetValue("BreakPageBefore");
  }
  set BreakPageBefore(value) {
    this.SetValue("BreakPageBefore", value);
  }
  get BreakColumnBefore() {
    return this.GetValue("BreakColumnBefore");
  }
  set BreakColumnBefore(value) {
    this.SetValue("BreakColumnBefore", value);
  }
  get KeepTogether() {
    return this.GetValue("KeepTogether");
  }
  set KeepTogether(value) {
    this.SetValue("KeepTogether", value);
  }
  get KeepWithNext() {
    return this.GetValue("KeepWithNext");
  }
  set KeepWithNext(value) {
    this.SetValue("KeepWithNext", value);
  }
  get NextBlock() {
    if (!this._collection) return null;
    return this._collection.at(this._collection.IndexOf(this) + 1) ?? null;
  }
  get PreviousBlock() {
    if (!this._collection) return null;
    const index = this._collection.IndexOf(this);
    return index > 0 ? this._collection.at(index - 1) ?? null : null;
  }
  static TextAlignmentProperty = DependencyProperty.Register(
    "TextAlignment",
    String,
    Block,
    { DefaultValue: "Left", Inherits: true }
  );
  static MarginProperty = DependencyProperty.Register("Margin", Thickness, Block, { DefaultValue: 0 });
  static PaddingProperty = DependencyProperty.Register("Padding", Thickness, Block, { DefaultValue: 0 });
  static LineHeightProperty = DependencyProperty.Register(
    "LineHeight",
    Number,
    Block,
    { DefaultValue: 1.5, Inherits: true }
  );
  get BorderThickness() {
    return this.GetValue("BorderThickness") ?? 0;
  }
  set BorderThickness(value) {
    this.SetValue("BorderThickness", value);
  }
  get BorderBrush() {
    return this.GetValue("BorderBrush") ?? "#d1d5db";
  }
  set BorderBrush(value) {
    this.SetValue("BorderBrush", value);
  }
  get LineStackingStrategy() {
    return this.GetValue("LineStackingStrategy") ?? "MaxHeight";
  }
  set LineStackingStrategy(value) {
    this.SetValue("LineStackingStrategy", value);
  }
  static BreakPageBeforeProperty = DependencyProperty.Register(
    "BreakPageBefore",
    Boolean,
    Block,
    { DefaultValue: false }
  );
  static BreakColumnBeforeProperty = DependencyProperty.Register(
    "BreakColumnBefore",
    Boolean,
    Block,
    { DefaultValue: false }
  );
  static KeepTogetherProperty = DependencyProperty.Register(
    "KeepTogether",
    Boolean,
    Block,
    { DefaultValue: false }
  );
  static KeepWithNextProperty = DependencyProperty.Register(
    "KeepWithNext",
    Boolean,
    Block,
    { DefaultValue: false }
  );
  static LineStackingStrategyProperty = DependencyProperty.Register(
    "LineStackingStrategy",
    String,
    Block,
    { DefaultValue: "MaxHeight", Inherits: true },
    (value) => Object.values(LineStackingStrategy).includes(value)
  );
}
class Run extends Inline {
  text = "";
  constructor(text = "") {
    super("Run");
    if (typeof text !== "string")
      throw new TypeError("Run text must be a string.");
    this.text = text;
  }
  get Text() {
    return this.text;
  }
  set Text(value) {
    if (typeof value !== "string")
      throw new TypeError("Run text must be a string.");
    if (value === this.text) return;
    const oldValue = this.text;
    this.text = value;
    this._notify({
      Element: this,
      Kind: "text",
      Property: "Text",
      OldValue: oldValue,
      NewValue: value
    });
    this.PropertyChanged.Emit({
      Property: "Text",
      OldValue: oldValue,
      NewValue: value
    });
  }
}
function addInlines(collection, content) {
  if (content === void 0) return;
  for (const inline of Array.isArray(content) ? content : [content])
    collection.Add(
      typeof inline === "string" ? new Run(inline) : inline
    );
}
function addBlocks(collection, content) {
  if (content === void 0) return;
  collection.AddRange(Array.isArray(content) ? content : [content]);
}
class Span extends Inline {
  Inlines;
  constructor(content, type = "Span") {
    super(type);
    this.Inlines = new TextElementCollection(
      this,
      (item) => item instanceof Inline
    );
    this.childCollection = this.Inlines;
    addInlines(this.Inlines, content);
  }
}
class Bold extends Span {
  constructor(content) {
    super(content, "Bold");
    this.SetValue("FontWeight", "Bold");
  }
}
class Italic extends Span {
  constructor(content) {
    super(content, "Italic");
    this.SetValue("FontStyle", "Italic");
  }
}
class Underline extends Span {
  constructor(content) {
    super(content, "Underline");
    this.SetValue("TextDecorations", "Underline");
  }
}
class Hyperlink extends Span {
  RequestNavigate = new EventDispatcher();
  constructor(content, navigateUri) {
    super(content, "Hyperlink");
    if (navigateUri !== void 0) this.NavigateUri = navigateUri;
  }
  get NavigateUri() {
    return this.GetValue("NavigateUri") ?? "";
  }
  set NavigateUri(value) {
    this.SetValue("NavigateUri", value);
  }
  get TargetName() {
    return this.GetValue("TargetName") ?? "";
  }
  set TargetName(value) {
    this.SetValue("TargetName", value);
  }
  Navigate() {
    this.RequestNavigate.Emit({
      Uri: this.NavigateUri,
      TargetName: this.TargetName
    });
  }
}
class LineBreak extends Inline {
  constructor() {
    super("LineBreak");
  }
}
class Image extends Inline {
  constructor(source = "", alternativeText = "") {
    super("Image");
    if (source) this.Source = source;
    if (alternativeText) this.AlternativeText = alternativeText;
  }
  get Source() {
    return this.GetValue("Source") ?? "";
  }
  set Source(value) {
    this.SetValue("Source", value);
  }
  get AlternativeText() {
    return this.GetValue("AlternativeText") ?? "";
  }
  set AlternativeText(value) {
    this.SetValue("AlternativeText", value);
  }
  get Width() {
    return this.GetValue("Width");
  }
  set Width(value) {
    this.SetValue("Width", value);
  }
  get Height() {
    return this.GetValue("Height");
  }
  set Height(value) {
    this.SetValue("Height", value);
  }
}
class Equation extends Inline {
  static SourceProperty = DependencyProperty.Register(
    "EquationSource",
    String,
    Equation,
    { DefaultValue: "" },
    (v) => typeof v === "string" && v.length <= 262144
  );
  static FormatProperty = DependencyProperty.Register(
    "EquationFormat",
    String,
    Equation,
    { DefaultValue: "latex" },
    (v) => v === "latex" || v === "mathml"
  );
  static DisplayModeProperty = DependencyProperty.Register(
    "DisplayMode",
    Boolean,
    Equation,
    { DefaultValue: false }
  );
  constructor(source = "x", format = "latex", displayMode = false) {
    super("Equation");
    this.Source = source;
    this.Format = format;
    this.DisplayMode = displayMode;
  }
  get Source() {
    return this.GetValue("EquationSource") ?? "";
  }
  set Source(value) {
    if (typeof value !== "string" || value.length > 262144)
      throw new RangeError(
        "Equation source must be a string of at most 256 KiB."
      );
    this.SetValue("EquationSource", value);
  }
  get Format() {
    return this.GetValue("EquationFormat") ?? "latex";
  }
  set Format(value) {
    if (value !== "latex" && value !== "mathml")
      throw new TypeError("Equation format must be latex or mathml.");
    this.SetValue("EquationFormat", value);
  }
  get DisplayMode() {
    return this.GetValue("DisplayMode") ?? false;
  }
  set DisplayMode(value) {
    this.SetValue("DisplayMode", Boolean(value));
  }
  get AlternativeText() {
    return this.GetValue("AlternativeText") ?? "";
  }
  set AlternativeText(value) {
    this.SetValue("AlternativeText", String(value).slice(0, 4096));
  }
}
class InlineUIContainer extends Inline {
  constructor(child) {
    super("InlineUIContainer");
    this.childCollection = new TextElementCollection(
      this,
      (item) => item instanceof Image
    );
    if (child) this.Child = child;
  }
  get Child() {
    return this.childCollection.at(0) ?? null;
  }
  set Child(value) {
    if (value === this.Child) return;
    if (value !== null && !(value instanceof Image))
      throw new TypeError(
        "InlineUIContainer accepts a portable Image child; arbitrary native controls require a host adapter."
      );
    if (value) {
      if (this.childCollection.Count) this.childCollection.Set(0, value);
      else this.childCollection.Add(value);
    } else this.childCollection.Clear();
  }
}
class BlockUIContainer extends Block {
  constructor(child) {
    super("BlockUIContainer");
    this.childCollection = new TextElementCollection(
      this,
      (item) => item instanceof Image
    );
    if (child) this.Child = child;
  }
  get Child() {
    return this.childCollection.at(0) ?? null;
  }
  set Child(value) {
    if (value === this.Child) return;
    if (value !== null && !(value instanceof Image))
      throw new TypeError(
        "BlockUIContainer accepts a portable Image child; arbitrary native controls require a host adapter."
      );
    if (value) {
      if (this.childCollection.Count) this.childCollection.Set(0, value);
      else this.childCollection.Add(value);
    } else this.childCollection.Clear();
  }
}
class Paragraph extends Block {
  Inlines;
  constructor(content) {
    super("Paragraph");
    this.Inlines = new TextElementCollection(
      this,
      (item) => item instanceof Inline
    );
    this.childCollection = this.Inlines;
    addInlines(this.Inlines, content);
  }
  get HeadingLevel() {
    return this.GetValue("HeadingLevel");
  }
  set HeadingLevel(value) {
    this.SetValue("HeadingLevel", value);
  }
  get TextIndent() {
    return this.GetValue("TextIndent") ?? 0;
  }
  set TextIndent(value) {
    this.SetValue("TextIndent", value);
  }
  static TextIndentProperty = DependencyProperty.Register(
    "TextIndent",
    Number,
    Paragraph,
    { DefaultValue: 0 },
    Number.isFinite
  );
  static HeadingLevelProperty = DependencyProperty.Register(
    "HeadingLevel",
    Number,
    Paragraph,
    { DefaultValue: 0 }
  );
}
const FigureUnitType = {
  Auto: "Auto",
  Pixel: "Pixel",
  Column: "Column",
  Content: "Content",
  Page: "Page"
};
class FigureLength {
  Value;
  FigureUnitType;
  constructor(value = 1, unit = "Pixel") {
    if (!Object.values(FigureUnitType).includes(unit) || !Number.isFinite(value) || value < 0 || (unit === "Page" || unit === "Content") && value > 1)
      throw new RangeError("Invalid FigureLength value or unit.");
    this.Value = unit === "Auto" ? 1 : value;
    this.FigureUnitType = unit;
  }
  static get Auto() {
    return new FigureLength(1, "Auto");
  }
  get IsAbsolute() {
    return this.FigureUnitType === "Pixel";
  }
  get IsAuto() {
    return this.FigureUnitType === "Auto";
  }
  get IsColumn() {
    return this.FigureUnitType === "Column";
  }
  get IsContent() {
    return this.FigureUnitType === "Content";
  }
  get IsPage() {
    return this.FigureUnitType === "Page";
  }
  Equals(other) {
    return other instanceof FigureLength && other.Value === this.Value && other.FigureUnitType === this.FigureUnitType;
  }
  ToString() {
    return this.IsAuto ? "Auto" : `${this.Value}${this.IsAbsolute ? "" : ` ${this.FigureUnitType}`}`;
  }
  toString() {
    return this.ToString();
  }
  toJSON() {
    return { Value: this.Value, FigureUnitType: this.FigureUnitType };
  }
  static Parse(text) {
    if (text.trim().toLowerCase() === "auto") return FigureLength.Auto;
    const match = /^\s*(\d+(?:\.\d+)?|\.\d+)\s*(pixel|px|column|content|page)?\s*$/i.exec(
      text
    );
    if (!match) throw new TypeError("Invalid FigureLength text.");
    const units = {
      pixel: "Pixel",
      px: "Pixel",
      column: "Column",
      content: "Content",
      page: "Page"
    };
    return new FigureLength(
      Number(match[1]),
      units[match[2]?.toLowerCase() ?? "px"]
    );
  }
}
const FigureHorizontalAnchor = {
  PageLeft: "PageLeft",
  PageCenter: "PageCenter",
  PageRight: "PageRight",
  ContentLeft: "ContentLeft",
  ContentCenter: "ContentCenter",
  ContentRight: "ContentRight",
  ColumnLeft: "ColumnLeft",
  ColumnCenter: "ColumnCenter",
  ColumnRight: "ColumnRight"
};
const FigureVerticalAnchor = {
  PageTop: "PageTop",
  PageCenter: "PageCenter",
  PageBottom: "PageBottom",
  ContentTop: "ContentTop",
  ContentCenter: "ContentCenter",
  ContentBottom: "ContentBottom",
  ParagraphTop: "ParagraphTop"
};
const WrapDirection = {
  None: "None",
  Left: "Left",
  Right: "Right",
  Both: "Both"
};
const HorizontalAlignment = {
  Left: "Left",
  Center: "Center",
  Right: "Right",
  Stretch: "Stretch"
};
class AnchoredBlock extends Inline {
  Blocks;
  constructor(content, type = "AnchoredBlock") {
    super(type);
    this.Blocks = new TextElementCollection(
      this,
      (item) => item instanceof Block
    );
    this.childCollection = this.Blocks;
    addBlocks(this.Blocks, content);
  }
  get StoryText() {
    return this.Blocks.ToArray().map((block) => block.Text).join("\n");
  }
  CreateStoryDocument() {
    const story = new FlowDocument();
    for (const [name, value] of Object.entries(this.ToJSON().props))
      if (inherited.has(name)) story.SetValue(name, value);
    for (const name of inherited)
      if (this.GetValue(name) !== void 0)
        story.SetValue(name, this.GetValue(name));
    story.Blocks.AddRange(this.Blocks.ToArray().map((block) => block.Clone()));
    return story;
  }
  get Margin() {
    return this.GetValue(AnchoredBlock.MarginProperty);
  }
  set Margin(value) {
    this.SetValue(AnchoredBlock.MarginProperty, value);
  }
  get Padding() {
    return this.GetValue(AnchoredBlock.PaddingProperty);
  }
  set Padding(value) {
    this.SetValue(AnchoredBlock.PaddingProperty, value);
  }
  get BorderThickness() {
    return this.GetValue(AnchoredBlock.BorderThicknessProperty);
  }
  set BorderThickness(value) {
    this.SetValue(AnchoredBlock.BorderThicknessProperty, value);
  }
  get BorderBrush() {
    return this.GetValue(AnchoredBlock.BorderBrushProperty);
  }
  set BorderBrush(value) {
    this.SetValue(AnchoredBlock.BorderBrushProperty, value);
  }
  get TextAlignment() {
    return this.GetValue(AnchoredBlock.TextAlignmentProperty);
  }
  set TextAlignment(value) {
    this.SetValue(AnchoredBlock.TextAlignmentProperty, value);
  }
  get LineHeight() {
    return this.GetValue(AnchoredBlock.LineHeightProperty);
  }
  set LineHeight(value) {
    this.SetValue(AnchoredBlock.LineHeightProperty, value);
  }
  static MarginProperty = Block.MarginProperty.AddOwner(AnchoredBlock);
  static PaddingProperty = Block.PaddingProperty.AddOwner(AnchoredBlock);
  static TextAlignmentProperty = Block.TextAlignmentProperty.AddOwner(AnchoredBlock);
  static LineHeightProperty = Block.LineHeightProperty.AddOwner(AnchoredBlock);
  static BorderThicknessProperty = DependencyProperty.Register("BorderThickness", Thickness, AnchoredBlock, { DefaultValue: 0 });
  static BorderBrushProperty = DependencyProperty.Register(
    "BorderBrush",
    String,
    AnchoredBlock,
    { DefaultValue: "#d1d5db" }
  );
}
function validFigureLength(value) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0;
  if (!value || typeof value !== "object") return false;
  try {
    new FigureLength(value.Value, value.FigureUnitType);
    return true;
  } catch {
    return false;
  }
}
class Figure extends AnchoredBlock {
  constructor(content) {
    super(content, "Figure");
  }
  get Width() {
    return this.GetValue(Figure.WidthProperty);
  }
  set Width(value) {
    this.SetValue(Figure.WidthProperty, value);
  }
  get Height() {
    return this.GetValue(Figure.HeightProperty);
  }
  set Height(value) {
    this.SetValue(Figure.HeightProperty, value);
  }
  get HorizontalAnchor() {
    return this.GetValue(Figure.HorizontalAnchorProperty);
  }
  set HorizontalAnchor(value) {
    this.SetValue(Figure.HorizontalAnchorProperty, value);
  }
  get VerticalAnchor() {
    return this.GetValue(Figure.VerticalAnchorProperty);
  }
  set VerticalAnchor(value) {
    this.SetValue(Figure.VerticalAnchorProperty, value);
  }
  get HorizontalOffset() {
    return this.GetValue(Figure.HorizontalOffsetProperty);
  }
  set HorizontalOffset(value) {
    this.SetValue(Figure.HorizontalOffsetProperty, value);
  }
  get VerticalOffset() {
    return this.GetValue(Figure.VerticalOffsetProperty);
  }
  set VerticalOffset(value) {
    this.SetValue(Figure.VerticalOffsetProperty, value);
  }
  get WrapDirection() {
    return this.GetValue(Figure.WrapDirectionProperty);
  }
  set WrapDirection(value) {
    this.SetValue(Figure.WrapDirectionProperty, value);
  }
  get CanDelayPlacement() {
    return this.GetValue(Figure.CanDelayPlacementProperty);
  }
  set CanDelayPlacement(value) {
    this.SetValue(Figure.CanDelayPlacementProperty, value);
  }
  static WidthProperty = DependencyProperty.Register(
    "Width",
    Object,
    Figure,
    { DefaultValue: FigureLength.Auto },
    validFigureLength
  );
  static HeightProperty = DependencyProperty.Register(
    "Height",
    Object,
    Figure,
    { DefaultValue: FigureLength.Auto },
    validFigureLength
  );
  static HorizontalAnchorProperty = DependencyProperty.Register(
    "HorizontalAnchor",
    String,
    Figure,
    { DefaultValue: "ColumnRight" },
    (value) => Object.values(FigureHorizontalAnchor).includes(value)
  );
  static VerticalAnchorProperty = DependencyProperty.Register(
    "VerticalAnchor",
    String,
    Figure,
    { DefaultValue: "ParagraphTop" },
    (value) => Object.values(FigureVerticalAnchor).includes(value)
  );
  static HorizontalOffsetProperty = DependencyProperty.Register(
    "HorizontalOffset",
    Number,
    Figure,
    { DefaultValue: 0 },
    Number.isFinite
  );
  static VerticalOffsetProperty = DependencyProperty.Register(
    "VerticalOffset",
    Number,
    Figure,
    { DefaultValue: 0 },
    Number.isFinite
  );
  static WrapDirectionProperty = DependencyProperty.Register(
    "WrapDirection",
    String,
    Figure,
    { DefaultValue: "Both" },
    (value) => Object.values(WrapDirection).includes(value)
  );
  static CanDelayPlacementProperty = DependencyProperty.Register(
    "CanDelayPlacement",
    Boolean,
    Figure,
    { DefaultValue: true }
  );
}
class Floater extends AnchoredBlock {
  constructor(content) {
    super(content, "Floater");
  }
  get Width() {
    return this.GetValue(Floater.WidthProperty);
  }
  set Width(value) {
    this.SetValue(Floater.WidthProperty, value);
  }
  get HorizontalAlignment() {
    return this.GetValue(Floater.HorizontalAlignmentProperty);
  }
  set HorizontalAlignment(value) {
    this.SetValue(Floater.HorizontalAlignmentProperty, value);
  }
  // Use the same portable dimension DP identity; Floater validates the stricter numeric width wrapper.
  static WidthProperty = Figure.WidthProperty.AddOwner(Floater, {
    DefaultValue: void 0,
    CoerceValueCallback: (_owner, value) => {
      if (value !== void 0 && !(typeof value === "number" && Number.isFinite(value) && value >= 0))
        throw new RangeError(
          "Floater Width must be a finite nonnegative number."
        );
      return value;
    }
  });
  static HorizontalAlignmentProperty = DependencyProperty.Register(
    "HorizontalAlignment",
    String,
    Floater,
    { DefaultValue: "Left" },
    (value) => Object.values(HorizontalAlignment).includes(value)
  );
}
class Section extends Block {
  Blocks;
  constructor(content) {
    super("Section");
    this.Blocks = new TextElementCollection(
      this,
      (item) => item instanceof Block
    );
    this.childCollection = this.Blocks;
    addBlocks(this.Blocks, content);
  }
}
class List extends Block {
  ListItems;
  constructor(content) {
    super("List");
    this.ListItems = new TextElementCollection(
      this,
      (item) => item instanceof ListItem
    );
    this.childCollection = this.ListItems;
    if (content)
      this.ListItems.AddRange(
        Array.isArray(content) ? content : [content]
      );
  }
  get MarkerStyle() {
    return this.GetValue("MarkerStyle");
  }
  set MarkerStyle(value) {
    this.SetValue("MarkerStyle", value);
  }
  get StartIndex() {
    return this.GetValue("StartIndex");
  }
  set StartIndex(value) {
    this.SetValue("StartIndex", value);
  }
  get MarkerOffset() {
    return this.GetValue("MarkerOffset") ?? 0;
  }
  set MarkerOffset(value) {
    this.SetValue("MarkerOffset", value);
  }
}
class ListItem extends TextElement {
  Blocks;
  constructor(content) {
    super("ListItem");
    this.Blocks = new TextElementCollection(
      this,
      (item) => item instanceof Block
    );
    this.childCollection = this.Blocks;
    addBlocks(this.Blocks, content);
  }
}
class TableColumn extends TextElement {
  constructor(width) {
    super("TableColumn");
    if (width !== void 0) this.Width = width;
  }
  get Width() {
    return this.GetValue("Width");
  }
  set Width(value) {
    this.SetValue("Width", value);
  }
}
class Table extends Block {
  RowGroups;
  Columns;
  constructor(content) {
    super("Table");
    this.RowGroups = new TextElementCollection(
      this,
      (item) => item instanceof TableRowGroup
    );
    this.Columns = new TextElementCollection(
      this,
      (item) => item instanceof TableColumn
    );
    this.childCollection = this.RowGroups;
    if (content)
      this.RowGroups.AddRange(
        Array.isArray(content) ? content : [content]
      );
  }
  get CellSpacing() {
    return this.GetValue("CellSpacing");
  }
  set CellSpacing(value) {
    this.SetValue("CellSpacing", value);
  }
  ToJSON() {
    const result = super.ToJSON();
    if (this.Columns.Count)
      result.props.Columns = this.Columns.ToArray().map(
        (column) => column.ToJSON()
      );
    return result;
  }
}
class TableRowGroup extends TextElement {
  Rows;
  constructor(content) {
    super("TableRowGroup");
    this.Rows = new TextElementCollection(
      this,
      (item) => item instanceof TableRow
    );
    this.childCollection = this.Rows;
    if (content)
      this.Rows.AddRange(
        Array.isArray(content) ? content : [content]
      );
  }
}
class TableRow extends TextElement {
  Cells;
  constructor(content) {
    super("TableRow");
    this.Cells = new TextElementCollection(
      this,
      (item) => item instanceof TableCell
    );
    this.childCollection = this.Cells;
    if (content)
      this.Cells.AddRange(
        Array.isArray(content) ? content : [content]
      );
  }
}
class TableCell extends TextElement {
  Blocks;
  constructor(content) {
    super("TableCell");
    this.Blocks = new TextElementCollection(
      this,
      (item) => item instanceof Block
    );
    this.childCollection = this.Blocks;
    addBlocks(this.Blocks, content);
  }
  get RowSpan() {
    return this.GetValue("RowSpan");
  }
  set RowSpan(value) {
    this.SetValue("RowSpan", value);
  }
  get ColumnSpan() {
    return this.GetValue("ColumnSpan");
  }
  set ColumnSpan(value) {
    this.SetValue("ColumnSpan", value);
  }
  get Padding() {
    return this.GetValue("Padding");
  }
  set Padding(value) {
    this.SetValue("Padding", value);
  }
  get BorderThickness() {
    return this.GetValue("BorderThickness") ?? 0;
  }
  set BorderThickness(value) {
    this.SetValue("BorderThickness", value);
  }
  get BorderBrush() {
    return this.GetValue("BorderBrush") ?? "#d1d5db";
  }
  set BorderBrush(value) {
    this.SetValue("BorderBrush", value);
  }
}
class FlowDocument extends TextElement {
  Blocks;
  Changed = new EventDispatcher();
  revision = 0;
  changeDepth = 0;
  pending = [];
  dispatching = false;
  symbolMap;
  pointerDirty = true;
  synchronizingPointers = false;
  pointers = /* @__PURE__ */ new Set();
  pendingTextChanges;
  /** Exact pre-batch UTF-16 edits. Ranges are sorted, disjoint and expressed in the original document. */
  SetPendingTextChanges(changes) {
    const length = this.GetSymbolMap().Text.length;
    let previousEnd = -1, previousStart = -1;
    this.pendingTextChanges = changes.map((change) => {
      const { Start, RemovedLength, InsertedLength } = change;
      if (![Start, RemovedLength, InsertedLength].every(
        (value) => Number.isSafeInteger(value) && value >= 0
      ) || Start < previousEnd || Start === previousStart || Start + RemovedLength > length)
        throw new RangeError(
          "Text change ranges must be sorted, nonoverlapping and inside the pre-edit document."
        );
      previousEnd = Start + RemovedLength;
      previousStart = Start;
      return { Start, RemovedLength, InsertedLength };
    });
  }
  GetSymbolMap() {
    this._syncPointers();
    return this.symbolMap;
  }
  get SymbolCount() {
    return this.GetSymbolMap().SymbolCount;
  }
  GetPositionAtSymbolOffset(offset, direction = LogicalDirection.Forward) {
    const map = this.GetSymbolMap();
    if (!Number.isInteger(offset))
      throw new RangeError("Symbol offset must be an integer.");
    return offset < 0 || offset > map.SymbolCount ? null : TextPointer.FromSymbolOffset(this, offset, direction);
  }
  /** @internal */
  _trackPointer(pointer) {
    const reference = new WeakRef(pointer);
    this.pointers.add(reference);
    return reference;
  }
  /** @internal */
  _untrackPointer(reference) {
    this.pointers.delete(reference);
  }
  /** @internal */
  _syncPointers() {
    if (this.synchronizingPointers || !this.pointerDirty && this.symbolMap)
      return;
    this.synchronizingPointers = true;
    try {
      const previous = this.symbolMap;
      const next = new TextSymbolMap(this);
      this.symbolMap = next;
      this.pointerDirty = false;
      const explicit = this.pendingTextChanges;
      this.pendingTextChanges = void 0;
      const edits = previous && explicit && previous.Text.length + explicit.reduce(
        (total, edit) => total + edit.InsertedLength - edit.RemovedLength,
        0
      ) === next.Text.length ? explicit : void 0;
      for (const reference of this.pointers) {
        const pointer = reference.deref();
        if (!pointer) {
          this.pointers.delete(reference);
          continue;
        }
        if (previous) pointer._rebase(previous, next, edits);
      }
    } finally {
      this.synchronizingPointers = false;
    }
  }
  elementIds = /* @__PURE__ */ new Map([[this.Id, this]]);
  /** @internal */
  _hasElementId(id) {
    return this.elementIds.has(id);
  }
  /** @internal */
  _changeRootId(previous, next) {
    if (previous !== next && this.elementIds.has(next))
      throw new Error(`Duplicate element id: ${next}`);
    this.elementIds.delete(previous);
    this.elementIds.set(next, this);
  }
  /** @internal */
  _registerSubtree(root) {
    for (const node of walkElements(root)) this.elementIds.set(node.Id, node);
  }
  /** @internal */
  _unregisterSubtree(root) {
    for (const node of walkElements(root)) this.elementIds.delete(node.Id);
  }
  constructor(content) {
    super("FlowDocument");
    this.Blocks = new TextElementCollection(
      this,
      (item) => item instanceof Block
    );
    this.childCollection = this.Blocks;
    addBlocks(this.Blocks, content);
    this.revision = 0;
  }
  get Revision() {
    return this.revision;
  }
  get IsInChange() {
    return this.changeDepth > 0;
  }
  get ContentStart() {
    return TextPointer.FromSymbolOffset(this, 0, LogicalDirection.Backward);
  }
  get ContentEnd() {
    return TextPointer.FromSymbolOffset(
      this,
      this.SymbolCount,
      LogicalDirection.Forward
    );
  }
  get PageWidth() {
    return this.GetValue("PageWidth");
  }
  set PageWidth(value) {
    this.SetValue("PageWidth", value);
  }
  get PageHeight() {
    return this.GetValue("PageHeight");
  }
  set PageHeight(value) {
    this.SetValue("PageHeight", value);
  }
  get PagePadding() {
    return this.GetValue("PagePadding");
  }
  set PagePadding(value) {
    this.SetValue("PagePadding", value);
  }
  get ColumnCount() {
    return this.GetValue("ColumnCount");
  }
  set ColumnCount(value) {
    this.SetValue("ColumnCount", value);
  }
  get ColumnGap() {
    return this.GetValue("ColumnGap");
  }
  set ColumnGap(value) {
    this.SetValue("ColumnGap", value);
  }
  get TextAlignment() {
    return this.GetValue("TextAlignment");
  }
  set TextAlignment(value) {
    this.SetValue("TextAlignment", value);
  }
  get LineHeight() {
    return this.GetValue("LineHeight");
  }
  set LineHeight(value) {
    this.SetValue("LineHeight", value);
  }
  get IsHyphenationEnabled() {
    return this.GetValue("IsHyphenationEnabled");
  }
  set IsHyphenationEnabled(value) {
    this.SetValue("IsHyphenationEnabled", value);
  }
  BeginChange() {
    this.changeDepth++;
  }
  EndChange() {
    if (!this.changeDepth)
      throw new Error("EndChange requires a matching BeginChange.");
    if (--this.changeDepth === 0) this.flush();
  }
  Change(action) {
    this.BeginChange();
    try {
      action();
    } finally {
      this.EndChange();
    }
  }
  /** @internal */
  _record(change) {
    if (change.Kind !== "property") this.pointerDirty = true;
    this.pending.push(change);
    if (!this.changeDepth) this.flush();
  }
  flush() {
    if (this.dispatching || !this.pending.length) return;
    this.dispatching = true;
    try {
      while (this.pending.length && this.changeDepth === 0) {
        if (this.symbolMap || this.pointers.size) this._syncPointers();
        const changes = this.pending;
        this.pending = [];
        this.revision++;
        this.Changed.Emit({
          Document: this,
          Revision: this.Revision,
          Changes: changes
        });
      }
    } finally {
      this.dispatching = false;
    }
  }
  ReplaceWith(other) {
    if (!(other instanceof FlowDocument))
      throw new TypeError("ReplaceWith requires a FlowDocument.");
    if (other === this) return;
    const replacement = FlowDocument.FromJSON(other.ToJSON());
    for (const child of replacement.Children)
      if (walkElements(child).some((node) => node.Id === this.Id))
        throw new Error(
          `Replacement child duplicates the document id: ${this.Id}`
        );
    this.BeginChange();
    try {
      this.values = cloneValue(replacement.values);
      this.ResetPropertyState();
      this.Blocks.Clear();
      const blocks = replacement.Blocks.ToArray();
      replacement.Blocks.Clear();
      this.Blocks.AddRange(blocks);
      this._record({ Element: this, Kind: "reset" });
    } finally {
      this.EndChange();
    }
  }
  static FromJSON(node) {
    const element = elementFromJSON(
      typeof node === "string" ? JSON.parse(node) : node
    );
    if (!(element instanceof FlowDocument))
      throw new TypeError("Expected a FlowDocument root.");
    element.revision = 0;
    return element;
  }
  FindName(name) {
    return walkElements(this).find((element) => element.Name === name) ?? null;
  }
  FindById(id) {
    return this.elementIds.get(id) ?? null;
  }
  get ColumnWidth() {
    return this.GetValue("ColumnWidth");
  }
  set ColumnWidth(value) {
    this.SetValue("ColumnWidth", value);
  }
  get IsOptimalParagraphEnabled() {
    return this.GetValue("IsOptimalParagraphEnabled");
  }
  set IsOptimalParagraphEnabled(value) {
    this.SetValue("IsOptimalParagraphEnabled", value);
  }
  get IsColumnWidthFlexible() {
    return this.GetValue("IsColumnWidthFlexible");
  }
  set IsColumnWidthFlexible(value) {
    this.SetValue("IsColumnWidthFlexible", value);
  }
  static PageWidthProperty = DependencyProperty.Register(
    "PageWidth",
    Number,
    FlowDocument,
    { DefaultValue: 794 }
  );
  static PageHeightProperty = DependencyProperty.Register(
    "PageHeight",
    Number,
    FlowDocument,
    { DefaultValue: 1123 }
  );
  static PagePaddingProperty = DependencyProperty.Register("PagePadding", Thickness, FlowDocument, { DefaultValue: 72 });
  static ColumnCountProperty = DependencyProperty.Register(
    "ColumnCount",
    Number,
    FlowDocument,
    { DefaultValue: 1 }
  );
  static ColumnGapProperty = DependencyProperty.Register(
    "ColumnGap",
    Number,
    FlowDocument,
    { DefaultValue: 32 },
    (value) => Number.isFinite(value) && value >= 0
  );
  static ColumnWidthProperty = DependencyProperty.Register(
    "ColumnWidth",
    Number,
    FlowDocument,
    { DefaultValue: void 0 },
    (value) => value === void 0 || Number.isFinite(value) && value > 0
  );
  static TextAlignmentProperty = Block.TextAlignmentProperty.AddOwner(FlowDocument);
  static LineHeightProperty = Block.LineHeightProperty.AddOwner(FlowDocument);
  static IsHyphenationEnabledProperty = DependencyProperty.Register(
    "IsHyphenationEnabled",
    Boolean,
    FlowDocument,
    { DefaultValue: false, Inherits: true }
  );
  static IsOptimalParagraphEnabledProperty = DependencyProperty.Register(
    "IsOptimalParagraphEnabled",
    Boolean,
    FlowDocument,
    { DefaultValue: false }
  );
  static IsColumnWidthFlexibleProperty = DependencyProperty.Register(
    "IsColumnWidthFlexible",
    Boolean,
    FlowDocument,
    { DefaultValue: true }
  );
}
function walkElements(root) {
  const result = [];
  const visit = (element) => {
    result.push(element);
    if (element instanceof Table)
      for (const column of element.Columns) visit(column);
    for (const child of element.Children) visit(child);
  };
  visit(root);
  return result;
}
function leafBlocks(root) {
  const result = [];
  const visit = (element) => {
    if (element instanceof Paragraph || element instanceof BlockUIContainer)
      result.push(element);
    else for (const child of element.Children) visit(child);
  };
  visit(root);
  return result;
}
function inlineText(root) {
  if (root instanceof Run) return root.Text;
  if (root instanceof LineBreak) return "\n";
  if (root instanceof Equation || root instanceof Image || root instanceof AnchoredBlock || root instanceof InlineUIContainer || root instanceof BlockUIContainer)
    return "\uFFFC";
  return root.Children.map(inlineText).join("");
}
function getElementText(element) {
  if (element instanceof Inline || element instanceof Paragraph || element instanceof BlockUIContainer)
    return inlineText(element);
  return leafBlocks(element).map(inlineText).join("\n");
}
function elementOffset(document, target) {
  if (target === document) return 0;
  let position = 0;
  const blocks = leafBlocks(document);
  for (const block of blocks) {
    if (block === target || isAncestor(target, block)) return position;
    let found;
    const scan = (node, offset) => {
      if (node === target) found = offset;
      if (node instanceof Run || node instanceof LineBreak)
        return offset + inlineText(node).length;
      if (node instanceof Equation || node instanceof Image || node instanceof AnchoredBlock || node instanceof InlineUIContainer || node instanceof BlockUIContainer) {
        if (!(node instanceof AnchoredBlock)) {
          for (const child of node.Children)
            if (child === target) found = offset;
        }
        return offset + 1;
      }
      let next = offset;
      for (const child of node.Children) next = scan(child, next);
      return next;
    };
    scan(block, position);
    if (found !== void 0) return found;
    position += inlineText(block).length + 1;
  }
  position = 0;
  for (const node of walkElements(document)) {
    if (node === target) break;
    if (node instanceof Paragraph || node instanceof BlockUIContainer)
      position += inlineText(node).length + 1;
  }
  return Math.min(position, document.Text.length);
}
function isAncestor(ancestor, descendant) {
  for (let node = descendant.Parent; node; node = node.Parent)
    if (node === ancestor) return true;
  return false;
}
const TextPointerContext = {
  None: "None",
  Text: "Text",
  EmbeddedElement: "EmbeddedElement",
  ElementStart: "ElementStart",
  ElementEnd: "ElementEnd"
};
function validateDirection(direction) {
  if (direction !== LogicalDirection.Forward && direction !== LogicalDirection.Backward)
    throw new RangeError("Logical direction must be Forward or Backward.");
}
class TextSymbolMap {
  constructor(Document) {
    this.Document = Document;
    this.Text = Document.Text;
    const segments = [];
    let symbol = 0, text = 0, leafIndex = 0;
    const add = (context, element, symbolLength = 1, textLength = 0, content = "") => {
      const segment = Object.freeze({
        Context: context,
        SymbolStart: symbol,
        SymbolEnd: symbol + symbolLength,
        TextStart: text,
        TextEnd: text + textLength,
        Element: element,
        Text: content
      });
      if (symbolLength > 0) segments.push(segment);
      if (context === TextPointerContext.Text)
        this.runs.set(element.Id, segment);
      symbol += symbolLength;
      text += textLength;
    };
    const visit = (element, depth) => {
      if (element instanceof TableColumn) return;
      if (element instanceof Equation || element instanceof Image || element instanceof AnchoredBlock) {
        const start2 = symbol;
        add(TextPointerContext.EmbeddedElement, element, 1, 1);
        this.records.set(element.Id, {
          element,
          depth,
          bounds: Object.freeze({
            ElementStart: start2,
            ContentStart: start2,
            ContentEnd: symbol,
            ElementEnd: symbol
          })
        });
        return;
      }
      const start = symbol;
      const delimiter = element instanceof Paragraph || element instanceof BlockUIContainer ? leafIndex++ > 0 ? 1 : 0 : 0;
      add(TextPointerContext.ElementStart, element, 1, delimiter);
      const contentStart = symbol;
      if (element instanceof Run)
        add(
          TextPointerContext.Text,
          element,
          element.Text.length,
          element.Text.length,
          element.Text
        );
      else if (element instanceof InlineUIContainer || element instanceof BlockUIContainer) {
        if (element.Child) {
          const embeddedStart = symbol;
          add(TextPointerContext.EmbeddedElement, element.Child, 1, 1);
          this.records.set(element.Child.Id, {
            element: element.Child,
            depth: depth + 1,
            bounds: Object.freeze({
              ElementStart: embeddedStart,
              ContentStart: embeddedStart,
              ContentEnd: symbol,
              ElementEnd: symbol
            })
          });
        }
      } else if (!(element instanceof LineBreak))
        for (const child of element.Children) visit(child, depth + 1);
      const contentEnd = symbol;
      let plainOnEnd = element instanceof LineBreak || (element instanceof InlineUIContainer || element instanceof BlockUIContainer) && !element.Child ? 1 : 0;
      add(TextPointerContext.ElementEnd, element, 1, plainOnEnd);
      this.records.set(element.Id, {
        element,
        depth,
        bounds: Object.freeze({
          ElementStart: start,
          ContentStart: contentStart,
          ContentEnd: contentEnd,
          ElementEnd: symbol
        })
      });
    };
    for (const block of Document.Blocks) visit(block, 1);
    this.SymbolCount = symbol;
    this.Segments = Object.freeze(segments);
    this.records.set(Document.Id, {
      element: Document,
      depth: 0,
      bounds: Object.freeze({
        ElementStart: 0,
        ContentStart: 0,
        ContentEnd: symbol,
        ElementEnd: symbol
      })
    });
  }
  Document;
  Text;
  SymbolCount;
  Segments;
  records = /* @__PURE__ */ new Map();
  runs = /* @__PURE__ */ new Map();
  graphemes;
  /** @internal */
  _getGraphemeOffsets() {
    return this.graphemes ??= graphemeBoundaries(this.Text);
  }
  GetElementBounds(element) {
    return this.records.get(typeof element === "string" ? element : element.Id)?.bounds ?? null;
  }
  GetTextOffset(symbolOffset) {
    this.validateSymbolOffset(symbolOffset);
    if (symbolOffset === this.SymbolCount) return this.Text.length;
    const segment = this.GetAdjacentSegment(
      symbolOffset,
      LogicalDirection.Forward
    );
    if (!segment) return 0;
    return segment.Context === TextPointerContext.Text ? segment.TextStart + symbolOffset - segment.SymbolStart : segment.TextStart;
  }
  GetSymbolOffset(textOffset, direction = LogicalDirection.Forward) {
    validateDirection(direction);
    if (!Number.isInteger(textOffset) || textOffset < 0 || textOffset > this.Text.length)
      throw new RangeError("Text offset is outside the document.");
    for (const segment of this.runs.values()) {
      if (direction === LogicalDirection.Forward ? textOffset >= segment.TextStart && textOffset < segment.TextEnd : textOffset > segment.TextStart && textOffset <= segment.TextEnd)
        return segment.SymbolStart + textOffset - segment.TextStart;
    }
    for (const segment of this.runs.values()) {
      if (textOffset === segment.TextEnd) return segment.SymbolEnd;
      if (textOffset === segment.TextStart) return segment.SymbolStart;
    }
    for (const record of this.records.values()) {
      if (record.element instanceof Paragraph && record.element.Text.length === 0 && this.GetTextOffset(record.bounds.ContentStart) === textOffset)
        return record.bounds.ContentStart;
    }
    let first, last;
    for (const segment of this.Segments) {
      if (segment.TextStart === textOffset) {
        first ??= segment.SymbolStart;
        last = segment.SymbolStart;
      }
      if (segment.TextEnd === textOffset) {
        first ??= segment.SymbolEnd;
        last = segment.SymbolEnd;
      }
      if (segment.TextStart < textOffset && segment.TextEnd > textOffset)
        return direction === LogicalDirection.Forward ? segment.SymbolEnd : segment.SymbolStart;
    }
    if (textOffset === this.Text.length) last = this.SymbolCount;
    return (direction === LogicalDirection.Forward ? last ?? first : first ?? last) ?? 0;
  }
  GetAdjacentSegment(symbolOffset, direction) {
    this.validateSymbolOffset(symbolOffset);
    validateDirection(direction);
    const probe = direction === LogicalDirection.Forward ? symbolOffset : symbolOffset - 1;
    if (probe < 0 || probe >= this.SymbolCount) return null;
    let low = 0, high = this.Segments.length - 1;
    while (low <= high) {
      const middle = low + high >>> 1;
      const segment = this.Segments[middle];
      if (probe < segment.SymbolStart) high = middle - 1;
      else if (probe >= segment.SymbolEnd) low = middle + 1;
      else return segment;
    }
    return null;
  }
  GetParent(symbolOffset) {
    this.validateSymbolOffset(symbolOffset);
    let best = this.records.get(this.Document.Id);
    for (const record of this.records.values())
      if (!(record.element instanceof Equation) && !(record.element instanceof Image) && record.depth > best.depth && symbolOffset >= record.bounds.ContentStart && symbolOffset <= record.bounds.ContentEnd)
        best = record;
    return best.element;
  }
  GetParagraph(symbolOffset) {
    this.validateSymbolOffset(symbolOffset);
    let paragraph;
    for (const record of this.records.values())
      if (record.element instanceof Paragraph && symbolOffset >= record.bounds.ContentStart && symbolOffset <= record.bounds.ContentEnd && (!paragraph || record.depth > paragraph.depth))
        paragraph = record;
    return paragraph?.element ?? null;
  }
  /** @internal */
  _getRun(id) {
    return this.runs.get(id);
  }
  /** @internal */
  _validate(offset) {
    this.validateSymbolOffset(offset);
  }
  validateSymbolOffset(offset) {
    if (!Number.isInteger(offset) || offset < 0 || offset > this.SymbolCount)
      throw new RangeError("Symbol offset is outside the document.");
  }
}
function inferredChange(before, after) {
  if (before === after) return void 0;
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start])
    start++;
  let endBefore = before.length, endAfter = after.length;
  while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) {
    endBefore--;
    endAfter--;
  }
  return {
    Start: start,
    RemovedLength: endBefore - start,
    InsertedLength: endAfter - start
  };
}
function mapTextPosition(offset, direction, changes) {
  let adjustment = 0;
  for (const change of changes) {
    const end = change.Start + change.RemovedLength;
    if (offset < change.Start) break;
    if (offset > end || offset === end && change.RemovedLength > 0) {
      adjustment += change.InsertedLength - change.RemovedLength;
      continue;
    }
    return change.Start + adjustment + (direction === LogicalDirection.Forward ? change.InsertedLength : 0);
  }
  return offset + adjustment;
}
function graphemeBoundaries(text) {
  if (typeof Intl.Segmenter === "function")
    return [
      ...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(
        text
      )
    ].map((segment) => segment.index).concat(text.length);
  const result = [0];
  let offset = 0;
  for (const character of text) {
    offset += character.length;
    result.push(offset);
  }
  return result;
}
class TextPointer {
  Document;
  LogicalDirection;
  offset;
  symbolOffset;
  snapshotMap;
  registration;
  edge;
  constructor(document, offset = 0, direction = LogicalDirection.Forward, options = {}) {
    if (!(document instanceof FlowDocument))
      throw new TypeError("A TextPointer requires a FlowDocument.");
    validateDirection(direction);
    const map = document.GetSymbolMap();
    if (!Number.isInteger(offset) || offset < 0 || offset > map.Text.length)
      throw new RangeError("TextPointer offset is outside the document.");
    this.Document = document;
    this.offset = offset;
    this.LogicalDirection = direction;
    this.snapshotMap = map;
    this.symbolOffset = map.GetSymbolOffset(offset, direction);
    if (options.TrackChanges !== false)
      this.registration = document._trackPointer(this);
  }
  static FromSymbolOffset(document, symbolOffset, direction = LogicalDirection.Forward, options = {}) {
    const map = document.GetSymbolMap();
    map._validate(symbolOffset);
    const pointer = new TextPointer(
      document,
      map.GetTextOffset(symbolOffset),
      direction,
      options
    );
    pointer.symbolOffset = symbolOffset;
    return pointer;
  }
  /** @internal */
  static _fromElementBoundary(document, id, edge, direction) {
    const bounds = document.GetSymbolMap().GetElementBounds(id);
    if (!bounds) throw new Error("Element is outside the text stream.");
    const pointer = TextPointer.FromSymbolOffset(
      document,
      bounds[edge],
      direction
    );
    pointer.edge = { id, edge };
    const element = document.FindById(id);
    pointer.offset = elementOffset(document, element) + (edge === "ContentEnd" || edge === "ElementEnd" ? element.Text.length : 0);
    return pointer;
  }
  get Offset() {
    this.synchronize();
    return this.offset;
  }
  get SymbolOffset() {
    this.synchronize();
    return this.symbolOffset;
  }
  get IsLive() {
    return !!this.registration;
  }
  get DocumentStart() {
    return this.deriveAtSymbol(0, LogicalDirection.Backward);
  }
  get DocumentEnd() {
    return this.deriveAtSymbol(this.map.SymbolCount, LogicalDirection.Forward);
  }
  get Parent() {
    return this.map.GetParent(this.symbolOffset);
  }
  get Paragraph() {
    return this.map.GetParagraph(this.symbolOffset);
  }
  deriveAtSymbol(symbolOffset, direction) {
    const map = this.map;
    map._validate(symbolOffset);
    validateDirection(direction);
    if (this.IsLive)
      return TextPointer.FromSymbolOffset(
        this.Document,
        symbolOffset,
        direction
      );
    const pointer = Object.create(TextPointer.prototype);
    Object.assign(pointer, {
      Document: this.Document,
      LogicalDirection: direction,
      offset: map.GetTextOffset(symbolOffset),
      symbolOffset,
      snapshotMap: map
    });
    return pointer;
  }
  deriveAtText(offset, direction) {
    const pointer = this.deriveAtSymbol(
      this.map.GetSymbolOffset(offset, direction),
      direction
    );
    pointer.offset = offset;
    return pointer;
  }
  get map() {
    this.synchronize();
    return this.snapshotMap;
  }
  synchronize() {
    if (this.registration) this.Document._syncPointers();
  }
  /** Stops tracking subsequent edits while retaining the current coordinates and structural snapshot. */
  Dispose() {
    this.synchronize();
    if (this.registration) {
      this.Document._untrackPointer(this.registration);
      this.registration = void 0;
    }
  }
  CreateSnapshot() {
    this.synchronize();
    const pointer = Object.create(TextPointer.prototype);
    Object.assign(pointer, {
      Document: this.Document,
      LogicalDirection: this.LogicalDirection,
      offset: this.offset,
      symbolOffset: this.symbolOffset,
      snapshotMap: this.snapshotMap
    });
    return pointer;
  }
  /** @internal */
  _rebase(previous, next, changes) {
    if (this.edge) {
      const bounds = next.GetElementBounds(this.edge.id);
      if (bounds) {
        this.symbolOffset = bounds[this.edge.edge];
        const element = next.Document.FindById(this.edge.id);
        this.offset = elementOffset(next.Document, element) + (this.edge.edge === "ContentEnd" || this.edge.edge === "ElementEnd" ? element.Text.length : 0);
        this.snapshotMap = next;
        return;
      }
      this.edge = void 0;
    }
    let nextOffset;
    if (changes)
      nextOffset = mapTextPosition(this.offset, this.LogicalDirection, changes);
    else {
      const forward = previous.GetAdjacentSegment(
        this.symbolOffset,
        LogicalDirection.Forward
      );
      const backward = previous.GetAdjacentSegment(
        this.symbolOffset,
        LogicalDirection.Backward
      );
      const candidate = this.LogicalDirection === LogicalDirection.Forward ? forward?.Context === TextPointerContext.Text ? forward : backward : backward?.Context === TextPointerContext.Text ? backward : forward;
      if (candidate?.Context === TextPointerContext.Text) {
        const run = next._getRun(candidate.Element.Id);
        if (run) {
          const local = this.symbolOffset - candidate.SymbolStart;
          const change = inferredChange(candidate.Text, run.Text);
          if (previous.Text === next.Text && change) nextOffset = this.offset;
          else
            nextOffset = run.TextStart + mapTextPosition(
              local,
              this.LogicalDirection,
              change ? [change] : []
            );
        }
      }
      if (nextOffset === void 0 && previous.Text === next.Text) {
        const adjacent = this.LogicalDirection === LogicalDirection.Forward ? forward : backward;
        const bounds = adjacent && next.GetElementBounds(adjacent.Element.Id);
        if (bounds && adjacent && adjacent.Context !== TextPointerContext.Text) {
          const edge = adjacent.Context === TextPointerContext.ElementStart ? "ElementStart" : adjacent.Context === TextPointerContext.ElementEnd ? "ContentEnd" : "ElementStart";
          this.symbolOffset = bounds[edge] + (this.LogicalDirection === LogicalDirection.Backward ? 1 : 0);
          this.symbolOffset = Math.min(next.SymbolCount, this.symbolOffset);
          this.offset = next.GetTextOffset(this.symbolOffset);
          this.snapshotMap = next;
          return;
        }
      }
      if (nextOffset === void 0) {
        const change = inferredChange(previous.Text, next.Text);
        nextOffset = mapTextPosition(
          this.offset,
          this.LogicalDirection,
          change ? [change] : []
        );
      }
    }
    this.offset = Math.max(0, Math.min(next.Text.length, nextOffset));
    this.symbolOffset = next.GetSymbolOffset(
      this.offset,
      this.LogicalDirection
    );
    this.snapshotMap = next;
  }
  GetPositionAtOffset(offset, direction = this.LogicalDirection) {
    if (!Number.isInteger(offset))
      throw new RangeError("Offset must be an integer.");
    validateDirection(direction);
    const next = this.Offset + offset;
    return next < 0 || next > this.map.Text.length ? null : this.deriveAtText(next, direction);
  }
  GetPositionAtSymbolOffset(offset, direction = this.LogicalDirection) {
    if (!Number.isInteger(offset))
      throw new RangeError("Symbol offset must be an integer.");
    const next = this.SymbolOffset + offset;
    return next < 0 || next > this.map.SymbolCount ? null : this.deriveAtSymbol(next, direction);
  }
  CompareTo(other) {
    this.ensureDocument(other);
    return Math.sign(this.Offset - other.Offset);
  }
  CompareSymbolTo(other) {
    this.ensureDocument(other);
    return Math.sign(this.SymbolOffset - other.SymbolOffset);
  }
  GetOffsetToPosition(other) {
    this.ensureDocument(other);
    return other.Offset - this.Offset;
  }
  GetSymbolOffsetToPosition(other) {
    this.ensureDocument(other);
    return other.SymbolOffset - this.SymbolOffset;
  }
  IsInSameDocument(other) {
    return other instanceof TextPointer && other.Document === this.Document;
  }
  GetPointerContext(direction) {
    return this.map.GetAdjacentSegment(this.symbolOffset, direction)?.Context ?? TextPointerContext.None;
  }
  GetAdjacentElement(direction) {
    const segment = this.map.GetAdjacentSegment(this.symbolOffset, direction);
    return segment && segment.Context !== TextPointerContext.Text ? segment.Element : null;
  }
  GetNextContextPosition(direction) {
    const map = this.map, segment = map.GetAdjacentSegment(this.symbolOffset, direction);
    return segment ? this.deriveAtSymbol(
      direction === LogicalDirection.Forward ? segment.SymbolEnd : segment.SymbolStart,
      this.LogicalDirection
    ) : null;
  }
  GetTextInRun(direction, buffer, startIndex = 0, count = 0) {
    const segment = this.map.GetAdjacentSegment(this.symbolOffset, direction);
    const text = !segment || segment.Context !== TextPointerContext.Text ? "" : direction === LogicalDirection.Forward ? segment.Text.slice(this.symbolOffset - segment.SymbolStart) : segment.Text.slice(0, this.symbolOffset - segment.SymbolStart);
    if (buffer === void 0) return text;
    if (!(Array.isArray(buffer) || buffer instanceof Uint16Array) || !Number.isSafeInteger(startIndex) || !Number.isSafeInteger(count) || startIndex < 0 || count < 0 || startIndex + count > buffer.length)
      throw new RangeError("Text buffer range is invalid.");
    const copied = Math.min(count, text.length), value = direction === LogicalDirection.Forward ? text.slice(0, copied) : text.slice(text.length - copied);
    for (let index = 0; index < copied; index++)
      if (buffer instanceof Uint16Array)
        buffer[startIndex + index] = value.charCodeAt(index);
      else buffer[startIndex + index] = value[index];
    return copied;
  }
  GetTextRunLength(direction) {
    return this.GetTextInRun(direction).length;
  }
  GetPropertyValue(property) {
    return this.Parent.GetValue(property);
  }
  get IsAtInsertionPosition() {
    const map = this.map;
    const parent = map.GetParent(this.symbolOffset);
    return (parent instanceof Paragraph || parent instanceof Span || parent instanceof Run) && map._getGraphemeOffsets().includes(this.offset);
  }
  GetInsertionPosition(direction) {
    validateDirection(direction);
    if (this.IsAtInsertionPosition)
      return this.deriveAtSymbol(this.SymbolOffset, direction);
    const step = direction === LogicalDirection.Forward ? 1 : -1;
    for (let symbol = this.SymbolOffset; symbol >= 0 && symbol <= this.map.SymbolCount; symbol += step) {
      const position = this.deriveAtSymbol(symbol, direction);
      if (position.IsAtInsertionPosition) return position;
      position.Dispose();
    }
    return null;
  }
  GetNextInsertionPosition(direction) {
    validateDirection(direction);
    const offsets = this.map._getGraphemeOffsets();
    const next = direction === LogicalDirection.Forward ? offsets.find((offset) => offset > this.offset) : [...offsets].reverse().find((offset) => offset < this.offset);
    if (next === void 0) return null;
    const pointer = this.deriveAtText(next, direction);
    if (pointer.IsAtInsertionPosition) return pointer;
    const position = pointer.GetInsertionPosition(direction);
    pointer.Dispose();
    return position;
  }
  InsertTextInRun(text) {
    if (typeof text !== "string") throw new TypeError("Text must be a string.");
    if (!this.IsLive)
      throw new Error("Snapshot pointers cannot edit a document.");
    const map = this.map;
    const parent = map.GetParent(this.symbolOffset);
    if (parent instanceof Run) {
      const run = map._getRun(parent.Id);
      const at = Math.max(
        0,
        Math.min(parent.Text.length, this.offset - run.TextStart)
      );
      if (!text) return;
      this.Document.SetPendingTextChanges([
        {
          Start: run.TextStart + at,
          RemovedLength: 0,
          InsertedLength: text.length
        }
      ]);
      parent.Text = parent.Text.slice(0, at) + text + parent.Text.slice(at);
      this.Document._syncPointers();
      return;
    }
    if (parent instanceof Paragraph || parent instanceof Span) {
      const index = parent.Inlines.ToArray().findIndex(
        (child) => map.GetElementBounds(child).ElementStart >= this.symbolOffset
      );
      if (!text) return;
      this.Document.SetPendingTextChanges([
        { Start: this.offset, RemovedLength: 0, InsertedLength: text.length }
      ]);
      parent.Inlines.Insert(
        index < 0 ? parent.Inlines.Count : index,
        new Run(text)
      );
      this.Document._syncPointers();
      return;
    }
    throw new Error("The position is not inside inline text content.");
  }
  DeleteTextInRun(count) {
    if (!Number.isInteger(count))
      throw new RangeError("Character count must be an integer.");
    if (!this.IsLive)
      throw new Error("Snapshot pointers cannot edit a document.");
    if (!count) return 0;
    const segment = this.map.GetAdjacentSegment(
      this.symbolOffset,
      count > 0 ? LogicalDirection.Forward : LogicalDirection.Backward
    );
    if (!segment || segment.Context !== TextPointerContext.Text || !(segment.Element instanceof Run))
      return 0;
    const local = this.symbolOffset - segment.SymbolStart, removed = Math.min(
      Math.abs(count),
      count > 0 ? segment.Text.length - local : local
    );
    const start = count > 0 ? local : local - removed;
    this.Document.SetPendingTextChanges([
      {
        Start: segment.TextStart + start,
        RemovedLength: removed,
        InsertedLength: 0
      }
    ]);
    segment.Element.Text = segment.Text.slice(0, start) + segment.Text.slice(start + removed);
    this.Document._syncPointers();
    return removed;
  }
  ensureDocument(other) {
    if (!this.IsInSameDocument(other))
      throw new Error("Text positions belong to different documents.");
  }
}
function elementFromJSON(node, options = {}) {
  const ids = /* @__PURE__ */ new Set();
  let count = 0;
  const parse = (data, depth) => {
    if (++count > (options.MaxNodes ?? 1e5))
      throw new RangeError("Document exceeds the node limit.");
    if (depth > (options.MaxDepth ?? 256))
      throw new RangeError("Document exceeds the nesting limit.");
    if (!data || typeof data !== "object" || typeof data.type !== "string")
      throw new TypeError("Invalid document node.");
    if (typeof data.id !== "string" || !data.id)
      throw new TypeError("Document node requires an id.");
    if (ids.has(data.id)) throw new Error(`Duplicate element id: ${data.id}`);
    ids.add(data.id);
    if (data.props !== void 0 && (!data.props || typeof data.props !== "object" || Array.isArray(data.props)))
      throw new TypeError("Node props must be an object.");
    if (data.children !== void 0 && !Array.isArray(data.children))
      throw new TypeError("Node children must be an array.");
    let element;
    switch (data.type) {
      case "FlowDocument":
        element = new FlowDocument();
        break;
      case "Figure":
        element = new Figure();
        break;
      case "Floater":
        element = new Floater();
        break;
      case "Section":
        element = new Section();
        break;
      case "Paragraph":
        element = new Paragraph();
        break;
      case "Run":
        if (data.text !== void 0 && typeof data.text !== "string")
          throw new TypeError("Run text must be a string.");
        element = new Run(data.text ?? "");
        break;
      case "Span":
        element = new Span();
        break;
      case "Bold":
        element = new Bold();
        break;
      case "Italic":
        element = new Italic();
        break;
      case "Underline":
        element = new Underline();
        break;
      case "Hyperlink":
        element = new Hyperlink();
        break;
      case "LineBreak":
        element = new LineBreak();
        break;
      case "List":
        element = new List();
        break;
      case "ListItem":
        element = new ListItem();
        break;
      case "Table":
        element = new Table();
        break;
      case "TableColumn":
        element = new TableColumn();
        break;
      case "TableRowGroup":
        element = new TableRowGroup();
        break;
      case "TableRow":
        element = new TableRow();
        break;
      case "TableCell":
        element = new TableCell();
        break;
      case "InlineUIContainer":
        element = new InlineUIContainer();
        break;
      case "BlockUIContainer":
        element = new BlockUIContainer();
        break;
      case "Equation":
        element = new Equation();
        break;
      case "Image":
        element = new Image();
        break;
      default:
        throw new TypeError(`Unsupported document node type: ${data.type}`);
    }
    element._setId(data.id);
    for (const [name, value] of Object.entries(data.props ?? {})) {
      if (name === "Columns" && element instanceof Table) continue;
      element.SetValue(name, value);
    }
    if (element instanceof Table && data.props?.Columns !== void 0) {
      if (!Array.isArray(data.props.Columns))
        throw new TypeError("Table Columns must be an array.");
      for (const column of data.props.Columns)
        element.Columns.Add(parse(column, depth + 1));
    }
    for (const child of data.children ?? []) {
      const parsed = parse(child, depth + 1);
      const target = element instanceof FlowDocument || element instanceof AnchoredBlock || element instanceof Section || element instanceof ListItem || element instanceof TableCell ? element.Blocks : element instanceof Paragraph || element instanceof Span ? element.Inlines : element instanceof List ? element.ListItems : element instanceof Table ? element.RowGroups : element instanceof TableRowGroup ? element.Rows : element instanceof TableRow ? element.Cells : null;
      if (target) target.Add(parsed);
      else if (element instanceof InlineUIContainer || element instanceof BlockUIContainer) {
        if (element.Child || !(parsed instanceof Image))
          throw new TypeError(`${element.Type} accepts one Image child.`);
        element.Child = parsed;
      } else throw new TypeError(`${element.Type} cannot contain child nodes.`);
    }
    return element;
  };
  return parse(node, 0);
}
export {
  AnchoredBlock,
  BaseValueSource,
  BaselineAlignment,
  Block,
  BlockUIContainer,
  Bold,
  DependencyObject,
  DependencyProperty,
  DependencyPropertyHelper,
  DependencyPropertyKey,
  Equation,
  EventDispatcher,
  Figure,
  FigureHorizontalAnchor,
  FigureLength,
  FigureUnitType,
  FigureVerticalAnchor,
  Floater,
  FlowDirection,
  FlowDocument,
  FontStyles,
  FontWeights,
  FrameworkPropertyMetadata,
  FrameworkPropertyMetadataOptions,
  HorizontalAlignment,
  Hyperlink,
  Image,
  Inline,
  InlineUIContainer,
  Italic,
  LineBreak,
  LineStackingStrategy,
  List,
  ListItem,
  LocalValueEnumerator,
  LogicalDirection,
  Paragraph,
  PropertyMetadata,
  Run,
  Section,
  Span,
  Table,
  TableCell,
  TableColumn,
  TableRow,
  TableRowGroup,
  TextAlignment,
  TextDecorations,
  TextElement,
  TextElementCollection,
  TextMarkerStyle,
  TextPointer,
  TextPointerContext,
  TextSymbolMap,
  Thickness,
  UIPropertyMetadata,
  Underline,
  WrapDirection,
  elementFromJSON,
  getElementText,
  walkElements
};
//# sourceMappingURL=model.js.map
