/*
  allows you to distort the video using anchors
*/
const { DefaultShaderBehavior } = require('./ShaderBehavior.js');

const distortionVertexShaderCode = /* wgsl */`
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

struct AnchorPoints {
  points: array<vec4<f32>, 8>
}

@group(1) @binding(0) var<uniform> vertexConstants: VertexConstants;
@group(1) @binding(1) var<uniform> anchors: AnchorPoints;

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

    var nearestDistance = distance(pos[vertexIndex], anchors.points[0].xy);
    var nearestAnchor = anchors.points[0].xy;

    // Find the nearest anchor point
    for (var i = 0; i < 8; i++) {
        let dist = distance(pos[vertexIndex], anchors.points[i].xy);
        if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestAnchor = anchors.points[i].xy;
        }
    }
    // calculate the influence that anchor point has on the vertex
    let influence = 1.0 - nearestDistance; // This is a basic influence calculation
    pos[vertexIndex] = mix(pos[vertexIndex], nearestAnchor, influence);


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

const distortionFragmentShaderCode = /* wgsl */`
  @group(0) @binding(0) var mySampler: sampler;
  @group(0) @binding(1) var myTexture: texture_external;

  @fragment
  fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
      return textureSampleBaseClampToEdge(myTexture, mySampler, fragUV);
  }
`;

class DistortionShaderBehavior extends DefaultShaderBehavior {
  constructor(videoPlayers) {
    super(videoPlayers);
    this.defaultAnchors = new Float32Array([
      // Default anchor points values (x, y) pairs, each is padded with 2 empty points because of alignment issues
      // Top-left, 
      -1.0, 1.0, 0.0, 0.0,
      // top-right, 
      1.0, 1.0, 0.0, 0.0,
      // bottom-right, 
      1.0, -1.0, 0.0, 0.0,
      // bottom-left, 
      -1.0, -1.0, 0.0, 0.0,
      // top-center, 
      0.0, 1.0, 0.0, 0.0,
      // right-center, 
      1.0, 0.0, 0.0, 0.0,
      // bottom-center, 
      0.0, -1.0, 0.0, 0.0,
      // left-center
      -1.0, 0.0, 0.0, 0.0
    ]);
    this.anchorBuffer = null;
  }

  getPipeline(webgpu) {
    if (!this._pipeline) {
      this.updateAnchorBuffer(webgpu);
      // Create and return the default pipeline configuration
      // use the two shaders defined above:
      const vertexModule = webgpu.device.createShaderModule({ code: distortionVertexShaderCode });
      const fragmentModule = webgpu.device.createShaderModule({ code: distortionFragmentShaderCode });

      const vertexBGL = webgpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
        ]
      });

      this._vertexBindGroup = webgpu.device.createBindGroup({
        layout: vertexBGL,
        entries: [
          { binding: 0, resource: { buffer: webgpu.vertexConstants } },
          { binding: 1, resource: { buffer: this.anchorBuffer } }
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

  updateAnchorBuffer(webgpu, anchors = this.defaultAnchors) {
    if (!this.anchorBuffer || this.anchorBuffer.size < anchors.byteLength) {
      this.anchorBuffer = webgpu.device.createBuffer({
        size: anchors.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
    }
    webgpu.device.queue.writeBuffer(this.anchorBuffer, 0, anchors.buffer, anchors.byteOffset, anchors.byteLength);
  }

  getBindGroupLayout(webgpu) {
    if (!this._bindGroupLayout) {
      this._bindGroupLayout = webgpu.device.createBindGroupLayout({
        entries: [
          // Entry for the sampler used in the fragment shader
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
          // Entry for the external texture used in the fragment shader
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
          // Entry for the uniform buffer used in both vertex and fragment shaders
          { binding: 2, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        ],
      });
    }
    return this._bindGroupLayout;
  }

  renderBindGroup(textureList, renderPassEncoder, webgpu, anchors) {
    this.updateAnchorBuffer(webgpu, anchors);
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
};

export { DistortionShaderBehavior }