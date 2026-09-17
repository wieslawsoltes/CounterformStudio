# @wieslawsoltes/counterform-preservation

Source fingerprints reject structural edits. Metadata-only rewriting preserves unrelated sfnt table bytes, language tags and unsupported name records, recalculates checksums, and removes invalidated DSIG with a warning. Untouched archives preserve their entire original container. Requires Web Crypto, supports up to 32 MiB. Not a general edited-outline roundtrip compiler.

```js
import {captureOriginal,restoreOriginal,exportMetadataOnly} from '@wieslawsoltes/counterform-preservation';
const original=await captureOriginal(bytes,source,{filename:'family.otf'});
const unchanged=await restoreOriginal(original);
source.info.familyName='Revised Family';
const {bytes:updated,warnings}=await exportMetadataOnly(original,source);
```

ES modules with TypeScript declarations. MIT. Inputs remain under the host application’s ownership.
