use std::{collections::HashMap, rc::Rc, cell::RefCell, process::Command};
use serde::{Serialize, Deserialize};
use tauri::Manager;
use crate::generating_events::{bridge_video_string, bridge_frames_path, filename, working_dir_path, working_dir_string, bridge_video_path, bridge_frames_string, frames_dir_string};
use graphlib::{Graph, VertexId};
// used for spawning ffmpeg.exe calls in the background:
use tauri::async_runtime::spawn;

// internal list of clips selected by user by clicking frames
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VideoClip {
  pub index_of_start_frame: i32,
  pub path_to_start_frame: String,
  pub index_of_final_frame: i32, 
  pub path_to_final_frame: String,
  pub video_clip_name: String,
  pub path_to_generated_video: String
}  // TODO: do i want to impl the generation of video_clip_name etc????

impl VideoClip {
  pub fn new(index_of_start_frame: i32, path_to_start_frame: String, index_of_final_frame: i32, path_to_final_frame: String) -> VideoClip {
    println!("the path is {}", working_dir_string(&path_to_start_frame.clone()));
    VideoClip {
      index_of_start_frame,
      path_to_start_frame: path_to_start_frame.clone(),
      index_of_final_frame,
      video_clip_name: "".to_string(),
      path_to_final_frame: path_to_final_frame.clone(),
      path_to_generated_video: "unknown".to_string(),
    }
  }

  pub fn add_last_frame(&mut self, index_of_final_frame: i32, path_to_final_frame: String) {
    self.index_of_final_frame = index_of_final_frame;
    self.path_to_final_frame = path_to_final_frame;
    self.update_video_clip_name();
  }

  pub fn update_video_clip_name(&mut self) {
    self.video_clip_name = format!("{}thru{}", self.index_of_start_frame, self.index_of_final_frame)
  }

  // export clips as frame:
  pub fn export(&self, dest_dir: &str, app_handle_option: Option<&tauri::AppHandle>) {
    std::fs::create_dir_all(std::path::Path::new(&dest_dir)).unwrap();
    let start_frame = self.index_of_start_frame;
    let final_frame = self.index_of_final_frame;
    // ffmpeg  -start_number 1 -pattern_type sequence -i frame_0004/frames/frame_%04d.png -c:v vp8 -format rgba -vframes 150 frame_0004/4thru99.webm -hide_banner
    let command = Command::new("cmd")
      .current_dir(std::path::PathBuf::from("C:/ffmpeg"))
      .arg("/C")
      .arg("ffmpeg.exe")
      // make video starting at start frame and going for n frames
      .arg("-start_number")
      .arg(format!("{}", start_frame))
      .arg("-pattern_type")
      .arg("sequence")
      .arg("-i")
      // .arg(self.path_to_start_frame.as_str()) 
      .arg(format!("{}\\frame_%04d.png", frames_dir_string(&self.path_to_start_frame))) // frames should have been named frame_0001.png, frame_0002.png in this folder by this app using ffmpeg
      .arg("-c:v")
      .arg("vp8")
      .arg("-format")
      .arg("rgba")
      // force CBR
      .arg("-minrate")
      .arg("5200k")
      .arg("-maxrate")
      .arg("5200k")
      .arg("-b:v")
      .arg("5200k")
      // .arg("alpha_mode=\"1\"")
      .arg("-vframes")
      .arg((final_frame - start_frame).to_string())
      .arg(format!("{}/{}.webm", dest_dir, self.video_clip_name))
      .arg("-hide_banner")
      .output()
      .unwrap(); // executes command in sync
    println!("status: {}", command.status);
    println!("stdout: {}", String::from_utf8_lossy(&command.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&command.stderr));
  }
}

// is to be emitted to the frontend
// current status of each video clip
#[derive(Clone, Debug)]
pub struct VideoClipStatus {
  pub end_frame_is_selected: bool, // user selected first frame and then final frame
  pub video_is_generated: bool,
  pub status_message: String // general purpose status message for user
}

// automatically generated bridges that connect up all of the 
// videoclips the user selected
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VideoBridge {
  pub origin_clip: VideoClip,
  pub destination_clip: VideoClip,
  pub path_to_generated_frames: String,
  pub path_to_generated_video: String
}

impl VideoBridge {
  pub fn new(origin_clip: VideoClip, destination_clip: VideoClip) -> VideoBridge {
    let path_to_generated_frames = bridge_frames_string(&origin_clip.path_to_start_frame.clone());
    let path_to_generated_video = bridge_video_string(&origin_clip.path_to_start_frame.clone());
    VideoBridge {
      destination_clip: destination_clip,
      origin_clip: origin_clip,
      path_to_generated_frames,
      path_to_generated_video
    }
  }
}

// current status of each video bridge
#[derive(Clone, Debug)]
pub struct VideoBridgeStatus {
  pub frames_started_generating: bool,
  pub frames_done_generating: bool,
  pub video_started_generating: bool,
  pub video_done_generating: bool,
  pub status_message: String // general purpose status messaage for user
}

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
          // this is the second frame of the clip, get a mutable copy of it and update:
          let mut_last_clip = self.graph.fetch_mut(&self.last_clip_index).unwrap();
          mut_last_clip.add_last_frame(frame.index_of_frame, frame.path_to_frame);
          // todo: trigger thread to immediately start generating videoclip and call notify_video when done
          match app_handle_option {
            Some(app_handle) => {
              println!("app handle here!!!");
              println!("app handle here!!!");
              println!("app handle here!!!");
            }
            None => {
              // do nothing, mainly used by cargo test when unit testing with no tauri app
            }
          }          
        }
      },
      None => {
        // if there are no clips, then we're starting a new clip
        self.last_clip_index = self.graph.add_vertex(VideoClip::new(frame.index_of_frame, frame.path_to_frame, -1, "".to_string()));
      }
    }
    self.recalculate_bridges();
  }

  // when a user modifies the ghostidle in any way, recalculate the bridges we need
  pub fn recalculate_bridges(&mut self) {
    // for now I just add the edges then iterate over them since v1 will just be a complete graph for now
    // future versions will change to allow more complicated graph structures though
    for &v1 in self.graph.clone().vertices() {
      for &v2 in self.graph.clone().vertices() {
        if v1 != v2 {
          let origin_clip = self.graph.fetch(&v1).unwrap();
          let dest_clip = self.graph.fetch(&v2).unwrap();
          let start_name = format!("{}{}", origin_clip.video_clip_name, origin_clip.index_of_final_frame);
          let final_name = format!("{}{}", dest_clip.video_clip_name, dest_clip.index_of_start_frame);
          let bridge_video_name = format!("{}-{}", start_name, final_name);
          let start_frame = filename(&origin_clip.path_to_start_frame);
          if self.bridges.contains_key(&v1) {
            let mut bridge_map = self.bridges.get_mut(&v1).unwrap();
            bridge_map.insert(v2, VideoBridge::new(origin_clip.clone(), dest_clip.clone()));
          } else {
            let mut bridge_map = HashMap::<VertexId, VideoBridge>::new();
            bridge_map.insert(v2, VideoBridge::new(origin_clip.clone(), dest_clip.clone()));
            self.bridges.insert(v1, bridge_map);
          }
        }
      }
    }
  }

  pub fn save_to_disk(&mut self) {
  }

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