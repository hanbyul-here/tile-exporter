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
    './app/App'
  ],
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
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
      test: /\.(woff|eot|ttf|svg|png|yaml)$/,
      loader: 'url-loader?limit=100000'
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
    extensions: ['', '.js']
  }
};

module.exports = config;
