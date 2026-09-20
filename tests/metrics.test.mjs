import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoFont,duplicateGlyph} from '@wieslawsoltes/counterform-model';
import {History} from '@wieslawsoltes/counterform-history';
import {pairKey,kerningValue} from '@wieslawsoltes/counterform-opentype';
import {parseMetricsText,layoutMetrics,parseMetricExpression,evaluateMetricExpression,planMetricEdits,applyMetricPlan,setKerningException} from '@wieslawsoltes/counterform-metrics';
const setup=()=>{const doc=createDemoFont();return {doc,mid:doc.data.masters[0].id};};

test('metrics text preserves explicit glyph names, Unicode spans, and missing glyphs',()=>{
 const {doc}=setup(),a=parseMetricsText('A/V /H//\u{10FFFF}',doc);
 assert.deepEqual(a.slice(0,3).map(x=>x.name),['A','V','H']);assert.equal(a.at(-1).end-a.at(-1).start,2);assert.equal(a.at(-1).missing,true);
 assert.throws(()=>parseMetricsText('A\nV',doc),/single line/);assert.throws(()=>parseMetricsText('A'.repeat(2049),doc),/2048/);
});
test('metrics layout follows source-order pair kerning and tracking, never skips a missing-glyph boundary',()=>{
 const {doc,mid}=setup();setKerningException(doc,mid,'A','V',-123);const a=layoutMetrics(doc,mid,'AV',{tracking:10});assert.equal(a.items[1].x,a.items[0].advanceWidth-123+10);assert.equal(a.items[1].kernBefore,-123);
 assert.equal(layoutMetrics(doc,mid,'AV',{kerning:false}).items[1].kernBefore,0);
 assert.equal(layoutMetrics(doc,mid,'A\u{10FFFF}V').items[2].kernBefore,0);
});
test('bounded metric expression parser evaluates arithmetic and explicit references without JavaScript',()=>{
 const run=(s,p)=>evaluateMetricExpression(parseMetricExpression(s,p),(g,m)=>({lsb:30,rsb:50,advanceWidth:600,width:520})[m]);
 assert.equal(run('2+3*4-5/2'),11.5);assert.equal(run('-(2+3)*4'),-20);assert.equal(run('=H+10','lsb'),40);assert.equal(run('=|H','lsb'),50);assert.equal(run('=(advance("space") - width("A"))/2'),40);
 for(const s of ['','1/0','globalThis.x','foo("A")','1;alert(1)','1e999','1 2','"A"','(((1)'])assert.throws(()=>run(s));
 assert.throws(()=>run('('.repeat(40)+'1'+')'.repeat(40)),/deep/);
});
test('batch formulas resolve referenced edits before dependents and preserve one undo transaction',()=>{
 const {doc,mid}=setup(),history=new History(doc),before=doc.serialize(),a=doc.metrics('A',mid),h=doc.metrics('H',mid);
 const plan=planMetricEdits(doc,mid,[{glyphId:'A',lsb:'lsb("H")+10',rsb:'rsb("H")'},{glyphId:'H',lsb:40,rsb:60}]);assert.equal(doc.serialize(),before);
 history.execute('Set metrics',()=>applyMetricPlan(doc,plan));assert.equal(doc.metrics('A',mid).lsb,50);assert.equal(doc.metrics('A',mid).rsb,60);assert.equal(doc.metrics('H',mid).lsb,40);assert.equal(doc.metrics('H',mid).rsb,60);assert.equal(doc.metrics('A',mid).width,a.width);assert.equal(doc.metrics('H',mid).width,h.width);
 history.undo();assert.equal(doc.serialize(),before);history.redo();assert.equal(doc.metrics('A',mid).lsb,50);
 assert.throws(()=>applyMetricPlan(doc,plan),/Stale/);
});
test('metrics constraints cover left/right/advance combinations and immutable failures',()=>{
 for(const fields of [{lsb:70},{rsb:80},{advanceWidth:1000},{lsb:70,advanceWidth:1000},{rsb:80,advanceWidth:1000}]){
  const {doc,mid}=setup(),before=doc.metrics('A',mid);applyMetricPlan(doc,planMetricEdits(doc,mid,[{glyphId:'A',...fields}]));const after=doc.metrics('A',mid);for(const [k,v] of Object.entries(fields))assert(Math.abs(after[k]-v)<1e-6);assert.equal(after.width,before.width);
 }
 const {doc,mid}=setup(),before=doc.serialize();for(const edits of [[{glyphId:'A',lsb:20,rsb:30,advanceWidth:1}],[{glyphId:'A',lsb:'lsb("V")'},{glyphId:'V',lsb:'lsb("A")'}],[{glyphId:'A',lsb:1},{glyphId:'V',lsb:'1/0'}],[{glyphId:'space',lsb:30}],[{glyphId:'A',advanceWidth:1e6}]]){assert.throws(()=>planMetricEdits(doc,mid,edits));assert.equal(doc.serialize(),before);}
});
test('metrics plans respect component dependency ordering, anchors, modifiers and source locks',()=>{
 const {doc,mid}=setup();const a=doc.glyph('A');a.layers[0].anchors.push({name:'test',x:200,y:700});const old=doc.metrics('A',mid).lsb,anchor=a.layers[0].anchors.at(-1).x;
 a.layers[0].modifiers=[{type:'translate',x:10,y:0}];const b=doc.glyph('B');b.layers[0].contours=[];b.layers[0].components=[{glyphId:a.id,transform:[1,0,0,1,0,0]}];
 applyMetricPlan(doc,planMetricEdits(doc,mid,[{glyphId:'B',lsb:70},{glyphId:'A',lsb:50}]));assert.equal(doc.metrics('A',mid).lsb,50);assert.equal(doc.metrics('B',mid).lsb,70);assert.equal(doc.layer('A',mid).anchors.at(-1).x,anchor+50-old-10);
 doc.layer('A',mid).locked=true;assert.throws(()=>planMetricEdits(doc,mid,[{glyphId:'A',lsb:10}]),/locked/);
});
test('zero kerning is a real override and removal restores inherited group values',()=>{
 const {doc,mid}=setup();doc.data.groups={'@L':['A'],'@R':['V']};doc.data.kerning[mid]={[pairKey('@L','@R')]:-75};assert.equal(kerningValue(doc.data,mid,'A','V'),-75);
 setKerningException(doc,mid,'A','V',0);assert.equal(kerningValue(doc.data,mid,'A','V'),0);setKerningException(doc,mid,'A','V',null);assert.equal(kerningValue(doc.data,mid,'A','V'),-75);
 assert.throws(()=>setKerningException(doc,mid,'A','V',1.5),/int16/);
});
