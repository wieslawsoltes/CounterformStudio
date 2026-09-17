/** Static COLRv1 authoring model. Coordinates are font units; angles are CCW degrees. */
export type ExtendMode = 'pad' | 'repeat' | 'reflect';
export type CompositeMode = 'clear'|'src'|'dest'|'src_over'|'dest_over'|'src_in'|'dest_in'|'src_out'|'dest_out'|'src_atop'|'dest_atop'|'xor'|'plus'|'screen'|'overlay'|'darken'|'lighten'|'color_dodge'|'color_burn'|'hard_light'|'soft_light'|'difference'|'exclusion'|'multiply'|'hsl_hue'|'hsl_saturation'|'hsl_color'|'hsl_luminosity';
export interface ColorStop {offset:number;paletteIndex:number;alpha?:number;}
export interface ColorLine {extend?:ExtendMode;stops:ColorStop[];}
export type Paint =
 | {type:'layers';layers:Paint[]}
 | {type:'solid';paletteIndex:number;alpha?:number}
 | ({type:'linear';x0:number;y0:number;x1:number;y1:number;x2:number;y2:number}&ColorLine)
 | ({type:'radial';x0:number;y0:number;r0:number;x1:number;y1:number;r1:number}&ColorLine)
 | ({type:'sweep';centerX:number;centerY:number;startAngle:number;endAngle:number}&ColorLine)
 | {type:'glyph';glyphId:string;paint:Paint}
 | {type:'colrGlyph';glyphId:string}
 | {type:'transform';matrix:[number,number,number,number,number,number];paint:Paint}
 | {type:'translate';dx:number;dy:number;paint:Paint}
 | {type:'scale';scaleX:number;scaleY:number;paint:Paint}
 | {type:'scaleAroundCenter';scaleX:number;scaleY:number;centerX:number;centerY:number;paint:Paint}
 | {type:'scaleUniform';scale:number;paint:Paint}
 | {type:'scaleUniformAroundCenter';scale:number;centerX:number;centerY:number;paint:Paint}
 | {type:'rotate';angle:number;paint:Paint}
 | {type:'rotateAroundCenter';angle:number;centerX:number;centerY:number;paint:Paint}
 | {type:'skew';xSkewAngle:number;ySkewAngle:number;paint:Paint}
 | {type:'skewAroundCenter';xSkewAngle:number;ySkewAngle:number;centerX:number;centerY:number;paint:Paint}
 | {type:'composite';source:Paint;backdrop:Paint;mode:CompositeMode};
export interface ColorPaintGlyph {id:string;export?:boolean;colorPaint?:Paint;colorClip?:[number,number,number,number];}
export interface ColorPaintSource {glyphs:ColorPaintGlyph[];palettes?:string[][];}
export interface PaintBudgets {maxNodes?:number;maxDepth?:number;maxStops?:number;maxBytes?:number;}
export declare const paintTypes:readonly Paint['type'][];
export declare const compositeModes:readonly CompositeMode[];
export declare const extendModes:readonly ExtendMode[];
export declare function paintChildren(p:Paint):Paint[];
export declare function validatePaintSource(source:ColorPaintSource,options?:PaintBudgets):{nodes:number;stops:number};
export declare function compileCOLRv1(source:ColorPaintSource,glyphOrder:ColorPaintGlyph[],options?:{legacyCOLR?:Uint8Array|null}):Uint8Array|null;
export declare function readCOLRv1(bytes:Uint8Array,glyphOrder:ColorPaintGlyph[],options?:{paletteEntries?:number}):{colorPaints:Map<string,Paint>;colorClips:Map<string,[number,number,number,number]>};
export declare function paintReferences(p?:Paint):Set<string>;
