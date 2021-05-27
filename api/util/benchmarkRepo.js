const { BenchmarkRepo } = require('../../db/models')

module.exports = {
  async updateBenchmarkRepoOnAnalysisComplete (message) {
    const {
      analysisStatus,
      analysisId,
      projectId: eeProjectId
    } = message

    const update = await BenchmarkRepo.update(
      {
        analysisStatus,
        analysisId
      },
      {
        where: {
          eeProjectId
        }
      }
    )

    if (!update[0]) {
      console.info('Failed to update benchmark repo for message:', message)
    }
  }
}
