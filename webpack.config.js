// const webpack = require("webpack";

// module.exports = {
//   resolve: {
//     fallback: {
//       "assert": require.resolve("assert/"),
//       "stream": require.resolve("stream-browserify"),
//       // "stream": false
//     },
//   },

//   // plugins: [
//   //   // Work around for Buffer is undefined:
//   //   // https://github.com/webpack/changelog-v5/issues/10
//   //   new webpack.ProvidePlugin({
//   //     Buffer: ["buffer", "Buffer"],
//   //   }),
//   //   new webpack.ProvidePlugin({
//   //     process: 'process/browser',
//   //   }),
//   // ],
//   node: {
//     Buffer: true,
//   },
// };

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
	plugins: [
		new NodePolyfillPlugin(),
	],
};

