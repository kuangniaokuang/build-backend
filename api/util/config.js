module.exports = {
  get: (env) => {
    console.log('env', env)
    if (process.env.NODE_ENV === 'staging') {
      return require('../../config/env/staging')
    } else if (env === 'local') {
      return require('../../config/local')
    }
  }
}
