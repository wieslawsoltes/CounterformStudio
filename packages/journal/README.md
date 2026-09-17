# @wieslawsoltes/counterform-journal

Full-snapshot SHA-256 revision chains with bounded retention and atomic compare-and-swap writes. Requires secure-origin Web Crypto; IndexedDB backend requires an available database. MemoryJournalBackend supports host adapters and fault testing. Acknowledgement occurs after transaction completion. No protection against browser eviction or malicious same-origin rewriting.

```js
import {RevisionJournal,IndexedDBJournalBackend} from '@wieslawsoltes/counterform-journal';
const journal=new RevisionJournal(new IndexedDBJournalBackend({name:'my-font-recovery'}));
await journal.append(source,{label:'Edit outline'});
const {snapshots,issue}=await journal.recover(source.id);
await journal.close();
```

ES modules with TypeScript declarations. MIT. Inputs remain under the host application’s ownership.
