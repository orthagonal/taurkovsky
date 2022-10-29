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

/* convenience functions for paths */
/* todo: probably clean this up some */
pub fn filename(source: &str) -> String { Path::file_stem(Path::new(&source)).unwrap().to_str().unwrap().to_string() }

// selecting a new file with set_working_dir will change what this returns:
pub fn get_cwd() -> PathBuf { env::current_dir().unwrap() }
pub fn get_cwd_string() -> String { get_cwd().to_str().unwrap().to_string() }
pub fn get_frames_path() -> PathBuf { get_cwd().join("frames") }
pub fn get_frames_string() -> String { get_frames_path().to_str().unwrap().to_string() }

// bridge exporting will need to be revisited:
pub fn bridge_frames_path(source_video_name: &str) -> PathBuf { get_cwd().join("bridge_frames").join(source_video_name) }
pub fn bridge_video_path(source_video_name: &str) -> PathBuf { get_cwd().join("bridge_video").join(source_video_name) }
pub fn bridge_frames_string(source_video_name: &str) -> String { bridge_frames_path(source_video_name).to_str().unwrap().to_string() }
pub fn bridge_video_string(source_video_name: &str) -> String { bridge_video_path(source_video_name).to_str().unwrap().to_string() }


// will set up a working directory for the video, and generate frames from it
pub fn add_new_video_source(new_video_source: String) -> PathBuf {
  let path = get_cwd();
  match Path::new(&path).exists() {
    false => std::fs::create_dir(Path::new(&path)).unwrap(),
    true => println!("working dir already exists"),
  }
  let frames_path = get_frames_path();
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
    .current_dir(ffmpeg_dir)
    .arg("/C")
    .arg(ffmpeg_cmd)
    .arg("-i")
    .arg(new_video_source)
    .arg(format!("{}/frame_%4d.png", dest_dir.display()))
    .arg("-hide_banner")
    .output().unwrap();
    println!("generate_frames_from_video result is {}", String::from_utf8(command.stdout).unwrap());
  });
}

// just calls out to ffmpeg to turn the video into frames
pub fn generate_thumbs_from_video(new_video_source: String, dest_dir: PathBuf) {
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
    .current_dir(ffmpeg_dir)
    .arg("/C")
    .arg(ffmpeg_cmd)
    .arg("-i")
    .arg(new_video_source)
    .arg("-vf")
    .arg("scale=320:240")
    .arg(format!("{}/frame_%4d.png", dest_dir.display()))
    .arg("-hide_banner")
    .output().unwrap();
    println!("generate_thumbs_from_video result is {}", String::from_utf8(command.stdout).unwrap());
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

#[derive(Debug)]
pub struct ClipInfo {
  start_frame: i32,
  end_frame: i32,
  frame_count: i32
}

// return distance between two ffmpeg-generated frame_000x.png files and subtract:
pub fn frame_diff(start_frame: &str, end_frame: &str) -> ClipInfo {
  let mut clip_info = ClipInfo {
    start_frame: std::str::FromStr::from_str(start_frame
      .split(".").nth(0).unwrap()   
      .split("_").last().unwrap()).unwrap(),
    end_frame: std::str::FromStr::from_str(end_frame
      .split(".").nth(0).unwrap()   
      .split("_").last().unwrap()).unwrap(),
    frame_count: 0
  };
  clip_info.frame_count = clip_info.end_frame - clip_info.start_frame;
  clip_info
}

pub fn create_video_clip(source_dir: PathBuf, dest_dir: PathBuf, clip_info: ClipInfo) -> String {
  std::fs::create_dir_all(Path::new(&dest_dir)).unwrap();
  println!("running command now");
  let output_name = format!("clip_{}_{}.webm", clip_info.start_frame, clip_info.end_frame);
  // TODO: FORCE SIZE TO BE 1080X1920
  // -framerate 25 -f image2 -i frame_%0d.png -c:v libvpx -format rgba output.webm
  let command = Command::new("cmd")
    .current_dir("C:/ffmpeg")
    .arg("/C")
    .arg("ffmpeg.exe")
    .arg("-framerate")
    .arg("23.976")
    .arg("-f")
    .arg("image2")
    .arg("-i")
    .arg(format!("{}/img%0d.png", source_dir.display()))
    .arg("-c:v")
    .arg("vp8")
    .arg("-format")
    .arg("rgba")
    .arg("-minrate")
    .arg("5200k")
    .arg("-maxrate")
    .arg("5200k")
    .arg("-b:v")
    .arg("5200k")
    // .arg("alpha_mode=\"1\"")
    .arg(format!("{}/{}", dest_dir.display(), output_name))
    .arg("-hide_banner")
    .output();
  let result = match command {
    Ok(val) => val,
    Err(e) => panic!("error running ffmpeg: {}", e),
  };

  return "Hi there".to_string()
}

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
    .arg("23.976")
    .arg("-f")
    .arg("image2")
    .arg("-i")
    .arg(format!("{}/img%0d.png", source_dir.display()))
    .arg("-c:v")
    .arg("vp8")
    .arg("-format")
    .arg("rgba")
    .arg("-minrate")
    .arg("5200k")
    .arg("-maxrate")
    .arg("5200k")
    .arg("-b:v")
    .arg("5200k")
    // .arg("alpha_mode=\"1\"")
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
  outputName: String,
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
    bridge_video_path(frame_1),
    // outputName.as_str()
    format!("{}to{}.webm", filename(&frame_1), filename(&frame_2).as_str()).as_str()
  )
}

