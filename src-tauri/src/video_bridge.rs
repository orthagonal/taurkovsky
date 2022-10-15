use std::{path::Path, process::Command};

use serde::{Serialize, Deserialize};

use crate::{generating_events::{bridge_frames_path, get_cwd}, video_clip::VideoClip, tauri_events::notify_status_update_};

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
    // rectification of the names:
    let origin_frame_index = origin_clip.index_of_final_frame;
    let destination_frame_index = destination_clip.index_of_start_frame;
    let bridgeName = format!("{}to{}", origin_frame_index, destination_frame_index);
    let videoName = format!("{}.webm", bridgeName);
    let path_to_generated_frames = bridge_frames_path(&origin_clip.path_to_start_frame.clone()).join(bridgeName.clone()).to_str().unwrap().to_string();
    let path_to_generated_video = get_cwd().join(videoName).to_str().unwrap().to_string();
    // let path_to_generated_video = get_cwd(&origin_clip.path_to_start_frame.clone()).join(videoName).to_str().unwrap().to_string();
    VideoBridge {
      origin_clip: origin_clip,
      destination_clip: destination_clip,
      path_to_generated_frames,
      path_to_generated_video 
    }
  }

  // use your system to generate tween frames or use RIFE by default
  pub async fn generate_frames(&self, app_handle_option: Option<&tauri::AppHandle>) {
    // TODO: all this needs to be generalized and configurable for others to use
    // `python3 inference_img.py --exp 4 --img ${originClip} ${dstClip} --folderout ${pathToTweenFrames}`,
    let system_root = std::env::var("SYSTEMROOT").unwrap(); 
    let cmd_string = Path::new(&system_root).join(r#"/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"#);
    let path_to_start_frame = self.origin_clip.path_to_start_frame.clone();
    let path_to_final_frame = self.destination_clip.path_to_start_frame.clone();
    let path_to_generated_frames = self.path_to_generated_frames.clone();
    let index_of_start_frame = self.origin_clip.index_of_final_frame;
    let index_of_final_frame = self.destination_clip.index_of_start_frame;
    {
      let child_thread = tauri::async_runtime::spawn(async move {
        let command = Command::new(cmd_string)
          .current_dir("c:\\GitHub\\rife\\rife")
          .arg("-c")
          .arg("python3")
          .arg("inference_img.py")
          .arg("--exp 4")
          .arg("--img")
          .arg(path_to_start_frame.clone())
          .arg(path_to_final_frame.clone())
          .arg(format!("--folderout {} ", path_to_generated_frames))
          .output().unwrap();
        println!("{}", String::from_utf8(command.stdout).unwrap());
        println!("{}", String::from_utf8(command.stderr).unwrap());
        println!("generated frames in {}", path_to_generated_frames);
      });
      let res = child_thread.await;
      // if there's an app handle, send a message to the frontend
      if let Some(app_handle) = app_handle_option {
        notify_status_update_(
          app_handle.clone(), 
          String::from("control_panel"),
          String::from(format!("{}to{}", index_of_start_frame, index_of_final_frame)), 
          String::from("frames_exported"),
          100,
          String::from(""), 
          String::from("")
        );
      } else {
        println!("no app handle but frames were generated");
      }
    }
  }
  
  pub async fn export(&self, dest_dir: &str, app_handle_option: Option<&tauri::AppHandle>) {
    println!("path to bridge frames is {}", self.path_to_generated_frames);
    let path_to_generated_frames = self.path_to_generated_frames.clone();
    let path_to_generated_video = self.path_to_generated_video.clone();
    let label_of_item = self.path_to_generated_video.clone();
    // system assumes you don't have identically named frames in different folders
    // so always skip re-creating bridge frames:
    if !Path::exists(Path::new(&self.path_to_generated_frames)) {
      self.generate_frames(app_handle_option).await;
    }
    {
      let child_thread = tauri::async_runtime::spawn(async move {
        // ffmpeg  -start_number 1 -i frame_0004/frames/frame_%04d.png -c:v vp8 -format rgba -vframes 150 frame_0004/4thru99.webm -hide_banner
        let command = Command::new("cmd")
          .current_dir(std::path::PathBuf::from("C:/ffmpeg"))
          .arg("/C")
          .arg("ffmpeg.exe")
          .arg("-i")
          .arg(format!("{}\\img%0d.png", path_to_generated_frames))
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
          .arg(path_to_generated_video.clone())
          .arg("-hide_banner")
          .output()
          .unwrap(); // executes command in sync
        println!("status: {}", command.status);
        println!("stdout: {}", String::from_utf8_lossy(&command.stdout));
        println!("stderr: {}", String::from_utf8_lossy(&command.stderr));
      });
      let res = child_thread.await;
      // if there's an app handle, send a message to the frontend
      if let Some(app_handle) = app_handle_option {
        notify_status_update_(
          app_handle.clone(), 
          String::from("control_panel"),
          label_of_item, 
          String::from("frames_exported"),
          100,
          String::from(""), 
          String::from("")
        );
      } else {
        println!("no app handle but bridge video was generated");
      }
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
