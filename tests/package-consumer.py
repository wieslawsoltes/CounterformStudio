"""Verify packaged entrypoints in a fresh consumer, without registry access."""
from pathlib import Path
import tempfile, tarfile, subprocess, json, hashlib, base64
root = Path(__file__).resolve().parents[1]
version = json.loads((root/'package.json').read_text())['version']
manifest = json.loads((root/'artifacts/npm/manifest.json').read_text())
assert manifest['version'] == version, 'Release manifest version differs from the workspace.'
assert manifest['published'] is False, 'Packing must not claim registry publication.'
records = {entry['filename']: entry for entry in manifest['packages']}
assert len(records) == len(manifest['packages']), 'Duplicate package archive in manifest.'
assert len({entry['name'] for entry in records.values()}) == len(records), 'Duplicate package identity.'
assert set(records) == {file.name for file in (root/'artifacts/npm').glob('*.tgz')}, 'Archive inventory differs from manifest.'
for filename, entry in records.items():
    raw = (root/'artifacts/npm'/filename).read_bytes()
    assert entry['version'] == version, f'{filename}: package version mismatch'
    assert entry['bytes'] == len(raw), f'{filename}: length mismatch'
    assert entry['sha256'] == hashlib.sha256(raw).hexdigest(), f'{filename}: SHA-256 mismatch'
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(raw).digest()).decode('ascii')
    assert entry['integrity'] == integrity, f'{filename}: SRI mismatch'
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
            if meta['name'] == '@wieslawsoltes/counterform-workbench':
                for css in ['styles.css','legacy.css','workspace.css','advanced.css']:
                    assert 'package/src/'+css in entries, 'Missing layered workspace style: '+css
                assert 'package/src/workspace-preferences.js' in entries
                assert 'package/types/workspace-preferences.d.ts' in entries
            record = records[file.name]
            assert meta['name'] == record['name'] and meta['version'] == version, 'Archive metadata mismatch.'
            assert meta.get('dependencies', {}) == record['dependencies'], 'Archive dependencies differ from manifest.'
            for dependency, constraint in meta.get('dependencies', {}).items():
                if dependency.startswith('@wieslawsoltes/counterform-'):
                    assert constraint == version, f'{dependency}: internal release dependency mismatch'
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
import {encodeCollection,readCollection,extractCollectionFace} from '@wieslawsoltes/counterform-binary';
import {planMetricEdits,applyMetricPlan} from '@wieslawsoltes/counterform-metrics';
const {normalizeWorkspacePreferences}=await import('@wieslawsoltes/counterform-workbench/preferences');
assert.equal(normalizeWorkspacePreferences({theme:'dark'}).canvas,'paper');
const doc=createDemoFont(); assert.equal(doc.data.glyphs.length,102);
const {readSVGOutlines}=await import('@wieslawsoltes/counterform-svg');
assert.equal(readSVGOutlines('<svg><g transform="translate(10 20)"><path d="M0 0A10 10 0 0 1 20 0Z"/></g></svg>').contours.length,1);
doc.data.variationSequences=[{unicode:65,selector:65039,glyphId:doc.glyph('V').id}];
const {readCmapUVS,readDirectory:directory}=await import('@wieslawsoltes/counterform-binary');
assert.equal(readCmapUVS(directory(compileTrueType(doc)).tables.get('cmap').bytes).length,1);
for(const compile of [compileTrueType,compileOpenTypeCFF,compileVariableTrueType])assert(compile(doc).byteLength>1000);
assert(new History(doc));
const mid=doc.data.masters[0].id;applyMetricPlan(doc,planMetricEdits(doc,mid,[{glyphId:'A',lsb:50,rsb:60}]));assert.equal(doc.metrics('A',mid).lsb,50);
const faceBytes=compileTrueType(doc),collection=encodeCollection([faceBytes,compileOpenTypeCFF(doc)]);assert.equal(readCollection(collection).faces.length,2);assert(extractCollectionFace(collection,0).length>1000);
for(const p of ['geometry','binary','commands','compute','storage','automation','ufo','validation','opentype','icons','menus','construction','colrv1','modifiers','journal','preservation','cff2','woff2','varstore','svg'])assert(Object.keys(await import('@wieslawsoltes/counterform-'+p)).length);
doc.glyph('A').colorLayers=[{glyphId:doc.glyph('O').id,paletteIndex:1}];
doc.glyph('A').colorPaint={type:'glyph',glyphId:doc.glyph('A').id,paint:{type:'linear',x0:0,y0:0,x1:600,y1:0,x2:0,y2:700,stops:[{offset:0,paletteIndex:0},{offset:1,paletteIndex:1}]}};
doc.data.paletteLabels=['Day'];doc.data.paletteEntryLabels=doc.data.palettes[0].map((_,i)=>'Color '+i);
assert.equal(new DataView(compileColorTables(doc.data,doc.data.glyphs).get('COLR').buffer).getUint16(0),1);
const compiler=new CompilerClient({workerFactory:()=>new Worker(new URL(import.meta.resolve('@wieslawsoltes/counterform-compiler/node-worker')))});
try {
    const {analyzeContours}=await import('@wieslawsoltes/counterform-geometry');
    const {decodeAvar}=await import('@wieslawsoltes/counterform-varstore');
    const {readDirectory}=await import('@wieslawsoltes/counterform-binary');
    assert(analyzeContours(doc.resolve(doc.glyph('A').id)).converged);
    doc.data.axes[0].map=[[-1,-1],[0,0],[.5,.25],[1,1]];
    doc.data.features='markClass V <anchor 0 0> @TOP;feature mark {pos base A <anchor 300 700> mark @TOP;} mark;';
    const mapped=await compiler.compile(doc,{format:'variable-cff2'});
    assert.deepEqual(decodeAvar(readDirectory(mapped.bytes).tables.get('avar').bytes,1)[0],doc.data.axes[0].map);
    const {bytes}=await compiler.compile(doc,{format:'ttf'});
    assert.deepEqual(bytes,compileTrueType(doc));
    assert((await compiler.inspect(doc)).report.tables.some(t=>t.tag==='COLR'));
    for(const format of ['cff2','variable-cff2','woff2','variable-woff2','cff2-woff2'])assert((await compiler.compile(doc,{format})).bytes.length>1000);
    const {captureOriginal,restoreOriginal}=await import('@wieslawsoltes/counterform-preservation');const archive=await captureOriginal(bytes,doc.data);assert.deepEqual(await restoreOriginal(archive),bytes);
    const {RevisionJournal,MemoryJournalBackend}=await import('@wieslawsoltes/counterform-journal');const j=new RevisionJournal(new MemoryJournalBackend());await j.append(doc.data);assert.equal((await j.recover(doc.data.id)).issue,null);await j.close();
} finally {compiler.dispose();}
console.log('PASS fresh extracted package consumer: static TTF, CFF, variable TTF, COLRv0/v1, CPALv1, GPOS attachments, avar, measurements, cmap14, SVG import, real Node compiler worker and headless module imports');
''')
    result = subprocess.run(['node','consumer.mjs'],cwd=base,text=True,capture_output=True)
    print(result.stdout, end='')
    if result.returncode:
        print(result.stderr)
        raise SystemExit(result.returncode)
    (root/'test-results/package-report.json').write_text(json.dumps({
        'archivesVerified':count,'freshConsumer':True,'fontFilesIncluded':False,
        'checks':['Release version, archive inventory, SHA-256/SRI, dependencies, declarations, entrypoints and font-file exclusion',
                  'fresh extracted consumer TTF/CFF/variable TTF compilation',
                  'headless package imports with real vendor dependencies',
                  'real packaged Node-worker entry compiles byte-identical COLRv1/CPALv1 fonts'],
        'stdout':result.stdout},indent=2)+'\n')
