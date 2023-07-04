<script>

// switch for dev/prod
import { simulateTauri } from '../test/simulate';
const tauri = simulateTauri;
// import { prodTauri } from './common';
// const tauri = prodTauri;


// svelte imports
import { onMount } from 'svelte';
import { select } from 'd3';

let workingDir = '';
let frameEntries = [];

// special frames
let mouseoverFrameSrc = null; // src path of the full-sized frame that the mouse is currently over
let srcFrame = null; // the start frame of the clip
let dstFrame = null; // the end frame of the clip

let selectedFrameIndex = 0;
let selectedFrame = "";

const addFrame = async (frameEntry, sourcePath) => {
  console.log('frame added', frameEntry);
  console.log('adding frame', sourcePath, frameEntry.name);
  const thumbDir = await tauri.join(frameEntry.path, frameEntry.name)
  frameEntries.push({
    src: tauri.convertFileSrc(thumbDir),
    realPath: tauri.convertFileSrc(thumbDir.replace('thumbs', 'frames')), // the corresponding full-size frame is in the frames directory
    frameIndex: frameEntries.length
  });
};

// notify and load when new set of frames are ready
const onFramesReady = async(event) => {
  console.log(event);
  // working_dir: "",
  // frames_dir: "", 
  // thumbs_dir: "",
  // frame_entries: ""
  const { payload } = event;
  try {
    const sourcePath = payload;
    const dirList = await tauri.readDir(sourcePath);
    await Promise.all(dirList.map(e => addFrame(e, sourcePath)));
    // trigger svelte redraw:
    frameEntries = frameEntries;
  } catch (error) {
    alert(error.toString());
  }
};

const userSelectVideo = () => tauri.open({
  multiple: false, // only allow one file to be opened
  filters: [{
    name: 'Video',
    extensions: ['mov', 'webm']
  }]
});

tauri.appWindow.listen('add-frame', (event) => {
  console.log('#######################################################frame clicked', event);
  const { payload } = event;
  // payload schema:
  // {
  //   index_of_frame: i32, // index of the frame in the sequence of frames in the video
  //   path_to_frame: String,  // path to the frame that was clicked
  //   is_start_frame: bool, // whether this is the start frame or end frame for the clip
  // }
});

let isStartFrame = true;

const handleClick = (frameEl) => {
  console.log(frameEl);
  if (isStartFrame) {
    srcFrame = frameEl.realPath;
  } else {
    dstFrame = frameEl.realPath;
  }
  // todo: colorize the frame if it's start frame
  // colorize the first+last frame and every frame in between
  tauri.appWindow.emit('click', {
    index_of_frame: frameEl.frameIndex,
    path_to_frame: frameEl.realPath,
    is_start_frame: isStartFrame
  });
  isStartFrame = !isStartFrame;
};

const handleMouseover = async(frame) => {
  mouseoverFrameSrc = frame.realPath;
};

const handleMouseout = (event) => {
  // when they exit show the full size frame
  event.target.style.border = '';
  selectedFrame = "";
};

const handleMousewheel = (event) => {
  if (event.wheelDelta < 0) {
    event.target.width = (parseInt(event.target.width) - 30).toString();
    event.target.height = (parseInt(event.target.height) - 30).toString();
  }
  if (event.wheelDelta > 0) {
    event.target.width = (parseInt(event.target.width) + 30).toString();
    event.target.height = (parseInt(event.target.height) + 30).toString();
  }
};

const getRootDir = async () => {
  const dir = await tauri.appDir();
  return dir;
};

onMount(async () => {
  // tauri app tells us user has selected a new directory of frames,
  // basically resets everything on control panel
  tauri.appWindow.listen('frames-ready', onFramesReady);
  // uhcomment for dev stuff
  // return tauri.simulateVideoSelection([
  //   {
  //     onFramesReady
  //   }
  // ])

  // see if they have a previous working directory
  // if so just init to that
  let dir = await getRootDir();
  let selected;
  // check if they have a last workspace (named after the original video) open
  const dirList = await tauri.readDir(dir);
  // filter out thumbs and frames dirs:
  const workSpaces = dirList.filter(e => e.name !== 'thumbs' && e.name !== 'frames');
  // if so then open up the thumbs from it and redraw
  if (workSpaces.length > 0) {
    const workingDir = workSpaces[0].path;
    tauri.invoke('set_working_dir', { workingDir });
    const thumbsDir = await tauri.join(workingDir, 'thumbs');
    const thumbsEntries = await tauri.readDir(thumbsDir);
    await Promise.all(thumbsEntries.map(e => addFrame(e, thumbsDir)));
    frameEntries = frameEntries;
  }
});

</script>


<div class="grid grid-cols-2">
  <div id="video-frame-list" class="grid grid-cols-5">
    {#each frameEntries as frame}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div    
        on:focus={() => handleMouseover(frame)}
        on:mouseover={() => handleMouseover(frame)}
        on:click={() => handleClick(frame)} 
      >
        <span class="text-xs font-bold text-slate-200">
          {frame.frameIndex}
        </span>
        <!-- svelte-ignore a11y-missing-attribute -->
        <img 
          src={frame.src} 
          class="video-frame m-1"
          width="100"
          height="100"
        />
      </div>
    {/each}
  </div>


  <div id="video-mouseover-frame">
    {#if mouseoverFrameSrc !== ""}
      <img
        alt=""
        src={mouseoverFrameSrc} 
        class="video-frame m-1"
        width="1920"
        height="1080"
      />
    {/if}
  </div>
  <div id="video" class="grid grid-cols-2">
    <div>
      Source Frame:
      <img
      alt=""
      src={srcFrame}
      width="960"
      height="540"
    />
    </div>
    <div>
      Destination Frame:
      <img 
      alt=""
      src={dstFrame}
      width="960"
      height="540"
    />
    </div>
  </div>

</div>
