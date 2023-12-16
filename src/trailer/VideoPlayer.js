
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

/*
    manages continuity and switching solely forthe HTML5 video elements:
    - no rendering or graphics logic exists in this class 
    - it just provides the current frame via 'getCurrentFrame'
    - all state management should be contained in the getNextVideoStrategy function
    - getNextVideoStrategy should return the path of the next video to play
    - just wrap your getNextVideoStrategy to make '_hitbox' or '_mask' etc versions of the corresponding video
    - any buffering of videos to force sequentiality should be done in getNextVideoStrategy
*/

class VideoPlayer {
    constructor(playgraph, getNextVideoStrategy) {
        this.currentVideo = null;
        this.nextVideo = null;
        this.getNextVideoStrategy = getNextVideoStrategy;

        // Extract .webm paths and create video elements
        const webmPaths = extractWebmPaths(playgraph);
        this.videoElements = {};
        webmPaths.forEach(path => {
            const videoElement = document.createElement('video');
            videoElement.preload = 'auto';
            videoElement.src = path;
            videoElement.load();
            videoElement.style.pointerEvents = "none";
            videoElement.crossOrigin = 'anonymous';
            this.videoElements[path] = videoElement;
        });
    }

    // Start playing the video
    start(path = false) {
        if (path) {
            this.currentVideo = this.videoElements[path];
        } else {
            this.currentVideo = this.videoElements[Object.keys(this.videoElements)[0]];
        }
        this.nextVideo = this.videoElements[this.getNextVideoStrategy(this.currentVideo)];
        this.currentVideo.onended = this.switchVideo.bind(this);
        return this.currentVideo.play();
    }

    // Switch to the next video
    async switchVideo() {
        this.currentVideo = this.nextVideo;
        this.currentVideo.onended = this.switchVideo.bind(this);
        await this.currentVideo.play();
        this.nextVideo = this.videoElements[this.getNextVideoStrategy(this.currentVideo)];
        this.nextVideo.currentTime = 0;
    }

    // Get the current frame for rendering
    getCurrentFrame(device) {
        if (this.currentVideo?.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            return device.importExternalTexture({ source: this.currentVideo });
        }
        return false;
    }
}

export default VideoPlayer;
