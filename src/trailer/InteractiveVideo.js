
/*
interactive video class handles the webgpu rendering of the video:
  - you configure it by passing it webgpu options

*/

class InteractiveVideo {
  constructor(webgpu, videoPlayers, initialShaderBehavior) {
    this.webgpu = webgpu;
    this.videoPlayers = Array.isArray(videoPlayers) ? videoPlayers : [videoPlayers];
    // set up initial shader behavior
    this.shaderBehavior = initialShaderBehavior;
    this.pipeline = this.shaderBehavior.getPipeline(webgpu);
    this.bindGroupLayout = this.shaderBehavior.getBindGroupLayout(webgpu);
  }

  // returns the 'play' promise from html5 video element
  start(path = false) {
    return Promise.all(this.videoPlayers.map(videoPlayer => videoPlayer.start(path)));
  }

  // Render a frame using WebGPU
  renderFrame(renderPassEncoder) {
    const textures = this.shaderBehavior.getVideoTextures(this.webgpu.device);
    if (!textures.every(texture => texture)) {
      // If any texture is not ready, skip rendering this frame
      return;
    }

    // Set the pipeline and bind group layout for the current shader behavior
    this.shaderBehavior.getPipeline(this.webgpu);
    this.shaderBehavior.getBindGroupLayout(this.webgpu);
    console.log('rendering frame');
    this.shaderBehavior.renderBindGroup(textures, renderPassEncoder, this.webgpu);
    // renderPassEncoder.setPipeline(this.pipeline);
    // const bindGroup = this.webgpu.device.createBindGroup({
    //   layout: this.bindGroupLayout,
    //   entries: [
    //     { binding: 0, resource: this.webgpu.sampler },
    //     // ... other bindings based on textures ...
    //   ],
    // });
    // renderPassEncoder.setBindGroup(0, bindGroup);
    // renderPassEncoder.draw(4, 1, 0, 0);
  }
}

export default InteractiveVideo;