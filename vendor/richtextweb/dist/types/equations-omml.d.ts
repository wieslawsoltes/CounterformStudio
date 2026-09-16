import { type EquationOptions } from "./equations.js";
import { type MarkupNode } from "./formats-markup.js";
/** Convert presentation MathML into native editable Office Math, not a picture fallback. */
export declare function equationToOMML(options: EquationOptions | string): string;
/** Import the Office Math structural vocabulary as editable presentation MathML. */
export declare function ommlToMathML(source: string | MarkupNode): string;
