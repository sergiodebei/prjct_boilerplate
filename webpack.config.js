const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const globImporter = require('node-sass-glob-importer');
const postcssPresetEnv = require('postcss-preset-env');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const publicPath = path.resolve(__dirname, 'assets/');
const resourcesPath = path.resolve(__dirname, 'src/');

console.log('test', __dirname);

const getHost = (config = {}) => {
  const protocol = config.https ? 'https' : 'http';
  const host = config.host || 'localhost';
  const port = config.port || 3000;

  return `${protocol}://${host}${port ? `:${port}` : ''}`;
};

const getMode = (dev = isDev) => (dev ? 'development' : 'production');

const getEntry = (dev = isDev, config = {}) => {
  const mainEntry = path.join(resourcesPath, 'js/main.js');

  if (dev) {
    return [
      '@babel/polyfill',
      `webpack-dev-server/client?${getHost(config)}`,
      'webpack/hot/only-dev-server',
      mainEntry,
    ];
  }

  return ['@babel/polyfill', mainEntry];
};

const getOutput = (dev = isDev) => {
  if (dev) {
    return {
      filename: 'prjct_boilerplate-main.js',
      publicPath: './assets/js/',
    };
  }

  return {
    filename: 'bundle-[hash].js',
    path: path.resolve(publicPath, 'build'),
    publicPath: '/build/',
  };
};

const getDevTool = (dev = isDev) => dev && 'cheap-module-source-map';

const getModule = (dev = isDev) => {
  const jsLoader = {
    test: /\.[jt]sx?$/,
    exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
    use: ['babel-loader'],
  };

  const styleLoader = {
    test: /\.s?css$/,
    exclude: /node_modules/,
    use: [
      dev ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: () => [postcssPresetEnv()],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          importer: globImporter(),
        },
      },
    ],
  };

  return {
    rules: [jsLoader, styleLoader],
  };
};

const getDevServer = (dev = isDev, config = {}) => {
  if (dev) {
    return {
      publicPath: `${getHost(config)}/js/`,
      port: config.port,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    };
  }

  return undefined;
};

const getOptimization = (dev = isDev) => {
  if (dev) {
    return {};
  }

  return {
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()],
  };
};

const getPlugins = (dev = isDev) => {
  const plugins = [
    new CleanWebpackPlugin(),
    // new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ];

  if (dev) {
    return [...plugins, new webpack.HotModuleReplacementPlugin()];
  }

  return [
    ...plugins,
    new MiniCssExtractPlugin({ filename: '[name]-[hash].css' }),
    new ManifestPlugin({
      fileName: path.resolve(publicPath, 'build/manifest.json'),
      publicPath: '',
    }),
  ];
};

module.exports = (...args) => {
  const [dev, config] = args;

  return {
    mode: getMode(dev),
    entry: getEntry(dev, config),
    output: getOutput(dev, config),
    devtool: getDevTool(dev),
    module: getModule(dev),
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        Utilities: path.join(resourcesPath, '_assets/js/helpers/utils.js'),
      },
    },
    devServer: getDevServer(dev, config),
    plugins: getPlugins(dev),
    optimization: getOptimization(dev),
  };
};
