<script>
  import { appWindow } from '@tauri-apps/api/window'
  import { onMount } from 'svelte';
  import StatusList from './lib/StatusList.svelte';

  import { simulate } from './test/simulate';
  import Graph from './lib/Graph.svelte';

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


  onMount(async () => {
    appWindow.listen('add-frame', onAddFrame);
    const container =  document.getElementById("sigma-container");
    simulate([{ onAddFrame }]);
  });


</script>



<main>
  <div class="text-2xl">
    Control Panel
  </div>
  <div class="text-xl"> 
    { FlashMessage } 
  </div>
  <StatusList />
  <Graph />
</main>


