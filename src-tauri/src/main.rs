use std::collections::HashMap;
use std::env;
use generating_events::*;
use ghostidle::{VideoClip, GhostIdle};
use tauri_events::*;
use tauri::Manager;
use std::sync::{Arc, Mutex};

// mod containing events that generate folders and videos
mod generating_events;
// mod test_generating_events;
mod tauri_events;
// mod test_tauri_events;
pub mod ghostidle;
pub mod test_ghostidle;

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
  let thumbs_dir = env::current_dir().unwrap().join("thumbs");
  // framify it in another thread
  generate_frames_from_video(src_video_name.to_string(), frames_dir);
  generate_thumbs_from_video(src_video_name.to_string(), thumbs_dir);
}

pub fn notify() {
  println!("notifying");
}

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![framify_video_src, set_working_dir])
  .setup(|app| {
    let ghostidle_arc = Arc::new(Mutex::new(GhostIdle::new()));
    let main_window = app.get_window("main").unwrap();
    // by design it's cheap to clone the app handle so we will just pass clones of it around
    // so that functions can call it from anywhere
    let app_handle = app.handle();
    let id = main_window.listen("click", move|event| {
      let click_frame_payload: ClickFramePayload = serde_json::from_str(event.payload().unwrap()).unwrap();
      // think i just put this here for testing purposes?
      notify_status_update_(
        app_handle.clone(),
        "control_panel".to_string(),
        click_frame_payload.path_to_frame.clone(),
        "frame clicked".to_string(),
        50,
        "alert message from rust".to_string(),
        "".to_string()
      );
      let mut ghostidle = ghostidle_arc.lock().unwrap();
      ghostidle.add_frame(click_frame_payload, Some(app_handle.clone()));
      ghostidle.send_to_frontend(app_handle.clone(), "control_panel");
    });
    Ok(())
  })
  .run(tauri::generate_context!())
  .expect("failed to run app");
}
