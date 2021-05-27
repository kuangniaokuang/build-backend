const pullRequestUtil = require('../api/util/pullRequest')
const { Project } = require('../db/models')

const main = async () => {
  const userId = 842
  const project = (await Project.findOne({ where: { id: 614 } })).dataValues
  try {
    return await pullRequestUtil.fetchAllForProject(project.url, project.eeProjectId, userId)
  } catch (error) {
    console.error(error)
  }
}

main()
