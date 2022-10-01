
// use generating_events::add_new_video_source;
use crate::generating_events::{*};

#[cfg(test)]
  #[test]
    fn turns_video_path_into_frames_dir() {
      let result = add_new_video_source("sourceVideos/node_1_12.webm".to_string());
    }

    // #[test]
    // fn creates_frames_in_frames_dir() {
    //   let path = add_new_video_source("./sourceVideos/node_1_12.webm".to_string());
    //   let frames_path = path_to_frames_dir(path.to_str().unwrap());
    //  generate_frames_from_video("../sourceVideos/node_1_12.webm".to_string(), path);
    // }

  // #[test]
  // fn create_bridge_in_bridge_dir() {
  //   let source_video_name = "sourceVideos/node_1_12.webm";
  //   let dest_dir = path_to_bridge_frames_dir(source_video_name);
  //   let start_frame = path_to_frames_dir(source_video_name).join("frame_0001.png");
  //   let end_frame = path_to_frames_dir(source_video_name).join("frame_0009.png");
  //   println!("start_frame: {}", start_frame.display());
  //   println!("end_frame: {}", end_frame.display());
  //   println!("dest_dir: {}", dest_dir.display());
  //   create_frames(
  //     start_frame,
  //     end_frame,
  //     dest_dir
  //   );
  // }

  // #[test]
  // fn test_create_video_from_frames() {
  //   let source_video_name = "sourceVideos/node_1_12.webm";
  //   let dest_dir = path_to_bridge_video(source_video_name);
  //   let source_dir = path_to_working_dir(source_video_name);
  //   print!("dest_dir: {}", dest_dir.display());
  //   create_video_from_frames(source_dir, dest_dir);
  // }

// use std::env;

//   #[test]
//   fn test_ffmpeg() {
//     let dest_dir = Path::new("C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5817\\frames");
//     let new_video_source = "E:\\intro\\MVI_5817.MOV";

//     let result  = env::var("FFMPEG_CMD");
//     let ffmpeg_cmd = match result {
//       Ok(val) => val,
//       Err(e) => panic!("FFMPEG_CMD not set! {}", e),
//     };
//     println!("ffmpeg cmd is {}", ffmpeg_cmd);
//     println!("printing to dir {}", dest_dir.display());
//     let command = Command::new("./ffmpeg.exe")
//     .current_dir("c:/ffmpeg/")
//     .arg("-i")
//     .arg(new_video_source)
//     .arg(format!("{}/frames/frame_%4d.png", dest_dir.display()))
//     .arg("-hide_banner")
//     .output();
//     println!("command is {:?}", command);
//   }