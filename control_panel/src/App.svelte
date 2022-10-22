<script>
  import svelteLogo from './assets/svelte.svg'
  import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
  import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
  import { listen , emit } from '@tauri-apps/api/event';
  import { onMount } from 'svelte';
  import { DataSet } from "vis-data/peer";
  import { Network } from "vis-network/peer";
  // import "vis-network/styles/vis-network.css";

  // just do graphviz for now
  // don't worry about frame preview
  import * as d3 from 'd3';
  import { graphviz } from "d3-graphviz"; // graphviz js layer
  import { wasmFolder } from "@hpcc-js/wasm"; // there is a WASM version of c++ graphviz in here :-) 
  wasmFolder("/"); // call into the wasm to set the path
  import './global.scss';

  let statusList = {}; // List of all the status of the different services
  let clipList = {}; // <index_of_start_frame>thru<end_of_final_frame> -> VideoClip object
  let bridges = {}; // <index_of_origin_frame> -> VideoBridge object
  // flash message that gives feedback to user on events
  let FlashMessage = "Launched...";


  const removeStatus = (name) => {
    delete statusList[name];
  }
  const removeClip = (name) => {
    delete clipList[name];
  }

  /*
     HELPER FUNCTIONS FOR DISPLAYING CLIP AND BRIDGE STATUSES
  */
  const getClipName = (clip) => clip.video_clip_name;   // should be same as `${clip.index_of_start_frame}thru${clip.index_of_final_frame}`;
  const getBridgeName = (bridge) => `${bridge.origin_clip.video_clip_name}_${bridge.destination_clip.video_clip_name}`;
  const StatusColorMap = {
    "added": "gray",
    "processing": "blue",
    "ready": "green",
    "error": "red",
    "playing": "yellow",
  }
  const TailwindColors = {
    "added": "bg-gray-500",
    "processing": "bg-blue-500",
    "ready": "bg-green-500",
    "error": "bg-red-500",
  }
  const mapStatusToColor = (status) => StatusColorMap[status] || "gray";
  const mapStatusToTailwindColor = (status) => TailwindColors[status] || "bg-gray-500";

  /*
    TAURI EVENT HANDLERS
  */
  const onAddClip = (event) => {
    console.log('clip ADDED!')
    console.log(event);
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
    addNode(payload);
    updateDisplay();
  };

  const onBridgeAdded = (event) => {
    console.log('bridge ADDED!');
    console.log(event);
    const payload = event.payload;
    // payload schema:
    // {
    //   origin_clip: sampleClips[43_102],
    //   destination_clip: sampleClips[142_202],
    //   path_to_generated_frames: "",
    //   path_to_generated_video: ""
    // }
    bridges[payload.label_of_item] = payload;
    statusList[getBridgeName(payload)] = 'added';
    console.log('add edge', payload);
    addEdge(payload);
    updateDisplay();
  };

  const onPlayStarted = (event) => {
    const { payload } = event;
    // payload schema:
    // {
    //   finished_type: "clip",
    //   finished: labelname of video that just stopped playing
    //   started: labelname of video that started
    //   started_type: "bridge"
    // }
    // turn off old one:
    try {
      const previous = nodes[payload.finished] || edges[payload.finished];
      previous.status = "ready";
      // turn on new one
      const next = nodes[payload.started] || edges[payload.started];
      next.status = "playing";
      updateDisplay();
    } catch (error) {
      console.log('>>>>>>>>>>>>>>>>>>>>error in onPlayStarted', error);
      console.log(nodes)
      console.log(edges)
      console.log(payload)        
    }
  };

  const onStatusUpdate = (event) => {
    const { payload } = event;
    // payload schema:
    // {
    //     label_of_item: "43thru102",
    //     status_of_item: "processing",
    //     progress_percent: 50,
    //     alert_message: "",
    //     error: ""
    // }
    statusList[payload.label_of_item] = payload.status_of_item;
    // see if it's a node or a bridge:
    const toUpdate = nodes[payload.label_of_item] || edges[payload.label_of_item];
    toUpdate.status = payload.status_of_item;
    updateDisplay();
  };

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

  /*
    GRAPH DISPLAY FUNCTIONS
  */

  // clip name -> clip object:
  let nodes = {};
  // bridge name -> bridge object:
  let edges = {};

  const addNode = clip => {
    const name = getClipName(clip);
    clip.status = 'added';
    nodes[name] = clip; 
  };

  const addEdge = bridge => {
    const name = getBridgeName(bridge);
    bridge.status = 'added';
    edges[name] = bridge;
  };

  // renders node as dot string:
  const makeNodeFromClip = clip => {
    const name = getClipName(clip);  
    const color = mapStatusToColor(clip.status);
    return `"${name}" [label="${name}", fillcolor="${color}", style="filled"]`;
  }
  const makeEdgeFromBridge = bridge => {
    const source = getClipName(bridge.origin_clip);
    const target = getClipName(bridge.destination_clip);
    const color = mapStatusToColor(bridge.status);
    return `"${source}" -> "${target}" [label="${getBridgeName(bridge)}", color="${color}"]`;
  }


  const updateDisplay = () => {
      // generate node and edge strings:    
      const dot = `
        digraph {
          ${Object.values(nodes).map(makeNodeFromClip).join('\n')}
          ${Object.values(edges).map(makeEdgeFromBridge).join('\n')}
        }
      `;
      console.log(dot);
      graphviz("#graph-container")
        // TODO: HAVE TO ADD ALL OF THE FRAMES TO THE GRAPHVIZ OBJECT
        // .addImage("icons/icon1.svg","300px","300px")
        // .addImage("icons/icon2.svg","300px","300px")
        .renderDot(dot);
    };


  onMount(async () => {
    appWindow.listen('status-update', onStatusUpdate);
    appWindow.listen('add-clip', onAddClip);
    appWindow.listen('add-frame', onAddFrame);
    appWindow.listen('add-bridge', onBridgeAdded);
    const container =  document.getElementById("sigma-container");
    simulate();
  });

  // simulates a bunch of events coming from tauri
  // to test the UI
  const simulate = async => {
    let playing = 0;
    let prev = 0;
    let vids = ['43thru102', '43thru102_142thru202', '142thru202', '142thru202_43thru102'];
    const updatePlaying = () => {
      prev = playing;
      playing = (playing + 1) % vids.length;
       onPlayStarted({
        payload: {
          started: vids[playing],
          started_type: playing == 0 || playing % 2 == 0 ? 'clip' : 'bridge',
          finished: vids[prev],
          finished_type: prev == 0 || prev % 2 == 0 ? 'clip' : 'bridge',
        }
      });
    }

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
      '142thru202': {
        label_of_item: "142thru202",
        status_of_item: "processing",
        progress_percent: 50,
        alert_message: "",
        error: ""
      },
      '142thru202_43thru102': {
        label_of_item: "142thru202_43thru102",
        status_of_item: "processing",
        progress_percent: 50,
        alert_message: "",
      },
      '43thru102_142thru202': {
        label_of_item: "43thru102_142thru202",
        status_of_item: "processing",
        progress_percent: 50,
        alert_message: "",
      },
    };
    const sampleBridge = {
      '142thru202_43thru102': {
        origin_clip: sampleClips[43_102],
        destination_clip: sampleClips[142_202],
        path_to_generated_frames: "",
        path_to_generated_video: ""
      },
      '43thru102_142thru202': {
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
      onAddFrame({ payload: sampleFrames[43] });
    }, 1000);
    setTimeout(() => {
      onAddFrame({ payload: sampleFrames[102] });
      onAddClip({ payload: sampleClips[43_102] });
    }, 2000);
    // simulate clicking two more frames to create another clip
    // while we notify that the first clip started processing
    setTimeout(() => {
      onAddFrame({ payload: sampleFrames[142] });
      onStatusUpdate({ payload: sampleUpdates['43thru102'] });
    }, 3000);
    setTimeout(() => {
      onAddFrame({ payload: sampleFrames[202] });
      onAddClip({ payload: sampleClips[142_202] });
      // creating a second clip also creates bridges between that clip and all other clips:
      onBridgeAdded({ payload: sampleBridge['142thru202_43thru102'] });
      onBridgeAdded({ payload: sampleBridge['43thru102_142thru202'] });
      sampleUpdates['43thru102'].status_of_item = 'ready';
      onStatusUpdate({ payload: sampleUpdates['43thru102'] });
      sampleUpdates['142thru202'].status_of_item = 'processing';
      onStatusUpdate({ payload: sampleUpdates['142thru202'] });
    }, 3500);
    setTimeout(() => {
      sampleUpdates['142thru202'].status_of_item = 'ready';
      onStatusUpdate({ payload: sampleUpdates['142thru202'] });
      onStatusUpdate({ payload: sampleUpdates['142thru202_43thru102'] });
    }, 4000);
    setTimeout(() => {
      sampleUpdates['142thru202_43thru102'].status_of_item = 'ready';
      onStatusUpdate({ payload: sampleUpdates['142thru202_43thru102'] });
      sampleUpdates['43thru102_142thru202'].status_of_item = 'processing'
      onStatusUpdate({ payload: sampleUpdates['43thru102_142thru202'] });
    }, 4500);
    setTimeout(() => {
      sampleUpdates['43thru102_142thru202'].status_of_item = 'ready';
      onStatusUpdate({ payload: sampleUpdates['43thru102_142thru202'] });
      setInterval(() => {
        updatePlaying();
      }, 5000);
    }, 5000);
  };

</script>

<style>
  #graph-container {
    width: 500px;
    height: 500px;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
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
      <span class="{mapStatusToTailwindColor(statusList[key])}">
        {statusList[key]} 
      </span>
    </li>
    {/each}
  </ul>
  <div id="graph-container"></div>

</main>


