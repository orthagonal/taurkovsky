use std::{
  collections::HashMap, 
  rc::Rc, 
  cell::RefCell, 
  path::Path,
  process::Command
};
use serde::{Serialize, Deserialize};
use tauri::Manager;
use crate::{  
  generating_events::{
    filename, 
    get_cwd_string 
  }, 
  tauri_events::notify_status_update_, video_bridge::VideoBridge, video_clip::VideoClip
};
use graphlib::{Graph, VertexId};
// used for spawning ffmpeg.exe calls in the background:
// use tauri::api::process::{Command, CommandEvent};

#[derive(Clone, Debug)]
pub struct GhostIdle {
  pub graph: Graph<VideoClip>,
  pub last_clip_index: VertexId,
  pub bridges: HashMap<VertexId, HashMap<VertexId, VideoBridge>>, //id1 -> id2 -> VideoBridge
}

impl GhostIdle {
  pub fn new() -> Self {
    Self {
      graph: Graph::new(),
      last_clip_index: VertexId::random(),
      bridges: HashMap::new()
    }
  }

  // every time a user clicks a frame, either it's the first frame of 
  // a new video clip or the last frame of the current clip
  pub fn add_frame(&mut self, frame: crate::tauri_events::ClickFramePayload, app_handle_option: Option<tauri::AppHandle>) {
    // get last clip
    let last_clip_option = self.graph.fetch(&self.last_clip_index.clone());
    match last_clip_option {
      Some(last_clip) => {
        // if this is the first frame of a new clip:
        if last_clip.index_of_final_frame != -1 {
          self.last_clip_index = self.graph.add_vertex(VideoClip::new(frame.index_of_frame, frame.path_to_frame, -1, "".to_string()));
        } else {
          // if the user selected the final frame for the clip, set it on the last clip added:
          let mut_last_clip = self.graph.fetch_mut(&self.last_clip_index).unwrap();
          mut_last_clip.add_last_frame(frame.index_of_frame, frame.path_to_frame);
          mut_last_clip.export(&get_cwd_string(), app_handle_option.clone());
        }
      },
      // if this is the very first frame of the very first clip created:
      None => {
        println!("no last clip exists this is the first one");
        // if there are no clips, then we're starting a new clip
        self.last_clip_index = self.graph.add_vertex(VideoClip::new(frame.index_of_frame, frame.path_to_frame, -1, "".to_string()));
      }
    }
    self.recalculate_bridges(app_handle_option.clone());
  }

  // when a user modifies the ghostidle in any way, recalculate the bridges we need
  pub fn recalculate_bridges(&mut self, app_handle_option: Option<tauri::AppHandle>) {
    // for now I just add the edges then iterate over them since v1 will just be a complete graph for now
    // future versions will change to allow more complicated graph structures though
    for &v1 in self.graph.clone().vertices() {
      for &v2 in self.graph.clone().vertices() {
        dbg!("&&&&&&&&&&");
        if v1 != v2 {
          let origin_clip = self.graph.fetch(&v1).unwrap();
          let dest_clip = self.graph.fetch(&v2).unwrap();
          dbg!(origin_clip);
          dbg!(dest_clip);
          let start_name = format!("{}{}", origin_clip.video_clip_name, origin_clip.index_of_final_frame);
          let final_name = format!("{}{}", dest_clip.video_clip_name, dest_clip.index_of_start_frame);
          let bridge_video_name = format!("{}-{}", start_name, final_name);
          let start_frame = filename(&origin_clip.path_to_start_frame);
          if self.bridges.contains_key(&v1) {
            let mut bridge_map = self.bridges.get_mut(&v1).unwrap();
            // start exporting the bridge right away so it will be ready sooner:
            let bridge = VideoBridge::new(origin_clip.clone(), dest_clip.clone());
            bridge.export_async(&get_cwd_string(), app_handle_option.clone());
            bridge_map.insert(v2, bridge);
          } else {
            let mut bridge_map = HashMap::<VertexId, VideoBridge>::new();
            let bridge = VideoBridge::new(origin_clip.clone(), dest_clip.clone());
            bridge.export_async(&get_cwd_string(), app_handle_option.clone());
            bridge_map.insert(v2, bridge);
            self.bridges.insert(v1, bridge_map);
          }
        }
      }
    }
  }

  pub fn save_to_disk(&mut self) {
  }

  // serialize the ghostidle graph and send to front end:
  pub fn send_to_frontend(&mut self, app_handle: tauri::AppHandle, destination_frontend: &str) {
    let mut payload = crate::tauri_events::GhostIdlePayload {
      clips: Vec::<VideoClip>::new(),
      bridges: Vec::<VideoBridge>::new()
    };
    for &v in self.graph.clone().vertices() {
      payload.clips.push(self.graph.fetch(&v).unwrap().clone());
    }
    for (v1, bridge_map) in self.bridges.clone() {
      for (v2, bridge) in bridge_map {
        payload.bridges.push(bridge.clone());
      }
    }
    let destination_window = app_handle.get_window(destination_frontend).unwrap();
    destination_window.emit("ghostidle", serde_json::to_string(&payload).unwrap());
  }

  pub fn export_clips(&mut self, app_handle: tauri::AppHandle) {
    for x in self.graph.vertices() {
      let clip = self.graph.fetch(x).unwrap();

    }
  }

  pub fn export_bridges(&mut self, app_handle: tauri::AppHandle) {
  }

  pub fn export_videos(&mut self, app_handle: tauri::AppHandle) {
    self.export_clips(app_handle);
  }

}