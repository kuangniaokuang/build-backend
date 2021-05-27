// This is run from a different directory within the docker container on staging and prod
// The code runs once per day and analyzes all the repos again
// /usr/local/bin/node /usr/src/app/analyzeCron.js
// If you can run this file locally, it will work in docker

// GRPC_NO_SSL=true CA_GRPC_SERVER=44.234.47.248:9461 NODE_ENV=local node analyzeCron.js

// process.env.GRPC_NO_SSL=true
// process.env.CA_GRPC_SERVER='44.234.47.248:9461'

const ProjectUtil = require('./api/util/project')
const CodeAnalysis = require('./api/util/codeAnalysis')
// const codeAnalytics = require('./api/copiedFromEE/caGrpcServices').codeAnalytics;

// Get all repos
const main = async () => {
  console.log('**************************************************')
  console.log('********** >>> running analyze.cron <<< **********')
  console.log('**************************************************')
  try {
    const projects = await ProjectUtil.findAll()
    projects.forEach(project => {
      console.log('Analyzing repo >>> id, gitUrl, eeProjectId >>>', project.id, project.gitUrl, project.eeProjectId)
      CodeAnalysis.analyze(project.gitUrl, {})
    })
  } catch (error) {
    console.log('ERROR: djd98&IJD(:', error)
  }
}

main()
// Run analysis on them at midnight every night
