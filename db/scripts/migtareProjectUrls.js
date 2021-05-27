const { Project } = require('../models')
const ProjectUtil = require('../../api/util/project')

module.exports = {
  async migrateProjectUrls () {
    try {
      const projects = await Project.findAll({})

      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        try {
          await Project.update({
            gitUrl: ProjectUtil.homogenizeGitUrl(project.dataValues.gitUrl),
            url: ProjectUtil.homogenizeWebUrl(project.dataValues.url)
          }, {
            where: {
              id: project.dataValues.id
            }
          })
        } catch (error) {
          console.log('record could not be fixed automatically', error)
        }
      }
      return
    } catch (error) {
      console.log('ERROR: migrateProjectUrls: ', error)
    }
  }
}
