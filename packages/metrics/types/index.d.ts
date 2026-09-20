import type {FontDocument,Layer} from '@wieslawsoltes/counterform-model';
export interface MetricsToken {glyphId:string|null;name:string;start:number;end:number;missing:boolean}
export interface MetricsItem extends MetricsToken {index:number;x:number;advanceWidth:number;lsb:number;rsb:number;width:number;kernBefore:number}
export interface MetricsLayout {items:MetricsItem[];advanceWidth:number;missing:MetricsItem[]}
export type MetricProperty='lsb'|'rsb'|'advanceWidth';
export type MetricReference=MetricProperty|'width';
export type MetricNode={type:'number';value:number}|{type:'reference';metric:MetricReference;glyph:string}|{type:'unary';op:'+'|'-';value:MetricNode}|{type:'binary';op:'+'|'-'|'*'|'/';left:MetricNode;right:MetricNode};
export interface MetricExpression {ast:MetricNode;references:{glyph:string;metric:MetricReference}[]}
export interface MetricEdit {glyphId:string;lsb?:number|string;rsb?:number|string;advanceWidth?:number|string}
export interface MetricPlan {documentId:string;revision:number;masterId:string;assignments:{glyphId:string;layer:Layer}[]}
export function parseMetricsText(text:string,doc:FontDocument):MetricsToken[];
export function layoutMetrics(doc:FontDocument,masterId:string,text:string,options?:{kerning?:boolean;tracking?:number}):MetricsLayout;
export function parseMetricExpression(source:string|number,property?:MetricProperty):MetricExpression;
export function evaluateMetricExpression(expression:MetricExpression,resolve:(glyph:string,metric:MetricReference)=>number):number;
export function planMetricEdits(doc:FontDocument,masterId:string,edits:MetricEdit[]):MetricPlan;
export function applyMetricPlan(doc:FontDocument,plan:MetricPlan):void;
export function setKerningException(doc:FontDocument,masterId:string,left:string,right:string,value:number|null):void;
