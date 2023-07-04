import { readDirThumbs, sampleBridge, sampleClips, sampleFrames, sampleUpdates } from "./testData";
// mock TAURI_IPC
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks"
import fs from 'fs';
export const simulateVideoSelection = (components) => {
  mockIPC((str, args) => {
    const message = args.message;
    const { cmd, event } = message;
    switch (cmd) {
      case "listen":
        // tauri listening to an 'event' from js, eg add-frame, add-clip, status-update etc
        return 1;
      case 'resolvePath':
        // tauri resolving a path to a file
        return 'resolvePath!';  // args wwill have path and directory fields
      case 'extname':
        // tauri getting the extension of a file, will have path field
        // return args.path.split('.').pop();
        return 'extname!';
      case 'basename':
        // tauri getting the basename of a file, will have path field
        // return args.path.split('/').pop();
        return 'basename!';
      case 'join':
        // tauri joining a path, will have path and directory fields
        return message.paths.join('//');
      case 'readDir':
        // tauri doing readdir to get list of thumbs to show in framepicker, adds file:// to work in browser test
        return readDirThumbs;
        // .map(e => { e.path = `file:///${e.path}`; return e; });
      default:
        console.log('unhandled cmd', cmd);
        break;
      }
   });
  
  // to simulate firing an event on all components, just call this
  const callHandlers = async (eventName, event) => {
    for (const component of components) {
      console.log('eventName', eventName);
      if (component[eventName]) {
        console.log('calling handler', eventName);
        component[eventName](event);
      }
    }
  };
  
  const zeropad = (num, size) => {
    const length = num.toString().length;
    return length === 1 ? `000${num}` :
    length === 2 ? `00${num}` :
    length === 3 ? `0${num}` :
    length === 4 ? `${num}` :
    num;
  }

  const testWorkingDir = 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830';
  const onSelectVideoPayload = {
    working_dir: testWorkingDir,
    frame_dir: `${testWorkingDir}/frames`,
    thumbs_dir: `${testWorkingDir}/thumbs`,
    // array of paths to the frames
    frame_entries: [...Array(706).keys()].map((i) => `file:///${testWorkingDir}/frames/frame_${zeropad(i)}.png`), // list of frame filenames
  };

  setTimeout(() => {
    callHandlers('onSelectVideo', { payload: onSelectVideoPayload });
  }, 100);
  setTimeout(() => {
    callHandlers('onFramesReady', { payload: "c://Users//ortha//AppData//Roaming//taurkovsky//MVI_5830" });
  }, 300);
};


// passed from js to tauri
export const frontendEvents = {
  clickThumbFrame(event, payload) {
    // index_of_frame: frameEl.frameIndex,
    // path_to_frame: frameEl.realPath,
    // is_start_frame: isStartFrame
  },
  exportGraph(event, payload) {
    // exports the graph as a json file
  }
};

// events that get passed from tauri to js
export const backendEvents = {
  // add one individual frame
  listenAddFrame(args) {
    // 'add-frame'
  },
  // notifies when frames are done procesing and thumbs ready to be displayed in frontend
  listenFramesReady(args) {
    // working_dir: "",
    // frames_dir: "", 
    // thumbs_dir: "",
    // frame_entries: ""
  },
  // notifies progress of clip processing
  listenStatusUpdate(args) {
    // {
    //     label_of_item: "43thru102",
    //     status_of_item: "processing",
    //     progress_percent: 50,
    //     alert_message: "",
    //     error: ""
    // }
  },
  // notifies when a video sequence (clip) is ready so it can be shown in the frontend
  listenAddClip(args) {
    // {
    //   index_of_start_frame:43,
    //   path_to_start_frame: "/c/workspace",
    //   index_of_final_frame:102,
    //   path_to_final_frame:"/c/workspace",
    //   video_clip_name:"",
    //   path_to_generated_video:""
    // }
  },
  // notifies when a bridge (joins frames that are not in sequence) is ready so it can be shown in the frontend
  listenAddBridge(args) {
    // {
    //   origin_clip: sampleClips[43_102],
    //   destination_clip: sampleClips[142_202],
    //   path_to_generated_frames: "",
    //   path_to_generated_video: ""
    // }
  },
  listenPlayStarted(args) {
    // {
    //   finished_type: "clip",
    //   finished: labelname of video that just stopped playing
    //   started: labelname of video that started
    //   started_type: "bridge"
    // }
  }


}

// mock for tauri module in common.js
export const simulateTauri = {
  simulateVideoSelection,
  appWindow: {
    listen(event, payload) {

    },
    emit(event, payload) {
    }
  },
  // the func that opens the file dialog and returns file selection
  open(options) {
    return Promise.resolve({
      filePaths: simulateVideoSelection()
    });
  },
  convertFileSrc(src) {
    console.log("convertFileSrc: ", src);
    return src;
  },
  invoke(cmd, args) {
    console.log("need to handle invoking", cmd, args);
  },
  join(...args) {
    console.log("join", args);
    return args.join("/");
  },
  readDir(path) {
    console.log("readDir", path);
    if (path === "c://Users//ortha//AppData//Roaming//taurkovsky//MVI_5830/thumbs") {
      return readDirThumbs;
    }
  },
  appDir() {
    console.log("appDir");
    return 'c://Users//ortha//AppData//Roaming//taurkovsky//MVI_5830'
  }
};




export const simulate = async (components) => {
  // to simulate firing an event on all components, just call this
  const callHandlers = async (eventName, event) => {
    for (const component of components) {
      if (component[eventName]) {
        component[eventName](event);
      }
    }
  };
  let playing = 0;
  let prev = 0;
  let vids = ['43thru102', '43thru102to142thru202', '142thru202', '142thru202to43thru102'];
  // simulate the current playing clip being updated
  // in the real app this will originate from the Preview window
  const updatePlaying = () => {
    prev = playing;
    playing = (playing + 1) % vids.length;
    callHandlers('onPlayStarted', {
      payload: {
        started: vids[playing],
        started_type: playing == 0 || playing % 2 == 0 ? 'clip' : 'bridge',
        finished: vids[prev],
        finished_type: prev == 0 || prev % 2 == 0 ? 'clip' : 'bridge',
      }
    });
  }

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
      callHandlers('onAddFrame', { payload: sampleFrames[43] });
    }, 1000);
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[102] });
      callHandlers('onAddClip', { payload: sampleClips[43_102] });
    }, 2000);
    // simulate clicking two more frames to create another clip
    // while we notify that the first clip started processing
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[142] });
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102'] });
    }, 3000);
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[202] });
      callHandlers('onAddClip', { payload: sampleClips[142_202] });
      // creating a second clip also creates bridges between that clip and all other clips:
      callHandlers('onAddBridge', { payload: sampleBridge['142thru202to43thru102'] });
      callHandlers('onAddBridge', { payload: sampleBridge['43thru102to142thru202'] });
      sampleUpdates['43thru102'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102'] });
      sampleUpdates['142thru202'].status_of_item = 'processing';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202'] });
    }, 3500);
    setTimeout(() => {
      sampleUpdates['142thru202'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202'] });
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202to43thru102'] });
    }, 4000);
    setTimeout(() => {
      sampleUpdates['142thru202to43thru102'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202to43thru102'] });
      sampleUpdates['43thru102to142thru202'].status_of_item = 'processing'
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102to142thru202'] });
    }, 4500);
    setTimeout(() => {
      sampleUpdates['43thru102to142thru202'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102to142thru202'] });
      setInterval(() => {
        updatePlaying();
      }, 5000);
    }, 5000);
};