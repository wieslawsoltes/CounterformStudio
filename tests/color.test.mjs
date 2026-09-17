import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileTrueType,compileOpenTypeCFF,importFont,exportGlyphOrder} from '@wieslawsoltes/counterform-font-io';
import {compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
import {compileColorTables,readColorTables,validateColorSource,parseColor,FOREGROUND} from '@wieslawsoltes/counterform-color';
import {readDirectory} from '@wieslawsoltes/counterform-binary';
function fixture() {
 const doc=createDemoFont();doc.data.palettes=[['#ed6043','#3478f680'],['#ffffff','#000000']];
 doc.glyph('A').colorLayers=[{glyphId:doc.glyph('A').id,paletteIndex:0},{glyphId:doc.glyph('O').id,paletteIndex:1},{glyphId:doc.glyph('H').id,paletteIndex:FOREGROUND}];return doc;
}
test('color parser preserves RGBA and rejects unsupported syntax',()=>{
 assert.deepEqual(parseColor('#010203'),[1,2,3,255]);assert.deepEqual(parseColor('#aAbBcC00'),[170,187,204,0]);
 for(const x of ['red','#123','#123456789','#gg0000',null])assert.throws(()=>parseColor(x));
});
test('COLRv0 and CPAL serialize exact layer order, foreground and BGRA bytes',()=>{
 const d=fixture(), order=exportGlyphOrder(d),t=compileColorTables(d.data,order),cpal=t.get('CPAL');
 assert.deepEqual([...cpal.slice(16,20)],[0x43,0x60,0xed,0xff]);
 assert.deepEqual([...cpal.slice(20,24)],[0xf6,0x78,0x34,0x80]);
 const restored=readColorTables(t.get('COLR'),cpal,order);
 assert.deepEqual(restored.palettes,d.data.palettes);assert.deepEqual(restored.colorLayers.get(d.glyph('A').id),d.glyph('A').colorLayers);
});
test('color tables compile in TTF, CFF and variable TrueType',()=>{
 for(const compile of [compileTrueType,compileOpenTypeCFF,compileVariableTrueType]){
  const d=fixture(),{tables}=readDirectory(compile(d));assert(tables.has('COLR'));assert(tables.has('CPAL'));
  assert.equal(readColorTables(tables.get('COLR').bytes,tables.get('CPAL').bytes,exportGlyphOrder(d)).colorLayers.size,1);
 }
});
test('TrueType import reconstructs supported color data with remapped stable IDs',async()=>{
 const d=fixture(),loaded=await importFont(compileTrueType(d));assert.deepEqual(loaded.data.palettes,d.data.palettes);
 assert.deepEqual(loaded.glyph('A').colorLayers.map(l=>[loaded.glyph(l.glyphId).name,l.paletteIndex]),[['A',0],['O',1],['H',65535]]);
 assert(!loaded.data.importInfo.notReconstructed.includes('COLR'));
 assert.deepEqual(readDirectory(compileTrueType(d)).tables.get('COLR').bytes,readDirectory(compileTrueType(loaded)).tables.get('COLR').bytes);
});
test('color source rejects missing, unexported and out-of-range references',()=>{
 for(const mutate of [d=>d.glyph('A').colorLayers[0].glyphId='missing',d=>d.glyph('O').export=false,d=>d.glyph('A').colorLayers[0].paletteIndex=2,d=>d.data.palettes[1].pop(),d=>d.data.palettes[0][0]='blue',d=>d.glyph('A').colorLayers={}]){
  const d=fixture();mutate(d);assert.throws(()=>validateColorSource(d.data));
 }
});
test('bounded color decoder rejects truncation, invalid offsets and unsupported versions',()=>{
 const d=fixture(),order=exportGlyphOrder(d),t=compileColorTables(d.data,order),c=t.get('COLR'),p=t.get('CPAL');
 for(let n=0;n<c.length;n++)assert.throws(()=>readColorTables(c.slice(0,n),p,order));
 for(let n=0;n<p.length;n++)assert.throws(()=>readColorTables(c,p.slice(0,n),order));
 const bad=c.slice();new DataView(bad.buffer).setUint16(0,1);assert.throws(()=>readColorTables(bad,p,order),/only COLRv0/);
 const badPalette=p.slice();new DataView(badPalette.buffer).setUint16(12,65535);assert.throws(()=>readColorTables(c,badPalette,order));
 const badLayer=c.slice();new DataView(badLayer.buffer).setUint16(20,65535);assert.throws(()=>readColorTables(badLayer,p,order));
});
test('monochrome fonts do not gain color tables',()=>{
 const d=createDemoFont();assert.equal(compileColorTables(d.data,exportGlyphOrder(d)).size,0);assert(!readDirectory(compileTrueType(d)).tables.has('CPAL'));
});

test('malformed color arrays and expanded palette memory budgets are rejected',()=>{
 const d=createDemoFont();d.glyph('A').colorLayers=null;
 assert.throws(()=>validateColorSource(d.data),/colorLayers/);
 delete d.glyph('A').colorLayers;d.data.palettes=[['bad']];
 assert.throws(()=>validateColorSource(d.data),/colors must/);
 const f=fixture(),t=compileColorTables(f.data,f.data.glyphs),cpal=t.get('CPAL').slice();
 cpal[2]=255;cpal[3]=255; // entries * paletteCount would exceed the expanded-source budget
 assert.throws(()=>readColorTables(t.get('COLR'),cpal,f.data.glyphs),/palette budget/);
});
