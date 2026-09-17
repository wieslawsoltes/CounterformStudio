import {createDemoFont} from '@wieslawsoltes/counterform-model';
export function colorFixture(){
 const d=createDemoFont(),a=d.glyph('A').id,o=d.glyph('O').id;
 d.data.palettes=[['#ff0000','#0000ff','#00cc4480'],['#ffffff','#112233','#445566cc']];
 d.data.paletteLabels=['Day','Night'];d.data.paletteEntryLabels=['Warm','Cool','Accent'];d.data.paletteTypes=[1,2];
 const stops=[{offset:0,paletteIndex:0,alpha:1},{offset:1,paletteIndex:1,alpha:1}];
 const solid={type:'solid',paletteIndex:0,alpha:.75};
 const clip=paint=>({type:'glyph',glyphId:a,paint});
 const linear={type:'linear',x0:0,y0:0,x1:600,y1:0,x2:0,y2:700,extend:'pad',stops};
 const paints=[
  clip(solid),clip(linear),clip({type:'radial',x0:200,y0:200,r0:0,x1:300,y1:300,r1:500,extend:'reflect',stops}),
  clip({type:'sweep',centerX:300,centerY:350,startAngle:0,endAngle:360,extend:'repeat',stops}),
  {type:'layers',layers:[clip(solid),{type:'glyph',glyphId:o,paint:{type:'solid',paletteIndex:65535,alpha:1}}]},
  {type:'colrGlyph',glyphId:a},
  {type:'transform',matrix:[1,.125,-.25,1,20,-30],paint:clip(linear)},
  {type:'translate',dx:30,dy:-20,paint:clip(solid)},
  {type:'scale',scaleX:1.25,scaleY:.75,paint:clip(solid)},
  {type:'scaleAroundCenter',scaleX:1.25,scaleY:.75,centerX:300,centerY:350,paint:clip(solid)},
  {type:'scaleUniform',scale:.75,paint:clip(solid)},
  {type:'scaleUniformAroundCenter',scale:1.25,centerX:300,centerY:350,paint:clip(solid)},
  {type:'rotate',angle:45,paint:clip(solid)},
  {type:'rotateAroundCenter',angle:90,centerX:300,centerY:350,paint:clip(solid)},
  {type:'skew',xSkewAngle:22.5,ySkewAngle:-22.5,paint:clip(solid)},
  {type:'skewAroundCenter',xSkewAngle:22.5,ySkewAngle:0,centerX:300,centerY:350,paint:clip(solid)},
  {type:'composite',source:clip(solid),mode:'multiply',backdrop:{type:'glyph',glyphId:o,paint:linear}},
 ];
 const glyphs='ABCDEFGHIJKLMNOPQ'.split('').map(x=>d.glyph(x));
 for(let i=0;i<paints.length;i++){glyphs[i].colorPaint=structuredClone(paints[i]);glyphs[i].colorClip=[-100,-100,1000,1000];}
 // One v0 base coexists with the v1 graph. A also has a v0 fallback.
 d.glyph('A').colorLayers=[{glyphId:a,paletteIndex:0}];d.glyph('Z').colorLayers=[{glyphId:o,paletteIndex:1}];
 return d;
}
