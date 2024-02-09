
const cursorHitboxShaderCode = /*wgsl*/`
struct MouseUniform {
    mousePosition: vec2<f32>
};

struct Constants {
    screenWidth: i32,
    screenHeight: i32,
    cursorWidth: f32,
    cursorHeight: f32,
    cursorActive: f32,
    activeRadius: f32
};

// Define the structure for output data
// struct Data {
//     pixelInfo: vec4<u32>
// };
// @binding(0) @group(0) var<storage, write> hitboxOutput: array<Data>;
@binding(0) @group(0) var<storage, read_write> hitboxOutput: vec4<f32>;
@binding(1) @group(0) var mySampler: sampler;
@binding(2) @group(0) var<uniform> mousePosition: MouseUniform;
@binding(3) @group(0) var<uniform> constants: Constants;
@binding(4) @group(0) var hitboxTexture: texture_external; //texture_2d<f32>;
 
@compute @workgroup_size(8,8, 1)
fn main(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let halfCursorWidth = constants.cursorWidth / f32(constants.screenWidth) / 2.0;
    let halfCursorHeight = constants.cursorHeight / f32(constants.screenHeight) / 2.0;
    let thresholdDistance = constants.activeRadius;

    let startX = max(mousePosition.mousePosition.x - thresholdDistance, 0.0);
    let endX = min(mousePosition.mousePosition.x + thresholdDistance, 1.0);
    let startY = max(mousePosition.mousePosition.y - thresholdDistance, 0.0);
    let endY = min(mousePosition.mousePosition.y + thresholdDistance, 1.0);

    var maxPixel = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    for (var x: f32 = startX; x <= endX; x += 1.0 / f32(constants.screenWidth)) {
        for (var y: f32 = startY; y <= endY; y += 1.0 / f32(constants.screenHeight)) {
            let pixelCoord = vec2<i32>(i32(x * f32(constants.screenWidth)), i32(y * f32(constants.screenHeight)));
            // let currentPixel = textureSampleBaseClampToEdge(hitboxTexture, mySampler, pixelCoord);
            // if (length(currentPixel.rgb) > length(maxPixel.rgb)) {
            //     maxPixel = currentPixel;
            // }
        }
    }
    hitboxOutput = maxPixel;
}
`;


class HitboxShaderBehavior extends ShaderBehavior {
  constructor(videoPlayers) {
    super(videoPlayers);
    this.hitboxOutputBuffer = null;
    this.hitboxPipeline = null;
    this.hitboxBindGroup = null;
    this.pipeline = null;
    this.stagingBuffer = null;
    this.hitboxBufferSize = null;
    this.lastVideoFrameTime = {
      main: null,
      cursor: null,
      mask: null,
      hitbox: null
    };
  }

  getPipeline() {
    if (this.hitboxPipeline) {
      return this.hitboxPipeline;
    }
    const computeShaderModule = this.device.createShaderModule({ code: cursorHitboxShaderCode });
    this.hitboxPipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.hitboxBGL] }),
      compute: {
        module: computeShaderModule,
        entryPoint: 'main'
      }
    });
    return this.hitboxPipeline;
  }

  getBindGroupLayout() {
    if (this.hitboxBGL) {
      return this.hitboxBGL;
    }
    this.hitboxBGL = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, sampler: { type: 'filtering' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 4, visibility: GPUShaderStage.COMPUTE, externalTexture: {} },
      ]
    });
    return this.hitboxBGL;
  }

  async scanHitboxPixels(commandEncoder) {
    if (!this.hitboxOutputBuffer) {
      return;
    }
    const computePassEncoder = commandEncoder.beginComputePass();
    computePassEncoder.setPipeline(this.hitboxPipeline);
    computePassEncoder.setBindGroup(0, this.hitboxBindGroup);
    computePassEncoder.dispatchWorkgroups(8, 8, 1);
    computePassEncoder.end();
    commandEncoder.copyBufferToBuffer(
      this.hitboxOutputBuffer,
      0,
      this.stagingBuffer,
      0,
      this.hitboxBufferSize
    );
    this.device.queue.submit([commandEncoder.finish()]);
    await this.stagingBuffer.mapAsync(
      GPUMapMode.READ,
      0,
      this.hitboxBufferSize
    );
    const copyArrayBuffer = this.stagingBuffer.getMappedRange(0, this.hitboxBufferSize / 32);
    const data = copyArrayBuffer.slice();
    this.stagingBuffer.unmap();
    const pixelData = new Float32Array(data);
    console.log(pixelData);
    return pixelData;
    // if (this.videoPlayers[0].currentHitboxList) {
    //   this.currentHighlightedHitbox = this.videoPlayers[0].currentHitboxList.find(hitbox => { if (hitbox.matchPixel(pixelData)) { return hitbox.name; } });
    //   if (this.currentHighlightedHitbox) {
    //     console.log('found hitbox:', pixelData.slice(0, 5), this.currentHighlightedHitbox);
    //   }
    // }
  }

  updateHitboxBindGroup() {
    // only need to create once
    if (this.stagingBuffer) {
      return;
    }
    this.hitboxBufferSize = 32 * 4;
    this.hitboxOutputBuffer = this.device.createBuffer({
      size: this.hitboxBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    let entries = [
      { binding: 0, resource: { buffer: this.hitboxOutputBuffer, type: 'storage' } },
      { binding: 1, resource: this.linearSampler },
      { binding: 2, resource: { buffer: this.mousePositionBuffer } },
      { binding: 3, resource: { buffer: this.cursorConstants } },
    ];
    if (this.videoPlayers[0].activeVideos.hitbox &&
      this.videoPlayers[0].activeVideos.hitbox.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const hitboxVideoExternalTexture = this.device.importExternalTexture({ source: this.videoPlayers[0].activeVideos.hitbox });
      entries.push({ binding: 4, resource: hitboxVideoExternalTexture });
    }
    this.hitboxBindGroup = this.device.createBindGroup({
      layout: this.hitboxBGL,
      entries
    });
    this.stagingBuffer = this.device.createBuffer({
      size: this.hitboxBufferSize,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });
  }
}

export { HitboxShaderBehavior };