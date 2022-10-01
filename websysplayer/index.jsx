// Note that a dynamic `import` statement here is required due to
// webpack/webpack#6615, but in theory `import { greet } from './pkg';`
// will work here one day as well!
import { listen , emit } from '@tauri-apps/api/event';
import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { copyFile, createDir, readDir } from '@tauri-apps/api/fs';
import { appDir, basename, join, extname } from '@tauri-apps/api/path';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'


listen('video_ready', (event) => {
  console.log('got video ready event', event);
  console.log(event);
  const video = document.getElementById('video');
  video.src = convertFileSrc(event.video);
  video.loop = true;
  video.play();
});
/// when a source video is first loaded, dir structure will be:
/// - app root
///  - sourcevideoname (no extension)
///    -bridge_frames
///    -frames
///    -bridge_video
const makeAllWorkingDirs = async (sourcePath) => {
  const dir = await appDir();
  const extension = await extname(sourcePath);
  const fileStemName = (await basename(sourcePath)).replace(`.${extension}`, '');
  const workingDir = await join(dir, fileStemName);
  await createDir(workingDir, { recursive: true });
  await createDir(await join (workingDir, 'frames'), { recursive: true });
  await createDir(await join (workingDir, 'bridge_frames'), { recursive: true });
  await createDir(await join (workingDir, 'bridge_video'), { recursive: true });
  invoke('set_working_dir', {
    workingDir
  });
  return workingDir;
};

// display the frames of the source video
const displayFrameDir = async (sourcePath) => {
  console.log('displayFrameDir', sourcePath);
  let isStartFrame = true;
  const frameEntries = await readDir(sourcePath);
  console.log('frameEntries', frameEntries);
  const videoFrameList = document.getElementById('video-frame-list');
  for (let i = 0; i < frameEntries.length; i++) {
    const frameEntry = frameEntries[i];
    const frameEl = document.createElement('img');
    frameEl.src = await convertFileSrc(frameEntry.path);
    frameEl.realPath = frameEntry.path;
    frameEl.class = "video-frame";
    frameEl.width = 35;
    frameEl.height = 35;
    frameEl.style.margin = '10px';
    frameEl.addEventListener('click', (event) => {
      // todo: colorize the frame if it's start frame
      // colorize the first+last frame and every frame in between
      appWindow.emit('click', {
        path_to_frame: frameEl.realPath,
        is_start_frame: isStartFrame
      });
      isStartFrame = !isStartFrame;
      // todo: add the frame to the list of frames used,
      // add a dot to the graph of the ghostidle, etc
      // attempt to use as a tauri command but didn't allow access to the mutexed Vec<VideoClip>
      // const result = await invoke('click_frame', {
      //   path_to_frame: frameEl.realPath,
      //   is_start_frame
      // });
      // is_start_frame = !is_start_frame;


    });

    videoFrameList.appendChild(frameEl);
  }
};

// Open a selection dialog for image files
const f = async () => {
  const selected = await open({
    multiple: false, // only allow one file to be opened
    filters: [{
      name: 'Video',
      extensions: ['mov', 'webm']
    }]
  });
  if (selected === null) {
    // user cancelled the selection
  } else {
    // first make sure workspace exists:
    const workingDir = await makeAllWorkingDirs(selected);
    // framify the video:
    const result = await invoke('framify_video_src', {
      srcVideoName: selected
    });
    // display the frames:
    await displayFrameDir(await join(workingDir, 'frames'));
  }
};
f();



