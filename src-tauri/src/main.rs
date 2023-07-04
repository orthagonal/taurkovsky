use std::env;
use std::fs;
use std::fs::create_dir_all;
use generating_events::*;
use ghostidle::*;

use tauri_events::*;
use tauri::Manager;
use std::sync::{Arc, Mutex};

// mod containing events that generate folders and videos
mod generating_events;
// mod test_generating_events;
mod tauri_events;
// mod test_tauri_events;
pub mod ghostidle;
pub mod video_clip;
pub mod video_bridge;
// pub mod test_ghostidle;


// simple relay from preview -> control_panel when videos start playing
#[tauri::command]
fn preview_video_started(app_handle: tauri::AppHandle, label_of_item: String) {
  println!(">>>>>>>>preview_video_started: {:?}", label_of_item);
  notify_status_update_(
    app_handle, 
    "control_panel".to_string(), 
    label_of_item.to_string(), 
    "playing".to_string(), 
    0,
    "".to_string(),
    "".to_string()
  )
}

#[tauri::command]
fn set_working_dir(working_dir: &str) {
  dbg!(working_dir);
  // could also do this with tauri::State<WorkingDir> managed state...
  env::set_current_dir(working_dir).unwrap();
  // ensure all working dirs exist:
  create_dir_all(working_dir).unwrap();
  create_dir_all(get_frames_string()).unwrap();
  create_dir_all(get_thumbs_string()).unwrap();
  // create_dir_all(bridge_frames_string()).unwrap();
  // create_dir_all(format!("{}/bridge_video", working_dir)).unwrap();
}

#[tauri::command]
fn framify_video_src(app_handle: tauri::AppHandle, src_video_name: &str) {
  println!("src video path is {}", src_video_name);
  // we should already be in this videos' working dir
  let frames_dir = env::current_dir().unwrap().join("frames");
  let thumbs_dir = env::current_dir().unwrap().join("thumbs");
  // framify it in another thread
  generate_frames_from_video(src_video_name.to_string(), frames_dir);
  generate_thumbs_from_video(app_handle, src_video_name.to_string(), thumbs_dir);
}

pub fn notify() {
  println!("notifying");
}

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![
    framify_video_src, 
    set_working_dir,
    preview_video_started
  ])
  .setup(|app| {
    let ghostidle_arc = Arc::new(Mutex::new(GhostIdle::new()));
    let main_window = app.get_window("main").unwrap();
    // by design it's cheap to clone the app handle so we will just pass clones of it around
    // so that functions can call it from anywhere
    let app_handle = app.handle();
    let event_app_handle = app_handle.clone();

    // main user event is clicking a frame
    main_window.listen("click", move|event| {
      let click_frame_payload: ClickFramePayload = serde_json::from_str(event.payload().unwrap()).unwrap();
      // think i just put this here for testing purposes?
      // notify_status_update_(
      //   app_handle.clone(),
      //   "control_panel".to_string(),
      //   click_frame_payload.path_to_frame.clone(),
      //   "frame-clicked".to_string(),
      //   50,
      //   "alert message from rust".to_string(),
      //   "".to_string()
      // );
      let mut ghostidle = ghostidle_arc.lock().unwrap();
      ghostidle.add_frame(click_frame_payload, Some(event_app_handle.clone()));
      ghostidle.send_to_frontend(event_app_handle.clone(), "control_panel");
    });
    // get the app dir:
    let app_dir = app_handle.path_resolver().app_dir().unwrap();
    let mut paths: Vec<_> = fs::read_dir(app_dir).unwrap()
      .map(|r| r.unwrap())
      .collect();
    paths.sort_by_key(|dir| dir.metadata().unwrap().modified().unwrap());
    for entry in paths {
      if entry.metadata().unwrap().is_dir() {
        set_working_dir(entry.path().to_str().unwrap());
        let frames_dir = get_frames_string();
        let frame_entries = get_frames_from_dir(std::path::PathBuf::from(frames_dir));
        notify_frames_ready(app_handle, frame_entries);
        break;
      }
    }
    Ok(())
  })
  .run(tauri::generate_context!())
  .expect("failed to run app");
}
