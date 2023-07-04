<script>
	// tauri and svelte imports
  import { appWindow } from '@tauri-apps/api/window'
  import { convertFileSrc } from '@tauri-apps/api/tauri';
  import { onMount } from 'svelte';
	// graphviz wasm imports and setup
  import { graphviz } from "d3-graphviz"; // graphviz js layer
  import { wasmFolder } from "@hpcc-js/wasm"; // there is a WASM version of c++ graphviz in here :-) 
  wasmFolder("/"); // call into the wasm to set the path
  import '../global.scss';

	import { getBridgeName, getClipName, mapStatusToColor } from './common';
  import { simulate } from '../test/simulate';

	// 'state' of the graph:
	let clipList = {}; // <index_of_start_frame>thru<end_of_final_frame> -> VideoClip object
	let bridges = {}; // <index_of_origin_frame> -> VideoBridge object

	const removeClip = (name) => {
    delete clipList[name];
  }

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
    addNode(payload);
    updateDisplay();
  };

  const onAddBridge = (event) => {
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
    try {
      // turn off old one 
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
    console.log('status update', payload);
    if (payload.status_of_item === "playing") {
      if (currentPlayingNodeOrEdge) {
        currentPlayingNodeOrEdge.status = "ready";
      }
      currentPlayingNodeOrEdge = nodes[payload.label_of_item] || edges[payload.label_of_item];
    }
    // see if it's a node or a bridge:
    const toUpdate = nodes[payload.label_of_item] || edges[payload.label_of_item];
    toUpdate.status = payload.status_of_item;
    updateDisplay();
  };

  /*
    GRAPH DISPLAY FUNCTIONS
  */

  // clip name -> clip object:
  let nodes = {};
  // bridge name -> bridge object:
  let edges = {};
  // images (list of images that need to be addImage'd to graphviz)
  let images = [];
  let currentPlayingNodeOrEdge = null;

  const addNode = clip => {
    const name = getClipName(clip);
    clip.status = 'added';
    nodes[name] = clip;
    let image = convertFileSrc(clip.path_to_start_frame);
    if (!images.includes(image)) {
      // images.push(image);
    }
  };

  const addEdge = bridge => {
    const name = bridge.label_of_item;//getBridgeName(bridge);
    bridge.status = 'added';
    edges[name] = bridge;
    let image = convertFileSrc(bridge.origin_clip.path_to_final_frame);
    if (!images.includes(image)) {
      // images.push(image);
    }
  };

  // renders node as dot string:
  const makeNodeFromClip = clip => {
    const name = getClipName(clip);  
    const color = mapStatusToColor(clip.status);
    const image = convertFileSrc(clip.path_to_start_frame);// for tauri need this: convertFileSrc(clip.path_to_start_frame);
    console.log('image', image);
    // , style="filled"
    // image="${image}",
    return `"${name}" [label="${name}",  color="${color}"]`;
  }
  const makeEdgeFromBridge = bridge => {
    const source = getClipName(bridge.origin_clip);
    const target = getClipName(bridge.destination_clip);
    const color = mapStatusToColor(bridge.status);
    return `"${source}" -> "${target}" [label="${getBridgeName(bridge)}", color="${color}"]`;
  }
  // updates the graph visualization, must be called very time 
  // a change or status changes in the graph
  const updateDisplay = () => {
    // generate node and edge strings:    
    const dot = `
      digraph {
        ${Object.values(nodes).map(makeNodeFromClip).join('\n')}
        ${Object.values(edges).map(makeEdgeFromBridge).join('\n')}
      }
    `;
    const viz = graphviz("#graph-container")
    images.map(i => {
      viz.addImage(i, "300px", "300px");
    });
    viz.renderDot(dot);
  };

  onMount(async () => {
    appWindow.listen('status-update', onStatusUpdate);
    appWindow.listen('add-clip', onAddClip);
    appWindow.listen('add-bridge', onAddBridge);
    const container =  document.getElementById("sigma-container");
    // simulate([{
		// 	onStatusUpdate,
		// 	onAddClip,
		// 	onAddBridge,
		// }]);
  });

</script>

<style>
  #graph-container { 
    width: 1080px;
    height: 760px;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>

<div id="graph-container">
</div>
