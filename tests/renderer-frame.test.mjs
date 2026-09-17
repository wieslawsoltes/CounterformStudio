import test from 'node:test';
import assert from 'node:assert/strict';
import { GlyphRenderer, Camera } from '@wieslawsoltes/counterform-renderer';
import { Signal } from '@wieslawsoltes/counterform-model';

// Exercise notification ordering without DOM/native allocations. Real font
// rendering is independently qualified by the source/distribution browser suites.
function harness() {
    const operations = [], frames = [], errors = [];
    let resolve, reject;
    const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
    const renderer = Object.assign(Object.create(GlyphRenderer.prototype), {
        S: {
            SKColors: { Transparent: 0 },
            SKColor: { Parse: value => value },
            SKPaintStyle: { Fill: 'Fill', Stroke: 'Stroke' },
            SKPaint: class { Dispose() { operations.push('dispose'); } }
        },
        native: {
            dataset: {}, Statistics: { Backend: 'webgl' },
            InvalidateSurface() { operations.push('invalidate'); return pending; }
        },
        host: { clientWidth: 100 }, camera: new Camera(),
        scene: { ghost: [], contours: [], editable: [] }, paths: [{}, {}, {}],
        showFill: true, preview: false, dark: false, dimFill: true,
        disposed: false, drawCount: 0, backend: 'initializing',
        frame: new Signal(), error: new Signal(),
        pathCache() { operations.push('paths'); },
        drawBackground() { operations.push('background'); },
        drawOverlay() { operations.push('overlay'); },
        drawFallback() { operations.push('fallback'); }
    });
    const canvas = {
        Clear() { operations.push('clear'); }, Save() { operations.push('save'); },
        Restore() { operations.push('restore'); }, Scale() {}, Translate() {},
        DrawPath() { operations.push('path'); }
    };
    renderer.frame.subscribe(event => { operations.push('frame'); frames.push(event); });
    renderer.error.subscribe(error => errors.push(error));
    const paint = surface => renderer.paintNative({ Canvas: canvas, Info: { Width: 200 }, Surface: surface });
    return { renderer, operations, frames, errors, canvas, paint, resolve, reject, pending };
}

test('native invalidation is not a completed frame; successful paint reports the actual backend after cleanup', async () => {
    const h = harness();
    let status = 'initializing';
    h.renderer.frame.subscribe(() => { status = h.renderer.backend; });
    h.renderer.draw();
    h.renderer.draw();
    assert.equal(h.renderer.drawCount, 0);
    assert.equal(h.frames.length, 0);
    h.paint({ Backend: 'webgpu' });
    assert.equal(status, 'webgpu');
    assert.deepEqual(h.operations.slice(-3), ['dispose', 'restore', 'frame']);
    assert.equal(h.renderer.drawCount, 1);
    assert.equal(h.frames[0].frames, 1);
    assert.equal(h.frames[0].backend, 'webgpu');
    assert(Number.isFinite(h.frames[0].ms) && h.frames[0].ms >= 0);
    h.resolve();
    await h.pending;
    assert.equal(h.frames.length, 1, 'resolving coalesced invalidations must not publish duplicate frames');
});

test('native resize paints notify even without an application invalidation and update backend changes', () => {
    const h = harness();
    h.paint();
    h.paint({ BackendName: 'canvas' });
    assert.deepEqual(h.frames.map(frame => [frame.frames, frame.backend]), [[1, 'webgl'], [2, 'canvas']]);
    assert.equal(h.operations.includes('invalidate'), false);
});

test('failed native paint cleans up without advancing completed-frame telemetry', () => {
    const h = harness();
    h.canvas.DrawPath = () => { throw new Error('draw failed'); };
    assert.throws(() => h.paint({ Backend: 'webgl' }), /draw failed/);
    assert.deepEqual(h.operations.slice(-2), ['dispose', 'restore']);
    assert.equal(h.frames.length, 0);
    assert.equal(h.renderer.drawCount, 0);
});

test('fallback frame is emitted synchronously after drawing; disposed rendering remains silent', () => {
    const h = harness();
    h.renderer.S = null;
    h.renderer.backend = 'Canvas 2D fallback';
    h.renderer.draw();
    assert.deepEqual(h.operations, ['background', 'overlay', 'fallback', 'frame']);
    assert.equal(h.frames[0].backend, 'Canvas 2D fallback');
    h.renderer.disposed = true;
    h.renderer.draw();
    h.paint();
    assert.equal(h.frames.length, 1);
    assert.equal(h.renderer.drawCount, 1);
});

test('native scheduling failures report once while alive and remain silent after disposal', async () => {
    const live = harness();
    live.renderer.draw();
    live.reject(new Error('surface unavailable'));
    await live.pending.catch(() => {});
    assert.equal(live.errors.length, 1);
    assert.equal(live.frames.length, 0);
    const disposed = harness();
    disposed.renderer.draw();
    disposed.renderer.disposed = true;
    disposed.reject(new Error('surface disposed'));
    await disposed.pending.catch(() => {});
    assert.equal(disposed.errors.length, 0);
    assert.equal(disposed.frames.length, 0);
});
