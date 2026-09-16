export type TextWrappingStyle = "Inline" | "Square" | "Tight" | "TopAndBottom" | "BehindText" | "InFrontOfText";
export interface FloatingLayoutOptions {
    WrapStyle?: TextWrappingStyle;
    Width?: number;
    Height?: number;
    HorizontalAlignment?: "Left" | "Center" | "Right" | "Stretch";
    HorizontalOffset?: number;
    VerticalOffset?: number;
    Rotation?: number;
    WrapDistance?: number;
    Shape?: "Rectangle" | "Ellipse";
}
export interface FloatingLayoutDiagnostic {
    ElementId: string;
    Message: string;
}
/** Validate an entire requested change before mutating the document. */
export declare function normalizeFloatingLayout(value: FloatingLayoutOptions): FloatingLayoutOptions;
