const isGitUrl = require('is-git-url')
const isUrl = require('validator/lib/isURL')

module.exports = {
  isValidGitUrl: (gitUrl) => {
    return isGitUrl(gitUrl) && isUrl(gitUrl, { require_protocol: true, protocols: ['https', 'git', 'http'] }) && gitUrl.endsWith('.git')
  },
  // Pass in an array of gitUrls and if a single one of them is invalid, return false
  isInvalidGitUrlArray: (gitUrls) => {
    gitUrls.forEach((gitUrl) => {
      if (!module.exports.isValidGitUrl(gitUrl)) {
        return gitUrl
      }
    })
    return null
  }
}
