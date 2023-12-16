
/*
interactive video class handles the webgpu rendering of the video:
  - you configure it by passing it webgpu options and a video player
*/

class InteractiveVideo {
  constructor(webgpu, videoPlayers, renderBindGroup) {
    this.webgpu = webgpu;
    this.videoPlayers = Array.isArray(videoPlayers) ? videoPlayers : [videoPlayers];
    this.renderBindGroup = renderBindGroup.bind(this);
    this.activeBindGroup = null;

    // Create pipeline
    const vertexModule = this.webgpu.device.createShaderModule({ code: this.webgpu.vertexShader });
    const fragmentModule = this.webgpu.device.createShaderModule({ code: this.webgpu.fragmentShader });
    this.pipeline = webgpu.device.createRenderPipeline({
      layout: webgpu.device.createPipelineLayout({ bindGroupLayouts: [webgpu.bindGroupLayout, webgpu.vertexBGL] }),
      vertex: { module: vertexModule, entryPoint: "main" },
      fragment: {
        module: fragmentModule, entryPoint: "main", targets: [{
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
      primitive: { topology: "triangle-strip", cullMode: "none" },
    });
  }

  // returns the 'play' promise from html5 video element
  start(path = false) {
    return Promise.all(this.videoPlayers.map(videoPlayer => videoPlayer.start(path)));
  }

  // Render a frame using WebGPU
  renderFrame(renderPassEncoder) {
    let textures = [];

    // Attempt to get a texture from each video player
    for (let videoPlayer of this.videoPlayers) {
      let texture = videoPlayer.getCurrentFrame(this.webgpu.device);
      if (!texture) {
        // If any texture is not available, do not render this frame
        return;
      }
      textures.push(texture);
    }

    // If all textures are available, call the custom renderBindGroup function
    if (textures.length === this.videoPlayers.length) {
      this.renderBindGroup(textures, renderPassEncoder);
    }
  }
}

export default InteractiveVideo;