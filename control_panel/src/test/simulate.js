
/* simulates a bunch of events coming from tauri
schema:
components: [
  {
    onPlayStarted: (event) => { .... do some stuff ... },
    onClipAdded: (event) => { .... do some stuff ... },
  }
]    
*/

import { sampleBridge, sampleClips, sampleFrames, sampleUpdates } from "./testData";

export const simulate = async (components) => {
  // to simulate firing an event on all components, just call this
  const callHandlers = async (eventName, event) => {
    for (const component of components) {
      if (component[eventName]) {
        component[eventName](event);
      }
    }
  };
  let playing = 0;
  let prev = 0;
  let vids = ['43thru102', '43thru102to142thru202', '142thru202', '142thru202to43thru102'];
  // simulate the current playing clip being updated
  // in the real app this will originate from the Preview window
  const updatePlaying = () => {
    prev = playing;
    playing = (playing + 1) % vids.length;
    callHandlers('onPlayStarted', {
      payload: {
        started: vids[playing],
        started_type: playing == 0 || playing % 2 == 0 ? 'clip' : 'bridge',
        finished: vids[prev],
        finished_type: prev == 0 || prev % 2 == 0 ? 'clip' : 'bridge',
      }
    });
  }

  const payload = {
    clips: [
      sampleClips[43_102],
      sampleClips[142_202],
    ],
    bridges: [
    ]
  };
    // simulate clicking two frames to create a clip:
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[43] });
    }, 1000);
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[102] });
      callHandlers('onAddClip', { payload: sampleClips[43_102] });
    }, 2000);
    // simulate clicking two more frames to create another clip
    // while we notify that the first clip started processing
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[142] });
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102'] });
    }, 3000);
    setTimeout(() => {
      callHandlers('onAddFrame', { payload: sampleFrames[202] });
      callHandlers('onAddClip', { payload: sampleClips[142_202] });
      // creating a second clip also creates bridges between that clip and all other clips:
      callHandlers('onAddBridge', { payload: sampleBridge['142thru202to43thru102'] });
      callHandlers('onAddBridge', { payload: sampleBridge['43thru102to142thru202'] });
      sampleUpdates['43thru102'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102'] });
      sampleUpdates['142thru202'].status_of_item = 'processing';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202'] });
    }, 3500);
    setTimeout(() => {
      sampleUpdates['142thru202'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202'] });
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202to43thru102'] });
    }, 4000);
    setTimeout(() => {
      sampleUpdates['142thru202to43thru102'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['142thru202to43thru102'] });
      sampleUpdates['43thru102to142thru202'].status_of_item = 'processing'
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102to142thru202'] });
    }, 4500);
    setTimeout(() => {
      sampleUpdates['43thru102to142thru202'].status_of_item = 'ready';
      callHandlers('onStatusUpdate', { payload: sampleUpdates['43thru102to142thru202'] });
      setInterval(() => {
        updatePlaying();
      }, 5000);
    }, 5000);
  };