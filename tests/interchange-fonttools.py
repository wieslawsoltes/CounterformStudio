"""Generated fonts only: fontTools cmap14 oracle, container decoding and HarfBuzz shaping."""
from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import json, subprocess
from fontTools.ttLib import TTFont, TTCollection
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
from font_oracle import shape, version, api, ptr, uint, C, blob, face, font as hb_font, font_funcs, destroy
get_variant=api('hb_font_get_variation_glyph',C.c_int,ptr,uint,uint,C.POINTER(uint))
def variation_glyph(raw,cp,selector):
    b=blob(raw,len(raw),0,None,None);f=face(b,0);ft=hb_font(f)
    try:
        font_funcs(ft);gid=uint();supported=get_variant(ft,cp,selector,C.byref(gid));return bool(supported),gid.value
    finally:
        for name,value in [('font',ft),('face',f),('blob',b)]:destroy[name](value)
root=Path(__file__).resolve().parents[1];checks=[]
with TemporaryDirectory(prefix='counterform-uvs-') as temporary:
    tmp=Path(temporary);subprocess.run(['node','tests/interchange-fixtures.mjs',str(tmp)],cwd=root,check=True)
    cases=json.loads((tmp/'cases.json').read_text())
    for name in cases['formats']:
        raw=(tmp/(name+'.bin')).read_bytes();font=TTFont(BytesIO(raw));font.ensureDecompiled()
        cmap14=[t for t in font['cmap'].tables if t.format==14]
        assert len(cmap14)==1 and cmap14[0].platformID==0 and cmap14[0].platEncID==5
        expected={}
        for r in cases['mappings']:expected.setdefault(r['selector'],[]).append((r['unicode'],r['glyphName']))
        assert cmap14[0].uvsDict=={k:sorted(v) for k,v in expected.items()},(name,cmap14[0].uvsDict,expected)
        oracle=CmapSubtable.newSubtable(14);oracle.platformID=0;oracle.platEncID=5;oracle.language=0;oracle.cmap={};oracle.uvsDict=expected
        assert cmap14[0].compile(font)==oracle.compile(font),(name,'independent binary cmap14 mismatch')
        # HarfBuzz consumes raw sfnt, not compressed web containers.
        font.flavor=None;out=BytesIO();font.save(out);sfnt=out.getvalue()
        for r in cases['mappings']:
            target=r['glyphName'] if r['glyphName'] is not None else font.getBestCmap()[r['unicode']]
            assert variation_glyph(sfnt,r['unicode'],r['selector'])==(target!='.notdef',font.getGlyphID(target)),(name,r)
            if r['selector']>=0xfe00 and target!='.notdef':
                result=shape(sfnt,chr(r['unicode'])+chr(r['selector']))
                assert len(result)==1 and result[0][0]==font.getGlyphID(target),(name,r,result)
        # Compare actual script shaping against a fontTools-built replacement,
        # including Mongolian selectors and a deliberate glyph-zero mapping.
        font['cmap'].tables=[t for t in font['cmap'].tables if t.format!=14]+[oracle]
        stream=BytesIO();font.save(stream)
        for r in cases['mappings']:
            text=chr(r['unicode'])+chr(r['selector'])
            assert shape(sfnt,text)==shape(stream.getvalue(),text),(name,r,'shaping oracle')
        checks.append(name);print('PASS',name,'UVS fontTools table bytes and native HarfBuzz glyph selection')
    collection=(tmp/'fonts.ttc').read_bytes();fonts=TTCollection(BytesIO(collection)).fonts
    for index,font in enumerate(fonts):
        assert shape(collection,'A\ufe0f',face_index=index)[0][0]==font.getGlyphID('V')
    checks.append('TTC mixed flavors');print('PASS mixed TTC preserves and shapes variation sequences')
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/interchange-font-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'harfbuzz':version,'oracle':'fontTools format14 binary equality and native HarfBuzz exact glyph IDs'},indent=2)+'\n')
