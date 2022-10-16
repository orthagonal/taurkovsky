<script>
  import svelteLogo from './assets/svelte.svg'
  import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
  import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
  import { listen , emit } from '@tauri-apps/api/event';
  import { onMount } from 'svelte';
  import './global.scss';
  let statusList = {}; // List of all the status of the different services
  let clipList = {}; // index of start frame -> VideoClip object
  let bridges = {}; // index of origin frame -> VideoBridge object

  const simulate = async => {
    const payload = {
      clips: [
        {
          index_of_start_frame: 43,
          path_to_start_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0044.png",
          index_of_final_frame: 102,
          path_to_final_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0102.png",
          video_clip_name: "",
          path_to_generated_video: "",
        },
        {
          index_of_start_frame: 142,
          path_to_start_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0142.png",
          index_of_final_frame: 202,
          path_to_final_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0202.png",
          video_clip_name: "",
          path_to_generated_video: "",
        },
      ],
      bridges: []
    };
    setTimeout(() => {
      onFrameClicked({
        payload: {
          label_of_item: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0142.png",
          status_of_item: "added",
          progress_percent: 50,
          alert_message: "",
          error: ""
        }
      })
    }, 1500);
  };

   const removeStatus = (name) => {
    delete statusList[name];
  }
  const updateClip = (payload) => {
    clipList[payload.label_of_item] = payload;
  };
  const removeClip = (name) => {
    delete clipList[name];
  }

  const onStatusUpdate = (event) => {
    statusList[event.payload.label_of_item] = event.payload;
  };
  const onFrameClicked = (event) => {
    clipList[event.payload.label_of_item] = event.payload.status_of_item;
    statusList[event.payload.label_of_item] = "added";
  };
  onMount(async () => {
    appWindow.listen('status-update', onStatusUpdate);
    appWindow.listen('add-frame', onFrameClicked);
    simulate();
  });


  const getClass = (status) => {
    switch (status) {
      case "added":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }
</script>

<style></style>

<main>
  <h2> Status Panel </h2>
  List of selected clips    
  <ul class="border-2">
    {#each Object.keys(clipList) as key}
    <li>
      <span >
        {key} 
      </span>
      -> 
      <span class="{getClass(clipList[key])}">
        {clipList[key]} 
      </span>
    </li>
    {/each}
  </ul>
  List of auto-generated joins or bridges between those clips:
  <ul class="border-2">
    {#each Object.values(clipList) as start_clip}
      get the bridges that start at this clip
    {/each}
  </ul>
</main>


