const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: 10 });
const autoprefixer = require('autoprefixer');

// 用于全局修改antd主题色，未开启，若需开启，只需将.babelrc的
// ["import", { "libraryName": "antd", "style": "css" }],
// --->
// ["import", { "libraryName": "antd", "style": true }],
// 且若使用了happypack，需要将happypack的cache配置改成false，才会进行antd less文件的编译，否则读缓存不编译
const theme = require('./antd-theme-config');

module.exports = {
  entry: {
    //js: './app/client.js',
    app: [path.resolve('app/client.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['', '.js', '.json'],
    alias: {
      components: __dirname + '/app/components',
      actions: __dirname + '/app/actions',
      api: __dirname + '/app/api',
      reducers: __dirname + '/app/reducers',
      utils: __dirname + '/app/utils',
      constants: __dirname + '/app/constants',
      containers: __dirname + '/app/containers',
    },
  },
  module: {
    loaders: [{
      test: /\.js[x]?$/,
      exclude: /node_modules/,
      loader: 'happypack/loader?id=js'
    }, {
      test: /\.less$/,
      loader: `style!css!postcss!less-loader?{"modifyVars":${JSON.stringify(theme)}}`,
    }, {
      test: /\.scss$/,
      loader: 'style!css!postcss!sass',
    }, {
      test: /\.css/,
      loader: 'style!css!postcss',
    }, {
      test: /\.(png|jpg|gif)$/,
      loader: 'url-loader?limit=8192',
    },{
      test: /\.otf$/,
      loader: 'file-loader'
    }],
  },
  // We use PostCSS for autoprefixing only.
  postcss: function () {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9', // React doesn't support IE8 anyway
        ]
      }),
    ];
  },
  plugins: [
    new HappyPack({
      id: 'js',
      loaders: ['babel'],
      threadPool: happyThreadPool,
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/index.html'),
    }),
    new OpenBrowserPlugin({
      url: 'http://localhost:3000',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    // new webpack.DllReferencePlugin({
    //   context: __dirname,
    //   manifest: require('./dist/vendor-manifest.json')
    // }),
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: './dist/',
    historyApiFallback: true,
    hot: true,
    host: '0.0.0.0'
  },
}
