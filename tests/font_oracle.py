"""Cross-compile procedural FEA fixtures and compare native HarfBuzz shaping.

No system font files are read. The platform HarfBuzz library is used strictly as
an independent layout engine. Generated test fonts stay in a temporary directory.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import ctypes as C
import ctypes.util
import json
import subprocess
from fontTools.ttLib import TTFont
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

root = Path(__file__).resolve().parents[1]
hb = C.CDLL(ctypes.util.find_library('harfbuzz') or 'libharfbuzz.so.0')
def api(name, result, *args):
    fn = getattr(hb, name); fn.restype = result; fn.argtypes = list(args); return fn
ptr, uint, sint = C.c_void_p, C.c_uint, C.c_int
class Info(C.Structure):
    _fields_ = [('codepoint',uint),('mask',uint),('cluster',uint),('var1',uint),('var2',uint)]
class Position(C.Structure):
    _fields_ = [('x_advance',sint),('y_advance',sint),('x_offset',sint),('y_offset',sint),('var',uint)]
class Feature(C.Structure):
    _fields_ = [('tag',uint),('value',uint),('start',uint),('end',uint)]
blob = api('hb_blob_create',ptr,C.c_char_p,uint,uint,ptr,ptr)
face = api('hb_face_create',ptr,ptr,uint)
font = api('hb_font_create',ptr,ptr)
font_funcs = api('hb_ot_font_set_funcs',None,ptr)
scale = api('hb_font_set_scale',None,ptr,sint,sint)
buffer = api('hb_buffer_create',ptr)
add = api('hb_buffer_add_utf8',None,ptr,C.c_char_p,sint,uint,sint)
properties = api('hb_buffer_guess_segment_properties',None,ptr)
language = api('hb_language_from_string',ptr,C.c_char_p,sint)
set_lang = api('hb_buffer_set_language',None,ptr,ptr)
shape_fn = api('hb_shape',None,ptr,ptr,C.POINTER(Feature),uint)
infos = api('hb_buffer_get_glyph_infos',C.POINTER(Info),ptr,C.POINTER(uint))
positions = api('hb_buffer_get_glyph_positions',C.POINTER(Position),ptr,C.POINTER(uint))
version = api('hb_version_string',C.c_char_p)().decode()
destroy = {n:api('hb_'+n+'_destroy',None,ptr) for n in ['blob','face','font','buffer']}
class Variation(C.Structure):
    _fields_=[('tag',uint),('value',C.c_float)]
set_variations=api('hb_font_set_variations',None,ptr,C.POINTER(Variation),uint)

def shape(raw, text, lang='en', location=None, face_index=0):
    b=blob(raw,len(raw),0,None,None); f=face(b,face_index); ft=font(f); buf=buffer()
    try:
        font_funcs(ft);scale(ft,1000,1000)
        if location:
            values=(Variation*len(location))(*(Variation(int.from_bytes(k.encode(),'big'),v) for k,v in location.items()));set_variations(ft,values,len(values))
        data=text.encode();add(buf,data,len(data),0,len(data));set_lang(buf,language(lang.encode(),-1));properties(buf)
        features=(Feature*5)(*(Feature(int.from_bytes(tag.encode(),'big'),1,0,0xffffffff) for tag in ['curs','mark','mkmk','calt','liga']))
        shape_fn(ft,buf,features,len(features));n=uint();i=infos(buf,C.byref(n));p=positions(buf,C.byref(n))
        return [(i[j].codepoint,i[j].cluster,p[j].x_advance,p[j].y_advance,p[j].x_offset,p[j].y_offset) for j in range(n.value)]
    finally:
        for name,value in [('buffer',buf),('font',ft),('face',f),('blob',b)]:destroy[name](value)
