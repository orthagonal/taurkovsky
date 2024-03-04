










import { ShaderBehavior } from './ShaderBehavior.js';

const vertexShaderCode = /* wgsl */`

struct VertexConstants {
  // Shudder effect: you can add random displacement based on time
  shudderAmount: f32,
  // Ripple effect: you can add sine wave based on position and time
  rippleStrength: f32,
  rippleFrequency: f32,
  time: f32
}

struct TextureInfo {
  positionAndScale: vec4<f32>, // x,y and x,y scale of each texture
};


struct VertexInput {
  @location(0) position: vec2<f32>, // Normalized coordinates (-1 to 1) of the vertex
  @location(1) vertexIndex: u32
};

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragUV : vec2<f32>,
  @location(1) @interpolate(flat) textureIndex: u32
};

@group(1) @binding(0) var<uniform> vertexConstants: VertexConstants;
@group(1) @binding(1) var<uniform> textureInfo: array<TextureInfo, 4>;

@vertex
fn main(input: VertexInput) -> VertexOutput {
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

  // Calculate transformed position
  let vertexIndex = input.vertexIndex;
  let textureDataPosition = textureInfo[vertexIndex].positionAndScale.xy;
  let textureDataScale = textureInfo[vertexIndex].positionAndScale.zw;
  let ossetPos = input.position * textureDataScale;
  let screenPos = vec2<f32>(textureDataPosition.x + ossetPos.x, textureDataPosition.y + ossetPos.y);

  var randomDisplacement = vec2<f32>(
    vertexConstants.shudderAmount * (sin(vertexConstants.time * 25.0) - 0.5), 
    vertexConstants.shudderAmount * (cos(vertexConstants.time * 30.0) - 0.5)
  );

  var rippleDisplacement = vertexConstants.rippleStrength * sin(vertexConstants.rippleFrequency * pos[vertexIndex].y + vertexConstants.time);

  pos[vertexIndex].x += rippleDisplacement + randomDisplacement.x;
  pos[vertexIndex].y += randomDisplacement.y;
       
  var output : VertexOutput;
  output.Position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  // output.Position = vec4<f32>(screenPos + vec2<f32>(rippleDisplacement, randomDisplacement), 0.0, 1.0);

  // Pass through texture coordinates and index for the fragment shader
  output.fragUV = (input.position + vec2<f32>(1.0, 1.0)) / 2.0; // Normalized to 0-1  
  output.textureIndex = input.vertexIndex;
  return output;
};
`;

const fragmentShaderCode = /* wgsl */`

@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var texture1: texture_external; // First texture
@group(0) @binding(2) var texture2: texture_external; // Second texture
@group(0) @binding(3) var texture3: texture_external; // Third texture
@group(0) @binding(4) var texture4: texture_external; // Fourth texture
// @group(0) @binding(5) var texture5: texture_external; // Fifth texture
// @group(0) @binding(6) var texture6: texture_external; // Sixth texture
// @group(0) @binding(7) var texture7: texture_external; // Seventh texture
// @group(0) @binding(8) var texture8: texture_external; // Eighth texture

@fragment
fn main(@location(0) fragUV : vec2<f32>, @location(1) @interpolate(flat) textureIndex: u32) -> @location(0) vec4<f32> {
  // Simple selection logic (replace with your own if needed)
  if (textureIndex == 0u) {
    return textureSampleBaseClampToEdge(texture1, mySampler, fragUV);
  } else if (textureIndex == 1u) {
    return textureSampleBaseClampToEdge(texture2, mySampler, fragUV);
  } else if (textureIndex == 2u) {
    return textureSampleBaseClampToEdge(texture3, mySampler, fragUV);
  } else {
    return textureSampleBaseClampToEdge(texture4, mySampler, fragUV);
  } //else if (textureIndex == 4u) {
  //   return textureSampleBaseClampToEdge(texture5, mySampler, fragUV);
  // } else if (textureIndex == 5u) {
  //   return textureSampleBaseClampToEdge(texture6, mySampler, fragUV);
  // } else if (textureIndex == 6u) {
  //   return textureSampleBaseClampToEdge(texture7, mySampler, fragUV);
  // } else {
  //   return textureSampleBaseClampToEdge(texture8, mySampler, fragUV);
  // }
}
`;


class MultiTextureShaderBehavior extends ShaderBehavior {
  constructor(videoPlayers, texturePositions) {
    super(videoPlayers);
    this.texturePositions = texturePositions;
  }

  getPipeline(webgpu) {
    if (!this._pipeline) {
      // Create your shaders
      const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode });
      const fragmentModule = webgpu.device.createShaderModule({ code: fragmentShaderCode });

      // Create bind group layouts (adjust if you have different bindings)
      // const textureInfoBGL = webgpu.device.createBindGroupLayout({
      //   entries: [
      //     {
      //       binding: 1,
      //       visibility: GPUShaderStage.VERTEX,
      //       buffer: {
      //         type: 'uniform',
      //         hasDynamicOffset: false, // Set to true if you plan to use dynamic offsets
      //         minBindingSize: (4 * Float32Array.BYTES_PER_ELEMENT) * 4 // Size of one TextureInfo struct times the number of textures
      //       }
      //     }
      //   ]
      // });

