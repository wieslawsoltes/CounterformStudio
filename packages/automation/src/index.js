import { transformContours, addExtrema, correctWinding, reverseContour, bounds } from '@wieslawsoltes/counterform-geometry';
/** Declarative, deterministic batch operations. No eval, arbitrary file I/O, or executable project payloads. */
export function applyRecipe(doc, recipe, { glyphIds, masterIds } = {}) {
    if (!Array.isArray(recipe) || recipe.length > 256)
        throw new Error('Recipe must contain at most 256 operations');
    const gs = new Set(glyphIds || doc.data.glyphs.map(g => g.id)), ms = new Set(masterIds || doc.data.masters.map(m => m.id));
    let count = 0;
    for (const g of doc.data.glyphs) {
        if (!gs.has(g.id))
            continue;
        for (const l of g.layers) {
            if (!ms.has(l.masterId) || l.locked)
                continue;
            for (const action of recipe) {
                const n = action.value;
                if (action.type === 'transform') {
                    if (!Array.isArray(action.matrix) || action.matrix.length !== 6 || action.matrix.some(n => !Number.isFinite(n)))
                        throw new Error('Transform requires six finite coefficients');
                    transformContours(l.contours, action.matrix);
                }
                else if (action.type === 'round') {
                    const step = n ?? 1;
                    if (!Number.isFinite(step) || step <= 0)
                        throw new Error('Rounding step must be positive');
                    for (const c of l.contours)
                        for (const p of c.nodes)
                            for (const q of [p, p.in, p.out])
                                if (q) {
                                    q.x = Math.round(q.x / step) * step;
                                    q.y = Math.round(q.y / step) * step;
                                }
                }
                else if (action.type === 'extrema')
                    l.contours.forEach(c => addExtrema(c));
                else if (action.type === 'winding')
                    correctWinding(l.contours);
                else if (action.type === 'reverse')
                    l.contours.forEach(reverseContour);
                else if (action.type === 'advance') {
                    if (!Number.isFinite(n) || n < 0 || n > 65535)
                        throw new Error('Invalid advance width');
                    l.advanceWidth = n;
                }
                else if (action.type === 'center') {
                    const b = bounds(l.contours);
                    transformContours(l.contours, [1, 0, 0, 1, (l.advanceWidth - b.width) / 2 - b.minX, 0]);
                }
                else
                    throw new Error(`Unknown recipe operation ${action.type}`);
            }
            count++;
        }
    }
    doc.touch('structure');
    return count;
}
export const recipes = Object.freeze({ clean: [{ type: 'round', value: 1 }, { type: 'extrema' }, { type: 'winding' }], italic: [{ type: 'transform', matrix: [1, 0, .21255656, 1, 0, 0] }], reverse: [{ type: 'reverse' }], center: [{ type: 'center' }] });

