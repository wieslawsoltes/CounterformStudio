"""Independent COLRv1 compiler oracle. Only procedural test fonts in a temp folder."""
from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import json
import subprocess
from fontTools.ttLib import TTFont
from fontTools.colorLib.builder import buildCOLR
from fontTools.ttLib.tables.otTables import PaintFormat, CompositeMode, ExtendMode

root=Path(__file__).resolve().parents[1]
checks=[]
with TemporaryDirectory(prefix='counterform-colrv1-') as temp:
    tmp=Path(temp)
    subprocess.run(['node','tests/colrv1-fonttools.mjs',temp],cwd=root,check=True)
    data=json.loads((tmp/'source.json').read_text());src=data['source'];ids={g['id']:g['name'] for g in src['glyphs']}
    def oracle(p):
        kind=p['type'];out={}
        formats={'layers':1,'solid':2,'linear':4,'radial':6,'sweep':8,'glyph':10,'colrGlyph':11,'transform':12,'translate':14,'scale':16,'scaleAroundCenter':18,'scaleUniform':20,'scaleUniformAroundCenter':22,'rotate':24,'rotateAroundCenter':26,'skew':28,'skewAroundCenter':30,'composite':32}
        out['Format']=formats[kind]
        for k,v in p.items():
            if k=='type':continue
            if k=='paint':out['Paint']=oracle(v)
            elif k=='glyphId':out['Glyph']=ids[v]
            elif k=='layers':out['Layers']=[oracle(c) for c in v]
            elif k=='source':out['SourcePaint']=oracle(v)
            elif k=='backdrop':out['BackdropPaint']=oracle(v)
            elif k=='mode':out['CompositeMode']=getattr(CompositeMode,v.upper())
            elif k=='matrix':out['Transform']=dict(zip(['xx','yx','xy','yy','dx','dy'],v))
            elif k=='stops':out['ColorLine']={'Extend':getattr(ExtendMode,p.get('extend','pad').upper()),'ColorStop':[{'StopOffset':s['offset'],'PaletteIndex':s['paletteIndex'],'Alpha':s.get('alpha',1)} for s in v]}
            elif k=='extend':pass
            else:out[{'paletteIndex':'PaletteIndex','alpha':'Alpha'}.get(k,k)]=v
        if kind=='solid':out.setdefault('Alpha',1)
        return out
    base=TTFont(tmp/'ttf.otf');base.ensureDecompiled()
    expected=buildCOLR({g['name']:oracle(g['colorPaint']) for g in src['glyphs'] if g.get('colorPaint')},version=1,glyphMap=base.getReverseGlyphMap(),clipBoxes={g['name']:tuple(g['colorClip']) for g in src['glyphs'] if g.get('colorClip')},allowLayerReuse=False)
    # Compile and decode the oracle too, so angle/fixed-point normalization is independent.
    raw=expected.compile(base);expected.decompile(raw,base)
    def normalize(value,table):
        if isinstance(value,(list,tuple)):return [normalize(x,table) for x in value]
        if isinstance(value,dict):return {k:normalize(v,table) for k,v in value.items()}
        if hasattr(value,'Format') and value.Format==1 and hasattr(value,'FirstLayerIndex'):
            return {'Format':1,'Layers':[normalize(x,table) for x in table.LayerList.Paint[value.FirstLayerIndex:value.FirstLayerIndex+value.NumLayers]]}
        if hasattr(value,'getConverters'):
            result={c.name:normalize(getattr(value,c.name),table) for c in value.getConverters() if hasattr(value,c.name)}
            if hasattr(value,'Format'):result['Format']=value.Format
            return result
        return value
    want={r.BaseGlyph:normalize(r.Paint,expected.table) for r in expected.table.BaseGlyphList.BaseGlyphPaintRecord}
    expected_clip={g['name']:tuple(g['colorClip']) for g in src['glyphs'] if g.get('colorClip')}
    for filename in ['ttf.otf','cff.otf','variable.otf','cff2.otf','cff2-variable.otf','color.woff2']:
        f=TTFont(tmp/filename);f.ensureDecompiled();c=f['COLR'];p=f['CPAL']
        assert c.version==1 and p.version==1
        got={r.BaseGlyph:normalize(r.Paint,c.table) for r in c.table.BaseGlyphList.BaseGlyphPaintRecord}
        assert got==want,(filename,got,want)
        assert {k:(v.xMin,v.yMin,v.xMax,v.yMax) for k,v in c.table.ClipList.clips.items()}==expected_clip
        assert p.paletteTypes==[1,2]
        assert [f['name'].getDebugName(n) for n in p.paletteLabels]==['Day','Night']
        assert [f['name'].getDebugName(n) for n in p.paletteEntryLabels]==['Warm','Cool','Accent']
        if 'fvar' in f:
            assert f['name'].getDebugName(f['fvar'].axes[0].axisNameID)=='Weight'
            assert len(set(p.paletteLabels+p.paletteEntryLabels+[a.axisNameID for a in f['fvar'].axes]))==len(p.paletteLabels)+len(p.paletteEntryLabels)+len(f['fvar'].axes)
        # Ensure independent reserialization remains readable.
        output=BytesIO();f.save(output);TTFont(BytesIO(output.getvalue())).ensureDecompiled()
        checks.append(filename+': all static paints, clip boxes, CPAL labels and metadata match fontTools')
        print('PASS',checks[-1])
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/colrv1-fonttools-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'oracle':'fontTools colorLib builder and independent TTFont decoder','systemFontsRead':False},indent=2)+'\n')
