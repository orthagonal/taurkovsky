const startTime = performance.now();

const vertexShaderCode = /* wgsl */`
struct VertexConstants {
    // Shudder effect: add random displacement based on time
    shudderAmount: f32,
    // Ripple effect: add sine wave based on position and time
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

const mainFragmentShaderCode = /* wgsl */`
@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

@fragment
fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
    return textureSampleBaseClampToEdge(myTexture, mySampler, fragUV);
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
@group(0) @binding(1) var smallTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> mousePosition: MouseUniform;
@group(0) @binding(3) var<uniform> constants: Constants;
@group(0) @binding(4) var hitboxTexture: texture_2d<f32>;

@fragment
fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
    var halfCursorWidth = constants.cursorWidth / constants.screenWidth / 2.0;
    var halfCursorHeight = constants.cursorHeight / constants.screenHeight / 2.0;
    var leftBoundary = mousePosition.mousePosition.x -halfCursorWidth;
    var rightBoundary = mousePosition.mousePosition.x + halfCursorWidth;
    var bottomBoundary = mousePosition.mousePosition.y - halfCursorHeight;
    var topBoundary = mousePosition.mousePosition.y + halfCursorHeight;

    var isWithinCursor = fragUV.x > leftBoundary && fragUV.x < rightBoundary && 
                         fragUV.y > bottomBoundary && fragUV.y < topBoundary;

    if (isWithinCursor) {
        var uCoord = (fragUV.x - leftBoundary) / (2.0 * halfCursorWidth);
        var vCoord = (fragUV.y - bottomBoundary) / (2.0 * halfCursorHeight);
        var adjustedUV = vec2<f32>(uCoord, vCoord);

        // in case you want rotation of some kind:
        // // Translate so center of cursor is at (0, 0)
        // var translatedUV = adjustedUV - vec2<f32>(0.5, 0.5);

        // // Compute rotation angle based on mouse x position.
        // var maxRotation = 0.45 * 3.14159265359; // in radians (45 degrees)
        // var rotationAmount = (mousePosition.mousePosition.x - 0.5) * 2.0;
        // var theta = -rotationAmount * maxRotation;

        // // Apply the 2D rotation matrix to translatedUV
        // var rotatedU = cos(theta) * translatedUV.x - sin(theta) * translatedUV.y;
        // var rotatedV = sin(theta) * translatedUV.x + cos(theta) * translatedUV.y;

        // // Translate back so center of cursor is at its original position
        // adjustedUV = vec2<f32>(rotatedU, rotatedV) + vec2<f32>(0.5, 0.5);

        // Sample color from smallTexture and hitboxTexture
        var colorFromSmallTexture = textureSampleBaseClampToEdge(smallTexture, mySampler, adjustedUV);
        var colorFromHitboxTexture = textureSampleBaseClampToEdge(hitboxTexture, mySampler, fragUV);
        
        // If the alpha value of the pixel in smallTexture is less than 1.0, use the pixel from hitboxTexture
        if (constants.cursorActive > 0.0 && colorFromSmallTexture.a < 1.0) {
            // if the hitbox color is black ignore it:
            if (colorFromHitboxTexture.r == 0.0 && colorFromHitboxTexture.g == 0.0 && colorFromHitboxTexture.b == 0.0) {
                return vec4<f32>(0.0, 0.0, 0.0, 0.0);
            }
            // if it's close to the center show it
            var cursorCenter = vec2<f32>(mousePosition.mousePosition.x * 2.0, mousePosition.mousePosition.y);
            var adjustedFragUV = vec2<f32>(fragUV.x * 2.0 , fragUV.y );
            var distanceFromCenter = distance(adjustedFragUV, cursorCenter);
            // Threshold distance from the cursor center to display colorFromHitboxTexture
            // var thresholdDistance = min(halfCursorWidth * .23, constants.cursorHeight); // Adjust as needed
            var thresholdDistance = 0.15;
            if (distanceFromCenter <= thresholdDistance) {
                var bias = 0.4; // Adjust as needed to bias more or less in favor of smallTexture
                var alpha = clamp(colorFromSmallTexture.a + bias, 0.0, 1.0); // Clamp to ensure it's between 0 and 1
                // var alpha = colorFromSmallTexture.a;
                var beta = 1.0 - alpha; // Inverse alpha value for blending
                
                // if alpha is 1, it will show only colorFromSmallTexture.
                // if alpha is 0, it will show only colorFromHitboxTexture.
                // if alpha is between 0 and 1, it will blend the two textures based on the alpha value.
                var blendedColor = alpha * colorFromSmallTexture + beta * colorFromHitboxTexture;
                
                return blendedColor;
            }
            
            // if (distanceFromCenter <= thresholdDistance) {
            //     return colorFromHitboxTexture;
            // }
        }
        return colorFromSmallTexture;
    }
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);         
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
@binding(2) @group(0) var hitboxTexture: texture_2d<f32>;
@binding(3) @group(0) var<uniform> mousePosition: MouseUniform;
@binding(4) @group(0) var<uniform> constants: Constants;
 

