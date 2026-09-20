import {mountStudio, version} from '@wieslawsoltes/counterform-workbench';
import {normalizeWorkspacePreferences, resolvedTheme, WorkspacePreferences, PaletteId} from '@wieslawsoltes/counterform-workbench/preferences';
const preferences:WorkspacePreferences=normalizeWorkspacePreferences(JSON.parse('{"theme":"system"}'));
const palette:PaletteId='metrics';
const theme:'light'|'dark'=resolvedTheme(preferences.theme,true);
const release:'0.6.0'=version;
async function setup(host:HTMLDivElement) {
 const studio=await mountStudio(host,{restore:false});
 studio.workspaceUI.setPreference('canvas','paper');
 studio.workspaceUI.setPreference('ribbon','expanded');
 studio.workspaceUI.setPreference('theme',theme);
 studio.workspaceUI.resetLayout();
 studio.setGlyphMetric('advanceWidth',600);
 studio.renderer.dimFill=true;
 await studio.workspaceUI.write;
 studio.dispose();
}
void setup;void palette;void release;
