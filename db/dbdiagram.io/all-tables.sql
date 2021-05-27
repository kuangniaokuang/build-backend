


CREATE TABLE public."BadgeTypes" (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    icon text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    title character varying(255),
    description character varying(255),
    criteria character varying(255)
);

CREATE TABLE public."Badges" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    
    description character varying(255) NOT NULL,
    "rankNumerator" character varying(255),
    "rankDenominator" character varying(255),
    "imageUrl" character varying(255) NOT NULL,
    "user" integer NOT NULL,
    project integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    current integer
);
















CREATE TABLE public."BaselineRepoMeta" (
    id integer NOT NULL,
    "user" integer,
    email character varying(255),
    "gitUrl" character varying(255) NOT NULL,
    "userCommits" integer NOT NULL,
    "totalCommits" integer NOT NULL,
    "totalCommitters" integer NOT NULL,
    forked boolean,
    "repoSize" integer NOT NULL,
    language character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);





















CREATE TABLE public."DeletedAccounts" (
    id integer NOT NULL,
    email character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);





















CREATE TABLE public."LoginAttempts" (
    id integer NOT NULL,
    "UserId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);





















CREATE TABLE public."PendingVerifications" (
    id integer NOT NULL,
    token character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);





















CREATE TABLE public."Projects" (
    id integer NOT NULL,
    url character varying(255) NOT NULL,
    "gitUrl" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "eeLastSyncTime" timestamp with time zone,
    "eeProjectId" uuid NOT NULL,
    "eeStatus" character varying(255),
    "latestCommitHash" character varying(255),
    "latestCommitTitle" character varying(255),
    "latestCommitMessage" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isFavorite" boolean,
    "nextProcessing" timestamp with time zone,
    priority integer DEFAULT 0 NOT NULL,
    "isAnalysisPending" boolean DEFAULT false,
    "incomingReportId" uuid,
    "latestReportId" uuid
);





















CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);







CREATE TABLE public."UserEmails" (
    id integer NOT NULL,
    "UserId" integer NOT NULL,
    email character varying(255) NOT NULL,
    "isVerified" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);





















CREATE TABLE public."UserNotifications" (
    id integer NOT NULL,
    "user" integer NOT NULL,
    message character varying(255) NOT NULL,
    
    "isRead" boolean DEFAULT false NOT NULL,
    url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone
);





















CREATE TABLE public."UserProjects" (
    "UserId" integer NOT NULL,
    "ProjectId" integer NOT NULL,
    "isFavorite" boolean DEFAULT false,
    "latestAnalysisId" character varying(255)
);







CREATE TABLE public."Users" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    photo character varying(255),
    "displayName" character varying(255),
    "githubUsername" character varying(255),
    "githubApiUrl" character varying(255),
    "gitlabUsername" character varying(255),
    "githubAccessToken" text,
    website character varying(255),
    "isOnboarded" boolean,
    "gitlabAccessToken" text,
    "gitlabRefreshToken" text,
    "githubRefreshToken" text,
    "primaryEmail" character varying(255),
    "isPublic" boolean DEFAULT false NOT NULL
);





















CREATE TABLE public.batches (
    batch_time timestamp with time zone NOT NULL,
    project_id uuid NOT NULL,
    version timestamp with time zone,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.ca_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(50) NOT NULL,
    signature character varying(255) NOT NULL,
    
    
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    project_id uuid,
    result bytea,
    notify_result_time timestamp with time zone,
    
    
    error_message text,
    traceback text,
    report_id uuid,
    shared_fs_index integer DEFAULT 0 NOT NULL,
    source_id uuid
    
);







CREATE TABLE public.ca_project (
    id bigint NOT NULL,
    source_id uuid NOT NULL,
    
    shared_fs_index integer DEFAULT 0 NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);




















CREATE TABLE public.ca_task (
    id bigint NOT NULL,
    celery_task_id character varying(155) NOT NULL,
    seq integer DEFAULT 0 NOT NULL,
    analyzed_workload integer DEFAULT 0 NOT NULL,
    total_workload integer DEFAULT 0 NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    analysis_id uuid,
    heartbeat_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    result bytea,
    name character varying(50),
    traceback text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    tried_count integer DEFAULT 0 NOT NULL,
    hostname character varying(255)
);




















