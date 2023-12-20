
/*
  Interactive video class handles one or more VideoPlayers and 
  the webgpu rendering for them, using the shader behavior that is applied to them.

  You can change it's shader behavior at any time by calling setShaderBehavior
  to switch to a different shader behavior.  
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
    this.shaderBehavior.renderBindGroup(textures, renderPassEncoder, this.webgpu);
  }

  setShaderBehavior(shaderBehavior) {
    this.shaderBehavior = shaderBehavior;
  }
}

export default InteractiveVideo;