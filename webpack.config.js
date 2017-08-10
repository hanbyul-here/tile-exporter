var webpack = require('webpack');

var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(path);
  },
  entry: [
   'webpack-hot-middleware/client',
    './app/App.jsx'
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  devtool: 'cheap-module-source-map',
  module: {
    noParse: [],
    loaders: [{
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    },  {
      test: /\.scss$/,
      loader: 'style!css!sass?sourceMap'
    },
    {
      test: /\.(svg)$/,
      loader: 'url-loader?limit=10000'
    },
    {
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015']
      }
    },
    {
      test: /.js?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      include: [
        path.resolve(__dirname)
      ]
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

module.exports = config;
