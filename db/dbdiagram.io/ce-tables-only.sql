


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



