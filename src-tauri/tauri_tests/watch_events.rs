/*
 not sure if still using this
*/
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher, Config};
use std::fs;
use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt, StreamExt,
};


#[tauri::command]
fn start_watching() {
  let cwd = std::env::current_dir().unwrap();
  let parent_dir = cwd.parent().unwrap().to_path_buf();
  let path = Path::new(&parent_dir).join("sourceVideos");
  println!("path: {:?}", path);
  futures::executor::block_on(async {
    if let Err(e) = async_watch(path).await {
        println!("error: {:?}", e)
    }
  });
}

fn async_watcher() -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
  let (mut tx, rx) = channel(1);

  // Automatically select the best implementation for your platform.
  // You can also access each implementation directly e.g. INotifyWatcher.
  let watcher = RecommendedWatcher::new(move |res| {
      futures::executor::block_on(async {
          tx.send(res).await.unwrap();
      })
  }, Config::default())?;

  Ok((watcher, rx))
}

async fn async_watch<P: AsRef<Path>>(path: P) -> notify::Result<()> {
  let (mut watcher, mut rx) = async_watcher()?;
  watcher.watch(path.as_ref(), RecursiveMode::Recursive)?;
  while let Some(res) = rx.next().await {
      match res {
          Ok(event @ Event { kind: notify::EventKind::Create(notify::event::CreateKind::Any), .. }) => {
              println!("CREATED A NEW ONE {:?}", event);
            //  generating_events::add_new_video_source("sourceVideos/node_1_12.webml".to_string());
              // generating_events::add_new_video_source(event.paths.first().unwrap().to_str().unwrap().to_string());
          },
          Ok(event) => println!("changed: {:?}", event),
          Err(e) => println!("watch error: {:?}", e),
      }
  }

  Ok(())
}
