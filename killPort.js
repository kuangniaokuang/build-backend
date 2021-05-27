module.exports = {
  killPort: () => {
    // Kill the previous process if it is still running
    if (process.env.NODE_ENV !== 'test') {
      console.log('INFO: Attempting to kill previous process...')
      const config = require('./config/env/resolveConfig')
      const port = config.port || config.custom.port || 1337
      try {
        require('child_process').execSync(`kill -9 $(lsof -i tcp:${port} | awk 'NR==2{print $2}')`)
        console.log('INFO: Process on sails port was killed...')
      } catch (error) {
        console.log('INFO: No previous process was running...', error.status)
      }
    }
  }
}