@compute @workgroup_size(1,1, 1)
fn main(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    if (id.x != 0 && id.y != 0) { return; }
    var halfCursorWidth = constants.cursorWidth / f32(constants.screenWidth) / 2.0;
    var halfCursorHeight = constants.cursorHeight / f32(constants.screenHeight) / 2.0;
    var thresholdDistance = constants.activeRadius;

    var pixelSize = vec2<f32>(0.000520, 0.000925);
    var maxPixel: vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    hitboxOutput = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    // Iterate through pixels within the thresholdDistance
    var leftBoundary = clamp(mousePosition.mousePosition.x -thresholdDistance, 0.0, 1.0);
    var rightBoundary = clamp(mousePosition.mousePosition.x + thresholdDistance, 0.0, 1.0);
    var bottomBoundary = clamp(mousePosition.mousePosition.y - thresholdDistance, 0.0, 1.0);
    var topBoundary = clamp(mousePosition.mousePosition.y + thresholdDistance, 0.0, 1.0);
    hitboxOutput.x = leftBoundary;
    hitboxOutput.y = rightBoundary;
    hitboxOutput.z = pixelSize.x;
    hitboxOutput.w = pixelSize.y;
    for (var x: f32 = leftBoundary; x <= rightBoundary; x+= pixelSize.x) {
        for (var y: f32 = bottomBoundary; y <= topBoundary; y+= pixelSize.y) {
            let uv: vec2<f32> = vec2<f32>(x, y);
            var currentPixel = textureSampleBaseClampToEdge(hitboxTexture, mySampler, uv);
            if (length(currentPixel) > length(maxPixel)) {
                maxPixel = currentPixel;
            }
        }
    }
    hitboxOutput = maxPixel;
}
`;


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
    // Recreate the cursor texture with the updated size
    cursorVideoTexture = device.createTexture({
        size: { width: cursorWidth, height: cursorHeight, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED | GPUTextureUsage.TEXTURE_BINDING
    });    
    device.queue.writeBuffer(
        constantsBuffer,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );
    createPipeline('default');
}

// current user input state stuff:
let userInputQueue = [""];
let currentHighlightedHitbox = null;
// the string that we show to the user on screen
// not sure why these are on window object
window.userString = "";
window.userInput = 'idle';
window.cursorState = 'blank';

let userKeyboardElement;
let overlayCanvas, overlayContext;

// WebGPU Variables
let hitboxOutputBuffer; // the gpu writes the hitbox data to this buffer
let adapter, device, canvas, context;
let mousePositionBuffer, constantsBuffer, vertexConstantsBuffer;
let videoTexture, hitboxVideoTexture, cursorVideoTexture, extractedPixelTexture;
let bindGroup, vertexUniformBindGroup;
let mainVideoPipeline, cursorPipeline, hitboxPipeline;  // Pipeline for rendering the video
let videoBindGroup, cursorBindGroup, hitboxBindGroup; 
let currentCursor = null;
let linearSampler = null;
let fragmentShaderModules = {};
let defaultCursor, alphaCursor;
let mainBGL, cursorBGL, hitboxBGL, vertexUniformBGL;

let currentHitboxList = false;
let cursorActive = 0.0;  // 1.0 when cursor is 'active' and can interact with things
function setCursorActive(newValue) {
    cursorActive = newValue;
    device.queue.writeBuffer(
        constantsBuffer,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );
}

let  activeRadius = 0.15;

// src/trailer/src.js
class CursorPlugin {
    constructor(videoTexture, fragmentShader, eventHandlers) {
        this.videoTexture = videoTexture;
        this.fragmentShader = fragmentShader;
        this.eventHandlers = eventHandlers;
        this.playgraph = null;  // Placeholder, you can define the playgraph mechanism here       
        this.currentVideo = null;
    }

    static setCursor(cursor) {
        if (currentCursor) {
            currentCursor.detachEventHandlers(canvas);
        }

        currentCursor = cursor;
        cursor.attachEventHandlers(canvas);
        // TODO: Use cursor's videoTexture and fragmentShader to update the rendering process
    }

    setPlaygraph(playgraph) {
        this.playgraph = playgraph;
    }

    attachEventHandlers(element) {
        for (let event in this.eventHandlers) {
            element.addEventListener(event, this.eventHandlers[event]);
        }
    }

    detachEventHandlers(element) {
        for (let event in this.eventHandlers) {
            element.removeEventListener(event, this.eventHandlers[event]);
        }
    }
}

function setCursor(cursorType) {
    if (cursorType === 'default') {
        CursorPlugin.setCursor(defaultCursor);
        cursorVideoTexture = device.createTexture({
            size: { width: cursorWidth, height: cursorHeight, depthOrArrayLayers: 1 },
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED | GPUTextureUsage.TEXTURE_BINDING
        });
        createPipeline('default');
    } else if (cursorType === 'alpha') {
        CursorPlugin.setCursor(alphaCursor);
        cursorVideoTexture = device.createTexture({
            size: { width: cursorWidth, height: cursorHeight, depthOrArrayLayers: 1 },
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED | GPUTextureUsage.TEXTURE_BINDING
        });
        createPipeline('cursor2');
    } else {
        console.error(`Unknown cursor type: ${cursorType}`);
    }
}

let currentCursorType = 'default'; // Initial state

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
    },
    click: async event => {
        // if (window.cursorState  !== 'look_end') return;
        if (window.cursorState === 'look') {
            // check if it's the green hitbox
            // todo: make this labelled hitboxes so playgraph has list of hitbox colors -> hitbox name
            if (currentHighlightedHitbox.name == 'handle') {
                userInputQueue = ['look_at_handle_enter'];
                return;
            }
        }
        if (window.cursorState === 'look_at_handle') {
            userInputQueue = ['look_at_handle_exit'];
            return;
        }
    },
    keydown: event => {
    }
};

async function getPixelColorFromTexture(texture, x, y) {
    let readBuffer = device.createBuffer({
        size: cursorWidth * cursorHeight * 4 * 4, // Assuming rgba8unorm format (4 bytes per pixel)
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    const copyCommandEncoder = device.createCommandEncoder();
    copyCommandEncoder.copyTextureToBuffer({
        texture: extractedPixelTexture,
        mipLevel: 0,
        origin: {x:0, y:0, z:0}
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

let shudderAmount = 0.000002;
let rippleStrength = 0.02;
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
        new Float32Array([
            screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );

    device.queue.writeBuffer(
        constantsBuffer,
        0,
        new Float32Array([screenWidth, screenHeight, cursorWidth, cursorHeight, cursorActive, activeRadius]).buffer
    );

    videoTexture = device.createTexture({
        size: { width: screenWidth, height: screenHeight, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED | GPUTextureUsage.TEXTURE_BINDING
    });

    // used for hitboxes
    hitboxVideoTexture = device.createTexture({
        size: { width: screenWidth, height: screenHeight, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC
    });

    cursorVideoTexture = device.createTexture({
        size: { width: cursorWidth, height: cursorHeight, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED | GPUTextureUsage.TEXTURE_BINDING
    });

    extractedPixelTexture = device.createTexture({
        size: { width: cursorWidth, height: cursorHeight, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_SRC
    });
   
    linearSampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    fragmentShaderModules.main = device.createShaderModule({
        code: mainFragmentShaderCode
    });

    fragmentShaderModules.defaultVertex = device.createShaderModule({
        code: vertexShaderCode
    });
    fragmentShaderModules.cursorVertex = device.createShaderModule({
        code: cursorVertexShaderCode
    });

    fragmentShaderModules.default = device.createShaderModule({
        code: cursorFragmentShaderCode
    });
    fragmentShaderModules.cursor1 = device.createShaderModule({
        code: cursorFragmentShaderCode
    });
    fragmentShaderModules.cursorHitbox = device.createShaderModule({
        code: cursorHitboxShaderCode
    });
    
    setCursorSize(CURSOR_MODES.LARGE);

    createPipeline('default');
}

function createPipeline(cursorType) {
    vertexUniformBGL = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
        ]
    });
    
    mainBGL = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
            { binding: 2, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },

        ]
    });
    
    mainVideoPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [mainBGL, vertexUniformBGL],            
        }),
        vertex: {
            module: fragmentShaderModules.defaultVertex,
            entryPoint: 'main'
        },
        fragment: {
            module: fragmentShaderModules.main,
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
            stripIndexFormat: 'uint32'
        },
    });

    cursorBGL = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
            { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
            { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
            { binding: 4, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
        ]
    });
    cursorPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [ cursorBGL ],
        }),
        vertex: {
            module: fragmentShaderModules.cursorVertex,
            entryPoint: 'main'
        },
        fragment: {
            module: fragmentShaderModules[cursorType],
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
            stripIndexFormat: 'uint32'
        },
    });

    hitboxBGL = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
            { binding: 1, visibility: GPUShaderStage.COMPUTE, sampler: { type: 'filtering' } },
            { binding: 2, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'float' } },
            { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
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
    
    createBindGroups();
}

function createBindGroups() {
    vertexUniformBindGroup = device.createBindGroup({
        layout: vertexUniformBGL,
        entries: [
            { binding: 0, resource: { buffer: vertexConstantsBuffer } }
        ]
    });
    
    // Create bind group for rendering the video
    videoBindGroup = device.createBindGroup({
        layout: mainBGL,
        entries: [
            { binding: 0, resource: linearSampler },
            { binding: 1, resource: videoTexture.createView() },
            { binding: 2, resource: { buffer: constantsBuffer } },
        ]
    });

    cursorBindGroup = device.createBindGroup({
        layout: cursorBGL,
        entries: [
            { binding: 0, resource: linearSampler },
            { binding: 1, resource: cursorVideoTexture.createView() },
            { binding: 2, resource: { buffer: mousePositionBuffer } },
            { binding: 3, resource: { buffer: constantsBuffer } },
            { binding: 4, resource: hitboxVideoTexture.createView() },
        ]
    });

    // hitboxBufferSize = cursorWidth * cursorHeight * 32;
    hitboxBufferSize = 32 * 4;
    hitboxOutputBuffer = device.createBuffer({
        size: hitboxBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    hitboxBindGroup = device.createBindGroup({
        layout: hitboxBGL,
        entries: [
            { binding: 0, resource: { buffer: hitboxOutputBuffer, type: 'storage' } },
            { binding: 1, resource: linearSampler },
            { binding: 2, resource: hitboxVideoTexture.createView() },
            { binding: 3, resource: { buffer: mousePositionBuffer } },
            { binding: 4, resource: { buffer: constantsBuffer } },
        ],
    });
    stagingBuffer = device.createBuffer({
        size: hitboxBufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
      });
}
let  hitboxBufferSize;
let stagingBuffer;

function updateTextureFromVideo(videoElement, targetTexture, dimensions) {
    const { width, height } = dimensions;
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offscreenCanvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    device.queue.writeTexture(
        { texture: targetTexture },
        imageData.data,
        {                                  // Data layout
            offset: 0,
            bytesPerRow: 4 * width,       // Updated to use width, assuming each pixel is 4 bytes (RGBA)
            rowsPerImage: height
        },
        { width: width, height: height, depthOrArrayLayers: 1 }  // Size
    );
}

// Object to store the last time a frame was fetched for each video
const lastVideoFrameTime = {
    main: null,
    cursor: null,
    mask: null
};

function updateTextureIfNeeded(video, texture, dimensions, videoType) {
    if (!video) return;

    // Check if video's currentTime is different from the last stored time
    if (lastVideoFrameTime[videoType] !== video.currentTime) {
        updateTextureFromVideo(video, texture, dimensions);
        // Update the last fetched time for this video
        lastVideoFrameTime[videoType] = video.currentTime;
    }
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

    renderPassEncoder.setPipeline(mainVideoPipeline);
    renderPassEncoder.setBindGroup(0, videoBindGroup);
    renderPassEncoder.setBindGroup(1, vertexUniformBindGroup);
    renderPassEncoder.draw(4, 1, 0, 0);

    renderPassEncoder.setPipeline(cursorPipeline);
    renderPassEncoder.setBindGroup(0, cursorBindGroup);
    renderPassEncoder.draw(4, 1, 0, 0);

    renderPassEncoder.end();

    const computePassEncoder = commandEncoder.beginComputePass();
    computePassEncoder.setPipeline(hitboxPipeline);
    computePassEncoder.setBindGroup(0, hitboxBindGroup);
    // launches one thread per 9 pixels  (center pixel + 8 neighbors)
    computePassEncoder.dispatchWorkgroups(1,1,1);
    // computePassEncoder.dispatchWorkgroups(1,1,1);
    computePassEncoder.end();
    commandEncoder.copyBufferToBuffer(
        hitboxOutputBuffer,
        0, // Source offset
        stagingBuffer,
        0, // Destination offset
        hitboxBufferSize
      );
      device.queue.submit([commandEncoder.finish()]);
      await stagingBuffer.mapAsync(
        GPUMapMode.READ,
        0, // Offset
        hitboxBufferSize // Length
      );
      const copyArrayBuffer = stagingBuffer.getMappedRange(0, hitboxBufferSize);
      const data = copyArrayBuffer.slice();
      stagingBuffer.unmap();
      const pixelData = new Float32Array(data);
    // currentHitboxList will have entries like:
    //      matchPixel(pixel) { return pixel[1] > 0; },
    //      name: 'handle'
      if (currentHitboxList) {
        currentHighlightedHitbox = currentHitboxList.find(hitbox => { if (hitbox.matchPixel(pixelData)) { return hitbox.name; } });
      }
}

let previousString = "";
let wordCompleted = false;
async function renderLoop() {
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
    
   
    // Determine the video currently playing
    // Main video player logic
    let currentMainVideo;
    if (window.mainVideoPlayer.videoA.currentTime > 0 && !window.mainVideoPlayer.videoA.paused && !window.mainVideoPlayer.videoA.ended) {
        updateTextureIfNeeded(window.mainVideoPlayer.videoA, videoTexture, { width: screenWidth, height: screenHeight }, 'main');
    } else if (window.mainVideoPlayer.videoB.currentTime > 0 && !window.mainVideoPlayer.videoB.paused && !window.mainVideoPlayer.videoB.ended) {
        updateTextureIfNeeded(window.mainVideoPlayer.videoB, videoTexture, { width: screenWidth, height: screenHeight }, 'main');
    }
    // Cursor video player logic
    let currentCursorVideo;
    if (window.cursorVideoPlayer.videoA.currentTime > 0 && !window.cursorVideoPlayer.videoA.paused && !window.cursorVideoPlayer.videoA.ended) {
        updateTextureIfNeeded(window.cursorVideoPlayer.videoA, cursorVideoTexture, { width: cursorWidth, height: cursorHeight }, 'cursor');
    } else if (window.cursorVideoPlayer.videoB.currentTime > 0 && !window.cursorVideoPlayer.videoB.paused && !window.cursorVideoPlayer.videoB.ended) {
        updateTextureIfNeeded(window.cursorVideoPlayer.videoB, cursorVideoTexture, { width: cursorWidth, height: cursorHeight }, 'cursor');
    }
    let currentMaskVideo;
    if (window.mainVideoPlayer.maskVideoA.currentTime > 0 && !window.mainVideoPlayer.maskVideoA.paused && !window.mainVideoPlayer.maskVideoA.ended) {
        updateTextureIfNeeded(window.mainVideoPlayer.maskVideoA, hitboxVideoTexture, { width: screenWidth, height: screenHeight }, 'mask');
    } else if (window.mainVideoPlayer.maskVideoB.currentTime > 0 && !window.mainVideoPlayer.maskVideoB.paused && !window.mainVideoPlayer.maskVideoB.ended) {
        updateTextureIfNeeded(window.mainVideoPlayer.maskVideoB, hitboxVideoTexture, { width: screenWidth, height: screenHeight }, 'mask');
    }

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


    // Render to the canvas using WebGPU
    await renderFrame();
    // Call this function continuously to keep updating
    requestAnimationFrame(renderLoop);
}

const textFlashAnimationDuration = 100;  // 500ms or 0.5 seconds

window.onload = async function () {   
    overlayCanvas = document.getElementById("overlayCanvas");
    window.addEventListener('resize', function() {
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
    
        if (event.key === "ArrowRight") {
            window.userInput = "next";
        } else if (event.key === "Backspace" || event.key === "Escape") {
            window.cursorState = "blank";
            window.userString = "";
            userInputQueue = [];  // Clear the queue
        } else if (/^[a-zA-Z]$/.test(event.key)) {
            // For other input conditions
            window.userString += event.key.toLowerCase();
            userInputQueue.push(window.userString);
            isLetterAnimating = true;  // Set the flag
    
            // Reset the flag after a delay (corresponding to the duration of the animation + the half-second delay)
            setTimeout(() => {
                isLetterAnimating = false;
            }, textFlashAnimationDuration + 500);
        }
    });
    

    defaultCursor = new CursorPlugin(cursorVideoTexture, cursorFragmentShaderCode, defaultCursorEventHandlers);
    defaultCursor.setPlaygraph(cursorPlaygraph);
    // Set this default cursor as the current cursor
    CursorPlugin.setCursor(defaultCursor);

    // example of setting a different cursor
    // const alphaCursorPlaygraph = window.Playgraph.getPlaygraph('one').cursor;
    // alphaCursor = new CursorPlugin(cursorVideoTexture, alphaFragmentShaderCode, defaultCursorEventHandlers);
    // alphaCursor.setPlaygraph(alphaCursorPlaygraph);
    // CursorPlugin.setCursor(alphaCursor);

    // get the 'l' video node
    const blank = window.Playgraph.getPlaygraph('one').cursor.nodes.find(node => node.id === 'blank');
    // window.cursorVideoPlayer = new VideoPlayer(cursorPlaygraph, defaultCursorNextVideoStrategy, l);
    // window.cursorVideoPlayer = new VideoPlayer(cursorPlaygraph, keyboardMatchingCursorNextVideoStrategy, blank, false);
    window.cursorVideoPlayer = new VideoPlayer(cursorPlaygraph, getNextCursorVideo, blank, false);

    const playgraph = window.Playgraph.getPlaygraph('one').main;
    const second = window.Playgraph.getPlaygraph('one').main.nodes.find(node => node.id === "e:/emulsion_workspace/candidate_good/frames/img_0281.png");
    window.mainVideoPlayer = new VideoPlayer(playgraph, defaultNextVideoStrategy, second, true);
    // window.mainVideoPlayer.currentNodeIndex = playgraph.nodes.length - 1;
    let bothVideosLoaded = 0;
    // Add listeners for various user interactions
    document.addEventListener('click', function playOnInteraction() {
        renderLoop();
        if (window.mainVideoPlayer.videoA.readyState > 3) {
            window.mainVideoPlayer.videoA.play();
            // Preload next video
            const nextVideoPath = window.mainVideoPlayer.getNextVideoStrategy(window.mainVideoPlayer.videoA);
            window.mainVideoPlayer.videoB.src = nextVideoPath;

            // Check if mask is required and preload mask video
            const currentNode = playgraph.nodes.find(node => node.id === window.mainVideoPlayer.videoA.src.split("/main/")[1]);
            if (currentNode && currentNode.mask) {
                const nextMaskVideoPath = nextVideoPath.replace('.webm', '_mask.webm');
                window.mainVideoPlayer.maskVideoB.src = nextMaskVideoPath;
            }
            // Remove this listener since the video has started
            if (++bothVideosLoaded === 2) {
                document.removeEventListener('click', playOnInteraction);
            }
        }
        if (window.cursorVideoPlayer.videoA.readyState > 3) {
            window.cursorVideoPlayer.videoA.play();
            // Preload next video
            const nextVideoPath = window.cursorVideoPlayer.getNextVideoStrategy(window.cursorVideoPlayer.videoA);
            window.cursorVideoPlayer.videoB.src = nextVideoPath;
            if (++bothVideosLoaded === 2) {
                document.removeEventListener('click', playOnInteraction);
            }
        }
    });
    await renderFrame();
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

function defaultNextVideoStrategy(currentVideo) {
    // console.log('getting next for ', currentVideo.src);
    const currentNode = this.playgraph.nodes[this.currentNodeIndex];
    const currentEdgeIndex = currentNode.edges.findIndex(edge => currentVideo.src.includes(edge.id));
    let nextEdgeIndex = (currentEdgeIndex + 1) % currentNode.edges.length;

    // Select the next edge based on the global userInput variable
    const nextEdges = currentNode.edges.filter(edge => edge.tags.includes(window.userInput));
    if (nextEdges.length > 0) {
        nextEdgeIndex = currentNode.edges.indexOf(nextEdges[0]);
    }

    const nextVideoPath = `/main/${currentNode.edges[nextEdgeIndex].id}`;
    // console.log('so next is');
    // console.log(nextVideoPath);
    // Update the current node index if we transitioned to a different node
    const nextNodeId = currentNode.edges[nextEdgeIndex].to;
    const nextNodeIndex = this.playgraph.nodes.findIndex(node => node.id === nextNodeId);
    if (nextNodeIndex !== -1) {
        this.currentNodeIndex = nextNodeIndex;
    }
    console.log(nextVideoPath);
    return nextVideoPath;
}

const stateTransitions = {
    'blank': {
        'o': '/main/o_fast.webm',
        'l': '/main/l5.webm',
    },
    'o': {
        'op': '/main/op_3.webm',
    },
    'op': {
        'ope': '/main/ope_2.webm',
    },
    'ope': {
        'open': '/main/open_adj.webm',
    },
    'open': {
        'open_hover': '/main/open_new_hover.webm',
    },
    'l': {
        'lo': '/main/lo2.webm',
    },
    'lo': {
        'loo': '/main/loo2.webm',
    },
    'loo': {
        'look': '/main/look2.webm',
    },
    'look': {
        'look_at_handle_enter': '/main/look_at_handle_enter.webm',
    },
    'open_hover_exit': {
        'open_hover': '/main/open_hover.webm',
    }
};

const autoTransitions = {
    'open_hover_exit': 'open',
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

    const nextState = stateTransitions[window.cursorState] && stateTransitions[window.cursorState][nextUserInput];
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
        'o': 'main/o_idle.webm',
        'o_idle': 'main/o_idle.webm',
        'op': 'main/op_idle_5.webm',
        'op_idle': 'main/op_idle_5.webm',
        'ope': 'main/ope_idle.webm',
        'ope_idle': 'main/ope_idle.webm',
        'open': 'main/open_idle.webm',
        // 'look' sequence
        'l': 'main/l23_idle.webm',
        'l_idle': 'main/l23_idle.webm',
        'lo': 'main/lo3_idle.webm',
        'lo_idle': 'main/lo3_idle.webm',
        'loo': 'main/loo3_idle.webm',
        'loo_idle': 'main/loo3_idle.webm',
        'look': 'main/look3_idle.webm',
        'look_idle': 'main/look3_idle.webm',
        // 'look_at_handle' sequence
        'look_at_handle_enter': 'main/look_at_handle_idle.webm',
        'look_at_handle_idle': 'main/look_at_handle_idle.webm',
        'look_at_handle_hover': 'main/look_at_handle_hover.webm',
        'look_at_handle_leave': 'main/look_at_handle_leave.webm',
        // open hover sequence
        'open_hover': 'main/open_hover_idle.webm',
        'open_hover_idle': 'main/open_hover_idle.webm',
        'open_hover_exit': 'main/open_hover_exit.webm',
    };
    return defaults[state];
}

class VideoPlayer {
    constructor(playgraph, getNextVideoStrategy, initialNode=false, autoStart=true) {
        this.playgraph = playgraph;
        this.getNextVideoStrategy = getNextVideoStrategy.bind(this);
        this.blocked = false; // Initially, the player is not blocked
        this.videoA = this.createVideoElement();
        this.videoB = this.createVideoElement();
        this.maskVideoA = this.createVideoElement(); // for mask video
        this.maskVideoB = this.createVideoElement(); // for mask video
        this.videoA.onended = () => this.switchVideos(this.videoA, this.videoB, this.maskVideoA, this.maskVideoB);
        this.videoB.onended = () => this.switchVideos(this.videoB, this.videoA, this.maskVideoB, this.maskVideoA);
        this.videoQueue = []; // Initializing the video queue

        const startNode = initialNode ? initialNode : playgraph.nodes[playgraph.nodes.length - 1];
        // i use this for the cursor since it doesn't start immediately anyway:
        if (autoStart) {
            this.currentNodeIndex = playgraph.nodes.indexOf(startNode);
            this.videoA.src = `/main/${startNode.edges[0].id}`; // Assuming the main sub-folder contains the video files
        } else {
            this.currentNodeIndex = playgraph.nodes.indexOf(startNode);
            this.videoA.src = `/main/${startNode.name}`;
        }
    }

    enqueueVideo(videoPath) {
        this.videoQueue.push(videoPath);
    }

    dequeueAndPlayNextVideo() {
        // If the queue is empty, determine the next video using the strategy and enqueue it
        if (this.videoQueue.length === 0) {
            const currentVideo = this.videoA.paused ? this.videoB : this.videoA;
            this.enqueueVideo(this.getNextVideoStrategy(currentVideo));
        }
        return this.videoQueue.shift();
    }
    
    createVideoElement() {
        const videoElem = document.createElement('video');
        videoElem.style.pointerEvents = "none";
        videoElem.preload = 'auto';
        return videoElem;
    }

    isPlaying() {
        return !this.videoA.paused || !this.videoB.paused;
    }
    
    switchVideos(currentVideo, nextVideo, currentMaskVideo, nextMaskVideo) {
        if (this.blocked) return;
    
        this.enqueueVideo(this.getNextVideoStrategy(currentVideo, this.playgraph, window.userString));
        let nextVideoPath = this.dequeueAndPlayNextVideo();

        // Determine if a mask is needed
        const currentNode = this.playgraph.nodes[this.currentNodeIndex];
        const hasMask = currentNode && currentNode.mask;
        if (hasMask) {
            currentHitboxList = currentNode.mask;
            let maskVideoPath = nextVideoPath.replace('.webm', '_mask.webm');
            nextMaskVideo.src = maskVideoPath;
            nextMaskVideo.loop = true;
            nextMaskVideo.oncanplay = () => {
                nextMaskVideo.play();
                const subsequentVideo = (nextVideo === this.videoA) ? this.videoB : this.videoA;
                subsequentVideo.src = currentVideo.src.includes("_mask") ? currentVideo.src : currentVideo.src.replace(".webm", "_mask.webm");
                nextMaskVideo.oncanplay = null;  
            };
        } else {
            currentHitboxList = null;
        }
    
        nextVideo.src = nextVideoPath;  // Add random query string
        nextMaskVideo.preload = 'auto'; 
        nextVideo.oncanplay = () => {
            nextVideo.play();
            if (hasMask) {
                currentMaskVideo.currentTime = 0; // Reset mask video to the start
                currentMaskVideo.play(); // Play mask video explicitly when main video starts playing
            }
            // Determine the subsequent video and preload it
            const subsequentVideo = (nextVideo === this.videoA) ? this.videoB : this.videoA;
            subsequentVideo.src = currentVideo.src;  // Add random query string
            // Remove the oncanplaythrough event handler
            nextVideo.oncanplay = null;
        };
    
        // Reset userInput to 'idle' after selecting an edge
        // TODO THIS NEEDS TO BE made abstract
        window.userInput = 'idle';
        // window.cursorState = 'idle';
    }
}

