import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeatures,compileLayout} from '@wieslawsoltes/counterform-opentype';
import {createDemoFont,createGlyph} from '@wieslawsoltes/counterform-model';
import {compileTrueType} from '@wieslawsoltes/counterform-font-io';
import {Reader,readDirectory} from '@wieslawsoltes/counterform-binary';
import {compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
const names=['A','B','f_i','acute','grave'];
const decl='markClass acute <anchor 20 0> @TOP; markClass grave <anchor 10 0> @TOP;';
const data = features => ({features,kerning:{},groups:{}});
const glyphs=names.map(name=>({name,category:'Letter',layers:[{masterId:'r',anchors:[]}]}));
function compile(source){return compileLayout(data(source),glyphs,'r');}
function lookups(raw) {const r=new Reader(raw);r.seek(8);r.seek(r.u16());const base=r.pos,n=r.u16(),offsets=Array.from({length:n},()=>r.u16());return offsets.map(o=>{r.seek(base+o);return [r.u16(),r.u16(),r.u16()];});}

test('cursive records share one GPOS3 subtable; null anchors and named anchors parse',()=>{
 const source='anchorDef 500 0 EXIT; feature curs {pos cursive A <anchor NULL> <anchor EXIT>; pos cursive B <anchor 0 20> <anchor NULL>;} curs;';
 const c=compile(source);assert.deepEqual(lookups(c.tables.get('GPOS')),[[3,0,1]]);
 assert.equal(c.parsed.features[0].rules[0].entry,null);
});
test('explicit attachment classes infer GDEF identities and support all attachment lookup types',()=>{
 const c=compile(`${decl} feature mark {pos base A <anchor 300 700> mark @TOP;pos ligature f_i <anchor 140 700> mark @TOP ligComponent <anchor NULL>;} mark; feature mkmk {pos mark acute <anchor 20 150> mark @TOP;} mkmk;`);
 assert.deepEqual(lookups(c.tables.get('GPOS')).map(x=>x[0]),[4,5,6]);
 assert.deepEqual(c.parsed.glyphClasses,{acute:3,grave:3,A:1,f_i:2});
});
test('subtable breaks preserve a single attachment lookup and do not apply twice',()=>{
 assert.deepEqual(lookups(compile(`${decl} feature mark {pos base A <anchor 300 700> mark @TOP;subtable;pos base B <anchor 200 700> mark @TOP;} mark;`).tables.get('GPOS')),[[4,0,2]]);
});
test('mark filter sets and attachment classes use distinct GDEF structures',()=>{
 const c=compile(`${decl} @TOPS=[acute grave]; feature mkmk {lookupflag MarkAttachmentType @TOPS UseMarkFilteringSet @TOPS;pos mark acute <anchor 0 100> mark @TOP;} mkmk;`);
 const gdef=new Reader(c.tables.get('GDEF'));assert.equal(gdef.u32(),0x10002);
 assert.deepEqual(lookups(c.tables.get('GPOS')),[[6,0x110,1]]);
 assert.deepEqual(c.parsed.markFilteringSets,[['acute','grave']]);
});
test('invalid or ambiguous attachment input is rejected before font export',()=>{
 const invalid=[
  'markClass acute <anchor NULL> @TOP;',
  'markClass acute <anchor 0 0> @TOP;markClass acute <anchor 1 1> @TOP;',
  'feature mark {pos base A <anchor 0 0> mark @MISSING;} mark;',
  `${decl} feature mark {pos base A <anchor 0 0> mark @TOP;} mark;markClass B <anchor 0 0> @TOP;`,
  `${decl} feature mark {pos base acute <anchor 0 0> mark @TOP;} mark;`,
  `${decl} feature mark {pos base A <anchor 0 0> mark @TOP <anchor 1 1> mark @TOP;} mark;`,
  'anchorDef 32768 0 BAD;',
  'feature curs {pos cursive A <anchor 0 0 contourpoint 65536> <anchor NULL>;} curs;',
 ];
 for(const source of invalid)assert.throws(()=>parseFeatures(source,names),SyntaxError,source);
 for(const source of [
  'markClass acute <anchor 0 0> @M1;markClass acute <anchor 0 0> @M2;feature mark {pos base A <anchor 0 0> mark @M1 <anchor 1 1> mark @M2;} mark;',
  `${decl} feature mark {pos base A <anchor 0 0> mark @TOP;pos base A <anchor 1 1> mark @TOP;} mark;`,
  'feature curs {pos cursive A <anchor 0 0> <anchor 1 1>;pos cursive A <anchor 2 2> <anchor 3 3>;} curs;',
 ])assert.throws(()=>compile(source));
});
test('mark filtering flags propagate into generated contextual helpers',()=>{
 const c=compile(`${decl} feature kern {lookupflag UseMarkFilteringSet @TOP;pos A' <1 0 2 0> B;} kern;`);
 assert(lookups(c.tables.get('GPOS')).every(([,flags])=>flags&16));
});
test('GDEF variable store and mark filtering sets coexist in a real variable font',()=>{
 const d=createDemoFont(),a=createGlyph('acute',0x301,d.data.masters);a.category='Mark';d.addGlyph(a);
 d.data.kerning[d.data.masters.at(-1).id]['A/V']=-145;
 d.data.features='markClass acute <anchor 0 0> @TOP;feature mark {lookupflag UseMarkFilteringSet @TOP;pos base A <anchor 300 700> mark @TOP;} mark;';
 const bytes=compileVariableTrueType(d),table=readDirectory(bytes).tables.get('GDEF').bytes,r=new Reader(table);
 assert.equal(r.u32(),0x10003);r.seek(12);assert(r.u16()>0);assert(r.u32()>0);assert(bytes.length>1000);
});
test('source-aware attachment parse errors carry line and column',()=>{
 try{parseFeatures('feature mark {\n pos base A <anchor 40000 0> mark @TOP;\n} mark;',names);assert.fail();}
 catch(e){assert.equal(e.line,2);assert(e.column>0);}
});


test('mark-class disjointness extends across explicit subtable boundaries',()=>{
 assert.throws(()=>compile('markClass acute <anchor 0 0> @M1;markClass acute <anchor 1 1> @M2;feature mark {pos base A <anchor 10 10> mark @M1;subtable;pos base B <anchor 20 20> mark @M2;} mark;'),/Overlapping/);
});
test('prototype-like glyph and lookup names are treated only as explicit data',()=>{
 const gs=[...glyphs,{name:'constructor',category:'Ligature',layers:[{masterId:'r',anchors:[]}]}];
 const c=compileLayout(data('feature curs {pos cursive A <anchor 1 1> <anchor NULL>;} curs;'),gs,'r');
 const r=new Reader(c.tables.get('GDEF'));r.seek(4);r.seek(r.u16());assert.equal(r.u16(),2);const n=r.u16();let cls;
 for(let i=0;i<n;i++){const a=r.u16(),b=r.u16(),v=r.u16();if(a<=gs.length-1&&b>=gs.length-1)cls=v;}assert.equal(cls,2);
 assert.throws(()=>compile('feature kern {lookup constructor;} kern;'),/Unknown lookup/);
});
test('contour-point anchor format is TrueType-only, never silently emitted in CFF',async()=>{
 const {compileOpenTypeCFF}=await import('@wieslawsoltes/counterform-font-io');const d=createDemoFont();
 d.data.features='feature curs {pos cursive A <anchor NULL> <anchor 10 10 contourpoint 0>;} curs;';
 assert(compileTrueType(d).length>1000);assert.throws(()=>compileOpenTypeCFF(d),/TrueType outlines/);
});

test('TrueType contour-point anchors are checked against actual compiled glyph points',()=>{
 const d=createDemoFont();d.data.features='feature curs {pos cursive A <anchor NULL> <anchor 10 10 contourpoint 65000>;} curs;';
 assert.throws(()=>compileTrueType(d),/outside the compiled outline/);
});
