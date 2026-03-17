-- Set search path to trips schema
SET search_path TO trips, public;

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination_sede_id VARCHAR(255) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    seats_total INTEGER NOT NULL CHECK (seats_total > 0),
    seats_free INTEGER NOT NULL CHECK (seats_free >= 0 AND seats_free <= seats_total),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trips_destination_sede_id ON trips(destination_sede_id);
CREATE INDEX IF NOT EXISTS idx_trips_date_time ON trips(date_time);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_seats_free ON trips(seats_free);

-- Add comments
COMMENT ON TABLE trips IS 'Trips offered by drivers';
COMMENT ON COLUMN trips.driver_id IS 'ID of the user who is driving';
COMMENT ON COLUMN trips.origin IS 'Starting location of the trip';
COMMENT ON COLUMN trips.destination_sede_id IS 'ID of the destination office/sede';
COMMENT ON COLUMN trips.date_time IS 'When the trip starts';
COMMENT ON COLUMN trips.seats_total IS 'Total number of available seats';
COMMENT ON COLUMN trips.seats_free IS 'Number of free seats remaining';
