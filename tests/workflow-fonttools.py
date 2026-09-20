"""Independent format decoding and actual HarfBuzz variable layout. Only generated fonts."""
from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import json,subprocess
from fontTools.ttLib import TTFont,TTCollection
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from font_oracle import shape,version
root=Path(__file__).resolve().parents[1];checks=[]
with TemporaryDirectory(prefix='counterform-workflows-') as temp:
    tmp=Path(temp);subprocess.run(['node','tests/workflow-fixtures.mjs',str(tmp)],cwd=root,check=True)
    for name,fea,text in json.loads((tmp/'cases.json').read_text()):
        # feaLib 4.63 parses NULL but its builder requires a named empty set.
        # An empty format-1 ConditionSet has exactly the same universal semantics.
        oracle_fea=fea.replace('variation calt NULL', 'conditionset Always {} Always; variation calt Always')
        expected=TTFont(tmp/'base.ttf');addOpenTypeFeaturesFromString(expected,oracle_fea);stream=BytesIO();expected.save(stream)
        wants={'en':stream.getvalue(),'tr':stream.getvalue()}
        if name=='language':
            # feaLib 4.63 merges per-tag FeatureVariation changes across language records.
            # Compile the unaffected language's defaults separately to check non-leakage.
            default=TTFont(tmp/'base.ttf');addOpenTypeFeaturesFromString(default,fea.split('variation')[0]);b=BytesIO();default.save(b);wants['en']=b.getvalue()
        for ext in ['ttf','otf']:
            raw=(tmp/(name+'.'+ext)).read_bytes();actual=TTFont(BytesIO(raw));actual.ensureDecompiled()
            for lang in ['en','tr']:
                for wght in [100,400,499,500,649,650,699,700,800,900]:
                    got=shape(raw,text,lang,{'wght':wght});want=shape(wants[lang],text,lang,{'wght':wght})
                    assert got==want,(name,ext,lang,wght,got,want)
        for wght in [400,650,800]:
            raw=(tmp/f'{name}-{wght}.ttf').read_bytes();actual=TTFont(BytesIO(raw));actual.ensureDecompiled()
            for lang in ['en','tr']:
                assert shape(raw,text,lang)==shape(wants[lang],text,lang,{'wght':wght}),(name,'static',lang,wght)
        checks.append(name);print('PASS',name,'variable TT/CFF2 and static instances match independent FEA/HarfBuzz')
    multi_expected=TTFont(tmp/'multi-base.ttf');addOpenTypeFeaturesFromString(multi_expected,(tmp/'multi.fea').read_text());stream=BytesIO();multi_expected.save(stream)
    for wght in [100,400,649,650,900]:
        for wdth in [75,100,109,110,125]:
            location={'wght':wght,'wdth':wdth}
            assert shape((tmp/'multi.ttf').read_bytes(),'AV',location=location)==shape(stream.getvalue(),'AV',location=location),(wght,wdth)
    checks.append('multi-axis AND conditions');print('PASS',checks[-1])
    for v in [1,2]:
        raw=(tmp/f'collection-{v}.ttc').read_bytes();c=TTCollection(BytesIO(raw));assert len(c.fonts)==4
        for i,f in enumerate(c.fonts):
            f.ensureDecompiled();original=(tmp/f'face-{i%3}.bin').read_bytes();extracted=(tmp/f'extracted-{v}-{i}.bin').read_bytes();TTFont(BytesIO(extracted)).ensureDecompiled()
            assert shape(raw,'AVo',face_index=i)==shape(original,'AVo')==shape(extracted,'AVo')
        checks.append(f'TTC{v} mixed-flavor collections');print('PASS',checks[-1])
    f=TTFont(tmp/'metrics.ttf');assert f['hmtx'].metrics['H'][1]==40;assert f['hmtx'].metrics['A'][1]==50
    for name,right in [('A',60),('H',60)]:assert f['hmtx'].metrics[name][0]-f['glyf'][name].xMax==right
    checks.append('compiled batch metrics');print('PASS',checks[-1])
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/workflows-font-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'harfbuzz':version,'oracle':'fontTools FEA compilation, TTCollection, native HarfBuzz across 10 weights and two languages'},indent=2)+'\n')
