import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
import { listen , emit } from '@tauri-apps/api/event';

let video = undefined;
let started = false;
const videoSources = [];
let curVideoIndex = 0;

const addVideoSource = (videoElement, newSource) => {
  // only add it once:
  if (!videoSources.includes(newSource)) {
    videoSources.push(convertFileSrc(newSource));
  }
}

// infinitely rotate the video list:
const onVideoEnded = () => {    
  curVideoIndex++;
  console.log('video ended, switching to next video', curVideoIndex);
  if (curVideoIndex >= videoSources.length) {
    curVideoIndex = 0;
  }
  video.src = videoSources[curVideoIndex];
  console.log('set video src to', videoSources[curVideoIndex]);
  console.log('video sources', videoSources);
  video.play();
}

appWindow.listen('video-ready', (event) => {
  addVideoSource(video, event.payload.message);
  if (!started) {
    started = true;
    video = document.getElementById('video');
    console.log("starting video");
    // video.addEventListener('ended', onVideoEnded, false);
    video.onended = onVideoEnded;
    video.src = videoSources[0];
    video.play();
  }
});
