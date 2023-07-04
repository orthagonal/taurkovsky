<script>
  import { appWindow } from '@tauri-apps/api/window'
  import { onMount } from 'svelte';
  import { mapStatusToTailwindColor } from './common';
  import { simulate } from '../test/simulate';

  let statusList = {}; // List of all the status of the different services

  const removeStatus = (name) => {
    delete statusList[name];
  };

  const onAddClip = (event) => {
    const { payload } = event;
    statusList[payload.video_clip_name] = "added";
  };

  const onAddBridge = (event) => {
    console.log('bridge ADDED!');
    const payload = event.payload;
    statusList[payload.label_of_item] = 'added';
  };

  const onStatusUpdate = (event) => {
    const { payload } = event;
    statusList[payload.label_of_item] = payload.status_of_item;
  };

  onMount(async () => {
    appWindow.listen('add-bridge', onAddBridge);
    appWindow.listen('add-clip', onAddClip);
    appWindow.listen('status-update', onStatusUpdate);
    // simulate([{
    //   onAddBridge,
    //   onAddClip,
    //   onStatusUpdate
    // }]);
  });
  
</script>


List of selected clips    
<ul class="border-2">
  {#each Object.keys(statusList) as key}
  <li>
    <span class="bg-gray-500 text-white">
      {key} 
    </span>
    -> 
    <span class="{mapStatusToTailwindColor(statusList[key])}">
      {statusList[key]} 
    </span>
  </li>
  {/each}
</ul>