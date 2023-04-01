const { defineConfig } = require("cypress")
const preprocessor = require("./preprocessor")

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('file:preprocessor', preprocessor)
    },
    video: false
  },
})
