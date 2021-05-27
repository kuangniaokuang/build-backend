const sub = require('date-fns/sub')

module.exports = {
  getMidnight: () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  },

  daysAgo (numberOfDaysAgo) {
    return sub(new Date(), {
      days: numberOfDaysAgo
    })
  }
}
