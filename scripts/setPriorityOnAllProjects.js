const { refreshPriority } = require('../api/util/priority')
const projectUtil = require('../api/util/project')

const main = async () => {
  console.log('INFO >>> setting priority on all projects')

  const projects = await projectUtil.findAll()

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    console.log('INFO >>> setting priority on project: ', project.gitUrl)

    await refreshPriority(project)
  }
}

main()
