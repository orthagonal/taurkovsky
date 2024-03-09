import { extractWebmPathsFromObject, getVideoSrc } from '../utilities.js';
import InteractiveVideo from '../InteractiveVideo.js';
import VideoPlayer from '../VideoPlayer.js';
import { DefaultShaderBehavior } from '../ShaderBehavior.js';
import SpellCursor from './SpellCursor.js';
import { CursorNoMaskShaderBehavior } from './SpellCursorBehaviors.js';
import { DistortionShaderBehavior } from '../DistortionShaderBehavior.js';
// import { MultiTextureShaderBehavior } from '../MultitextureBehavior.js';
import { mainVideoSwitcher } from './stateHandlers.js';
import playgraph from './intro_playgraphs.js';
import { narrationVideoSwitcher, narrationPlaygraph } from './narrationStateHandlers.js';

import { firstLetterVideoSwitcher, secondLetterVideoSwitcher, thirdLetterVideoSwitcher, wordPlaygraph } from './wordStateHandlers.js';


// get all videos from playgraph object:
const mainWebmPaths = extractWebmPathsFromObject(playgraph);
const narrationWebmPaths = extractWebmPathsFromObject(narrationPlaygraph);
const wordWebmPaths = extractWebmPathsFromObject(wordPlaygraph);

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
let narrationBehavior;


const adjustValue = (value, incrementRange, max, min) => {
  const posOrNeg = Math.random() < 0.5 ? -1 : 1;
  const incrementAmount = Math.random() * incrementRange * posOrNeg;
  const newValue = value + incrementAmount;
  if (newValue > max) {
    return value;
  }
  if (newValue < min) {
    return value;
  }
  return newValue;
};


// the one true underlying state of the game
// video and DOM state are derived from this
moduleState = {
  gpuDefinitions: null,
  started: false,
  // the current 'scene' and playgraph we are in 
  scene: 'intro',
  time: 0,
  timeIncrement: 1, // effectively how fast things are happening
  // current state of the module, correspondds to a clique or highly-connected sub-graph in the playgraph
  playgraphState: 'blank',
  narrationState: 'blank',
  wordState: {
    letterPositions: [
      // position xy, rotation, (next digit is padding), scale xy, two more zeros for gpu padding
      [0.5, 0.1, 0.0, 0.0, 0.25, 0.25, 1.0, 1.0],
      [0.54, 0.1, 0.0, 0.0, 0.25, 0.25, 1.0, 1.0],
      [0.59, 0.1, 0.0, 0.0, 0.25, 0.25, 1.0, 1.0],
    ],
    currentLetterPlayingForward: [false, false, false],
    introVideoHasBeenPlayed: [false, false, false],
    letterIsVisible: [false, false, false],
  },
  mainUserInputQueue: [""],
  cursorUserInputQueue: [""],
  showSlots: false,
  distortionAnchors: {
  },
  keyboardInput: {
    cumulativeUserString: "",
    expectedUserString: "see",
    nextExpectedChar: "s",
    charMatches: false,
    charMismatchToHandle: false,
  },
  keywordLength: 3,
  // cumulative string the user has typed
  String: "",
};


// this function is called by the VideoPlayer to determine the next video to play
function mainNextVideoStrategy(currentVideo) {
  distortAnchors();
  return mainVideoSwitcher(currentVideo, moduleState, playgraph);
}

function narrationNextVideoStrategy(currentVideo) {
  return narrationVideoSwitcher(currentVideo, moduleState, playgraph);
}

