/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  // Test
  'get /ping': 'TestController.ping',
  'get /': 'TestController.healthCheck',
  'get /version': 'TestController.version',

  // User
  'get /me': 'UserController.me',
  'get /syncGithub': 'UserController.syncGithub',
  'get /syncGitlab': 'UserController.syncGitlab',
  'post /account': 'UserController.update',
  'delete /account': 'UserController.delete',
  'post /user/setIsOnboarded': 'UserController.setIsOnboarded',
  'post /user/setIsPublic': 'UserController.setIsPublic',

  // Public Profile
  'get /publicProfile/:id': 'PublicProfileController.getUserProfile',
  'get /projects/public-profiles/search': 'PublicProfileController.publicProfileSearch',

  // Projects
  'get /projectCount': 'ProjectController.projectCount',
  'get /projects': 'ProjectController.projects',
  'post /project': 'ProjectController.create',
  'post /projects': 'ProjectController.createMany',
  'delete /project': 'ProjectController.delete',
  'delete /projects': 'ProjectController.deleteMany',
  'post /setFavoriteRepos': 'ProjectController.setFavoriteRepos',
  'get /getCeRepos': 'ProjectController.getCeRepos',
  'get /projects/allDevMetrics': 'ProjectController.allDevMetricsForProject',
  'get /projects/public-profile': 'ProjectController.publicProfile',

  // My Projects
  'get /my-projects': 'MyProjectsController.getAll',

  // Badges
  'get /badges': 'BadgeController.badges',
  'get /badge/:id': 'BadgeController.badge',

  // Notifications
  'get /notifications': 'NotificationController.notifications',
  'post /notifications/read/:id': 'NotificationController.read',

  // Repos
  'get /repos/github': 'RepoController.listGithub',
  'get /repos/gitlab': 'RepoController.listGitlab',
  'get /repo/analyze': 'AnalysisController.analyzeRepository',
  'get /repo/analyzeByUrl': 'AnalysisController.analyzeRepository',

  // Quality
  'get /reportMetrics': 'QualityController.reportMetrics',
  'get /multipleReportMetrics': 'QualityController.multipleReportMetrics',

  // Impact
  'get /impactOverview': 'ImpactController.impactOverview',
  'get /multipleImpactOverview': 'ImpactController.multipleImpactOverview',
  'get /impactCommits': 'ImpactController.impactCommits',
  'get /impactRanking': 'ImpactController.impactRanking',

  // Productivity
  'get /productivityOverview': 'ProductivityController.productivityOverview',
  'get /multipleProductivityOverview': 'ProductivityController.multipleProductivityOverview',
  'get /productivityVelocity': 'ProductivityController.productivityVelocity',
  'get /productivityRanking': 'ProductivityController.productivityRanking',

  // Dashboard
  'get /topSkills': 'DashboardController.topSkills',
  'get /topAchievements': 'DashboardController.topAchievements',
  'get /topContributions': 'DashboardController.topContributions',
  'get /devValueByTeam': 'DashboardController.devValueByTeam',
  'get /devValueByRanking': 'DashboardController.devValueByRanking',
  'GET /dashboard/overview': 'DashboardController.overview',

  // Auth
  'get /auth/github': 'AuthController.authGithub',
  'get /auth/github/callback': 'AuthController.authGithubCallback',
  'get /auth/gitlab': 'AuthController.authGitlab',
  'get /auth/github/e2e/getTokenByEmail': 'AuthController.getTokenByEmail',
  'get /auth/gitlab/callback': 'AuthController.authGitlabCallback',
  'get /auth/gitlab/callback/test': 'AuthController.processGithubAuthSecure',

  // Email Controller
  'post /email/send': 'EmailController.send',
  'post /contact': 'EmailController.send',
  'post /sendVerificationEmail': 'EmailController.sendVerificationEmail',
  'get /verifyEmailVerificationCode': 'EmailController.verifyEmailVerificationCode',

  // Contributors
  'GET /contributors/profile': 'ContributorsController.profile',
  'GET /contributors/top-repositories': 'ContributorsController.topRepositories',
  'GET /contributors/progress': 'ContributorsController.progress',
  'GET /contributors/badges': 'ContributorsController.badges',
  'POST /contributors/invite': 'ContributorsController.invite',

  // Pull requests
  'GET /pull-requests/stats': 'PullRequestController.getPrStats'
}
