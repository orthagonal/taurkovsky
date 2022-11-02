
// sample event payloads and other things to build tests from:

export const sampleClips = {
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
export const f1 = sampleClips[43_102];
export const f2 = sampleClips[142_202];
export const sampleFrames = {
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
export const sampleUpdates = {
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
    '142thru202to43thru102': {
      label_of_item: "142thru202to43thru102",
      status_of_item: "processing",
      progress_percent: 50,
      alert_message: "",
    },
    '43thru102to142thru202': {
      label_of_item: "43thru102to142thru202",
      status_of_item: "processing",
      progress_percent: 50,
      alert_message: "",
    },
};
export const sampleBridge = {
  '142thru202to43thru102': {
    origin_clip: sampleClips[43_102],
    destination_clip: sampleClips[142_202],
    label_of_item: "142thru202to43thru102",
    path_to_generated_frames: "",
    path_to_generated_video: ""
  },
  '43thru102to142thru202': {
    origin_clip: sampleClips[142_202],
    destination_clip: sampleClips[43_102],
    label_of_item: "43thru102to142thru202",
    path_to_generated_frames: "",
    path_to_generated_video: ""
  },
};