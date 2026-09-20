import type {StudioWorkbench} from './index.js';
import type {AuthoringDialog} from './advanced-ui.js';
export function registerWorkflowCommands(app:StudioWorkbench):void;
export function showMetricsEditor(app:StudioWorkbench):AuthoringDialog;
export function showFeatureVariations(app:StudioWorkbench):AuthoringDialog;
export function showCollectionBuilder(app:StudioWorkbench,options?:{files?:File[]}):AuthoringDialog;
