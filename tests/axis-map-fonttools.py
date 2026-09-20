"""Independent CFF2, WOFF2, HVAR/MVAR checks using procedural temporary fixtures only."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json, subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.boundsPen import BoundsPen
root=Path(__file__).resolve().parents[1]
checks=[]
with TemporaryDirectory(prefix='counterform-axis-map-') as tmp:
    tmp=Path(tmp)
    subprocess.run(['node','tests/axis-map-fixtures.mjs',str(tmp)],cwd=root,check=True)
    oracle=json.loads((tmp/'oracle.json').read_text())['samples']
    for name in ['static-cff2.otf','variable-cff2.otf','metrics.ttf']:
        with TTFont(tmp/name,checkChecksums=2) as reference:
            for extension in ['', '.woff2','.compressed.woff2']:
                with TTFont(tmp/(name+extension),checkChecksums=2) as font:
                    font.ensureDecompiled()
                    assert font.getGlyphOrder()==reference.getGlyphOrder()
                    for tag in reference.reader.keys():
                        if tag=='head' and extension:
                            actual=bytearray(font.reader[tag]);expected_head=bytearray(reference.reader[tag]);actual[8:12]=expected_head[8:12]=b'\0'*4;expected_head[16:18]=(int.from_bytes(expected_head[16:18],'big')|0x0800).to_bytes(2,'big');assert actual==expected_head
                        else:assert font.reader[tag]==reference.reader[tag], (name,extension,tag)
                    if 'CFF2' in font:
                        assert 'CFF ' not in font
                        top=font['CFF2'].cff.topDictIndex[0]
                        for charstring in top.CharStrings.values():
                            charstring.decompile()
                            assert not {'endchar','return'}.intersection(x for x in charstring.program if isinstance(x,str))
                    if 'fvar' in font:
                        assert font['avar'].segments['wght']=={-1:-1,-.5:-.75,0:0,.5:.25,1:1}
                        assert 'HVAR' in font and 'MVAR' in font
                        assert font['GDEF'].table.Version==0x00010003
                        assert any(l.LookupType==4 for l in font['GPOS'].table.LookupList.Lookup), 'Anchor oracle must not be vacuous'
                        assert all('A' in s['anchors'] and 'acutecomb' in s['anchors'] for s in oracle)
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
                            gpos=instance['GPOS'].table
                            pairs=[p for lookup in gpos.LookupList.Lookup if lookup.LookupType==2 for sub in lookup.SubTable for left,ps in zip(sub.Coverage.glyphs,sub.PairSet) if left=='A' for p in ps.PairValueRecord if p.SecondGlyph=='V']
                            assert len(pairs)==1 and abs(pairs[0].Value1.XAdvance-sample['kerning'])<=.5,(name,sample['wght'],pairs[0].Value1.XAdvance,sample['kerning'])
                            for lookup in gpos.LookupList.Lookup:
                                if lookup.LookupType!=4:continue
                                for sub in lookup.SubTable:
                                    for glyph,record in zip(sub.MarkCoverage.glyphs,sub.MarkArray.MarkRecord):
                                        expected=next(a for a in sample['anchors'][glyph] if a['name'].startswith('_'))
                                        assert abs(record.MarkAnchor.XCoordinate-expected['x'])<=.5
                                        assert abs(record.MarkAnchor.YCoordinate-expected['y'])<=.5
                                    for glyph,record in zip(sub.BaseCoverage.glyphs,sub.BaseArray.BaseRecord):
                                        expected=next(a for a in sample['anchors'][glyph] if a['name']=='top')
                                        anchor=next(a for a in record.BaseAnchor if a is not None)
                                        assert abs(anchor.XCoordinate-expected['x'])<=.5
                                        assert abs(anchor.YCoordinate-expected['y'])<=.5
                            instance.close()
                checks.append(name+extension+': table bytes retained except mandated head normalization; CFF2/HVAR/MVAR/GPOS match fifteen mapped source instances where variable')
                print('PASS',checks[-1])
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/axis-map-fonttools-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks},indent=2)+'\n')
