const cloudwatchMetrics = require('./cloudwatchMetrics')
const config = {
  host: 'staging.merico.build',
  port: 443,
  backendUrl: 'staging-backend.mericobuild.com'
}
cloudwatchMetrics.verifyEnvironment('staging', config)
