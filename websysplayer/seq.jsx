/*
video sequencing schemes
*/

// actually do use global level here
let seq_curVideoIndex = 0;
export function sequenceLinear(videoSources, curVideoIndex = seq_curVideoIndex) {
  seq_curVideoIndex++;
  if (seq_curVideoIndex >= videoSources.length) {
    seq_curVideoIndex = 0;
  }
  return videoSources[seq_curVideoIndex];
};

let sequence_curVideoKey = "";
export function sequenceGhostIdle(videoMap, curVideoIndex = seq_curVideoIndex) {
  // return videoSources[seq_curVideoIndex];
};

