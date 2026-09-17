import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),destination=path.join(root,'artifacts','npm');
const {version}=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const packages=[];
for(const name of (await fs.readdir(path.join(root,'packages'))).sort()){
 const folder=path.join(root,'packages',name),pkg=JSON.parse(await fs.readFile(path.join(folder,'package.json'),'utf8'));
 if(pkg.version!==version)throw new Error(`${pkg.name}: expected release ${version}, found ${pkg.version}`);
 for(const [dependency,range] of Object.entries(pkg.dependencies||{})){
  if(dependency.startsWith('@wieslawsoltes/counterform-')&&range!==version)throw new Error(`${pkg.name}: incompatible release dependency ${dependency}@${range}`);
 }
 for(const file of ['src/index.js','types/index.d.ts','LICENSE','README.md'])await fs.access(path.join(folder,file));
 packages.push({folder,pkg});
}
await fs.rm(destination,{recursive:true,force:true});
await fs.mkdir(destination,{recursive:true});const results=[];
for(const {folder,pkg} of packages){
 const output=execFileSync(process.platform==='win32'?'npm.cmd':'npm',['pack','--ignore-scripts','--json','--pack-destination',destination],{cwd:folder,encoding:'utf8'});
 const pack=JSON.parse(output)[0],bytes=await fs.readFile(path.join(destination,pack.filename));
 results.push({name:pkg.name,version:pkg.version,filename:pack.filename,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),integrity:pack.integrity,dependencies:pkg.dependencies||{}});
 console.log(pkg.name,pack.filename);
}
await fs.writeFile(path.join(destination,'manifest.json'),JSON.stringify({version,published:false,packages:results},null,2)+'\n');
