// vite assets must be imported specifically in order to be included in the dev server
import thumb1 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0001.png';
import thumb2 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0002.png';
import thumb3 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0003.png';
import thumb4 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0004.png';
import thumb5 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0005.png';
import thumb6 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0006.png';
import thumb7 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0007.png';
import thumb8 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0008.png';
import thumb9 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0009.png';
import thumb10 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0010.png';
import thumb11 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0011.png';
import thumb12 from 'C:/Users/ortha/AppData/Roaming/taurkovsky/MVI_5830/thumbs/frame_0012.png';

// sample event payloads and other things to build tests from:
// FramePicker uses this to simulate getting a list of thumbs from readDir

const thumbList = [
  thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7, thumb8, thumb9, thumb10, thumb11, thumb12
]
export const readDirThumbs = thumbList.map(t => ({
  name: t.split('/').pop(),
  path: t.split('/').slice(0, -1).join('/'),
  realPath: t.replace('thumbs', 'frames'),
}));

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