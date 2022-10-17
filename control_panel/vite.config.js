import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import postcss from './postcss.config.js';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    viteStaticCopy({
      targets: [
        {
          // Copy the static folder containing the c++ graphviz libraryto the root of the dist folder
          src: "node_modules/@hpcc-js/wasm/dist/graphvizlib.wasm",
          dest: '.',
        },
        {
          src: "node_modules/@hpcc-js/wasm/dist/expatlib.wasm",
          dest: '.',
        }
      ]
    })  
  ],
  css: { postcss },
  
})
