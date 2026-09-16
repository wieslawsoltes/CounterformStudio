export function normalizeLocation(location: any, axes: any): {};
export function supportScalar(location: any, support: any): number;
export function compatibility(layers: any): any[];
export function modelForDocument(doc: any): VariationModel;
export function interpolateLayer(layers: any, weights: any): any;
export function instanceDocument(doc: any, location: any, { name }?: {
    name?: string;
}): FontDocument;
/** All masters share subdivision decisions; independently approximating curves breaks gvar point identity. */
export function compatibleQuadratics(masterContours: any, tolerance?: number): any;
/** gvar stores full-point deltas (no IUP approximation), embedded peaks and intermediate regions. */
export function compileVariableTrueType(doc: any, { tolerance }?: {
    tolerance?: number;
}): Uint8Array<ArrayBuffer>;
/** Sparse-master support regions following fontTools' open-source VariationModel algorithm.
 * See THIRD_PARTY_NOTICES.md for the algorithm reference and BSD license attribution.
 */
export class VariationModel {
    constructor(locations: any, axisOrder?: any[]);
    original: any;
    order: any;
    locations: any;
    supports: {
        [k: string]: any[];
    }[];
    deltaWeights: number[][][];
    deltas(values: any): any[];
    scalars(location: any): number[];
    weights(location: any): any[];
    interpolate(location: any, values: any): any;
}
import { FontDocument } from '@wieslawsoltes/counterform-model';
