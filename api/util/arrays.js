const emailBlacklist = ['noreply@github.com']

module.exports = {
  getDailyRank: (inputs, emails) => {
    if (!emails) {
      sails.log.error('arrays.js:getDailyRank: You must send an email')
      return
    }

    inputs = module.exports.removeBlacklistEmails(inputs)

    const devRankByDay = []
    const days = {}

    // group all days together
    inputs.forEach((input) => {
      days[input.date] === undefined ? days[input.date] = [input] : days[input.date].push(input)
    })

    // sort the records per day to get the rank by index
    for (const key in days) {
      days[key] = days[key].sort((a, b) => (a.value < b.value) ? 1 : -1)

      // Find rank in sorted array
      const index = days[key].findIndex((record) => {
        return emails.includes(record.primary_email)
      })
      const rank = index + 1

      // Desired format for front end
      devRankByDay.push({
        date: days[key][0].date,
        rank: rank
      })
    }

    return devRankByDay
  },
  // This may be able to be done faster by only getting the most recent analysis instead of getting all analysis and then filtering
  getMostRecentRank: (inputs, emails) => {
    const allDaysRank = module.exports.getDailyRank(inputs, emails)
    // get the most recent day's rank

    let mostRectentRank = 0
    const sortedRanksByDate = allDaysRank.sort((x, y) => x.date > y.date)
    if (sortedRanksByDate.length > 0 && sortedRanksByDate[0]) {
      mostRectentRank = sortedRanksByDate[0].rank
    }
    return mostRectentRank
  },
  removeBlacklistEmails: (emails) => {
    return emails.filter((email) => { return emailBlacklist.indexOf(email) < 0 })
  }
}
