SELECT 'CREATE DATABASE session_db_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'session_db_test')\gexec ;

\c session_db_test;

CREATE TABLE public.sessions_table(
    id BIGSERIAL PRIMARY KEY,
    session_id varchar(255) UNIQUE NOT NULL,
    user_id varchar(255) NOT NULL,
    ad_break_dur varchar(255) NOT NULL,
    created varchar(255) NOT NULL,
    cli_req text NOT NULL,
    response text NOT NULL
);