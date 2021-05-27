--
-- PostgreSQL database dump
--

-- Dumped from database version 12.6
-- Dumped by pg_dump version 12.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: ccg_or_cag; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.ccg_or_cag AS ENUM (
    'CCG',
    'CAG'
);


ALTER TYPE public.ccg_or_cag OWNER TO merico;

--
-- Name: config_type; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.config_type AS ENUM (
    'system',
    'team'
);


ALTER TYPE public.config_type OWNER TO merico;

--
-- Name: department_role; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.department_role AS ENUM (
    'department-admin',
    'department-member'
);


ALTER TYPE public.department_role OWNER TO merico;

--
-- Name: enum_Badges_grade; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public."enum_Badges_grade" AS ENUM (
    'GOLD',
    'SILVER',
    'BRONZE',
    'IRON',
    'NONE'
);


ALTER TYPE public."enum_Badges_grade" OWNER TO merico;

--
-- Name: enum_UserNotifications_type; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public."enum_UserNotifications_type" AS ENUM (
    'badge',
    'account',
    'repository',
    'generic'
);


ALTER TYPE public."enum_UserNotifications_type" OWNER TO merico;

--
-- Name: enum_contributors_provider; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.enum_contributors_provider AS ENUM (
    'github',
    'gitlab'
);


ALTER TYPE public.enum_contributors_provider OWNER TO merico;

--
-- Name: enum_pull_requests_provider; Type: TYPE; Schema: public; Owner: paulgoertzen
--

CREATE TYPE public.enum_pull_requests_provider AS ENUM (
    'github',
    'gitlab'
);


ALTER TYPE public.enum_pull_requests_provider OWNER TO paulgoertzen;

--
-- Name: import_status; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.import_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'ERROR'
);


ALTER TYPE public.import_status OWNER TO merico;

--
-- Name: jira_sync_log_status; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.jira_sync_log_status AS ENUM (
    'UNDERWAY',
    'SUCCESS',
    'CANCEL',
    'NETWORK_ERROR',
    'UNKNOWN_ERROR'
);


ALTER TYPE public.jira_sync_log_status OWNER TO merico;

--
-- Name: notification_severity; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.notification_severity AS ENUM (
    'BLOCKER',
    'CRITICAL',
    'MAJOR',
    'MINOR',
    'INFO'
);


ALTER TYPE public.notification_severity OWNER TO merico;

--
-- Name: quality_metric_type; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.quality_metric_type AS ENUM (
    'static_test_coverage',
    'doc_coverage',
    'modularity',
    'dryness',
    'issue_rate'
);


ALTER TYPE public.quality_metric_type OWNER TO merico;

--
-- Name: readiness; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.readiness AS ENUM (
    'NOT_INIT',
    'WAITING',
    'AUTH_REQUIRE',
    'NOT_REPO',
    'PRE_UNDERWAY',
    'PRE_READY',
    'UNDERWAY',
    'PULLING',
    'READY',
    'FAILURE',
    'UNSUPPORTED'
);


ALTER TYPE public.readiness OWNER TO merico;

--
-- Name: report_config_tag_evidence_type; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.report_config_tag_evidence_type AS ENUM (
    'STRING_INDEX',
    'PACKAGE',
    'CODE'
);


ALTER TYPE public.report_config_tag_evidence_type OWNER TO merico;

--
-- Name: report_status; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.report_status AS ENUM (
    'NOT_INIT',
    'UNDERWAY',
    'APPEND_UNDERWAY',
    'READY',
    'DUPLICATE',
    'FAILURE',
    'SIMPLIFY',
    'DELETE'
);


ALTER TYPE public.report_status OWNER TO merico;

--
-- Name: third_party_type; Type: TYPE; Schema: public; Owner: merico
--

CREATE TYPE public.third_party_type AS ENUM (
    'gitlab'
);


ALTER TYPE public.third_party_type OWNER TO merico;

--
-- Name: refreshjirasprintmaterializedviews(); Type: FUNCTION; Schema: public; Owner: merico
--

CREATE FUNCTION public.refreshjirasprintmaterializedviews() RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    BEGIN
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY jira_sprint_issue_summary';
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY jira_sprint_user_summary';
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY jira_sprint_user_daily';
      RETURN true;
    END
  $$;


ALTER FUNCTION public.refreshjirasprintmaterializedviews() OWNER TO merico;

--
-- Name: trigger_set_update_time(); Type: FUNCTION; Schema: public; Owner: merico
--

CREATE FUNCTION public.trigger_set_update_time() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.update_time = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_set_update_time() OWNER TO merico;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BadgeTypes; Type: TABLE; Schema: public; Owner: merico
--

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


ALTER TABLE public."BadgeTypes" OWNER TO merico;

--
-- Name: BadgeTypes_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."BadgeTypes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BadgeTypes_id_seq" OWNER TO merico;

--
-- Name: BadgeTypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."BadgeTypes_id_seq" OWNED BY public."BadgeTypes".id;


--
-- Name: Badges; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."Badges" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    grade public."enum_Badges_grade" NOT NULL,
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


ALTER TABLE public."Badges" OWNER TO merico;

--
-- Name: Badges_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."Badges_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Badges_id_seq" OWNER TO merico;

--
-- Name: Badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."Badges_id_seq" OWNED BY public."Badges".id;


--
-- Name: BaselineRepoMeta; Type: TABLE; Schema: public; Owner: merico
--

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


ALTER TABLE public."BaselineRepoMeta" OWNER TO merico;

--
-- Name: BaselineRepoMeta_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."BaselineRepoMeta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BaselineRepoMeta_id_seq" OWNER TO merico;

--
-- Name: BaselineRepoMeta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."BaselineRepoMeta_id_seq" OWNED BY public."BaselineRepoMeta".id;


