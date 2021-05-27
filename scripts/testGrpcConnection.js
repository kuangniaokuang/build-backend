const reanalysis = require('../api/util/reanalysis')

const main = async () => {
  const result = await reanalysis.aeHasCapacityToAnalyze()
  console.log('INFO >>> result', result)
}

main()
