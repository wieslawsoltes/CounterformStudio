import {createDemoFont} from '@wieslawsoltes/counterform-model';
import {compileOpenTypeCFF2} from '@wieslawsoltes/counterform-cff2';
import {encodeWOFF2} from '@wieslawsoltes/counterform-woff2';
import {VariationStoreBuilder} from '@wieslawsoltes/counterform-varstore';
const document=createDemoFont();
const font:Uint8Array=encodeWOFF2(compileOpenTypeCFF2(document,{variable:true}));
const builder=new VariationStoreBuilder(['wght'],[{wght:[0,1,1]}]);builder.add([20]);
void font;
