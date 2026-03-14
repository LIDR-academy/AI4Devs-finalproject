-- Flyway migration: Identity bounded context
-- Version: V004__create_identity_schema.sql
-- Schema: identity
-- BDD origin: US1 — Google OAuth login
-- C1: first-access creates a new user profile
-- C2: recurring access reuses the existing profile

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE IF NOT EXISTS identity.users (
    id              UUID        PRIMARY KEY,
    google_id       VARCHAR(255) NOT NULL UNIQUE,
    email           VARCHAR(320) NOT NULL,
    nombre          VARCHAR(255) NOT NULL,
    url_foto        VARCHAR(500),
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_users_google_id ON identity.users (google_id);
CREATE INDEX IF NOT EXISTS idx_identity_users_email    ON identity.users (email);
