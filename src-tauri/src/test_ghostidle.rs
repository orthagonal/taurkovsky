
// use generating_events::add_new_video_source;


#[cfg(test)] 
  use crate::ghostidle::GhostIdle;
  use crate::{tauri_events::ClickFramePayload, ghostidle::{VideoClip, VideoBridge}};
  // macro to help run async funcs in await mode so we can test the outcomes
  macro_rules! aw {
    ($e:expr) => {
        tokio_test::block_on($e)
    };
  }

  // TODO: helper to get the names of the frames, needs to be made generic
  fn framename(filename: &str) -> String {
    let path_to_frames = "C:\\GitHub\\taurkovsky\\src-tauri\\frame_0004\\frames";
    format!("{}\\{}", path_to_frames, filename)
  }

  // #[test]
  // fn create_a_new_video_clip() {
  //   // initial clip should be blank:
  //   let mut clip = VideoClip::new(4, "frame_0004.png".to_string(), -1, "".to_string());
  //   assert_eq!(clip.index_of_start_frame, 4);
  //   assert_eq!(clip.path_to_start_frame, "frame_0004.png".to_string());
  //   assert_eq!(clip.index_of_final_frame, -1);
  //   assert_eq!(clip.path_to_final_frame, "".to_string());
  //   // adding to that clip should do this:
  //   clip.add_last_frame(25, "frame_0025.png".to_string());
  //   assert_eq!(clip.index_of_start_frame, 4);
  //   assert_eq!(clip.path_to_start_frame, "frame_0004.png".to_string());
  //   assert_eq!(clip.index_of_final_frame, 25);
  //   assert_eq!(clip.path_to_final_frame, "frame_0025.png".to_string());
  //   assert_eq!(clip.video_clip_name, "4thru25".to_string());
  // }

  // async fn run_video_clip_export(clip: VideoClip) -> String{
  //   println!("calling run_video_clip_export now");
  //   clip.export("C:\\GitHub\\taurkovsky\\src-tauri\\frame_0004\\", None).await;
  //   println!("done calling run_video_clip_export");
  //   "done".to_string()
  // }

  // #[test]
  // fn export_a_video_clip() {
  //   let mut clip = VideoClip::new(4, framename("frame_0004.png"), -1, "".to_string());
  //   clip.add_last_frame(199, framename("frame_0199.png"));
  //   let res = aw!(run_video_clip_export(clip));
  //   // confirm video exists and is correct in folder
  // }

  // #[test]
  // fn create_a_new_video_bridge() {
  //   let clipA = VideoClip::new(4, "frame_0004.png".to_string(), 22, "frame_0022.png".to_string());
  //   let clipB = VideoClip::new(44, "frame_0044.png".to_string(), 67, "frame_0067.png".to_string());
  //   let bridge = VideoBridge::new(clipA, clipB);
  //   assert_eq!(bridge.origin_clip.index_of_start_frame, 4);
  //   assert_eq!(bridge.destination_clip.index_of_final_frame, 67);
  // }

  // helper to run the next test in async:
  async fn run_video_bridge_export(bridge: VideoBridge) -> String{
    println!("calling run_video_bridge_export now");
    bridge.export("C:\\GitHub\\taurkovsky\\src-tauri\\frame_0004\\", None).await;
    println!("done calling run_video_bridge_export");
    "done".to_string()
  }

  #[test]
  fn export_a_video_bridge() {
    let clipA = VideoClip::new(4, framename("frame_0004.png"), 22, framename("frame_0022.png"));
    let clipB = VideoClip::new(274, framename("frame_0274.png"), 280, framename("frame_0280.png"));
    let bridge = VideoBridge::new(clipA, clipB);
    let res = aw!(run_video_bridge_export(bridge));
  }


  
  /*
  #[test]
  fn create_a_new_ghostidle() {
    let ghostidle = GhostIdle::new();
  }

  #[test]
  fn add_frames_to_ghostidle() {
    let mut ghostidle = GhostIdle::new();
    ghostidle.add_frame(ClickFramePayload {
      path_to_frame: "frame_0001.png".to_string(),
      index_of_frame: 1,
      is_start_frame: true,
    }, None);
    ghostidle.add_frame(ClickFramePayload {
      path_to_frame: "frame_0025.png".to_string(),
      index_of_frame: 25,
      is_start_frame: false,
    }, None);
    assert_eq!(ghostidle.graph.vertex_count(), 1);
    let last_clip = ghostidle.graph.fetch(&ghostidle.last_clip_index.clone()).unwrap();
    assert_eq!(last_clip.index_of_start_frame, 1);
  }

  #[test]
  fn add_clips_to_ghostidle() {
    let mut ghostidle = GhostIdle::new();
    ghostidle.add_frame(ClickFramePayload {
      path_to_frame: "frame_001.png".to_string(),
      index_of_frame: 1,
      is_start_frame: true,
    }, None);
    ghostidle.add_frame(ClickFramePayload {
      path_to_frame: "frame_0025.png".to_string(),
      index_of_frame: 25,
      is_start_frame: false,
    }, None);
    ghostidle.add_frame(ClickFramePayload {
      path_to_frame: "frame_0038.png".to_string(),
      index_of_frame: 38,
      is_start_frame: true,
    }, None);
    ghostidle.add_frame(ClickFramePayload {
      path_to_frame: "frame_0076.png".to_string(),
      index_of_frame: 76,
      is_start_frame: false,
    }, None);
    let last_clip = ghostidle.graph.fetch(&ghostidle.last_clip_index.clone()).unwrap();
    assert_eq!(last_clip.index_of_start_frame, 38);
    println!("****************************************");
    for bridge_map in ghostidle.bridges.iter() {
      for item in bridge_map.1.iter() {
        // println!("bridge: {:?}", item);
        let bridge = item.1;
        println!("bridge from {} to {}", bridge.origin_clip.index_of_final_frame, bridge.destination_clip.index_of_start_frame);
      }
    }
    assert_eq!(ghostidle.bridges.len(), 2);
  }

  
*/