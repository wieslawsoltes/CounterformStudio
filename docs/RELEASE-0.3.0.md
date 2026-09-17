# Counterform Studio 0.3.0 — authoring tools and command surfaces

This release adds working font-outline interactions, not a claim of complete FontLab parity. The intact 0.2.0 implementation was recovered from the delivered source archive, committed to main at `586498b652a9c696188173e52dea91ccd366597e`, and passed GitHub Actions run `35213392194`, including real browser workers, IndexedDB, source/distribution checks and Pages deployment. Corrupted fragments of a later interrupted upload could not be reconstructed; the 0.3.0 changes described here are newly implemented and tested.

## Authoring surface

Nine top-level menus expose all 130 registered commands: File, Edit, View, Font, Glyph, Contour, Tools, Window and Help. Menus use the same command registry as the ribbon, shortcuts and palette. Disabled actions, checked state, actual remapped keys, contextual glyph actions, typeahead, F10, arrow/Home/End navigation, Escape and focus return are implemented. This is complete menu coverage of **Counterform's current commands**, not reproduction of every native FontLab menu action.

The RibbonWeb classic layout now has Draw, Design, Spacing, Masters, OpenType and Workspace tabs, functional quick-access Save/Undo/Redo, and original SVG icons. The two-column tool rail provides keyboard navigation and pressed-state semantics. The vector icon package includes standalone SVG assets and DOM creation; it uses neither icon fonts nor third-party artwork. Existing SK APIs are unchanged.

## 24 pointer tools

Existing Contour, Pen, Rectangle, Ellipse, Insert, Eraser, Measure and Hand tools are joined by Line, Polygon, Star, Rounded Rectangle, Lasso, Pencil, Pressure Brush, Knife, Scissors, Move, Rotate, Scale, Slant, Anchor, Guides and Zoom.

Shapes write real contours; pressure strokes produce filled polyline outlines; cuts preserve cubic handles; transformations edit selected nodes or complete outlines with a single undo transaction. Escape and Undo cancel in-progress construction without leaving uncommitted source. Extra pointer IDs cannot terminate or replace an active gesture. Source locks block mutations.

Pencil uses bounded Ramer–Douglas–Peucker simplification, not a fitted cubic or proprietary Rapid tool. The pressure brush uses bounded miter joins and flat caps; it does not implement FontLab Power Brush, brush skeleton editing or Skin/Glue. Knife accepts exactly two transverse intersections per closed contour. Cuts through vertices, tangencies, collinear edges and more complex crossing configurations are rejected instead of approximated. Scissors support opening closed paths and splitting open paths. Rotation/slant have 15-degree Shift constraints; interactive scaling is positive, with reflection through Mirror commands.

Additional commands set contour start, open/join endpoints, convert line/cubic segments, remove coincident line nodes, distribute nodes, invert selection, lock source layers, and edit/clear guides. Existing cubic geometry is not straightened by the “convert to cubic” action. Shape, brush and pencil options have finite numeric bounds and are available from the context bar, menu, ribbon and Shift+Enter.

## Package boundary

23 independently packable packages now include:

- `@wieslawsoltes/counterform-construction`: double-precision geometry; immutable shape/cut outputs and explicit mutation for node distribution.
- `@wieslawsoltes/counterform-icons`: original vectors, bundler-visible asset URLs and DOM SVG creation.
- `@wieslawsoltes/counterform-menus`: registry-backed menu controller with explicit disposal and an exported standalone stylesheet.

Version 0.3.0 is consistent across all Counterform package dependencies. No packages have been published to the npm registry by this release work.

## Verification and limits

Local core tests, typed consumer compilation, independent fontTools validation, fresh extracted npm consumers, and browser pointer tests are run before the delivery commit. CI repeats source and distribution browser tests with actual browser workers and IndexedDB. Local opaque-origin tests explicitly report an IndexedDB skip and inline compilation; they are not physical WebGPU qualification. Exact pass counts are in the corresponding verification artifacts. Browser tests cover every new pointer tool, all-command menu coverage, loaded rasterized SVG icon assets, dialogs, undo rollback, source locks and disposal.

Outstanding work includes hinting and its debugger, CFF2, WOFF2 export, a full OpenType feature compiler, variable positioning tables, COLRv1 and bitmap/SVG color fonts, non-destructive filters/construction, lossless production-font import, proprietary FontLab source formats, native metrics/kerning/Text/Magnet/Matchmaker/Fill workflows, exhaustive platform-native shortcuts, crash WAL, production-scale performance and cross-browser/assistive-technology certification. See `CAPABILITIES.md`; no full parity percentage is asserted.
