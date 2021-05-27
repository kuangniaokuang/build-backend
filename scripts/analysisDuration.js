const { getAnalysisDuration } = require('../api/util/codeAnalysis')

const analysisId = '003bb7fc-5918-4e8f-abd7-f82ebc6dde75'

const main = async () => {
  const duration = await getAnalysisDuration(analysisId)
  console.log('paul >>> duration', duration)
}

main()
