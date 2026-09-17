/** Mount a complete local-first authoring workspace. Consumers own the returned lifetime. */
export function mountStudio(host: any, { document: initialDocument, skiaOptions, compilerOptions, restore }?: {
    document?: any;
    skiaOptions?: {};
    compilerOptions?: import("@wieslawsoltes/counterform-compiler").CompilerOptions;
    restore?: boolean;
}): Promise<StudioWorkbench>;
export const version: "0.2.0";
export class StudioWorkbench {
    compiler: import("@wieslawsoltes/counterform-compiler").CompilerClient;
    showColors(): any;
    constructor(host: any, options: any);
    host: any;
    options: any;
    disposables: any[];
    log: any[];
    location: {};
    previewInstance: boolean;
    ready: boolean;
    theme: string;
    initialize(): Promise<this>;
    store: ProjectStore;
    doc: FontDocument;
    history: History;
    state: StudioState;
    S: any;
    commands: CommandRegistry;
    compute: CoordinateCompute;
    renderer: GlyphRenderer;
    editor: GlyphEditor;
    autosave: Autosave;
    constructShell(): void;
    header: any;
    menuHost: any;
    projectLabel: any;
    saveLabel: any;
    ribbonHost: any;
    workHost: any;
    statusbar: any;
    statusLeft: any;
    statusCenter: any;
    statusRight: any;
    canvasHost: any;
    editorPane: any;
    contextbar: any;
    glyphLabel: any;
    contextMetrics: any;
    masterSelect: any;
    toolRail: any;
    modeLabel: any;
    constructPanels(): void;
    library: any;
    searchInput: any;
    categoryButtons: any[];
    libraryFooter: any;
    tiles: GlyphTiles;
    table: {
        element: import("@wieslawsoltes/treedatagridweb/web").TreeDataGrid<any>;
        source: import("@wieslawsoltes/treedatagridweb").FlatTreeDataGridSource<any>;
        dispose(): void;
    };
    kerning: {
        element: import("@wieslawsoltes/gridweb/controls").GridWebElement;
        workbook: import("@wieslawsoltes/gridweb").Workbook;
        refresh: () => void;
        dispose(): void;
    };
    kerningPane: any;
    notes: {
        element: import("@wieslawsoltes/richtextweb").RichTextBox;
        flush: () => void;
        dispose(): void;
    };
    notesPane: any;
    featuresPane: any;
    featureMessage: any;
    featureText: any;
    proofPane: any;
    proofMode: any;
    proofKern: any;
    kernOff: any;
    proofLiga: any;
    ligaOff: any;
    proof: FontProof;
    inspector: any;
    mastersPane: any;
    outputPane: any;
    outputList: any;
    constructLayout(): void;
    layout: LayoutRoot;
    dock: DockingManager;
    activate(id: any): void;
    constructRibbon(): void;
    ribbon: import("@wieslawsoltes/ribbon-web").RibbonElement;
    registerCommands(): void;
    buildMenus(): void;
    openMenu: any;
    buildInspector(): void;
    inspectorFields: {};
    outlineStats: any;
    selectionLabel: any;
    anchorList: any;
    componentList: any;
    layerList: any;
    bind(): void;
    frameSub: () => boolean;
    statusBackend: any;
    safe(action: any): Promise<void>;
    selectGlyph(id: any): void;
    selectMaster(id: any): void;
    nextGlyph(delta: any): void;
    updateMasterControls(): void;
    updateInspector(): void;
    updateStatus(): void;
    updateAll(): void;
    zoom(factor: any): void;
    toggleTheme(): void;
    newFont(): Promise<void>;
    replaceDocument(document: any, confirmDiscard?: boolean): void;
    openFile(file?: any): Promise<void>;
    saveProject(): void;
    showRecent(): Promise<void>;
    showNewGlyph(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    duplicateCurrent(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    deleteGlyph(): void;
    showTransform(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    showFontInfo(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    addAnchor(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    editAnchor(index: any): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    addComponent(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    editComponent(index: any): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    showKerningPair(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    showGroups(): void;
    checkFeatures(): {
        classes: any;
        features: {
            tag: any;
            rules: ({
                type: string;
                input: any[];
                output: any;
                left?: undefined;
                right?: undefined;
                value?: undefined;
            } | {
                type: string;
                left: any;
                right: any;
                value: number;
                input?: undefined;
                output?: undefined;
            })[];
        }[];
    };
    applyFeatures(): void;
    showValidation(glyphId?: any): Promise<any[]>;
    showTables(): Promise<void>;
    showExport(): void;
    renderMasters(): void;
    axisTimer: number;
    applyInstancePreview(): void;
    addMaster(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    editMaster(master: any): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    addAxis(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    checkCompatibility(): void;
    generateInstance(): Promise<{
        element: any;
        body: any;
        footer: any;
        close: () => any;
    }>;
    showPalette(): void;
    showBindings(): void;
    showRecipe(): void;
    verifyCompute(): Promise<{
        available: boolean;
        backend: string;
        result: number[];
    }>;
    showAbout(): void;
    record(category: any, message: any): void;
    renderLog(): void;
    dispose(): void;
}
import { ProjectStore } from '@wieslawsoltes/counterform-storage';
import { FontDocument } from '@wieslawsoltes/counterform-model';
import { History } from '@wieslawsoltes/counterform-history';
import { StudioState } from '@wieslawsoltes/counterform-integrations';
import { CommandRegistry } from '@wieslawsoltes/counterform-commands';
import { CoordinateCompute } from '@wieslawsoltes/counterform-compute';
import { GlyphRenderer } from '@wieslawsoltes/counterform-renderer';
import { GlyphEditor } from '@wieslawsoltes/counterform-editor';
import { Autosave } from '@wieslawsoltes/counterform-storage';
import { GlyphTiles } from '@wieslawsoltes/counterform-integrations';
import { FontProof } from '@wieslawsoltes/counterform-proofing';
import { LayoutRoot } from '@wieslawsoltes/dockyard';
import { DockingManager } from '@wieslawsoltes/dockyard';
