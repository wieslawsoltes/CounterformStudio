# @wieslawsoltes/counterform-menus

Standalone, command-backed HTML menubars and context menus. No workbench, drawing engine, UI framework or global singleton is required. ESM, MIT, declarations and stylesheet included.

```js
import {CommandMenus} from '@wieslawsoltes/counterform-menus';
import '@wieslawsoltes/counterform-menus/styles.css'; // CSS-aware bundlers; otherwise link the exported file
const menus = new CommandMenus(nav, registry, [
  {label:'File',items:['file.open','file.save',null,'file.export']},
  {label:'Edit',items:['edit.undo','edit.redo']}
], {icon: (id, doc) => createIcon(commandIcon(id), doc), onError: console.error});
menus.openContext(['edit.copy','edit.paste'], pointer.clientX, pointer.clientY, canvas);
// On unmount:
menus.dispose();
```

The registry contract has command and binding maps, `canExecute(id)`, `run(id)` and an optional `changed.subscribe` signal. Commands can provide `checked()`. Menu IDs are validated at construction; opening menus never executes commands. F10 focuses the menubar, arrows switch/navigate, Home/End select boundaries, typing searches labels, Escape restores focus and Tab dismisses without trapping focus. Pointer dismissal, all-disabled menus, focus restoration, global listener cleanup and command errors are handled. Nested menu groups are intentionally not provided; separators and multiple top-level menus cover the documented contract. The stylesheet supports `data-cf-theme="dark"` on the document root; consumers may override it.
