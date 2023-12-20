
/*
    manages continuity and switching solely for the HTML5 video elements:
    - no rendering or graphics logic exists in this class 
    - it just provides the current frame via 'getCurrentFrame'
    - all state management should be contained inside the getNextVideoStrategy function, getNextVideoStrategy is a black box that 
        just returns the path of the next video to play

    - you can optionally provide a 'label' to identify which VideoPlayer is playing
*/

class VideoPlayer {
    constructor(videoPaths, getNextVideoStrategy, label = false) {
        this.label = label || videoPaths[0];
        this.currentVideo = null;
        this.nextVideo = null;
        this.getNextVideoStrategy = getNextVideoStrategy;
        this.isIdleVideo = false;
        this.playingDoubleBuffered = false;

        // create video elements from list of paths
        this.videoElements = {};
        videoPaths.forEach(path => {
            this.createVideoElement(path);
            // If the video is an idle video, create a second element for double buffering
            // if you just keep looping a video, it will have a gap when it loops, this creates 
            // the illusion of a continuous loop by double buffering the video
            if (path.includes('_idle')) {
                this.createVideoElement(path, true);
            }
        });
    }

    createVideoElement(path, isDoubleBuffered = false) {
        const videoElement = document.createElement('video');
        videoElement.preload = 'auto';
        videoElement.src = path;
        window.debug && this.label === 'cursorMask' && console.log(`VideoPlayer ${this.label}: loading ${path}${isDoubleBuffered ? ' (double-buffered)' : ''}`);
        videoElement.load();
        videoElement.style.pointerEvents = "none";
        videoElement.crossOrigin = 'anonymous';

        // Error event listener to detect if the video source is not found
        videoElement.addEventListener('error', (e) => {
            alert(`VideoPlayer: Error loading video at ${path}`);
        });

        videoElement.onended = this.switchVideo.bind(this);
        // Store double-buffered videos under a different key
        const videoKey = isDoubleBuffered ? path.replace('.webm', '_double_buffered.webm') : path;
        this.videoElements[videoKey] = videoElement;
    }

    // Start playing the video, should only need to call it once
    start(path = false) {
        if (path) {
            this.currentVideo = this.videoElements[path];
        } else {
            this.currentVideo = this.videoElements[Object.keys(this.videoElements)[0]];
        }
        if (!this.currentVideo) {o
            alert('VideoPlayer: no video element found for ' + path);
        }
        this.assignNextVideo(this.getNextVideoStrategy(this.currentVideo));
        window.debug && console.log(`VideoPlayer ${this.label}: starting ${path}`);
        return this.currentVideo.play();
    }

    // Get the video element for a given path
    lookupVideo(path, isDoubleBuffered = false) {
        window.debug && this.label === 'cursorMask' && console.log(`VideoPlayer ${this.label}: looking up ${path} ${isDoubleBuffered ? '(double buffered)' : ''} is playing`);
        path = path.startsWith('/') ? path : `/${path}`
        if (isDoubleBuffered) {
            // console.log('looking up double-buffered video', `${path.replace('.webm', '_double_buffered.webm')}`);
            return this.videoElements[`${path.replace('.webm', '_double_buffered.webm')}`];
        }
        return this.videoElements[path] || alert('VideoPlayer: no video element found for ' + path);
    }

    // sets up this.nextVideo for when this.currentVideo ends
    // takes into account double-buffering for idle videos
    assignNextVideo(nextVideoPath) {
        const isIdleVideo = nextVideoPath.includes('_idle');
        this.playingDoubleBuffered = isIdleVideo && !this.playingDoubleBuffered;
        this.nextVideo = this.lookupVideo(nextVideoPath, this.playingDoubleBuffered);
    }

    async switchVideo() {
        this.currentVideo = this.nextVideo;
        // this.currentVideo.onended = this.switchVideo.bind(this);
        await this.currentVideo.play();
        const nextVideoPath = this.getNextVideoStrategy(this.currentVideo);
        this.assignNextVideo(nextVideoPath);
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
