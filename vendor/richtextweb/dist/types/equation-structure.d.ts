export type MatrixEdit = "InsertRowBefore" | "InsertRowAfter" | "DeleteRow" | "InsertColumnBefore" | "InsertColumnAfter" | "DeleteColumn";
export interface EquationMatrixPosition {
    Path: number[];
    Row: number;
    Column: number;
    Rows: number;
    Columns: number;
}
/** Locate the innermost regular matrix containing a selected token. */
export declare function equationMatrixAt(source: string, path: readonly number[]): EquationMatrixPosition;
/** Insert/remove a row or column without changing other cells, styles, or enclosing delimiters. */
export declare function editEquationMatrix(source: string, path: readonly number[], operation: MatrixEdit): string;
/** Add a token next to a selection. Fixed-arity operands are grouped rather than made invalid. */
export declare function insertEquationToken(source: string, path: readonly number[], text: string, before?: boolean): string;
/** Delete a selected token, retaining a selectable placeholder in required/last operands. */
export declare function deleteEquationToken(source: string, path: readonly number[]): string;
/** Convert common presentation MathML structures to editable TeX. Unsupported constructs fail explicitly. */
export declare function mathMLToLaTeX(source: string): string;
