export const tools: {
    id: string;
    label: string;
    key: string;
    icon: string;
}[];
/** Pointer transactions, picking and commands. No global window singleton or document mutation from rendering. */
export class GlyphEditor {
    constructor(doc: any, history: any, renderer: any);
    changed: Signal;
    selectionChanged: Signal;
    status: Signal;
    doc: any;
    history: any;
    renderer: any;
    glyphId: any;
    masterId: any;
    selection: Set<any>;
    tool: string;
    snap: boolean;
    gridStep: number;
    readOnly: boolean;
    drag: {
        kind: string;
        screen: {
            x: number;
            y: number;
        };
        camera: any;
        start?: undefined;
        id?: undefined;
        tool?: undefined;
        nodeId?: undefined;
        hit?: undefined;
        original?: undefined;
        add?: undefined;
    } | {
        kind: string;
        screen?: undefined;
        camera?: undefined;
        start?: undefined;
        id?: undefined;
        tool?: undefined;
        nodeId?: undefined;
        hit?: undefined;
        original?: undefined;
        add?: undefined;
    } | {
        kind: string;
        start: any;
        id: string;
        tool: string;
        screen?: undefined;
        camera?: undefined;
        nodeId?: undefined;
        hit?: undefined;
        original?: undefined;
        add?: undefined;
    } | {
        kind: string;
        nodeId: string;
        start: any;
        screen?: undefined;
        camera?: undefined;
        id?: undefined;
        tool?: undefined;
        hit?: undefined;
        original?: undefined;
        add?: undefined;
    } | {
        kind: string;
        hit: {
            distance: number;
            Envelope: import("@wieslawsoltes/rbushweb").EnvelopeLike;
        };
        start: any;
        original: any;
        screen?: undefined;
        camera?: undefined;
        id?: undefined;
        tool?: undefined;
        nodeId?: undefined;
        add?: undefined;
    } | {
        kind: string;
        screen: {
            x: number;
            y: number;
        };
        original: Set<any>;
        add: any;
        camera?: undefined;
        start?: undefined;
        id?: undefined;
        tool?: undefined;
        nodeId?: undefined;
        hit?: undefined;
    };
    space: boolean;
    clipboard: any;
    abort: AbortController;
    index: RBush<import("@wieslawsoltes/rbushweb").ISpatialData>;
    penId: any;
    off: any;
    get glyph(): any;
    get layer(): any;
    get canEdit(): boolean;
    local(e: any): {
        x: number;
        y: number;
    };
    snapPoint(p: any, e?: {}): any;
    setGlyph(id: any, { fit }?: {
        fit?: boolean;
    }): void;
    setMaster(id: any): void;
    setTool(id: any): void;
    cursor(): void;
    refresh(): void;
    reindex(): void;
    hit(p: any, radius?: number): {
        distance: number;
        Envelope: import("@wieslawsoltes/rbushweb").EnvelopeLike;
    };
    nearest(p: any): {
        contour: any;
        distance: number;
        index: number;
        t: number;
        point: any;
    };
    findNode(id: any): {
        contour: any;
        node: any;
        index: any;
    };
    select(ids: any, { add }?: {
        add?: boolean;
    }): void;
    selectAll(): void;
    clearSelection(): void;
    transaction(label: any, fn: any): any;
    pointerDown(e: any): void;
    pointerMove(e: any): void;
    pointerUp(e: any): void;
    cancel(): void;
    doubleClick(e: any): void;
    nudge(dx: any, dy: any): void;
    deleteSelection(): void;
    nodeStyle(smooth: any): void;
    selectedContours(): any;
    outlineOperation(op: any): void;
    transform(matrix: any, label?: string): void;
    align(axis: any): void;
    boolean(operation: any): void;
    expandStroke(width: any): void;
    copy(): {
        format: string;
        version: number;
        contours: any;
    };
    cut(): void;
    paste(data?: any): void;
    dispose(): void;
}
import { Signal } from '@wieslawsoltes/counterform-model';
import { RBush } from '@wieslawsoltes/rbushweb';
