var webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: "source-map",
  entry: "./js/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  module:{
    preLoaders: [
        // Javascript
        { test: /\.js?$/, loader: 'eslint', exclude: /node_modules/ }
    ],
    loaders: [
      {test : /\.css$/, loader: 'style!css!'},
      { test: /\.svg$/, loader: 'svg-inline' }
    ]
  },
  eslint: {
      failOnWarning: false,
      failOnError: true
  },
}
