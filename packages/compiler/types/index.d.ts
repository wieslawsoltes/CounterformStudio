import type { FontDocument, FontSource } from '@wieslawsoltes/counterform-model';
export interface RequestOptions {signal?:AbortSignal;key?:string|null;priority?:number;timeout?:number;}
export interface CompileOptions {format?:'ttf'|'otf'|'woff'|'variable'|'ufoz';masterId?:string;validate?:boolean;}
export interface CompileResult {bytes:Uint8Array;format:string;mime:string;}
export interface CompilerOptions {workerURL?:string|URL;workerFactory?:()=>any;inline?:boolean;maxQueue?:number;timeout?:number;onProgress?:(value:{id:number;key:string|null;stage:string;fraction:number})=>void;}
export declare class CompilerClient {
 constructor(options?:CompilerOptions); readonly backend:string; readonly disposed:boolean;
 run(kind:'compile'|'validate'|'inspect',source:FontSource|FontDocument,options?:object,request?:RequestOptions):Promise<any>;
 compile(source:FontSource|FontDocument,options?:CompileOptions,request?:RequestOptions):Promise<CompileResult>;
 validate(source:FontSource|FontDocument,options?:object,request?:RequestOptions):Promise<{issues:any[]}>;
 inspect(source:FontSource|FontDocument,options?:CompileOptions,request?:RequestOptions):Promise<{report:any;byteLength:number}>;
 cancelKey(key:string):void; dispose():void;
}
