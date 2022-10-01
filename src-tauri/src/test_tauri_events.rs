use crate::tauri_events::{*};
use std::path::{PathBuf, Path};
use std::sync::{Arc, Mutex};

#[cfg(test)]
  // #[test]
  // fn check_it() {
  //   let payload = ClickFramePayload {
  //     path_to_frame: "path_to_first".to_string(),
  //     is_start_frame: true,
  //   };
  //   let idle_frames_mutex = Arc::new(Mutex::new(Vec::<VideoClip>::new()));
  //   set_clip(payload, &idle_frames_mutex );

  //   let end_payload = ClickFramePayload {
  //     path_to_frame: "path_to_last".to_string(),
  //     is_start_frame: false,
  //   };
  //   set_clip(end_payload, &idle_frames_mutex );
  //   let idle_frames = idle_frames_mutex.lock().unwrap();
  //   println!("idle_frames_mutex: {:?}", idle_frames);
  // }


  #[test]
  fn check_export_video() {
    let source_dirs: Vec<PathBuf> = vec![
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0083_frame_0083").to_path_buf(),
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0001_frame_0001").to_path_buf(),
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0028_frame_0028").to_path_buf(),
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0071_frame_0071").to_path_buf(),
    ];
    let dest_dirs: Vec<PathBuf> = vec![
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0126").to_path_buf(),
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0026").to_path_buf(),
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0126\\bridge_video").to_path_buf(),
      Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5955\\frame_0126\\bridge_video").to_path_buf(),
    ];
    let output_name = "output.webm";
    for it in source_dirs.iter().zip(dest_dirs.iter()) {
      let (source_dir, dest_dir) = it;
      println!("source_dir: {:?}", source_dir);
      println!("dest_dir: {:?}", dest_dir);
      crate::generating_events::create_video_from_frames(source_dir.to_path_buf(), dest_dir.to_path_buf(), output_name);
    }
  }
