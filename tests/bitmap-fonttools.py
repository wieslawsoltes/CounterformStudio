"""Independent fontTools bitmap-table builder/reader tests. Procedural PNG/fonts only."""
from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import base64,json,subprocess
from fontTools.ttLib import TTFont,newTable
from fontTools.ttLib.tables.sbixStrike import Strike
from fontTools.ttLib.tables.sbixGlyph import Glyph
from fontTools.ttLib.tables import E_B_L_C_
from PIL import Image

root=Path(__file__).resolve().parents[1];checks=[]
def passed(name):checks.append(name);print('PASS',name,flush=True)
with TemporaryDirectory(prefix='counterform-bitmap-') as directory:
    tmp=Path(directory)
    subprocess.run(['node','tests/bitmap-fonttools.mjs',directory],cwd=root,check=True)
    source=json.loads((tmp/'source.json').read_text());data=source['data'];order=[next(g['name'] for g in data['glyphs'] if g['id']==id) for id in source['order']]
    strikes={s['id']:s for s in data['bitmapFont']['strikes']}
    expected={s['ppem']:{g['name']:e for g in data['glyphs'] for e in g.get('bitmaps',[]) if e['strikeId']==s['id']} for s in strikes.values()}
    # Build sbix using fontTools' own compiler, independently of our offsets and dupe encoding.
    base=TTFont(tmp/'ttf.bin');binary_order=base.getGlyphOrder();assert all(binary_order[order.index(name)]==name for name in ['A','B','V']);order=binary_order;oracle=newTable('sbix');oracle.version=1;oracle.flags=1;oracle.strikes={}
    for ppem,entries in sorted(expected.items()):
        strike=Strike(ppem=ppem,resolution=72)
        for name,e in entries.items():strike.glyphs[name]=Glyph(glyphName=name,originOffsetX=e['x'],originOffsetY=e['y'],graphicType='png ',imageData=base64.b64decode(e['png']))
        oracle.strikes[ppem]=strike
    sbixraw=oracle.compile(base);(tmp/'oracle.sbix').write_bytes(sbixraw)
    oracles=[{'type':'sbix','name':'oracle','order':order}]
    for filename in source['formats']:
        font=TTFont(tmp/(filename+'.bin'));font.ensureDecompiled();assert font.getGlyphOrder()==order
        assert sorted(font['sbix'].strikes)==[64,96]
        for ppem,entries in expected.items():
            strike=font['sbix'].strikes[ppem];assert strike.resolution==72
            for name,e in entries.items():
                g=strike.glyphs[name];assert (g.originOffsetX,g.originOffsetY)==(e['x'],e['y'])
                png=strike.glyphs[g.referenceGlyphName].imageData if g.graphicType=='dupe' else g.imageData
                assert png==base64.b64decode(e['png'])
                Image.open(BytesIO(png)).load()
        cblc=font['CBLC'];cbdt=font['CBDT'];assert cblc.version==cbdt.version==3.0
        for i,strike in enumerate(cblc.strikes):
            s=strike.bitmapSizeTable;assert s.ppemX==s.ppemY and s.bitDepth==32
            for name,e in expected[s.ppemX].items():
                g=cbdt.strikeData[i][name];m=g.metrics;png=base64.b64decode(e['png']);w,h=Image.open(BytesIO(png)).size
                x=getattr(m,'BearingX',None) if hasattr(m,'BearingX') else m.horiBearingX
                y=getattr(m,'BearingY',None) if hasattr(m,'BearingY') else m.horiBearingY
                advance=m.Advance if hasattr(m,'Advance') else m.horiAdvance
                assert (m.width,m.height,x,y)==(w,h,e['x'],e['y']+h)
                width=font['hmtx'][name][0];assert advance==e.get('advance',int(width*s.ppemX/data['info']['unitsPerEm']+.5))
                if 'vertical' in e:assert (m.vertBearingX,m.vertBearingY,m.vertAdvance)==tuple(e['vertical'][k] for k in ['x','y','advance'])
                assert g.imageData==png
        out=BytesIO();font.save(out);TTFont(BytesIO(out.getvalue())).ensureDecompiled()
        passed(filename+': multiple PNG strikes, exact pixels, metrics and independent fontTools reserialization')
    # fontTools re-encodes each index format independently. Our decoder must accept
    # its resulting offsets/padding and shared PNG19 metrics, not only its own output.
    small_order=['.notdef','A','B','C']
    for index in [1,2,3,4,5]:
        font=TTFont();font.setGlyphOrder(small_order)
        cblc=newTable('CBLC');font['CBLC']=cblc;cblc.decompile((tmp/f'index-{index}.cblc').read_bytes(),font)
        cbdt=newTable('CBDT');font['CBDT']=cbdt;cbdt.decompile((tmp/f'index-{index}.cbdt').read_bytes(),font)
        pngs={name:base64.b64encode(g.imageData).decode('ascii') for name,g in cbdt.strikeData[0].items()}
        cb_data=cbdt.compile(font);cl_data=cblc.compile(font)
        name=f'reencoded-{index}';(tmp/(name+'.cbdt')).write_bytes(cb_data);(tmp/(name+'.cblc')).write_bytes(cl_data)
        oracles.append({'type':'cbdt','name':name,'order':small_order,'pngs':pngs})
    # fontTools-authored dupe with independent, explicitly encoded matching origins.
    oracle.strikes[64].glyphs['V']=Glyph(glyphName='V',referenceGlyphName='A',originOffsetX=2,originOffsetY=3,graphicType='dupe')
    (tmp/'duplicate.sbix').write_bytes(oracle.compile(base));oracles.append({'type':'sbix','name':'duplicate','order':order})
    (tmp/'oracles.json').write_text(json.dumps(oracles));subprocess.run(['node','tests/bitmap-fonttools.mjs',directory,'decode'],cwd=root,check=True)
    for case in json.loads((tmp/'decoded.json').read_text()):
        if case['type']=='sbix':
            for ppem,entries in expected.items():
                for name,e in entries.items():
                    got=next(v for v in case['actual'][name] if v['strikeId']=='sbix-'+str([64,96].index(ppem)))
                    assert (got['x'],got['y'],got['png'])==(e['x'],e['y'],e['png'])
        else:
            assert set(case['actual'])==set(case['pngs'])
            for name,png in case['pngs'].items():
                got=case['actual'][name][0];assert (got['x'],got['y'],got['advance'],got['png'])==(2,-2,9,png)
                assert got['vertical']=={'x':-3,'y':4,'advance':10}
        passed(case['name']+': independently compiled fontTools tables reconstructed by JavaScript')
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/bitmap-fonttools-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'oracle':'fontTools independent bitmap compiler and decoder; Pillow PNG pixels','systemFontsRead':False},indent=2)+'\n')
