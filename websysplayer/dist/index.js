/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (() => {

eval("// Note that a dynamic `import` statement here is required due to\r\n// webpack/webpack#6615, but in theory `import { greet } from './pkg';`\r\n// will work here one day as well!\r\n// import { listen } from '@tauri-apps/api/event';\r\n// import { invoke } from '@tauri-apps/api/tauri';\r\n\r\n// console.log(\"what is this  doing?\");\r\n// const unlisten = await listen('tauri://file-drop', (event) => {\r\n//   console.log(\"file drop\");\r\n//   console.log(event);\r\n// });\r\n// console.log(unlisten);\r\n\r\nconst drop = document.getElementById('original-video');\r\ndrop.addEventListener('onchange', (event) => {\r\n  console.log(\"onchange\");\r\n  console.log(event);\r\n});\r\n// console.log('onDrop listener added');\r\n\r\n// const selectVideo = (event) => {\r\n//   console.log(\"selectVideo\");\r\n//   console.log(event);\r\n// };\r\n\r\n\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./index.js"]();
/******/ 	
/******/ })()
;