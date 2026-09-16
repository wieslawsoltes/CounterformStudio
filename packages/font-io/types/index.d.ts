export function readNames(bytes: any): Map<any, any>;
export function readCmap(bytes: any): Map<any, any>;
export function nameTable(info: any, extra?: any[]): Uint8Array<ArrayBuffer>;
export function exportGlyphOrder(doc: any): any;
export function encodeGlyf(contours: any, width: any): {
    bytes: Uint8Array<ArrayBuffer>;
    metrics: {
        width: any;
        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
        points: any;
        contours: any;
    };
};
export function compileTrueType(doc: any, { masterId, tolerance, quadraticContours, extraTables, extraNames }?: {
    masterId?: any;
    tolerance?: number;
    quadraticContours?: any;
    extraTables?: any;
    extraNames?: any[];
}): Uint8Array<ArrayBuffer>;
export function compileOpenTypeCFF(doc: any, { masterId }?: {
    masterId?: any;
}): Uint8Array<ArrayBuffer>;
/** Convert sfnt to an uncompressed WOFF1 container. Deterministic, lossless table wrapping. */
export function encodeWOFF(bytes: any): Uint8Array<ArrayBuffer>;
export function decodeWOFF(bytes: any, maxBytes?: number): Promise<Uint8Array<ArrayBuffer>>;
export function inspectFont(bytes: any): {
    format: string;
    tables: {
        tag: any;
        length: any;
        checksum: any;
        validChecksum: boolean;
    }[];
    names: any;
};
/** Bounded TrueType importer retains composite relationships and exact quadratic shapes as cubics. */
export function parseTrueType(bytes: any, { maxGlyphs, maxPoints }?: {
    maxGlyphs?: number;
    maxPoints?: number;
}): FontDocument;
/** Native Skia import of CFF/WOFF2/other supported containers. Uses only public SK* APIs. */
export function importWithSkia(bytes: any, S: any, { signal, onProgress }?: {
    onProgress?: () => void;
}): Promise<FontDocument>;
export function importFont(bytes: any, { skia, ...options }?: {}): Promise<FontDocument>;
import { FontDocument } from '@wieslawsoltes/counterform-model';
