export type Support = Record<string,[number,number,number]>;
export type Axis = string | {tag:string};
export function encodeItemVariationStore(axes:Axis[],supports:Support[],dataSets?:{items:number[][];regionIndexes?:number[]}[]):Uint8Array;
export function encodeDeltaSetIndexMap(count:number,outerIndex?:number):Uint8Array;
export interface VariationIndex {outer:number;inner:number}
export class VariationStoreBuilder {
 constructor(axes:Axis[],supports:Support[]);readonly rows:number[][];
 add(deltas:number[]):VariationIndex|null;encode():Uint8Array;
}
export function variationIndex(index:VariationIndex):Uint8Array;

/** Normalized, binary-representable avar 1.0 pairs. Input order is validated, not silently sorted. */
export function normalizeAxisMap(map?: readonly (readonly [number,number])[] | null): [number,number][];
export function mapAxisCoordinate(value: number, map?: readonly (readonly [number,number])[] | null): number;
export function encodeAvar(axes: readonly {map?: readonly (readonly [number,number])[]}[]): Uint8Array | null;
export function decodeAvar(bytes: Uint8Array, axisCount?: number | null): [number,number][][];
