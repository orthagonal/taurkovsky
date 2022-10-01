// struct GhostIdle {
//   pub working_dir: PathBuf,
//   pub nodes: Vec<Video>,
//   pub bridges: Vec<Video>
// }

// impl GhostIdle {
//   pub fn new() -> GhostIdle {
//     GhostIdle {
//       working_dir: PathBuf::from("workingDir"),
//       nodes: Vec::new(),
//       bridges: Vec::new()
//     }
//   }

//   pub fn add_new_video_source(&mut self, video_path: String) -> PathBuf {
//     let video_path = PathBuf::from(video_path);
//     let video_name = video_path.file_name().unwrap().to_str().unwrap();
//     let frames_dir = self.working_dir.join(video_name);
//     let frames_dir = frames_dir.join("frames");
//     let bridge_frames_dir = frames_dir.join("bridge_frames");
//     let bridge_video_dir = frames_dir.join("bridge_video");
//     let bridge_video = bridge_video_dir.join("bridge.mp4");
//     let video = Video::new(video_path, frames_dir, bridge_frames_dir, bridge_video);
//     self.nodes.push(video);
//     self.nodes.last().unwrap().frames_dir.clone()
//   }

//   pub fn generate_frames_from_video(&self, video_path: String, frames_dir: PathBuf) {
//     let video_path = PathBuf::from(video_path);
//     let video_name = video_path.file_name().unwrap().to_str().unwrap();
//     let frames_dir = frames_dir.join(video_name);
//     let frames_dir = frames_dir.join("frames");
//     let bridge_frames_dir = frames_dir.join("bridge_frames");
//     let bridge_video_dir = frames_dir.join("bridge_video");
//     let bridge_video = bridge_video_dir.join("bridge.mp4");
//     let video = Video::new(video_path, frames_dir, bridge_frames_dir, bridge_video);
//     video.generate_frames_from_video();
//   }

//   pub fn create_frames(&self, start_frame: PathBuf, end_frame: PathBuf, dest_dir: PathBuf) {
//     let bridge = Bridge::new(start_frame, end_frame, dest_dir);
//     bridge.create_frames();
//   }

//   pub fn create_video_from_frames(&self, source_dir: PathBuf, dest_dir: PathBuf) {
//     let video = Video::new(source_dir, dest_dir, dest_dir, dest_dir);
//     video.create_video_from_frames();
//   }
// }