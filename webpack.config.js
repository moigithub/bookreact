var path = require('path');
const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const isDev = process.env['NODE_ENV']=="development";

var entries = isDev ? [
    // Add the client which connects to our middleware
    // You can use full urls like 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'
    // useful if you run your app from another point like django
     
    'webpack-hot-middleware/client?reload=true&path=/__webpack_hmr&timeout=20000',
//    "webpack/hot/dev-server",
     'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
     "./client/index.html",      
    ] : [];

    
console.log("__dirname+client",path.join(__dirname, 'client'));


module.exports = {
    // Gives you sourcemaps without slowing down rebundling
  devtool: isDev ? 'eval-source-map':null,
  devServer: {
//        contentBase: './client/public',
        progress: true,
        colors: true 
    },
  
//  context: __dirname + "/client",
  context: __dirname + "/",
  entry: entries.concat ([
     "./client/main.js",
  ]),

  output: {
    publicPath:'/',
    filename: "bundle.js",
    path: __dirname + "/public",
  },
  
  module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
//          include: path.join(__dirname, 'client'), 
          //loader: ["babel-loader"],
          loader: "babel", 
          //loaders: ['react-hot', 'babel'],
          query: {
              presets: ['es2015', 'react', 'stage-0' ]  .concat(isDev?['react-hmre']:[])
            },
        },
        {
          test: /\.html$/,
          loader: "file?name=[name].[ext]",
        },
        { test: /\.jpe?g$|\.gif$|\.ico$|\.png$|\.svg$|\.woff$|\.ttf$/, loader: "file" },
//        { test: /\.scss$/, loader: "style!css!sass" },
        {
          test: /\.css$/,
//              include: path.join(__dirname, 'client'),
              //loader: "style!css"
              //loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
//              loader: ExtractTextPlugin.extract("style!css"),
              //loader: isDev ? 'style!css' : ExtractTextPlugin.extract("style-loader!css-loader"),
//              loader: ExtractTextPlugin.extract('style', 'css?modules&localIdentName=[name]---[local]---[hash:base64:5]!postcss')
          loader: isDev ? 'style!css' : ExtractTextPlugin.extract(
            'style-loader',
            'css-loader'
          ),
          exclude: /node_modules/
        },
      ],
  },
  
    plugins: [

    // Webpack 1.0
    new webpack.optimize.OccurenceOrderPlugin(),
    // Webpack 2.0 fixed this mispelling
    // new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),        
  
/*
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true
      }
      
    }),    
*/
        new ExtractTextPlugin("styles.css"),
    ],
    resolve: {
        // you can now require('file') instead of require('file.coffee')
        extensions: ['', '.js', '.json', '.coffee'] 
    }
}