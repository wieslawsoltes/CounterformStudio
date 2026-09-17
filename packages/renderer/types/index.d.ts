export function initializeSkia(options?: {}): any;
export function makePath(S: any, contours: any): any;
export function booleanContours(S: any, contours: any, operation?: string): {
    id: string;
    closed: boolean;
    nodes: any[];
}[];
export function strokeContours(S: any, contours: any, width: any, { join, cap }?: {
    join?: string;
    cap?: string;
}): {
    id: string;
    closed: boolean;
    nodes: any[];
}[];
/** Font-space camera. Position is in CSS pixels; outlines always remain double precision. */
export class Camera {
    x: number;
    y: number;
    scale: number;
    world(p: any): {
        x: number;
        y: number;
    };
    screen(p: any): {
        x: number;
        y: number;
    };
    zoomAt(factor: any, p: any): void;
    fit(cs: any, width: any, height: any, advance?: number, upm?: number): void;
}
/** Layered native Skia outline surface with independent, accessible input and measurement overlays. */
export class GlyphRenderer {
    constructor(host: any, { S, backend }?: {
        S?: any;
        backend?: string;
    });
    changed: Signal;
    error: Signal;
    frame: Signal;
    host: any;
    S: any;
    camera: Camera;
    scene: {
        contours: any[];
        editable: any[];
        advanceWidth: number;
        metrics: {
            unitsPerEm: number;
            ascender: number;
            descender: number;
            capHeight: number;
            xHeight: number;
        };
        anchors: any[];
        guides: any[];
        ghost: any[];
    };
    selection: Set<any>;
    showGrid: boolean;
    showNodes: boolean;
    showFill: boolean;
    showGuides: boolean;
    preview: boolean;
    dark: boolean;
    backend: string;
    drawCount: number;
    pending: number;
    paths: any[];
    disposed: boolean;
    needsPaths: boolean;
    background: HTMLCanvasElement;
    overlay: HTMLCanvasElement;
    native: HTMLCanvasElement | import("@wieslawsoltes/skiasharpweb/browser").SkiaCanvasElement;
    onPaint: (e: any) => void;
    onError: (e: any) => void;
    onLoss: () => void;
    resizeObserver: ResizeObserver;
    setScene(scene: any): void;
    setCompiledColorFont(bytes:Uint8Array|null,options:{documentId:string;revision:number;masterId:string;glyphOrder:string[];unitsPerEm:number}):void;
    currentColorFont():any;
    fit(): void;
    invalidate(): void;
    size(canvas: any): {
        ctx: any;
        w: number;
        h: number;
        dpr: number;
    };
    draw(): void;
    pathCache(): void;
    paintNative({ Canvas, Info, Surface }: {
        Canvas: any;
        Info: any;
        Surface: any;
    }): void;
    drawFallback(): void;
    drawBackground(): void;
    drawOverlay(): void;
    toSVG(): string;
    dispose(): void;
}
import { Signal } from '@wieslawsoltes/counterform-model';
