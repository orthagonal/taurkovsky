import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow, WebviewWindowHandle } from '@tauri-apps/api/window'
import { listen , emit } from '@tauri-apps/api/event';

// launch listeners in prod mode:
const onMount = () => {
  listen('status-update', onStatusUpdate);
  listen('add-clip', onAddClip);
  listen('add-bridge', onAddBridge);
};
onMount();

const playGraph = {}; // the actual graph of videos played in preview
const stagingClips = {};
const stagingBridges = {};
// staging ground for videos that are not done processing yet, but will be moved to playgraph when ready
let clips = {}; // label_of_item -> VideoClip
let bridges = {};  // label_of_item for starting node -> [ list of compatible outgoing bridges]

// when a new clip is added, add it to the stagingGraph
function onAddClip (event) {
  const { payload } = event;
  clips[payload.video_clip_name] = payload;
  console.log('clips is now', clips);
}

function onAddBridge (bridge) {
  const { payload } = bridge;
  // payload schema:
  // {
  //   origin_clip: sampleClips[43_102],
  //   destination_clip: sampleClips[142_202],
  //   path_to_generated_frames: "",
  //   path_to_generated_video: "",
  //   label_of_item: "43to142"
  // }
  const originLabel = payload.origin_clip.video_clip_name;
  if (bridges[originLabel]) {
    bridges[originLabel].push(payload);
  } else {
    bridges[originLabel] = [payload];
  }
  console.log('add brdges is now', bridges);
}

// when a video is marked 'ready' we can move it over to the play graph
// TODO: this seems to only be playing the bridges????
function onStatusUpdate (status) {
  const { payload } = status;
  // payload schema:
  // {
  //     label_of_item: "43thru102",
  //     status_of_item: "processing",
  //     progress_percent: 50,
  //     alert_message: "",
  //     error: ""
  // }
  // preview only cares when items are done processing and ready to play:
  if (payload.status_of_item === 'ready') {
    const itemName = payload.label_of_item;
    // if it's a clip you'll have to attach any outgoing bridges:
    if (clips[itemName]) {
      clips[itemName].status = "ready";
      return;
    }
    // just ignore i guess?
    // bridges[itemName].status = "ready";
    console.log('playGraph is now: ', clips, bridges);
    playIdle();
  }
}

// we'll alternate between these two <video> elements
// to prevent flicker
let videoA = undefined;
let videoB = undefined;
let started = false;

// replay same video if it has no adjacencies:
const getNextNode = (curNode) => {
  // if current node is a bridge just get the next node:
  if (curNode.destination_clip) {
    console.log('thie current node is a bridge so i am just getting the next video');
    return clips[curNode.destination_clip.video_clip_name]
  }
  // if it's a clip then get a valid outgoing bridge:
  const validBridges = bridges[curNode.video_clip_name];
  console.log('clip ending, now playing valid bridge from ', validBridges);
  let index = Math.floor(Math.random() * validBridges.length);
  return validBridges[index];
}

// set element src regardless of whether it's a bridge or a clip:
const setSrc = (el, currentPlayingNode) => {
  const nextNode = getNextNode(currentPlayingNode);
  el.src = convertFileSrc(decodeURI(nextNode.path_to_generated_video));
  el.node = nextNode;
}


// the first time a video is ready, init everything and start playing
const playIdle = () => {
  const ControlPanelWindow = new WebviewWindowHandle('control_panel');
  // once started don't need to reinit everything, just the graph
  if (!started) {
    started = true;
    videoA = document.getElementById('videoA');
    videoB = document.getElementById('videoB');
    videoB.style.display = "none";
    videoA.style.display = "block";
    // alternate between videoA and videoB, hiding whichever isn't playing
    videoA.onended = function(e) {
      videoB.play();
        // status: 'playing', payload: videoB.node });
      videoA.style.display = "none";
      videoB.style.display = "block";
      invoke('preview_video_started', {
        labelOfItem: videoB.node.label_of_item || videoB.node.video_clip_name,
      });
      setSrc(videoA, videoB.node);
    };
    videoB.onended = function(e) {
      videoA.play();
      videoB.style.display = "none";
      videoA.style.display = "block";
      invoke('preview_video_started', {
        labelOfItem: videoA.node.label_of_item || videoA.node.video_clip_name,
      });
      setSrc(videoB, videoA.node);
    };
  }
  resetGraph();
};


// restart the graph to the first clip if anything has stopped playing
const resetGraph = () => {
  console.log('init now');
  // initialize video A to a clip and get videoB ready:
  videoA.node = Object.values(clips)[0];
  videoA.src = convertFileSrc(videoA.node.path_to_generated_video);
  setSrc(videoB, videoA.node);
  videoA.play();
}

const notPlaying = video => video && video.currentTime > 0 && !video.paused && !video.ended //&& video.readyState > 2

