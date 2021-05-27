const { expect } = require('chai')
const add = require('date-fns/add')

const {
  findIntervalForDurationInMonths,
  getStartAndEndDatesFromRequest
} = require('../../../../../api/util/reports/common')
const { intervals } = require('../../../../../api/constants/reports')

describe('common report functions', () => {
  describe('findIntervalForDurationInMonths', () => {
    it ('returns a monthly interval if duration is between 6 and 40', () => {
      expect(findIntervalForDurationInMonths(6)).to.equal(intervals.month)
      expect(findIntervalForDurationInMonths(39)).to.equal(intervals.month)
    })

    it ('returns a quarterly interval if duration is between 40 and 80', () => {
      expect(findIntervalForDurationInMonths(40)).to.equal(intervals.quarter)
      expect(findIntervalForDurationInMonths(79)).to.equal(intervals.quarter)
    })

    it ('returns a yearly interval if duration is greater than or equal to 80', () => {
      expect(findIntervalForDurationInMonths(80)).to.equal(intervals.year)
      expect(findIntervalForDurationInMonths(200)).to.equal(intervals.year)
    })

    it ('returns a daily interval if duration is less than 1 or falsy', () => {
      expect(findIntervalForDurationInMonths(0)).to.equal(intervals.day)
      expect(findIntervalForDurationInMonths(null)).to.equal(intervals.day)
      expect(findIntervalForDurationInMonths()).to.equal(intervals.day)
    })

    it ('returns a weekly interval if duration is between 1 and 6', () => {
      expect(findIntervalForDurationInMonths(1)).to.equal(intervals.week)
      expect(findIntervalForDurationInMonths(5)).to.equal(intervals.week)
    })
  })

  describe('getStartAndEndDatesFromRequest', () => {
    it ('returns a startdate of 1970, and an end date of nowish, when the date strings are invalid', () => {
      const today = new Date()

      const defaultDates1 = getStartAndEndDatesFromRequest(null, null)
      expect(defaultDates1.startDate.getFullYear()).to.equal(1970)
      expect(defaultDates1.endDate.getTime()).to.be.within(today.getTime(), Date.now())

      const defaultDates2 = getStartAndEndDatesFromRequest('this is not a date', 'this is not a date')
      expect(defaultDates2.startDate.getFullYear()).to.equal(1970)
      expect(defaultDates2.endDate.getTime()).to.be.within(today.getTime(), Date.now())
    })

    it ('returns the correct dates based on ISO strings', () => {
      const { startDate, endDate } = getStartAndEndDatesFromRequest('2019-01-01T14:48:00.000', '2020-12-31T14:48:00.000')
      expect(startDate).to.be.a('date')
      expect(endDate).to.be.a('date')
      expect(startDate.getFullYear()).to.equal(2019)
      expect(endDate.getFullYear()).to.equal(2020)
    })
  })
})
