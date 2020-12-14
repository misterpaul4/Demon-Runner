const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs'),
  },
  devServer: {
    open: true,
  },
  module: {
    rules: [{
      test: /\.css?$/,
      use: [
        'style-loader',
        'css-loader',
      ],
    },
    {
      test: /\.(png|svg|jpg|gif|mp3)$/,
      use: [
        'file-loader',
      ],
    },
    ],
  },
};