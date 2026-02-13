-- Flyway migration for meditation output table
-- Version: V001__create_meditation_output_table.sql
-- Schema: generation
-- Author: System
-- Date: 2024-01-15

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS generation;

-- Create meditation_output table
CREATE TABLE IF NOT EXISTS generation.meditation_output (
    meditation_id UUID PRIMARY KEY,
    composition_id UUID NOT NULL,
    user_id UUID NOT NULL,
    idempotency_key VARCHAR(64) NOT NULL UNIQUE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('AUDIO', 'VIDEO')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED', 'TIMEOUT')),
    narration_script_text TEXT,
    narration_script_duration_seconds DOUBLE PRECISION,
    output_media_url VARCHAR(500),
    subtitle_url VARCHAR(500),
    background_image_url VARCHAR(500),
    background_music_url VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meditation_output_composition_id ON generation.meditation_output(composition_id);
CREATE INDEX IF NOT EXISTS idx_meditation_output_user_id ON generation.meditation_output(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_output_status ON generation.meditation_output(status);
CREATE INDEX IF NOT EXISTS idx_meditation_output_created_at ON generation.meditation_output(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meditation_output_idempotency_key ON generation.meditation_output(idempotency_key);

-- Add comments for documentation
COMMENT ON TABLE generation.meditation_output IS 'Stores meditation generation results including narration, subtitles, and media URLs';
COMMENT ON COLUMN generation.meditation_output.meditation_id IS 'Primary key UUID for meditation output';
COMMENT ON COLUMN generation.meditation_output.composition_id IS 'Foreign key to composition from Composition BC (US2)';
COMMENT ON COLUMN generation.meditation_output.user_id IS 'Foreign key to user who requested generation';
COMMENT ON COLUMN generation.meditation_output.idempotency_key IS 'SHA-256 hash for request deduplication';
COMMENT ON COLUMN generation.meditation_output.media_type IS 'Type of media: AUDIO or VIDEO';
COMMENT ON COLUMN generation.meditation_output.status IS 'Generation status: PROCESSING, COMPLETED, FAILED, TIMEOUT';
COMMENT ON COLUMN generation.meditation_output.narration_script_text IS 'Text content for TTS narration';
COMMENT ON COLUMN generation.meditation_output.narration_script_duration_seconds IS 'Estimated duration of narration in seconds';
COMMENT ON COLUMN generation.meditation_output.output_media_url IS 'S3 URL of final generated audio/video file';
COMMENT ON COLUMN generation.meditation_output.subtitle_url IS 'S3 URL of SRT subtitle file';
COMMENT ON COLUMN generation.meditation_output.background_image_url IS 'S3 URL of background image (video only)';
COMMENT ON COLUMN generation.meditation_output.background_music_url IS 'S3 URL of background music file';
COMMENT ON COLUMN generation.meditation_output.error_message IS 'Error details if status is FAILED or TIMEOUT';
COMMENT ON COLUMN generation.meditation_output.created_at IS 'Timestamp when generation request was created';
COMMENT ON COLUMN generation.meditation_output.completed_at IS 'Timestamp when generation completed (success or failure)';
