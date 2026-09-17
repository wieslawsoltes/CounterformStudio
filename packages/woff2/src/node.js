import { brotliCompressSync, constants } from 'node:zlib';
import { encodeWOFF2 } from './index.js';
export function encodeWOFF2Compressed(bytes,{quality=9,...options}={}) {
    if(!Number.isInteger(quality)||quality<0||quality>11)throw new RangeError('Brotli quality must be 0…11');
    return encodeWOFF2(bytes,{...options,compress:data=>brotliCompressSync(data,{params:{[constants.BROTLI_PARAM_QUALITY]:quality,[constants.BROTLI_PARAM_MODE]:constants.BROTLI_MODE_FONT}})});
}
