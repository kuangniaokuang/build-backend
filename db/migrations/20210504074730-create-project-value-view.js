'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE VIEW project_commits_with_analysis AS
      SELECT
        "Projects"."gitUrl" as git_url,
        commit.commit_timestamp,
        commit.author_email,
        report_commit_value.dev_equivalent,
        report_commit_value.dev_value
      FROM "Projects"
        LEFT JOIN report ON report.id = "Projects"."latestReportId" AND report.detail_versions::JSONB @> '"report_email_metric"'::JSONB
        LEFT JOIN project_commit commit ON commit.project_id = "Projects"."eeProjectId"
        LEFT JOIN report_commit_value ON commit.hash = report_commit_value.hash AND report.id = report_commit_value.report_id
      WHERE report_commit_value.report_id IS NOT NULL
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW project_commits_with_analysis')
  }
}
