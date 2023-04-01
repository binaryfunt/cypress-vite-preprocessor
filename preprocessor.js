const path = require("path")
const vite = require("vite")
const chokidar = require("chokidar")

/** @type {Record<string, chokidar.FSWatcher>} */
const watchers = {}

const preprocessor = async (file) => {
  const { filePath, outputPath, shouldWatch } = file
  const fileName = path.basename(outputPath)
  const filenameWithoutExtension = path.basename(
    outputPath,
    path.extname(outputPath),
  )

  let initial = true
  console.error("--> PREPROCESSING:", filePath)
    
  if (shouldWatch && !watchers[filePath]) {
    watchers[filePath] = chokidar.watch(filePath)
  
    file.on('close', async () => {
      // TODO: never happens
      console.error("--> CLOSE:", filePath)
      await watchers[filePath].close()
      delete watchers[filePath]
    })
  
    watchers[filePath].on('all', () => {
      if (!initial) {
        console.error("--> CHANGED:", filePath)
        file.emit('rerun')
      }
      initial = false
    })
  }

  console.error("--> BUILD:", filePath)
  await vite.build({
    logLevel: 'warn',
    define: {
      'process.env.NODE_ENV': 'development'
    },
    build: {
      emptyOutDir: false,
      minify: false,
      outDir: path.dirname(outputPath),
      sourcemap: true,
      write: true,
      watch: null,
      lib: {
        entry: filePath,
        fileName: () => fileName,
        formats: ['umd'],
        name: filenameWithoutExtension,
      },
    },
  })

  return outputPath
}

module.exports = preprocessor