export type WorkspaceTheme = 'light' | 'dark' | 'system';
export type PaletteId = 'font' | 'layers' | 'glyph' | 'metrics' | 'selection' | 'elements' | 'transform' | 'anchors' | 'components' | 'modifiers' | 'color';
export interface WorkspacePreferences {
    format: 1;
    theme: WorkspaceTheme;
    canvas: 'paper' | 'theme';
    ribbon: 'compact' | 'expanded';
    navigator: boolean;
    dimFill: boolean;
    cellSize: number;
    sections: Record<PaletteId, boolean>;
}
export const preferenceKey: 'counterform.workspace.v1';
export const paletteIds: readonly PaletteId[];
/** Rejects unsupported values, copies section flags, and clamps grid size to 56–144 pixels. */
export function normalizeWorkspacePreferences(value: unknown): WorkspacePreferences;
export function resolvedTheme(preference: WorkspaceTheme, systemDark?: boolean): 'light' | 'dark';
