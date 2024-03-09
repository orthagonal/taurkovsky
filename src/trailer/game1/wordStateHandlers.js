const wordPlaygraph = {
  blank: 'main/blank.webm',
  see: {
    blank: 'main/blank.webm',
    s: {
      // plays one time at the very ver beginning
      blank_to_blue_s: 'game1/clips/blank_to_s_yellow.webm',
      blue_s: 'game1/clips/s_yellow.webm',
      blue_s_infinite: 'game1/clips/s_yellow_infinite.webm',
    },
    e: {
      // plays one time at the very ver beginning
      blank_to_blue_e: 'game1/clips/blank_to_e_yellow.webm',
      blue_e: 'game1/clips/e_yellow.webm',
      blue_e_infinite: 'game1/clips/e_yellow_infinite.webm',
    },
    blue: {
      s: {
        // plays one time at the very ver beginning
        blank_to_blue_s: 'game1/clips/blank_to_blue_s.webm',
        blue_s: 'game1/clips/blue_s.webm',
        blue_s_infinite: 'game1/clips/blue_s_infinite.webm',
      },
      e: {
        // plays one time at the very ver beginning
        blank_to_blue_e: 'game1/clips/blank_to_blue_e.webm',
        blue_e: 'game1/clips/blue_e.webm',
        blue_e_infinite: 'game1/clips/blue_e_infinite.webm',
      },
      }
  }
};

function firstLetterVideoSwitcher(currentVideo, moduleState, playgraph) {
  if (moduleState.keyboardInput.expectedUserString === 'see') {
    return letter_s(currentVideo, moduleState, 's', 0, wordPlaygraph.see);
  }
}

function secondLetterVideoSwitcher(currentVideo, moduleState, playgraph) {
  if (moduleState.keyboardInput.expectedUserString === 'see') {
    return letter_e(currentVideo, moduleState, 'se', 1, wordPlaygraph.see);
  }
}

function thirdLetterVideoSwitcher(currentVideo, moduleState, letterIndex, playgraph) {
  if (moduleState.keyboardInput.expectedUserString === 'see') {
    return letter_e(currentVideo, moduleState, 'see', 2, wordPlaygraph.see);
  }
}

const letter_s = (currentVideo, moduleState, cumulativeString, letterIndex, playgraph) => {
  if (moduleState.keyboardInput.cumulativeUserString === '') {
    return playgraph.blank;
  }
  playgraph = playgraph.s;
  // first time play the intro
  if (moduleState.keyboardInput.cumulativeUserString === 's' && !moduleState.wordState.introVideoHasBeenPlayed[0]) {
    moduleState.wordState.introVideoHasBeenPlayed[0] = true;
    return playgraph.blank_to_blue_s;
  }
  // anything else keep playing steady state
  if (moduleState.wordState.currentLetterPlayingForward[letterIndex]) {
    moduleState.wordState.currentLetterPlayingForward[letterIndex] = false;
    return playgraph.blue_s_infinite;
  }
  moduleState.wordState.currentLetterPlayingForward[letterIndex] = true;
  return playgraph.blue_s;
}

const letter_e = (currentVideo, moduleState, cumulativeString, letterIndex, playgraph) => {
  if (moduleState.keyboardInput.cumulativeUserString === '' || moduleState.keyboardInput.cumulativeUserString === 's') {
    return playgraph.blank;
  }
  // first time play the intro, once it's visible keep cycling it
  if (moduleState.keyboardInput.cumulativeUserString === cumulativeString || moduleState.wordState.letterIsVisible[letterIndex]) {
    playgraph = playgraph.e;
    if (!moduleState.wordState.introVideoHasBeenPlayed[letterIndex]) {
      moduleState.wordState.introVideoHasBeenPlayed[letterIndex] = true;
      moduleState.wordState.letterIsVisible[letterIndex] = true;
      return playgraph.blank_to_blue_e;
    }
    // anything else keep playing steady state
    if (moduleState.wordState.currentLetterPlayingForward[letterIndex]) {
      moduleState.wordState.currentLetterPlayingForward[letterIndex] = false;
      return playgraph.blue_e_infinite;
    }
    moduleState.wordState.currentLetterPlayingForward[letterIndex] = true;
    return playgraph.blue_e;
  }
  return playgraph.blank;
}

module.exports = {
  firstLetterVideoSwitcher,
  secondLetterVideoSwitcher,
  thirdLetterVideoSwitcher,
  wordPlaygraph
}; 