const env = process.env.NODE_ENV

const loadConfigFile = (filePath) => {
  try {
    return require(filePath)
  } catch (e) {
    console.info(`resolveConfig:loadConfigFile: Could not load ${filePath} error=${e}`)
  }
}

let config

if (env === 'staging') {
  config = loadConfigFile('./staging.js')
} else if (env === 'production') {
  config = loadConfigFile('./production.js')
} else if (env === 'production2') {
  config = loadConfigFile('./production2.js')
} else if (env === 'sandbox') {
  config = loadConfigFile('./sandbox.js')
} else if (env === 'benchmark') {
  config = loadConfigFile('./benchmark.js')
} else if (env === 'testing') {
  config = loadConfigFile('./testing.js')
} else if (env === 'localTesting') {
  config = loadConfigFile('./localTesting.js')
} else {
  config = loadConfigFile('../local.js')
}

module.exports = config
