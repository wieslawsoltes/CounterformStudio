import { CompilerClient } from '@wieslawsoltes/counterform-compiler';
import { Signal } from '@wieslawsoltes/counterform-model';
let instance = 0;
/** The proof is shaped from freshly compiled font bytes, not a substitute system font. */
export class FontProof {
    changed = new Signal();
    errors = new Signal();
    constructor(host, doc, { masterId = doc.data.masters[0].id, delay = 350, compiler = null } = {}) { this.host = host; this.doc = doc; this.ownsCompiler = !compiler; this.compiler = compiler || new CompilerClient(); this.masterId = masterId; this.delay = delay; this.family = `CounterformProof${++instance}`; this.generation = 0; this.text = 'Hamburgefontsiv AVATAR'; this.size = 66; this.features = '"kern" 1, "liga" 1'; this.variable = false; this.location = {}; this.tracking = 0; this.waterfall = false; this.disposed = false; host.classList.add('cf-proof'); this.content = document.createElement('div'); this.content.className = 'cf-proof-content'; this.content.setAttribute('aria-label', 'Compiled font proof'); host.append(this.content); this.off = doc.changed.subscribe(e => { if (e.kind !== 'saved')
        this.schedule(); }); this.schedule(0); }
    schedule(delay = this.delay) { if (this.disposed) return; this.generation++; this.compiler.cancelKey(this.family); clearTimeout(this.timer); this.timer = setTimeout(() => this.compile(), delay); }
    async compile() { if (this.disposed) return; const generation = ++this.generation, variable = this.variable; try {
        const {bytes} = await this.compiler.compile(this.doc, {format: variable ? 'variable' : 'ttf', masterId:this.masterId}, {key:this.family,priority:10});
        if (this.disposed || generation !== this.generation) return;
        const axis = this.doc.data.axes.find(a => a.tag === 'wght');
        const face = await new FontFace(this.family, bytes, { weight: variable && axis ? `${Math.max(1,axis.min)} ${Math.min(1000,axis.max)}` : '400' }).load();
        if (this.disposed || generation !== this.generation)
            return;
        if (this.face)
            document.fonts.delete(this.face);
        this.face = face;
        document.fonts.add(face);
        this.render();
        this.changed.emit({ bytes: bytes.byteLength, family: this.family });
    }
    catch (error) {
        if (!this.disposed && generation === this.generation && error.name !== 'AbortError') this.errors.emit(error);
    } }
    update(options = {}) { const recompile = options.masterId && options.masterId !== this.masterId || options.variable !== undefined && options.variable !== this.variable; Object.assign(this, options); this.render(); if (recompile)
        this.schedule(0); }
    render() { this.content.replaceChildren(); const sizes = this.waterfall ? [16, 24, 36, 48, 72, 100] : [this.size]; for (const size of sizes) {
        const row = document.createElement('div');
        row.className = 'cf-proof-line';
        const label = document.createElement('span');
        label.className = 'cf-proof-size';
        label.textContent = `${size}`;
        const text = document.createElement('span');
        text.className = 'cf-proof-text';
        text.textContent = this.text || ' ';
        text.style.cssText = `font-family:"${this.family}",sans-serif;font-size:${size}px;letter-spacing:${this.tracking}px;font-feature-settings:${this.features};font-variation-settings:${Object.entries(this.location).map(([k, v]) => `"${k.replaceAll('"', '')}" ${Number(v)}`).join(',') || 'normal'};`;
        row.append(label, text);
        this.content.append(row);
    } }
    dispose() { this.disposed = true; this.generation++; clearTimeout(this.timer); this.off(); this.compiler.cancelKey(this.family); if (this.ownsCompiler) this.compiler.dispose(); if (this.face)
        document.fonts.delete(this.face); this.host.replaceChildren(); this.changed.clear(); this.errors.clear(); }
}

