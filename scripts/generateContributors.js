const projectUtil = require('../api/util/project')
const contributorUtil = require('../api/util/contributors')

const main = async () => {
  const userId = 5 // this user worked well for my local testing env
  const projects = await projectUtil.findAll()

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]

    const contributors = await contributorUtil.createContributorsForProject(project, userId)
    console.log('created contributors', contributors.map(contributor => contributor.get('remoteId')))
  }

  process.exit()
}

main()
