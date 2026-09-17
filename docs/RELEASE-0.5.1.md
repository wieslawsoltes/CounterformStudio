# Counterform Studio 0.5.1 — desktop workspace

The 0.5.1 release redesigns the editing workspace around compact, neutral FontLab-style chrome while preserving the existing library-backed editors and font engines.

Delivered: compact/expanded RibbonWeb modes; a full Font document and retained TreeDataGrid table; a persistent left tool box and right panel list; collapsible Properties palettes; direct transaction-backed metric controls; contour selection in Elements; adjacent-glyph navigation; numerical zoom; reversible Focus and Reset layouts; separate interface/canvas themes; ordered device-local preferences; stable virtual-grid keyboard focus; five new original icons; and typed workspace/preferences APIs.

All ten pinned libraries and all 30 packages remain in use. The release has 145 commands, 24 pointer tools and 73 original SVG icons. Font authoring, export, contextual layout, variable metrics, color paints, recovery and source-preservation contracts remain those of 0.5.0. This is not full FontLab feature/shortcut parity.

See [workspace design and usage](WORKSPACE-DESIGN.md), [capability ledger](CAPABILITIES.md) and [keyboard map](KEYBOARD.md). Verification and deployment status are determined by the commit-associated CI run, not this version string. Source and npm packages can be built offline from the pinned tree; npm registry publication is not implied.
