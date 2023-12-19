import { extractWebmPaths } from './utilities.js';
import InteractiveVideo from './InteractiveVideo.js';
import VideoPlayer from './VideoPlayer.js';
import { DefaultShaderBehavior } from './ShaderBehavior.js';
import SpellCursor from './SpellCursor.js';
window.debug = true;
let lastFrameTime = Date.now();
let frameCount = 0;

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

// global variables
// vertex constants that can be tweaked
let shudderAmount = 0.000002;
let rippleStrength = 0.002;
let rippleFrequency = 5.0;

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
        cursorConstants,
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

let userKeyboardElement;
let overlayCanvas, overlayContext;

// WebGPU Variables
let hitboxOutputBuffer; // the gpu writes the hitbox data to this buffer
let cursorHitbox;
let adapter, device, canvas, context;
let mousePositionBuffer, cursorConstants;
let hitboxPipeline;  // Pipeline for rendering the video
let hitboxBindGroup;
let linearSampler = null;
let hitboxBGL;
let playgraph;
let currentHitboxList = false;
let cursorActive = 0.0;  // 1.0 when cursor is 'active' and can interact with things
const textFlashAnimationDuration = 100;  // 500ms or 0.5 seconds
let previousString = "";
let wordCompleted = false;
let activeRadius = 0.15;

let mouseXNormalized;
let mouseYNormalized;

// UTILITY FUNCTIONS
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


function setCursorActive(newValue) {
    cursorActive = newValue;
    device.queue.writeBuffer(
        cursorConstants,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );
}

