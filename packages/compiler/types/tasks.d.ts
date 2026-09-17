import type {FontSource} from '@wieslawsoltes/counterform-model';
export declare function executeTask(kind:string,source:FontSource,options?:object,progress?:(value:{stage:string;fraction:number})=>void):any;
export declare function handleTask(message:unknown,send:(message:unknown,transfer?:ArrayBuffer[])=>void):void;
