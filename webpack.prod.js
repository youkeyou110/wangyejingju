const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { version } = require('./package.json');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    }
                },
                extractComments: false
            }),
            new CssMinimizerPlugin()
        ],
        splitChunks: {
            chunks: 'all',
            name: false
        }
    },
    output: {
        filename: `[name].${version}.js`,
        chunkFilename: `[name].${version}.chunk.js`
    }
});
