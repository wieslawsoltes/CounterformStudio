# @wieslawsoltes/counterform-compiler

A reusable bounded single-worker service for TTF, CFF, variable TTF, WOFF1, UFO,
font validation and table inspection. No DOM requirement. Compiler source is
snapshotted at enqueue time. Typed binary results transfer back without copying.

```js
import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
const client = new CompilerClient({workerURL: new URL('./compiler.worker.js', import.meta.url)});
const {bytes} = await client.compile(document, {format:'variable'}, {signal, key:'proof', priority:10});
client.dispose();
```

Use a bundler to build `@wieslawsoltes/counterform-compiler/worker` to the workerURL.
The application supplies an offline static worker graph via `scripts/worker-build.mjs`:
HTML import maps are **not** inherited by module workers. A consumer may instead
supply `workerFactory: () => new Worker(new URL('.../node-worker.js', import.meta.url))`
using `node:worker_threads`. Exported `./node-worker` is the Node entrypoint.

A key replaces queued work with the same key. Cancelling active synchronous font
compilation terminates the worker; the next request starts a clean instance.
Disposal settles every outstanding promise. Load errors and timeout errors are
reported; they do not silently trigger UI-thread compilation. `inline:true` is an
explicit compatibility/testing choice, not a performance equivalent. Inline tasks
cannot be interrupted once synchronous execution begins. Queue limit includes the
active job. `timeout` measures execution/startup, not queue wait. Progress is staged,
not a fabricated per-glyph percentage. All request signals and timers are released.

Snapshots still require structured-clone work on the caller thread. Incremental
source synchronization and million-point performance qualification are not claimed.