// Default cursor event handlers
const defaultCursorEventHandlers = {
    mousemove: async function (event) {
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
        if (this.cursorState === 'open') {
            if (currentHighlightedHitbox?.name == 'handle') {
                this.cursorState = 'open_hover';
                // this.cursorVideoPlayer.interuptVideo('open_hover.webm');
                userInputQueue = ['open_hover'];
                return;
            }
        }
        // when they leave the hand-hover state for 'open':
        if (this.cursorState === 'open_hover') {
            if (!currentHighlightedHitbox) {
                this.cursorState = 'open_hover_exit';
            }
        }
        if (this.cursorState === 'look') {
            // check if it's the green hitbox
            // todo: make this labelled hitboxes so playgraph has list of hitbox colors -> hitbox name
            if (currentHighlightedHitbox?.name == 'handle') {
                userInputQueue = ['look_at_handle_enter'];
                return;
            }
        }
        if (this.cursorState === 'look_at_handle_idle') {
            this.cursorState = 'look_at_handle_exit';
            userInputQueue = ['look'];
            return;
        }
    },
    click: async function (event) {
        if (window.mainState === 'intro' && this.cursorState === 'look') {
            window.userInput = 'side';
            return;
        }
        if (window.mainState === 'side' && this.cursorState.includes('open_hover')) {
            window.userInput = 'opened_lantern';
            return;
        }
    },
    keydown: event => {
    }
};

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

    cursorConstants = device.createBuffer({
        size: 6 * 4,  // 6 constants of 4 bytes (float) each, includes things like mousepos, turbulence level and activation, etc
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(
        cursorConstants,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );

    linearSampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    cursorHitbox = device.createShaderModule({
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
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store',
            loadValue: 'clear',
        }],
    };
    const commandEncoder = device.createCommandEncoder();
    const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    // Wait for the video frame to update
    if (!window.mainInteractiveVideo.blocked) {
        window.mainInteractiveVideo.renderFrame(renderPassEncoder);
        if (window.spellCursor) {
            window.spellCursor.renderFrame(renderPassEncoder);
        }
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
                latestLetterContainer.style.left = `${mouseXNormalized * 100}%`;
                latestLetterContainer.style.top = `${mouseYNormalized * 100}%`;

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
        { binding: 3, resource: { buffer: cursorConstants } },
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
const startTime = performance.now();

window.onload = async function () {
    overlayCanvas = document.getElementById("overlayCanvas");
    window.addEventListener('resize', function () {
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;
    });
    overlayContext = overlayCanvas.getContext("2d");
    await initWebGPU();

    let isLetterAnimating = false;

    window.addEventListener("keyup", (event) => {
        if (!window.spellCursor) return;
        if (isLetterAnimating) return;  // If a letter is animating, ignore other keypresses
        // any key to exit a text state
        if (window.spellCursor.cursorState === 'look_at_handle_idle') {
            userInputQueue = ['look_at_handle_exit'];
            return;
        }
        if (event.key === "ArrowRight") {
            window.mainState = "side";
        } else if (event.key === "Backspace" || event.key === "Escape") {
            window.spellCursor.cursorState = "blank";
            window.userString = "";
            userInputQueue = [];  // Clear the queue
        } else if (/^[a-zA-Z]$/.test(event.key)) {
            // For other input conditions
            window.userString += event.key.toLowerCase();
            // differentiate between 'l' for look vs 'l' for light
            if (window.mainState === 'side') {
                if (window.userString === 'l') {
                    window.userString = 'light_l';
                }
            }
            userInputQueue.push(window.userString);
            isLetterAnimating = true;  // Set the flag

            // Reset the flag after a delay (corresponding to the duration of the animation + the half-second delay)
            setTimeout(() => {
                isLetterAnimating = false;
            }, textFlashAnimationDuration + 500);
        }
    });

    playgraph = window.Playgraph.getPlaygraph('one').main;

    // Add listeners for various user interactions
    document.addEventListener('click', async function playOnInteraction() {
        document.removeEventListener('click', playOnInteraction);

        // you can customize the options of the main bind group
        const gpuOptions = {
            device,
            sampler: linearSampler,
            constants: cursorConstants,
            vertexConstants: vertexConstantsBuffer,
        }
        const webmPaths = extractWebmPaths(playgraph);
        const videoPlayer = new VideoPlayer(webmPaths, mainNextVideoStrategy, false);
        const mainBehavior = new DefaultShaderBehavior([videoPlayer]);
        window.mainInteractiveVideo = new InteractiveVideo(gpuOptions, videoPlayer, mainBehavior);

        const cursorGpuOptions = {
            device,
            context,
            sampler: linearSampler,
            hitboxBGL,
            constants: cursorConstants,
            vertexConstants: vertexConstantsBuffer,
            mousePositionBuffer
        }
        // const cursorPlaygraph = window.Playgraph.getPlaygraph('one').cursor;
        const cursorVocabulary = {
            'blank': {
                'blank': { entry: '/main/blank.webm', idle: '/main/blank.webm', next: 'blank' },
            },
            'open': {
                'o': { entry: '/main/o2.webm', idle: '/main/o2_idle.webm', next: 'op' },
                'op': { entry: '/main/op4.webm', idle: '/main/op_idle.webm', next: 'ope' },
                'ope': { entry: '/main/ope4.webm', idle: '/main/ope5_idle.webm', next: 'open' },
                'open': { entry: '/main/open_4.webm', idle: '/main/open_idle.webm', next: 'open' },
            }
        };
        window.spellCursor = new SpellCursor(cursorVocabulary, getNextCursorVideo, cursorGpuOptions, defaultCursorEventHandlers, cursorVocabulary);
        // Create the default cursor using the cursor plugin class
        window.spellCursor.currentNodeIndex = 0;
        renderLoop();
        await new Promise(r => setTimeout(r, 200));
        await window.mainInteractiveVideo.start('');
        await window.spellCursor.start('/main/blank.webm');
    });
};


function getNextCursorVideo(currentVideo, playgraph, userInput) {
    const nextUserInput = userInputQueue.shift() || '';
    // if we're just staying in blank mode
    if (this.cursorState === 'blank' && nextUserInput === '') {
        return '/main/blank.webm';
    }
    const vocabularyWord = this.findVocabularyWord(this.cursorState);
    const vocabulary = this.cursorVocabulary[vocabularyWord];
    let nextFragment = vocabulary[this.cursorState];
    console.log('next fragment', nextFragment);
    if (!nextFragment) {
        console.log('error no next fragment for ', this.cursorState);
        return '/main/blank.webm';
    }
    const nextState = nextUserInput !== '' ? nextUserInput : this.cursorState;
    if (nextState === this.cursorState) {
        return nextFragment.idle;
    }
    if (nextState !== this.cursorState) {
        this.cursorState = nextState;
        return vocabulary[nextFragment.next].entry;
    }
    return '/main/blank.webm';
}

function mainNextVideoStrategy(currentVideo) {
    // if (window.mainState === 'intro') {
    //     if (window.userInput === "side") {
    //         window.mainState = 'side';
    //         return '/main/side.webm';
    //     }
    //     return '/main/front_forward_idle.webm';
    // }
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
;



