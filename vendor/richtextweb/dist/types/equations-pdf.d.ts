import { PDFPage, type Color } from "pdf-lib";
import type { EquationRenderResult } from "./equations.js";
/** Draw safe MathJax outlines as PDF paths, retaining vector quality without font binaries. */
export declare function drawEquationPDF(page: PDFPage, result: EquationRenderResult, x: number, top: number, width: number, height: number, foreground?: Color): void;