// the main DOM operations loop
function localUpdateDOM() {
  return new Promise((resolve, reject) => {
    const textContainer = document.getElementById('textContainer');
    const latestLetterContainer = document.getElementById('latestLetterContainer');
    if (moduleState.keyboardInput.charMismatchToHandle) {
      latestLetterContainer.textContent = moduleState.keyboardInput.charMismatchToHandle;
      moduleState.keyboardInput.charMismatchToHandle = false;
      latestLetterContainer.style.color = "red";
      const xMark = document.createElement('span');
      xMark.textContent = 'X';
      xMark.style.color = "red";
      xMark.style.fontWeight = "bold";
      latestLetterContainer.appendChild(xMark);
      setTimeout(() => {
        latestLetterContainer.classList.add('fade-out');
        latestLetterContainer.addEventListener('transitionend', () => {
          latestLetterContainer.textContent = '';
          latestLetterContainer.classList.remove('fade-out');
          moduleState.keyboardInput.charMismatchToHandle = false; // Ready for next mismatch
        });
      }, 1000);
      // const rejectSound = new Audio('path/to/your/reject.mp3');
      // rejectSound.play();
    }
    // Handle word display slots, turned off for now 
    // const keywordSlotsContainer = document.getElementById('keywordSlots');
    // keywordSlotsContainer.innerHTML = ''; 
    // if (moduleState.showSlots) {
    //   keywordSlotsContainer.classList.add('fade-in'); 
    // } else {
    // keywordSlotsContainer.classList.remove('fade-in');
    // keywordSlotsContainer.classList.add('fade-out');
    // }
    if (!cursorVariables.cursorActive) {
      if (moduleState.keyboardInput.cumulativeUserString !== previousString) {
        latestLetterContainer.style.color = 'white';
        const lastChar = moduleState.keyboardInput.cumulativeUserString.charAt(moduleState.keyboardInput.cumulativeUserString.length - 1);
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

        previousString = moduleState.keyboardInput.cumulativeUserString;
      }

      textContainer.textContent = moduleState.keyboardInput.cumulativeUserString;
      textContainer.style.color = 'white';

      if (wordCompleted) {
        textContainer.classList.add("flash-animation");

        setTimeout(() => {
          textContainer.classList.remove("flash-animation");
        }, 500);
        wordCompleted = false;
      }

    } else {
      moduleState.keyboardInput.cumulativeUserString = "";
      textContainer.textContent = "";
      latestLetterContainer.textContent = ""; // Clear the latest letter when cursor is active
    }
    // Clear textContainer
    textContainer.textContent = "";

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
    const mousePositionArray = new Float32Array([mouseXNormalized, mouseYNormalized, 1.0, 0.0]);
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

const letterPositionBuffers = [];
const letterPositionArrays = [];

// the main place where the game starts
async function start(window, gpuDefinitions, renderLoop) {
  // get all the webgpu definitions
  const { context, linearSampler, hitboxBGL, cursorConstants, vertexConstantsBuffer } = gpuDefinitions;
  cursorVariables = gpuDefinitions.cursorVariables;
  mousePositionBuffer = gpuDefinitions.mousePositionBuffer;
  device = gpuDefinitions.device;
  canvas = gpuDefinitions.canvas;
  for (let i = 0; i < moduleState.wordState.letterPositions.length; i++) {
    const buffer = device.createBuffer({
      size: 32,  // Each buffer is padded out to at least 32 bytes
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    letterPositionBuffers.push(buffer);
    letterPositionArrays.push(new Float32Array(moduleState.wordState.letterPositions[i]));
    device.queue.writeBuffer(
      buffer,
      0,
      letterPositionArrays[i].buffer
    );
  }
  // this is the main update loop for the game, needs access to webgpu to do webgpu things
  moduleState.gpuDefinitions = gpuDefinitions;
  // set up all the shaders and their corresponding video players:
  // main video player
  const mainVideoPlayer = new VideoPlayer(mainWebmPaths, mainNextVideoStrategy, false);
  mainBehavior = new DistortionShaderBehavior([mainVideoPlayer]);
  // mostly plays audio and subtitle tracks over the main video
  const narrationVideoPlayer = new VideoPlayer(narrationWebmPaths, narrationNextVideoStrategy, false);
  narrationBehavior = new DistortionShaderBehavior([narrationVideoPlayer]);

  // layer that shows the letters / words the user is typing
  const firstLetterVideoPlayer = new VideoPlayer(wordWebmPaths, (currentVideo) => firstLetterVideoSwitcher(currentVideo, moduleState, wordPlaygraph), false);
  const firstLetterShader = new CursorNoMaskShaderBehavior([firstLetterVideoPlayer], letterPositionBuffers[0]);

  const secondLetterVideoPlayer = new VideoPlayer(wordWebmPaths, (currentVideo) => secondLetterVideoSwitcher(currentVideo, moduleState, wordPlaygraph), false);
  const secondLetterShader = new CursorNoMaskShaderBehavior([secondLetterVideoPlayer], letterPositionBuffers[1]);

  const thirdLetterVideoPlayer = new VideoPlayer(wordWebmPaths, (currentVideo) => thirdLetterVideoSwitcher(currentVideo, moduleState, wordPlaygraph), false);
  const thirdLetterShader = new CursorNoMaskShaderBehavior([thirdLetterVideoPlayer], letterPositionBuffers[2]);

  const mainInteractiveVideo = new InteractiveVideo(gpuDefinitions, mainVideoPlayer, mainBehavior);
  const narrationInteractiveVideo = new InteractiveVideo(gpuDefinitions, narrationVideoPlayer, narrationBehavior);
  const firstLetterInteractiveVideo = new InteractiveVideo(gpuDefinitions, firstLetterVideoPlayer, firstLetterShader);
  const secondLetterInteractiveVideo = new InteractiveVideo(gpuDefinitions, secondLetterVideoPlayer, secondLetterShader);
  const thirdLetterInteractiveVideo = new InteractiveVideo(gpuDefinitions, thirdLetterVideoPlayer, thirdLetterShader);

  // wordBehavior = new MultiTextureShaderBehavior([wordVideoPlayer], moduleState.letterPositions);
  // const firstLetterInteractiveVideo = new InteractiveVideo(gpuDefinitions, wordVideoPlayer, wordBehavior);
  // const wordInteractiveVideo = new InteractiveVideo(gpuDefinitions, wordVideoPlayer, wordBehavior);
  // const hitboxShader = new HitboxShaderBehavior(gpuDefinitions, window.spellCursor);

  window.interactiveVideos = [mainInteractiveVideo, narrationInteractiveVideo, firstLetterInteractiveVideo, secondLetterInteractiveVideo, thirdLetterInteractiveVideo];
  window.mainInteractiveVideo = mainInteractiveVideo;
  const circleElement = document.querySelector('.draggable-circle');
  const overlayContainer = document.querySelector('body');//.overlay-container');
  const webgpuCanvas = document.getElementById('webgpuCanvas');

  moduleState.distortionAnchors.currentAnchors = mainBehavior.currentAnchors;

  const cursorVocabulary = {
    "_masks": [
      "main/stretch2_3l_idle_mask.webm",
      "main/stretch1_3look_idle_mask.webm",
    ],
    "blank": {
      "blank": {
        entry: "main/blank.webm",
        idle: "main/blank.webm",
        next: "blank"
      },
    },
    "open": {
      "o": {
        entry: "main/o2.webm",
        idle: "main/o2_idle.webm", next: "op"
      },
      "op": {
        entry: "main/op4.webm",
        idle: "main/op_idle.webm", next: "ope"
      },
      "ope": {
        entry: "main/ope4.webm",
        idle: "main/ope5_idle.webm", next: "open"
      },
      "open": {
        entry: "main/open_4.webm",
        idle: "main/open_idle.webm", next: "open"
      },
    },
    "look": {
      "l": {
        entry:
          "main/3l.webm",
        idle: "main/stretch2_3l_idle.webm", next: "lo"
      },
      "lo": {
        entry: "main/3lo.webm",
        idle: "main/stretch_3lo_idle.webm", next: "loo"
      },
      "loo": {
        entry: "main/3loo.webm",
        idle: "main/3loo_idle.webm", next: "look"
      },
      "look": {
        entry: "main/3look.webm",
        idle:

          "main/stretch1_3look_idle.webm", next: "look"
      },
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
  await mainInteractiveVideo.start('main/blank.webm');
  await narrationInteractiveVideo.start('main/blank.webm');
  await firstLetterInteractiveVideo.start('main/blank.webm');
  await secondLetterInteractiveVideo.start('main/blank.webm');
  await thirdLetterInteractiveVideo.start('main/blank.webm');
  // await window.spellCursor.start('main/blank.webm');
  // the game state updating function is returned to the main engine
  return function () {
    // letterPositionBuffers.forEach((buffer, i) => {
    //   device.queue.writeBuffer(
    //     buffer,
    //     0,
    //     new Float32Array(moduleState.wordState.letterPositions[i]).buffer
    //   );
    // });
    updateLetterPositions();
    localUpdateDOM();
    moduleState.time += moduleState.timeIncrement;
  };
}


function updateLetterPositions() { // Renamed for clarity
  const maxDistance = 0.06; 
  const minDistance = 0.02; // min distance each letter moves to the right of the previous letter
  const driftSpeed = 0.0005;
  const subsequentLetterDriftSpeed = 0.0000005
  // const subsequentLetterDriftSpeedY = 0.000000 5

  for (let letterIndex = 0; letterIndex < moduleState.wordState.letterPositions.length; letterIndex++) {
    let x = moduleState.wordState.letterPositions[letterIndex][0];
    let y = moduleState.wordState.letterPositions[letterIndex][1];

    // calculate the new letter position differently based on whether it's the first or subsequent letter
    if (letterIndex === 0) {
      // initialize the first letter to a random position then 'drift' it on each update after that
      if (moduleState.time === 0) {
        x = Math.random() * 0.3; // Between 0 and 30% of the screen width from the left
        y = Math.random() * 0.8 + 0.1; // Random vertical position (10% from top to 90% from top)
      }
      const driftDirection = Math.random() < 0.5 ? -1 : 1;
      x += driftSpeed * driftDirection;

      // Keep within bounds of left side
      x = Math.max(0, Math.min(x, 0.1));

      y += driftSpeed * driftDirection;
      y = Math.max(0, Math.min(y, 0.9));
    } else {

      const anchorX = moduleState.wordState.letterPositions[letterIndex - 1][0];
      const anchorY = moduleState.wordState.letterPositions[letterIndex - 1][1];

      let driftDirection = Math.random() < 0.5 ? -1 : 1;
      x += subsequentLetterDriftSpeed * driftDirection; 
      x = Math.max(anchorX + minDistance, x);
      x = Math.min(x, anchorX + maxDistance); // Right constraint

      driftDirection = Math.random() < 0.5 ? -1 : 1;
      y += subsequentLetterDriftSpeed * driftDirection;
      y = Math.max(anchorY - minDistance, Math.min(y, anchorY + minDistance));
      y = Math.min(y, anchorY + maxDistance);

      const rotSpeed = 0.001;
      const rotDirection = Math.random() < 0.5 ? -1 : 1;
      moduleState.wordState.letterPositions[letterIndex][2] += rotSpeed * rotDirection;
      moduleState.wordState.letterPositions[letterIndex][2] = Math.min(moduleState.wordState.letterPositions[letterIndex][2], 0.15);
  
    }

    // Update letterPositions and the buffer with the new value
    moduleState.wordState.letterPositions[letterIndex][0] = x;
    moduleState.wordState.letterPositions[letterIndex][1] = y;

    device.queue.writeBuffer(
      letterPositionBuffers[letterIndex],
      0,
      new Float32Array(moduleState.wordState.letterPositions[letterIndex]).buffer
    );
  }
}

function distortAnchors() {
  mainBehavior.updateAnchorBuffer(moduleState.gpuDefinitions, moduleState.distortionAnchors.currentAnchors);
  if (moduleState.resetAnchors) {
    moduleState.resetAnchors = false;
    mainBehavior.resetWeights();
  }
  // moduleState += moduleState.timeIncrement;
}

// i need to make it so that only one place advances the game state
// and the other handles getting the correct video
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
      moduleState.distortionAnchors.currentAnchors[8] += 0.01;
      // moduleState.distortionAnchors.currentAnchors[8] += 0.01;
      // moduleState.playgraphState = 'see_to_lamp';
    }
  }
  if (event.key === 'ArrowLeft') {
    moduleState.showSlots = !moduleState.showSlots;
  }
  if (event.key === "Backspace" || event.key === "Escape") {
    window.spellCursor.cursorState = "blank";
    moduleState.keyboardInput.cumulativeUserString = "";
    moduleState.cursorUserInputQueue = [];  // Clear the queue
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    // handler for any alphabet key
    const inputChar = event.key.toLowerCase();
    const keyboardInput = moduleState.keyboardInput;
    // Check if the input matches the next expected character
    if (keyboardInput.expectedUserString && inputChar === keyboardInput.nextExpectedChar) {
      keyboardInput.cumulativeUserString += inputChar;
      keyboardInput.nextExpectedChar = keyboardInput.expectedUserString[keyboardInput.cumulativeUserString.length];
      // moduleState.keyboardInput.cumulativeUserString += event.key.toLowerCase();
      moduleState.cursorUserInputQueue.push(keyboardInput.cumulativeUserString);
      moduleState.mainUserInputQueue.push(keyboardInput.cumulativeUserString);
      keyboardInput.charMatches = true;
    } else {
      keyboardInput.charMatches = false;
      keyboardInput.charMismatchToHandle = inputChar;
    }
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
  handleEvent
};
