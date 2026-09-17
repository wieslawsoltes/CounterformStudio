import { RegisterWebComponent } from '@wieslawsoltes/skiasharpweb/browser';
import { bounds, clamp, segments, fromSVG, toSVG } from '@wieslawsoltes/counterform-geometry';
import { Signal } from '@wieslawsoltes/counterform-model';
let initialization;
export function initializeSkia(options = {}) { return initialization ??= RegisterWebComponent(options).catch(e => { initialization = null; throw e; }); }
/** Font-space camera. Position is in CSS pixels; outlines always remain double precision. */
export class Camera {
    constructor() { this.x = 120; this.y = 620; this.scale = .7; }
    world(p) { return { x: (p.x - this.x) / this.scale, y: (this.y - p.y) / this.scale }; }
    screen(p) { return { x: this.x + p.x * this.scale, y: this.y - p.y * this.scale }; }
    zoomAt(factor, p) { const w = this.world(p); this.scale = clamp(this.scale * factor, .025, 64); this.x = p.x - w.x * this.scale; this.y = p.y + w.y * this.scale; }
    fit(cs, width, height, advance = 640, upm = 1000) { const b = bounds(cs); const minX = Math.min(0, b.minX), maxX = Math.max(advance, b.maxX), minY = Math.min(-upm * .09, b.minY), maxY = Math.max(upm * .76, b.maxY); this.scale = Math.max(.025, Math.min((width - 150) / (maxX - minX || upm), (height - 100) / (maxY - minY || upm))); this.x = (width - (maxX - minX) * this.scale) / 2 - minX * this.scale; this.y = (height + (maxY + minY) * this.scale) / 2; }
}
export function makePath(S, contours) { const p = new S.SKPath(); try {
    for (const c of contours) {
        if (!c.nodes.length)
            continue;
        p.MoveTo(c.nodes[0].x, c.nodes[0].y);
        for (const s of segments(c))
            s.curve ? p.CubicTo(s.p1.x, s.p1.y, s.p2.x, s.p2.y, s.p3.x, s.p3.y) : p.LineTo(s.b.x, s.b.y);
        if (c.closed)
            p.Close();
    }
    return p;
}
catch (e) {
    p.Dispose();
    throw e;
} }
export function booleanContours(S, contours, operation = 'Union') {
    if (!contours.length)
        return [];
    let result = makePath(S, [contours[0]]);
    try {
        if (operation === 'Simplify') {
            const next = makePath(S, contours);
            result.Dispose();
            result = next.Simplify();
            next.Dispose();
        }
        else
            for (const c of contours.slice(1)) {
                const p = makePath(S, [c]);
                try {
                    const next = result.Op(p, operation);
                    if (!next)
                        throw new Error('Skia path operation failed');
                    result.Dispose();
                    result = next;
                }
                finally {
                    p.Dispose();
                }
            }
        if (!result)
            throw new Error('Skia could not produce a valid outline');
        return fromSVG(result.ToSvgPathData());
    }
    finally {
        result?.Dispose();
    }
}
export function strokeContours(S, contours, width, { join = 'Round', cap = 'Round' } = {}) { const path = makePath(S, contours); let result; try {
    result = path.Stroke({ Width: width, Join: join, Cap: cap });
    if (!result)
        throw new Error('Unable to expand stroke');
    return fromSVG(result.ToSvgPathData());
}
finally {
    result?.Dispose();
    path.Dispose();
} }
function trace(ctx, cs) { ctx.beginPath(); for (const c of cs) {
    if (!c.nodes.length)
        continue;
    ctx.moveTo(c.nodes[0].x, c.nodes[0].y);
    for (const s of segments(c))
        s.curve ? ctx.bezierCurveTo(s.p1.x, s.p1.y, s.p2.x, s.p2.y, s.p3.x, s.p3.y) : ctx.lineTo(s.b.x, s.b.y);
    if (c.closed)
        ctx.closePath();
} }
/** Layered native Skia outline surface with independent, accessible input and measurement overlays. */
export class GlyphRenderer {
    changed = new Signal();
    error = new Signal();
    frame = new Signal();
    constructor(host, { S = null, backend = 'auto' } = {}) {
        this.host = host;
        this.S = S;
        this.camera = new Camera();
        this.scene = { contours: [], editable: [], advanceWidth: 640, metrics: { unitsPerEm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 520 }, anchors: [], guides: [], ghost: [] };
        this.selection = new Set();
        this.showGrid = true;
        this.showNodes = true;
        this.showFill = true;
        this.showGuides = true;
        this.preview = false;
        this.dark = false;
        this.dimFill = false;
        this.backend = S ? 'initializing' : 'Canvas 2D fallback';
        this.drawCount = 0;
        this.pending = 0;
        this.paths = [];
        this.disposed = false;
        this.needsPaths = true;
        host.classList.add('cf-drawing-surface');
        host.style.cssText += ';position:relative;min-width:0;min-height:120px;overflow:hidden;';
        this.background = document.createElement('canvas');
        this.overlay = document.createElement('canvas');
        this.overlay.tabIndex = 0;
        this.overlay.setAttribute('role', 'application');
        this.overlay.setAttribute('aria-label', 'Glyph outline editor. Arrow keys move selected nodes. Press question mark for keyboard help.');
        this.overlay.style.touchAction = 'none';
        this.overlay.style.outline = 'none';
        this.native = S ? document.createElement('skia-canvas') : document.createElement('canvas');
        if (S)
            this.native.setAttribute('backend', backend);
        for (const e of [this.background, this.native, this.overlay]) {
            e.style.cssText += ';position:absolute;inset:0;width:100%;height:100%;min-height:0;display:block;';
            host.append(e);
        }
        this.native.style.pointerEvents = 'none';
        this.onPaint = e => this.paintNative(e.detail);
        this.onError = e => { this.backend = 'Skia error'; this.error.emit(e.detail); };
        this.onLoss = () => { this.backend = 'device lost — recovering'; this.native.RecreateSurface?.().catch(e => this.error.emit(e)); };
        if (S) {
            this.native.addEventListener('paintsurface', this.onPaint);
            this.native.addEventListener('surfaceerror', this.onError);
            this.native.addEventListener('devicelost', this.onLoss);
        }
        this.resizeObserver = new ResizeObserver(() => this.invalidate());
        this.resizeObserver.observe(host);
        this.invalidate();
    }
    setScene(scene) { this.scene = { ...this.scene, ...scene }; this.needsPaths = true; this.invalidate(); }
    /** Cache one actual compiled font. Revision/master guards prevent stale color artwork. */
    setCompiledColorFont(bytes, {documentId,revision,masterId,glyphOrder,unitsPerEm}) {
        if(this.disposed||!this.S)return;
        let face,font;
        try {
            if(bytes){face=this.S.SKTypeface.FromData(bytes);if(!face)throw new Error('Skia rejected compiled color font');font=new this.S.SKFont(face,unitsPerEm);font.Hinting=this.S.SKFontHinting.None;font.LinearMetrics=true;}
        } catch(error){font?.Dispose();face?.Dispose();throw error;}
        this.colorFont?.font?.Dispose();this.colorFont?.face?.Dispose();
        this.colorFont=font?{font,face,documentId,revision,masterId,ids:new Map(glyphOrder.map((id,i)=>[id,i]))}:null;
        this.invalidate();
    }
    currentColorFont() { const a=this.colorFont,b=this.scene;return b.hasColorPaint&&a&&a.documentId===b.documentId&&a.revision===b.revision&&a.masterId===b.masterId&&a.ids.has(b.colorGlyphId)?a:null; }
    fit() { const r = this.host.getBoundingClientRect(); if (r.width < 100 || r.height < 100)
        return; this.camera.fit(this.scene.contours, r.width, r.height, this.scene.advanceWidth, this.scene.metrics.unitsPerEm); this.invalidate(); this.changed.emit(this.camera); }
    invalidate() { if (this.disposed || this.pending)
        return; this.pending = requestAnimationFrame(() => { this.pending = 0; this.draw(); }); }
    size(canvas) { const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight), dpr = Math.min(devicePixelRatio || 1, 3); if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
    } const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); return { ctx, w, h, dpr }; }
    draw() { const start = performance.now(); this.drawBackground(); this.drawOverlay(); if (this.S)
        this.native.InvalidateSurface().catch(e => this.error.emit(e));
    else
        this.drawFallback(); this.drawCount++; this.frame.emit({ frames: this.drawCount, ms: performance.now() - start, backend: this.backend }); }
    pathCache() { if (!this.needsPaths)
        return; for (const p of this.paths)
        p.Dispose(); this.paths = [makePath(this.S, this.scene.contours), makePath(this.S, this.scene.editable), makePath(this.S, this.scene.ghost || []), ...(this.scene.colorLayers || []).map(layer => makePath(this.S,layer.contours))]; this.needsPaths = false; }
    paintNative({ Canvas, Info, Surface }) {
        if (this.disposed)
            return;
        const S = this.S, c = Canvas, dpr = Info.Width / Math.max(1, this.host.clientWidth);
        this.pathCache();
        c.Clear(S.SKColors.Transparent);
        c.Save();
        const paint = new S.SKPaint();
        paint.IsAntialias = true;
        try {
            c.Scale(dpr, dpr);
            c.Translate(this.camera.x, this.camera.y);
            c.Scale(this.camera.scale, -this.camera.scale);
            if (this.scene.ghost?.length && !this.preview) {
                paint.Color = S.SKColor.Parse('#92a5cc');
                paint.Style = S.SKPaintStyle.Stroke;
                paint.StrokeWidth = 1 / this.camera.scale;
                c.DrawPath(this.paths[2], paint);
            }
            if (this.showFill || this.preview) {
                paint.Color = S.SKColor.Parse(this.preview ? '#18222e' : this.dark ? '#b9c4d4' : '#293847');
                paint.Style = S.SKPaintStyle.Fill;
                const compiled=this.currentColorFont();
                this.native.dataset.colorPaint=compiled?'compiled':this.scene.hasColorPaint?'pending':'none';
                if(compiled){
                    // Native font glyphs are y-down; the editor camera is y-up.
                    c.Save();try {c.Scale(1,-1);c.DrawGlyphs(new Uint16Array([compiled.ids.get(this.scene.colorGlyphId)]),[0,0],new S.SKPoint(0,0),compiled.font,paint);}finally{c.Restore();}
                } else if (this.scene.colorLayers?.length) {
                    this.scene.colorLayers.forEach((layer,i) => {
                        // SKColor.Parse follows .NET/Skia ARGB; CSS/source colors are RGBA.
                        const rgba = layer.color;
                        const argb = rgba?.length === 9 ? '#' + rgba.slice(7) + rgba.slice(1,7) : rgba;
                        paint.Color = S.SKColor.Parse(argb || (this.dark ? '#b9c4d4' : '#293847'));
                        c.DrawPath(this.paths[3+i],paint);
                    });
                } else { if(this.dimFill&&!this.preview)paint.Color=S.SKColor.Parse(this.dark?'#4b4d50':'#e6e7e8');c.DrawPath(this.paths[0], paint); }
            }
            if (!this.preview) {
                paint.Color = S.SKColor.Parse('#357bf5');
                paint.Style = S.SKPaintStyle.Stroke;
                paint.StrokeWidth = 1.15 / this.camera.scale;
                c.DrawPath(this.paths[1], paint);
            }
            this.backend = Surface?.Backend || Surface?.BackendName || this.native.Statistics?.Backend || 'Skia';
        }
        finally {
            paint.Dispose();
            c.Restore();
        }
    }
    drawFallback() { const { ctx } = this.size(this.native); ctx.save(); ctx.translate(this.camera.x, this.camera.y); ctx.scale(this.camera.scale, -this.camera.scale); trace(ctx, this.scene.contours); ctx.fillStyle = '#293847'; if (this.showFill || this.preview)
        { if (this.scene.colorLayers?.length) { for (const layer of this.scene.colorLayers) {trace(ctx,layer.contours);ctx.fillStyle=layer.color || '#293847';ctx.fill();} trace(ctx,this.scene.editable); } else {if(this.dimFill&&!this.preview)ctx.fillStyle=this.dark?'#4b4d50':'#e6e7e8';ctx.fill();} } if (!this.preview) {
        ctx.strokeStyle = '#357bf5';
        ctx.lineWidth = 1.15 / this.camera.scale;
        ctx.stroke();
    } ctx.restore(); }
    drawBackground() {
        const { ctx, w, h } = this.size(this.background), cam = this.camera, metric = this.scene.metrics;
        ctx.fillStyle = this.dark ? '#262728' : '#fafafa';
        ctx.fillRect(0, 0, w, h);
        if (this.preview) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);
            return;
        }
        const origin = cam.screen({ x: 0, y: 0 }), advance = cam.screen({ x: this.scene.advanceWidth, y: 0 });
        ctx.fillStyle = this.dark ? '#28292b' : '#fff';
        ctx.fillRect(origin.x, 24, advance.x - origin.x, h - 24);
        if (this.showGrid) {
            const target = 42 / cam.scale, base = 10 ** Math.floor(Math.log10(target)), step = [1, 2, 5, 10].map(x => x * base).find(x => x >= target) || base * 10;
            const lo = cam.world({ x: 24, y: h }), hi = cam.world({ x: w, y: 24 });
            ctx.strokeStyle = this.dark ? '#363739' : '#ededed';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = Math.ceil(lo.x / step) * step; x < hi.x; x += step) {
                const px = cam.screen({ x, y: 0 }).x;
                ctx.moveTo(Math.round(px) + .5, 24);
                ctx.lineTo(Math.round(px) + .5, h);
            }
            for (let y = Math.ceil(lo.y / step) * step; y < hi.y; y += step) {
                const py = cam.screen({ x: 0, y }).y;
                ctx.moveTo(24, Math.round(py) + .5);
                ctx.lineTo(w, Math.round(py) + .5);
            }
            ctx.stroke();
        }
        if (this.showGuides) {
            ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
            for (const [value, label] of [[metric.ascender, 'Ascender'], [metric.capHeight, 'Cap height'], [metric.xHeight, 'x-height'], [0, 'Baseline'], [metric.descender, 'Descender']]) {
                const y = cam.screen({ x: 0, y: value }).y;
                ctx.strokeStyle = value === 0 ? '#909ca6' : '#c1c5cc';
                ctx.setLineDash(value === 0 ? [] : [4, 4]);
                ctx.beginPath();
                ctx.moveTo(24, y + .5);
                ctx.lineTo(w, y + .5);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = '#7b8fa8';
                ctx.fillText(`${label}  ${value}`, Math.max(36, advance.x + 18), y - 6);
            }
            ctx.strokeStyle = '#b4c4d8';
            ctx.setLineDash([3, 4]);
            for (const x of [0, this.scene.advanceWidth]) {
                const px = cam.screen({ x, y: 0 }).x;
                ctx.beginPath();
                ctx.moveTo(px, 24);
                ctx.lineTo(px, h);
                ctx.stroke();
            }
            for (const guide of this.scene.guides || []) {
                const p = cam.screen(guide), angle = -(guide.angle || 0) * Math.PI / 180;
                ctx.strokeStyle = '#d79053';
                ctx.beginPath();
                ctx.moveTo(p.x - Math.cos(angle) * w * 2, p.y - Math.sin(angle) * w * 2);
                ctx.lineTo(p.x + Math.cos(angle) * w * 2, p.y + Math.sin(angle) * w * 2);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }
        ctx.fillStyle = this.dark ? '#303133' : '#ededee';
        ctx.fillRect(0, 0, w, 24);
        ctx.fillRect(0, 0, 24, h);
        ctx.fillStyle = '#707477';
        ctx.font = '9px ui-monospace, SFMono-Regular, monospace';
        const step = cam.scale > 2 ? 10 : cam.scale > .45 ? 100 : 500, lo = cam.world({ x: 24, y: h }), hi = cam.world({ x: w, y: 24 });
        ctx.strokeStyle = '#b9bcbf';
        ctx.beginPath();
        for (let x = Math.ceil(lo.x / step) * step; x < hi.x; x += step) {
            const px = cam.screen({ x, y: 0 }).x;
            ctx.moveTo(px, 18);
            ctx.lineTo(px, 24);
            ctx.fillText(String(x), px + 3, 12);
        }
        for (let y = Math.ceil(lo.y / step) * step; y < hi.y; y += step) {
            const py = cam.screen({ x: 0, y }).y;
            ctx.moveTo(18, py);
            ctx.lineTo(24, py);
            ctx.save();
            ctx.translate(10, py - 3);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(String(y), 0, 0);
            ctx.restore();
        }
        ctx.stroke();
        ctx.fillStyle = '#dedfe0';
        ctx.fillRect(0, 0, 24, 24);
    }
    drawOverlay() {
        const { ctx } = this.size(this.overlay);
        if (this.preview)
            return;
        const cam = this.camera;
        if (this.showNodes)
            for (const c of this.scene.editable) {
                for (let i = 0; i < c.nodes.length; i++) {
                    const n = c.nodes[i], p = cam.screen(n), selected = this.selection.has(n.id);
                    ctx.strokeStyle = selected ? '#2674ff' : '#7699c7';
                    ctx.lineWidth = 1;
                    for (const side of ['in', 'out'])
                        if (n[side]) {
                            const h = cam.screen(n[side]);
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(h.x, h.y);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(h.x, h.y, 3, 0, 2 * Math.PI);
                            ctx.fillStyle = '#fff';
                            ctx.fill();
                            ctx.stroke();
                        }
                    ctx.fillStyle = selected ? '#2674ff' : '#fff';
                    ctx.strokeStyle = '#2674ff';
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    if (n.smooth)
                        ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
                    else
                        ctx.rect(p.x - 3.5, p.y - 3.5, 7, 7);
                    ctx.fill();
                    ctx.stroke();
                    if (i === 0) {
                        ctx.fillStyle = '#2674ff';
                        ctx.beginPath();
                        ctx.moveTo(p.x + 8, p.y - 3);
                        ctx.lineTo(p.x + 12, p.y);
                        ctx.lineTo(p.x + 8, p.y + 3);
                        ctx.fill();
                    }
                }
            }
        for (const a of this.scene.anchors || []) {
            const p = cam.screen(a);
            ctx.strokeStyle = '#da8b48';
            ctx.fillStyle = '#da8b48';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(p.x - 6, p.y);
            ctx.lineTo(p.x + 6, p.y);
            ctx.moveTo(p.x, p.y - 6);
            ctx.lineTo(p.x, p.y + 6);
            ctx.stroke();
            ctx.font = '11px system-ui';
            ctx.fillText(a.name, p.x + 9, p.y - 8);
        }
        if (this.marquee) {
            const { a, b } = this.marquee;
            ctx.fillStyle = '#367bf516';
            ctx.strokeStyle = '#367bf5';
            ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
            ctx.strokeRect(a.x + .5, a.y + .5, b.x - a.x, b.y - a.y);
        }
        if (this.toolPreview?.points.length) {
            const points=this.toolPreview.points.map(p=>cam.screen(p));ctx.strokeStyle='#5887df';ctx.lineWidth=1.5;ctx.setLineDash([5,3]);ctx.beginPath();
            points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));if(this.toolPreview.closed)ctx.closePath();ctx.stroke();ctx.setLineDash([]);
        }
        if (this.measure) {
            const a = cam.screen(this.measure.a), b = cam.screen(this.measure.b);
            ctx.strokeStyle = '#dd8245';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#b66329';
            ctx.font = '12px ui-monospace,monospace';
            ctx.fillText(`${Math.hypot(this.measure.b.x - this.measure.a.x, this.measure.b.y - this.measure.a.y).toFixed(1)} u`, (a.x + b.x) / 2 + 8, (a.y + b.y) / 2 - 8);
        }
    }
    toSVG() { const m = this.scene.metrics; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-m.ascender} ${this.scene.advanceWidth} ${m.ascender - m.descender}"><path transform="scale(1,-1)" d="${toSVG(this.scene.contours)}"/></svg>`; }
    dispose() { this.colorFont?.font?.Dispose();this.colorFont?.face?.Dispose();this.colorFont=null;this.disposed = true; cancelAnimationFrame(this.pending); this.resizeObserver.disconnect(); this.native.removeEventListener('paintsurface', this.onPaint); this.native.removeEventListener('surfaceerror', this.onError); this.native.removeEventListener('devicelost', this.onLoss); for (const p of this.paths)
        p.Dispose(); this.host.replaceChildren(); this.changed.clear(); this.error.clear(); this.frame.clear(); }
}

