/** A .NET-style resource lifetime. All built-in disposables also support RxJS unsubscribe. */
export interface IDisposable {
    Dispose(): void;
}
export type DisposableLike = IDisposable | {
    unsubscribe(): void;
} | (() => void) | null | undefined;
/** Dispose either a .NET-style resource, an RxJS subscription, or a teardown callback. */
export declare function dispose(resource: DisposableLike): void;
export declare class Disposable implements IDisposable {
    private action;
    private disposed;
    constructor(action?: () => void);
    static Create(action: () => void): Disposable;
    static create(action: () => void): Disposable;
    static readonly Empty: Readonly<{
        Dispose(): void;
        unsubscribe(): void;
        IsDisposed: false;
        closed: false;
    }>;
    get IsDisposed(): boolean;
    get closed(): boolean;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
export declare class CompositeDisposable implements IDisposable, Iterable<DisposableLike> {
    private items;
    private disposed;
    constructor(...resources: (DisposableLike | readonly DisposableLike[])[]);
    get Count(): number;
    get IsDisposed(): boolean;
    get closed(): boolean;
    Add<T extends DisposableLike>(resource: T): T;
    add<T extends DisposableLike>(resource: T): T;
    Remove(resource: DisposableLike): boolean;
    remove(resource: DisposableLike): boolean;
    Contains(resource: DisposableLike): boolean;
    Clear(): void;
    clear(): void;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
    [Symbol.iterator](): Iterator<DisposableLike>;
}
export declare class SerialDisposable implements IDisposable {
    private current;
    private disposed;
    get Disposable(): DisposableLike;
    set Disposable(value: DisposableLike);
    get disposable(): DisposableLike;
    set disposable(value: DisposableLike);
    get IsDisposed(): boolean;
    get closed(): boolean;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
export declare class SingleAssignmentDisposable implements IDisposable {
    private current;
    private assigned;
    private disposed;
    get Disposable(): DisposableLike;
    set Disposable(value: DisposableLike);
    get disposable(): DisposableLike;
    set disposable(value: DisposableLike);
    get IsDisposed(): boolean;
    get closed(): boolean;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
/** Releases the underlying resource once its owner and every acquired lease are disposed. */
export declare class RefCountDisposable implements IDisposable {
    private resource;
    private ownerDisposed;
    private disposed;
    private count;
    constructor(resource: DisposableLike);
    get IsDisposed(): boolean;
    get closed(): boolean;
    GetDisposable(): IDisposable & {
        unsubscribe(): void;
    };
    getDisposable(): IDisposable & {
        unsubscribe(): void;
    };
    private tryDispose;
    Dispose(): void;
    unsubscribe(): void;
    dispose(): void;
}
export declare function DisposeWith<T extends DisposableLike>(resource: T, target: {
    Add(resource: DisposableLike): unknown;
} | {
    add(resource: DisposableLike): unknown;
}): T;
export declare const disposeWith: typeof DisposeWith;
//# sourceMappingURL=disposables.d.ts.map