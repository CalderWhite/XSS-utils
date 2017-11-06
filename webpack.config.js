const path = require("path");
var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");

const sourcePath = "/src";
const staticPath = "/static";
module.exports = {
    context: __dirname+sourcePath,
    devtool: debug ? "inline-sourcemap" : false,
    entry: "./js/scripts.js",
    output: {
        path: __dirname + staticPath,
        filename: path.join("js","scripts.min.js")
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              cacheDirectory: true,
              presets: ['react', 'es2015']
            }
          }
        ]
    },
    plugins: debug ? [] : [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
        new CopyWebpackPlugin([
            {
                from:"css",
                to:"../"+staticPath+"/css"
            },
            {
                from:"index.html",
                to:"../"+staticPath+"/index.html"
            }
        ])
    ]
};