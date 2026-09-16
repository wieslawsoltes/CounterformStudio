import { AdjacencyGraph, Edge, TopologicalSort } from '@wieslawsoltes/quikgraphweb';
import { bounds, segments, extrema, distance, signedArea } from '@wieslawsoltes/counterform-geometry';
import { compatibility } from '@wieslawsoltes/counterform-variations';
import { parseFeatures } from '@wieslawsoltes/counterform-opentype';
export function componentGraph(doc) { const graph = new AdjacencyGraph(); for (const g of doc.data.glyphs)
    graph.AddVertex(g.id); for (const g of doc.data.glyphs)
    for (const l of g.layers)
        for (const c of l.components) {
            const target = doc.glyph(c.glyphId || c.glyphName);
            if (target)
                graph.AddEdge(new Edge(g.id, target.id));
        } return graph; }
export function validateFont(doc, { geometry = true, masters = true, maxIssues = 3000 } = {}) {
    const issues = [], encoding = new Map(), names = new Map(), add = (severity, code, message, glyph = null, masterId = null, contourId = null, nodeId = null) => { if (issues.length < maxIssues)
        issues.push({ id: `${code}:${glyph?.id || ''}:${issues.length}`, severity, code, message, glyphId: glyph?.id || null, glyphName: glyph?.name || '', masterId, contourId, nodeId }); };
    if (!doc.data.glyphs.some(g => g.name === '.notdef'))
        add('warning', 'missing-notdef', 'Export will insert an empty .notdef glyph.');
    for (const g of doc.data.glyphs) {
        if (names.has(g.name))
            add('error', 'duplicate-name', `Glyph name '${g.name}' is not unique.`, g);
        names.set(g.name, g.id);
        for (const cp of g.unicodes) {
            if (encoding.has(cp))
                add('error', 'duplicate-unicode', `U+${cp.toString(16).toUpperCase()} is also mapped to ${encoding.get(cp)}.`, g);
            encoding.set(cp, g.name);
        }
        if (g.export === false)
            continue;
        for (const l of g.layers) {
            if (!Number.isFinite(l.advanceWidth) || l.advanceWidth < 0 || l.advanceWidth > 65535)
                add('error', 'advance-range', 'Advance width must fit uint16.', g, l.masterId);
            if (l.components.some(c => !doc.glyph(c.glyphId || c.glyphName)))
                add('error', 'missing-component', 'A component references a missing glyph.', g, l.masterId);
            if (geometry)
                for (const c of l.contours) {
                    if (!c.closed)
                        add('warning', 'open-contour', 'Open contours are excluded from font export.', g, l.masterId, c.id);
                    if (c.nodes.length < 2)
                        add('warning', 'single-point', 'Contour has fewer than two nodes.', g, l.masterId, c.id);
                    if (c.closed && c.nodes.length > 1 && Math.abs(signedArea(c)) < .01)
                        add('warning', 'zero-area', 'Contour encloses almost zero area.', g, l.masterId, c.id);
                    for (const s of segments(c)) {
                        if (distance(s.a, s.b) < .01 && !s.curve)
                            add('warning', 'duplicate-point', 'Adjacent nodes occupy the same position.', g, l.masterId, c.id, s.b.id);
                        if (s.curve && extrema(s.p0, s.p1, s.p2, s.p3).length)
                            add('info', 'missing-extrema', 'Curve has an internal horizontal or vertical extremum.', g, l.masterId, c.id, s.a.id);
                        for (const p of [s.p0, s.p1, s.p2, s.p3])
                            if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.max(Math.abs(p.x), Math.abs(p.y)) > 32767)
                                add('error', 'coordinate-range', 'Outline coordinate exceeds signed 16-bit range.', g, l.masterId, c.id, s.a.id);
                    }
                }
        }
        if (masters && doc.data.masters.length > 1) {
            const layers = doc.data.masters.map(m => g.layers.find(l => l.masterId === m.id));
            if (layers.some(l => !l))
                add('error', 'missing-master', 'Glyph is missing a design master.', g);
            else
                for (const message of compatibility(layers))
                    add('warning', 'master-topology', message, g);
        }
    }
    try {
        TopologicalSort(componentGraph(doc));
    }
    catch (error) {
        add('error', 'component-cycle', `Component dependency graph contains a cycle: ${error.message}`);
    }
    try {
        parseFeatures(doc.data.features || '', doc.data.glyphs.map(g => g.name));
    }
    catch (error) {
        add('error', 'feature-syntax', error.message);
    }
    for (const axis of doc.data.axes) {
        if (!/^[\x20-\x7E]{4}$/.test(axis.tag) || !Number.isFinite(axis.min) || !Number.isFinite(axis.default) || !Number.isFinite(axis.max) || axis.min > axis.default || axis.default > axis.max || axis.min === axis.max)
            add('error', 'axis-range', `Invalid axis ${axis.tag}.`);
    }
    return issues;
}