      const vertexBGL = webgpu.device.createBindGroupLayout({
        entries: [
          {
            // Binding for VertexConstants
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
              type: 'uniform',
              hasDynamicOffset: false,
              minBindingSize: 4 * Float32Array.BYTES_PER_ELEMENT
            }
          },
          {
            // Binding for array of TextureInfo
            binding: 1,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
              type: 'uniform',
              hasDynamicOffset: false,
              minBindingSize: 4 * Float32Array.BYTES_PER_ELEMENT * 4  // 4 elements with 4 floats each 
            }
          }
        ]
      });

      const minBufferSize = 64; // Minimum buffer size required by WebGPU for uniform buffers
      const actualDataSize = 4 * Float32Array.BYTES_PER_ELEMENT * 4; // Size of your actual data
      const bufferSize = Math.max(minBufferSize, actualDataSize); // Ensure the buffer is at least the minimum required size

      const textureInfoData = new Float32Array(this.texturePositions);
      webgpu.textureInfoBuffer = webgpu.device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
      });

      // Initialize your buffer with actual data, followed by padding if necessary
      const bufferArray = new Float32Array(webgpu.textureInfoBuffer.getMappedRange());
      // Set your actual data
      bufferArray.set(textureInfoData);
      // The rest of the buffer will be padding, which you don't need to explicitly set since the buffer is zero-initialized
      webgpu.textureInfoBuffer.unmap();

      this._vertexBindGroup = webgpu.device.createBindGroup({
        layout: vertexBGL,
        entries: [
          { binding: 0, resource: { buffer: webgpu.vertexConstants } },
          {
            binding: 1,
            resource: { buffer: webgpu.textureInfoBuffer }
          }
        ]
      });

      // Create the pipeline
      this._pipeline = webgpu.device.createRenderPipeline({
        layout: webgpu.device.createPipelineLayout({
          bindGroupLayouts: [this.getBindGroupLayout(webgpu), vertexBGL]
        }),
        vertex: {
          module: vertexModule,
          entryPoint: 'main',
          buffers: [
            {
              arrayStride: 16,
              attributes: [
                {
                  // Attribute for `position`
                  shaderLocation: 0,
                  offset: 0,
                  format: 'float32x2',
                },
                {
                  // Attribute for `vertexIndex`
                  shaderLocation: 1,
                  offset: 32,
                  format: 'uint32',
                },
              ],
            },
            // You might have more buffers for other data
          ]
        },
        fragment: {
          module: fragmentModule,
          entryPoint: 'main',
          targets: [{
            format: 'rgba8unorm', // Adjust if needed
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
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 1
          { binding: 2, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 2
          { binding: 3, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 3
          { binding: 4, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 4
          // { binding: 5, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 5
          // { binding: 6, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 6
          // { binding: 7, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 7
          // { binding: 8, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }, // Texture 8
        ]
      });
    }
    return this._bindGroupLayout;
  }

  getVideoTextures(device, videoIndex) {
    // Retrieve the texture from the first video player
    if (this.videoPlayers?.[videoIndex]) {
      const currentVideo = this.videoPlayers[videoIndex].getCurrentFrame(device);
      return currentVideo ? [currentVideo] : [null];
    }
    return [null];
  }

  renderBindGroup(textureList, renderPassEncoder, webgpu) {
    const textureInfoBuffer = webgpu.device.createBuffer({
      size: this.texturePositions.length * 8 * Float32Array.BYTES_PER_ELEMENT, // Size based on your data
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    webgpu.device.queue.writeBuffer(textureInfoBuffer, 0, new Float32Array(this.texturePositions));

    const bindGroup = webgpu.device.createBindGroup({
      layout: this.getBindGroupLayout(webgpu),
      entries: [
        { binding: 0, resource: webgpu.sampler },
        { binding: 1, resource: textureList[0] },
        { binding: 2, resource: textureList[1] },
        { binding: 3, resource: textureList[2] },
        { binding: 4, resource: textureList[3] },
        // { binding: 5, resource: textureList[4] },
        // { binding: 6, resource: textureList[5] },
        // { binding: 7, resource: textureList[6] },
        // { binding: 8, resource: textureList[7] },
        { binding: 5, resource: { buffer: webgpu.constants } },
      ]
    });

    renderPassEncoder.setPipeline(this.getPipeline(webgpu));
    renderPassEncoder.setBindGroup(0, bindGroup);
    console.log('....');
    console.log('....');
    console.log('....');
    console.log('....');
    console.log(this._vertexBindGroup);
    renderPassEncoder.setBindGroup(1, this._vertexBindGroup);

    // Assuming you render a quad per texture
    for (let i = 0; i < this.texturePositions.length; i++) {
      this.renderQuad(renderPassEncoder, i);  // Implement renderQuad
    }
  }

  renderQuad(renderPassEncoder, textureIndex) {
    // Sample values for vertices - adjust to your desired quad size/position
    const vertices = [
      // Top-left
      -1.0, 1.0, 0.0, textureIndex,
      // Bottom-left
      -1.0, -1.0, 0.0, textureIndex,
      // Bottom-right
      1.0, -1.0, 1.0, textureIndex,
      // Top-right
      1.0, 1.0, 1.0, textureIndex
    ];

    // Upload vertex data to a buffer
    const vertexBuffer = webgpu.device.createBuffer({
      size: vertices.length * 4 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    webgpu.device.queue.writeBuffer(vertexBuffer, 0, new Float32Array(vertices));

    // Set vertex buffer
    renderPassEncoder.setVertexBuffer(0, vertexBuffer);

    // Draw the quad 
    renderPassEncoder.draw(4, 1, 0, 0);
  }
}

export { MultiTextureShaderBehavior };