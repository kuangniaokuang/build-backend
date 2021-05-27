module.exports = {
  formatBasicProjectForApiResponse (project) {
    return {
      createdAt: project.createdAt,
      id: project.id,
      url: project.url,
      gitUrl: project.gitUrl,
      name: project.name,
      nextProcessing: project.nextProcessing,
      latestCommitHash: project.latestCommitHash,
      latestCommitTitle: project.latestCommitTitle,
      latestCommitMessage: project.latestCommitMessage
    }
  },

  formatGithubRepoForApiResponse (repo, githubUsername) {
    return module.exports.formatRepoForApiResponse(
      repo.url,
      repo.owner.login === githubUsername ? repo.name : repo.full_name,
      repo.git_url,
      repo.updated_at,
      repo.language
    )
  },

  formatGitlabRepoForApiResponse (repo, githubUsername) {
    return module.exports.formatRepoForApiResponse(
      repo.web_url,
      repo.name,
      repo.http_url_to_repo,
      repo.last_activity_at,
      ''
    )
  },

  formatRepoForApiResponse (url, name, gitUrl, lastUpdated, language) {
    return {
      url,
      name,
      gitUrl,
      lastUpdated,
      language,
      alreadyAdded: false
    }
  },

  formatBadgeForApiResponse ({ dataValues: badge }) {
    const { User, BadgeType, Project } = badge

    const formattedBadge = {
      id: badge.id,
      name: badge.name,
      type: badge.type,
      grade: badge.grade,
      description: badge.description,
      rankNumerator: badge.rankNumerator,
      rankDenominator: badge.rankDenominator,
      imageUrl: badge.imageUrl,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
      BadgeType: {
        title: BadgeType.get('title'),
        criteria: BadgeType.get('criteria'),
        icon: BadgeType.get('icon')
      },
      User: {
        displayName: User.get('displayName')
      }
    }

    if (Project) {
      formattedBadge.Project = {
        name: Project.get('name'),
        gitUrl: Project.get('gitUrl')
      }
    }

    return formattedBadge
  },

  formatNotificationForApiResponse (notificationInstance) {
    const notification = notificationInstance.dataValues

    return {
      id: notification.id,
      user: notification.user,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      url: notification.url,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    }
  },

  formatTopContributionsForApiResponse (contribution) {
    return {
      dev_value: contribution.dev_value,
      id: contribution.id,
      project_name: contribution.project_name
    }
  },

  formatDevValueByTeamForApiResponse (projectName, projectData) {
    return {
      repository: {
        name: projectName
      },
      dataSet: projectData.map(project => {
        return {
          date: project.date,
          project_name: project.project_name,
          git_url: project.git_url,
          dev_value: project.dev_value,
          count: project.count,
          loc: project.loc,
          eloc: project.eloc
        }
      })
    }
  },

  formatDevValueByRankingForApiResponse (data) {
    return {
      gitUrl: data.gitUrl,
      name: data.name,
      position: data.position,
      contributors: data.contributors
    }
  },

  formatUserObjectForApiResponse (user) {
    return {
      id: user.id,
      photo: user.photo,
      displayName: user.displayName,
      gitlabUsername: user.gitlabUsername,
      githubUsername: user.githubUsername,
      githubApiUrl: user.githubApiUrl,
      website: user.website,
      isOnboarded: user.isOnboarded,
      isPublic: user.isPublic,
      primaryEmail: user.primaryEmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emails: user.emails,
      UserEmails: user.UserEmails
        ? user.UserEmails.map(userEmail => {
            return {
              id: userEmail.get('id'),
              email: userEmail.get('email'),
              isVerified: userEmail.get('isVerified'),
              createdAt: userEmail.get('createdAt'),
              updatedAt: userEmail.get('updatedAt')
            }
          })
        : []
    }
  },

  formatFullProjectForApiResponse (repo) {
    return {
      id: repo.id,
      url: repo.url,
      gitUrl: repo.gitUrl,
      name: repo.name,
      nextProcessing: repo.nextProcessing,
      incomingReportId: repo.incomingReportId,
      latestReportId: repo.latestReportId,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      isFavorite: repo.isFavorite,
      lastSyncTime: repo.eeLastSyncTime,
      projectId: repo.eeProjectId,
      status: repo.eeStatus,
      errorMessage: repo.error_message,
      commitTimestamp: repo.commit_timestamp,
      commitTitle: repo.commit_title,
      commitMessage: repo.commit_message,
      latestCommitHash: repo.latest_commit_hash,
      progress: repo.progress,
      userCommitCount: repo.user_commit_count
    }
  },

  formatRepoForPublicProfileApiResponse (repo) {
    const basicRepo = module.exports.formatFullProjectForApiResponse(repo)

    return {
      ...basicRepo,
      gitUrl: repo.gitUrl,
      position: repo.position,
      contributors: repo.contributors,
      quality: repo.quality,
      dev_value: repo.dev_value,
      dev_equivalent: repo.dev_equivalent
    }
  },

  formatExtendedUserForApiResponse (extendedUser) {
    const { user, repos } = extendedUser

    return {
      user: module.exports.formatUserObjectForApiResponse(user),
      repos: repos
        ? repos.map(module.exports.formatFullProjectForApiResponse)
        : []
    }
  },

  formatFavoriteResults (results) {
    const successes = []
    const fails = []

    results.forEach((result) => {
      result.success ? successes.push(result.gitUrl) : fails.push(result.gitUrl)
    })

    return { successes, fails }
  },

  formatErrorResponse (message, meta) {
    return {
      error: {
        message,
        meta
      }
    }
  },

  formatDevRankingMetricsForProject (metrics) {
    const impact = (metrics.dev_value * 100)

    return {
      displayName: metrics.display_name,
      emails: metrics.emails,
      userId: isNaN(metrics.user_id) ? null : parseInt(metrics.user_id),
      gitUsername: metrics.username,
      photo: metrics.photo_url,
      productivity: metrics.eloc,
      productivityRank: parseInt(metrics.eloc_rank),
      merges: parseInt(metrics.merges),
      impact: Math.min(impact, 100),
      impactRank: parseInt(metrics.impact_rank),
      mergeRank: parseInt(metrics.merge_rank)
    }
  }
}
