const reanalyzeConfig = require('../../config/constants/reanalyze')
const projectStatuses = require('../constants/projectStatuses')
const time = require('../util/time')

module.exports = {
  getUsersInProjectThatHaveCodeContributions: (gitUrl) => {
    const sql = `select project_commit.author_email from project_commit

    join "Projects" on project_commit.project_id = "Projects"."eeProjectId"
    join report_commit_value on "Projects"."latestReportId" = report_commit_value.report_id
      AND project_commit.hash=report_commit_value.hash

    where "Projects"."gitUrl" = ?
    group by project_commit.author_email;`
    const values = [gitUrl]
    return {
      sql,
      values
    }
  },
  getUserCommitsForProject: (gitUrl, emails, startTime, endTime, limit, offset, sortColumn = 'commit_timestamp', sortDirection = 'DESC', countOnly, search) => {
    let sql = ''
    if (countOnly) {
      sql += 'SELECT count(commit_timestamp) '
    } else {
      sql += 'SELECT project_commit.*, report_commit_value.*, report_commit_value.dev_value*100 as dev_value '
    }
    sql += `FROM public.project_commit
    JOIN "Projects" on project_commit.project_id = "Projects"."eeProjectId"
    JOIN report_commit_value on project_commit.hash = report_commit_value.hash
    WHERE report_commit_value.report_id = "Projects"."latestReportId"
    AND "Projects"."gitUrl" = ?
    AND author_email = ANY(ARRAY[?])
    AND project_commit.commit_timestamp BETWEEN ? AND ? `

    if (search && search !== '') {
      search = search.toLowerCase()
      sql += `AND (LOWER(project_commit.title) LIKE '%${search}%' OR LOWER(project_commit.message) LIKE '%${search}%' OR project_commit.hash LIKE '%${search}%')`
    }

    if (!countOnly) {
      sql += `ORDER BY ${sortColumn} ${sortDirection} `
      sql += 'LIMIT ? OFFSET ? '
    }

    const values = [gitUrl, emails, startTime, endTime, limit, offset]

    return {
      sql,
      values
    }
  },
  createProjectReportState: (projectId, reportId) => {
    // TODO: maybe set this as underway every time a new one is created?
    const sql = `INSERT INTO public.project_report_state(
      project_id, report_id, analysis_type, status)
      VALUES (?, ?, 'analyze', '${projectStatuses.underway}');`

    const values = [projectId, reportId]

    return {
      sql,
      values
    }
  },
  findProjectReportState: (projectId, reportId) => {
    const sql = 'SELECT * FROM public.project_report_state WHERE project_id = ? AND report_id = ?;'

    const values = [projectId, reportId]

    return {
      sql,
      values
    }
  },
  updateProjectReportStateWithAnalysisId: (reportId, analysisId) => {
    const sql = 'UPDATE public.project_report_state SET analysis_id = ? WHERE report_id = ?;'

    const values = [analysisId, reportId]

    return {
      sql,
      values
    }
  },
  updateProjectReportStateToFinished: (reportId, analysisId) => {
    const sql = `UPDATE public.project_report_state SET status = '${projectStatuses.ready}' where report_id = ? AND analysis_id = ?;`

    const values = [reportId, analysisId]

    return {
      sql,
      values
    }
  },
  findProjectReportStateByAnalysisId: (analysisId) => {
    const sql = 'SELECT * FROM public.project_report_state WHERE analysis_id = ?;'

    const values = [analysisId]

    return {
      sql,
      values
    }
  },
  updateProjectReportProgress: (reportId, progress) => {
    const sql = 'UPDATE public.project_report_state SET progress = ? where report_id = ?;'

    const values = [progress, reportId]

    return {
      sql,
      values
    }
  },
  getAnalysisDuration: (analysisId) => {
    const sql = 'SELECT FLOOR(EXTRACT(epoch FROM (update_time - create_time))/60) as duration FROM project_report_state WHERE analysis_id = ?'

    const values = [analysisId]

    return {
      sql,
      values
    }
  },

  getProjectDetailsForMultipleProjectIds: (eeProjectIds, userEmails) => {
    const sql = `
      WITH user_commit_counts AS (
        SELECT
          project_id,
          COUNT(*) as user_commit_count
          FROM project_commit
          WHERE project_id = ANY(ARRAY[?]::uuid[]) AND author_email = ANY(ARRAY[?])
          GROUP BY project_id
      )

      SELECT
        "Projects".id,
        "Projects"."eeProjectId",
        report.commit_aspect_hash as latest_commit_hash,
        project_commit.commit_timestamp,
        project_commit.title as commit_title,
        project_commit.message as commit_message,
        project_report_state.progress,
        project_report_state.error_message,
        COALESCE(user_commit_count, 0) as user_commit_count
      FROM "Projects"
        LEFT JOIN user_commit_counts ON "Projects"."eeProjectId" = user_commit_counts.project_id
        LEFT JOIN report on report.project_id = "Projects"."eeProjectId"
        LEFT JOIN project_commit on report.commit_aspect_hash = project_commit.hash
        LEFT JOIN project_report_state ON project_report_state.report_id = "Projects"."incomingReportId"
      WHERE "Projects"."eeProjectId" = ANY(ARRAY[?]::uuid[])
    `

    const values = [eeProjectIds, userEmails, eeProjectIds]

    return {
      sql,
      values
    }
  },

  topSkills: (emails) => {
    const sql = `
    SELECT
      t.*,
      tag.name_cn tag_name_cn,
      tag.name tag_name
    FROM (
      SELECT
        tag_evidence.tag_id,
        sum(cfte.times) AS num_uses,
        c.author_email
      FROM
        report_commit_file_tag_evidence AS cfte
        INNER JOIN projects ON projects.latest_report_id = cfte.report_id
        LEFT JOIN project_commit AS c ON c.project_id = projects.id
        AND c.hash = cfte.hash
        INNER JOIN (
          SELECT * FROM report_config_tag_evidence_system_tag
          UNION SELECT * FROM report_config_tag_evidence_user_tag
        ) AS tag_evidence ON tag_evidence.evidence_id = cfte.tag_evidence_id
      WHERE
        c.author_email = ANY(ARRAY[?])
      GROUP BY
        tag_evidence.tag_id, c.author_email
    ) AS t
    LEFT JOIN report_config_tag AS tag ON tag.id = t.tag_id
    WHERE tag.name NOT IN ('Logging','Debugging Tools')
    ORDER BY t.num_uses DESC
    `
    const values = [emails]

    return {
      sql,
      values
    }
  },
  topContributions: (emails, projectIds) => {
    const sql = `
      SELECT
        SUM(report_commit_value.dev_value) as dev_value, "Projects"."eeProjectId" as id, "Projects".name as project_name
      FROM "Projects"
        INNER JOIN report ON report.id = "Projects"."latestReportId"
        LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
        INNER JOIN report_commit_value ON commit.hash = report_commit_value.hash AND
          report.id = report_commit_value.report_id
      WHERE commit.author_email = ANY(ARRAY[?]) AND "Projects"."eeProjectId" = ANY(ARRAY[?]::uuid[])
      GROUP BY "Projects"."eeProjectId", "Projects"."name"
      ORDER BY dev_value DESC
    `

    const values = [emails, projectIds]

    return {
      sql,
      values
    }
  },

  getTrailblazerBadgesData: (projectId, usersInProjectArray) => {
    // This gets the users in a repo by project commits
    // It ranks the users from earliers committer to latest committer
    // usersInProjectArray = all the CE users that have added this project to the CE DB

    const sql = `
      WITH full_results AS (
        WITH summary AS (
              SELECT p.author_email,
                    p.author_timestamp,
                    p.project_id,
                    proj.git_url,
                    proj.project_name,
                    ROW_NUMBER() OVER(PARTITION BY p.author_email, p.project_id
                                          ORDER BY p.author_timestamp asc) AS rk
              FROM public.project_commit p
              JOIN public.projects as proj ON proj.id = p.project_id)

          SELECT s.author_email,
            s.author_timestamp,
            s.project_id,
            s.git_url,
            s.project_name,
            (ROW_NUMBER () OVER (ORDER BY s.author_timestamp)) as ranking,
      (
        Select count(summary.author_email) from summary
          WHERE summary.rk = 1
                AND summary.project_id = (?::uuid)
                AND summary.author_email NOT LIKE '%noreply.github.com%') as totalDevelopers

          FROM summary s

          WHERE s.rk = 1
            AND s.project_id = (?::uuid)
            AND s.author_email NOT LIKE '%noreply.github.com%'

          order by s.author_timestamp ASC

      )  SELECT * FROM full_results WHERE author_email =  ANY(ARRAY[?])
    `

    const values = [projectId, projectId, usersInProjectArray]

    return {
      sql,
      values
    }
  },

  getMyReposDevValueDevEqQuality: (user) => {
    const sql = `
      SELECT
      AVG((
        report_metric_distinct.modularity
        + report_metric_distinct.code_reusability * 100
        + report_metric_distinct.doc_coverage +
        report_metric_distinct.static_test_coverage *100
      )/4) as quality,
      SUM(report_commit_value.dev_value) as dev_value, SUM(report_commit_value.dev_equivalent) as dev_equivalent, public."Projects"."name", public."Projects"."gitUrl"

      FROM public."Projects"

      JOIN public."UserProjects" on public."UserProjects"."ProjectId" = public."Projects".id
      JOIN report ON report.id = "Projects"."latestReportId"
      JOIN public."UserEmails" ON public."UserEmails"."UserId" = public."UserProjects"."UserId"
      JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId" AND commit.author_email = public."UserEmails"."email"
      JOIN report_commit_value ON commit.hash = report_commit_value.hash AND report.id = report_commit_value.report_id
      JOIN (SELECT DISTINCT ON (report_id) * FROM report_metric) report_metric_distinct ON report_metric_distinct.report_id = "Projects"."latestReportId"

      where public."UserProjects"."UserId" = ?
      Group By public."Projects"."name", public."Projects"."gitUrl"
    `
    const userId = user.id || user.dataValues.id
    const values = [userId]

    return {
      sql,
      values
    }
  },
  nextProjectToAnalyze: () => {
    const sql = `
      SELECT
        *
      FROM
        public."Projects"
      JOIN
        report ON report.id = "Projects"."latestReportId"
      WHERE
        report.create_time < ? AND public."Projects"."eeStatus" = 'READY'
      ORDER BY
        public."Projects".priority DESC
      LIMIT 1
    `
    const lastWeek = time.daysAgo(reanalyzeConfig.staleDays)
    const values = [lastWeek]

    return {
      sql,
      values
    }
  },
  activeUsersForProject: (project) => {
    const sql = `
      SELECT
        public."UserProjects"."UserId", public."LoginAttempts"."createdAt"
      FROM
        public."UserProjects"
      JOIN
        public."LoginAttempts" ON public."LoginAttempts"."UserId" = public."UserProjects"."UserId"
      WHERE
        public."UserProjects"."ProjectId" = ? AND public."LoginAttempts"."createdAt" > ?
      GROUP BY
        public."UserProjects"."UserId", public."LoginAttempts"."createdAt"
    `
    const lastWeek = time.daysAgo(reanalyzeConfig.staleDays)
    const projectId = project.id || project.dataValues.id
    const values = [projectId, lastWeek]

    return {
      sql,
      values
    }
  },
  getProjectCommitsCount: (project) => {
    const sql = `
      SELECT
        count(project_id)
      FROM
        project_commit
      WHERE
        project_commit.project_id = ?
    `

    const values = [project.eeProjectId || project.id]

    return {
      sql,
      values
    }
  },

  getNonUserCommits: (eeProjectId) => {
    const sql = `
      SELECT DISTINCT ON (author_email)
      *
      FROM project_commit
      WHERE project_id = ?
        AND author_email NOT IN (
          SELECT email FROM contributors
        )
        AND author_email NOT IN (
          SELECT email FROM "UserEmails" WHERE "isVerified" = true
        )
    `

    const values = [eeProjectId]

    return { sql, values }
  }
}
