/** Static module-graph linker for the pinned compiler inputs; no runtime CDN or import maps. */
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createImportMap} from './importmap.mjs';
const root = path.resolve(import.meta.dirname,'..');
if (!vm.SourceTextModule) {
    execFileSync(process.execPath,['--experimental-vm-modules',import.meta.filename],{stdio:'inherit'});
} else {
    const output = path.join(root,'app/workers'), modules = path.join(output,'modules');
    await fs.rm(output,{recursive:true,force:true});
    await fs.mkdir(modules,{recursive:true});
    const {imports} = await createImportMap(root), seen = new Set(), records = [];
    const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    async function visit(file) {
        file = path.resolve(file);
        if (seen.has(file)) return;
        if (!file.startsWith(root+path.sep) || !['.js','.mjs'].includes(path.extname(file)))
            throw new Error('Invalid compiler module: '+file);
        seen.add(file);
        const original = await fs.readFile(file,'utf8');
        const dependencies = new vm.SourceTextModule(original,{identifier:file}).dependencySpecifiers;
        let code = original;
        for (const specifier of new Set(dependencies)) {
            const destination = specifier.startsWith('.') ? path.resolve(path.dirname(file),specifier)
                : imports[specifier] ? path.resolve(root,imports[specifier]) : null;
            if (!destination) throw new Error('Unresolved compiler dependency: '+specifier);
            const relative = path.relative(path.dirname(file),destination).replaceAll('\\','/');
            const target = relative.startsWith('.') ? relative : './'+relative;
            // This graph contains only static ES imports/exports. Parse the result again to
            // verify that every dependency is a relative URL. Dynamic loading is not supported.
            const expression = new RegExp(`(\\bfrom\\s*|\\bimport\\s*)(['"])${escape(specifier)}\\2`,'g');
            let replacements = 0;
            code = code.replace(expression,(_,prefix,quote) => {replacements++;return prefix+quote+target+quote;});
            if (!replacements) throw new Error('Unsupported import syntax: '+specifier);
            await visit(destination);
        }
        const verified = new vm.SourceTextModule(code,{identifier:file});
        if (verified.dependencySpecifiers.some(s => !s.startsWith('.'))) throw new Error('Bare worker dependency remains');
        const name = path.relative(root,file).replaceAll('\\','/'), dest = path.join(modules,name);
        await fs.mkdir(path.dirname(dest),{recursive:true}); await fs.writeFile(dest,code);
        records.push({path:name,sha256:crypto.createHash('sha256').update(code).digest('hex')});
    }
    await visit(path.join(root,'packages/compiler/src/worker.js'));
    await fs.writeFile(path.join(output,'compiler.js'),"import './modules/packages/compiler/src/worker.js';\n");
    await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({format:1,modules:records.sort((a,b)=>a.path.localeCompare(b.path))},null,2)+'\n');
    const licenses = path.join(output,'licenses'); await fs.mkdir(licenses,{recursive:true});
    for (const name of ['LICENSE','THIRD_PARTY_NOTICES.md']) await fs.copyFile(path.join(root,name),path.join(licenses,name));
    await fs.copyFile(path.join(root,'vendor/quikgraphweb/LICENSE'),path.join(licenses,'QuikGraphWeb-LICENSE'));
    console.log(`Built ${records.length} relative-URL compiler worker modules.`);
}
