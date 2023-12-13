import { resolveResource } from '@tauri-apps/api/path'
// alternatively, use `window.__TAURI__.path.resolveResource`

// // `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
// const resourcePath = await resolveResource('lang/de.json')
// const langDe = JSON.parse(await readTextFile(resourcePath))

// console.log(langDe.hello) // This will print 'Guten Tag!' to the devtools console
class VideoPlayer {
    constructor(webgpu, playgraph, getNextVideoStrategy, initialNode = false, autoStart = true) {
        this.playgraph = playgraph;
        this.getNextVideoStrategy = getNextVideoStrategy.bind(this);
        this.blocked = false; // Initially, the player is not blocked
        this.videoA = this.createVideoElement();
        this.videoA.label = 'videoA';
        this.videoB = this.createVideoElement();
        this.videoB.label = 'videoB';
        this.maskVideoA = this.createVideoElement(); // for mask video
        this.maskVideoB = this.createVideoElement(); // for mask video
        this.hitboxVideoA = this.createVideoElement();
        this.hitboxVideoB = this.createVideoElement();
        // update the main loop to support detecting the currently-active video
        this.activeVideos = {
            'main': this.videoA,
            'mask': this.maskVideoA,
            'hitbox': this.hitboxVideoA
        }
        // TODO: stop this for now and just focus on playing videoA to the screen
        this.videoA.onended = () => this.switchVideos(this.videoA, this.videoB, this.maskVideoA, this.maskVideoB, this.hitboxVideoA, this.hitboxVideoB);
        this.videoB.onended = () => this.switchVideos(this.videoB, this.videoA, this.maskVideoB, this.maskVideoA, this.hitboxVideoB, this.hitboxVideoA);
        this.videoQueue = []; // Initializing the video queue
        this.currentHitboxList = false;
        const startNode = initialNode ? initialNode : playgraph.nodes[playgraph.nodes.length - 1];
        const initialVideoSrc = this.getVideoSrc(`/main/${startNode.edges[0].id}`);
        this.videoA.src = initialVideoSrc;

        this.device = webgpu.device;
        this.bindGroupLayout = webgpu.bindGroupLayout;
        this.vertexGroupLayout = webgpu.vertexBGL;
        this.vertexBindGroup = webgpu.vertexBindGroup;
        this.sampler = webgpu.sampler;
        this.constants = webgpu.constants;
        this.createPipeline(webgpu.vertexShader, webgpu.fragmentShader);
        this.lastActiveVideo = null;
        this.isFrameReady = false;
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

    // wait does this work?????
    interruptVideo(videoPath) {
        const currentVideo = this.isPlaying() ? (this.videoA.paused ? this.videoB : this.videoA) : null;
        const nextVideo = currentVideo === this.videoA ? this.videoB : this.videoA;
        const currentMaskVideo = currentVideo === this.videoA ? this.maskVideoA : this.maskVideoB;
        const nextMaskVideo = currentVideo === this.videoA ? this.maskVideoB : this.maskVideoA;

        // Cancel any pending play actions
        currentVideo.oncanplay = null;
        nextVideo.oncanplay = null;
        currentMaskVideo.oncanplay = null;
        nextMaskVideo.oncanplay = null;

        // Empty the video queue to ensure the interrupted video is played next
        this.videoQueue = [];

        // Enqueue and play the interrupting video
        this.enqueueVideo(this.getVideoSrc(videoPath));
        const interruptVideoPath = this.dequeueAndPlayNextVideo();

        // Play the interrupting video
        nextVideo.src = interruptVideoPath;
        nextVideo.preload = 'auto';
        nextVideo.oncanplay = () => {
            nextVideo.play();
            nextVideo.oncanplay = null;
        };

        // Handle mask video if needed
        const hasMask = this.playgraph.nodes.find(node => node.name === videoPath) && this.playgraph.nodes.find(node => node.name === videoPath).mask;
        if (hasMask) {
            let maskVideoPath = this.getVideoSrc(interruptVideoPath.replace('.webm', '_mask.webm'));
            nextMaskVideo.src = maskVideoPath;
            nextMaskVideo.loop = true;
            nextMaskVideo.oncanplay = () => {
                nextMaskVideo.play();
                nextMaskVideo.oncanplay = null;
            };
        } else {
            this.currentHitboxList = false;
        }

        // handle hitbox video if needed
        const hasHitbox = this.playgraph.nodes.find(node => node.name === videoPath) && this.playgraph.nodes.find(node => node.name === videoPath).hitbox;
        if (hasHitbox) {
            // Handle hitbox video logic
            let hitboxVideoPath = this.getVideoSrc(interruptVideoPath.replace('.webm', '_hitbox.webm'));
            this.hitboxVideoA.src = hitboxVideoPath;
            this.hitboxVideoA.loop = true;
            this.hitboxVideoA.oncanplay = () => {
                this.hitboxVideoA.play();
                this.hitboxVideoA.oncanplay = null;
            };
        } else {
            // No hitbox for the current node
        }
    }

    switchVideos(currentVideo, nextVideo, currentMaskVideo, nextMaskVideo, currentHitboxVideo, nextHitboxVideo) {
        if (this.blocked) return;

        this.enqueueVideo(this.getNextVideoStrategy(currentVideo, this.playgraph, window.userString));
        // let nextVideoPath = this.dequeueAndPlayNextVideo();
        // Use the getVideoSrc method to determine the correct path
        let nextVideoPath = this.getVideoSrc(this.dequeueAndPlayNextVideo());
        nextVideo.src = nextVideoPath;
        nextVideo.load();
        // Determine if a mask is needed
        const currentNode = this.playgraph.nodes[this.currentNodeIndex];
        const hasMask = currentNode && currentNode.mask;
        if (hasMask) {
            let maskVideoPath = this.getVideoSrc(nextVideoPath.replace('.webm', '_mask.webm'));
            nextMaskVideo.src = maskVideoPath;
            nextMaskVideo.loop = true;
            nextMaskVideo.oncanplay = () => {
                nextMaskVideo.preload = 'auto';
                nextMaskVideo.play();
                this.activeVideos.mask = nextMaskVideo;
                const subsequentVideo = (nextVideo === this.videoA) ? this.videoB : this.videoA;
                subsequentVideo.src = currentVideo.src.includes("_mask") ? currentVideo.src : currentVideo.src.replace(".webm", "_mask.webm");
                nextMaskVideo.oncanplay = null;
            };
        }

        const hasHitbox = currentNode && currentNode.hitbox;
        if (hasHitbox) {
            this.currentHitboxList = currentNode.hitbox;
            // Handle hitbox video logic
            let hitboxVideoPath = this.getVideoSrc(nextVideoPath.replace('.webm', '_hitbox.webm'));
            nextHitboxVideo.src = hitboxVideoPath;
            nextHitboxVideo.loop = true;
            nextHitboxVideo.oncanplay = () => {
                nextHitboxVideo.preload = 'auto';
                nextHitboxVideo.play();
                this.activeVideos.hitbox = nextHitboxVideo;
                const subsequentVideo = (nextVideo === this.videoA) ? this.videoB : this.videoA;
                subsequentVideo.src = currentVideo.src.includes("_hitbox") ? currentVideo.src : currentVideo.src.replace(".webm", "_hitbox.webm");
                nextHitboxVideo.oncanplay = null;
            };
        } else {
            this.currentHitboxList = false;
        }

        const self = this;
        nextVideo.oncanplay = () => {
            self.activeVideos.main = nextVideo;
            nextVideo.play();
            if (hasMask) {
                currentMaskVideo.currentTime = 0; // Reset mask video to the start
                currentMaskVideo.play(); // Play mask video explicitly when main video starts playing
            }
            if (hasHitbox) {
                currentHitboxVideo.currentTime = 0; // Reset hitbox video to the start
                currentHitboxVideo.play(); // Play hitbox video explicitly when main video starts playing
            }
            // Determine the subsequent video and preload it
            const subsequentVideo = (nextVideo === self.videoA) ? this.videoB : this.videoA;
            subsequentVideo.src = currentVideo.src;  // Add random query string
            // Remove the oncanplaythrough event handler
            nextVideo.oncanplay = null;
        };
    }

    createPipeline(vertexShader, fragmentShader) {
        console.log('createPipeline');
        // Create shader modules
        const vertexModule = this.device.createShaderModule({ code: vertexShader });
        const fragmentModule = this.device.createShaderModule({ code: fragmentShader });

        // Create pipeline
        this.pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout, this.vertexGroupLayout] }),
            vertex: { module: vertexModule, entryPoint: "main" },
            fragment: {
                module: fragmentModule, entryPoint: "main", targets: [{
                    format: 'rgba8unorm',
                    blend: {
                        alpha: {
                            operation: 'add',
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha'
                        },
                        color: {
                            operation: 'add',
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha'
                        }
                    }
                }]
            },
            primitive: { topology: "triangle-strip", cullMode: "none" },
        });
    }

    renderFrame(renderPassEncoder) {
        const activeVideo = this.activeVideos.main;
        console.log(activeVideo.label);
        if (activeVideo.readyState >= 4) {
            activeVideo.externalTexture = this.device.importExternalTexture({
                usage: 'texture-binding',
                source: activeVideo
            });
            activeVideo.bindGroup = this.device.createBindGroup({
                layout: this.bindGroupLayout,
                entries: [
                    { binding: 0, resource: this.sampler },
                    { binding: 1, resource: activeVideo.externalTexture },
                    { binding: 2, resource: { buffer: this.constants } },
                ],
            });
        }
        // Check if the video is ready
        if (activeVideo.externalTexture) {
            // Use the updated bind group based on the active video
            renderPassEncoder.setPipeline(this.pipeline);
            renderPassEncoder.setBindGroup(0, activeVideo.bindGroup);
            renderPassEncoder.setBindGroup(1, this.vertexBindGroup);
            renderPassEncoder.draw(4, 1, 0, 0);
        }
    }


}

export default VideoPlayer;