// const turbulenceFragmentShaderCode = `
// struct Constants {
//     turbulenceLevel: f32,
//     activeLevel: f32,
//     screenWidth: f32,
//     screenHeight: f32
// };

// @group(0) @binding(0) var<uniform> constants: Constants;

// fn hash(n: vec2<f32>) -> vec2<f32> {
//     return fract(sin(vec2<f32>(dot(n, vec2<f32>(127.1, 311.7)), 
//                         dot(n, vec2<f32>(269.5, 183.3)))) * 43758.5453);
// }

// fn noise(pos: vec2<f32>) -> f32 {
//     var i = floor(pos);
//     var f = fract(pos);
//     var a = hash(i);
//     var b = hash(i + vec2<f32>(1.0, 0.0));
//     var c = hash(i + vec2<f32>(0.0, 1.0));
//     var d = hash(i + vec2<f32>(1.0, 1.0));
//     var u = f * f * (3.0 - 2.0 * f);
//     return mix(a.x, b.x, u.x) + 
//             (c.x - a.x) * u.y * (1.0 - u.x) + 
//             (d.x - b.x) * u.x * u.y;
// }

// @fragment
// fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
//     var turbulenceValue = noise(fragUV * vec2<f32>(constants.screenWidth, constants.screenHeight) * constants.distortion);
//     return vec4<f32>(vec3<f32>(turbulenceValue), constants.activeLevel);
// }
// `;


// const distortPreviousFragmentShaderCode = `
// struct Constants {
//     screenWidth: f32,
//     screenHeight: f32,
//     cursorWidth: f32,
//     cursorHeight: f32,
//     turbulenceLevel: f32,
//     activeLevel: f32
// };

// @group(0) @binding(3) var<uniform> constants: Constants;

// struct MousePosition {
//     mousePosition: vec2<f32>
// };

// @group(0) @binding(2) var<uniform> mousePosition: MousePosition;

// @fragment
// fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec2<f32> {
//     // Calculate distance from current fragment to cursor center
//     var dist = distance(fragUV, mousePosition.mousePosition);

//     if (dist < constants.activeLevel) {
//         var effectStrength = (1.0 - dist / constants.activeLevel) * constants.distortion;
//         var distortionDirection = normalize(mousePosition.mousePosition - fragUV);
//         var distortedUV = fragUV + distortionDirection * effectStrength;
        
//         return distortedUV;
//     }
//     return fragUV; // Return the unchanged fragUV outside cursor region
// }
// `;

// const distortionShaderCode = `
// struct TurbulenceUniform {
//     turbulenceLevel: f32,
//     effectRadius: f32
// };
// @group(0) @binding(4) var<uniform> turbulence: TurbulenceUniform; // Define this struct to have turbulenceLevel: f32

// struct MousePosition {
//     mousePosition: vec2<f32>
// };
// @group(0) @binding(2) var<uniform> mousePosition: MousePosition;


// @group(0) @binding(0) var mySampler: sampler;
// @group(0) @binding(1) var smallTexture: texture_2d<f32>;

// @fragment
// fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
//     // Calculate distance from current fragment to cursor center
//     var dist = distance(fragUV, mousePosition.mousePosition);

//     if (dist < turbulence.effectRadius) {
//         var effectStrength = (1.0 - dist / turbulence.effectRadius) * turbulence.distortion;
//         var distortionDirection = normalize(mousePosition.mousePosition - fragUV);
//         var distortedUV = fragUV + distortionDirection * effectStrength;

//         return textureSampleBaseClampToEdge(smallTexture, mySampler, distortedUV);
//     }
//     return vec4<f32>(0.0, 0.0, 0.0, 0.0); // Return transparent color outside cursor region
// }
// `;

// src/trailer/src.js
class Cursor {
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

export { Cursor }