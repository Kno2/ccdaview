import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const externals = {
    bluebutton: 'bluebutton',
    dragula: 'dragula',
    lodash: 'lodash',
    moment: 'moment',
    riot: 'riot'
};

export default {
    entry: {
        'sialia': './src/index.ts'
    },
    devtool: 'source-map',
    externals: externals,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'sialia',
        libraryTarget: 'umd'
    },
    optimization: {
        minimize: false,
    },
    resolve: {
        extensions: ['.scss', '.ts', '.tsx', '.js'],
        alias: {
            jquery$: path.resolve(__dirname, 'shims/jquery.js'),
            bootstrap$: path.resolve(__dirname, 'shims/bootstrap.js')
        }
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' })
    ],
    module: {
        rules: [
            {
                test: /\.tag$/,
                use: [{
                    loader: 'riot-tag-loader',
                    options: {
                        enforce: 'pre',
                        type: 'none',
                        format: 'ems',
                        hot: false,
                    }
                }]
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                type: 'asset',
                exclude: /dist/,
                parser: {
                    dataUrlCondition: {
                        maxSize: 8192 // inline files smaller than 8kb (url-loader default)
                    }
                }
            },
            {
                test: /\.scss$/,
                exclude: /dist/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
            }
        ]
    }
};
