import { readdir,readFile,mkdir,symlink,lstat,rm } from 'node:fs/promises';
import { resolve,relative,dirname } from 'node:path';
const root=resolve(import.meta.dirname,'..');
for(const folder of ['vendor','packages'])for(const dir of await readdir(resolve(root,folder),{withFileTypes:true})){
 if(!dir.isDirectory())continue;const p=resolve(root,folder,dir.name);let pkg;try{pkg=JSON.parse(await readFile(resolve(p,'package.json'),'utf8'));}catch{continue;}
 const target=resolve(root,'node_modules',pkg.name);await mkdir(dirname(target),{recursive:true});try{const stat=await lstat(target);if(stat.isSymbolicLink())await rm(target);else continue;}catch{}await symlink(process.platform==='win32'?p:relative(dirname(target),p),target,process.platform==='win32'?'junction':'dir');
}
console.log('Local workspace and vendor packages linked. No network/install scripts executed.');
