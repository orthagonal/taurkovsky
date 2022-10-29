/*
contains the user event handlers and notifiers for the tauri app
this is the main place that the jsx communicates with the rust code
*/
use std::{sync::{Arc, Mutex}, path::Path};
use tauri::Manager;
use crate::{generating_events::get_cwd_string, video_clip::VideoClip, video_bridge::VideoBridge};

use crate::generating_events::{get_cwd, filename};

// when the user clicks a frame of video in the main screen:
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClickFramePayload {
  pub index_of_frame: i32, // index of the frame in the sequence of frames in the video
  pub path_to_frame: String,  // path to the frame that was clicked
  pub is_start_frame: bool, // whether this is the start frame or end frame for the clip
}

// notify control panel that a frame has been clicked by user:
pub fn notify_frame_clicked(app_handle: tauri::AppHandle, frame_payload: ClickFramePayload) { 
  let destination_window = app_handle.get_window("control_panel").unwrap();
  destination_window.emit("add-frame", Some(frame_payload)).unwrap();
}

pub fn notify_clip_added(app_handle: tauri::AppHandle, clip: VideoClip) {
  let control_panel = app_handle.get_window("control_panel").unwrap();
  let preview_window = app_handle.get_window("preview").unwrap();
  control_panel.emit("add-clip", Some(clip.clone())).unwrap();
  preview_window.emit("add-clip", Some(clip)).unwrap();
}

