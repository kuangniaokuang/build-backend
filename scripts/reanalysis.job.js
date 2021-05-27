const reanalysis = require('../api/util/reanalysis')

const main = async () => {
  console.log('INFO: Running cron job: reanalysis.job.js')
  console.log('NOTE: You must be on VPN to run this locally')
  try {
    await reanalysis.reanalyzeNextMostImportantProject()
  } catch (error) {
    console.log(error)
  }

  process.exit()
}

main()
