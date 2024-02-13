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
  points: array<vec4<f32>, 8>, // position of each anchor point
  weights: vec4<f32> // weight of each anchor point
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

    // calculate combined influences from all anchor points with weighting
    var totalWeight = 0.0;
    var influenceWeightedPosition = vec2<f32>(0.0, 0.0);  // Reset before accumulating 
    
    for (var i = 0; i < 8; i++) {
        let dist = distance(pos[vertexIndex], anchors.points[i].xy);
        var influence = 1.0 - dist; 
        influence = 0.55 + influence * 0.05; // Maps an '1.0' influence to '1.0', a '0.0' influence to '0.95' 
        totalWeight += anchors.weights.x;//i].x; // Accumulate total weight 
        influenceWeightedPosition += anchors.points[i].xy * influence * anchors.weights.x;//[i].x;
    }

    // Calculate final position using weights of influencing anchors 
    influenceWeightedPosition /= totalWeight; 
    pos[vertexIndex] = mix(pos[vertexIndex], influenceWeightedPosition, 0.5);  // Adjust mix factor as desired 

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
    this.currentAnchors = new Float32Array([
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
    this.anchorWeights = new Float32Array(8).fill(1.0); // Start with equal weights
    this.targetWeights = null; // Stores weights that the tween targets 
    this.tweenDuration = 1.0; // Seconds for tween
    this.tweenStartTime = 0.0;
    this.tweening = false;
  }

  resetWeights() {
    this.anchorWeights.fill(1.0);
    this.tweening = false;
  }

  setAnchorWeights(newWeights) {
    if (newWeights.length !== 8) {
      console.warn("setAnchorWeights requires an array of length 8.");
      return;
    }
    this.targetWeights = newWeights.slice(); //  Create a copy to tween to 
    this.tweenStartTime = performance.now();
    this.tweening = true;
  }


  // Call this in your main render loop 
  updateTween(webgpu, time) {
    if (this.tweening) {
      const elapsed = (time - this.tweenStartTime) / 1000.0;
      let progress = elapsed / this.tweenDuration;

      if (progress >= 1.0) {
        this.tweening = false;
        this.anchorWeights = this.targetWeights.slice();
        this.targetWeights = null;
      } else {
        for (let i = 0; i < 8; i++) {
          this.anchorWeights[i] = this.anchorWeights[i] * (1 - progress) + this.targetWeights[i] * progress; // Linear lerp
        }
      }
      // update buffers if needed
      this.updateAnchorBuffer(webgpu);
    }
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

  updateAnchorBuffer(webgpu, anchors = this.currentAnchors) {
    const anchorsAndWeights = new Float32Array([...anchors, ...this.anchorWeights]); 
    if (!this.anchorBuffer || this.anchorBuffer.size < anchorsAndWeights.byteLength) {
      this.anchorBuffer = webgpu.device.createBuffer({
          size: anchorsAndWeights.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
    }
    webgpu.device.queue.writeBuffer(this.anchorBuffer, 0, anchorsAndWeights.buffer, anchorsAndWeights.byteOffset, anchorsAndWeights.byteLength);
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