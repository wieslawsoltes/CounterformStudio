import {iconURL,commandIcon} from '@wieslawsoltes/counterform-icons';
import { ReactiveObject } from '@wieslawsoltes/reactiveweb';
import { SourceCache } from '@wieslawsoltes/dynamicdataweb/browser';
import { FlatTreeDataGridSource, TextColumn, CheckBoxColumn } from '@wieslawsoltes/treedatagridweb';
import '@wieslawsoltes/treedatagridweb/web';
import { registerRibbon } from '@wieslawsoltes/ribbon-web';
import { Workbook } from '@wieslawsoltes/gridweb';
import '@wieslawsoltes/gridweb/controls';
import { registerRichTextWeb } from '@wieslawsoltes/richtextweb/web';
import { FlowDocument } from '@wieslawsoltes/richtextweb';
import { toSVG, bounds } from '@wieslawsoltes/counterform-geometry';
import { pairKey, kerningValue } from '@wieslawsoltes/counterform-opentype';
export const escapeHTML = s => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export const componentVersions = { Dockyard: '0.1.0', TreeDataGridWeb: '0.1.0', DynamicDataWeb: '0.1.1', RibbonWeb: '0.1.1', SkiaSharpWeb: '0.5.0', ReactiveWeb: '0.2.0', RBushWeb: '0.1.1', QuikGraphWeb: '0.2.0', GridWeb: '0.5.0', RichTextWeb: '0.5.0' };
/** ReactiveUI-style view state + DynamicData keyed, incremental glyph projection. */
export class StudioState extends ReactiveObject {
    constructor(doc) { super({ glyphId: doc.data.glyphs[0]?.id, masterId: doc.data.masters[0].id, query: '', category: 'uppercase', status: 'Ready', dirty: false }); this.doc = doc; this.glyphs = new SourceCache(g => g.id); this.sync(); this.off = doc.changed.subscribe(e => { this.SetValue('dirty', doc.dirty); if (e.kind !== 'saved')
        this.sync(e.glyphId); }); }
    row(g) { const l = g.layers.find(l => l.masterId === this.GetValue('masterId')) || g.layers[0]; return { id: g.id, name: g.name, unicode: g.unicodes.map(c => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' '), character: g.unicodes.length ? String.fromCodePoint(g.unicodes[0]) : '', advance: l.advanceWidth, contours: l.contours.length, components: l.components.length, export: g.export, category: g.category, mark: g.mark }; }
    sync(id) { const g = id && this.doc.glyph(id); if (g)
        this.glyphs.AddOrUpdate(this.row(g));
    else
        this.glyphs.Edit(c => { c.Clear(); c.AddOrUpdate(this.doc.data.glyphs.map(g => this.row(g))); }); }
    Dispose() { this.off(); this.glyphs.Dispose(); super.Dispose(); }
}
function categoryMatches(row, category) { const cp = row.character.codePointAt(0); if (category === 'uppercase')
    return cp >= 65 && cp <= 90; if (category === 'lowercase')
    return cp >= 97 && cp <= 122; if (category === 'numbers')
    return cp >= 48 && cp <= 57; if (category === 'components')
    return row.components > 0; if (category === 'marks')
    return row.category === 'Mark'; return true; }
