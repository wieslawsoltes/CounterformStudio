import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeUVS,decodeUVS,readCmapUVS,isVariationSelector,readDirectory} from '@wieslawsoltes/counterform-binary';
import {createDemoFont,FontDocument,validateVariationSequences} from '@wieslawsoltes/counterform-model';
import {compileTrueType,parseTrueType} from '@wieslawsoltes/counterform-font-io';
import {parseMetricsText} from '@wieslawsoltes/counterform-metrics';
import {History} from '@wieslawsoltes/counterform-history';
import {fromSVG,bounds,segments,arcToCubics} from '@wieslawsoltes/counterform-geometry';
import {parseSVGTransform,svgViewportTransform,readSVGOutlines} from '@wieslawsoltes/counterform-svg';
const near=(a,b,e=1e-7)=>assert(Math.abs(a-b)<=e,`${a} != ${b}`);
const xml=s=>`<svg xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
const sorted=rows=>rows.slice().sort((a,b)=>a.selector-b.selector||a.unicode-b.unicode);
const u32=(bytes,at,v)=>new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).setUint32(at,v);

test('UVS codec handles all selector blocks, supplementary bases, default runs and glyph zero',()=>{
 const rows=[...Array.from({length:257},(_,i)=>({unicode:0x400+i,selector:0xfe0e,glyphIndex:null})),{unicode:0x1f600,selector:0xe0100,glyphIndex:7},{unicode:65,selector:0xfe0f,glyphIndex:0},...[0x180b,0x180c,0x180d,0x180f].map(selector=>({unicode:0x1820,selector,glyphIndex:3}))];
 const original=structuredClone(rows),data=encodeUVS(rows.reverse());assert.deepEqual(decodeUVS(data),sorted(original));assert.deepEqual(rows,original.reverse());
 assert(isVariationSelector(0xe01ef));assert(!isVariationSelector(0x180e));assert(!isVariationSelector('65039'));
 assert.deepEqual(decodeUVS(encodeUVS([])),[]);
});
test('UVS rejects malformed source rather than truncating Unicode, selector or glyph IDs',()=>{
 for(const record of [{unicode:0xd800,selector:0xfe0f,glyphIndex:1},{unicode:0x110000,selector:0xfe0f,glyphIndex:1},{unicode:65,selector:65,glyphIndex:1},{unicode:65,selector:0xfe0f,glyphIndex:65536},{unicode:65,selector:0xfe0f,glyphIndex:undefined}])assert.throws(()=>encodeUVS([record]));
 const r={unicode:65,selector:0xfe0f,glyphIndex:null};assert.throws(()=>encodeUVS([r,r]),/Duplicate/);
});
test('UVS validates every truncation, header offsets, range expansion and glyph-count limits',()=>{
 const b=encodeUVS([{unicode:65,selector:0xfe0f,glyphIndex:8},{unicode:66,selector:0xfe0f,glyphIndex:null}]);
 for(let i=0;i<b.length;i++)assert.throws(()=>decodeUVS(b.subarray(0,i)),String(i));
 const bad=b.slice();u32(bad,13,12);assert.throws(()=>decodeUVS(bad),/header/);
 assert.throws(()=>decodeUVS(b,{glyphCount:8}));assert.throws(()=>decodeUVS(b,{maxEntries:1}));assert.throws(()=>decodeUVS(b,{maxEntries:-1}));
 const expanded=encodeUVS(Array.from({length:256},(_,i)=>({unicode:0x400+i,selector:0xfe0e,glyphIndex:null})));assert.throws(()=>decodeUVS(expanded,{maxEntries:255}),/budget/);
});
test('UVS default and nondefault partitions cannot overlap',()=>{
 const b=encodeUVS([{unicode:65,selector:0xfe0f,glyphIndex:null},{unicode:66,selector:0xfe0f,glyphIndex:1}]);
 const at=new DataView(b.buffer).getUint32(17);b[at+6]=65;assert.throws(()=>decodeUVS(b),/overlap/);
});
test('UVS large decoded maps do not exceed JavaScript argument stack limits',()=>{
 const rows=Array.from({length:70000},(_,i)=>({unicode:0x20000+i,selector:0xe0100,glyphIndex:2}));assert.equal(decodeUVS(encodeUVS(rows)).length,rows.length);
});
test('source UVS uses stable IDs and history restores variant lookup indexes',()=>{
 const doc=createDemoFont(),h=new History(doc),a=doc.glyph('A'),v=doc.glyph('V');
 h.execute('Add variants',()=>{doc.data.variationSequences=[{unicode:65,selector:0xfe0f,glyphId:v.id},{unicode:65,selector:0xfe0e,glyphId:null}];});
 assert.equal(doc.variation(65,0xfe0f).id,v.id);assert.equal(doc.variation(65,0xfe0e).id,a.id);assert.equal(doc.variation(65,0xe0100),undefined);
 h.undo();assert.equal(doc.variation(65,0xfe0f),undefined);h.redo();assert.equal(doc.variation(65,0xfe0f).id,v.id);
 const clone=new FontDocument(JSON.parse(doc.serialize()));assert.equal(clone.variation(65,0xfe0f).id,v.id);
});
test('default base must be encoded; nondefault base need not be; export gates excluded targets',()=>{
 const doc=createDemoFont();doc.data.variationSequences=[{unicode:0x1f600,selector:0xe0100,glyphId:doc.glyph('V').id}];assert.doesNotThrow(()=>compileTrueType(doc));
 doc.data.variationSequences[0].glyphId=null;assert.throws(()=>validateVariationSequences(doc.data),/encoded base/);
 doc.data.variationSequences[0].glyphId=doc.glyph('V').id;doc.glyph('V').export=false;assert.throws(()=>compileTrueType(doc),/non-exported/);
});
test('cmap14 binary reconstruction maps renamed and reordered export glyphs by ID',()=>{
 const doc=createDemoFont(),v=doc.glyph('V');doc.data.variationSequences=[{unicode:65,selector:0xfe0f,glyphId:v.id},{unicode:65,selector:0xfe0e,glyphId:null},{unicode:0x1f600,selector:0xe0100,glyphId:v.id}];
 v.name='alternateV';doc.data.glyphs.reverse();doc.touch('structure');const bytes=compileTrueType(doc);const imported=parseTrueType(bytes);
 const restored=imported instanceof FontDocument?imported:new FontDocument(imported);
 assert.equal(restored.variation(65,0xfe0f).id,restored.char(86).id);assert.equal(restored.variation(65,0xfe0e).name,'A');assert.equal(restored.data.variationSequences.length,3);
 const dir=readDirectory(bytes),table=dir.tables.get('cmap');assert.equal(readCmapUVS(bytes.subarray(table.offset,table.offset+table.length)).length,3);
});
test('metrics strings consume selectors as part of a single source glyph token',()=>{
 const doc=createDemoFont();doc.data.variationSequences=[{unicode:65,selector:0xfe0f,glyphId:doc.glyph('V').id},{unicode:0x1f600,selector:0xe0100,glyphId:doc.glyph('H').id}];doc.touch('structure');
 const result=parseMetricsText('A\uFE0F'+String.fromCodePoint(0x1f600,0xe0100)+'A\uFE0E',doc);assert.equal(result.length,3);assert.deepEqual(result.map(i=>doc.glyph(i.glyphId)?.name),['V','H','A']);
});
test('SVG path scanner supports adjacent signs, decimals, exponents and every shorthand',()=>{
 const c=fromSVG('m1e1-2.5 5.5.5h10v20l-5-4q5 10 10 0t10 0c1 2 3 4 5 6s3 4 5 6z')[0];assert(c.closed);near(c.nodes[0].x,10);near(c.nodes[0].y,-2.5);assert([...segments(c)].some(s=>s.curve));
 const c2=fromSVG('M0 0L10 0Zl0 20');assert.equal(c2.length,2);near(c2[1].nodes[0].x,0);near(c2[1].nodes.at(-1).y,20);
});
test('SVG scanner never ignores bad tokens, malformed flags or exhausted point budgets',()=>{
 for(const d of ['L0 0','M0 0 garbage','M0,0,','M,0 0','M0 0A1 1 0 2 1 2 2','M0 0A1 1 0 0.0 1 2 2','M0 0C1 2 3','M0 0 1e 2','M0 0L1e100 0'])assert.throws(()=>fromSVG(d),d);
 assert.throws(()=>fromSVG('M0 0L1 2L2 3',{maxNodes:2}),/limit/);
 assert.equal(fromSVG('M0 0A10 10 0 0110 20')[0].nodes.at(-1).x,10);
});
test('SVG elliptical arcs implement flags, radii correction, rotation and degeneracies',()=>{
 for(const large of [0,1])for(const sweep of [0,1]){const list=arcToCubics({x:0,y:0},20,10,30,large,sweep,{x:15,y:12});assert(list.length>0&&list.length<=8);assert.deepEqual(list.at(-1).end,{x:15,y:12});}
 const b=bounds(fromSVG('M0 0A1 1 0 0 1 20 0'));near(b.width,20,.0001);near(b.height,10,.0001);
 const negative=fromSVG('M0 0A-10 -10 0 0 1 20 0');near(bounds(negative).height,10,.0001);
 assert.equal(arcToCubics({x:0,y:0},10,10,0,0,1,{x:0,y:0}).length,0);
 assert.equal(fromSVG('M0 0A0 5 0 1 0 20 30')[0].nodes.length,2);
});
test('SVG transforms preserve multiplication order and rotation center',()=>{
 assert.deepEqual(parseSVGTransform('translate(10,20) scale(2,3)'),[2,0,0,3,10,20]);
 const m=parseSVGTransform('rotate(90 10 20)');near(m[0]*10+m[2]*20+m[4],10);near(m[1]*10+m[3]*20+m[5],20);
 near(parseSVGTransform('skewX(45)')[2],1);assert.throws(()=>parseSVGTransform('matrix(1,2)'));assert.throws(()=>parseSVGTransform('translate(1),'));
});
test('SVG viewBox supports none, alignment, meet and slice',()=>{
 assert.deepEqual(svgViewportTransform([10,20,100,50],200,200,'none'),[2,0,0,4,-20,-80]);
 assert.deepEqual(svgViewportTransform([0,0,100,50],200,200),[2,0,0,2,0,50]);
 assert.deepEqual(svgViewportTransform([0,0,100,50],200,200,'xMaxYMax slice'),[4,0,0,4,-200,0]);
 assert.throws(()=>svgViewportTransform([0,0,0,1],100,100));
});
test('SVG extraction resolves nested groups and local use without double importing definitions',()=>{
 const result=readSVGOutlines('<svg viewBox="0 0 100 100" width="200" height="200"><defs><path id="s" d="M0 0H10V20Z"/></defs><g transform="translate(3 4)"><use href="#s" x="5"/></g></svg>');
 assert.equal(result.contours.length,1);const b=bounds(result.contours);near(b.minX,16);near(b.minY,8);near(b.width,20);near(b.height,40);
});
test('SVG extraction includes all basic shapes, rounded corners, nested viewports and physical units',()=>{
 const r=readSVGOutlines(xml('<rect x="1in" y="1pt" width="20" height="30" rx="5"/><circle cx="0" cy="0" r="3"/><ellipse rx="4" ry="2"/><polyline points="0,0 10,10"/><polygon points="0,0 20,0 0,20"/><line x2="5" y2="5"/>'));
 assert.equal(r.contours.length,6);near(bounds([r.contours[0]]).minX,96);assert(r.contours[0].nodes.length>4);assert(!r.contours[3].closed);
 const nested=readSVGOutlines(xml('<svg x="10" y="20" width="100" height="50" viewBox="0 0 20 10"><rect width="20" height="10"/></svg>'));near(bounds(nested.contours).minX,10);near(bounds(nested.contours).width,100);assert(nested.warnings.some(s=>s.includes('clipping')));
});
test('SVG local symbols, hidden geometry and paint warnings have explicit semantics',()=>{
 const r=readSVGOutlines(xml('<defs><symbol id="s" viewBox="0 0 10 10"><rect width="10" height="10"/></symbol></defs><use href="#s" width="20" height="30"/><g display="none"><rect width="100" height="100"/></g><path d="M0 0L1 1" stroke="red" fill-rule="evenodd" opacity=".5"/>'));
 assert.equal(r.contours.length,2);near(bounds([r.contours[0]]).height,20);assert(r.warnings.length>=3);
});
test('SVG external resources, scripts, DTD, ambiguous IDs and unsupported appearance are rejected',()=>{
 for(const content of ['<script/>','<image href="https://example.com/a.png"/>','<use href="https://example.com/a.svg#s"/>','<path d="M0 0" onclick="evil()"/>','<text>x</text>','<path clip-path="url(#clip)"/>','<path id="x"/><path id="x"/>','<style/>','<g><path></g>','<path d="M0 0" d="M1 1"/>'])assert.throws(()=>readSVGOutlines(xml(content)),content);
 assert.throws(()=>readSVGOutlines('<!DOCTYPE svg><svg/>'));assert.throws(()=>readSVGOutlines(xml('<path d="&notknown;"/>')));
});
test('SVG references and geometry are bounded before returning any partial output',()=>{
 assert.throws(()=>readSVGOutlines(xml('<defs><g id="a"><use href="#a"/></g></defs><use href="#a"/>')),/Cyclic/);
 assert.throws(()=>readSVGOutlines(xml('<rect width="1" height="1"/><rect width="1" height="1"/>'),{maxNodes:5}),/budget/);
 assert.throws(()=>readSVGOutlines(xml('<g><g><path d="M0 0"/></g></g>'),{maxElements:2}),/budget/);
 assert.throws(()=>readSVGOutlines(xml('<g transform="scale(10000000)"><rect width="1000" height="1"/></g>')),/budget/);
});

test('source UVS survives UFO metadata and participates in original-font preservation fingerprints',async()=>{
 const {exportUFO,importUFO}=await import('@wieslawsoltes/counterform-ufo');
 const {captureOriginal,preservationStatus,exportMetadataOnly}=await import('@wieslawsoltes/counterform-preservation');
 const doc=createDemoFont();doc.data.variationSequences=[{unicode:65,selector:0xfe0f,glyphId:doc.glyph('V').id}];doc.touch('structure');
 const copy=await importUFO(exportUFO(doc));assert.equal(copy.variation(65,0xfe0f).name,'V');
 const archive=await captureOriginal(compileTrueType(doc),doc.data);doc.data.variationSequences[0].glyphId=doc.glyph('I').id;
 assert.equal((await preservationStatus(archive,doc.data)).metadataOnly,false);await assert.rejects(exportMetadataOnly(archive,doc.data),/unsafe/);
});
test('SVG arc numeric underflow fails explicitly rather than dropping geometry',()=>{
 assert.throws(()=>arcToCubics({x:0,y:0},10,10,0,0,1,{x:1e-200,y:0}),/resolution/);
});
test('history refuses target deletion while a variation mapping still references it',()=>{
 const doc=createDemoFont(),history=new History(doc),v=doc.glyph('V');doc.data.variationSequences=[{unicode:65,selector:0xfe0f,glyphId:v.id}];doc.touch('structure');const original=doc.serialize();
 assert.throws(()=>history.execute('Remove variant glyph',()=>{doc.data.glyphs=doc.data.glyphs.filter(g=>g.id!==v.id);}),/missing/);assert.equal(doc.serialize(),original);assert.equal(history.undoStack.length,0);
});
