const wordPlaygraph = {
  blank: 'main/blank.webm',
  see: {
    blank: 'main/blank.webm',
    s: {
      // plays one time at the very ver beginning
      blank_to_blue_s: 'game1/clips/blank_to_blue_s.webm',
      blue_s: 'game1/clips/blue_s.webm',
      blue_s_infinite: 'game1/clips/blue_s_infinite.webm',
    }
  }
};

function firstLetterVideoSwitcher(currentVideo, moduleState, playgraph) {
  if (moduleState.scene === 'see_intro') {
    return word_see(currentVideo, moduleState, wordPlaygraph.see);
  }
}

const word_see = (currentVideo, moduleState, playgraph) => {
  if (moduleState.keyboardInput.cumulativeUserString === '') {
    return playgraph.blank;
  }
  if (moduleState.keyboardInput.cumulativeUserString === 's') {
    playgraph = playgraph.s;
    if (moduleState.wordState.currentLetterHasBeenDisplayed) {
      if (moduleState.wordState.playingForward) {
        moduleState.wordState.playingForward = false;
        return playgraph.blue_s_infinite;
      }
      moduleState.wordState.playingForward = true;
      return playgraph.blue_s;
    }
    moduleState.wordState.currentLetterHasBeenDisplayed = true;
    return playgraph.blank_to_blue_s;
  }
}

module.exports = {
  firstLetterVideoSwitcher,
  wordPlaygraph
}; 