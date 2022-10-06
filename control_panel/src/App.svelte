<script>
  import svelteLogo from './assets/svelte.svg'
  import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
  import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
  import { listen , emit } from '@tauri-apps/api/event';
  import { onMount } from 'svelte';

  let statusList = {};
  let clipList = {};
  let BridgeList = {};
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
  <h2> Clip List</h2>
  <ul class="border-2">
    {#each Object.values(clipList) as clip}
    <li>{clip}</li>
    {/each}
  </ul>
  <ul class="border-2">
    {#each Object.values(statusList) as status}
      <li>{status.label_of_item} - {status.status_of_item}</li>
    {/each}
  </ul>
</main>


