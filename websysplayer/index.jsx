import { listen , emit } from '@tauri-apps/api/event';
import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { copyFile, createDir, readDir } from '@tauri-apps/api/fs';
import { appDir, basename, join, extname } from '@tauri-apps/api/path';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'


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
  await createDir(await join (workingDir, 'thumbs'), { recursive: true });
  await createDir(await join (workingDir, 'bridge_frames'), { recursive: true });
  await createDir(await join (workingDir, 'bridge_video'), { recursive: true });
  invoke('set_working_dir', {
    workingDir
  });
  return workingDir;
};

// display the frames of the source video
const displayThumbsDir = async (sourcePath) => {
  console.log('displayThumbsDir', sourcePath);
  let isStartFrame = true;
  const frameEntries = await readDir(sourcePath);
  console.log('frameEntries', frameEntries);
  // keep watching until something appears, good enough for now
  // the 'right' way to do this is probably use a watcher in rust then signal here when ready
  if (frameEntries.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return displayThumbsDir(sourcePath);
  }
  const videoFrameList = document.getElementById('video-frame-list');
  for (let i = 0; i < frameEntries.length; i++) {
    const frameEntry = frameEntries[i];
    const frameEl = document.createElement('div');
    frameEl.innerHTML = `<span class="text-xs font-bold text-slate-200">${i}</span>
      <img 
        src=${convertFileSrc(await join(sourcePath, frameEntry.name))} 
        class="video-frame m-1"
        width="35"
        height="35"
      />`;
    frameEl.realPath = frameEntry.path.replace('thumbs', 'frames'); // the corresponding full-size frame is in the frames directory
    console.log('frameEl', frameEl);
    frameEl.addEventListener('click', (event) => {
      // todo: colorize the frame if it's start frame
      // colorize the first+last frame and every frame in between
      appWindow.emit('click', {
        path_to_frame: frameEl.realPath,
        is_start_frame: isStartFrame
      });
      isStartFrame = !isStartFrame;
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
    await displayThumbsDir(await join(workingDir, 'thumbs'));
  }
};
f();



