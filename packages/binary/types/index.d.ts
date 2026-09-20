export function checksum(bytes: any): number;
export function sfnt(tables: any, flavor?: number): Uint8Array<ArrayBuffer>;
export function readDirectory(bytes: any, index?: number): {
    tables: Map<any, any>;
    flavor: number;
    base: number;
};
export function decodeUTF16BE(b: any): string;
export function crc32(bytes: any): number;
/** Bounded, big-endian sfnt primitives. Every read validates its range. */
export class Reader {
    constructor(data: any, offset: number, length: any);
    bytes: Uint8Array<any>;
    view: DataView<any>;
    pos: number;
    need(n: any, p?: number): void;
    seek(p: any): this;
    skip(n: any): this;
    u8(): number;
    i8(): number;
    u16(): number;
    i16(): number;
    u32(): number;
    i32(): number;
    fixed(): number;
    f2dot14(): number;
    tag(): string;
    slice(offset: any, length: any): Reader;
    take(n: any): Uint8Array<ArrayBuffer>;
}
export class Writer {
    constructor(capacity?: number);
    bytes: Uint8Array<ArrayBuffer>;
    view: DataView<ArrayBuffer>;
    pos: number;
    reserve(n: any): this;
    u8(n: any): this;
    i8(n: any): this;
    u16(n: any): this;
    i16(n: any): this;
    u32(n: any): this;
    i32(n: any): this;
    fixed(n: any): this;
    f2dot14(n: any): this;
    tag(t: any): this;
    raw(b: any): this;
    zeros(n: any): this;
    align(n?: number): this;
    patch16(p: any, n: any): this;
    patch32(p: any, n: any): this;
    finish(): Uint8Array<ArrayBuffer>;
}
export function utf16be(s: any): Uint8Array<ArrayBuffer>;

export interface CollectionTable {tag:string;checksum:number;offset:number;length:number;bytes:Uint8Array}
export interface CollectionFace {flavor:number;offset:number;directoryLength:number;tables:CollectionTable[]}
export interface FontCollection {version:1|2;faces:CollectionFace[];signature:{offset:number;length:number}|null;byteLength:number}
/** Bounded TTC/OTC v1/v2; returned table buffers are non-owning views. */
export function readCollection(input:Uint8Array,options?:{verifyChecksums?:boolean}):FontCollection;
/** Deterministic table sharing retains glyph indices and drops invalidated signatures. */
export function encodeCollection(fonts:Uint8Array[],options?:{version?:1|2;shareTables?:boolean}):Uint8Array;
export function extractCollectionFace(input:Uint8Array,index?:number):Uint8Array;

export function extractCollectionFaces(input:Uint8Array):Uint8Array[];
/** null selects the normal Unicode cmap; zero is an explicit .notdef mapping. */
export interface UVSMapping {unicode:number;selector:number;glyphIndex:number|null;}
export function isVariationSelector(codePoint:number):boolean;
export function encodeUVS(records:readonly UVSMapping[]):Uint8Array;
export function decodeUVS(bytes:Uint8Array,options?:{maxEntries?:number;glyphCount?:number}):UVSMapping[];
export function readCmapUVS(cmap:Uint8Array,options?:{maxEntries?:number;glyphCount?:number}):UVSMapping[];
