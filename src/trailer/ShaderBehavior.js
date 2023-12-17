// Base class for shader behaviors
// handles getting the most-recent video textures from the various video players
// as well as rendering them
class ShaderBehavior {
  constructor(videoPlayers) {
    this.videoPlayers = videoPlayers;
    this._pipeline = null; // Cache for the pipeline
    this._bindGroupLayout = null; // Cache for the bind group layout
  }

  getPipeline(webgpu) {
    throw new Error("getPipeline method not implemented");
  }

  getBindGroupLayout(webgpu) {
    throw new Error("getBindGroupLayout method not implemented");
  }

  getVideoTextures(device) {
    throw new Error("getVideoTextures method not implemented");
  }

  renderBindGroup(textureList, renderPassEncoder, webgpu) {
    throw new Error("renderBindGroup method not implemented");
  }
}


// Default shader behavior implementation
// will render one video texture to the screen
class DefaultShaderBehavior extends ShaderBehavior {
  // pipeline only needs to be created once
  getPipeline(webgpu) {
    if (!this._pipeline) {
      // Create and return the default pipeline configuration
      const vertexModule = webgpu.device.createShaderModule({ code: webgpu.vertexShader });
      const fragmentModule = webgpu.device.createShaderModule({ code: webgpu.fragmentShader });

      this._pipeline = webgpu.device.createRenderPipeline({
        layout: webgpu.device.createPipelineLayout({ bindGroupLayouts: [webgpu.bindGroupLayout, webgpu.vertexBGL] }),
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
    // bind group layout only needs to be created once
    if (!this._bindGroupLayout) {
      // Create and return the default bind group layout
      this._bindGroupLayout = webgpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
          { binding: 2, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        ]
      });
    }
    return this._bindGroupLayout;
  }

  getVideoTextures(device) {
    // Retrieve the texture from the first video player
    if (this.videoPlayers.length > 0 && this.videoPlayers[0]) {
      const currentVideo = this.videoPlayers[0].getCurrentFrame(device);
      return currentVideo ? [currentVideo] : [null];
    }
    return [null];
  }

  renderBindGroup(textureList, renderPassEncoder, webgpu) {
    // Render the main video
    const mainExternalTexture = textureList[0];
    const bindGroup = webgpu.device.createBindGroup({
      layout: webgpu.bindGroupLayout, // Assuming this is the correct layout
      entries: [
        { binding: 0, resource: webgpu.sampler },
        { binding: 1, resource: mainExternalTexture },
        { binding: 2, resource: { buffer: webgpu.constants } },
      ]
    });

    renderPassEncoder.setPipeline(this._pipeline);
    renderPassEncoder.setBindGroup(0, bindGroup);
    renderPassEncoder.setBindGroup(1, webgpu.vertexBindGroup);
    renderPassEncoder.draw(4, 1, 0, 0);
  }
}

export { ShaderBehavior, DefaultShaderBehavior };