import type {StudioWorkbench} from './index.js';
export interface AuthoringDialog {element:HTMLDialogElement;body:HTMLDivElement;footer:HTMLElement;close():void}
export function registerAdvancedCommands(app:StudioWorkbench):void;
export function showAttachmentEditor(app:StudioWorkbench):AuthoringDialog;
export function showAxisMapping(app:StudioWorkbench):AuthoringDialog;
export function showOutlineAnalysis(app:StudioWorkbench):AuthoringDialog;
