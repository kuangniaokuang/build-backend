'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.addColumn(
        'Projects',
        'incomingReportId',
        {
          type: Sequelize.DataTypes.UUID
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'Projects',
        'latestReportId',
        {
          type: Sequelize.DataTypes.UUID
        },
        { transaction }
      )

      await queryInterface.sequelize.query(`
        ALTER TABLE "Projects" ADD CONSTRAINT "eeproject_id_unique" UNIQUE ("eeProjectId");
        ALTER TABLE "Projects" ALTER COLUMN "eeProjectId" TYPE uuid using "eeProjectId"::UUID;`,
      { transaction })

      await queryInterface.sequelize.query('DELETE FROM project_report_state WHERE project_id NOT IN (SELECT "eeProjectId" FROM "Projects")', { transaction })

      await queryInterface.sequelize.query('UPDATE "Projects" SET "latestReportId" = projects.latest_report_id FROM projects WHERE "Projects"."eeProjectId" = projects.id', { transaction })
      await queryInterface.sequelize.query('UPDATE "Projects" SET "eeStatus" = projects.readiness FROM projects WHERE "Projects"."eeProjectId" = projects.id', { transaction })

      await queryInterface.changeColumn(
        'Projects',
        'eeProjectId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          unique: true
        },
        { transaction }
      )

      await queryInterface.sequelize.query('ALTER TABLE "Projects" ALTER COLUMN "eeLastSyncTime" TYPE timestamp with time zone using "eeLastSyncTime"::DATE;', { transaction })

      await queryInterface.changeColumn(
        'Projects',
        'eeLastSyncTime',
        {
          type: Sequelize.DataTypes.DATE
        },
        { transaction }
      )

      await module.exports.dropConstraints(queryInterface, transaction)
      await queryInterface.sequelize.query('ALTER TABLE batches ADD CONSTRAINT batches_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE invite_user ADD CONSTRAINT invite_user_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_analytics_settings ADD CONSTRAINT project_analytics_settings_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_auth ADD CONSTRAINT project_auth_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_commit_remark ADD CONSTRAINT project_commit_remark_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_contrib ADD CONSTRAINT project_contrib_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_group_project ADD CONSTRAINT project_group_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_pre_process_result ADD CONSTRAINT project_pre_process_result_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_report_state ADD CONSTRAINT project_report_state_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_team_user ADD CONSTRAINT project_team_user_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE team_subscription ADD CONSTRAINT team_subscription_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE team_user_watch_project ADD CONSTRAINT team_user_watch_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES "Projects" ("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })

      await queryInterface.sequelize.query(`
        DROP MATERIALIZED VIEW IF EXISTS jira_sprint_user_summary;
        DROP MATERIALIZED VIEW IF EXISTS jira_sprint_issue_summary;
        DROP MATERIALIZED VIEW IF EXISTS jira_sprint_user_daily;
        DROP VIEW IF EXISTS project_commit_ex;
        DROP TABLE IF EXISTS projects;
      `, { transaction })

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.removeColumn('Projects', 'incomingReportId', { transaction })
      await queryInterface.removeColumn('Projects', 'latestReportId', { transaction })

      await module.exports.dropConstraints(queryInterface, transaction)

      await queryInterface.sequelize.query(`
        CREATE TABLE public."projects"
        (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            project_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
            git_url character varying(255) COLLATE pg_catalog."default" NOT NULL,
            readiness readiness NOT NULL,
            last_sync_time timestamp with time zone,
            create_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            update_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            is_private boolean NOT NULL DEFAULT false,
            latest_report_id uuid,
            normalize_git_url character varying(255) COLLATE pg_catalog."default" NOT NULL,
            incoming_report_id uuid,
            CONSTRAINT projects_pkey PRIMARY KEY (id),
            CONSTRAINT projects_git_url_key UNIQUE (git_url),
            CONSTRAINT projects_latest_report_id_fkey FOREIGN KEY (latest_report_id)
                REFERENCES public.report (id) MATCH SIMPLE
                ON UPDATE CASCADE
                ON DELETE CASCADE
        )

        TABLESPACE pg_default;

        ALTER TABLE public."projects"
            OWNER to merico;

        -- Trigger: on_update_projects

        -- DROP TRIGGER on_update_projects ON public."projects";

        CREATE TRIGGER on_update_projects
            BEFORE UPDATE
            ON public."projects"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_update_time();
      `, { transaction })

      await queryInterface.sequelize.query('ALTER TABLE batches ADD CONSTRAINT batches_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE invite_user ADD CONSTRAINT invite_user_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_analytics_settings ADD CONSTRAINT project_analytics_settings_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_auth ADD CONSTRAINT project_auth_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_commit_remark ADD CONSTRAINT project_commit_remark_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_contrib ADD CONSTRAINT project_contrib_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_group_project ADD CONSTRAINT project_group_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_pre_process_result ADD CONSTRAINT project_pre_process_result_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE project_team_user ADD CONSTRAINT project_team_user_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE team_subscription ADD CONSTRAINT team_subscription_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE team_user_watch_project ADD CONSTRAINT team_user_watch_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON UPDATE CASCADE ON DELETE CASCADE;', { transaction })

      await queryInterface.sequelize.query('ALTER TABLE "Projects" ALTER COLUMN "eeProjectId" TYPE varchar(255) using "eeProjectId"::TEXT;', { transaction })

      await queryInterface.changeColumn(
        'Projects',
        'eeProjectId',
        {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          unique: false
        },
        { transaction }
      )

      await queryInterface.sequelize.query('ALTER TABLE "Projects" ALTER COLUMN "eeLastSyncTime" TYPE varchar(255) using "eeLastSyncTime"::TEXT;', { transaction })

      await queryInterface.changeColumn(
        'Projects',
        'eeLastSyncTime',
        {
          type: Sequelize.DataTypes.STRING
        },
        { transaction }
      )

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  async dropConstraints (queryInterface, transaction) {
    await queryInterface.sequelize.query('ALTER TABLE batches DROP CONSTRAINT batches_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE invite_user DROP CONSTRAINT invite_user_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_analytics_settings DROP CONSTRAINT project_analytics_settings_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_auth DROP CONSTRAINT project_auth_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_commit_remark DROP CONSTRAINT project_commit_remark_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_contrib DROP CONSTRAINT project_contrib_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_group_project DROP CONSTRAINT project_group_project_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_pre_process_result DROP CONSTRAINT project_pre_process_result_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_report_state DROP CONSTRAINT project_report_state_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE project_team_user DROP CONSTRAINT project_team_user_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE team_subscription DROP CONSTRAINT team_subscription_project_id_fkey;', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE team_user_watch_project DROP CONSTRAINT team_user_watch_project_project_id_fkey;', { transaction })
  }
}
