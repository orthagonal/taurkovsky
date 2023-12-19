import { CursorMaskShaderBehavior, CursorNoMaskShaderBehavior } from './SpellCursorBehaviors.js';
import InteractiveVideo from './InteractiveVideo.js';
import VideoPlayer from './VideoPlayer.js';

function extractWebmPathsFromVocabulary(cursorVocabulary) {
  let webmPaths = new Set(); // Using a Set to avoid duplicates

  for (const wordFragments of Object.values(cursorVocabulary)) {
    for (const fragment of Object.values(wordFragments)) {
      webmPaths.add(fragment.entry);
      webmPaths.add(fragment.idle);
    }
  }

  return Array.from(webmPaths); // Convert the set back to an array
}

class SpellCursor {
  constructor(cursorVocabulary, nextVideoFunction, webgpuOptions, eventHandlers) {
    this.cursorVocabulary = cursorVocabulary;
    // Initialize video players
    const videoList = extractWebmPathsFromVocabulary(cursorVocabulary);
    videoList.push('/main/blank.webm');
    console.log('cursor starting with videoList', videoList);
    this.cursorVideoPlayer = new VideoPlayer(videoList, nextVideoFunction.bind(this));
    // this.maskVideoPlayer = new VideoPlayer(playgraph, nextVideoFunction.bind(this));

    // Default to no-mask cursor behavior
    this.currentBehavior = new CursorNoMaskShaderBehavior([this.cursorVideoPlayer]);

    // Initialize InteractiveVideo
    this.interactiveVideo = new InteractiveVideo(webgpuOptions, [this.cursorVideoPlayer], this.currentBehavior);

    // Register event handlers
    this.eventHandlers = eventHandlers;
    for (const [event, handler] of Object.entries(eventHandlers)) {
      console.log('registering', event, handler);
      // Assuming the event handling setup
      const boundHandler = handler.bind(this);
      window.addEventListener(event, boundHandler);
    }
    // the main way we control the cursor is via it's state
    this.cursorState = 'blank';
  }

  findVocabularyWord(fragment) {
    for (const [word, fragments] of Object.entries(this.cursorVocabulary)) {
      if (fragments.hasOwnProperty(fragment)) {
        return word;
      }
    }
    if (fragment === 'blank') {
      return 'blank';
    }
    return null; // or handle this case as appropriate
  }

  switchToMaskCursor() {
    // Switch to mask cursor behavior
    this.currentBehavior = new CursorMaskShaderBehavior([this.cursorVideoPlayer, this.maskVideoPlayer]);
    this.interactiveVideo.setShaderBehavior(this.currentBehavior);
  }

  switchToNoMaskCursor() {
    // Switch back to no-mask cursor behavior
    this.currentBehavior = new CursorNoMaskShaderBehavior([this.cursorVideoPlayer]);
    this.interactiveVideo.setShaderBehavior(this.currentBehavior);
  }

  async start(path) {
    await this.cursorVideoPlayer.start(path);
  }

  renderFrame(renderPassEncoder) {
    this.interactiveVideo.renderFrame(renderPassEncoder);
  }
}


export default SpellCursor;

/*

// todo we will refactor a Cursor object that contains this and the other stuff
// for the cursor to be self-contained
function defaultCursorNextVideoStrategy(currentVideo) {
    const currentNode = this.cursorPlaygraph.nodes[this.currentNodeIndex];
    const currentEdgeIndex = currentNode.edges.findIndex(edge => currentVideo.src.includes(edge.id));
    let nextEdgeIndex = (currentEdgeIndex + 1) % currentNode.edges.length;

    // Select the next edge based on the global cursorState variable
    const nextEdges = currentNode.edges.filter(edge => edge.tags.includes(this.cursorState));
    if (nextEdges.length > 0) {
        nextEdgeIndex = currentNode.edges.indexOf(nextEdges[0]);
    }

    const nextVideoPath = `/main/${currentNode.edges[nextEdgeIndex].id}`;

    // Update the current node index if we transitioned to a different node
    const nextNodeId = currentNode.edges[nextEdgeIndex].to;
    const nextNodeIndex = this.cursorPlaygraph.nodes.findIndex(node => node.id === nextNodeId);
    if (nextNodeIndex !== -1) {
        this.currentNodeIndex = nextNodeIndex;
    }
    return nextVideoPath;
}


const stateTransitions = {
    'blank': {
        'o': '/main/o.webm',
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
}


function getNextCursorVideo(currentVideo, playgraph, userInput) {
    const nextUserInput = userInputQueue.shift() || '';
    if (this.cursorState === 'blank') {
        if (nextUserInput === 'o') {
            this.cursorState = 'o';
            return '/main/o.webm';
        }
    }
    if (this.cursorState === 'o' || this.cursorState === 'o_idle') {
        return '/main/o_idle.webm';
    }
    // Check for automatic transitions first
    const autoTransitionState = autoTransitions[this.cursorState];
    if (autoTransitionState) {
        const currentState = this.cursorState;
        this.cursorState = autoTransitionState;
        return getDefaultVideoForState(currentState) || currentVideo.src;
    }

    if (nextUserInput === '') {
        return getDefaultVideoForState(this.cursorState) || currentVideo.src;
    }

    let nextState = stateTransitions[this.cursorState] && stateTransitions[this.cursorState][nextUserInput];
    if (typeof nextState === 'object') {
        nextState = nextState[window.mainState];
        if (!nextState) {
            nextState = stateTransitions[this.cursorState][nextUserInput].default;
        }
    }
    if (nextState) {
        this.cursorState = nextUserInput;
        return nextState;
    } else {
        userInputQueue.unshift(nextUserInput); // push it back as it wasn't consumed
        return getDefaultVideoForState(this.cursorState) || currentVideo.src;
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

*/