const badgeUtil = require('../api/util/badges')

// let eeProjectId = '7f7bb1d7-1dd6-4c8d-ab1c-d08694c3ed09'
const paulsEeProjectId = '8f73e7ba-9f3b-480e-92f0-7524ae70b8ad'

const main = async () => {
  await badgeUtil.analysisComplete(paulsEeProjectId)
}

main()
