import {createDemoFont,type FontSource} from '@wieslawsoltes/counterform-model';
import {compileCOLRv1,readCOLRv1,paintReferences,type Paint,type CompositeMode} from '@wieslawsoltes/counterform-colrv1';
import {createPaletteNamePlan,compileColorTables,readColorTables} from '@wieslawsoltes/counterform-color';
const doc=createDemoFont(),source:FontSource=doc.data,g=source.glyphs[0];
const paint:Paint={type:'glyph',glyphId:g.id,paint:{type:'sweep',centerX:300,centerY:350,startAngle:0,endAngle:360,extend:'reflect',stops:[{offset:0,paletteIndex:0},{offset:1,paletteIndex:1,alpha:.5}]}};
g.colorPaint=paint;g.colorClip=[0,0,700,800];source.paletteLabels=['Day'];
const plan=createPaletteNamePlan(source,[[256,'Weight']]);
const tables=compileColorTables(source,source.glyphs,{namePlan:plan});
const restored=readColorTables(tables.get('COLR')!,tables.get('CPAL')!,source.glyphs,{names:new Map(plan.names)});
const mode:CompositeMode='multiply';const mixed:Paint={type:'composite',mode,source:paint,backdrop:paint};
paintReferences(mixed);const bytes=compileCOLRv1(source,source.glyphs);if(bytes)readCOLRv1(bytes,source.glyphs,{paletteEntries:3});
restored.colorPaints.get(g.id);restored.paletteLabels?.map(s=>s.toUpperCase());
// @ts-expect-error misspelled composites must not cross the public contract
const invalid:CompositeMode='colour_dodge';
void invalid;
