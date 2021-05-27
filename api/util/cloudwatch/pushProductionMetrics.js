const cloudwatchMetrics = require('./cloudwatchMetrics')
const config = {
  host: 'merico.build',
  port: 443,
  backendUrl: 'backend.mericobuild.com'
}
cloudwatchMetrics.verifyEnvironment('production', config)
