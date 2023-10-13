// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use shared_lib::playgraph::{from_json, Playgraph};
use std::fs;
use std::fs::File;
use std::io::Read;
use tauri::Manager;


fn main() {
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![greet, load_playgraph])
        // .invoke_handler(tauri::generate_handler![greet, get_playgraph])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
