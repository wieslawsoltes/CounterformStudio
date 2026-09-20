import {BitmapFont,BitmapGlyph,createBitmapGlyph,validateBitmapSource,compileBitmapTables,decodeSbix,decodeCBDT} from '@wieslawsoltes/counterform-bitmap';
import {createDemoFont} from '@wieslawsoltes/counterform-model';
const font:BitmapFont={format:'both',overlay:false,strikes:[{id:'s',ppem:64,ppi:72}]};
const doc=createDemoFont();doc.data.bitmapFont=font;
const glyph:BitmapGlyph=createBitmapGlyph('s',new Uint8Array(),{x:0,y:0});doc.data.glyphs[0].bitmaps=[glyph];
validateBitmapSource(doc.data);const tables=compileBitmapTables(doc.data,doc.data.glyphs,doc.data.glyphs.map(g=>g.layers[0].advanceWidth));
const ids=doc.data.glyphs.map(g=>g.id);decodeSbix(tables.get('sbix')!,ids);decodeCBDT(tables.get('CBDT')!,tables.get('CBLC')!,ids);

import {showBitmapStrikes} from '@wieslawsoltes/counterform-workbench/bitmap';
const show: typeof showBitmapStrikes = showBitmapStrikes;
void show;
