const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        popup: './src/popup/js/popup.js',
        background: './src/background/background.js',
        content: './src/content/content.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]/[name].js'
    },
    optimization: {
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin()
        ],
        splitChunks: {
            chunks: 'all'
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name]/[name].[contenthash].css'
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/manifest.json', to: 'manifest.json' },
                { from: 'src/popup/popup.html', to: 'popup/popup.html' },
                { from: 'src/icons', to: 'icons' },
                { from: 'src/popup/css/popup.css', to: 'popup/popup.css' },
                { from: 'src/popup/css/template-editor.css', to: 'popup/template-editor.css' },
                { from: 'src/background/background.js', to: 'background/background.js' },
                { from: 'src/_locales', to: '_locales' }
            ]
        })
    ]
};
