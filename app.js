const cloudwatch = require('./api/util/cloudwatch')

const RECONNECTION_ATTEMPS_LIMIT = 10
const RECONNECTION_INTERVAL = 10000

let reconnectionAttempts = 0

const config = require('./config/env/resolveConfig')

try {
  if (config.custom.NEW_RELIC_LICENSE_KEY) {
    require('newrelic')
    console.log('INFO: New relic was loaded')
  }
} catch (error) {
  console.error('ERROR: could not load new relic', error)
}

console.log('CONFIG INFO: >>> githubClientId', config.custom.githubAuth.clientId)
console.log('CONFIG INFO: >>> gitlabClientId', config.custom.gitlabAuth.clientId)
console.log('CONFIG INFO: >>> ENV', config.custom.ENV_STRING)
console.log('CONFIG INFO: >>> db host', config.custom.ceDatabase.host)
console.log('CONFIG INFO: >>> db name', config.custom.ceDatabase.database)
console.log('CONFIG INFO: >>> AE', config.custom.CA_GRPC_SERVER)

const sendAECloudwatchEvent = (value) => {
  cloudwatch.sendBooleanEvent(`AEIsWorking-${process.env.NODE_ENV}`, value)
}

const attemptReconnect = (aeHelper) => {
  setInterval(() => {
    if (!aeHelper.helper.ampqConnection) {
      aeHelper.helper.connectAmqp()
      reconnectionAttempts += 1
      sendAECloudwatchEvent(1)
    }
    if (!aeHelper.helper.minioClient) {
      aeHelper.helper.connectMinio()
      reconnectionAttempts += 1
      sendAECloudwatchEvent(1)
    }
    if (aeHelper.helper.ampqConnection && aeHelper.helper.minioClient) {
      reconnectionAttempts = 0
    }

    if (reconnectionAttempts > RECONNECTION_ATTEMPS_LIMIT) {
      sendAECloudwatchEvent(0)
    }
  }, RECONNECTION_INTERVAL)
}

(async () => {
  process.chdir(__dirname)

  let sails
  let rc
  try {
    try {
      require('./killPort').killPort()
    } catch (error) {
      console.info('INFO: lsof not supported on this machine')
    }

    const aeHelper = require('./api/util/aeHelper')
    console.info('INFO: Loaded aehelper')
    await aeHelper.prepareForAnalysis()
    console.info('INFO: Prepared for analysis')
    // sendAECloudwatchEvent(1)

    sails = require('sails')
    rc = require('sails/accessible/rc')

    attemptReconnect(aeHelper)

    sails.lift(rc('sails'))
  } catch (err) {
    console.error('Encountered an error when attempting to start the server')
    console.error(err.stack)
  }
})()
