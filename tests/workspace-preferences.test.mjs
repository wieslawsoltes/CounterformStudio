import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWorkspacePreferences as normalize, resolvedTheme, paletteIds} from '../packages/workbench/src/workspace-preferences.js';
import {iconNames, iconPaths, commandIcon} from '@wieslawsoltes/counterform-icons';

test('workspace defaults are paper-first, compact, and independent objects',()=>{
 const a=normalize(null),b=normalize(undefined);
 assert.deepEqual(a,b);assert.equal(a.theme,'light');assert.equal(a.canvas,'paper');assert.equal(a.ribbon,'compact');assert.equal(a.navigator,false);assert.equal(a.cellSize,88);
 a.sections.layers=false;assert.equal(b.sections.layers,true);assert.equal(b.sections.color,false);
});
test('workspace settings reject foreign schema values and bound cell geometry',()=>{
 for(const input of [undefined,null,[],0,'dark',true])assert.equal(normalize(input).theme,'light');
 assert.equal(normalize({theme:'system',canvas:'theme',ribbon:'expanded',cellSize:99.8,navigator:true,dimFill:false}).cellSize,100);
 assert.equal(normalize({cellSize:-1}).cellSize,56);assert.equal(normalize({cellSize:999999}).cellSize,144);assert.equal(normalize({cellSize:NaN}).cellSize,88);
 const p=normalize({format:100,theme:'code',ribbon:'unknown',dimFill:'false',sections:{layers:false,unknown:true,metrics:0}});
 assert.equal(p.format,1);assert.equal(p.theme,'light');assert.equal(p.dimFill,true);assert.equal(p.sections.layers,false);assert.equal(p.sections.metrics,true);assert.deepEqual(Object.keys(p.sections),paletteIds);
});
test('workspace normalization does not mutate input or trust inherited palette values',()=>{
 const source={theme:'dark',sections:Object.assign(Object.create({font:false}),{glyph:false})};const p=normalize(source);
 assert.equal(p.sections.font,true);assert.equal(p.sections.glyph,false);p.sections.glyph=true;assert.equal(source.sections.glyph,false);
 assert.deepEqual(normalize(JSON.parse(JSON.stringify(p))),p);
});
test('system appearance resolution is explicit and deterministic',()=>{
 assert.equal(resolvedTheme('system',true),'dark');assert.equal(resolvedTheme('system',false),'light');assert.equal(resolvedTheme('dark',false),'dark');assert.equal(resolvedTheme('light',true),'light');
});
test('new workspace actions map to shipped original vector icons',()=>{
 assert.equal(iconNames.length,76);
 for(const id of ['view.font','view.library','view.ribbon','view.paper','view.trueFill','workspace.focus','workspace.reset','workspace.preferences','glyph.previous','glyph.next','view.zoomIn','view.zoomOut','glyph.artwork','glyph.autotrace','glyph.mask','outline.fit'])assert.ok(iconPaths[commandIcon(id)],id);
 for(const id of ['chevronLeft','chevronRight','plus','minus'])assert.ok(iconPaths[id]);
});
