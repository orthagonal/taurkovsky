/*
    these are cursor behaviors that handle typing words
    and forming into a shape that can interact with a mask layer
*/
import { ShaderBehavior } from './ShaderBehavior.js';


// vertexes on which the cursor is rendered,
// the vertex shader doesn't care if there is a mask or not
// it's always drawing a square frame anyway
const vertexShaderCode = /* wgsl */`
    struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
        @location(0) fragUV : vec2<f32>,
    }

    @vertex
    fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
        var pos = array<vec2<f32>, 4>(
            vec2(-1.0, 1.0),   // top-left
            vec2(-1.0, -1.0),  // bottom-left
            vec2(1.0, 1.0),    // top-right
            vec2(1.0, -1.0)    // bottom-right
        );

        const uv = array(
            vec2(0.0, 0.0),  // top-left (y-coordinate flipped)
            vec2(0.0, 1.0),  // bottom-left (y-coordinate flipped)
            vec2(1.0, 0.0),  // top-right (y-coordinate flipped)
            vec2(1.0, 1.0)   // bottom-right (y-coordinate flipped)
        );

        var output : VertexOutput;
        output.Position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
        output.fragUV = uv[vertexIndex];
        return output;
    }
`;

// pixels of the cursor when there is a mask applied
const maskShaderCode = /* wgsl */`
    struct MouseUniform {
        mousePosition: vec2<f32>
    };

    struct CursorUniform {
        useMask: u32
    };

    struct Constants {
        screenWidth: f32,
        screenHeight: f32,
        cursorWidth: f32,
        cursorHeight: f32,
        cursorActive: f32,
        activeRadius: f32
    };

    @group(0) @binding(0) var mySampler: sampler;
    @group(0) @binding(1) var smallTexture: texture_external;
    @group(0) @binding(2) var<uniform> mousePosition: MouseUniform;
    @group(0) @binding(3) var<uniform> constants: Constants;
    @group(0) @binding(4) var maskTexture: texture_external;

    @fragment
    fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
        let halfCursorWidth = constants.cursorWidth / constants.screenWidth / 2.0;
        let halfCursorHeight = constants.cursorHeight / constants.screenHeight / 2.0;
        let leftBoundary = mousePosition.mousePosition.x -halfCursorWidth;
        let rightBoundary = mousePosition.mousePosition.x + halfCursorWidth;
        let bottomBoundary = mousePosition.mousePosition.y - halfCursorHeight;
        let topBoundary = mousePosition.mousePosition.y + halfCursorHeight;

        let isWithinCursor = fragUV.x > leftBoundary && fragUV.x < rightBoundary && 
                            fragUV.y > bottomBoundary && fragUV.y < topBoundary;

        if (isWithinCursor) {
            let uCoord = (fragUV.x - leftBoundary) / (2.0 * halfCursorWidth);
            let vCoord = (fragUV.y - bottomBoundary) / (2.0 * halfCursorHeight);
            let adjustedUV = vec2<f32>(uCoord, vCoord);

            // Sample color from smallTexture and maskTexture
            let colorFromSmallTexture = textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
            let colorFromMaskTexture = textureSampleBaseClampToEdge(maskTexture, mySampler, fragUV);
            // If the alpha value of the pixel in smallTexture is less than 1.0, use the pixel from hitboxTexture
            if (colorFromSmallTexture.a < 1.0) {
                // if the hitbox color is black ignore it:
                if (colorFromMaskTexture.r == 0.0 && colorFromMaskTexture.g == 0.0 && colorFromMaskTexture.b == 0.0) {
                    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
                }
                // if it's close to the center show it
                var cursorCenter = vec2<f32>(mousePosition.mousePosition.x * 2.0, mousePosition.mousePosition.y);
                var adjustedFragUV = vec2<f32>(fragUV.x * 2.0 , fragUV.y );
                var distanceFromCenter = distance(adjustedFragUV, cursorCenter);
                var thresholdDistance = 0.05;
                if (distanceFromCenter <= thresholdDistance) {
                    var bias = 0.4; // Adjust as needed to bias more or less in favor of smallTexture
                    var alpha = clamp(colorFromSmallTexture.a + bias, 0.0, 1.0); // Clamp to ensure it's between 0 and 1
                    var beta = 1.0 - alpha; // Inverse alpha value for blending
                    // alpha 1 = only colorFromSmallTexture, alpha = 0, only colorFromMaskTexture 
                    var blendedColor = alpha * colorFromSmallTexture + beta * colorFromMaskTexture;
                    return blendedColor;
                }
            }
            return colorFromSmallTexture;
        }
        return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
`;

