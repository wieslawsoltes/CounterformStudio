import { EqualityMap as Map } from './equality.js';
import { defaultCompare } from './core.js';
export declare const HeapDirection: Readonly<{
    Increasing: 0;
    Decreasing: 1;
}>;
export declare const HeapConstants: Readonly<{
    Consistent: "Is_Consistent";
    NotConsistent: "Is_NOT_Consistent";
}>;
declare class List extends Array {
    Capacity: number;
    constructor(items?: any[]);
    static get [Symbol.species](): ArrayConstructor;
    get Count(): number;
    Add(value: any): void;
    AddRange(values: any): void;
    Contains(value: any): boolean;
    IndexOf(value: any): number;
    Remove(value: any): boolean;
    RemoveAt(i: any): void;
    RemoveAll(predicate: any): number;
    Clear(): void;
    ToArray(): any[];
    TrimExcess(): void;
    Clone(): any;
}
export declare class VertexList extends List {
}
export declare class EdgeList extends List {
}
declare class Dictionary extends Map {
    constructor(input: any);
    get Count(): number;
    get Keys(): any[];
    get Values(): any[];
    Add(key: any, value: any): void;
    ContainsKey(key: any): boolean;
    Remove(key: any): boolean;
    TryGetValue(key: any): any;
    Clear(): void;
    Clone(): any;
}
export declare class VertexEdgeDictionary extends Dictionary {
    Clone(): VertexEdgeDictionary;
}
export declare class EdgeEdgeDictionary extends Dictionary {
}
/** FIFO ring queue with amortized O(1) enqueue and dequeue. */
export declare class Queue {
    _a: any[];
    _head: number;
    constructor(items?: any[]);
    get Count(): number;
    Enqueue(v: any): void;
    Dequeue(): any;
    Peek(): any;
    Contains(v: any): boolean;
    Clear(): void;
    ToArray(): any[];
    [Symbol.iterator](): ArrayIterator<any>;
}
/** Binary min-heap. Duplicate values retain upstream first-match update semantics. */
export declare class BinaryHeap {
    Capacity: number;
    PriorityComparison: any;
    _items: any[];
    _version: number;
    constructor(capacity?: number, priorityComparison?: typeof defaultCompare);
    get Count(): number;
    _less(i: any, j: any): boolean;
    _swap(i: any, j: any): void;
    _up(i: any): void;
    _down(i: any): void;
    Add(priority: any, value: any): void;
    Minimum(): any;
    RemoveMinimum(): any;
    IndexOf(value: any): number;
    Update(priority: any, value: any): void;
    MinimumUpdate(priority: any, value: any): boolean;
    ToArray(): any[];
    ToPairsArray(): any[];
    [Symbol.iterator](): Generator<any, void, unknown>;
    IsConsistent(): boolean;
    _entry(i: any): string;
    ToString2(): string;
    ToStringTree(): "Is_Consistent" | "Is_NOT_Consistent";
}
export declare class BinaryQueue {
    _distance: any;
    _heap: BinaryHeap;
    constructor(distanceFunc: any, distanceComparison?: typeof defaultCompare);
    get Count(): number;
    Contains(value: any): boolean;
    Enqueue(value: any): void;
    Dequeue(): any;
    Peek(): any;
    Update(value: any): void;
    ToArray(): any[];
    ToPairsArray(): any[];
    ToString2(): string;
}
export declare class ForestDisjointSet {
    _elements: Map;
    SetCount: number;
    constructor(capacity?: number);
    get ElementCount(): number;
    Contains(v: any): boolean;
    MakeSet(v: any): void;
    _find(v: any): any;
    FindSet(v: any): any;
    AreInSameSet(a: any, b: any): boolean;
    Union(a: any, b: any): boolean;
}
export declare class FibonacciHeapLinkedList {
    First: any;
    _last: any;
    constructor();
    AddLast(cell: any): void;
    Remove(cell: any): void;
    MergeLists(list: any): void;
    [Symbol.iterator](): Generator<any, void, unknown>;
}
export declare class FibonacciHeapCell {
    Priority: any;
    Value: any;
    Marked: boolean;
    Degree: number;
    Removed: boolean;
    Parent: any;
    Children: FibonacciHeapLinkedList;
    Previous: any;
    Next: any;
    constructor(priority: any, value: any);
    ToKeyValuePair(): {
        Key: any;
        Value: any;
    };
}
/** Fibonacci heap with O(1) amortized insert/decrease-key and O(log n) delete-min. */
export declare class FibonacciHeap {
    Direction: 0;
    PriorityComparison: any;
    _roots: FibonacciHeapLinkedList;
    _top: any;
    Count: number;
    _owner: {
        parent: null;
    };
    constructor(direction?: 0, priorityComparison?: typeof defaultCompare);
    get IsEmpty(): boolean;
    get Top(): any;
    _compare(a: any, b: any): number;
    _ownerRoot(o: any): any;
    _check(c: any): void;
    Enqueue(priority: any, value: any): FibonacciHeapCell;
    _cut(c: any, p: any): void;
    _cascade(c: any): void;
    ChangeKey(c: any, priority: any): void;
    Delete(c: any): void;
    Dequeue(): any;
    _consolidate(): void;
    Merge(heap: any): void;
    [Symbol.iterator](): Generator<any, void, unknown>;
    GetDestructiveEnumerator(): Generator<any, void, unknown>;
    DrawHeap(): string;
}
export declare class FibonacciQueue {
    _distance: any;
    _heap: FibonacciHeap;
    _cells: Map;
    constructor(...args: any[]);
    get Count(): number;
    Contains(v: any): boolean;
    Enqueue(v: any): void;
    Dequeue(): any;
    Peek(): any;
    Update(v: any): void;
    ToArray(): any[];
}
/** Chazelle soft heap. Returned priorities may be corrupted within ErrorRate's bound. */
export declare class SoftHeap {
    KeyMaxValue: any;
    KeyComparison: any;
    ErrorRate: any;
    MinRank: number;
    Count: number;
    _header: {};
    _tail: {
        Rank: number;
        Prev: {};
    };
    constructor(maximumErrorRate: any, keyMaxValue: any, comparison?: typeof defaultCompare);
    Add(key: any, value: any): void;
    _meld(node: any): void;
    _fixMin(head: any): void;
    _shift(v: any): any;
    RemoveMinimum(): {
        Key: any;
        Value: any;
    };
    [Symbol.iterator](): Generator<never, void, unknown>;
}
export {};
