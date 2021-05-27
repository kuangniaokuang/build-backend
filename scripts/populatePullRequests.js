const { Project, UserProject } = require('../db/models')
const pullRequestUtil = require('../api/util/pullRequest')

const main = async () => {
  const projects = await Project.findAll()

  projects.forEach(async (project) => {
    project = project.dataValues

    const userProject = await UserProject.findOne({ where: { ProjectId: project.id } })
    try {
      await pullRequestUtil.fetchAllForProject(project.gitUrl, project.eeProjectId, userProject.dataValues.UserId)
    } catch (error) {
      console.error('ERROR: Bad data, skipping', project, error)
    }
  })
}

main()
