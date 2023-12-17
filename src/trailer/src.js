let lastFrameTime = Date.now();
let frameCount = 0;

function updateFPS() {
    const now = Date.now();
    const deltaTime = now - lastFrameTime;
    frameCount++;

    // Update FPS every second
    if (deltaTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;

        // Update the FPS counter on the page
        document.getElementById('fpsCounter').innerText = 'FPS: ' + fps;
    }
}

const startTime = performance.now();

const cursorVertexShaderCode = /* wgsl */`

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


const cursorFragmentShaderCode = /* wgsl */`
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
                    return vec4<f32>(0.0, 1.0, 0.0, 1.0);
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
    return vec4<f32>(0.0, 0.0, 1.0, 1.0);
}
`;

const cursorFragmentShaderCodeNoMask = /* wgsl */`
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

  return vec4<f32>(0.0, 0.0, 1.0, 1.0);
}
`;

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

import InteractiveVideo from './InteractiveVideo.js';
import VideoPlayer from './VideoPlayer.js';
import { DefaultShaderBehavior } from './ShaderBehavior.js';
import { CursorMaskShaderBehavior, CursorNoMaskShaderBehavior } from './SpellCursorBehaviors.js';
// global variables
const screenWidth = 1920.0;
const screenHeight = 1080.0;
let cursorWidth = 512.0;
let cursorHeight = 288.0;
const CURSOR_MODES = {
    SMALL: "small",
    LARGE: "large"
};
let currentCursorMode = CURSOR_MODES.LARGE;

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
        constantsBuffer,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );
}

// current user input state stuff:
let userInputQueue = [""];
let currentHighlightedHitbox = null;
// the string that we show to the user on screen
// not sure why these are on window object
window.userString = "";
window.userInput = 'intro';
// window.mainState = 'intro';
window.mainState = 'side';
window.cursorState = 'blank';

let userKeyboardElement;
let overlayCanvas, overlayContext;

// WebGPU Variables
let hitboxOutputBuffer; // the gpu writes the hitbox data to this buffer
let adapter, device, canvas, context;
let mousePositionBuffer, constantsBuffer;
let hitboxPipeline;  // Pipeline for rendering the video
let hitboxBindGroup;
let linearSampler = null;
let fragmentShaderModules = {};
let mainBGL, hitboxBGL;

let currentHitboxList = false;
let cursorActive = 0.0;  // 1.0 when cursor is 'active' and can interact with things

const textFlashAnimationDuration = 100;  // 500ms or 0.5 seconds
let previousString = "";
let wordCompleted = false;

function setCursorActive(newValue) {
    cursorActive = newValue;
    device.queue.writeBuffer(
        constantsBuffer,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );
}

let activeRadius = 0.15;

let mouseXNormalized;
let mouseYNormalized;

// Default cursor event handlers
const defaultCursorEventHandlers = {
    mousemove: async event => {
        // Get the canvas bounding rectangle
        const rect = canvas.getBoundingClientRect();

        // Calculate mouse position relative to the canvas
        const xCanvasRelative = event.clientX - rect.left;
        const yCanvasRelative = event.clientY - rect.top;

        // Normalize the mouse position
        mouseXNormalized = xCanvasRelative / canvas.width;
        mouseYNormalized = yCanvasRelative / canvas.height;

        // Update the buffer
        const mousePositionArray = new Float32Array([mouseXNormalized, mouseYNormalized]);
        device.queue.writeBuffer(
            mousePositionBuffer,
            0,
            mousePositionArray.buffer
        );
        // if they are in 'open' mode this makes the hand close:
        if (window.cursorState === 'open') {
            if (currentHighlightedHitbox?.name == 'handle') {
                window.cursorState = 'open_hover';
                // this.cursorVideoPlayer.interuptVideo('open_hover.webm');
                userInputQueue = ['open_hover'];
                return;
            }
        }
        // when they leave the hand-hover state for 'open':
        if (window.cursorState === 'open_hover') {
            if (!currentHighlightedHitbox) {
                window.cursorState = 'open_hover_exit';
            }
        }
        if (window.cursorState === 'look') {
            // check if it's the green hitbox
            // todo: make this labelled hitboxes so playgraph has list of hitbox colors -> hitbox name
            if (currentHighlightedHitbox?.name == 'handle') {
                userInputQueue = ['look_at_handle_enter'];
                return;
            }
        }
        if (window.cursorState === 'look_at_handle_idle') {
            window.cursorState = 'look_at_handle_exit';
            userInputQueue = ['look'];
            return;
        }
    },
    click: async event => {
        if (window.mainState === 'intro' && window.cursorState === 'look') {
            window.userInput = 'side';
            return;
        }
        if (window.mainState === 'side' && window.cursorState.includes('open_hover')) {
            window.userInput = 'opened_lantern';
            return;
        }
    },
    keydown: event => {
    }
};

let shudderAmount = 0.000002;
let rippleStrength = 0.002;
let rippleFrequency = 5.0;

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
        size: 8,  // 2 float32 values: x and y
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    vertexConstantsBuffer = device.createBuffer({
        size: 6 * 4,  // 6 constants of 4 bytes (float) each, includes things that control ripple, shudder etc
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(
        vertexConstantsBuffer,
        0,
        new Float32Array([
            shudderAmount, rippleStrength, rippleFrequency, 0
        ]).buffer
    );

    constantsBuffer = device.createBuffer({
        size: 6 * 4,  // 6 constants of 4 bytes (float) each, includes things like mousepos, turbulence level and activation, etc
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(
        constantsBuffer,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );

    linearSampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    fragmentShaderModules.cursorHitbox = device.createShaderModule({
        code: cursorHitboxShaderCode
    });

    setCursorSize(CURSOR_MODES.LARGE);

    hitboxBGL = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
            { binding: 1, visibility: GPUShaderStage.COMPUTE, sampler: { type: 'filtering' } },
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 4, visibility: GPUShaderStage.COMPUTE, externalTexture: {} },
        ]
    });
    // Create a compute pipeline
    hitboxPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [hitboxBGL] }),
        compute: {
            module: device.createShaderModule({ code: cursorHitboxShaderCode }), // computeShaderCode contains the WGSL code above
            entryPoint: 'main',
        },
    });
}

async function renderFrame() {

    let mouseX = 0;
    let mouseY = 0;

    const swapChainFormat = 'rgba8unorm';
    context.configure({
        device: device,
        format: swapChainFormat
    });

    const currentTexture = context.getCurrentTexture();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: currentTexture.createView(),
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'clear',
            storeOp: 'store',
            loadValue: 'load',
        }],
    };
    const commandEncoder = device.createCommandEncoder();
    const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    // Wait for the video frame to update
    if (!window.mainInteractiveVideo.blocked) {
        window.mainInteractiveVideo.renderFrame(renderPassEncoder);
    }
    renderPassEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    // await scanHitboxPixels(commandEncoder);
}

function updateTextAndCursor() {
    return new Promise((resolve, reject) => {
        // console.time('dom_render');
        const textContainer = document.getElementById('textContainer');
        const latestLetterContainer = document.getElementById('latestLetterContainer');

        textContainer.style.left = `${mouseXNormalized * 100}%`;
        textContainer.style.top = `${20 + mouseYNormalized * 100}%`;
        if (!cursorActive) {
            if (window.userString !== previousString) {
                const lastChar = window.userString.charAt(window.userString.length - 1);
                latestLetterContainer.textContent = lastChar;

                // Set position based on mouseXNormalized and mouseYNormalized
                // Assuming these values are in percentage (0-100), you might need to adjust this calculation
                // latestLetterContainer.style.left = `${mouseXNormalized * 100}%`;
                // latestLetterContainer.style.top = `${mouseYNormalized * 100}%`;

                latestLetterContainer.classList.add("blur-animation");

                setTimeout(() => {
                    latestLetterContainer.classList.remove("blur-animation");
                }, 500);

                setTimeout(() => {
                    latestLetterContainer.textContent = "";
                }, 1000); // 500ms (effect duration) + 500ms (additional delay) = 1000ms or 1 second

                previousString = window.userString;
            }

            textContainer.textContent = window.userString;
            textContainer.style.color = 'white';

            if (wordCompleted) {
                textContainer.classList.add("flash-animation");

                setTimeout(() => {
                    textContainer.classList.remove("flash-animation");
                }, 500);
                wordCompleted = false;
            }

        } else {
            window.userString = "";
            textContainer.textContent = "";
            latestLetterContainer.textContent = ""; // Clear the latest letter when cursor is active
        }
        // console.timeEnd('dom_render');
        resolve();
    });
}
async function renderLoop() {
    renderLoopCount++;
    updateFPS();
    updateTextAndCursor();
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1000.0;  // Convert to seconds
    // Update the uniform buffer with the new time value
    device.queue.writeBuffer(
        vertexConstantsBuffer,
        0,
        new Float32Array([
            shudderAmount, rippleStrength, rippleFrequency, elapsedTime
        ]).buffer
    );
    await renderFrame();
    // Call this function continuously to keep updating
    requestAnimationFrame(renderLoop);
}

async function getPixelColorFromTexture(texture, x, y) {
    let readBuffer = device.createBuffer({
        size: cursorWidth * cursorHeight * 4 * 4, // Assuming rgba8unorm format (4 bytes per pixel)
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    const copyCommandEncoder = device.createCommandEncoder();
    copyCommandEncoder.copyTextureToBuffer({
        texture: extractedPixelTexture,
        mipLevel: 0,
        origin: { x: 0, y: 0, z: 0 }
    }, {
        buffer: readBuffer,
        offset: 0,
        bytesPerRow: cursorWidth * 4,  // rgba8unorm format is 4 bytes per pixel
        rowsPerImage: cursorHeight
    }, {
        width: cursorWidth,
        height: cursorHeight,
        depthOrArrayLayers: 1
    });
    device.queue.submit([copyCommandEncoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);
    const dataArray = new Float32Array(readBuffer.getMappedRange());
    const data = dataArray.slice(0, 4);
    // Cleanup
    readBuffer.unmap();
    readBuffer.destroy();

    return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
    };
}

async function scanHitboxPixels(commandEncoder) {
    if (!hitboxOutputBuffer) {
        return;
    }
    const computePassEncoder = commandEncoder.beginComputePass();
    computePassEncoder.setPipeline(hitboxPipeline);
    computePassEncoder.setBindGroup(0, hitboxBindGroup);
    // launches one thread per 9 pixels  (center pixel + 8 neighbors)
    computePassEncoder.dispatchWorkgroups(8, 8, 1);
    // computePassEncoder.dispatchWorkgroups(1,1,1);
    computePassEncoder.end();

    commandEncoder.copyBufferToBuffer(
        hitboxOutputBuffer,
        0,
        stagingBuffer,
        0,
        hitboxBufferSize
    );
    device.queue.submit([commandEncoder.finish()]);
    await stagingBuffer.mapAsync(
        GPUMapMode.READ,
        0,
        hitboxBufferSize // Length
    );
    const copyArrayBuffer = stagingBuffer.getMappedRange(0, hitboxBufferSize / 32);
    const data = copyArrayBuffer.slice();
    stagingBuffer.unmap();
    const pixelData = new Float32Array(data);
    if (window.mainVideoPlayer.currentHitboxList) {
        // console.log(pixelData.slice(0, 5));
        currentHighlightedHitbox = window.mainVideoPlayer.currentHitboxList.find(hitbox => { if (hitbox.matchPixel(pixelData)) { return hitbox.name; } });
        if (currentHighlightedHitbox) {
            // console.log('found hitbox:', pixelData.slice(0, 5), currentHighlightedHitbox);
        }
    }
}

// Object to store the last time a frame was fetched for each video
const lastVideoFrameTime = {
    main: null,
    cursor: null,
    mask: null,
    hitbox: null
};

function updateHitboxBindGroup() {
    // hitboxBufferSize = cursorWidth * cursorHeight * 32;
    hitboxBufferSize = 32 * 4;
    hitboxOutputBuffer = device.createBuffer({
        size: hitboxBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    let entries = [
        { binding: 0, resource: { buffer: hitboxOutputBuffer, type: 'storage' } },
        { binding: 1, resource: linearSampler },
        { binding: 2, resource: { buffer: mousePositionBuffer } },
        { binding: 3, resource: { buffer: constantsBuffer } },
    ];
    // Check if the mask video is present and add it to the bind group
    if (window.mainVideoPlayer.activeVideos.hitbox &&
        window.mainVideoPlayer.activeVideos.hitbox.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const hitboxVideoExternalTexture = device.importExternalTexture({ source: window.mainVideoPlayer.activeVideos.hitbox });
        entries.push({ binding: 4, resource: hitboxVideoExternalTexture });
    }
    hitboxBindGroup = device.createBindGroup({
        layout: hitboxBGL,
        entries
    });
    stagingBuffer = device.createBuffer({
        size: hitboxBufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });
}
let hitboxBufferSize;
let stagingBuffer;

function videoNeedsUpdate(video, videoType) {
    if (lastVideoFrameTime[videoType] !== video?.currentTime && video.readyState >= 2) {
        lastVideoFrameTime[videoType] = video.currentTime;
        return true;
    }
    return false;
}

let mainVideo = null;

let renderLoopCount = 0;

window.onload = async function () {
    overlayCanvas = document.getElementById("overlayCanvas");
    window.addEventListener('resize', function () {
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;
    });
    overlayContext = overlayCanvas.getContext("2d");
    await initWebGPU();

    // Create the default cursor using the cursor plugin class
    const cursorPlaygraph = window.Playgraph.getPlaygraph('one').cursor;
    let isLetterAnimating = false;

    window.addEventListener("keyup", (event) => {
        if (isLetterAnimating) return;  // If a letter is animating, ignore other keypresses
        // any key to exit a text state
        if (window.cursorState === 'look_at_handle_idle') {
            userInputQueue = ['look_at_handle_exit'];
            return;
        }
        if (event.key === "ArrowRight") {
            window.mainState = "side";
        } else if (event.key === "Backspace" || event.key === "Escape") {
            window.cursorState = "blank";
            window.userString = "";
            userInputQueue = [];  // Clear the queue
        } else if (/^[a-zA-Z]$/.test(event.key)) {
            // For other input conditions
            window.userString += event.key.toLowerCase();
            // differentiate between 'l' for look vs 'l' for light
            // if (window.mainState === 'side') {
            //     if (window.userString === 'l') {
            //         window.userString = 'light_l';
            //     }
            // }
            userInputQueue.push(window.userString);
            isLetterAnimating = true;  // Set the flag

            // Reset the flag after a delay (corresponding to the duration of the animation + the half-second delay)
            setTimeout(() => {
                isLetterAnimating = false;
            }, textFlashAnimationDuration + 500);
        }
    });

    const playgraph = window.Playgraph.getPlaygraph('one').main;

    // Create the sampler and bind group for rendering the video
    let bothVideosLoaded = 0;
    // Add listeners for various user interactions
    console.log('add listeners');
    document.addEventListener('click', async function playOnInteraction() {
        document.removeEventListener('click', playOnInteraction);
        // move this to the init after the videoA starts playing then there's a texture for it to import 
        // const mainExternalTexture = device.importExternalTexture({ source: window.mainVideoPlayer.activeVideos.main });
        // // Check if the mask video is present and add it to the bind group
        // if (window.mainVideoPlayer.activeVideos.mask && 
        //     window.mainVideoPlayer.activeVideos.mask.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        //     const maskVideoExternalTexture = device.importExternalTexture({ source: window.mainVideoPlayer.activeVideos.mask });
        //     entries.push({ binding: 4, resource: maskVideoExternalTexture });
        // }

        // you can customize the options of the main bind group
        const gpuOptions = {
            device,
            sampler: linearSampler,
            constants: constantsBuffer,
            vertexConstants: vertexConstantsBuffer,
        }
        const videoPlayer = new VideoPlayer(playgraph, mainNextVideoStrategy, false);
        const mainBehavior = new DefaultShaderBehavior([videoPlayer]);
        window.mainInteractiveVideo = new InteractiveVideo(gpuOptions, videoPlayer, mainBehavior);

        const cursorGpuOptions = {
            device,
            context,
            sampler: linearSampler,
            hitboxBGL,
            constants: constantsBuffer,
        }
        // const cursorMainPlayer = new VideoPlayer(playgraph, defaultCursorNextVideoStrategy, false);
        // const cursorMaskPlayer = new VideoPlayer(playgraph, defaultCursorNextVideoStrategy, false);
        // get the blank video node
        // const blank = window.Playgraph.getPlaygraph('one').cursor.nodes.find(node => node.id === 'blank');
        // window.cursorVideoPlayer = new VideoPlayer(device, cursorPlaygraph, getNextCursorVideo, blank, false);


        // window.cursorInteractiveVideo = new InteractiveVideo(gpuOptions, cursorVideoPlayers, renderCursorBindGroup);

        renderLoop();
        await new Promise(r => setTimeout(r, 200));
        await window.mainInteractiveVideo.start('');
    });
};

function defaultCursorNextVideoStrategy(currentVideo) {
    const currentNode = this.playgraph.nodes[this.currentNodeIndex];
    const currentEdgeIndex = currentNode.edges.findIndex(edge => currentVideo.src.includes(edge.id));
    let nextEdgeIndex = (currentEdgeIndex + 1) % currentNode.edges.length;

    // Select the next edge based on the global cursorState variable
    const nextEdges = currentNode.edges.filter(edge => edge.tags.includes(window.cursorState));
    if (nextEdges.length > 0) {
        nextEdgeIndex = currentNode.edges.indexOf(nextEdges[0]);
    }

    const nextVideoPath = `/main/${currentNode.edges[nextEdgeIndex].id}`;

    // Update the current node index if we transitioned to a different node
    const nextNodeId = currentNode.edges[nextEdgeIndex].to;
    const nextNodeIndex = this.playgraph.nodes.findIndex(node => node.id === nextNodeId);
    if (nextNodeIndex !== -1) {
        this.currentNodeIndex = nextNodeIndex;
    }
    return nextVideoPath;
}

function mainNextVideoStrategy(currentVideo) {
    // if (window.mainState === 'intro') {
    //     if (window.userInput === "side") {
    //         window.mainState = 'side';
    //         return '/main/side.webm';
    //     }
    //     return '/main/front_forward_idle.webm';
    // }
    if (window.mainState === 'side') {
        window.mainState = 'side_reverse';
        console.log('reverse')
        return '/main/side_idle_reverse.webm';
    }
    console.log('forward');
    window.mainState = 'side';
    return '/main/side_idle.webm';
    // if (window.mainState === 'side') {
    //     if (window.userInput === 'opened_lantern') {
    //         window.mainState = 'opened_lantern';
    //         return '/main/opened_lantern.webm';
    //     }
    //     if (this.currentNodeIndex === this.playgraph.nodes.findIndex(node => node.id === 'side_idle')) {
    //         this.currentNodeIndex = this.playgraph.nodes.findIndex(node => node.id === 'side_idle_reverse'); 
    //         return '/main/side_idle_reverse.webm';
    //     } 
    //     this.currentNodeIndex = this.playgraph.nodes.findIndex(node => node.id === 'side_idle'); 
    //     return '/main/side_idle.webm';
    // }
    if (window.mainState === 'opened_lantern') {
        this.currentNodeIndex = this.playgraph.nodes.findIndex(node => node.id === 'opened_lantern_idle');
        return '/main/opened_lantern_idle.webm';

    }
}

function defaultNextVideoStrategy(currentVideo) {
    const currentNode = this.playgraph.nodes[this.currentNodeIndex];
    const currentEdgeIndex = currentNode.edges.findIndex(edge => currentVideo.src.includes(edge.id));
    let nextEdgeIndex;

    // If the current video has autoTransition set, then pick the next edge
    if (currentNode.edges[currentEdgeIndex].autoTransition) {
        nextEdgeIndex = (currentEdgeIndex + 1) % currentNode.edges.length;
    } else {
        // If not, then follow the existing behavior
        nextEdgeIndex = currentEdgeIndex; // Default to the current video (looping behavior)

        // Select the next edge based on the global userInput variable
        const nextEdges = currentNode.edges.filter(edge => edge.tags.includes(window.userInput));
        if (nextEdges.length > 0) {
            nextEdgeIndex = currentNode.edges.indexOf(nextEdges[0]);
        }
    }

    const nextVideoPath = `/main/${currentNode.edges[nextEdgeIndex].id}`;
    const nextNodeId = currentNode.edges[nextEdgeIndex].to;
    const nextNodeIndex = this.playgraph.nodes.findIndex(node => node.id === nextNodeId);

    if (nextNodeIndex !== -1) {
        this.currentNodeIndex = nextNodeIndex;
    }

    return nextVideoPath;
}

const stateTransitions = {
    'blank': {
        'o': '/main/o2.webm',
        'l': {
            default: '/main/3l.webm',
            'side': '/main/light_l2.webm',
        },
        'light_l': '/main/light_l2.webm',
    },
    'o': {
        'op': '/main/op4.webm',
    },
    'op': {
        'ope': '/main/ope4.webm',
    },
    'ope': {
        'open': '/main/open_4.webm',
    },
    'open': {
        'open_hover': '/main/open_hover_3.webm',
    },
    'open_hover_exitlo': {
        'open_hover': '/main/open_idle4.webm',
    },
    'l': {
        'li': '/main/li.webm',
        'lo': '/main/3lo.webm',
    },
    'lo': {
        'loo': '/main/3loo.webm',
    },
    'loo': {
        'look': '/main/3look.webm',
    },
    'look': {
        'look_at_handle_enter': '/main/look_at_handle_open2.webm',
    },
    'look_at_handle_exit': {
        'look': '/main/look_at_handle_exit2.webm'
    },
    'light_l': {
        'li': '/main/li.webm',
    },
    'li': {
        'lig': '/main/lig.webm',
    },
    'lig': {
        'ligh': '/main/ligh.webm',
    },
    'ligh': {
        'light': '/main/light.webm',
    },
};

const autoTransitions = {
    'open_hover': 'open_hover_idle',
    'open_hover_exit': 'open',
    'look_at_handle_enter': 'look_at_handle_idle',
    // 'look_at_handle_exit': 'look'
};

function getNextCursorVideo(currentVideo, playgraph, userInput) {

    const nextUserInput = userInputQueue.shift() || '';

    // Check for automatic transitions first
    const autoTransitionState = autoTransitions[window.cursorState];
    if (autoTransitionState) {
        const currentState = window.cursorState;
        window.cursorState = autoTransitionState;
        return getDefaultVideoForState(currentState) || currentVideo.src;
    }

    if (nextUserInput === '') {
        return getDefaultVideoForState(window.cursorState) || currentVideo.src;
    }

    let nextState = stateTransitions[window.cursorState] && stateTransitions[window.cursorState][nextUserInput];
    if (typeof nextState === 'object') {
        nextState = nextState[window.mainState];
        if (!nextState) {
            nextState = stateTransitions[window.cursorState][nextUserInput].default;
        }
    }
    if (nextState) {
        window.cursorState = nextUserInput;
        return nextState;
    } else {
        userInputQueue.unshift(nextUserInput); // push it back as it wasn't consumed
        return getDefaultVideoForState(window.cursorState) || currentVideo.src;
    }
}

function getDefaultVideoForState(state) {
    // Returns a default video path for a given state, or null if none exists
    const defaults = {
        'blank': 'main/blank.webm',
        // 'open' sequence
        'o': 'main/o2_idle.webm',
        'o_idle': 'main/o2_idle.webm',
        'op': 'main/op_idle_5.webm',
        'op_idle': 'main/op_idle_5.webm',
        'ope': 'main/ope5_idle.webm',
        'ope_idle': 'main/ope5_idle.webm',
        'open': 'main/open_idle4.webm',
        'open_idle': 'main/open_idle4.webm',
        // 'light' sequence
        // 'light_l': 'main/light_l_idle2.webm',
        // 'light_l_idle': 'main/light_l_idle2.webm',
        'li': 'main/li_idle.webm',
        'li_idle': 'main/li_idle.webm',
        'lig': 'main/lig_idle.webm',
        'lig_idle': 'main/lig_idle.webm',
        'ligh': 'main/ligh_idle.webm',
        'ligh_idle': 'main/ligh_idle.webm',
        'light': 'main/light_idle.webm',
        'light_idle': 'main/light_idle.webm',
        // 'look' sequence
        'l': {
            default: 'main/stretch2_3l_idle.webm',
            'side': 'main/light_l_idle2.webm',
        },
        'l_idle': {
            default: 'main/stretch2_3l_idle.webm',
            side: 'main/light_l_idle2.webm',
        },
        'lo': 'main/stretch_3lo_idle.webm',
        'lo_idle': 'main/stretch_3lo_idle.webm',
        'loo': 'main/3loo_idle.webm',
        'loo_idle': 'main/3loo_idle.webm',
        'look': 'main/stretch1_3look_idle.webm',
        'look_idle': 'main/stretch1_3look_idle.webm',
        // 'look_at_handle' sequence
        'look_at_handle_enter': 'main/look_at_handle_idle.webm',
        'look_at_handle_idle': 'main/look_at_handle_idle.webm',
        // open hover sequence
        'open_hover': 'main/open_hover_3.webm',
        'open_hover_idle': 'main/open_hover_idle3.webm',
        'open_hover_exit': 'main/open_hover_exit3.webm',
    };
    let video = defaults[state];
    if (typeof video === 'object') {
        return video[window.mainState];
    }
    return video;
}

