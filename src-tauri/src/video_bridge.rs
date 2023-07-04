use std::{path::Path, process::Command};

use serde::{Serialize, Deserialize};

use crate::{ video_clip::VideoClip, tauri_events::notify_status_update_};

// automatically generated bridges that connect up all of the 
// videoclips the user selected
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VideoBridge {
  pub origin_clip: VideoClip, // the clip that the bridge starts at
  pub destination_clip: VideoClip, // the clip that the bridge ends at
  pub path_to_generated_frames: String, // the path to the frames that were generated by the bridge
  pub path_to_generated_video: String, // the path to the video generated by those frames
  pub label_of_item: String // a convenience label that everyone can use to refer to this bridge
}

impl VideoBridge {
  pub fn new(origin_clip: VideoClip, destination_clip: VideoClip) -> VideoBridge {
    // rectification of the names:
    let origin_frame_index = origin_clip.index_of_final_frame;
    let destination_frame_index = destination_clip.index_of_start_frame;
    let path_to_generated_frames = crate::generating_events::bridge_frames_string(
      format!("{}to{}", origin_frame_index, destination_frame_index).as_str()
    ); // eg "c:/bridge_frames/1to99"
    let label_of_item = format!("{}to{}", origin_clip.video_clip_name, destination_clip.video_clip_name);
    let path_to_generated_video = crate::generating_events::bridge_video_string(format!("{}.webm", label_of_item).as_str());  // eg "C:/bridge_videos/1to99.webm"
    VideoBridge {
      origin_clip: origin_clip,
      destination_clip: destination_clip,
      path_to_generated_frames,
      path_to_generated_video,
      label_of_item
    }
  }

  pub fn generate_frames(&self, app_handle_option: Option<tauri::AppHandle>) {
    // TODO: all this needs to be generalized and configurable for others to use
    // `python3 inference_img.py --exp 4 --img ${originClip} ${dstClip} --folderout ${pathToTweenFrames}`,
    let system_root = std::env::var("SYSTEMROOT").unwrap();
    // TODO: this is a hack, I want to make this more configurable: 
    let cmd_string = Path::new(&system_root).join(r#"/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"#);
    let path_to_start_frame = self.origin_clip.path_to_start_frame.clone();
    let path_to_final_frame = self.destination_clip.path_to_start_frame.clone();
    let path_to_generated_frames = self.path_to_generated_frames.clone();
    let command = Command::new(cmd_string)
      .current_dir("c:\\GitHub\\rife\\rife")
      .arg("-c")
      .arg("python3")
      .arg("inference_img.py")
      .arg("--exp 2")
      .arg("--img")
      .arg(path_to_start_frame.clone())
      .arg(path_to_final_frame.clone())
      .arg(format!("--folderout {} ", path_to_generated_frames))
      .output().unwrap();
    println!("{}", String::from_utf8(command.stdout).unwrap());
    println!("{}", String::from_utf8(command.stderr).unwrap());
    println!("generated frames in {}", path_to_generated_frames);
    // if there's an app handle, send a message to the frontend
    if let Some(app_handle) = app_handle_option {
      notify_status_update_(
        app_handle.clone(), 
        String::from("control_panel"),
        self.label_of_item.clone(),
        String::from("bridge_frames_exported"),
        100,
        String::from(""), 
        String::from("")
      );
    } else {
      println!("no app handle but frames were generated");
    }
  }
  
  // use your system to generate tween frames or use RIFE by default
  pub async fn generate_frames_async(&self, app_handle_option: Option<tauri::AppHandle>) {
    // TODO: all this needs to be generalized and configurable for others to use
    // `python3 inference_img.py --exp 4 --img ${originClip} ${dstClip} --folderout ${pathToTweenFrames}`,
    let system_root = std::env::var("SYSTEMROOT").unwrap(); 
    let cmd_string = Path::new(&system_root).join(r#"/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"#);
    let path_to_start_frame = self.origin_clip.path_to_start_frame.clone();
    let path_to_final_frame = self.destination_clip.path_to_start_frame.clone();
    let path_to_generated_frames = self.path_to_generated_frames.clone();
    let index_of_start_frame = self.origin_clip.index_of_final_frame;
    let index_of_final_frame = self.destination_clip.index_of_start_frame;
    let label_of_item = self.label_of_item.clone();
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
          String::from(label_of_item),
          String::from("bridge_frames_exported"),
          100,
          String::from(""), 
          String::from("")
        );
      } else {
        println!("no app handle but frames were generated");
      }
    }
  }
  
  pub fn export(&self, dest_dir: &str, app_handle_option: Option<tauri::AppHandle>) {
    println!("**********************path to bridge frames is {}", self.path_to_generated_frames);
    let path_to_generated_frames = self.path_to_generated_frames.clone();
    let path_to_generated_video = self.path_to_generated_video.clone();
    crate::tauri_events::notify_processing(app_handle_option.clone().unwrap(), self.label_of_item.clone());
    // system assumes you don't have identically named frames in different folders
    // so always skip re-creating bridge frames:
    if !Path::exists(Path::new(&self.path_to_generated_frames)) {
      self.generate_frames(app_handle_option.clone());
    }
    
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
    // if there's an app handle, send a message to the frontend
    if let Some(app_handle) = app_handle_option {
      crate::tauri_events::notify_ready(app_handle.clone(), self.label_of_item.clone());
    } else {
      println!("no app handle but bridge video was generated");
    }
  }

  pub fn export_async(&self, dest_dir: &str, app_handle_option: Option<tauri::AppHandle>) {
    println!("**********************path to bridge frames is {}", self.path_to_generated_frames);
    let path_to_generated_frames = self.path_to_generated_frames.clone();
    // TODO: support other output formats than webm
    let path_to_generated_video = format!("{}.webm", self.path_to_generated_video.clone());
    let label_of_item = self.label_of_item.clone();
    // system assumes you don't have identically named frames in different folders
    // so always skip re-creating bridge frames:
    if !Path::exists(Path::new(&self.path_to_generated_frames)) {
      // this should block the UI thread
      self.generate_frames(app_handle_option.clone());
    }
    {
      tauri::async_runtime::spawn(async move {
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
        println!("BRIDGE status: {}", command.status);
        println!("BRIDGE stdout: {}", String::from_utf8_lossy(&command.stdout));
        println!("BRIDGE stderr: {}", String::from_utf8_lossy(&command.stderr));
        // // if there's an app handle, send a message to the frontend
        if let Some(app_handle) = app_handle_option {
          crate::tauri_events::notify_ready(app_handle.clone(), label_of_item);
        } else {
          println!("no app handle but bridge video was generated");
        }
      });
    }
  }

}


#[derive(Clone, Debug)]
pub struct VideoBridgeStatus {
  pub frames_started_generating: bool,
  pub frames_done_generating: bool,
  pub video_started_generating: bool,
  pub video_done_generating: bool,
  pub status_message: String // general purpose status messaage for user
}
