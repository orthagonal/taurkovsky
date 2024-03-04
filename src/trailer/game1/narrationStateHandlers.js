
const narrationPlaygraph = {
  blank: 'main/blank.webm',
  see_intro: {
    // plays one time at the very ver beginning
    first_one: 'game1/clips/narration_intro_see-graph.webm',
    // plays randomly after the first one
    flashes: [
      'game1/clips/narration_or_did_they_see_me-graph.webm',   
      'game1/clips/narration_did_i_see_them-graph.webm',
    ]
  }
};

function narrationVideoSwitcher(currentVideo, moduleState, playgraph) {
  if (moduleState.scene === 'see_intro') {
    return see_intro(currentVideo, moduleState, narrationPlaygraph.see_intro);
  }
  // return nextVideoLantern(currentVideo);
}

let timesPlayed = 0;
let timeSinceLastFlash = 0;

const see_intro = (currentVideo, moduleState, playgraph) => {
  if (moduleState.playgraphState === 'blank') {
    if (moduleState.narrationState === 'blank') {
      moduleState.showSlots = false;
      moduleState.narrationState = 'intro_playing';
      return playgraph.first_one;
    }
    if (moduleState.narrationState === 'intro_playing') {
      moduleState.narrationState = 'intro_played';
      const previousOnEnded = currentVideo.onended;
      currentVideo.onended = () => {
        moduleState.showSlots = true;
        currentVideo.onended = previousOnEnded;
        previousOnEnded();
      }; 
      return narrationPlaygraph.blank;
      // if (timeSinceLastFlash > 3 && Math.random() > 0.4) {
      //   timeSinceLastFlash = 0;
      //   console.log('flashing');
      //   return playgraph.flashes[Math.floor(Math.random() * playgraph.flashes.length)];
      // }
      // timeSinceLastFlash += 1;
    }
  }
  return narrationPlaygraph.blank;
}

module.exports = { narrationVideoSwitcher, narrationPlaygraph };