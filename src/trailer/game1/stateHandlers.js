function getNextPlaygraphNode(playgraph, letter, sink = false) {
  var layers = playgraph[letter];
  if (!layers || layers.graph.length === 0) {
    return null;
  }
  if (sink && Object.keys(layers.sink).length > 0) {
    console.log('trying to sink', letter);
    // Prefer a sink layer if available
    var sinkKeys = Object.keys(layers.sink);
    console.log(sinkKeys);
    var sinkKey = sinkKeys[Math.floor(Math.random() * sinkKeys.length)];
    console.log('sinkKey', sinkKey);
    console.log(layers.sink);
    console.log('returninig ', layers.sink[sinkKey]);
    return layers.sink[sinkKey];
  }
  console.log('returning random layer');
  return layers.graph[Math.floor(Math.random() * layers.graph.length)];
}

function getNextPlaygraphNodeNoReversals(playgraph, prevLetter, letter, sink = false) {
  var layers = playgraph[letter];
  if (!layers || layers.graph.length === 0) {
    return null;
  }
  if (sink && Object.keys(layers.sink).length > 0) {
    // Prefer a sink layer if available
    var sinkKeys = Object.keys(layers.sink);
    console.log(sinkKeys);
    var sinkKey = sinkKeys[Math.floor(Math.random() * sinkKeys.length)];
    console.log('sinkKey', sinkKey);
    console.log(layers.sink);
    console.log('returninig ', layers.sink[sinkKey]);
    return layers.sink[sinkKey];
  }
  const graph = layers.graph.filter((layer) => {
    return !layer.includes(`to_${prevLetter}`);
  });
  return graph[Math.floor(Math.random() * graph.length)];
}

function mainVideoSwitcher(currentVideo, moduleState, playgraph) {
  // first time it's called, we start the video and display the canvases
  if (!moduleState.playgraphStarted) {
    moduleState.playgraphStarted = true;
    const overlayCanvas = document.getElementById("overlayCanvas");
    const webgpuCanvas = document.getElementById("webgpuCanvas");
    overlayCanvas.style.display = "block";
    webgpuCanvas.style.display = "block";
    moduleState.scene = 'see_intro';
    return 'main/blank.webm';
  }
  if (moduleState.scene === 'see_intro') {
    return see_intro(currentVideo, moduleState, playgraph.intro.alternateEyePlaygraph);
  }
  // return nextVideoLantern(currentVideo);
}

function distortAnchors(distortionAmount, moduleState) {
  // const indices = [
  //   [16, 17],
  //   [20, 21],
  //   [24, 25],
  //   [28, 29],
  // ];
  // for (let i = 0; i < indices.length; i++) {
  //   moduleState.distortionAnchors.currentAnchors[indices[i][0]] = distortionAmount;
  //   moduleState.distortionAnchors.currentAnchors[indices[i][1]] = distortionAmount;
  // }
}

function see_intro(currentVideo, moduleState, playgraph) {
  // return a random vidoe from playgraph.s or just keep laying blank::
  if (moduleState.playgraphState === 'blank') {
    const currentUserInput = moduleState.mainUserInputQueue.shift() || '';
    if (currentUserInput === 's') {
      if (moduleState.playgraphState === 'blank') {
        // moduleState.playgraphState = 'to_s';
        moduleState.playgraphState = 's';
        return playgraph.s.blank.sink.sink;
      }
    }
    return 'main/blank.webm';
  }
  // if (moduleState.playgraphState === 'to_s') {
  //   moduleState.playgraphState = 's'; 
  //   return playgraph.s['344'].graph[0];
  //   // return playgraph.s['355'].graph[0];
  // }
  // return a sink video if they type 'se' or just keep playing the same video
  if (moduleState.playgraphState === 's') {
    const currentUserInput = moduleState.mainUserInputQueue.shift() || '';
    if (currentUserInput === 'se') {
      const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
      distortAnchors(0.0621, moduleState);
      const destination = getNextPlaygraphNode(playgraph.s, lastLetter, true);
      if (destination.includes('sink')) {
        moduleState.playgraphState = 'se';
        return destination;
      }
      // put it back so we can process again and try to get to a 'sink' video
      moduleState.mainUserInputQueue.push(currentUserInput);
      return destination;
    }
    const lastLetter = currentVideo.key.includes('sink') ? "6" : currentVideo.key.split('_to_')[1].split('-')[0];
    const destination = getNextPlaygraphNode(playgraph.s, lastLetter);
    return destination;
  }
  if (moduleState.playgraphState === 'se') {
    const currentUserInput = moduleState.mainUserInputQueue.shift() || '';
    if (currentUserInput === 'see') {
      distortAnchors(0.0621, moduleState);
      const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
      // distortAnchors(0.0621, mainBehavior.defaultAnchors, maxAnchors, minAnchors);
      const destination = getNextPlaygraphNode(playgraph.se, lastLetter, true);
      if (destination.includes('sink')) {
        moduleState.playgraphState = 'see';
        return destination;
      }
      // put it back so we can process again and try to get to a 'sink' video
      moduleState.mainUserInputQueue.push(currentUserInput);
      return destination;
    }
    const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
    const prevLetter = currentVideo.key.split('_to_')[0].replace('see-', '');
    console.log('prevLetter', prevLetter, 'lastLetter', lastLetter);
    const destination = getNextPlaygraphNodeNoReversals(playgraph.se, prevLetter, lastLetter);
    return destination;
  }
  if (moduleState.playgraphState === 'see') {
    // const currentUserInput = moduleState.mainUserInputQueue.shift() || '';
    const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
    moduleState.resetAnchors = true;
    const destination = getNextPlaygraphNode(playgraph.see, lastLetter);
    return destination;
  }
  if (moduleState.playgraphState === 'see_to_lamp') {
    const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
    // distortAnchors(0.0621, mainBehavior.defaultAnchors, maxAnchors, minAnchors);
    const destination = getNextPlaygraphNode(playgraph.see, lastLetter, true);
    if (destination.includes('sink')) {
      moduleState.playgraphState = 'lamp_intro';
    }
    return destination;
  }
  if (moduleState.playgraphState === 'lamp_intro') {
    moduleState.playgraphState = 'lamp_sequence';
    return playgraph.lamp_intro;
  }
  if (moduleState.playgraphState === 'lamp_sequence') {
    // this should start at lamp-487
    const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
    const destination = getNextPlaygraphNode(playgraph.lamp, lastLetter);
    return destination;
  }
}

function nextVideoLantern(currentVideo) {
  const lastLetter = currentVideo.key.split('_to_')[1].split('-')[0];
  const destination = getNextPlaygraphNode(playgraph.see, lastLetter);
  return destination;
}

export { mainVideoSwitcher };