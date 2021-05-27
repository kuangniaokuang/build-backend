const codeAnalysis = require('../util/codeAnalysis')
const errors = require('../util/errors')
const ProjectUtil = require('../util/project')

const getAnalysisOptions = (query) => {
  const defaults = codeAnalysis.defaultAnalysisOptions

  return {
    commitBefore: isNaN(query.commitBefore) ? defaults.commitBefore : parseInt(query.commitBefore),
    commitAfter: isNaN(query.commitAfter) ? defaults.commitAfter : parseInt(query.commitAfter),
    commitLimit: isNaN(query.commitLimit) ? defaults.commitLimit : parseInt(query.commitLimit)
  }
}

module.exports = {
  errorMessages: {
    INVALID_GIT_URL: 'You must specify a git URL like this: https://github.com/freeCodeCamp/freeCodeCamp'
  },
  analyzeRepository: async (req, res) => {
    const gitUrl = ProjectUtil.homogenizeGitUrl(req.query.gitUrl || req.query.URL || req.query.url)

    if (!gitUrl) {
      return res.status(400).send(module.exports.errorMessages.INVALID_GIT_URL)
    }

    try {
      const options = getAnalysisOptions(req.query)

      const { reportId } = await codeAnalysis.analyze(gitUrl, req.user.id, options)

      return res.status(200).send({ data: { reportId } })
    } catch (error) {
      errors.send(res, error, 'AnalyticsEngineController:analyzeRepository')
    }
  }
}
