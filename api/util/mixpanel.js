const Mixpanel = require('mixpanel')
// @todo Environment level configurations for Mixpanel API Key
const config = require('../../config/env/resolveConfig').custom
const mixpanel = Mixpanel.init(config.mixpanel.apiKey, { debug: false })

const { STAFF_EMAILS: Staff, STAFF_EMAIL_DOMAINS: StaffDomains } = config

// @todo (feat) expand the Event Namespaces, add default "data" properties that can merge with track() data
const RepositoryEvents = {
  // REPOSITORIES
  ANALYSIS_FAILED: { name: 'Analysis Failed' },
  ANALYSIS_COMPLETED: { name: 'Analysis Successfully Completed' }
}

const BadgeEvents = {
  // BADGES
  BADGE_GENERATED: { name: 'Badge Generated' },
  BADGE_REGENERATED: { name: 'Badge RE-Generated' }
}

const isStaffMember = (email) => {
  return Staff.some((staffEmail) => email === staffEmail)
}

const hasStaffDomain = (email) => {
  return StaffDomains.some((staffDomain) => email.includes(staffDomain))
}

const MP = {
  track: (event, data = {}, prodEnvironment = 'production') => {
    if (config.mixpanel.enabled && event) {
      try {
        const distinctId = data.distinct_id
        if (process.env.NODE_ENV === prodEnvironment &&
          (isStaffMember(distinctId) ||
          hasStaffDomain(distinctId))) {
          // DO NOT TRACK Merico Staff in Production
          // mixpanel.track(event.name, data)
        } else {
          mixpanel.track(event.name, data)
        }
      } catch (error) {
        console.error('Mixpanel Tracking Error: Bad Event Data or Mixpanel API Not available?', error)
      }
    }
  },
  identify: (distinctId = null) => {
    // NOT available for server-side, distinct_id must be sent with track
    // Reference: https://github.com/mixpanel/mixpanel-node
    // if (config.mixpanel.enabled && email) {
    //   mixpanel.identify(email);
    // }
    console.log('Mixpanel Identify ID: ', distinctId)
  },
  trackAnalysisComplete: (data) => {
    const { user, analysisId, reportId, gitUrl, analysisStatus } = data
    MP.track(RepositoryEvents.ANALYSIS_COMPLETED, {
      distinct_id: user.primaryEmail,
      'Analysis ID': analysisId,
      'Report ID': reportId,
      'Git URL': gitUrl,
      'Analysis Status': analysisStatus,
      'Completion Date': new Date()
    })
  },
  trackAnalysisFailed: (data) => {
    const { user, analysisId, gitUrl, analysisStatus } = data
    MP.track(RepositoryEvents.ANALYSIS_FAILED, {
      distinct_id: user.primaryEmail,
      'Analysis ID': analysisId,
      'Git URL': gitUrl,
      'Analysis Status': analysisStatus || 'FAILURE',
      'Failure Date': new Date()
    })
  },
  trackBadgeGenerated: (data) => {
    const { user, badge } = data
    MP.track(BadgeEvents.BADGE_GENERATED, {
      distinct_id: user.primaryEmail,
      'Badge Name': badge.name,
      Type: badge.type,
      Grade: badge.grade,
      Description: badge.description,
      'Image URL': badge.imageUrl,
      'Earned Date': new Date(),
      Project: badge.project
    })
  }
}

module.exports = {
  config,
  MP,
  mixpanel,
  RepositoryEvents,
  BadgeEvents,
  isStaffMember,
  hasStaffDomain
}
