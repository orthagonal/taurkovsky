<script>
  import svelteLogo from './assets/svelte.svg'
  import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
  import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
  import { listen , emit } from '@tauri-apps/api/event';
  import { onMount } from 'svelte';

  let statusList = {}; // List of all the status of the different services
  let clipList = {}; // index of start frame -> VideoClip object
  let bridges = {}; // index of origin frame -> VideoBridge object
  
  const updateStatus = (payload) => {
    statusList[payload.label_of_item] = payload;
  };
  const removeStatus = (name) => {
    delete statusList[name];
  }
  const addClip = (payload) => {
    clipList[payload.label_of_item] = payload;
  };
  const removeClip = (name) => {
    delete clipList[name];
  }
  onMount(async () => {
    appWindow.listen('add-clip', event => {
      addClip(event.payload);
    });
    appWindow.listen('status-update', (event) => {
      console.log(event.payload);
      updateStatus(event.payload);
    });
  });
</script>

<style></style>

<main>
  <h2> Status Panel </h2>
  List of selected clips    
  <ul class="border-2">
    {#each Object.values(clipList) as clip}
    <li>first_frame -> last_frame or not selected </li>
    {/each}
  </ul>
  List of auto-generated joins or bridges between those clips:
  <ul class="border-2">
    {#each Object.values(clipList) as start_clip}
      get the bridges that start at this clip
    {/each}
  </ul>
</main>


