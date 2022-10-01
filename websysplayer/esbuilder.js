require('esbuild').build({
  entryPoints: ['index.jsx', 'preview.jsx'],
  bundle: true,
  outdir: '../ui/',
}).catch(() => process.exit(1))