/** Virtualized SVG glyph tiles. Only viewport rows exist in the DOM. */
export class GlyphTiles {
    constructor(host, doc, state, onSelect, { cellSize = 65, category = true } = {}) { Object.assign(this, { host, doc, state, onSelect, cellSize, category }); this.rows = []; this.scroll = document.createElement('div'); this.scroll.className = 'cf-glyph-scroll'; this.scroll.tabIndex = 0; this.scroll.setAttribute('role', 'grid'); this.scroll.setAttribute('aria-label', 'Font glyphs'); this.content = document.createElement('div'); this.content.className = 'cf-glyph-spacer'; this.scroll.append(this.content); host.append(this.scroll); this.scroll.addEventListener('scroll', () => this.schedule()); this.scroll.addEventListener('click', e => { const b = e.target.closest('[data-glyph]'); if (b)
        onSelect(b.dataset.glyph); }); this.scroll.addEventListener('dblclick', e => { const b = e.target.closest('[data-glyph]'); if (b)
        this.onOpen?.(b.dataset.glyph); }); this.scroll.addEventListener('keydown', e => { const delta = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -this.columns, ArrowDown: this.columns })[e.key]; if (delta) {
        e.preventDefault();
        const i = this.rows.findIndex(r => r.id === state.GetValue('glyphId')), next = this.rows[Math.max(0, Math.min(this.rows.length - 1, i + delta))];
        if (next) {
            onSelect(next.id);
            this.scroll.scrollTop = Math.max(0, Math.floor((i + delta) / this.columns) * this.cellSize - this.scroll.clientHeight / 2);
        }
    } if (e.key === 'Enter')
        this.onOpen?.(state.GetValue('glyphId')); }); this.sub = state.glyphs.Connect().subscribe(() => this.filter()); this.stateSub = state.Changed.subscribe(e => { if (['query', 'category'].includes(e.PropertyName))
        this.filter();
    else if (e.PropertyName === 'glyphId' || e.PropertyName === 'masterId')
        this.schedule(); }); this.resize = new ResizeObserver(() => this.schedule()); this.resize.observe(host); this.filter(); }
    filter() { const q = this.state.GetValue('query', '').toLowerCase(), category = this.category ? this.state.GetValue('category') : 'all'; this.rows = this.state.glyphs.Items.filter(r => categoryMatches(r, category) && (!q || (r.name + ' ' + r.unicode + ' ' + r.character).toLowerCase().includes(q))); this.scroll.scrollTop = 0; this.schedule(); }
    schedule() { if (this.pending)
        return; this.pending = requestAnimationFrame(() => { this.pending = 0; this.render(); }); }
    render() {
        this.columns = Math.max(1, Math.floor(this.scroll.clientWidth / this.cellSize));
        const size = this.scroll.clientWidth / this.columns, rowHeight = this.cellSize + 8, rows = Math.ceil(this.rows.length / this.columns);
        this.content.style.height = `${rows * rowHeight}px`;
        this.content.replaceChildren();
        const first = Math.max(0, Math.floor(this.scroll.scrollTop / rowHeight) - 1), last = Math.min(rows, Math.ceil((this.scroll.scrollTop + this.scroll.clientHeight) / rowHeight) + 1), selected = this.state.GetValue('glyphId'), master = this.state.GetValue('masterId'), upm = this.doc.info.unitsPerEm;
        this.scroll.setAttribute('aria-rowcount', rows);
        this.scroll.setAttribute('aria-colcount', this.columns);
        for (let ri = first; ri < last; ri++)
            for (let ci = 0; ci < this.columns; ci++) {
                const r = this.rows[ri * this.columns + ci];
                if (!r)
                    continue;
                const el = document.createElement('button');
                el.className = 'cf-glyph-cell' + (r.id === selected ? ' selected' : '');
                el.dataset.glyph = r.id;
                el.setAttribute('role', 'gridcell');
                el.setAttribute('aria-selected', String(r.id === selected));
                el.title = `${r.name} · ${r.unicode || 'Unencoded'} · ${r.advance} u`;
                el.style.cssText = `position:absolute;left:${ci * size}px;top:${ri * rowHeight}px;width:${size}px;height:${rowHeight}px`;
                let cs = [];
                try {
                    cs = this.doc.resolve(r.id, master);
                }
                catch { }
                const b = bounds(cs), span = Math.max(upm, r.advance, b.width), origin = (span - r.advance) / 2;
                el.innerHTML = `<svg viewBox="${-origin} ${-this.doc.info.ascender} ${span} ${upm}" aria-hidden="true"><path transform="scale(1,-1)" d="${toSVG(cs)}"/></svg><span>${escapeHTML(r.name)}</span><i class="cf-glyph-state ${r.components ? 'component' : ''}"></i>`;
                this.content.append(el);
            }
    }
    dispose() { this.sub.unsubscribe(); this.stateSub.unsubscribe(); this.resize.disconnect(); cancelAnimationFrame(this.pending); this.host.replaceChildren(); }
}
export function createGlyphTable(doc, state, history, onSelect) { const grid = document.createElement('tree-data-grid'); grid.style.cssText = 'width:100%;height:100%;display:block;'; const source = new FlatTreeDataGridSource(state.glyphs.Items); source.Columns.AddRange([new TextColumn('Glyph', r => r.name, null, 160), new TextColumn('Unicode', r => r.unicode, null, 160), new TextColumn('Advance', r => r.advance, (r, value) => { const n = Number(value); if (!Number.isFinite(n) || n < 0 || n > 65535)
        throw new Error('Advance width must be 0–65535'); history.execute('Edit advance width', () => doc.layer(r.id, state.GetValue('masterId')).advanceWidth = n, r.id); }, 110), new TextColumn('Contours', r => r.contours, null, 100), new TextColumn('Components', r => r.components, null, 115), new CheckBoxColumn('Export', r => r.export, (r, v) => history.execute('Toggle glyph export', () => doc.glyph(r.id).export = !!v, r.id), 80)]); grid.Source = source; grid.addEventListener('selection-changed', e => { const r = e.detail.Selection?.SelectedItem; if (r)
    onSelect(r.id); }); const sub = state.glyphs.Connect().subscribe(() => source.Items = state.glyphs.Items); return { element: grid, source, dispose() { sub.unsubscribe(); source.Dispose?.(); grid.remove(); } }; }
