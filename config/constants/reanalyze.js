module.exports = {
  aeLoadThreshold: 0.7,
  aePendingJobsThreshold: 3,
  staleDays: 7,
  extraStaleTime: (24 * 30),
  priority: {
    commits: 1,
    loggedInThisWeek: 400,
    multipleUsers: 500
  },
  cronIntervalInSeconds: 60
}
