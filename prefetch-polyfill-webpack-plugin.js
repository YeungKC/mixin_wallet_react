"use strict"

const HtmlWebpackPlugin = require("html-webpack-plugin")

/**
 * flatten array
 * @param {array} arr
 */
const flatten = (arr) => arr.reduce((prev, curr) => prev.concat(curr), [])

/**
 * generator script
 * @param {array} files
 * @param {string} mode
 */
const generator = (files, ms = 1000) => `<script>
    (function () {
      window.onload = function () {
        setTimeout(function () {
          var i = 0, length = 0, js,
            preloadJs = [${files.join(",")}]

          for (i = 0, length = preloadJs.length; i < length; i++) {
            js = document.createElement('script')
            js.src = preloadJs[i]
            js.async = true
            document.body.appendChild(js)
          }
        }, ${ms})
      }
    })()
  </script>`

/**
 * @class PrefetchPolyfillPlugin
 */
class PrefetchPolyfillPlugin {
  constructor(options) {
    this.options = options || {}
    this.ms = this.options.ms
  }

  apply(compiler) {
    let extractedChunks = []
    let files = []
    let str = ""

    compiler.hooks.compilation.tap("InterpolateHtmlPlugin", (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(
        "InterpolateHtmlPlugin",
        (htmlPluginData) => {
          // get async thunks
          extractedChunks = compilation.chunks.filter(
            (chunk) => !chunk.isOnlyInitial()
          )
          const publicPath = compilation.outputOptions.publicPath || ""
          // get files
          files = flatten(extractedChunks.map((chunk) => chunk.files))
            .filter((files) => !files.endsWith(".map"))
            .map((entry) => `'${publicPath}${entry}'`)
          str = generator(files, this.ms)
          // inject
          htmlPluginData.html = htmlPluginData.html.replace(
            "</body>",
            str + "</body>"
          )
        }
      )
    })
  }
}

module.exports = PrefetchPolyfillPlugin
