var webpack = require("webpack")

module.exports = {
  entry: {
    main: "./assets/src/main.js"
  },
  output: {
    path: "./assets/dist",
    publicPath: "./",
    filename: "[name].js"
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loaders: ["style", "css"]
    }, {
      test: /\.(woff|svg|eot|ttf)\??.*$/,
      loader: 'url-loader?limit=50000&name=[path][name].[ext]'
    }, {
      test: /\.(gif|jpg|png)\??.*$/,
      loader: "file-loader?name=img/[name].[ext]"
    }]
  },
  watch: true
}