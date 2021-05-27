const axios = require('axios')
const { GITHUB_PATS } = require('../../config/env/resolveConfig').custom

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
  async getFromGithubAPI (path) {
    const patIndex = getRandomInt(1, 4) % 4

    return await axios.get(
      `https://api.github.com/${path}`,
      {
        headers: {
          Authorization: `token ${GITHUB_PATS[patIndex]}`,
          'User-Agent': 'Request-Promise'
        }
      }
    )
  }
}
