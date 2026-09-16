import { EqualityMap as Map } from './equality.js';
/** High-level Petri net semantics ported from QuikGraph.Petri. */
import { BidirectionalGraph, Edge } from './core.js';
/** Array with the upstream IList vocabulary; ordinary push/splice iteration also works. */
export declare class TokenList extends Array {
    static get [Symbol.species](): ArrayConstructor;
    get Count(): number;
    Add(v: any): void;
    AddRange(values: any): void;
    Clear(): void;
    Remove(value: any): boolean;
    Contains(v: any): boolean;
    IndexOf(v: any): number;
    get IsReadOnly(): boolean;
    Insert(index: any, value: any): void;
    RemoveAt(index: any): void;
    CopyTo(array: any, index?: number): void;
}
export declare class IdentityExpression {
    Evaluate(markings: any): any;
}
export declare class AlwaysTrueConditionExpression {
    IsEnabled(): boolean;
}
export declare class Place {
    Name: any;
    Marking: TokenList;
    constructor(name: any);
    ToString(): string;
    toString(): string;
    ToStringWithMarking(): string;
}
export declare class Transition {
    Name: any;
    _condition: any;
    constructor(name: any);
    get Condition(): any;
    set Condition(v: any);
    ToString(): string;
    toString(): string;
}
export declare class Arc extends Edge {
    Place: any;
    Transition: any;
    IsInputArc: boolean;
    _annotation: any;
    constructor(first: any, second: any);
    get Annotation(): any;
    set Annotation(v: any);
    ToString(): string;
    toString(): string;
}
export declare class PetriGraph extends BidirectionalGraph {
    constructor();
}
export declare class PetriNet {
    _places: any[];
    _transitions: any[];
    _arcs: any[];
    Graph: PetriGraph;
    constructor();
    get Places(): ArrayIterator<any>;
    get Transitions(): ArrayIterator<any>;
    get Arcs(): ArrayIterator<any>;
    AddPlace(name: any): Place;
    AddTransition(name: any): Transition;
    AddArc(first: any, second: any): Arc;
    Clone(): PetriNet;
    ToString(): string;
    toString(): string;
}
/** Synchronous four-phase execution, including upstream shared-input conflict semantics. */
export declare class PetriNetSimulator {
    Net: any;
    _buffers: Map;
    constructor(net: any);
    Initialize(): void;
    SimulateStep(): void;
}
