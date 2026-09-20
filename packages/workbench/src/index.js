import {registerBitmapCommands} from './bitmap-ui.js';
import {registerArtworkCommands,showArtwork} from './artwork-ui.js';
import {registerEncodingCommands} from './encoding-ui.js';
import {readSVGOutlines} from '@wieslawsoltes/counterform-svg';
import {registerWorkflowCommands,showCollectionBuilder} from './workflow-ui.js';
import {registerAdvancedCommands} from './advanced-ui.js';
import {WorkspaceUI, registerWorkspaceCommands} from './workspace-ui.js';
import {captureOriginal} from '@wieslawsoltes/counterform-preservation';
import {RevisionJournal,registerProductionCommands,attachJournal,showModifiers} from './production-ui.js';
import {ribbonTabs,registerAuthoringCommands,createStudioMenus,createToolRail} from './authoring-ui.js';
import { CompilerClient } from '@wieslawsoltes/counterform-compiler';
import { showColorEditor } from './colors.js';
import {showPaintEditor} from './paint-ui.js';
import {paintReferences} from '@wieslawsoltes/counterform-colrv1';
import { FontDocument, createFont, createGlyph, createDemoFont, duplicateGlyph, addMaster, setSidebearing } from '@wieslawsoltes/counterform-model';
import { History } from '@wieslawsoltes/counterform-history';
import { CommandRegistry, formatBinding } from '@wieslawsoltes/counterform-commands';
import { GlyphRenderer, initializeSkia } from '@wieslawsoltes/counterform-renderer';
import { GlyphEditor, tools } from '@wieslawsoltes/counterform-editor';
import { StudioState, GlyphTiles, createGlyphTable, createRibbon, createKerningMatrix, createNotes, componentVersions } from '@wieslawsoltes/counterform-integrations';
import { DockingManager, LayoutRoot, LayoutPanel, LayoutDocumentPane, LayoutAnchorablePane, LayoutDocument, LayoutAnchorable } from '@wieslawsoltes/dockyard';
import { FontProof } from '@wieslawsoltes/counterform-proofing';
import { ProjectStore, Autosave, download, parseProject, chooseFile } from '@wieslawsoltes/counterform-storage';
import { exportGlyphOrder, importFont, compileTrueType, compileOpenTypeCFF, encodeWOFF, inspectFont } from '@wieslawsoltes/counterform-font-io';
import { compileVariableTrueType, instanceDocument, compatibility } from '@wieslawsoltes/counterform-variations';
import { validateFont } from '@wieslawsoltes/counterform-validation';
import { exportUFO, importUFO } from '@wieslawsoltes/counterform-ufo';
import { parseFeatures, pairKey, kerningValue } from '@wieslawsoltes/counterform-opentype';
import { applyRecipe, recipes } from '@wieslawsoltes/counterform-automation';
import { CoordinateCompute } from '@wieslawsoltes/counterform-compute';
import { fromSVG, toSVG, bounds, transformContours, uid, rectangle, ellipse } from '@wieslawsoltes/counterform-geometry';
import { el, button, toast, dialog, field, section, setValue, formDialog, escapeHTML } from './ui.js';
export const version = '0.10.0';
const brand = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M32 9A16 16 0 1 0 32 31L27 25A8 8 0 1 1 27 15Z" fill="currentColor"/><path d="M24 17H36V23H24Z" fill="#91b9ff"/></svg>`;
/** Mount a complete local-first authoring workspace. Consumers own the returned lifetime. */
export async function mountStudio(host, { document: initialDocument = null, skiaOptions = {}, compilerOptions = {}, restore = true } = {}) {
    const app = new StudioWorkbench(host, { initialDocument, skiaOptions, compilerOptions, restore });
    await app.initialize();
    return app;
}
export class StudioWorkbench {
    constructor(host, options) { this.host = host; this.options = options; this.disposables = []; this.log = []; this.location = {}; this.previewInstance = false; this.ready = false; this.theme = 'light'; }
    async initialize() {
        this.host.innerHTML = `<div class="cf-loading">${brand}<h1>Counterform <span>Studio</span></h1><p>Preparing the type-design workspace</p><div class="cf-loading-bar"></div></div>`;
        this.store = new ProjectStore();
        this.journal = new RevisionJournal();
        let initial = this.options.initialDocument;
        try {
            if (!initial && this.options.restore) {
                const last = await this.store.preference('lastProject');
                if (last) {
                    initial = await this.store.load(last);
                    const meta=(await this.store.list()).find(p=>p.id===last),recovery=await this.journal.recover(last),latest=recovery.snapshots.at(-1);
                    if(latest && latest.time>(meta?.modified||0)){initial=latest.data;if(recovery.issue)initial.id=uid('font');this.record('Recovery',recovery.issue||'Restored the latest committed journal revision');}
                }
            }
        }
        catch (e) {
            this.record('Storage', e.message);
        }
        this.doc = initial instanceof FontDocument ? initial : initial ? new FontDocument(initial) : createDemoFont();
        this.history = new History(this.doc);
        this.state = new StudioState(this.doc);
        try {
            this.S = await initializeSkia(this.options.skiaOptions);
        }
        catch (e) {
            this.record('Skia', e.message);
            this.S = null;
            toast('Skia initialization failed. Canvas fallback is active; Boolean operations, artwork previews and CFF import are unavailable.', 'error');
        }
        this.commands = new CommandRegistry({ context: () => document.activeElement === this.renderer?.overlay ? 'editor' : 'global' });
        this.compute = new CoordinateCompute();
        this.compiler = new CompilerClient(this.options.compilerOptions);
        this.disposables.push(() => this.compiler.dispose());
        this.constructShell();
        this.renderer = new GlyphRenderer(this.canvasHost, { S: this.S });
        this.editor = new GlyphEditor(this.doc, this.history, this.renderer);
        this.registerCommands();
        this.constructPanels();
        this.workspaceUI = new WorkspaceUI(this);
        this.workspaceUI.prepare();
        this.constructLayout();
        this.constructRibbon();
        this.bind();
        await this.workspaceUI.install();
        this.ready = true;
        try {
            const saved = await this.store.preference('keymap');
            if (saved)
                this.commands.importBindings(saved);
        }
        catch (e) {
            this.record('Keymap', e.message);
        }
        this.selectGlyph(this.doc.glyph('A')?.id || this.doc.data.glyphs[0]?.id);
        this.updateAll();
        requestAnimationFrame(() => { this.renderer.fit(); this.renderer.overlay.focus({ preventScroll: true }); });
        this.autosave = new Autosave(this.doc, this.store, { onStatus: (s, e) => { this.saveLabel.dataset.state=s;this.saveLabel.textContent = s === 'saved' ? 'Saved locally' : s === 'saving' ? 'Saving…' : 'Storage unavailable'; if (e)
                this.record('Autosave', e.message); if (s === 'saved')
                this.store.preference('lastProject', this.doc.data.id).catch(() => { }); } });
        attachJournal(this);
        this.autosave.flush();
        this.record('Workspace', 'Ready. Original demonstration outlines; no external font files are loaded.');
        return this;
    }
    constructShell() {
        this.host.replaceChildren();
        this.host.className = 'cf-studio';
        this.header = el('header', 'cf-topbar');
        const logo = el('div', 'cf-brand');
        logo.innerHTML = brand + '<span>counterform<small>STUDIO</small></span>';
        this.menuHost = el('nav', 'cf-menubar');
        this.menuHost.setAttribute('aria-label', 'Main menu');
        this.projectLabel = el('div', 'cf-project-title');
        const actions = el('div', 'cf-top-actions');
        this.saveLabel = el('span', 'cf-save-status', 'Local workspace');
        actions.append(this.saveLabel, button('⌘', () => this.showPalette(), { className: 'cf-palette-toggle', title: 'Command palette' }), button('Export font ↗', () => this.showExport(), { className: 'primary cf-export-button' }));
        this.header.append(logo, this.menuHost, this.projectLabel, actions);
        this.ribbonHost = el('div', 'cf-ribbon-host');
        this.workHost = el('main', 'cf-workspace');
        this.statusbar = el('footer', 'cf-statusbar');
        this.statusLeft = el('div', 'cf-status-left', 'Ready');
        this.statusCenter = el('div', 'cf-status-center');
        this.statusRight = el('div', 'cf-status-right');
        this.statusbar.append(this.statusLeft, this.statusCenter, this.statusRight);
        this.host.append(this.header, this.ribbonHost, this.workHost, this.statusbar);
        this.canvasHost = el('div', 'cf-canvas-host');
        this.editorPane = el('div', 'cf-editor-pane');
        this.contextbar = el('div', 'cf-contextbar');
        this.glyphLabel = el('strong', 'cf-current-glyph');
        this.contextMetrics = el('span', 'cf-muted');
        this.masterSelect = el('select', 'cf-master-select');
        this.masterSelect.setAttribute('aria-label', 'Editing master');
        this.masterSelect.addEventListener('change', () => this.selectMaster(this.masterSelect.value));
        this.contextbar.append(this.glyphLabel, this.contextMetrics, el('div', 'cf-spacer'), this.masterSelect, button('Fit', () => this.renderer.fit(), { title: 'Fit glyph · F' }));
        this.toolRail = el('div', 'cf-toolrail');
        const drawing = el('div', 'cf-drawing');
        drawing.append(this.canvasHost);
        this.editorPane.append(this.contextbar, drawing);
        this.modeLabel = el('div', 'cf-mode-label');
        this.canvasHost.append(this.modeLabel);
    }
    constructPanels() {
        this.library = el('div', 'cf-library');
        const searchWrap = el('div', 'cf-search-wrap'), search = el('input', 'cf-search');
        search.placeholder = 'Find glyph, name, Unicode…';
        search.setAttribute('aria-label', 'Search glyphs');
        search.addEventListener('input', () => this.state.SetValue('query', search.value));
        this.searchInput = search;
        searchWrap.append(search);
        this.library.append(searchWrap);
        const categories = el('div', 'cf-categories');
        this.categoryButtons = [];
        for (const [id, label] of [['all', 'All'], ['uppercase', 'A–Z'], ['lowercase', 'a–z'], ['numbers', '0–9'], ['components', '◌']]) {
            const b = button(label, () => { this.state.SetValue('category', id); this.categoryButtons.forEach(x => x.classList.toggle('active', x.dataset.category === id)); }, { title: `${id} glyphs` });
            b.dataset.category = id;
            if (id === this.state.GetValue('category'))
                b.classList.add('active');
            this.categoryButtons.push(b);
            categories.append(b);
        }
        const glyphHost = el('div', 'cf-glyph-host');
        this.libraryFooter = el('div', 'cf-library-footer');
        this.libraryFooter.append(button('+ Glyph', () => this.showNewGlyph()), button('Import…', () => this.openFile()));
        this.library.append(categories, glyphHost, this.libraryFooter);
        this.tiles = new GlyphTiles(glyphHost, this.doc, this.state, id => this.selectGlyph(id));
        this.tiles.onOpen = id => { this.selectGlyph(id); this.activate('glyph'); this.renderer.overlay.focus(); };
        this.table = createGlyphTable(this.doc, this.state, this.history, id => this.selectGlyph(id));
        this.table.element.addEventListener('row-double-tapped', () => this.activate('glyph'));
        this.kerning = createKerningMatrix(this.doc, this.history, () => this.editor.masterId, { onError: e => toast(e.message, 'error') });
        this.kerningPane = el('div', 'cf-flex-column');
        const ktoolbar = el('div', 'cf-panel-toolbar');
        ktoolbar.append(el('strong', '', 'Kerning matrix'), el('span', 'cf-muted', 'Font units · frozen labels · paste a numeric range'), button('Edit pair…', () => this.showKerningPair()), button('Groups…', () => this.showGroups()));
        this.kerningPane.append(ktoolbar, this.kerning.element);
        this.notes = createNotes(this.doc, this.history);
        this.notesPane = el('div', 'cf-flex-column');
        const notehead = el('div', 'cf-panel-toolbar');
        notehead.append(el('strong', '', 'Design notes'), el('span', 'cf-muted', 'RichTextWeb · formatting is saved in the project'));
        this.notesPane.append(notehead, this.notes.element);
        this.featuresPane = el('div', 'cf-features-pane');
        this.featureMessage = el('div', 'cf-feature-message', 'Supported: classes, single substitutions, ligatures, pair positioning; DFLT / latn default language.');
        this.featureText = el('textarea', 'cf-code-editor');
        this.featureText.spellcheck = false;
        this.featureText.setAttribute('aria-label', 'OpenType feature source');
        this.featureText.value = this.doc.data.features;
        this.featureText.addEventListener('keydown', e => { if (e.key === 'Tab') {
            e.preventDefault();
            this.featureText.setRangeText('  ', this.featureText.selectionStart, this.featureText.selectionEnd, 'end');
        } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.applyFeatures();
        } });
        const ftoolbar = el('div', 'cf-panel-toolbar');
        ftoolbar.append(el('strong', '', 'OpenType source'), button('Validate', () => this.checkFeatures()), button('Apply & compile', () => this.applyFeatures(), { className: 'primary' }), button('Attachments…', () => this.commands.run('features.attachments')), button('Insert example', () => { this.featureText.value += '\n# Kerning example\nfeature kern {\n  pos A V -85;\n} kern;\n'; }));
        this.featuresPane.append(ftoolbar, this.featureMessage, this.featureText);
        this.proofPane = el('div', 'cf-proof-pane');
        const ptoolbar = el('div', 'cf-proof-toolbar'), text = el('input', 'cf-proof-input');
        text.value = 'Hamburgefontsiv AVATAR';
        text.setAttribute('aria-label', 'Proof text');
        text.addEventListener('input', () => this.proof.update({ text: text.value }));
        const size = el('input', 'cf-proof-size-slider');
        size.type = 'range';
        size.min = 12;
        size.max = 140;
        size.value = 66;
        size.setAttribute('aria-label', 'Proof font size');
        size.addEventListener('input', () => this.proof.update({ size: Number(size.value) }));
        this.proofMode = button('Waterfall', () => { this.proof.waterfall = !this.proof.waterfall; this.proofMode.classList.toggle('active', this.proof.waterfall); this.proof.render(); });
        this.proofKern = button('kern', () => { this.kernOff = !this.kernOff; this.proofKern.classList.toggle('active', !this.kernOff); this.proof.update({ features: `"kern" ${this.kernOff ? 0 : 1}, "liga" ${this.ligaOff ? 0 : 1}` }); }, { className: 'active' });
        this.proofLiga = button('liga', () => { this.ligaOff = !this.ligaOff; this.proofLiga.classList.toggle('active', !this.ligaOff); this.proof.update({ features: `"kern" ${this.kernOff ? 0 : 1}, "liga" ${this.ligaOff ? 0 : 1}` }); }, { className: 'active' });
        ptoolbar.append(text, this.proofKern, this.proofLiga, size, this.proofMode);
        const proofHost = el('div', 'cf-proof-host');
        this.proofPane.append(ptoolbar, proofHost);
        this.proof = new FontProof(proofHost, this.doc, { masterId: this.editor.masterId, compiler:this.compiler });
        this.proof.errors.subscribe(e => this.record('Proof', e.message));
        this.disposables.push(this.proof.changed.subscribe(e=>{
            if(e.revision!==this.doc.revision||e.documentId!==this.doc.data.id)return;
            try {this.renderer.setCompiledColorFont(!e.variable&&this.doc.data.glyphs.some(g=>g.colorPaint||g.bitmaps?.length)?e.data:null,{documentId:e.documentId,revision:e.revision,masterId:e.masterId,glyphOrder:exportGlyphOrder(this.doc).map(g=>g.id),unitsPerEm:this.doc.info.unitsPerEm});}
            catch(error){this.record('Color proof',error.message);}
        }));
        this.inspector = el('div', 'cf-inspector');
        this.buildInspector();
        this.mastersPane = el('div', 'cf-masters-pane');
        this.outputPane = el('div', 'cf-output-pane');
        this.outputList = el('div', 'cf-output-list');
        const otoolbar = el('div', 'cf-panel-toolbar');
        otoolbar.append(el('strong', '', 'Activity & diagnostics'), button('Clear', () => { this.log = []; this.renderLog(); }), button('Validate font', () => this.showValidation()));
        this.outputPane.append(otoolbar, this.outputList);
    }
    constructLayout() {
        const doc = (id, title, content) => new LayoutDocument({ContentId:id, Title:title, Content:content, CanClose:false});
        const anchor = (id, title, content) => new LayoutAnchorable({ContentId:id, Title:title, Content:content, CanClose:false, CanHide:true});
        this.layout = new LayoutRoot({RootPanel:new LayoutPanel({Orientation:'Horizontal', Children:[
            new LayoutAnchorablePane({DockWidth:208, DockMinWidth:170, Children:[anchor('library','Glyph navigator',this.library)]}),
            new LayoutPanel({Orientation:'Vertical', Children:[
                new LayoutDocumentPane({Children:[doc('font','Font',this.fontPane),doc('glyph','Glyph',this.editorPane),doc('catalog','Table',this.table.element),doc('kerning','Kerning',this.kerningPane),doc('features','Features',this.featuresPane),doc('notes','Notes',this.notesPane)]}),
                new LayoutAnchorablePane({DockHeight:180,DockMinHeight:105,Children:[anchor('proof','Preview',this.proofPane),anchor('output','Output',this.outputPane)]})
            ]}),
            new LayoutAnchorablePane({DockWidth:282,DockMinWidth:240,Children:[anchor('inspector','Properties',this.inspector),anchor('masters','Variations',this.mastersPane)]})
        ]})});
        this.dockHost=el('div','cf-dock-host');
        this.workHost.append(this.toolRail,this.dockHost);
        this.dock = new DockingManager(this.dockHost,{Layout:this.layout,Theme:'light',Error:(_,e)=>this.record('Workspace',e.Error?.message||e.Message||'Layout error')});
        this.dock.Activate('glyph');
    }
    activate(id) {
        const model=this.dock.Find(id);
        if(model){if(model.IsHidden)model.Show?.();this.dock.Activate(model);}
    }
    constructRibbon() { this.ribbon=createRibbon(this.commands,ribbonTabs);this.ribbonHost.append(this.ribbon);this.buildMenus();createToolRail(this); }
    registerCommands() {
        const r = (id, label, execute, keys = [], extra = {}) => this.commands.register({ id, label, execute, keys, repeat: false, ...extra }), edit = { scope: 'editor', enabled: () => this.editor.canEdit };
        r('color.edit', 'Color layers & palettes', () => this.showColors());
        r('color.paint','Color paint graph',()=>this.showPaints());
        r('file.new', 'New font', () => this.newFont(), ['Mod+N']);
        r('file.open', 'Open font / project', () => this.openFile(), ['Mod+O'], { allowInText: true });
        r('file.save', 'Save project', () => this.saveProject(), ['Mod+S'], { allowInText: true });
        r('file.export', 'Export font', () => this.showExport(), ['Mod+E']);
        r('file.recent', 'Recent projects', () => this.showRecent());
        r('file.demo', 'Open demonstration', () => this.replaceDocument(createDemoFont(), true));
        r('edit.undo', 'Undo', () => this.editor.drag ? this.editor.cancel() : this.history.undo(), ['Mod+Z'], { enabled: () => !!this.history.active || this.history.canUndo });
        r('edit.redo', 'Redo', () => {this.editor.cancel();this.history.redo();}, ['Mod+Shift+Z', 'Mod+Y'], { enabled: () => this.history.canRedo });
        r('edit.copy', 'Copy contours', () => this.editor.copy(), ['Mod+C'], edit);
        r('edit.cut', 'Cut contours', () => this.editor.cut(), ['Mod+X'], edit);
        r('edit.paste', 'Paste contours', () => this.editor.paste(), ['Mod+V'], edit);
        r('edit.delete', 'Delete selection', () => this.editor.deleteSelection(), ['Delete', 'Backspace'], edit);
        r('edit.selectAll', 'Select all nodes', () => this.editor.selectAll(), ['Mod+A'], edit);
        r('edit.deselect', 'Deselect / cancel gesture', () => {this.editor.cancel();this.editor.penId=null;this.editor.clearSelection();}, ['Escape'], { scope: 'editor' });
        for (const t of tools)
            r('tool.' + t.id, t.label + ' tool', () => {this.editor.setTool(t.id);this.activate('glyph');this.renderer.overlay.focus({preventScroll:true});}, t.id === 'select' ? ['A', '1'] : t.id === 'pen' ? ['P', '5'] : [t.key], { scope: 'editor' });
        r('node.smooth', 'Make smooth', () => this.editor.nodeStyle(true), ['Shift+S'], edit);
        r('node.corner', 'Make corner', () => this.editor.nodeStyle(false), ['Shift+C'], edit);
        r('node.alignX', 'Align X', () => this.editor.align('x'), [], edit);
        r('node.alignY', 'Align Y', () => this.editor.align('y'), [], edit);
        for (const [id, label] of [['reverse', 'Reverse contours'], ['extrema', 'Add extrema'], ['winding', 'Correct winding'], ['round', 'Round coordinates'], ['close', 'Close contours']])
            r('outline.' + id, label, () => this.editor.outlineOperation(label), [], { enabled: () => this.editor.canEdit });
        r('outline.overlap', 'Remove overlaps', () => this.editor.boolean('Simplify'), ['Mod+Shift+O'], { enabled: () => this.editor.canEdit && !!this.S });
        for (const op of ['Union', 'Difference', 'Intersect', 'Xor'])
            r('outline.' + op.toLowerCase(), op, () => this.editor.boolean(op), [], { enabled: () => this.editor.canEdit && !!this.S });
        r('outline.stroke', 'Expand stroke', () => formDialog('Expand stroke', [['width', 'Stroke width', 30, { type: 'number', min: .1, max: 10000 }]], { onSubmit: v => this.editor.expandStroke(v.width) }));
        r('outline.transform', 'Transform…', () => this.showTransform());
        r('outline.mirrorX', 'Mirror horizontal', () => { const b = bounds(this.editor.selectedContours()); this.editor.transform([-1, 0, 0, 1, b.minX + b.maxX, 0], 'Mirror horizontally'); });
        r('outline.mirrorY', 'Mirror vertical', () => { const b = bounds(this.editor.selectedContours()); this.editor.transform([1, 0, 0, -1, 0, b.minY + b.maxY], 'Mirror vertically'); });
        for (const [code, dx, dy] of [['ArrowLeft', -1, 0], ['ArrowRight', 1, 0], ['ArrowUp', 0, 1], ['ArrowDown', 0, -1]])
            for (const [prefix, factor] of [['', 1], ['Shift+', 10], ['Alt+', .1]])
                r('nudge.' + prefix + code, `Nudge ${code.replace('Arrow', '')} ${factor} u`, () => this.editor.nudge(dx * factor, dy * factor), [prefix + code], { ...edit, repeat: true });
        r('glyph.new', 'Add glyph', () => this.showNewGlyph(), ['Mod+Shift+N']);
        r('glyph.duplicate', 'Duplicate glyph', () => this.duplicateCurrent());
        r('glyph.delete', 'Delete glyph', () => this.deleteGlyph());
        r('glyph.center', 'Center in advance', () => { const m = this.doc.metrics(this.editor.glyphId, this.editor.masterId); this.editor.transform([1, 0, 0, 1, (m.advanceWidth - m.width) / 2 - m.minX, 0], 'Center glyph'); });
        r('glyph.anchor', 'Add anchor', () => this.addAnchor());
        r('glyph.component', 'Add component', () => this.addComponent());
        r('glyph.decompose', 'Decompose components', () => this.editor.transaction('Decompose components', () => { this.editor.layer.contours = this.doc.resolve(this.editor.glyphId, this.editor.masterId); this.editor.layer.components = []; }));
        r('glyph.svg', 'Export glyph SVG', () => download(this.renderer.toSVG(), this.editor.glyph.name + '.svg', 'image/svg+xml'));
        r('glyph.next', 'Next glyph', () => this.nextGlyph(1), ['BracketRight'], { scope: 'editor' });
        r('glyph.previous', 'Previous glyph', () => this.nextGlyph(-1), ['BracketLeft'], { scope: 'editor' });
        r('font.info', 'Font info', () => this.showFontInfo(), ['Mod+Alt+I']);
        r('font.validate', 'Validate font', () => this.showValidation(), ['Mod+Shift+V']);
        r('font.tables', 'Inspect compiled tables', () => this.showTables());
        r('kern.pair', 'Edit kerning pair', () => this.showKerningPair(), ['Mod+Alt+K']);
        r('kern.groups', 'Kerning groups', () => this.showGroups());
        r('master.add', 'Add master', () => this.addMaster());
        r('axis.add', 'Add axis', () => this.addAxis());
        r('master.compatibility', 'Check compatibility', () => this.checkCompatibility());
        r('master.instance', 'Generate static instance', () => this.generateInstance());
        for (const [id, label] of [['glyph', 'Outline editor'], ['catalog', 'Font inventory'], ['kerning', 'Kerning matrix'], ['features', 'OpenType features'], ['notes', 'Design notes'], ['masters', 'Masters & axes'], ['proof', 'Live proof'], ['output', 'Output'], ['inspector', 'Inspector']])
            r('view.' + id, label, () => this.activate(id));
        r('features.apply', 'Apply features', () => this.applyFeatures());
        r('view.fit', 'Fit glyph', () => this.renderer.fit(), ['F', 'Mod+0'], { scope: 'editor' });
        r('view.zoomIn', 'Zoom in', () => this.zoom(1.25), ['Mod+Equal'], { scope: 'editor' });
        r('view.zoomOut', 'Zoom out', () => this.zoom(.8), ['Mod+Minus'], { scope: 'editor' });
        for (const [name, prop, label, key] of [['grid', 'showGrid', 'Toggle grid', 'Mod+G'], ['fill', 'showFill', 'Toggle fill', 'Shift+F'], ['nodes', 'showNodes', 'Toggle nodes', 'Shift+N'], ['guides', 'showGuides', 'Toggle guides', 'Mod+Shift+G']])
            r('view.' + name, label, () => { this.renderer[prop] = !this.renderer[prop]; this.renderer.invalidate(); }, [key], { scope: 'editor' });
        r('view.preview', 'Clean preview', () => { this.renderer.preview = !this.renderer.preview; this.renderer.invalidate(); }, ['Tab'], { scope: 'editor' });
        r('view.snap', 'Toggle snapping', () => { this.editor.snap = !this.editor.snap; this.updateStatus(); }, ['Shift+G'], { scope: 'editor' });
        r('view.theme', 'Toggle appearance', () => this.toggleTheme());
        r('view.fullscreen', 'Full screen', () => document.fullscreenElement ? document.exitFullscreen() : this.host.requestFullscreen());
        r('layout.undo', 'Undo layout', () => this.dock.Undo(), [], { enabled: () => this.dock?.CanUndo });
        r('layout.redo', 'Redo layout', () => this.dock.Redo(), [], { enabled: () => this.dock?.CanRedo });
        r('commands.palette', 'Command palette', () => this.showPalette(), ['Mod+Shift+P'], { allowInText: true });
        r('commands.bindings', 'Keyboard shortcuts', () => this.showBindings(), ['F1'], { allowInText: true });
        r('automation.recipe', 'Run recipe', () => this.showRecipe());
        r('compute.verify', 'Verify GPU interpolation', () => this.verifyCompute());
        r('app.about', 'About & capabilities', () => this.showAbout());
        registerAuthoringCommands(this);
        registerProductionCommands(this);
        registerWorkspaceCommands(this);
        registerAdvancedCommands(this);
        registerWorkflowCommands(this);
        registerEncodingCommands(this);
        registerArtworkCommands(this);
        registerBitmapCommands(this);
    }
    buildMenus() {createStudioMenus(this);}
    buildInspector() {
        this.inspector.replaceChildren();
        this.inspectorFields = {};
        const modifiers=section("Outline modifiers",{extra:button("Edit stack",()=>showModifiers(this),{className:"cf-mini"})});
        modifiers.element.append(el("p","cf-muted","Non-destructive result; source nodes remain editable."));this.inspector.append(modifiers.element);
        const glyphSection = section('Glyph properties'), name = field('Name', ''), unicode = field('Unicode', '');
        this.inspectorFields.name = name.input;
        this.inspectorFields.unicode = unicode.input;
        glyphSection.element.append(name.element, unicode.element);
        name.input.addEventListener('change', () => this.safe(() => { const v = name.input.value.trim(); if (!v || /\s/.test(v) || this.doc.glyph(v) && this.doc.glyph(v) !== this.editor.glyph)
            throw new Error('Glyph name must be nonempty, unique and contain no whitespace'); this.editor.transaction('Rename glyph', () => this.editor.glyph.name = v); }));
        unicode.input.addEventListener('change', () => this.safe(() => { const values = unicode.input.value.trim() ? unicode.input.value.split(/[\s,]+/).map(s => parseInt(s.replace(/^U\+/i, ''), 16)) : []; if (values.some(cp => !Number.isInteger(cp) || cp < 0 || cp > 0x10ffff || cp >= 0xd800 && cp <= 0xdfff))
            throw new Error('Enter Unicode scalar values, such as U+0041'); if (values.some(cp => this.doc.char(cp) && this.doc.char(cp) !== this.editor.glyph))
            throw new Error('A Unicode value is already mapped to another glyph'); this.editor.transaction('Change encoding', () => this.editor.glyph.unicodes = values); }));
        const metrics = section('Metrics'), metricGrid = el('div', 'cf-three-fields');
        for (const [key, label] of [['lsb', 'Left'], ['advanceWidth', 'Advance'], ['rsb', 'Right']]) {
            const f = field(label, 0, { type: 'number', step: 1 });
            this.inspectorFields[key] = f.input;
            metricGrid.append(f.element);
            f.input.addEventListener('change', () => this.safe(() => this.setGlyphMetric(key, f.input.value === '' ? NaN : f.input.valueAsNumber)));
        }
        metrics.element.append(metricGrid);
        this.outlineStats = el('div', 'cf-outline-stats');
        metrics.element.append(this.outlineStats);
        const selection = section('Selection');
        this.selectionLabel = el('span', 'cf-count', '0 points');
        selection.head.append(this.selectionLabel);
        const pointGrid = el('div', 'cf-two-fields');
        for (const axis of ['x', 'y']) {
            const f = field(axis.toUpperCase(), 0, { type: 'number', step: 1 });
            this.inspectorFields[axis] = f.input;
            pointGrid.append(f.element);
            f.input.addEventListener('change', () => this.safe(() => { const n = [...this.editor.selection][0] && this.editor.findNode([...this.editor.selection][0])?.node; if (!n)
                return; const v = Number(f.input.value); if (!Number.isFinite(v) || Math.abs(v) > 32767)
                throw new Error('Coordinate must be within ±32767'); const dx = axis === 'x' ? v - n.x : 0, dy = axis === 'y' ? v - n.y : 0; this.editor.nudge(dx, dy); }));
        }
        const align = el('div', 'cf-button-row');
        align.append(button('Align X', () => this.editor.align('x')), button('Align Y', () => this.editor.align('y')), button('Smooth', () => this.editor.nodeStyle(true)));
        selection.element.append(pointGrid, align);
        const anchors = section('Anchors', { extra: button('+', () => this.addAnchor(), { className: 'cf-mini', title: 'Add anchor' }) });
        this.anchorList = el('div', 'cf-item-list');
        anchors.element.append(this.anchorList);
        const components = section('Components', { extra: button('+', () => this.addComponent(), { className: 'cf-mini', title: 'Add component' }) });
        this.componentList = el('div', 'cf-item-list');
        components.element.append(this.componentList);
        const layers = section('Source layers');
        this.layerList = el('div', 'cf-layer-list');
        layers.element.append(this.layerList);
        const actions = el('div', 'cf-inspector-actions');
        actions.append(button('Validate glyph', () => this.showValidation(this.editor.glyphId)), button('Font info', () => this.showFontInfo()));
        const colors = section('Color font');
        colors.element.append(button('Color paint graph…',()=>this.showPaints()),button('Color layers & palettes…', () => this.showColors()));
        this.inspector.append(colors.element, glyphSection.element, metrics.element, selection.element, anchors.element, components.element, layers.element, actions);
    }
    bind() {
        this.disposables.push(this.commands.attach(window, { capture: true }), this.commands.errors.subscribe(({ error }) => { toast(error.message, 'error'); this.record('Command', error.message); }), this.commands.executed.subscribe(({ id }) => { this.record('Command', this.commands.commands.get(id)?.label || id); this.updateStatus(); }), this.editor.changed.subscribe(e => { this.updateInspector(); this.updateStatus(); if (e.kind === 'tool')
            for (const b of this.toolRail.querySelectorAll('[data-tool]'))
                {b.classList.toggle('active', b.dataset.tool === e.tool);b.setAttribute('aria-pressed',String(b.dataset.tool===e.tool));} if(e.kind==='error')toast(e.error.message,'error'); }), this.editor.selectionChanged.subscribe(() => this.updateInspector()), this.history.subscribe(() => { this.updateStatus(); this.ribbon?.requestRender(); }), this.doc.changed.subscribe(e => { if (e.kind === 'replace' || e.kind === 'structure') {
            this.updateMasterControls();
            this.renderMasters();
            this.featureText.value = this.doc.data.features;
            this.projectLabel.textContent = this.doc.info.familyName;
        } this.updateInspector(); this.updateStatus(); if (this.previewInstance)
            this.applyInstancePreview(); }), this.renderer.changed.subscribe(() => this.updateStatus()), this.renderer.error.subscribe(error => { toast(error?.message || 'Renderer error', 'error'); this.record('Renderer', error?.message || String(error)); }), this.editor.status.subscribe(value => { if (typeof value === 'string')
            this.statusLeft.textContent = value;
        else
            this.statusCenter.textContent = `X ${value.x.toFixed(1)}  ·  Y ${value.y.toFixed(1)}  ·  font units`; }));
        const drop = async (e) => { e.preventDefault(); if (e.dataTransfer.files[0])
            await this.safe(() => this.openFile(e.dataTransfer.files[0])); };
        this.host.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files'))
            e.preventDefault(); });
        this.host.addEventListener('drop', drop);
        this.frameSub = this.renderer.frame.subscribe(() => { if (this.statusBackend !== this.renderer.backend) {
            this.statusBackend = this.renderer.backend;
            this.updateStatus();
        } });
        this.disposables.push(this.frameSub);
    }
    safe(action) { return Promise.resolve().then(action).catch(e => { toast(e.message, 'error'); this.record('Error', e.stack || e.message); this.updateInspector(); }); }
    /** Single validation/history boundary shared by the property bar and Metrics palette. */
    setGlyphMetric(key, value) {
        if (!['lsb', 'advanceWidth', 'rsb'].includes(key)) throw new TypeError('Unknown glyph metric');
        if (!this.editor.canEdit) throw new Error('The source layer is not editable');
        if (!Number.isFinite(value)) throw new RangeError('Enter a finite metric');
        if (key === 'advanceWidth' && (value < 0 || value > 65535)) throw new RangeError('Advance must be 0–65535');
        this.editor.transaction('Change ' + ({lsb:'Left',advanceWidth:'Advance',rsb:'Right'})[key], () => {
            if (key === 'advanceWidth') this.editor.layer.advanceWidth = value;
            else setSidebearing(this.doc, this.editor.glyphId, this.editor.masterId, key === 'lsb' ? 'left' : 'right', value);
        });
    }
    selectGlyph(id) { if (!id)
        return; this.previewInstance = false; this.editor.readOnly = false; this.proof?.update({ masterId: this.editor.masterId, variable: false }); this.editor.setGlyph(id); this.state.SetValue('glyphId', this.editor.glyphId); this.state.SetValue('masterId', this.editor.masterId); this.updateInspector(); this.updateStatus(); }
    selectMaster(id) { this.previewInstance = false; this.editor.readOnly = false; this.editor.setMaster(id); this.state.SetValue('masterId', id); this.state.sync(); this.proof.update({ masterId: id, variable: false }); this.kerning.refresh(); this.updateMasterControls(); this.renderMasters(); this.updateInspector(); }
    nextGlyph(delta) { const glyphs = this.tiles.rows.length ? this.tiles.rows : this.doc.data.glyphs, i = glyphs.findIndex(g => g.id === this.editor.glyphId), next = glyphs[(i + delta + glyphs.length) % glyphs.length]; if (next)
        this.selectGlyph(next.id); }
    updateMasterControls() { this.masterSelect.replaceChildren(); for (const m of this.doc.data.masters) {
        const o = el('option', '', m.name);
        o.value = m.id;
        this.masterSelect.append(o);
    } this.masterSelect.value = this.editor.masterId; }
    updateInspector() {
        if (!this.editor?.glyph || !this.inspectorFields)
            return;
        const g = this.editor.glyph, l = this.editor.layer, m = this.doc.metrics(g.id, this.editor.masterId), f = this.inspectorFields;
        setValue(f.name, g.name);
        setValue(f.unicode, g.unicodes.map(c => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' '));
        for (const k of ['lsb', 'advanceWidth', 'rsb'])
            setValue(f[k], +m[k].toFixed(2));
        const ns = l.contours.flatMap(c => c.nodes).filter(n => this.editor.selection.has(n.id));
        this.selectionLabel.textContent = `${ns.length} point${ns.length === 1 ? '' : 's'}`;
        for (const k of ['x', 'y']) {
            setValue(f[k], ns.length ? +ns[0][k].toFixed(2) : '');
            f[k].disabled = !ns.length || !this.editor.canEdit;
        }
        for (const k of ['name', 'unicode', 'lsb', 'advanceWidth', 'rsb'])
            f[k].disabled = !this.editor.canEdit;
        this.glyphLabel.textContent = g.unicodes.length ? String.fromCodePoint(g.unicodes[0]) + ' / ' + g.name : g.name;
        this.contextMetrics.textContent = `${g.unicodes.map(c => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' · ')}   ${m.advanceWidth.toFixed(0)} u`;
        this.outlineStats.textContent = `${l.contours.length} contours · ${l.contours.reduce((n, c) => n + c.nodes.length, 0)} nodes · ${m.width.toFixed(0)} × ${m.height.toFixed(0)} u`;
        if (this.editor.drag)
            return;
        this.anchorList.replaceChildren();
        if (!l.anchors.length)
            this.anchorList.append(el('div', 'cf-empty-small', 'No anchors. Add a named attachment point.'));
        for (const [i, a] of l.anchors.entries()) {
            const row = el('div', 'cf-item-row');
            row.append(button('⌖ ' + a.name, () => this.editAnchor(i), { className: 'cf-text-button' }), el('span', 'cf-mono', `${+a.x.toFixed(1)}, ${+a.y.toFixed(1)}`), button('×', () => this.editor.transaction('Remove anchor', () => l.anchors.splice(i, 1)), { className: 'cf-mini', title: 'Remove anchor' }));
            this.anchorList.append(row);
        }
        this.componentList.replaceChildren();
        if (!l.components.length)
            this.componentList.append(el('div', 'cf-empty-small', 'No components. Reuse a base glyph.'));
        for (const [i, c] of l.components.entries()) {
            const row = el('div', 'cf-item-row');
            row.append(button('◇ ' + (this.doc.glyph(c.glyphId)?.name || c.glyphName), () => this.editComponent(i), { className: 'cf-text-button' }), button('×', () => this.editor.transaction('Remove component', () => l.components.splice(i, 1)), { className: 'cf-mini', title: 'Remove component' }));
            this.componentList.append(row);
        }
        this.layerList.replaceChildren();
        for (const master of this.doc.data.masters) {
            const layer = g.layers.find(x => x.masterId === master.id);
            if (!layer)
                continue;
            const row = el('div', 'cf-layer-row' + (master.id === this.editor.masterId ? ' selected' : ''));
            row.append(button('◇  ' + master.name, () => this.selectMaster(master.id), { className: 'cf-text-button' }), button(layer.locked ? 'Locked' : '○', () => this.history.execute('Toggle layer lock', () => layer.locked = !layer.locked, g.id), { className: 'cf-mini', title: 'Toggle edit lock' }));
            this.layerList.append(row);
        }
    }
    updateStatus() { if (!this.editor)
        return; this.projectLabel.textContent = this.doc.info.familyName; this.statusLeft.textContent = `${this.doc.data.glyphs.length} glyphs  ·  ${this.doc.data.masters.length} masters  ·  ${this.doc.info.unitsPerEm} UPM`; this.statusRight.textContent = `${this.previewInstance ? 'Instance preview · ' : ''}${this.renderer.backend}  ·  ${this.editor.snap ? 'Snap 1u' : 'Snap off'}`; if (this.modeLabel) {
        this.modeLabel.textContent = this.previewInstance ? 'INTERPOLATED PREVIEW · READ ONLY' : this.editor.layer?.locked ? 'LOCKED SOURCE LAYER' : '';
        this.modeLabel.hidden = !this.modeLabel.textContent;
    } this.header.classList.toggle('is-dirty', this.doc.dirty); }
    updateAll() { this.updateMasterControls(); this.renderMasters(); this.updateInspector(); this.updateStatus(); this.renderLog(); }
    zoom(factor) { this.renderer.camera.zoomAt(factor, { x: this.canvasHost.clientWidth / 2, y: this.canvasHost.clientHeight / 2 }); this.renderer.invalidate(); this.updateStatus(); this.workspaceUI?.updateZoom(); }
    toggleTheme() { this.workspaceUI.setPreference('theme',this.theme==='light'?'dark':'light'); }
    async newFont() { if (this.doc.dirty && !confirm('Create a new font? The current project will be saved to local recovery storage when available.'))
        return; const saved = await this.autosave.flush(); if (!saved && this.doc.dirty && !confirm('Local recovery could not save this project. Continue without a recovery copy?')) return; const data = createFont('Untitled Family'); data.glyphs = [createGlyph('.notdef', null), createGlyph('space', 32), createGlyph('A', 65)]; this.replaceDocument(new FontDocument(data)); this.activate('glyph'); }
    replaceDocument(document, confirmDiscard = false) { if (confirmDiscard && this.doc.dirty && !confirm('Replace the current workspace? Save a project file first to keep a portable copy.'))
        return; this.editor.cancel(); this.history.clear(); this.previewInstance = false; this.editor.readOnly = false; const incoming = structuredClone(document.data ?? document); if (!incoming.glyphs.length)
        incoming.glyphs.push(createGlyph('.notdef', null, incoming.masters)); this.doc.replace(incoming); this.history.clear(); this.editor.setMaster(this.doc.data.masters[0].id); this.state.SetValue('masterId', this.editor.masterId); this.state.sync(); this.selectGlyph(this.doc.glyph('A')?.id || this.doc.data.glyphs[0]?.id); this.proof.update({ masterId: this.editor.masterId, variable: false }); this.featureText.value = this.doc.data.features; this.updateAll(); this.renderer.fit(); this.doc.markSaved(); this.autosave?.flush(); }
    async openFile(file = null) {
        file ??= await chooseFile();
        if (!file)
            return;
        if (file.size > 128 * 1024 * 1024)
            throw new Error('Files over 128 MiB are not accepted');
        const name = file.name.toLowerCase();
        if(name.endsWith('.png')){if(!this.editor.canEdit)throw new Error('Select an editable source layer before importing artwork');showArtwork(this,{file});return;}
        if(name.endsWith('.ttc')||name.endsWith('.otc')){showCollectionBuilder(this,{files:[file]});return;}
        if (name.endsWith('.svg')) {
            if(!this.editor.canEdit)throw new Error('Select an editable source layer before importing SVG');
            const originalDoc=this.doc,originalRevision=this.doc.revision,glyphId=this.editor.glyphId,masterId=this.editor.masterId;
            const text=await file.text(), {contours:paths,warnings}=readSVGOutlines(text);
            if(this.doc!==originalDoc||this.doc.revision!==originalRevision||this.editor.glyphId!==glyphId||this.editor.masterId!==masterId||!this.editor.canEdit)throw new Error('Source changed during SVG import; import again');
            if (!paths.length)
                throw new Error('No supported SVG outlines');
            const b = bounds(paths), scale = this.doc.info.capHeight / (b.height || 1);
            transformContours(paths, [scale, 0, 0, -scale, 50 - b.minX * scale, b.maxY * scale]);
            this.editor.transaction('Import SVG outlines', () => {for(const path of paths)this.editor.layer.contours.push(path);});
            if(warnings.length)toast(warnings.join(' '));
            this.renderer.fit();
            return;
        }
        this.statusLeft.textContent = 'Importing ' + file.name + '…';
        let imported;
        if (name.endsWith('.counterform') || name.endsWith('.json'))
            imported = new FontDocument(parseProject(await file.text()));
        else if (name.endsWith('.ufoz') || name.endsWith('.zip'))
            imported = await importUFO(new Uint8Array(await file.arrayBuffer()));
        else {
            const original=new Uint8Array(await file.arrayBuffer());
            imported=await importFont(original,{skia:this.S,onProgress:(done,total)=>this.statusLeft.textContent=`Importing glyph ${done}/${total}`});
            try{imported.data.originalFont=await captureOriginal(original,imported.data,{filename:file.name});}catch(e){this.record('Original preservation',e.message);}
        }
        if (this.doc.dirty)
            await this.autosave.flush();
        this.replaceDocument(imported);
        this.state.SetValue('category', 'all');
        this.categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
        this.record('Import', `${file.name}: ${this.doc.data.glyphs.length} glyphs`);
        if (imported.data.importInfo?.warnings?.length) {
            for (const w of imported.data.importInfo.warnings)
                this.record('Import warning', w);
            toast('Font imported. Review import limitations in the Output panel.');
        }
    }
    saveProject() { this.notes.flush(); download(JSON.stringify(this.doc.data, null, 2), this.doc.info.familyName.replace(/[^\w-]/g, '_') + '.counterform', 'application/json'); this.doc.markSaved(); this.autosave.flush(); toast('Project downloaded; local recovery also saved.'); }
    async showRecent() { const d = dialog('Recent local projects', { subtitle: 'Browser-local recovery. Download .counterform files for durable, portable backups.' }), rows = await this.store.list(); if (!rows.length)
        d.body.append(el('p', 'cf-muted', 'No saved projects yet.')); for (const row of rows) {
        const item = el('div', 'cf-recent-row');
        item.append(el('div', '', row.name), el('span', 'cf-muted', new Date(row.modified).toLocaleString()), button('Open', async () => { const data = await this.store.load(row.id); if (data) {
            await this.autosave.flush();
            this.replaceDocument(new FontDocument(data));
            d.close();
        } }));
        d.body.append(item);
    } }
    showNewGlyph() { return formDialog('Create glyph', [['name', 'Glyph name', 'newGlyph', {}], ['unicode', 'Unicode (hex, optional)', '', {}]], { subtitle: 'Creates an empty, compatible layer in every master.', onSubmit: v => { const name = v.name.trim(), cp = v.unicode ? parseInt(v.unicode.replace(/^U\+/i, ''), 16) : null; if (!name || /\s/.test(name) || this.doc.glyph(name))
            throw new Error('Choose a unique glyph name without spaces'); if (cp !== null && (!Number.isInteger(cp) || cp < 0 || cp > 0x10ffff || cp >= 0xd800 && cp <= 0xdfff || this.doc.char(cp)))
            throw new Error('Choose an unassigned Unicode scalar'); const g = createGlyph(name, cp, this.doc.data.masters.map(m => m.id)); this.history.execute('Create glyph', () => this.doc.addGlyph(g)); this.selectGlyph(g.id); this.activate('glyph'); } }); }
    duplicateCurrent() { return formDialog('Duplicate glyph', [['name', 'New glyph name', this.editor.glyph.name + '.copy', {}]], { onSubmit: v => { if (!v.name.trim() || this.doc.glyph(v.name))
            throw new Error('Choose a unique glyph name'); const g = duplicateGlyph(this.editor.glyph, v.name); this.history.execute('Duplicate glyph', () => this.doc.addGlyph(g)); this.selectGlyph(g.id); } }); }
    deleteGlyph() { const g = this.editor.glyph; if(this.doc.data.glyphs.some(x=>x.id!==g.id&&paintReferences(x.colorPaint).has(g.id)))throw new Error('This glyph is referenced by a color paint graph. Remove that reference first.'); if (this.doc.data.glyphs.some(x => x.id !== g.id && x.colorLayers?.some(l => l.glyphId === g.id))) throw new Error('This glyph is referenced by a color layer. Remove that reference first.'); if (g.name === '.notdef')
        throw new Error('Keep the .notdef glyph'); if (this.doc.data.glyphs.some(x => x.layers.some(l => l.components.some(c => c.glyphId === g.id || c.glyphName === g.name))))
        throw new Error('This glyph is referenced by components. Decompose or remove those references first.'); if (confirm(`Delete ${g.name} from every master?`))
        this.history.execute('Delete glyph', () => { this.doc.data.glyphs = this.doc.data.glyphs.filter(x => x.id !== g.id); }); }
    showTransform() { return formDialog('Transform outlines', [['sx', 'Scale X (%)', 100, { type: 'number' }], ['sy', 'Scale Y (%)', 100, { type: 'number' }], ['angle', 'Rotate (degrees)', 0, { type: 'number' }], ['slant', 'Slant (degrees)', 0, { type: 'number' }], ['x', 'Translate X', 0, { type: 'number' }], ['y', 'Translate Y', 0, { type: 'number' }]], { subtitle: this.editor.selection.size ? 'Applies to selected nodes.' : 'Applies to all contours in the current master.', onSubmit: v => { const a = v.angle * Math.PI / 180, k = Math.tan(v.slant * Math.PI / 180), sx = v.sx / 100, sy = v.sy / 100, c = Math.cos(a), s = Math.sin(a); this.editor.transform([c * sx, s * sx, (c * k - s) * sy, (s * k + c) * sy, v.x, v.y]); } }); }
    showFontInfo() { const i = this.doc.info; return formDialog('Font information', [['familyName', 'Family', i.familyName, {}], ['styleName', 'Style', i.styleName, {}], ['unitsPerEm', 'Units per em', i.unitsPerEm, { type: 'number', min: 16, max: 16384 }], ['ascender', 'Ascender', i.ascender, { type: 'number' }], ['descender', 'Descender', i.descender, { type: 'number' }], ['capHeight', 'Cap height', i.capHeight, { type: 'number' }], ['xHeight', 'x-height', i.xHeight, { type: 'number' }], ['lineGap', 'Line gap', i.lineGap, { type: 'number' }], ['weightClass', 'Weight class', i.weightClass, { type: 'number', min: 1, max: 1000 }], ['widthClass', 'Width class', i.widthClass, { type: 'number', min: 1, max: 9 }], ['italicAngle', 'Italic angle', i.italicAngle, { type: 'number' }], ['designer', 'Designer', i.designer, {}], ['manufacturer', 'Manufacturer', i.manufacturer, {}], ['copyright', 'Copyright', i.copyright, {}], ['license', 'License', i.license, {}]], { wide: true, subtitle: 'Changing UPM changes interpretation, not outline coordinates. Scale geometry separately when needed.', onSubmit: v => { if (!v.familyName.trim() || !v.styleName.trim() || !Number.isInteger(v.unitsPerEm) || v.unitsPerEm < 16 || v.unitsPerEm > 16384)
            throw new Error('Valid names and UPM 16–16384 required'); for (const k of ['ascender', 'descender', 'capHeight', 'xHeight', 'lineGap', 'italicAngle'])
            if (Math.abs(v[k]) > 32767)
                throw new Error(`${k} exceeds the font metric range`); if (v.ascender <= v.descender || v.weightClass < 1 || v.weightClass > 1000 || v.widthClass < 1 || v.widthClass > 9)
            throw new Error('Invalid metrics, weight or width class'); this.history.execute('Edit font information', () => Object.assign(this.doc.info, v)); } }); }
    addAnchor() { return formDialog('Add attachment anchor', [['name', 'Anchor name', 'top', {}], ['x', 'X', this.editor.layer.advanceWidth / 2, { type: 'number' }], ['y', 'Y', this.doc.info.capHeight, { type: 'number' }]], { subtitle: 'A base anchor “top” attaches to a mark anchor “_top”. New anchors are added to every master to preserve compatibility.', onSubmit: v => { if (!v.name || this.editor.layer.anchors.some(a => a.name === v.name))
            throw new Error('Anchor names must be nonempty and unique'); this.history.execute('Add anchor', () => { for (const l of this.editor.glyph.layers)
            l.anchors.push({ name: v.name, x: v.x, y: v.y }); }, this.editor.glyphId); } }); }
    editAnchor(index) { const a = this.editor.layer.anchors[index]; return formDialog('Edit anchor', [['name', 'Name', a.name, {}], ['x', 'X', a.x, { type: 'number' }], ['y', 'Y', a.y, { type: 'number' }]], { onSubmit: v => this.editor.transaction('Edit anchor', () => Object.assign(a, v)) }); }
    addComponent() { const choices = this.doc.data.glyphs.filter(g => g.id !== this.editor.glyphId).map(g => ({ value: g.id, label: g.name })); return formDialog('Add glyph component', [['glyphId', 'Base glyph', choices[0]?.value, { options: choices }], ['x', 'X offset', 0, { type: 'number' }], ['y', 'Y offset', 0, { type: 'number' }]], { subtitle: 'Linked outlines are resolved live. Components are added to every master; recursive references are rejected.', onSubmit: v => { if (!this.doc.glyph(v.glyphId))
            throw new Error('Choose a base glyph'); for (const m of this.doc.data.masters)
            this.doc.resolve(v.glyphId, m.id, new Set([this.editor.glyphId])); this.history.execute('Add component', () => { for (const l of this.editor.glyph.layers)
            l.components.push({ id: uid('component'), glyphId: v.glyphId, transform: [1, 0, 0, 1, v.x, v.y] }); }, this.editor.glyphId); } }); }
    editComponent(index) { const c = this.editor.layer.components[index], m = c.transform; return formDialog('Component transform', [['a', 'Scale X', m[0], { type: 'number', step: .01 }], ['b', 'YX', m[1], { type: 'number', step: .01 }], ['c', 'XY', m[2], { type: 'number', step: .01 }], ['d', 'Scale Y', m[3], { type: 'number', step: .01 }], ['x', 'X offset', m[4], { type: 'number' }], ['y', 'Y offset', m[5], { type: 'number' }]], { onSubmit: v => this.editor.transaction('Transform component', () => c.transform = [v.a, v.b, v.c, v.d, v.x, v.y]) }); }
    showKerningPair() { return formDialog('Edit kerning pair', [['left', 'Left glyph', 'A', {}], ['right', 'Right glyph', 'V', {}], ['value', 'Adjustment (font units)', kerningValue(this.doc.data, this.editor.masterId, 'A', 'V'), { type: 'number', min: -32768, max: 32767 }]], { onSubmit: v => { if (!this.doc.glyph(v.left) || !this.doc.glyph(v.right) || Math.abs(v.value) > 32767)
            throw new Error('Choose existing glyphs and a signed 16-bit value'); this.history.execute('Edit kerning pair', () => { (this.doc.data.kerning[this.editor.masterId] ??= {})[pairKey(v.left, v.right)] = v.value; }); } }); }
    showGroups() { const d = dialog('Kerning groups', { subtitle: 'JSON object: group name → ordered array of glyph names. Pair keys can refer to these groups.', wide: true }), text = el('textarea', 'cf-code-editor'); text.value = JSON.stringify(this.doc.data.groups, null, 2); text.style.minHeight = '320px'; d.body.append(text); d.footer.append(button('Cancel', () => d.close()), button('Apply groups', () => { const groups = JSON.parse(text.value); if (!groups || Array.isArray(groups) || typeof groups !== 'object')
        throw new Error('Expected a JSON object'); for (const [name, members] of Object.entries(groups)) {
        if (!name || !Array.isArray(members) || members.some(n => typeof n !== 'string' || !this.doc.glyph(n)))
            throw new Error(`Invalid glyph group ${name}`);
    } this.history.execute('Edit kerning groups', () => this.doc.data.groups = groups); d.close(); }, { className: 'primary' })); }
    checkFeatures() { const parsed = parseFeatures(this.featureText.value, new Set(this.doc.data.glyphs.map(g => g.name))); this.featureMessage.textContent = 'Syntax valid. ' + parsed.features.length + ' feature blocks. Apply to rebuild the compiled proof.'; this.featureMessage.className = 'cf-feature-message success'; return parsed; }
    applyFeatures() { try {
        this.checkFeatures();
        this.history.execute('Edit OpenType source', () => this.doc.data.features = this.featureText.value);
        this.record('OpenType', 'Applied feature source');
        toast('Features applied. The live proof is recompiling.');
    }
    catch (e) {
        this.featureMessage.textContent = e.message;
        this.featureMessage.className = 'cf-feature-message error';
        throw e;
    } }
    async showValidation(glyphId = null) { const result = await this.compiler.validate(this.doc), issues = result.issues.filter(x => !glyphId || !x.glyphId || x.glyphId === glyphId), errors = issues.filter(x => x.severity === 'error').length, warnings = issues.filter(x => x.severity === 'warning').length, d = dialog(glyphId ? 'Glyph validation' : 'Font validation', { subtitle: `${errors} errors · ${warnings} warnings · ${issues.length - errors - warnings} observations`, wide: true }); if (!issues.length)
        d.body.append(el('div', 'cf-success-card', 'No issues found by the implemented checks.'));
    else {
        const list = el('div', 'cf-issues');
        for (const issue of issues) {
            const row = button('', () => { if (issue.glyphId) {
                this.selectGlyph(issue.glyphId);
                this.activate('glyph');
                d.close();
            } });
            row.className = 'cf-issue';
            row.innerHTML = `<span class="cf-badge ${escapeHTML(issue.severity)}">${escapeHTML(issue.severity)}</span><span><strong>${escapeHTML(issue.glyphName || issue.glyph || issue.code || 'Font')}</strong><br>${escapeHTML(issue.message)}</span>`;
            list.append(row);
        }
        d.body.append(list);
    } d.footer.append(button('Download report', () => download(JSON.stringify({ revision: this.doc.revision, issues }, null, 2), 'validation.json', 'application/json')), button('Close', () => d.close(), { className: 'primary' })); return issues; }
    showColors() { return showColorEditor(this); }
    showPaints() { return showPaintEditor(this); }
    async showTables() { const {report, byteLength} = await this.compiler.inspect(this.doc, {masterId:this.editor.masterId}), d = dialog('Compiled OpenType tables', { subtitle: `TrueType · ${byteLength.toLocaleString()} bytes · ${report.tables.length} tables`, wide: true }); const table = el('table', 'cf-table'); table.innerHTML = '<thead><tr><th>Tag</th><th>Bytes</th><th>Checksum</th><th>Verified</th></tr></thead>'; const body = el('tbody'); for (const t of report.tables)
        body.innerHTML += `<tr><td><code>${escapeHTML(t.tag)}</code></td><td>${t.length.toLocaleString()}</td><td><code>${t.checksum.toString(16).padStart(8, '0')}</code></td><td>${t.validChecksum ? '✓' : 'Mismatch'}</td></tr>`; table.append(body); d.body.append(table); }
    showExport() { const d = dialog('Export font', { subtitle: 'Compile actual font binaries from the editable source. No server upload.', wide: true }), form = el('div', 'cf-form-grid'), format = field('Format', 'ttf', { options: [{ value: 'ttf', label: 'TrueType · .ttf' }, { value: 'otf', label: 'OpenType CFF · .otf' }, {value:'cff2',label:'OpenType CFF2 · .otf'}, {value:'variable-cff2',label:'Variable CFF2 · .otf'}, {value:'woff2',label:'WOFF2 TrueType · .woff2'}, {value:'variable-woff2',label:'WOFF2 variable TrueType · .woff2'}, {value:'cff2-woff2',label:'WOFF2 variable CFF2 · .woff2'}, { value: 'woff', label: 'Web Open Font Format · .woff' }, { value: 'variable', label: 'Variable TrueType · .ttf' }, { value: 'ufoz', label: 'UFO 3 source archive · .ufoz' }, { value: 'project', label: 'Counterform source · .counterform' }] }), master = field('Source master', this.editor.masterId, { options: this.doc.data.masters.map(m => ({ value: m.id, label: m.name })) }), name = field('File name', this.doc.info.familyName.replace(/[^a-zA-Z0-9_-]/g, '') + '-' + (this.doc.data.masters.find(m => m.id === this.editor.masterId)?.name || 'Regular'), {}); form.append(format.element, master.element, name.element); const note = el('div', 'cf-export-note'); note.innerHTML = '<strong>Export contract</strong><p>Static export includes contours, Unicode, metrics, names, pair kerning and supported GSUB/GPOS rules. Variable TrueType includes fvar, gvar, STAT, HVAR and optional MVAR. Variable CFF2 includes cubic blend programs and variable metrics. WOFF2 uses portable Brotli stored blocks (valid but not size-optimized). Variable kerning and mark-to-base anchors use GDEF variation stores. Hinting remains a separate authoring contract. UFO preserves all source masters in layers and embeds Counterform metadata.</p><p>COLRv0/v1 and CPALv0/v1 color layers are compiled and reconstructed on supported TrueType imports. Other imported layout tables, hint programs and variable color paint graphs are not reconstructed. Artwork references remain source-only unless explicitly converted to foreground outlines. Keep the original font and review import warnings.</p>'; const errors = [], check = el('div', 'cf-export-check', 'Validation runs in the compiler worker when you export.'); const progress = el('p', 'cf-muted'); d.body.append(form, check, note, progress); d.footer.append(button('Cancel', () => d.close()), button('Export', async () => { if (errors.length && !['project', 'ufoz'].includes(format.input.value))
        throw new Error('Resolve validation errors before exporting'); if (!name.input.value.trim())
        throw new Error('Choose a file name'); progress.textContent = 'Compiling in worker…';
        const abort = new AbortController();
        d.onClose( () => abort.abort());
        let bytes, extension = format.input.value, mime;
        const exportRevision = this.doc.revision;
        if (extension === 'project') {bytes=JSON.stringify(this.doc.data,null,2);extension='counterform';mime='application/json';}
        else {
            try {
                const result = await this.compiler.compile(this.doc,{format:extension,masterId:master.input.value,validate:extension!=='ufoz'},{signal:abort.signal,priority:-10});
                bytes=result.bytes;mime=result.mime;if(extension==='variable')extension='ttf';else if(['cff2','variable-cff2'].includes(extension))extension='otf';else if(['variable-woff2','cff2-woff2'].includes(extension))extension='woff2';
            } catch (error) { if(error.name==='AbortError')return;progress.textContent=error.message;throw error; }
        }
        if (!d.element.open) return;
        if (this.doc.revision !== exportRevision) this.record('Export','Source changed during compilation; exported the captured snapshot.');
 const filename = name.input.value.replace(/[\\/:*?"<>|]/g, '_') + '.' + extension; download(bytes, filename, mime); this.record('Export', `${filename} · ${(bytes.byteLength ?? bytes.length).toLocaleString()} bytes`); toast('Exported ' + filename); d.close(); }, { className: 'primary' })); }
    renderMasters() { if (!this.mastersPane)
        return; this.mastersPane.replaceChildren(); const title = section('Design space', { extra: button('+ Master', () => this.addMaster(), { className: 'cf-mini' }) }); this.mastersPane.append(title.element); for (const m of this.doc.data.masters) {
        const card = el('div', 'cf-master-card' + (m.id === this.editor.masterId ? ' selected' : ''));
        card.append(button(m.name, () => this.selectMaster(m.id), { className: 'cf-text-button' }), el('span', 'cf-mono', Object.entries(m.location || {}).map(([a, v]) => a + ' ' + v).join(' · ') || 'Default'));
        card.append(button('Edit', () => this.editMaster(m), { className: 'cf-mini' }));
        this.mastersPane.append(card);
    } const axes = section('Variable preview', { extra: button('+ Axis', () => this.addAxis(), { className: 'cf-mini' }) }); axes.element.append(el('p', 'cf-muted', 'Move an axis to inspect an interpolated, read-only instance. Choose a master to return to editing.')); for (const a of this.doc.data.axes) {
        const row = el('div', 'cf-axis'), head = el('div', 'cf-axis-head'), value = el('output', 'cf-mono', String(this.location[a.tag] ?? a.default));
        head.append(el('strong', '', a.name || a.tag), el('code', '', a.tag), value);
        const input = el('input');
        input.type = 'range';
        input.min = a.min;
        input.max = a.max;
        input.step = (a.max - a.min) / 1000 || 1;
        input.value = this.location[a.tag] ?? a.default;
        input.setAttribute('aria-label', a.name || a.tag);
        input.addEventListener('input', () => { this.location[a.tag] = Number(input.value); value.textContent = (+input.value).toFixed(1); clearTimeout(this.axisTimer); this.axisTimer = setTimeout(() => this.safe(() => this.applyInstancePreview()), 45); });
        const labels = el('div', 'cf-axis-limits');
        labels.append(el('span', '', String(a.min)), el('span', '', String(a.default)), el('span', '', String(a.max)));
        row.append(head, input, labels);
        axes.element.append(row);
    } if (!this.doc.data.axes.length)
        axes.element.append(el('p', 'cf-muted', 'No variation axes defined.')); this.mastersPane.append(axes.element); const actions = el('div', 'cf-button-stack'); actions.append(button('Axis mapping…', () => this.commands.run('axis.map')), button('Check master compatibility', () => this.checkCompatibility()), button('Generate static instance', () => this.generateInstance()), button('Export variable font', () => this.showExport())); this.mastersPane.append(actions); }
    applyInstancePreview() { if (!this.doc.data.axes.length)
        return; const instance = instanceDocument(this.doc, this.location); this.previewInstance = true; this.editor.readOnly = true; this.renderer.setScene({ artwork:[], hasColorPaint:false, colorLayers:(this.editor.glyph.colorLayers || []).map(l=>({contours:instance.resolve(l.glyphId),color:l.paletteIndex===65535?null:this.doc.data.palettes[0][l.paletteIndex]})), contours: instance.resolve(this.editor.glyphId), editable: [], advanceWidth: instance.layer(this.editor.glyphId).advanceWidth, ghost: [] }); this.proof.update({ variable: true, location: this.location }); this.updateStatus(); this.updateInspector(); }
    addMaster() { return formDialog('Add master', [['name', 'Name', 'New Master', {}], ...this.doc.data.axes.map(a => [a.tag, a.name || a.tag, this.location[a.tag] ?? a.default, { type: 'number', min: a.min, max: a.max }])], { subtitle: 'Clones all glyph layers and kerning from the selected master. Use a unique axis location.', onSubmit: v => { const location = Object.fromEntries(this.doc.data.axes.map(a => [a.tag, v[a.tag]])); let id; this.history.execute('Add master', () => id = addMaster(this.doc, v.name, location, this.editor.masterId)); this.selectMaster(id); } }); }
    editMaster(master) { return formDialog('Master properties', [['name', 'Name', master.name, {}], ...this.doc.data.axes.map(a => [a.tag, a.name || a.tag, master.location?.[a.tag] ?? a.default, { type: 'number', min: a.min, max: a.max }])], { onSubmit: v => this.history.execute('Edit master', () => { master.name = v.name; master.location = Object.fromEntries(this.doc.data.axes.map(a => [a.tag, v[a.tag]])); }) }); }
    addAxis() { return formDialog('Add variation axis', [['tag', 'Four-character tag', 'wdth', {}], ['name', 'Axis name', 'Width', {}], ['min', 'Minimum', 75, { type: 'number' }], ['default', 'Default', 100, { type: 'number' }], ['max', 'Maximum', 125, { type: 'number' }]], { onSubmit: v => { if (!/^[ -~]{4}$/.test(v.tag) || this.doc.data.axes.some(a => a.tag === v.tag) || v.min >= v.default || v.default >= v.max)
            throw new Error('Use a unique four-character tag and min < default < max'); this.history.execute('Add variation axis', () => { this.doc.data.axes.push(v); for (const m of this.doc.data.masters)
            m.location[v.tag] = v.default; }); } }); }
    checkCompatibility() { const d = dialog('Master compatibility', { subtitle: 'Checks contour topology, handle topology, component identity and anchor order.', wide: true }); let count = 0; for (const g of this.doc.data.glyphs) {
        const issues = compatibility(this.doc.data.masters.map(m => g.layers.find(l => l.masterId === m.id)).filter(Boolean));
        if (issues.length) {
            count++;
            const row = button(`${g.name}: ${issues.join('; ')}`, () => { this.selectGlyph(g.id); d.close(); });
            row.className = 'cf-issue';
            d.body.append(row);
        }
    } if (!count)
        d.body.append(el('div', 'cf-success-card', 'All glyph masters have compatible topology.')); }
    generateInstance() { return formDialog('Generate static instance', [['name', 'Instance style name', 'Custom Instance', {}], ...this.doc.data.axes.map(a => [a.tag, a.name || a.tag, this.location[a.tag] ?? a.default, { type: 'number', min: a.min, max: a.max }])], { subtitle: 'Downloads a new editable project. The current family remains unchanged.', onSubmit: v => { const location = Object.fromEntries(this.doc.data.axes.map(a => [a.tag, v[a.tag]])), instance = instanceDocument(this.doc, location, { name: v.name }); download(JSON.stringify(instance.data, null, 2), this.doc.info.familyName + '-' + v.name + '.counterform', 'application/json'); } }); }
    showPalette() { const d = dialog('Commands', { subtitle: 'Search every registered action. Shortcuts respect focused text editors.', className: 'cf-command-dialog' }), input = el('input', 'cf-command-search'); input.placeholder = 'Type a command…'; input.setAttribute('aria-label', 'Search commands'); const list = el('div', 'cf-command-list'); let selected = 0, results = []; const render = () => { results = this.commands.search(input.value); selected = Math.min(selected, results.length - 1); list.replaceChildren(); results.slice(0, 100).forEach((c, i) => { const item = button('', () => { d.close(); return this.commands.run(c.id); }); item.disabled = !this.commands.canExecute(c.id); item.className = 'cf-command-item' + (i === selected ? ' active' : ''); item.append(el('span', '', c.label), el('kbd', '', (this.commands.bindings.get(c.id) || []).slice(0, 1).map(k => formatBinding(k, this.commands.isMac)).join(''))); list.append(item); }); }; input.addEventListener('input', () => { selected = 0; render(); }); input.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        selected = Math.max(0, Math.min(results.length - 1, selected + (e.key === 'ArrowDown' ? 1 : -1)));
        render();
        list.children[selected]?.scrollIntoView({ block: 'nearest' });
    } if (e.key === 'Enter' && results[selected]) {
        e.preventDefault();
        const id = results[selected].id;
        d.close();
        this.commands.run(id).catch(() => { });
    } }); d.body.append(input, list); render(); input.focus(); }
    showBindings() { const d = dialog('Keyboard shortcuts', { subtitle: 'FontLab-inspired editing keys with a browser-safe command layer. This is not a complete native FontLab keymap.', wide: true }), search = el('input', 'cf-search'); search.placeholder = 'Filter commands…'; const list = el('div', 'cf-keymap'); const render = () => { list.replaceChildren(); for (const c of this.commands.search(search.value)) {
        const row = el('div', 'cf-key-row'), input = el('input');
        input.value = (this.commands.bindings.get(c.id) || []).join(', ');
        input.placeholder = 'Example: Mod+Shift+K';
        input.setAttribute('aria-label', c.label + ' shortcut');
        row.append(el('span', '', c.label), input, button('Set', async () => { this.commands.rebind(c.id, input.value.split(',').map(s => s.trim()).filter(Boolean)); await this.store.preference('keymap', this.commands.exportBindings()); toast('Shortcut saved'); }));
        list.append(row);
    } }; search.addEventListener('input', render); d.body.append(el('p', 'cf-warning-card', 'Browser/OS-reserved shortcuts may not reach the page. Mod means Command on macOS and Control elsewhere. Tool and nudge commands apply only while the outline canvas has focus.'), search, list); d.footer.append(button('Export keymap', () => download(JSON.stringify(this.commands.exportBindings(), null, 2), 'counterform-keymap.json', 'application/json')), button('Import keymap', async () => { const file = await chooseFile({ accept: '.json' }); if (file) {
        this.commands.importBindings(JSON.parse(await file.text()));
        await this.store.preference('keymap', this.commands.exportBindings());
        render();
    } }), button('Done', () => d.close(), { className: 'primary' })); render(); }
    showRecipe() { const d = dialog('Batch outline recipe', { subtitle: 'Declarative, deterministic operations. No eval and no untrusted JavaScript execution.', wide: true }), text = el('textarea', 'cf-code-editor'); text.style.minHeight = '300px'; text.value = JSON.stringify(recipes.clean, null, 2); const target = field('Target', 'current', { options: [{ value: 'current', label: 'Current glyph / current master' }, { value: 'all', label: 'All glyphs / all masters' }] }); d.body.append(target.element, text); d.footer.append(button('Cancel', () => d.close()), button('Run recipe', () => { const recipe = JSON.parse(text.value); this.history.execute('Run outline recipe', () => applyRecipe(this.doc, recipe, { glyphIds: target.input.value === 'current' ? [this.editor.glyphId] : null, masterIds: target.input.value === 'current' ? [this.editor.masterId] : null })); d.close(); }, { className: 'primary' })); }
    async verifyCompute() { const available = this.compute.device || await this.compute.initialize(), masters = [new Float32Array([0, 10, 20, 30]), new Float32Array([100, 110, 120, 130])], weights = [.25, .75], result = await this.compute.interpolate(masters, weights), expected = [75, 85, 95, 105]; if (!result.every((v, i) => Math.abs(v - expected[i]) < .001))
        throw new Error('Compute verification failed'); const message = `Interpolation verified: ${this.compute.backend} · [${[...result].join(', ')}]`; this.record('Compute', message); toast(message); return { available: !!available, backend: this.compute.backend, result: [...result] }; }
    showAbout() { const d = dialog('Counterform Studio', { subtitle: `Version ${version} · original, modular font-authoring software`, wide: true }); d.body.innerHTML = `<div class="cf-about-brand">${brand}<div><h1>Make every curve count.</h1><p>A local-first workspace built from your browser-native components.</p></div></div><h3>Implemented in this build</h3><p>Editable cubic outlines; Skia rendering and path operations; node/handle tools; Unicode and metrics; components and anchors; multi-master interpolation; static and variable TrueType/CFF/CFF2 compilation; supported GSUB/GPOS attachments and conditional features; WOFF/WOFF2 and TTC collections; Unicode variation sequences; UFO and SVG outline interchange; static COLRv0/v1 palettes and paint graphs; PNG sbix and CBDT/CBLC bitmap strikes; PNG references, vector masks, worker autotrace and bounded curve fitting; compiled-font proofing, recovery, undo, recipes and remappable commands.</p><h3>Explicit parity boundaries</h3><p>This is not a feature-complete FontLab replacement. Full hinting authoring, complete Adobe feature syntax, all language-system shaping workflows, full variable/device attachment syntax, variable paint and SVG color-font authoring, arbitrary VFC/VFJ import, lossless compiled-font reconstruction, full native shortcut parity and Python macro compatibility remain outside this release.</p><h3>Component runtime</h3><div class="cf-component-grid">${Object.entries(componentVersions).map(([name, v]) => `<div><strong>${name}</strong><span>${v}</span></div>`).join('')}</div><p class="cf-muted">SkiaSharpWeb’s SK* API is consumed unchanged. Font authoring and compilation live in Counterform packages. No font data leaves the browser unless you explicitly download it.</p>`; d.footer.append(button('Keyboard shortcuts', () => { d.close(); this.showBindings(); }), button('Close', () => d.close(), { className: 'primary' })); }
    record(category, message) { this.log.push({ at: new Date().toISOString(), category, message }); if (this.log.length > 500)
        this.log.shift(); this.renderLog(); }
    renderLog() { if (!this.outputList)
        return; this.outputList.replaceChildren(); for (const item of this.log.slice(-100).reverse()) {
        const row = el('div', 'cf-log-row');
        row.append(el('time', '', item.at.slice(11, 19)), el('strong', '', item.category), el('span', '', item.message));
        this.outputList.append(row);
    } }
    dispose() { this.workspaceUI?.dispose(); clearTimeout(this.axisTimer); this.autosave?.dispose(); this.notes?.dispose(); this.proof?.dispose(); this.tiles?.dispose(); this.table?.dispose(); this.kerning?.dispose(); for (const dispose of [...this.disposables])
        dispose?.(); this.editor?.dispose(); this.renderer?.dispose(); this.compute?.dispose(); this.state?.Dispose(); this.commands?.dispose(); this.dock?.Dispose(); this.store.close(); this.host.replaceChildren(); this.menus?.close(false); }
}

