import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
import { listen , emit } from '@tauri-apps/api/event';
import { sequenceLinear } from './seq.jsx';

// listen to notify events
listen('ghostidle', (event) => {
  console.log('ghostidle', event);
  // alert(JSON.stringify(event));
});

// when graph updates, update graph
// choose next
// todo: enforce getNextVideo
// todo: allow switch between morph mode, ghostidle mode, transition mode

// we'll alternate between these two <video> elements
// to prevent flicker
let videoA = undefined;
let videoB = undefined;
let started = false;
const videoSources = [];


const nextVideo = (curVideo) => {
// infinitely loop through the videoSources
  curVideo.src = sequenceLinear(videoSources);
};

// called from tauri when it finishes exproting a new webm seq
appWindow.listen('status-update', (event) => {
// this may grow to listen to more types right now it just assumes label_of_item
// means the video is ready to play
  const newSource = event.payload.label_of_item;
  // only add it once:
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
      console.time();
      videoB.play();
      console.timeLog();
      videoA.style.display = "none";
      videoB.style.display = "block";
      console.timeLog();
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

