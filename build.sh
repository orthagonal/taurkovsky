#!/bin/bash

echo "Building..."
esbuild src/trailer/src.js  --bundle  --outfile=src/player.js
# esbuild src/trailer/playgraph.js  --bundle  --outfile=./src/compiled_playgraph.js
