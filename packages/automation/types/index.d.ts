/** Declarative, deterministic batch operations. No eval, arbitrary file I/O, or executable project payloads. */
export function applyRecipe(doc: any, recipe: any, { glyphIds, masterIds }?: {}): number;
export const recipes: Readonly<{
    clean: ({
        type: string;
        value: number;
    } | {
        type: string;
        value?: undefined;
    })[];
    italic: {
        type: string;
        matrix: number[];
    }[];
    reverse: {
        type: string;
    }[];
    center: {
        type: string;
    }[];
}>;
