-- Set search path to matches schema
SET search_path TO matches, public;

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    passenger_id VARCHAR(255) NOT NULL,
    driver_id VARCHAR(255) NOT NULL,
    match_score DECIMAL(3,2) NOT NULL CHECK (match_score >= 0.0 AND match_score <= 1.0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matches_trip_id ON matches(trip_id);
CREATE INDEX IF NOT EXISTS idx_matches_passenger_id ON matches(passenger_id);
CREATE INDEX IF NOT EXISTS idx_matches_driver_id ON matches(driver_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(match_score);

-- Add comments
COMMENT ON TABLE matches IS 'Matches between drivers and passengers for trips';
COMMENT ON COLUMN matches.trip_id IS 'ID of the trip being matched';
COMMENT ON COLUMN matches.passenger_id IS 'ID of the passenger';
COMMENT ON COLUMN matches.driver_id IS 'ID of the driver';
COMMENT ON COLUMN matches.match_score IS 'Compatibility score between 0.0 and 1.0';
COMMENT ON COLUMN matches.status IS 'Match status (PENDING, ACCEPTED, REJECTED)';
