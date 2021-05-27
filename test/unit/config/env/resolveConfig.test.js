const chai = require('chai')
const { expect } = chai
const decache = require('decache');

const environments = require('../../../../config/constants/environments')

const originalNodeEnv = process.env.NODE_ENV

describe('resolveConfig', () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  })

  it ('returns staging.js if its staging', () => {
    decache('../../../../config/env/resolveConfig')
    process.env.NODE_ENV = environments.staging
    const config = require('../../../../config/env/resolveConfig')
    expect(config.custom.ENV_STRING).to.equal(environments.staging)
  })

  it ('returns sandbox.js if its sandbox', () => {
    decache('../../../../config/env/resolveConfig')
    process.env.NODE_ENV = environments.sandbox
    const config = require('../../../../config/env/resolveConfig')
    expect(config.custom.ENV_STRING).to.equal(environments.sandbox)
  })

  it ('returns testing.js if its testing', () => {
    decache('../../../../config/env/resolveConfig')
    process.env.NODE_ENV = environments.testing
    const config = require('../../../../config/env/resolveConfig')
    expect(config.custom.ENV_STRING).to.equal(environments.testing)
  })

  it ('returns benchmark.js if its benchmark', () => {
    decache('../../../../config/env/resolveConfig')
    process.env.NODE_ENV = environments.benchmark
    const config = require('../../../../config/env/resolveConfig')
    expect(config.custom.ENV_STRING).to.equal(environments.benchmark)
  })

  it ('returns local.js if its anything else', () => {
    decache('../../../../config/env/resolveConfig')
    process.env.NODE_ENV = 'nanananana'
    const config = require('../../../../config/env/resolveConfig')
    expect(config.custom.ENV_STRING).to.equal('jon-local')
  })
})
