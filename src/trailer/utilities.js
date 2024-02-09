
// Method to determine the source path for videos
function getVideoSrc(videoPath) {
  if (window.__TAURI__) {
    // Running in Tauri (production), use a custom protocol or Tauri API
    // return `stream:/${videoPath}`;
    return videoPath[0] === '/' ? `https://stream.localhost${videoPath}` : `https://stream.localhost/${videoPath}`;
  } 
  if (videoPath.startsWith('http')) {
    return videoPath;
  }
  // Running in development, use local server URL
  console.log('videoPath', videoPath);
  // return `http://127.0.0.1:1420/trailer/${videoPath}`;
  return `http://127.0.0.1:1420/trailer/${videoPath}`;
}

function extractWebmPathsFromObject(playgraph) {
  // get all values that are strings and end with .webm
  // will append a '/' to the beginning of the path if it's missing
  const string = JSON.stringify(playgraph);
  // use regex to get .webm files from the json string
  // const regex = /"game1\/clips\/see-\d+_to_\d+-graph\.mov\.webm"/g;
  const regex = new RegExp(`([^"]*\.webm)`, 'g');
  const webmPaths = string.match(regex);
  return webmPaths;
  // return Object.values(playgraph).reduce((acc, val) => {
  //   if (typeof val === 'string' && val.endsWith('.webm')) {
  //     acc.push(val);
  //     return acc;
  //   }
  //   acc.push(...extractWebmPathsFromObject(val));
  //   return acc;
  // }, []);
}

// New method to extract all .webm paths from the playgraph
function extractWebmPathsPlaygraphForm(playgraph) {
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


export { getVideoSrc, extractWebmPathsFromObject, extractWebmPathsPlaygraphForm }; 