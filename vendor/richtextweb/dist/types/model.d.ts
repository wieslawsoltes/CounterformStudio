/** Portable FlowDocument object model. Positions are UTF-16 plain-text offsets. */
export type PropertyValue = any;
export interface DocumentNode {
    type: string;
    id: string;
    props: Record<string, any>;
    text?: string;
    children?: DocumentNode[];
}
export interface IDisposable {
    Dispose(): void;
}
export type EventHandler<T> = (event: T) => void;
/** Synchronous multicast event. A snapshot makes subscribing/unsubscribing during dispatch safe. */
export declare class EventDispatcher<T = void> {
    private handlers;
    Subscribe(handler: EventHandler<T>): IDisposable;
    Unsubscribe(handler: EventHandler<T>): void;
    Emit(event: T): void;
    Invoke(event: T): void;
    Raise(event: T): void;
    Clear(): void;
    get Count(): number;
}
export declare const FontWeights: {
    readonly Thin: "Thin";
    readonly ExtraLight: "ExtraLight";
    readonly Light: "Light";
    readonly Normal: "Normal";
    readonly Medium: "Medium";
    readonly SemiBold: "SemiBold";
    readonly Bold: "Bold";
    readonly ExtraBold: "ExtraBold";
    readonly Black: "Black";
};
export declare const FontStyles: {
    readonly Normal: "Normal";
    readonly Italic: "Italic";
    readonly Oblique: "Oblique";
};
export declare const TextDecorations: {
    readonly None: "None";
    readonly Underline: "Underline";
    readonly Strikethrough: "Strikethrough";
    readonly OverLine: "OverLine";
};
export declare const TextAlignment: {
    readonly Left: "Left";
    readonly Center: "Center";
    readonly Right: "Right";
    readonly Justify: "Justify";
};
export declare const FlowDirection: {
    readonly LeftToRight: "LeftToRight";
    readonly RightToLeft: "RightToLeft";
};
export declare const LogicalDirection: {
    readonly Forward: "Forward";
    readonly Backward: "Backward";
};
export declare const TextMarkerStyle: {
    readonly None: "None";
    readonly Disc: "Disc";
    readonly Circle: "Circle";
    readonly Square: "Square";
    readonly Box: "Box";
    readonly Decimal: "Decimal";
    readonly LowerRoman: "LowerRoman";
    readonly UpperRoman: "UpperRoman";
    readonly LowerLatin: "LowerLatin";
    readonly UpperLatin: "UpperLatin";
};
export declare const BaselineAlignment: {
    readonly Baseline: "Baseline";
    readonly Superscript: "Superscript";
    readonly Subscript: "Subscript";
    readonly Top: "Top";
    readonly Center: "Center";
    readonly Bottom: "Bottom";
    readonly TextTop: "TextTop";
    readonly TextBottom: "TextBottom";
};
export declare const LineStackingStrategy: {
    readonly MaxHeight: "MaxHeight";
    readonly BlockLineHeight: "BlockLineHeight";
};
export type LogicalDirectionValue = (typeof LogicalDirection)[keyof typeof LogicalDirection];
export declare class Thickness {
    readonly Left: number;
    readonly Top: number;
    readonly Right: number;
    readonly Bottom: number;
    constructor(uniform?: number);
    constructor(horizontal: number, vertical: number);
    constructor(left: number, top: number, right: number, bottom: number);
    static Parse(value: string): Thickness;
    Equals(other: unknown): boolean;
    ToString(): string;
    toString(): string;
    toJSON(): Record<string, number>;
}
export type PropertyChangedCallback<T = any> = (owner: DependencyObject, event: PropertyChangedEvent<T>) => void;
export type CoerceValueCallback<T = any> = (owner: DependencyObject, baseValue: T) => T | symbol;
/** Metadata accepts object initializers as well as the familiar .NET constructor form. */
export declare class PropertyMetadata<T = any> {
    DefaultValue?: T;
    Inherits?: boolean;
    /** Compatibility initializer. Validation belongs to the registration and cannot be overridden. */
    ValidateValueCallback?: (value: T) => boolean;
    PropertyChangedCallback?: PropertyChangedCallback<T>;
    CoerceValueCallback?: CoerceValueCallback<T>;
    IsSealed?: boolean;
    constructor(defaultValue?: T, propertyChangedCallback?: PropertyChangedCallback<T>, coerceValueCallback?: CoerceValueCallback<T>);
}
export declare class UIPropertyMetadata<T = any> extends PropertyMetadata<T> {
    IsAnimationProhibited?: boolean;
}
export declare const FrameworkPropertyMetadataOptions: {
    readonly None: 0;
    readonly AffectsMeasure: 1;
    readonly AffectsArrange: 2;
    readonly AffectsParentMeasure: 4;
    readonly AffectsParentArrange: 8;
    readonly AffectsRender: 16;
    readonly Inherits: 32;
    readonly OverridesInheritanceBehavior: 64;
    readonly NotDataBindable: 128;
    readonly BindsTwoWayByDefault: 256;
    readonly Journal: 1024;
    readonly SubPropertiesDoNotAffectRender: 2048;
};
export declare class FrameworkPropertyMetadata<T = any> extends UIPropertyMetadata<T> {
    AffectsMeasure?: boolean;
    AffectsArrange?: boolean;
    AffectsParentMeasure?: boolean;
    AffectsParentArrange?: boolean;
    AffectsRender?: boolean;
    OverridesInheritanceBehavior?: boolean;
    IsNotDataBindable?: boolean;
    BindsTwoWayByDefault?: boolean;
    Journal?: boolean;
    SubPropertiesDoNotAffectRender?: boolean;
    DefaultUpdateSourceTrigger?: "Default" | "PropertyChanged" | "LostFocus" | "Explicit";
    constructor(defaultValue?: T, flags?: number, propertyChangedCallback?: PropertyChangedCallback<T>, coerceValueCallback?: CoerceValueCallback<T>);
}
export interface PropertyChangedEvent<T = any> {
    Property: string;
    DependencyProperty?: DependencyProperty<T>;
    OldValue: T;
    NewValue: T;
    IsInherited?: boolean;
}
export declare class DependencyPropertyKey<T = any> {
    readonly DependencyProperty: DependencyProperty<T>;
    /** @internal Keys are created by RegisterReadOnly; a forged key never authorizes writes. */
    constructor(DependencyProperty: DependencyProperty<T>);
    OverrideMetadata(ownerType: unknown, metadata: PropertyMetadata<T>): void;
}
export declare class DependencyProperty<T = any> {
    static readonly UnsetValue: unique symbol;
    private static registry;
    private static storageRegistry;
    readonly Name: string;
    readonly PropertyType: unknown;
    readonly OwnerType: unknown;
    readonly DefaultMetadata: PropertyMetadata<T>;
    readonly ValidateValueCallback?: (value: T) => boolean;
    readonly ReadOnly: boolean;
    readonly IsAttached: boolean;
    /** @internal JSON storage preserves independent same-name property registrations. */
    readonly StorageName: string;
    private metadata;
    private usedTypes;
    constructor(name: string, metadata?: PropertyMetadata<T>, propertyType?: unknown, ownerType?: unknown, validateValueCallback?: (value: T) => boolean, readOnly?: boolean, attached?: boolean);
    private static register;
    static Register<T = any>(name: string, propertyType?: unknown, ownerType?: unknown, metadata?: PropertyMetadata<T> | T, validateValueCallback?: (value: T) => boolean): DependencyProperty<T>;
    static RegisterAttached<T = any>(name: string, propertyType?: unknown, ownerType?: unknown, metadata?: PropertyMetadata<T> | T, validateValueCallback?: (value: T) => boolean): DependencyProperty<T>;
    static RegisterReadOnly<T = any>(name: string, propertyType?: unknown, ownerType?: unknown, metadata?: PropertyMetadata<T> | T, validateValueCallback?: (value: T) => boolean): DependencyPropertyKey<T>;
    static RegisterAttachedReadOnly<T = any>(name: string, propertyType?: unknown, ownerType?: unknown, metadata?: PropertyMetadata<T> | T, validateValueCallback?: (value: T) => boolean): DependencyPropertyKey<T>;
    static Find(name: string, ownerType?: unknown): DependencyProperty | undefined;
    /** @internal */ static GetRegisteredProperties(): readonly DependencyProperty[];
    IsValidType(value: unknown): boolean;
    IsValidValue(value: unknown): boolean;
    GetMetadata(ownerType: unknown): PropertyMetadata<T>;
    /** @internal */ _getMetadataForUse(ownerType: unknown): PropertyMetadata<T>;
    OverrideMetadata(ownerType: unknown, metadata: PropertyMetadata<T>, key?: DependencyPropertyKey<T>): void;
    AddOwner(ownerType: unknown, metadata?: PropertyMetadata<T>): DependencyProperty<T>;
    ToString(): string;
    toString(): string;
}
export declare const BaseValueSource: {
    readonly Default: "Default";
    readonly Inherited: "Inherited";
    readonly Style: "Style";
    readonly StyleTrigger: "StyleTrigger";
    readonly Local: "Local";
};
export interface ValueSource {
    BaseValueSource: (typeof BaseValueSource)[keyof typeof BaseValueSource];
    IsCoerced: boolean;
    IsCurrent: boolean;
    IsExpression: boolean;
    IsAnimated: boolean;
}
export interface LocalValueEntry {
    Property: string | DependencyProperty;
    Value: any;
}
export declare class LocalValueEnumerator implements Iterable<LocalValueEntry> {
    private readonly entries;
    private index;
    constructor(entries: readonly LocalValueEntry[]);
    get Count(): number;
    get Current(): LocalValueEntry;
    MoveNext(): boolean;
    Reset(): void;
    [Symbol.iterator](): Iterator<LocalValueEntry>;
}
export declare class DependencyPropertyHelper {
    static GetValueSource(owner: DependencyObject, property: string | DependencyProperty): ValueSource;
}
export declare class DependencyObject {
    protected values: Record<string, any>;
    private currentValues;
    private styleValues;
    private triggerValues;
    private effectiveValues;
    private evaluating;
    private retainedEffective;
    private hasCurrentValuesInSubtree;
    readonly PropertyChanged: EventDispatcher<PropertyChangedEvent<any>>;
    protected get InheritanceParent(): DependencyObject | null;
    protected get InheritanceChildren(): readonly DependencyObject[];
    private resolve;
    private evaluate;
    GetValue<T = any>(property: string | DependencyProperty<T>): T;
    private validate;
    private writable;
    private affected;
    private notify;
    private mutate;
    SetValue<T = any>(property: string | DependencyProperty<T> | DependencyPropertyKey<T>, value: T): void;
    SetCurrentValue<T = any>(property: string | DependencyProperty<T>, value: T): void;
    ReadLocalValue(property: string | DependencyProperty): any;
    ClearValue(property: string | DependencyProperty | DependencyPropertyKey): void;
    /** Apply a style setter or active trigger from a host style system. Local values take precedence. */
    SetStyleValue<T = any>(property: string | DependencyProperty<T>, value: T, isTrigger?: boolean): void;
    ClearStyleValue(property: string | DependencyProperty, isTrigger?: boolean): void;
    CoerceValue(property: string | DependencyProperty): void;
    InvalidateProperty(property: string | DependencyProperty): void;
    GetAnimationBaseValue<T = any>(property: string | DependencyProperty<T>): T;
    GetValueSource(property: string | DependencyProperty): ValueSource;
    GetLocalValueEnumerator(): LocalValueEnumerator;
    /** @internal Reset computed/transient values after a complete document replacement. */
    protected ResetPropertyState(): void;
    /** Parent changes invalidate inherited defaults, current values, and derived metadata across the subtree. */
    protected ChangeInheritanceParent(change: () => void, nextParent: DependencyObject | null): () => void;
    protected OnPropertyChanged(_event: PropertyChangedEvent): void;
    protected OnBaseValueChanged(_event: PropertyChangedEvent): void;
}
export interface DocumentChange {
    Element: TextElement;
    Kind: "property" | "text" | "insert" | "remove" | "reset";
    Property?: string;
    OldValue?: any;
    NewValue?: any;
    Index?: number;
}
export interface DocumentChangedEvent {
    Document: FlowDocument;
    Revision: number;
    Changes: DocumentChange[];
}
export interface CollectionChangedEvent<T> {
    Action: "Add" | "Remove" | "Reset" | "Replace";
    NewItems: T[];
    OldItems: T[];
    Index: number;
}
export declare class TextElement extends DependencyObject {
    readonly Type: string;
    private identity;
    private parent;
    /** Internal ownership slots; a node belongs to exactly one collection. */
    _collection: TextElementCollection<any> | null;
    protected childCollection?: TextElementCollection<any>;
    /** @internal Shared collection access for structural engine patches. */
    _getChildCollection(): TextElementCollection<any> | undefined;
    constructor(type?: string);
    get Id(): string;
    get Parent(): TextElement | null;
    get Document(): FlowDocument | null;
    protected get InheritanceParent(): DependencyObject | null;
    /** @internal */ _setParent(parent: TextElement | null, collection: TextElementCollection<any> | null): () => void;
    /** @internal */ _setId(id: string): void;
    /** @internal */ _notify(change: DocumentChange): void;
    protected get InheritanceChildren(): readonly DependencyObject[];
    protected OnPropertyChanged(event: PropertyChangedEvent): void;
    protected OnBaseValueChanged(event: PropertyChangedEvent): void;
    get Text(): string;
    get Children(): readonly TextElement[];
    private boundaryPointer;
    get ContentStart(): TextPointer;
    get ContentEnd(): TextPointer;
    get ElementStart(): TextPointer;
    get ElementEnd(): TextPointer;
    ToJSON(): DocumentNode;
    Clone(): this;
    get Name(): string;
    set Name(value: string);
    get Tag(): any;
    set Tag(value: any);
    get FontFamily(): string;
    set FontFamily(value: string);
    get FontSize(): number;
    set FontSize(value: number);
    get FontWeight(): string | number;
    set FontWeight(value: string | number);
    get FontStyle(): string;
    set FontStyle(value: string);
    get FontStretch(): string;
    set FontStretch(value: string);
    get Foreground(): string;
    set Foreground(value: string);
    get Background(): string;
    set Background(value: string);
    get TextDecorations(): string | string[];
    set TextDecorations(value: string | string[]);
    get FlowDirection(): string;
    set FlowDirection(value: string);
    get Language(): string;
    set Language(value: string);
    static readonly FontFamilyProperty: DependencyProperty<any>;
    static readonly FontSizeProperty: DependencyProperty<number>;
    static readonly FontWeightProperty: DependencyProperty<string>;
    static readonly FontStyleProperty: DependencyProperty<string>;
    static readonly ForegroundProperty: DependencyProperty<any>;
    static readonly BackgroundProperty: DependencyProperty<string>;
    static readonly FontStretchProperty: DependencyProperty<string>;
    static readonly FlowDirectionProperty: DependencyProperty<string>;
    static readonly LanguageProperty: DependencyProperty<string>;
    static readonly TextDecorationsProperty: DependencyProperty<string | string[]>;
    static readonly NameProperty: DependencyProperty<string>;
    static readonly TagProperty: DependencyProperty<any>;
    static GetFontFamily(owner: DependencyObject): string;
    static SetFontFamily(owner: DependencyObject, value: string): void;
    static GetFontSize(owner: DependencyObject): number;
    static SetFontSize(owner: DependencyObject, value: number): void;
    static GetFontWeight(owner: DependencyObject): string | number;
    static SetFontWeight(owner: DependencyObject, value: string | number): void;
    static GetFontStyle(owner: DependencyObject): string;
    static SetFontStyle(owner: DependencyObject, value: string): void;
    static GetFontStretch(owner: DependencyObject): string;
    static SetFontStretch(owner: DependencyObject, value: string): void;
    static GetForeground(owner: DependencyObject): string;
    static SetForeground(owner: DependencyObject, value: string): void;
}
export declare class TextElementCollection<T extends TextElement> implements Iterable<T> {
    readonly Owner: TextElement;
    private accepts;
    private items;
    readonly CollectionChanged: EventDispatcher<CollectionChangedEvent<T>>;
    constructor(Owner: TextElement, accepts?: (item: TextElement) => boolean);
    get Count(): number;
    get length(): number;
    get FirstBlock(): T | null;
    get LastBlock(): T | null;
    get FirstInline(): T | null;
    get LastInline(): T | null;
    Get(index: number): T;
    at(index: number): T | undefined;
    private checkIndex;
    private validate;
    Add(item: T): number;
    AddRange(items: Iterable<T>): void;
    private dispatch;
    Insert(index: number, item: T): void;
    InsertBefore(sibling: T, item: T): void;
    InsertAfter(sibling: T, item: T): void;
    Set(index: number, item: T): void;
    Remove(item: T): boolean;
    RemoveAt(index: number): void;
    Clear(): void;
    Contains(item: T): boolean;
    IndexOf(item: T): number;
    ToArray(): T[];
    CopyTo(array: T[], index: number): void;
    [Symbol.iterator](): Iterator<T>;
}
export declare class Inline extends TextElement {
    constructor(type?: string);
    get BaselineAlignment(): string;
    set BaselineAlignment(value: string);
    get NextInline(): Inline | null;
    get PreviousInline(): Inline | null;
    static readonly BaselineAlignmentProperty: DependencyProperty<string>;
}
export declare class Block extends TextElement {
    constructor(type?: string);
    get Margin(): number | Thickness | Record<string, number>;
    set Margin(value: number | Thickness | Record<string, number>);
    get Padding(): number | Thickness | Record<string, number>;
    set Padding(value: number | Thickness | Record<string, number>);
    get TextAlignment(): string;
    set TextAlignment(value: string);
    get LineHeight(): number;
    set LineHeight(value: number);
    get BreakPageBefore(): boolean;
    set BreakPageBefore(value: boolean);
    get BreakColumnBefore(): boolean;
    set BreakColumnBefore(value: boolean);
    get KeepTogether(): boolean;
    set KeepTogether(value: boolean);
    get KeepWithNext(): boolean;
    set KeepWithNext(value: boolean);
    get NextBlock(): Block | null;
    get PreviousBlock(): Block | null;
    static readonly TextAlignmentProperty: DependencyProperty<string>;
    static readonly MarginProperty: DependencyProperty<number | Record<string, number> | Thickness>;
    static readonly PaddingProperty: DependencyProperty<number | Record<string, number> | Thickness>;
    static readonly LineHeightProperty: DependencyProperty<number>;
    get BorderThickness(): number | Thickness | Record<string, number>;
    set BorderThickness(value: number | Thickness | Record<string, number>);
    get BorderBrush(): string;
    set BorderBrush(value: string);
    get LineStackingStrategy(): string;
    set LineStackingStrategy(value: string);
    static readonly BreakPageBeforeProperty: DependencyProperty<boolean>;
    static readonly BreakColumnBeforeProperty: DependencyProperty<boolean>;
    static readonly KeepTogetherProperty: DependencyProperty<boolean>;
    static readonly KeepWithNextProperty: DependencyProperty<boolean>;
    static readonly LineStackingStrategyProperty: DependencyProperty<string>;
}
export declare class Run extends Inline {
    private text;
    constructor(text?: string);
    get Text(): string;
    set Text(value: string);
}
export type InlineInput = Inline | string | readonly (Inline | string)[];
export declare class Span extends Inline {
    readonly Inlines: TextElementCollection<Inline>;
    constructor(content?: InlineInput, type?: string);
}
export declare class Bold extends Span {
    constructor(content?: InlineInput);
}
export declare class Italic extends Span {
    constructor(content?: InlineInput);
}
export declare class Underline extends Span {
    constructor(content?: InlineInput);
}
export declare class Hyperlink extends Span {
    readonly RequestNavigate: EventDispatcher<{
        Uri: string;
        TargetName: string;
    }>;
    constructor(content?: InlineInput, navigateUri?: string);
    get NavigateUri(): string;
    set NavigateUri(value: string);
    get TargetName(): string;
    set TargetName(value: string);
    Navigate(): void;
}
export declare class LineBreak extends Inline {
    constructor();
}
export declare class Image extends Inline {
    constructor(source?: string, alternativeText?: string);
    get Source(): string;
    set Source(value: string);
    get AlternativeText(): string;
    set AlternativeText(value: string);
    get Width(): number | undefined;
    set Width(value: number | undefined);
    get Height(): number | undefined;
    set Height(value: number | undefined);
}
/** A mathematical expression occupies one atomic main-story position. */
export type EquationInputFormat = "latex" | "mathml";
export declare class Equation extends Inline {
    static readonly SourceProperty: DependencyProperty<string>;
    static readonly FormatProperty: DependencyProperty<string>;
    static readonly DisplayModeProperty: DependencyProperty<boolean>;
    constructor(source?: string, format?: EquationInputFormat, displayMode?: boolean);
    get Source(): string;
    set Source(value: string);
    get Format(): EquationInputFormat;
    set Format(value: EquationInputFormat);
    get DisplayMode(): boolean;
    set DisplayMode(value: boolean);
    get AlternativeText(): string;
    set AlternativeText(value: string);
}
export declare class InlineUIContainer extends Inline {
    constructor(child?: Image);
    get Child(): Image | null;
    set Child(value: Image | null);
}
export declare class BlockUIContainer extends Block {
    constructor(child?: Image);
    get Child(): Image | null;
    set Child(value: Image | null);
}
export declare class Paragraph extends Block {
    readonly Inlines: TextElementCollection<Inline>;
    constructor(content?: InlineInput);
    get HeadingLevel(): number;
    set HeadingLevel(value: number);
    get TextIndent(): number;
    set TextIndent(value: number);
    static readonly TextIndentProperty: DependencyProperty<number>;
    static readonly HeadingLevelProperty: DependencyProperty<number>;
}
export declare const FigureUnitType: {
    readonly Auto: "Auto";
    readonly Pixel: "Pixel";
    readonly Column: "Column";
    readonly Content: "Content";
    readonly Page: "Page";
};
export type FigureUnitTypeValue = (typeof FigureUnitType)[keyof typeof FigureUnitType];
export declare class FigureLength {
    readonly Value: number;
    readonly FigureUnitType: FigureUnitTypeValue;
    constructor(value?: number, unit?: FigureUnitTypeValue);
    static get Auto(): FigureLength;
    get IsAbsolute(): boolean;
    get IsAuto(): boolean;
    get IsColumn(): boolean;
    get IsContent(): boolean;
    get IsPage(): boolean;
    Equals(other: unknown): boolean;
    ToString(): string;
    toString(): string;
    toJSON(): {
        Value: number;
        FigureUnitType: FigureUnitTypeValue;
    };
    static Parse(text: string): FigureLength;
}
export declare const FigureHorizontalAnchor: {
    readonly PageLeft: "PageLeft";
    readonly PageCenter: "PageCenter";
    readonly PageRight: "PageRight";
    readonly ContentLeft: "ContentLeft";
    readonly ContentCenter: "ContentCenter";
    readonly ContentRight: "ContentRight";
    readonly ColumnLeft: "ColumnLeft";
    readonly ColumnCenter: "ColumnCenter";
    readonly ColumnRight: "ColumnRight";
};
export declare const FigureVerticalAnchor: {
    readonly PageTop: "PageTop";
    readonly PageCenter: "PageCenter";
    readonly PageBottom: "PageBottom";
    readonly ContentTop: "ContentTop";
    readonly ContentCenter: "ContentCenter";
    readonly ContentBottom: "ContentBottom";
    readonly ParagraphTop: "ParagraphTop";
};
export declare const WrapDirection: {
    readonly None: "None";
    readonly Left: "Left";
    readonly Right: "Right";
    readonly Both: "Both";
};
export declare const HorizontalAlignment: {
    readonly Left: "Left";
    readonly Center: "Center";
    readonly Right: "Right";
    readonly Stretch: "Stretch";
};
/** Floating content is an atomic main-story object; Blocks form an independently editable story. */
export declare abstract class AnchoredBlock extends Inline {
    readonly Blocks: TextElementCollection<Block>;
    constructor(content?: Block | readonly Block[], type?: string);
    get StoryText(): string;
    CreateStoryDocument(): FlowDocument;
    get Margin(): number | Thickness | Record<string, number>;
    set Margin(value: number | Thickness | Record<string, number>);
    get Padding(): number | Thickness | Record<string, number>;
    set Padding(value: number | Thickness | Record<string, number>);
    get BorderThickness(): number | Thickness | Record<string, number>;
    set BorderThickness(value: number | Thickness | Record<string, number>);
    get BorderBrush(): string;
    set BorderBrush(value: string);
    get TextAlignment(): string;
    set TextAlignment(value: string);
    get LineHeight(): number;
    set LineHeight(value: number);
    static readonly MarginProperty: DependencyProperty<number | Record<string, number> | Thickness>;
    static readonly PaddingProperty: DependencyProperty<number | Record<string, number> | Thickness>;
    static readonly TextAlignmentProperty: DependencyProperty<string>;
    static readonly LineHeightProperty: DependencyProperty<number>;
    static readonly BorderThicknessProperty: DependencyProperty<number | Record<string, number> | Thickness>;
    static readonly BorderBrushProperty: DependencyProperty<string>;
}
export declare class Figure extends AnchoredBlock {
    constructor(content?: Block | readonly Block[]);
    get Width(): number | FigureLength | {
        Value: number;
        FigureUnitType: FigureUnitTypeValue;
    };
    set Width(value: number | FigureLength | {
        Value: number;
        FigureUnitType: FigureUnitTypeValue;
    });
    get Height(): number | FigureLength | {
        Value: number;
        FigureUnitType: FigureUnitTypeValue;
    };
    set Height(value: number | FigureLength | {
        Value: number;
        FigureUnitType: FigureUnitTypeValue;
    });
    get HorizontalAnchor(): string;
    set HorizontalAnchor(value: string);
    get VerticalAnchor(): string;
    set VerticalAnchor(value: string);
    get HorizontalOffset(): number;
    set HorizontalOffset(value: number);
    get VerticalOffset(): number;
    set VerticalOffset(value: number);
    get WrapDirection(): string;
    set WrapDirection(value: string);
    get CanDelayPlacement(): boolean;
    set CanDelayPlacement(value: boolean);
    static readonly WidthProperty: DependencyProperty<any>;
    static readonly HeightProperty: DependencyProperty<any>;
    static readonly HorizontalAnchorProperty: DependencyProperty<string>;
    static readonly VerticalAnchorProperty: DependencyProperty<string>;
    static readonly HorizontalOffsetProperty: DependencyProperty<number>;
    static readonly VerticalOffsetProperty: DependencyProperty<number>;
    static readonly WrapDirectionProperty: DependencyProperty<string>;
    static readonly CanDelayPlacementProperty: DependencyProperty<boolean>;
}
export declare class Floater extends AnchoredBlock {
    constructor(content?: Block | readonly Block[]);
    get Width(): number | undefined;
    set Width(value: number | undefined);
    get HorizontalAlignment(): string;
    set HorizontalAlignment(value: string);
    static readonly WidthProperty: DependencyProperty<any>;
    static readonly HorizontalAlignmentProperty: DependencyProperty<string>;
}
export declare class Section extends Block {
    readonly Blocks: TextElementCollection<Block>;
    constructor(content?: Block | readonly Block[]);
}
export declare class List extends Block {
    readonly ListItems: TextElementCollection<ListItem>;
    constructor(content?: ListItem | readonly ListItem[]);
    get MarkerStyle(): string;
    set MarkerStyle(value: string);
    get StartIndex(): number;
    set StartIndex(value: number);
    get MarkerOffset(): number;
    set MarkerOffset(value: number);
}
export declare class ListItem extends TextElement {
    readonly Blocks: TextElementCollection<Block>;
    constructor(content?: Block | readonly Block[]);
}
export declare class TableColumn extends TextElement {
    constructor(width?: number | string);
    get Width(): number | string | undefined;
    set Width(value: number | string | undefined);
}
export declare class Table extends Block {
    readonly RowGroups: TextElementCollection<TableRowGroup>;
    readonly Columns: TextElementCollection<TableColumn>;
    constructor(content?: TableRowGroup | readonly TableRowGroup[]);
    get CellSpacing(): number;
    set CellSpacing(value: number);
    ToJSON(): DocumentNode;
}
export declare class TableRowGroup extends TextElement {
    readonly Rows: TextElementCollection<TableRow>;
    constructor(content?: TableRow | readonly TableRow[]);
}
export declare class TableRow extends TextElement {
    readonly Cells: TextElementCollection<TableCell>;
    constructor(content?: TableCell | readonly TableCell[]);
}
export declare class TableCell extends TextElement {
    readonly Blocks: TextElementCollection<Block>;
    constructor(content?: Block | readonly Block[]);
    get RowSpan(): number;
    set RowSpan(value: number);
    get ColumnSpan(): number;
    set ColumnSpan(value: number);
    get Padding(): number | Thickness | Record<string, number>;
    set Padding(value: number | Thickness | Record<string, number>);
    get BorderThickness(): number | Thickness | Record<string, number>;
    set BorderThickness(value: number | Thickness | Record<string, number>);
    get BorderBrush(): string;
    set BorderBrush(value: string);
}
export declare class FlowDocument extends TextElement {
    readonly Blocks: TextElementCollection<Block>;
    readonly Changed: EventDispatcher<DocumentChangedEvent>;
    private revision;
    private changeDepth;
    private pending;
    private dispatching;
    private symbolMap;
    private pointerDirty;
    private synchronizingPointers;
    private pointers;
    private pendingTextChanges;
    /** Exact pre-batch UTF-16 edits. Ranges are sorted, disjoint and expressed in the original document. */
    SetPendingTextChanges(changes: readonly TextChangeSpan[]): void;
    GetSymbolMap(): TextSymbolMap;
    get SymbolCount(): number;
    GetPositionAtSymbolOffset(offset: number, direction?: LogicalDirectionValue): TextPointer | null;
    /** @internal */ _trackPointer(pointer: TextPointer): WeakRef<TextPointer>;
    /** @internal */ _untrackPointer(reference: WeakRef<TextPointer>): void;
    /** @internal */ _syncPointers(): void;
    private elementIds;
    /** @internal */ _hasElementId(id: string): boolean;
    /** @internal */ _changeRootId(previous: string, next: string): void;
    /** @internal */ _registerSubtree(root: TextElement): void;
    /** @internal */ _unregisterSubtree(root: TextElement): void;
    constructor(content?: Block | readonly Block[]);
    get Revision(): number;
    get IsInChange(): boolean;
    get ContentStart(): TextPointer;
    get ContentEnd(): TextPointer;
    get PageWidth(): number;
    set PageWidth(value: number);
    get PageHeight(): number;
    set PageHeight(value: number);
    get PagePadding(): number | Thickness | Record<string, number>;
    set PagePadding(value: number | Thickness | Record<string, number>);
    get ColumnCount(): number;
    set ColumnCount(value: number);
    get ColumnGap(): number;
    set ColumnGap(value: number);
    get TextAlignment(): string;
    set TextAlignment(value: string);
    get LineHeight(): number;
    set LineHeight(value: number);
    get IsHyphenationEnabled(): boolean;
    set IsHyphenationEnabled(value: boolean);
    BeginChange(): void;
    EndChange(): void;
    Change(action: () => void): void;
    /** @internal */ _record(change: DocumentChange): void;
    private flush;
    ReplaceWith(other: FlowDocument): void;
    static FromJSON(node: DocumentNode | string): FlowDocument;
    FindName(name: string): TextElement | null;
    FindById(id: string): TextElement | null;
    get ColumnWidth(): number | undefined;
    set ColumnWidth(value: number | undefined);
    get IsOptimalParagraphEnabled(): boolean;
    set IsOptimalParagraphEnabled(value: boolean);
    get IsColumnWidthFlexible(): boolean;
    set IsColumnWidthFlexible(value: boolean);
    static readonly PageWidthProperty: DependencyProperty<number>;
    static readonly PageHeightProperty: DependencyProperty<number>;
    static readonly PagePaddingProperty: DependencyProperty<number | Record<string, number> | Thickness>;
    static readonly ColumnCountProperty: DependencyProperty<number>;
    static readonly ColumnGapProperty: DependencyProperty<number>;
    static readonly ColumnWidthProperty: DependencyProperty<number | undefined>;
    static readonly TextAlignmentProperty: DependencyProperty<string>;
    static readonly LineHeightProperty: DependencyProperty<number>;
    static readonly IsHyphenationEnabledProperty: DependencyProperty<boolean>;
    static readonly IsOptimalParagraphEnabledProperty: DependencyProperty<boolean>;
    static readonly IsColumnWidthFlexibleProperty: DependencyProperty<boolean>;
}
/** Depth-first traversal, including table columns. */
export declare function walkElements(root: TextElement): TextElement[];
export declare function getElementText(element: TextElement): string;
/** Context categories use WPF names; offsets remain explicitly separated from UTF-16 positions. */
export declare const TextPointerContext: {
    readonly None: "None";
    readonly Text: "Text";
    readonly EmbeddedElement: "EmbeddedElement";
    readonly ElementStart: "ElementStart";
    readonly ElementEnd: "ElementEnd";
};
export type TextPointerContextValue = (typeof TextPointerContext)[keyof typeof TextPointerContext];
export interface TextChangeSpan {
    Start: number;
    RemovedLength: number;
    InsertedLength: number;
}
export interface TextElementSymbolBounds {
    ElementStart: number;
    ContentStart: number;
    ContentEnd: number;
    ElementEnd: number;
}
export interface TextSymbolSegment {
    readonly Context: Exclude<TextPointerContextValue, "None">;
    readonly SymbolStart: number;
    readonly SymbolEnd: number;
    readonly TextStart: number;
    readonly TextEnd: number;
    readonly Element: TextElement;
    readonly Text: string;
}
/** Immutable structural index: tags count once, Run code units count once, embedded objects count once. */
export declare class TextSymbolMap {
    readonly Document: FlowDocument;
    readonly Text: string;
    readonly SymbolCount: number;
    readonly Segments: readonly TextSymbolSegment[];
    private records;
    private runs;
    private graphemes?;
    /** @internal */ _getGraphemeOffsets(): readonly number[];
    constructor(Document: FlowDocument);
    GetElementBounds(element: TextElement | string): Readonly<TextElementSymbolBounds> | null;
    GetTextOffset(symbolOffset: number): number;
    GetSymbolOffset(textOffset: number, direction?: LogicalDirectionValue): number;
    GetAdjacentSegment(symbolOffset: number, direction: LogicalDirectionValue): TextSymbolSegment | null;
    GetParent(symbolOffset: number): TextElement;
    GetParagraph(symbolOffset: number): Paragraph | null;
    /** @internal */ _getRun(id: string): TextSymbolSegment | undefined;
    /** @internal */ _validate(offset: number): void;
    private validateSymbolOffset;
}
export interface TextPointerOptions {
    TrackChanges?: boolean;
}
/** Live UTF-16 position with a separate WPF-style structural symbol coordinate. */
export declare class TextPointer {
    readonly Document: FlowDocument;
    readonly LogicalDirection: LogicalDirectionValue;
    private offset;
    private symbolOffset;
    private snapshotMap;
    private registration?;
    private edge?;
    constructor(document: FlowDocument, offset?: number, direction?: LogicalDirectionValue, options?: TextPointerOptions);
    static FromSymbolOffset(document: FlowDocument, symbolOffset: number, direction?: LogicalDirectionValue, options?: TextPointerOptions): TextPointer;
    /** @internal */ static _fromElementBoundary(document: FlowDocument, id: string, edge: keyof TextElementSymbolBounds, direction: LogicalDirectionValue): TextPointer;
    get Offset(): number;
    get SymbolOffset(): number;
    get IsLive(): boolean;
    get DocumentStart(): TextPointer;
    get DocumentEnd(): TextPointer;
    get Parent(): TextElement;
    get Paragraph(): Paragraph | null;
    private deriveAtSymbol;
    private deriveAtText;
    private get map();
    private synchronize;
    /** Stops tracking subsequent edits while retaining the current coordinates and structural snapshot. */
    Dispose(): void;
    CreateSnapshot(): TextPointer;
    /** @internal */ _rebase(previous: TextSymbolMap, next: TextSymbolMap, changes?: readonly TextChangeSpan[]): void;
    GetPositionAtOffset(offset: number, direction?: LogicalDirectionValue): TextPointer | null;
    GetPositionAtSymbolOffset(offset: number, direction?: LogicalDirectionValue): TextPointer | null;
    CompareTo(other: TextPointer): number;
    CompareSymbolTo(other: TextPointer): number;
    GetOffsetToPosition(other: TextPointer): number;
    GetSymbolOffsetToPosition(other: TextPointer): number;
    IsInSameDocument(other: TextPointer): boolean;
    GetPointerContext(direction: LogicalDirectionValue): TextPointerContextValue;
    GetAdjacentElement(direction: LogicalDirectionValue): TextElement | null;
    GetNextContextPosition(direction: LogicalDirectionValue): TextPointer | null;
    GetTextInRun(direction: LogicalDirectionValue): string;
    GetTextInRun(direction: LogicalDirectionValue, buffer: string[] | Uint16Array, startIndex: number, count: number): number;
    GetTextRunLength(direction: LogicalDirectionValue): number;
    GetPropertyValue<T = any>(property: string | DependencyProperty<T>): T;
    get IsAtInsertionPosition(): boolean;
    GetInsertionPosition(direction: LogicalDirectionValue): TextPointer | null;
    GetNextInsertionPosition(direction: LogicalDirectionValue): TextPointer | null;
    InsertTextInRun(text: string): void;
    DeleteTextInRun(count: number): number;
    private ensureDocument;
}
export interface DocumentParseOptions {
    MaxDepth?: number;
    MaxNodes?: number;
}
export declare function elementFromJSON(node: DocumentNode, options?: DocumentParseOptions): TextElement;
