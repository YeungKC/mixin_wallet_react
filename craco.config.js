const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')


module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  webpack: {
    plugins: {
      add: [
        new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
          result.request = result.request.replace(/typeorm/, 'typeorm/browser')
        }),
        new CopyPlugin({ patterns: [{ from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: 'static/wasm/' }] }),
      ],
    },
    
  },
}
