import type {StudioWorkbench} from './index.js';
import type {WorkspacePreferences} from './workspace-preferences.js';
import type {GlyphTiles} from '@wieslawsoltes/counterform-integrations';
export declare function registerWorkspaceCommands(app:StudioWorkbench):void;
export declare class WorkspaceUI {
    constructor(app:StudioWorkbench);
    readonly app:StudioWorkbench;
    preferences:WorkspacePreferences;
    focused:boolean;
    disposed:boolean;
    readonly fontTiles:GlyphTiles;
    /** Completion of the latest ordered device-preference write; no source data is stored here. */
    readonly write:Promise<unknown>;
    setPreference<K extends Exclude<keyof WorkspacePreferences,'format'|'sections'>>(key:K,value:WorkspacePreferences[K]):void;
    visible(id:string):boolean;
    togglePanel(id:string):void;
    toggleFocus():void;
    resetLayout():void;
    showPreferences():{element:HTMLDialogElement;body:HTMLDivElement;footer:HTMLElement;close():void};
    prepare():void;
    install():Promise<void>;
    dispose():void;
}
