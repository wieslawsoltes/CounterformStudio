/** Optional .NET-style value equality. Hashes must remain stable while used as keys. */
export interface EquatableValue<T = unknown> { Equals(other: T): boolean; GetHashCode?(): unknown; }
/** SameValueZero for primitives/references, or the left operand's explicit Equals method. */
export declare function valueEquals(left: unknown, right: unknown): boolean;
/** Native Map API with explicit Equals/GetHashCode key canonicalization. */
export declare class EqualityMap<TKey = any, TValue = any> extends Map<TKey, TValue> {
  constructor(entries?: Iterable<readonly [TKey, TValue]> | null);
  has(key: TKey): boolean;
  get(key: TKey): TValue | undefined;
  set(key: TKey, value: TValue): this;
  delete(key: TKey): boolean;
  clear(): void;
  forEach(callback: (value: TValue, key: TKey, map: EqualityMap<TKey, TValue>) => void, thisArg?: any): void;
}
/** Structural set-like protocol accepted by Set composition methods. */
export interface EqualitySetLike<T> { readonly size: number; has(value: T): boolean; keys(): Iterator<T>; }
/** Native Set API with the same explicit value-equality rules as EqualityMap. */
export declare class EqualitySet<TValue = any> extends Set<TValue> {
  constructor(values?: Iterable<TValue> | null);
  add(value: TValue): this;
  has(value: TValue): boolean;
  delete(value: TValue): boolean;
  clear(): void;
  forEach(callback: (value: TValue, valueAgain: TValue, set: EqualitySet<TValue>) => void, thisArg?: any): void;
  union<TOther>(other: EqualitySetLike<TOther>): EqualitySet<TValue | TOther>;
  intersection<TOther>(other: EqualitySetLike<TOther>): EqualitySet<TValue & TOther>;
  difference<TOther>(other: EqualitySetLike<TOther>): EqualitySet<TValue>;
  symmetricDifference<TOther>(other: EqualitySetLike<TOther>): EqualitySet<TValue | TOther>;
  isSubsetOf<TOther>(other: EqualitySetLike<TOther>): boolean;
  isSupersetOf<TOther>(other: EqualitySetLike<TOther>): boolean;
  isDisjointFrom<TOther>(other: EqualitySetLike<TOther>): boolean;
}