--
-- Name: DeletedAccounts; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."DeletedAccounts" (
    id integer NOT NULL,
    email character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."DeletedAccounts" OWNER TO merico;

--
-- Name: DeletedAccounts_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."DeletedAccounts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DeletedAccounts_id_seq" OWNER TO merico;

--
-- Name: DeletedAccounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."DeletedAccounts_id_seq" OWNED BY public."DeletedAccounts".id;


--
-- Name: LoginAttempts; Type: TABLE; Schema: public; Owner: paulgoertzen
--

CREATE TABLE public."LoginAttempts" (
    id integer NOT NULL,
    "UserId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."LoginAttempts" OWNER TO paulgoertzen;

--
-- Name: LoginAttempts_id_seq; Type: SEQUENCE; Schema: public; Owner: paulgoertzen
--

CREATE SEQUENCE public."LoginAttempts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LoginAttempts_id_seq" OWNER TO paulgoertzen;

--
-- Name: LoginAttempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: paulgoertzen
--

ALTER SEQUENCE public."LoginAttempts_id_seq" OWNED BY public."LoginAttempts".id;


--
-- Name: PendingVerifications; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."PendingVerifications" (
    id integer NOT NULL,
    token character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PendingVerifications" OWNER TO merico;

--
-- Name: PendingVerifications_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."PendingVerifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PendingVerifications_id_seq" OWNER TO merico;

--
-- Name: PendingVerifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."PendingVerifications_id_seq" OWNED BY public."PendingVerifications".id;


--
-- Name: Projects; Type: TABLE; Schema: public; Owner: merico
--

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
    "incomingReportId" uuid,
    "latestReportId" uuid,
    priority integer DEFAULT 0 NOT NULL,
    "latestProtobuf" character varying(255)
);


ALTER TABLE public."Projects" OWNER TO merico;

--
-- Name: Projects_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."Projects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Projects_id_seq" OWNER TO merico;

--
-- Name: Projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."Projects_id_seq" OWNED BY public."Projects".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO merico;

--
-- Name: UserEmails; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."UserEmails" (
    id integer NOT NULL,
    "UserId" integer NOT NULL,
    email character varying(255) NOT NULL,
    "isVerified" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserEmails" OWNER TO merico;

--
-- Name: UserEmails_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."UserEmails_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserEmails_id_seq" OWNER TO merico;

--
-- Name: UserEmails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."UserEmails_id_seq" OWNED BY public."UserEmails".id;


--
-- Name: UserNotifications; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."UserNotifications" (
    id integer NOT NULL,
    "user" integer NOT NULL,
    message character varying(255) NOT NULL,
    type public."enum_UserNotifications_type" DEFAULT 'badge'::public."enum_UserNotifications_type" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."UserNotifications" OWNER TO merico;

--
-- Name: UserNotifications_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."UserNotifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserNotifications_id_seq" OWNER TO merico;

--
-- Name: UserNotifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."UserNotifications_id_seq" OWNED BY public."UserNotifications".id;


--
-- Name: UserProjects; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."UserProjects" (
    "UserId" integer NOT NULL,
    "ProjectId" integer NOT NULL,
    "isFavorite" boolean DEFAULT false,
    "latestAnalysisId" character varying(255)
);


ALTER TABLE public."UserProjects" OWNER TO merico;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    photo character varying(255),
    "displayName" character varying(255),
    "githubUsername" character varying(255),
    "githubApiUrl" character varying(255),
    "gitlabUsername" character varying(255),
    "githubAccessToken" jsonb,
    website character varying(255),
    "isOnboarded" boolean,
    "gitlabAccessToken" jsonb,
    "gitlabRefreshToken" jsonb,
    "githubRefreshToken" jsonb,
    "primaryEmail" character varying(255),
    "isPublic" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Users" OWNER TO merico;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Users_id_seq" OWNER TO merico;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: batches; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.batches (
    batch_time timestamp with time zone NOT NULL,
    project_id uuid NOT NULL,
    version timestamp with time zone,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.batches OWNER TO merico;

--
-- Name: ca_analysis; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.ca_analysis (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    type character varying(50) NOT NULL,
    signature character varying(255) NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(50) DEFAULT 'CREATED'::character varying NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    project_id uuid,
    result bytea,
    notify_result_time timestamp with time zone,
    progress double precision,
    progress_info jsonb DEFAULT '{}'::jsonb NOT NULL,
    error_message text,
    traceback text,
    report_id uuid,
    shared_fs_index integer DEFAULT 0 NOT NULL,
    source_id uuid,
    source_type character varying(50) DEFAULT 'DEFAULT'::character varying NOT NULL
);


ALTER TABLE public.ca_analysis OWNER TO merico;

--
-- Name: ca_project; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.ca_project (
    id bigint NOT NULL,
    source_id uuid NOT NULL,
    source_type character varying(50) DEFAULT 'DEFAULT'::character varying NOT NULL,
    shared_fs_index integer DEFAULT 0 NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ca_project OWNER TO merico;

--
-- Name: ca_project_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public.ca_project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ca_project_id_seq OWNER TO merico;

--
-- Name: ca_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public.ca_project_id_seq OWNED BY public.ca_project.id;


--
-- Name: ca_task; Type: TABLE; Schema: public; Owner: merico
--

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
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    result bytea,
    name character varying(50),
    traceback text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    tried_count integer DEFAULT 0 NOT NULL,
    hostname character varying(255)
);


ALTER TABLE public.ca_task OWNER TO merico;

--
-- Name: ca_task_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public.ca_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ca_task_id_seq OWNER TO merico;

--
-- Name: ca_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public.ca_task_id_seq OWNED BY public.ca_task.id;


--
-- Name: config; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.config (
    key character varying(255) NOT NULL,
    value text,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    type public.config_type DEFAULT 'system'::public.config_type,
    team_id uuid,
    id uuid DEFAULT public.gen_random_uuid() NOT NULL
);


ALTER TABLE public.config OWNER TO merico;

--
-- Name: contributors; Type: TABLE; Schema: public; Owner: paulgoertzen
--

CREATE TABLE public.contributors (
    id integer NOT NULL,
    email character varying(255),
    provider public.enum_contributors_provider,
    remote_id integer,
    display_name character varying(255),
    username character varying(255),
    profile_url character varying(255),
    photo_url character varying(255),
    user_id integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.contributors OWNER TO paulgoertzen;

--
-- Name: contributors_id_seq; Type: SEQUENCE; Schema: public; Owner: paulgoertzen
--

CREATE SEQUENCE public.contributors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contributors_id_seq OWNER TO paulgoertzen;

--
-- Name: contributors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: paulgoertzen
--

ALTER SEQUENCE public.contributors_id_seq OWNED BY public.contributors.id;


--
-- Name: department; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.department (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    "parentId" uuid,
    mpath character varying,
    team_id uuid,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.department OWNER TO merico;

--
-- Name: email_notification; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.email_notification (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    params jsonb,
    team_id uuid,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_notification OWNER TO merico;

--
-- Name: email_notification_template; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.email_notification_template (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_cn text NOT NULL,
    params_desc jsonb,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_notification_template OWNER TO merico;

--
-- Name: emails; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.emails (
    user_id uuid,
    email character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_primary boolean DEFAULT false NOT NULL
);


ALTER TABLE public.emails OWNER TO merico;

--
-- Name: project_commit; Type: TABLE; Schema: public; Owner: merico
--

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


ALTER TABLE public.project_commit OWNER TO merico;

--
-- Name: team_user; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_user (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying,
    salary double precision,
    rank character varying,
    legacy_promotion_date date,
    job_number character varying,
    enable boolean DEFAULT false NOT NULL,
    role character varying,
    department_id uuid,
    promotion_date timestamp with time zone
);


ALTER TABLE public.team_user OWNER TO merico;

--
-- Name: users; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.users (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.users OWNER TO merico;

--
-- Name: email_to_primary_email_booster; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.email_to_primary_email_booster AS
 WITH tu_email AS (
         SELECT emails.email,
            users.primary_email,
            team_user.name,
            team_user.title,
            team_user.team_id,
            team_user.id AS team_user_id
           FROM ((public.emails
             LEFT JOIN public.users ON ((users.id = emails.user_id)))
             LEFT JOIN public.team_user ON ((team_user.user_id = emails.user_id)))
        ), c_email AS (
         SELECT DISTINCT ON (c.author_email) c.author_email,
            c.author_name
           FROM public.project_commit c
          ORDER BY c.author_email, c.author_timestamp DESC
        ), u_email AS (
         SELECT COALESCE(tu.primary_email, c.author_email) AS primary_email,
            COALESCE(tu.name, c.author_name) AS name,
            COALESCE(tu.email, c.author_email) AS email,
            tu.title AS user_title,
            tu.team_id,
            tu.team_user_id
           FROM (c_email c
             FULL JOIN tu_email tu ON (((tu.email)::text = (c.author_email)::text)))
        )
 SELECT DISTINCT ON (u_email.email, a.name, u_email.primary_email) u_email.email,
    a.name AS user_name,
    u_email.primary_email,
    u_email.user_title,
    u_email.team_id,
    u_email.team_user_id
   FROM (u_email
     JOIN ( SELECT DISTINCT ON (u_email_1.primary_email) u_email_1.primary_email,
            u_email_1.name
           FROM u_email u_email_1) a ON (((u_email.primary_email)::text = (a.primary_email)::text)))
  WITH NO DATA;


ALTER TABLE public.email_to_primary_email_booster OWNER TO merico;

--
-- Name: gitlab_importing_task; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.gitlab_importing_task (
    id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    outer_project_id character varying NOT NULL,
    path_with_namespace character varying NOT NULL,
    http_url character varying NOT NULL,
    state public.import_status NOT NULL,
    team_user_id uuid NOT NULL,
    background boolean DEFAULT false,
    preprocess_error_code character varying,
    preprocess_error_detail character varying
);


ALTER TABLE public.gitlab_importing_task OWNER TO merico;

--
-- Name: invite_user; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.invite_user (
    hash uuid DEFAULT public.gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    role character varying,
    completed boolean DEFAULT false,
    project_group_id uuid,
    inviter_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    project_id uuid
);


ALTER TABLE public.invite_user OWNER TO merico;

--
-- Name: jira_attachment; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_attachment (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_attachment OWNER TO merico;

--
-- Name: jira_comment; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_comment (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_comment OWNER TO merico;

--
-- Name: jira_field; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_field (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    id character varying(255),
    name character varying(255),
    custom boolean,
    orderable boolean,
    navigable boolean,
    searchable boolean,
    schema_type character varying(255),
    schema_items character varying(255),
    schema_system character varying(255),
    field_options jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.jira_field OWNER TO merico;

--
-- Name: jira_fix_version; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_fix_version (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_fix_version OWNER TO merico;

--
-- Name: jira_issue; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_issue (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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
    custom_fields_story_point double precision,
    custom_fields_estimate_story_point double precision,
    custom_fields_sprints character varying(255)[],
    custom_fields_start_date timestamp with time zone,
    custom_fields_end_date timestamp with time zone,
    fields_assignee_display_name character varying(255),
    fields_parent_id integer,
    fields_parent_self character varying(255),
    fields_parent_key character varying(255)
);


ALTER TABLE public.jira_issue OWNER TO merico;

--
-- Name: jira_issue_changelog; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_issue_changelog (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_issue_changelog OWNER TO merico;

--
-- Name: jira_issuelink; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_issuelink (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_issuelink OWNER TO merico;

--
-- Name: jira_user; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_user (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_user OWNER TO merico;

--
-- Name: jira_metric; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_metric AS
 WITH comment_num AS (
         SELECT count(1) AS comment_num,
            jira_comment.platform_id,
            jira_comment.issue_id
           FROM public.jira_comment
          GROUP BY jira_comment.platform_id, jira_comment.issue_id
        ), assignee_num AS (
         SELECT count(1) AS assignee_num,
            sum(jira_issue.fields_timetracking_original_estimate_seconds) AS estimate_seconds_total,
            sum(jira_issue.fields_timetracking_time_spent_seconds) AS spent_seconds_total,
            sum(jira_issue.custom_fields_story_point) AS story_point,
            sum(jira_issue.custom_fields_estimate_story_point) AS estimate_story_point,
            sum(comment_num.comment_num) AS comment_num_total,
            count(1) FILTER (WHERE (((jira_issue.fields_priority_id)::text = '4'::text) OR ((jira_issue.fields_priority_id)::text = '5'::text))) AS assignee_low_num,
            count(1) FILTER (WHERE ((jira_issue.fields_priority_id)::text = '3'::text)) AS assignee_medium_num,
            count(1) FILTER (WHERE (((jira_issue.fields_priority_id)::text = '1'::text) OR ((jira_issue.fields_priority_id)::text = '2'::text))) AS assignee_high_num,
            count(1) FILTER (WHERE ((jira_issue.fields_status_status_category_id)::text = '3'::text)) AS assignee_done_num,
            count(1) FILTER (WHERE (((jira_issue.fields_status_status_category_id)::text = '2'::text) OR ((jira_issue.fields_status_status_category_id)::text = '4'::text))) AS assignee_todo_num,
            sum(date_part('epoch'::text, ((jira_issue.fields_resolutiondate)::timestamp with time zone - jira_issue.fields_created))) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)) AS resolution_time_total,
            (sum(date_part('epoch'::text, ((jira_issue.fields_resolutiondate)::timestamp with time zone - jira_issue.fields_created))) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)) / (count(1) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)))::double precision) AS resolution_time_avg,
            jira_user_1.platform_id,
            jira_user_1.email_address
           FROM ((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_assignee_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             LEFT JOIN comment_num ON (((comment_num.issue_id = jira_issue.id) AND (jira_user_1.platform_id = comment_num.platform_id))))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address
        ), creator_num AS (
         SELECT count(1) AS creator_num,
            jira_user_1.platform_id,
            jira_user_1.email_address
           FROM (public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_creator_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address
        ), reporter_num AS (
         SELECT count(1) AS reporter_num,
            jira_user_1.platform_id,
            jira_user_1.email_address
           FROM (public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_reporter_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address
        )
 SELECT DISTINCT jira_user.email_address,
    jira_user.platform_id,
    assignee_num.estimate_seconds_total,
    assignee_num.spent_seconds_total,
    assignee_num.story_point,
    assignee_num.estimate_story_point,
    COALESCE(assignee_num.assignee_num, (0)::bigint) AS assignee_num,
    COALESCE(assignee_num.comment_num_total, (0)::numeric) AS comment_num_total,
    COALESCE(assignee_num.assignee_low_num, (0)::bigint) AS assignee_low_num,
    COALESCE(assignee_num.assignee_medium_num, (0)::bigint) AS assignee_medium_num,
    COALESCE(assignee_num.assignee_high_num, (0)::bigint) AS assignee_high_num,
    COALESCE(assignee_num.assignee_todo_num, (0)::bigint) AS assignee_todo_num,
    COALESCE(assignee_num.assignee_done_num, (0)::bigint) AS assignee_done_num,
    COALESCE(assignee_num.resolution_time_total, (0)::double precision) AS resolution_time_total,
    COALESCE(assignee_num.resolution_time_avg, (0)::double precision) AS resolution_time_avg,
    COALESCE(creator_num.creator_num, (0)::bigint) AS creator_num,
    COALESCE(reporter_num.reporter_num, (0)::bigint) AS reporter_num
   FROM (((public.jira_user
     LEFT JOIN assignee_num ON ((((assignee_num.email_address)::text = (jira_user.email_address)::text) AND (assignee_num.platform_id = jira_user.platform_id))))
     LEFT JOIN creator_num ON ((((creator_num.email_address)::text = (jira_user.email_address)::text) AND (creator_num.platform_id = jira_user.platform_id))))
     LEFT JOIN reporter_num ON ((((reporter_num.email_address)::text = (jira_user.email_address)::text) AND (reporter_num.platform_id = jira_user.platform_id))))
  WITH NO DATA;


ALTER TABLE public.jira_metric OWNER TO merico;

--
-- Name: jira_sprint; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_sprint AS
 SELECT jira_issue.platform_id,
    count(1) AS issue_num,
    sprint_name.sprint_name
   FROM (public.jira_issue
     LEFT JOIN LATERAL unnest(jira_issue.custom_fields_sprints) sprint_name(sprint_name) ON (true))
  GROUP BY jira_issue.platform_id, sprint_name.sprint_name
  WITH NO DATA;


ALTER TABLE public.jira_sprint OWNER TO merico;

--
-- Name: jira_metric_sprint; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_metric_sprint AS
 WITH comment_num AS (
         SELECT count(1) AS comment_num,
            jira_comment.platform_id,
            jira_comment.issue_id
           FROM public.jira_comment
          GROUP BY jira_comment.platform_id, jira_comment.issue_id
        ), assignee_num AS (
         SELECT count(1) AS assignee_num,
            jira_user_1.platform_id,
            sum(jira_issue.fields_timetracking_original_estimate_seconds) AS estimate_seconds_total,
            sum(jira_issue.fields_timetracking_time_spent_seconds) AS spent_seconds_total,
            sum(jira_issue.custom_fields_story_point) AS story_point,
            sum(jira_issue.custom_fields_estimate_story_point) AS estimate_story_point,
            sum(comment_num.comment_num) AS comment_num_total,
            count(1) FILTER (WHERE (((jira_issue.fields_priority_id)::text = '4'::text) OR ((jira_issue.fields_priority_id)::text = '5'::text))) AS assignee_low_num,
            count(1) FILTER (WHERE ((jira_issue.fields_priority_id)::text = '3'::text)) AS assignee_medium_num,
            count(1) FILTER (WHERE (((jira_issue.fields_priority_id)::text = '1'::text) OR ((jira_issue.fields_priority_id)::text = '2'::text))) AS assignee_high_num,
            count(1) FILTER (WHERE ((jira_issue.fields_status_status_category_id)::text = '3'::text)) AS assignee_done_num,
            count(1) FILTER (WHERE (((jira_issue.fields_status_status_category_id)::text = '2'::text) OR ((jira_issue.fields_status_status_category_id)::text = '4'::text))) AS assignee_todo_num,
            sum(date_part('epoch'::text, ((jira_issue.fields_resolutiondate)::timestamp with time zone - jira_issue.fields_created))) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)) AS resolution_time_total,
            (sum(date_part('epoch'::text, ((jira_issue.fields_resolutiondate)::timestamp with time zone - jira_issue.fields_created))) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)) / (count(1) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)))::double precision) AS resolution_time_avg,
            jira_user_1.email_address,
            sprint_name.sprint_name
           FROM (((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_assignee_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             LEFT JOIN comment_num ON (((comment_num.issue_id = jira_issue.id) AND (jira_user_1.platform_id = comment_num.platform_id))))
             LEFT JOIN LATERAL unnest(jira_issue.custom_fields_sprints) sprint_name(sprint_name) ON (true))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address, sprint_name.sprint_name
        ), creator_num AS (
         SELECT count(1) AS creator_num,
            jira_user_1.platform_id,
            jira_user_1.email_address,
            sprint_name.sprint_name
           FROM ((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_creator_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             LEFT JOIN LATERAL unnest(jira_issue.custom_fields_sprints) sprint_name(sprint_name) ON (true))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address, sprint_name.sprint_name
        ), reporter_num AS (
         SELECT count(1) AS reporter_num,
            jira_user_1.platform_id,
            jira_user_1.email_address,
            sprint_name.sprint_name
           FROM ((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_reporter_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             LEFT JOIN LATERAL unnest(jira_issue.custom_fields_sprints) sprint_name(sprint_name) ON (true))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address, sprint_name.sprint_name
        )
 SELECT DISTINCT jira_user.email_address,
    jira_sprint.sprint_name,
    jira_user.platform_id,
    assignee_num.estimate_seconds_total,
    assignee_num.spent_seconds_total,
    assignee_num.story_point,
    assignee_num.estimate_story_point,
    COALESCE(jira_sprint.issue_num, (0)::bigint) AS version_issue_num,
    COALESCE(assignee_num.assignee_num, (0)::bigint) AS assignee_num,
    COALESCE(assignee_num.comment_num_total, (0)::numeric) AS comment_num_total,
    COALESCE(assignee_num.assignee_low_num, (0)::bigint) AS assignee_low_num,
    COALESCE(assignee_num.assignee_medium_num, (0)::bigint) AS assignee_medium_num,
    COALESCE(assignee_num.assignee_high_num, (0)::bigint) AS assignee_high_num,
    COALESCE(assignee_num.assignee_todo_num, (0)::bigint) AS assignee_todo_num,
    COALESCE(assignee_num.assignee_done_num, (0)::bigint) AS assignee_done_num,
    COALESCE(assignee_num.resolution_time_total, (0)::double precision) AS resolution_time_total,
    COALESCE(assignee_num.resolution_time_avg, (0)::double precision) AS resolution_time_avg,
    COALESCE(creator_num.creator_num, (0)::bigint) AS creator_num,
    COALESCE(reporter_num.reporter_num, (0)::bigint) AS reporter_num
   FROM ((((public.jira_user
     JOIN public.jira_sprint ON ((jira_user.platform_id = jira_sprint.platform_id)))
     LEFT JOIN assignee_num ON ((((assignee_num.email_address)::text = (jira_user.email_address)::text) AND ((assignee_num.sprint_name)::text = (jira_sprint.sprint_name)::text) AND (assignee_num.platform_id = jira_user.platform_id))))
     LEFT JOIN creator_num ON ((((creator_num.email_address)::text = (jira_user.email_address)::text) AND ((creator_num.sprint_name)::text = (jira_sprint.sprint_name)::text) AND (creator_num.platform_id = jira_user.platform_id))))
     LEFT JOIN reporter_num ON ((((reporter_num.email_address)::text = (jira_user.email_address)::text) AND ((reporter_num.sprint_name)::text = (jira_sprint.sprint_name)::text) AND (reporter_num.platform_id = jira_user.platform_id))))
  WITH NO DATA;


ALTER TABLE public.jira_metric_sprint OWNER TO merico;

--
-- Name: jira_version; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_version AS
 SELECT jira_fix_version.platform_id,
    count(1) AS issue_num,
    jira_fix_version.name AS version_name
   FROM public.jira_fix_version
  GROUP BY jira_fix_version.platform_id, jira_fix_version.name
  WITH NO DATA;


ALTER TABLE public.jira_version OWNER TO merico;

--
-- Name: jira_metric_version; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_metric_version AS
 WITH comment_num AS (
         SELECT count(1) AS comment_num,
            jira_comment.platform_id,
            jira_comment.issue_id
           FROM public.jira_comment
          GROUP BY jira_comment.platform_id, jira_comment.issue_id
        ), assignee_num AS (
         SELECT count(1) AS assignee_num,
            jira_user_1.platform_id,
            sum(jira_issue.fields_timetracking_original_estimate_seconds) AS estimate_seconds_total,
            sum(jira_issue.fields_timetracking_time_spent_seconds) AS spent_seconds_total,
            sum(jira_issue.custom_fields_story_point) AS story_point,
            sum(jira_issue.custom_fields_estimate_story_point) AS estimate_story_point,
            sum(comment_num.comment_num) AS comment_num_total,
            count(1) FILTER (WHERE (((jira_issue.fields_priority_id)::text = '4'::text) OR ((jira_issue.fields_priority_id)::text = '5'::text))) AS assignee_low_num,
            count(1) FILTER (WHERE ((jira_issue.fields_priority_id)::text = '3'::text)) AS assignee_medium_num,
            count(1) FILTER (WHERE (((jira_issue.fields_priority_id)::text = '1'::text) OR ((jira_issue.fields_priority_id)::text = '2'::text))) AS assignee_high_num,
            count(1) FILTER (WHERE ((jira_issue.fields_status_status_category_id)::text = '3'::text)) AS assignee_done_num,
            count(1) FILTER (WHERE (((jira_issue.fields_status_status_category_id)::text = '2'::text) OR ((jira_issue.fields_status_status_category_id)::text = '4'::text))) AS assignee_todo_num,
            sum(date_part('epoch'::text, ((jira_issue.fields_resolutiondate)::timestamp with time zone - jira_issue.fields_created))) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)) AS resolution_time_total,
            (sum(date_part('epoch'::text, ((jira_issue.fields_resolutiondate)::timestamp with time zone - jira_issue.fields_created))) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)) / (count(1) FILTER (WHERE (jira_issue.fields_resolutiondate IS NOT NULL)))::double precision) AS resolution_time_avg,
            jira_user_1.email_address,
            jira_fix_version.name AS version_name
           FROM (((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_assignee_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             LEFT JOIN comment_num ON (((comment_num.issue_id = jira_issue.id) AND (jira_user_1.platform_id = comment_num.platform_id))))
             LEFT JOIN public.jira_fix_version ON (((jira_issue.uuid = jira_fix_version.issue_uuid) AND (jira_user_1.platform_id = jira_fix_version.platform_id))))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address, jira_fix_version.name
        ), creator_num AS (
         SELECT count(1) AS creator_num,
            jira_user_1.platform_id,
            jira_user_1.email_address,
            jira_fix_version.name AS version_name
           FROM ((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_creator_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             JOIN public.jira_fix_version ON (((jira_issue.uuid = jira_fix_version.issue_uuid) AND (jira_user_1.platform_id = jira_fix_version.platform_id))))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address, jira_fix_version.name
        ), reporter_num AS (
         SELECT count(1) AS reporter_num,
            jira_user_1.platform_id,
            jira_user_1.email_address,
            jira_fix_version.name AS version_name
           FROM ((public.jira_user jira_user_1
             JOIN public.jira_issue ON (((jira_issue.fields_reporter_uuid = jira_user_1.uuid) AND (jira_user_1.platform_id = jira_issue.platform_id))))
             JOIN public.jira_fix_version ON (((jira_issue.uuid = jira_fix_version.issue_uuid) AND (jira_user_1.platform_id = jira_fix_version.platform_id))))
          GROUP BY jira_user_1.platform_id, jira_user_1.email_address, jira_fix_version.name
        )
 SELECT DISTINCT jira_user.email_address,
    jira_version.version_name,
    jira_user.platform_id,
    assignee_num.estimate_seconds_total,
    assignee_num.spent_seconds_total,
    assignee_num.story_point,
    assignee_num.estimate_story_point,
    COALESCE(jira_version.issue_num, (0)::bigint) AS version_issue_num,
    COALESCE(assignee_num.assignee_num, (0)::bigint) AS assignee_num,
    COALESCE(assignee_num.comment_num_total, (0)::numeric) AS comment_num_total,
    COALESCE(assignee_num.assignee_low_num, (0)::bigint) AS assignee_low_num,
    COALESCE(assignee_num.assignee_medium_num, (0)::bigint) AS assignee_medium_num,
    COALESCE(assignee_num.assignee_high_num, (0)::bigint) AS assignee_high_num,
    COALESCE(assignee_num.assignee_todo_num, (0)::bigint) AS assignee_todo_num,
    COALESCE(assignee_num.assignee_done_num, (0)::bigint) AS assignee_done_num,
    COALESCE(assignee_num.resolution_time_total, (0)::double precision) AS resolution_time_total,
    COALESCE(assignee_num.resolution_time_avg, (0)::double precision) AS resolution_time_avg,
    COALESCE(creator_num.creator_num, (0)::bigint) AS creator_num,
    COALESCE(reporter_num.reporter_num, (0)::bigint) AS reporter_num
   FROM ((((public.jira_user
     JOIN public.jira_version ON ((jira_user.platform_id = jira_version.platform_id)))
     LEFT JOIN assignee_num ON ((((assignee_num.email_address)::text = (jira_user.email_address)::text) AND ((assignee_num.version_name)::text = (jira_version.version_name)::text) AND (assignee_num.platform_id = jira_user.platform_id))))
     LEFT JOIN creator_num ON ((((creator_num.email_address)::text = (jira_user.email_address)::text) AND ((creator_num.version_name)::text = (jira_version.version_name)::text) AND (creator_num.platform_id = jira_user.platform_id))))
     LEFT JOIN reporter_num ON ((((reporter_num.email_address)::text = (jira_user.email_address)::text) AND ((reporter_num.version_name)::text = (jira_version.version_name)::text) AND (reporter_num.platform_id = jira_user.platform_id))))
  WITH NO DATA;


ALTER TABLE public.jira_metric_version OWNER TO merico;

--
-- Name: jira_platform; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_platform (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_platform OWNER TO merico;

--
-- Name: jira_platform_sync_log; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_platform_sync_log (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    start_team_user_id uuid,
    total integer,
    handle_total integer,
    is_finish boolean DEFAULT false,
    finish_status public.jira_sync_log_status,
    error_message character varying(255) DEFAULT NULL::character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jira_platform_sync_log OWNER TO merico;

--
-- Name: jira_rapidview; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_rapidview (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_rapidview OWNER TO merico;

--
-- Name: jira_rapidview_sprint; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_rapidview_sprint (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    rapidview_id character varying(255) NOT NULL,
    id character varying(255),
    name character varying(255),
    state character varying(255),
    sequence integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone
);


ALTER TABLE public.jira_rapidview_sprint OWNER TO merico;

--
-- Name: jira_sprint_commit_hashs; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_sprint_commit_hashs AS
 SELECT jira_user.platform_id,
    array_agg(jira_comment.commit_hash) AS commit_hashs,
    sprint_name.sprint_name
   FROM (((public.jira_user
     JOIN public.jira_issue ON (((jira_issue.fields_assignee_uuid = jira_user.uuid) AND (jira_user.platform_id = jira_issue.platform_id))))
     JOIN public.jira_comment ON (((jira_issue.uuid = jira_comment.issue_uuid) AND (jira_user.platform_id = jira_comment.platform_id) AND (jira_comment.commit_hash IS NOT NULL))))
     LEFT JOIN LATERAL unnest(jira_issue.custom_fields_sprints) sprint_name(sprint_name) ON (true))
  GROUP BY jira_user.platform_id, sprint_name.sprint_name
  WITH NO DATA;


ALTER TABLE public.jira_sprint_commit_hashs OWNER TO merico;

--
-- Name: jira_subtask; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_subtask (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    platform_id uuid NOT NULL,
    issue_uuid uuid,
    issue_id integer NOT NULL,
    sub_issue_uuid uuid,
    sub_issue_id integer NOT NULL
);


ALTER TABLE public.jira_subtask OWNER TO merico;

--
-- Name: jira_version_commit_hashs; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.jira_version_commit_hashs AS
 SELECT jira_user.platform_id,
    array_agg(jira_comment.commit_hash) AS commit_hashs,
    jira_fix_version.name AS version_name
   FROM (((public.jira_user
     JOIN public.jira_issue ON (((jira_issue.fields_assignee_uuid = jira_user.uuid) AND (jira_user.platform_id = jira_issue.platform_id))))
     JOIN public.jira_comment ON (((jira_issue.uuid = jira_comment.issue_uuid) AND (jira_user.platform_id = jira_comment.platform_id) AND (jira_comment.commit_hash IS NOT NULL))))
     JOIN public.jira_fix_version ON (((jira_issue.uuid = jira_fix_version.issue_uuid) AND (jira_user.platform_id = jira_fix_version.platform_id))))
  GROUP BY jira_user.platform_id, jira_fix_version.name
  WITH NO DATA;


ALTER TABLE public.jira_version_commit_hashs OWNER TO merico;

--
-- Name: jira_worklog; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.jira_worklog (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.jira_worklog OWNER TO merico;

--
-- Name: large_screen; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.large_screen (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    play_interval integer DEFAULT 10000 NOT NULL
);


ALTER TABLE public.large_screen OWNER TO merico;

--
-- Name: large_screen_page; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.large_screen_page (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    layout character varying NOT NULL,
    sort integer NOT NULL,
    large_screen_id uuid NOT NULL
);


ALTER TABLE public.large_screen_page OWNER TO merico;

--
-- Name: large_screen_page_chart; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.large_screen_page_chart (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    sort integer NOT NULL,
    chart_key character varying NOT NULL,
    ext jsonb DEFAULT '{}'::jsonb NOT NULL,
    large_screen_id uuid NOT NULL,
    large_screen_page_id uuid NOT NULL
);


ALTER TABLE public.large_screen_page_chart OWNER TO merico;

--
-- Name: license; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.license (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
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


ALTER TABLE public.license OWNER TO merico;

--
-- Name: links; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.links (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    link_url character varying(255),
    type integer,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.links OWNER TO merico;

--
-- Name: metric_column_group; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.metric_column_group (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    scene_id uuid NOT NULL,
    name character varying(255),
    columns character varying(255)[],
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.metric_column_group OWNER TO merico;

--
-- Name: metric_scene; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.metric_scene (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    update_team_user_id uuid,
    name character varying(255),
    dimensions character varying(255)[],
    filter_list jsonb,
    is_delete boolean DEFAULT false,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.metric_scene OWNER TO merico;

--
-- Name: COLUMN metric_scene.filter_list; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.metric_scene.filter_list IS '{if_exclude, column, op, value}[]';


--
-- Name: migrate_log; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.migrate_log (
    filename character varying NOT NULL,
    version integer,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.migrate_log OWNER TO merico;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    type character varying NOT NULL,
    info jsonb DEFAULT '{}'::jsonb NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification OWNER TO merico;

--
-- Name: notification_type_setting; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.notification_type_setting (
    type character varying NOT NULL,
    severity public.notification_severity NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_type_setting OWNER TO merico;

--
-- Name: notification_user_stat; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.notification_user_stat (
    notification_id uuid,
    user_id uuid,
    view_time timestamp with time zone,
    mail_sent_time timestamp with time zone,
    delete_time timestamp with time zone,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_user_stat OWNER TO merico;

--
-- Name: oauth; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.oauth (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    app integer NOT NULL,
    app_user_id character varying NOT NULL,
    token character varying NOT NULL,
    expiration timestamp with time zone,
    refresh_token character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.oauth OWNER TO merico;

--
-- Name: primary_email_booster; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.primary_email_booster (
    primary_email character varying(255),
    user_name character varying,
    user_title character varying(255),
    team_id uuid
);


ALTER TABLE public.primary_email_booster OWNER TO merico;

--
-- Name: project_analytics_settings; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_analytics_settings (
    project_id uuid NOT NULL,
    excluded_paths json DEFAULT '[]'::json NOT NULL,
    excluded_commit_hashes json DEFAULT '[]'::json NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    default_ref character varying(255) DEFAULT ''::character varying NOT NULL,
    custom_excluded_paths json DEFAULT '[]'::json,
    sys_excluded_paths json DEFAULT '[]'::json,
    custom_glob_excluded_paths json DEFAULT '[]'::json,
    commit_after_time timestamp with time zone,
    commit_auto_exclude integer,
    CONSTRAINT project_analytics_settings_commit_auto_exclude_check CHECK ((commit_auto_exclude >= 0))
);


ALTER TABLE public.project_analytics_settings OWNER TO merico;

--
-- Name: COLUMN project_analytics_settings.default_ref; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_analytics_settings.default_ref IS 'which branch/tag want to by analysis. eg: refs/remotes/origin/jwilson.0710.okhttp401';


--
-- Name: COLUMN project_analytics_settings.custom_excluded_paths; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_analytics_settings.custom_excluded_paths IS 'The excluded path which is input by user. Not picking from recommendation exclude path.';


--
-- Name: COLUMN project_analytics_settings.custom_glob_excluded_paths; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_analytics_settings.custom_glob_excluded_paths IS 'The glob excluded path which is input by user. ';


--
-- Name: COLUMN project_analytics_settings.commit_after_time; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_analytics_settings.commit_after_time IS 'git rev-list --before=1576088000 --after=1576077000';


--
-- Name: COLUMN project_analytics_settings.commit_auto_exclude; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_analytics_settings.commit_auto_exclude IS 'Auto exclude commit if SLOC of it is greater than `commit_auto_exclude`, NULL means tolerance mode equals to 10000';


--
-- Name: project_auth; Type: TABLE; Schema: public; Owner: merico
--

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


ALTER TABLE public.project_auth OWNER TO merico;

--
-- Name: project_commit_remark; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_commit_remark (
    project_id uuid NOT NULL,
    hash character(40) NOT NULL,
    remark character varying(140) NOT NULL
);


ALTER TABLE public.project_commit_remark OWNER TO merico;

--
-- Name: report; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    project_id uuid,
    meta_dev_value double precision NOT NULL,
    version character varying(255) NOT NULL,
    commit_dead_time timestamp with time zone NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    add_line integer DEFAULT 0 NOT NULL,
    delete_line integer DEFAULT 0 NOT NULL,
    num_commits integer DEFAULT 0 NOT NULL,
    dev_equivalent double precision DEFAULT 0 NOT NULL,
    commit_dead_hash character(40) NOT NULL,
    detail_versions jsonb DEFAULT '[]'::jsonb NOT NULL,
    commit_start_time timestamp with time zone,
    excluded_paths jsonb DEFAULT '[]'::jsonb,
    excluded_commit_hashes jsonb DEFAULT '[]'::jsonb,
    default_ref character varying(255) DEFAULT ''::character varying,
    commit_aspect_hash character(40) NOT NULL
);


ALTER TABLE public.report OWNER TO merico;

--
-- Name: report_commit_value; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_commit_value (
    hash character(40) NOT NULL,
    report_id uuid NOT NULL,
    dev_value double precision NOT NULL,
    dev_equivalent double precision DEFAULT 0 NOT NULL,
    effective_add_line integer DEFAULT 0 NOT NULL,
    effective_delete_line integer DEFAULT 0 NOT NULL,
    cyclomatic_total integer,
    big_cyclomatic_function_number integer,
    in_default_ref boolean DEFAULT false NOT NULL,
    abs_dev_value double precision,
    abs_dev_value_add_line_ratio double precision,
    num_functions integer
);


ALTER TABLE public.report_commit_value OWNER TO merico;

--
-- Name: COLUMN report_commit_value.in_default_ref; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_commit_value.in_default_ref IS 'means if this commit is in default ref';


--
-- Name: project_commits_with_analysis; Type: VIEW; Schema: public; Owner: merico
--

CREATE VIEW public.project_commits_with_analysis AS
 SELECT "Projects"."gitUrl" AS git_url,
    commit.commit_timestamp,
    commit.author_email,
    report_commit_value.dev_equivalent,
    report_commit_value.dev_value
   FROM (((public."Projects"
     LEFT JOIN public.report ON (((report.id = "Projects"."latestReportId") AND (report.detail_versions @> '"report_email_metric"'::jsonb))))
     LEFT JOIN public.project_commit commit ON ((commit.project_id = "Projects"."eeProjectId")))
     LEFT JOIN public.report_commit_value ON (((commit.hash = report_commit_value.hash) AND (report.id = report_commit_value.report_id))))
  WHERE (report_commit_value.report_id IS NOT NULL);


ALTER TABLE public.project_commits_with_analysis OWNER TO merico;

--
-- Name: project_contrib; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_contrib (
    project_id uuid NOT NULL,
    dev_value double precision NOT NULL,
    distribution bytea,
    version timestamp with time zone NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    top_commits bytea,
    format_email character varying(255)
);


ALTER TABLE public.project_contrib OWNER TO merico;

--
-- Name: project_group; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_group (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    logo_url text,
    parent_id uuid,
    parent_ids uuid[],
    sort integer DEFAULT 0,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    out_group_id character varying(255)
);


ALTER TABLE public.project_group OWNER TO merico;

--
-- Name: COLUMN project_group.out_group_id; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_group.out_group_id IS 'other system group id (gitlab)';


--
-- Name: project_group_project; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_group_project (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    project_group_id uuid NOT NULL,
    project_id uuid NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_group_project OWNER TO merico;

--
-- Name: project_group_team_user; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_group_team_user (
    project_group_id uuid NOT NULL,
    team_user_id uuid NOT NULL,
    role character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_group_team_user OWNER TO merico;

--
-- Name: project_pre_process_result; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_pre_process_result (
    project_id uuid NOT NULL,
    num_commits bigint DEFAULT 0 NOT NULL,
    num_developers bigint DEFAULT 0 NOT NULL,
    total_insertions bigint DEFAULT 0 NOT NULL,
    total_deletions bigint DEFAULT 0 NOT NULL,
    language_distribution json DEFAULT '{}'::json NOT NULL,
    excluded_paths json DEFAULT '{}'::json NOT NULL,
    supported_languages json DEFAULT '[]'::json NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_pre_process_result OWNER TO merico;

--
-- Name: project_report_state; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_report_state (
    report_id uuid NOT NULL,
    project_id uuid,
    status public.report_status DEFAULT 'NOT_INIT'::public.report_status,
    default_ref character varying(255) DEFAULT ''::character varying,
    commit_before_time timestamp with time zone,
    last_sync_time timestamp with time zone,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    analysis_id uuid,
    start_team_user_id uuid,
    analysis_type character varying(255),
    commit_after_time timestamp with time zone,
    progress double precision,
    error_message text,
    traceback text,
    finish_time timestamp with time zone,
    analytics_settings_version timestamp with time zone
);


ALTER TABLE public.project_report_state OWNER TO merico;

--
-- Name: COLUMN project_report_state.commit_after_time; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_report_state.commit_after_time IS 'git rev-list --before=1576088000 --after=1576077000';


--
-- Name: COLUMN project_report_state.analytics_settings_version; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.project_report_state.analytics_settings_version IS '提交分析时刻的 project_analytics_settings 的 update_time，用于判断报告的分析参数是否为最新的 project_analytics_settings';


--
-- Name: project_team_user; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.project_team_user (
    project_id uuid NOT NULL,
    team_user_id uuid NOT NULL,
    role character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_team_user OWNER TO merico;

--
-- Name: pull_requests; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.pull_requests (
    id integer NOT NULL,
    project uuid NOT NULL,
    remote_id integer NOT NULL,
    api_url character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    title character varying(255),
    author integer,
    "user" integer,
    provider public.enum_pull_requests_provider,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    closed_at timestamp with time zone,
    merged_at timestamp with time zone,
    merge_commit character varying(255) NOT NULL
);


ALTER TABLE public.pull_requests OWNER TO merico;

--
-- Name: pull_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: merico
--

CREATE SEQUENCE public.pull_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pull_requests_id_seq OWNER TO merico;

--
-- Name: pull_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: merico
--

ALTER SEQUENCE public.pull_requests_id_seq OWNED BY public.pull_requests.id;


--
-- Name: report_code_check_breaking_record; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_code_check_breaking_record (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    rule_key character varying(255) NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    hash character(40),
    effort character varying(255),
    code_number integer NOT NULL,
    unique_key character varying(255),
    filename text,
    ranges jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.report_code_check_breaking_record OWNER TO merico;

--
-- Name: report_comment_coverage_function; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_comment_coverage_function (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    report_id uuid,
    comment_line_number integer,
    format_email character varying(255),
    report_function_id uuid
);


ALTER TABLE public.report_comment_coverage_function OWNER TO merico;

--
-- Name: report_commit_file_tag_evidence; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_commit_file_tag_evidence (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    hash character(40) NOT NULL,
    filename character varying NOT NULL,
    report_id uuid NOT NULL,
    tag_evidence_id uuid NOT NULL,
    times integer NOT NULL
);


ALTER TABLE public.report_commit_file_tag_evidence OWNER TO merico;

--
-- Name: report_commit_file_value; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_commit_file_value (
    hash character(40) NOT NULL,
    filename character varying NOT NULL,
    report_id uuid NOT NULL,
    dev_value double precision NOT NULL,
    dev_equivalent double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public.report_commit_file_value OWNER TO merico;

--
-- Name: report_commit_function; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_commit_function (
    hash character(40) NOT NULL,
    function_id uuid NOT NULL,
    report_id uuid NOT NULL,
    dev_value double precision NOT NULL,
    dev_equivalent double precision NOT NULL,
    add_line integer NOT NULL,
    delete_line integer NOT NULL
);


ALTER TABLE public.report_commit_function OWNER TO merico;

--
-- Name: report_config_code_check; Type: TABLE; Schema: public; Owner: merico
--

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


ALTER TABLE public.report_config_code_check OWNER TO merico;

--
-- Name: report_config_code_check_ignore; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_code_check_ignore (
    key character varying(255) NOT NULL,
    team_id uuid,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.report_config_code_check_ignore OWNER TO merico;

--
-- Name: report_config_dev_value_formula_params; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_dev_value_formula_params (
    team_id uuid NOT NULL,
    wd double precision DEFAULT 1.0,
    ws double precision DEFAULT 1.0,
    wq double precision DEFAULT 1.0,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    update_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_config_dev_value_formula_params OWNER TO merico;

--
-- Name: COLUMN report_config_dev_value_formula_params.wd; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_config_dev_value_formula_params.wd IS 'Coefficent of dev equivalent part';


--
-- Name: COLUMN report_config_dev_value_formula_params.ws; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_config_dev_value_formula_params.ws IS 'Coefficent of impact score part';


--
-- Name: COLUMN report_config_dev_value_formula_params.wq; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_config_dev_value_formula_params.wq IS 'Coefficent of issues part';


--
-- Name: report_config_feature_flags; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_feature_flags (
    team_id uuid NOT NULL,
    feature_key text NOT NULL,
    flag boolean DEFAULT false,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    update_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_config_feature_flags OWNER TO merico;

--
-- Name: COLUMN report_config_feature_flags.flag; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_config_feature_flags.flag IS '该feature是否打开';


--
-- Name: report_config_industry_efficiency; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_industry_efficiency (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    industry_project_names character varying(255)[] NOT NULL,
    developer_num_from integer NOT NULL,
    developer_num_to integer NOT NULL,
    lang character varying(255) NOT NULL,
    langname character varying(255) NOT NULL,
    weekly_dev_eq_average double precision NOT NULL,
    weekly_dev_eq_upper_quartile double precision NOT NULL,
    weekly_dev_eq_lower_quartile double precision NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    weekly_dev_eq_median double precision
);


ALTER TABLE public.report_config_industry_efficiency OWNER TO merico;

--
-- Name: TABLE report_config_industry_efficiency; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON TABLE public.report_config_industry_efficiency IS '效率/开发当量行业指标';


--
-- Name: COLUMN report_config_industry_efficiency.weekly_dev_eq_average; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_config_industry_efficiency.weekly_dev_eq_average IS '每周平均开发当量';


--
-- Name: COLUMN report_config_industry_efficiency.weekly_dev_eq_median; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_config_industry_efficiency.weekly_dev_eq_median IS '每周开发当量中位数';


--
-- Name: report_config_industry_quality; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_industry_quality (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    metric_type public.quality_metric_type NOT NULL,
    industry_project_names character varying(255)[] NOT NULL,
    dev_eq_num_from integer NOT NULL,
    dev_eq_num_to integer NOT NULL,
    lang character varying(255) NOT NULL,
    langname character varying(255) NOT NULL,
    average double precision NOT NULL,
    upper_quartile double precision NOT NULL,
    lower_quartile double precision NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    median double precision
);


ALTER TABLE public.report_config_industry_quality OWNER TO merico;

--
-- Name: TABLE report_config_industry_quality; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON TABLE public.report_config_industry_quality IS '质量行业指标';


--
-- Name: report_config_tag; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_tag (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    name_cn character varying,
    parent_id uuid,
    parent_ids uuid[],
    is_system boolean DEFAULT true,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    temp_id integer,
    "desc" text,
    desc_cn text
);


ALTER TABLE public.report_config_tag OWNER TO merico;

--
-- Name: report_config_tag_evidence; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_tag_evidence (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    type public.report_config_tag_evidence_type NOT NULL,
    name character varying NOT NULL,
    lang character varying(255),
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    info jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.report_config_tag_evidence OWNER TO merico;

--
-- Name: report_config_tag_evidence_system_tag; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_tag_evidence_system_tag (
    evidence_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_config_tag_evidence_system_tag OWNER TO merico;

--
-- Name: report_config_tag_evidence_user_tag; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_config_tag_evidence_user_tag (
    evidence_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_config_tag_evidence_user_tag OWNER TO merico;

--
-- Name: report_config_tag_evidence_tag; Type: MATERIALIZED VIEW; Schema: public; Owner: merico
--

CREATE MATERIALIZED VIEW public.report_config_tag_evidence_tag AS
 SELECT report_config_tag_evidence_system_tag.evidence_id,
    report_config_tag_evidence_system_tag.tag_id,
    NULL::text AS team_user_id
   FROM public.report_config_tag_evidence_system_tag
UNION
 SELECT report_config_tag_evidence_user_tag.evidence_id,
    report_config_tag_evidence_user_tag.tag_id,
    NULL::text AS team_user_id
   FROM public.report_config_tag_evidence_user_tag
  WITH NO DATA;


ALTER TABLE public.report_config_tag_evidence_tag OWNER TO merico;

--
-- Name: report_contributor_bomb_sweeper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_contributor_bomb_sweeper (
    user_email character varying NOT NULL,
    report_id uuid NOT NULL,
    bomb_count integer NOT NULL
);


ALTER TABLE public.report_contributor_bomb_sweeper OWNER TO postgres;

--
-- Name: report_contributors_view; Type: VIEW; Schema: public; Owner: merico
--

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
             JOIN public.team_user ON ((team_user.user_id = emails.user_id)))) u ON (((u.email)::text = (c.author_email)::text)));


ALTER TABLE public.report_contributors_view OWNER TO merico;

--
-- Name: report_developer_test_of_time_function; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_developer_test_of_time_function (
    user_email character varying NOT NULL,
    report_id uuid NOT NULL,
    developer_rank integer NOT NULL,
    node_id character varying NOT NULL
);


ALTER TABLE public.report_developer_test_of_time_function OWNER TO postgres;

--
-- Name: report_duplicate_function; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_duplicate_function (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    report_id uuid,
    report_duplicate_group_id uuid,
    format_email character varying(255),
    report_function_id uuid
);


ALTER TABLE public.report_duplicate_function OWNER TO merico;

--
-- Name: report_duplicate_group; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_duplicate_group (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    report_id uuid,
    duplicate_function_number integer
);


ALTER TABLE public.report_duplicate_group OWNER TO merico;

--
-- Name: report_email_metric; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_email_metric (
    report_id uuid,
    format_email character varying(255),
    doc_coverage_function_num integer DEFAULT 0,
    doc_coverage_total_function_num integer DEFAULT 0,
    static_test_coverage_function_num integer DEFAULT 0,
    static_test_coverage_total_function_num integer DEFAULT 0,
    modularity double precision DEFAULT 0,
    duplicate_function_num integer DEFAULT 0,
    issue_blocker_number integer DEFAULT 0,
    issue_critical_number integer DEFAULT 0,
    issue_info_number integer DEFAULT 0,
    issue_major_number integer DEFAULT 0,
    issue_minor_number integer DEFAULT 0,
    function_depend integer DEFAULT 0,
    ccg_snapshot_function_num integer DEFAULT 0
);


ALTER TABLE public.report_email_metric OWNER TO merico;

--
-- Name: report_email_module_value; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_email_module_value (
    module_name character varying NOT NULL,
    report_id uuid NOT NULL,
    dev_value double precision NOT NULL,
    dev_equivalent double precision DEFAULT 0 NOT NULL,
    format_email character varying(255)
);


ALTER TABLE public.report_email_module_value OWNER TO merico;

--
-- Name: report_email_value; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_email_value (
    report_id uuid NOT NULL,
    dev_value double precision NOT NULL,
    dev_equivalent double precision DEFAULT 0 NOT NULL,
    format_email character varying(255) NOT NULL
);


ALTER TABLE public.report_email_value OWNER TO merico;

--
-- Name: report_function; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_function (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    filename text NOT NULL,
    in_degree integer DEFAULT 0 NOT NULL,
    out_degree integer DEFAULT 0 NOT NULL,
    language character varying(255) DEFAULT ''::character varying NOT NULL,
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
    ccg_or_cag public.ccg_or_cag DEFAULT 'CCG'::public.ccg_or_cag NOT NULL,
    owner_email character varying
);


ALTER TABLE public.report_function OWNER TO merico;

--
-- Name: COLUMN report_function.ccg_function_id; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_function.ccg_function_id IS 'If ccg_or_cag is CAG, ccg_function_id stores cag_function_id';


--
-- Name: COLUMN report_function.cyclomatic; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.report_function.cyclomatic IS 'Cyclomatic complexity';


--
-- Name: report_function_depend_email; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_function_depend_email (
    function_id uuid NOT NULL,
    format_email character varying(255) NOT NULL,
    report_id uuid NOT NULL
);


ALTER TABLE public.report_function_depend_email OWNER TO merico;

--
-- Name: report_function_graph; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_function_graph (
    caller_id uuid NOT NULL,
    callee_id uuid NOT NULL,
    report_id uuid NOT NULL,
    times integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.report_function_graph OWNER TO merico;

--
-- Name: report_metric; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_metric (
    report_id uuid NOT NULL,
    magnetism integer DEFAULT 0,
    popularity double precision,
    modularity double precision,
    code_reusability double precision,
    velocity double precision,
    doc_coverage double precision,
    static_test_coverage double precision,
    package_depend integer,
    git_tag_number integer,
    issue_track_unique boolean DEFAULT false,
    robustness double precision,
    issue_blocker_number integer DEFAULT 0 NOT NULL,
    issue_critical_number integer DEFAULT 0 NOT NULL,
    issue_info_number integer DEFAULT 0 NOT NULL,
    issue_major_number integer DEFAULT 0 NOT NULL,
    issue_minor_number integer DEFAULT 0 NOT NULL,
    cyclomatic_total integer,
    language_distribution jsonb DEFAULT '{}'::jsonb,
    doc_coverage_function_num integer,
    doc_coverage_total_function_num integer,
    static_test_coverage_function_num integer,
    static_test_coverage_total_function_num integer,
    duplicate_function_num integer,
    ccg_snapshot_function_num integer
);


ALTER TABLE public.report_metric OWNER TO merico;

--
-- Name: report_test_coverage_function; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_test_coverage_function (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    test_function_number integer,
    report_id uuid,
    format_email character varying(255),
    report_function_id uuid
);


ALTER TABLE public.report_test_coverage_function OWNER TO merico;

--
-- Name: report_test_coverage_test_function; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_test_coverage_test_function (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    report_test_coverage_function_id uuid,
    report_function_id uuid
);


ALTER TABLE public.report_test_coverage_test_function OWNER TO merico;

--
-- Name: report_topic_email_value; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_topic_email_value (
    format_email character varying NOT NULL,
    report_id uuid NOT NULL,
    topic_name character varying NOT NULL,
    value double precision
);


ALTER TABLE public.report_topic_email_value OWNER TO merico;

--
-- Name: report_topic_file_value; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.report_topic_file_value (
    filename character varying NOT NULL,
    topic_name character varying NOT NULL,
    report_id uuid NOT NULL,
    value double precision
);


ALTER TABLE public.report_topic_file_value OWNER TO merico;

--
-- Name: sso_user; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.sso_user (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid,
    strategy character varying NOT NULL,
    sso_uid character varying NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    app_id character varying
);


ALTER TABLE public.sso_user OWNER TO merico;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_waiting boolean NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type smallint DEFAULT 0 NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO merico;

--
-- Name: team; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    manager_user_id uuid NOT NULL,
    num_partner_text character varying,
    domains_str character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.team OWNER TO merico;

--
-- Name: team_local_machine; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_local_machine (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    create_user_id uuid NOT NULL,
    name text NOT NULL,
    machine_code text NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.team_local_machine OWNER TO merico;

--
-- Name: team_project_key; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_project_key (
    team_id uuid NOT NULL,
    private_key text NOT NULL,
    public_key text NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_project_key OWNER TO merico;

--
-- Name: team_subscription; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_subscription (
    project_id uuid NOT NULL,
    team_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.team_subscription OWNER TO merico;

--
-- Name: team_token; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_token (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    appid character varying NOT NULL,
    appsecret character varying NOT NULL,
    role character varying DEFAULT 'admin'::character varying,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_id uuid
);


ALTER TABLE public.team_token OWNER TO merico;

--
-- Name: COLUMN team_token.user_id; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.team_token.user_id IS 'user_id for rbac';


--
-- Name: team_user_department_role; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_user_department_role (
    team_user_id uuid NOT NULL,
    department_id uuid NOT NULL,
    role public.department_role,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_user_department_role OWNER TO merico;

--
-- Name: team_user_ex; Type: VIEW; Schema: public; Owner: merico
--

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


ALTER TABLE public.team_user_ex OWNER TO merico;

--
-- Name: team_user_project_key; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_user_project_key (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    private_key text NOT NULL,
    public_key text NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_user_project_key OWNER TO merico;

--
-- Name: team_user_watch_project; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_user_watch_project (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_user_watch_project OWNER TO merico;

--
-- Name: team_user_watch_project_group; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.team_user_watch_project_group (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    project_group_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_user_watch_project_group OWNER TO merico;

--
-- Name: third_party_platform; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.third_party_platform (
    oauth_url character varying,
    access_token character varying,
    administrator_id uuid,
    application_id character varying NOT NULL,
    application_secret character varying NOT NULL,
    type public.third_party_type NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    refresh_token character varying,
    expired_time timestamp with time zone,
    auto_sync boolean DEFAULT false NOT NULL,
    token_owner_id uuid,
    id uuid DEFAULT public.gen_random_uuid() NOT NULL
);


ALTER TABLE public.third_party_platform OWNER TO merico;

--
-- Name: TABLE third_party_platform; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON TABLE public.third_party_platform IS 'Stores the meta info of the third party platform.';


--
-- Name: COLUMN third_party_platform.oauth_url; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.oauth_url IS 'The main page of the third party platform.';


--
-- Name: COLUMN third_party_platform.access_token; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.access_token IS 'Gitlab access token';


--
-- Name: COLUMN third_party_platform.administrator_id; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.administrator_id IS 'The person who create the platform';


--
-- Name: COLUMN third_party_platform.application_id; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.application_id IS 'The application id which is created by user on the third party platform.';


--
-- Name: COLUMN third_party_platform.refresh_token; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.refresh_token IS 'Gitlab refresh token';


--
-- Name: COLUMN third_party_platform.expired_time; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.expired_time IS 'Gitlab token expired_time';


--
-- Name: COLUMN third_party_platform.token_owner_id; Type: COMMENT; Schema: public; Owner: merico
--

COMMENT ON COLUMN public.third_party_platform.token_owner_id IS 'The person who create the access token';


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.tokens (
    email character varying(255) NOT NULL,
    token character varying(6) NOT NULL,
    expiration timestamp with time zone NOT NULL
);


ALTER TABLE public.tokens OWNER TO merico;

--
-- Name: user_config; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.user_config (
    user_id uuid NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_config OWNER TO merico;

--
-- Name: weekly_report_developer; Type: TABLE; Schema: public; Owner: merico
--

CREATE TABLE public.weekly_report_developer (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    team_user_id uuid NOT NULL,
    version integer,
    date date NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    create_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.weekly_report_developer OWNER TO merico;

--
-- Name: BadgeTypes id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."BadgeTypes" ALTER COLUMN id SET DEFAULT nextval('public."BadgeTypes_id_seq"'::regclass);


--
-- Name: Badges id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Badges" ALTER COLUMN id SET DEFAULT nextval('public."Badges_id_seq"'::regclass);


--
-- Name: BaselineRepoMeta id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."BaselineRepoMeta" ALTER COLUMN id SET DEFAULT nextval('public."BaselineRepoMeta_id_seq"'::regclass);


--
-- Name: DeletedAccounts id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."DeletedAccounts" ALTER COLUMN id SET DEFAULT nextval('public."DeletedAccounts_id_seq"'::regclass);


--
-- Name: LoginAttempts id; Type: DEFAULT; Schema: public; Owner: paulgoertzen
--

ALTER TABLE ONLY public."LoginAttempts" ALTER COLUMN id SET DEFAULT nextval('public."LoginAttempts_id_seq"'::regclass);


--
-- Name: PendingVerifications id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."PendingVerifications" ALTER COLUMN id SET DEFAULT nextval('public."PendingVerifications_id_seq"'::regclass);


--
-- Name: Projects id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Projects" ALTER COLUMN id SET DEFAULT nextval('public."Projects_id_seq"'::regclass);


--
-- Name: UserEmails id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserEmails" ALTER COLUMN id SET DEFAULT nextval('public."UserEmails_id_seq"'::regclass);


--
-- Name: UserNotifications id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserNotifications" ALTER COLUMN id SET DEFAULT nextval('public."UserNotifications_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: ca_project id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.ca_project ALTER COLUMN id SET DEFAULT nextval('public.ca_project_id_seq'::regclass);


--
-- Name: ca_task id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.ca_task ALTER COLUMN id SET DEFAULT nextval('public.ca_task_id_seq'::regclass);


--
-- Name: contributors id; Type: DEFAULT; Schema: public; Owner: paulgoertzen
--

ALTER TABLE ONLY public.contributors ALTER COLUMN id SET DEFAULT nextval('public.contributors_id_seq'::regclass);


--
-- Name: pull_requests id; Type: DEFAULT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.pull_requests ALTER COLUMN id SET DEFAULT nextval('public.pull_requests_id_seq'::regclass);


--
-- Name: BadgeTypes BadgeTypes_code_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."BadgeTypes"
    ADD CONSTRAINT "BadgeTypes_code_key" UNIQUE (code);


--
-- Name: BadgeTypes BadgeTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."BadgeTypes"
    ADD CONSTRAINT "BadgeTypes_pkey" PRIMARY KEY (id);


--
-- Name: Badges Badges_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Badges"
    ADD CONSTRAINT "Badges_pkey" PRIMARY KEY (id);


--
-- Name: BaselineRepoMeta BaselineRepoMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."BaselineRepoMeta"
    ADD CONSTRAINT "BaselineRepoMeta_pkey" PRIMARY KEY (id);


--
-- Name: DeletedAccounts DeletedAccounts_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."DeletedAccounts"
    ADD CONSTRAINT "DeletedAccounts_pkey" PRIMARY KEY (id);


--
-- Name: LoginAttempts LoginAttempts_pkey; Type: CONSTRAINT; Schema: public; Owner: paulgoertzen
--

ALTER TABLE ONLY public."LoginAttempts"
    ADD CONSTRAINT "LoginAttempts_pkey" PRIMARY KEY (id);


--
-- Name: PendingVerifications PendingVerifications_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."PendingVerifications"
    ADD CONSTRAINT "PendingVerifications_pkey" PRIMARY KEY (id);


--
-- Name: Projects Projects_eeProjectId_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_eeProjectId_key" UNIQUE ("eeProjectId");


--
-- Name: Projects Projects_gitUrl_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_gitUrl_key" UNIQUE ("gitUrl");


--
-- Name: Projects Projects_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: UserEmails UserEmails_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserEmails"
    ADD CONSTRAINT "UserEmails_pkey" PRIMARY KEY (id);


--
-- Name: UserNotifications UserNotifications_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserNotifications"
    ADD CONSTRAINT "UserNotifications_pkey" PRIMARY KEY (id);


--
-- Name: UserProjects UserProjects_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserProjects"
    ADD CONSTRAINT "UserProjects_pkey" PRIMARY KEY ("UserId", "ProjectId");


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (batch_time, project_id);


--
-- Name: ca_analysis ca_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.ca_analysis
    ADD CONSTRAINT ca_analysis_pkey PRIMARY KEY (id);


--
-- Name: ca_project ca_project_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.ca_project
    ADD CONSTRAINT ca_project_pkey PRIMARY KEY (id);


--
-- Name: ca_task ca_task_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.ca_task
    ADD CONSTRAINT ca_task_pkey PRIMARY KEY (id);


--
-- Name: config config_compose_unique; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_compose_unique UNIQUE (team_id, key);


--
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);


--
-- Name: contributors contributors_pkey; Type: CONSTRAINT; Schema: public; Owner: paulgoertzen
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_pkey PRIMARY KEY (id);


--
-- Name: contributors contributors_remote_id_provider; Type: CONSTRAINT; Schema: public; Owner: paulgoertzen
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_remote_id_provider UNIQUE (email, remote_id, provider);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: email_notification email_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.email_notification
    ADD CONSTRAINT email_notification_pkey PRIMARY KEY (id);


--
-- Name: email_notification_template email_notification_template_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.email_notification_template
    ADD CONSTRAINT email_notification_template_pkey PRIMARY KEY (id);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (email);


--
-- Name: gitlab_importing_task gitlab_importing_task_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.gitlab_importing_task
    ADD CONSTRAINT gitlab_importing_task_pkey PRIMARY KEY (id, outer_project_id);


--
-- Name: invite_user invite_user_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.invite_user
    ADD CONSTRAINT invite_user_pkey PRIMARY KEY (hash);


--
-- Name: invite_user invite_user_unique_email_and_inviter; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.invite_user
    ADD CONSTRAINT invite_user_unique_email_and_inviter UNIQUE (email, inviter_id, project_group_id, project_id);


--
-- Name: jira_attachment jira_attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_attachment
    ADD CONSTRAINT jira_attachment_pkey PRIMARY KEY (uuid);


--
-- Name: jira_comment jira_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_comment
    ADD CONSTRAINT jira_comment_pkey PRIMARY KEY (uuid);


--
-- Name: jira_field jira_field_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_field
    ADD CONSTRAINT jira_field_pkey PRIMARY KEY (uuid);


--
-- Name: jira_fix_version jira_fix_version_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_fix_version
    ADD CONSTRAINT jira_fix_version_pkey PRIMARY KEY (uuid);


--
-- Name: jira_issue_changelog jira_issue_changelog_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue_changelog
    ADD CONSTRAINT jira_issue_changelog_pkey PRIMARY KEY (uuid);


--
-- Name: jira_issue jira_issue_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue
    ADD CONSTRAINT jira_issue_pkey PRIMARY KEY (uuid);


--
-- Name: jira_issuelink jira_issuelink_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issuelink
    ADD CONSTRAINT jira_issuelink_pkey PRIMARY KEY (uuid);


--
-- Name: jira_platform jira_platform_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_platform
    ADD CONSTRAINT jira_platform_pkey PRIMARY KEY (id);


--
-- Name: jira_platform_sync_log jira_platform_sync_log_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_platform_sync_log
    ADD CONSTRAINT jira_platform_sync_log_pkey PRIMARY KEY (id);


--
-- Name: jira_rapidview jira_rapidview_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_rapidview
    ADD CONSTRAINT jira_rapidview_pkey PRIMARY KEY (uuid);


--
-- Name: jira_rapidview_sprint jira_rapidview_sprint_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_rapidview_sprint
    ADD CONSTRAINT jira_rapidview_sprint_pkey PRIMARY KEY (uuid);


--
-- Name: jira_subtask jira_subtask_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_subtask
    ADD CONSTRAINT jira_subtask_pkey PRIMARY KEY (uuid);


--
-- Name: jira_user jira_user_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_user
    ADD CONSTRAINT jira_user_pkey PRIMARY KEY (uuid);


--
-- Name: jira_worklog jira_worklog_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_worklog
    ADD CONSTRAINT jira_worklog_pkey PRIMARY KEY (uuid);


--
-- Name: large_screen_page_chart large_screen_page_chart_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.large_screen_page_chart
    ADD CONSTRAINT large_screen_page_chart_pkey PRIMARY KEY (id);


--
-- Name: large_screen_page large_screen_page_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.large_screen_page
    ADD CONSTRAINT large_screen_page_pkey PRIMARY KEY (id);


--
-- Name: large_screen large_screen_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.large_screen
    ADD CONSTRAINT large_screen_pkey PRIMARY KEY (id);


--
-- Name: license license_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT license_pkey PRIMARY KEY (id);


--
-- Name: links links_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (id);


--
-- Name: metric_column_group metric_column_group_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.metric_column_group
    ADD CONSTRAINT metric_column_group_pkey PRIMARY KEY (id);


--
-- Name: metric_scene metric_scene_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.metric_scene
    ADD CONSTRAINT metric_scene_pkey PRIMARY KEY (id);


--
-- Name: migrate_log migrate_log_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.migrate_log
    ADD CONSTRAINT migrate_log_pkey PRIMARY KEY (filename);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_type_setting notification_type_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.notification_type_setting
    ADD CONSTRAINT notification_type_setting_pkey PRIMARY KEY (type);


--
-- Name: notification_user_stat notification_user_stat_user_id_notification_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.notification_user_stat
    ADD CONSTRAINT notification_user_stat_user_id_notification_id_key UNIQUE (user_id, notification_id);


--
-- Name: oauth oauth_app_app_user_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.oauth
    ADD CONSTRAINT oauth_app_app_user_id_key UNIQUE (app, app_user_id);


--
-- Name: oauth oauth_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.oauth
    ADD CONSTRAINT oauth_pkey PRIMARY KEY (id);


--
-- Name: project_analytics_settings project_analytics_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_analytics_settings
    ADD CONSTRAINT project_analytics_settings_pkey PRIMARY KEY (project_id);


--
-- Name: project_auth project_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_auth
    ADD CONSTRAINT project_auth_pkey PRIMARY KEY (project_id);


--
-- Name: project_commit project_commit_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_commit
    ADD CONSTRAINT project_commit_pkey PRIMARY KEY (project_id, hash);


--
-- Name: project_commit_remark project_commit_remark_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_commit_remark
    ADD CONSTRAINT project_commit_remark_pkey PRIMARY KEY (project_id, hash);


--
-- Name: project_group project_group_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group
    ADD CONSTRAINT project_group_pkey PRIMARY KEY (id);


--
-- Name: project_group_project project_group_project_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_project
    ADD CONSTRAINT project_group_project_pkey PRIMARY KEY (id);


--
-- Name: project_group_project project_group_project_project_group_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_project
    ADD CONSTRAINT project_group_project_project_group_id_project_id_key UNIQUE (project_group_id, project_id);


--
-- Name: project_group_team_user project_group_team_user_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_team_user
    ADD CONSTRAINT project_group_team_user_pkey PRIMARY KEY (project_group_id, team_user_id);


--
-- Name: project_pre_process_result project_pre_process_result_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_pre_process_result
    ADD CONSTRAINT project_pre_process_result_pkey PRIMARY KEY (project_id);


--
-- Name: project_report_state project_report_state_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_report_state
    ADD CONSTRAINT project_report_state_pkey PRIMARY KEY (report_id);


--
-- Name: project_team_user project_team_user_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_team_user
    ADD CONSTRAINT project_team_user_pkey PRIMARY KEY (project_id, team_user_id);


--
-- Name: pull_requests pull_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.pull_requests
    ADD CONSTRAINT pull_requests_pkey PRIMARY KEY (id);


--
-- Name: report_code_check_breaking_record report_code_check_breaking_record_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_code_check_breaking_record
    ADD CONSTRAINT report_code_check_breaking_record_pkey PRIMARY KEY (id);


--
-- Name: report_config_code_check report_code_check_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_code_check
    ADD CONSTRAINT report_code_check_rule_pkey PRIMARY KEY (key);


--
-- Name: report_comment_coverage_function report_comment_coverage_function_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_comment_coverage_function
    ADD CONSTRAINT report_comment_coverage_function_pkey PRIMARY KEY (id);


--
-- Name: report_commit_file_tag_evidence report_commit_file_tag_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_commit_file_tag_evidence
    ADD CONSTRAINT report_commit_file_tag_evidence_pkey PRIMARY KEY (id);


--
-- Name: report_commit_file_value report_commit_file_value_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_commit_file_value
    ADD CONSTRAINT report_commit_file_value_pkey PRIMARY KEY (hash, filename, report_id);


--
-- Name: report_commit_function report_commit_function_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_commit_function
    ADD CONSTRAINT report_commit_function_pkey PRIMARY KEY (hash, function_id, report_id);


--
-- Name: report_commit_value report_commit_value_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_commit_value
    ADD CONSTRAINT report_commit_value_pkey PRIMARY KEY (hash, report_id);


--
-- Name: report_config_code_check_ignore report_config_code_check_ignore_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_code_check_ignore
    ADD CONSTRAINT report_config_code_check_ignore_pkey PRIMARY KEY (key);


--
-- Name: report_config_dev_value_formula_params report_config_dev_value_formula_params_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_dev_value_formula_params
    ADD CONSTRAINT report_config_dev_value_formula_params_pkey PRIMARY KEY (team_id);


--
-- Name: report_config_feature_flags report_config_feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_feature_flags
    ADD CONSTRAINT report_config_feature_flags_pkey PRIMARY KEY (feature_key, team_id);


--
-- Name: report_config_industry_efficiency report_config_industry_efficiency_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_industry_efficiency
    ADD CONSTRAINT report_config_industry_efficiency_pkey PRIMARY KEY (id);


--
-- Name: report_config_industry_quality report_config_industry_quality_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_industry_quality
    ADD CONSTRAINT report_config_industry_quality_pkey PRIMARY KEY (id);


--
-- Name: report_config_tag_evidence report_config_tag_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence
    ADD CONSTRAINT report_config_tag_evidence_pkey PRIMARY KEY (id);


--
-- Name: report_config_tag_evidence_system_tag report_config_tag_evidence_system_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence_system_tag
    ADD CONSTRAINT report_config_tag_evidence_system_tag_pkey PRIMARY KEY (evidence_id, tag_id);


--
-- Name: report_config_tag_evidence_user_tag report_config_tag_evidence_user_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence_user_tag
    ADD CONSTRAINT report_config_tag_evidence_user_tag_pkey PRIMARY KEY (evidence_id, tag_id);


--
-- Name: report_config_tag report_config_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag
    ADD CONSTRAINT report_config_tag_pkey PRIMARY KEY (id);


--
-- Name: report_developer_test_of_time_function report_developer_ttf_email_node_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_developer_test_of_time_function
    ADD CONSTRAINT report_developer_ttf_email_node_report_pkey PRIMARY KEY (user_email, node_id, report_id);


--
-- Name: report_duplicate_function report_duplicate_function_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_duplicate_function
    ADD CONSTRAINT report_duplicate_function_pkey PRIMARY KEY (id);


--
-- Name: report_duplicate_group report_duplicate_group_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_duplicate_group
    ADD CONSTRAINT report_duplicate_group_pkey PRIMARY KEY (id);


--
-- Name: report_email_value report_email_value_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_email_value
    ADD CONSTRAINT report_email_value_pkey PRIMARY KEY (format_email, report_id);


--
-- Name: report_function_depend_email report_function_depend_email_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_function_depend_email
    ADD CONSTRAINT report_function_depend_email_pkey PRIMARY KEY (function_id, report_id, format_email);


--
-- Name: report_function_graph report_function_graph_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_function_graph
    ADD CONSTRAINT report_function_graph_pkey PRIMARY KEY (caller_id, callee_id, report_id);


--
-- Name: report_function report_function_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_function
    ADD CONSTRAINT report_function_pkey PRIMARY KEY (id);


--
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- Name: report_test_coverage_function report_test_coverage_function_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_test_coverage_function
    ADD CONSTRAINT report_test_coverage_function_pkey PRIMARY KEY (id);


--
-- Name: report_test_coverage_test_function report_test_coverage_test_function_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_test_coverage_test_function
    ADD CONSTRAINT report_test_coverage_test_function_pkey PRIMARY KEY (id);


--
-- Name: report_topic_email_value report_topic_email_value_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_topic_email_value
    ADD CONSTRAINT report_topic_email_value_pkey PRIMARY KEY (format_email, report_id, topic_name);


--
-- Name: report_topic_file_value report_topic_file_value_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_topic_file_value
    ADD CONSTRAINT report_topic_file_value_pkey PRIMARY KEY (filename, report_id, topic_name);


--
-- Name: report_contributor_bomb_sweeper report_user_email_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_contributor_bomb_sweeper
    ADD CONSTRAINT report_user_email_pkey PRIMARY KEY (user_email, report_id);


--
-- Name: sso_user sso_user_strategy_sso_uid_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.sso_user
    ADD CONSTRAINT sso_user_strategy_sso_uid_key UNIQUE (strategy, sso_uid);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_project_id_user_id_key UNIQUE (project_id, user_id);


--
-- Name: team_local_machine team_local_machine_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_local_machine
    ADD CONSTRAINT team_local_machine_pkey PRIMARY KEY (id);


--
-- Name: team team_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (id);


--
-- Name: team_project_key team_project_key_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_project_key
    ADD CONSTRAINT team_project_key_pkey PRIMARY KEY (team_id);


--
-- Name: team_subscription team_subscription_project_id_team_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_subscription
    ADD CONSTRAINT team_subscription_project_id_team_id_key PRIMARY KEY (project_id, team_id);


--
-- Name: team_token team_token_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_token
    ADD CONSTRAINT team_token_pkey PRIMARY KEY (id);


--
-- Name: team_user_department_role team_user_department_role_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_department_role
    ADD CONSTRAINT team_user_department_role_pkey PRIMARY KEY (team_user_id, department_id);


--
-- Name: team_user team_user_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_pkey PRIMARY KEY (id);


--
-- Name: team_user_project_key team_user_project_key_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_project_key
    ADD CONSTRAINT team_user_project_key_pkey PRIMARY KEY (id);


--
-- Name: team_user team_user_user_id_team_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_user_id_team_id_key UNIQUE (user_id, team_id);


--
-- Name: team_user_watch_project_group team_user_watch_project_group_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project_group
    ADD CONSTRAINT team_user_watch_project_group_pkey PRIMARY KEY (id);


--
-- Name: team_user_watch_project_group team_user_watch_project_group_team_user_id_project_group_id_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project_group
    ADD CONSTRAINT team_user_watch_project_group_team_user_id_project_group_id_key UNIQUE (team_user_id, project_group_id);


--
-- Name: team_user_watch_project team_user_watch_project_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project
    ADD CONSTRAINT team_user_watch_project_pkey PRIMARY KEY (id);


--
-- Name: third_party_platform third_party_platform_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.third_party_platform
    ADD CONSTRAINT third_party_platform_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (email);


--
-- Name: user_config user_config_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.user_config
    ADD CONSTRAINT user_config_pkey PRIMARY KEY (user_id, key);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_primary_email_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_primary_email_key UNIQUE (primary_email);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: weekly_report_developer weekly_report_developer_pkey; Type: CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.weekly_report_developer
    ADD CONSTRAINT weekly_report_developer_pkey PRIMARY KEY (id);


--
-- Name: ca_project_source_id_source_type_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX ca_project_source_id_source_type_idx ON public.ca_project USING btree (source_id, source_type);


--
-- Name: config_system_type_unique_index; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX config_system_type_unique_index ON public.config USING btree (key) WHERE (type = 'system'::public.config_type);


--
-- Name: email_to_primary_email_booster_email_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX email_to_primary_email_booster_email_idx ON public.email_to_primary_email_booster USING btree (email);


--
-- Name: email_to_primary_email_booster_primary_email_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX email_to_primary_email_booster_primary_email_idx ON public.email_to_primary_email_booster USING hash (primary_email);


--
-- Name: jira_issuelink_issue_key_index; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX jira_issuelink_issue_key_index ON public.jira_issuelink USING btree (inward_issue_key, outward_issue_key);


--
-- Name: jira_metric_platform_id_email_address_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_metric_platform_id_email_address_idx ON public.jira_metric USING btree (platform_id, email_address);


--
-- Name: jira_metric_sprint_email_address_sprint_name_platform_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_metric_sprint_email_address_sprint_name_platform_id_idx ON public.jira_metric_sprint USING btree (email_address, sprint_name, platform_id);


--
-- Name: jira_metric_version_platform_id_version_name_email_address_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_metric_version_platform_id_version_name_email_address_idx ON public.jira_metric_version USING btree (platform_id, version_name, email_address);


--
-- Name: jira_sprint_commit_hashs_platform_id_sprint_name_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_sprint_commit_hashs_platform_id_sprint_name_idx ON public.jira_sprint_commit_hashs USING btree (platform_id, sprint_name);


--
-- Name: jira_sprint_sprint_name_platform_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_sprint_sprint_name_platform_id_idx ON public.jira_sprint USING btree (sprint_name, platform_id);


--
-- Name: jira_version_commit_hashs_platform_id_version_name_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_version_commit_hashs_platform_id_version_name_idx ON public.jira_version_commit_hashs USING btree (platform_id, version_name);


--
-- Name: jira_version_version_name_platform_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX jira_version_version_name_platform_id_idx ON public.jira_version USING btree (version_name, platform_id);


--
-- Name: metric_column_group_team_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX metric_column_group_team_id_idx ON public.metric_column_group USING hash (scene_id);


--
-- Name: metric_scene_team_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX metric_scene_team_id_idx ON public.metric_scene USING hash (team_id);


--
-- Name: num_functions_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX num_functions_idx ON public.report_commit_value USING btree (num_functions DESC);


--
-- Name: project_commit_add_line_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX project_commit_add_line_idx ON public.project_commit USING btree (add_line DESC);


--
-- Name: project_commit_author_email_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX project_commit_author_email_idx ON public.project_commit USING hash (author_email);


--
-- Name: project_commit_commit_timestamp_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX project_commit_commit_timestamp_idx ON public.project_commit USING btree (commit_timestamp);


--
-- Name: project_commit_project_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX project_commit_project_id_idx ON public.project_commit USING hash (project_id);


--
-- Name: project_contrib_version_index; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX project_contrib_version_index ON public.project_contrib USING btree (version);


--
-- Name: report_code_check_breaking_record_filename_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_code_check_breaking_record_filename_id_idx ON public.report_code_check_breaking_record USING btree (filename, id);


--
-- Name: report_code_check_breaking_record_hash_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_code_check_breaking_record_hash_idx ON public.report_code_check_breaking_record USING hash (hash);


--
-- Name: report_code_check_breaking_record_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_code_check_breaking_record_report_id_idx ON public.report_code_check_breaking_record USING hash (report_id);


--
-- Name: report_comment_coverage_function_report_function_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_comment_coverage_function_report_function_id_idx ON public.report_comment_coverage_function USING btree (report_function_id);


--
-- Name: report_comment_coverage_function_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_comment_coverage_function_report_id_idx ON public.report_comment_coverage_function USING btree (report_id);


--
-- Name: report_commit_file_tag_evidence_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_file_tag_evidence_report_id_idx ON public.report_commit_file_tag_evidence USING btree (report_id);


--
-- Name: report_commit_file_value_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_file_value_report_id_idx ON public.report_commit_file_value USING btree (report_id);


--
-- Name: report_commit_function_function_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_function_function_id_idx ON public.report_commit_function USING btree (function_id);


--
-- Name: report_commit_function_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_function_report_id_idx ON public.report_commit_function USING btree (report_id);


--
-- Name: report_commit_value_abs_dev_value_add_line_ratio_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_value_abs_dev_value_add_line_ratio_idx ON public.report_commit_value USING btree (abs_dev_value_add_line_ratio DESC NULLS LAST);


--
-- Name: report_commit_value_abs_dev_value_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_value_abs_dev_value_idx ON public.report_commit_value USING btree (abs_dev_value DESC);


--
-- Name: report_commit_value_dev_equivalent_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_value_dev_equivalent_idx ON public.report_commit_value USING btree (dev_equivalent);


--
-- Name: report_commit_value_hash_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_value_hash_idx ON public.report_commit_value USING hash (hash);


--
-- Name: report_commit_value_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_commit_value_report_id_idx ON public.report_commit_value USING btree (report_id);


--
-- Name: report_config_tag_evidence_name_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_config_tag_evidence_name_idx ON public.report_config_tag_evidence USING gin (name);


--
-- Name: report_config_tag_evidence_tag_evidence_id_idx1; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_config_tag_evidence_tag_evidence_id_idx1 ON public.report_config_tag_evidence_tag USING hash (evidence_id);


--
-- Name: report_config_tag_evidence_tag_evidence_id_idx2; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_config_tag_evidence_tag_evidence_id_idx2 ON public.report_config_tag_evidence_tag USING hash (tag_id);


--
-- Name: report_config_tag_evidence_tag_evidence_id_idx3; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_config_tag_evidence_tag_evidence_id_idx3 ON public.report_config_tag_evidence_tag USING hash (team_user_id);


--
-- Name: report_config_tag_name_cn_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_config_tag_name_cn_idx ON public.report_config_tag USING gin (name_cn);


--
-- Name: report_config_tag_name_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_config_tag_name_idx ON public.report_config_tag USING gin (name);


--
-- Name: report_contributor_bomb_sweeper_report_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX report_contributor_bomb_sweeper_report_id_idx ON public.report_contributor_bomb_sweeper USING btree (report_id);


--
-- Name: report_developer_test_of_time_function_report_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX report_developer_test_of_time_function_report_id_idx ON public.report_developer_test_of_time_function USING btree (report_id);


--
-- Name: report_duplicate_function_report_function_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_duplicate_function_report_function_id_idx ON public.report_duplicate_function USING btree (report_function_id);


--
-- Name: report_duplicate_function_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_duplicate_function_report_id_idx ON public.report_duplicate_function USING btree (report_id);


--
-- Name: report_duplicate_group_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_duplicate_group_report_id_idx ON public.report_duplicate_group USING btree (report_id);


--
-- Name: report_email_metric_email_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_email_metric_email_idx ON public.report_email_metric USING hash (format_email);


--
-- Name: report_email_metric_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_email_metric_report_id_idx ON public.report_email_metric USING hash (report_id);


--
-- Name: report_email_module_value_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_email_module_value_report_id_idx ON public.report_email_module_value USING btree (report_id);


--
-- Name: report_email_value_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_email_value_report_id_idx ON public.report_email_value USING btree (report_id);


--
-- Name: report_function_depend_email_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_function_depend_email_report_id_idx ON public.report_function_depend_email USING btree (report_id);


--
-- Name: report_function_graph_callee_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_function_graph_callee_id_idx ON public.report_function_graph USING btree (callee_id);


--
-- Name: report_function_graph_caller_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_function_graph_caller_id_idx ON public.report_function_graph USING btree (caller_id);


--
-- Name: report_function_graph_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_function_graph_report_id_idx ON public.report_function_graph USING btree (report_id);


--
-- Name: report_function_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_function_report_id_idx ON public.report_function USING btree (report_id);


--
-- Name: report_metric_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_metric_report_id_idx ON public.report_metric USING btree (report_id);


--
-- Name: report_test_coverage_function_report_function_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_test_coverage_function_report_function_id_idx ON public.report_test_coverage_function USING btree (report_function_id);


--
-- Name: report_test_coverage_function_report_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_test_coverage_function_report_id_idx ON public.report_test_coverage_function USING btree (report_id);


--
-- Name: report_test_coverage_test_function_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_test_coverage_test_function_id_idx ON public.report_test_coverage_test_function USING btree (report_test_coverage_function_id);


--
-- Name: report_test_coverage_test_function_report_function_id_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX report_test_coverage_test_function_report_function_id_idx ON public.report_test_coverage_test_function USING btree (report_function_id);


--
-- Name: team_subscription_create_time_idx; Type: INDEX; Schema: public; Owner: merico
--

CREATE INDEX team_subscription_create_time_idx ON public.team_subscription USING btree (create_time DESC NULLS LAST);


--
-- Name: team_user_department_role_admin_unique_index; Type: INDEX; Schema: public; Owner: merico
--

CREATE UNIQUE INDEX team_user_department_role_admin_unique_index ON public.team_user_department_role USING btree (department_id) WHERE (role = 'department-admin'::public.department_role);


--
-- Name: batches on_update_batches; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_batches BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: ca_analysis on_update_ca_analysis; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_ca_analysis BEFORE UPDATE ON public.ca_analysis FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: ca_project on_update_ca_project; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_ca_project BEFORE UPDATE ON public.ca_project FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: ca_task on_update_ca_task; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_ca_task BEFORE UPDATE ON public.ca_task FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: config on_update_config; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_config BEFORE UPDATE ON public.config FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: department on_update_department; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_department BEFORE UPDATE ON public.department FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: email_notification on_update_email_notification; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_email_notification BEFORE UPDATE ON public.email_notification FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: email_notification_template on_update_email_notification_template; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_email_notification_template BEFORE UPDATE ON public.email_notification_template FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: emails on_update_emails; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_emails BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: gitlab_importing_task on_update_importing_task; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_importing_task BEFORE UPDATE ON public.gitlab_importing_task FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: invite_user on_update_invite_user; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_invite_user BEFORE UPDATE ON public.invite_user FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: jira_issue on_update_jira_issue; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_jira_issue BEFORE UPDATE ON public.jira_issue FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: jira_platform on_update_jira_platform; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_jira_platform BEFORE UPDATE ON public.jira_platform FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: jira_platform_sync_log on_update_jira_platform_sync_log; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_jira_platform_sync_log BEFORE UPDATE ON public.jira_platform_sync_log FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: large_screen on_update_large_screen; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_large_screen BEFORE UPDATE ON public.large_screen FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: large_screen_page on_update_large_screen_page; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_large_screen_page BEFORE UPDATE ON public.large_screen_page FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: large_screen_page_chart on_update_large_screen_page_chart; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_large_screen_page_chart BEFORE UPDATE ON public.large_screen_page_chart FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: license on_update_license; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_license BEFORE UPDATE ON public.license FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: links on_update_links; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_links BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: metric_column_group on_update_metric_column_group; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_metric_column_group BEFORE UPDATE ON public.metric_column_group FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: metric_scene on_update_metric_scene; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_metric_scene BEFORE UPDATE ON public.metric_scene FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: migrate_log on_update_migrate_log; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_migrate_log BEFORE UPDATE ON public.migrate_log FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: notification on_update_notification; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_notification BEFORE UPDATE ON public.notification FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: notification_type_setting on_update_notification_type_setting; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_notification_type_setting BEFORE UPDATE ON public.notification_type_setting FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: notification_user_stat on_update_notification_user_stat; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_notification_user_stat BEFORE UPDATE ON public.notification_user_stat FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: oauth on_update_oauth; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_oauth BEFORE UPDATE ON public.oauth FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_analytics_settings on_update_project_analytics_settings; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_analytics_settings BEFORE UPDATE ON public.project_analytics_settings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_auth on_update_project_auth; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_auth BEFORE UPDATE ON public.project_auth FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_contrib on_update_project_contrib; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_contrib BEFORE UPDATE ON public.project_contrib FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_group on_update_project_group; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_group BEFORE UPDATE ON public.project_group FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_group_project on_update_project_group_project; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_group_project BEFORE UPDATE ON public.project_group_project FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_group_team_user on_update_project_group_team_user; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_group_team_user BEFORE UPDATE ON public.project_group_team_user FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_pre_process_result on_update_project_pre_process_result; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_pre_process_result BEFORE UPDATE ON public.project_pre_process_result FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_report_state on_update_project_report_state; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_report_state BEFORE UPDATE ON public.project_report_state FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: project_team_user on_update_project_team_user; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_project_team_user BEFORE UPDATE ON public.project_team_user FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report on_update_report; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report BEFORE UPDATE ON public.report FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_code_check_breaking_record on_update_report_code_check_breaking_record; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_code_check_breaking_record BEFORE UPDATE ON public.report_code_check_breaking_record FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_code_check on_update_report_code_check_rule; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_code_check_rule BEFORE UPDATE ON public.report_config_code_check FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_code_check_ignore on_update_report_config_code_check_ignore; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_code_check_ignore BEFORE UPDATE ON public.report_config_code_check_ignore FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_dev_value_formula_params on_update_report_config_dev_value_formula_params; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_dev_value_formula_params BEFORE UPDATE ON public.report_config_dev_value_formula_params FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_feature_flags on_update_report_config_feature_flags; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_feature_flags BEFORE UPDATE ON public.report_config_feature_flags FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_industry_efficiency on_update_report_config_industry_efficiency; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_industry_efficiency BEFORE UPDATE ON public.report_config_industry_efficiency FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_industry_quality on_update_report_config_industry_quality; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_industry_quality BEFORE UPDATE ON public.report_config_industry_quality FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_tag on_update_report_config_tag; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_tag BEFORE UPDATE ON public.report_config_tag FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_tag_evidence on_update_report_config_tag_evidence; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_tag_evidence BEFORE UPDATE ON public.report_config_tag_evidence FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_tag_evidence_system_tag on_update_report_config_tag_evidence_system_tag; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_tag_evidence_system_tag BEFORE UPDATE ON public.report_config_tag_evidence_system_tag FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: report_config_tag_evidence_user_tag on_update_report_config_tag_evidence_user_tag; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_report_config_tag_evidence_user_tag BEFORE UPDATE ON public.report_config_tag_evidence_user_tag FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: sso_user on_update_sso_user; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_sso_user BEFORE UPDATE ON public.sso_user FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: subscriptions on_update_subscriptions; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_subscriptions BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team on_update_team; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team BEFORE UPDATE ON public.team FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_local_machine on_update_team_local_machine; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_local_machine BEFORE UPDATE ON public.team_local_machine FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_project_key on_update_team_project_key; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_project_key BEFORE UPDATE ON public.team_project_key FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_token on_update_team_token; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_token BEFORE UPDATE ON public.team_token FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_user on_update_team_user; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_user BEFORE UPDATE ON public.team_user FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_user_department_role on_update_team_user_department_role; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_user_department_role BEFORE UPDATE ON public.team_user_department_role FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_user_project_key on_update_team_user_project_key; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_user_project_key BEFORE UPDATE ON public.team_user_project_key FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_user_watch_project on_update_team_user_watch_project; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_user_watch_project BEFORE UPDATE ON public.team_user_watch_project FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: team_user_watch_project_group on_update_team_user_watch_project_group; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_team_user_watch_project_group BEFORE UPDATE ON public.team_user_watch_project_group FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: third_party_platform on_update_third_party_platform_key; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_third_party_platform_key BEFORE UPDATE ON public.third_party_platform FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: user_config on_update_user_config; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_user_config BEFORE UPDATE ON public.user_config FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: users on_update_users; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: weekly_report_developer on_update_weekly_report_developer; Type: TRIGGER; Schema: public; Owner: merico
--

CREATE TRIGGER on_update_weekly_report_developer BEFORE UPDATE ON public.weekly_report_developer FOR EACH ROW EXECUTE FUNCTION public.trigger_set_update_time();


--
-- Name: Badges Badges_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Badges"
    ADD CONSTRAINT "Badges_project_fkey" FOREIGN KEY (project) REFERENCES public."Projects"(id);


--
-- Name: Badges Badges_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Badges"
    ADD CONSTRAINT "Badges_type_fkey" FOREIGN KEY (type) REFERENCES public."BadgeTypes"(code);


--
-- Name: Badges Badges_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."Badges"
    ADD CONSTRAINT "Badges_user_fkey" FOREIGN KEY ("user") REFERENCES public."Users"(id);


--
-- Name: BaselineRepoMeta BaselineRepoMeta_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."BaselineRepoMeta"
    ADD CONSTRAINT "BaselineRepoMeta_user_fkey" FOREIGN KEY ("user") REFERENCES public."Users"(id);


--
-- Name: LoginAttempts LoginAttempts_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paulgoertzen
--

ALTER TABLE ONLY public."LoginAttempts"
    ADD CONSTRAINT "LoginAttempts_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."Users"(id);


--
-- Name: UserEmails UserEmails_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserEmails"
    ADD CONSTRAINT "UserEmails_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."Users"(id);


--
-- Name: UserNotifications UserNotifications_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserNotifications"
    ADD CONSTRAINT "UserNotifications_user_fkey" FOREIGN KEY ("user") REFERENCES public."Users"(id);


--
-- Name: UserProjects UserProjects_ProjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserProjects"
    ADD CONSTRAINT "UserProjects_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"(id);


--
-- Name: UserProjects UserProjects_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public."UserProjects"
    ADD CONSTRAINT "UserProjects_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."Users"(id);


--
-- Name: batches batches_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ca_task ca_task_analysis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.ca_task
    ADD CONSTRAINT ca_task_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.ca_analysis(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: config config_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id);


--
-- Name: department department_group_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_group_parent_id_fkey FOREIGN KEY ("parentId") REFERENCES public.department(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: department department_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_notification email_notification_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.email_notification
    ADD CONSTRAINT email_notification_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id);


--
-- Name: email_notification email_notification_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.email_notification
    ADD CONSTRAINT email_notification_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_notification_template(id);


--
-- Name: emails emails_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gitlab_importing_task gitlab_importing_task_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.gitlab_importing_task
    ADD CONSTRAINT gitlab_importing_task_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invite_user invite_user_inviter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.invite_user
    ADD CONSTRAINT invite_user_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invite_user invite_user_project_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.invite_user
    ADD CONSTRAINT invite_user_project_group_id_fkey FOREIGN KEY (project_group_id) REFERENCES public.project_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invite_user invite_user_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.invite_user
    ADD CONSTRAINT invite_user_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jira_attachment jira_attachment_author_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_attachment
    ADD CONSTRAINT jira_attachment_author_uuid_fkey FOREIGN KEY (author_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_attachment jira_attachment_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_attachment
    ADD CONSTRAINT jira_attachment_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_attachment jira_attachment_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_attachment
    ADD CONSTRAINT jira_attachment_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_comment jira_comment_author_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_comment
    ADD CONSTRAINT jira_comment_author_uuid_fkey FOREIGN KEY (author_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_comment jira_comment_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_comment
    ADD CONSTRAINT jira_comment_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_comment jira_comment_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_comment
    ADD CONSTRAINT jira_comment_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_comment jira_comment_update_author_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_comment
    ADD CONSTRAINT jira_comment_update_author_uuid_fkey FOREIGN KEY (update_author_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_field jira_field_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_field
    ADD CONSTRAINT jira_field_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_fix_version jira_fix_version_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_fix_version
    ADD CONSTRAINT jira_fix_version_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_fix_version jira_fix_version_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_fix_version
    ADD CONSTRAINT jira_fix_version_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_issue_changelog jira_issue_changelog_author_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue_changelog
    ADD CONSTRAINT jira_issue_changelog_author_uuid_fkey FOREIGN KEY (author_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_issue_changelog jira_issue_changelog_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue_changelog
    ADD CONSTRAINT jira_issue_changelog_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_issue jira_issue_fields_assignee_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue
    ADD CONSTRAINT jira_issue_fields_assignee_uuid_fkey FOREIGN KEY (fields_assignee_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_issue jira_issue_fields_creator_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue
    ADD CONSTRAINT jira_issue_fields_creator_uuid_fkey FOREIGN KEY (fields_creator_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_issue jira_issue_fields_reporter_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue
    ADD CONSTRAINT jira_issue_fields_reporter_uuid_fkey FOREIGN KEY (fields_reporter_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_issue jira_issue_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issue
    ADD CONSTRAINT jira_issue_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_issuelink jira_issuelink_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issuelink
    ADD CONSTRAINT jira_issuelink_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_issuelink jira_issuelink_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_issuelink
    ADD CONSTRAINT jira_issuelink_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_platform_sync_log jira_platform_sync_log_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_platform_sync_log
    ADD CONSTRAINT jira_platform_sync_log_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_platform_sync_log jira_platform_sync_log_start_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_platform_sync_log
    ADD CONSTRAINT jira_platform_sync_log_start_team_user_id_fkey FOREIGN KEY (start_team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jira_platform jira_platform_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_platform
    ADD CONSTRAINT jira_platform_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jira_platform jira_platform_update_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_platform
    ADD CONSTRAINT jira_platform_update_team_user_id_fkey FOREIGN KEY (update_team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jira_rapidview jira_rapidview_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_rapidview
    ADD CONSTRAINT jira_rapidview_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_rapidview_sprint jira_rapidview_sprint_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_rapidview_sprint
    ADD CONSTRAINT jira_rapidview_sprint_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_subtask jira_subtask_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_subtask
    ADD CONSTRAINT jira_subtask_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_subtask jira_subtask_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_subtask
    ADD CONSTRAINT jira_subtask_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_subtask jira_subtask_sub_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_subtask
    ADD CONSTRAINT jira_subtask_sub_issue_uuid_fkey FOREIGN KEY (sub_issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_user jira_user_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_user
    ADD CONSTRAINT jira_user_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_worklog jira_worklog_author_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_worklog
    ADD CONSTRAINT jira_worklog_author_uuid_fkey FOREIGN KEY (author_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: jira_worklog jira_worklog_issue_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_worklog
    ADD CONSTRAINT jira_worklog_issue_uuid_fkey FOREIGN KEY (issue_uuid) REFERENCES public.jira_issue(uuid);


--
-- Name: jira_worklog jira_worklog_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_worklog
    ADD CONSTRAINT jira_worklog_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.jira_platform(id);


--
-- Name: jira_worklog jira_worklog_update_author_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.jira_worklog
    ADD CONSTRAINT jira_worklog_update_author_uuid_fkey FOREIGN KEY (update_author_uuid) REFERENCES public.jira_user(uuid);


--
-- Name: license license_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT license_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id);


--
-- Name: license license_team_local_machine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT license_team_local_machine_id_fkey FOREIGN KEY (team_local_machine_id) REFERENCES public.team_local_machine(id);


--
-- Name: links links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: metric_column_group metric_column_group_scene_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.metric_column_group
    ADD CONSTRAINT metric_column_group_scene_id_fkey FOREIGN KEY (scene_id) REFERENCES public.metric_scene(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: metric_scene metric_scene_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.metric_scene
    ADD CONSTRAINT metric_scene_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: metric_scene metric_scene_update_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.metric_scene
    ADD CONSTRAINT metric_scene_update_team_user_id_fkey FOREIGN KEY (update_team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_type_fkey FOREIGN KEY (type) REFERENCES public.notification_type_setting(type) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_user_stat notification_user_stat_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.notification_user_stat
    ADD CONSTRAINT notification_user_stat_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_user_stat notification_user_stat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.notification_user_stat
    ADD CONSTRAINT notification_user_stat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: oauth oauth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.oauth
    ADD CONSTRAINT oauth_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_analytics_settings project_analytics_settings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_analytics_settings
    ADD CONSTRAINT project_analytics_settings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_auth project_auth_create_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_auth
    ADD CONSTRAINT project_auth_create_user_id_fkey FOREIGN KEY (create_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_auth project_auth_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_auth
    ADD CONSTRAINT project_auth_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_commit_remark project_commit_remark_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_commit_remark
    ADD CONSTRAINT project_commit_remark_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_contrib project_contrib_format_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_contrib
    ADD CONSTRAINT project_contrib_format_email_fkey FOREIGN KEY (format_email) REFERENCES public.emails(email);


--
-- Name: project_contrib project_contrib_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_contrib
    ADD CONSTRAINT project_contrib_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_group project_group_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group
    ADD CONSTRAINT project_group_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.project_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_group_project project_group_project_project_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_project
    ADD CONSTRAINT project_group_project_project_group_id_fkey FOREIGN KEY (project_group_id) REFERENCES public.project_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_group_project project_group_project_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_project
    ADD CONSTRAINT project_group_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_group project_group_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group
    ADD CONSTRAINT project_group_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_group_team_user project_group_team_user_project_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_team_user
    ADD CONSTRAINT project_group_team_user_project_group_id_fkey FOREIGN KEY (project_group_id) REFERENCES public.project_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_group_team_user project_group_team_user_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_group_team_user
    ADD CONSTRAINT project_group_team_user_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id);


--
-- Name: project_pre_process_result project_pre_process_result_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_pre_process_result
    ADD CONSTRAINT project_pre_process_result_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_report_state project_report_state_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_report_state
    ADD CONSTRAINT project_report_state_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_report_state project_report_state_start_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_report_state
    ADD CONSTRAINT project_report_state_start_team_user_id_fkey FOREIGN KEY (start_team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_team_user project_team_user_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_team_user
    ADD CONSTRAINT project_team_user_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_team_user project_team_user_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.project_team_user
    ADD CONSTRAINT project_team_user_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id);


--
-- Name: pull_requests pull_requests_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.pull_requests
    ADD CONSTRAINT pull_requests_author_fkey FOREIGN KEY (author) REFERENCES public.contributors(id);


--
-- Name: pull_requests pull_requests_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.pull_requests
    ADD CONSTRAINT pull_requests_project_fkey FOREIGN KEY (project) REFERENCES public."Projects"("eeProjectId");


--
-- Name: pull_requests pull_requests_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.pull_requests
    ADD CONSTRAINT pull_requests_user_fkey FOREIGN KEY ("user") REFERENCES public."Users"(id);


--
-- Name: report_code_check_breaking_record report_code_check_breaking_record_rule_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_code_check_breaking_record
    ADD CONSTRAINT report_code_check_breaking_record_rule_key_fkey FOREIGN KEY (rule_key) REFERENCES public.report_config_code_check(key) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_config_code_check_ignore report_config_code_check_ignore_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_code_check_ignore
    ADD CONSTRAINT report_config_code_check_ignore_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_config_dev_value_formula_params report_config_dev_value_formula_params_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_dev_value_formula_params
    ADD CONSTRAINT report_config_dev_value_formula_params_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: report_config_feature_flags report_config_feature_flags_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_feature_flags
    ADD CONSTRAINT report_config_feature_flags_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: report_config_tag_evidence_system_tag report_config_tag_evidence_system_tag_evidence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence_system_tag
    ADD CONSTRAINT report_config_tag_evidence_system_tag_evidence_id_fkey FOREIGN KEY (evidence_id) REFERENCES public.report_config_tag_evidence(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_config_tag_evidence_system_tag report_config_tag_evidence_system_tag_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence_system_tag
    ADD CONSTRAINT report_config_tag_evidence_system_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.report_config_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_config_tag_evidence_user_tag report_config_tag_evidence_user_tag_evidence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence_user_tag
    ADD CONSTRAINT report_config_tag_evidence_user_tag_evidence_id_fkey FOREIGN KEY (evidence_id) REFERENCES public.report_config_tag_evidence(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_config_tag_evidence_user_tag report_config_tag_evidence_user_tag_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag_evidence_user_tag
    ADD CONSTRAINT report_config_tag_evidence_user_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.report_config_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_config_tag report_config_tag_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_config_tag
    ADD CONSTRAINT report_config_tag_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.report_config_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_test_coverage_test_function report_test_coverage_test_fun_report_test_coverage_functio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_test_coverage_test_function
    ADD CONSTRAINT report_test_coverage_test_fun_report_test_coverage_functio_fkey FOREIGN KEY (report_test_coverage_function_id) REFERENCES public.report_test_coverage_function(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_test_coverage_test_function report_test_coverage_test_function_report_function_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.report_test_coverage_test_function
    ADD CONSTRAINT report_test_coverage_test_function_report_function_id_fkey FOREIGN KEY (report_function_id) REFERENCES public.report_function(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sso_user sso_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.sso_user
    ADD CONSTRAINT sso_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_local_machine team_local_machine_create_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_local_machine
    ADD CONSTRAINT team_local_machine_create_user_id_fkey FOREIGN KEY (create_user_id) REFERENCES public.users(id);


--
-- Name: team_local_machine team_local_machine_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_local_machine
    ADD CONSTRAINT team_local_machine_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id);


--
-- Name: team_project_key team_project_key_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_project_key
    ADD CONSTRAINT team_project_key_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_subscription team_subscription_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_subscription
    ADD CONSTRAINT team_subscription_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_subscription team_subscription_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_subscription
    ADD CONSTRAINT team_subscription_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_token team_token_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_token
    ADD CONSTRAINT team_token_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user team_user_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id);


--
-- Name: team_user_department_role team_user_department_role_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_department_role
    ADD CONSTRAINT team_user_department_role_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user_department_role team_user_department_role_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_department_role
    ADD CONSTRAINT team_user_department_role_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user_project_key team_user_project_key_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_project_key
    ADD CONSTRAINT team_user_project_key_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user team_user_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(id);


--
-- Name: team_user team_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: team_user_watch_project_group team_user_watch_project_group_project_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project_group
    ADD CONSTRAINT team_user_watch_project_group_project_group_id_fkey FOREIGN KEY (project_group_id) REFERENCES public.project_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user_watch_project_group team_user_watch_project_group_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project_group
    ADD CONSTRAINT team_user_watch_project_group_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user_watch_project team_user_watch_project_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project
    ADD CONSTRAINT team_user_watch_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES public."Projects"("eeProjectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user_watch_project team_user_watch_project_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.team_user_watch_project
    ADD CONSTRAINT team_user_watch_project_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: third_party_platform third_party_platform_team_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.third_party_platform
    ADD CONSTRAINT third_party_platform_team_user_id_fk FOREIGN KEY (administrator_id) REFERENCES public.team_user(id);


--
-- Name: third_party_platform third_party_platform_token_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.third_party_platform
    ADD CONSTRAINT third_party_platform_token_owner_id_fkey FOREIGN KEY (token_owner_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_config user_config_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.user_config
    ADD CONSTRAINT user_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_primary_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_primary_email_fkey FOREIGN KEY (primary_email) REFERENCES public.emails(email) ON UPDATE CASCADE;


--
-- Name: weekly_report_developer weekly_report_developer_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: merico
--

ALTER TABLE ONLY public.weekly_report_developer
    ADD CONSTRAINT weekly_report_developer_team_user_id_fkey FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

