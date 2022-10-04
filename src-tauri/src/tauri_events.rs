/*
contains the user event handlers and notifiers for the tauri app
this is the main place that the jsx communicates with the rust code
*/
use std::{sync::{Arc, Mutex}, path::Path, thread::sleep_ms};
use tauri::Manager;
use crate::generating_events::{VideoClip, path_to_working_dir, filename, export_bridge, path_to_frames_dir, frame_diff, create_video_clip};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClickFramePayload {
  pub path_to_frame: String,  // path to the frame that was clicked
  pub is_start_frame: bool, // whether this is the start frame or end frame for the clip
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Emission {
  recipient: String,
  signal: String,
  message: String,
  error: String
}

pub fn notify_video_ready(app_handle: tauri::AppHandle, video_path: String) {
  println!("notifying video ready");
  let emission = Emission {
    recipient: "video_ready".to_string(),
    signal: "video_ready".to_string(),
    message: video_path,
    error: "".to_string()
  };
  print!("emission: {:?}", emission);
  let preview_window = app_handle.get_window("preview").unwrap();
  preview_window.emit("video-ready", emission).unwrap();
}

// for each clip:
  // export that clip as a video
// for each pair of clips, 
  // make a bridge between the last frame of one and the first frame of two
  // make a bridge back from last frame of two to first frame of one
  // don't re-process frames that have already been processed
pub fn export_ghostidle(
  app_handle: &tauri::AppHandle, 
  clips: Vec::<VideoClip>, 
  previous_reports: &mut std::collections::HashMap::<String, bool>
) {
  // export each clip in between as a video
  for clip in clips.iter() {
    let start_frame = filename(&clip.path_to_start_frame);
    let end_frame = filename(&clip.path_to_end_frame);
    let frames_dir = path_to_frames_dir(&clip.path_to_start_frame);
    let output_dir = path_to_working_dir(&clip.path_to_start_frame);
    let clip_info = frame_diff(&start_frame, &end_frame);
    let new_file = create_video_clip(frames_dir, output_dir, clip_info);
    // notify_video_ready(app_handle.clone(), new_file);
  }
  for clip_one in clips.iter() {
    for clip_two in clips.iter() {
      // skip if it's the same one:
      if clip_one.path_to_start_frame == clip_two.path_to_start_frame {
        continue;
      }

      // make a bridge to join the clip_two.path_to_end_frame to clip_one.path_to_start_frame
      let path_to_frame_1 = Path::new(&clip_one.path_to_end_frame);
      let path_to_frame_2 = Path::new(&clip_two.path_to_start_frame);
      let frame_1 = &clip_one.path_to_start_frame;
      let string_to_bridge_frames = format!("{}_{}", path_to_working_dir(&frame_1).display(), filename(&frame_1));
      let path_to_bridge_frames = Path::new(&string_to_bridge_frames);
      if !previous_reports.contains_key(&string_to_bridge_frames) {
        let name = export_bridge(path_to_bridge_frames, path_to_frame_1, path_to_frame_2);
        previous_reports.insert(string_to_bridge_frames, true);
        notify_video_ready(app_handle.clone(), name);
      }

      // make a bridge to join the clip_one.path_to_end_frame to clip_two.path_to_start_frame
      let path_to_frame_1 = Path::new(&clip_two.path_to_end_frame);
      let path_to_frame_2 = Path::new(&clip_one.path_to_start_frame);
      let frame_2 = &clip_two.path_to_start_frame;
      let string_to_bridge_frames2 = format!("{}_{}", path_to_working_dir(&frame_2).display(), filename(&frame_2));
      let path_to_bridge_frames2 = Path::new(&string_to_bridge_frames2);
      if !previous_reports.contains_key(&string_to_bridge_frames2) {
        let name2 = export_bridge(path_to_bridge_frames2, path_to_frame_1, path_to_frame_2);
        previous_reports.insert(string_to_bridge_frames2, true);
        notify_video_ready(app_handle.clone(), name2);
      }
    }
  }
}

/*
when user selects/deselects a frame, we 
add it to the list of selected frames 
TODO: and score it versus the other in/out frames
and display the score
*/

// first time user clicks is the start frame, second time is the end frame
pub fn set_clip(click_frame_payload: ClickFramePayload, video_clips_mutex: &Arc<Mutex<Vec<VideoClip>>>) {
  if click_frame_payload.is_start_frame {
    let clip = VideoClip {
      path_to_start_frame: click_frame_payload.path_to_frame,
      path_to_end_frame: "".to_string(),
    };
    let mut video_clips = video_clips_mutex.lock().unwrap();
    println!("video is {:?}", video_clips);
    video_clips.push(clip);
  } else {
    // just set the end frame on the last video clip
    let mut video_clips = video_clips_mutex.lock().unwrap();
    let mut video_clip = video_clips.last_mut().unwrap();
    video_clip.path_to_end_frame = click_frame_payload.path_to_frame;
    println!("video is {:?}", video_clips);
  }
}