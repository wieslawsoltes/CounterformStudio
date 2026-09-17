"""Verify packaged entrypoints in a fresh consumer, without registry access."""
from pathlib import Path
import tempfile, tarfile, subprocess, json
root = Path(__file__).resolve().parents[1]
fonts = {'.ttf','.otf','.woff','.woff2','.ttc','.otc','.eot','.pfb','.pfa','.afm','.pcf','.bdf'}
with tempfile.TemporaryDirectory(prefix='counterform-consumer-') as tmp:
    base = Path(tmp)
    scope = base/'node_modules/@wieslawsoltes'
    scope.mkdir(parents=True)
    count = 0
    for file in sorted((root/'artifacts/npm').glob('*.tgz')):
        with tarfile.open(file) as archive:
            entries = archive.getnames()
            assert 'package/types/index.d.ts' in entries and 'package/src/index.js' in entries
            assert not any(Path(n).suffix.lower() in fonts for n in entries)
            meta = json.load(archive.extractfile('package/package.json'))
            target = scope/meta['name'].split('/')[1]
            stage = base/f'stage-{count}'
            stage.mkdir()
            archive.extractall(stage, filter='data')
            (stage/'package').rename(target)
            count += 1
    assert count == len(list((root/'packages').glob('*/package.json'))), 'Run npm run pack:all first.'
    # Real vendor dependencies are linked; Counterform packages are extracted copies.
    for folder in (root/'vendor').iterdir():
        pkg = folder/'package.json'
        if pkg.exists():
            name = json.loads(pkg.read_text())['name']
            link = base/'node_modules'/name
            link.parent.mkdir(exist_ok=True, parents=True)
            link.symlink_to(folder, target_is_directory=True)
    (base/'consumer.mjs').write_text('''import assert from 'node:assert/strict';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileTrueType,compileOpenTypeCFF} from '@wieslawsoltes/counterform-font-io';
import {compileVariableTrueType} from '@wieslawsoltes/counterform-variations';
import {History} from '@wieslawsoltes/counterform-history';
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
import {compileColorTables} from '@wieslawsoltes/counterform-color';
import {Worker} from 'node:worker_threads';
const doc=createDemoFont(); assert.equal(doc.data.glyphs.length,102);
for(const compile of [compileTrueType,compileOpenTypeCFF,compileVariableTrueType])assert(compile(doc).byteLength>1000);
assert(new History(doc));
for(const p of ['geometry','binary','commands','compute','storage','automation','ufo','validation','opentype','icons','menus','construction'])assert(Object.keys(await import('@wieslawsoltes/counterform-'+p)).length);
doc.glyph('A').colorLayers=[{glyphId:doc.glyph('O').id,paletteIndex:1}];
assert(compileColorTables(doc.data,doc.data.glyphs).has('COLR'));
const compiler=new CompilerClient({workerFactory:()=>new Worker(new URL(import.meta.resolve('@wieslawsoltes/counterform-compiler/node-worker')))});
try {
    const {bytes}=await compiler.compile(doc,{format:'ttf'});
    assert.deepEqual(bytes,compileTrueType(doc));
    assert((await compiler.inspect(doc)).report.tables.some(t=>t.tag==='COLR'));
} finally {compiler.dispose();}
console.log('PASS fresh extracted package consumer: static TTF, CFF, variable TTF, COLRv0, real Node compiler worker and headless module imports');
''')
    result = subprocess.run(['node','consumer.mjs'],cwd=base,text=True,capture_output=True)
    print(result.stdout, end='')
    if result.returncode:
        print(result.stderr)
        raise SystemExit(result.returncode)
    (root/'test-results/package-report.json').write_text(json.dumps({
        'archivesVerified':count,'freshConsumer':True,'fontFilesIncluded':False,
        'checks':['All archive manifests, declarations, entrypoints and font-file exclusion',
                  'fresh extracted consumer TTF/CFF/variable TTF compilation',
                  'headless package imports with real vendor dependencies',
                  'real packaged Node-worker entry compiles byte-identical color fonts'],
        'stdout':result.stdout},indent=2)+'\n')
