"""Independent OpenType and UFO source verification. Never exports fixture fonts to the release."""
from pathlib import Path
from tempfile import TemporaryDirectory
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.varLib.models import VariationModel
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ufoLib import UFOReader
import json, subprocess, zipfile, math
root=Path(__file__).resolve().parents[1]
checks=[]
def passed(name):
    checks.append(name);print('PASS',name)
with TemporaryDirectory(prefix='counterform-font-test-') as tmp:
    tmp=Path(tmp)
    subprocess.run(['node','tests/fixtures.mjs',str(tmp)],cwd=root,check=True)
    for filename in ['static.ttf','static.otf','static.woff','variable.ttf']:
        font=TTFont(tmp/filename,checkChecksums=2)
        font.ensureDecompiled()
        assert font['maxp'].numGlyphs==103
        assert font.getBestCmap()[65]=='A'
        assert font['hmtx']['A'][0]==640
        glyphs=font.getGlyphSet()
        pen=BoundsPen(glyphs);glyphs['O'].draw(pen)
        assert pen.bounds is not None and pen.bounds[2]-pen.bounds[0]>400
        assert 'GPOS' in font and 'GSUB' in font and 'GDEF' in font
        lookup_types={lookup.LookupType for lookup in font['GPOS'].table.LookupList.Lookup}
        assert {2,4}.issubset(lookup_types)
        sub_types={lookup.LookupType for lookup in font['GSUB'].table.LookupList.Lookup}
        assert {1,4}.issubset(sub_types)
        assert font['kern'].kernTables[0].kernTable['A','V']==-85
        font.close()
        passed(filename+': all tables independently decompile, names/cmap/metrics/outlines/layout match')
    for filename in ['color.ttf','color.otf','color-variable.ttf']:
        with TTFont(tmp/filename, checkChecksums=2) as font:
            font.ensureDecompiled()
            assert font['COLR'].version == 0 and font['CPAL'].version == 0
            layers=font['COLR'].ColorLayers['A']
            assert [(x.name,x.colorID) for x in layers] == [('A',0),('O',1),('H',65535)]
            palettes=font['CPAL'].palettes
            assert len(palettes)==2 and all(len(p)==2 for p in palettes)
            assert [(c.red,c.green,c.blue,c.alpha) for c in palettes[0]]==[(255,51,0,255),(0,102,255,128)]
            assert [(c.red,c.green,c.blue,c.alpha) for c in palettes[1]]==[(51,255,0,255),(136,0,255,170)]
        passed(filename+': independent COLRv0 layers, CPAL RGBA channels, palettes and foreground indices')
    with TTFont(tmp/'color-variable.ttf') as font:
        instance=instantiateVariableFont(font,{'wght':600},inplace=False)
        assert [(x.name,x.colorID) for x in instance['COLR'].ColorLayers['A']] == [('A',0),('O',1),('H',65535)]
        assert instance['CPAL'].palettes[0][1].alpha == 128
        instance.close()
    passed('variable color font: independent instantiation preserves palette alpha and layer references')
    widths=[]
    for wght in [300,400,500,600,800]:
        font=TTFont(tmp/'variable.ttf')
        instance=instantiateVariableFont(font,{'wght':wght},inplace=True)
        assert 'fvar' not in instance
        glyphs=instance.getGlyphSet();pen=BoundsPen(glyphs);glyphs['A'].draw(pen)
        widths.append(pen.bounds[2]-pen.bounds[0])
        assert instance['hmtx']['A'][0]==640
        instance.close()
    assert all(a<b for a,b in zip(widths,widths[1:])),widths
    passed('gvar: 5 independently instantiated weights produce monotonically widening A outlines')
    oracle=json.loads((tmp/'variation-oracle.json').read_text())
    model=VariationModel(oracle['locations'],axisOrder=['wght','wdth'])
    for q,want in zip(oracle['queries'],oracle['results']):
        got=model.interpolateFromMasters(q,oracle['values'])
        assert abs(got-want)<1e-9,(q,got,want)
    passed('sparse multi-axis interpolation matches fontTools at all reference locations')
    with zipfile.ZipFile(tmp/'source.ufoz') as z:
        assert z.testzip() is None
        z.extractall(tmp/'ufo')  # fixtures are generated locally, not untrusted input
    folder=next((tmp/'ufo').glob('*.ufo'))
    reader=UFOReader(folder,validate=True)
    layer_names=reader.getLayerNames();assert len(layer_names)==3
    gs=reader.getGlyphSet();assert len(gs)==103
    class Glyph: pass
    g=Glyph();gs.readGlyph('O',g);assert g.width==640
    assert reader.readKerning()[('A','V')]==-85
    reader.close()
    passed('UFO3: independent layer/glyph/metrics/kerning reader accepts source archive')
report={'tool':'fontTools','checks':checks,'passed':len(checks),'fixturePolicy':'Generated from original procedural source in temporary directory; removed after verification.'}
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/fonttools-report.json').write_text(json.dumps(report,indent=2))
