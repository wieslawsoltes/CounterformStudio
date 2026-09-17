export interface Snapshot {id:string;[key:string]:unknown;}
export interface Revision<T=Snapshot> {sequence:number;time:number;label:string;data:T;}
export interface Recovery<T=Snapshot> {snapshots:Revision<T>[];issue:string|null;}
export interface JournalMetadata {id:string;time:number;count:number;bytes:number;}
export interface JournalBackend {read(id:string):Promise<any>;list():Promise<JournalMetadata[]>;compareAndSwap(id:string,expected:string|null,next:any):Promise<void>;close():void;}
export declare class JournalConflictError extends Error {}
export declare class JournalCorruptionError extends Error {}
export declare class MemoryJournalBackend implements JournalBackend {streams:Map<string,any>;read(id:string):Promise<any>;list():Promise<JournalMetadata[]>;compareAndSwap(id:string,expected:string|null,next:any):Promise<void>;close():void;}
export declare class IndexedDBJournalBackend implements JournalBackend {constructor(options?:{name?:string});read(id:string):Promise<any>;list():Promise<JournalMetadata[]>;compareAndSwap(id:string,expected:string|null,next:any):Promise<void>;close():void;}
export declare function verifyJournal<T=Snapshot>(stream:any):Promise<Recovery<T>>;
export declare class RevisionJournal {
 constructor(backend?:JournalBackend,options?:{maxBytes?:number;maxSnapshotBytes?:number;maxRecords?:number});
 append(data:{id:string},options?:{label?:string;time?:number}):Promise<number>;
 recover<T=Snapshot>(id:string):Promise<Recovery<T>>;list():Promise<JournalMetadata[]>;flush():Promise<void>;close():Promise<void>;
}
