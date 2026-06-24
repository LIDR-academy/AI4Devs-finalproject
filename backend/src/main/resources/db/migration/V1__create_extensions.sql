-- V1__create_extensions.sql
-- Enables PostgreSQL extensions required by the StayHub schema:
--   * uuid-ossp — provides uuid_generate_v4() for UUID primary keys
--   * postgis   — provides geography/geometry types and spatial indexes
--                 used by the Property table (location column + GiST index)
--
-- See: specs/001-guest-search-booking/data-model.md (Migration Strategy)
-- Idempotent: uses IF NOT EXISTS so re-running is safe.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
