<script>
  import svelteLogo from './assets/svelte.svg'
  import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
  import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
  import { listen , emit } from '@tauri-apps/api/event';
  import { onMount } from 'svelte';
  import Svelvet from 'svelvet';
  // import * as d3 from 'd3';
  // import { graphviz } from "d3-graphviz"; // graphviz js layer
  // import { wasmFolder } from "@hpcc-js/wasm"; // there is a WASM version of c++ graphviz in here :-) 
  // wasmFolder("/"); // call into the wasm to set the path
  import './global.scss';

  let statusList = {}; // List of all the status of the different services
  let clipList = {}; // <index_of_start_frame>thru<end_of_final_frame> -> VideoClip object
  let bridges = {}; // <index_of_origin_frame> -> VideoBridge object


  const removeStatus = (name) => {
    delete statusList[name];
  }
  const removeClip = (name) => {
    delete clipList[name];
  }

  const getClipName = (clip) => `${clip.index_of_start_frame}thru${clip.index_of_final_frame}`;
  const getBridgeName = (bridge) => `${bridge.origin_clip.video_clip_name}_${bridge.destination_clip.video_clip_name}`;

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
    if (payload.finished_type === "clip") {
      const n = nodes.find(n => n.id === payload.finished)
      n.borderColor = 'gray';
      n.bgColor = 'green';
      n.textColor = 'gray';
      n.width = 100;
      n.height = 100;
      nodes = nodes;
    } else {
      const b = edges.find(b => b.id === payload.finished);
      if (b) {
        b.animate = false;
        b.edgeColor = 'green';
        edges = edges;
      }
    }
    // turn on new one
    if (payload.started_type === "clip") {
      const n = nodes.find(n => n.id === payload.started)
      n.borderColor = 'blue';
      n.textColor = 'blue';
      n.bgColor = '#AAFF00';
      n.width = 125;
      n.height = 125;
      nodes = nodes;
    } else {
      const b = edges.find(b => b.id === payload.started);
      if (b) {
        b.animate = true;
        b.edgeColor = '#097969';
        edges = edges;
      }
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
    const n = nodes.find(n => n.id === payload.label_of_item)
    if (n) {
      n.bgColor = mapStatusToColor(payload.status_of_item);
      nodes = nodes;
    } else {
      const b = edges.find(b => b.id === payload.label_of_item);
      if (b) {
        b.edgeColor = mapStatusToColor(payload.status_of_item);
        edges = edges;
      }
    }
  };
  const onBridgeAdded = (event) => {
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
  };

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

  let curPos = { x: 0, y: 0 };
  const nextPos = () => {
    curPos.x += 100;
    if (curPos.x > 1000) {
      curPos.x = 0;
      curPos.y += 100;
    }
    return Object.assign({}, curPos);
  };

  // id will be the clip name:
  const makeNode = (clip) => ({ 
    id: getClipName(clip),
    position: nextPos(),
    width: 100,
  	height: 100,
    data: { label: getClipName(clip) },
    bgColor: mapStatusToColor("added"),
    borderColor: 'gray',
    borderRadius: 50
  });
  const makeEdge = (bridge) => ({ 
    id: getBridgeName(bridge),
    source: getClipName(bridge.origin_clip), 
    target: getClipName(bridge.destination_clip),
    arrow: true,
    animate: false, // only animate when playing
    label: getBridgeName(bridge),
    edgeColor: mapStatusToColor("added")
  });
  let nodes = [];
  let edges = [];
  const addNode = (clip) => {
    nodes.push(makeNode(clip));
    nodes = nodes; // tells svelte that nodes has changed
  }
  const removeNode = (clip) => {
    const index = nodes.findIndex(node => node.id === clip.video_clip_name);
    nodes.splice(index, 1);
  };
  const addEdge = (bridge) => {
    edges.push(makeEdge(bridge));
    edges = edges;
  }
  const removeEdge = (bridge) => {
    const index = edges.findIndex(edge => edge.source === bridge.source_clip.video_clip_name && edge.target === bridge.destination_clip.video_clip_name);
    edges.splice(index, 1);
  };
  onMount(async () => {
    appWindow.listen('status-update', onStatusUpdate);
    appWindow.listen('add-clip', onAddClip);
    appWindow.listen('add-frame', onAddFrame);
    // simulate();
  });

  const mapStatusToColor = (status) => {
    switch (status) {
      case "added":
        return "blue";
      case "processing":
        return "yellow";
      case "ready":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const mapStatusToTailwindColor = (status) => {
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


  <Svelvet nodes={nodes} edges={edges} background={true} />
</main>


