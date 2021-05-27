const { indexOf } = require('lodash')
const _flattenDeep = require('lodash/flattenDeep')

const eeQuery = require('../eeQuery')

module.exports = {
  getContributionBadgeData: async (eeProjectId, emails) => {
    const sql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    WITH grouped_totals AS (
      WITH total_dev_values_with_group_id AS (
        WITH dev_values AS (
            SELECT
              "Projects"."eeProjectId" as project_id,
              "Projects".name as project_name,
              report_email_value.dev_equivalent,
              report_email_value.format_email,
              report_email_value.dev_value
            FROM report_email_value
              JOIN "Projects" ON "Projects"."latestReportId" = report_email_value.report_id
              WHERE "Projects"."eeProjectId" = (?::uuid)
        )
      SELECT *
      FROM dev_values
        LEFT JOIN (
        SELECT
          (
            CASE
            WHEN rev.format_email = ANY(ARRAY[?]) THEN
              '11111111-1111-1111-1111-111111111111'
            ELSE
              uuid_generate_v1()
            END
          ) AS group_id,
          rev.format_email
        FROM report_email_value rev
            JOIN "Projects" ON "Projects"."latestReportId" = rev.report_id
        WHERE "Projects"."eeProjectId" = (?::uuid)
        GROUP BY rev.format_email
        ) as email_groups(group_id, email) ON dev_values.format_email = email_groups.email
      )
      SELECT group_id, project_id, project_name, SUM(dev_value) as dev_value,
        ROW_NUMBER() OVER (ORDER BY SUM(dev_value) DESC) as dev_rank,
        array_agg(total_dev_values_with_group_id.format_email) as emails
      FROM total_dev_values_with_group_id
      GROUP BY group_id, project_id, project_name
      )
      SELECT dev_rank, group_id, dev_value, project_id, project_name, emails,
        (SELECT max(dev_rank) FROM grouped_totals) as max_dev_rank
      FROM grouped_totals
      WHERE group_id = '11111111-1111-1111-1111-111111111111'
    `

    const contributionData = await eeQuery.execute(sql, [eeProjectId, emails, eeProjectId])

    return contributionData && contributionData.length > 0 && Array.isArray(contributionData[0]) && contributionData[0].length
      ? contributionData[0][0]
      : {}
  },
  getTrailblazerBadgeData: async (projectId, userEmails) => {
    // This gets the users in a repo by project commits
    // It ranks the users from earliers committer to latest committer
    // usersInProjectArray = all the CE users that have added this project to the CE DB

    const sql = `
      WITH ordered_trail_people AS (
        WITH distinct_emails AS (
          SELECT DISTINCT ON (p.author_email)
            p.author_email,
            MIN(p.author_timestamp) author_timestamp,
            p.project_id,
            "Projects"."gitUrl" as git_url,
            "Projects"."name" as project_name
          FROM public.project_commit p
          JOIN public."Projects" ON "Projects"."eeProjectId" = p.project_id
          WHERE "Projects"."eeProjectId" = ?
          GROUP BY author_email, project_id, git_url, project_name
        )
        SELECT author_email,
          author_timestamp,
          project_id,
          git_url,
          project_name,
          RANK() OVER (
            ORDER BY author_timestamp ASC
          ) as trailblazer_rank
        FROM distinct_emails
      )

      SELECT
      (COUNT(author_email) FILTER (WHERE NOT (author_email = ANY(ARRAY[?]))) + 1) as total_contributors,
        (
          SELECT trailblazer_rank
          FROM ordered_trail_people
          WHERE author_email = ANY(ARRAY[?])
          ORDER BY trailblazer_rank ASC
          LIMIT 1
        ) as trailblazer_rank,
        project_id, git_url, project_name
      FROM ordered_trail_people
      GROUP BY project_id, git_url, project_name
    `

    const data = await eeQuery.execute(sql, [projectId, userEmails, userEmails])

    return data && data.length && data[0].length
      ? data[0][0]
      : {}
  },
  getTestOfTimeBadgeData: async (projectIds, emails) => {
    const sql = `
        WITH test_of_time as (
          SELECT
            "Projects"."eeProjectId" as project_id,
            "Projects".name as project_name,
            ttf.user_email,
            ttf.developer_rank
          FROM report_developer_test_of_time_function ttf
            LEFT JOIN "Projects" ON "Projects"."latestReportId" = ttf.report_id
          WHERE "Projects"."eeProjectId" = ANY(ARRAY[?]::uuid[])
        )
        SELECT project_id, project_name, user_email, developer_rank,
          (SELECT MAX(developer_rank) FROM test_of_time) as dev_max_rank
        FROM test_of_time
        WHERE user_email = ANY(ARRAY[?])
        ORDER BY developer_rank
        LIMIT 1
      `
    const data = await eeQuery.execute(sql, [projectIds, emails])

    const testOfTimeBadgeData = data && data.length && Array.isArray(data[0]) && data[0].length
      ? data[0][0]
      : []

    return testOfTimeBadgeData
  },
  getElocsForProject: async (projectId) => {
    /**
     * I removed this line from this query,
     * -- INNER JOIN report_function rf ON rf.id = rcf.function_id
     * It gives the same result but takes about 30x as long to run
     */
    const sql = `
      SELECT SUM(rcf.dev_equivalent) as elocs
      FROM "Projects"
        LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
        INNER JOIN report_commit_function rcf ON rcf.hash = commit.hash AND rcf.report_id = "Projects"."latestReportId"
      WHERE "Projects"."eeProjectId" = ?
    `

    const data = await eeQuery.execute(sql, [projectId])

    return data && data.length && Array.isArray(data[0])
      ? data[0][0].elocs
      : 0
  },

  getUserElocsForAllLanguages: async (userEmails, projectIds, transaction) => {
    const sql = `
      SELECT
        rf.language, SUM(rcf.dev_equivalent) as dev_equivalent
      FROM "Projects"
        LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
        INNER JOIN report_commit_function rcf ON rcf.hash = commit.hash AND rcf.report_id = "Projects"."latestReportId"
        INNER JOIN report_function rf ON rf.id = rcf.function_id
      WHERE commit.author_email = ANY(ARRAY[?])
        AND "Projects"."eeProjectId" = ANY(ARRAY[?]::uuid[])
      GROUP BY language
    `

    const data = await eeQuery.execute(sql, [userEmails, projectIds], transaction)

    return data && data.length
      ? data[0]
      : []
  },
  getRankingForMultilingualBadgeSubset: async (usersEmails, comparisonEmails) => {
    let usersGroupId = null
    // all emails at the first level of depth
    const flattenedEmails = _flattenDeep(comparisonEmails)

    // creates a list of values for populating a constant table
    const groupedEmailRows = []
    comparisonEmails.forEach((emailGroup, index) => {
      const groupId = index + 1

      emailGroup.forEach((email) => {
        if (!usersGroupId && indexOf(usersEmails, email) >= 0) {
          usersGroupId = groupId
        }

        groupedEmailRows.push(`(${groupId}, '${email}')`)
      })
    })

    const sql = `
        WITH grouped_totals AS (
          WITH total_elocs_with_group_id AS (
            WITH line_counts AS (
              SELECT
                pc.author_email,
                sum(cfunc.dev_equivalent) as dev_equivalent
              FROM "Projects"
                JOIN report_commit_function cfunc ON cfunc.report_id = "Projects"."latestReportId"
                JOIN project_commit pc ON pc.hash = cfunc.hash
                JOIN report_function func ON func.id = cfunc.function_id
              WHERE pc.author_email = ANY(ARRAY[?])
              GROUP BY pc.author_email
            )
          SELECT *
          FROM line_counts
            INNER JOIN (VALUES
            ${groupedEmailRows.join(', ')}
            ) as email_groups(group_id, email) ON line_counts.author_email = email_groups.email
          )
          SELECT group_id, SUM(dev_equivalent) as elocs,
            ROW_NUMBER() OVER (ORDER BY SUM(dev_equivalent) DESC) as dev_rank,
            array_agg(email) as emails
          FROM total_elocs_with_group_id
          GROUP BY group_id
        )
        SELECT dev_rank, elocs,
          (SELECT max(dev_rank) FROM grouped_totals) as max_dev_rank
        FROM grouped_totals
        WHERE group_id = ?
      `

    const developerRankWithinSubset = await eeQuery.execute(sql, [flattenedEmails, usersGroupId])

    return developerRankWithinSubset.length && Array.isArray(developerRankWithinSubset[0]) && developerRankWithinSubset.length > 0
      ? developerRankWithinSubset[0][0]
      : []
  },
  getMinesweeperBadgesData: async (projectId, emails) => {
    const sql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    WITH grouped_totals AS (
      WITH total_bomb_counts_with_group_id AS (
        WITH bomb_counts AS (
        SELECT
          "Projects"."eeProjectId" as project_id,
          "Projects"."name" as project_name,
          bs.user_email,
          bs.bomb_count
        FROM report_contributor_bomb_sweeper bs
          LEFT JOIN "Projects" ON "Projects"."latestReportId" = bs.report_id
        WHERE "Projects"."eeProjectId" = (?::uuid)
        )
      SELECT *
      FROM bomb_counts
        LEFT JOIN (
          SELECT
          (
            CASE
            WHEN pc2.author_email = ANY(ARRAY[?]) THEN
              '11111111-1111-1111-1111-111111111111'
            ELSE
              uuid_generate_v1()
            END
          ) AS group_id,
          pc2.author_email
        FROM project_commit pc2
        WHERE pc2.project_id = (?::uuid)
        GROUP BY pc2.author_email
        ) as email_groups(group_id, email) ON bomb_counts.user_email = email_groups.email
      )
      SELECT group_id, project_id, project_name, SUM(bomb_count) as bomb_count,
        ROW_NUMBER() OVER (ORDER BY SUM(bomb_count) DESC) as dev_rank,
        array_agg(email) as emails
      FROM total_bomb_counts_with_group_id
      GROUP BY group_id, project_id, project_name
      )
      SELECT dev_rank, bomb_count, project_id, project_name,
      (SELECT max(dev_rank) FROM grouped_totals) as max_dev_rank
      FROM grouped_totals
      WHERE group_id = '11111111-1111-1111-1111-111111111111'
    `

    const mineSweeperData = await eeQuery.execute(sql, [projectId, emails, projectId])

    return mineSweeperData && Array.isArray(mineSweeperData[0]) && mineSweeperData[0].length > 0
      ? mineSweeperData[0][0]
      : {}
  }
}
