var path = require('path');
const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const isDev = process.env['NODE_ENV']=="development";

var entries, GLOBALS, plugins, loaders;

if (isDev ){
  /////////////// DEVELOPMENT
  GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify('development'),
    __DEV__: true
  };
  
  entries = [
    // Add the client which connects to our middleware
    // You can use full urls like 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'
    // useful if you run your app from another point like django
     
    'webpack-hot-middleware/client?reload=true&path=/__webpack_hmr&timeout=20000',
//    "webpack/hot/dev-server",
     'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
     //"./client/index.html",
     "./client/main",      
    ];

  plugins = [
    new webpack.DefinePlugin(GLOBALS), // Tells React to build in prod mode. https://facebook.github.io/react/downloads.htmlnew webpack.HotModuleReplacementPlugin());
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ];  
  
  loaders = [
      {test: /\.jsx?$/, include: path.join(__dirname, 'client'), loader: 'babel',
          query: {
              presets: ['es2015', 'react', 'stage-0','react-hmre']
            },
      },
      {test: /\.html$/, include: path.join(__dirname, 'client'), loader: "file?name=[name].[ext]", },
      { test: /\.ejs$/, exclude: /node_modules/, loader: "ejs-loader?variable=data" },
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
      {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=image/svg+xml'},
      {test: /\.(jpe?g|png|gif|ico)$/i, loaders: ['file']},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /(\.css)$/, loaders: ['style', 'css?sourceMap']},  //|\.scss //, 'sass?sourceMap'
       
    ];

  
  } else {
    /////////////// PRODUCTION
  GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEV__: false
  };
  
  entries = [
    //"./client/index.html"
    "./client/main",      
  ];
  plugins= [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS), // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(
/*      
    {
      compressor: {
        warnings: false,
        screw_ie8: true
      }
    }
*/
      ) //minify
    
    ];
    
    loaders= [
      {test: /\.js$/, include: path.join(__dirname, 'client'), loader: 'babel',
          query: {
              presets: ['es2015', 'react', 'stage-0']
            },
      },
      {test: /\.html$/, include: path.join(__dirname, 'client'), loader: "file?name=[name].[ext]", },
      { test: /\.ejs$/, exclude: /node_modules/, loader: "ejs-loader?variable=data" },
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file'},
      {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=image/svg+xml'},
      {test: /\.(jpe?g|png|gif|ico)$/i, loaders: ['file']},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
      {
        test: /(\.css)$/,  //|\.scss
        include: path.join(__dirname, 'client'),
        loader: ExtractTextPlugin.extract('css?sourceMap') //!sass?sourceMap
      }
    ]
      
  };


module.exports = {
  debug: true,
  noInfo: false, // set to false to see a list of every file being bundled.
    // Gives you sourcemaps without slowing down rebundling
  devtool: isDev ? 'cheap-module-eval-source-map':'source-map',
  devServer: {
        contentBase: isDev? './client' : './public',
//        progress: true,
        colors: true 
    },
  
//  context: __dirname + "/client",
  context: __dirname + "/",
  entry: entries,
  output: {
    publicPath:'/',
    filename: "bundle.js",
    path: __dirname + "/public",
  },
  target: 'web',
  module: {
      loaders: loaders,
  },
  
    plugins: plugins,
    resolve: {
        // you can now require('file') instead of require('file.coffee')
        extensions: ['', '.js', '.json', '.coffee','ejs'] 
    },
    node: {
      net: 'empty',
      tls: 'empty',
      dns: 'empty'
  }
}