// pixels of the cursor when there is no mask applied
const noMaskShaderCode = /* wgsl */`
    struct MouseUniform {
    mousePosition: vec2<f32>
    };

    struct CursorUniform {
    useMask: u32
    };

    struct Constants {
    screenWidth: f32,
    screenHeight: f32,
    cursorWidth: f32,
    cursorHeight: f32,
    cursorActive: f32,
    activeRadius: f32
    };

    @group(0) @binding(0) var mySampler: sampler;
    @group(0) @binding(1) var smallTexture: texture_external;
    @group(0) @binding(2) var<uniform> mousePosition: MouseUniform;
    @group(0) @binding(3) var<uniform> constants: Constants;

    @fragment
    fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
    let halfCursorWidth = constants.cursorWidth / constants.screenWidth / 2.0;
    let halfCursorHeight = constants.cursorHeight / constants.screenHeight / 2.0;
    let leftBoundary = mousePosition.mousePosition.x - halfCursorWidth;
    let rightBoundary = mousePosition.mousePosition.x + halfCursorWidth;
    let bottomBoundary = mousePosition.mousePosition.y - halfCursorHeight;
    let topBoundary = mousePosition.mousePosition.y + halfCursorHeight;

    let isWithinCursor = fragUV.x > leftBoundary && fragUV.x < rightBoundary && 
                        fragUV.y > bottomBoundary && fragUV.y < topBoundary;

    if (isWithinCursor) {
        let uCoord = (fragUV.x - leftBoundary) / (2.0 * halfCursorWidth);
        let vCoord = (fragUV.y - bottomBoundary) / (2.0 * halfCursorHeight);
        let adjustedUV = vec2<f32>(uCoord, vCoord);

        let colorFromSmallTexture = textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
        if (colorFromSmallTexture.a < 1.0) {
            // if it's close to the center show itl
            var cursorCenter = vec2<f32>(mousePosition.mousePosition.x * 2.0, mousePosition.mousePosition.y);
            var adjustedFragUV = vec2<f32>(fragUV.x * 2.0 , fragUV.y );
            var distanceFromCenter = distance(adjustedFragUV, cursorCenter);
            var thresholdDistance = 0.05;
            if (distanceFromCenter <= thresholdDistance) {
                var bias = 0.9; // Adjust as needed to bias more or less in favor of smallTexture
                var alpha = clamp(colorFromSmallTexture.a + bias, 0.0, 1.0); // Clamp to ensure it's between 0 and 1
                var beta = 1.0 - alpha; // Inverse alpha value for blending
                // alpha 1 = only colorFromSmallTexture, alpha = 0, only colorFromMaskTexture 
                var blendedColor = alpha * colorFromSmallTexture;
                return blendedColor;
            }
        }
        return textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
    }

    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
`;

// cursor without a mask, this is basically identical to 
// the default video player, only it takes in mouse coords so it can render to 
// the right x,y position
class CursorNoMaskShaderBehavior extends ShaderBehavior {
    constructor(videoPlayers) {
        super(videoPlayers);
        this._pipeline = null; // Cache for the pipeline
        this._vertexBindGroup = null; // cache for the vertex bind group
        this._bindGroupLayout = null; // cache for the bind group layout
    }

    getPipeline(webgpu) {
        if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode });
            const fragmentModule = webgpu.device.createShaderModule({ code: noMaskShaderCode });
            // Create vertex bind group layout
            const vertexBGL = webgpu.device.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
                ]
            });

            // Create vertex bind group
            this._vertexBindGroup = webgpu.device.createBindGroup({
                layout: vertexBGL,
                entries: [
                    { binding: 0, resource: { buffer: webgpu.vertexConstants } }
                ]
            });

            this._pipeline = webgpu.device.createRenderPipeline({
                layout: webgpu.device.createPipelineLayout({
                    bindGroupLayouts: [this.getBindGroupLayout(webgpu), vertexBGL]
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
        if (!this._bindGroupLayout) {
            this._bindGroupLayout = webgpu.device.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
                    { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                    { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                    { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
                ]
            });
        }
        return this._bindGroupLayout;
    }

    renderBindGroup(textureList, renderPassEncoder, webgpu) {
        const [cursorExternalTexture] = textureList;
        const bindGroup = webgpu.device.createBindGroup({
            layout: this.getBindGroupLayout(webgpu),
            entries: [
                { binding: 0, resource: webgpu.sampler },
                { binding: 1, resource: cursorExternalTexture },
                { binding: 2, resource: { buffer: webgpu.mousePositionBuffer } },
                { binding: 3, resource: { buffer: webgpu.constants } }
            ]
        });

        renderPassEncoder.setPipeline(this.getPipeline(webgpu));
        renderPassEncoder.setBindGroup(0, bindGroup);
        renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
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
        this._bindGroupLayout = null; // cache for the bind group layout
        this._vertexBindGroup = null; // cache for the vertex bind group
    }

    getPipeline(webgpu) {
        if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode });
            const fragmentModule = webgpu.device.createShaderModule({ code: maskShaderCode });

            // Create vertex bind group layout
            const vertexBGL = webgpu.device.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
                ]
            });


            // Create vertex bind group
            this._vertexBindGroup = webgpu.device.createBindGroup({
                layout: vertexBGL,
                entries: [
                    { binding: 0, resource: { buffer: webgpu.vertexConstants } }
                ]
            });

            this._pipeline = webgpu.device.createRenderPipeline({
                layout: webgpu.device.createPipelineLayout({
                    bindGroupLayouts: [this.getBindGroupLayout(webgpu), vertexBGL]
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
        if (!this._bindGroupLayout) {
            this._bindGroupLayout = webgpu.device.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
                    { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                    { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                    { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                    { binding: 4, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }
                ]
            });
        }
        return this._bindGroupLayout;
    }

    renderBindGroup(textureList, renderPassEncoder, webgpu) {
        const [cursorExternalTexture, maskExternalTexture] = textureList;
        if (cursorExternalTexture && maskExternalTexture) {
            const bindGroup = webgpu.device.createBindGroup({
                layout: this.getBindGroupLayout(webgpu),
                entries: [
                    { binding: 0, resource: webgpu.sampler },
                    { binding: 1, resource: cursorExternalTexture },
                    { binding: 2, resource: { buffer: webgpu.mousePositionBuffer } },
                    { binding: 3, resource: { buffer: webgpu.constants } },
                    { binding: 4, resource: maskExternalTexture }
                ]
            });

            renderPassEncoder.setPipeline(this.getPipeline(webgpu));
            renderPassEncoder.setBindGroup(0, bindGroup);
            renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
            renderPassEncoder.draw(4, 1, 0, 0);
        }

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