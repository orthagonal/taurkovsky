/*
  HELPER FUNCTIONS FOR DISPLAYING CLIP AND BRIDGE STATUSES
*/
export const getClipName = (clip) => clip.video_clip_name;   // should be same as `${clip.index_of_start_frame}thru${clip.index_of_final_frame}`;
export const getBridgeName = (bridge) => `${bridge.origin_clip.video_clip_name}_${bridge.destination_clip.video_clip_name}`;
export const StatusColorMap = {
  "added": "gray",
  "processing": "blue",
  "ready": "green",
  "error": "red",
  "playing": "yellow",
}
export const TailwindColors = {
  "added": "bg-gray-500",
  "processing": "bg-blue-500",
  "ready": "bg-green-500",
  "error": "bg-red-500",
}
export const mapStatusToColor = (status) => StatusColorMap[status] || "gray";
export const mapStatusToTailwindColor = (status) => TailwindColors[status] || "bg-gray-500";
  



// tauri imports
import { appWindow } from '@tauri-apps/api/window'
import { open } from '@tauri-apps/api/dialog';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { copyFile, createDir, readDir } from '@tauri-apps/api/fs';
import { appDir, basename, join, extname } from '@tauri-apps/api/path';

// all this provided by Interop.js which mocks all these funcs in dev mode
export const prodTauri = {
  open,
  join,
  readDir,
  createDir,
  basename,
  extname,
  appWindow,
  invoke,
  copyFile,
  convertFileSrc,
  appDir
};
