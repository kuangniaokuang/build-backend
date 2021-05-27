const { isArray, groupBy, has } = require('lodash')

const eeQuery = require('../eeQuery')
const { metrics, seriesInterval, intervals } = require('../../constants/reports')

module.exports = {
  async getFirstAndLastCommitsWithinDateRange (gitUrls, emails, startDate, endDate) {
    let values = [gitUrls]

    let emailsSql = ''
    if (emails && emails.length) {
      emailsSql = 'AND author_email = ANY(ARRAY[?])'
      values.push(emails)
    }

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `
      SELECT
        MIN(commit_timestamp) as first_commit,
        MAX(commit_timestamp) as last_commit
      FROM project_commits_with_analysis
      WHERE git_url = ANY(ARRAY[?])
        ${emailsSql}
        ${dateRangeSql}
    `

    const commitData = await eeQuery.execute(sql, values)
    const hasResults = commitData.length > 0 && isArray(commitData[0]) && commitData[0].length

    return {
      firstCommit: hasResults ? commitData[0][0].first_commit : null,
      lastCommit: hasResults ? commitData[0][0].last_commit : null
    }
  },

  /**
   * This should be deprecated soon.
   * Once we release the new version I don't think this will be in use anymore.
   * Expiry: June 1, 2021
   */
  async getDevEqByIntervalByEmail (
    emails,
    gitUrl,
    startDate,
    endDate,
    valueColumn,
    interval
  ) {
    if (![metrics.devEquivalent, metrics.devValue].includes(valueColumn)) {
      throw Error(`queryBuilder:getDeveloperDevEqByInterval: invalid valueColumn: ${valueColumn}`)
    }

    let values = [emails, gitUrl]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND COMMIT.commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `WITH grouped_vals AS (
      SELECT
        commit.author_email AS primary_email,
        sum(report_commit_value.${valueColumn}) AS VALUE,
        date_trunc('${interval}', commit.commit_timestamp) + interval '12 hours' AS truncated_date
      FROM "Projects"
        LEFT JOIN report ON report.id = "Projects"."latestReportId" AND
          report.detail_versions::JSONB @> '"report_email_metric"'::JSONB
        LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
        LEFT JOIN report_commit_value ON commit.hash = report_commit_value.hash AND
          report.id = report_commit_value.report_id
      WHERE commit.author_email = ANY(ARRAY[?])
        AND "Projects"."gitUrl" = ?
        ${dateRangeSql}
      GROUP BY primary_email, truncated_date
      ORDER BY truncated_date
    ) SELECT primary_email, COALESCE(value, 0) as value, date
    FROM generate_series(
        (SELECT min(truncated_date) FROM grouped_vals),
        (SELECT max(truncated_date) FROM grouped_vals),
        INTERVAL '${seriesInterval[interval]}') as date
    LEFT OUTER JOIN grouped_vals ON (date = truncated_date)
    GROUP BY date, primary_email, value
    ORDER BY date, primary_email ASC`

    const devEqData = await eeQuery.execute(sql, values)

    return devEqData[0]
  },

  async getDeveloperDevEqByInterval (
    emails,
    gitUrl,
    startDate,
    endDate,
    valueColumn,
    interval
  ) {
    if (![metrics.devEquivalent, metrics.devValue].includes(valueColumn)) {
      throw Error(`queryBuilder:getDeveloperDevEqByInterval: invalid valueColumn: ${valueColumn}`)
    }

    let values = [emails, gitUrl]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `
      WITH grouped_vals AS (
        SELECT
          sum(${valueColumn}) AS value,
          date_trunc('${interval}', commit_timestamp) + interval '12 hours' AS truncated_date
        FROM project_commits_with_analysis
        WHERE author_email = ANY(ARRAY[?])
          AND git_url = ?
          ${dateRangeSql}
        GROUP BY truncated_date
      )

      SELECT
        date,
        COALESCE(value, 0) as value
      FROM generate_series(
          (SELECT min(truncated_date) FROM grouped_vals),
          (SELECT max(truncated_date) FROM grouped_vals),
          INTERVAL '${seriesInterval[interval]}'
        ) as date
        LEFT OUTER JOIN grouped_vals ON (date = truncated_date)
      ORDER BY date ASC
    `

    const devEqData = await eeQuery.execute(sql, values)

    return devEqData[0]
  },

  async getRelativeDeveloperDevEqByInterval (
    emails,
    gitUrl,
    startDate,
    endDate,
    valueColumn,
    interval
  ) {
    if (![metrics.devEquivalent, metrics.devValue].includes(valueColumn)) {
      throw Error(`queryBuilder:getDeveloperDevEqByInterval: invalid valueColumn: ${valueColumn}`)
    }

    let values = [emails, gitUrl]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `
      WITH impact_data AS (
        WITH grouped_vals AS (
          SELECT
          date_trunc('${interval}', commit_timestamp) + interval '12 hours' AS truncated_date,
          (
            CASE
              WHEN author_email = ANY(ARRAY[?]) THEN 'contributor'
              ELSE 'other'
            END
          ) as contributor_id,
          sum(${valueColumn}) AS value
          FROM project_commits_with_analysis
          WHERE git_url = ?
            ${dateRangeSql}
          GROUP BY truncated_date, contributor_id
          ORDER BY truncated_date
        )

        SELECT
          date,
          cad.contributor_id,
          COALESCE(value,0) as value,
          COALESCE(total_value, 0) as total_value
        FROM
          (
            SELECT date, contribs.contributor_id
            FROM generate_series(
                (SELECT min(truncated_date) FROM grouped_vals),
                (SELECT max(truncated_date) FROM grouped_vals),
                INTERVAL '${seriesInterval[interval]}'
              ) as date
              CROSS JOIN (
                SELECT DISTINCT contributor_id
                FROM grouped_vals
              ) contribs
          ) as cad
          LEFT JOIN grouped_vals ON (cad.date = truncated_date) AND cad.contributor_id = grouped_vals.contributor_id
          LEFT JOIN (
            SELECT truncated_date as total_date, SUM(value) as total_value FROM grouped_vals GROUP BY truncated_date
          ) as total_vals ON total_vals.total_date = date
        ORDER BY date
      )

      SELECT
        date,
        (
          CASE
            WHEN total_value > 0 THEN value/total_value
            ELSE 0
          END
        ) as value
      FROM impact_data
      WHERE contributor_id = 'contributor'
      ORDER BY date ASC
    `

    const devEqData = await eeQuery.execute(sql, values)

    return devEqData[0]
  },
  async getDeveloperDevEqUngrouped (
    emails,
    gitUrl,
    startDate,
    endDate,
    valueColumn
  ) {
    if (![metrics.devEquivalent, metrics.devValue].includes(valueColumn)) {
      throw Error(`queryBuilder:getDeveloperDevEqByInterval: invalid valueColumn: ${valueColumn}`)
    }

    let values = [emails, gitUrl]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND COMMIT.commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `SELECT
        commit.author_email AS primary_email,
        sum(report_commit_value.${valueColumn}) AS VALUE
      FROM "Projects"
        LEFT JOIN report ON report.id = "Projects"."latestReportId" AND
          report.detail_versions::JSONB @> '"report_email_metric"'::JSONB
        LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
        LEFT JOIN report_commit_value ON commit.hash = report_commit_value.hash AND
          report.id = report_commit_value.report_id
      WHERE commit.author_email = ANY(ARRAY[?])
        AND "Projects"."gitUrl" = ?
        ${dateRangeSql}
    GROUP BY primary_email
    ORDER BY primary_email ASC`

    const devEqData = await eeQuery.execute(sql, values)

    return devEqData[0]
  },

  getDevValueByTeam: async (gitUrls, emails, startDate, endDate, interval) => {
    let values = [emails, gitUrls]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND COMMIT.commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    values.push(gitUrls)

    const sql = `
      WITH grouped_vals AS (

        -- Get the dev value grouped by interval and project
        SELECT "Projects".name as project_name, "Projects"."gitUrl" as git_url,
          sum(report_commit_value.dev_value) AS dev_value,
          -- To maintain backwards compatibility, I'll leave loc here, but it should be removed once the frontend catches up
          sum(report_commit_value.dev_equivalent) as loc,
          sum(report_commit_value.dev_equivalent) as eloc,
          COUNT(commit.hash),
          date_trunc('${interval}', COMMIT.commit_timestamp) + interval '12 hours' AS truncated_date
        FROM "Projects"
          INNER JOIN report ON report.id = "Projects"."latestReportId" AND
            report.detail_versions::JSONB @> '"report_email_metric"'::JSONB
          LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
          INNER JOIN report_commit_value ON commit.hash = report_commit_value.hash AND
            report.id = report_commit_value.report_id
        WHERE commit.author_email = ANY(ARRAY[?]) and "Projects"."gitUrl" = ANY(ARRAY[?])
          ${dateRangeSql}
        GROUP BY truncated_date, "Projects".name, "Projects"."gitUrl"
        ORDER BY truncated_date ASC
      )

      -- Format the data, and ensure we have sane value defaults
      SELECT to_char(TIMEZONE('UTC', date), 'YYYY-MM-DD') AS date, project_and_dates.project_name, project_and_dates.git_url,
        SUM(COALESCE(grouped_vals.dev_value, 0)) as dev_value, SUM(COALESCE("count",0)) as "count",
        SUM(COALESCE(loc, 0)) as loc, SUM(COALESCE(loc, 0)) as eloc
      FROM (

        -- Fill in the date gaps with a generate_series using the desired interval
        -- and do this wicked cross join so we have the same dates for every project
        SELECT date, pn.project_name, pn.git_url
        FROM
          generate_series(
            (SELECT min(truncated_date) FROM grouped_vals),
            (SELECT max(truncated_date) FROM grouped_vals),
            INTERVAL '${seriesInterval[interval]}'
          ) as date
          CROSS JOIN (
            SELECT DISTINCT project_name, git_url
            FROM grouped_vals
            WHERE git_url = ANY(ARRAY[?])
          ) pn
        ) as project_and_dates
        LEFT JOIN grouped_vals ON date = truncated_date AND grouped_vals.project_name = project_and_dates.project_name
      GROUP BY date, project_and_dates.project_name, project_and_dates.git_url
      ORDER BY date, project_and_dates.project_name ASC
    `

    const devEqData = await eeQuery.execute(sql, values)

    return devEqData[0]
  },

  getElocMetricsForProject: async (gitUrl, startDate, endDate, interval) => {
    const metrics = await module.exports.getElocMetricsForMultipleProjects(
      [gitUrl],
      startDate,
      endDate,
      interval
    )

    return has(metrics, gitUrl)
      ? metrics[gitUrl]
      : null
  },

  getElocMetricsForMultipleProjects: async (gitUrls, startDate, endDate, interval) => {
    let values = [gitUrls]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `
      WITH base_data AS (
        WITH commits AS (
          SELECT
            git_url,
            author_email as email,
            commit_timestamp as date,
            dev_equivalent as elocs,
            CASE
              WHEN user_emails."UserId" IS NOT NULL THEN user_emails."UserId"::text
              ELSE author_email
            END as user_id
          FROM project_commits_with_analysis
            LEFT JOIN (SELECT DISTINCT ON ("UserEmails".email) * FROM "UserEmails") as user_emails ON user_emails.email = author_email
          WHERE git_url = ANY(ARRAY[?])
          ${dateRangeSql}
        )

        SELECT
          git_url,
          date_trunc('${interval}', commits.date) + interval '12 hours' AS truncated_date,
          SUM(elocs) as elocs,
          COUNT(DISTINCT user_id) as population
        FROM commits
        GROUP BY git_url, truncated_date
      ),

      date_filler AS (
        SELECT git_url,
          series_date
        FROM generate_series(
          (SELECT min(truncated_date) FROM base_data),
          (SELECT max(truncated_date) FROM base_data),
          INTERVAL '${seriesInterval[interval]}'
        ) as series_date
        CROSS JOIN (
          SELECT DISTINCT git_url
          FROM base_data
        ) git_urls
      )

      SELECT
        date_filler.git_url,
        date_filler.series_date as date,
        COALESCE(base_data.elocs, 0) as elocs,
        COALESCE(base_data.population, 0) as population,
        SUM(COALESCE(base_data.elocs, 0)) OVER (PARTITION BY date_filler.git_url ORDER BY date_filler.series_date ASC ROWS BETWEEN unbounded preceding and current row) as cumulative_elocs
      FROM date_filler
        LEFT JOIN base_data ON date_filler.series_date = base_data.truncated_date AND base_data.git_url = date_filler.git_url
      GROUP BY date_filler.git_url, series_date, elocs, population
      ORDER BY date_filler.git_url, series_date
    `

    const myProjectsElocData = await eeQuery.execute(sql, values)

    return groupBy(myProjectsElocData[0], (metrics) => metrics.git_url)
  },

  getQualityForMultipleProjects: async (gitUrls, startDate, endDate) => {
    let values = [gitUrls]

    let whereReportDateBetween = ''
    if (startDate && endDate) {
      whereReportDateBetween = 'AND report.create_time BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const getQualityMetricsSql = `
      SELECT
        "Projects"."gitUrl" as git_url,
        AVG(distinct_report_metric.doc_coverage) as doc_coverage,
        AVG(distinct_report_metric.code_reusability * 100) as code_reusability,
        AVG(distinct_report_metric.modularity) as modularity,
        AVG(distinct_report_metric.static_test_coverage * 100) as static_test_coverage,
        AVG((modularity + code_reusability * 100 + doc_coverage + static_test_coverage * 100) / 4) as overall
      FROM "Projects"
        LEFT JOIN report ON report.project_id = "Projects"."eeProjectId"
        LEFT JOIN (SELECT DISTINCT ON (report_metric.report_id) * FROM report_metric) distinct_report_metric ON report.id = distinct_report_metric.report_id
      WHERE "Projects"."gitUrl" = ANY(ARRAY[?])
        ${whereReportDateBetween}
      GROUP BY "Projects"."gitUrl"
      ORDER BY git_url
    `

    const myProjectsQualityData = await eeQuery.execute(getQualityMetricsSql, values)

    return groupBy(myProjectsQualityData[0], (metrics) => metrics.git_url)
  },

  getQualityMetrics: async (gitUrl, startTime, endTime, interval) => {
    const sql = `
      WITH time_series_quality_data AS (
        WITH quality_data AS (

          -- There are multiple rows in 'report_metric' for the same report_id, but we really only want one
          -- This might be just an issue with the test database, but better safe than sorry, so distinct it is
          WITH distinct_reports AS (
            SELECT distinct on (rm.report_id)
              report.create_time, "Projects"."eeProjectId" as project_id,
              report.dev_equivalent, rm.*
            FROM report
              JOIN "Projects" ON "Projects"."eeProjectId" = report.project_id
              JOIN report_metric rm ON report.id = rm.report_id
            WHERE "Projects"."gitUrl" = ?
            AND report.create_time BETWEEN ? AND ?
          )

          -- Here we get the quality data itself, and group it by interval
          SELECT
            date_trunc('${interval}', create_time) + interval '12 hours' AS truncated_date,
            project_id,
            AVG((issue_major_number+issue_minor_number)/COALESCE(NULLIF(dev_equivalent,0), 1)) as issue_density,
            AVG((
              modularity
              + code_reusability * 100
              + doc_coverage +
              static_test_coverage *100
            )/4) as quality,
            AVG(doc_coverage) as doc_coverage, AVG(code_reusability) as code_reusability,
            AVG(modularity) as modularity, AVG(static_test_coverage) as static_test_coverage
          FROM distinct_reports
          GROUP BY truncated_date, project_id
        )

        -- Fill in the date gaps with a generate_series using the desired interval
        SELECT
          project_id, issue_density, quality, code_reusability, modularity,
          static_test_coverage, doc_coverage, date as create_time
        FROM generate_series(
            (SELECT min(truncated_date) FROM quality_data),
            (SELECT max(truncated_date) FROM quality_data),
            INTERVAL '${seriesInterval[interval]}') as date
          LEFT OUTER JOIN quality_data ON (date = truncated_date)
        ORDER BY create_time ASC
      )

      -- For all those dynamically generated periods, use the data from the last date point that wasn't null
      SELECT
        first_value(project_id) over (partition by grp_project_id) as project_id,
        first_value(issue_density) over (partition by grp_project_id) as issue_density,
        first_value(quality) over (partition by grp_project_id) as quality,
        first_value(code_reusability) over (partition by grp_project_id) as code_reusability,
        first_value(modularity) over (partition by grp_project_id) as modularity,
        first_value(static_test_coverage) over (partition by grp_project_id) as static_test_coverage,
        first_value(doc_coverage) over (partition by grp_project_id) as doc_coverage,
        create_time
      FROM (
          SELECT
            project_id, issue_density, quality, code_reusability, modularity,
            static_test_coverage, doc_coverage, create_time,
              SUM(CASE when project_id is not null then 1 end) OVER (ORDER BY create_time) as grp_project_id
          FROM time_series_quality_data
      ) table_without_nulls
      ORDER BY create_time ASC
    `

    const values = [gitUrl, startTime, endTime]
    const reportMetrics = await eeQuery.execute(sql, values)

    return reportMetrics[0]
  },

  /**
   * replacementEmail is part of a hacky solution to make the example repo work.
   * If we get rid of the example repo, or we make it custom for each user,
   * then we can eliminate this hack.
   */
  async getProjectDevRankings (gitUrl, startDate, endDate, replacementEmail) {
    let values = [gitUrl]

    let commitDateRangeSql = ''
    let pullRequestDateRangeSql = ''
    if (startDate && endDate) {
      commitDateRangeSql = 'AND commit.commit_timestamp BETWEEN ? AND ?'
      pullRequestDateRangeSql = 'AND pr.merged_at BETWEEN ? AND ?'

      values = values.concat([startDate, endDate, gitUrl, startDate, endDate])
    } else {
      values.push(gitUrl)
    }

    const projectCommitTable = replacementEmail
      ? `
        (SELECT
          project_id, hash, author_name, author_timestamp, committer_email, committer_name, commit_timestamp, title,
        CASE
          WHEN author_email='example-committer@merico.dev' THEN '${replacementEmail}'
          ELSE author_email
        END as author_email
        FROM
        project_commit)
      `
      : 'project_commit'

    const sql = `
      WITH pull_request_count AS (
        WITH pull_requests_with_user_ids AS (
          SELECT
          pr.id,
          (
            CASE
            WHEN pr.user IS NOT NULL THEN "Users".id::varchar(255)
            WHEN pr.author IS NOT NULL THEN contributors.email
            END
          ) as user_id
          FROM pull_requests pr
          LEFT JOIN "Users" ON "Users".id = pr.user
          LEFT JOIN contributors ON contributors.id = pr.author
          LEFT JOIN "Projects" ON "Projects"."eeProjectId" = pr.project
          WHERE "Projects"."gitUrl" = ?
            ${pullRequestDateRangeSql}
          GROUP BY user_id, pr.id, "Users".id, contributors.id
        )

        SELECT user_id, COUNT(*) as merges FROM pull_requests_with_user_ids GROUP BY user_id
      ),

      project_dev_metrics AS (
        WITH grouped_data AS (
          SELECT
            "Projects".name as project_name,
            "Projects"."gitUrl" as git_url,
            (
              CASE
                WHEN userdata.id IS NOT NULL THEN userdata.id::varchar(255)
                ELSE commit.author_email
              END
            ) as user_id,
            (array_agg(
              DISTINCT
              CASE
                WHEN userdata.display IS NOT NULL THEN userdata.display
                WHEN contributors.display_name IS NOT NULL THEN contributors.display_name
                ELSE commit.author_name
              END
            ))[1] as display_name,
            (
              CASE
                WHEN userdata.photo IS NOT NULL THEN userdata.photo
                WHEN contributors.photo_url IS NOT NULL THEN contributors.photo_url
                ELSE ''
              END
            ) as photo_url,
            (
            CASE
              WHEN userdata.user_username IS NOT NULL THEN userdata.user_username
              WHEN contributors.username IS NOT NULL THEN contributors.username
              ELSE ''
            END
            ) as username,
            commit.author_email as email,
            sum(report_commit_value.dev_value) AS dev_value,
            sum(report_commit_value.dev_equivalent) as eloc
          FROM "Projects"
            INNER JOIN report ON report.id = "Projects"."latestReportId" AND report.detail_versions::JSONB @> '"report_email_metric"'::JSONB
            LEFT JOIN ${projectCommitTable} commit ON commit.project_id = "Projects"."eeProjectId"
            INNER JOIN report_commit_value ON commit.hash = report_commit_value.hash AND report.id = report_commit_value.report_id
            LEFT JOIN (
            SELECT
              "Users".id, "UserEmails".email, "Users"."displayName" as display,
              "Users".photo, COALESCE("Users"."gitlabUsername", "Users"."githubUsername") as user_username
            FROM "Users"
              LEFT JOIN "UserEmails" ON "Users".id = "UserEmails"."UserId"
            ) userdata ON commit.author_email = userdata.email
            LEFT JOIN contributors ON contributors.email = commit.author_email
          WHERE "Projects"."gitUrl" = ?
            ${commitDateRangeSql}
          GROUP BY
            "Projects".name, "Projects"."gitUrl", userdata.id, commit.author_email,
            userdata.display, contributors.display_name, commit.author_name,
            userdata.photo, contributors.photo_url, userdata.user_username, contributors.username
        )

        SELECT
          project_name,
          git_url,
          user_id,
          display_name,
          photo_url,
          username,
          json_agg(DISTINCT email) as emails,
          SUM(dev_value) as dev_value,
          SUM(eloc) as eloc
        FROM grouped_data
        GROUP BY project_name, git_url, user_id, display_name, photo_url, username
      )

      SELECT
        project_name,
        git_url,
        project_dev_metrics.user_id,
        display_name,
        photo_url,
        username,
        emails,
        dev_value,
        eloc,
        COALESCE(pull_request_count.merges, 0) as merges,
        RANK() OVER(ORDER BY dev_value DESC) as impact_rank,
        RANK() OVER(ORDER BY eloc DESC) as eloc_rank,
        RANK() OVER(ORDER BY COALESCE(pull_request_count.merges, 0) DESC) as merge_rank
      FROM project_dev_metrics
        LEFT JOIN pull_request_count ON project_dev_metrics.user_id = pull_request_count.user_id

    `

    const reportMetrics = await eeQuery.execute(sql, values)

    return reportMetrics[0]
  },

  async getUserContributionsByRepository (emails, startDate, endDate, userId = null, contributorId = null) {
    let values = [emails]

    let commitDateRangeSql = ''
    let pullRequestDateRangeSql = ''
    if (startDate && endDate) {
      commitDateRangeSql = 'AND commit.commit_timestamp BETWEEN ? AND ?'
      pullRequestDateRangeSql = 'AND prs.merged_at BETWEEN ? AND ?'

      values = values.concat([startDate, endDate, userId, startDate, endDate])
    }
    const pullRequestOwnerColumn = userId ? 'user' : 'author'
    values.push(userId || contributorId)

    const sql = `
      WITH raw_metrics AS (
        SELECT
          "Projects".name as project_name,
          "Projects"."gitUrl" as git_url,
          sum(report_commit_value.dev_value) AS dev_value,
          sum(report_commit_value.dev_equivalent) as eloc
        FROM "Projects"
          INNER JOIN report ON report.id = "Projects"."latestReportId" AND
            report.detail_versions::JSONB @> '"report_email_metric"'::JSONB
          LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
          INNER JOIN report_commit_value ON commit.hash = report_commit_value.hash AND
            report.id = report_commit_value.report_id
        WHERE commit.author_email = ANY(ARRAY[?])
          ${commitDateRangeSql}
        GROUP BY "Projects".name, "Projects"."gitUrl"
      ),

      pull_request_count AS (
        SELECT
          "Projects"."gitUrl" as git_url,
          COUNT(prs.id) FILTER (WHERE prs.state = ANY('{open, opened}')) as opened,
          COUNT(prs.id) FILTER (
            WHERE (prs.state = 'closed' AND prs.provider = 'github')
              OR (prs.state = 'merged' AND prs.provider = 'gitlab')
          ) as merged
        FROM "Projects"
          LEFT JOIN pull_requests prs ON "Projects"."eeProjectId" = prs.project
          LEFT JOIN "Users" ON "Users".id = prs.user
          WHERE prs.${pullRequestOwnerColumn} = ?
            ${pullRequestDateRangeSql}
        GROUP BY git_url
      )

      SELECT
        project_name,
        rm.git_url,
        dev_value,
        eloc,
        COALESCE(opened, 0) as opened,
        COALESCE(merged, 0) as merged,
        RANK() OVER(ORDER BY dev_value DESC) as impact_rank,
        RANK() OVER(ORDER BY eloc DESC) as eloc_rank,
        RANK() OVER(ORDER BY merged DESC) as merge_rank
      FROM raw_metrics rm
        LEFT JOIN pull_request_count prc ON prc.git_url = rm.git_url
    `

    const reportMetrics = await eeQuery.execute(sql, values)

    return reportMetrics[0]
  },

  async getContributorMetricsForSingleRepo (gitUrl, emails, startDate, endDate, interval) {
    let values = [emails, gitUrl]

    let dateRangeSql = ''
    if (startDate && endDate) {
      dateRangeSql = 'AND commit_timestamp BETWEEN ? AND ?'
      values = values.concat([startDate, endDate])
    }

    const sql = `
      WITH eloc_data AS (
        WITH commits AS (
          SELECT
            date_trunc('${interval}', commit_timestamp) + interval '12 hour' as truncated_date,
            (
              CASE WHEN author_email = ANY(ARRAY[?]) THEN 'contributor'
              ELSE 'other'
              END
            ) as contributor_id,
            SUM(dev_equivalent) as elocs,
            SUM(dev_value) as dev_value
          FROM project_commits_with_analysis
          WHERE git_url = ?
            ${dateRangeSql}
          GROUP BY contributor_id, truncated_date
          ORDER BY truncated_date
        ),

        totals_by_date AS (
          SELECT
            truncated_date as total_date,
            SUM(elocs) as total_elocs,
            SUM(dev_value) as total_dev_value
          FROM commits
          GROUP BY truncated_date
        )

        SELECT
          date,
          contributors_and_dates.contributor_id,
          total_elocs,
          elocs,
          total_dev_value,
          SUM(elocs) / CASE total_elocs WHEN 0 THEN 1 ELSE total_elocs END as eloc_impact,
          SUM(dev_value) / CASE total_dev_value WHEN 0 THEN 1 ELSE total_dev_value END as dev_value_impact,
          SUM(elocs) OVER (PARTITION BY contributors_and_dates.contributor_id ORDER BY date ASC ROWS BETWEEN unbounded preceding and current row) as cumulative_elocs
        FROM
          (SELECT date, contribs.contributor_id FROM
            generate_series(
              (SELECT min(truncated_date) FROM commits WHERE contributor_id = 'contributor'),
              (SELECT max(truncated_date) FROM commits WHERE contributor_id = 'contributor'),
              INTERVAL '${seriesInterval[interval]}'
            ) as date
            CROSS JOIN (
             SELECT DISTINCT contributor_id
             FROM commits
            ) contribs
          ) as contributors_and_dates
          LEFT JOIN commits ON commits.truncated_date = date AND contributors_and_dates.contributor_id = commits.contributor_id
          LEFT OUTER JOIN totals_by_date ON commits.truncated_date = totals_by_date.total_date
        GROUP BY contributors_and_dates.contributor_id, date, elocs, total_elocs, total_dev_value
      )

      SELECT
        date,
        COALESCE(elocs, 0) as elocs,
        total_elocs,
        total_dev_value,
        COALESCE(eloc_impact, 0) as eloc_impact,
        COALESCE(cumulative_elocs, 0) as cumulative_elocs,
        COALESCE(dev_value_impact, 0) as dev_value_impact
      FROM eloc_data
      WHERE contributor_id = 'contributor'
      ORDER BY date
    `

    const reportMetrics = await eeQuery.execute(sql, values)

    return reportMetrics[0]
  },

  async getPrCountsForMultipleProjects (gitUrls, startDate, endDate, interval) {
    const values = []

    let dateRangeSql = ''

    if (startDate && endDate) {
      dateRangeSql = 'WHERE prs.created_at BETWEEN ? AND ? OR prs.merged_at BETWEEN ? AND ?'
      values.push(startDate, endDate, startDate, endDate)
    }

    const sql = `
    WITH pr_counts AS (
      SELECT
        "Projects"."gitUrl" as git_url,
        (
          CASE
            WHEN prs.state = ANY('{open, opened}') THEN date_trunc('${interval}', prs.created_at) + interval '12 hours'
            ELSE date_trunc('${interval}', prs.merged_at) + interval '12 hours'
          END
        ) as date,
        COUNT(prs.id) FILTER (WHERE prs.state = ANY('{open, opened}')) as opened,
        COUNT(prs.id) FILTER (
          WHERE (prs.state = 'closed' AND prs.provider = 'github')
            OR (prs.state = 'merged' AND prs.provider = 'gitlab')
        ) as merged
      FROM pull_requests as prs
        LEFT JOIN "Projects" ON "Projects"."eeProjectId" = prs.project
      ${dateRangeSql}
      GROUP BY date, "Projects"."gitUrl"
    )

    SELECT
      git_url,
      generated_date as date,
      COALESCE(opened, 0) as opened,
      COALESCE(merged, 0) as merged
    FROM
      generate_series(
        (SELECT min(date) FROM pr_counts),
        (SELECT max(date) FROM pr_counts),
        INTERVAL '${seriesInterval[interval]}'
      ) as generated_date
      LEFT OUTER JOIN pr_counts ON date = generated_date
    ORDER BY git_url, date
    `

    const prCounts = await eeQuery.execute(sql, values)

    return groupBy(prCounts[0], (metrics) => metrics.git_url)
  },

  async getPrCounts (gitUrl, startDate, endDate, userId, contributorId, interval = intervals.week) {
    const values = []

    const conditions = []
    if (gitUrl) {
      conditions.push('"Projects"."gitUrl" = ?')
      values.push(gitUrl)
    }

    if (startDate && endDate) {
      conditions.push('(prs.created_at BETWEEN ? AND ? OR prs.merged_at BETWEEN ? AND ?)')
      values.push(startDate, endDate, startDate, endDate)
    }

    let userIdSql = ''
    let userGroupBySql = ''
    let userSelectSql = ''
    if (userId || contributorId) {
      userIdSql = `
        (
          CASE
            WHEN prs.author IS NOT NULL THEN concat('author_', prs.author::text)
            ELSE concat('user_', prs.user::text)
          END
        ) as user_id,
      `
      userGroupBySql = ', user_id'
      userSelectSql = 'user_id,'

      if (userId) {
        conditions.push('prs.user = ?')
        values.push(userId)
      } else {
        conditions.push('prs.author = ?')
        values.push(contributorId)
      }
    }

    let conditionsSql = ''
    if (conditions.length) {
      conditionsSql = conditions.reduce((accumulator, condition, index, conditions) => {
        const operator = index > 0 ? 'AND' : ''

        return `${accumulator} ${operator} ${condition}`
      }, 'WHERE')
    }

    const sql = `
      WITH pr_counts AS (
        SELECT
          (
            CASE
              WHEN prs.state = ANY('{open, opened}') THEN date_trunc('${interval}', prs.created_at) + interval '12 hours'
              ELSE date_trunc('${interval}', prs.merged_at) + interval '12 hours'
            END
          ) as date,
          ${userIdSql}
          COUNT(prs.id) FILTER (WHERE prs.state = ANY('{open, opened}')) as opened,
          COUNT(prs.id) FILTER (
            WHERE (prs.state = 'closed' AND prs.provider = 'github')
              OR (prs.state = 'merged' AND prs.provider = 'gitlab')
          ) as merged
        FROM pull_requests as prs
          LEFT JOIN "Projects" ON "Projects"."eeProjectId" = prs.project
        ${conditionsSql}
        GROUP BY date ${userGroupBySql}
      )

      SELECT
        generated_date as date,
        ${userSelectSql}
        COALESCE(opened, 0) as opened,
        COALESCE(merged, 0) as merged
      FROM
        generate_series(
          (SELECT min(date) FROM pr_counts),
          (SELECT max(date) FROM pr_counts),
          INTERVAL '${seriesInterval[interval]}'
        ) as generated_date
        LEFT OUTER JOIN pr_counts ON date = generated_date
      ORDER BY date ${userGroupBySql}
    `

    const prCounts = await eeQuery.execute(sql, values)

    return prCounts[0]
  }
}
