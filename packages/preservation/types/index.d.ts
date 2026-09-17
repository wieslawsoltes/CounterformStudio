export interface OriginalFontArchive {format:1;filename:string;bytes:string;sha256:string;sourceSha256:string;structureSha256:string;info:Record<string,unknown>;}
export declare function captureOriginal(bytes:Uint8Array,source:{info:object},options?:{filename?:string}):Promise<OriginalFontArchive>;
export declare function restoreOriginal(archive:OriginalFontArchive):Promise<Uint8Array>;
export declare function preservationStatus(archive:OriginalFontArchive,source:{info:object}):Promise<{unchanged:boolean;metadataOnly:boolean}>;
export declare function rewriteNames(bytes:Uint8Array,replacements:Map<number,string>):Uint8Array;
export declare function exportMetadataOnly(archive:OriginalFontArchive,source:{info:object}):Promise<{bytes:Uint8Array;warnings:string[]}>;
