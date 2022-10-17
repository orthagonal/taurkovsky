<script>
  import svelteLogo from './assets/svelte.svg'
  import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
  import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
  import { listen , emit } from '@tauri-apps/api/event';
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { graphviz } from "d3-graphviz"; // graphviz js layer
  import { wasmFolder } from "@hpcc-js/wasm"; // there is a WASM version of c++ graphviz in here :-) 
  wasmFolder("/"); // call into the wasm to set the path
  import './global.scss';

  let statusList = {}; // List of all the status of the different services
  let clipList = {}; // <index_of_start_frame>thru<end_of_final_frame> -> VideoClip object
  let bridges = {}; // <index_of_origin_frame> -> VideoBridge object

  const simulate = async => {
    // sample event payloads to build tests from:
    const sampleClips = {
      43_102: {
          index_of_start_frame: 43,
          path_to_start_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0044.png",
          index_of_final_frame: 102,
          path_to_final_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0102.png",
          video_clip_name: "43thru102",
          path_to_generated_video: "",
        },
      142_202: {
          index_of_start_frame: 142,
          path_to_start_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0142.png",
          index_of_final_frame: 202,
          path_to_final_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0202.png",
          video_clip_name: "142thru202",
          path_to_generated_video: "",
        },
    };
    const f1 = sampleClips[43_102];
    const f2 = sampleClips[142_202];
    const sampleFrames = {
      43: {
        label_of_item: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0043.png",
        status_of_item: "added",
        progress_percent: 50,
        alert_message: "",
        error: ""
      },
      102: {
        label_of_item: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0102.png",
        status_of_item: "added",
        progress_percent: 50,
        alert_message: "",
        error: ""
      }, 
      142: {
        label_of_item: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0142.png",
        status_of_item: "added",
        progress_percent: 50,
        alert_message: "",
        error: ""
      },
      202: {
        label_of_item: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0202.png",
        status_of_item: "added",
        progress_percent: 50,
        alert_message: "",
        error: ""
      } 
    };
    const sampleUpdates = {
      '43thru102': {
        label_of_item: "43thru102",
        status_of_item: "processing",
        progress_percent: 50,
        alert_message: "",
        error: ""
      },
    };
    const sampleBridge = {
      '142thru202-43thru102': {
        origin_clip: sampleClips[43_102],
        destination_clip: sampleClips[142_202],
        path_to_generated_frames: "",
        path_to_generated_video: ""
      },
      '43thru102-142thru202': {
        origin_clip: sampleClips[142_202],
        destination_clip: sampleClips[43_102],
        path_to_generated_frames: "",
        path_to_generated_video: ""
      },
    };
    const payload = {
      clips: [
        sampleClips[43_102],
        sampleClips[142_202],
      ],
      bridges: [
      ]
    };
    // simulate clicking two frames to create a clip:
    setTimeout(() => {
      onFrameClicked({ payload: sampleFrames[43] });
    }, 1000);
    setTimeout(() => {
      onFrameClicked({ payload: sampleFrames[102] });
      onClipAdded({ payload: sampleClips[43_102] });
    }, 2000);
    setTimeout(() => {
      onFrameClicked({ payload: sampleFrames[142] });
      onStatusUpdate({ payload: sampleUpdates['43thru102'] });
      sampleUpdates['43thru102'].status_of_item = 'ready';
    }, 3000);
    setTimeout(() => {
      onFrameClicked({ payload: sampleFrames[202] });
      onClipAdded({ payload: sampleClips[142_202] });
      onBridgeAdded({ payload: sampleBridge['142thru202-43thru102'] });
      onBridgeAdded({ payload: sampleBridge['43thru102-142thru202'] });
      onStatusUpdate({ payload: sampleUpdates['43thru102'] });
    }, 3500);
  };
  const removeStatus = (name) => {
    delete statusList[name];
  }
  const removeClip = (name) => {
    delete clipList[name];
  }

  const getClipName = (clip) => `${clip.index_of_start_frame}thru${clip.index_of_final_frame}`;
  const getBridgeName = (bridge) => `${bridge.origin_clip.video_clip_name}_${bridge.destination_clip.video_clip_name}`;

  const onClipAdded = (event) => {
    const { payload } = event;
    // payload schema:
    // {
    //   index_of_start_frame:43,
    //   path_to_start_frame: "/c/workspace",
    //   index_of_final_frame:102,
    //   path_to_final_frame:"/c/workspace",
    //   video_clip_name:"",
    //   path_to_generated_video:""
    // }
    clipList[payload.video_clip_name] = payload;
    statusList[payload.video_clip_name] = "added";
    console.log("ADD NODE", payload);
    addNode(payload);
    updateDisplay();
  };
  const onStatusUpdate = (event) => {
    const { payload } = event;
    statusList[payload.label_of_item] = payload.status_of_item;
    updateDisplay();
  };
  const onBridgeAdded = (event) => {
    const payload = event.payload;
    bridges[payload.label_of_item] = payload;
    statusList[getBridgeName(payload)] = 'added';
    console.log('add edge', payload);
    addEdge(payload);
    updateDisplay();
  };


  // flash message that gives feedback to user on events
  let FlashMessage = "Launched...";
  const onFrameClicked = (event) => {
    FlashMessage = "Frame clicked: " + event.payload.label_of_item;
  };

  // todo: put d3 stuff in its own component
  let canvas;

  // id will be the clip name:
  const makeNode = (clip) => ({ id: getClipName(clip) });
  const getEdge = (bridge) => ({ 
    id: getBridgeName(bridge),
    source: getClipName(bridge.origin_clip), 
    target: getClipName(bridge.destination_clip),
    status: 'added',
  });
  const nodes = [];
  const edges = [];
  const addNode = (clip) => nodes.push(makeNode(clip));
  const removeNode = (clip) => {
    const index = nodes.findIndex(node => node.id === clip.video_clip_name);
    nodes.splice(index, 1);
  };
  const addEdge = (bridge) => edges.push(getEdge(bridge));
  const removeEdge = (bridge) => {
    const index = edges.findIndex(edge => edge.source === bridge.source_clip.video_clip_name && edge.target === bridge.destination_clip.video_clip_name);
    edges.splice(index, 1);
  };
  onMount(async () => {
    appWindow.listen('status-update', onStatusUpdate);
    appWindow.listen('add-frame', onFrameClicked);
    simulate();
  });

  const updateDisplay = () => {
    const dot = `
      digraph {
        ${nodes.map(node => `"${node.id}" [label="${node.id}"]`).join('\n')}
        ${edges.map(edge => `"${edge.source}" -> "${edge.target}" `).join('\n')}
      }
    `;
    console.log(dot);
    graphviz("#graph").renderDot(dot);
  };

  const getClass = (status) => {
    switch (status) {
      case "added":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500 blink";
      case "error":
        return "bg-red-500";
      case "ready":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }
</script>

<style>
</style>

<main>
  <div class="text-2xl">
    Control Panel
  </div>
  <div class="text-xl"> 
    { FlashMessage } 
  </div>
  List of selected clips    
  <ul class="border-2">
    {#each Object.keys(statusList) as key}
    <li>
      <span class="bg-gray-500 text-white">
        {key} 
      </span>
      -> 
      <span class="{getClass(statusList[key])}">
        {statusList[key]} 
      </span>
    </li>
    {/each}
  </ul>
  <svg id="graph" class="border-2 rounded w-full h-full">

  </svg>
</main>


