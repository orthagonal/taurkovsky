/*
  Contains the event handlers for generating frames and bridges from videos.
*/
use std::{
  env,
  path::Path, 
  path::PathBuf, 
};
// used to call ffmpeg and RIFE etc
use std::process::Command;
use std::thread;
use crate::tauri_events::notify_video_ready;

/* some directory helpers */
pub fn path_to_working_dir(source_video_name: &str) -> PathBuf {
  let file_stem_name = Path::file_stem(Path::new(&source_video_name)).unwrap();
  // env will already be set in set_current_dir
  Path::new(&env::current_dir().unwrap()).join(&file_stem_name)
}
pub fn path_to_frames_dir(source_video_name: &str) -> PathBuf { path_to_working_dir(source_video_name).join("frames") }
pub fn path_to_bridge_frames_dir(source_video_name: &str) -> PathBuf { path_to_working_dir(source_video_name).join("bridge_frames") }
pub fn path_to_bridge_video(source_video_name: &str) -> PathBuf { path_to_working_dir(source_video_name).join("bridge_video") }
pub fn filename(source: &str) -> String { Path::file_stem(Path::new(&source)).unwrap().to_str().unwrap().to_string() }

#[derive(Clone, Debug)]
pub struct VideoClip {
  pub path_to_start_frame: String, 
  pub path_to_end_frame: String,
}

// will set up a working directory for the video, and generate frames from it
pub fn add_new_video_source(new_video_source: String) -> PathBuf {
  let path = path_to_working_dir(&new_video_source);
  match Path::new(&path).exists() {
    false => std::fs::create_dir(Path::new(&path)).unwrap(),
    true => println!("working dir already exists"),
  }
  let frames_path = path_to_frames_dir(&new_video_source);
  match Path::new(&frames_path).exists() {
    false => std::fs::create_dir(Path::new(&frames_path)).unwrap(),
    true => println!("frames dir already exists"),
  }
  path
} 

// just calls out to ffmpeg to turn the video into frames
pub fn generate_frames_from_video(new_video_source: String, dest_dir: PathBuf) {
  // just use command to call ffmpeg executable (the time-consuming part occurs inside ffmpeg)
  let ffmpeg_cmd = match env::var("FFMPEG_CMD") {
    Ok(val) => val,
    Err(e) => panic!("FFMPEG_CMD not set! {}", e),
  };
  let ffmpeg_dir = match env::var("FFMPEG_DIR") {
    Ok(val) => val,
    Err(e) => panic!("FFMPEG_DIR not set! {}", e),
  };
  println!("src is {}", new_video_source);
  println!("ffmpeg cmd is {} in dir {}", ffmpeg_cmd, ffmpeg_dir);
  println!("printing to dir {}", dest_dir.to_str().unwrap());

  thread::spawn(move || {
    let command = Command::new("cmd")
    .current_dir("C:/ffmpeg")
    .arg("/C")
    .arg("ffmpeg.exe")
    .arg("-i")
    .arg(new_video_source)
    .arg(format!("{}/frame_%4d.png", dest_dir.display()))
    .arg("-hide_banner")
    .output().unwrap();
    println!("generate_frames_from_video result is {}", String::from_utf8(command.stdout).unwrap());
  });
}

/*
uses RIFE to interpolate frames between start and end frames
*/
pub fn create_frames(source_frame_path: PathBuf, dest_frame_path: PathBuf, dest_dir: PathBuf) {
  // `python3 inference_img.py --exp 4 --img ${originClip} ${dstClip} --folderout ${pathToTweenFrames}`,
  // cwd: "c:\\GitHub\\rife\\rife",
  let system_root = env::var("SYSTEMROOT").unwrap(); 
  let cmd_string = Path::new(&system_root).join(r#"/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"#);
  println!(">>cmd_string: {}", cmd_string.display());
  println!(">> source_frame_path: {}", source_frame_path.display());
  println!("dest_dir was {}", dest_dir.display());
  let command = Command::new(cmd_string)
  .current_dir("c:\\GitHub\\rife\\rife")
  .arg("-c")
  .arg("python3")
  .arg("inference_img.py")
  .arg("--exp 4")
  .arg("--img")
  .arg(source_frame_path)
  .arg(dest_frame_path)
  .arg(format!("--folderout {} ", dest_dir.display()))
  // .arg(format!("{}/frames/frame_%4d.png", dest_dir.display()))
  // .arg("-hide_x`banner")
  .output().unwrap();

  println!("{}", String::from_utf8(command.stdout).unwrap());
  println!("{}", String::from_utf8(command.stderr).unwrap());
}

/*
  uses ffmpeg to stitch together the frames into a video
*/
pub fn create_video_from_frames(source_dir: PathBuf, dest_dir: PathBuf, output_name: &str) -> String {
  println!(">> source_dir: {}", source_dir.display());
  println!(">> dest_dir: {}", dest_dir.display());
  println!(">> output_name: {}", output_name);
  // make sure dest_dir exists
  std::fs::create_dir_all(Path::new(&dest_dir)).unwrap();
  println!("running command now");
  // TODO: FORCE SIZE TO BE 1080X1920
  // -framerate 25 -f image2 -i frame_%0d.png -c:v libvpx -format rgba output.webm
  let command = Command::new("cmd")
    .current_dir("C:/ffmpeg")
    .arg("/C")
    .arg("ffmpeg.exe")
    .arg("-framerate")
    .arg("25")
    .arg("-f")
    .arg("image2")
    .arg("-i")
    .arg(format!("{}/img%0d.png", source_dir.display()))
    .arg("-c:v")
    .arg("libvpx")
    .arg("-format")
    .arg("rgba")
    .arg(format!("{}/{}", dest_dir.display(), output_name))
    .arg("-hide_banner")
    .output();
  let result = match command {
    Ok(val) => val,
    Err(e) => panic!("error running ffmpeg: {}", e),
  };
  println!("create_video_from_frames result is {}", String::from_utf8(result.stdout).unwrap());
  println!("create_video_from_frames result is {}", String::from_utf8(result.stderr).unwrap());
  format!("{}/{}", dest_dir.display(), output_name)
}


pub fn export_bridge(
  path_to_bridge_frames: &Path, 
  path_to_frame_1: &Path, 
  path_to_frame_2: &Path
) -> String {
  println!("path to bridge frames is {}", path_to_bridge_frames.display());
  // system assumes you don't have identically named frames in different folders
  // so always skip re-creating bridge frames:
  if !Path::exists(&path_to_bridge_frames) {
    create_frames(
      path_to_frame_1.to_path_buf(), 
      path_to_frame_2.to_path_buf(),
      path_to_bridge_frames.to_path_buf()
    );
  }
  // compile those frames to video:
  let frame_1 = path_to_frame_1.to_str().unwrap();
  let frame_2 = path_to_frame_2.to_str().unwrap();
  create_video_from_frames(
    path_to_bridge_frames.to_path_buf(),
    path_to_bridge_video(frame_1),
    format!("{}_{}.webm", filename(&frame_1), filename(&frame_2).as_str()).as_str()
  )
}

