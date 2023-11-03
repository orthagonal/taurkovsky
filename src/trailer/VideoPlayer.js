import { resolveResource } from '@tauri-apps/api/path'
// alternatively, use `window.__TAURI__.path.resolveResource`

// // `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
// const resourcePath = await resolveResource('lang/de.json')
// const langDe = JSON.parse(await readTextFile(resourcePath))

// console.log(langDe.hello) // This will print 'Guten Tag!' to the devtools console
class VideoPlayer {
    constructor(playgraph, getNextVideoStrategy, initialNode=false, autoStart=true) {
        this.playgraph = playgraph;
        this.getNextVideoStrategy = getNextVideoStrategy.bind(this);
        this.blocked = false; // Initially, the player is not blocked
        this.videoA = this.createVideoElement();
        this.videoB = this.createVideoElement();
        this.maskVideoA = this.createVideoElement(); // for mask video
        this.maskVideoB = this.createVideoElement(); // for mask video
        this.videoA.onended = () => this.switchVideos(this.videoA, this.videoB, this.maskVideoA, this.maskVideoB);
        this.videoB.onended = () => this.switchVideos(this.videoB, this.videoA, this.maskVideoB, this.maskVideoA);
        this.videoQueue = []; // Initializing the video queue
        this.currentHitboxList = false;
        const startNode = initialNode ? initialNode : playgraph.nodes[playgraph.nodes.length - 1];
        const initialVideoSrc = this.getVideoSrc(`/main/${startNode.edges[0].id}`);
        this.videoA.src = initialVideoSrc;

        // i use this for the cursor since it doesn't start immediately anyway:
        // if (autoStart) {
        //     this.currentNodeIndex = playgraph.nodes.indexOf(startNode);
        //     this.videoA.src = `/main/${startNode.edges[0].id}`; // Assuming the main sub-folder contains the video files
        // } else {
        //     this.currentNodeIndex = playgraph.nodes.indexOf(startNode);
        //     this.videoA.src = `/main/${startNode.name}`;
        // }
    }

    // Method to determine the source path for videos
    getVideoSrc(videoPath) {
        if (window.__TAURI__) {
            // Running in Tauri (production), use a custom protocol or Tauri API
            // return `stream:/${videoPath}`;
            return videoPath[0] === '/' ? `https://stream.localhost${videoPath}` : `https://stream.localhost/${videoPath}`; 
        } else {
            // Running in development, use local server URL
            return videoPath;
        }
    }

        
    enqueueVideo(videoPath) {
        this.videoQueue.push(videoPath);
    }

    dequeueAndPlayNextVideo() {
        // If the queue is empty, determine the next video using the strategy and enqueue it
        if (this.videoQueue.length === 0) {
            const currentVideo = this.videoA.paused ? this.videoB : this.videoA;
            this.enqueueVideo(this.getNextVideoStrategy(currentVideo));
        }
        return this.videoQueue.shift();
    }
    
    createVideoElement() {
        const videoElem = document.createElement('video');
        videoElem.style.pointerEvents = "none";
        videoElem.preload = 'auto';
        videoElem.crossOrigin = 'anonymous';
        return videoElem;
    }

    isPlaying() {
        return !this.videoA.paused || !this.videoB.paused;
    }
    
    switchVideos(currentVideo, nextVideo, currentMaskVideo, nextMaskVideo) {
        if (this.blocked) return;
    
        this.enqueueVideo(this.getNextVideoStrategy(currentVideo, this.playgraph, window.userString));
        // let nextVideoPath = this.dequeueAndPlayNextVideo();
        // Use the getVideoSrc method to determine the correct path
        let nextVideoPath = this.getVideoSrc(this.dequeueAndPlayNextVideo());

        // Determine if a mask is needed
        const currentNode = this.playgraph.nodes[this.currentNodeIndex];
        const hasMask = currentNode && currentNode.mask;
        if (hasMask) {
            this.currentHitboxList = currentNode.mask;
            // let maskVideoPath = nextVideoPath.replace('.webm', '_mask.webm');
            let maskVideoPath = this.getVideoSrc(nextVideoPath.replace('.webm', '_mask.webm'));
            nextMaskVideo.src = maskVideoPath;
            nextMaskVideo.loop = true;
            nextMaskVideo.oncanplay = () => {
                nextMaskVideo.play();
                const subsequentVideo = (nextVideo === this.videoA) ? this.videoB : this.videoA;
                subsequentVideo.src = currentVideo.src.includes("_mask") ? currentVideo.src : currentVideo.src.replace(".webm", "_mask.webm");
                nextMaskVideo.oncanplay = null;  
            };
        } else {
            this.currentHitboxList = false;
        }
    
        nextVideo.src = nextVideoPath;  // Add random query string
        nextMaskVideo.preload = 'auto'; 
        nextVideo.oncanplay = () => {
            nextVideo.play();
            if (hasMask) {
                currentMaskVideo.currentTime = 0; // Reset mask video to the start
                currentMaskVideo.play(); // Play mask video explicitly when main video starts playing
            }
            // Determine the subsequent video and preload it
            const subsequentVideo = (nextVideo === this.videoA) ? this.videoB : this.videoA;
            subsequentVideo.src = currentVideo.src;  // Add random query string
            // Remove the oncanplaythrough event handler
            nextVideo.oncanplay = null;
        };
    
        // Reset userInput to 'idle' after selecting an edge
        // TODO THIS NEEDS TO BE made abstract
        // window.userInput = 'idle';
        // window.cursorState = 'idle';
    }
}

export default VideoPlayer;