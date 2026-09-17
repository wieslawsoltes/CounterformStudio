export function parsePairKey(key: any): any[];
export function kerningValue(data: any, masterId: any, left: any, right: any): any;
export function expandKerning(data: any, masterId: any, glyphs: any): any[];
/** Deliberately strict Adobe FEA subset. Unsupported syntax is an error, never silently ignored. */
export function parseFeatures(source: any, glyphNames?: any[]): {
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
export function layoutTable(features: any, lookups: any): Uint8Array<ArrayBuffer>;
export function compileLayout(data: any, glyphs: any, masterId: any, variationModel?: any): {
    tables: Map<any, any>;
    parsed: {
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
    kern: any[];
};
/** Legacy kern is emitted alongside GPOS for consumers that do not implement layout. */
export function compileKern(pairs: any): Uint8Array<ArrayBuffer>;
export function readKern(bytes: any): any[];
export function pairKey(left: any, right: any): string;
