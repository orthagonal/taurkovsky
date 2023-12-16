
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


class VideoPlayer {
    constructor(webgpu, playgraph, getNextVideoStrategy, autoStart = true) {
        this.currentVideo = null;
        this.nextVideo = null;
        this.getNextVideoStrategy = getNextVideoStrategy;
        this.blocked = true;
        // load all videos
        const webmPaths = extractWebmPaths(playgraph);
        console.log(webmPaths);
        this.videoElements = {};
        for (let i = 0; i < webmPaths.length; i++) {
            const path = webmPaths[i];
            const videoElement = document.createElement('video');
            videoElement.preload = 'auto';
            videoElement.src = path;
            videoElement.load();
            videoElement.style.pointerEvents = "none";
            videoElement.crossOrigin = 'anonymous';
            // video.ontimeupdate = this.updateTime.bind(this);
            // // Store the video element in the videoElements object
            this.videoElements[path] = {
                videoElement,
            };
        }
        // Create pipeline
        const vertexModule = webgpu.device.createShaderModule({ code: webgpu.vertexShader });
        const fragmentModule = webgpu.device.createShaderModule({ code: webgpu.fragmentShader });
        this.pipeline = webgpu.device.createRenderPipeline({
            layout: webgpu.device.createPipelineLayout({ bindGroupLayouts: [webgpu.bindGroupLayout, webgpu.vertexBGL] }),
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

        this.webgpu = webgpu;
        this.activeBindGroup = null;
        this.blocked = false;
    }

    // returns a promise
    start(path = false) {
        if (path) {
            this.currentVideo = this.videoElements[path].videoElement;
        } else {
            this.currentVideo = this.videoElements[Object.keys(this.videoElements)[0]].videoElement;
        }
        this.nextVideo = this.videoElements[this.getNextVideoStrategy(this.currentVideo)].videoElement;
        this.currentVideo.onended = this.switchVideo.bind(this);
        return this.currentVideo.play();
    }

    async switchVideo() {
        this.currentVideo = this.nextVideo;
        this.currentVideo.onended = this.switchVideo.bind(this);
        // must await this promise:
        await this.currentVideo.play();
        this.nextVideo = this.videoElements[this.getNextVideoStrategy(this.currentVideo)].videoElement;
        // needed to avoid skipping the first frame of the video
        this.nextVideo.currentTime = 0;
    }

    renderFrame(renderPassEncoder) {
        if (this.currentVideo?.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            // Create a new external texture for the current frame
            const externalTexture = this.webgpu.device.importExternalTexture({
                source: this.currentVideo
            });
            // Create a new bind group for the current frame
            this.activeBindGroup = this.webgpu.device.createBindGroup({
                layout: this.webgpu.bindGroupLayout,
                entries: [
                    { binding: 0, resource: this.webgpu.sampler },
                    { binding: 1, resource: externalTexture },
                    { binding: 2, resource: { buffer: this.webgpu.constants } },
                ],
            });
            renderPassEncoder.setPipeline(this.pipeline);
            renderPassEncoder.setBindGroup(0, this.activeBindGroup);
            renderPassEncoder.setBindGroup(1, this.webgpu.vertexBindGroup);
            renderPassEncoder.draw(4, 1, 0, 0);
        }
    }
};
export default VideoPlayer;
