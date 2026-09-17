export interface CommandDefinition {label:string;checked?:()=>boolean}
export interface MenuRegistry {commands:Map<string,CommandDefinition>;bindings:Map<string,string[]>;canExecute(id:string):boolean;run(id:string):unknown;changed?:{subscribe(listener:()=>void):()=>void}}
export interface MenuDefinition {label:string;items:(string|null)[]}
export declare class CommandMenus {
 constructor(host:HTMLElement,registry:MenuRegistry,menus:MenuDefinition[],options?:{icon?:(id:string,document:Document)=>Element|null;formatKey?:(key:string)=>string;onError?:(error:Error)=>void});
 open(index:number,last?:boolean):void;openContext(items:(string|null)[],x:number,y:number,returnFocus?:Element|null):void;
 close(restore?:boolean):void;refresh():void;dispose():void;
}
