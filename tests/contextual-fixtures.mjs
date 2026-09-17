import fs from 'node:fs';
import path from 'node:path';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileTrueType} from '@wieslawsoltes/counterform-font-io';
const cases = [
 ['single', 'feature salt { sub A by V; sub V by W; } salt;', 'AV'],
 ['multiple', 'feature ccmp { sub A by V W; sub B by NULL; } ccmp;', 'ABA'],
 ['alternate', 'feature salt { sub A from [V W]; } salt;', 'AA'],
 ['ligature', 'feature liga { sub f i by m; sub f l by n; } liga;', 'fi fl'],
 ['context', "feature calt { sub A V' W by X; } calt;", 'AVW AVV AVWX'],
 ['ignore', "feature calt { ignore sub A V' W; sub V' by X; } calt;", 'AVW AVV VW'],
 ['reverse', "feature calt { rsub A [V W]' X by [B C]; } calt;", 'AVX AWX VVX'],
 ['named', "lookup Swap { sub V by X; } Swap; feature calt { sub A V' lookup Swap W; } calt;", 'AVW AWV'],
 ['contextMultiple', "feature calt { sub A V' W by X Y; } calt;", 'AVW VV'],
 ['contextLigature', "feature calt { sub A f' i' W by m; } calt;", 'AfiW AfiX'],
 ['singlePos', 'feature kern { pos A <12 -13 20 8>; } kern;', 'AVA'],
 ['pairPos', 'feature kern { pos A <2 3 -20 4> V <5 6 7 8>; } kern;', 'AVA'],
 ['contextPos', "feature kern { pos A V' <12 13 -24 0> W; } kern;", 'AVW AVV'],
 ['language', 'languagesystem latn dflt; languagesystem latn TRK; feature locl { script latn; sub A by V; language TRK exclude_dflt; sub A by W; } locl;', 'AA'],
];
const d=createDemoFont();d.data.axes=[];d.data.masters=[d.data.masters[0]];d.data.kerning={};d.data.glyphs.forEach(g=>{g.layers=[g.layers[0]];g.layers[0].anchors=[];});
const out=process.argv[2];d.data.features='';fs.writeFileSync(path.join(out,'base.ttf'),compileTrueType(d));
for(const [name,fea] of cases){d.data.features=fea;fs.writeFileSync(path.join(out,name+'.ttf'),compileTrueType(d));}
fs.writeFileSync(path.join(out,'cases.json'),JSON.stringify(cases));
