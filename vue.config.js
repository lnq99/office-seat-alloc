module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/seat-alloc/' : '/',
  productionSourceMap: false,
  configureWebpack: {
    externals: {
      cv: 'cv'
    }
  }
}