CREATE TABLE public.config (
    key character varying(255) NOT NULL,
    value text,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    
    team_id uuid
);







CREATE TABLE public.contributors (
    id integer NOT NULL,
    email character varying(255),
    
    remote_id integer,
    display_name character varying(255),
    username character varying(255),
    profile_url character varying(255),
    photo_url character varying(255),
    user_id integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);





















CREATE TABLE public.department (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    "parentId" uuid,
    mpath character varying,
    team_id uuid,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.email_notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    params jsonb,
    team_id uuid,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.email_notification_template (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_cn text NOT NULL,
    params_desc jsonb,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.emails (
    user_id uuid,
    email character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_primary boolean DEFAULT false NOT NULL
);







CREATE TABLE public.project_commit (
    project_id uuid NOT NULL,
    hash character(40) NOT NULL,
    author_email character varying NOT NULL,
    author_name character varying NOT NULL,
    author_timestamp timestamp with time zone NOT NULL,
    committer_email character varying NOT NULL,
    committer_name character varying NOT NULL,
    commit_timestamp timestamp with time zone NOT NULL,
    parent_hashes_str text NOT NULL,
    title text NOT NULL,
    message text,
    add_line integer NOT NULL,
    delete_line integer NOT NULL
);







CREATE TABLE public.team_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying,
    rank character varying,
    legacy_promotion_date date,
    job_number character varying,
    enable boolean DEFAULT false NOT NULL,
    role character varying,
    department_id uuid,
    promotion_date timestamp with time zone
);







CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(255) NOT NULL,
    full_name character varying(255),
    phone_number character varying(28),
    password_hash character(60) NOT NULL,
    bio text,
    location character varying(255),
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    primary_email character varying(255)
);











CREATE TABLE public.gitlab_importing_task (
    id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    outer_project_id character varying NOT NULL,
    path_with_namespace character varying NOT NULL,
    http_url character varying NOT NULL,
    team_user_id uuid NOT NULL,
    background boolean DEFAULT false,
    preprocess_error_code character varying,
    preprocess_error_detail character varying
);







CREATE TABLE public.invite_user (
    hash uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    role character varying,
    completed boolean DEFAULT false,
    project_group_id uuid,
    inviter_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    project_id uuid
);







CREATE TABLE public.jira_attachment (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    issue_id integer NOT NULL,
    id integer NOT NULL,
    self character varying(255),
    author_uuid uuid,
    created timestamp with time zone,
    size integer,
    mime_type character varying(255),
    content text,
    thumbnail character varying(255)
);







CREATE TABLE public.jira_comment (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    id integer NOT NULL,
    self character varying(255),
    issue_id integer NOT NULL,
    author_uuid uuid,
    body text,
    commit_hash character varying(255),
    update_author_uuid uuid,
    created timestamp with time zone,
    updated timestamp with time zone,
    commit_project character varying(255)
);







CREATE TABLE public.jira_field (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    id character varying(255),
    name character varying(255),
    custom boolean,
    orderable boolean,
    navigable boolean,
    searchable boolean,
    schema_type character varying(255),
    schema_items character varying(255),
    schema_system character varying(255)
);







CREATE TABLE public.jira_fix_version (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    issue_id integer NOT NULL,
    id integer NOT NULL,
    self character varying(255),
    name character varying(255),
    archived boolean,
    released boolean,
    release_date character varying(255)
);







