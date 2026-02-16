-- Flyway migration: Add duration_seconds to meditation_output
-- Version: V002__add_duration_seconds_to_meditation_output.sql
-- Schema: generation

ALTER TABLE generation.meditation_output 
ADD COLUMN duration_seconds INTEGER;
