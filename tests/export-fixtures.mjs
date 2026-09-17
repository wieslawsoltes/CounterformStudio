import fs from 'node:fs/promises';
import path from 'node:path';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {bounds} from '@wieslawsoltes/counterform-geometry';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {compileVariableTrueType,instanceDocument} from '@wieslawsoltes/counterform-variations';
import {encodeWOFF2} from '@wieslawsoltes/counterform-woff2';
import {encodeWOFF2Compressed} from '@wieslawsoltes/counterform-woff2/node';
const dir=process.argv[2];if(!dir)throw new Error('Temporary fixture destination is required');
const d=createDemoFont();
for(const m of d.data.masters){const w=m.location.wght;for(const g of d.data.glyphs)g.layers.find(l=>l.masterId===m.id).advanceWidth=Math.round(640+(w-400)*.5);
    m.metrics={ascender:800+(w-400)*.3,descender:-200-(w-400)*.1,lineGap:40+(w-400)*.05,capHeight:700+(w-400)*.2,xHeight:520+(w-400)*.1};}
const outputs={'static-cff2.otf':compileOpenTypeCFF2(d),'variable-cff2.otf':compileOpenTypeCFF2(d,{variable:true}),'metrics.ttf':compileVariableTrueType(d)};
for(const [name,bytes]of Object.entries(outputs)){
    await fs.writeFile(path.join(dir,name),bytes);
    await fs.writeFile(path.join(dir,name+'.woff2'),encodeWOFF2(bytes));
    await fs.writeFile(path.join(dir,name+'.compressed.woff2'),encodeWOFF2Compressed(bytes));
}
const samples=[];
for(const w of [300,350,400,500,600,700,800]){
    const inst=instanceDocument(d,{wght:w});
    samples.push({wght:w,width:inst.layer(inst.glyph('A').id).advanceWidth,metrics:inst.info,bounds:bounds(inst.resolve('A'))});inst.dispose();
}
await fs.writeFile(path.join(dir,'oracle.json'),JSON.stringify({samples}));d.dispose();
