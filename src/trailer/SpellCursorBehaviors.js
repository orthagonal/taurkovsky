/*
    these are cursor behaviors that handle typing words
    and forming into a shape that can interact with a mask layer
*/
import { ShaderBehavior } from './ShaderBehavior.js';

// cursor without a mask, this is basically identical to 
// the default video player, only it takes in mouse coords so it can render to 
// the right x,y position
class CursorNoMaskShaderBehavior extends ShaderBehavior {
    constructor(videoPlayers) {
        super(videoPlayers);
        this._pipeline = null; // Cache for the pipeline
    }

    getPipeline(webgpu) {
        if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: webgpu.vertexShader });
            const fragmentModule = webgpu.device.createShaderModule({ code: cursorFragmentShaderCodeNoMask });

            this._pipeline = webgpu.device.createRenderPipeline({
                layout: webgpu.device.createPipelineLayout({
                    bindGroupLayouts: [this.getBindGroupLayout(webgpu)]
                }),
                vertex: {
                    module: vertexModule,
                    entryPoint: 'main'
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'main',
                    targets: [{
                        format: 'rgba8unorm',
                        blend: {
                            alpha: {
                                operation: 'add',
                                srcFactor: 'src-alpha',
                                dstFactor: 'one-minus-src-alpha'
                            },
                            color: {
                                operation: 'add',
                                srcFactor: 'src-alpha',
                                dstFactor: 'one-minus-src-alpha'
                            }
                        }
                    }]
                },
                primitive: {
                    topology: 'triangle-strip',
                    cullMode: 'none'
                },
            });
        }
        return this._pipeline;
    }

    getBindGroupLayout(webgpu) {
        return webgpu.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
            ]
        });
    }

    renderBindGroup(textureList, renderPassEncoder, webgpu) {
        const [cursorExternalTexture] = textureList;
        const bindGroup = webgpu.device.createBindGroup({
            layout: this.getBindGroupLayout(webgpu),
            entries: [
                { binding: 0, resource: webgpu.sampler },
                { binding: 1, resource: cursorExternalTexture },
                { binding: 2, resource: { buffer: webgpu.mousePositionBuffer } },
                { binding: 3, resource: { buffer: webgpu.constantsBuffer } }
            ]
        });

        renderPassEncoder.setPipeline(this.getPipeline(webgpu));
        renderPassEncoder.setBindGroup(0, bindGroup);
        renderPassEncoder.setBindGroup(1, webgpu.vertexBindGroup);
        renderPassEncoder.draw(4, 1, 0, 0);
    }

    getVideoTextures(device) {
        // Retrieve the texture from the main video player
        if (this.videoPlayers.length > 0) {
            const mainVideoTexture = this.videoPlayers[0].getCurrentFrame(device);
            return mainVideoTexture ? [mainVideoTexture] : [null];
        }
        return [null];
    }
}

// hnadles cursor with a mask, now the shader wil have access to
// a 'mask' video layer that you provde and can use that mask
// to alter the main layer, reveal hidden things, etc
class CursorMaskShaderBehavior extends ShaderBehavior {
    constructor(videoPlayers) {
        super(videoPlayers);
        this._pipeline = null; // Cache for the pipeline
    }

    getPipeline(webgpu) {
        if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: webgpu.vertexShader });
            const fragmentModule = webgpu.device.createShaderModule({ code: webgpu.fragmentShaderCode });

            this._pipeline = webgpu.device.createRenderPipeline({
                layout: webgpu.device.createPipelineLayout({
                    bindGroupLayouts: [this.getBindGroupLayout(webgpu)]
                }),
                vertex: {
                    module: vertexModule,
                    entryPoint: 'main'
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'main',
                    targets: [{
                        format: 'rgba8unorm',
                        blend: {
                            alpha: {
                                operation: 'add',
                                srcFactor: 'src-alpha',
                                dstFactor: 'one-minus-src-alpha'
                            },
                            color: {
                                operation: 'add',
                                srcFactor: 'src-alpha',
                                dstFactor: 'one-minus-src-alpha'
                            }
                        }
                    }]
                },
                primitive: {
                    topology: 'triangle-strip',
                    cullMode: 'none'
                },
            });
        }
        return this._pipeline;
    }

    getBindGroupLayout(webgpu) {
        return webgpu.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                { binding: 4, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }
            ]
        });
    }

    renderBindGroup(textureList, renderPassEncoder, webgpu) {
        const [cursorExternalTexture, maskExternalTexture] = textureList;
        const bindGroup = webgpu.device.createBindGroup({
            layout: this.getBindGroupLayout(webgpu),
            entries: [
                { binding: 0, resource: webgpu.sampler },
                { binding: 1, resource: cursorExternalTexture },
                { binding: 2, resource: { buffer: webgpu.mousePositionBuffer } },
                { binding: 3, resource: { buffer: webgpu.constantsBuffer } },
                { binding: 4, resource: maskExternalTexture }
            ]
        });

        renderPassEncoder.setPipeline(this.getPipeline(webgpu));
        renderPassEncoder.setBindGroup(0, bindGroup);
        renderPassEncoder.setBindGroup(1, webgpu.vertexBindGroup);
        renderPassEncoder.draw(4, 1, 0, 0);
    }

    getVideoTextures(device) {
        // Retrieve the texture from the main and mask video players
        if (this.videoPlayers.length >= 2) {
            const mainVideoTexture = this.videoPlayers[0].getCurrentFrame(device);
            const maskVideoTexture = this.videoPlayers[1].getCurrentFrame(device);

            // Check if both textures are available
            if (mainVideoTexture && maskVideoTexture) {
                return [mainVideoTexture, maskVideoTexture];
            }
        }
        return [null, null];
    }
}

export { CursorMaskShaderBehavior, CursorNoMaskShaderBehavior };