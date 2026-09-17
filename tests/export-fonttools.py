"""Independent CFF2, WOFF2, HVAR/MVAR checks using procedural temporary fixtures only."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json, subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.boundsPen import BoundsPen
root=Path(__file__).resolve().parents[1]
checks=[]
with TemporaryDirectory(prefix='counterform-export-') as tmp:
    tmp=Path(tmp)
    subprocess.run(['node','tests/export-fixtures.mjs',str(tmp)],cwd=root,check=True)
    oracle=json.loads((tmp/'oracle.json').read_text())['samples']
    for name in ['static-cff2.otf','variable-cff2.otf','metrics.ttf']:
        with TTFont(tmp/name,checkChecksums=2) as reference:
            for extension in ['', '.woff2','.compressed.woff2']:
                with TTFont(tmp/(name+extension),checkChecksums=2) as font:
                    font.ensureDecompiled()
                    assert font.getGlyphOrder()==reference.getGlyphOrder()
                    for tag in reference.reader.keys():
                        assert font.reader[tag]==reference.reader[tag], (name,extension,tag)
                    if 'CFF2' in font:
                        assert 'CFF ' not in font
                        top=font['CFF2'].cff.topDictIndex[0]
                        for charstring in top.CharStrings.values():
                            charstring.decompile()
                            assert not {'endchar','return'}.intersection(x for x in charstring.program if isinstance(x,str))
                    if 'fvar' in font:
                        assert 'HVAR' in font and 'MVAR' in font
                        for sample in oracle:
                            glyphs=font.getGlyphSet(location={'wght':sample['wght']});pen=BoundsPen(glyphs);glyphs['A'].draw(pen)
                            assert abs(glyphs['A'].width-sample['width'])<1e-4
                            expected=sample['bounds']
                            assert all(abs(a-expected[k])<1.1 for a,k in zip(pen.bounds,['minX','minY','maxX','maxY'])),(name,sample,pen.bounds)
                            instance=instantiateVariableFont(font,{'wght':sample['wght']},inplace=False)
                            assert 'fvar' not in instance
                            assert abs(instance['hmtx']['A'][0]-sample['width'])<=.5
                            os2=instance['OS/2'];wanted=sample['metrics']
                            for actual,key in [(os2.sTypoAscender,'ascender'),(os2.sTypoDescender,'descender'),(os2.sTypoLineGap,'lineGap'),(os2.sCapHeight,'capHeight'),(os2.sxHeight,'xHeight')]:
                                assert abs(actual-wanted[key])<=.5,(name,sample['wght'],key,actual,wanted[key])
                            instance.close()
                checks.append(name+extension+': every table roundtrips; CFF2/HVAR/MVAR match seven source instances where variable')
                print('PASS',checks[-1])
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/export-fonttools-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks},indent=2)+'\n')
