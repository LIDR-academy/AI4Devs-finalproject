-- Database Infrastructure Verification for US4 (Playback BC)
-- Based on US3 (meditation.generation BC)
-- Date: 2025-01-XX
-- Task: T002
-- Purpose: Document verification of existing database infrastructure from US3

-- ========================================
-- VERIFICATION SUMMARY
-- ========================================
-- ✅ Schema: generation (created by US3 Flyway V001)
-- ✅ Table: meditation_output (created by US3 Flyway V001)
-- ✅ Migration V002: Added duration_seconds column
-- ✅ Indexes: All required indexes exist
-- ✅ Testcontainers: Configured with PostgreSQL 15-alpine

-- ========================================
-- TABLE STRUCTURE (from US3)
-- ========================================
-- Table name: generation.meditation_output
-- Columns required for US4 Playback BC (READ-ONLY):
--   - meditation_id (UUID, PK) → maps to domain Meditation.id
--   - user_id (UUID) → for filtering by user
--   - status (VARCHAR) → maps to ProcessingState enum (PROCESSING, COMPLETED, FAILED, TIMEOUT)
--   - output_media_url (VARCHAR) → audio URL
--   - subtitle_url (VARCHAR) → subtitles URL  
--   - background_image_url (VARCHAR) → image URL (video)
--   - background_music_url (VARCHAR) → music URL (video)
--   - created_at (TIMESTAMP) → for sorting
--   - completed_at (TIMESTAMP) → for filtering completed meditations
--   - media_type (VARCHAR) → AUDIO or VIDEO
--   - narration_script_text (TEXT) → descriptive text/title (can be used as title)
--   - duration_seconds (INTEGER) → meditation duration

-- Additional columns (not used by Playback BC but present):
--   - composition_id (UUID)
--   - idempotency_key (VARCHAR, UNIQUE)
--   - narration_script_duration_seconds (DOUBLE PRECISION)
--   - error_message (TEXT)

-- ========================================
-- EXISTING INDEXES (from US3 V001)
-- ========================================
-- ✅ idx_meditation_output_user_id → Required for US4 list by user
-- ✅ idx_meditation_output_created_at → Required for US4 sorting by date
-- ✅ idx_meditation_output_status → Useful for filtering by state
-- ✅ idx_meditation_output_composition_id → Not used by Playback BC
-- ✅ idx_meditation_output_idempotency_key (UNIQUE) → Not used by Playback BC

-- ========================================
-- STATE MAPPING (domain to database)
-- ========================================
-- Domain ProcessingState (playback BC) → DB status (meditation.generation BC)
--   PENDING → Not applicable (not stored in US3, generation requests start as PROCESSING)
--   PROCESSING → "PROCESSING" (DB value)
--   COMPLETED → "COMPLETED" (DB value)
--   FAILED → "FAILED" (DB value)
--   (TIMEOUT → "TIMEOUT" is also present in DB but not in Playback domain model)

-- ========================================
-- USER-FACING STATE LABELS (from US4 spec.md)
-- ========================================
-- ProcessingState → Spanish label for frontend
--   PROCESSING → "Generando"
--   COMPLETED → "Completada"
--   FAILED → "Fallida"
--   (TIMEOUT can be mapped to "Fallida" as a failed state)

-- ========================================
-- TESTCONTAINERS CONFIGURATION
-- ========================================
-- Source: backend/src/test/java/com/hexagonal/meditation/generation/bdd/CucumberSpringConfiguration.java
-- Container: PostgreSQL 15-alpine
-- Database: meditation_builder_test
-- Flyway: Enabled (migrations auto-run on test startup)
-- Schema: generation (auto-created by V001)

-- ========================================
-- NO ADDITIONAL MIGRATIONS NEEDED
-- ========================================
-- Playback BC operates in READ-ONLY mode on generation.meditation_output table
-- No schema changes, no new tables, no new indexes required
-- All infrastructure provided by US3 is sufficient for US4

-- ========================================
-- ACCEPTANCE CRITERIA VERIFICATION
-- ========================================
-- [X] Schema 'generation' exists → YES (created by US3 Flyway V001)
-- [X] Table 'meditation_output' has all required columns → YES (verified above)
-- [X] Indexes created → YES (idx_meditation_output_user_id, idx_meditation_output_created_at exist)
-- [X] Testcontainers PostgreSQL configuration ready → YES (see CucumberSpringConfiguration.java)

-- ========================================
-- NEXT STEPS
-- ========================================
-- T003: Define BDD scenarios for US4 in features/playback/
-- T004: Create OpenAPI specification for Playback BC endpoints
-- T005: Implement domain model (Meditation, ProcessingState, MediaUrls)