CREATE TABLE public.jira_issue (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL,
    self character varying(255),
    key character varying(255),
    expand character varying(255),
    fields_issuetype_self character varying(255),
    fields_issuetype_id character varying(255),
    fields_issuetype_description character varying(255),
    fields_issuetype_icon_url character varying(255),
    fields_issuetype_name character varying(255),
    fields_issuetype_subtask boolean,
    fields_timespent character varying(255),
    fields_timeoriginalestimate character varying(255),
    fields_description text,
    fields_project_self character varying(255),
    fields_project_id character varying(255),
    fields_project_key character varying(255),
    fields_project_name character varying(255),
    fields_project_project_type_key character varying(255),
    fields_project_avatar_urls_48x48 character varying(255),
    fields_project_avatar_urls_24x24 character varying(255),
    fields_project_avatar_urls_16x16 character varying(255),
    fields_project_avatar_urls_32x32 character varying(255),
    fields_aggregatetimespent character varying(255),
    fields_timetracking_original_estimate character varying(255),
    fields_timetracking_remaining_estimate character varying(255),
    fields_timetracking_time_spent character varying(255),
    fields_timetracking_original_estimate_seconds integer,
    fields_timetracking_remaining_estimate_seconds integer,
    fields_timetracking_time_spent_seconds integer,
    fields_resolution_self character varying(255),
    fields_resolution_id character varying(255),
    fields_resolution_description text,
    fields_resolution_name character varying(255),
    fields_aggregatetimeestimate character varying(255),
    fields_resolutiondate character varying(255),
    fields_workratio character varying(255),
    fields_summary character varying(255),
    fields_last_viewed character varying(255),
    fields_watches_self character varying(255),
    fields_watches_watch_count integer,
    fields_watches_is_watching boolean,
    fields_creator_uuid uuid,
    fields_created timestamp with time zone,
    fields_reporter_uuid uuid,
    fields_aggregateprogress_progress integer,
    fields_aggregateprogress_total integer,
    fields_priority_self character varying(255),
    fields_priority_icon_url character varying(255),
    fields_priority_name character varying(255),
    fields_priority_id character varying(255),
    fields_environment text,
    fields_timeestimate character varying(255),
    fields_aggregatetimeoriginalestimate character varying(255),
    fields_duedate character varying(255),
    fields_progress_progress integer,
    fields_progress_total integer,
    fields_votes_self character varying(255),
    fields_votes_votes integer,
    fields_votes_has_voted boolean,
    fields_assignee_uuid uuid,
    fields_updated timestamp with time zone,
    fields_status_self character varying(255),
    fields_status_description character varying(255),
    fields_status_icon_url character varying(255),
    fields_status_name character varying(255),
    fields_status_id character varying(255),
    fields_status_status_category_self character varying(255),
    fields_status_status_category_id character varying(255),
    fields_status_status_category_key character varying(255),
    fields_status_status_category_color_name character varying(255),
    fields_status_status_category_name character varying(255),
    custom_fields_start_date timestamp with time zone,
    custom_fields_end_date timestamp with time zone,
    fields_assignee_display_name character varying(255),
    fields_parent_id integer,
    fields_parent_self character varying(255),
    fields_parent_key character varying(255)
);







CREATE TABLE public.jira_issue_changelog (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    issue_uuid uuid,
    author_uuid uuid,
    id character varying(255),
    items_field character varying(255),
    items_field_id character varying(255),
    items_fieldtype character varying(255),
    items_from jsonb,
    items_from_string character varying(255),
    items_to jsonb,
    items_to_string character varying(255),
    created timestamp with time zone
);







CREATE TABLE public.jira_issuelink (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    issue_id integer NOT NULL,
    id integer NOT NULL,
    type_id character varying(255),
    type_name character varying(255),
    type_inward character varying(255),
    type_outward character varying(255),
    outward_issue_id character varying(255),
    outward_issue_key character varying(255),
    outward_issue_self character varying(255),
    outward_issue_fields_status_icon_url character varying(255),
    outward_issue_fields_status_name character varying(255),
    inward_issue_id character varying(255),
    inward_issue_key character varying(255),
    inward_issue_self character varying(255)
);







CREATE TABLE public.jira_user (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    self character varying(255),
    account_id character varying(255),
    name character varying(255),
    key character varying(255),
    email_address character varying(255),
    avatar_urls_48x48 character varying(255),
    avatar_urls_24x24 character varying(255),
    avatar_urls_16x16 character varying(255),
    avatar_urls_32x32 character varying(255),
    display_name character varying(255),
    active boolean,
    timezone character varying(255),
    created timestamp with time zone
);









