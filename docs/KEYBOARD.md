# Keyboard contract

Bindings are command IDs rather than hardwired control actions. `Mod` means Command on macOS and Control elsewhere. The default map is inspired by the requested editor's workflows; it is **not a complete, verified copy of FontLab's native shortcut list**. Use Help → Keyboard shortcuts to inspect/remap/export/import the actual 100-command registry.

| Action | Default |
|---|---|
| Open / save / export | Mod+O / Mod+S / Mod+E |
| New font / new glyph | Mod+N / Mod+Shift+N |
| Undo / redo | Mod+Z / Mod+Shift+Z (also Mod+Y) |
| Select / pen | A or 1 / P or 5 |
| Rectangle / ellipse | R / O |
| Insert node / eraser | J / 2 |
| Measurement / pan | G / H |
| Temporary pan | Hold Space; middle mouse also pans |
| Copy / cut / paste contours | Mod+C / Mod+X / Mod+V |
| Select all / deselect | Mod+A / Escape |
| Delete nodes | Delete or Backspace |
| Nudge | Arrow: 1 unit; Shift+Arrow: 10; Alt+Arrow: 0.1 |
| Smooth / corner | Shift+S / Shift+C |
| Fit / zoom | F or Mod+0 / Mod+= and Mod+- / wheel |
| Previous / next glyph | [ / ] |
| Remove overlaps | Mod+Shift+O |
| Fill / nodes / grid | Shift+F / Shift+N / Mod+G |
| Guides / snapping | Mod+Shift+G / Shift+G |
| Clean preview | Tab in the outline editor |
| Validate font | Mod+Shift+V |
| Palette / shortcuts | Mod+Shift+P / F1 |

Drawing and nudge shortcuts require editor focus. Text inputs, editable rich text, composition/IME and local grid editors retain text-editing behavior. Palette and explicit save/open remain global where configured. Pressing a drawing-tool letter while typing into a search field does not switch tools.

The workbench installs its dispatcher in window capture phase to prevent Dockyard layout undo from consuming document undo. Layout undo/redo remain separate commands. Holding Space does not permanently change the chosen tool; focus loss and Escape cancel a pointer transaction.

Browser/OS-reserved key combinations cannot be guaranteed available on every browser. Every registered action remains accessible through menus, the ribbon or command search. Key conflict reporting is syntactic/contextual; equivalent physical mappings across non-US layouts and Mod aliases require further qualification.

`color.edit` opens Color layers & palettes from the ribbon, Inspector or command palette. It has no default shortcut, avoiding a collision with established outline-editing bindings.

## 0.3.0 authoring additions

L: Line; Shift+L: Polygon; Shift+O: Star; Shift+R: Rounded rectangle; Q: Lasso; D: Pencil; B: Pressure brush; K: Knife; C: Scissors; V: Move; T: Rotate; S: Scale; Y: Slant; Shift+A: Anchor; I: Guides; Z: Zoom; Shift+Enter: drawing options; Ctrl/Cmd+J: join endpoints; Ctrl/Cmd+Shift+A: invert selection. Shift+F1 opens the tool reference. All drawing shortcuts are editor-scoped and do not steal typing from inputs.

F10 enters the menubar; arrows, Home/End and label typeahead navigate; Escape closes a menu and restores focus. The tool rail has roving tab stops and arrow navigation. Escape and Undo cancel active drawing before another edit can be applied. The complete current binding map is available through Help → Keyboard shortcuts, including remapping. These bindings are Counterform's contract, not an exhaustive verified native FontLab/macOS/Windows shortcut matrix.
