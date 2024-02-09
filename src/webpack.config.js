const path = require('path');
process.env.NODE_OPTIONS="--openssl-legacy-provider";
module.exports = {
  mode: 'production',//'process.env.NODE_ENV === 'production' ? 'production' : 'development', 
  entry: './trailer/src.js', 
  output: {
    filename: '[name].[contenthash].js', // Bundled files (including output from esbuild)
    path: path.resolve(__dirname, 'dist'), 
    clean: true, 
    assetModuleFilename: 'assets/videos/[name].[contenthash][ext]',
  },
  module: {
    rules: [
      {
        test: /\.(webm)$/, 
        type: 'asset/resource',  // For videos
      },
      {
        test: /\.js$/, // Target your .js files
        exclude: /node_modules/,
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'js', // Assuming you want 'js' as the default loader
            target: 'es2015'  // Or your desired target environment
          }
        }
      }
    ],
  },
};
