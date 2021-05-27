const myProjects = require('../util/myProjects')
const { homogenizeGitUrl } = require('../util/project')

module.exports = {
  async getAll (req, res) {
    try {
      const { gitUrls, startDate, endDate } = req.query
      const { user } = req

      if (!gitUrls || !gitUrls.length) {
        throw new Error('No gitUrls provided')
      }

      const projects = await myProjects.getMetricsForGitUrls(gitUrls.map(homogenizeGitUrl), startDate, endDate, user.id)

      return res.status(200).send(projects)
    } catch (error) {
      console.error('MyProjectsController:getAll: ', error)

      return res.status(500).send('ERROR: MyProjectsController:getAll: ' + error)
    }
  }
}
