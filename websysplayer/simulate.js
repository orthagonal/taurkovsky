// function to simulate a user clicking things

const  simulate = () => {
  const sampleClips = {
    43_102: {
        index_of_start_frame: 43,
        path_to_start_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0044.png",
        index_of_final_frame: 102,
        path_to_final_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0102.png",
        video_clip_name: "43thru102",
        path_to_generated_video: "",
      },
    142_202: {
        index_of_start_frame: 142,
        path_to_start_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0142.png",
        index_of_final_frame: 202,
        path_to_final_frame: "C:\\Users\\ortha\\AppData\\Roaming\\taurkovsky\\MVI_5830\\frames\\frame_0202.png",
        video_clip_name: "142thru202",
        path_to_generated_video: "",
      },
  };
  const sampleUpdates = {
    '43thru102': {
      label_of_item: "43thru102",
      status_of_item: "processing",
      progress_percent: 50,
      alert_message: "",
      error: ""
    },
    '142thru202': {
      label_of_item: "142thru202",
      status_of_item: "processing",
      progress_percent: 50,
      alert_message: "",
      error: ""
    },
    '142thru202_43thru102': {
      label_of_item: "142thru202_43thru102",
      status_of_item: "processing",
      progress_percent: 50,
      alert_message: "",
    },
    '43thru102_142thru202': {
      label_of_item: "43thru102_142thru202",
      status_of_item: "processing",
      progress_percent: 50,
      alert_message: "",
    },
  };
  const sampleBridge = {
    '142thru202_43thru102': {
      origin_clip: sampleClips[43_102],
      destination_clip: sampleClips[142_202],
      path_to_generated_frames: "",
      path_to_generated_video: ""
    },
    '43thru102_142thru202': {
      origin_clip: sampleClips[142_202],
      destination_clip: sampleClips[43_102],
      path_to_generated_frames: "",
      path_to_generated_video: ""
    },
  };
  setTimeout(() => {
    onAddClip({ payload: sampleClips[43_102] });
  }, 100);
  // simulate clicking two more frames to create another clip
  // while we notify that the first clip started processing
  setTimeout(() => {
    onStatusUpdate({ payload: sampleUpdates['43thru102'] });
  }, 150);
  setTimeout(() => {
    onAddClip({ payload: sampleClips[142_202] });
    // creating a second clip also creates bridges between that clip and all other clips:
    onAddBridge({ payload: sampleBridge['142thru202_43thru102'] });
    onAddBridge({ payload: sampleBridge['43thru102_142thru202'] });
    sampleUpdates['43thru102'].status_of_item = 'ready';
    onStatusUpdate({ payload: sampleUpdates['43thru102'] });
    sampleUpdates['142thru202'].status_of_item = 'processing';
    onStatusUpdate({ payload: sampleUpdates['142thru202'] });
  }, 350);
  setTimeout(() => {
    sampleUpdates['142thru202'].status_of_item = 'ready';
    onStatusUpdate({ payload: sampleUpdates['142thru202'] });
    onStatusUpdate({ payload: sampleUpdates['142thru202_43thru102'] });
  }, 400);
  setTimeout(() => {
    sampleUpdates['142thru202_43thru102'].status_of_item = 'ready';
    onStatusUpdate({ payload: sampleUpdates['142thru202_43thru102'] });
    sampleUpdates['43thru102_142thru202'].status_of_item = 'processing'
    onStatusUpdate({ payload: sampleUpdates['43thru102_142thru202'] });
  }, 450);
  setTimeout(() => {
    sampleUpdates['43thru102_142thru202'].status_of_item = 'ready';
    onStatusUpdate({ payload: sampleUpdates['43thru102_142thru202'] });
  }, 500);
  setTimeout(() => {
    playIdle();
  }, 550);
};

// simulate();