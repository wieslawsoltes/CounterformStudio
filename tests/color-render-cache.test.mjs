import test from 'node:test';
import assert from 'node:assert/strict';
import {GlyphRenderer} from '@wieslawsoltes/counterform-renderer';
test('compiled color cache rejects other documents, revisions, masters and absent glyph IDs',()=>{
 const r=Object.create(GlyphRenderer.prototype);r.colorFont={documentId:'d',revision:2,masterId:'m',ids:new Map([['A',0]])};
 r.scene={documentId:'d',revision:2,masterId:'m',colorGlyphId:'A',hasColorPaint:true};assert.equal(r.currentColorFont(),r.colorFont);
 for(const [k,v]of [['documentId','e'],['revision',3],['masterId','n'],['colorGlyphId','B'],['hasColorPaint',false]]){const before=r.scene[k];r.scene[k]=v;assert(!r.currentColorFont());r.scene[k]=before;}
});
test('color font replacement disposes native resources and preserves existing cache on allocation failure',()=>{
 const disposed=[];const r=Object.create(GlyphRenderer.prototype);r.invalidate=()=>{};r.S={SKFontHinting:{None:0},SKTypeface:{FromData:()=>({Dispose:()=>disposed.push('face')})},SKFont:class{Dispose(){disposed.push('font');}}};
 const options={documentId:'d',revision:0,masterId:'m',glyphOrder:['A'],unitsPerEm:1000};
 r.setCompiledColorFont(Uint8Array.of(1),options);const original=r.colorFont;
 r.S.SKFont=class{constructor(){throw new Error('allocation failed');}};
 assert.throws(()=>r.setCompiledColorFont(Uint8Array.of(2),options),/allocation failed/);assert.equal(r.colorFont,original);assert.deepEqual(disposed,['face']);
 r.setCompiledColorFont(null,options);assert.equal(r.colorFont,null);assert.deepEqual(disposed,['face','font','face']);
});
