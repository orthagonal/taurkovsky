#!/bin/bash

echo "Building..."
esbuild src/trailer/src.js  --bundle  --outfile=./public/player.js
esbuild src/trailer/playgraph.js  --bundle  --outfile=./public/playgraph.js
cp src/trailer/player.html public/player.html
cp src/trailer/styles.css public/styles.css
cp -r src/trailer/main public/

# Run the JS script to handle hashing and copying of .webm files
# node build.js

# #!/bin/bash
# echo "Building..."
# esbuild src/trailer/src.js  --bundle  --outfile=./public/player.js
# esbuild src/trailer/playgraph.js  --bundle  --outfile=./public/playgraph.js
# cp src/trailer/player.html public/player.html
# cp -r src/trailer/main public/
