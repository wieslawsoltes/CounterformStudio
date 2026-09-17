import test from 'node:test';
import assert from 'node:assert/strict';
import {colorFixture} from './colrv1-fixture.mjs';
import {compileCOLRv1,readCOLRv1,paintTypes,compositeModes,validatePaintSource,paintReferences} from '@wieslawsoltes/counterform-colrv1';
import {compileColorTables,readColorTables,createPaletteNamePlan} from '@wieslawsoltes/counterform-color';
import {compileTrueType,compileOpenTypeCFF,exportGlyphOrder,importFont} from '@wieslawsoltes/counterform-font-io';
import {compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {readDirectory} from '@wieslawsoltes/counterform-binary';
test('all static COLRv1 formats roundtrip, including sweep angle bias and transforms',()=>{
 const d=colorFixture(),order=exportGlyphOrder(d),bytes=compileCOLRv1(d.data,order),r=readCOLRv1(bytes,order,{paletteEntries:3});
 const used=new Set();function collect(p){used.add(p.type);if(p.paint)collect(p.paint);if(p.layers)p.layers.forEach(collect);if(p.source){collect(p.source);collect(p.backdrop);}}
 for(const g of order)if(g.colorPaint){assert.deepEqual(r.colorPaints.get(g.id),g.colorPaint,g.name);assert.deepEqual(r.colorClips.get(g.id),g.colorClip);collect(g.colorPaint);}
 assert.equal(used.size,paintTypes.length);
});
test('v0 fallback arrays coexist with v1 base graphs and CPALv1 named palettes',()=>{
 const d=colorFixture(),order=exportGlyphOrder(d),plan=createPaletteNamePlan(d.data,[[256,'Weight']]),t=compileColorTables(d.data,order,{namePlan:plan}),r=readColorTables(t.get('COLR'),t.get('CPAL'),order,{names:new Map(plan.names)});
 assert.equal(new DataView(t.get('CPAL').buffer).getUint16(0),1);assert.equal(r.colorPaints.size,17);assert.equal(r.colorLayers.size,2);
 assert.deepEqual(r.palettes,d.data.palettes);assert.deepEqual(r.paletteLabels,d.data.paletteLabels);assert.deepEqual(r.paletteEntryLabels,d.data.paletteEntryLabels);assert.deepEqual(r.paletteTypes,[1,2]);assert.equal(plan.names[0][0],257);
});
test('all composite mode encodings survive independent source reconstruction',()=>{
 const d=colorFixture(),g=d.glyph('Q');for(const mode of compositeModes){g.colorPaint.mode=mode;const t=compileColorTables(d.data,d.data.glyphs);assert.equal(readColorTables(t.get('COLR'),t.get('CPAL'),d.data.glyphs).colorPaints.get(g.id).mode,mode);}
});
test('nested layer groups retain independent stable layer-list ranges',()=>{
 const d=colorFixture(),g=d.glyph('A');g.colorPaint={type:'layers',layers:[{type:'layers',layers:[g.colorPaint]},d.glyph('B').colorPaint]};
 assert.deepEqual(readCOLRv1(compileCOLRv1(d.data,d.data.glyphs),d.data.glyphs).colorPaints.get(g.id),g.colorPaint);
});
test('all font compilers preserve both color versions',()=>{
 for(const compile of [compileTrueType,compileOpenTypeCFF,compileVariableTrueType,compileOpenTypeCFF2]){
  const d=colorFixture(),{tables}=readDirectory(compile(d));assert.equal(readColorTables(tables.get('COLR').bytes,tables.get('CPAL').bytes,exportGlyphOrder(d)).colorPaints.size,17);
 }
});
test('TrueType import restores paint references and named palettes semantically',async()=>{
 const d=colorFixture(),a=compileTrueType(d),restored=await importFont(a),b=compileTrueType(restored);
 for(const tag of ['COLR','CPAL'])assert.deepEqual(readDirectory(a).tables.get(tag).bytes,readDirectory(b).tables.get(tag).bytes);
 assert.deepEqual(restored.data.paletteLabels,['Day','Night']);assert.equal(restored.glyph(restored.glyph('F').colorPaint.glyphId).name,'A');
});
test('cycles, excluded references, invalid numeric values, variable paints and unbounded roots fail',()=>{
 const edits=[d=>d.glyph('A').colorPaint={type:'colrGlyph',glyphId:d.glyph('F').id},d=>d.glyph('A').export=false,
  d=>d.glyph('B').colorPaint.paint.x0=Infinity,d=>d.glyph('A').colorPaint.paint.alpha=1.1,
  d=>d.glyph('A').colorPaint.paint.paletteIndex=3,d=>d.glyph('B').colorPaint.paint.x0=.1,
  d=>d.glyph('D').colorPaint.paint.endAngle=540,d=>d.glyph('A').colorPaint.paint.varIndexBase=0,
  d=>{d.glyph('A').colorPaint={type:'solid',paletteIndex:0};delete d.glyph('A').colorClip;},
  d=>{const p={type:'translate',dx:0,dy:0};p.paint=p;d.glyph('A').colorPaint=p;}];
 for(const edit of edits){const d=colorFixture();edit(d);assert.throws(()=>validatePaintSource(d.data));}
 const d=colorFixture();assert.throws(()=>validatePaintSource(d.data,{maxNodes:2}),/budget/);assert.throws(()=>validatePaintSource(d.data,{maxDepth:-1}),/invalid/);
 assert.deepEqual([...paintReferences(d.glyph('Q').colorPaint)].sort(),[d.glyph('A').id,d.glyph('O').id].sort());
});
test('COLRv1 decoder rejects every truncation, out-of-range offsets and variable stores',()=>{
 const d=colorFixture(),order=d.data.glyphs,c=compileCOLRv1(d.data,order);
 for(let i=0;i<c.length;i++)assert.throws(()=>readCOLRv1(c.slice(0,i),order),`truncation ${i}`);
 for(const offset of [14,18,22,26,30]){const bad=c.slice();new DataView(bad.buffer).setUint32(offset,0xffffff);assert.throws(()=>readCOLRv1(bad,order));}
 assert.throws(()=>readCOLRv1(c,order,{paletteEntries:1e9}),/palette/);
});
test('CPALv1 decoder rejects truncated metadata and invalid label offsets',()=>{
 const d=colorFixture(),t=compileColorTables(d.data,d.data.glyphs),p=t.get('CPAL');
 for(let i=0;i<p.length;i++)assert.throws(()=>readColorTables(t.get('COLR'),p.slice(0,i),d.data.glyphs));
 const bad=p.slice();new DataView(bad.buffer).setUint32(16,12);assert.throws(()=>readColorTables(t.get('COLR'),bad,d.data.glyphs),/metadata offset/);
});

test('glyph-scoped history validates color references against the complete source',async()=>{
 const {History}=await import('@wieslawsoltes/counterform-history');const d=colorFixture(),h=new History(d),id=d.glyph('Q').id;
 h.execute('move glyph',()=>d.glyph('Q').layers[0].advanceWidth+=10,id);assert(h.canUndo);h.undo();h.redo();
 assert.throws(()=>h.execute('bad reference',()=>d.glyph('Q').colorPaint.source.glyphId='missing',id));
 assert.equal(d.glyph('Q').colorPaint.source.glyphId,d.glyph('A').id);
});
test('duplicating a color glyph remaps self-outline clips, preserving other references',async()=>{
 const {duplicateGlyph}=await import('@wieslawsoltes/counterform-model');const d=colorFixture(),g=duplicateGlyph(d.glyph('A'),'A.copy');
 assert.equal(g.colorPaint.glyphId,g.id);assert.equal(g.colorLayers[0].glyphId,g.id);
 const other=duplicateGlyph(d.glyph('F'),'F.copy');assert.equal(other.colorPaint.glyphId,d.glyph('A').id);
});
