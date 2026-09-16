export function encodePlist(value: any): string;
/** Small bounded XML reader for plist/GLIF, deliberately rejects DTDs and external entities. */
export function parseXML(text: any): any;
export function decodePlist(text: any): any;
export function glyphToGLIF(g: any, l: any, doc: any): string;
export function glifToGlyph(text: any, masterId: any): {
    id: string;
    name: any;
    unicodes: any[];
    category: string;
    mark: string;
    export: boolean;
    note: string;
    layers: {
        id: string;
        masterId: any;
        name: string;
        contours: any[];
        components: any[];
        anchors: any[];
        guides: any[];
        color: string;
        visible: boolean;
        locked: boolean;
        advanceWidth: number;
    }[];
};
/** Deterministic stored ZIP, UTF-8 names, CRC-32 and bounded reader. */
export function encodeZip(files: any): Uint8Array<ArrayBuffer>;
export function decodeZip(input: any): Promise<{}>;
export function exportUFO(doc: any, { masterId, allMasters }?: {
    masterId?: any;
    allMasters?: boolean;
}): Uint8Array<ArrayBuffer>;
export function importUFO(bytes: any): Promise<FontDocument>;
import { FontDocument } from '@wieslawsoltes/counterform-model';
