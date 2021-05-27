const gitlab = require('../api/util/github')

const user = {
  githubApiUrl: 'https://api.github.com/users/joncodo',
  githubAccessToken: process.env.TOKEN
}

const main = async () => {
  try {
    const results = await gitlab.getProjectListFromGithub(user, 10, 1)
    console.log('INFO: Script Done')
    console.log(results.map(x => x.full_name))
  } catch (error) {
    console.log(error)
  }
}

main()
