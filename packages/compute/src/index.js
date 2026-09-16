/** Optional WebGPU compute accelerator. Source coordinates remain CPU double precision. */
export const interpolationWGSL = `struct Parameters { count:u32, masters:u32, pad0:u32, pad1:u32 };
@group(0) @binding(0) var<storage,read> coordinates:array<f32>;
@group(0) @binding(1) var<storage,read> weights:array<f32>;
@group(0) @binding(2) var<storage,read_write> output:array<f32>;
@group(0) @binding(3) var<uniform> params:Parameters;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3u){let i=id.x;if(i>=params.count){return;}var value:f32=0;for(var m:u32=0;m<params.masters;m++){value+=coordinates[m*params.count+i]*weights[m];}output[i]=value;}`;
export function interpolateCPU(masters, weights) { validate(masters, weights); const out = new Float64Array(masters[0].length); for (let m = 0; m < masters.length; m++)
    for (let i = 0; i < out.length; i++)
        out[i] += masters[m][i] * weights[m]; return out; }
function validate(masters, weights) { if (!masters.length || masters.length !== weights.length || masters.length > 64 || masters.some(m => m.length !== masters[0].length) || weights.some(v => !Number.isFinite(v)))
    throw new Error('Incompatible coordinate buffers or weights'); if (masters[0].length > 2000000)
    throw new RangeError('Compute point budget exceeded'); }
export class CoordinateCompute {
    constructor() { this.device = null; this.backend = 'cpu-f64'; this.disposed = false; }
    async initialize() { if (!globalThis.navigator?.gpu)
        return false; const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }); if (!adapter)
        return false; const device = await adapter.requestDevice(); if (this.disposed) {
        device.destroy();
        return false;
    } this.device = device; device.lost.then(() => { this.device = null; this.backend = 'cpu-f64'; }); const shader = device.createShaderModule({ code: interpolationWGSL }); const messages = (await shader.getCompilationInfo()).messages.filter(m => m.type === 'error'); if (messages.length) {
        device.destroy();
        this.device = null;
        throw new Error(messages.map(m => m.message).join('\n'));
    } this.pipeline = await device.createComputePipelineAsync({ layout: 'auto', compute: { module: shader, entryPoint: 'main' } }); this.backend = 'webgpu-f32'; return true; }
    async interpolate(masters, weights) { validate(masters, weights); const n = masters[0].length, d = this.device; if (!d || !n)
        return interpolateCPU(masters, weights); const byteLength = n * 4, total = byteLength * masters.length; if (total > d.limits.maxStorageBufferBindingSize || Math.ceil(n / 64) > d.limits.maxComputeWorkgroupsPerDimension)
        return interpolateCPU(masters, weights); const buffers = []; const buffer = (size, usage) => { const b = d.createBuffer({ size: Math.max(4, size), usage }); buffers.push(b); return b; }; try {
        const input = buffer(total, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST), weight = buffer(weights.length * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST), output = buffer(byteLength, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC), uniform = buffer(16, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST), read = buffer(byteLength, GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST), values = new Float32Array(n * masters.length);
        masters.forEach((m, i) => values.set(m, i * n));
        d.queue.writeBuffer(input, 0, values);
        d.queue.writeBuffer(weight, 0, new Float32Array(weights));
        d.queue.writeBuffer(uniform, 0, new Uint32Array([n, masters.length, 0, 0]));
        const group = d.createBindGroup({ layout: this.pipeline.getBindGroupLayout(0), entries: [input, weight, output, uniform].map((b, binding) => ({ binding, resource: { buffer: b } })) }), encoder = d.createCommandEncoder(), pass = encoder.beginComputePass();
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(Math.ceil(n / 64));
        pass.end();
        encoder.copyBufferToBuffer(output, 0, read, 0, byteLength);
        d.queue.submit([encoder.finish()]);
        await read.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(read.getMappedRange().slice(0));
        read.unmap();
        return result;
    }
    finally {
        buffers.forEach(b => b.destroy());
    } }
    dispose() { this.disposed = true; this.device?.destroy(); this.device = null; }
}