CREATE TABLE public.jira_platform (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    platform_url character varying,
    jira_user character varying,
    jira_password character varying,
    update_team_user_id uuid,
    last_sync_time timestamp with time zone,
    is_delete boolean DEFAULT false,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.jira_platform_sync_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    start_team_user_id uuid,
    total integer,
    handle_total integer,
    is_finish boolean DEFAULT false,
    
    
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.jira_rapidview (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    id character varying(255) NOT NULL,
    name character varying(255),
    can_edit boolean,
    sprint_support_enabled boolean,
    is_simple_board boolean,
    filter_query character varying(255),
    filter_name character varying(255),
    filter_id character varying(255)
);







CREATE TABLE public.jira_rapidview_sprint (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    rapidview_id character varying(255) NOT NULL,
    id character varying(255),
    name character varying(255),
    state character varying(255),
    sequence integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone
);










CREATE TABLE public.jira_subtask (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    issue_id integer NOT NULL,
    sub_issue_uuid uuid,
    sub_issue_id integer NOT NULL
);












CREATE TABLE public.jira_worklog (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    issue_id integer NOT NULL,
    id integer NOT NULL,
    self character varying(255),
    author_uuid uuid,
    update_author_uuid uuid,
    comment character varying(255),
    updated timestamp with time zone,
    visibility_type character varying(255),
    visibility_value character varying(255),
    started character varying(255),
    time_spent character varying(255),
    time_spent_seconds integer
);







CREATE TABLE public.large_screen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    play_interval integer DEFAULT 10000 NOT NULL
);







CREATE TABLE public.large_screen_page (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    layout character varying NOT NULL,
    sort integer NOT NULL,
    large_screen_id uuid NOT NULL
);







CREATE TABLE public.large_screen_page_chart (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    sort integer NOT NULL,
    chart_key character varying NOT NULL,
    large_screen_id uuid NOT NULL,
    large_screen_page_id uuid NOT NULL
);







CREATE TABLE public.license (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    team_local_machine_id uuid NOT NULL,
    version character varying NOT NULL,
    key text NOT NULL,
    expired_time timestamp with time zone NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    number_limit integer NOT NULL,
    license_str text NOT NULL
);







CREATE TABLE public.links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    link_url character varying(255),
    type integer,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.metric_column_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scene_id uuid NOT NULL,
    name character varying(255),
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.metric_scene (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    update_team_user_id uuid,
    name character varying(255),
    filter_list jsonb,
    is_delete boolean DEFAULT false,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);














CREATE TABLE public.migrate_log (
    filename character varying NOT NULL,
    version integer,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);














