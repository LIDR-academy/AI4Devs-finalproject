-- Set search path to users schema
SET search_path TO users, public;

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rater_id VARCHAR(255) NOT NULL,
    rated_id VARCHAR(255) NOT NULL,
    trip_id UUID,
    rating_type VARCHAR(20) NOT NULL CHECK (rating_type IN ('THUMBS_UP', 'THUMBS_DOWN')),
    tags TEXT[],
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_no_self_rating CHECK (rater_id != rated_id),
    CONSTRAINT chk_unique_rating_per_trip UNIQUE (rater_id, rated_id, trip_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ratings_trip_id ON ratings(trip_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating_type ON ratings(rating_type);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);

-- Add comments
COMMENT ON TABLE ratings IS 'User ratings and trust system';
COMMENT ON COLUMN ratings.rater_id IS 'ID of the user giving the rating';
COMMENT ON COLUMN ratings.rated_id IS 'ID of the user being rated';
COMMENT ON COLUMN ratings.trip_id IS 'ID of the trip (optional, for trip-specific ratings)';
COMMENT ON COLUMN ratings.rating_type IS 'Type of rating (THUMBS_UP, THUMBS_DOWN)';
COMMENT ON COLUMN ratings.tags IS 'Array of tags describing the rating (e.g., punctual, friendly, safe)';
COMMENT ON COLUMN ratings.comment IS 'Optional comment for the rating';


