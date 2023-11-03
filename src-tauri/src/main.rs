#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::{Path};

fn main() {
    println!("I am awake!");
    tauri::Builder::default()
        // Register the 'stream' custom protocol
        .register_uri_scheme_protocol("stream", move |_app, request| {
            // print a debug msg to screen showing this:
            println!("request.uri() = {}", request.uri());
            // Extract the path from the URL, replacing the 'stream://' protocol part with an empty string
            let relative_path = request.uri().replace("stream://localhost", "");

            // Resolve the absolute path to the file
            let base_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../src/trailer");
            let file_path = base_path.join(relative_path);
            println!("file_path = {:?}", file_path);
            // Read the file contents from the specified path
            let contents = std::fs::read(file_path)?;
            tauri::http::ResponseBuilder::new()
                .header("Origin", "*")
                .mimetype("video/webm")
                .header("Content-Length", contents.len())
                .status(200)
                .body(contents)
        })
        // .invoke_handler(tauri::generate_handler![greet, load_playgraph])
        // .invoke_handler(tauri::generate_handler![greet, get_playgraph])
        .run(tauri::generate_context!("tauri.conf.json"))
        .expect("error while running tauri application");
}
