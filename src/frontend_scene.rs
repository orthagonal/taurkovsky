// scene.rs

use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use web_sys::{HtmlElement, HtmlImageElement, HtmlVideoElement};
use crate::video::VideoClip;
use std::rc::Rc;

pub struct Scene {
  pub clips: HashMap<String, Rc<VideoClip>>,
}

impl Scene {
  pub fn new() -> Self {
      Self {
          clips: HashMap::new(),
      }
  }
  
  pub async fn load_clip(&mut self, clip: VideoClip) {
    let title = clip.title.clone();
    let element = {
        let video = HtmlVideoElement::new().unwrap();
        video.set_id(&clip.title);
        video.set_src(&clip.title); // The src is set to the title
        video.set_attribute("type", if clip.title.contains(".mp4") { "video/mp4" } else { "video/webm" }).unwrap();
        video.set_controls(false);
        video.set_autoplay(false);
        video.set_muted(true);
        video.set_width(1280); // Replace with actual width
        video.set_height(720); // Replace with actual height
        video.into()
    };
    let video_clip = Rc::new(VideoClip {
        title: clip.title,
        element: Some(element),
        lookup_name: clip.lookup_name,
        mask_path: clip.mask_path,
        mask_reveal: clip.mask_reveal,
        mask_reveal_el: None,
    });
    self.clips.insert(title, video_clip);
}

  // pub async fn load(&mut self, video_clips: HashMap<String, VideoClip>) {
  //     for (title, mut clip) in video_clips.into_iter() {
  //         let element = match clip.title.contains(".png") {
  //               true => {
  //                   let img = HtmlImageElement::new().unwrap();
  //                   img.set_id(&clip.title);
  //                   img.set_src(&clip.title); // The src is set to the title
  //                   img.set_width(1280); // Replace with actual width
  //                   img.set_height(720); // Replace with actual height
  //                   img.into()
  //               },
  //               false => {
  //                   let video = HtmlVideoElement::new().unwrap();
  //                   video.set_id(&clip.title);
  //                   video.set_src(&clip.title); // The src is set to the title
  //                   video.set_attribute("type", if clip.title.contains(".mp4") { "video/mp4" } else { "video/webm" }).unwrap();
  //                   video.set_controls(false);
  //                   video.set_autoplay(false);
  //                   video.set_muted(true);
  //                   video.set_width(1280); // Replace with actual width
  //                   video.set_height(720); // Replace with actual height
  //                   video.into()
  //               },
  //           };

  //           let video_clip = Rc::new(VideoClip {
  //               title: clip.title,
  //               element: Some(element),
  //               lookup_name: clip.lookup_name,
  //               mask_path: clip.mask_path,
  //               mask_reveal: clip.mask_reveal,
  //               mask_reveal_el: None,
  //           });

  //           self.clips.insert(title, video_clip);
  //     }
  // }

  // This function can be called to unload the video clips
  pub fn unload(&mut self) {
      for (_, clip) in self.clips.iter_mut() {
          if let Some(element) = clip.element.as_ref() {
              element.set_attribute("src", "").unwrap();
          }
      }
      self.clips.clear();
  }
}
