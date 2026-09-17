import {extraTools,defaultToolOptions,validateToolOptions,beginInteraction,moveInteraction,endInteraction} from './interactions.js';
import {openContourAt,joinContours,convertSegments,distributeNodes} from '@wieslawsoltes/counterform-construction';
import { RBush } from '@wieslawsoltes/rbushweb';
import { Signal } from '@wieslawsoltes/counterform-model';
import { node, contour, rectangle, ellipse, distance, nearestOnContour, splitSegment, transformContours, smoothNode, moveHandle, reverseContour, addExtrema, correctWinding, bounds, uid, containsPoint } from '@wieslawsoltes/counterform-geometry';
import { booleanContours, strokeContours } from '@wieslawsoltes/counterform-renderer';
export const tools = [{ id: 'select', label: 'Contour', key: 'A', icon: '↖' }, { id: 'pen', label: 'Pen', key: 'P', icon: '✒' }, { id: 'rectangle', label: 'Rectangle', key: 'R', icon: '▯' }, { id: 'ellipse', label: 'Ellipse', key: 'O', icon: '○' }, { id: 'insert', label: 'Insert point', key: 'J', icon: '⌁' }, { id: 'eraser', label: 'Eraser', key: '2', icon: '◇' }, { id: 'measure', label: 'Measure', key: 'G', icon: '↔' }, { id: 'pan', label: 'Hand', key: 'H', icon: '✋' }, ...extraTools];
/** Pointer transactions, picking and commands. No global window singleton or document mutation from rendering. */
export class GlyphEditor {
    changed = new Signal();
    selectionChanged = new Signal();
    status = new Signal();
    constructor(doc, history, renderer) {
        this.doc = doc;
        this.history = history;
        this.renderer = renderer;
        this.glyphId = doc.data.glyphs.find(g => g.name === 'A')?.id || doc.data.glyphs[0]?.id;
        this.masterId = doc.data.masters[0].id;
        this.selection = new Set();
        this.tool = 'select';
        this.toolOptions = {...defaultToolOptions};
        this.snap = true;
        this.gridStep = 1;
        this.readOnly = false;
        this.drag = null;
        this.space = false;
        this.clipboard = null;
        this.abort = new AbortController();
        this.index = new RBush({ getEnvelope: p => p });
        const signal = this.abort.signal, e = renderer.overlay;
        e.addEventListener('pointerdown', x => this.handlePointer(() => this.pointerDown(x)), { signal });
        e.addEventListener('pointermove', x => this.handlePointer(() => this.pointerMove(x)), { signal });
        e.addEventListener('pointerup', x => this.handlePointer(() => this.pointerUp(x)), { signal });
        e.addEventListener('pointercancel', x => {if(x.pointerId===this.pointerId)this.cancel();}, { signal });
        e.addEventListener('dblclick', x => this.doubleClick(x), { signal });
        e.addEventListener('contextmenu', x => x.preventDefault(), { signal });
        e.addEventListener('wheel', x => { x.preventDefault(); if (x.ctrlKey || x.metaKey || !x.shiftKey) {
            renderer.camera.zoomAt(Math.exp(-Math.max(-200, Math.min(200, x.deltaY)) * .003), this.local(x));
        }
        else {
            renderer.camera.x -= x.deltaX || x.deltaY;
            renderer.camera.y -= x.deltaX ? x.deltaY : 0;
        } renderer.invalidate(); renderer.changed.emit(renderer.camera); }, { passive: false, signal });
        e.addEventListener('keydown', x => { if (x.code === 'Space' && !x.repeat) {
            this.space = true;
            e.style.cursor = 'grab';
            x.preventDefault();
        } if (x.code === 'Escape') {
            this.cancel();
            this.penId = null;
        } }, { signal });
        window.addEventListener('keyup', x => { if (x.code === 'Space') {
            this.space = false;
            this.cursor();
        } }, { signal });
        window.addEventListener('blur', () => { this.space = false; this.cancel(); }, { signal });
        this.off = doc.changed.subscribe(() => { if (!doc.glyph(this.glyphId))
            this.glyphId = doc.data.glyphs[0]?.id; if (!doc.data.masters.some(m => m.id === this.masterId))
            this.masterId = doc.data.masters[0].id; this.refresh(); });
        this.refresh();
    }
    handlePointer(action) {try {action();} catch(error) {this.cancel();this.status.emit(error.message);this.changed.emit({kind:'error',error});}}
    setToolOptions(options) {this.toolOptions=validateToolOptions(options);this.changed.emit({kind:'options'});}
    get glyph() { return this.doc.glyph(this.glyphId); }
    get layer() { return this.doc.layer(this.glyphId, this.masterId); }
    get canEdit() { return !!this.layer && !this.layer.locked && !this.readOnly; }
    local(e) { const r = this.renderer.overlay.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    snapPoint(p, e = {}) { if (!this.snap || e.altKey)
        return p; const step = Math.max(.001, this.gridStep); let x = Math.round(p.x / step) * step, y = Math.round(p.y / step) * step; const tolerance = 4 / this.renderer.camera.scale; for (const value of [0, this.doc.info.ascender, this.doc.info.descender, this.doc.info.xHeight, this.doc.info.capHeight])
        if (Math.abs(y - value) < tolerance)
            y = value; return { x, y }; }
    setGlyph(id, { fit = false } = {}) { if (!this.doc.glyph(id))
        throw new Error('Unknown glyph'); this.cancel(); this.penId = null; this.glyphId = this.doc.glyph(id).id; this.selection.clear(); this.refresh(); if (fit)
        this.renderer.fit(); this.selectionChanged.emit(this.selection); }
    setMaster(id) { if (!this.doc.data.masters.some(m => m.id === id))
        throw new Error('Unknown master'); this.cancel(); this.penId = null; this.masterId = id; this.selection.clear(); this.refresh(); this.selectionChanged.emit(this.selection); }
    setTool(id) { if (!tools.some(t => t.id === id))
        throw new Error('Unknown tool'); this.cancel(); this.tool = id; this.penId = null; this.cursor(); this.changed.emit({ kind: 'tool', tool: id }); }
    cursor() { this.renderer.overlay.style.cursor = this.space || this.tool === 'pan' ? 'grab' : !['select','eraser'].includes(this.tool) ? 'crosshair' : 'default'; }
    refresh() {
        const l = this.layer;
        if (!l)
            return;
        const ids = new Set(l.contours.flatMap(c => c.nodes.map(n => n.id)));
        for (const id of this.selection)
            if (!ids.has(id))
                this.selection.delete(id);
        this.renderer.selection = this.selection;
        const colorLayers = (this.glyph.colorLayers || []).map(layer => ({contours:this.doc.resolve(layer.glyphId,this.masterId),color:layer.paletteIndex===65535?null:this.doc.data.palettes[0][layer.paletteIndex]}));
        this.renderer.setScene({ colorLayers, contours: this.doc.resolve(this.glyphId, this.masterId), editable: l.contours, advanceWidth: l.advanceWidth, metrics: this.doc.info, anchors: l.anchors, guides: l.guides });
        this.reindex();
        this.changed.emit({ kind: 'geometry', glyphId: this.glyphId, masterId: this.masterId });
    }
    reindex() { this.index.Clear(); const all = []; for (const c of this.layer?.contours || [])
        for (const n of c.nodes)
            for (const kind of ['node', 'in', 'out']) {
                const p = kind === 'node' ? n : n[kind];
                if (p)
                    all.push({ minX: p.x, minY: p.y, maxX: p.x, maxY: p.y, nodeId: n.id, contourId: c.id, kind });
            } this.index.BulkLoad(all); }
    hit(p, radius = 7) { const tol = radius / this.renderer.camera.scale; return [...this.index.Search({ minX: p.x - tol, minY: p.y - tol, maxX: p.x + tol, maxY: p.y + tol })].map(x => ({ ...x, distance: Math.hypot(p.x - x.minX, p.y - x.minY) })).filter(x => x.distance <= tol).sort((a, b) => a.distance - b.distance || Number(a.kind === 'node') - Number(b.kind === 'node'))[0]; }
    nearest(p) { let best = null; for (const c of this.layer.contours) {
        const q = nearestOnContour(c, p);
        if (!best || q.distance < best.distance)
            best = { ...q, contour: c };
    } return best; }
    findNode(id) { for (const c of this.layer.contours) {
        const index = c.nodes.findIndex(n => n.id === id);
        if (index >= 0)
            return { contour: c, node: c.nodes[index], index };
    } return null; }
    select(ids, { add = false } = {}) { if (!add)
        this.selection.clear(); for (const id of ids)
        this.selection.add(id); this.renderer.invalidate(); this.selectionChanged.emit(this.selection); }
    selectAll() { this.select(this.layer.contours.flatMap(c => c.nodes.map(n => n.id))); }
    clearSelection() { this.select([]); }
    transaction(label, fn) { if (!this.canEdit)
        throw new Error('This layer is read-only; select an unlocked source master to edit.'); const value = this.history.execute(label, fn, this.glyphId); this.refresh(); return value; }
    pointerDown(e) {
        if (this.pointerId != null) return;
        if (e.button !== 0 && e.button !== 1)
            return;
        const screen = this.local(e), raw = this.renderer.camera.world(screen), p = this.snapPoint(raw, e), el = this.renderer.overlay;
        el.focus({ preventScroll: true });
        el.setPointerCapture(e.pointerId);
        this.pointerId=e.pointerId;
        e.preventDefault();
        if (e.button === 1 || this.space || this.tool === 'pan') {
            this.drag = { kind: 'pan', screen, camera: { ...this.renderer.camera } };
            el.style.cursor = 'grabbing';
            return;
        }
        if (this.tool === 'measure') {
            this.renderer.measure = { a: p, b: p };
            this.drag = { kind: 'measure' };
            this.renderer.invalidate();
            return;
        }
        if (beginInteraction(this,e,screen,raw,p)) return;
        if (!this.canEdit) {
            this.status.emit('Select a source master and unlock its layer to edit.');
            return;
        }
        if (['rectangle', 'ellipse'].includes(this.tool)) {
            this.history.begin(`Draw ${this.tool}`, this.glyphId);
            const c = contour([]);
            this.layer.contours.push(c);
            this.drag = { kind: 'shape', start: p, id: c.id, tool: this.tool };
            return;
        }
        if (this.tool === 'insert') {
            const near = this.nearest(raw);
            if (near && near.distance < 12 / this.renderer.camera.scale && near.t > 1e-4 && near.t < .9999)
                this.transaction('Insert node', () => { const n = splitSegment(near.contour, near.index, near.t); this.select([n.id]); });
            return;
        }
        if (this.tool === 'pen') {
            let c = this.layer.contours.find(c => c.id === this.penId);
            if (c && c.nodes.length > 2 && distance(c.nodes[0], raw) < 8 / this.renderer.camera.scale) {
                this.transaction('Close contour', () => c.closed = true);
                this.penId = null;
                return;
            }
            this.history.begin('Draw curve node', this.glyphId);
            if (!c) {
                c = contour([], false);
                this.layer.contours.push(c);
                this.penId = c.id;
            }
            const n = node(p.x, p.y);
            c.nodes.push(n);
            this.select([n.id]);
            this.drag = { kind: 'pen', nodeId: n.id, start: p };
            this.refresh();
            return;
        }
        const hit = this.hit(raw);
        if (this.tool === 'eraser') {
            if (hit) {
                this.select([hit.nodeId]);
                this.deleteSelection();
            }
            return;
        }
        if (hit) {
            if (e.shiftKey && this.selection.has(hit.nodeId)) {
                this.selection.delete(hit.nodeId);
                this.select([], { add: true });
                return;
            }
            if (!this.selection.has(hit.nodeId))
                this.select([hit.nodeId], { add: e.shiftKey });
            this.history.begin(hit.kind === 'node' ? 'Move nodes' : 'Move Bézier handle', this.glyphId);
            this.drag = { kind: hit.kind === 'node' ? 'move' : 'handle', hit, start: raw, original: structuredClone(this.layer.contours) };
        }
        else {
            if (!e.shiftKey)
                this.clearSelection();
            this.drag = { kind: 'marquee', screen, original: new Set(this.selection), add: e.shiftKey };
            this.renderer.marquee = { a: screen, b: screen };
        }
    }
    pointerMove(e) {
        if(this.pointerId != null && this.pointerId!==e.pointerId)return;
        const screen = this.local(e), raw = this.renderer.camera.world(screen), p = this.snapPoint(raw, e);
        this.status.emit({ x: raw.x, y: raw.y });
        if (!this.drag)
            return;
        const d = this.drag;
        if (moveInteraction(this,e,screen,raw,p)) return;
        if (d.kind === 'pan') {
            this.renderer.camera.x = d.camera.x + screen.x - d.screen.x;
            this.renderer.camera.y = d.camera.y + screen.y - d.screen.y;
            this.renderer.invalidate();
            this.renderer.changed.emit(this.renderer.camera);
            return;
        }
        if (d.kind === 'measure') {
            this.renderer.measure.b = p;
            this.renderer.invalidate();
            return;
        }
        if (d.kind === 'marquee') {
            this.renderer.marquee.b = screen;
            const a = this.renderer.camera.world(d.screen);
            this.selection = new Set(d.original);
            for (const hit of this.index.Search({ minX: Math.min(a.x, raw.x), minY: Math.min(a.y, raw.y), maxX: Math.max(a.x, raw.x), maxY: Math.max(a.y, raw.y) }))
                if (hit.kind === 'node')
                    this.selection.add(hit.nodeId);
            this.renderer.selection = this.selection;
            this.renderer.invalidate();
            this.selectionChanged.emit(this.selection);
            return;
        }
        if (d.kind === 'shape') {
            let w = p.x - d.start.x, h = p.y - d.start.y;
            if (e.shiftKey) {
                const m = Math.max(Math.abs(w), Math.abs(h));
                w = Math.sign(w || 1) * m;
                h = Math.sign(h || 1) * m;
            }
            const generated = d.tool === 'rectangle' ? rectangle(Math.min(d.start.x, d.start.x + w), Math.min(d.start.y, d.start.y + h), Math.abs(w), Math.abs(h)) : ellipse(d.start.x + w / 2, d.start.y + h / 2, Math.abs(w / 2), Math.abs(h / 2));
            const c = this.layer.contours.find(c => c.id === d.id);
            c.nodes = generated.nodes;
            this.selection = new Set(c.nodes.map(n => n.id));
            this.refresh();
            return;
        }
        if (d.kind === 'pen') {
            const n = this.findNode(d.nodeId)?.node;
            if (n && distance(p, n) > 2 / this.renderer.camera.scale) {
                n.out = p;
                n.in = { x: 2 * n.x - p.x, y: 2 * n.y - p.y };
                n.smooth = true;
            }
            this.refresh();
            return;
        }
        this.layer.contours = structuredClone(d.original);
        if (d.kind === 'move') {
            let dx = raw.x - d.start.x, dy = raw.y - d.start.y;
            if (e.shiftKey) {
                if (Math.abs(dx) > Math.abs(dy))
                    dy = 0;
                else
                    dx = 0;
            }
            if (this.snap && !e.altKey) {
                dx = Math.round(dx / this.gridStep) * this.gridStep;
                dy = Math.round(dy / this.gridStep) * this.gridStep;
            }
            transformContours(this.layer.contours, [1, 0, 0, 1, dx, dy], this.selection);
        }
        else {
            const n = this.findNode(d.hit.nodeId)?.node;
            if (n) {
                let q = p;
                if (e.shiftKey) {
                    const a = Math.round(Math.atan2(p.y - n.y, p.x - n.x) / (Math.PI / 4)) * Math.PI / 4, len = distance(n, p);
                    q = { x: n.x + Math.cos(a) * len, y: n.y + Math.sin(a) * len };
                }
                if (e.altKey)
                    n.smooth = false;
                moveHandle(n, d.hit.kind, q);
            }
        }
        this.refresh();
    }
    releasePointer() {const el=this.renderer.overlay,id=this.pointerId;this.pointerId=null;if(id!=null&&el.hasPointerCapture(id))el.releasePointerCapture(id);}
    pointerUp(e) {
        if(this.pointerId!==e.pointerId)return;
        if(!this.drag){this.releasePointer();return;}
        endInteraction(this,e);const d=this.drag;this.drag=null;this.renderer.marquee=null;
        if(this.history.active){if(d.kind==='shape'&&!this.layer.contours.find(c=>c.id===d.id)?.nodes.length)this.history.cancel();else this.history.commit();}
        this.cursor();this.refresh();this.selectionChanged.emit(this.selection);this.releasePointer();
    }
    cancel() {if(this.history.active)this.history.cancel();this.drag=null;this.renderer.toolPreview=null;this.renderer.marquee=null;this.releasePointer();this.cursor();this.refresh();}
    doubleClick(e) { if (this.tool !== 'select' || !this.canEdit)
        return; const p = this.renderer.camera.world(this.local(e)), hit = this.hit(p); if (hit) {
        const c = this.findNode(hit.nodeId).contour;
        this.select(c.nodes.map(n => n.id), { add: e.shiftKey });
    }
    else {
        const near = this.nearest(p);
        if (near && near.distance < 9 / this.renderer.camera.scale && near.t > .001 && near.t < .999)
            this.transaction('Insert curve point', () => this.select([splitSegment(near.contour, near.index, near.t).id]));
        else
            for (const c of [...this.layer.contours].reverse())
                if (containsPoint(c, p)) {
                    this.select(c.nodes.map(n => n.id), { add: e.shiftKey });
                    break;
                }
    } }
    nudge(dx, dy) { if (!this.selection.size)
        return; this.transaction('Nudge nodes', () => transformContours(this.layer.contours, [1, 0, 0, 1, dx, dy], this.selection)); }
    deleteSelection() { if (!this.selection.size)
        return; this.transaction('Delete nodes', () => { for (const c of this.layer.contours)
        c.nodes = c.nodes.filter(n => !this.selection.has(n.id)); this.layer.contours = this.layer.contours.filter(c => c.nodes.length > 0); this.selection.clear(); }); this.selectionChanged.emit(this.selection); }
    nodeStyle(smooth) { this.transaction(smooth ? 'Make smooth' : 'Make corner', () => { for (const c of this.layer.contours)
        for (let i = 0; i < c.nodes.length; i++)
            if (this.selection.has(c.nodes[i].id)) {
                if (smooth)
                    smoothNode(c, i);
                else
                    c.nodes[i].smooth = false;
            } }); }
    selectedContours() { return this.selection.size ? this.layer.contours.filter(c => c.nodes.some(n => this.selection.has(n.id))) : this.layer.contours; }
    outlineOperation(op) { this.transaction(op, () => { const cs = this.selectedContours(); if (op === 'Reverse contours')
        cs.forEach(reverseContour);
    else if (op === 'Add extrema')
        cs.forEach(addExtrema);
    else if (op === 'Correct winding')
        correctWinding(cs);
    else if (op === 'Round coordinates')
        transformContours(cs, [1, 0, 0, 1, 0, 0]).forEach(c => c.nodes.forEach(n => { for (const p of [n, n.in, n.out])
            if (p) {
                p.x = Math.round(p.x);
                p.y = Math.round(p.y);
            } }));
    else if (op === 'Close contours')
        cs.forEach(c => c.closed = true); }); }
    transform(matrix, label = 'Transform outlines') { this.transaction(label, () => transformContours(this.layer.contours, matrix, this.selection.size ? this.selection : null)); }
    align(axis) { if (this.selection.size < 2)
        return; this.transaction(`Align ${axis}`, () => { const ns = this.layer.contours.flatMap(c => c.nodes).filter(n => this.selection.has(n.id)), v = ns.reduce((s, n) => s + n[axis], 0) / ns.length; for (const n of ns) {
        const d = v - n[axis];
        n[axis] = v;
        if (n.in)
            n.in[axis] += d;
        if (n.out)
            n.out[axis] += d;
    } }); }
    boolean(operation) { if (!this.renderer.S)
        throw new Error('Native Skia is required for Boolean geometry'); this.transaction(operation === 'Simplify' ? 'Remove overlaps' : operation, () => { const selected = this.selectedContours(), set = new Set(selected.map(c => c.id)), result = booleanContours(this.renderer.S, selected, operation); this.layer.contours = [...this.layer.contours.filter(c => !set.has(c.id)), ...result]; this.selection.clear(); }); }
    expandStroke(width) { if (!Number.isFinite(width) || width <= 0 || width > 10000)
        throw new RangeError('Stroke width must be 0–10000 font units'); this.transaction('Expand stroke', () => { if (!this.renderer.S)
        throw new Error('Native Skia required'); this.layer.contours = strokeContours(this.renderer.S, this.layer.contours, width); this.selection.clear(); }); }
    copy() { const cs = this.selectedContours(); this.clipboard = structuredClone(cs); return { format: 'counterform-outlines', version: 1, contours: structuredClone(cs) }; }
    cut() { this.copy(); const ids = new Set(this.selectedContours().map(c => c.id)); this.transaction('Cut contours', () => { this.layer.contours = this.layer.contours.filter(c => !ids.has(c.id)); this.selection.clear(); }); }
    paste(data = null) { const cs = data?.format === 'counterform-outlines' ? data.contours : this.clipboard; if (!Array.isArray(cs) || !cs.length)
        return; this.transaction('Paste contours', () => { const next = structuredClone(cs); for (const c of next) {
        c.id = uid('c');
        for (const n of c.nodes)
            n.id = uid();
    } this.layer.contours.push(...next); this.select(next.flatMap(c => c.nodes.map(n => n.id))); }); }
    invertSelection() {this.select(this.layer.contours.flatMap(c=>c.nodes).filter(n=>!this.selection.has(n.id)).map(n=>n.id));}
    distribute(axis) {this.transaction('Distribute nodes',()=>distributeNodes(this.layer.contours,this.selection,axis));}
    setStart() {const id=[...this.selection][0],hit=id&&this.findNode(id);if(!hit||!hit.contour.closed)throw new Error('Select one point on a closed contour');this.transaction('Set start point',()=>{const ns=hit.contour.nodes;hit.contour.nodes=[...ns.slice(hit.index),...ns.slice(0,hit.index)];});}
    openContours() {this.transaction('Open contours',()=>{const ids=new Set(this.selectedContours().filter(c=>c.closed).map(c=>c.id));this.layer.contours=this.layer.contours.map(c=>ids.has(c.id)?openContourAt(c,Math.max(0,c.nodes.findIndex(n=>this.selection.has(n.id)))):c);});}
    joinSelected() {const hits=[...this.selection].map(id=>this.findNode(id)).filter(Boolean);if(hits.length!==2)throw new Error('Select exactly two open-contour endpoints');const [a,b]=hits;
        this.transaction('Join contours',()=>{if(a.contour===b.contour){if(a.contour.closed||![a.index,b.index].includes(0)||![a.index,b.index].includes(a.contour.nodes.length-1))throw new Error('Choose the first and last open endpoints');a.contour.closed=true;}
        else {const joined=joinContours(a.contour,a.index,b.contour,b.index);this.layer.contours=this.layer.contours.filter(c=>c!==a.contour&&c!==b.contour);this.layer.contours.push(joined);this.selection.clear();}});}
    convertEdges(curve) {this.transaction(curve?'Convert segments to cubic':'Convert segments to lines',()=>{this.layer.contours=this.layer.contours.map(c=>convertSegments(c,curve,this.selection));});}
    cleanContours() {this.transaction('Remove duplicate line nodes',()=>{for(const c of this.selectedContours()){for(let i=c.nodes.length-1;i>0;i--){const a=c.nodes[i-1],b=c.nodes[i];if(!a.out&&!b.in&&distance(a,b)<1e-8){a.out=b.out;c.nodes.splice(i,1);}}}this.layer.contours=this.layer.contours.filter(c=>c.nodes.length>0);});}
    dispose() { this.cancel(); this.off(); this.abort.abort(); this.changed.clear(); this.selectionChanged.clear(); this.status.clear(); this.index.Clear(); }
}

