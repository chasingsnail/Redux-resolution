
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    publicPath: "/",
    path: __dirname + '/build'
  },
  resolve: {
    modules: ["node_modules", "web_modules"],
    extensions: ['.webpack.js', '.web.js', '.js']
  },
  module: {
    loaders: [
        {
            test: /\.js$/,
            loaders: ['babel-loader'], 
            exclude: /node_modules/
        },
        {
            test: /\.css/,
            use: ["style-loader", "css-loader"]
          },
      {
        enforce: 'pre',
        test: '/\.js$/',
        loader: 'source-map-loader'
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'test',
      chunksSortMode: 'dependency',
      template: './index.html'
    })
  ]
}

module.exports = config