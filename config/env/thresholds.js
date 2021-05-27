const { grades: badgeGrades } = require('../../api/constants/badges')
const { JAVASCRIPT, JAVA, PYTHON, CPP, C, GO, TYPESCRIPT, RUBY } = require('../../api/constants/languages')

const defaultSettings = {
  badges: {
    testOfTime: {
      minEloc: 500
    },
    mineSweeper: {
      minEloc: 500
    },
    topContributor: {
      minContributors: 3
    },
    trailblazer: {
      minContributors: 3
    },
    multilingual: {
      minBadges: 3
    },
    contribution: {
      minEloc: 500,
      minContributors: 2
    },
    linguist: {
      [JAVASCRIPT]: {
        [badgeGrades.gold]: 6186,
        [badgeGrades.silver]: 1159,
        [badgeGrades.bronze]: 186,
        [badgeGrades.iron]: 16
      },
      [JAVA]: {
        [badgeGrades.gold]: 11640,
        [badgeGrades.silver]: 4176,
        [badgeGrades.bronze]: 587,
        [badgeGrades.iron]: 47
      },
      [PYTHON]: {
        [badgeGrades.gold]: 3679,
        [badgeGrades.silver]: 870,
        [badgeGrades.bronze]: 136,
        [badgeGrades.iron]: 12
      },
      [CPP]: {
        [badgeGrades.gold]: 7325,
        [badgeGrades.silver]: 1372,
        [badgeGrades.bronze]: 159,
        [badgeGrades.iron]: 12
      },
      [C]: {
        [badgeGrades.gold]: 9470,
        [badgeGrades.silver]: 1484,
        [badgeGrades.bronze]: 163,
        [badgeGrades.iron]: 12
      },
      [GO]: {
        [badgeGrades.gold]: 6191,
        [badgeGrades.silver]: 1086,
        [badgeGrades.bronze]: 197,
        [badgeGrades.iron]: 19
      },
      [TYPESCRIPT]: {
        [badgeGrades.gold]: 3906,
        [badgeGrades.silver]: 952,
        [badgeGrades.bronze]: 176,
        [badgeGrades.iron]: 15
      },
      [RUBY]: {
        [badgeGrades.gold]: 4563,
        [badgeGrades.silver]: 1024,
        [badgeGrades.bronze]: 153,
        [badgeGrades.iron]: 14
      }
    }
  },
  emailNotifications: {
    analysisComplete: {
      minDuration: 30
    }
  },
  analysis: {
    commitLimit: 2500
  }
}

const developmentLinguistThresholds = {
  [badgeGrades.gold]: 90,
  [badgeGrades.silver]: 75,
  [badgeGrades.bronze]: 50,
  [badgeGrades.iron]: 20
}

const developmentSettings = {
  ...defaultSettings,
  badges: {
    ...defaultSettings.badges,
    topContributor: {
      minContributors: 2
    },
    trailblazer: {
      minContributors: 2
    },
    testOfTime: {
      minEloc: 100
    },
    mineSweeper: {
      minEloc: 50
    },
    multilingual: {
      minBadges: 3
    },
    contribution: {
      minEloc: 50,
      minContributors: 2
    },
    linguist: {
      [JAVASCRIPT]: developmentLinguistThresholds,
      [JAVA]: developmentLinguistThresholds,
      [PYTHON]: developmentLinguistThresholds,
      [CPP]: developmentLinguistThresholds,
      [C]: developmentLinguistThresholds,
      [GO]: developmentLinguistThresholds,
      [TYPESCRIPT]: developmentLinguistThresholds,
      [RUBY]: developmentLinguistThresholds
    }
  },
  emailNotifications: {
    analysisComplete: {
      minDuration: 2
    }
  },
  analysis: {
    commitLimit: 2500
  }
}

module.exports = (envName) => {
  switch (envName) {
    case 'local':
      return developmentSettings
    case 'staging':
      return developmentSettings
    case 'localTesting':
      return developmentSettings
    case 'testing':
      return developmentSettings
    default:
      return defaultSettings
  }
}
