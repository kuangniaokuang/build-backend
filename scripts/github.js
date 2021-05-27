const pullRequestUtil = require('../api/util/pullRequest')
const { Project } = require('../db/models')

const main = async () => {
  const userId = 840
  const project = (await Project.findOne({ where: { id: 612 } })).dataValues

  return await pullRequestUtil.fetchAllForProject(project.url, project.eeProjectId, userId)
}

main()
