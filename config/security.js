module.exports.security = {
  cors: {
    allRoutes: true,
    allowOrigins: [
      'http://localhost:1337',
      'http://localhost:3000',
      'https://staging.mericobuild.com',
      'http://staging.mericobuild.com',
      'http://mericobuild.com',
      'https://mericobuild.com',
      'https://merico.build',
      'http://merico.build',
      'https://production.mericobuild.com',
      'http://production.mericobuild.com',
      'https://candidate.merico.build',
      'http://candidate.merico.build',
      'https://staging.merico.build',
      'http://staging.merico.build',
      'https://sandbox.merico.build',
      'http://sandbox.merico.build'
    ],
    allowCredentials: true,
    allowRequestHeaders: 'Access-Control-Allow-Headers, content-type, x-csrf-token, authorization, Access-Control-Allow-Origin, Access-Control-Allow-Methods'
  }
}
