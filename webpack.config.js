// const webpack = require('webpack')
const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	}

	if (isProd) {
		config.minimizer = [
			new OptimizeCSSAssetsWebpackPlugin(),
			new TerserWebpackPlugin()
		]
	}
	return config
}

const cssLoaders = extra => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
                publicPath: '',
                // hmr: isDev,
                // reloadAll: true
            }
		}, 'css-loader'
	]

	if (extra) {
		loaders.push(extra)
	}

	return loaders
}

const plugins = () => {
	const base = [
		new HTMLWebpackPlugin({
			template: './index.html',
			minify: {
				collapseWhitespace: isProd
			}
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin(
			{
				patterns:[
					{
						from: path.resolve(__dirname, 'public'),
						to: path.resolve(__dirname, 'dist/static')	
					}
				]
			}
		),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css'
		}),
	]

	if (isProd) {
		// base.push(new BundleAnalyzerPlugin())
	}

	return base
}

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './index.js']
	},
	output: {
		filename: '[name].[contenthash].js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve:{
		extensions: ['.js', '.json', '.png'],
		alias: {
			'@models': path.resolve(__dirname, 'src/models'),
			'@': path.resolve(__dirname, 'src')	
		}
	},
	optimization: optimization(),
	devServer: {
		port: 4200,
		hot: isProd
	},
	devtool: isProd ? false : 'source-map',
	plugins: plugins(),
	module: {
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders()
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				use: ['file-loader']
			},
			{
				test:/\.(ttf|woff|woff2|eot)$/,
				use: ['file-loader']
			},
			{
				test:/\.xml$/,
				use: ['xml-loader']
			},
			{
				test: /\.csv$/,
				use: ['csv-loader']
			},
			{
				test: /\.s[ac]ss$/,
				use: cssLoaders('sass-loader')
			},
			{
        		test: /\.m?js$/,
       			exclude: /node_modules/,
        		use: {
          			loader: 'babel-loader',
          			options: {
            			presets: ['@babel/preset-env'],
            			plugins: ['@babel/plugin-proposal-class-properties']
          			}
        		}
      		}
		]
	}
}