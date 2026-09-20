import fs from 'node:fs/promises';
import path from 'node:path';
import {createDemoFont,addMaster} from '@wieslawsoltes/counterform-model';
import {compileTrueType,compileOpenTypeCFF} from '@wieslawsoltes/counterform-font-io';
import {compileVariableTrueType,instanceDocument} from '@wieslawsoltes/counterform-variations';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {encodeCollection,extractCollectionFace} from '@wieslawsoltes/counterform-binary';
import {planMetricEdits,applyMetricPlan,setKerningException} from '@wieslawsoltes/counterform-metrics';
const dir=process.argv[2];await fs.mkdir(dir,{recursive:true});const write=(name,bytes)=>fs.writeFile(path.join(dir,name),bytes);
function demo(){const d=createDemoFont();d.data.masters=d.data.masters.slice(0,1);d.data.glyphs.forEach(g=>{g.layers=g.layers.slice(0,1);g.layers[0].anchors=[];});d.data.axes=[{tag:'wght',name:'Weight',min:100,default:400,max:900,map:[[-1,-1],[0,0],[.5,.75],[1,1]]}];d.data.masters[0].location={wght:400};addMaster(d,'Black',{wght:900});d.data.kerning={};d.data.groups={};d.data.features='';return d;}
const cases=[
 ['conditional-only','conditionset Heavy {wght 650 900;} Heavy; variation rvrn Heavy {sub A by B;} rvrn;','AV'],
 ['early-rvrn','conditionset Heavy {wght 650 900;} Heavy; variation rvrn Heavy {sub A by B;} rvrn; feature rvrn {sub B by C;} rvrn;','ABV'],
 ['prepend-rvrn','conditionset Heavy {wght 650 900;} Heavy; feature rvrn {sub B by C;} rvrn; variation rvrn Heavy {sub A by B;} rvrn;','ABV'],
 ['append-calt','conditionset Heavy {wght 650 900;} Heavy; feature calt {sub A by B;} calt; variation calt Heavy {sub B by C;} calt;','ABV'],
 ['conditional-kern','conditionset Heavy {wght 650 900;} Heavy; feature kern {pos A V -30;} kern; variation kern Heavy {pos A V -90;} kern;','AV'],
 ['same-condition-features','conditionset Heavy {wght 650 900;} Heavy; variation calt Heavy {sub C by D;} calt; variation kern Heavy {pos A V -90;} kern;','CAV'],
 ['first-match','conditionset One {wght 500 900;} One; conditionset Two {wght 700 900;} Two; variation calt One {sub A by B;} calt; variation calt Two {sub A by C;} calt;','AV'],
 ['universal-fallback','conditionset Heavy {wght 650 900;} Heavy; variation calt Heavy {sub A by B;} calt; variation calt NULL {sub A by C;} calt;','AV'],
 ['contextual','conditionset Heavy {wght 650 900;} Heavy; variation calt Heavy {sub A V\' by W;} calt;','AV VV'],
 ['named','lookup Swap {sub A by B;} Swap; conditionset Heavy {wght 650 900;} Heavy; variation calt Heavy {lookup Swap;} calt;','AV'],
 ['language','conditionset Heavy {wght 650 900;} Heavy; feature calt {script latn;language TRK; sub C by D;} calt; variation calt Heavy {script latn;language TRK;sub A by B;} calt;','CAV']
];
const d=demo();await write('base.ttf',compileVariableTrueType(d));
for(const [name,fea] of cases){d.data.features=fea;await write(name+'.ttf',compileVariableTrueType(d));await write(name+'.otf',compileOpenTypeCFF2(d,{variable:true}));for(const wght of [400,650,800])await write(name+`-${wght}.ttf`,compileTrueType(instanceDocument(d,{wght})));}
await write('cases.json',JSON.stringify(cases));
d.data.features='';const faces=[compileTrueType(d),compileOpenTypeCFF(d),compileOpenTypeCFF2(d)];for(let i=0;i<faces.length;i++)await write(`face-${i}.bin`,faces[i]);
for(const version of [1,2]){const bytes=encodeCollection([...faces,faces[0]],{version});await write(`collection-${version}.ttc`,bytes);for(let i=0;i<4;i++)await write(`extracted-${version}-${i}.bin`,extractCollectionFace(bytes,i));}
const mid=d.data.masters[0].id;applyMetricPlan(d,planMetricEdits(d,mid,[{glyphId:'H',lsb:40,rsb:60},{glyphId:'A',lsb:'lsb("H")+10',rsb:'rsb("H")'}]));setKerningException(d,mid,'A','V',-123);await write('metrics.ttf',compileTrueType(d));

const multi=demo();multi.data.axes.push({tag:'wdth',name:'Width',min:75,default:100,max:125});multi.data.masters.forEach(m=>m.location.wdth=100);addMaster(multi,'Wide',{wght:400,wdth:125});addMaster(multi,'Black Wide',{wght:900,wdth:125});
await write('multi-base.ttf',compileVariableTrueType(multi));multi.data.features='conditionset HeavyWide {wght 650 900;wdth 110 125;} HeavyWide; variation calt HeavyWide {sub A by B;} calt;';
await write('multi.ttf',compileVariableTrueType(multi));await write('multi.fea',multi.data.features);
