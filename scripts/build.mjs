import {fileURLToPath} from 'node:url';
/** Reproducible static-site assembly from the supplied, pinned local inputs. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { writeIndex } from './importmap.mjs';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,[fileURLToPath(new URL('./worker-build.mjs',import.meta.url))],{stdio:'inherit'});
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const fontExtensions=new Set(['.ttf','.otf','.woff','.woff2','.ttc','.otc','.eot','.pfb','.pfa','.afm','.pcf','.bdf']);
const omit=new Set(['node_modules','.git','tests','test-results','examples','sample','samples','demo','blazor','dotnet','adapters','docs','pdf-assets']);
await fs.rm(dist,{recursive:true,force:true});await fs.mkdir(dist,{recursive:true});
async function copy(from,to){
 const stat=await fs.lstat(from);if(stat.isSymbolicLink())return;
 if(stat.isDirectory()){if(omit.has(path.basename(from)))return;await fs.mkdir(to,{recursive:true});for(const file of await fs.readdir(from))await copy(path.join(from,file),path.join(to,file));}
 else {const ext=path.extname(from).toLowerCase();if(fontExtensions.has(ext)||ext==='.map'||/\.d\.(ts|cts)$/.test(from))return;await fs.copyFile(from,to);}
}
for(const folder of ['app','packages','vendor'])await copy(path.join(root,folder),path.join(dist,folder));
for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md','vendor-lock.json'])await fs.copyFile(path.join(root,file),path.join(dist,file));
await writeIndex(dist);
await fs.writeFile(path.join(dist,'.nojekyll'),'');
await fs.writeFile(path.join(dist,'_headers'),'/*\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: require-corp\n  Cross-Origin-Resource-Policy: same-origin\n  X-Content-Type-Options: nosniff\n');
const entries=[];
async function inventory(dir){for(const file of (await fs.readdir(dir)).sort()){const full=path.join(dir,file),stat=await fs.stat(full);if(stat.isDirectory())await inventory(full);else entries.push({path:path.relative(dist,full).replaceAll('\\','/'),bytes:stat.size,sha256:crypto.createHash('sha256').update(await fs.readFile(full)).digest('hex')});}}
await inventory(dist);await fs.writeFile(path.join(dist,'asset-manifest.json'),JSON.stringify({format:1,version:JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version,sourceCommit:process.env.GITHUB_SHA||null,files:entries},null,2)+'\n');
console.log(`Built ${entries.length} static files, ${(entries.reduce((n,f)=>n+f.bytes,0)/1024/1024).toFixed(1)} MiB. No network or font files required.`);