export function createRibbon(registry, tabs, { theme = 'light' } = {}) { registerRibbon(); const ribbon = document.createElement('ribbon-web'); ribbon.model = { id: 'counterform-ribbon', title: 'Counterform Studio', theme, layout: 'classic', tabs: tabs.map(t => ({ id: t.id, header: t.label, groups: t.groups.map(g => ({ id: g.id, header: g.label, items: g.commands.map(id => { const c = registry.commands.get(id); return { id, type: 'button', label: c?.label || id, icon: iconURL(commandIcon(id)), tooltip: c?.description || c?.label || id, command: { CanExecute: () => registry.canExecute(id), Execute: () => registry.run(id).catch(() => { }) }, size: 'small' }; }) })) })), quickAccessToolbar: ['file.save','edit.undo','edit.redo'].filter(id=>registry.commands.has(id)).map(id=>({id:'quick-'+id,type:'button',label:registry.commands.get(id).label,icon:iconURL(commandIcon(id)),command:{CanExecute:()=>registry.canExecute(id),Execute:()=>registry.run(id).catch(()=>{})}})), backstage: ['file.new', 'file.open', 'file.save', 'file.export'].filter(id => registry.commands.has(id)).map(id => ({ id, label: registry.commands.get(id).label, command: () => registry.run(id) })) }; return ribbon; }
export function createKerningMatrix(doc, history, getMasterId, { onError = console.error } = {}) {
    const grid = document.createElement('grid-web'), book = new Workbook({ name: 'Kerning matrix' });
    grid.Workbook = book;
    grid.style.cssText = 'height:100%;width:100%;--grid-accent:#3875ef;--grid-head-active:#dfebff;';
    const sheet = book.ActiveWorksheet;
    sheet.Name = 'Kerning';
    let names = [], suppress = false, pending = false;
    function refresh() { suppress = true; try {
        names = ['A', 'V', 'W', 'T', 'Y', 'a', 'o', 'e', 'n', 'r', 's', 'period'].filter(n => doc.glyph(n));
        if (names.length < 3)
            names = doc.data.glyphs.filter(g => g.unicodes.length).slice(0, 12).map(g => g.name);
        book.Transaction(() => { sheet.GetCell(0, 0).Input = 'Left / Right'; sheet.SetColumnWidth(0, 100); for (let i = 0; i < names.length; i++) {
            sheet.GetCell(0, i + 1).Input = names[i];
            sheet.GetCell(i + 1, 0).Input = names[i];
            sheet.SetColumnWidth(i + 1, 80);
            for (let j = 0; j < names.length; j++)
                sheet.GetCell(i + 1, j + 1).Input = kerningValue(doc.data, getMasterId(), names[i], names[j]);
        } sheet.FreezePanes(1, 1); });
        book.ClearHistory();
    }
    finally {
        suppress = false;
    } grid.Refresh(); }
    const sub = book.Changed.Subscribe(() => { if (suppress || pending)
        return; pending = true; queueMicrotask(() => { pending = false; if (suppress)
        return; try {
        const updates = [];
        for (let i = 0; i < names.length; i++)
            for (let j = 0; j < names.length; j++) {
                const v = Number(sheet.GetCell(i + 1, j + 1).Value);
                if (!Number.isFinite(v) || Math.abs(v) > 32767)
                    throw new Error('Kerning must be a signed 16-bit number');
                if (v !== kerningValue(doc.data, getMasterId(), names[i], names[j]))
                    updates.push([pairKey(names[i], names[j]), v]);
            }
        if (updates.length)
            history.execute(`Edit ${updates.length} kerning pair${updates.length === 1 ? '' : 's'}`, () => { const k = doc.data.kerning[getMasterId()] ??= {}; for (const [key, value] of updates)
                k[key] = value; });
    }
    catch (e) {
        onError(e);
    }
    finally {
        refresh();
    } }); });
    grid.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.composedPath().some(x => x.tagName === 'TEXTAREA')) {
        e.preventDefault();
        e.stopPropagation();
        e.shiftKey ? history.redo() : history.undo();
    } }, { capture: true });
    const off = doc.changed.subscribe(e => { if (e.kind !== 'saved')
        refresh(); });
    refresh();
    return { element: grid, workbook: book, refresh, dispose() { off(); sub.Dispose(); grid.Dispose(); book.Dispose(); } };
}
export function createNotes(doc, history) { registerRichTextWeb(); const box = document.createElement('rich-text-box'); box.ViewMode = 'continuous'; box.style.cssText = 'display:block;height:100%;width:100%;'; let suppress = false, timer; function load() { suppress = true; try {
    if (doc.data.richNotes)
        box.Document = FlowDocument.FromJSON(doc.data.richNotes);
    else
        box.Text = doc.data.notes || '';
}
finally {
    suppress = false;
} } load(); const persist = () => { clearTimeout(timer); if (suppress)
    return; const text = box.Text, json = box.Document.ToJSON(); if (JSON.stringify(doc.data.richNotes) !== JSON.stringify(json))
    history.execute('Edit project notes', () => { doc.data.notes = text; doc.data.richNotes = json; }); }; box.addEventListener('documentchange', () => { if (!suppress) {
    clearTimeout(timer);
    timer = setTimeout(persist, 700);
} }); const off = doc.changed.subscribe(e => { if (e.kind === 'replace' && !history.active && box.Text !== doc.data.notes)
    load(); }); return { element: box, flush: persist, dispose() { clearTimeout(timer); off(); box.remove(); } }; }

