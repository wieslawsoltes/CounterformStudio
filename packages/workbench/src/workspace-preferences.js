/** Appearance is device-local UI state, never font source or undo history. */
export const preferenceKey = 'counterform.workspace.v1';
export const paletteIds = Object.freeze(['font', 'layers', 'glyph', 'metrics', 'selection', 'elements', 'transform', 'anchors', 'components', 'modifiers', 'color']);
export function normalizeWorkspacePreferences(value) {
    const v = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const sections = {};
    for (const key of paletteIds) {
        sections[key] = Object.hasOwn(v.sections ?? {}, key) && typeof v.sections[key] === 'boolean'
            ? v.sections[key] : !['anchors', 'components', 'modifiers', 'color'].includes(key);
    }
    return {
        format: 1,
        theme: ['light', 'dark', 'system'].includes(v.theme) ? v.theme : 'light',
        canvas: v.canvas === 'theme' ? 'theme' : 'paper',
        ribbon: v.ribbon === 'expanded' ? 'expanded' : 'compact',
        navigator: typeof v.navigator === 'boolean' ? v.navigator : false,
        dimFill: typeof v.dimFill === 'boolean' ? v.dimFill : true,
        cellSize: Number.isFinite(v.cellSize) ? Math.round(Math.max(56, Math.min(144, v.cellSize))) : 88,
        sections
    };
}
export function resolvedTheme(preference, systemDark = false) {
    return preference === 'dark' || preference === 'system' && systemDark ? 'dark' : 'light';
}
