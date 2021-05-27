const parseISO = require('date-fns/parseISO')
const differenceInMonths = require('date-fns/differenceInMonths')

const { getFirstAndLastCommitsWithinDateRange } = require('../analyticsApi/reportData')
const { intervals } = require('../../constants/reports')

module.exports = {
  findIntervalForDurationInMonths (durationInMonths) {
    if (!durationInMonths || durationInMonths < 1) {
      return intervals.day
    } else if (durationInMonths < 6) {
      return intervals.week
    } else if (durationInMonths < 40) {
      return intervals.month
    } else if (durationInMonths < 80) {
      return intervals.quarter
    }

    return intervals.year
  },

  getStartAndEndDatesFromRequest (startDateStr, endDateStr) {
    let startDate = parseISO(startDateStr)
    let endDate = parseISO(endDateStr)

    if (isNaN(startDate)) {
      startDate = new Date(1970, 1, 1)
    }

    if (isNaN(endDate)) {
      endDate = new Date()
    }

    return { startDate, endDate }
  },

  async getIntervalForReport (gitUrls, emails, startDateStr, endDateStr) {
    const { startDate, endDate } = module.exports.getStartAndEndDatesFromRequest(startDateStr, endDateStr)
    const { firstCommit, lastCommit } = await getFirstAndLastCommitsWithinDateRange(
      gitUrls,
      emails,
      startDate,
      endDate
    )

    if (!firstCommit || !lastCommit) {
      return intervals.week
    }

    const commitSpanInMonths = Math.abs(differenceInMonths(firstCommit, lastCommit))

    return module.exports.findIntervalForDurationInMonths(commitSpanInMonths)
  }
}
