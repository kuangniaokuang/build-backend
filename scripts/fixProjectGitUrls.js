const eeQuery = require('../api/util/eeQuery')

const main = async () => {
  const query = 'SELECT * FROM "Projects" WHERE "gitUrl" NOT IN (SELECT git_url FROM projects)'
  const results = await eeQuery.execute(query)

  const projects = results[0]

  if (!projects.length) {
    console.log('No projects found')
    return
  }

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    const updateQuery = 'UPDATE projects SET git_url = ? WHERE id = ?'

    await eeQuery.execute(updateQuery, [project.gitUrl, project.eeProjectId])
  }
}

main()
