const ceDbConfig = require('./database.json')
const baseUrl = 'http://localhost:1337'
const frontendBaseUrl = 'http://localhost:3000'

module.exports = {
  custom: {
    frontendBaseUrl: frontendBaseUrl,
    apiBaseUrl: baseUrl,
    envDebug: 'local',
    ceDatabase: ceDbConfig.development,
    // githubAuth and gitlabAuth make OAuth work
    githubAuth: {
      clientId: '***',
      clientSecret: '***',
      callbackUrl: `${baseUrl}/auth/github/callback`
    },
    gitlabAuth: {
      clientId: '***',
      clientSecret: '***',
      callbackUrl: `${baseUrl}/auth/gitlab/callback`
    },
    // Minio config for storage of analysis protobuf files
    minio: {
      endPoint: '***.**.***.***',
      port: 30000,
      useSSL: false,
      accessKey: '***',
      secretKey: '***',
      bucketAE: '***'
    },
    // GRPC configs for executing code on the Analytics Engine
    // Contact Merico to get the IP address
    GRPC_NO_SSL: true,
    CA_GRPC_SERVER: '***.**.***.***:*****',
    // AWS SES configs for sending notification emails
    AWS_SES_REGION: '***',
    AWS_SES_ACCESS_KEY_ID: '***',
    AWS_SES_SECRET_ACCESS_KEY: '***',
    // The key used to encrypt data
    ENCRYPTION_KEY: '***',
    // Rabbit MQ for messaging with the Analytics Engine
    // Contact Merico to get the address
    RABBIT_MQ_URL: 'amqp://rabbitmq:***@***/rabbitmq',
    // AWS S3 configs for handling badge images
    AWS_S3_REGION: '***',
    AWS_S3_ACCESS_KEY_ID: '***',
    AWS_S3_SECRET_ACCESS_KEY: '***',
    AWS_S3_PUBLIC_BUCKET: '***',
    ENV_STRING: 'local-example',
    // Mixpanel config if you want to track eventss
    mixpanel: {
      enabled: false,
      apiKey: '***'
    },
    // staff emails and domains are to be excluded from mixpanel events
    STAFF_EMAILS: [],
    STAFF_EMAIL_DOMAINS: []
  }
}
