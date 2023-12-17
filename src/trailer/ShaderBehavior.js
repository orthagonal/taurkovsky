// Base class for shader behaviors
// getsthe most-recent video texture(s) from the video player(s)
// used by your shader and draws the shader
// you can override this class to implement your own shader behavior
// and there is a default behavior that simply renders one video texture to the screen
class ShaderBehavior {
  constructor(videoPlayers) {
    this.videoPlayers = videoPlayers;
    this._pipeline = null; // Cache for the pipeline
    this._bindGroupLayout = null; // Cache for the fragment shader's bind group layout
    this._vertexBindGroup = null; // Cache for the vertex shader's bind group
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
// with some basic effects

const vertexShaderCode = /* wgsl */`
struct VertexConstants {
    // Shudder effect: you can add random displacement based on time
    shudderAmount: f32,
    // Ripple effect: you can add sine wave based on position and time
    rippleStrength: f32,
    rippleFrequency: f32,
    time: f32
}

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
}

@group(1) @binding(0) var<uniform> vertexConstants: VertexConstants;

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

    var randomDisplacement = vec2<f32>(
        vertexConstants.shudderAmount * (sin(vertexConstants.time * 25.0) - 0.5), 
        vertexConstants.shudderAmount * (cos(vertexConstants.time * 30.0) - 0.5)
    );

    var rippleDisplacement = vertexConstants.rippleStrength * sin(vertexConstants.rippleFrequency * pos[vertexIndex].y + vertexConstants.time);

    pos[vertexIndex].x += rippleDisplacement + randomDisplacement.x;
    pos[vertexIndex].y += randomDisplacement.y;

    var output : VertexOutput;
    output.Position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.fragUV = uv[vertexIndex];
    return output;
}
`

const fragmentShaderCode = /* wgsl */`
  @group(0) @binding(0) var mySampler: sampler;
  @group(0) @binding(1) var myTexture: texture_external;

  @fragment
  fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
      return textureSampleBaseClampToEdge(myTexture, mySampler, fragUV);
  }
`;

/*
These are the webgpu options you can pass to defaultShader: {
  device: GPUDevice,
  sampler: GPUTextureSampler,
  constants: Float32Array, (this will contain the time, shudderAmount, rippleStrength, rippleFrequency)
 }
*/

class DefaultShaderBehavior extends ShaderBehavior {
  // pipeline only needs to be created once
  getPipeline(webgpu) {
    if (!this._pipeline) {
      // Create and return the default pipeline configuration
      // use the two shaders defined above:
      const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode });
      const fragmentModule = webgpu.device.createShaderModule({ code: fragmentShaderCode });

      const vertexBGL = webgpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
        ]
      });

      this._vertexBindGroup = webgpu.device.createBindGroup({
        layout: vertexBGL,
        entries: [
          { binding: 0, resource: { buffer: webgpu.vertexConstants } }
        ]
      });

      this._pipeline = webgpu.device.createRenderPipeline({
        layout: webgpu.device.createPipelineLayout({ bindGroupLayouts: [this.getBindGroupLayout(webgpu), vertexBGL] }),
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
      layout: this.getBindGroupLayout(webgpu), // Assuming this is the correct layout
      entries: [
        { binding: 0, resource: webgpu.sampler },
        { binding: 1, resource: mainExternalTexture },
        { binding: 2, resource: { buffer: webgpu.constants } },
      ]
    });
    renderPassEncoder.setPipeline(this._pipeline);
    renderPassEncoder.setBindGroup(0, bindGroup);
    renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
    renderPassEncoder.draw(4, 1, 0, 0);
  }
}

export { ShaderBehavior, DefaultShaderBehavior };