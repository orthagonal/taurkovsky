import { extractWebmPathsFromObject, getVideoSrc } from '../utilities.js';
import InteractiveVideo from '../InteractiveVideo.js';
import VideoPlayer from '../VideoPlayer.js';
import { DefaultShaderBehavior } from '../ShaderBehavior.js';
import SpellCursor from './SpellCursor.js';
import { DistortionShaderBehavior } from '../DistortionShaderBehavior.js';
import { mainVideoSwitcher } from './stateHandlers.js';
import playgraph from './intro_playgraphs.js';
// get all videos from playgraph object:
const webmPaths = extractWebmPathsFromObject(playgraph);
// will be passed in via start
let canvas;
let isLetterAnimating = false;
const textFlashAnimationDuration = 100;  // 500ms or 0.5 seconds
let previousString = "";
let wordCompleted = false; 
let mouseXNormalized;
let mouseYNormalized;
let cursorVariables = false;
let device;
let context;
let mousePositionBuffer;
let mainBehavior;


const maxAnchors = new Float32Array([
  // Default anchor points values (x, y) pairs
  // Top-left, 
  1.0, 1.0, 0.0, 0.0,
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

const minAnchors = new Float32Array([
  // Default anchor points values (x, y) pairs
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

moduleState = {
  started: false,
  // the current 'scene' and playgraph we are in 
  scene: 'intro',
  time:  0,
  timeIncrement: 0.02, // effectively how fast things are happening
  // current state of the module, correspondds to a clique or highly-connected sub-graph in the playgraph
  playgraphState: 'blank',
  mainUserInputQueue: [""],
  cursorUserInputQueue: [""],
  distortionAnchors: {
    maxAnchors,
    minAnchors
  },
  // cumulative string the user has typed
  userString: "",
};


// this function is called by the VideoPlayer to determine the next video to play
function mainNextVideoStrategy(currentVideo) {
  distortAnchors();
  return mainVideoSwitcher(currentVideo, moduleState, playgraph);
}

// the main DOM operations loop
function updateTextAndCursor() {
  return new Promise((resolve, reject) => {
    // console.time('dom_render');
    const textContainer = document.getElementById('textContainer');
    const latestLetterContainer = document.getElementById('latestLetterContainer');
    textContainer.style.left = `${mouseXNormalized * 100}%`;
    textContainer.style.top = `${20 + mouseYNormalized * 100}%`;
    if (!cursorVariables.cursorActive) {
      if (moduleState.userString !== previousString) {
        const lastChar = moduleState.userString.charAt(moduleState.userString.length - 1);
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

        previousString = moduleState.userString;
      }

      textContainer.textContent = moduleState.userString;
      textContainer.style.color = 'white';

      if (wordCompleted) {
        textContainer.classList.add("flash-animation");

        setTimeout(() => {
          textContainer.classList.remove("flash-animation");
        }, 500);
        wordCompleted = false;
      }

    } else {
      moduleState.userString = "";
      textContainer.textContent = "";
      latestLetterContainer.textContent = ""; // Clear the latest letter when cursor is active
    }
    // console.timeEnd('dom_render');
    resolve();
  });
}

// get the next *mask* video, where available
function getNextCursorMaskVideo(currentVideo, playgraph, userInput) {
  const nextUserInput = moduleState.cursorUserInputQueue.shift() || '';
  // if we're just staying in blank mode
  if (this.cursorState !== 'blank') {
    return 'main/stretch2_3l_idle_mask.webm';
  }
  return 'main/blank.webm';
}

// get the next *main* video
function getNextCursorVideo(currentVideo, playgraph, userInput) {
  const nextUserInput = moduleState.cursorUserInputQueue.shift() || '';
  // if we're just staying in blank mode
  if (this.cursorState === 'blank' && nextUserInput === '') {
    return 'main/blank.webm';
  }
  const vocabularyWord = this.findVocabularyWord(this.cursorState);
  const vocabulary = this.cursorVocabulary[vocabularyWord];
  let nextFragment = vocabulary[this.cursorState];
  if (!nextFragment) {
    alert('error no next fragment for ', this.cursorState);
    return 'main/blank.webm';
  }
  const nextState = nextUserInput !== '' ? nextUserInput : this.cursorState;
  if (nextState === this.cursorState) {
    return nextFragment.idle;
  }
  if (nextState !== this.cursorState) {
    if (nextState === 'l') {
      this.switchToMaskCursor();
    }
    this.cursorState = nextState;
    return vocabulary[nextFragment.next].entry;
  }

  return 'main/blank.webm';
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
        moduleState.cursorUserInputQueue = ['open_hover'];
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
        moduleState.cursorUserInputQueue = ['look_at_handle_enter'];
        return;
      }
    }
    if (this.cursorState === 'look_at_handle_idle') {
      this.cursorState = 'look_at_handle_exit';
      moduleState.cursorUserInputQueue = ['look'];
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

async function start(window, gpuDefinitions, renderLoop) {
  const { context, linearSampler, hitboxBGL, cursorConstants, vertexConstantsBuffer } = gpuDefinitions;
  // define a few things in global here
  cursorVariables = gpuDefinitions.cursorVariables;
  mousePositionBuffer = gpuDefinitions.mousePositionBuffer;
  device = gpuDefinitions.device;
  canvas = gpuDefinitions.canvas;

  const videoPlayer = new VideoPlayer(webmPaths, mainNextVideoStrategy, false);
  // const mainBehavior = new DefaultShaderBehavior([videoPlayer]);
  mainBehavior = new DistortionShaderBehavior([videoPlayer]);
  moduleState.distortionAnchors.currentAnchors = mainBehavior.defaultAnchors;
  window.mainInteractiveVideo = new InteractiveVideo(gpuDefinitions, videoPlayer, mainBehavior);
  // window.hitboxShader = new HitboxShaderBehavior(gpuDefinitions, window.spellCursor);

  const cursorVocabulary = {
    '_masks': [
      'main/stretch2_3l_idle_mask.webm',
      'main/stretch1_3look_idle_mask.webm',
    ],
    'blank': {
      'blank': { entry: 'main/blank.webm', idle: 'main/blank.webm', next: 'blank' },
    },
    'open': {
      'o': { entry: 'main/o2.webm', idle: 'main/o2_idle.webm', next: 'op' },
      'op': { entry: 'main/op4.webm', idle: 'main/op_idle.webm', next: 'ope' },
      'ope': { entry: 'main/ope4.webm', idle: 'main/ope5_idle.webm', next: 'open' },
      'open': { entry: 'main/open_4.webm', idle: 'main/open_idle.webm', next: 'open' },
    },
    'look': {
      'l': { entry: 'main/3l.webm', idle: 'main/stretch2_3l_idle.webm', next: 'lo' },
      'lo': { entry: 'main/3lo.webm', idle: 'main/stretch_3lo_idle.webm', next: 'loo' },
      'loo': { entry: 'main/3loo.webm', idle: 'main/3loo_idle.webm', next: 'look' },
      'look': { entry: 'main/3look.webm', idle: 'main/stretch1_3look_idle.webm', next: 'look' },
    }
  };
  const cursorPlan = {
    main: getNextCursorVideo,
    mask: getNextCursorMaskVideo
  };
  window.spellCursor = new SpellCursor(cursorVocabulary, cursorPlan, gpuDefinitions, defaultCursorEventHandlers);
  // Create the default cursor using the cursor plugin class
  window.spellCursor.currentNodeIndex = 0;
  renderLoop();
  await new Promise(r => setTimeout(r, 200));
  await window.mainInteractiveVideo.start('main/blank.webm');
  // await window.spellCursor.start('main/blank.webm');
}

function distortAnchors() {
  // Update the anchor buffer with the distorted anchors
  // mainBehavior.updateAnchorBuffer(window.mainInteractiveVideo.webgpu, moduleState.distortionAnchors.currentAnchors);
  // Increment time for the next distortion cycle
  moduleState.time += moduleState.timeIncrement;
}

// i need to make it so that only one place advances the game state
// and the ohter handles getting the correct video
const handleEvent = (window, eventName, event) => {
  if (!window.spellCursor) return;
  if (isLetterAnimating) return;  // If a letter is animating, ignore other keypresses
  // any key to exit a text state
  if (window.spellCursor.cursorState === 'look_at_handle_idle') {
    moduleState.cursorUserInputQueue = ['look_at_handle_exit'];
    return;
  }
  if (moduleState.playgraphState === 'see') {
    // need to reset anchors to default
    if (event.key === "ArrowRight") {
      moduleState.playgraphState = 'see_to_lamp';
    }
  }
  if (event.key === "Backspace" || event.key === "Escape") {
    window.spellCursor.cursorState = "blank";
    moduleState.userString = "";
    moduleState.cursorUserInputQueue = [];  // Clear the queue
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    // For other input conditions
    moduleState.userString += event.key.toLowerCase();
    moduleState.cursorUserInputQueue.push(moduleState.userString);
    moduleState.mainUserInputQueue.push(moduleState.userString);
    isLetterAnimating = true;  // Set the flag
    // Reset the flag after a delay (corresponding to the duration of the animation + the half-second delay)
    setTimeout(() => {
      isLetterAnimating = false;
    }, textFlashAnimationDuration + 500);
  }
};

module.exports = {
  start,
  mainNextVideoStrategy,
  handleEvent,
  updateTextAndCursor,
};
