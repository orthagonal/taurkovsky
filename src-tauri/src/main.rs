#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::{Path};

fn main() {
    println!("I am awake!");
    tauri::Builder::default()
        // Register the 'stream' custom protocol
        .register_uri_scheme_protocol("stream", move |app, request| {
            // print a debug msg to screen showing this:
            println!("request.uri() = {}", request.uri());

            // TODO i think i have to generate a table for include_bytes! of all the webms then supply them from here
            // FOR NOW I THINK THIS IS GOOD ENOUGH AND THEN WHEN I PUBLISH I CAN WORK ON INCLUDING HIDING THE RESOURCES

            // Extract the path from the URL, replacing the 'stream://' protocol part with an empty string
            let relative_path = request.uri().replace("stream://localhost", "");

            // Use the app's path resolver to resolve the path to the resource directory
            let resource_dir = app.path_resolver().app_dir().expect("failed to resolve app directory");
            let final_path = resource_dir.join("public").join(relative_path.strip_prefix('/').expect("expected a leading slash"));

            println!("file_path = {:?}", final_path);
            
            // Read the file contents from the specified path
            match std::fs::read(final_path) {
                Ok(contents) => tauri::http::ResponseBuilder::new()
                    .header("Origin", "*")
                    .header("Access-Control-Allow-Origin", "*")
                    .mimetype("video/webm")
                    .header("Content-Length", contents.len())
                    .status(200)
                    .body(contents),
                Err(e) => {
                    println!("Failed to read file: {:?}", e);
                    tauri::http::ResponseBuilder::new()
                        .status(404)
                        .body(Vec::new())
                }
            }
        })
        // .invoke_handler(tauri::generate_handler![greet, load_playgraph])
        // .invoke_handler(tauri::generate_handler![greet, get_playgraph])
        .run(tauri::generate_context!("tauri.conf.json"))
        .expect("error while running tauri application");
}