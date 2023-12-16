
/*
interactive video class handles the webgpu rendering of the video:
  - you configure it by passing it webgpu options and a video player
*/

class InteractiveVideo {
  constructor(webgpu, videoPlayer) {
    this.webgpu = webgpu;
    this.videoPlayer = videoPlayer;
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
    // Start the video player
    return this.videoPlayer.start(false);
  }

  // Render a frame using WebGPU
  renderFrame(renderPassEncoder) {
    const externalTexture = this.videoPlayer.getCurrentFrame(this.webgpu.device);
    if (externalTexture) {
      this.activeBindGroup = this.webgpu.device.createBindGroup({
        layout: this.webgpu.bindGroupLayout,
        entries: [
          { binding: 0, resource: this.webgpu.sampler },
          { binding: 1, resource: externalTexture },
          { binding: 2, resource: { buffer: this.webgpu.constants } },
        ],
      });
      renderPassEncoder.setPipeline(this.pipeline);
      renderPassEncoder.setBindGroup(0, this.activeBindGroup);
      renderPassEncoder.setBindGroup(1, this.webgpu.vertexBindGroup);
      renderPassEncoder.draw(4, 1, 0, 0);
    }
  }
}

export default InteractiveVideo;