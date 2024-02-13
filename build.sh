#!/bin/bash


echo "Building..."
esbuild src/trailer/src.js  --bundle  --outfile=src/player.js
node hash-assets.js
# http-server -a 127.0.0.1 -p 1420 -c10 --cors 