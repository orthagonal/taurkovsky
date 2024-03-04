const unhashedPaths = [
  require('./src/trailer/game1/intro_playgraphs.js'),
  require('./src/trailer/game1/narrationStateHandlers.js'),
  require('./src/trailer/game1/wordStateHandlers.js'),
];
const webmPaths = unhashedPaths.map(extractWebmPathsFromObject).flat();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto-js'); 

const bundleToBeModified = './src/player.js';
const assetDirectory = path.resolve(__dirname, 'src/trailer'); 
const sourceDirectory = path.resolve(__dirname, 'src/trailer');
const outputDirectory = path.resolve(__dirname, 'src/trailer/dist');
try {
  fs.rmdirSync(outputDirectory, { recursive: true });
} catch (error) {
  console.log(error);  
}

function hashFile(filePath) {
  const fileContent = fs.readFileSync(filePath);
  const hash = crypto.MD5(fileContent).toString();
  return hash;
}



function extractWebmPathsFromObject(playgraph) {
  // get all values that are strings and end with .webm
  // will append a '/' to the beginning of the path if it's missing
  const string = JSON.stringify(playgraph);
  // use regex to get .webm files from the json string
  const regex = new RegExp(`([^"]*\.webm)`, 'g');
  const webmPaths = string.match(regex);
  return webmPaths;
}

function processAssets(webmPaths) { // Now accepts a list of paths
  let tried = 0;
  let success = 0;
  for (const originalWebmPath of webmPaths) {
    tried++;
    const originalFileName = path.basename(originalWebmPath);
    try {
      const sourcePath = path.join(sourceDirectory, originalWebmPath);
      const hash = hashFile(`${__dirname}/src/trailer/${originalWebmPath}`);
      const newFilename = `${path.basename(originalWebmPath, '.webm')}${hash}.webm`;
      // Construct destination path based on input's relative structure
      const relativeParts = originalWebmPath.split('/');
      relativeParts.pop();
      const distPath = path.join(outputDirectory, ...relativeParts);
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true }); 
      }
      fs.copyFileSync(sourcePath, path.join(distPath, newFilename));
      let bundleContent = fs.readFileSync(bundleToBeModified, 'utf8');
      bundleContent = bundleContent.replace(new RegExp(originalFileName, 'g'), newFilename);
      fs.writeFileSync(bundleToBeModified, bundleContent);
      success++;
    } catch (error) {
      console.log('error copying file: ', originalWebmPath);      
      // console.log(error);      
    }
  }
  console.log(`tried: ${tried}, success: ${success}`);
}


processAssets(webmPaths);
console.log('copied all assets....');