 var path = require('path');
 var webpack = require('webpack');

 module.exports = {
    mode: 'development', 
    entry: './app/QueryBuilder.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'QueryBuilder.bundle.js'
     },
    module: {
         rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    watch: true,
    stats: {
        colors: true
    },
    devtool: 'source-map'
 };
