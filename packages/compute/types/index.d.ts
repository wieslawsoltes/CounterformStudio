export function interpolateCPU(masters: any, weights: any): Float64Array<any>;
/** Optional WebGPU compute accelerator. Source coordinates remain CPU double precision. */
export const interpolationWGSL: "struct Parameters { count:u32, masters:u32, pad0:u32, pad1:u32 };\n@group(0) @binding(0) var<storage,read> coordinates:array<f32>;\n@group(0) @binding(1) var<storage,read> weights:array<f32>;\n@group(0) @binding(2) var<storage,read_write> output:array<f32>;\n@group(0) @binding(3) var<uniform> params:Parameters;\n@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3u){let i=id.x;if(i>=params.count){return;}var value:f32=0;for(var m:u32=0;m<params.masters;m++){value+=coordinates[m*params.count+i]*weights[m];}output[i]=value;}";
export class CoordinateCompute {
    device: any;
    backend: string;
    disposed: boolean;
    initialize(): Promise<boolean>;
    pipeline: any;
    interpolate(masters: any, weights: any): Promise<Float64Array<any> | Float32Array<any>>;
    dispose(): void;
}
