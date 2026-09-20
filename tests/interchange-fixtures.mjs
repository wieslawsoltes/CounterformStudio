import fs from 'node:fs/promises';
import path from 'node:path';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
import {Worker} from 'node:worker_threads';
import {encodeCollection} from '@wieslawsoltes/counterform-binary';
const target=process.argv[2];if(!target)throw new Error('Output directory required');await fs.mkdir(target,{recursive:true});
const doc=createDemoFont();doc.data.features='';doc.data.kerning={};doc.data.groups={};
for(const glyph of doc.data.glyphs)for(const layer of glyph.layers)layer.anchors=[];
doc.data.variationSequences=[{unicode:65,selector:0xfe0f,glyphId:doc.glyph('V').id},{unicode:65,selector:0xfe0e,glyphId:null},{unicode:0x1f600,selector:0xe0100,glyphId:doc.glyph('H').id},{unicode:0x1820,selector:0x180b,glyphId:doc.glyph('O').id},{unicode:66,selector:0xfe0f,glyphId:doc.data.glyphs[0].id}];
const client=new CompilerClient({workerFactory:()=>new Worker(new URL(import.meta.resolve('@wieslawsoltes/counterform-compiler/node-worker')))});
const formats=['ttf','otf','cff2','variable','variable-cff2','woff','woff2'],bins=[];
try{for(const format of formats){const {bytes}=await client.compile(doc,{format});await fs.writeFile(path.join(target,format+'.bin'),bytes);if(['ttf','otf','cff2'].includes(format))bins.push(bytes);}}finally{client.dispose();}
await fs.writeFile(path.join(target,'fonts.ttc'),encodeCollection(bins));
await fs.writeFile(path.join(target,'cases.json'),JSON.stringify({formats,mappings:doc.data.variationSequences.map(r=>({...r,glyphName:r.glyphId===null?null:doc.glyph(r.glyphId).name}))}));
