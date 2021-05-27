module.exports = {
  percentage: (num1, num2) => {
    try {
      return Math.round(parseInt(num1) / parseInt(num2) * 100)
    } catch (error) {
      sails.log.error(error)
      return 0
    }
  }
}
