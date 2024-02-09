import { extractWebmPathsFromObject } from './utilities.js';
import InteractiveVideo from './InteractiveVideo.js';
import VideoPlayer from './VideoPlayer.js';
import { DefaultShaderBehavior } from './ShaderBehavior.js';
import { DistortionShaderBehavior } from './DistortionShaderBehavior.js';
import SpellCursor from './game1/SpellCursor.js';
const currentGame = require('./game1/module.js');

window.debug = true;
let lastFrameTime = Date.now();
let frameCount = 0;

// vertex constants that can be tweaked
let shudderAmount = 0.000002;
let rippleStrength = 0.002;
let rippleFrequency = 5.0;

const cursorVariables = {
    screenWidth: 1920.0,
    screenHeight: 1080.0,
    cursorWidth: 512.0,
    cursorHeight: 288.0,
    cursorActive: 0.0,
    activeRadius: 0.0
};

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
        new Float32Array([cursorVariables.screenWidth, cursorVariables.screenHeight, cursorVariables.cursorWidth, cursorVariables.cursorHeight, cursorVariables.cursorActive, cursorVariables.activeRadius]).buffer
    );
}

let currentHighlightedHitbox = null;

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

let hitboxBufferSize;
let stagingBuffer;
let mainVideo = null;

let renderLoopCount = 0;
const startTime = performance.now();


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
        new Float32Array([cursorVariables.screenWidth, cursorVariables.screenHeight, cursorVariables.cursorWidth, cursorVariables.cursorHeight, cursorVariables.cursorActive, cursorVariables.activeRadius]).buffer
    );

    linearSampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    // cursorHitbox = device.createShaderModule({
    //     code: cursorHitboxShaderCode
    // });

    setCursorSize(CURSOR_MODES.LARGE);

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
        if (window.hitboxShader) {
            window.hitboxShader.renderFrame(renderPassEncoder);
        }
    }
    renderPassEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
    // await scanHitboxPixels(commandEncoder);
}

async function renderLoop() {
    renderLoopCount++;
    updateFPS();
    currentGame.updateTextAndCursor();
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

function videoNeedsUpdate(video, videoType) {
    if (lastVideoFrameTime[videoType] !== video?.currentTime && video.readyState >= 2) {
        lastVideoFrameTime[videoType] = video.currentTime;
        return true;
    }
    return false;
}

async function playOnInteraction() {
    document.removeEventListener('click', playOnInteraction);
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
        const nextEdges = currentNode.edges.filter(edge => edge.tags.includes(userInput));
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

// initialize and wait for the user to interact with the page
window.onload = async function () {
    overlayCanvas = document.getElementById("overlayCanvas");
    window.addEventListener('resize', function () {
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;
    });
    overlayContext = overlayCanvas.getContext("2d");
    await initWebGPU();

    window.addEventListener("keyup", (event) => {
        currentGame.handleEvent(window, 'keyup', event);
    });

    // playgraph = window.Playgraph.getPlaygraph('one').main;

    // Add listeners for various user interactions
    document.addEventListener('click', playOnInteraction);
};
