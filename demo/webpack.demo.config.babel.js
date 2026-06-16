import path from 'path';

export default {
    mode: 'development',
    entry: {
        demo: path.join(__dirname, './demo.ts')
    },
    resolve: {
        extensions: ['.riot', '.scss', '.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.riot$/,
                exclude: /node_modules/,
                use: [{ loader: '@riotjs/webpack-loader', options: { hot: true } }]
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: 'ts-loader'
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
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    devServer: {
        static: [
            {
                directory: __dirname,
                watch: true
            },
            {
                directory: path.resolve(__dirname, '../docs'),
                watch: true
            }
        ],
        client: {
            overlay: {
                warnings: false
            }
        },
        compress: true,
        hot: true,
        open: false,
        port: 8081,
        historyApiFallback: true
    }
};