pub fn notify_add_bridge(app_handle: tauri::AppHandle, bridge: VideoBridge) {
  let control_panel = app_handle.get_window("control_panel").unwrap();
  let preview_window = app_handle.get_window("preview").unwrap();
  control_panel.emit("add-bridge", Some(bridge.clone())).unwrap();
  preview_window.emit("add-bridge", Some(bridge)).unwrap();
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct GhostIdlePayload {
  pub clips: Vec<VideoClip>,
  pub bridges: Vec<VideoBridge>,
}

// when the app updates the status of a processing item
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct StatusUpdate {
  label_of_item: String,
  status_of_item: String,
  progress_percent: i32,
  alert_message: String,
  error: String
}

pub fn notify_processing(app_handle: tauri::AppHandle, label_of_item: String) {
  notify_status_update_(
    app_handle, 
    "control_panel".to_string(), 
    label_of_item, 
    "processing".to_string(), 
    50, // progress meter ??
    "".to_string(), // no alert msg
    "".to_string() // no error msg
  );
}

pub fn notify_ready(app_handle: tauri::AppHandle, label_of_item: String) {
  notify_status_update_(
    app_handle.clone(), 
    "control_panel".to_string(), 
    label_of_item.clone(), 
    "ready".to_string(), 
    100, // progress meter ??
    "".to_string(), // no alert msg
    "".to_string() // no error msg
  );
  notify_status_update_(
    app_handle, 
    "preview".to_string(), 
    label_of_item, 
    "ready".to_string(), 
    100, // progress meter ??
    "".to_string(), // no alert msg
    "".to_string() // no error msg
  );
}

//////////////////////////////////////////////
/// updates sent to the status_of_item panel 
/// ////////////////////////////////////
pub fn notify_status_update_(
  app_handle: tauri::AppHandle, 
  label_of_destination_window: String, 
  label_of_item: String, 
  status_of_item: String, 
  progress_percent: i32, 
  alert_message: String, 
  error: String) {
  dbg!("######################notifying status update:");
  dbg!(label_of_destination_window.clone());
  dbg!(label_of_item.clone());
  dbg!(status_of_item.clone());
  dbg!(progress_percent);
  dbg!(alert_message.clone());
  dbg!(error.clone());
  dbg!("######################");
  let destination_window = app_handle.get_window(label_of_destination_window.as_str()).unwrap();
  destination_window.emit("status-update", StatusUpdate {
    label_of_item: label_of_item,
    status_of_item: status_of_item,
    progress_percent: progress_percent,
    alert_message: alert_message,
    error: error
  }).unwrap();
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
  // for clip in clips.iter() {
  //   let start_frame = filename(&clip.path_to_start_frame);
  //   let end_frame = get_cwd_string(&clip.path_to_final_frame);
  //   let frames_dir = path_to_frames_dir(&clip.path_to_start_frame);
  //   let output_dir = get_cwd(&clip.path_to_start_frame);
  //   let clip_info = frame_diff(&start_frame, &end_frame);
  //   let new_file = create_video_clip(frames_dir, output_dir, clip_info);
  //   // notify_video_ready(app_handle.clone(), new_file);
  // }
  for clip_one in clips.iter() {
    for clip_two in clips.iter() {
      // skip if it's the same one:
      if clip_one.path_to_start_frame == clip_two.path_to_start_frame {
        continue;
      }

      // make a bridge to join the clip_two.path_to_final_frame to clip_one.path_to_start_frame
      let path_to_frame_1 = Path::new(&clip_one.path_to_final_frame);
      let path_to_frame_2 = Path::new(&clip_two.path_to_start_frame);
      let frame_1 = &clip_one.path_to_start_frame;
      let string_to_bridge_frames = format!("{}_{}", get_cwd_string(), filename(&frame_1));
      // let string_to_bridge_frames = format!("{}_{}", get_cwd_string(&frame_1), filename(&frame_1));
      let path_to_bridge_frames = Path::new(&string_to_bridge_frames);
      if !previous_reports.contains_key(&string_to_bridge_frames) {
        notify_status_update_(app_handle.clone(), "control_panel".to_string(), string_to_bridge_frames.clone(), "generating bridge frames".to_string(), 0, "".to_string(), "".to_string());
        // export_bridge(path_to_bridge_frames, path_to_frame_1, path_to_frame_2);
        if !Path::exists(&path_to_bridge_frames) {
          crate::generating_events::create_frames(
            path_to_frame_1.to_path_buf(), 
            path_to_frame_2.to_path_buf(),
            path_to_bridge_frames.to_path_buf()
          );
        }
        notify_status_update_(app_handle.clone(), "control_panel".to_string(), string_to_bridge_frames.clone(), "generating bridge video".to_string(), 100, "".to_string(), "".to_string());
        let frame_1 = path_to_frame_1.to_str().unwrap();
        let frame_2 = path_to_frame_2.to_str().unwrap();
        crate::generating_events::create_video_from_frames(
          path_to_bridge_frames.to_path_buf(),
          crate::generating_events::bridge_video_path(frame_1),
          format!("{}_{}.webm", filename(&frame_1), filename(&frame_2).as_str()).as_str()
        );
        notify_status_update_(app_handle.clone(), "control_panel".to_string(), string_to_bridge_frames.clone(), "bridge generated".to_string(), 100, "".to_string(), "".to_string());
        previous_reports.insert(string_to_bridge_frames.clone(), true);
      }

      // make a bridge to join the clip_one.path_to_final_frame to clip_two.path_to_start_frame
      let path_to_frame_1 = Path::new(&clip_two.path_to_final_frame);
      let path_to_frame_2 = Path::new(&clip_one.path_to_start_frame);
      let frame_2 = &clip_two.path_to_start_frame;
      let string_to_bridge_frames2 = format!("{}_{}", get_cwd_string(), filename(&frame_2));
      // let string_to_bridge_frames2 = format!("{}_{}", get_cwd_string(&frame_2), filename(&frame_2));
      let path_to_bridge_frames2 = Path::new(&string_to_bridge_frames2);
      if !previous_reports.contains_key(&string_to_bridge_frames2) {
        notify_status_update_(app_handle.clone(), "control_panel".to_string(), string_to_bridge_frames2.clone(), "generating bridge frames".to_string(), 0, "".to_string(), "".to_string());
        if !Path::exists(&path_to_bridge_frames) {
          crate::generating_events::create_frames(
            path_to_frame_1.to_path_buf(), 
            path_to_frame_2.to_path_buf(),
            path_to_bridge_frames.to_path_buf()
          );
        }
        // compile those frames to video:
        notify_status_update_(app_handle.clone(), "control_panel".to_string(), string_to_bridge_frames2.clone(), "generating bridge video".to_string(), 100, "".to_string(), "".to_string());
        let frame_1 = path_to_frame_1.to_str().unwrap();
        let frame_2 = path_to_frame_2.to_str().unwrap();
        crate::generating_events::create_video_from_frames(
          path_to_bridge_frames.to_path_buf(),
          crate::generating_events::bridge_video_path(frame_1),
          format!("{}_{}.webm", filename(&frame_1), filename(&frame_2).as_str()).as_str()
        );
        // export_bridge(path_to_bridge_frames2, path_to_frame_1, path_to_frame_2);
        previous_reports.insert(string_to_bridge_frames2.clone(), true);
        notify_status_update_(app_handle.clone(), "control_panel".to_string(), string_to_bridge_frames2, "bridge generated".to_string(), 100, "".to_string(), "".to_string());
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
pub fn set_clip(app_handle: tauri::AppHandle, click_frame_payload: ClickFramePayload, video_clips_mutex: &Arc<Mutex<Vec<VideoClip>>>) {
  // if click_frame_payload.is_start_frame {
  //   let clip = VideoClip {
  //     path_to_start_frame: click_frame_payload.path_to_frame,
  //     path_to_final_frame: "".to_string(),
  //       index_of_start_frame: todo!(),
  //       index_of_final_frame: todo!(),
  //       path_to_generated_video: todo!(),
  //   };
  //   let mut video_clips = video_clips_mutex.lock().unwrap();
  //   println!("video is {:?}", video_clips);
  //   video_clips.push(clip);
  // } else {
  //   // just set the end frame on the last video clip
  //   let mut video_clips = video_clips_mutex.lock().unwrap();
  //   let mut video_clip = video_clips.last_mut().unwrap();
  //   // notify control_panel there's a new clip
  //   video_clip.path_to_final_frame = click_frame_payload.path_to_frame;
  //   notify_clip_added(app_handle.clone(), click_frame_payload.path_to_frame.clone());
  // }
}

// node_modules/node.env/api.js:128:17: ERROR: Could not resolve "asyncawait/async"
// node_modules/node.env/api.js:129:17: ERROR: Could not resolve "asyncawait/await"
