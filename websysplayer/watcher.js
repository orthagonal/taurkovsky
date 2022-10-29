require('esbuild').serve({
  port: 8080,
  servedir: '../ui',
  // bundle: true,
}, {
  outdir: '../ui',
  bundle: true,
  entryPoints: ['index.jsx', 'preview.jsx'],
  // onRebuild(error, result) {
  //   if (error) console.error('watch build failed:', error)
  //   else console.log('watch build succeeded:', result)
  // }
})

