import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
import { listen , emit } from '@tauri-apps/api/event';

// we'll alternate between these two <video> elements
// to prevent flicker
let videoA = undefined;
let videoB = undefined;
let started = false;
const videoSources = [];
let curVideoIndex = 0;

// infinitely loop through the videoSources
const nextVideo = (curVideo) => {
  curVideoIndex++;
  if (curVideoIndex >= videoSources.length) {
    curVideoIndex = 0;
  }
  curVideo.src = videoSources[curVideoIndex];
};

// called from tauri when it finishes exproting a new webm seq
appWindow.listen('video-ready', (event) => {
  // only add it once:
  const newSource = event.payload.message;
  if (!videoSources.includes(newSource)) {
    videoSources.push(convertFileSrc(newSource));
  }
  // the first time a video is ready, init everything and start playing
  if (!started) {
    started = true;
    videoA = document.getElementById('videoA');
    videoB = document.getElementById('videoB');
    videoB.style.display = "none";
    videoA.style.display = "block";
    // alternate between videoA and videoB, hiding whichever isn't playing
    videoA.onended = function(e) {
      videoB.play();
      videoA.style.display = "none";
      videoB.style.display = "block";
      nextVideo(videoA);
    };
    videoB.onended = function(e) {
      videoA.play();
      videoB.style.display = "none";
      videoA.style.display = "block";
      nextVideo(videoB);
    };
    // to start play videoA first
    videoA.src = videoSources[0];
    nextVideo(videoB);
    videoA.play();
  }
});
