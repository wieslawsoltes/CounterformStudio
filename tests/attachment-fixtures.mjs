import fs from 'node:fs';
import path from 'node:path';
import {createDemoFont,createGlyph} from '@wieslawsoltes/counterform-model';
import {compileTrueType} from '@wieslawsoltes/counterform-font-io';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {rectangle} from '@wieslawsoltes/counterform-geometry';
const marks = 'markClass acutecomb <anchor 50 0> @TOP; markClass gravecomb <anchor 40 -10> @TOP; markClass dotbelowcomb <anchor 20 80> @BOTTOM;';
const base = 'pos base [A B] <anchor 300 700> mark @TOP <anchor 250 -10> mark @BOTTOM;';
const cases = [
 ['markBase', `${marks} feature mark {${base}} mark;`, 'A\u0301B\u0300A\u0323'],
 ['namedAnchor', 'anchorDef 300 700 TOP; markClass acutecomb <anchor 50 0> @TOP; feature mark { pos base A <anchor TOP> mark @TOP; } mark;', 'A\u0301'],
 ['markStack', `${marks} feature mark {${base}} mark; feature mkmk { pos mark [acutecomb gravecomb] <anchor 50 180> mark @TOP; } mkmk;`, 'A\u0301\u0300B\u0300\u0301'],
 ['ligatureMarks', `${marks} feature liga {lookupflag IgnoreMarks; sub f i by f_i;} liga; feature mark {pos ligature f_i <anchor 140 650> mark @TOP ligComponent <anchor 450 720> mark @TOP;} mark;`, 'f\u0301i\u0300fi\u0301'],
 ['nullComponent', `${marks} feature liga {lookupflag IgnoreMarks;sub f i l by f_i_l;} liga; feature mark {pos ligature f_i_l <anchor NULL> ligComponent <anchor 250 700> mark @TOP ligComponent <anchor NULL>;} mark;`, 'f\u0301i\u0300l\u0301'],
 ['mergedBase', `${marks} feature mark {pos base A <anchor 300 700> mark @TOP; pos base A <anchor 250 -10> mark @BOTTOM;} mark;`, 'A\u0301A\u0323'],
 ['cursiveLTR', 'feature curs {pos cursive A <anchor NULL> <anchor 550 50>; pos cursive B <anchor 0 10> <anchor 580 20>; pos cursive C <anchor 10 70> <anchor NULL>;} curs;', 'ABC'],
 ['cursiveRTL', 'languagesystem arab dflt; feature curs {lookupflag RightToLeft; pos cursive alef <anchor 450 40> <anchor 0 0>;pos cursive beh <anchor 450 10> <anchor 0 100>;} curs;', '\u0628\u0627\u0628'],
 ['cursiveClasses', 'feature curs { pos cursive [A B C] <anchor 0 10> <anchor 600 80>;} curs;', 'ABC'],
 ['contextAttachment', `${marks} lookup ATTACH {pos base A <anchor 300 700> mark @TOP;} ATTACH; feature mark {pos A acutecomb' lookup ATTACH;} mark;`, 'A\u0301B\u0301'],
 ['markFiltering', `${marks} @FILTER=[acutecomb]; feature mark {${base}} mark; feature mkmk {lookupflag UseMarkFilteringSet @FILTER; pos mark acutecomb <anchor 50 180> mark @TOP;} mkmk;`, 'A\u0301\u0323\u0301'],
 ['attachmentType', `${marks} @ABOVE=[acutecomb gravecomb]; feature mark {${base}} mark; feature mkmk {lookupflag MarkAttachmentType @ABOVE; pos mark [acutecomb gravecomb] <anchor 50 180> mark @TOP;} mkmk;`, 'A\u0301\u0323\u0300'],
 ['contextFiltered', `${marks} @FILTER=[acutecomb]; lookup SWAP { sub B by C; } SWAP; feature calt {lookupflag UseMarkFilteringSet @FILTER; sub A B' lookup SWAP;} calt;`, 'A\u0323B A\u0301B'],
 ['attachmentSubtables', `${marks} feature mark {pos base A <anchor 300 700> mark @TOP;subtable;pos base B <anchor 250 500> mark @TOP;} mark;`, 'A\u0301B\u0301'],
];
const d=createDemoFont();d.data.axes=[];d.data.masters=[d.data.masters[0]];d.data.kerning={};
d.data.glyphs.forEach(g=>{g.layers=[g.layers[0]];g.layers[0].anchors=[];});
for(const [name,cp] of [['acutecomb',0x301],['gravecomb',0x300],['dotbelowcomb',0x323],['alef',0x627],['beh',0x628],['f_i',null],['f_i_l',null]]){
 const g=createGlyph(name,cp,[d.data.masters[0]]);g.layers[0].contours=[rectangle(10,0,60,80)];g.layers[0].advanceWidth=cp>=0x300&&cp<0x400?0:600;d.addGlyph(g);
}
const out=process.argv[2];d.data.features='';fs.writeFileSync(path.join(out,'base.ttf'),compileTrueType(d));
for(const [name,fea] of cases){d.data.features=fea;fs.writeFileSync(path.join(out,name+'.ttf'),compileTrueType(d));fs.writeFileSync(path.join(out,name+'.otf'),compileOpenTypeCFF2(d));}
fs.writeFileSync(path.join(out,'cases.json'),JSON.stringify(cases));
