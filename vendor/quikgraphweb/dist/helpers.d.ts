import { valueEquals as equals } from './equality.js';
/** Cryptographically secure random source; the seed is intentionally ignored. */
export declare class CryptoRandom {
    _buffer: Uint32Array<ArrayBuffer>;
    constructor(_ignoredSeed: any);
    _uint(): number;
    Next(minValue: any, maxValue: any): any;
    NextDouble(): number;
    NextBytes(buffer: any): void;
}
/** Graph equality with .NET-shaped comparer objects or JavaScript predicates. */
export declare const EquateGraphs: Readonly<{
    Equate(left: any, right: any, vertexEquality?: typeof equals, edgeEquality?: typeof equals): boolean;
}>;
export declare const EnumerableHelpers: Readonly<{
    ForEach(values: any, action: any): void;
}>;
export declare const HashCodeHelpers: Readonly<{
    Combine(...values: any[]): number;
}>;
export declare const QuikGraphHelpers: Readonly<{
    ToTryFunc(fn: any): (value: any) => any;
}>;
