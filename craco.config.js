const path = require("path")
const webpack = require("webpack")
const tailwindcss = require("tailwindcss")
const autoprefixer = require("autoprefixer")
const FilterWarningsPlugin = require("webpack-filter-warnings-plugin")
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin

const HtmlWebpackPlugin = require("html-webpack-plugin")
const PrefetchPolyfillPlugin = require("./prefetch-polyfill-webpack-plugin")

module.exports = {
  style: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  webpack: {
    configure: {
      optimization: {
        splitChunks: {
          minSize: 30,
          cacheGroups: {
            default: {
              name: "common",
              chunks: "initial",
              minChunks: 2,
              priority: -20,
            },
            vendors: {
              test: /node_modules/,
              name: "vendor",
              chunks: "initial",
              priority: -10,
            },
            typeorm: {
              chunks: "initial",
              name: "typeorm",
              test: /typeorm/,
              priority: 0,
            },
            react: {
              chunks: "initial",
              name: "react",
              test: /react/,
              priority: 0,
            },
          },
        },
      },
      resolve: {
        alias: {
          "bn.js": path.resolve(__dirname, "node_modules", "bn.js"),
        },
      },
      module: {
        rules: [
          {
            test: /\.wasm$/,
            type: "javascript/auto",
          },
        ],
      },
    },
    plugins: {
      add: [
        new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (
          result
        ) {
          result.request = result.request.replace(/typeorm/, "typeorm/browser")
        }),
        new webpack.ProvidePlugin({
          "window.SQL": "sql.js/dist/sql-wasm.js",
        }),
        new FilterWarningsPlugin({
          exclude: [
            /mongodb/,
            /mssql/,
            /mysql/,
            /mysql2/,
            /oracledb/,
            /pg/,
            /pg-native/,
            /pg-query-stream/,
            /react-native-sqlite-storage/,
            /redis/,
            /sqlite3/,
            /sql.js/,
            /typeorm-aurora-data-api-driver/,
          ],
        }),
        new HtmlWebpackPlugin(),
        new PrefetchPolyfillPlugin({ ms: 2000 }),
        new BundleAnalyzerPlugin(),
      ],
    },
  },
}
