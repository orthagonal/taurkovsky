# taurkovsky

## a tauri-based tool for building interactive movies and FMV games and other experiences

`taurkovsky` let's you build "playgraphs", a flowchart of interconnected
sequences of video that can be played back by a player in various combinations to produce a 
seamless interactive video.  Basically it makes it easy to make interactive
movies that play like a one-shot movie, that is one that has no editing breaks in it.


## How it works:

1. `You` select a source video and `taurkovsky` will break it into frames and display them to you:
2. `You` can mouse-drag a sequence of consecutive frames and `taurkovsky` will generate a _main_ video out of them.  That's pretty basic.
3. The fun part is that `you` can also select pairs of frames and `taurkovsky` will use AI-enhanced 'tween' generators[link here] to join those video sequences together. You can customize which command you use to generate the frames, but `taurkovsky` assumes you use this one[] which was made by really smart people who trained it to upscale videos that had lower frame rates.  I'm kind of hacking their work to generate 'tween' frames not for upscaling purposes but for  'understand' how objects move in space.   video sequence that seamlessly joins them together.
As it does so it also generates a 'playgraph' or JSON structure that describes 
which videos are compatible with each other. 

### config file format
```yaml
shell: "cmd"
generator: 
  - generator_path: ""
  - generator_cmd: ""
  - generator_args: 
    - abc
    - xyz
ffmpeg:
  - ffmpeg_path: ""
  - ffmpeg_args:
    - arg1
    - arg2
```

The generator should be a CLI utility that takes a beginning frame and an ending frame and produces a sequence of frames that bridge them.  I used RIFE[] and give instructions for how I set it up below, but you can probably set up a different frame interpolator.

- ffmpeg, this is used to break the initial video into frames and then later it is used to re-assemble the machine-generated frames into a video webm.  ffmpeg is called via a shell so you may need 


1. UPDATE TESTS
2. DO CODE REFACTOR
3. DO EXPORT REFACTOR

Show vid name on preview
Config from control panel: 
  Needed:
    EXPORT TO PLAYABLE MODULE FORM
    select optional bridge length
    better frame click feedback
  Next Phase:
    merge ghostidle wtih another ghostidle (just one link to the node)
    multiple ghostidles
    load ghostidle from file


  WANTED:
    click on bridge to set bridge frame count and overwrite

    



This is a WIP




