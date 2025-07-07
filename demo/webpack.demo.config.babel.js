import path from 'path';

export default {
    mode: 'development',
    entry: {
        'demo': path.join(__dirname, './demo.ts')
    },
    resolve: {
        extensions: ['.scss', '.ts', '.tsx', '.js']
    },
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
                        hot: true,
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
                loader: 'url-loader',
                exclude: /dist/
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
            },
        },
        compress: true,
        hot: true,
        open: false,
        port: 8081,
        historyApiFallback: true
    }
}
