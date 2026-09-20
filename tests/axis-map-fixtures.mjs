import fs from 'node:fs/promises';
import path from 'node:path';
import {createDemoFont,createGlyph} from '@wieslawsoltes/counterform-model';
import {pairKey,kerningValue} from '@wieslawsoltes/counterform-opentype';
import {bounds,rectangle} from '@wieslawsoltes/counterform-geometry';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {compileVariableTrueType,instanceDocument} from '@wieslawsoltes/counterform-variations';
import {encodeWOFF2} from '@wieslawsoltes/counterform-woff2';
import {encodeWOFF2Compressed} from '@wieslawsoltes/counterform-woff2/node';
const dir=process.argv[2];if(!dir)throw new Error('Temporary fixture destination is required');
const d=createDemoFont();
d.data.axes[0].map=[[-1,-1],[-.5,-.75],[0,0],[.5,.25],[1,1]];
const mark=createGlyph('acutecomb',0x301,d.data.masters);mark.category='Mark';
for(const layer of mark.layers){layer.contours=[rectangle(20,0,80,90)];layer.anchors=[{name:'_top',x:60,y:0}];}
d.addGlyph(mark);
for(const layer of d.glyph('A').layers)layer.anchors=[{name:'top',x:320,y:700}];
for(const m of d.data.masters){const w=m.location.wght;for(const g of d.data.glyphs)g.layers.find(l=>l.masterId===m.id).advanceWidth=Math.round(640+(w-400)*.5);
    m.metrics={ascender:800+(w-400)*.3,descender:-200-(w-400)*.1,lineGap:40+(w-400)*.05,capHeight:700+(w-400)*.2,xHeight:520+(w-400)*.1};}
for(const m of d.data.masters){d.data.kerning[m.id][pairKey('A','V')]=-85+(m.location.wght-400)*.1;
 for(const g of d.data.glyphs)for(const a of g.layers.find(l=>l.masterId===m.id).anchors){a.x+=(m.location.wght-400)*.1;a.y+=(m.location.wght-400)*(a.name.startsWith('_')?.2:.4);}}
const outputs={'static-cff2.otf':compileOpenTypeCFF2(d),'variable-cff2.otf':compileOpenTypeCFF2(d,{variable:true}),'metrics.ttf':compileVariableTrueType(d)};
for(const [name,bytes]of Object.entries(outputs)){
    await fs.writeFile(path.join(dir,name),bytes);
    await fs.writeFile(path.join(dir,name+'.woff2'),encodeWOFF2(bytes));
    await fs.writeFile(path.join(dir,name+'.compressed.woff2'),encodeWOFF2Compressed(bytes));
}
const samples=[];
for(const w of [300,325,350,375,400,425,450,475,500,550,600,650,700,750,800]){
    const inst=instanceDocument(d,{wght:w});
    samples.push({kerning:kerningValue(inst.data,'instance','A','V'),anchors:Object.fromEntries(inst.data.glyphs.filter(g=>g.layers[0].anchors.length).map(g=>[g.name,g.layers[0].anchors])),wght:w,width:inst.layer(inst.glyph('A').id).advanceWidth,metrics:inst.info,bounds:bounds(inst.resolve('A'))});inst.dispose();
}
await fs.writeFile(path.join(dir,'oracle.json'),JSON.stringify({samples}));d.dispose();
