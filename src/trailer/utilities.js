
// Method to determine the source path for videos
function getVideoSrc(videoPath) {
  if (window.__TAURI__) {
    // Running in Tauri (production), use a custom protocol or Tauri API
    // return `stream:/${videoPath}`;
    return videoPath[0] === '/' ? `https://stream.localhost${videoPath}` : `https://stream.localhost/${videoPath}`;
  } else {
    // Running in development, use local server URL
    return videoPath;
  }
}

// New method to extract all .webm paths from the playgraph
function extractWebmPaths(playgraph) {
  let webmPaths = [];
  // Assuming playgraph structure has nodes and each node has edges
  if (playgraph && playgraph.nodes) {
    playgraph.nodes.forEach(node => {
      // Assuming each edge of a node contains a video path
      node.edges.forEach(edge => {
        // Construct the video path and check if it's a .webm file
        const videoPath = getVideoSrc(`/main/${edge.id}`);
        if (videoPath.endsWith('.webm')) {
          webmPaths.push(videoPath);
        }
      });
    });
  }
  return webmPaths;
}

export { getVideoSrc, extractWebmPaths };