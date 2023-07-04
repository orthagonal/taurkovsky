<script>
  import { appWindow } from '@tauri-apps/api/window'
  import { onMount } from 'svelte';
  import Graph from './lib/Graph.svelte';
  import StatusList from './lib/StatusList.svelte';
  import FramePicker from './lib/FramePicker.svelte';

  import { copyFile, createDir, readDir } from '@tauri-apps/api/fs';
  import { appDir, basename, join, extname } from '@tauri-apps/api/path';

  import { simulate } from './test/simulate';

  // flash message that gives feedback to user on events
  let FlashMessage = "Launched...";

  const onAddFrame = (event) => {
    console.log('frame clicked', event);
    const { payload } = event;
    // payload schema:
    // {
    //   index_of_frame: i32, // index of the frame in the sequence of frames in the video
    //   path_to_frame: String,  // path to the frame that was clicked
    //   is_start_frame: bool, // whether this is the start frame or end frame for the clip
   // }
    FlashMessage = "Frame clicked: " + payload.path_to_frame;
  };

  const getRootDir = async () => {
    const dir = await appDir();
    return dir;
    // return "E://taur";
  };

  const getWorkingDir = async (sourcePath) => {
    const dir = await getRootDir();
    const extension = await extname(sourcePath);
    const fileStemName = (await basename(sourcePath)).replace(`.${extension}`, '');
    const workingDir = await join(dir, fileStemName);
    return workingDir;
  };


  const makeAllWorkingDirs = async (sourcePath) => {

    const workingDir = await getWorkingDir(sourcePath);
    await createDir(workingDir, { recursive: true });
    await createDir(await join (workingDir, 'frames'), { recursive: true });
    await createDir(await join (workingDir, 'thumbs'), { recursive: true });
    await createDir(await join (workingDir, 'bridge_frames'), { recursive: true });
    await createDir(await join (workingDir, 'bridge_video'), { recursive: true });
    return workingDir;
  };

  onMount(async () => {
    appWindow.listen('add-frame', onAddFrame);
    const container =  document.getElementById("sigma-container");
    // user selects a video when they first open the app
    // await makeAllWorkingDirs("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830");
    // simulate([{ onAddFrame }]);
  });
</script>


<main>
  <div class="text-2xl">
    Control Panel
  </div>
  <div class="text-xl"> 
    { FlashMessage } 
  </div>
  <FramePicker />
  <StatusList />
  <Graph />

</main>


