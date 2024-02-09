 import { getVideoSrc } from './utilities.js';
/*
    manages continuity and switching solely for the HTML5 video elements:
    - no rendering or graphics logic exists in this class 
    - it just provides the current frame via 'getCurrentFrame'
    - all state management should be contained inside the getNextVideo function, getNextVideo is a black box that 
        just returns the path of the next video to play

    - you can optionally provide a 'label' to identify which VideoPlayer is playing
*/

class VideoPlayer {
    constructor(videoPaths, getNextVideo, label = false) {
        this.label = label || videoPaths[0];
        this.currentVideo = null;
        this.nextVideo = null;
        this.getNextVideo = getNextVideo;
        this.randomQueryString = Math.random().toString(36).substring(7);
        // create video elements from list of paths
        this.videoElements = {};
        const loadIt = async() => await Promise.all(videoPaths.map(path => this.createVideoElement(path)));
        loadIt();
    }

    createVideoElement(path, isDoubleBuffered = false) {
        return new Promise((resolve, reject) => {         
            const videoElement = document.createElement('video');
            videoElement.preload = 'auto';
            // use the 'key' to look up the video element's original path
            // when we load the .src element it will get changed to a full URL
            videoElement.key = path.split('/').pop();
            const cacheBustingParam = '?v=' + Date.now();
            videoElement.src = getVideoSrc(path + cacheBustingParam);
            videoElement.load();
            videoElement.style.pointerEvents = "none";
            videoElement.crossOrigin = 'anonymous';
    
            // Error event listener to detect if the video source is not found
            videoElement.addEventListener('error', (e) => {
                console.log(`VideoPlayer: Error loading video at ${path}, ${videoElement.src}`);
                // alert(`VideoPlayer: Error loading video at ${path}`);
            });
            videoElement.onended = this.switchVideo.bind(this);
            this.videoElements[path] = videoElement;
            
            videoElement.addEventListener('loadeddata', () => {
              console.log('Video preloaded:', videoElement.src);
              resolve(); // Resolve the promise when loaded
            });
        
            videoElement.addEventListener('error', (error) => {
              reject(error); // Reject the promise if there's an error
            });
          }); 
    }

    // Start playing the video, should only need to call this once 
    // when first start playing this video player
    start(path) {
        if (path) {
            this.currentVideo = this.videoElements[path];
        } else {
            this.currentVideo = this.videoElements[Object.keys(this.videoElements)[0]];
        }
        if (!this.currentVideo) {
            alert('VideoPlayer: no video element found for ' + path);
        }
        this.nextVideo = this.lookupVideo(path);
        window.debug && console.log(`VideoPlayer ${this.label}: starting ${path}`);
        return this.currentVideo.play();
    }

    // Get the video element for a given path
    lookupVideo(path) {
        // path = path.startsWith('/') ? path : `/${path}`
        return this.videoElements[path] || alert('VideoPlayer: no video element found for ' + path);
    }

    async switchVideo() {
        this.currentVideo = this.nextVideo;
        // this.currentVideo.onended = this.switchVideo.bind(this);
        await this.currentVideo.play();
        this.nextVideo = this.lookupVideo(this.getNextVideo(this.currentVideo));
        // reset the nextVideo to the beginning so it's ready when it plays:
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
