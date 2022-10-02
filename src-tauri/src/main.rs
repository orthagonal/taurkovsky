use std::collections::HashMap;
use std::path::{Path};
use std::env;
use generating_events::*;
use tauri_events::*;
use tauri::Manager;
use std::sync::{Arc, Mutex};

// mod containing events that generate folders and videos
mod generating_events;
mod test_generating_events;
mod tauri_events;
mod test_tauri_events;

#[tauri::command]
fn set_working_dir(working_dir: &str) {
  // could also do this with tauri::State<WorkingDir> managed state...
  env::set_current_dir(working_dir).unwrap();
}

#[tauri::command]
fn framify_video_src(src_video_name: &str) {
  println!("src video path is {}", src_video_name);
  // we should already be in this videos' working dir
  let frames_dir = env::current_dir().unwrap().join("frames");
  if Path::exists(&frames_dir) {
    println!("frames dir already exists");
  } else {
    // framify it in another thread
    generate_frames_from_video(src_video_name.to_string(), frames_dir);
  }
}

pub fn notify() {
  println!("notifying");
}

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![framify_video_src, set_working_dir])
  .setup(|app| {
    let video_clips_vec = Vec::<VideoClip>::new();
    let idle_frames_mutex = Arc::new(Mutex::new(video_clips_vec));
    let previous_exports = HashMap::<String, bool>::new();
    let previous_exports_mutex = Arc::new(Mutex::new(previous_exports));
    let main_window = app.get_window("main").unwrap();
    // by design it's cheap to clone the app handle so we will just pass clones of it around
    // so that functions can call it from anywhere
    let app_handle = app.handle();
    let id = main_window.listen("click", move|event| {
      let click_frame_payload: ClickFramePayload = serde_json::from_str(event.payload().unwrap()).unwrap();
      set_clip(click_frame_payload, &idle_frames_mutex);
      // if two or more start generating join frames
      let idle_frames  = idle_frames_mutex.lock().unwrap();
      let previous_exports = previous_exports_mutex.lock().unwrap();
      let l = (*idle_frames).last().unwrap();
      // export if there's multiple complete clips selected:
      if (*idle_frames).len() > 1 && l.path_to_end_frame != "" {
        export_ghostidle(
          &app_handle.clone(), 
        (*idle_frames).clone(), 
        &mut (*previous_exports).clone()
      );
        // todo: notify frontend when the vid is ready
        // might need to happen in the thread that's generating the video
      }
    });
    Ok(())
  })
  .run(tauri::generate_context!())
  .expect("failed to run app");
}
