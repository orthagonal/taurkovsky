(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/trailer/utilities.js
  function getVideoSrc(videoPath) {
    if (window.__TAURI__) {
      return videoPath[0] === "/" ? `https://stream.localhost${videoPath}` : `https://stream.localhost/${videoPath}`;
    }
    if (videoPath.startsWith("http")) {
      return videoPath;
    }
    console.log("videoPath", videoPath);
    return `http://127.0.0.1:1420/${videoPath}`;
  }
  function extractWebmPathsFromObject(playgraph) {
    return Object.values(playgraph).reduce((acc, val) => {
      if (typeof val === "string" && val.endsWith(".webm")) {
        acc.push(val);
        return acc;
      }
      acc.push(...extractWebmPathsFromObject(val));
      return acc;
    }, []);
  }
  var init_utilities = __esm({
    "src/trailer/utilities.js"() {
    }
  });

  // src/trailer/InteractiveVideo.js
  var InteractiveVideo, InteractiveVideo_default;
  var init_InteractiveVideo = __esm({
    "src/trailer/InteractiveVideo.js"() {
      InteractiveVideo = class {
        constructor(webgpu, videoPlayers, initialShaderBehavior) {
          this.webgpu = webgpu;
          this.videoPlayers = Array.isArray(videoPlayers) ? videoPlayers : [videoPlayers];
          this.shaderBehavior = initialShaderBehavior;
          this.pipeline = this.shaderBehavior.getPipeline(webgpu);
          this.bindGroupLayout = this.shaderBehavior.getBindGroupLayout(webgpu);
        }
        // returns the 'play' promise from html5 video element
        start(path = false) {
          return Promise.all(this.videoPlayers.map((videoPlayer) => videoPlayer.start(path)));
        }
        // Render a frame using WebGPU
        renderFrame(renderPassEncoder) {
          const textures = this.shaderBehavior.getVideoTextures(this.webgpu.device);
          if (!textures.every((texture) => texture)) {
            return;
          }
          this.shaderBehavior.getPipeline(this.webgpu);
          this.shaderBehavior.getBindGroupLayout(this.webgpu);
          this.shaderBehavior.renderBindGroup(textures, renderPassEncoder, this.webgpu);
          if (this.shaderBehavior.updateHitboxBindGroup) {
            this.shaderBehavior.updateHitboxBindGroup(renderPassEncoder);
          }
        }
        getHitbox(renderPassEncoder) {
          this.shaderBehavior.scanHitboxPixels(renderPassEncoder);
        }
        setShaderBehavior(shaderBehavior) {
          this.shaderBehavior = shaderBehavior;
        }
      };
      InteractiveVideo_default = InteractiveVideo;
    }
  });

  // src/trailer/VideoPlayer.js
  var VideoPlayer, VideoPlayer_default;
  var init_VideoPlayer = __esm({
    "src/trailer/VideoPlayer.js"() {
      init_utilities();
      VideoPlayer = class {
        constructor(videoPaths, getNextVideo, label = false) {
          this.label = label || videoPaths[0];
          this.currentVideo = null;
          this.nextVideo = null;
          this.getNextVideo = getNextVideo;
          this.videoElements = {};
          videoPaths.forEach((path) => {
            this.createVideoElement(path);
          });
        }
        createVideoElement(path, isDoubleBuffered = false) {
          const videoElement = document.createElement("video");
          videoElement.preload = "auto";
          videoElement.key = path.split("/").pop();
          videoElement.src = getVideoSrc(path);
          videoElement.load();
          videoElement.style.pointerEvents = "none";
          videoElement.crossOrigin = "anonymous";
          videoElement.addEventListener("error", (e) => {
            console.log(`VideoPlayer: Error loading video at ${path}, ${videoElement.src}`);
          });
          videoElement.onended = this.switchVideo.bind(this);
          this.videoElements[path] = videoElement;
        }
        // Start playing the video, should only need to call this once 
        // when first start playing this video player
        start(path) {
          if (path) {
            this.currentVideo = this.videoElements[path];
          } else {
            this.currentVideo = this.videoElements[Object.keys(this.videoElements)[0]];
          }
          if (!this.currentVideo) {
            alert("VideoPlayer: no video element found for " + path);
          }
          this.nextVideo = this.lookupVideo(path);
          window.debug && console.log(`VideoPlayer ${this.label}: starting ${path}`);
          return this.currentVideo.play();
        }
        // Get the video element for a given path
        lookupVideo(path) {
          return this.videoElements[path] || alert("VideoPlayer: no video element found for " + path);
        }
        async switchVideo() {
          this.currentVideo = this.nextVideo;
          await this.currentVideo.play();
          this.nextVideo = this.lookupVideo(this.getNextVideo(this.currentVideo));
          this.nextVideo.currentTime = 0;
        }
        // Get the current frame for rendering
        getCurrentFrame(device2) {
          if (this.currentVideo?.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            return device2.importExternalTexture({ source: this.currentVideo });
          }
          return false;
        }
      };
      VideoPlayer_default = VideoPlayer;
    }
  });

  // src/trailer/ShaderBehavior.js
  var ShaderBehavior_exports = {};
  __export(ShaderBehavior_exports, {
    DefaultShaderBehavior: () => DefaultShaderBehavior,
    ShaderBehavior: () => ShaderBehavior
  });
  var ShaderBehavior, vertexShaderCode, fragmentShaderCode, DefaultShaderBehavior;
  var init_ShaderBehavior = __esm({
    "src/trailer/ShaderBehavior.js"() {
      ShaderBehavior = class {
        constructor(videoPlayers) {
          this.videoPlayers = videoPlayers;
          this._pipeline = null;
          this._bindGroupLayout = null;
          this._vertexBindGroup = null;
        }
        getPipeline(webgpu) {
          throw new Error("getPipeline method not implemented");
        }
        getBindGroupLayout(webgpu) {
          throw new Error("getBindGroupLayout method not implemented");
        }
        getVideoTextures(device2) {
          throw new Error("getVideoTextures method not implemented");
        }
        renderBindGroup(textureList, renderPassEncoder, webgpu) {
          throw new Error("renderBindGroup method not implemented");
        }
      };
      vertexShaderCode = /* wgsl */
      `
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
`;
      fragmentShaderCode = /* wgsl */
      `
  @group(0) @binding(0) var mySampler: sampler;
  @group(0) @binding(1) var myTexture: texture_external;

  @fragment
  fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
      return textureSampleBaseClampToEdge(myTexture, mySampler, fragUV);
  }
`;
      DefaultShaderBehavior = class extends ShaderBehavior {
        // pipeline only needs to be created once
        getPipeline(webgpu) {
          if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode });
            const fragmentModule = webgpu.device.createShaderModule({ code: fragmentShaderCode });
            const vertexBGL = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
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
                entryPoint: "main"
              },
              fragment: {
                module: fragmentModule,
                entryPoint: "main",
                targets: [{
                  format: "rgba8unorm",
                  blend: {
                    alpha: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    },
                    color: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    }
                  }
                }]
              },
              primitive: {
                topology: "triangle-strip",
                cullMode: "none"
              }
            });
          }
          return this._pipeline;
        }
        getBindGroupLayout(webgpu) {
          if (!this._bindGroupLayout) {
            this._bindGroupLayout = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
              ]
            });
          }
          return this._bindGroupLayout;
        }
        getVideoTextures(device2) {
          if (this.videoPlayers.length > 0 && this.videoPlayers[0]) {
            const currentVideo = this.videoPlayers[0].getCurrentFrame(device2);
            return currentVideo ? [currentVideo] : [null];
          }
          return [null];
        }
        renderBindGroup(textureList, renderPassEncoder, webgpu) {
          const mainExternalTexture = textureList[0];
          const bindGroup = webgpu.device.createBindGroup({
            layout: this.getBindGroupLayout(webgpu),
            // Assuming this is the correct layout
            entries: [
              { binding: 0, resource: webgpu.sampler },
              { binding: 1, resource: mainExternalTexture },
              { binding: 2, resource: { buffer: webgpu.constants } }
            ]
          });
          renderPassEncoder.setPipeline(this._pipeline);
          renderPassEncoder.setBindGroup(0, bindGroup);
          renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
          renderPassEncoder.draw(4, 1, 0, 0);
        }
      };
    }
  });

  // src/trailer/DistortionShaderBehavior.js
  var DefaultShaderBehavior2, distortionVertexShaderCode, distortionFragmentShaderCode, DistortionShaderBehavior;
  var init_DistortionShaderBehavior = __esm({
    "src/trailer/DistortionShaderBehavior.js"() {
      ({ DefaultShaderBehavior: DefaultShaderBehavior2 } = (init_ShaderBehavior(), __toCommonJS(ShaderBehavior_exports)));
      distortionVertexShaderCode = /* wgsl */
      `
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
`;
      distortionFragmentShaderCode = /* wgsl */
      `
  @group(0) @binding(0) var mySampler: sampler;
  @group(0) @binding(1) var myTexture: texture_external;

  @fragment
  fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
      return textureSampleBaseClampToEdge(myTexture, mySampler, fragUV);
  }
`;
      DistortionShaderBehavior = class extends DefaultShaderBehavior2 {
        constructor(videoPlayers) {
          super(videoPlayers);
          this.defaultAnchors = new Float32Array([
            // Default anchor points values (x, y) pairs, each is padded with 2 empty points because of alignment issues
            // Top-left, 
            -1,
            1,
            0,
            0,
            // top-right, 
            1,
            1,
            0,
            0,
            // bottom-right, 
            1,
            -1,
            0,
            0,
            // bottom-left, 
            -1,
            -1,
            0,
            0,
            // top-center, 
            0,
            1,
            0,
            0,
            // right-center, 
            1,
            0,
            0,
            0,
            // bottom-center, 
            0,
            -1,
            0,
            0,
            // left-center
            -1,
            0,
            0,
            0
          ]);
          this.anchorBuffer = null;
        }
        getPipeline(webgpu) {
          if (!this._pipeline) {
            this.updateAnchorBuffer(webgpu);
            const vertexModule = webgpu.device.createShaderModule({ code: distortionVertexShaderCode });
            const fragmentModule = webgpu.device.createShaderModule({ code: distortionFragmentShaderCode });
            const vertexBGL = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
                { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
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
                entryPoint: "main"
              },
              fragment: {
                module: fragmentModule,
                entryPoint: "main",
                targets: [{
                  format: "rgba8unorm",
                  blend: {
                    alpha: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    },
                    color: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    }
                  }
                }]
              },
              primitive: {
                topology: "triangle-strip",
                cullMode: "none"
              }
            });
          }
          return this._pipeline;
        }
        updateAnchorBuffer(webgpu, anchors = this.defaultAnchors) {
          if (!this.anchorBuffer || this.anchorBuffer.size < anchors.byteLength) {
            this.anchorBuffer = webgpu.device.createBuffer({
              size: anchors.byteLength,
              usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });
          }
          webgpu.device.queue.writeBuffer(this.anchorBuffer, 0, anchors.buffer, anchors.byteOffset, anchors.byteLength);
        }
        getBindGroupLayout(webgpu) {
          if (!this._bindGroupLayout) {
            this._bindGroupLayout = webgpu.device.createBindGroupLayout({
              entries: [
                // Entry for the sampler used in the fragment shader
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
                // Entry for the external texture used in the fragment shader
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                // Entry for the uniform buffer used in both vertex and fragment shaders
                { binding: 2, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
              ]
            });
          }
          return this._bindGroupLayout;
        }
        renderBindGroup(textureList, renderPassEncoder, webgpu, anchors) {
          this.updateAnchorBuffer(webgpu, anchors);
          const mainExternalTexture = textureList[0];
          const bindGroup = webgpu.device.createBindGroup({
            layout: this.getBindGroupLayout(webgpu),
            // Assuming this is the correct layout
            entries: [
              { binding: 0, resource: webgpu.sampler },
              { binding: 1, resource: mainExternalTexture },
              { binding: 2, resource: { buffer: webgpu.constants } }
            ]
          });
          renderPassEncoder.setPipeline(this._pipeline);
          renderPassEncoder.setBindGroup(0, bindGroup);
          renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
          renderPassEncoder.draw(4, 1, 0, 0);
        }
      };
    }
  });

  // src/trailer/game1/SpellCursorBehaviors.js
  var vertexShaderCode2, maskShaderCode, noMaskShaderCode, CursorNoMaskShaderBehavior, CursorMaskShaderBehavior;
  var init_SpellCursorBehaviors = __esm({
    "src/trailer/game1/SpellCursorBehaviors.js"() {
      init_ShaderBehavior();
      vertexShaderCode2 = /* wgsl */
      `
    struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
        @location(0) fragUV : vec2<f32>,
    }

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

        var output : VertexOutput;
        output.Position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
        output.fragUV = uv[vertexIndex];
        return output;
    }
`;
      maskShaderCode = /* wgsl */
      `
    struct MouseUniform {
        mousePosition: vec2<f32>
    };

    struct CursorUniform {
        useMask: u32
    };

    struct Constants {
        screenWidth: f32,
        screenHeight: f32,
        cursorWidth: f32,
        cursorHeight: f32,
        cursorActive: f32,
        activeRadius: f32
    };

    @group(0) @binding(0) var mySampler: sampler;
    @group(0) @binding(1) var smallTexture: texture_external;
    @group(0) @binding(2) var<uniform> mousePosition: MouseUniform;
    @group(0) @binding(3) var<uniform> constants: Constants;
    @group(0) @binding(4) var maskTexture: texture_external;

    @fragment
    fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
        let halfCursorWidth = constants.cursorWidth / constants.screenWidth / 2.0;
        let halfCursorHeight = constants.cursorHeight / constants.screenHeight / 2.0;
        let leftBoundary = mousePosition.mousePosition.x -halfCursorWidth;
        let rightBoundary = mousePosition.mousePosition.x + halfCursorWidth;
        let bottomBoundary = mousePosition.mousePosition.y - halfCursorHeight;
        let topBoundary = mousePosition.mousePosition.y + halfCursorHeight;

        let isWithinCursor = fragUV.x > leftBoundary && fragUV.x < rightBoundary && 
                            fragUV.y > bottomBoundary && fragUV.y < topBoundary;

        if (isWithinCursor) {
            let uCoord = (fragUV.x - leftBoundary) / (2.0 * halfCursorWidth);
            let vCoord = (fragUV.y - bottomBoundary) / (2.0 * halfCursorHeight);
            let adjustedUV = vec2<f32>(uCoord, vCoord);

            // Sample color from smallTexture and maskTexture
            let colorFromSmallTexture = textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
            let colorFromMaskTexture = textureSampleBaseClampToEdge(maskTexture, mySampler, fragUV);
            // If the alpha value of the pixel in smallTexture is less than 1.0, use the pixel from hitboxTexture
            if (colorFromSmallTexture.a < 1.0) {
                // if the hitbox color is black ignore it:
                if (colorFromMaskTexture.r == 0.0 && colorFromMaskTexture.g == 0.0 && colorFromMaskTexture.b == 0.0) {
                    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
                }
                // if it's close to the center show it
                var cursorCenter = vec2<f32>(mousePosition.mousePosition.x * 2.0, mousePosition.mousePosition.y);
                var adjustedFragUV = vec2<f32>(fragUV.x * 2.0 , fragUV.y );
                var distanceFromCenter = distance(adjustedFragUV, cursorCenter);
                var thresholdDistance = 0.05;
                if (distanceFromCenter <= thresholdDistance) {
                    var bias = 0.9; // Adjust as needed to bias more or less in favor of smallTexture
                    var alpha = clamp(colorFromSmallTexture.a + bias, 0.0, 1.0); // Clamp to ensure it's between 0 and 1
                    var beta = 1.0 - alpha; // Inverse alpha value for blending
                    // alpha 1 = only colorFromSmallTexture, alpha = 0, only colorFromMaskTexture 
                    var blendedColor = alpha * colorFromSmallTexture + beta * colorFromMaskTexture;
                    return blendedColor;
                }
            }
            return colorFromSmallTexture;
        }
        return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
`;
      noMaskShaderCode = /* wgsl */
      `
    struct MouseUniform {
    mousePosition: vec2<f32>
    };

    struct CursorUniform {
    useMask: u32
    };

    struct Constants {
    screenWidth: f32,
    screenHeight: f32,
    cursorWidth: f32,
    cursorHeight: f32,
    cursorActive: f32,
    activeRadius: f32
    };

    @group(0) @binding(0) var mySampler: sampler;
    @group(0) @binding(1) var smallTexture: texture_external;
    @group(0) @binding(2) var<uniform> mousePosition: MouseUniform;
    @group(0) @binding(3) var<uniform> constants: Constants;

    @fragment
    fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
    let halfCursorWidth = constants.cursorWidth / constants.screenWidth / 2.0;
    let halfCursorHeight = constants.cursorHeight / constants.screenHeight / 2.0;
    let leftBoundary = mousePosition.mousePosition.x - halfCursorWidth;
    let rightBoundary = mousePosition.mousePosition.x + halfCursorWidth;
    let bottomBoundary = mousePosition.mousePosition.y - halfCursorHeight;
    let topBoundary = mousePosition.mousePosition.y + halfCursorHeight;

    let isWithinCursor = fragUV.x > leftBoundary && fragUV.x < rightBoundary && 
                        fragUV.y > bottomBoundary && fragUV.y < topBoundary;

    if (isWithinCursor) {
        let uCoord = (fragUV.x - leftBoundary) / (2.0 * halfCursorWidth);
        let vCoord = (fragUV.y - bottomBoundary) / (2.0 * halfCursorHeight);
        let adjustedUV = vec2<f32>(uCoord, vCoord);

        let colorFromSmallTexture = textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
        if (colorFromSmallTexture.a < 1.0) {
            // if it's close to the center show itl
            var cursorCenter = vec2<f32>(mousePosition.mousePosition.x * 2.0, mousePosition.mousePosition.y);
            var adjustedFragUV = vec2<f32>(fragUV.x * 2.0 , fragUV.y );
            var distanceFromCenter = distance(adjustedFragUV, cursorCenter);
            var thresholdDistance = 0.05;
            if (distanceFromCenter <= thresholdDistance) {
                var bias = 0.9; // Adjust as needed to bias more or less in favor of smallTexture
                var alpha = clamp(colorFromSmallTexture.a + bias, 0.0, 1.0); // Clamp to ensure it's between 0 and 1
                var beta = 1.0 - alpha; // Inverse alpha value for blending
                // alpha 1 = only colorFromSmallTexture, alpha = 0, only colorFromMaskTexture 
                var blendedColor = alpha * colorFromSmallTexture;
                return blendedColor;
            }
        }
        return textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
    }

    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
`;
      CursorNoMaskShaderBehavior = class extends ShaderBehavior {
        constructor(videoPlayers) {
          super(videoPlayers);
          this._pipeline = null;
          this._vertexBindGroup = null;
          this._bindGroupLayout = null;
        }
        getPipeline(webgpu) {
          if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode2 });
            const fragmentModule = webgpu.device.createShaderModule({ code: noMaskShaderCode });
            const vertexBGL = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
              ]
            });
            this._vertexBindGroup = webgpu.device.createBindGroup({
              layout: vertexBGL,
              entries: [
                { binding: 0, resource: { buffer: webgpu.vertexConstants } }
              ]
            });
            this._pipeline = webgpu.device.createRenderPipeline({
              layout: webgpu.device.createPipelineLayout({
                bindGroupLayouts: [this.getBindGroupLayout(webgpu), vertexBGL]
              }),
              vertex: {
                module: vertexModule,
                entryPoint: "main"
              },
              fragment: {
                module: fragmentModule,
                entryPoint: "main",
                targets: [{
                  format: "rgba8unorm",
                  blend: {
                    alpha: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    },
                    color: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    }
                  }
                }]
              },
              primitive: {
                topology: "triangle-strip",
                cullMode: "none"
              }
            });
          }
          return this._pipeline;
        }
        getBindGroupLayout(webgpu) {
          if (!this._bindGroupLayout) {
            this._bindGroupLayout = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
                { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } }
              ]
            });
          }
          return this._bindGroupLayout;
        }
        renderBindGroup(textureList, renderPassEncoder, webgpu) {
          const [cursorExternalTexture] = textureList;
          const bindGroup = webgpu.device.createBindGroup({
            layout: this.getBindGroupLayout(webgpu),
            entries: [
              { binding: 0, resource: webgpu.sampler },
              { binding: 1, resource: cursorExternalTexture },
              { binding: 2, resource: { buffer: webgpu.mousePositionBuffer } },
              { binding: 3, resource: { buffer: webgpu.constants } }
            ]
          });
          renderPassEncoder.setPipeline(this.getPipeline(webgpu));
          renderPassEncoder.setBindGroup(0, bindGroup);
          renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
          renderPassEncoder.draw(4, 1, 0, 0);
        }
        getVideoTextures(device2) {
          if (this.videoPlayers.length > 0) {
            const mainVideoTexture = this.videoPlayers[0].getCurrentFrame(device2);
            return mainVideoTexture ? [mainVideoTexture] : [null];
          }
          return [null];
        }
      };
      CursorMaskShaderBehavior = class extends ShaderBehavior {
        constructor(videoPlayers) {
          super(videoPlayers);
          this._pipeline = null;
          this._bindGroupLayout = null;
          this._vertexBindGroup = null;
        }
        getPipeline(webgpu) {
          if (!this._pipeline) {
            const vertexModule = webgpu.device.createShaderModule({ code: vertexShaderCode2 });
            const fragmentModule = webgpu.device.createShaderModule({ code: maskShaderCode });
            const vertexBGL = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
              ]
            });
            this._vertexBindGroup = webgpu.device.createBindGroup({
              layout: vertexBGL,
              entries: [
                { binding: 0, resource: { buffer: webgpu.vertexConstants } }
              ]
            });
            this._pipeline = webgpu.device.createRenderPipeline({
              layout: webgpu.device.createPipelineLayout({
                bindGroupLayouts: [this.getBindGroupLayout(webgpu), vertexBGL]
              }),
              vertex: {
                module: vertexModule,
                entryPoint: "main"
              },
              fragment: {
                module: fragmentModule,
                entryPoint: "main",
                targets: [{
                  format: "rgba8unorm",
                  blend: {
                    alpha: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    },
                    color: {
                      operation: "add",
                      srcFactor: "src-alpha",
                      dstFactor: "one-minus-src-alpha"
                    }
                  }
                }]
              },
              primitive: {
                topology: "triangle-strip",
                cullMode: "none"
              }
            });
          }
          return this._pipeline;
        }
        getBindGroupLayout(webgpu) {
          if (!this._bindGroupLayout) {
            this._bindGroupLayout = webgpu.device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
                { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
                { binding: 4, visibility: GPUShaderStage.FRAGMENT, externalTexture: {} }
              ]
            });
          }
          return this._bindGroupLayout;
        }
        renderBindGroup(textureList, renderPassEncoder, webgpu) {
          const [cursorExternalTexture, maskExternalTexture] = textureList;
          if (cursorExternalTexture && maskExternalTexture) {
            const bindGroup = webgpu.device.createBindGroup({
              layout: this.getBindGroupLayout(webgpu),
              entries: [
                { binding: 0, resource: webgpu.sampler },
                { binding: 1, resource: cursorExternalTexture },
                { binding: 2, resource: { buffer: webgpu.mousePositionBuffer } },
                { binding: 3, resource: { buffer: webgpu.constants } },
                { binding: 4, resource: maskExternalTexture }
              ]
            });
            renderPassEncoder.setPipeline(this.getPipeline(webgpu));
            renderPassEncoder.setBindGroup(0, bindGroup);
            renderPassEncoder.setBindGroup(1, this._vertexBindGroup);
            renderPassEncoder.draw(4, 1, 0, 0);
          }
        }
        getVideoTextures(device2) {
          if (this.videoPlayers.length >= 2) {
            const mainVideoTexture = this.videoPlayers[0].getCurrentFrame(device2);
            const maskVideoTexture = this.videoPlayers[1].getCurrentFrame(device2);
            if (mainVideoTexture && maskVideoTexture) {
              return [mainVideoTexture, maskVideoTexture];
            }
          }
          return [null, null];
        }
      };
    }
  });

  // src/trailer/game1/SpellCursor.js
  function extractWebmPathsFromVocabulary(cursorVocabulary) {
    let webmPaths = /* @__PURE__ */ new Set();
    for (const wordFragments of Object.values(cursorVocabulary)) {
      for (const fragment of Object.values(wordFragments)) {
        webmPaths.add(fragment.entry);
        webmPaths.add(fragment.idle);
      }
    }
    return Array.from(webmPaths);
  }
  var SpellCursor, SpellCursor_default;
  var init_SpellCursor = __esm({
    "src/trailer/game1/SpellCursor.js"() {
      init_SpellCursorBehaviors();
      init_InteractiveVideo();
      init_VideoPlayer();
      SpellCursor = class {
        constructor(cursorVocabulary, cursorVideoPlan, webgpuOptions, eventHandlers) {
          this.cursorVocabulary = cursorVocabulary;
          this.maskVideoList = cursorVocabulary._masks;
          delete this.cursorVocabulary._masks;
          const videoList = extractWebmPathsFromVocabulary(cursorVocabulary);
          videoList.push("/main/blank.webm");
          console.log("cursor starting with videoList", videoList);
          this.cursorVideoPlayer = new VideoPlayer_default(videoList, cursorVideoPlan.main.bind(this), "cursorMain");
          console.log("mask video list", this.maskVideoList);
          this.maskVideoPlayer = new VideoPlayer_default(this.maskVideoList, cursorVideoPlan.mask.bind(this), "cursorMask");
          this.currentBehavior = new CursorNoMaskShaderBehavior([this.cursorVideoPlayer]);
          this.interactiveVideo = new InteractiveVideo_default(webgpuOptions, [this.cursorVideoPlayer], this.currentBehavior);
          this.eventHandlers = eventHandlers;
          for (const [event, handler] of Object.entries(eventHandlers)) {
            console.log("registering", event, handler);
            const boundHandler = handler.bind(this);
            window.addEventListener(event, boundHandler);
          }
          this.cursorState = "blank";
        }
        findVocabularyWord(fragment) {
          for (const [word, fragments] of Object.entries(this.cursorVocabulary)) {
            if (fragments.hasOwnProperty(fragment)) {
              return word;
            }
          }
          if (fragment === "blank") {
            return "blank";
          }
          return null;
        }
        getMaskVideoPath(videoPath) {
          videoPath = new URL(videoPath).pathname.replace(".webm", "_mask.webm");
          console.log("vid path is ", videoPath);
          return videoPath;
        }
        async switchToMaskCursor() {
          const oneTimeHandler = async () => {
            console.log("cursor video ended, starting mask video");
            const currentVideoPath = this.cursorVideoPlayer.currentVideo.src;
            if (!currentVideoPath.includes("/main/blank.webm")) {
              this.cursorVideoPlayer.currentVideo.removeEventListener("ended", oneTimeHandler);
              console.log("current video path", currentVideoPath);
              const maskVideoPath = this.getMaskVideoPath(currentVideoPath);
              console.log("mask video path", maskVideoPath);
              await this.maskVideoPlayer.start(maskVideoPath);
              this.currentBehavior = new CursorMaskShaderBehavior([this.cursorVideoPlayer, this.maskVideoPlayer]);
              this.interactiveVideo.setShaderBehavior(this.currentBehavior);
            }
          };
          this.cursorVideoPlayer.currentVideo.addEventListener("ended", oneTimeHandler);
        }
        switchToNoMaskCursor() {
          this.currentBehavior = new CursorNoMaskShaderBehavior([this.cursorVideoPlayer]);
          this.interactiveVideo.setShaderBehavior(this.currentBehavior);
        }
        async start(path) {
          await this.cursorVideoPlayer.start(path);
        }
        renderFrame(renderPassEncoder) {
          this.interactiveVideo.renderFrame(renderPassEncoder);
        }
      };
      SpellCursor_default = SpellCursor;
    }
  });

  // src/trailer/game1/intro_playgraphs.js
  var intro_playgraphs_default;
  var init_intro_playgraphs = __esm({
    "src/trailer/game1/intro_playgraphs.js"() {
      intro_playgraphs_default = {
        intro_a: {
          "32": {
            "graph": [
              "/main/32_to_28-graph.webm",
              "main/32_to_30-graph.webm"
            ],
            "sink": {
              "se-sink.mov": "main/32_to_se-sink.webm"
            }
          },
          "30": {
            "graph": [
              "main/30_to_32-graph.webm",
              "main/30_to_28-graph.webm"
            ],
            "sink": {}
          },
          "28": {
            "graph": [
              "main/28_to_30-graph.webm",
              "main/28_to_32-graph.webm"
            ],
            "sink": {}
          }
        },
        s: {
          "60": {
            "graph": [
              "game1/clips/60_to_62-graph.webm",
              "game1/clips/60_to_61-graph.webm",
              "game1/clips/60_to_64-graph.webm"
            ],
            "sink": {}
          },
          "61": {
            "graph": [
              "game1/clips/61_to_60-graph.webm",
              "game1/clips/61_to_64-graph.webm"
            ],
            "sink": {}
          },
          "62": {
            "graph": [
              "game1/clips/62_to_60-graph.webm",
              "game1/clips/62_to_64-graph.webm"
            ],
            "sink": {}
          },
          "64": {
            "graph": [
              "game1/clips/64_to_60-graph.webm",
              "game1/clips/64_to_62-graph.webm"
            ],
            "sink": {}
          }
        },
        se: {
          "108": {
            "graph": [
              "108_to_110-graph.webm",
              "108_to_106-graph.webm"
            ],
            "sink": {}
          },
          "110": {
            "graph": [
              "110_to_108-graph.webm",
              "110_to_106-graph.webm"
            ],
            "sink": {}
          },
          "106": {
            "graph": [
              "106_to_110-graph.webm",
              "106_to_108-graph.webm"
            ],
            "sink": {}
          },
          "64": {
            "graph": [],
            "sink": {
              "106-sink": "64_to_106-sink.webm"
            }
          }
        }
      };
    }
  });

  // src/trailer/game1/module.js
  var require_module = __commonJS({
    "src/trailer/game1/module.js"(exports, module) {
      init_utilities();
      init_InteractiveVideo();
      init_VideoPlayer();
      init_ShaderBehavior();
      init_SpellCursor();
      init_DistortionShaderBehavior();
      init_intro_playgraphs();
      var webmPaths = extractWebmPathsFromObject(intro_playgraphs_default);
      moduleState = {
        // the current 'scene' and playgraph we are in 
        scene: "intro",
        // current state of the module, correspondds to a clique or highly-connected sub-graph in the playgraph
        state: "s"
      };
      var userInputQueue = [""];
      var userString = "";
      var canvas2;
      var isLetterAnimating = false;
      var textFlashAnimationDuration = 100;
      var previousString = "";
      var wordCompleted = false;
      var mouseXNormalized;
      var mouseYNormalized;
      var cursorVariables2 = false;
      var device2;
      var mousePositionBuffer2;
      var mainBehavior;
      var maxAnchors = new Float32Array([
        // Default anchor points values (x, y) pairs
        // Top-left, 
        1,
        1,
        0,
        0,
        // top-right, 
        1,
        1,
        0,
        0,
        // bottom-right, 
        1,
        -1,
        0,
        0,
        // bottom-left, 
        -1,
        -1,
        0,
        0,
        // top-center, 
        0,
        1,
        0,
        0,
        // right-center, 
        1,
        0,
        0,
        0,
        // bottom-center, 
        0,
        -1,
        0,
        0,
        // left-center
        -1,
        0,
        0,
        0
      ]);
      var minAnchors = new Float32Array([
        // Default anchor points values (x, y) pairs
        // Top-left, 
        -1,
        1,
        0,
        0,
        // top-right, 
        1,
        1,
        0,
        0,
        // bottom-right, 
        1,
        -1,
        0,
        0,
        // bottom-left, 
        -1,
        -1,
        0,
        0,
        // top-center, 
        0,
        1,
        0,
        0,
        // right-center, 
        1,
        0,
        0,
        0,
        // bottom-center, 
        0,
        -1,
        0,
        0,
        // left-center
        -1,
        0,
        0,
        0
      ]);
      function updateTextAndCursor() {
        return new Promise((resolve, reject) => {
          const textContainer = document.getElementById("textContainer");
          const latestLetterContainer = document.getElementById("latestLetterContainer");
          textContainer.style.left = `${mouseXNormalized * 100}%`;
          textContainer.style.top = `${20 + mouseYNormalized * 100}%`;
          if (!cursorVariables2.cursorActive) {
            if (userString !== previousString) {
              const lastChar = userString.charAt(userString.length - 1);
              latestLetterContainer.textContent = lastChar;
              latestLetterContainer.style.left = `${mouseXNormalized * 100}%`;
              latestLetterContainer.style.top = `${mouseYNormalized * 100}%`;
              latestLetterContainer.classList.add("blur-animation");
              setTimeout(() => {
                latestLetterContainer.classList.remove("blur-animation");
              }, 500);
              setTimeout(() => {
                latestLetterContainer.textContent = "";
              }, 1e3);
              previousString = userString;
            }
            textContainer.textContent = userString;
            textContainer.style.color = "white";
            if (wordCompleted) {
              textContainer.classList.add("flash-animation");
              setTimeout(() => {
                textContainer.classList.remove("flash-animation");
              }, 500);
              wordCompleted = false;
            }
          } else {
            userString = "";
            textContainer.textContent = "";
            latestLetterContainer.textContent = "";
          }
          resolve();
        });
      }
      function getNextCursorMaskVideo(currentVideo, playgraph, userInput2) {
        const nextUserInput = userInputQueue.shift() || "";
        if (this.cursorState !== "blank") {
          return "main/stretch2_3l_idle_mask.webm";
        }
        return "main/blank.webm";
      }
      function getNextCursorVideo(currentVideo, playgraph, userInput2) {
        const nextUserInput = userInputQueue.shift() || "";
        if (this.cursorState === "blank" && nextUserInput === "") {
          return "main/blank.webm";
        }
        const vocabularyWord = this.findVocabularyWord(this.cursorState);
        const vocabulary = this.cursorVocabulary[vocabularyWord];
        let nextFragment = vocabulary[this.cursorState];
        if (!nextFragment) {
          alert("error no next fragment for ", this.cursorState);
          return "main/blank.webm";
        }
        const nextState = nextUserInput !== "" ? nextUserInput : this.cursorState;
        if (nextState === this.cursorState) {
          return nextFragment.idle;
        }
        if (nextState !== this.cursorState) {
          if (nextState === "l") {
            this.switchToMaskCursor();
          }
          this.cursorState = nextState;
          return vocabulary[nextFragment.next].entry;
        }
        return "main/blank.webm";
      }
      var defaultCursorEventHandlers = {
        mousemove: async function(event) {
          const rect = canvas2.getBoundingClientRect();
          const xCanvasRelative = event.clientX - rect.left;
          const yCanvasRelative = event.clientY - rect.top;
          mouseXNormalized = xCanvasRelative / canvas2.width;
          mouseYNormalized = yCanvasRelative / canvas2.height;
          const mousePositionArray = new Float32Array([mouseXNormalized, mouseYNormalized]);
          device2.queue.writeBuffer(
            mousePositionBuffer2,
            0,
            mousePositionArray.buffer
          );
          if (this.cursorState === "open") {
            if (currentHighlightedHitbox?.name == "handle") {
              this.cursorState = "open_hover";
              userInputQueue = ["open_hover"];
              return;
            }
          }
          if (this.cursorState === "open_hover") {
            if (!currentHighlightedHitbox) {
              this.cursorState = "open_hover_exit";
            }
          }
          if (this.cursorState === "look") {
            if (currentHighlightedHitbox?.name == "handle") {
              userInputQueue = ["look_at_handle_enter"];
              return;
            }
          }
          if (this.cursorState === "look_at_handle_idle") {
            this.cursorState = "look_at_handle_exit";
            userInputQueue = ["look"];
            return;
          }
        },
        click: async function(event) {
          if (window.mainState === "intro" && this.cursorState === "look") {
            window.userInput = "side";
            return;
          }
          if (window.mainState === "side" && this.cursorState.includes("open_hover")) {
            window.userInput = "opened_lantern";
            return;
          }
        },
        keydown: (event) => {
        }
      };
      async function start(window2, gpuDefinitions, renderLoop2) {
        const { context: context3, linearSampler: linearSampler2, hitboxBGL: hitboxBGL2, cursorConstants: cursorConstants2, vertexConstantsBuffer: vertexConstantsBuffer2 } = gpuDefinitions;
        cursorVariables2 = gpuDefinitions.cursorVariables;
        mousePositionBuffer2 = gpuDefinitions.mousePositionBuffer;
        device2 = gpuDefinitions.device;
        canvas2 = gpuDefinitions.canvas;
        const videoPlayer = new VideoPlayer_default(webmPaths, mainNextVideoStrategy, false);
        mainBehavior = new DistortionShaderBehavior([videoPlayer]);
        window2.mainInteractiveVideo = new InteractiveVideo_default(gpuDefinitions, videoPlayer, mainBehavior);
        const cursorVocabulary = {
          "_masks": [
            "main/stretch2_3l_idle_mask.webm",
            "main/stretch1_3look_idle_mask.webm"
          ],
          "blank": {
            "blank": { entry: "main/blank.webm", idle: "main/blank.webm", next: "blank" }
          },
          "open": {
            "o": { entry: "main/o2.webm", idle: "main/o2_idle.webm", next: "op" },
            "op": { entry: "main/op4.webm", idle: "main/op_idle.webm", next: "ope" },
            "ope": { entry: "main/ope4.webm", idle: "main/ope5_idle.webm", next: "open" },
            "open": { entry: "main/open_4.webm", idle: "main/open_idle.webm", next: "open" }
          },
          "look": {
            "l": { entry: "main/3l.webm", idle: "main/stretch2_3l_idle.webm", next: "lo" },
            "lo": { entry: "main/3lo.webm", idle: "main/stretch_3lo_idle.webm", next: "loo" },
            "loo": { entry: "main/3loo.webm", idle: "main/3loo_idle.webm", next: "look" },
            "look": { entry: "main/3look.webm", idle: "main/stretch1_3look_idle.webm", next: "look" }
          }
        };
        const cursorPlan = {
          main: getNextCursorVideo,
          mask: getNextCursorMaskVideo
        };
        window2.spellCursor = new SpellCursor_default(cursorVocabulary, cursorPlan, gpuDefinitions, defaultCursorEventHandlers);
        window2.spellCursor.currentNodeIndex = 0;
        renderLoop2();
        await new Promise((r) => setTimeout(r, 200));
        await window2.mainInteractiveVideo.start(intro_playgraphs_default.s["60"].graph[0]);
        await window2.spellCursor.start("main/blank.webm");
      }
      function getNextPlaygraphNode(playgraph, letter, sink = false) {
        var layers = playgraph[letter];
        if (!layers || layers.graph.length === 0) {
          return null;
        }
        if (sink && Object.keys(layers.sink).length > 0) {
          var sinkKeys = Object.keys(layers.sink);
          var sinkKey = sinkKeys[Math.floor(Math.random() * sinkKeys.length)];
          return layers.sink[sinkKey];
        }
        return layers.graph[Math.floor(Math.random() * layers.graph.length)];
      }
      var time = 0;
      function distortAnchors(distortionAmount, currentAnchors) {
        const indices = [[0, 1], [14, 15]];
        for (let i = 0; i < indices.length; i++) {
          const adjustAmountX = Math.sin(time) * distortionAmount;
          const adjustAmountY = Math.cos(time) * distortionAmount;
          currentAnchors[indices[i][0]] += adjustAmountX;
          currentAnchors[indices[i][1]] += adjustAmountY;
        }
        mainBehavior.updateAnchorBuffer(window.mainInteractiveVideo.webgpu, currentAnchors);
        time += 0.01;
      }
      var started = false;
      function mainNextVideoStrategy(currentVideo) {
        if (!started) {
          started = true;
          console.log("starting", intro_playgraphs_default.s["60"].graph[0]);
          return intro_playgraphs_default.s["60"].graph[0];
        }
        const lastLetter = currentVideo.key.split("_to_")[1].split("-")[0];
        distortAnchors(0.011, mainBehavior.defaultAnchors, maxAnchors, minAnchors);
        const destination = getNextPlaygraphNode(intro_playgraphs_default.s, lastLetter);
        return destination;
      }
      var handleEvent = (window2, eventName, event) => {
        if (!window2.spellCursor)
          return;
        if (isLetterAnimating)
          return;
        if (window2.spellCursor.cursorState === "look_at_handle_idle") {
          userInputQueue = ["look_at_handle_exit"];
          return;
        }
        if (event.key === "ArrowRight") {
          alert("You hit the right arrow key");
        } else if (event.key === "Backspace" || event.key === "Escape") {
          window2.spellCursor.cursorState = "blank";
          userString = "";
          userInputQueue = [];
        } else if (/^[a-zA-Z]$/.test(event.key)) {
          userString += event.key.toLowerCase();
          userInputQueue.push(userString);
          isLetterAnimating = true;
          setTimeout(() => {
            isLetterAnimating = false;
          }, textFlashAnimationDuration + 500);
        }
      };
      module.exports = {
        start,
        mainNextVideoStrategy,
        handleEvent,
        updateTextAndCursor
      };
    }
  });

  // src/trailer/src.js
  init_utilities();
  init_InteractiveVideo();
  init_VideoPlayer();
  init_ShaderBehavior();
  init_DistortionShaderBehavior();
  init_SpellCursor();
  var currentGame = require_module();
  window.debug = true;
  var lastFrameTime = Date.now();
  var frameCount = 0;
  var shudderAmount = 2e-6;
  var rippleStrength = 2e-3;
  var rippleFrequency = 5;
  var cursorVariables = {
    screenWidth: 1920,
    screenHeight: 1080,
    cursorWidth: 512,
    cursorHeight: 288,
    cursorActive: 0,
    activeRadius: 0
  };
  var CURSOR_MODES = {
    SMALL: "small",
    LARGE: "large"
  };
  var currentCursorMode = CURSOR_MODES.LARGE;
  function setCursorSize(mode) {
    switch (mode) {
      case CURSOR_MODES.LARGE:
        cursorWidth = 1024;
        cursorHeight = 576;
        break;
      case CURSOR_MODES.SMALL:
      default:
        cursorWidth = 512;
        cursorHeight = 288;
        break;
    }
    device.queue.writeBuffer(
      cursorConstants,
      0,
      new Float32Array([cursorVariables.screenWidth, cursorVariables.screenHeight, cursorVariables.cursorWidth, cursorVariables.cursorHeight, cursorVariables.cursorActive, cursorVariables.activeRadius]).buffer
    );
  }
  var overlayCanvas;
  var overlayContext;
  var adapter;
  var device;
  var canvas;
  var context;
  var mousePositionBuffer;
  var cursorConstants;
  var linearSampler = null;
  var hitboxBGL;
  var renderLoopCount = 0;
  var startTime = performance.now();
  function updateFPS() {
    const now = Date.now();
    const deltaTime = now - lastFrameTime;
    frameCount++;
    if (deltaTime >= 1e3) {
      const fps = frameCount;
      frameCount = 0;
      lastFrameTime = now;
      document.getElementById("fpsCounter").innerText = "FPS: " + fps;
    }
  }
  async function initWebGPU() {
    adapter = await navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();
    canvas = document.getElementById("webgpuCanvas");
    let dpr = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context = canvas.getContext("webgpu", { alpha: true });
    mousePositionBuffer = device.createBuffer({
      size: 8,
      // 2 float32 values: x and y
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    vertexConstantsBuffer = device.createBuffer({
      size: 6 * 4,
      // 6 constants of 4 bytes (float) each, includes things that control ripple, shudder etc
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(
      vertexConstantsBuffer,
      0,
      new Float32Array([
        shudderAmount,
        rippleStrength,
        rippleFrequency,
        0
      ]).buffer
    );
    cursorConstants = device.createBuffer({
      size: 6 * 4,
      // 6 constants of 4 bytes (float) each, includes things like mousepos, turbulence level and activation, etc
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(
      cursorConstants,
      0,
      new Float32Array([cursorVariables.screenWidth, cursorVariables.screenHeight, cursorVariables.cursorWidth, cursorVariables.cursorHeight, cursorVariables.cursorActive, cursorVariables.activeRadius]).buffer
    );
    linearSampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear"
    });
    setCursorSize(CURSOR_MODES.LARGE);
  }
  async function renderFrame() {
    let mouseX = 0;
    let mouseY = 0;
    const swapChainFormat = "rgba8unorm";
    context.configure({
      device,
      format: swapChainFormat
    });
    const currentTexture = context.getCurrentTexture();
    const renderPassDescriptor = {
      colorAttachments: [{
        view: currentTexture.createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store",
        loadValue: "clear"
      }]
    };
    const commandEncoder = device.createCommandEncoder();
    const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    if (!window.mainInteractiveVideo.blocked) {
      window.mainInteractiveVideo.renderFrame(renderPassEncoder);
      if (window.spellCursor) {
        window.spellCursor.renderFrame(renderPassEncoder);
      }
      if (window.hitboxShader) {
        window.hitboxShader.renderFrame(renderPassEncoder);
      }
    }
    renderPassEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
  }
  async function renderLoop() {
    renderLoopCount++;
    updateFPS();
    currentGame.updateTextAndCursor();
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1e3;
    device.queue.writeBuffer(
      vertexConstantsBuffer,
      0,
      new Float32Array([
        shudderAmount,
        rippleStrength,
        rippleFrequency,
        elapsedTime
      ]).buffer
    );
    await renderFrame();
    requestAnimationFrame(renderLoop);
  }
  async function playOnInteraction() {
    document.removeEventListener("click", playOnInteraction);
    const gpuDefinitions = {
      cursorVariables,
      device,
      canvas,
      context,
      sampler: linearSampler,
      hitboxBGL,
      constants: cursorConstants,
      vertexConstants: vertexConstantsBuffer,
      mousePositionBuffer
    };
    currentGame.start(window, gpuDefinitions, renderLoop);
  }
  window.onload = async function() {
    overlayCanvas = document.getElementById("overlayCanvas");
    window.addEventListener("resize", function() {
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
    });
    overlayContext = overlayCanvas.getContext("2d");
    await initWebGPU();
    window.addEventListener("keyup", (event) => {
      currentGame.handleEvent(window, "keyup", event);
    });
    document.addEventListener("click", playOnInteraction);
  };
})();
