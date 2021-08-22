const fs = require('fs')

module.exports = {
    transpileDependencies: ['vuetify'],
    devServer: {
        disableHostCheck: true,
        host: 'localdev.titscore.com',
        port: 443,
        https: {
            pfx: fs.readFileSync('20210806_5f210ce0.pfx'),
        },
    },
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.worker.js$/,
                    loader: 'worker-loader',
                    options: {
                        /* ... */
                    },
                }
            ],
        },
    },
    chainWebpack: (config) => {
        config.resolve.symlinks(false)
    },
}