CREATE TABLE public.notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.notification_type_setting (
    type character varying NOT NULL,
    
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.notification_user_stat (
    notification_id uuid,
    user_id uuid,
    view_time timestamp with time zone,
    mail_sent_time timestamp with time zone,
    delete_time timestamp with time zone,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.oauth (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    app integer NOT NULL,
    app_user_id character varying NOT NULL,
    token character varying NOT NULL,
    expiration timestamp with time zone,
    refresh_token character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.primary_email_booster (
    primary_email character varying(255),
    user_name character varying,
    user_title character varying(255),
    team_id uuid
);







CREATE TABLE public.project_analytics_settings (
    project_id uuid NOT NULL,


    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,




    commit_after_time timestamp with time zone,
    commit_auto_exclude integer,
    CONSTRAINT project_analytics_settings_commit_auto_exclude_check CHECK ((commit_auto_exclude >= 0))
);










































CREATE TABLE public.project_auth (
    project_id uuid NOT NULL,
    create_user_id uuid,
    auth_type smallint NOT NULL,
    private_key text,
    public_key text,
    username character varying(255),
    password character varying(255),
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.project_commit_remark (
    project_id uuid NOT NULL,
    hash character(40) NOT NULL,
    remark character varying(140) NOT NULL
);







CREATE TABLE public.project_contrib (
    project_id uuid NOT NULL,
    distribution bytea,
    version timestamp with time zone NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    top_commits bytea,
    format_email character varying(255)
);







CREATE TABLE public.project_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    logo_url text,
    parent_id uuid,

    sort integer DEFAULT 0,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    out_group_id character varying(255)
);














CREATE TABLE public.project_group_project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_group_id uuid NOT NULL,
    project_id uuid NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.project_group_team_user (
    project_group_id uuid NOT NULL,
    team_user_id uuid NOT NULL,
    role character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.project_pre_process_result (
    project_id uuid NOT NULL,
    num_commits bigint DEFAULT 0 NOT NULL,
    num_developers bigint DEFAULT 0 NOT NULL,
    total_insertions bigint DEFAULT 0 NOT NULL,
    total_deletions bigint DEFAULT 0 NOT NULL,



    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.project_report_state (
    report_id uuid NOT NULL,
    project_id uuid,


    commit_before_time timestamp with time zone,
    last_sync_time timestamp with time zone,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    analysis_id uuid,
    start_team_user_id uuid,
    analysis_type character varying(255),
    commit_after_time timestamp with time zone,
    error_message text,
    traceback text,
    finish_time timestamp with time zone,
    analytics_settings_version timestamp with time zone
);





















CREATE TABLE public.project_team_user (
    project_id uuid NOT NULL,
    team_user_id uuid NOT NULL,
    role character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.pull_requests (
    id integer NOT NULL,
    project uuid NOT NULL,
    remote_id integer NOT NULL,
    api_url character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    title character varying(255),
    author integer,
    "user" integer,
    
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    closed_at timestamp with time zone,
    merged_at timestamp with time zone,
    merge_commit character varying(255) NOT NULL
);





















CREATE TABLE public.report (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    version character varying(255) NOT NULL,
    commit_dead_time timestamp with time zone NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    add_line integer DEFAULT 0 NOT NULL,
    delete_line integer DEFAULT 0 NOT NULL,
    num_commits integer DEFAULT 0 NOT NULL,
    commit_dead_hash character(40) NOT NULL,
    commit_start_time timestamp with time zone,

    commit_aspect_hash character(40) NOT NULL
);







CREATE TABLE public.report_code_check_breaking_record (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    rule_key character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    hash character(40),
    effort character varying(255),
    code_number integer NOT NULL,
    unique_key character varying(255),
    filename text
);







CREATE TABLE public.report_comment_coverage_function (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid,
    comment_line_number integer,
    format_email character varying(255),
    report_function_id uuid
);







CREATE TABLE public.report_commit_file_tag_evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hash character(40) NOT NULL,
    filename character varying NOT NULL,
    report_id uuid NOT NULL,
    tag_evidence_id uuid NOT NULL,
    times integer NOT NULL
);







CREATE TABLE public.report_commit_file_value (
    hash character(40) NOT NULL,
    filename character varying NOT NULL,
    report_id uuid NOT NULL
);







CREATE TABLE public.report_commit_function (
    hash character(40) NOT NULL,
    function_id uuid NOT NULL,
    report_id uuid NOT NULL,
    add_line integer NOT NULL,
    delete_line integer NOT NULL
);







CREATE TABLE public.report_commit_value (
    hash character(40) NOT NULL,
    report_id uuid NOT NULL,
    effective_add_line integer DEFAULT 0 NOT NULL,
    effective_delete_line integer DEFAULT 0 NOT NULL,
    cyclomatic_total integer,
    big_cyclomatic_function_number integer,
    in_default_ref boolean DEFAULT false NOT NULL,
    num_functions integer
);














CREATE TABLE public.report_config_code_check (
    key character varying(255) NOT NULL,
    repo character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    html_desc text,
    severity character varying(255) NOT NULL,
    lang character varying(255) NOT NULL,
    langname character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name_cn character varying(255),
    html_desc_cn text
);







CREATE TABLE public.report_config_code_check_ignore (
    key character varying(255) NOT NULL,
    team_id uuid,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.report_config_dev_value_formula_params (
    team_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    update_time timestamp with time zone DEFAULT now() NOT NULL
);




























CREATE TABLE public.report_config_feature_flags (
    team_id uuid NOT NULL,
    feature_key text NOT NULL,
    flag boolean DEFAULT false,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    update_time timestamp with time zone DEFAULT now() NOT NULL
);














CREATE TABLE public.report_config_industry_efficiency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    developer_num_from integer NOT NULL,
    developer_num_to integer NOT NULL,
    lang character varying(255) NOT NULL,
    langname character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);




























CREATE TABLE public.report_config_industry_quality (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    
    dev_eq_num_from integer NOT NULL,
    dev_eq_num_to integer NOT NULL,
    lang character varying(255) NOT NULL,
    langname character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);














CREATE TABLE public.report_config_tag (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    name_cn character varying,
    parent_id uuid,

    is_system boolean DEFAULT true,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    temp_id integer,
    "desc" text,
    desc_cn text
);







CREATE TABLE public.report_config_tag_evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    
    name character varying NOT NULL,
    lang character varying(255),
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.report_config_tag_evidence_system_tag (
    evidence_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.report_config_tag_evidence_user_tag (
    evidence_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.report_contributor_bomb_sweeper (
    user_email character varying NOT NULL,
    report_id uuid NOT NULL,
    bomb_count integer NOT NULL
);







CREATE VIEW public.report_contributors_view AS
 SELECT COALESCE(u.primary_email, c.author_email) AS primary_email,
    COALESCE(u.name, c.author_name) AS name,
    r.id AS report_id
   FROM ((public.report r
     JOIN public.project_commit c ON (((c.project_id = r.project_id) AND (c.commit_timestamp <= r.commit_dead_time))))
     LEFT JOIN ( SELECT emails.email,
            users.primary_email,
            team_user.name
           FROM ((public.emails
             JOIN public.users ON ((users.id = emails.user_id)))








CREATE TABLE public.report_developer_test_of_time_function (
    user_email character varying NOT NULL,
    report_id uuid NOT NULL,
    developer_rank integer NOT NULL,
    node_id character varying NOT NULL
);







CREATE TABLE public.report_duplicate_function (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid,
    report_duplicate_group_id uuid,
    format_email character varying(255),
    report_function_id uuid
);







CREATE TABLE public.report_duplicate_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid,
    duplicate_function_number integer
);







CREATE TABLE public.report_email_metric (
    report_id uuid,
    format_email character varying(255),
    doc_coverage_function_num integer DEFAULT 0,
    doc_coverage_total_function_num integer DEFAULT 0,
    static_test_coverage_function_num integer DEFAULT 0,
    static_test_coverage_total_function_num integer DEFAULT 0,
    duplicate_function_num integer DEFAULT 0,
    issue_blocker_number integer DEFAULT 0,
    issue_critical_number integer DEFAULT 0,
    issue_info_number integer DEFAULT 0,
    issue_major_number integer DEFAULT 0,
    issue_minor_number integer DEFAULT 0,
    function_depend integer DEFAULT 0,
    ccg_snapshot_function_num integer DEFAULT 0
);







CREATE TABLE public.report_email_module_value (
    module_name character varying NOT NULL,
    report_id uuid NOT NULL,
    format_email character varying(255)
);







CREATE TABLE public.report_email_value (
    report_id uuid NOT NULL,
    format_email character varying(255) NOT NULL
);







CREATE TABLE public.report_function (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    filename text NOT NULL,
    in_degree integer DEFAULT 0 NOT NULL,
    out_degree integer DEFAULT 0 NOT NULL,

    ccg_function_id character varying(255),
    function_name text,
    function_params text,
    function_returns text,
    enclosing_function_name text,
    source_start_line integer,
    source_start_column integer,
    source_end_line integer,
    source_end_column integer,
    snapshot_commit_hash character(40),
    added_by_commit_hash character(40),
    cyclomatic integer,

    owner_email character varying
);





















CREATE TABLE public.report_function_depend_email (
    function_id uuid NOT NULL,
    format_email character varying(255) NOT NULL,
    report_id uuid NOT NULL
);







CREATE TABLE public.report_function_graph (
    caller_id uuid NOT NULL,
    callee_id uuid NOT NULL,
    report_id uuid NOT NULL,
    times integer DEFAULT 1 NOT NULL
);







CREATE TABLE public.report_metric (
    report_id uuid NOT NULL,
    magnetism integer DEFAULT 0,
    package_depend integer,
    git_tag_number integer,
    issue_track_unique boolean DEFAULT false,
    issue_blocker_number integer DEFAULT 0 NOT NULL,
    issue_critical_number integer DEFAULT 0 NOT NULL,
    issue_info_number integer DEFAULT 0 NOT NULL,
    issue_major_number integer DEFAULT 0 NOT NULL,
    issue_minor_number integer DEFAULT 0 NOT NULL,
    cyclomatic_total integer,
    doc_coverage_function_num integer,
    doc_coverage_total_function_num integer,
    static_test_coverage_function_num integer,
    static_test_coverage_total_function_num integer,
    duplicate_function_num integer,
    ccg_snapshot_function_num integer
);







CREATE TABLE public.report_test_coverage_function (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_function_number integer,
    report_id uuid,
    format_email character varying(255),
    report_function_id uuid
);







CREATE TABLE public.report_test_coverage_test_function (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_test_coverage_function_id uuid,
    report_function_id uuid
);







CREATE TABLE public.report_topic_email_value (
    format_email character varying NOT NULL,
    report_id uuid NOT NULL,
    topic_name character varying NOT NULL
);







CREATE TABLE public.report_topic_file_value (
    filename character varying NOT NULL,
    topic_name character varying NOT NULL,
    report_id uuid NOT NULL
);







CREATE TABLE public.sso_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    strategy character varying NOT NULL,
    sso_uid character varying NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    app_id character varying
);







CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_waiting boolean NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type smallint DEFAULT 0 NOT NULL
);







CREATE TABLE public.team (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    manager_user_id uuid NOT NULL,
    num_partner_text character varying,
    domains_str character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.team_local_machine (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    create_user_id uuid NOT NULL,
    name text NOT NULL,
    machine_code text NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.team_project_key (
    team_id uuid NOT NULL,
    private_key text NOT NULL,
    public_key text NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.team_subscription (
    project_id uuid NOT NULL,
    team_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);







CREATE TABLE public.team_token (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    appid character varying NOT NULL,
    appsecret character varying NOT NULL,

    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_id uuid
);














CREATE TABLE public.team_user_department_role (
    team_user_id uuid NOT NULL,
    department_id uuid NOT NULL,
    
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE VIEW public.team_user_ex AS
 SELECT team_user.id,
    team_user.team_id,
    team_user.user_id,
    team_user.title,
    team_user.create_time,
    team_user.update_time,
    team_user.name,
    team_user.salary,
    team_user.rank,
    team_user.legacy_promotion_date AS promotion_date,
    team_user.job_number,
    team_user.enable,
    team_user.role,
    users.primary_email
   FROM (public.team_user
     LEFT JOIN public.users ON ((users.id = team_user.user_id)));







CREATE TABLE public.team_user_project_key (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    private_key text NOT NULL,
    public_key text NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.team_user_watch_project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.team_user_watch_project_group (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    project_group_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.third_party_platform (
    oauth_url character varying,
    access_token character varying,
    administrator_id uuid,
    application_id character varying NOT NULL,
    application_secret character varying NOT NULL,
    
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    refresh_token character varying,
    expired_time timestamp with time zone,
    auto_sync boolean DEFAULT false NOT NULL,
    token_owner_id uuid,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);































































CREATE TABLE public.tokens (
    email character varying(255) NOT NULL,
    token character varying(6) NOT NULL,
    expiration timestamp with time zone NOT NULL
);







CREATE TABLE public.user_config (
    user_id uuid NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE public.weekly_report_developer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    version integer,
    date date NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

