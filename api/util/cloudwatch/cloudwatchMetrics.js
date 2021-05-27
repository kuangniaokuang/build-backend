const http = require('https')
const rp = require('request-promise')
const cloudwatch = require('.')
const { Badge } = require('../../../db/models')

module.exports = {
  frontEndIsWorking (env, config) {
    config.path = '/'
    http.get(config, (res, err) => {
      const sslWorking = res.connection.ssl !== null
      cloudwatch.sendBooleanEvent('sslWorking', sslWorking, env)
      const frontEndIsWorking = res.statusCode === 200
      cloudwatch.sendBooleanEvent('frontEndIsWorking', frontEndIsWorking, env)
      if (err !== undefined) {
        console.log(`Error found ${err}`)
      }
    }).on('error', (err) => {
      console.error('ERROR: frontEndIsWorking:: ', err)
      cloudwatch.sendBooleanEvent('frontEndIsWorking', false, env)
    })
  },

  backendIsWorking (env, config) {
    config.path = '/version'
    const options = { host: config.backendUrl, ...config }
    http.get(options, (res, err) => {
      const backendIsWorking = res.statusCode === 200
      cloudwatch.sendBooleanEvent('backendIsWorking', backendIsWorking, env)
      if (err !== undefined) {
        console.log(`Error found ${err}`)
      }
    }).on('error', (err) => {
      console.error('ERROR: backendIsWorking:: ', err)
      cloudwatch.sendBooleanEvent('backendIsWorking', false, env)
    })
  },

  async assertionIsWorking (env, config) {
    try {
      const randomBadge = await Badge.findOne()
      const path = `/badges/assertion/${randomBadge.dataValues.id}`
      const options = { path, ...config }
      http.get(options, (res, err) => {
        const assertionIsWorking = res.statusCode === 200
        cloudwatch.sendBooleanEvent('assertionIsWorking', assertionIsWorking, env)
        if (err !== undefined) {
          console.log(`Error found ${err}`)
        }
      }).on('error', (e) => {
        cloudwatch.sendBooleanEvent('assertionIsWorking', false, env)
        if (e !== undefined) {
          console.log(`Error found ${e}`)
        }
      })
    } catch (error) {
      console.error('Could not get badge from DB', error)
    }
  },

  homePageRendered (env, config) {
    rp(`https://${config.host}`)
      .then((html) => {
        const homePageRendered = html.match(/<title>Merico Build/i) !== null
        cloudwatch.sendBooleanEvent('homePageRendered', homePageRendered, env)
      })
      .catch((err) => {
        console.error('ERROR: homePageRendered:: ', err)
        cloudwatch.sendBooleanEvent('homePageRendered', false, env)
      })
  },

  async assertionPageRenderedTime (env, config) {
    const start = new Date()
    try {
      const randomBadge = await Badge.findOne()
      rp(`https://${config.host}/badges/assertion/${randomBadge.dataValues.id}`)
        .then((html) => {
          const assertionPageRendered = html.match(/<title>Merico Build/i) !== null
          cloudwatch.sendBooleanEvent('assertionPageRendered', assertionPageRendered, env)
          const end = new Date()
          const assertionPageRenderedTime = end - start
          cloudwatch.sendIntegerEvent('assertionPageRenderedTime', assertionPageRenderedTime, env)
        })
        .catch((err) => {
          console.error('ERROR: assertionPageRenderedTime:: ', err)
          cloudwatch.sendBooleanEvent('assertionPageRendered', false, env)
        })
    } catch (error) {
      console.error('ERROR: assertionPageRenderedTime: ', error)
    }
  },
  async verifyEnvironment (env, config) {
    process.env.NODE_ENV = env
    module.exports.frontEndIsWorking(env, config)
    module.exports.backendIsWorking(env, config)
    await module.exports.assertionIsWorking(env, config)
    module.exports.homePageRendered(env, config)
    await module.exports.assertionPageRenderedTime(env, config)
  }
}
