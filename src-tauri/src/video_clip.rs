use std::{process::Command, path::Path};

use serde::{Serialize, Deserialize};

use crate::{generating_events::{get_frames_string}, tauri_events::notify_status_update_};

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
  pub fn new(
    index_of_start_frame: i32, 
    path_to_start_frame: String, 
    index_of_final_frame: i32, 
    path_to_final_frame: String
  ) -> VideoClip {
    VideoClip {
      index_of_start_frame,
      path_to_start_frame: path_to_start_frame.clone(),
      index_of_final_frame,
      video_clip_name: "".to_string(),
      path_to_final_frame: path_to_final_frame.clone(),
      path_to_generated_video: "".to_string()
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

  // export clips as webm video:
  pub fn export(&self, dest_dir: &str, app_handle_option: Option<tauri::AppHandle>) {
    std::fs::create_dir_all(std::path::Path::new(&dest_dir)).unwrap();
    let start_frame = self.index_of_start_frame;
    let final_frame = self.index_of_final_frame;
    // ffmpeg  -start_number 1 -pattern_type sequence -i frame_0004/frames/frame_%04d.png -c:v vp8 -format rgba -vframes 150 frame_0004/4thru99.webm -hide_banner
    let start_frame = start_frame;
    let video_clip_name = self.video_clip_name.to_string();
    let dest_dir = dest_dir.to_string();
    let frames_src = format!("{}/{}", get_frames_string(), "frame_%04d.png");
    let output_path = format!("{}\\{}.webm", dest_dir, video_clip_name);
    let cmd = Command::new("cmd")
      .current_dir(std::path::PathBuf::from("C:/ffmpeg"))
      .arg("/C")
      // .arg("dir")
      // .arg(frames_src)
      .arg("ffmpeg.exe")
      // // make video starting at start frame and going for n frames
      .arg("-start_number")
      .arg(format!("{}", start_frame))
      .arg("-pattern_type")
      .arg("sequence")
      .arg("-i")
      // // .arg(self.path_to_start_frame.as_str()) 
      .arg(frames_src) // frames should have been named frame_0001.png, frame_0002.png in this folder by this app using ffmpeg
      .arg("-c:v")
      .arg("vp8")
      .arg("-format")
      .arg("rgba")
      // // force CBR
      .arg("-minrate")
      .arg("5200k")
      .arg("-maxrate")
      .arg("5200k")
      .arg("-b:v")
      .arg("5200k")
      // // .arg("alpha_mode=\"1\"")
      .arg("-vframes")
      .arg((final_frame - start_frame).to_string())
      .arg(&output_path)
      .arg("-hide_banner")
      .output()
      .unwrap(); // executes command in sync
    println!("ffmpeg export complete, result is:::::");
    println!("status: {}", cmd.status);
    println!("stdout: {}", String::from_utf8_lossy(&cmd.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&cmd.stderr));

    if let Some(app_handle) = app_handle_option {
      notify_status_update_(
        app_handle.clone(), 
        String::from("control_panel"),
        output_path,
        String::from("video_clip_exported"),
        100,
        String::from(""), 
        String::from("")
      );
    } else {
      println!("no app handle but video {} was generated", output_path);
    }
  }


  pub async fn export_async(&self, dest_dir: &str, app_handle_option: Option<&tauri::AppHandle>) {
    std::fs::create_dir_all(std::path::Path::new(&dest_dir)).unwrap();
    let start_frame = self.index_of_start_frame;
    let final_frame = self.index_of_final_frame;
    // ffmpeg  -start_number 1 -pattern_type sequence -i frame_0004/frames/frame_%04d.png -c:v vp8 -format rgba -vframes 150 frame_0004/4thru99.webm -hide_banner
    {
      let start_frame = start_frame;
      let path_to_start_frame = self.path_to_start_frame.to_string();
      let video_clip_name = self.video_clip_name.to_string();
      let dest_dir = dest_dir.to_string();
      println!("starting ffmpeg export of {}thru{} to {}", start_frame, final_frame, dest_dir);
      let child_thread = tauri::async_runtime::spawn(async move {
        let cmd = Command::new("cmd")
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
          .arg(format!("{}\\4d.png", get_frames_string())) // frames should have been named frame_0001.png, frame_0002.png in this folder by this app using ffmpeg
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
          .arg(format!("{}/{}.webm", dest_dir, video_clip_name))
          .arg("-hide_banner")
          .output()
          .unwrap(); // executes command in sync
        println!("status: {}", cmd.status);
        println!("stdout: {}", String::from_utf8_lossy(&cmd.stdout));
        println!("stderr: {}", String::from_utf8_lossy(&cmd.stderr));
      });
      let res = child_thread.await;
      // if there's an app handle, send a message to the frontend
      if let Some(app_handle) = app_handle_option {
        notify_status_update_(
          app_handle.clone(), 
          String::from("control_panel"),
          String::from("1to25.webm"), 
          String::from("video_clip_exported"),
          100,
          String::from(""), 
          String::from("")
        );
      } else {
        println!("no app handle but video was generated");
      }
    }
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
