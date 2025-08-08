const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // Disable ESLint during development for faster builds
  
  devServer: {
    port: 8080,
    open: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },

  chainWebpack: config => {
    // Optimize chunks
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    })
  }
})