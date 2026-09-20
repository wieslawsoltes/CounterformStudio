import fs from 'node:fs/promises';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
import {bitmapFont,indexFixture} from './bitmap-fixture.mjs';
import {decodeSbix,decodeCBDT} from '@wieslawsoltes/counterform-bitmap';
import {exportGlyphOrder} from '@wieslawsoltes/counterform-font-io';
const dir=process.argv[2];if(!dir)throw new Error('Temporary output path is required');
if(process.argv[3]==='decode'){
    const cases=JSON.parse(await fs.readFile(path.join(dir,'oracles.json'),'utf8'));
    for(const c of cases){const ids=c.order;c.actual=Object.fromEntries((c.type==='sbix'?decodeSbix(new Uint8Array(await fs.readFile(path.join(dir,c.name+'.sbix'))),ids):decodeCBDT(new Uint8Array(await fs.readFile(path.join(dir,c.name+'.cbdt'))),new Uint8Array(await fs.readFile(path.join(dir,c.name+'.cblc'))),ids)).bitmaps);}
    await fs.writeFile(path.join(dir,'decoded.json'),JSON.stringify(cases));
}else{
    const client=new CompilerClient({workerFactory:()=>new Worker(new URL(import.meta.resolve('@wieslawsoltes/counterform-compiler/node-worker')))}),doc=bitmapFont();
    const formats=['ttf','otf','cff2','variable','variable-cff2','woff','woff2','variable-woff2','cff2-woff2'];
    try{for(const format of formats)await fs.writeFile(path.join(dir,format+'.bin'),(await client.compile(doc,{format})).bytes);}finally{client.dispose();}
    await fs.writeFile(path.join(dir,'source.json'),JSON.stringify({data:doc.data,order:exportGlyphOrder(doc).map(g=>g.id),formats}));
    for(const index of [1,2,3,4,5]){const f=indexFixture(index,[2,5].includes(index)?19:18);await fs.writeFile(path.join(dir,`index-${index}.cblc`),f.cblc);await fs.writeFile(path.join(dir,`index-${index}.cbdt`),f.cbdt);}
}
